/* ============================================
   FormationX ERP — Application Logic
   ============================================ */

// ---- XSS Prevention ----
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ---- Australian Suburb Autocomplete ----
const AU_SUBURBS = [
    // NSW
    ['Sydney','NSW','2000'],['Parramatta','NSW','2150'],['Homebush','NSW','2140'],['Penrith','NSW','2750'],['Liverpool','NSW','2170'],
    ['Blacktown','NSW','2148'],['Chatswood','NSW','2067'],['Bondi','NSW','2026'],['Manly','NSW','2095'],['Newtown','NSW','2042'],
    ['Surry Hills','NSW','2010'],['Paddington','NSW','2021'],['Balmain','NSW','2041'],['Wollongong','NSW','2500'],['Newcastle','NSW','2300'],
    ['Coffs Harbour','NSW','2450'],['Tamworth','NSW','2340'],['Orange','NSW','2800'],['Dubbo','NSW','2830'],['Wagga Wagga','NSW','2650'],
    ['Bankstown','NSW','2200'],['Hurstville','NSW','2220'],['Campbelltown','NSW','2560'],['Cronulla','NSW','2230'],['Dee Why','NSW','2099'],
    ['Hornsby','NSW','2077'],['Epping','NSW','2121'],['Ryde','NSW','2112'],['Strathfield','NSW','2135'],['Burwood','NSW','2134'],
    ['Auburn','NSW','2144'],['Silverwater','NSW','2128'],['Wetherill Park','NSW','2164'],['Villawood','NSW','2163'],['Botany','NSW','2019'],
    ['Mascot','NSW','2020'],['Kensington','NSW','2033'],['Randwick','NSW','2031'],['Maroubra','NSW','2035'],['Gladesville','NSW','2111'],
    ['Macquarie Park','NSW','2113'],['North Sydney','NSW','2060'],['Mosman','NSW','2088'],['Neutral Bay','NSW','2089'],
    ['Darlinghurst','NSW','2010'],['Redfern','NSW','2016'],['Zetland','NSW','2017'],['Alexandria','NSW','2015'],
    ['Marrickville','NSW','2204'],['Leichhardt','NSW','2040'],['Ashfield','NSW','2131'],['Concord','NSW','2137'],
    ['Rhodes','NSW','2138'],['Olympic Park','NSW','2127'],['Castle Hill','NSW','2154'],['Bella Vista','NSW','2153'],
    ['Kellyville','NSW','2155'],['Norwest','NSW','2153'],['Baulkham Hills','NSW','2153'],['Windsor','NSW','2756'],
    ['Richmond','NSW','2753'],['Katoomba','NSW','2780'],['Lithgow','NSW','2790'],['Bathurst','NSW','2795'],
    // VIC
    ['Melbourne','VIC','3000'],['Richmond','VIC','3121'],['South Yarra','VIC','3141'],['St Kilda','VIC','3182'],['Fitzroy','VIC','3065'],
    ['Carlton','VIC','3053'],['Brunswick','VIC','3056'],['Footscray','VIC','3011'],['Clayton','VIC','3168'],['Dandenong','VIC','3175'],
    ['Geelong','VIC','3220'],['Ballarat','VIC','3350'],['Bendigo','VIC','3550'],['Shepparton','VIC','3630'],['Mildura','VIC','3500'],
    ['Frankston','VIC','3199'],['Moorabbin','VIC','3189'],['Box Hill','VIC','3128'],['Doncaster','VIC','3108'],['Ringwood','VIC','3134'],
    ['Hawthorn','VIC','3122'],['Camberwell','VIC','3124'],['Malvern','VIC','3144'],['Toorak','VIC','3142'],['Prahran','VIC','3181'],
    ['Chapel St','VIC','3181'],['Collingwood','VIC','3066'],['Abbotsford','VIC','3067'],['Altona North','VIC','3025'],
    ['Somerton','VIC','3062'],['Laverton North','VIC','3026'],['Williamstown','VIC','3016'],['Werribee','VIC','3030'],
    ['Cranbourne','VIC','3977'],['Pakenham','VIC','3810'],['Berwick','VIC','3806'],['Narre Warren','VIC','3805'],
    // QLD
    ['Brisbane','QLD','4000'],['Gold Coast','QLD','4217'],['Surfers Paradise','QLD','4217'],['Cairns','QLD','4870'],['Townsville','QLD','4810'],
    ['Toowoomba','QLD','4350'],['Rockhampton','QLD','4700'],['Mackay','QLD','4740'],['Bundaberg','QLD','4670'],['Hervey Bay','QLD','4655'],
    ['Coolangatta','QLD','4225'],['Southport','QLD','4215'],['Robina','QLD','4226'],['Ipswich','QLD','4305'],['Logan','QLD','4114'],
    ['Redcliffe','QLD','4020'],['Caboolture','QLD','4510'],['Noosa','QLD','4567'],['Maroochydore','QLD','4558'],
    ['Fortitude Valley','QLD','4006'],['South Brisbane','QLD','4101'],['West End','QLD','4101'],['Woolloongabba','QLD','4102'],
    // SA
    ['Adelaide','SA','5000'],['Glenelg','SA','5045'],['Norwood','SA','5067'],['Unley','SA','5061'],['Prospect','SA','5082'],
    ['Port Adelaide','SA','5015'],['Marion','SA','5043'],['Modbury','SA','5092'],['Elizabeth','SA','5112'],['Salisbury','SA','5108'],
    ['Mount Gambier','SA','5290'],['Murray Bridge','SA','5253'],['Whyalla','SA','5600'],['Port Augusta','SA','5700'],['Victor Harbor','SA','5211'],
    // WA
    ['Perth','WA','6000'],['Fremantle','WA','6160'],['Joondalup','WA','6027'],['Rockingham','WA','6168'],['Mandurah','WA','6210'],
    ['Bunbury','WA','6230'],['Geraldton','WA','6530'],['Kalgoorlie','WA','6430'],['Subiaco','WA','6008'],['Claremont','WA','6010'],
    ['Scarborough','WA','6019'],['Morley','WA','6062'],['Cannington','WA','6107'],['Armadale','WA','6112'],['Midland','WA','6056'],
    // TAS
    ['Hobart','TAS','7000'],['Launceston','TAS','7250'],['Devonport','TAS','7310'],['Burnie','TAS','7320'],['Sandy Bay','TAS','7005'],
    ['Glenorchy','TAS','7010'],['Kingston','TAS','7050'],['New Town','TAS','7008'],
    // ACT
    ['Canberra','ACT','2600'],['Belconnen','ACT','2617'],['Woden','ACT','2606'],['Tuggeranong','ACT','2900'],['Gungahlin','ACT','2912'],
    ['Civic','ACT','2601'],['Braddon','ACT','2612'],['Kingston','ACT','2604'],['Manuka','ACT','2603'],['Dickson','ACT','2602'],
    // NT
    ['Darwin','NT','0800'],['Alice Springs','NT','0870'],['Palmerston','NT','0830'],['Katherine','NT','0850'],['Casuarina','NT','0810'],
];

const AU_STATES = ['NSW','VIC','QLD','SA','WA','TAS','ACT','NT'];

function addressFieldsHTML(prefix, existingAddress) {
    const parts = parseAddress(existingAddress || '');
    return `<div class="form-group" style="position:relative">
            <label>Search Address</label>
            <div class="input-icon"><i class="fas fa-search"></i><input type="text" id="${prefix}-search" placeholder="Start typing an address..." autocomplete="off" style="padding-left:36px"></div>
        </div>
        <div class="form-group"><label>Street</label><input type="text" id="${prefix}-street" value="${escapeHTML(parts.street)}" placeholder="e.g. 45 Pitt St"></div>
        <div class="form-row">
            <div class="form-group"><label>Suburb</label><input type="text" id="${prefix}-suburb" value="${escapeHTML(parts.suburb)}" placeholder="e.g. Parramatta"></div>
            <div class="form-group"><label>Postcode</label><input type="text" id="${prefix}-postcode" value="${escapeHTML(parts.postcode)}" maxlength="4" placeholder="e.g. 2000"></div>
        </div>
        <div class="form-group"><label>State</label><select id="${prefix}-state">
            <option value="">Select...</option>
            ${AU_STATES.map(s => `<option ${parts.state===s?'selected':''}>${s}</option>`).join('')}
        </select></div>`;
}

