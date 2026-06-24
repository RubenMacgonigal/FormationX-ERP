const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PORT = 3000;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const BASE = __dirname;
const DATA_DIR = path.join(BASE, 'data');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');
const COLLECTIONS = ['customers', 'suppliers', 'inventory', 'orders', 'invoices', 'jobs', 'settings'];
const SESSION_TTL = 8 * 60 * 60 * 1000;

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

// ---- Password Hashing ----
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    return salt + ':' + hash;
}

function verifyPassword(password, stored) {
    const [salt, hash] = stored.split(':');
    const attempt = crypto.createHash('sha256').update(salt + password).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(attempt, 'hex'));
}

// ---- Users Store ----
const USERS_PATH = path.join(DATA_DIR, 'users.json');
function loadUsers() {
    if (!fs.existsSync(USERS_PATH)) return [];
    try { return JSON.parse(fs.readFileSync(USERS_PATH, 'utf8')); }
    catch { return []; }
}
function saveUsers(users) { atomicWrite(USERS_PATH, JSON.stringify(users, null, 2)); }

function seedDefaultUser() {
    let users = loadUsers();
    if (users.length === 0) {
        users.push({
            id: 1,
            email: 'admin@formationx.com',
            name: 'Admin User',
            role: 'Administrator',
            passwordHash: hashPassword('admin123')
        });
        saveUsers(users);
        console.log('Default admin user created (admin@formationx.com / admin123)');
    }
}

// ---- Session Management ----
const sessions = new Map();

function createSession(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { userId, expires: Date.now() + SESSION_TTL });
    return token;
}

function validateSession(token) {
    const session = sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expires) { sessions.delete(token); return null; }
    return session;
}

function getTokenFromRequest(req) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

// ---- Atomic Write ----
function atomicWrite(filePath, content) {
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, content, 'utf8');
    fs.renameSync(tmp, filePath);
}

// ---- Data Helpers ----
function getDataPath(collection) { return path.join(DATA_DIR, collection + '.json'); }

function readCollection(collection) {
    const fp = getDataPath(collection);
    if (!fs.existsSync(fp)) return collection === 'settings' ? {} : [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch { return collection === 'settings' ? {} : []; }
}

function writeCollection(collection, data) {
    atomicWrite(getDataPath(collection), JSON.stringify(data, null, 2));
}

// ---- Input Validation ----
function validateCollectionData(collection, data) {
    if (collection === 'settings') {
        if (typeof data !== 'object' || Array.isArray(data)) return 'Settings must be a JSON object';
        return null;
    }
    if (!Array.isArray(data)) return `${collection} data must be a JSON array`;
    for (let i = 0; i < data.length; i++) {
        if (typeof data[i] !== 'object' || data[i] === null) return `Record at index ${i} must be an object`;
        if (data[i].id === undefined) return `Record at index ${i} missing required 'id' field`;
    }
    return null;
}

function validateRestoreData(data) {
    if (typeof data !== 'object' || Array.isArray(data)) return 'Restore payload must be a JSON object';
    const allowedKeys = [...COLLECTIONS, '_exportedAt'];
    const keys = Object.keys(data);
    for (const key of keys) {
        if (!allowedKeys.includes(key)) return `Unexpected key in restore data: '${key}'`;
    }
    for (const col of COLLECTIONS) {
        if (data[col]) {
            const err = validateCollectionData(col, data[col]);
            if (err) return `${col}: ${err}`;
        }
    }
    return null;
}

// ---- Request Helpers ----
function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        const timeout = setTimeout(() => reject(new Error('Request timeout')), 30000);
        req.on('data', chunk => { body += chunk; if (body.length > 5e6) { clearTimeout(timeout); reject(new Error('Too large')); } });
        req.on('end', () => { clearTimeout(timeout); try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
    });
}

