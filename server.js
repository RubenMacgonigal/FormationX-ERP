const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 3000;
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const BASE = __dirname;
const DATA_DIR = path.join(BASE, 'data');
const COLLECTIONS = ['customers', 'suppliers', 'inventory', 'orders', 'invoices', 'settings'];

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function getDataPath(collection) { return path.join(DATA_DIR, collection + '.json'); }

function readCollection(collection) {
    const fp = getDataPath(collection);
    if (!fs.existsSync(fp)) return collection === 'settings' ? {} : [];
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch { return collection === 'settings' ? {} : []; }
}

function writeCollection(collection, data) {
    fs.writeFileSync(getDataPath(collection), JSON.stringify(data, null, 2), 'utf8');
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; if (body.length > 5e6) reject(new Error('Too large')); });
        req.on('end', () => { try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); } });
    });
}

function sendJSON(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
}

http.createServer(async (req, res) => {
    const urlPath = req.url.split('?')[0];

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
        res.end(); return;
    }

    // ---- BACKUP: /api/backup ----
    if (urlPath === '/api/backup' && req.method === 'GET') {
        const backup = {};
        COLLECTIONS.forEach(c => { backup[c] = readCollection(c); });
        backup._exportedAt = new Date().toISOString();
        sendJSON(res, backup);
        return;
    }

    // ---- RESTORE: /api/restore ----
    if (urlPath === '/api/restore' && req.method === 'POST') {
        try {
            const data = await readBody(req);
            COLLECTIONS.forEach(c => { if (data[c]) writeCollection(c, data[c]); });
            sendJSON(res, { ok: true, restored: COLLECTIONS.filter(c => data[c]) });
        } catch (e) { sendJSON(res, { error: e.message }, 400); }
        return;
    }

    // ---- DATA API: /api/{collection} ----
    const apiMatch = urlPath.match(/^\/api\/(\w+)$/);
    if (apiMatch) {
        const col = apiMatch[1];
        if (!COLLECTIONS.includes(col)) { sendJSON(res, { error: 'Unknown collection' }, 404); return; }

        // GET — read entire collection
        if (req.method === 'GET') {
            sendJSON(res, readCollection(col));
            return;
        }

        // POST — write entire collection (replace)
        if (req.method === 'POST') {
            try {
                const data = await readBody(req);
                writeCollection(col, data);
                sendJSON(res, { ok: true, collection: col, records: Array.isArray(data) ? data.length : 1 });
            } catch (e) { sendJSON(res, { error: e.message }, 400); }
            return;
        }

        sendJSON(res, { error: 'Method not allowed' }, 405);
        return;
    }

    // ---- STATIC FILES ----
    let filePath = path.join(BASE, urlPath === '/' ? 'index.html' : urlPath);
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}).listen(PORT, () => {
    console.log(`FormationX ERP Server running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
    console.log(`API endpoints:`);
    COLLECTIONS.forEach(c => console.log(`  GET/POST /api/${c}`));
    console.log(`  GET /api/backup | POST /api/restore`);
});