function parseAddress(addr) {
    if (!addr) return { street: '', suburb: '', postcode: '', state: '' };
    const match = addr.match(/^(.*?)(?:,\s*)?([A-Za-z\s']+?)\s+(NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+(\d{4})$/);
    if (match) return { street: match[1].trim(), suburb: match[2].trim(), postcode: match[4], state: match[3] };
    return { street: addr, suburb: '', postcode: '', state: '' };
}

function getAddressValue(prefix) {
    const street = (document.getElementById(prefix + '-street').value || '').trim();
    const suburb = (document.getElementById(prefix + '-suburb').value || '').trim();
    const postcode = (document.getElementById(prefix + '-postcode').value || '').trim();
    const state = (document.getElementById(prefix + '-state').value || '').trim();
    const parts = [street, [suburb, state, postcode].filter(Boolean).join(' ')].filter(Boolean);
    return parts.join(', ');
}

let _googleMapsLoaded = false;
function loadGoogleMaps(apiKey) {
    if (_googleMapsLoaded || !apiKey) return Promise.resolve(false);
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=_gmapsReady`;
        script.async = true;
        window._gmapsReady = () => { _googleMapsLoaded = true; resolve(true); };
        script.onerror = () => resolve(false);
        document.head.appendChild(script);
    });
}

function attachAddressAutocomplete(prefix) {
    const searchInput = document.getElementById(prefix + '-search');
    if (!searchInput) return;

    if (_googleMapsLoaded && window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['address'],
            componentRestrictions: { country: 'au' },
            fields: ['address_components', 'formatted_address']
        });
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place || !place.address_components) return;
            let streetNum = '', route = '', suburb = '', state = '', postcode = '';
            place.address_components.forEach(c => {
                if (c.types.includes('street_number')) streetNum = c.long_name;
                if (c.types.includes('route')) route = c.long_name;
                if (c.types.includes('locality')) suburb = c.long_name;
                if (c.types.includes('administrative_area_level_1')) state = c.short_name;
                if (c.types.includes('postal_code')) postcode = c.long_name;
            });
            document.getElementById(prefix + '-street').value = [streetNum, route].filter(Boolean).join(' ');
            document.getElementById(prefix + '-suburb').value = suburb;
            document.getElementById(prefix + '-postcode').value = postcode;
            document.getElementById(prefix + '-state').value = state;
        });
    } else {
        const dd = document.createElement('div');
        dd.className = 'address-autocomplete';
        dd.style.display = 'none';
        searchInput.parentElement.parentElement.style.position = 'relative';
        searchInput.parentElement.parentElement.appendChild(dd);

        searchInput.addEventListener('input', function() {
            const q = this.value.toLowerCase().trim();
            if (q.length < 2) { dd.style.display = 'none'; return; }
            const results = AU_SUBURBS.filter(([suburb, state, postcode]) =>
                suburb.toLowerCase().includes(q) || postcode.startsWith(q)
            ).slice(0, 8);
            if (!results.length) {
                dd.innerHTML = '<div style="padding:10px 14px;color:#94A3B8;font-size:12px"><i class="fas fa-info-circle"></i> Add a Google Maps API key in Settings for full street-level search</div>';
                dd.style.display = '';
                return;
            }
            dd.innerHTML = results.map(([suburb, state, postcode]) =>
                `<div class="address-option" data-suburb="${escapeHTML(suburb)}" data-state="${state}" data-postcode="${postcode}">
                    <strong>${escapeHTML(suburb)}</strong> <span style="color:#64748B">${state} ${postcode}</span>
                </div>`
            ).join('');
            dd.style.display = '';
            dd.querySelectorAll('.address-option').forEach(opt => {
                opt.addEventListener('mousedown', e => {
                    e.preventDefault();
                    document.getElementById(prefix + '-suburb').value = opt.dataset.suburb;
                    document.getElementById(prefix + '-postcode').value = opt.dataset.postcode;
                    document.getElementById(prefix + '-state').value = opt.dataset.state;
                    dd.style.display = 'none';
                    searchInput.value = opt.dataset.suburb + ' ' + opt.dataset.state + ' ' + opt.dataset.postcode;
                });
            });
        });
        searchInput.addEventListener('blur', () => setTimeout(() => { dd.style.display = 'none'; }, 200));
    }
}

// ---- Auth Token ----
let _authToken = null;
function authHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (_authToken) h['Authorization'] = 'Bearer ' + _authToken;
    return h;
}

// ---- Role-Based Access Control ----
const ROLES = {
    Administrator: {
        label: 'Administrator',
        description: 'Full access to all features and settings',
        pages: ['dashboard', 'customers', 'suppliers', 'inventory', 'jobs', 'orders', 'invoices', 'reports', 'settings'],
        canExport: true, canDelete: true, canManageUsers: true, canEditSettings: true, canBackup: true
    },
    Manager: {
        label: 'Manager',
        description: 'Access to all operations, reports, but not system settings or user management',
        pages: ['dashboard', 'customers', 'suppliers', 'inventory', 'jobs', 'orders', 'invoices', 'reports'],
        canExport: true, canDelete: true, canManageUsers: false, canEditSettings: false, canBackup: false
    },
    Staff: {
        label: 'Staff',
        description: 'Day-to-day operations — customers, jobs, inventory, invoices',
        pages: ['dashboard', 'customers', 'inventory', 'jobs', 'invoices'],
        canExport: false, canDelete: false, canManageUsers: false, canEditSettings: false, canBackup: false
    },
    'View Only': {
        label: 'View Only',
        description: 'Read-only access to dashboard and reports',
        pages: ['dashboard', 'reports'],
        canExport: true, canDelete: false, canManageUsers: false, canEditSettings: false, canBackup: false
    }
};

function getUserPermissions() {
    if (!_currentUser) return ROLES['Staff'];
    return ROLES[_currentUser.role] || ROLES['Staff'];
}

function canAccessPage(page) {
    return getUserPermissions().pages.includes(page);
}

function applyRoleRestrictions() {
    const perms = getUserPermissions();
    document.querySelectorAll('.nav-item[data-page]').forEach(nav => {
        const page = nav.dataset.page;
        if (perms.pages.includes(page)) {
            nav.style.display = '';
            nav.classList.remove('nav-disabled');
        } else {
            nav.style.display = 'none';
            nav.classList.add('nav-disabled');
        }
    });
    document.querySelectorAll('.nav-group-label').forEach(label => {
        const next = label.nextElementSibling;
        let hasVisible = false;
        let el = label.nextElementSibling;
        while (el && !el.classList.contains('nav-group-label')) {
            if (el.classList.contains('nav-item') && el.style.display !== 'none') hasVisible = true;
            el = el.nextElementSibling;
        }
        label.style.display = hasVisible ? '' : 'none';
    });
}

// ---- Data Store (localStorage + file directory backend) ----
const DEFAULT_SETTINGS = { companyName: 'FormationX Auto', abn: '12 345 678 901', email: 'service@formationxauto.com.au', phone: '(02) 9876 5432', address: '38 Parramatta Rd, Homebush NSW 2140', taxRate: 10, invoicePrefix: 'INV', nextInvoiceNum: 1001, nextJobNum: 1, nextPurchaseOrderNum: 4, paymentTerms: 14, emailjsPublicKey: '', emailjsServiceId: '', emailjsTemplateId: '', smsApiKey: 'textbelt', googleMapsApiKey: '' };

const LABOUR_PRESETS = [
    { description: 'Full Service', hours: 1.5, rate: 150 },
    { description: 'Brake Replacement', hours: 2, rate: 220 },
    { description: 'Battery + Filter', hours: 1, rate: 85 },
    { description: 'Diagnostics', hours: 1, rate: 90 },
    { description: 'Oil Change', hours: 0.5, rate: 60 },
    { description: 'Tyre Rotation', hours: 0.5, rate: 50 },
    { description: 'Wheel Alignment', hours: 1, rate: 110 },
    { description: 'AC Service', hours: 1.5, rate: 180 },
];

const DB = {
    _useServer: false,

    load(key, fallback) {
        try { return JSON.parse(localStorage.getItem('fx_' + key)) || fallback; }
        catch { return fallback; }
    },
    save(key, data) {
        localStorage.setItem('fx_' + key, JSON.stringify(data));
        if (this._useServer) {
            fetch('/api/' + key, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) })
                .then(r => { if (r.status === 401) { toast('Session expired — please log in again', 'error'); showLoginScreen(); } })
                .catch(err => toast('Server sync failed: ' + err.message, 'error'));
        }
    },
    get customers() { return this.load('customers', []); },
    set customers(v) { this.save('customers', v); },
    get suppliers() { return this.load('suppliers', []); },
    set suppliers(v) { this.save('suppliers', v); },
    get inventory() { return this.load('inventory', []); },
    set inventory(v) { this.save('inventory', v); },
    get orders() { return this.load('orders', []); },
    set orders(v) { this.save('orders', v); },
    get jobs() { return this.load('jobs', []); },
    set jobs(v) { this.save('jobs', v); },
    get invoices() { return this.load('invoices', []); },
    set invoices(v) { this.save('invoices', v); },
    get settings() { return this.load('settings', DEFAULT_SETTINGS); },
    set settings(v) { this.save('settings', v); },
    nextId(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; },

    async syncFromServer() {
        try {
            const resp = await fetch('/api/backup', { headers: authHeaders() });
            if (!resp.ok) { toast('Failed to sync from server (HTTP ' + resp.status + ')', 'warning'); return false; }
            const data = await resp.json();
            ['customers','suppliers','inventory','orders','invoices','jobs','settings'].forEach(k => {
                if (data[k] && (Array.isArray(data[k]) ? data[k].length : Object.keys(data[k]).length)) {
                    localStorage.setItem('fx_' + k, JSON.stringify(data[k]));
                }
            });
            return true;
        } catch (err) { toast('Server sync failed: ' + err.message, 'error'); return false; }
    },

    async syncToServer() {
        try {
            const backup = {};
            ['customers','suppliers','inventory','orders','invoices','jobs','settings'].forEach(k => { backup[k] = this[k]; });
            const resp = await fetch('/api/restore', { method: 'POST', headers: authHeaders(), body: JSON.stringify(backup) });
            if (!resp.ok) { toast('Failed to sync to server (HTTP ' + resp.status + ')', 'warning'); return false; }
            return true;
        } catch (err) { toast('Server sync failed: ' + err.message, 'error'); return false; }
    },

    async detectServer() {
        try {
            const resp = await fetch('/api/backup', { method: 'GET', headers: authHeaders() });
            this._useServer = resp.ok;
            return resp.ok;
        } catch { this._useServer = false; return false; }
    }
};

// ---- Seed Data ----
const APP_VERSION = '3.0';
function seedData() {
    if (DB.customers.length && localStorage.getItem('fx_version') === APP_VERSION) return;
    localStorage.getItem('fx_version') !== APP_VERSION && localStorage.clear();
    localStorage.setItem('fx_version', APP_VERSION);
    DB.customers = [
        { id: 1, firstName: 'James', lastName: 'Mitchell', email: 'james.m@outlook.com', phone: '0412 345 678', company: '', abn: '', billingAddress: '45 Pitt St, Sydney NSW 2000', shippingAddress: '45 Pitt St, Sydney NSW 2000', status: 'Active', notes: 'Vehicle: 2022 Toyota Camry', created: '2025-09-15' },
        { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@gmail.com', phone: '0423 456 789', company: 'Chen Transport', abn: '22 333 444 555', billingAddress: '12 Harbour Dr, Melbourne VIC 3000', shippingAddress: '12 Harbour Dr, Melbourne VIC 3000', status: 'Active', notes: 'Fleet customer — 5 vehicles', created: '2025-10-03' },
        { id: 3, firstName: 'David', lastName: 'Thompson', email: 'd.thompson@corp.com', phone: '0434 567 890', company: '', abn: '', billingAddress: '78 Queen St, Brisbane QLD 4000', shippingAddress: '78 Queen St, Brisbane QLD 4000', status: 'Active', notes: 'Vehicle: 2019 Ford Ranger', created: '2025-10-20' },
        { id: 4, firstName: 'Emma', lastName: 'Williams', email: 'emma.w@business.com', phone: '0445 678 901', company: 'Williams Couriers', abn: '44 555 666 777', billingAddress: '23 King St, Perth WA 6000', shippingAddress: '23 King St, Perth WA 6000', status: 'Active', notes: 'Fleet — 3 courier vans', created: '2025-11-10' },
        { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'mbrown@email.com', phone: '0456 789 012', company: '', abn: '', billingAddress: '56 Flinders Ln, Adelaide SA 5000', shippingAddress: '56 Flinders Ln, Adelaide SA 5000', status: 'Inactive', notes: 'Account on hold — disputed invoice', created: '2025-09-08' },
        { id: 6, firstName: 'Olivia', lastName: 'Nguyen', email: 'olivia.n@hotmail.com', phone: '0467 890 123', company: '', abn: '', billingAddress: '14 George St, Parramatta NSW 2150', shippingAddress: '14 George St, Parramatta NSW 2150', status: 'Active', notes: 'Vehicle: 2023 Mazda CX-5', created: '2025-11-22' },
        { id: 7, firstName: 'Liam', lastName: 'O\'Connor', email: 'liam.oc@gmail.com', phone: '0478 901 234', company: 'O\'Connor Plumbing', abn: '55 666 777 888', billingAddress: '9 Bathurst Rd, Orange NSW 2800', shippingAddress: '9 Bathurst Rd, Orange NSW 2800', status: 'Active', notes: 'Work ute — 2020 Toyota HiLux', created: '2025-12-05' },
        { id: 8, firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@outlook.com', phone: '0489 012 345', company: '', abn: '', billingAddress: '33 Chapel St, Windsor VIC 3181', shippingAddress: '33 Chapel St, Windsor VIC 3181', status: 'Active', notes: 'Vehicle: 2021 Kia Sportage', created: '2026-01-12' },
        { id: 9, firstName: 'Daniel', lastName: 'Kim', email: 'dan.kim@corp.com.au', phone: '0490 123 456', company: 'Kim Auto Detailing', abn: '66 777 888 999', billingAddress: '71 Anzac Pde, Kensington NSW 2033', shippingAddress: '71 Anzac Pde, Kensington NSW 2033', status: 'Active', notes: 'Regular monthly service', created: '2026-01-28' },
        { id: 10, firstName: 'Rachel', lastName: 'Taylor', email: 'rachel.t@icloud.com', phone: '0401 234 567', company: '', abn: '', billingAddress: '5 Marine Pde, Coolangatta QLD 4225', shippingAddress: '5 Marine Pde, Coolangatta QLD 4225', status: 'Active', notes: 'Vehicle: 2018 Subaru Outback', created: '2026-02-14' },
        { id: 11, firstName: 'Tom', lastName: 'Russo', email: 'tom.russo@live.com', phone: '0412 345 999', company: 'Russo Landscaping', abn: '77 888 999 111', billingAddress: '120 Victoria Rd, Gladesville NSW 2111', shippingAddress: '120 Victoria Rd, Gladesville NSW 2111', status: 'Active', notes: 'Fleet — 2 work utes', created: '2026-02-28' },
        { id: 12, firstName: 'Sophie', lastName: 'Anderson', email: 'sophie.a@gmail.com', phone: '0423 456 111', company: '', abn: '', billingAddress: '88 Darling St, Balmain NSW 2041', shippingAddress: '88 Darling St, Balmain NSW 2041', status: 'Active', notes: 'Vehicle: 2022 VW Golf', created: '2026-03-05' },
        { id: 13, firstName: 'Chris', lastName: 'Patel', email: 'chris.patel@yahoo.com', phone: '0434 567 222', company: '', abn: '', billingAddress: '22 High St, Penrith NSW 2750', shippingAddress: '22 High St, Penrith NSW 2750', status: 'Active', notes: 'Vehicle: 2017 Nissan Navara', created: '2026-03-18' },
        { id: 14, firstName: 'Amy', lastName: 'Walker', email: 'amy.walker@business.com', phone: '0445 678 333', company: 'Walker & Co Real Estate', abn: '88 999 000 222', billingAddress: '4 Market St, Sydney NSW 2000', shippingAddress: '4 Market St, Sydney NSW 2000', status: 'Active', notes: 'Vehicle: 2023 Mercedes C200', created: '2026-04-01' },
        { id: 15, firstName: 'Ben', lastName: 'Hughes', email: 'ben.h@outlook.com', phone: '0456 789 444', company: '', abn: '', billingAddress: '61 Crown St, Wollongong NSW 2500', shippingAddress: '61 Crown St, Wollongong NSW 2500', status: 'Active', notes: 'Vehicle: 2020 Mitsubishi Triton', created: '2026-04-15' },
        { id: 16, firstName: 'Grace', lastName: 'Lee', email: 'grace.lee@gmail.com', phone: '0467 890 555', company: '', abn: '', billingAddress: '19 Oxford St, Paddington NSW 2021', shippingAddress: '19 Oxford St, Paddington NSW 2021', status: 'Inactive', notes: 'Moved interstate', created: '2025-08-20' },
    ];
    DB.suppliers = [
        { id: 1, company: 'Repco Trade', contact: 'Robert Lee', email: 'trade@repco.com.au', phone: '0478 111 222', address: '88 Industrial Ave, Parramatta NSW 2150', abn: '66 777 888 999', category: 'Engine Parts', paymentTerms: 30, status: 'Active', notes: '' },
        { id: 2, company: 'Burson Auto Parts', contact: 'Linda Nguyen', email: 'linda@burson.com.au', phone: '0489 222 333', address: '15 Factory Rd, Clayton VIC 3168', abn: '77 888 999 000', category: 'Brakes & Filters', paymentTerms: 15, status: 'Active', notes: 'Bulk discount on brake pads' },
        { id: 3, company: 'Castrol Australia', contact: 'Alan Foster', email: 'alan@castrol.com.au', phone: '0490 333 444', address: '200 Industrial Park, Macquarie Park NSW 2113', abn: '88 999 000 111', category: 'Fluids & Oils', paymentTerms: 30, status: 'Active', notes: '' },
        { id: 4, company: 'AutoElec Supplies', contact: 'Karen White', email: 'karen@autoelec.com.au', phone: '0401 444 555', address: '42 Motorway Dr, Botany NSW 2019', abn: '99 000 111 222', category: 'Electrical', paymentTerms: 30, status: 'Active', notes: 'Batteries and alternators' },
        { id: 5, company: 'Tyrepower Wholesale', contact: 'Steve Grant', email: 'steve@tyrepower.com.au', phone: '0412 555 666', address: '300 Parramatta Rd, Auburn NSW 2144', abn: '11 222 333 444', category: 'Tyres', paymentTerms: 30, status: 'Active', notes: 'All major tyre brands' },
        { id: 6, company: 'SuperCheap Trade', contact: 'Jenny Tran', email: 'trade@supercheap.com.au', phone: '0423 666 777', address: '50 Silverwater Rd, Silverwater NSW 2128', abn: '22 333 444 555', category: 'Engine Parts', paymentTerms: 15, status: 'Active', notes: 'Good prices on filters' },
        { id: 7, company: 'Penrite Oil', contact: 'Mark Davis', email: 'mark@penrite.com.au', phone: '0434 777 888', address: '110 Somerton Rd, Somerton VIC 3062', abn: '33 444 555 666', category: 'Fluids & Oils', paymentTerms: 30, status: 'Active', notes: 'Premium oil range' },
        { id: 8, company: 'Bosch Car Service Parts', contact: 'Anna Schmidt', email: 'anna@bosch.com.au', phone: '0445 888 999', address: '25 Laverton North VIC 3026', abn: '44 555 666 777', category: 'Electrical', paymentTerms: 60, status: 'Active', notes: 'Alternators, starters, sensors' },
        { id: 9, company: 'Bendix Brakes Direct', contact: 'Paul Murray', email: 'paul@bendix.com.au', phone: '0456 999 000', address: '8 Ballarat Rd, Footscray VIC 3011', abn: '55 666 777 888', category: 'Brakes & Filters', paymentTerms: 30, status: 'Active', notes: '' },
        { id: 10, company: 'GPC Asia Pacific', contact: 'Helen Zheng', email: 'helen@gpcap.com.au', phone: '0467 000 111', address: '60 Biloela St, Villawood NSW 2163', abn: '66 777 888 000', category: 'Engine Parts', paymentTerms: 30, status: 'Active', notes: 'NAPA brand distributor' },
        { id: 11, company: 'Continental Tyres AU', contact: 'David Klein', email: 'david@continental.com.au', phone: '0478 111 000', address: '15 Hume Hwy, Chullora NSW 2190', abn: '77 888 999 111', category: 'Tyres', paymentTerms: 60, status: 'Active', notes: '' },
        { id: 12, company: 'Ryco Filters', contact: 'Sam Barker', email: 'sam@ryco.com.au', phone: '0489 222 111', address: '45 South Rd, Moorabbin VIC 3189', abn: '88 999 000 222', category: 'Brakes & Filters', paymentTerms: 30, status: 'Active', notes: 'Oil, air, fuel, cabin filters' },
        { id: 13, company: 'ACDelco Trade', contact: 'Kim Ly', email: 'kim@acdelco.com.au', phone: '0490 333 222', address: '9 Elizabeth St, Wetherill Park NSW 2164', abn: '99 000 111 333', category: 'Engine Parts', paymentTerms: 30, status: 'Inactive', notes: 'Slow delivery times' },
        { id: 14, company: 'Valvoline Australia', contact: 'Raj Nair', email: 'raj@valvoline.com.au', phone: '0401 444 333', address: '200 Canterbury Rd, Canterbury NSW 2193', abn: '11 222 333 000', category: 'Fluids & Oils', paymentTerms: 15, status: 'Active', notes: '' },
        { id: 15, company: 'Narva Lighting', contact: 'Tina West', email: 'tina@narva.com.au', phone: '0412 555 444', address: '33 Toll Dr, Altona North VIC 3025', abn: '22 333 444 111', category: 'Electrical', paymentTerms: 30, status: 'Active', notes: 'Headlights, globes, LED bars' },
    ];
    DB.inventory = [
        { id: 1, sku: 'FX-1001', name: 'Oil Filter (Standard)', category: 'Filters', supplierId: 1, costPrice: 6.50, unitPrice: 18.00, quantity: 85, reorderLevel: 20, status: 'In Stock' },
        { id: 2, sku: 'FX-1002', name: 'Brake Pad Set (Front)', category: 'Brakes', supplierId: 2, costPrice: 35.00, unitPrice: 89.00, quantity: 28, reorderLevel: 10, status: 'In Stock' },
        { id: 3, sku: 'FX-1003', name: 'Engine Oil 5W-30 (5L)', category: 'Fluids & Oils', supplierId: 3, costPrice: 22.00, unitPrice: 54.99, quantity: 12, reorderLevel: 15, status: 'Low Stock' },
        { id: 4, sku: 'FX-1004', name: 'Air Filter', category: 'Filters', supplierId: 1, costPrice: 8.00, unitPrice: 24.00, quantity: 45, reorderLevel: 15, status: 'In Stock' },
        { id: 5, sku: 'FX-1005', name: 'Spark Plug (Single)', category: 'Engine Parts', supplierId: 1, costPrice: 4.50, unitPrice: 12.00, quantity: 150, reorderLevel: 40, status: 'In Stock' },
        { id: 6, sku: 'FX-1006', name: 'Brake Disc Rotor (Front)', category: 'Brakes', supplierId: 2, costPrice: 45.00, unitPrice: 110.00, quantity: 0, reorderLevel: 5, status: 'Out of Stock' },
        { id: 7, sku: 'FX-1007', name: 'Car Battery 12V', category: 'Electrical', supplierId: 4, costPrice: 85.00, unitPrice: 189.00, quantity: 9, reorderLevel: 5, status: 'In Stock' },
        { id: 8, sku: 'FX-1008', name: 'Coolant (1L)', category: 'Fluids & Oils', supplierId: 3, costPrice: 5.00, unitPrice: 14.99, quantity: 60, reorderLevel: 20, status: 'In Stock' },
        { id: 9, sku: 'FX-1009', name: 'Timing Belt Kit', category: 'Engine Parts', supplierId: 6, costPrice: 65.00, unitPrice: 149.00, quantity: 6, reorderLevel: 3, status: 'In Stock' },
        { id: 10, sku: 'FX-1010', name: 'Brake Pad Set (Rear)', category: 'Brakes', supplierId: 9, costPrice: 30.00, unitPrice: 79.00, quantity: 18, reorderLevel: 8, status: 'In Stock' },
        { id: 11, sku: 'FX-1011', name: 'Transmission Fluid (1L)', category: 'Fluids & Oils', supplierId: 7, costPrice: 12.00, unitPrice: 29.99, quantity: 25, reorderLevel: 10, status: 'In Stock' },
        { id: 12, sku: 'FX-1012', name: 'Cabin Filter', category: 'Filters', supplierId: 12, costPrice: 10.00, unitPrice: 28.00, quantity: 35, reorderLevel: 10, status: 'In Stock' },
        { id: 13, sku: 'FX-1013', name: 'Alternator (Universal)', category: 'Electrical', supplierId: 8, costPrice: 120.00, unitPrice: 275.00, quantity: 4, reorderLevel: 2, status: 'In Stock' },
        { id: 14, sku: 'FX-1014', name: 'Wiper Blades (Pair)', category: 'Engine Parts', supplierId: 10, costPrice: 8.00, unitPrice: 22.00, quantity: 40, reorderLevel: 15, status: 'In Stock' },
        { id: 15, sku: 'FX-1015', name: 'Headlight Globe H7', category: 'Electrical', supplierId: 15, costPrice: 6.00, unitPrice: 18.00, quantity: 50, reorderLevel: 20, status: 'In Stock' },
        { id: 16, sku: 'FX-1016', name: 'Fuel Filter', category: 'Filters', supplierId: 12, costPrice: 12.00, unitPrice: 34.00, quantity: 20, reorderLevel: 8, status: 'In Stock' },
        { id: 17, sku: 'FX-1017', name: 'Tyre 205/55R16 (Each)', category: 'Tyres', supplierId: 5, costPrice: 75.00, unitPrice: 165.00, quantity: 8, reorderLevel: 4, status: 'In Stock' },
        { id: 18, sku: 'FX-1018', name: 'Power Steering Fluid (500ml)', category: 'Fluids & Oils', supplierId: 14, costPrice: 7.00, unitPrice: 19.99, quantity: 15, reorderLevel: 5, status: 'In Stock' },
    ];
    const today = new Date();
    const d = (offset) => { const dt = new Date(today); dt.setDate(dt.getDate() - offset); return dt.toISOString().split('T')[0]; };
    DB.orders = [
        { id: 1, type: 'Purchase', orderNum: 'PO-0001', date: d(90), expectedDate: d(83), supplierId: 1, items: [{ inventoryId: 1, qty: 50, price: 6.50, discount: 0 }, { inventoryId: 5, qty: 100, price: 4.50, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Monthly restock — filters & spark plugs' },
        { id: 2, type: 'Purchase', orderNum: 'PO-0002', date: d(75), expectedDate: d(68), supplierId: 2, items: [{ inventoryId: 2, qty: 30, price: 35.00, discount: 0 }, { inventoryId: 10, qty: 20, price: 30.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Brake pads restock' },
        { id: 3, type: 'Purchase', orderNum: 'PO-0003', date: d(60), expectedDate: d(53), supplierId: 3, items: [{ inventoryId: 3, qty: 40, price: 22.00, discount: 0 }, { inventoryId: 8, qty: 60, price: 5.00, discount: 0 }, { inventoryId: 11, qty: 30, price: 12.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Fluids restock' },
        { id: 4, type: 'Purchase', orderNum: 'PO-0004', date: d(45), expectedDate: d(38), supplierId: 4, items: [{ inventoryId: 7, qty: 10, price: 85.00, discount: 0 }, { inventoryId: 13, qty: 5, price: 120.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Electrical parts' },
        { id: 5, type: 'Purchase', orderNum: 'PO-0005', date: d(30), expectedDate: d(23), supplierId: 12, items: [{ inventoryId: 12, qty: 40, price: 10.00, discount: 0 }, { inventoryId: 16, qty: 25, price: 12.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Filters restock — Ryco' },
        { id: 6, type: 'Purchase', orderNum: 'PO-0006', date: d(20), expectedDate: d(13), supplierId: 5, items: [{ inventoryId: 17, qty: 12, price: 75.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Tyres — 205/55R16' },
        { id: 7, type: 'Purchase', orderNum: 'PO-0007', date: d(15), expectedDate: d(8), supplierId: 6, items: [{ inventoryId: 9, qty: 8, price: 65.00, discount: 0 }, { inventoryId: 14, qty: 50, price: 8.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Timing belts + wipers' },
        { id: 8, type: 'Purchase', orderNum: 'PO-0008', date: d(10), expectedDate: d(3), supplierId: 15, items: [{ inventoryId: 15, qty: 60, price: 6.00, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Headlight globes H7' },
        { id: 9, type: 'Purchase', orderNum: 'PO-0009', date: d(8), expectedDate: d(1), supplierId: 1, items: [{ inventoryId: 1, qty: 50, price: 6.50, discount: 0 }, { inventoryId: 4, qty: 30, price: 8.00, discount: 0 }, { inventoryId: 5, qty: 80, price: 4.50, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Monthly restock' },
        { id: 10, type: 'Purchase', orderNum: 'PO-0010', date: d(5), expectedDate: d(-2), supplierId: 2, items: [{ inventoryId: 6, qty: 10, price: 45.00, discount: 0 }, { inventoryId: 2, qty: 20, price: 35.00, discount: 0 }], status: 'Ordered', paymentStatus: 'Unpaid', notes: 'Restock brake rotors — out of stock' },
        { id: 11, type: 'Purchase', orderNum: 'PO-0011', date: d(3), expectedDate: d(-4), supplierId: 3, items: [{ inventoryId: 3, qty: 30, price: 22.00, discount: 0 }, { inventoryId: 8, qty: 40, price: 5.00, discount: 0 }], status: 'Ordered', paymentStatus: 'Unpaid', notes: 'Engine oil low — urgent' },
        { id: 12, type: 'Purchase', orderNum: 'PO-0012', date: d(2), expectedDate: d(-5), supplierId: 7, items: [{ inventoryId: 11, qty: 20, price: 12.00, discount: 0 }, { inventoryId: 18, qty: 15, price: 7.00, discount: 0 }], status: 'Ordered', paymentStatus: 'Unpaid', notes: 'Transmission + power steering fluid' },
        { id: 13, type: 'Purchase', orderNum: 'PO-0013', date: d(1), expectedDate: d(-6), supplierId: 5, items: [{ inventoryId: 17, qty: 16, price: 75.00, discount: 0 }], status: 'Draft', paymentStatus: 'Unpaid', notes: 'Tyres — need quote confirmation' },
        { id: 14, type: 'Purchase', orderNum: 'PO-0014', date: d(1), expectedDate: d(-8), supplierId: 8, items: [{ inventoryId: 13, qty: 4, price: 120.00, discount: 0 }], status: 'Draft', paymentStatus: 'Unpaid', notes: 'Alternators low' },
        { id: 15, type: 'Purchase', orderNum: 'PO-0015', date: d(0), expectedDate: d(-7), supplierId: 9, items: [{ inventoryId: 10, qty: 15, price: 30.00, discount: 0 }], status: 'Draft', paymentStatus: 'Unpaid', notes: 'Rear brake pads' },
    ];
    DB.jobs = [
        { id: 1, jobNum: 'JOB-0001', date: d(85), customerId: 1, vehicle: { make: 'Toyota', model: 'Camry', year: '2022', rego: 'ABC123' }, description: 'Full service — 60,000km', parts: [{ inventoryId: 1, qty: 1, price: 18.00 }, { inventoryId: 3, qty: 1, price: 54.99 }, { inventoryId: 5, qty: 4, price: 12.00 }], labour: [{ description: 'Full Service', hours: 1.5, rate: 150 }], status: 'Invoiced', notes: '' },
        { id: 2, jobNum: 'JOB-0002', date: d(78), customerId: 2, vehicle: { make: 'Toyota', model: 'HiAce', year: '2020', rego: 'FLT001' }, description: 'Front brake replacement — fleet vehicle 1', parts: [{ inventoryId: 2, qty: 2, price: 89.00 }, { inventoryId: 6, qty: 2, price: 110.00 }], labour: [{ description: 'Brake Replacement', hours: 2, rate: 220 }], status: 'Invoiced', notes: '' },
        { id: 3, jobNum: 'JOB-0003', date: d(65), customerId: 6, vehicle: { make: 'Mazda', model: 'CX-5', year: '2023', rego: 'DEF456' }, description: 'Oil change + cabin filter', parts: [{ inventoryId: 1, qty: 1, price: 18.00 }, { inventoryId: 3, qty: 1, price: 54.99 }, { inventoryId: 12, qty: 1, price: 28.00 }], labour: [{ description: 'Oil Change', hours: 0.5, rate: 60 }], status: 'Invoiced', notes: '' },
        { id: 4, jobNum: 'JOB-0004', date: d(55), customerId: 7, vehicle: { make: 'Toyota', model: 'HiLux', year: '2020', rego: 'OCP100' }, description: 'Timing belt replacement', parts: [{ inventoryId: 9, qty: 1, price: 149.00 }, { inventoryId: 8, qty: 2, price: 14.99 }], labour: [{ description: 'Timing Belt Replacement', hours: 3, rate: 150 }], status: 'Invoiced', notes: '' },
        { id: 5, jobNum: 'JOB-0005', date: d(48), customerId: 3, vehicle: { make: 'Ford', model: 'Ranger', year: '2019', rego: 'XYZ789' }, description: 'Battery replacement + air filter', parts: [{ inventoryId: 7, qty: 1, price: 189.00 }, { inventoryId: 4, qty: 1, price: 24.00 }], labour: [{ description: 'Battery + Filter', hours: 1, rate: 85 }], status: 'Invoiced', notes: '' },
        { id: 6, jobNum: 'JOB-0006', date: d(40), customerId: 8, vehicle: { make: 'Kia', model: 'Sportage', year: '2021', rego: 'KIA321' }, description: 'Full service + wheel alignment', parts: [{ inventoryId: 1, qty: 1, price: 18.00 }, { inventoryId: 3, qty: 1, price: 54.99 }, { inventoryId: 5, qty: 4, price: 12.00 }, { inventoryId: 4, qty: 1, price: 24.00 }], labour: [{ description: 'Full Service', hours: 1.5, rate: 150 }, { description: 'Wheel Alignment', hours: 1, rate: 110 }], status: 'Invoiced', notes: '' },
        { id: 7, jobNum: 'JOB-0007', date: d(35), customerId: 9, vehicle: { make: 'Hyundai', model: 'i30', year: '2022', rego: 'DKM200' }, description: 'Rear brake pads + fluid top-up', parts: [{ inventoryId: 10, qty: 1, price: 79.00 }, { inventoryId: 11, qty: 1, price: 29.99 }], labour: [{ description: 'Brake Replacement', hours: 1.5, rate: 220 }], status: 'Invoiced', notes: 'Regular customer — monthly' },
        { id: 8, jobNum: 'JOB-0008', date: d(28), customerId: 10, vehicle: { make: 'Subaru', model: 'Outback', year: '2018', rego: 'SUB555' }, description: 'AC service + coolant flush', parts: [{ inventoryId: 8, qty: 4, price: 14.99 }], labour: [{ description: 'AC Service', hours: 1.5, rate: 180 }], status: 'Invoiced', notes: '' },
        { id: 9, jobNum: 'JOB-0009', date: d(22), customerId: 11, vehicle: { make: 'Toyota', model: 'HiLux', year: '2019', rego: 'RUS001' }, description: 'Full service — work ute 1', parts: [{ inventoryId: 1, qty: 1, price: 18.00 }, { inventoryId: 3, qty: 1, price: 54.99 }, { inventoryId: 5, qty: 4, price: 12.00 }, { inventoryId: 4, qty: 1, price: 24.00 }], labour: [{ description: 'Full Service', hours: 1.5, rate: 150 }], status: 'Invoiced', notes: '' },
        { id: 10, jobNum: 'JOB-0010', date: d(18), customerId: 12, vehicle: { make: 'VW', model: 'Golf', year: '2022', rego: 'VWG777' }, description: 'Headlight globe replacement + diagnostics', parts: [{ inventoryId: 15, qty: 2, price: 18.00 }], labour: [{ description: 'Diagnostics', hours: 1, rate: 90 }, { description: 'Globe Replacement', hours: 0.5, rate: 60 }], status: 'Invoiced', notes: '' },
        { id: 11, jobNum: 'JOB-0011', date: d(14), customerId: 13, vehicle: { make: 'Nissan', model: 'Navara', year: '2017', rego: 'NAV999' }, description: 'Alternator replacement', parts: [{ inventoryId: 13, qty: 1, price: 275.00 }, { inventoryId: 7, qty: 1, price: 189.00 }], labour: [{ description: 'Alternator Replacement', hours: 2.5, rate: 150 }], status: 'Invoiced', notes: 'Battery also replaced — was failing' },
        { id: 12, jobNum: 'JOB-0012', date: d(10), customerId: 14, vehicle: { make: 'Mercedes', model: 'C200', year: '2023', rego: 'MRC001' }, description: 'Full service + tyre rotation', parts: [{ inventoryId: 1, qty: 1, price: 18.00 }, { inventoryId: 3, qty: 1, price: 54.99 }, { inventoryId: 12, qty: 1, price: 28.00 }], labour: [{ description: 'Full Service', hours: 1.5, rate: 150 }, { description: 'Tyre Rotation', hours: 0.5, rate: 50 }], status: 'Invoiced', notes: '' },
        { id: 13, jobNum: 'JOB-0013', date: d(7), customerId: 4, vehicle: { make: 'Hyundai', model: 'iLoad', year: '2021', rego: 'WLC100' }, description: 'Multi-vehicle service — 3 courier vans', parts: [{ inventoryId: 1, qty: 3, price: 18.00 }, { inventoryId: 3, qty: 3, price: 54.99 }, { inventoryId: 8, qty: 2, price: 14.99 }], labour: [{ description: 'Full Service', hours: 1.5, rate: 150 }, { description: 'Full Service', hours: 1.5, rate: 150 }, { description: 'Oil Change', hours: 0.5, rate: 60 }], status: 'In Progress', notes: 'Fleet service for Williams Couriers' },
        { id: 14, jobNum: 'JOB-0014', date: d(5), customerId: 15, vehicle: { make: 'Mitsubishi', model: 'Triton', year: '2020', rego: 'TRI444' }, description: 'Fuel filter + transmission service', parts: [{ inventoryId: 16, qty: 1, price: 34.00 }, { inventoryId: 11, qty: 2, price: 29.99 }], labour: [{ description: 'Transmission Service', hours: 1.5, rate: 140 }], status: 'In Progress', notes: '' },
        { id: 15, jobNum: 'JOB-0015', date: d(3), customerId: 2, vehicle: { make: 'Toyota', model: 'HiAce', year: '2020', rego: 'FLT002' }, description: 'Front brake rotors — awaiting stock', parts: [{ inventoryId: 6, qty: 4, price: 110.00 }], labour: [{ description: 'Brake Replacement', hours: 2, rate: 220 }], status: 'Draft', notes: 'Awaiting rotor stock from PO-0010' },
        { id: 16, jobNum: 'JOB-0016', date: d(2), customerId: 1, vehicle: { make: 'Toyota', model: 'Camry', year: '2022', rego: 'ABC123' }, description: 'Wiper blades + washer fluid top-up', parts: [{ inventoryId: 14, qty: 1, price: 22.00 }], labour: [{ description: 'Wiper Replacement', hours: 0.25, rate: 60 }], status: 'Completed', notes: '' },
        { id: 17, jobNum: 'JOB-0017', date: d(1), customerId: 9, vehicle: { make: 'Hyundai', model: 'i30', year: '2022', rego: 'DKM200' }, description: '4 new tyres + wheel alignment', parts: [{ inventoryId: 17, qty: 4, price: 165.00 }], labour: [{ description: 'Tyre Fitting (x4)', hours: 1, rate: 80 }, { description: 'Wheel Alignment', hours: 1, rate: 110 }], status: 'Draft', notes: 'Customer confirmed — booked for tomorrow' },
    ];
    DB.invoices = [
        { id: 1, invoiceNum: 'INV-1001', jobId: 1, customerId: 1, date: d(84), dueDate: d(70), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Spark Plug (Single)', qty: 4, rate: 12.00 }, { description: 'Labour — Full Service', hours: 1.5, qty: 1.5, rate: 150 }], status: 'Paid', amountPaid: 294.29, payments: [{ date: d(80), amount: 294.29, method: 'Card', ref: 'EFTPOS-1201' }], notes: '', sentLog: [{ type: 'email', to: 'james.m@outlook.com', date: d(84) }] },
        { id: 2, invoiceNum: 'INV-1002', jobId: 2, customerId: 2, date: d(77), dueDate: d(63), items: [{ description: 'Brake Pad Set (Front)', qty: 2, rate: 89.00 }, { description: 'Brake Disc Rotor (Front)', qty: 2, rate: 110.00 }, { description: 'Labour — Brake Replacement', qty: 2, rate: 220 }], status: 'Paid', amountPaid: 838.20, payments: [{ date: d(70), amount: 838.20, method: 'Bank Transfer', ref: 'TXN-88201' }], notes: '', sentLog: [{ type: 'email', to: 'sarah.chen@gmail.com', date: d(77) }] },
        { id: 3, invoiceNum: 'INV-1003', jobId: 3, customerId: 6, date: d(64), dueDate: d(50), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Cabin Filter', qty: 1, rate: 28.00 }, { description: 'Labour — Oil Change', qty: 0.5, rate: 60 }], status: 'Paid', amountPaid: 141.09, payments: [{ date: d(60), amount: 141.09, method: 'Card', ref: 'EFTPOS-1305' }], notes: '', sentLog: [{ type: 'email', to: 'olivia.n@hotmail.com', date: d(64) }] },
        { id: 4, invoiceNum: 'INV-1004', jobId: 4, customerId: 7, date: d(54), dueDate: d(40), items: [{ description: 'Timing Belt Kit', qty: 1, rate: 149.00 }, { description: 'Coolant (1L)', qty: 2, rate: 14.99 }, { description: 'Labour — Timing Belt Replacement', qty: 3, rate: 150 }], status: 'Paid', amountPaid: 646.78, payments: [{ date: d(45), amount: 646.78, method: 'Bank Transfer', ref: 'TXN-90100' }], notes: '', sentLog: [{ type: 'email', to: 'liam.oc@gmail.com', date: d(54) }] },
        { id: 5, invoiceNum: 'INV-1005', jobId: 5, customerId: 3, date: d(47), dueDate: d(33), items: [{ description: 'Car Battery 12V', qty: 1, rate: 189.00 }, { description: 'Air Filter', qty: 1, rate: 24.00 }, { description: 'Labour — Battery + Filter', qty: 1, rate: 85 }], status: 'Paid', amountPaid: 327.80, payments: [{ date: d(40), amount: 327.80, method: 'Cash', ref: 'CASH-0501' }], notes: '', sentLog: [{ type: 'email', to: 'd.thompson@corp.com', date: d(47) }] },
        { id: 6, invoiceNum: 'INV-1006', jobId: 6, customerId: 8, date: d(39), dueDate: d(25), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Spark Plug (Single)', qty: 4, rate: 12.00 }, { description: 'Air Filter', qty: 1, rate: 24.00 }, { description: 'Labour — Full Service', qty: 1.5, rate: 150 }, { description: 'Labour — Wheel Alignment', qty: 1, rate: 110 }], status: 'Paid', amountPaid: 510.29, payments: [{ date: d(30), amount: 510.29, method: 'Card', ref: 'EFTPOS-1410' }], notes: '', sentLog: [{ type: 'email', to: 'priya.s@outlook.com', date: d(39) }] },
        { id: 7, invoiceNum: 'INV-1007', jobId: 7, customerId: 9, date: d(34), dueDate: d(20), items: [{ description: 'Brake Pad Set (Rear)', qty: 1, rate: 79.00 }, { description: 'Transmission Fluid (1L)', qty: 1, rate: 29.99 }, { description: 'Labour — Brake Replacement', qty: 1.5, rate: 220 }], status: 'Paid', amountPaid: 471.89, payments: [{ date: d(28), amount: 471.89, method: 'Card', ref: 'EFTPOS-1502' }], notes: '', sentLog: [{ type: 'email', to: 'dan.kim@corp.com.au', date: d(34) }] },
        { id: 8, invoiceNum: 'INV-1008', jobId: 8, customerId: 10, date: d(27), dueDate: d(13), items: [{ description: 'Coolant (1L)', qty: 4, rate: 14.99 }, { description: 'Labour — AC Service', qty: 1.5, rate: 180 }], status: 'Paid', amountPaid: 363.96, payments: [{ date: d(20), amount: 363.96, method: 'Bank Transfer', ref: 'TXN-91200' }], notes: '', sentLog: [{ type: 'email', to: 'rachel.t@icloud.com', date: d(27) }] },
        { id: 9, invoiceNum: 'INV-1009', jobId: 9, customerId: 11, date: d(21), dueDate: d(7), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Spark Plug (Single)', qty: 4, rate: 12.00 }, { description: 'Air Filter', qty: 1, rate: 24.00 }, { description: 'Labour — Full Service', qty: 1.5, rate: 150 }], status: 'Paid', amountPaid: 351.29, payments: [{ date: d(15), amount: 351.29, method: 'Card', ref: 'EFTPOS-1601' }], notes: '', sentLog: [{ type: 'email', to: 'tom.russo@live.com', date: d(21) }] },
        { id: 10, invoiceNum: 'INV-1010', jobId: 10, customerId: 12, date: d(17), dueDate: d(3), items: [{ description: 'Headlight Globe H7', qty: 2, rate: 18.00 }, { description: 'Labour — Diagnostics', qty: 1, rate: 90 }, { description: 'Labour — Globe Replacement', qty: 0.5, rate: 60 }], status: 'Paid', amountPaid: 169.40, payments: [{ date: d(12), amount: 169.40, method: 'Cash', ref: 'CASH-0602' }], notes: '', sentLog: [{ type: 'email', to: 'sophie.a@gmail.com', date: d(17) }] },
        { id: 11, invoiceNum: 'INV-1011', jobId: 11, customerId: 13, date: d(13), dueDate: d(-1), items: [{ description: 'Alternator (Universal)', qty: 1, rate: 275.00 }, { description: 'Car Battery 12V', qty: 1, rate: 189.00 }, { description: 'Labour — Alternator Replacement', qty: 2.5, rate: 150 }], status: 'Overdue', amountPaid: 0, payments: [], notes: '', sentLog: [{ type: 'email', to: 'chris.patel@yahoo.com', date: d(13) }, { type: 'sms', to: '0434 567 222', date: d(5) }] },
        { id: 12, invoiceNum: 'INV-1012', jobId: 12, customerId: 14, date: d(9), dueDate: d(5), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Cabin Filter', qty: 1, rate: 28.00 }, { description: 'Labour — Full Service', qty: 1.5, rate: 150 }, { description: 'Labour — Tyre Rotation', qty: 0.5, rate: 50 }], status: 'Sent', amountPaid: 0, payments: [], notes: '', sentLog: [{ type: 'email', to: 'amy.walker@business.com', date: d(9) }] },
        { id: 13, invoiceNum: 'INV-1013', jobId: null, customerId: 2, date: d(6), dueDate: d(8), items: [{ description: 'Oil Filter (Standard)', qty: 2, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 2, rate: 54.99 }, { description: 'Labour — Oil Change (x2)', qty: 1, rate: 120 }], status: 'Sent', amountPaid: 0, payments: [], notes: 'Fleet oil change — 2 vehicles', sentLog: [{ type: 'email', to: 'sarah.chen@gmail.com', date: d(6) }] },
        { id: 14, invoiceNum: 'INV-1014', jobId: null, customerId: 11, date: d(4), dueDate: d(10), items: [{ description: 'Wiper Blades (Pair)', qty: 2, rate: 22.00 }, { description: 'Labour — Wiper Replacement', qty: 0.5, rate: 60 }], status: 'Draft', amountPaid: 0, payments: [], notes: '2 sets of wipers for both utes', sentLog: [] },
        { id: 15, invoiceNum: 'INV-1015', jobId: null, customerId: 7, date: d(2), dueDate: d(12), items: [{ description: 'Power Steering Fluid (500ml)', qty: 2, rate: 19.99 }, { description: 'Labour — Fluid Top-Up', qty: 0.5, rate: 60 }], status: 'Draft', amountPaid: 0, payments: [], notes: '', sentLog: [] },
    ];
    const s = DB.settings;
    s.nextInvoiceNum = 1016;
    s.nextJobNum = 18;
    s.nextPurchaseOrderNum = 16;
    DB.settings = s;
}

// ---- Utilities ----
function fmt(n) { return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(n); }
function fmtDate(d) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }); }
function calcLineTotal(item) {
    const sub = item.qty * (item.rate || item.price || 0);
    return sub - (sub * (item.discount || 0) / 100);
}
function calcOrderTotal(items) { return items.reduce((s, i) => s + calcLineTotal(i), 0); }
function calcInvoiceSubtotal(items) { return items.reduce((s, i) => s + (i.qty * i.rate), 0); }
function calcTax(subtotal) { return subtotal * (DB.settings.taxRate / 100); }
function getCustomerName(id) { const c = DB.customers.find(c => c.id === id); return c ? escapeHTML(`${c.firstName} ${c.lastName}`) : '—'; }
function getCustomerCompany(id) { const c = DB.customers.find(c => c.id === id); return c ? escapeHTML(c.company) : '—'; }
function getSupplierName(id) { const s = DB.suppliers.find(s => s.id === id); return s ? escapeHTML(s.company) : '—'; }
function getInventoryItem(id) { return DB.inventory.find(i => i.id === id); }

function toast(msg, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas ${icons[type]}"></i><span>${escapeHTML(msg)}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

let currentPage = 'dashboard';
let chartInstances = {};

function emptyState(icon, title, subtitle, btnLabel, btnAction) {
    return `<div class="empty-state"><i class="fas ${icon}"></i><h3>${title}</h3><p>${subtitle}</p>${btnLabel ? `<button class="btn btn-primary" onclick="${btnAction}" style="margin-top:16px"><i class="fas fa-plus"></i> ${btnLabel}</button>` : ''}</div>`;
}

function checkOverdueInvoices() {
    const today = new Date().toISOString().split('T')[0];
    let invoices = DB.invoices;
    let changed = false;
    invoices.forEach(inv => {
        if ((inv.status === 'Sent' || inv.status === 'Draft') && inv.dueDate && inv.dueDate < today) {
            inv.status = 'Overdue';
            changed = true;
        }
    });
    if (changed) DB.invoices = invoices;
}

function destroyCharts() {
    Object.values(chartInstances).forEach(c => c.destroy());
    chartInstances = {};
}

// ---- Navigation ----
function navigateTo(page) {
    if (!canAccessPage(page)) {
        toast('You do not have permission to access ' + page, 'error');
        if (currentPage && canAccessPage(currentPage)) return;
        page = 'dashboard';
    }
    currentPage = page;
    destroyCharts();
    checkOverdueInvoices();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
    document.getElementById('breadcrumb').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    closeQuickAdd();
    const renders = { dashboard: renderDashboard, customers: renderCustomers, suppliers: renderSuppliers, inventory: renderInventory, jobs: renderJobs, orders: renderPurchaseOrders, invoices: renderInvoices, reports: renderReports, settings: renderSettings };
    if (renders[page]) renders[page]();
    updateNotifBadge();
}

document.querySelector('.sidebar-nav').addEventListener('click', e => {
    const item = e.target.closest('.nav-item');
    if (item && item.dataset.page) { e.preventDefault(); navigateTo(item.dataset.page); }
});

// ---- Login ----
function showLoginScreen() {
    _authToken = null;
    localStorage.removeItem('fx_auth_token');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-btn').textContent = 'Sign In';
    document.getElementById('login-btn').disabled = false;
}

document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pw = document.getElementById('login-password').value;
    document.getElementById('login-btn').textContent = 'Loading...';
    document.getElementById('login-btn').disabled = true;
    document.getElementById('login-error').classList.add('hidden');

    (async () => {
        try {
            const resp = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pw })
            });
            const data = await resp.json();
            if (!resp.ok) {
                const err = document.getElementById('login-error');
                err.textContent = data.error || 'Invalid email or password.';
                err.classList.remove('hidden');
                document.getElementById('login-btn').textContent = 'Sign In';
                document.getElementById('login-btn').disabled = false;
                return;
            }
            _authToken = data.token;
            _currentUser = data.user || null;
            localStorage.setItem('fx_auth_token', data.token);

            if (data.user) {
                document.querySelectorAll('.user-avatar, .user-avatar-sm').forEach(el => {
                    el.textContent = data.user.name ? data.user.name.charAt(0).toUpperCase() : 'A';
                });
                const nameEl = document.querySelector('.user-name');
                const roleEl = document.querySelector('.user-role');
                if (nameEl) nameEl.textContent = escapeHTML(data.user.name);
                if (roleEl) roleEl.textContent = escapeHTML(data.user.role);
            }

            const serverAvailable = await DB.detectServer();
            if (serverAvailable) {
                const hasServerData = await DB.syncFromServer();
                if (!hasServerData || !DB.customers.length) {
                    seedData();
                    await DB.syncToServer();
                } else {
                    localStorage.setItem('fx_version', APP_VERSION);
                }
            } else {
                seedData();
            }
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('app-shell').classList.remove('hidden');
            applyRoleRestrictions();
            const st = DB.settings;
            if (st.emailjsPublicKey && typeof emailjs !== 'undefined') {
                emailjs.init(st.emailjsPublicKey);
            }
            if (st.googleMapsApiKey) loadGoogleMaps(st.googleMapsApiKey);
            navigateTo('dashboard');
            if (serverAvailable) toast('Connected to file directory backend', 'success');
        } catch (err) {
            const errEl = document.getElementById('login-error');
            errEl.textContent = 'Cannot connect to server. Please check the server is running.';
            errEl.classList.remove('hidden');
            document.getElementById('login-btn').textContent = 'Sign In';
            document.getElementById('login-btn').disabled = false;
        }
    })();
});

function togglePassword() {
    const inp = document.getElementById('login-password');
    const isHidden = inp.type === 'password';
    inp.type = isHidden ? 'text' : 'password';
    const icon = inp.parentElement.querySelector('.toggle-pw i');
    if (icon) icon.className = isHidden ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ---- Sidebar Toggle ----
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sb.classList.toggle('mobile-open');
    } else {
        sb.classList.toggle('collapsed');
        localStorage.setItem('fx_sidebar_collapsed', sb.classList.contains('collapsed'));
    }
}
(function restoreSidebar() {
    if (localStorage.getItem('fx_sidebar_collapsed') === 'true') {
        document.getElementById('sidebar').classList.add('collapsed');
    }
})();

// ---- Dark Mode ----
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('fx_dark_mode', isDark);
    const icon = document.querySelector('#dark-mode-btn i');
    if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}
(function restoreDarkMode() {
    if (localStorage.getItem('fx_dark_mode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#dark-mode-btn i');
        if (icon) icon.className = 'fas fa-sun';
    }
})();

// ---- Quick Add ----
function showQuickAdd() {
    const perms = getUserPermissions();
    const menu = document.getElementById('quick-add-menu');
    menu.querySelectorAll('a').forEach(a => {
        const onclick = a.getAttribute('onclick') || '';
        if (onclick.includes("'customers'") && !perms.pages.includes('customers')) a.style.display = 'none';
        else if (onclick.includes("'suppliers'") && !perms.pages.includes('suppliers')) a.style.display = 'none';
        else if (onclick.includes("'inventory'") && !perms.pages.includes('inventory')) a.style.display = 'none';
        else if (onclick.includes("'jobs'") && !perms.pages.includes('jobs')) a.style.display = 'none';
        else if (onclick.includes("'orders'") && !perms.pages.includes('orders')) a.style.display = 'none';
        else if (onclick.includes("'invoices'") && !perms.pages.includes('invoices')) a.style.display = 'none';
        else a.style.display = '';
    });
    menu.classList.toggle('hidden');
}
function closeQuickAdd() { document.getElementById('quick-add-menu').classList.add('hidden'); }
function showNotifications() {
    const lowStock = DB.inventory.filter(i => i.status !== 'In Stock');
    const overdue = DB.invoices.filter(i => i.status === 'Overdue');
    const sent = DB.invoices.filter(i => i.status === 'Sent');
    const items = [];
    lowStock.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('inventory')" style="cursor:pointer"><div class="alert-dot ${i.status==='Out of Stock'?'red':'amber'}"></div><div class="alert-text"><strong>${escapeHTML(i.name)}</strong> — ${escapeHTML(i.status)} (${i.quantity} left)</div></div>`));
    overdue.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('invoices')" style="cursor:pointer"><div class="alert-dot red"></div><div class="alert-text"><strong>${escapeHTML(i.invoiceNum)}</strong> overdue — ${getCustomerName(i.customerId)}</div></div>`));
    sent.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('invoices')" style="cursor:pointer"><div class="alert-dot blue"></div><div class="alert-text"><strong>${escapeHTML(i.invoiceNum)}</strong> awaiting payment — ${getCustomerName(i.customerId)}</div></div>`));
    const pendingPOs = DB.orders.filter(o => o.type === 'Purchase' && o.status === 'Ordered');
    pendingPOs.forEach(o => items.push(`<div class="alert-item" onclick="closeModal();_activeOrderTab='Purchase';navigateTo('orders')" style="cursor:pointer"><div class="alert-dot blue"></div><div class="alert-text"><strong>${escapeHTML(o.orderNum)}</strong> — awaiting delivery from ${getSupplierName(o.supplierId)}</div></div>`));
    if (!items.length) {
        openModal('Notifications', '<p style="color:#64748B;text-align:center;padding:20px">No notifications</p>', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    } else {
        openModal('Notifications', items.join(''), '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    }
}
function toggleUserMenu() {
    openModal('Account', `
        <div style="text-align:center;padding:12px 0">
            <div class="user-avatar" style="width:56px;height:56px;font-size:22px;margin:0 auto 12px">${escapeHTML((_currentUser && _currentUser.name ? _currentUser.name.charAt(0) : 'A').toUpperCase())}</div>
            <h3>${escapeHTML(_currentUser ? _currentUser.name : 'Admin User')}</h3>
            <p style="color:#64748B;font-size:13px">${escapeHTML(_currentUser ? _currentUser.email : '')}</p>
            <p style="margin-top:4px"><span class="badge badge-sent">${escapeHTML(_currentUser ? _currentUser.role : 'Administrator')}</span></p>
        </div>`,
        `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
         <button class="btn btn-danger" onclick="closeModal();logoutUser()"><i class="fas fa-sign-out-alt"></i> Log Out</button>`
    );
}

let _currentUser = null;

async function logoutUser() {
    try {
        await fetch('/api/logout', { method: 'POST', headers: authHeaders() });
    } catch { /* ignore */ }
    _authToken = null;
    _currentUser = null;
    localStorage.removeItem('fx_auth_token');
    showLoginScreen();
    toast('Logged out successfully');
}
document.addEventListener('click', e => {
    if (!e.target.closest('#quick-add-btn') && !e.target.closest('#quick-add-menu')) closeQuickAdd();
});

// ---- Drawer ----
function openDrawer(type, data = null) {
    const overlay = document.getElementById('drawer-overlay');
    const drawer = document.getElementById('drawer');
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    setTimeout(() => drawer.classList.add('open'), 10);
    const renders = { customer: renderCustomerForm, supplier: renderSupplierForm, inventory: renderInventoryForm, job: renderJobForm, jobDetail: renderJobDetail, purchaseOrder: renderPurchaseOrderForm, invoice: renderInvoiceForm, payment: renderPaymentForm, orderDetail: renderOrderDetail, invoiceDetail: renderInvoiceDetail };
    if (renders[type]) renders[type](data);
}
function closeDrawer() {
    const drawer = document.getElementById('drawer');
    drawer.classList.remove('open');
    setTimeout(() => {
        drawer.classList.add('hidden');
        document.getElementById('drawer-overlay').classList.add('hidden');
    }, 300);
}

// ---- Modal ----
function openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml;
    document.getElementById('modal-overlay').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

// ============================================
//  DASHBOARD
// ============================================
function renderDashboard() {
    const jobs = DB.jobs;
    const invoices = DB.invoices;
    const inventory = DB.inventory;

    const totalRevenue = invoices.reduce((s, inv) => s + calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items)), 0);
    const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, inv) => {
        const total = calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items));
        return s + total - inv.amountPaid;
    }, 0);
    const activeJobs = jobs.filter(j => j.status === 'In Progress' || j.status === 'Draft').length;
    const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
    const grossProfit = invoices.filter(i => i.status === 'Paid').reduce((s, inv) => {
        return s + inv.items.reduce((is, li) => {
            const item = DB.inventory.find(x => x.name === li.description);
            const cost = item ? item.costPrice * li.qty : 0;
            return is + (li.qty * li.rate) - cost;
        }, 0);
    }, 0);

    // Calculate actual month-over-month trends
    const { revenue: last2 } = getMonthlyRevenue(2);
    const revTrend = last2[0] > 0 ? (((last2[1] - last2[0]) / last2[0]) * 100).toFixed(1) : 0;
    const revTrendUp = parseFloat(revTrend) >= 0;

    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card" onclick="navigateTo('invoices')">
                <div class="kpi-top">
                    <div class="kpi-icon blue"><i class="fas fa-dollar-sign"></i></div>
                    ${parseFloat(revTrend) !== 0 ? `<div class="kpi-trend ${revTrendUp?'up':'down'}"><i class="fas fa-arrow-${revTrendUp?'up':'down'}"></i> ${Math.abs(revTrend)}%</div>` : ''}
                </div>
                <div class="kpi-value">${fmt(totalRevenue)}</div>
                <div class="kpi-label">Total Revenue</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('invoices')">
                <div class="kpi-top">
                    <div class="kpi-icon amber"><i class="fas fa-file-invoice-dollar"></i></div>
                </div>
                <div class="kpi-value">${fmt(outstanding)}</div>
                <div class="kpi-label">Outstanding Invoices</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('jobs')">
                <div class="kpi-top">
                    <div class="kpi-icon green"><i class="fas fa-wrench"></i></div>
                </div>
                <div class="kpi-value">${activeJobs}</div>
                <div class="kpi-label">Active Jobs</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('inventory')">
                <div class="kpi-top">
                    <div class="kpi-icon red"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="kpi-value">${lowStock}</div>
                <div class="kpi-label">Low Stock Alerts</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('reports')">
                <div class="kpi-top">
                    <div class="kpi-icon green"><i class="fas fa-chart-line"></i></div>
                </div>
                <div class="kpi-value">${fmt(grossProfit)}</div>
                <div class="kpi-label">Gross Profit</div>
            </div>
        </div>
        <div class="chart-grid">
            <div class="card">
                <div class="card-header">
                    <h3>Revenue Overview</h3>
                    <select id="revenue-range" onchange="updateRevenueChart()" style="width:auto;padding:6px 12px;font-size:13px;">
                        <option value="6">Last 6 Months</option>
                        <option value="12" selected>Last 12 Months</option>
                    </select>
                </div>
                <div class="card-body"><div class="chart-container large"><canvas id="revenueChart"></canvas></div></div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Sales by Category</h3></div>
                <div class="card-body"><div class="chart-container large"><canvas id="categoryChart"></canvas></div></div>
            </div>
        </div>
        <div class="bottom-grid">
            <div class="card">
                <div class="card-header"><h3>Recent Jobs</h3><a href="#" onclick="navigateTo('jobs');return false;" class="btn btn-ghost btn-sm">View All</a></div>
                <div class="card-body no-pad">
                    <table>
                        <thead><tr><th>Job</th><th>Customer</th><th>Vehicle</th><th>Total</th><th>Status</th></tr></thead>
                        <tbody>${jobs.slice(-5).reverse().map(j => {
                            const v = j.vehicle||{};
                            const statusClass = j.status.toLowerCase().replace(/\s/g,'-');
                            return `<tr style="cursor:pointer" onclick="navigateTo('jobs')">
                                <td><strong>${escapeHTML(j.jobNum)}</strong></td>
                                <td>${getCustomerName(j.customerId)}</td>
                                <td>${escapeHTML((v.year||'')+' '+(v.make||'')+' '+(v.model||''))}</td>
                                <td>${fmt(calcJobTotal(j))}</td>
                                <td><span class="badge badge-${statusClass==='in-progress'?'processing':statusClass==='invoiced'?'paid':statusClass}">${escapeHTML(j.status)}</span></td>
                            </tr>`;
                        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><h3>Alerts</h3></div>
                <div class="card-body">
                    ${inventory.filter(i => i.status !== 'In Stock').map(i => `
                        <div class="alert-item" onclick="navigateTo('inventory')">
                            <div class="alert-dot ${i.status === 'Out of Stock' ? 'red' : 'amber'}"></div>
                            <div class="alert-text"><strong>${escapeHTML(i.name)}</strong> — ${escapeHTML(i.status)} (${i.quantity} left)</div>
                        </div>`).join('')}
                    ${invoices.filter(i => i.status === 'Overdue').map(i => `
                        <div class="alert-item" onclick="navigateTo('invoices')">
                            <div class="alert-dot red"></div>
                            <div class="alert-text"><strong>${escapeHTML(i.invoiceNum)}</strong> overdue — ${getCustomerName(i.customerId)}</div>
                        </div>`).join('')}
                    ${invoices.filter(i => i.status === 'Sent').map(i => `
                        <div class="alert-item" onclick="navigateTo('invoices')">
                            <div class="alert-dot blue"></div>
                            <div class="alert-text"><strong>${escapeHTML(i.invoiceNum)}</strong> awaiting payment</div>
                        </div>`).join('')}
                    ${DB.orders.filter(o => o.type === 'Purchase' && o.status === 'Ordered').map(o => `
                        <div class="alert-item" onclick="window._orderTab='Purchase';navigateTo('orders')">
                            <div class="alert-dot blue"></div>
                            <div class="alert-text"><strong>${escapeHTML(o.orderNum)}</strong> — awaiting delivery from ${getSupplierName(o.supplierId)}</div>
                        </div>`).join('')}
                </div>
            </div>
        </div>
    `;
    renderRevenueChart();
    renderCategoryChart();
}

function getMonthlyRevenue(monthCount) {
    const invoices = DB.invoices;
    const now = new Date();
    const labels = [];
    const revenue = [];
    for (let i = monthCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-AU', { month: 'short' });
        labels.push(label);
        const monthInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.date + 'T00:00:00');
            return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
        });
        const total = monthInvoices.reduce((s, inv) => s + calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items)), 0);
        revenue.push(Math.round(total * 100) / 100);
    }
    return { labels, revenue };
}
function renderRevenueChart() {
    const { labels: months, revenue } = getMonthlyRevenue(12);
    const avgRev = revenue.reduce((s, v) => s + v, 0) / revenue.length;
    const target = revenue.map(() => Math.round(avgRev));
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    chartInstances.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Revenue', data: revenue, backgroundColor: 'rgba(37,99,235,0.8)', borderRadius: 6, barPercentage: 0.6 },
                { label: 'Target', data: target, type: 'line', borderColor: '#F59E0B', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + (v/1000) + 'k' }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
}
function updateRevenueChart() {
    const range = parseInt(document.getElementById('revenue-range').value);
    if (chartInstances.revenue) { chartInstances.revenue.destroy(); delete chartInstances.revenue; }
    const { labels: months, revenue } = getMonthlyRevenue(range);
    const avgRev = revenue.reduce((s, v) => s + v, 0) / revenue.length;
    const target = revenue.map(() => Math.round(avgRev));
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    chartInstances.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: 'Revenue', data: revenue, backgroundColor: 'rgba(37,99,235,0.8)', borderRadius: 6, barPercentage: 0.6 },
                { label: 'Target', data: target, type: 'line', borderColor: '#F59E0B', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$' + (v/1000) + 'k' }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
}

function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    const inv = DB.inventory;
    const cats = [...new Set(inv.map(i => i.category))];
    const values = cats.map(c => inv.filter(i => i.category === c).reduce((s, i) => s + i.quantity * i.unitPrice, 0));
    const colors = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#0EA5E9'];
    chartInstances.category = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: cats, datasets: [{ data: values, backgroundColor: colors.slice(0, cats.length), borderWidth: 0, hoverOffset: 8 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } }
    });
}

// ============================================
//  CUSTOMERS
// ============================================
function renderCustomers() {
    const customers = DB.customers;
    const perms = getUserPermissions();
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Customers <span class="record-count">${customers.length}</span></h1><p>Manage your customer database</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'customers\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('customer')"><i class="fas fa-plus"></i> Add Customer</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search customers..." onkeyup="filterTable(this,'customers-table')"></div>
            <select onchange="filterStatus(this,'customers-table')"><option value="">All Status</option><option>Active</option><option>Inactive</option></select>
        </div>
        ${customers.length ? `<div class="card"><div class="card-body no-pad"><div class="table-wrapper">
                <table id="customers-table">
                    <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Orders</th><th>Total Spent</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>${customers.map(c => {
                        const orders = DB.orders.filter(o => o.type === 'Sales' && o.customerId === c.id);
                        const spent = DB.invoices.filter(i => i.customerId === c.id).reduce((s, inv) => s + calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items)), 0);
                        return `<tr data-status="${escapeHTML(c.status)}">
                            <td>#${c.id}</td>
                            <td><strong>${escapeHTML(c.firstName)} ${escapeHTML(c.lastName)}</strong></td>
                            <td>${escapeHTML(c.email)}</td><td>${escapeHTML(c.phone)}</td><td>${escapeHTML(c.company)}</td>
                            <td>${orders.length}</td><td>${fmt(spent)}</td>
                            <td><span class="badge badge-${escapeHTML(c.status).toLowerCase()}">${escapeHTML(c.status)}</span></td>
                            <td><div class="table-actions">
                                <button onclick="openDrawer('customer',${c.id})" title="Edit"><i class="fas fa-pen"></i></button>
                                ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('customers',${c.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                            </div></td>
                        </tr>`;
                    }).join('')}</tbody>
                </table>
            </div></div></div>` : `<div class="card"><div class="card-body">${emptyState('fa-users','No customers yet','Add your first customer to get started','Add Customer',"openDrawer('customer')")}</div></div>`}`;
}