function sendJSON(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function sendError(res, message, status = 400) {
    sendJSON(res, { error: message }, status);
}

// ---- Path Security ----
function isSafePath(requestedPath) {
    const resolved = path.resolve(BASE, '.' + requestedPath);
    return resolved.startsWith(BASE + path.sep) || resolved === BASE;
}

// ---- Server ----
seedDefaultUser();

http.createServer(async (req, res) => {
    const urlPath = req.url.split('?')[0];

    // CORS — only allow same origin
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        });
        res.end(); return;
    }

    const addCors = (headers = {}) => {
        headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
        return headers;
    };

    // ---- LOGIN (public) ----
    if (urlPath === '/api/login' && req.method === 'POST') {
        try {
            const { email, password } = await readBody(req);
            if (!email || !password) { sendError(res, 'Email and password are required', 400); return; }
            const users = loadUsers();
            const user = users.find(u => u.email === email);
            if (!user || !verifyPassword(password, user.passwordHash)) {
                sendError(res, 'Invalid email or password', 401);
                return;
            }
            const token = createSession(user.id);
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }));
        } catch (e) { sendError(res, e.message, 400); }
        return;
    }

    // ---- AUTH CHECK for all other /api/* routes ----
    if (urlPath.startsWith('/api/')) {
        const token = getTokenFromRequest(req);
        const session = token ? validateSession(token) : null;
        if (!session) {
            res.writeHead(401, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ error: 'Authentication required. Please log in.' }));
            return;
        }

        // ---- LOGOUT ----
        if (urlPath === '/api/logout' && req.method === 'POST') {
            sessions.delete(token);
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        // ---- USERS MANAGEMENT ----
        if (urlPath === '/api/users' && req.method === 'GET') {
            const users = loadUsers().map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role }));
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify(users));
            return;
        }

        if (urlPath === '/api/users' && req.method === 'POST') {
            try {
                const { email, name, role, password } = await readBody(req);
                if (!email || !name || !password) { sendError(res, 'Email, name, and password are required', 400); return; }
                const users = loadUsers();
                if (users.find(u => u.email === email)) { sendError(res, 'A user with this email already exists', 409); return; }
                const newUser = {
                    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
                    email, name, role: role || 'Staff',
                    passwordHash: hashPassword(password)
                };
                users.push(newUser);
                saveUsers(users);
                res.writeHead(201, addCors({ 'Content-Type': 'application/json' }));
                res.end(JSON.stringify({ ok: true, user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } }));
            } catch (e) { sendError(res, e.message, 400); }
            return;
        }

        const userDeleteMatch = urlPath.match(/^\/api\/users\/(\d+)$/);
        if (userDeleteMatch && req.method === 'DELETE') {
            const userId = parseInt(userDeleteMatch[1]);
            let users = loadUsers();
            if (users.length <= 1) { sendError(res, 'Cannot delete the last user', 400); return; }
            const idx = users.findIndex(u => u.id === userId);
            if (idx === -1) { sendError(res, 'User not found', 404); return; }
            users.splice(idx, 1);
            saveUsers(users);
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ ok: true }));
            return;
        }

        const userRoleMatch = urlPath.match(/^\/api\/users\/(\d+)\/role$/);
        if (userRoleMatch && req.method === 'POST') {
            try {
                const userId = parseInt(userRoleMatch[1]);
                const { role } = await readBody(req);
                const validRoles = ['Administrator', 'Manager', 'Staff', 'View Only'];
                if (!role || !validRoles.includes(role)) { sendError(res, 'Invalid role. Must be one of: ' + validRoles.join(', '), 400); return; }
                const users = loadUsers();
                const idx = users.findIndex(u => u.id === userId);
                if (idx === -1) { sendError(res, 'User not found', 404); return; }
                users[idx].role = role;
                saveUsers(users);
                res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
                res.end(JSON.stringify({ ok: true, user: { id: users[idx].id, email: users[idx].email, name: users[idx].name, role: users[idx].role } }));
            } catch (e) { sendError(res, e.message, 400); }
            return;
        }

        if (urlPath === '/api/users/change-password' && req.method === 'POST') {
            try {
                const { userId, newPassword } = await readBody(req);
                if (!userId || !newPassword) { sendError(res, 'userId and newPassword are required', 400); return; }
                const users = loadUsers();
                const idx = users.findIndex(u => u.id === userId);
                if (idx === -1) { sendError(res, 'User not found', 404); return; }
                users[idx].passwordHash = hashPassword(newPassword);
                saveUsers(users);
                res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
                res.end(JSON.stringify({ ok: true }));
            } catch (e) { sendError(res, e.message, 400); }
            return;
        }

        // ---- BACKUP: /api/backup ----
        if (urlPath === '/api/backup' && req.method === 'GET') {
            const backup = {};
            COLLECTIONS.forEach(c => { backup[c] = readCollection(c); });
            backup._exportedAt = new Date().toISOString();
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify(backup));
            return;
        }

        // ---- SERVER-SIDE BACKUP FILE ----
        if (urlPath === '/api/backup/file' && req.method === 'POST') {
            const backup = {};
            COLLECTIONS.forEach(c => { backup[c] = readCollection(c); });
            backup._exportedAt = new Date().toISOString();
            const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const backupPath = path.join(BACKUP_DIR, filename);
            atomicWrite(backupPath, JSON.stringify(backup, null, 2));
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify({ ok: true, filename, path: backupPath }));
            return;
        }

        // ---- LIST BACKUPS ----
        if (urlPath === '/api/backups' && req.method === 'GET') {
            let files = [];
            if (fs.existsSync(BACKUP_DIR)) {
                files = fs.readdirSync(BACKUP_DIR)
                    .filter(f => f.endsWith('.json'))
                    .map(f => {
                        const stat = fs.statSync(path.join(BACKUP_DIR, f));
                        return { filename: f, size: stat.size, created: stat.mtime.toISOString() };
                    })
                    .sort((a, b) => b.created.localeCompare(a.created));
            }
            res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
            res.end(JSON.stringify(files));
            return;
        }

        // ---- RESTORE: /api/restore ----
        if (urlPath === '/api/restore' && req.method === 'POST') {
            try {
                const data = await readBody(req);
                const validationErr = validateRestoreData(data);
                if (validationErr) { sendError(res, validationErr, 400); return; }
                COLLECTIONS.forEach(c => { if (data[c]) writeCollection(c, data[c]); });
                res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
                res.end(JSON.stringify({ ok: true, restored: COLLECTIONS.filter(c => data[c]) }));
            } catch (e) { sendError(res, e.message, 400); }
            return;
        }

        // ---- DATA API: /api/{collection} ----
        const apiMatch = urlPath.match(/^\/api\/(\w+)$/);
        if (apiMatch) {
            const col = apiMatch[1];
            if (!COLLECTIONS.includes(col)) { sendError(res, `Unknown collection: '${col}'`, 404); return; }

            if (req.method === 'GET') {
                res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
                res.end(JSON.stringify(readCollection(col)));
                return;
            }

            if (req.method === 'POST') {
                try {
                    const data = await readBody(req);
                    const validationErr = validateCollectionData(col, data);
                    if (validationErr) { sendError(res, validationErr, 400); return; }
                    writeCollection(col, data);
                    res.writeHead(200, addCors({ 'Content-Type': 'application/json' }));
                    res.end(JSON.stringify({ ok: true, collection: col, records: Array.isArray(data) ? data.length : 1 }));
                } catch (e) { sendError(res, e.message, 400); }
                return;
            }

            sendError(res, 'Method not allowed', 405);
            return;
        }

        sendError(res, 'API endpoint not found', 404);
        return;
    }

    // ---- STATIC FILES (with path traversal protection) ----
    const requestPath = urlPath === '/' ? '/index.html' : urlPath;
    if (!isSafePath(requestPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    const filePath = path.resolve(BASE, '.' + requestPath);
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`FormationX ERP Server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    console.log(`Backup directory: ${BACKUP_DIR}`);
    console.log(`API endpoints (all require auth except /api/login):`);
    console.log(`  POST /api/login | POST /api/logout`);
    COLLECTIONS.forEach(c => console.log(`  GET/POST /api/${c}`));
    console.log(`  GET /api/backup | POST /api/restore`);
    console.log(`  POST /api/backup/file | GET /api/backups`);
});