function renderCustomerForm(id) {
    const c = id ? DB.customers.find(x => x.id === id) : null;
    document.getElementById('drawer-title').textContent = c ? 'Edit Customer' : 'New Customer';
    document.getElementById('drawer-body').innerHTML = `
        <form id="customer-form">
            <div class="form-row">
                <div class="form-group"><label>First Name *</label><input type="text" id="cf-first" value="${c ? c.firstName : ''}" required></div>
                <div class="form-group"><label>Last Name *</label><input type="text" id="cf-last" value="${c ? c.lastName : ''}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Email *</label><input type="email" id="cf-email" value="${c ? c.email : ''}" required></div>
                <div class="form-group"><label>Phone</label><input type="tel" id="cf-phone" value="${c ? c.phone : ''}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Company</label><input type="text" id="cf-company" value="${c ? c.company : ''}"></div>
                <div class="form-group"><label>ABN</label><input type="text" id="cf-abn" value="${c ? c.abn : ''}"></div>
            </div>
            <h4 style="margin:16px 0 8px">Billing Address</h4>
            ${addressFieldsHTML('cf-bill', c ? c.billingAddress : '')}
            <div class="form-group">
                <label><input type="checkbox" id="cf-same" checked onchange="document.querySelectorAll('[id^=cf-ship]').forEach(el=>{if(el.tagName==='INPUT'||el.tagName==='SELECT')el.disabled=this.checked})"> Shipping same as billing</label>
            </div>
            <h4 style="margin:8px 0 8px">Shipping Address</h4>
            ${addressFieldsHTML('cf-ship', c ? c.shippingAddress : '')}
            <div class="form-row">
                <div class="form-group"><label>Status</label><select id="cf-status"><option ${c && c.status==='Active'?'selected':''}>Active</option><option ${c && c.status==='Inactive'?'selected':''}>Inactive</option></select></div>
            </div>
            <div class="form-group"><label>Notes</label><textarea id="cf-notes">${c ? c.notes : ''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${c ? 'Update' : 'Create'} Customer</button>
            </div>
        </form>`;
    attachAddressAutocomplete('cf-bill');
    attachAddressAutocomplete('cf-ship');
    if (document.getElementById('cf-same').checked) {
        document.querySelectorAll('[id^=cf-ship]').forEach(el => { if (el.tagName==='INPUT'||el.tagName==='SELECT') el.disabled = true; });
    }
    document.getElementById('customer-form').addEventListener('submit', e => {
        e.preventDefault();
        const billingAddr = getAddressValue('cf-bill');
        const data = {
            id: c ? c.id : DB.nextId(DB.customers),
            firstName: document.getElementById('cf-first').value,
            lastName: document.getElementById('cf-last').value,
            email: document.getElementById('cf-email').value,
            phone: document.getElementById('cf-phone').value,
            company: document.getElementById('cf-company').value,
            abn: document.getElementById('cf-abn').value,
            billingAddress: billingAddr,
            shippingAddress: document.getElementById('cf-same').checked ? billingAddr : getAddressValue('cf-ship'),
            status: document.getElementById('cf-status').value,
            notes: document.getElementById('cf-notes').value,
            created: c ? c.created : new Date().toISOString().split('T')[0]
        };
        let arr = DB.customers;
        if (c) { const idx = arr.findIndex(x => x.id === c.id); arr[idx] = data; }
        else arr.push(data);
        DB.customers = arr;
        closeDrawer();
        toast(c ? 'Customer updated successfully' : `Customer '${data.firstName} ${data.lastName}' created`);
        renderCustomers();
    });
}

// ============================================
//  SUPPLIERS
// ============================================
function renderSuppliers() {
    const suppliers = DB.suppliers;
    const perms = getUserPermissions();
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Suppliers <span class="record-count">${suppliers.length}</span></h1><p>Manage your vendor relationships</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'suppliers\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('supplier')"><i class="fas fa-plus"></i> Add Supplier</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search suppliers..." onkeyup="filterTable(this,'suppliers-table')"></div>
            <select onchange="filterStatus(this,'suppliers-table')"><option value="">All Status</option><option>Active</option><option>Inactive</option></select>
        </div>
        ${suppliers.length ? `<div class="card"><div class="card-body no-pad"><div class="table-wrapper">
            <table id="suppliers-table">
                <thead><tr><th>ID</th><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Category</th><th>Terms</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${suppliers.map(s => `<tr data-status="${escapeHTML(s.status)}">
                    <td>#${s.id}</td><td><strong>${escapeHTML(s.company)}</strong></td><td>${escapeHTML(s.contact)}</td>
                    <td>${escapeHTML(s.email)}</td><td>${escapeHTML(s.phone)}</td>
                    <td><span class="badge badge-sent">${escapeHTML(s.category)}</span></td>
                    <td>Net ${s.paymentTerms}</td>
                    <td><span class="badge badge-${escapeHTML(s.status).toLowerCase()}">${escapeHTML(s.status)}</span></td>
                    <td><div class="table-actions">
                        <button onclick="openDrawer('supplier',${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('suppliers',${s.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                    </div></td>
                </tr>`).join('')}</tbody>
            </table>
        </div></div></div>` : `<div class="card"><div class="card-body">${emptyState('fa-truck','No suppliers yet','Add your first supplier to manage vendor relationships','Add Supplier',"openDrawer('supplier')")}</div></div>`}`;
}

function renderSupplierForm(id) {
    const s = id ? DB.suppliers.find(x => x.id === id) : null;
    document.getElementById('drawer-title').textContent = s ? 'Edit Supplier' : 'New Supplier';
    document.getElementById('drawer-body').innerHTML = `
        <form id="supplier-form">
            <div class="form-group"><label>Company Name *</label><input type="text" id="sf-company" value="${s?s.company:''}" required></div>
            <div class="form-row">
                <div class="form-group"><label>Contact Person *</label><input type="text" id="sf-contact" value="${s?s.contact:''}" required></div>
                <div class="form-group"><label>Email *</label><input type="email" id="sf-email" value="${s?s.email:''}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Phone</label><input type="tel" id="sf-phone" value="${s?s.phone:''}"></div>
                <div class="form-group"><label>ABN</label><input type="text" id="sf-abn" value="${s?s.abn:''}"></div>
            </div>
            <h4 style="margin:8px 0 8px">Address</h4>
            ${addressFieldsHTML('sf-addr', s ? s.address : '')}
            <div class="form-row">
                <div class="form-group"><label>Category</label><select id="sf-category">
                    ${['Engine Parts','Brakes & Filters','Fluids & Oils','Electrical','Tyres'].map(c=>`<option ${s&&s.category===c?'selected':''}>${c}</option>`).join('')}
                </select></div>
                <div class="form-group"><label>Payment Terms</label><select id="sf-terms">
                    ${[15,30,60].map(t=>`<option value="${t}" ${s&&s.paymentTerms===t?'selected':''}>Net ${t}</option>`).join('')}
                </select></div>
            </div>
            <div class="form-group"><label>Status</label><select id="sf-status"><option ${s&&s.status==='Active'?'selected':''}>Active</option><option ${s&&s.status==='Inactive'?'selected':''}>Inactive</option></select></div>
            <div class="form-group"><label>Notes</label><textarea id="sf-notes">${s?s.notes:''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${s?'Update':'Create'} Supplier</button>
            </div>
        </form>`;
    attachAddressAutocomplete('sf-addr');
    document.getElementById('supplier-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            id: s ? s.id : DB.nextId(DB.suppliers),
            company: document.getElementById('sf-company').value,
            contact: document.getElementById('sf-contact').value,
            email: document.getElementById('sf-email').value,
            phone: document.getElementById('sf-phone').value,
            abn: document.getElementById('sf-abn').value,
            address: getAddressValue('sf-addr'),
            category: document.getElementById('sf-category').value,
            paymentTerms: parseInt(document.getElementById('sf-terms').value),
            status: document.getElementById('sf-status').value,
            notes: document.getElementById('sf-notes').value
        };
        let arr = DB.suppliers;
        if (s) { const idx = arr.findIndex(x => x.id === s.id); arr[idx] = data; }
        else arr.push(data);
        DB.suppliers = arr;
        closeDrawer(); toast(s ? 'Supplier updated' : `Supplier '${data.company}' created`); renderSuppliers();
    });
}

// ============================================
//  INVENTORY
// ============================================
function renderInventory() {
    const items = DB.inventory;
    const perms = getUserPermissions();
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Inventory <span class="record-count">${items.length}</span></h1><p>Track products and stock levels</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'inventory\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('inventory')"><i class="fas fa-plus"></i> Add Item</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search inventory..." onkeyup="filterTable(this,'inventory-table')"></div>
            <select onchange="filterByAttr(this,'inventory-table','data-stock')"><option value="">All Stock Status</option><option value="In Stock">In Stock</option><option value="Low Stock">Low Stock</option><option value="Out of Stock">Out of Stock</option></select>
            <select onchange="filterByAttr(this,'inventory-table','data-cat')"><option value="">All Categories</option>${[...new Set(items.map(i=>i.category))].map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div class="card"><div class="card-body no-pad"><div class="table-wrapper">
            <table id="inventory-table">
                <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Supplier</th><th>Cost</th><th>Retail</th><th>In Stock</th><th>Incoming</th><th>Reorder</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${items.map(i => {
                    const incoming = getIncomingStock(i.id);
                    return `<tr data-status="${escapeHTML(i.status)}" data-stock="${escapeHTML(i.status)}" data-cat="${escapeHTML(i.category)}" class="${i.status==='Out of Stock'?'row-danger':''}">
                    <td><code>${escapeHTML(i.sku)}</code></td><td><strong>${escapeHTML(i.name)}</strong></td><td>${escapeHTML(i.category)}</td>
                    <td>${getSupplierName(i.supplierId)}</td>
                    <td>${fmt(i.costPrice)}</td><td>${fmt(i.unitPrice)}</td>
                    <td><strong>${i.quantity}</strong></td>
                    <td>${incoming ? `<span style="color:#16A34A;font-weight:600">+${incoming}</span>` : '<span style="color:#CBD5E1">—</span>'}</td>
                    <td>${i.reorderLevel}</td>
                    <td><span class="badge badge-${i.status.toLowerCase().replace(/\s/g,'-')}">${i.status}</span></td>
                    <td><div class="table-actions">
                        <button onclick="openDrawer('inventory',${i.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('inventory',${i.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                    </div></td>
                </tr>`}).join('')}</tbody>
            </table>
        </div></div></div>`;
}

function renderInventoryForm(id) {
    const i = id ? DB.inventory.find(x => x.id === id) : null;
    const suppliers = DB.suppliers;
    document.getElementById('drawer-title').textContent = i ? 'Edit Item' : 'New Inventory Item';
    document.getElementById('drawer-body').innerHTML = `
        <form id="inventory-form">
            <div class="form-row">
                <div class="form-group"><label>SKU</label><input type="text" id="if-sku" value="${i?i.sku:'FX-'+(1000+DB.inventory.length+1)}" ${i?'readonly':''}></div>
                <div class="form-group"><label>Product Name *</label><input type="text" id="if-name" value="${i?i.name:''}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Category</label><select id="if-cat">
                    ${['Engine Parts','Brakes','Filters','Fluids & Oils','Electrical','Tyres'].map(c=>`<option ${i&&i.category===c?'selected':''}>${c}</option>`).join('')}
                </select></div>
                <div class="form-group"><label>Supplier</label><select id="if-supplier">
                    <option value="">Select...</option>
                    ${suppliers.map(s=>`<option value="${s.id}" ${i&&i.supplierId===s.id?'selected':''}>${s.company}</option>`).join('')}
                </select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Cost Price *</label><input type="number" step="0.01" id="if-cost" value="${i?i.costPrice:''}" required></div>
                <div class="form-group"><label>Unit Price *</label><input type="number" step="0.01" id="if-price" value="${i?i.unitPrice:''}" required></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Quantity</label><input type="number" id="if-qty" value="${i?i.quantity:0}"></div>
                <div class="form-group"><label>Reorder Level</label><input type="number" id="if-reorder" value="${i?i.reorderLevel:10}"></div>
            </div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${i?'Update':'Create'} Item</button>
            </div>
        </form>`;
    document.getElementById('inventory-form').addEventListener('submit', e => {
        e.preventDefault();
        const qty = parseInt(document.getElementById('if-qty').value);
        const reorder = parseInt(document.getElementById('if-reorder').value);
        const data = {
            id: i ? i.id : DB.nextId(DB.inventory),
            sku: document.getElementById('if-sku').value,
            name: document.getElementById('if-name').value,
            category: document.getElementById('if-cat').value,
            supplierId: parseInt(document.getElementById('if-supplier').value) || null,
            costPrice: parseFloat(document.getElementById('if-cost').value),
            unitPrice: parseFloat(document.getElementById('if-price').value),
            quantity: qty,
            reorderLevel: reorder,
            status: qty === 0 ? 'Out of Stock' : qty <= reorder ? 'Low Stock' : 'In Stock'
        };
        let arr = DB.inventory;
        if (i) { const idx = arr.findIndex(x => x.id === i.id); arr[idx] = data; }
        else arr.push(data);
        DB.inventory = arr;
        closeDrawer(); toast(i ? 'Item updated' : `'${data.name}' added to inventory`); renderInventory();
    });
}

// ============================================
//  JOBS
// ============================================
function calcJobPartsTotal(parts) { return parts.reduce((s, p) => s + p.qty * p.price, 0); }
function calcJobLabourTotal(labour) { return labour.reduce((s, l) => s + l.hours * l.rate, 0); }
function calcJobTotal(job) { return calcJobPartsTotal(job.parts) + calcJobLabourTotal(job.labour); }

function renderJobs() {
    const jobs = DB.jobs;
    const perms = getUserPermissions();
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Jobs <span class="record-count">${jobs.length}</span></h1><p>Workshop jobs — service, repair, and maintenance</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'jobs\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('job')"><i class="fas fa-plus"></i> New Job</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search jobs..." onkeyup="filterTable(this,'jobs-table')"></div>
            <select onchange="filterStatus(this,'jobs-table')"><option value="">All Status</option><option>Draft</option><option>In Progress</option><option>Completed</option><option>Invoiced</option></select>
        </div>
        ${jobs.length ? `<div class="card"><div class="card-body no-pad"><div class="table-wrapper">
            <table id="jobs-table">
                <thead><tr><th>Job #</th><th>Date</th><th>Customer</th><th>Vehicle</th><th>Description</th><th>Parts</th><th>Labour</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${jobs.slice().reverse().map(j => {
                    const statusClass = j.status.toLowerCase().replace(/\s/g,'-');
                    const v = j.vehicle || {};
                    return `<tr data-status="${escapeHTML(j.status)}">
                        <td><strong>${escapeHTML(j.jobNum)}</strong></td>
                        <td>${fmtDate(j.date)}</td>
                        <td>${getCustomerName(j.customerId)}</td>
                        <td>${escapeHTML((v.year||'')+' '+(v.make||'')+' '+(v.model||''))}</td>
                        <td>${escapeHTML(j.description||'').substring(0,40)}</td>
                        <td>${fmt(calcJobPartsTotal(j.parts||[]))}</td>
                        <td>${fmt(calcJobLabourTotal(j.labour||[]))}</td>
                        <td><strong>${fmt(calcJobTotal(j))}</strong></td>
                        <td><span class="badge badge-${statusClass==='in-progress'?'processing':statusClass==='invoiced'?'paid':statusClass}">${escapeHTML(j.status)}</span></td>
                        <td><div class="table-actions">
                            <button onclick="openDrawer('jobDetail',${j.id})" title="View"><i class="fas fa-eye"></i></button>
                            ${j.status!=='Invoiced'?`<button onclick="openDrawer('job',${j.id})" title="Edit"><i class="fas fa-pen"></i></button>`:''}
                            ${j.status==='Completed'?`<button onclick="completeAndInvoiceJob(${j.id})" title="Generate Invoice"><i class="fas fa-file-invoice"></i></button>`:''}
                            ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('jobs',${j.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                        </div></td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div></div></div>` : `<div class="card"><div class="card-body">${emptyState('fa-wrench','No jobs yet','Create your first workshop job','New Job',"openDrawer('job')")}</div></div>`}`;
}

function renderJobForm(id) {
    const j = id ? DB.jobs.find(x => x.id === id) : null;
    const customers = DB.customers;
    const items = DB.inventory;
    const v = j ? (j.vehicle || {}) : {};
    document.getElementById('drawer-title').textContent = j ? 'Edit Job' : 'New Job';
    const parts = j ? j.parts : [];
    const labour = j ? j.labour : [];

    document.getElementById('drawer-body').innerHTML = `
        <form id="job-form">
            <div style="padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;color:#8B5CF6;background:#FAF5FF">
                <i class="fas fa-wrench"></i> Workshop Job — parts deducted from stock on completion
            </div>
            <div class="form-group">
                <label>Customer *</label>
                <input type="text" id="jf-customer-search" placeholder="Search by name, email, or phone..." autocomplete="off" value="${j ? (() => { const c = customers.find(c=>c.id===j.customerId); return c ? c.firstName+' '+c.lastName : ''; })() : ''}">
                <input type="hidden" id="jf-customer-id" value="${j ? j.customerId : ''}">
                <div id="jf-customer-results" style="border:1px solid #E2E8F0;border-radius:6px;max-height:150px;overflow-y:auto;display:none;margin-top:4px;"></div>
                <div id="jf-new-customer" style="display:none;margin-top:8px;padding:12px;background:#F0FDF4;border-radius:8px;">
                    <div style="font-size:12px;font-weight:600;color:#16A34A;margin-bottom:8px"><i class="fas fa-user-plus"></i> New Customer</div>
                    <div class="form-row">
                        <div class="form-group"><label>First Name *</label><input type="text" id="jf-nc-first"></div>
                        <div class="form-group"><label>Last Name *</label><input type="text" id="jf-nc-last"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Email</label><input type="email" id="jf-nc-email"></div>
                        <div class="form-group"><label>Phone</label><input type="tel" id="jf-nc-phone"></div>
                    </div>
                </div>
            </div>
            <div class="form-group"><label>Date</label><input type="date" id="jf-date" value="${j ? j.date : new Date().toISOString().split('T')[0]}"></div>
            <h4 style="margin:16px 0 8px">Vehicle</h4>
            <div class="form-row">
                <div class="form-group"><label>Make</label><input type="text" id="jf-vmake" value="${escapeHTML(v.make||'')}" placeholder="e.g. Toyota"></div>
                <div class="form-group"><label>Model</label><input type="text" id="jf-vmodel" value="${escapeHTML(v.model||'')}" placeholder="e.g. Camry"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Year</label><input type="text" id="jf-vyear" value="${escapeHTML(v.year||'')}" placeholder="e.g. 2022"></div>
                <div class="form-group"><label>Rego</label><input type="text" id="jf-vrego" value="${escapeHTML(v.rego||'')}" placeholder="e.g. ABC123"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea id="jf-desc" placeholder="What does the customer need?">${j ? escapeHTML(j.description||'') : ''}</textarea></div>
            <div class="form-group"><label>Status</label><select id="jf-status">
                ${['Draft','In Progress','Completed'].map(s=>`<option ${j&&j.status===s?'selected':''}>${s}</option>`).join('')}
            </select></div>

            <h4 style="margin:16px 0 8px">Parts <span style="font-weight:400;color:#64748B;font-size:12px">(from inventory)</span></h4>
            <div id="job-parts">
                ${parts.map((p,i) => jobPartLineHTML(i, p, items)).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addJobPartLine()" style="margin-top:8px"><i class="fas fa-plus"></i> Add Part</button>

            <h4 style="margin:16px 0 8px">Labour</h4>
            <div id="job-labour">
                ${labour.map((l,i) => jobLabourLineHTML(i, l)).join('')}
            </div>
            <div style="display:flex;gap:8px;margin-top:8px">
                <select id="jf-labour-preset" style="font-size:13px;padding:6px 10px;flex:1">
                    <option value="">Add preset service...</option>
                    ${LABOUR_PRESETS.map((p,i) => `<option value="${i}">${escapeHTML(p.description)} — ${p.hours}hr @ ${fmt(p.rate)}/hr</option>`).join('')}
                </select>
                <button type="button" class="btn btn-ghost btn-sm" onclick="addJobLabourPreset()"><i class="fas fa-plus"></i></button>
                <button type="button" class="btn btn-ghost btn-sm" onclick="addJobLabourLine()"><i class="fas fa-plus"></i> Custom</button>
            </div>

            <div class="totals-section" style="margin-top:16px">
                <table class="totals-table">
                    <tr><td>Parts</td><td id="job-parts-total">${fmt(0)}</td></tr>
                    <tr><td>Labour</td><td id="job-labour-total">${fmt(0)}</td></tr>
                    <tr><td>Subtotal</td><td id="job-subtotal">${fmt(0)}</td></tr>
                    <tr><td>GST (${DB.settings.taxRate}%)</td><td id="job-tax">${fmt(0)}</td></tr>
                    <tr class="grand-total"><td>Total</td><td id="job-total">${fmt(0)}</td></tr>
                </table>
            </div>
            <div class="form-group" style="margin-top:16px"><label>Notes</label><textarea id="jf-notes">${j ? escapeHTML(j.notes||'') : ''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;flex-wrap:wrap;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${j ? 'Update' : 'Create'} Job</button>
                ${j && j.status !== 'Invoiced' ? '<button type="button" class="btn btn-success" onclick="completeAndInvoiceJob('+j.id+')"><i class="fas fa-file-invoice"></i> Complete & Invoice</button>' : ''}
            </div>
        </form>`;

    recalcJob();
    setupCustomerSearch();

    document.getElementById('job-form').addEventListener('submit', e => {
        e.preventDefault();
        let customerId = parseInt(document.getElementById('jf-customer-id').value);
        if (!customerId) {
            const first = (document.getElementById('jf-nc-first').value||'').trim();
            const last = (document.getElementById('jf-nc-last').value||'').trim();
            if (!first || !last) { toast('Select an existing customer or fill in new customer name', 'error'); return; }
            const newCust = {
                id: DB.nextId(DB.customers), firstName: first, lastName: last,
                email: (document.getElementById('jf-nc-email').value||'').trim(),
                phone: (document.getElementById('jf-nc-phone').value||'').trim(),
                company: '', abn: '', billingAddress: '', shippingAddress: '',
                status: 'Active', notes: '', created: new Date().toISOString().split('T')[0]
            };
            let custs = DB.customers; custs.push(newCust); DB.customers = custs;
            customerId = newCust.id;
            toast(`Customer '${first} ${last}' created`);
        }
        const partsData = [];
        document.querySelectorAll('.job-part-row').forEach(row => {
            const invId = parseInt(row.querySelector('.jp-product').value);
            const qty = parseInt(row.querySelector('.jp-qty').value);
            const price = parseFloat(row.querySelector('.jp-price').value);
            if (invId && qty) partsData.push({ inventoryId: invId, qty, price });
        });
        const labourData = [];
        document.querySelectorAll('.job-labour-row').forEach(row => {
            const desc = row.querySelector('.jl-desc').value.trim();
            const hours = parseFloat(row.querySelector('.jl-hours').value);
            const rate = parseFloat(row.querySelector('.jl-rate').value);
            if (desc && hours && rate) labourData.push({ description: desc, hours, rate });
        });
        const settings = DB.settings;
        const data = {
            id: j ? j.id : DB.nextId(DB.jobs),
            jobNum: j ? j.jobNum : `JOB-${String(settings.nextJobNum || 1).padStart(4,'0')}`,
            date: document.getElementById('jf-date').value,
            customerId,
            vehicle: { make: document.getElementById('jf-vmake').value, model: document.getElementById('jf-vmodel').value, year: document.getElementById('jf-vyear').value, rego: document.getElementById('jf-vrego').value },
            description: document.getElementById('jf-desc').value,
            parts: partsData, labour: labourData,
            status: document.getElementById('jf-status').value,
            notes: document.getElementById('jf-notes').value
        };
        let arr = DB.jobs;
        if (j) { const idx = arr.findIndex(x => x.id === j.id); arr[idx] = data; }
        else { arr.push(data); settings.nextJobNum = (settings.nextJobNum || 1) + 1; DB.settings = settings; }
        DB.jobs = arr;
        closeDrawer(); toast(j ? 'Job updated' : `Job ${data.jobNum} created`); renderJobs();
    });
}

function setupCustomerSearch() {
    const input = document.getElementById('jf-customer-search');
    const results = document.getElementById('jf-customer-results');
    const hiddenId = document.getElementById('jf-customer-id');
    const newCustDiv = document.getElementById('jf-new-customer');
    input.addEventListener('input', function() {
        const q = this.value.toLowerCase().trim();
        hiddenId.value = '';
        if (q.length < 2) { results.style.display = 'none'; newCustDiv.style.display = 'none'; return; }
        const matches = DB.customers.filter(c =>
            `${c.firstName} ${c.lastName} ${c.email} ${c.phone} ${c.company}`.toLowerCase().includes(q)
        ).slice(0, 5);
        let html = matches.map(c =>
            `<div style="padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid #F1F5F9" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background=''" onclick="selectJobCustomer(${c.id},'${escapeHTML(c.firstName+' '+c.lastName)}')">
                <strong>${escapeHTML(c.firstName)} ${escapeHTML(c.lastName)}</strong> ${c.company?'— '+escapeHTML(c.company):''}<br><span style="color:#64748B;font-size:12px">${escapeHTML(c.email)} ${escapeHTML(c.phone)}</span>
            </div>`
        ).join('');
        html += `<div style="padding:8px 12px;cursor:pointer;font-size:13px;color:#16A34A;font-weight:600" onmouseover="this.style.background='#F0FDF4'" onmouseout="this.style.background=''" onclick="showNewCustomerFields()">
            <i class="fas fa-user-plus"></i> Create new customer
        </div>`;
        results.innerHTML = html;
        results.style.display = '';
    });
    input.addEventListener('blur', () => setTimeout(() => { results.style.display = 'none'; }, 200));
}
function selectJobCustomer(id, name) {
    document.getElementById('jf-customer-id').value = id;
    document.getElementById('jf-customer-search').value = name;
    document.getElementById('jf-customer-results').style.display = 'none';
    document.getElementById('jf-new-customer').style.display = 'none';
}
function showNewCustomerFields() {
    document.getElementById('jf-customer-results').style.display = 'none';
    document.getElementById('jf-new-customer').style.display = '';
    document.getElementById('jf-nc-first').focus();
}

function jobPartLineHTML(idx, p, items) {
    return `<div class="job-part-row" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
        <div><label style="font-size:12px">Part</label><select class="jp-product" onchange="onJobPartSelect(this)" style="font-size:13px;padding:8px">
            <option value="">Select...</option>
            ${items.map(i=>`<option value="${i.id}" ${p.inventoryId===i.id?'selected':''}>${escapeHTML(i.name)} (${i.quantity} in stock)</option>`).join('')}
        </select></div>
        <div><label style="font-size:12px">Qty</label><input type="number" class="jp-qty" value="${p.qty||1}" min="1" onchange="recalcJob()" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Price</label><input type="number" step="0.01" class="jp-price" value="${p.price||0}" onchange="recalcJob()" style="font-size:13px;padding:8px"></div>
        <button type="button" onclick="this.parentElement.remove();recalcJob()" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:8px;font-size:14px;margin-bottom:4px;"><i class="fas fa-times"></i></button>
    </div>`;
}
function addJobPartLine() {
    const div = document.createElement('div');
    div.innerHTML = jobPartLineHTML(0, {}, DB.inventory);
    document.getElementById('job-parts').appendChild(div.firstElementChild);
}
function onJobPartSelect(sel) {
    const item = getInventoryItem(parseInt(sel.value));
    if (item) {
        const row = sel.closest('.job-part-row');
        row.querySelector('.jp-price').value = item.unitPrice;
        recalcJob();
    }
}

function jobLabourLineHTML(idx, l) {
    return `<div class="job-labour-row" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
        <div><label style="font-size:12px">Description</label><input type="text" class="jl-desc" value="${escapeHTML(l.description||'')}" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Hours</label><input type="number" step="0.5" class="jl-hours" value="${l.hours||1}" min="0.5" onchange="recalcJob()" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Rate ($/hr)</label><input type="number" step="1" class="jl-rate" value="${l.rate||0}" onchange="recalcJob()" style="font-size:13px;padding:8px"></div>
        <button type="button" onclick="this.parentElement.remove();recalcJob()" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:8px;font-size:14px;margin-bottom:4px;"><i class="fas fa-times"></i></button>
    </div>`;
}
function addJobLabourLine() {
    const div = document.createElement('div');
    div.innerHTML = jobLabourLineHTML(0, {});
    document.getElementById('job-labour').appendChild(div.firstElementChild);
}
function addJobLabourPreset() {
    const sel = document.getElementById('jf-labour-preset');
    const idx = parseInt(sel.value);
    if (isNaN(idx)) return;
    const preset = LABOUR_PRESETS[idx];
    const div = document.createElement('div');
    div.innerHTML = jobLabourLineHTML(0, preset);
    document.getElementById('job-labour').appendChild(div.firstElementChild);
    sel.value = '';
    recalcJob();
}

function recalcJob() {
    let partsTotal = 0, labourTotal = 0;
    document.querySelectorAll('.job-part-row').forEach(row => {
        partsTotal += (parseFloat(row.querySelector('.jp-qty').value)||0) * (parseFloat(row.querySelector('.jp-price').value)||0);
    });
    document.querySelectorAll('.job-labour-row').forEach(row => {
        labourTotal += (parseFloat(row.querySelector('.jl-hours').value)||0) * (parseFloat(row.querySelector('.jl-rate').value)||0);
    });
    const sub = partsTotal + labourTotal;
    const tax = calcTax(sub);
    const el = (id) => document.getElementById(id);
    if (el('job-parts-total')) el('job-parts-total').textContent = fmt(partsTotal);
    if (el('job-labour-total')) el('job-labour-total').textContent = fmt(labourTotal);
    if (el('job-subtotal')) el('job-subtotal').textContent = fmt(sub);
    if (el('job-tax')) el('job-tax').textContent = fmt(tax);
    if (el('job-total')) el('job-total').textContent = fmt(sub + tax);
}

function renderJobDetail(id) {
    const j = typeof id === 'object' ? id : DB.jobs.find(x => x.id === id);
    if (!j) return;
    const v = j.vehicle || {};
    const customer = DB.customers.find(c => c.id === j.customerId);
    const partsTotal = calcJobPartsTotal(j.parts||[]);
    const labourTotal = calcJobLabourTotal(j.labour||[]);
    const sub = partsTotal + labourTotal;
    const tax = calcTax(sub);
    const steps = ['Draft','In Progress','Completed','Invoiced'];
    const stepIdx = steps.indexOf(j.status);
    document.getElementById('drawer-title').textContent = j.jobNum;
    document.getElementById('drawer-body').innerHTML = `
        <div style="padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;color:#8B5CF6;background:#FAF5FF">
            <i class="fas fa-wrench"></i> Workshop Job
        </div>
        <div class="status-timeline" style="margin-bottom:24px;padding:16px;background:#F8FAFC;border-radius:8px;">
            ${steps.map((s,i) => `
                <div class="timeline-step ${i<stepIdx?'completed':''} ${i===stepIdx?'active':''}">
                    <div class="step-dot">${i<stepIdx?'<i class="fas fa-check"></i>':(i+1)}</div>
                    <span>${s}</span>
                </div>
                ${i<steps.length-1?`<div class="timeline-line ${i<stepIdx?'completed':''}"></div>`:''}
            `).join('')}
        </div>
        <div class="detail-field"><label>Date</label><span>${fmtDate(j.date)}</span></div>
        <div class="detail-field"><label>Customer</label><span>${customer ? escapeHTML(customer.firstName+' '+customer.lastName) : '—'}</span></div>
        <div class="detail-field"><label>Vehicle</label><span>${escapeHTML([v.year,v.make,v.model].filter(Boolean).join(' '))} ${v.rego ? '('+escapeHTML(v.rego)+')' : ''}</span></div>
        <div class="detail-field"><label>Description</label><span>${escapeHTML(j.description||'—')}</span></div>
        ${j.parts && j.parts.length ? `<h4 style="margin:16px 0 8px">Parts</h4>
        <table style="width:100%;font-size:13px">
            <thead><tr><th>Part</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>${j.parts.map(p => { const item = getInventoryItem(p.inventoryId); return `<tr><td>${item?escapeHTML(item.name):'Item #'+p.inventoryId}</td><td>${p.qty}</td><td>${fmt(p.price)}</td><td>${fmt(p.qty*p.price)}</td></tr>`; }).join('')}</tbody>
        </table>` : ''}
        ${j.labour && j.labour.length ? `<h4 style="margin:16px 0 8px">Labour</h4>
        <table style="width:100%;font-size:13px">
            <thead><tr><th>Service</th><th>Hours</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>${j.labour.map(l => `<tr><td>${escapeHTML(l.description)}</td><td>${l.hours}</td><td>${fmt(l.rate)}/hr</td><td>${fmt(l.hours*l.rate)}</td></tr>`).join('')}</tbody>
        </table>` : ''}
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
            <table class="totals-table">
                <tr><td>Parts</td><td>${fmt(partsTotal)}</td></tr>
                <tr><td>Labour</td><td>${fmt(labourTotal)}</td></tr>
                <tr><td>Subtotal</td><td>${fmt(sub)}</td></tr>
                <tr><td>GST (${DB.settings.taxRate}%)</td><td>${fmt(tax)}</td></tr>
                <tr class="grand-total"><td>Total</td><td>${fmt(sub + tax)}</td></tr>
            </table>
        </div>
        ${j.notes?`<div class="detail-field" style="margin-top:16px"><label>Notes</label><span>${escapeHTML(j.notes)}</span></div>`:''}
        <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
            ${j.status==='Draft'?'<button class="btn btn-primary" onclick="changeJobStatus('+j.id+',\'In Progress\')">Start Job</button>':''}
            ${j.status==='In Progress'?'<button class="btn btn-primary" onclick="changeJobStatus('+j.id+',\'Completed\')">Mark Completed</button>':''}
            ${j.status==='Completed'?`<button class="btn btn-success" onclick="completeAndInvoiceJob(${j.id})"><i class="fas fa-file-invoice"></i> Complete & Invoice</button>`:''}
        </div>
    `;
}

function changeJobStatus(id, status) {
    let jobs = DB.jobs;
    const idx = jobs.findIndex(j => j.id === id);
    if (idx === -1) return;
    jobs[idx].status = status;
    DB.jobs = jobs;
    closeDrawer(); toast(`Job ${jobs[idx].jobNum} → ${status}`); renderJobs();
}

function completeAndInvoiceJob(jobId) {
    const jobs = DB.jobs;
    const idx = jobs.findIndex(j => j.id === jobId);
    if (idx === -1) return;
    const j = jobs[idx];
    if (j.status === 'Invoiced') { toast('This job is already invoiced', 'warning'); return; }
    const existingInv = DB.invoices.find(i => i.jobId === jobId);
    if (existingInv) { toast(`Invoice ${existingInv.invoiceNum} already exists for this job`, 'warning'); return; }

    // Deduct parts from inventory
    let inv = DB.inventory;
    (j.parts||[]).forEach(p => {
        const ii = inv.findIndex(x => x.id === p.inventoryId);
        if (ii !== -1) {
            inv[ii].quantity = Math.max(0, inv[ii].quantity - p.qty);
            inv[ii].status = inv[ii].quantity === 0 ? 'Out of Stock' : inv[ii].quantity <= inv[ii].reorderLevel ? 'Low Stock' : 'In Stock';
        }
    });
    DB.inventory = inv;

    // Generate invoice
    const settings = DB.settings;
    const invoiceItems = [];
    (j.parts||[]).forEach(p => {
        const item = getInventoryItem(p.inventoryId);
        invoiceItems.push({ description: item ? item.name : 'Part', qty: p.qty, rate: p.price });
    });
    (j.labour||[]).forEach(l => {
        invoiceItems.push({ description: 'Labour — ' + l.description, qty: l.hours, rate: l.rate });
    });
    const newInv = {
        id: DB.nextId(DB.invoices),
        invoiceNum: `${settings.invoicePrefix}-${settings.nextInvoiceNum}`,
        jobId: j.id, orderId: null, customerId: j.customerId,
        date: new Date().toISOString().split('T')[0],
        dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + settings.paymentTerms); return d.toISOString().split('T')[0]; })(),
        items: invoiceItems, status: 'Sent', amountPaid: 0, payments: [],
        notes: `Generated from ${j.jobNum}`, sentLog: []
    };
    let invoices = DB.invoices; invoices.push(newInv); DB.invoices = invoices;
    settings.nextInvoiceNum++; DB.settings = settings;

    // Mark job as Invoiced
    jobs[idx].status = 'Invoiced';
    DB.jobs = jobs;

    // Send notification
    sendInvoiceNotification(newInv.id);
    closeDrawer();
    toast(`Job ${j.jobNum} completed — Invoice ${newInv.invoiceNum} generated & sent`);
    navigateTo('invoices');
}

// ============================================
//  PURCHASE ORDERS
// ============================================

function renderPurchaseOrders() {
    const orders = DB.orders.filter(o => o.type === 'Purchase');
    const perms = getUserPermissions();
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Purchase Orders <span class="record-count">${orders.length}</span></h1>
                <p>Supplier stock orders — cost pricing</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'orders\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('purchaseOrder')"><i class="fas fa-plus"></i> New Purchase Order</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search orders..." onkeyup="filterTable(this,'orders-table')"></div>
            <select onchange="filterStatus(this,'orders-table')"><option value="">All Status</option><option>Draft</option><option>Ordered</option><option>Received</option><option>Cancelled</option></select>
        </div>
        <div class="card"><div class="card-body no-pad"><div class="table-wrapper">
            <table id="orders-table">
                <thead><tr>
                    <th>Order #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total (Cost)</th><th>Status</th><th>Expected</th><th>Actions</th>
                </tr></thead>
                <tbody>${orders.map(o => {
                    const statusClass = o.status.toLowerCase().replace(/\s/g,'-');
                    return `<tr data-status="${escapeHTML(o.status)}">
                    <td><strong>${escapeHTML(o.orderNum)}</strong></td><td>${fmtDate(o.date)}</td>
                    <td>${getSupplierName(o.supplierId)}</td>
                    <td>${o.items.length}</td><td>${fmt(calcOrderTotal(o.items))}</td>
                    <td><span class="badge badge-${statusClass==='ordered'?'sent':statusClass==='received'?'fulfilled':statusClass}">${o.status}</span></td>
                    <td>${fmtDate(o.expectedDate||'')}</td>
                    <td><div class="table-actions">
                        <button onclick="viewOrderDetail(${o.id})" title="View"><i class="fas fa-eye"></i></button>
                        <button onclick="openDrawer('purchaseOrder',${o.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('orders',${o.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                    </div></td>
                </tr>`}).join('')}</tbody>
            </table>
        </div></div></div>`
    ;
}

function getIncomingStock(inventoryId) {
    return DB.orders.filter(o => o.type === 'Purchase' && (o.status === 'Ordered' || o.status === 'Draft'))
        .reduce((total, o) => total + o.items.filter(li => li.inventoryId === inventoryId).reduce((s, li) => s + li.qty, 0), 0);
}

function viewOrderDetail(id) {
    const o = DB.orders.find(x => x.id === id);
    if (!o) return;
    openDrawer('orderDetail', o);
}

function renderOrderDetail(o) {
    const isSales = o.type === 'Sales';
    const steps = isSales ? ['Draft','Pending','Processing','Fulfilled'] : ['Draft','Ordered','Received'];
    const stepIdx = steps.indexOf(o.status);
    const priceLabel = isSales ? 'Retail Price' : 'Cost Price';
    document.getElementById('drawer-title').textContent = o.orderNum + (isSales ? ' (Sales)' : ' (Purchase)');
    document.getElementById('drawer-body').innerHTML = `
        <div style="padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;color:${isSales?'#2563EB':'#16A34A'};background:${isSales?'#EFF6FF':'#F0FDF4'}">
            <i class="fas ${isSales?'fa-shopping-cart':'fa-truck'}"></i> ${isSales ? 'Sales Order — Retail Pricing' : 'Purchase Order — Cost Pricing'}
        </div>
        <div class="status-timeline" style="margin-bottom:24px;padding:16px;background:#F8FAFC;border-radius:8px;">
            ${steps.map((s,i) => `
                <div class="timeline-step ${i<stepIdx?'completed':''} ${i===stepIdx?'active':''}">
                    <div class="step-dot">${i<stepIdx?'<i class="fas fa-check"></i>':(i+1)}</div>
                    <span>${s}</span>
                </div>
                ${i<steps.length-1?`<div class="timeline-line ${i<stepIdx?'completed':''}"></div>`:''}
            `).join('')}
        </div>
        <div class="detail-field"><label>Date</label><span>${fmtDate(o.date)}</span></div>
        ${!isSales&&o.expectedDate?`<div class="detail-field"><label>Expected Delivery</label><span>${fmtDate(o.expectedDate)}</span></div>`:''}
        <div class="detail-field"><label>${isSales?'Customer':'Supplier'}</label><span>${isSales?getCustomerName(o.customerId):getSupplierName(o.supplierId)}</span></div>
        ${isSales?`<div class="detail-field"><label>Payment</label><span class="badge badge-${o.paymentStatus.toLowerCase()}">${o.paymentStatus}</span></div>`:''}
        <h4 style="margin:16px 0 8px">Line Items</h4>
        <table style="width:100%;font-size:13px;">
            <thead><tr><th>Product</th><th>Qty</th><th>${priceLabel}</th><th>Total</th></tr></thead>
            <tbody>${o.items.map(li => {
                const item = getInventoryItem(li.inventoryId);
                return `<tr><td>${item?item.name:'Item #'+li.inventoryId}</td><td>${li.qty}</td><td>${fmt(li.price)}</td><td>${fmt(calcLineTotal(li))}</td></tr>`;
            }).join('')}</tbody>
        </table>
        <div style="text-align:right;margin-top:12px;font-size:16px;font-weight:700;">Total: ${fmt(calcOrderTotal(o.items))}</div>
        ${o.notes?`<div class="detail-field" style="margin-top:16px"><label>Notes</label><span>${escapeHTML(o.notes)}</span></div>`:''}
        <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
            ${isSales ? `
                <button class="btn btn-secondary" onclick="changeOrderStatus(${o.id},'Pending')">Set Pending</button>
                <button class="btn btn-primary" onclick="changeOrderStatus(${o.id},'Processing')">Processing</button>
                <button class="btn btn-success" onclick="changeOrderStatus(${o.id},'Fulfilled')">Fulfil & Deduct Stock</button>
            ` : `
                <button class="btn btn-secondary" onclick="changeOrderStatus(${o.id},'Ordered')">Mark Ordered</button>
                <button class="btn btn-success" onclick="changeOrderStatus(${o.id},'Received')"><i class="fas fa-check"></i> Received — Add to Stock</button>
            `}
        </div>
    `;
}

function changeOrderStatus(id, status) {
    let orders = DB.orders;
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) return;
    const prev = orders[idx].status;
    orders[idx].status = status;
    let inv = DB.inventory;
    if (status === 'Fulfilled' && prev !== 'Fulfilled' && orders[idx].type === 'Sales') {
        orders[idx].items.forEach(li => {
            const ii = inv.findIndex(x => x.id === li.inventoryId);
            if (ii !== -1) {
                inv[ii].quantity = Math.max(0, inv[ii].quantity - li.qty);
                inv[ii].status = inv[ii].quantity === 0 ? 'Out of Stock' : inv[ii].quantity <= inv[ii].reorderLevel ? 'Low Stock' : 'In Stock';
            }
        });
        DB.inventory = inv;
    }
    if (status === 'Received' && prev !== 'Received' && orders[idx].type === 'Purchase') {
        orders[idx].items.forEach(li => {
            const ii = inv.findIndex(x => x.id === li.inventoryId);
            if (ii !== -1) {
                inv[ii].quantity += li.qty;
                inv[ii].status = inv[ii].quantity === 0 ? 'Out of Stock' : inv[ii].quantity <= inv[ii].reorderLevel ? 'Low Stock' : 'In Stock';
            }
        });
        DB.inventory = inv;
    }
    DB.orders = orders;
    const label = status === 'Received' ? `${orders[idx].orderNum} received — stock updated` : `Order ${orders[idx].orderNum} → ${status}`;
    closeDrawer(); toast(label); renderOrders();
}

// ---- Purchase Order Form ----
function renderPurchaseOrderForm(id) {
    const o = id ? DB.orders.find(x => x.id === id) : null;
    const suppliers = DB.suppliers.filter(s => s.status === 'Active');
    const items = DB.inventory;
    document.getElementById('drawer-title').textContent = o ? 'Edit Purchase Order' : 'New Purchase Order';
    const lineItems = o ? o.items : [{ inventoryId: '', qty: 1, price: 0, discount: 0 }];
    const expDate = o && o.expectedDate ? o.expectedDate : (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })();

    document.getElementById('drawer-body').innerHTML = `
        <div style="padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;color:#16A34A;background:#F0FDF4">
            <i class="fas fa-truck"></i> Purchase Order — uses cost pricing, increases stock on receipt
        </div>
        <form id="po-form">
            <div class="form-row">
                <div class="form-group"><label>Supplier *</label><select id="po-supplier" required>
                    <option value="">Select supplier...</option>
                    ${suppliers.map(s=>`<option value="${s.id}" ${o&&o.supplierId===s.id?'selected':''}>${s.company} — ${s.category}</option>`).join('')}
                </select></div>
                <div class="form-group"><label>Order Date</label><input type="date" id="po-date" value="${o?o.date:new Date().toISOString().split('T')[0]}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Expected Delivery</label><input type="date" id="po-expected" value="${expDate}"></div>
                <div class="form-group"><label>Status</label><select id="po-status">
                    ${['Draft','Ordered','Received','Cancelled'].map(s=>`<option ${o&&o.status===s?'selected':''}>${s}</option>`).join('')}
                </select></div>
            </div>
            <h4 style="margin:16px 0 8px">Items to Order <span style="font-weight:400;color:#64748B;font-size:12px">(cost prices)</span></h4>
            <div id="order-lines">
                ${lineItems.map((li,idx) => orderLineHTML(idx, li, items, 'cost')).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addOrderLine('cost')" style="margin-top:8px"><i class="fas fa-plus"></i> Add Item</button>
            <div class="totals-section" style="margin-top:16px">
                <table class="totals-table">
                    <tr><td>Subtotal</td><td id="order-subtotal">${fmt(0)}</td></tr>
                    <tr><td>GST (${DB.settings.taxRate}%)</td><td id="order-tax">${fmt(0)}</td></tr>
                    <tr class="grand-total"><td>Total Cost</td><td id="order-total">${fmt(0)}</td></tr>
                </table>
            </div>
            <div class="form-group" style="margin-top:16px"><label>Notes</label><textarea id="po-notes">${o?o.notes:''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-success">${o?'Update':'Create'} Purchase Order</button>
            </div>
        </form>`;
    recalcOrder();
    document.getElementById('po-form').addEventListener('submit', e => {
        e.preventDefault();
        const lines = [];
        document.querySelectorAll('.order-line-row').forEach(row => {
            const invId = parseInt(row.querySelector('.ol-product').value);
            const qty = parseInt(row.querySelector('.ol-qty').value);
            const price = parseFloat(row.querySelector('.ol-price').value);
            const disc = parseFloat(row.querySelector('.ol-disc').value) || 0;
            if (invId && qty) lines.push({ inventoryId: invId, qty, price, discount: disc });
        });
        if (!lines.length) { toast('Add at least one line item', 'error'); return; }
        const poSettings = DB.settings;
        const newStatus = document.getElementById('po-status').value;
        const data = {
            id: o ? o.id : DB.nextId(DB.orders),
            type: 'Purchase',
            orderNum: o ? o.orderNum : `PO-${String(poSettings.nextPurchaseOrderNum || 1).padStart(4,'0')}`,
            date: document.getElementById('po-date').value,
            expectedDate: document.getElementById('po-expected').value,
            supplierId: parseInt(document.getElementById('po-supplier').value),
            items: lines,
            status: newStatus,
            paymentStatus: o ? o.paymentStatus : 'Unpaid',
            notes: document.getElementById('po-notes').value
        };
        let arr = DB.orders;
        if (o) { const idx = arr.findIndex(x => x.id === o.id); arr[idx] = data; }
        else { arr.push(data); poSettings.nextPurchaseOrderNum = (poSettings.nextPurchaseOrderNum || 1) + 1; DB.settings = poSettings; }
        DB.orders = arr;
        const wasReceived = o && o.status === 'Received';
        if (newStatus === 'Received' && !wasReceived) {
            let inv = DB.inventory;
            data.items.forEach(li => {
                const ii = inv.findIndex(x => x.id === li.inventoryId);
                if (ii !== -1) {
                    inv[ii].quantity += li.qty;
                    inv[ii].status = inv[ii].quantity === 0 ? 'Out of Stock' : inv[ii].quantity <= inv[ii].reorderLevel ? 'Low Stock' : 'In Stock';
                }
            });
            DB.inventory = inv;
            toast(`${data.orderNum} received — ${data.items.reduce((s,li)=>s+li.qty,0)} items added to stock`);
        } else {
            toast(o ? 'Purchase order updated' : `Purchase order ${data.orderNum} created`);
        }
        closeDrawer(); renderOrders();
    });
}

function orderLineHTML(idx, li, items, priceType) {
    const isCost = priceType === 'cost';
    return `<div class="order-line-row" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
        <div><label style="font-size:12px">Product</label><select class="ol-product" data-price-type="${priceType}" onchange="onProductSelect(this)" style="font-size:13px;padding:8px">
            <option value="">Select...</option>
            ${items.map(i=>`<option value="${i.id}" ${li.inventoryId===i.id?'selected':''}>${i.name} (${i.quantity} in stock)</option>`).join('')}
        </select></div>
        <div><label style="font-size:12px">Qty</label><input type="number" class="ol-qty" value="${li.qty||1}" min="1" onchange="recalcOrder()" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">${isCost?'Cost':'Retail'}</label><input type="number" step="0.01" class="ol-price" value="${li.price||0}" onchange="recalcOrder()" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Disc %</label><input type="number" class="ol-disc" value="${li.discount||0}" min="0" max="100" onchange="recalcOrder()" style="font-size:13px;padding:8px"></div>
        <button type="button" class="remove-line" onclick="this.parentElement.remove();recalcOrder()" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:8px;font-size:14px;margin-bottom:4px;"><i class="fas fa-times"></i></button>
    </div>`;
}
function addOrderLine(priceType) {
    const div = document.createElement('div');
    div.innerHTML = orderLineHTML(0, {}, DB.inventory, priceType || 'retail');
    document.getElementById('order-lines').appendChild(div.firstElementChild);
}
function onProductSelect(sel) {
    const item = getInventoryItem(parseInt(sel.value));
    if (item) {
        const row = sel.closest('.order-line-row');
        const isCost = sel.dataset.priceType === 'cost';
        row.querySelector('.ol-price').value = isCost ? item.costPrice : item.unitPrice;
        recalcOrder();
    }
}
function recalcOrder() {
    let subtotal = 0;
    document.querySelectorAll('.order-line-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.ol-qty').value) || 0;
        const price = parseFloat(row.querySelector('.ol-price').value) || 0;
        const disc = parseFloat(row.querySelector('.ol-disc').value) || 0;
        subtotal += (qty * price) * (1 - disc / 100);
    });
    const tax = calcTax(subtotal);
    const el = (id) => document.getElementById(id);
    if (el('order-subtotal')) el('order-subtotal').textContent = fmt(subtotal);
    if (el('order-tax')) el('order-tax').textContent = fmt(tax);
    if (el('order-total')) el('order-total').textContent = fmt(subtotal + tax);
}


// ---- Invoice Send via Email & SMS ----
function buildInvoiceBody(inv) {
    const settings = DB.settings;
    const customer = DB.customers.find(c => c.id === inv.customerId);
    const sub = calcInvoiceSubtotal(inv.items);
    const tax = calcTax(sub);
    const total = sub + tax;
    const lines = inv.items.map(li => `  ${li.description} x${li.qty} @ ${fmt(li.rate)} = ${fmt(li.qty * li.rate)}`).join('\n');
    return `INVOICE ${inv.invoiceNum}\nFrom: ${settings.companyName}\n${settings.address}\nPhone: ${settings.phone}\n\nBill To: ${customer ? customer.firstName + ' ' + customer.lastName : 'Customer'}\n\nDate: ${fmtDate(inv.date)}\nDue: ${fmtDate(inv.dueDate)}\n\nItems:\n${lines}\n\nSubtotal: ${fmt(sub)}\nGST (${settings.taxRate}%): ${fmt(tax)}\nTOTAL: ${fmt(total)}\nAmount Paid: ${fmt(inv.amountPaid)}\nBalance Due: ${fmt(total - inv.amountPaid)}\n\nPayment Terms: Net ${settings.paymentTerms} days\nThank you for your business — ${settings.companyName}`;
}

async function sendRealEmail(inv, customer) {
    const settings = DB.settings;
    if (!settings.emailjsPublicKey || !settings.emailjsServiceId || !settings.emailjsTemplateId) {
        toast('EmailJS not configured — go to Settings > Notifications', 'warning');
        return false;
    }
    try {
        const sub = calcInvoiceSubtotal(inv.items);
        const tax = calcTax(sub);
        const total = sub + tax;
        const lineItemsText = inv.items.map(li =>
            `${li.description}  ×${li.qty}  @${fmt(li.rate)}  =  ${fmt(li.qty * li.rate)}`
        ).join('\n');
        await emailjs.send(settings.emailjsServiceId, settings.emailjsTemplateId, {
            to_email: customer.email,
            to_name: customer.firstName + ' ' + customer.lastName,
            from_name: settings.companyName,
            invoice_number: inv.invoiceNum,
            invoice_date: fmtDate(inv.date),
            due_date: fmtDate(inv.dueDate),
            line_items: lineItemsText,
            subtotal: fmt(sub),
            tax: fmt(tax),
            total: fmt(total),
            balance_due: fmt(total - inv.amountPaid),
            company_name: settings.companyName,
            company_address: settings.address,
            company_phone: settings.phone,
            company_email: settings.email,
            message: buildInvoiceBody(inv)
        }, settings.emailjsPublicKey);
        return true;
    } catch (err) {
        console.error('EmailJS error:', err);
        toast('Email failed: ' + (err.text || err.message || 'Unknown error'), 'error');
        return false;
    }
}

async function sendRealSMS(inv, customer) {
    const settings = DB.settings;
    const phone = customer.phone.replace(/\s/g, '');
    const sub = calcInvoiceSubtotal(inv.items);
    const total = sub + calcTax(sub);
    const msg = `${settings.companyName} Invoice ${inv.invoiceNum}: ${fmt(total)} due ${fmtDate(inv.dueDate)}. To: ${customer.firstName} ${customer.lastName}. Pay by bank transfer or card. Thank you!`;
    const apiKey = settings.smsApiKey || 'textbelt';
    try {
        const resp = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone, message: msg, key: apiKey })
        });
        const data = await resp.json();
        if (data.success) return true;
        toast('SMS: ' + (data.error || 'Could not send — check phone number format (e.g. +61412345678)'), 'warning');
        return false;
    } catch (err) {
        console.error('SMS error:', err);
        toast('SMS failed: network error', 'error');
        return false;
    }
}

async function sendInvoiceNotification(invoiceId) {
    let invoices = DB.invoices;
    const idx = invoices.findIndex(x => x.id === invoiceId);
    if (idx === -1) return;
    const inv = invoices[idx];
    const customer = DB.customers.find(c => c.id === inv.customerId);
    if (!customer) return;
    if (!inv.sentLog) inv.sentLog = [];
    const now = new Date().toISOString().split('T')[0];
    const results = [];

    if (customer.email) {
        const emailOk = await sendRealEmail(inv, customer);
        inv.sentLog.push({ type: 'email', to: customer.email, date: now, status: emailOk ? 'Delivered' : 'Failed' });
        results.push(emailOk ? `Email sent to ${customer.email}` : 'Email failed');
    }
    if (customer.phone) {
        const smsOk = await sendRealSMS(inv, customer);
        inv.sentLog.push({ type: 'sms', to: customer.phone, date: now, status: smsOk ? 'Delivered' : 'Failed' });
        results.push(smsOk ? `SMS sent to ${customer.phone}` : 'SMS failed');
    }

    if (inv.status === 'Draft') inv.status = 'Sent';
    invoices[idx] = inv;
    DB.invoices = invoices;
    toast(`${inv.invoiceNum}: ${results.join(' | ')}`);
}

function showSendLog(invoiceId) {
    const inv = DB.invoices.find(x => x.id === invoiceId);
    if (!inv || !inv.sentLog || !inv.sentLog.length) {
        openModal('Send Log', '<p style="color:#64748B">No send history for this invoice.</p>', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
        return;
    }
    const rows = inv.sentLog.map(l => `<tr>
        <td><i class="fas ${l.type === 'email' ? 'fa-envelope' : 'fa-sms'}" style="color:${l.type === 'email' ? '#2563EB' : '#16A34A'}"></i> ${l.type === 'email' ? 'Email' : 'SMS'}</td>
        <td>${l.to}</td>
        <td>${fmtDate(l.date)}</td>
        <td><span class="badge badge-${l.status==='Delivered'?'active':l.status==='Failed'?'overdue':'sent'}">${l.status||'Sent'}</span></td>
    </tr>`).join('');
    openModal('Send Log — ' + inv.invoiceNum,
        `<table style="width:100%;font-size:13px"><thead><tr><th>Method</th><th>Recipient</th><th>Date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
        `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
         <button class="btn btn-primary" onclick="closeModal();sendInvoiceNotification(${inv.id});renderInvoices()">Resend Now</button>`
    );
}

// ============================================
//  INVOICES
// ============================================
function renderInvoices() {
    const invoices = DB.invoices;
    const perms = getUserPermissions();
    const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, inv) => {
        const total = calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items));
        return s + total - inv.amountPaid;
    }, 0);
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Invoices <span class="record-count">${invoices.length}</span></h1><p>${fmt(outstanding)} outstanding across ${invoices.filter(i=>i.status!=='Paid'&&i.status!=='Void').length} invoices</p></div>
            <div class="page-header-right">
                ${perms.canExport ? '<button class="btn btn-secondary" onclick="exportTable(\'invoices\')"><i class="fas fa-download"></i> Export</button>' : ''}
                <button class="btn btn-primary" onclick="openDrawer('invoice')"><i class="fas fa-plus"></i> New Invoice</button>
            </div>
        </div>
        <div class="filter-bar">
            <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search invoices..." onkeyup="filterTable(this,'invoices-table')"></div>
            <select onchange="filterStatus(this,'invoices-table')"><option value="">All Status</option><option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option><option>Void</option></select>
        </div>
        <div class="card"><div class="card-body no-pad"><div class="table-wrapper">
            <table id="invoices-table">
                <thead><tr><th>Invoice #</th><th>Date</th><th>Due Date</th><th>Customer</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${invoices.map(inv => {
                    const sub = calcInvoiceSubtotal(inv.items);
                    const total = sub + calcTax(sub);
                    const balance = total - inv.amountPaid;
                    return `<tr data-status="${escapeHTML(inv.status)}" class="${inv.status==='Overdue'?'row-danger':''}">
                        <td><strong>${escapeHTML(inv.invoiceNum)}</strong></td><td>${fmtDate(inv.date)}</td><td>${fmtDate(inv.dueDate)}</td>
                        <td>${getCustomerName(inv.customerId)}</td>
                        <td>${fmt(total)}</td><td>${fmt(inv.amountPaid)}</td><td>${fmt(balance)}</td>
                        <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
                        <td><div class="table-actions">
                            <button onclick="viewInvoiceDetail(${inv.id})" title="View"><i class="fas fa-eye"></i></button>
                            ${inv.status!=='Paid'?`<button onclick="sendInvoiceNotification(${inv.id});renderInvoices()" title="Send via Email & SMS"><i class="fas fa-paper-plane"></i></button>`:''}
                            ${inv.status!=='Paid'?`<button onclick="openDrawer('payment',${inv.id})" title="Record Payment"><i class="fas fa-credit-card"></i></button>`:''}
                            <button onclick="showSendLog(${inv.id})" title="Send Log"><i class="fas fa-history"></i></button>
                            <button onclick="openDrawer('invoice',${inv.id})" title="Edit"><i class="fas fa-pen"></i></button>
                            ${perms.canDelete ? `<button class="danger" onclick="deleteRecord('invoices',${inv.id})" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
                        </div></td>
                    </tr>`;
                }).join('')}</tbody>
            </table>
        </div></div></div>`;
}

function viewInvoiceDetail(id) { openDrawer('invoiceDetail', DB.invoices.find(x => x.id === id)); }

function renderInvoiceDetail(inv) {
    const sub = calcInvoiceSubtotal(inv.items);
    const tax = calcTax(sub);
    const total = sub + tax;
    const settings = DB.settings;
    const customer = DB.customers.find(c => c.id === inv.customerId);
    document.getElementById('drawer-title').textContent = inv.invoiceNum;
    document.getElementById('drawer-body').innerHTML = `
        <div style="background:#F8FAFC;border-radius:12px;padding:32px;margin-bottom:24px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
                <div>
                    <h2 style="color:#2563EB;font-size:24px;margin-bottom:8px">INVOICE</h2>
                    <div style="color:#64748B;font-size:13px">${inv.invoiceNum}</div>
                </div>
                <div style="text-align:right">
                    <strong>${settings.companyName}</strong><br>
                    <span style="color:#64748B;font-size:13px">${settings.address}<br>${settings.email}<br>ABN: ${settings.abn}</span>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
                <div>
                    <div style="font-size:12px;font-weight:600;color:#64748B;text-transform:uppercase;margin-bottom:4px">Bill To</div>
                    <strong>${customer?customer.firstName+' '+customer.lastName:'—'}</strong><br>
                    <span style="color:#64748B;font-size:13px">${customer?customer.company:''}<br>${customer?customer.billingAddress:''}</span>
                </div>
                <div style="text-align:right">
                    <div><span style="color:#64748B">Issue Date:</span> ${fmtDate(inv.date)}</div>
                    <div><span style="color:#64748B">Due Date:</span> ${fmtDate(inv.dueDate)}</div>
                    <div style="margin-top:8px"><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></div>
                </div>
            </div>
            <table style="width:100%;font-size:13px;margin-bottom:16px;">
                <thead><tr style="border-bottom:2px solid #E2E8F0"><th style="text-align:left;padding:8px 0">Description</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>
                <tbody>${inv.items.map(li => `<tr style="border-bottom:1px solid #E2E8F0"><td style="padding:10px 0">${escapeHTML(li.description)}</td><td style="text-align:center">${li.qty}</td><td style="text-align:center">${fmt(li.rate)}</td><td style="text-align:right">${fmt(li.qty*li.rate)}</td></tr>`).join('')}</tbody>
            </table>
            <div style="display:flex;justify-content:flex-end">
                <table class="totals-table">
                    <tr><td>Subtotal</td><td>${fmt(sub)}</td></tr>
                    <tr><td>GST (${settings.taxRate}%)</td><td>${fmt(tax)}</td></tr>
                    <tr class="grand-total"><td>Total</td><td>${fmt(total)}</td></tr>
                    <tr><td>Amount Paid</td><td style="color:#16A34A">${fmt(inv.amountPaid)}</td></tr>
                    <tr><td><strong>Balance Due</strong></td><td><strong>${fmt(total - inv.amountPaid)}</strong></td></tr>
                </table>
            </div>
        </div>
        ${inv.payments.length ? `<h4 style="margin-bottom:8px">Payment History</h4>
        <table style="width:100%;font-size:13px">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead>
            <tbody>${inv.payments.map(p=>`<tr><td>${fmtDate(p.date)}</td><td>${fmt(p.amount)}</td><td>${p.method}</td><td>${p.ref}</td></tr>`).join('')}</tbody>
        </table>` : ''}
        ${inv.sentLog && inv.sentLog.length ? `<h4 style="margin:20px 0 8px">Send History</h4>
        <table style="width:100%;font-size:13px">
            <thead><tr><th>Method</th><th>Recipient</th><th>Date</th></tr></thead>
            <tbody>${inv.sentLog.map(l=>`<tr>
                <td><i class="fas ${l.type==='email'?'fa-envelope':'fa-sms'}" style="color:${l.type==='email'?'#2563EB':'#16A34A'}"></i> ${l.type==='email'?'Email':'SMS'}</td>
                <td>${l.to}</td><td>${fmtDate(l.date)}</td>
            </tr>`).join('')}</tbody>
        </table>` : ''}
        <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;">
            ${inv.status!=='Paid'?`<button class="btn btn-primary" onclick="closeDrawer();sendInvoiceNotification(${inv.id});renderInvoices()"><i class="fas fa-paper-plane"></i> Send via Email & SMS</button>`:''}
            ${inv.status!=='Paid'?`<button class="btn btn-success" onclick="closeDrawer();openDrawer('payment',${inv.id})"><i class="fas fa-credit-card"></i> Record Payment</button>`:''}
            <button class="btn btn-secondary" onclick="duplicateInvoice(${inv.id})"><i class="fas fa-copy"></i> Duplicate</button>
        </div>
    `;
}

function renderPaymentForm(invId) {
    const inv = DB.invoices.find(x => x.id === invId);
    if (!inv) return;
    const sub = calcInvoiceSubtotal(inv.items);
    const total = sub + calcTax(sub);
    const balance = total - inv.amountPaid;
    document.getElementById('drawer-title').textContent = `Record Payment — ${inv.invoiceNum}`;
    document.getElementById('drawer-body').innerHTML = `
        <div style="background:#F0FDF4;padding:16px;border-radius:8px;margin-bottom:24px;text-align:center;">
            <div style="font-size:13px;color:#64748B">Balance Due</div>
            <div style="font-size:28px;font-weight:700;color:#16A34A">${fmt(balance)}</div>
        </div>
        <form id="payment-form">
            <div class="form-group"><label>Amount *</label><input type="number" step="0.01" id="pf-amount" value="${balance.toFixed(2)}" max="${balance.toFixed(2)}" required></div>
            <div class="form-row">
                <div class="form-group"><label>Date</label><input type="date" id="pf-date" value="${new Date().toISOString().split('T')[0]}"></div>
                <div class="form-group"><label>Method</label><select id="pf-method"><option>Bank Transfer</option><option>Card</option><option>Cash</option><option>Cheque</option></select></div>
            </div>
            <div class="form-group"><label>Reference #</label><input type="text" id="pf-ref" placeholder="e.g. TXN-12345"></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-success">Record Payment</button>
            </div>
        </form>`;
    document.getElementById('payment-form').addEventListener('submit', e => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('pf-amount').value);
        let invoices = DB.invoices;
        const idx = invoices.findIndex(x => x.id === invId);
        invoices[idx].payments.push({
            date: document.getElementById('pf-date').value,
            amount, method: document.getElementById('pf-method').value,
            ref: document.getElementById('pf-ref').value
        });
        invoices[idx].amountPaid += amount;
        const newBalance = (calcInvoiceSubtotal(invoices[idx].items) + calcTax(calcInvoiceSubtotal(invoices[idx].items))) - invoices[idx].amountPaid;
        if (newBalance <= 0.01) invoices[idx].status = 'Paid';
        else if (invoices[idx].status === 'Overdue') { /* stays overdue */ }
        else invoices[idx].status = 'Sent';
        DB.invoices = invoices;
        closeDrawer(); toast(`Payment of ${fmt(amount)} recorded`); renderInvoices();
    });
}

function renderInvoiceForm(id) {
    const inv = id ? DB.invoices.find(x => x.id === id) : null;
    const customers = DB.customers.filter(c => c.status === 'Active');
    const settings = DB.settings;
    document.getElementById('drawer-title').textContent = inv ? 'Edit Invoice' : 'New Invoice';
    const lineItems = inv ? inv.items : [{ description: '', qty: 1, rate: 0 }];
    document.getElementById('drawer-body').innerHTML = `
        <form id="invoice-form">
            <div class="form-row">
                <div class="form-group"><label>Invoice #</label><input type="text" id="ivf-num" value="${inv?inv.invoiceNum:settings.invoicePrefix+'-'+settings.nextInvoiceNum}" readonly></div>
                <div class="form-group"><label>Customer *</label><select id="ivf-customer" required>
                    <option value="">Select customer...</option>
                    ${customers.map(c=>`<option value="${c.id}" ${inv&&inv.customerId===c.id?'selected':''}>${c.firstName} ${c.lastName} — ${c.company}</option>`).join('')}
                </select></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Issue Date</label><input type="date" id="ivf-date" value="${inv?inv.date:new Date().toISOString().split('T')[0]}"></div>
                <div class="form-group"><label>Due Date</label><input type="date" id="ivf-due" value="${inv?inv.dueDate:(()=>{const d=new Date();d.setDate(d.getDate()+settings.paymentTerms);return d.toISOString().split('T')[0]})()}"></div>
            </div>
            <div class="form-group"><label>Status</label><select id="ivf-status">
                ${['Draft','Sent','Paid','Overdue','Void'].map(s=>`<option ${inv&&inv.status===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
            <h4 style="margin:16px 0 8px">Line Items</h4>
            <div id="invoice-lines">
                ${lineItems.map((li,idx) => `<div class="inv-line-row" style="display:grid;grid-template-columns:3fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
                    <div><label style="font-size:12px">Description</label><input type="text" class="il-desc" value="${li.description}" style="font-size:13px;padding:8px"></div>
                    <div><label style="font-size:12px">Qty</label><input type="number" class="il-qty" value="${li.qty}" min="1" onchange="recalcInvoice()" style="font-size:13px;padding:8px"></div>
                    <div><label style="font-size:12px">Rate</label><input type="number" step="0.01" class="il-rate" value="${li.rate}" onchange="recalcInvoice()" style="font-size:13px;padding:8px"></div>
                    <button type="button" onclick="this.parentElement.remove();recalcInvoice()" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:8px;font-size:14px;margin-bottom:4px;"><i class="fas fa-times"></i></button>
                </div>`).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addInvoiceLine()" style="margin-top:8px"><i class="fas fa-plus"></i> Add Line</button>
            <div class="totals-section" style="margin-top:16px">
                <table class="totals-table">
                    <tr><td>Subtotal</td><td id="inv-subtotal">${fmt(0)}</td></tr>
                    <tr><td>GST (${settings.taxRate}%)</td><td id="inv-tax">${fmt(0)}</td></tr>
                    <tr class="grand-total"><td>Total</td><td id="inv-total">${fmt(0)}</td></tr>
                </table>
            </div>
            <div class="form-group" style="margin-top:16px"><label>Notes</label><textarea id="ivf-notes">${inv?inv.notes:''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-secondary" name="save-only">Save Draft</button>
                <button type="submit" class="btn btn-primary" name="save-send"><i class="fas fa-paper-plane"></i> Save & Send</button>
            </div>
        </form>`;
    recalcInvoice();
    let shouldSend = false;
    document.querySelector('[name="save-send"]').addEventListener('click', () => { shouldSend = true; });
    document.querySelector('[name="save-only"]').addEventListener('click', () => { shouldSend = false; });
    document.getElementById('invoice-form').addEventListener('submit', e => {
        e.preventDefault();
        const lines = [];
        document.querySelectorAll('.inv-line-row').forEach(row => {
            const desc = row.querySelector('.il-desc').value;
            const qty = parseInt(row.querySelector('.il-qty').value);
            const rate = parseFloat(row.querySelector('.il-rate').value);
            if (desc && qty) lines.push({ description: desc, qty, rate });
        });
        if (!lines.length) { toast('Add at least one line item', 'error'); return; }
        const data = {
            id: inv ? inv.id : DB.nextId(DB.invoices),
            invoiceNum: document.getElementById('ivf-num').value,
            orderId: inv ? inv.orderId : null,
            customerId: parseInt(document.getElementById('ivf-customer').value),
            date: document.getElementById('ivf-date').value,
            dueDate: document.getElementById('ivf-due').value,
            items: lines,
            status: shouldSend ? 'Sent' : document.getElementById('ivf-status').value,
            amountPaid: inv ? inv.amountPaid : 0,
            payments: inv ? inv.payments : [],
            notes: document.getElementById('ivf-notes').value,
            sentLog: inv ? (inv.sentLog || []) : []
        };
        let arr = DB.invoices;
        if (inv) { const idx = arr.findIndex(x => x.id === inv.id); arr[idx] = data; }
        else { arr.push(data); const s = DB.settings; s.nextInvoiceNum++; DB.settings = s; }
        DB.invoices = arr;
        closeDrawer();
        if (shouldSend) {
            sendInvoiceNotification(data.id);
            toast(inv ? 'Invoice updated & sent' : `Invoice ${data.invoiceNum} created & sent`);
        } else {
            toast(inv ? 'Invoice updated' : `Invoice ${data.invoiceNum} saved as draft`);
        }
        renderInvoices();
    });
}

function addInvoiceLine() {
    const div = document.createElement('div');
    div.innerHTML = `<div class="inv-line-row" style="display:grid;grid-template-columns:3fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end;">
        <div><label style="font-size:12px">Description</label><input type="text" class="il-desc" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Qty</label><input type="number" class="il-qty" value="1" min="1" onchange="recalcInvoice()" style="font-size:13px;padding:8px"></div>
        <div><label style="font-size:12px">Rate</label><input type="number" step="0.01" class="il-rate" value="0" onchange="recalcInvoice()" style="font-size:13px;padding:8px"></div>
        <button type="button" onclick="this.parentElement.remove();recalcInvoice()" style="background:none;border:none;color:#94A3B8;cursor:pointer;padding:8px;font-size:14px;margin-bottom:4px;"><i class="fas fa-times"></i></button>
    </div>`;
    document.getElementById('invoice-lines').appendChild(div.firstElementChild);
}
function recalcInvoice() {
    let sub = 0;
    document.querySelectorAll('.inv-line-row').forEach(row => {
        const qty = parseFloat(row.querySelector('.il-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.il-rate').value) || 0;
        sub += qty * rate;
    });
    const tax = calcTax(sub);
    const el = (id) => document.getElementById(id);
    if (el('inv-subtotal')) el('inv-subtotal').textContent = fmt(sub);
    if (el('inv-tax')) el('inv-tax').textContent = fmt(tax);
    if (el('inv-total')) el('inv-total').textContent = fmt(sub + tax);
}

function duplicateInvoice(id) {
    const inv = DB.invoices.find(x => x.id === id);
    if (!inv) return;
    const settings = DB.settings;
    const copy = JSON.parse(JSON.stringify(inv));
    copy.id = DB.nextId(DB.invoices);
    copy.invoiceNum = `${settings.invoicePrefix}-${settings.nextInvoiceNum}`;
    copy.date = new Date().toISOString().split('T')[0];
    copy.dueDate = (() => { const d = new Date(); d.setDate(d.getDate() + settings.paymentTerms); return d.toISOString().split('T')[0]; })();
    copy.status = 'Draft';
    copy.amountPaid = 0;
    copy.payments = [];
    copy.orderId = null;
    copy.sentLog = [];
    let arr = DB.invoices; arr.push(copy); DB.invoices = arr;
    settings.nextInvoiceNum++; DB.settings = settings;
    closeDrawer(); toast(`Invoice duplicated as ${copy.invoiceNum}`); renderInvoices();
}

// ============================================
//  REPORTS
// ============================================
function renderReports() {
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Reports & Analytics</h1><p>Business intelligence and data insights</p></div>
        </div>
        <div class="report-cards">
            <div class="report-card" onclick="showReport('jobs')">
                <div class="report-card-icon" style="background:#EFF6FF;color:#2563EB"><i class="fas fa-wrench"></i></div>
                <h4>Jobs Report</h4><p>Revenue trends, job volume, service performance</p>
            </div>
            <div class="report-card" onclick="showReport('inventory')">
                <div class="report-card-icon" style="background:#F0FDF4;color:#16A34A"><i class="fas fa-boxes-stacked"></i></div>
                <h4>Inventory Report</h4><p>Stock levels, valuation, turnover analysis</p>
            </div>
            <div class="report-card" onclick="showReport('customers')">
                <div class="report-card-icon" style="background:#FEF3C7;color:#D97706"><i class="fas fa-users"></i></div>
                <h4>Customer Report</h4><p>Top customers, spending patterns, acquisition</p>
            </div>
            <div class="report-card" onclick="showReport('suppliers')">
                <div class="report-card-icon" style="background:#FEF2F2;color:#DC2626"><i class="fas fa-truck"></i></div>
                <h4>Supplier Report</h4><p>Spending by supplier, order frequency</p>
            </div>
            <div class="report-card" onclick="showReport('financial')">
                <div class="report-card-icon" style="background:#F0F9FF;color:#0EA5E9"><i class="fas fa-coins"></i></div>
                <h4>Financial Summary</h4><p>Profit & loss, receivables, payables</p>
            </div>
            <div class="report-card" onclick="showReport('jobCompletion')">
                <div class="report-card-icon" style="background:#FAF5FF;color:#8B5CF6"><i class="fas fa-check-double"></i></div>
                <h4>Job Completion</h4><p>Completion rates, job status breakdown</p>
            </div>
        </div>
        <div id="report-detail"></div>`;
}

function showReport(type) {
    destroyCharts();
    const container = document.getElementById('report-detail');
    const reports = { jobs: renderJobsReport, inventory: renderInventoryReport, customers: renderCustomerReport, suppliers: renderSupplierReport, financial: renderFinancialReport, jobCompletion: renderJobCompletionReport };
    if (reports[type]) reports[type](container);
}

function renderJobsReport(el) {
    const jobs = DB.jobs;
    const totalRev = jobs.reduce((s, j) => s + calcJobTotal(j), 0);
    const avgJob = jobs.length ? totalRev / jobs.length : 0;
    el.innerHTML = `
        <div class="card" style="margin-bottom:20px">
            <div class="card-header"><h3>Jobs Report</h3></div>
            <div class="card-body">
                <div class="kpi-grid" style="margin-bottom:24px">
                    <div class="kpi-card"><div class="kpi-value">${fmt(totalRev)}</div><div class="kpi-label">Total Revenue</div></div>
                    <div class="kpi-card"><div class="kpi-value">${jobs.length}</div><div class="kpi-label">Total Jobs</div></div>
                    <div class="kpi-card"><div class="kpi-value">${fmt(avgJob)}</div><div class="kpi-label">Avg Job Value</div></div>
                    <div class="kpi-card"><div class="kpi-value">${jobs.filter(j=>j.status==='Invoiced').length}</div><div class="kpi-label">Invoiced</div></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div><h4 style="margin-bottom:12px">Monthly Revenue</h4><div class="chart-container medium"><canvas id="salesMonthlyChart"></canvas></div></div>
                    <div><h4 style="margin-bottom:12px">Order Status Breakdown</h4><div class="chart-container medium"><canvas id="salesStatusChart"></canvas></div></div>
                </div>
            </div>
        </div>`;
    const { labels: months, revenue: monthlyData } = getMonthlyRevenue(6);
    chartInstances.salesMonthly = new Chart(document.getElementById('salesMonthlyChart'), {
        type: 'line', data: { labels: months, datasets: [{ label: 'Revenue', data: monthlyData, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.4, pointRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$'+v }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
    const statuses = ['Draft','In Progress','Completed','Invoiced'];
    const statusCounts = statuses.map(s => jobs.filter(j => j.status === s).length);
    chartInstances.salesStatus = new Chart(document.getElementById('salesStatusChart'), {
        type: 'doughnut', data: { labels: statuses, datasets: [{ data: statusCounts, backgroundColor: ['#94A3B8','#0EA5E9','#F59E0B','#16A34A'] }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom' } } }
    });
}

function renderInventoryReport(el) {
    const items = DB.inventory;
    const totalVal = items.reduce((s, i) => s + i.quantity * i.costPrice, 0);
    const retailVal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    el.innerHTML = `
        <div class="card" style="margin-bottom:20px">
            <div class="card-header"><h3>Inventory Report</h3></div>
            <div class="card-body">
                <div class="kpi-grid" style="margin-bottom:24px">
                    <div class="kpi-card"><div class="kpi-value">${items.length}</div><div class="kpi-label">Total Products</div></div>
                    <div class="kpi-card"><div class="kpi-value">${items.reduce((s,i)=>s+i.quantity,0)}</div><div class="kpi-label">Total Units</div></div>
                    <div class="kpi-card"><div class="kpi-value">${fmt(totalVal)}</div><div class="kpi-label">Cost Valuation</div></div>
                    <div class="kpi-card"><div class="kpi-value">${fmt(retailVal)}</div><div class="kpi-label">Retail Valuation</div></div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                    <div><h4 style="margin-bottom:12px">Stock by Category</h4><div class="chart-container medium"><canvas id="invCatChart"></canvas></div></div>
                    <div><h4 style="margin-bottom:12px">Stock Status</h4><div class="chart-container medium"><canvas id="invStatusChart"></canvas></div></div>
                </div>
            </div>
        </div>`;
    const cats = [...new Set(items.map(i => i.category))];
    chartInstances.invCat = new Chart(document.getElementById('invCatChart'), {
        type: 'bar', data: { labels: cats, datasets: [{ label: 'Units', data: cats.map(c => items.filter(i=>i.category===c).reduce((s,i)=>s+i.quantity,0)), backgroundColor: '#2563EB', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
    const ss = ['In Stock','Low Stock','Out of Stock'];
    chartInstances.invStatus = new Chart(document.getElementById('invStatusChart'), {
        type: 'pie', data: { labels: ss, datasets: [{ data: ss.map(s => items.filter(i=>i.status===s).length), backgroundColor: ['#16A34A','#F59E0B','#DC2626'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function renderCustomerReport(el) {
    const customers = DB.customers;
    const data = customers.map(c => {
        const spent = DB.invoices.filter(i => i.customerId === c.id).reduce((s, inv) => s + calcInvoiceSubtotal(inv.items), 0);
        return { name: c.firstName + ' ' + c.lastName, company: c.company, spent };
    }).sort((a, b) => b.spent - a.spent);
    el.innerHTML = `
        <div class="card"><div class="card-header"><h3>Customer Report — Top Customers by Spend</h3></div><div class="card-body">
            <div class="chart-container medium" style="margin-bottom:24px"><canvas id="custChart"></canvas></div>
            <table><thead><tr><th>Rank</th><th>Customer</th><th>Company</th><th>Total Spend</th></tr></thead>
            <tbody>${data.map((d,i)=>`<tr><td>#${i+1}</td><td><strong>${d.name}</strong></td><td>${d.company}</td><td>${fmt(d.spent)}</td></tr>`).join('')}</tbody></table>
        </div></div>`;
    chartInstances.cust = new Chart(document.getElementById('custChart'), {
        type: 'bar', data: { labels: data.map(d => d.name), datasets: [{ label: 'Total Spend', data: data.map(d => d.spent), backgroundColor: ['#2563EB','#16A34A','#F59E0B','#DC2626','#8B5CF6'], borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: v => '$'+v }, grid: { color: '#F1F5F9' } }, y: { grid: { display: false } } } }
    });
}

function renderSupplierReport(el) {
    const suppliers = DB.suppliers;
    el.innerHTML = `
        <div class="card"><div class="card-header"><h3>Supplier Report</h3></div><div class="card-body">
            <div class="chart-container medium" style="margin-bottom:24px"><canvas id="suppChart"></canvas></div>
            <table><thead><tr><th>Supplier</th><th>Category</th><th>Products Supplied</th><th>Payment Terms</th></tr></thead>
            <tbody>${suppliers.map(s=>`<tr><td><strong>${s.company}</strong></td><td><span class="badge badge-sent">${s.category}</span></td><td>${DB.inventory.filter(i=>i.supplierId===s.id).length}</td><td>Net ${s.paymentTerms}</td></tr>`).join('')}</tbody></table>
        </div></div>`;
    chartInstances.supp = new Chart(document.getElementById('suppChart'), {
        type: 'bar', data: { labels: suppliers.map(s=>s.company), datasets: [{ label: 'Products Supplied', data: suppliers.map(s=>DB.inventory.filter(i=>i.supplierId===s.id).length), backgroundColor: '#2563EB', borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
}

function renderFinancialReport(el) {
    const invoices = DB.invoices;
    const totalBilled = invoices.reduce((s,i) => s + calcInvoiceSubtotal(i.items) + calcTax(calcInvoiceSubtotal(i.items)), 0);
    const totalPaid = invoices.reduce((s,i) => s + i.amountPaid, 0);
    const receivable = totalBilled - totalPaid;
    const cogs = DB.invoices.reduce((s, inv) => {
        return s + inv.items.reduce((ss, li) => {
            const item = DB.inventory.find(x => x.name === li.description);
            return ss + (item ? item.costPrice * li.qty : li.rate * li.qty * 0.5);
        }, 0);
    }, 0);
    el.innerHTML = `
        <div class="card"><div class="card-header"><h3>Financial Summary</h3></div><div class="card-body">
            <div class="kpi-grid" style="margin-bottom:24px">
                <div class="kpi-card"><div class="kpi-value">${fmt(totalBilled)}</div><div class="kpi-label">Total Billed</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:#16A34A">${fmt(totalPaid)}</div><div class="kpi-label">Total Collected</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:#F59E0B">${fmt(receivable)}</div><div class="kpi-label">Accounts Receivable</div></div>
                <div class="kpi-card"><div class="kpi-value" style="color:#2563EB">${fmt(totalPaid - cogs)}</div><div class="kpi-label">Est. Gross Profit</div></div>
            </div>
            <div class="chart-container medium"><canvas id="finChart"></canvas></div>
        </div></div>`;
    chartInstances.fin = new Chart(document.getElementById('finChart'), {
        type: 'bar', data: { labels: ['Billed','Collected','Receivable','COGS','Est. Profit'], datasets: [{ data: [totalBilled, totalPaid, receivable, cogs, totalPaid-cogs], backgroundColor: ['#2563EB','#16A34A','#F59E0B','#DC2626','#8B5CF6'], borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '$'+v }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
}

function renderJobCompletionReport(el) {
    const jobs = DB.jobs;
    const statuses = ['Draft','In Progress','Completed','Invoiced'];
    const counts = statuses.map(s => jobs.filter(j => j.status === s).length);
    const rate = jobs.length ? ((jobs.filter(j=>j.status==='Invoiced'||j.status==='Completed').length / jobs.length)*100).toFixed(1) : 0;
    el.innerHTML = `
        <div class="card"><div class="card-header"><h3>Job Completion Report</h3></div><div class="card-body">
            <div class="kpi-grid" style="margin-bottom:24px">
                <div class="kpi-card"><div class="kpi-value">${jobs.length}</div><div class="kpi-label">Total Jobs</div></div>
                <div class="kpi-card"><div class="kpi-value">${jobs.filter(j=>j.status==='Invoiced').length}</div><div class="kpi-label">Invoiced</div></div>
                <div class="kpi-card"><div class="kpi-value">${rate}%</div><div class="kpi-label">Completion Rate</div></div>
                <div class="kpi-card"><div class="kpi-value">${jobs.filter(j=>j.status==='In Progress').length}</div><div class="kpi-label">In Progress</div></div>
            </div>
            <div class="chart-container medium"><canvas id="fulfilChart"></canvas></div>
        </div></div>`;
    chartInstances.fulfil = new Chart(document.getElementById('fulfilChart'), {
        type: 'bar', data: { labels: statuses, datasets: [{ label: 'Jobs', data: counts, backgroundColor: ['#94A3B8','#0EA5E9','#F59E0B','#16A34A'], borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
    });
}

// ============================================
//  SETTINGS
// ============================================
function renderSettings() {
    const settings = DB.settings;
    const el = document.getElementById('page-content');
    let activeTab = 'company';
    function renderPanel(tab) {
        activeTab = tab;
        const panels = {
            company: `<div class="settings-section"><h3>Company Profile</h3>
                <form id="settings-company">
                    <div class="form-group"><label>Company Name</label><input type="text" id="sc-name" value="${settings.companyName}"></div>
                    <div class="form-row">
                        <div class="form-group"><label>ABN</label><input type="text" id="sc-abn" value="${settings.abn}"></div>
                        <div class="form-group"><label>Email</label><input type="email" id="sc-email" value="${settings.email}"></div>
                    </div>
                    <div class="form-row">
                        <div class="form-group"><label>Phone</label><input type="tel" id="sc-phone" value="${settings.phone}"></div>
                    </div>
                    <h4 style="margin:8px 0 8px">Address</h4>
                    ${addressFieldsHTML('sc-addr', settings.address)}
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>`,
            invoice: `<div class="settings-section"><h3>Invoice Settings</h3>
                <form id="settings-invoice">
                    <div class="form-row">
                        <div class="form-group"><label>Invoice Prefix</label><input type="text" id="si-prefix" value="${settings.invoicePrefix}"></div>
                        <div class="form-group"><label>Next Invoice Number</label><input type="number" id="si-next" value="${settings.nextInvoiceNum}"></div>
                    </div>
                    <div class="form-group"><label>Default Payment Terms (days)</label><input type="number" id="si-terms" value="${settings.paymentTerms}"></div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>`,
            tax: `<div class="settings-section"><h3>Tax Settings</h3>
                <form id="settings-tax">
                    <div class="form-group"><label>GST Rate (%)</label><input type="number" id="st-rate" value="${settings.taxRate}" step="0.5"></div>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </form>
            </div>`,
            users: `<div class="settings-section"><h3>User Management</h3>
                <p style="color:#64748B;margin-bottom:16px">Only users listed here can log in to the system.</p>
                <div id="users-table-container"><p style="color:#64748B">Loading users...</p></div>
                <button class="btn btn-primary" style="margin-top:16px" onclick="showInviteUserForm()"><i class="fas fa-user-plus"></i> Invite User</button>
                <div id="invite-user-form-container"></div>
            </div>`,
            notifications: `<div class="settings-section"><h3>Google Maps — Address Validation</h3>
                <p style="color:#64748B;margin-bottom:16px">Enable full street-level address autocomplete powered by Google Maps. Without this, address search falls back to suburb-only lookup.</p>
                <form id="settings-gmaps">
                    <div class="form-group"><label>Google Maps API Key</label><input type="text" id="sn-gmaps-key" value="${settings.googleMapsApiKey||''}" placeholder="e.g. AIzaSy...">
                    <p style="font-size:12px;color:#64748B;margin-top:4px">Get a free key at <strong>console.cloud.google.com</strong> → APIs → Places API. Enable "Places API" and "Maps JavaScript API".</p></div>
                    <button type="submit" class="btn btn-primary">Save & Load Google Maps</button>
                    ${_googleMapsLoaded ? '<span style="color:#16A34A;font-size:13px;margin-left:12px"><i class="fas fa-check-circle"></i> Google Maps loaded</span>' : ''}
                </form>
                <hr style="margin:24px 0;border:none;border-top:1px solid #E2E8F0">
                <h3>Email & SMS Configuration</h3>
                <p style="color:#64748B;margin-bottom:16px">Configure real email and SMS sending for invoices. Emails use <strong>EmailJS</strong> (free at emailjs.com) and SMS uses <strong>Textbelt</strong> (1 free SMS/day, or paid key).</p>
                <form id="settings-notif">
                    <h4 style="margin-bottom:12px;color:#2563EB"><i class="fas fa-envelope"></i> EmailJS Setup</h4>
                    <p style="font-size:12px;color:#64748B;margin-bottom:12px">1. Sign up free at <strong>emailjs.com</strong><br>2. Create an email service (Gmail, Outlook, etc.)<br>3. Create a template with variables: {{to_email}}, {{to_name}}, {{invoice_number}}, {{message}}<br>4. Copy your Public Key, Service ID, and Template ID below</p>
                    <div class="form-group"><label>Public Key</label><input type="text" id="sn-emailjs-pk" value="${settings.emailjsPublicKey||''}" placeholder="e.g. abc123XYZ"></div>
                    <div class="form-row">
                        <div class="form-group"><label>Service ID</label><input type="text" id="sn-emailjs-sid" value="${settings.emailjsServiceId||''}" placeholder="e.g. service_xxxxx"></div>
                        <div class="form-group"><label>Template ID</label><input type="text" id="sn-emailjs-tid" value="${settings.emailjsTemplateId||''}" placeholder="e.g. template_xxxxx"></div>
                    </div>
                    <hr style="margin:24px 0;border:none;border-top:1px solid #E2E8F0">
                    <h4 style="margin-bottom:12px;color:#16A34A"><i class="fas fa-sms"></i> SMS Setup (Textbelt)</h4>
                    <p style="font-size:12px;color:#64748B;margin-bottom:12px">Free tier: 1 SMS/day with key <code>textbelt</code>. For more, purchase a key at <strong>textbelt.com</strong>. Phone numbers must be in international format (e.g. +61412345678).</p>
                    <div class="form-group"><label>API Key</label><input type="text" id="sn-sms-key" value="${settings.smsApiKey||'textbelt'}" placeholder="textbelt"></div>
                    <div style="display:flex;gap:10px;margin-top:16px;">
                        <button type="submit" class="btn btn-primary">Save Configuration</button>
                        <button type="button" class="btn btn-secondary" onclick="testEmailSend()"><i class="fas fa-paper-plane"></i> Send Test Email</button>
                        <button type="button" class="btn btn-secondary" onclick="testSmsSend()"><i class="fas fa-sms"></i> Send Test SMS</button>
                    </div>
                </form>
            </div>`,
            data: `<div class="settings-section"><h3>Data Backup & Restore</h3>
                <p style="color:#64748B;margin-bottom:16px">Export all system data as a JSON backup file, or restore from a previous backup.</p>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:24px;">
                    <button class="btn btn-primary" onclick="backupData()"><i class="fas fa-download"></i> Export Backup (JSON)</button>
                    <button class="btn btn-secondary" onclick="serverBackup()"><i class="fas fa-server"></i> Save Backup on Server</button>
                    <label class="btn btn-secondary" style="cursor:pointer"><i class="fas fa-upload"></i> Import Backup<input type="file" accept=".json" onchange="restoreData(this)" style="display:none"></label>
                </div>
                <div id="server-backups-list"></div>
                <h3>Data Management</h3>
                <p style="color:#64748B;margin-bottom:16px">Reset or clear application data. Use with caution.</p>
                <div style="display:flex;gap:12px;">
                    <button class="btn btn-warning" onclick="if(confirm('Reset all data to defaults? Current data will be lost.')){localStorage.clear();location.reload()}"><i class="fas fa-undo"></i> Reset to Demo Data</button>
                    <button class="btn btn-danger" onclick="if(confirm('Delete ALL data? This cannot be undone.')){localStorage.clear();location.reload()}"><i class="fas fa-trash"></i> Clear All Data</button>
                </div>
            </div>`
        };
        el.innerHTML = `
            <div class="page-header"><div class="page-header-left"><h1>Settings</h1><p>Configure your ERP system</p></div></div>
            <div class="settings-layout">
                <div class="settings-nav">
                    ${[['company','Company Profile','fa-building'],['invoice','Invoice Settings','fa-file-invoice'],['tax','Tax Settings','fa-percent'],['notifications','Email & SMS','fa-paper-plane'],['users','User Management','fa-users'],['data','Data Management','fa-database']].map(([k,l,ic])=>
                        `<button class="settings-nav-item ${tab===k?'active':''}" onclick="window._settingsTab('${k}')"><i class="fas ${ic}" style="width:20px;margin-right:8px"></i>${l}</button>`
                    ).join('')}
                </div>
                <div class="settings-panel">${panels[tab]}</div>
            </div>`;
        // Bind settings forms
        attachAddressAutocomplete('sc-addr');
        const companyForm = document.getElementById('settings-company');
        if (companyForm) companyForm.addEventListener('submit', e => {
            e.preventDefault();
            const s = DB.settings;
            s.companyName = document.getElementById('sc-name').value;
            s.abn = document.getElementById('sc-abn').value;
            s.email = document.getElementById('sc-email').value;
            s.phone = document.getElementById('sc-phone').value;
            s.address = getAddressValue('sc-addr');
            DB.settings = s; toast('Company profile saved');
        });
        const invoiceForm = document.getElementById('settings-invoice');
        if (invoiceForm) invoiceForm.addEventListener('submit', e => {
            e.preventDefault();
            const s = DB.settings;
            s.invoicePrefix = document.getElementById('si-prefix').value;
            s.nextInvoiceNum = parseInt(document.getElementById('si-next').value);
            s.paymentTerms = parseInt(document.getElementById('si-terms').value);
            DB.settings = s; toast('Invoice settings saved');
        });
        const taxForm = document.getElementById('settings-tax');
        if (taxForm) taxForm.addEventListener('submit', e => {
            e.preventDefault();
            const s = DB.settings;
            s.taxRate = parseFloat(document.getElementById('st-rate').value);
            DB.settings = s; toast('Tax settings saved');
        });
        if (tab === 'users') loadUsersTable();
        const gmapsForm = document.getElementById('settings-gmaps');
        if (gmapsForm) gmapsForm.addEventListener('submit', async e => {
            e.preventDefault();
            const s = DB.settings;
            s.googleMapsApiKey = document.getElementById('sn-gmaps-key').value.trim();
            DB.settings = s;
            if (s.googleMapsApiKey) {
                toast('Loading Google Maps...', 'warning');
                const ok = await loadGoogleMaps(s.googleMapsApiKey);
                if (ok) toast('Google Maps loaded — address autocomplete is now active');
                else toast('Failed to load Google Maps — check your API key', 'error');
            } else { toast('Google Maps API key cleared'); }
            window._settingsTab('notifications');
        });
        const notifForm = document.getElementById('settings-notif');
        if (notifForm) notifForm.addEventListener('submit', e => {
            e.preventDefault();
            const s = DB.settings;
            s.emailjsPublicKey = document.getElementById('sn-emailjs-pk').value.trim();
            s.emailjsServiceId = document.getElementById('sn-emailjs-sid').value.trim();
            s.emailjsTemplateId = document.getElementById('sn-emailjs-tid').value.trim();
            s.smsApiKey = document.getElementById('sn-sms-key').value.trim() || 'textbelt';
            DB.settings = s;
            if (s.emailjsPublicKey && typeof emailjs !== 'undefined') {
                emailjs.init(s.emailjsPublicKey);
            }
            toast('Email & SMS configuration saved');
        });
    }
    window._settingsTab = renderPanel;
    renderPanel(activeTab);
}

// ============================================
//  SHARED UTILITIES
// ============================================
function deleteRecord(collection, id) {
    let warnings = [];
    if (collection === 'customers') {
        const linkedOrders = DB.orders.filter(o => o.type === 'Sales' && o.customerId === id).length;
        const linkedInvoices = DB.invoices.filter(i => i.customerId === id).length;
        if (linkedOrders) warnings.push(`${linkedOrders} linked order(s)`);
        if (linkedInvoices) warnings.push(`${linkedInvoices} linked invoice(s)`);
    } else if (collection === 'suppliers') {
        const linkedItems = DB.inventory.filter(i => i.supplierId === id).length;
        const linkedPOs = DB.orders.filter(o => o.type === 'Purchase' && o.supplierId === id).length;
        if (linkedItems) warnings.push(`${linkedItems} linked inventory item(s)`);
        if (linkedPOs) warnings.push(`${linkedPOs} linked purchase order(s)`);
    } else if (collection === 'inventory') {
        const linkedLines = DB.orders.reduce((count, o) => count + o.items.filter(li => li.inventoryId === id).length, 0);
        if (linkedLines) warnings.push(`${linkedLines} linked order line(s)`);
    }
    const warningHTML = warnings.length
        ? `<p style="color:#DC2626;font-weight:600;margin-bottom:12px">Warning: This record has ${warnings.join(' and ')} that will be orphaned.</p>`
        : '';
    openModal('Confirm Delete',
        `${warningHTML}<p>Are you sure you want to delete this record? This action cannot be undone.</p>`,
        `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
         <button class="btn btn-danger" onclick="confirmDelete('${collection}',${id})">Delete</button>`
    );
}
function confirmDelete(collection, id) {
    let arr = DB[collection];
    arr = arr.filter(x => x.id !== id);
    DB[collection] = arr;
    closeModal();
    toast('Record deleted');
    navigateTo(currentPage);
}

function filterTable(input, tableId) {
    const val = input.value.toLowerCase();
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
    });
}
function filterStatus(select, tableId) {
    const val = select.value;
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        if (!val) { row.style.display = ''; return; }
        row.style.display = row.dataset.status === val ? '' : 'none';
    });
}
function filterByAttr(select, tableId, attr) {
    const val = select.value;
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    rows.forEach(row => {
        if (!val) { row.style.display = ''; return; }
        row.style.display = row.getAttribute(attr) === val ? '' : 'none';
    });
}

function exportTable(type) {
    let csv = '';
    const data = DB[type];
    if (!data.length) { toast('No data to export', 'warning'); return; }
    const flatKeys = Object.keys(data[0]).filter(k => {
        const v = data[0][k];
        return !Array.isArray(v) && typeof v !== 'object';
    });
    csv += flatKeys.join(',') + '\n';
    data.forEach(row => { csv += flatKeys.map(k => `"${String(row[k] ?? '').replace(/"/g,'""')}"`).join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `formationx_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast(`${type} exported as CSV`);
}

// ---- Global Search ----
// ---- Global Search with live dropdown ----
(function() {
    const input = document.getElementById('global-search');
    let dd = document.createElement('div');
    dd.className = 'search-dropdown';
    dd.style.display = 'none';
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(dd);

    function doSearch(q) {
        if (q.length < 2) { dd.style.display = 'none'; return; }
        const results = [];
        DB.customers.forEach(c => { if (`${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(q)) results.push({ icon: 'fa-user', type: 'Customer', name: `${c.firstName} ${c.lastName}`, sub: c.email, page: 'customers' }); });
        DB.jobs.forEach(j => { if (`${j.jobNum} ${j.description||''}`.toLowerCase().includes(q)) results.push({ icon: 'fa-wrench', type: 'Job', name: j.jobNum, sub: j.description||'', page: 'jobs' }); });
        DB.inventory.forEach(i => { if (`${i.name} ${i.sku}`.toLowerCase().includes(q)) results.push({ icon: 'fa-box', type: 'Part', name: i.name, sub: i.sku, page: 'inventory' }); });
        DB.invoices.forEach(i => { if (i.invoiceNum.toLowerCase().includes(q)) results.push({ icon: 'fa-file-invoice', type: 'Invoice', name: i.invoiceNum, sub: i.status, page: 'invoices' }); });
        DB.orders.forEach(o => { if (o.orderNum.toLowerCase().includes(q)) results.push({ icon: 'fa-truck', type: 'PO', name: o.orderNum, sub: o.status, page: 'orders' }); });
        DB.suppliers.forEach(s => { if (`${s.company} ${s.contact}`.toLowerCase().includes(q)) results.push({ icon: 'fa-truck', type: 'Supplier', name: s.company, sub: s.contact, page: 'suppliers' }); });
        if (!results.length) {
            dd.innerHTML = '<div style="padding:12px 16px;color:#94A3B8;font-size:13px;text-align:center">No results found</div>';
            dd.style.display = '';
            return;
        }
        dd.innerHTML = results.slice(0, 8).map(r =>
            `<div class="search-result" data-page="${r.page}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);">
                <i class="fas ${r.icon}" style="color:#64748B;width:16px;text-align:center;font-size:13px"></i>
                <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(r.name)}</div>
                    <div style="font-size:11px;color:#94A3B8">${escapeHTML(r.type)} · ${escapeHTML(r.sub).substring(0,40)}</div>
                </div>
            </div>`
        ).join('');
        dd.style.display = '';
        dd.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('mousedown', e => {
                e.preventDefault();
                navigateTo(el.dataset.page);
                input.value = '';
                dd.style.display = 'none';
            });
            el.addEventListener('mouseover', () => { el.style.background = 'var(--bg)'; });
            el.addEventListener('mouseout', () => { el.style.background = ''; });
        });
    }

    input.addEventListener('input', function() { doSearch(this.value.trim().toLowerCase()); });
    input.addEventListener('focus', function() { if (this.value.trim().length >= 2) doSearch(this.value.trim().toLowerCase()); });
    input.addEventListener('blur', () => setTimeout(() => { dd.style.display = 'none'; }, 200));
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') { dd.style.display = 'none'; this.blur(); }
        if (e.key === 'Enter') {
            const first = dd.querySelector('.search-result');
            if (first) { navigateTo(first.dataset.page); input.value = ''; dd.style.display = 'none'; }
        }
    });
})();

// ---- Notification badge update ----
function updateNotifBadge() {
    const alerts = DB.inventory.filter(i => i.status !== 'In Stock').length + DB.invoices.filter(i => i.status === 'Overdue' || i.status === 'Sent').length + DB.orders.filter(o => o.type === 'Purchase' && o.status === 'Ordered').length;
    const badge = document.getElementById('notif-badge');
    if (badge) { badge.textContent = alerts; badge.style.display = alerts ? '' : 'none'; }
}
setInterval(updateNotifBadge, 5000);

// ---- Test Send Functions ----
async function testEmailSend() {
    const s = DB.settings;
    if (!s.emailjsPublicKey || !s.emailjsServiceId || !s.emailjsTemplateId) {
        toast('Fill in all EmailJS fields first, then save', 'error'); return;
    }
    toast('Sending test email...', 'warning');
    try {
        if (typeof emailjs !== 'undefined') emailjs.init(s.emailjsPublicKey);
        await emailjs.send(s.emailjsServiceId, s.emailjsTemplateId, {
            to_email: s.email,
            to_name: 'Admin',
            from_name: s.companyName,
            invoice_number: 'TEST-0000',
            invoice_date: fmtDate(new Date().toISOString().split('T')[0]),
            due_date: 'N/A',
            message: 'This is a test email from ' + s.companyName + ' ERP. If you received this, email sending is working correctly!',
            subtotal: '$0.00', tax: '$0.00', total: '$0.00', balance_due: '$0.00',
            company_name: s.companyName, company_address: s.address, company_phone: s.phone, company_email: s.email
        }, s.emailjsPublicKey);
        toast('Test email sent successfully to ' + s.email);
    } catch (err) {
        toast('Test email failed: ' + (err.text || err.message || JSON.stringify(err)), 'error');
    }
}

async function backupData() {
    let backup;
    if (DB._useServer) {
        try {
            const resp = await fetch('/api/backup', { headers: authHeaders() });
            if (resp.ok) backup = await resp.json();
            else toast('Server backup fetch failed (HTTP ' + resp.status + ')', 'warning');
        } catch (err) { toast('Backup fetch error: ' + err.message, 'warning'); }
    }
    if (!backup) {
        backup = {};
        ['customers','suppliers','inventory','orders','invoices','jobs','settings'].forEach(k => { backup[k] = DB[k]; });
        backup._exportedAt = new Date().toISOString();
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `formationx_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast(`Backup exported${DB._useServer ? ' from file directory' : ''}`);
}

async function serverBackup() {
    if (!DB._useServer) { toast('Server not connected — cannot save server backup', 'warning'); return; }
    try {
        const resp = await fetch('/api/backup/file', { method: 'POST', headers: authHeaders() });
        if (!resp.ok) { toast('Server backup failed (HTTP ' + resp.status + ')', 'error'); return; }
        const data = await resp.json();
        toast(`Server backup saved: ${escapeHTML(data.filename)}`);
        loadServerBackupsList();
    } catch (err) { toast('Server backup error: ' + err.message, 'error'); }
}

async function loadServerBackupsList() {
    const container = document.getElementById('server-backups-list');
    if (!container || !DB._useServer) return;
    try {
        const resp = await fetch('/api/backups', { headers: authHeaders() });
        if (!resp.ok) return;
        const backups = await resp.json();
        if (!backups.length) { container.innerHTML = ''; return; }
        container.innerHTML = `<h4 style="margin-bottom:8px">Server Backups</h4>
            <table style="width:100%;font-size:13px;margin-bottom:24px">
                <thead><tr><th>Filename</th><th>Size</th><th>Created</th></tr></thead>
                <tbody>${backups.slice(0, 10).map(b => `<tr>
                    <td>${escapeHTML(b.filename)}</td>
                    <td>${(b.size / 1024).toFixed(1)} KB</td>
                    <td>${fmtDate(b.created.split('T')[0])}</td>
                </tr>`).join('')}</tbody>
            </table>`;
    } catch { /* ignore */ }
}

function restoreData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            const keys = ['customers','suppliers','inventory','orders','invoices','jobs','settings'];
            const valid = keys.some(k => backup[k]);
            if (!valid) { toast('Invalid backup file — no recognized collections found', 'error'); return; }
            if (!confirm('This will replace all current data. Continue?')) return;
            keys.forEach(k => { if (backup[k]) DB[k] = backup[k]; });
            if (DB._useServer) {
                const synced = await DB.syncToServer();
                if (!synced) toast('Warning: data restored locally but server sync failed', 'warning');
            }
            toast('Data restored' + (DB._useServer ? ' & synced to file directory' : ''));
            navigateTo(currentPage);
        } catch (err) {
            toast('Failed to read backup: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

async function testSmsSend() {
    const s = DB.settings;
    const phone = prompt('Enter phone number in international format (e.g. +61412345678):');
    if (!phone) return;
    toast('Sending test SMS...', 'warning');
    try {
        const resp = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone, message: 'Test from ' + s.companyName + ' ERP — SMS sending is working!', key: s.smsApiKey || 'textbelt' })
        });
        const data = await resp.json();
        if (data.success) toast('Test SMS sent to ' + phone);
        else toast('SMS failed: ' + (data.error || 'Unknown error. Free tier = 1 SMS/day.'), 'error');
    } catch (err) {
        toast('SMS failed: network error', 'error');
    }
}

// ---- User Management ----
async function loadUsersTable() {
    const container = document.getElementById('users-table-container');
    if (!container) return;
    try {
        const resp = await fetch('/api/users', { headers: authHeaders() });
        if (!resp.ok) { container.innerHTML = '<p style="color:#DC2626">Failed to load users</p>'; return; }
        const users = await resp.json();
        const roleClasses = { Administrator: 'sent', Manager: 'pending', Staff: 'draft', 'View Only': 'inactive' };
        const roleOptions = Object.keys(ROLES);
        container.innerHTML = `
            <div class="role-legend" style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;padding:16px;background:#F8FAFC;border-radius:8px;">
                ${roleOptions.map(r => `<div style="font-size:12px"><span class="badge badge-${roleClasses[r]||'draft'}">${escapeHTML(r)}</span> <span style="color:#64748B">${escapeHTML(ROLES[r].description)}</span></div>`).join('')}
            </div>
            <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>${users.map(u => `<tr>
                <td><strong>${escapeHTML(u.name)}</strong>${_currentUser && _currentUser.id === u.id ? ' <span style="color:#64748B;font-size:11px">(you)</span>' : ''}</td>
                <td>${escapeHTML(u.email)}</td>
                <td><select onchange="changeUserRole(${u.id},this.value)" style="font-size:13px;padding:4px 8px;border-radius:6px;border:1px solid #E2E8F0;cursor:pointer" ${_currentUser && _currentUser.id === u.id ? 'disabled title="Cannot change your own role"' : ''}>
                    ${roleOptions.map(r => `<option value="${escapeHTML(r)}" ${u.role===r?'selected':''}>${escapeHTML(r)}</option>`).join('')}
                </select></td>
                <td><div class="table-actions">
                    <button onclick="resetUserPassword(${u.id},'${escapeHTML(u.name)}')" title="Reset Password"><i class="fas fa-key"></i></button>
                    <button class="danger" onclick="deleteUser(${u.id},'${escapeHTML(u.name)}')" title="Delete User"><i class="fas fa-trash"></i></button>
                </div></td>
            </tr>`).join('')}</tbody></table>`;
    } catch (err) { container.innerHTML = '<p style="color:#DC2626">Error: ' + escapeHTML(err.message) + '</p>'; }
}

async function changeUserRole(userId, newRole) {
    try {
        const resp = await fetch('/api/users/' + userId + '/role', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ role: newRole })
        });
        const data = await resp.json();
        if (!resp.ok) { toast(data.error || 'Failed to change role', 'error'); loadUsersTable(); return; }
        toast('Role updated to ' + newRole);
    } catch (err) { toast('Error: ' + err.message, 'error'); loadUsersTable(); }
}

function showInviteUserForm() {
    const container = document.getElementById('invite-user-form-container');
    if (!container) return;
    container.innerHTML = `
        <div class="card" style="margin-top:20px;padding:24px;">
            <h4 style="margin-bottom:16px">Create New User</h4>
            <form id="invite-user-form">
                <div class="form-row">
                    <div class="form-group"><label>Full Name *</label><input type="text" id="iu-name" required></div>
                    <div class="form-group"><label>Email *</label><input type="email" id="iu-email" required></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label>Role</label><select id="iu-role" onchange="document.getElementById('iu-role-desc').textContent=this.options[this.selectedIndex].dataset.desc||''">
                        ${Object.entries(ROLES).map(([key, val]) => `<option value="${escapeHTML(key)}" data-desc="${escapeHTML(val.description)}">${escapeHTML(key)}</option>`).join('')}
                    </select><div id="iu-role-desc" style="font-size:12px;color:#64748B;margin-top:4px">${ROLES['Administrator'].description}</div></div>
                    <div class="form-group"><label>Password *</label><input type="password" id="iu-password" required minlength="6"></div>
                </div>
                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:12px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('invite-user-form-container').innerHTML=''">Cancel</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-user-plus"></i> Create User</button>
                </div>
            </form>
        </div>`;
    document.getElementById('invite-user-form').addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('iu-name').value.trim();
        const email = document.getElementById('iu-email').value.trim();
        const role = document.getElementById('iu-role').value;
        const password = document.getElementById('iu-password').value;
        if (!name || !email || !password) { toast('All fields are required', 'error'); return; }
        if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
        try {
            const resp = await fetch('/api/users', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ name, email, role, password })
            });
            const data = await resp.json();
            if (!resp.ok) { toast(data.error || 'Failed to create user', 'error'); return; }
            toast(`User '${name}' created — they can now log in with ${email}`);
            container.innerHTML = '';
            loadUsersTable();
        } catch (err) { toast('Error: ' + err.message, 'error'); }
    });
}

function deleteUser(userId, userName) {
    if (_currentUser && _currentUser.id === userId) {
        toast('You cannot delete your own account', 'error');
        return;
    }
    openModal('Delete User',
        `<p>Are you sure you want to delete <strong>${escapeHTML(userName)}</strong>? They will no longer be able to log in.</p>`,
        `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
         <button class="btn btn-danger" onclick="confirmDeleteUser(${userId})">Delete User</button>`
    );
}

async function confirmDeleteUser(userId) {
    closeModal();
    try {
        const resp = await fetch('/api/users/' + userId, { method: 'DELETE', headers: authHeaders() });
        const data = await resp.json();
        if (!resp.ok) { toast(data.error || 'Failed to delete user', 'error'); return; }
        toast('User deleted');
        loadUsersTable();
    } catch (err) { toast('Error: ' + err.message, 'error'); }
}

function resetUserPassword(userId, userName) {
    openModal('Reset Password',
        `<p>Set a new password for <strong>${escapeHTML(userName)}</strong>:</p>
         <div class="form-group" style="margin-top:12px"><input type="password" id="reset-pw" placeholder="New password (min 6 chars)" minlength="6"></div>`,
        `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
         <button class="btn btn-primary" onclick="confirmResetPassword(${userId})">Reset Password</button>`
    );
}

async function confirmResetPassword(userId) {
    const pw = document.getElementById('reset-pw').value;
    if (!pw || pw.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }
    closeModal();
    try {
        const resp = await fetch('/api/users/change-password', {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ userId, newPassword: pw })
        });
        const data = await resp.json();
        if (!resp.ok) { toast(data.error || 'Failed to reset password', 'error'); return; }
        toast('Password updated');
    } catch (err) { toast('Error: ' + err.message, 'error'); }
}
