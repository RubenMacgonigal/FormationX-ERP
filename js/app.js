/* ============================================
   FormationX ERP — Application Logic
   ============================================ */

// ---- Data Store (localStorage + file directory backend) ----
const DEFAULT_SETTINGS = { companyName: 'FormationX Auto', abn: '12 345 678 901', email: 'service@formationxauto.com.au', phone: '(02) 9876 5432', address: '38 Parramatta Rd, Homebush NSW 2140', taxRate: 10, invoicePrefix: 'INV', nextInvoiceNum: 1001, paymentTerms: 14, emailjsPublicKey: '', emailjsServiceId: '', emailjsTemplateId: '', smsApiKey: 'textbelt' };

const DB = {
    _useServer: false,

    load(key, fallback) {
        try { return JSON.parse(localStorage.getItem('fx_' + key)) || fallback; }
        catch { return fallback; }
    },
    save(key, data) {
        localStorage.setItem('fx_' + key, JSON.stringify(data));
        if (this._useServer) {
            fetch('/api/' + key, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).catch(() => {});
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
    get invoices() { return this.load('invoices', []); },
    set invoices(v) { this.save('invoices', v); },
    get settings() { return this.load('settings', DEFAULT_SETTINGS); },
    set settings(v) { this.save('settings', v); },
    nextId(arr) { return arr.length ? Math.max(...arr.map(i => i.id)) + 1 : 1; },

    async syncFromServer() {
        try {
            const resp = await fetch('/api/backup');
            if (!resp.ok) return false;
            const data = await resp.json();
            ['customers','suppliers','inventory','orders','invoices','settings'].forEach(k => {
                if (data[k] && (Array.isArray(data[k]) ? data[k].length : Object.keys(data[k]).length)) {
                    localStorage.setItem('fx_' + k, JSON.stringify(data[k]));
                }
            });
            return true;
        } catch { return false; }
    },

    async syncToServer() {
        try {
            const backup = {};
            ['customers','suppliers','inventory','orders','invoices','settings'].forEach(k => { backup[k] = this[k]; });
            await fetch('/api/restore', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(backup) });
            return true;
        } catch { return false; }
    },

    async detectServer() {
        try {
            const resp = await fetch('/api/backup', { method: 'GET' });
            this._useServer = resp.ok;
            return resp.ok;
        } catch { this._useServer = false; return false; }
    }
};

// ---- Seed Data ----
const APP_VERSION = '2.0';
function seedData() {
    if (DB.customers.length && localStorage.getItem('fx_version') === APP_VERSION) return;
    localStorage.getItem('fx_version') !== APP_VERSION && localStorage.clear();
    localStorage.setItem('fx_version', APP_VERSION);
    DB.customers = [
        { id: 1, firstName: 'James', lastName: 'Mitchell', email: 'james.m@outlook.com', phone: '0412 345 678', company: '', abn: '', billingAddress: '45 Pitt St, Sydney NSW 2000', shippingAddress: '45 Pitt St, Sydney NSW 2000', status: 'Active', notes: 'Vehicle: 2022 Toyota Camry', created: '2026-01-15' },
        { id: 2, firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@gmail.com', phone: '0423 456 789', company: 'Chen Transport', abn: '22 333 444 555', billingAddress: '12 Harbour Dr, Melbourne VIC 3000', shippingAddress: '12 Harbour Dr, Melbourne VIC 3000', status: 'Active', notes: 'Fleet customer — 5 vehicles', created: '2026-02-03' },
        { id: 3, firstName: 'David', lastName: 'Thompson', email: 'd.thompson@corp.com', phone: '0434 567 890', company: '', abn: '', billingAddress: '78 Queen St, Brisbane QLD 4000', shippingAddress: '78 Queen St, Brisbane QLD 4000', status: 'Active', notes: 'Vehicle: 2019 Ford Ranger', created: '2026-02-20' },
        { id: 4, firstName: 'Emma', lastName: 'Williams', email: 'emma.w@business.com', phone: '0445 678 901', company: 'Williams Couriers', abn: '44 555 666 777', billingAddress: '23 King St, Perth WA 6000', shippingAddress: '23 King St, Perth WA 6000', status: 'Active', notes: 'Vehicle: 2021 Hyundai Tucson', created: '2026-03-10' },
        { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'mbrown@email.com', phone: '0456 789 012', company: '', abn: '', billingAddress: '56 Flinders Ln, Adelaide SA 5000', shippingAddress: '56 Flinders Ln, Adelaide SA 5000', status: 'Inactive', notes: 'Account on hold — disputed invoice', created: '2026-01-08' },
    ];
    DB.suppliers = [
        { id: 1, company: 'Repco Trade', contact: 'Robert Lee', email: 'trade@repco.com.au', phone: '0478 111 222', address: '88 Industrial Ave, Parramatta NSW 2150', abn: '66 777 888 999', category: 'Engine Parts', paymentTerms: 30, status: 'Active', notes: '' },
        { id: 2, company: 'Burson Auto Parts', contact: 'Linda Nguyen', email: 'linda@burson.com.au', phone: '0489 222 333', address: '15 Factory Rd, Clayton VIC 3168', abn: '77 888 999 000', category: 'Brakes & Filters', paymentTerms: 15, status: 'Active', notes: 'Bulk discount on brake pads' },
        { id: 3, company: 'Castrol Australia', contact: 'Alan Foster', email: 'alan@castrol.com.au', phone: '0490 333 444', address: '200 Industrial Park, Macquarie Park NSW 2113', abn: '88 999 000 111', category: 'Fluids & Oils', paymentTerms: 30, status: 'Active', notes: '' },
        { id: 4, company: 'AutoElec Supplies', contact: 'Karen White', email: 'karen@autoelec.com.au', phone: '0401 444 555', address: '42 Motorway Dr, Botany NSW 2019', abn: '99 000 111 222', category: 'Electrical', paymentTerms: 30, status: 'Active', notes: 'Batteries and alternators' },
    ];
    // Quantities reflect depletion from fulfilled orders SO-0001 and SO-0002
    // SO-0001 used: 1x Oil Filter, 1x Engine Oil, 4x Spark Plug
    // SO-0002 used: 2x Brake Pad Set, 2x Brake Disc Rotor
    DB.inventory = [
        { id: 1, sku: 'FX-1001', name: 'Oil Filter (Standard)', category: 'Filters', supplierId: 1, costPrice: 6.50, unitPrice: 18.00, quantity: 119, reorderLevel: 20, status: 'In Stock' },
        { id: 2, sku: 'FX-1002', name: 'Brake Pad Set (Front)', category: 'Brakes', supplierId: 2, costPrice: 35.00, unitPrice: 89.00, quantity: 38, reorderLevel: 10, status: 'In Stock' },
        { id: 3, sku: 'FX-1003', name: 'Engine Oil 5W-30 (5L)', category: 'Fluids & Oils', supplierId: 3, costPrice: 22.00, unitPrice: 54.99, quantity: 7, reorderLevel: 15, status: 'Low Stock' },
        { id: 4, sku: 'FX-1004', name: 'Air Filter', category: 'Filters', supplierId: 1, costPrice: 8.00, unitPrice: 24.00, quantity: 65, reorderLevel: 15, status: 'In Stock' },
        { id: 5, sku: 'FX-1005', name: 'Spark Plug (Single)', category: 'Engine Parts', supplierId: 1, costPrice: 4.50, unitPrice: 12.00, quantity: 196, reorderLevel: 40, status: 'In Stock' },
        { id: 6, sku: 'FX-1006', name: 'Brake Disc Rotor (Front)', category: 'Brakes', supplierId: 2, costPrice: 45.00, unitPrice: 110.00, quantity: 0, reorderLevel: 5, status: 'Out of Stock' },
        { id: 7, sku: 'FX-1007', name: 'Car Battery 12V', category: 'Electrical', supplierId: 4, costPrice: 85.00, unitPrice: 189.00, quantity: 14, reorderLevel: 5, status: 'In Stock' },
        { id: 8, sku: 'FX-1008', name: 'Coolant (1L)', category: 'Fluids & Oils', supplierId: 3, costPrice: 5.00, unitPrice: 14.99, quantity: 90, reorderLevel: 20, status: 'In Stock' },
    ];
    const today = new Date();
    const d = (offset) => { const dt = new Date(today); dt.setDate(dt.getDate() - offset); return dt.toISOString().split('T')[0]; };
    DB.orders = [
        { id: 1, type: 'Sales', orderNum: 'SO-0001', date: d(45), customerId: 1, items: [{ inventoryId: 1, qty: 1, price: 18.00, discount: 0 }, { inventoryId: 3, qty: 1, price: 54.99, discount: 0 }, { inventoryId: 5, qty: 4, price: 12.00, discount: 0 }], status: 'Fulfilled', paymentStatus: 'Paid', notes: 'Full service — 2022 Toyota Camry' },
        { id: 2, type: 'Sales', orderNum: 'SO-0002', date: d(30), customerId: 2, items: [{ inventoryId: 2, qty: 2, price: 89.00, discount: 5 }, { inventoryId: 6, qty: 2, price: 110.00, discount: 0 }], status: 'Fulfilled', paymentStatus: 'Paid', notes: 'Front brake replacement — fleet vehicle 1' },
        { id: 3, type: 'Sales', orderNum: 'SO-0003', date: d(15), customerId: 3, items: [{ inventoryId: 7, qty: 1, price: 189.00, discount: 0 }, { inventoryId: 4, qty: 1, price: 24.00, discount: 0 }], status: 'Processing', paymentStatus: 'Unpaid', notes: 'Battery replacement + air filter — Ford Ranger' },
        { id: 4, type: 'Sales', orderNum: 'SO-0004', date: d(7), customerId: 4, items: [{ inventoryId: 1, qty: 3, price: 18.00, discount: 10 }, { inventoryId: 3, qty: 3, price: 54.99, discount: 0 }, { inventoryId: 8, qty: 2, price: 14.99, discount: 0 }], status: 'Pending', paymentStatus: 'Unpaid', notes: 'Bulk service — 3 courier vehicles' },
        { id: 5, type: 'Sales', orderNum: 'SO-0005', date: d(3), customerId: 2, items: [{ inventoryId: 6, qty: 4, price: 110.00, discount: 0 }], status: 'Draft', paymentStatus: 'Unpaid', notes: 'Awaiting rotor stock' },
        { id: 6, type: 'Purchase', orderNum: 'PO-0001', date: d(20), expectedDate: d(13), supplierId: 1, items: [{ inventoryId: 1, qty: 50, price: 6.50, discount: 0 }, { inventoryId: 5, qty: 100, price: 4.50, discount: 0 }], status: 'Received', paymentStatus: 'Paid', notes: 'Monthly restock — filters & spark plugs' },
        { id: 7, type: 'Purchase', orderNum: 'PO-0002', date: d(5), expectedDate: d(-2), supplierId: 2, items: [{ inventoryId: 6, qty: 10, price: 45.00, discount: 0 }, { inventoryId: 2, qty: 20, price: 35.00, discount: 0 }], status: 'Ordered', paymentStatus: 'Unpaid', notes: 'Restock brake parts — rotors out of stock' },
        { id: 8, type: 'Purchase', orderNum: 'PO-0003', date: d(2), expectedDate: d(-5), supplierId: 3, items: [{ inventoryId: 3, qty: 30, price: 22.00, discount: 0 }, { inventoryId: 8, qty: 50, price: 5.00, discount: 0 }], status: 'Ordered', paymentStatus: 'Unpaid', notes: 'Engine oil & coolant restock' },
    ];
    DB.invoices = [
        { id: 1, invoiceNum: 'INV-1001', orderId: 1, customerId: 1, date: d(44), dueDate: d(30), items: [{ description: 'Oil Filter (Standard)', qty: 1, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 1, rate: 54.99 }, { description: 'Spark Plug (Single)', qty: 4, rate: 12.00 }, { description: 'Labour — Full Service', qty: 1, rate: 150.00 }], status: 'Paid', amountPaid: 294.29, payments: [{ date: d(40), amount: 294.29, method: 'Card', ref: 'EFTPOS-1201' }], notes: '', sentLog: [{ type: 'email', to: 'james.m@outlook.com', date: d(44) }, { type: 'sms', to: '0412 345 678', date: d(44) }] },
        { id: 2, invoiceNum: 'INV-1002', orderId: 2, customerId: 2, date: d(29), dueDate: d(15), items: [{ description: 'Brake Pad Set (Front)', qty: 2, rate: 84.55 }, { description: 'Brake Disc Rotor (Front)', qty: 2, rate: 110.00 }, { description: 'Labour — Brake Replacement', qty: 1, rate: 220.00 }], status: 'Paid', amountPaid: 678.81, payments: [{ date: d(20), amount: 678.81, method: 'Bank Transfer', ref: 'TXN-88201' }], notes: '', sentLog: [{ type: 'email', to: 'sarah.chen@gmail.com', date: d(29) }] },
        { id: 3, invoiceNum: 'INV-1003', orderId: 3, customerId: 3, date: d(14), dueDate: d(-2), items: [{ description: 'Car Battery 12V', qty: 1, rate: 189.00 }, { description: 'Air Filter', qty: 1, rate: 24.00 }, { description: 'Labour — Battery + Filter', qty: 1, rate: 85.00 }], status: 'Overdue', amountPaid: 0, payments: [], notes: '', sentLog: [{ type: 'email', to: 'd.thompson@corp.com', date: d(14) }, { type: 'sms', to: '0434 567 890', date: d(14) }] },
        { id: 4, invoiceNum: 'INV-1004', orderId: null, customerId: 4, date: d(5), dueDate: d(9), items: [{ description: 'Oil Filter (Standard)', qty: 3, rate: 18.00 }, { description: 'Engine Oil 5W-30 (5L)', qty: 3, rate: 54.99 }, { description: 'Coolant (1L)', qty: 2, rate: 14.99 }, { description: 'Labour — Multi-Vehicle Service', qty: 1, rate: 380.00 }], status: 'Sent', amountPaid: 0, payments: [], notes: 'Fleet service for Williams Couriers', sentLog: [{ type: 'email', to: 'emma.w@business.com', date: d(5) }, { type: 'sms', to: '0445 678 901', date: d(5) }] },
    ];
    const s = DB.settings;
    s.nextInvoiceNum = 1005;
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
function getCustomerName(id) { const c = DB.customers.find(c => c.id === id); return c ? `${c.firstName} ${c.lastName}` : '—'; }
function getCustomerCompany(id) { const c = DB.customers.find(c => c.id === id); return c ? c.company : '—'; }
function getSupplierName(id) { const s = DB.suppliers.find(s => s.id === id); return s ? s.company : '—'; }
function getInventoryItem(id) { return DB.inventory.find(i => i.id === id); }

function toast(msg, type = 'success') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="fas ${icons[type]}"></i><span>${msg}</span>`;
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
    currentPage = page;
    destroyCharts();
    checkOverdueInvoices();
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (nav) nav.classList.add('active');
    document.getElementById('breadcrumb').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    closeQuickAdd();
    const renders = { dashboard: renderDashboard, customers: renderCustomers, suppliers: renderSuppliers, inventory: renderInventory, orders: renderOrders, invoices: renderInvoices, reports: renderReports, settings: renderSettings };
    if (renders[page]) renders[page]();
    updateNotifBadge();
}

document.querySelector('.sidebar-nav').addEventListener('click', e => {
    const item = e.target.closest('.nav-item');
    if (item && item.dataset.page) { e.preventDefault(); navigateTo(item.dataset.page); }
});

// ---- Login ----
document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pw = document.getElementById('login-password').value;
    if (email === 'admin@formationx.com' && pw === 'admin123') {
        document.getElementById('login-btn').textContent = 'Loading...';
        document.getElementById('login-btn').disabled = true;
        (async () => {
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
            const st = DB.settings;
            if (st.emailjsPublicKey && typeof emailjs !== 'undefined') {
                emailjs.init(st.emailjsPublicKey);
            }
            navigateTo('dashboard');
            if (serverAvailable) toast('Connected to file directory backend', 'success');
        })();
    } else {
        const err = document.getElementById('login-error');
        err.textContent = 'Invalid email or password. Please try again.';
        err.classList.remove('hidden');
    }
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
    sb.classList.toggle('collapsed');
    localStorage.setItem('fx_sidebar_collapsed', sb.classList.contains('collapsed'));
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
function showQuickAdd() { document.getElementById('quick-add-menu').classList.toggle('hidden'); }
function closeQuickAdd() { document.getElementById('quick-add-menu').classList.add('hidden'); }
function showNotifications() {
    const lowStock = DB.inventory.filter(i => i.status !== 'In Stock');
    const overdue = DB.invoices.filter(i => i.status === 'Overdue');
    const sent = DB.invoices.filter(i => i.status === 'Sent');
    const items = [];
    lowStock.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('inventory')" style="cursor:pointer"><div class="alert-dot ${i.status==='Out of Stock'?'red':'amber'}"></div><div class="alert-text"><strong>${i.name}</strong> — ${i.status} (${i.quantity} left)</div></div>`));
    overdue.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('invoices')" style="cursor:pointer"><div class="alert-dot red"></div><div class="alert-text"><strong>${i.invoiceNum}</strong> overdue — ${getCustomerName(i.customerId)}</div></div>`));
    sent.forEach(i => items.push(`<div class="alert-item" onclick="closeModal();navigateTo('invoices')" style="cursor:pointer"><div class="alert-dot blue"></div><div class="alert-text"><strong>${i.invoiceNum}</strong> awaiting payment — ${getCustomerName(i.customerId)}</div></div>`));
    const pendingPOs = DB.orders.filter(o => o.type === 'Purchase' && o.status === 'Ordered');
    pendingPOs.forEach(o => items.push(`<div class="alert-item" onclick="closeModal();_activeOrderTab='Purchase';navigateTo('orders')" style="cursor:pointer"><div class="alert-dot blue"></div><div class="alert-text"><strong>${o.orderNum}</strong> — awaiting delivery from ${getSupplierName(o.supplierId)}</div></div>`));
    if (!items.length) {
        openModal('Notifications', '<p style="color:#64748B;text-align:center;padding:20px">No notifications</p>', '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    } else {
        openModal('Notifications', items.join(''), '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
    }
}
function toggleUserMenu() { toast('User menu — Admin logged in', 'success'); }
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
    const renders = { customer: renderCustomerForm, supplier: renderSupplierForm, inventory: renderInventoryForm, order: renderOrderForm, purchaseOrder: renderPurchaseOrderForm, invoice: renderInvoiceForm, payment: renderPaymentForm, orderDetail: renderOrderDetail, invoiceDetail: renderInvoiceDetail };
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
    const orders = DB.orders.filter(o => o.type === 'Sales');
    const invoices = DB.invoices;
    const inventory = DB.inventory;

    const totalRevenue = invoices.reduce((s, inv) => s + calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items)), 0);
    const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, inv) => {
        const total = calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items));
        return s + total - inv.amountPaid;
    }, 0);
    const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const lowStock = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;
    const grossProfit = invoices.filter(i => i.status === 'Paid').reduce((s, inv) => {
        return s + inv.items.reduce((is, li) => {
            const item = DB.inventory.find(x => x.name === li.description);
            const cost = item ? item.costPrice * li.qty : 0;
            return is + (li.qty * li.rate) - cost;
        }, 0);
    }, 0);

    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="kpi-grid">
            <div class="kpi-card" onclick="navigateTo('invoices')">
                <div class="kpi-top">
                    <div class="kpi-icon blue"><i class="fas fa-dollar-sign"></i></div>
                    <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> 12.5%</div>
                </div>
                <div class="kpi-value">${fmt(totalRevenue)}</div>
                <div class="kpi-label">Total Revenue</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('invoices')">
                <div class="kpi-top">
                    <div class="kpi-icon amber"><i class="fas fa-file-invoice-dollar"></i></div>
                    <div class="kpi-trend down"><i class="fas fa-arrow-down"></i> 3.2%</div>
                </div>
                <div class="kpi-value">${fmt(outstanding)}</div>
                <div class="kpi-label">Outstanding Invoices</div>
            </div>
            <div class="kpi-card" onclick="navigateTo('orders')">
                <div class="kpi-top">
                    <div class="kpi-icon green"><i class="fas fa-shopping-cart"></i></div>
                    <div class="kpi-trend up"><i class="fas fa-arrow-up"></i> 8.1%</div>
                </div>
                <div class="kpi-value">${activeOrders}</div>
                <div class="kpi-label">Active Orders</div>
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
                <div class="card-header"><h3>Recent Orders</h3><a href="#" onclick="navigateTo('orders');return false;" class="btn btn-ghost btn-sm">View All</a></div>
                <div class="card-body no-pad">
                    <table>
                        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>${orders.slice(-5).reverse().map(o => `
                            <tr style="cursor:pointer" onclick="navigateTo('orders')">
                                <td><strong>${o.orderNum}</strong></td>
                                <td>${getCustomerName(o.customerId)}</td>
                                <td>${fmt(calcOrderTotal(o.items))}</td>
                                <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                                <td>${fmtDate(o.date)}</td>
                            </tr>`).join('')}
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
                            <div class="alert-text"><strong>${i.name}</strong> — ${i.status} (${i.quantity} left)</div>
                        </div>`).join('')}
                    ${invoices.filter(i => i.status === 'Overdue').map(i => `
                        <div class="alert-item" onclick="navigateTo('invoices')">
                            <div class="alert-dot red"></div>
                            <div class="alert-text"><strong>${i.invoiceNum}</strong> overdue — ${getCustomerName(i.customerId)}</div>
                        </div>`).join('')}
                    ${invoices.filter(i => i.status === 'Sent').map(i => `
                        <div class="alert-item" onclick="navigateTo('invoices')">
                            <div class="alert-dot blue"></div>
                            <div class="alert-text"><strong>${i.invoiceNum}</strong> awaiting payment</div>
                        </div>`).join('')}
                    ${DB.orders.filter(o => o.type === 'Purchase' && o.status === 'Ordered').map(o => `
                        <div class="alert-item" onclick="window._orderTab='Purchase';navigateTo('orders')">
                            <div class="alert-dot blue"></div>
                            <div class="alert-text"><strong>${o.orderNum}</strong> — awaiting delivery from ${getSupplierName(o.supplierId)}</div>
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
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Customers <span class="record-count">${customers.length}</span></h1><p>Manage your customer database</p></div>
            <div class="page-header-right">
                <button class="btn btn-secondary" onclick="exportTable('customers')"><i class="fas fa-download"></i> Export</button>
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
                        return `<tr data-status="${c.status}">
                            <td>#${c.id}</td>
                            <td><strong>${c.firstName} ${c.lastName}</strong></td>
                            <td>${c.email}</td><td>${c.phone}</td><td>${c.company}</td>
                            <td>${orders.length}</td><td>${fmt(spent)}</td>
                            <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
                            <td><div class="table-actions">
                                <button onclick="openDrawer('customer',${c.id})" title="Edit"><i class="fas fa-pen"></i></button>
                                <button class="danger" onclick="deleteRecord('customers',${c.id})" title="Delete"><i class="fas fa-trash"></i></button>
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
            <div class="form-group"><label>Billing Address</label><textarea id="cf-billing">${c ? c.billingAddress : ''}</textarea></div>
            <div class="form-group">
                <label><input type="checkbox" id="cf-same" checked onchange="document.getElementById('cf-shipping').disabled=this.checked"> Shipping same as billing</label>
            </div>
            <div class="form-group"><label>Shipping Address</label><textarea id="cf-shipping" disabled>${c ? c.shippingAddress : ''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label>Status</label><select id="cf-status"><option ${c && c.status==='Active'?'selected':''}>Active</option><option ${c && c.status==='Inactive'?'selected':''}>Inactive</option></select></div>
            </div>
            <div class="form-group"><label>Notes</label><textarea id="cf-notes">${c ? c.notes : ''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${c ? 'Update' : 'Create'} Customer</button>
            </div>
        </form>`;
    document.getElementById('customer-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            id: c ? c.id : DB.nextId(DB.customers),
            firstName: document.getElementById('cf-first').value,
            lastName: document.getElementById('cf-last').value,
            email: document.getElementById('cf-email').value,
            phone: document.getElementById('cf-phone').value,
            company: document.getElementById('cf-company').value,
            abn: document.getElementById('cf-abn').value,
            billingAddress: document.getElementById('cf-billing').value,
            shippingAddress: document.getElementById('cf-same').checked ? document.getElementById('cf-billing').value : document.getElementById('cf-shipping').value,
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
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Suppliers <span class="record-count">${suppliers.length}</span></h1><p>Manage your vendor relationships</p></div>
            <div class="page-header-right">
                <button class="btn btn-secondary" onclick="exportTable('suppliers')"><i class="fas fa-download"></i> Export</button>
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
                <tbody>${suppliers.map(s => `<tr data-status="${s.status}">
                    <td>#${s.id}</td><td><strong>${s.company}</strong></td><td>${s.contact}</td>
                    <td>${s.email}</td><td>${s.phone}</td>
                    <td><span class="badge badge-sent">${s.category}</span></td>
                    <td>Net ${s.paymentTerms}</td>
                    <td><span class="badge badge-${s.status.toLowerCase()}">${s.status}</span></td>
                    <td><div class="table-actions">
                        <button onclick="openDrawer('supplier',${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="danger" onclick="deleteRecord('suppliers',${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
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
            <div class="form-group"><label>Address</label><textarea id="sf-address">${s?s.address:''}</textarea></div>
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
    document.getElementById('supplier-form').addEventListener('submit', e => {
        e.preventDefault();
        const data = {
            id: s ? s.id : DB.nextId(DB.suppliers),
            company: document.getElementById('sf-company').value,
            contact: document.getElementById('sf-contact').value,
            email: document.getElementById('sf-email').value,
            phone: document.getElementById('sf-phone').value,
            abn: document.getElementById('sf-abn').value,
            address: document.getElementById('sf-address').value,
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
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Inventory <span class="record-count">${items.length}</span></h1><p>Track products and stock levels</p></div>
            <div class="page-header-right">
                <button class="btn btn-secondary" onclick="exportTable('inventory')"><i class="fas fa-download"></i> Export</button>
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
                    return `<tr data-status="${i.status}" data-stock="${i.status}" data-cat="${i.category}" class="${i.status==='Out of Stock'?'row-danger':''}">
                    <td><code>${i.sku}</code></td><td><strong>${i.name}</strong></td><td>${i.category}</td>
                    <td>${getSupplierName(i.supplierId)}</td>
                    <td>${fmt(i.costPrice)}</td><td>${fmt(i.unitPrice)}</td>
                    <td><strong>${i.quantity}</strong></td>
                    <td>${incoming ? `<span style="color:#16A34A;font-weight:600">+${incoming}</span>` : '<span style="color:#CBD5E1">—</span>'}</td>
                    <td>${i.reorderLevel}</td>
                    <td><span class="badge badge-${i.status.toLowerCase().replace(/\s/g,'-')}">${i.status}</span></td>
                    <td><div class="table-actions">
                        <button onclick="openDrawer('inventory',${i.id})" title="Edit"><i class="fas fa-pen"></i></button>
                        <button class="danger" onclick="deleteRecord('inventory',${i.id})" title="Delete"><i class="fas fa-trash"></i></button>
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
//  ORDERS
// ============================================
let _activeOrderTab = 'Sales';

function renderOrders() {
    const orders = DB.orders;
    const el = document.getElementById('page-content');
    function render(tab) {
        _activeOrderTab = tab;
        const filtered = orders.filter(o => o.type === tab);
        const isSales = tab === 'Sales';
        const statusOpts = isSales
            ? ['Draft','Pending','Processing','Fulfilled','Cancelled']
            : ['Draft','Ordered','Received','Cancelled'];
        el.innerHTML = `
            <div class="page-header">
                <div class="page-header-left"><h1>${isSales ? 'Sales Orders' : 'Purchase Orders'} <span class="record-count">${filtered.length}</span></h1>
                    <p>${isSales ? 'Customer sales — retail pricing' : 'Supplier stock orders — cost pricing'}</p></div>
                <div class="page-header-right">
                    <button class="btn btn-secondary" onclick="exportTable('orders')"><i class="fas fa-download"></i> Export</button>
                    <button class="btn btn-primary" onclick="openDrawer('${isSales?'order':'purchaseOrder'}')"><i class="fas fa-plus"></i> ${isSales ? 'New Sales Order' : 'New Purchase Order'}</button>
                </div>
            </div>
            <div class="tabs">
                <button class="tab ${tab==='Sales'?'active':''}" onclick="window._orderTab('Sales')">Sales Orders</button>
                <button class="tab ${tab==='Purchase'?'active':''}" onclick="window._orderTab('Purchase')">Purchase Orders</button>
            </div>
            <div class="filter-bar">
                <div class="search-input"><i class="fas fa-search"></i><input type="text" placeholder="Search orders..." onkeyup="filterTable(this,'orders-table')"></div>
                <select onchange="filterStatus(this,'orders-table')"><option value="">All Status</option>${statusOpts.map(s=>`<option>${s}</option>`).join('')}</select>
            </div>
            <div class="card"><div class="card-body no-pad"><div class="table-wrapper">
                <table id="orders-table">
                    <thead><tr>
                        <th>Order #</th><th>Date</th>
                        <th>${isSales?'Customer':'Supplier'}</th>
                        <th>Items</th>
                        <th>${isSales?'Total (Retail)':'Total (Cost)'}</th>
                        <th>Status</th>
                        <th>${isSales?'Payment':''}</th>
                        ${!isSales?'<th>Expected</th>':''}
                        <th>Actions</th>
                    </tr></thead>
                    <tbody>${filtered.map(o => {
                        const statusClass = o.status.toLowerCase().replace(/\s/g,'-');
                        return `<tr data-status="${o.status}">
                        <td><strong>${o.orderNum}</strong></td><td>${fmtDate(o.date)}</td>
                        <td>${isSales?getCustomerName(o.customerId):getSupplierName(o.supplierId)}</td>
                        <td>${o.items.length}</td><td>${fmt(calcOrderTotal(o.items))}</td>
                        <td><span class="badge badge-${statusClass==='ordered'?'sent':statusClass==='received'?'fulfilled':statusClass}">${o.status}</span></td>
                        ${isSales?`<td><span class="badge badge-${o.paymentStatus.toLowerCase()}">${o.paymentStatus}</span></td>`:''}
                        ${!isSales?`<td>${fmtDate(o.expectedDate||'')}</td>`:''}
                        <td><div class="table-actions">
                            <button onclick="viewOrderDetail(${o.id})" title="View"><i class="fas fa-eye"></i></button>
                            <button onclick="openDrawer('${isSales?'order':'purchaseOrder'}',${o.id})" title="Edit"><i class="fas fa-pen"></i></button>
                            ${o.status==='Fulfilled'&&isSales?`<button onclick="generateInvoice(${o.id})" title="Generate Invoice"><i class="fas fa-file-invoice"></i></button>`:''}
                            <button class="danger" onclick="deleteRecord('orders',${o.id})" title="Delete"><i class="fas fa-trash"></i></button>
                        </div></td>
                    </tr>`}).join('')}</tbody>
                </table>
            </div></div></div>`;
    }
    window._orderTab = render;
    render(_activeOrderTab);
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
        ${o.notes?`<div class="detail-field" style="margin-top:16px"><label>Notes</label><span>${o.notes}</span></div>`:''}
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

// ---- Sales Order Form ----
function renderOrderForm(id) {
    const o = id ? DB.orders.find(x => x.id === id) : null;
    if (o && o.type === 'Purchase') { renderPurchaseOrderForm(id); return; }
    const customers = DB.customers.filter(c => c.status === 'Active');
    const items = DB.inventory;
    document.getElementById('drawer-title').textContent = o ? 'Edit Sales Order' : 'New Sales Order';
    const lineItems = o ? o.items : [{ inventoryId: '', qty: 1, price: 0, discount: 0 }];

    document.getElementById('drawer-body').innerHTML = `
        <div style="padding:8px 12px;border-radius:8px;margin-bottom:16px;font-size:13px;font-weight:600;color:#2563EB;background:#EFF6FF">
            <i class="fas fa-shopping-cart"></i> Sales Order — uses retail pricing
        </div>
        <form id="order-form">
            <div class="form-row">
                <div class="form-group"><label>Customer *</label><select id="of-customer" required>
                    <option value="">Select customer...</option>
                    ${customers.map(c=>`<option value="${c.id}" ${o&&o.customerId===c.id?'selected':''}>${c.firstName} ${c.lastName}${c.company?' — '+c.company:''}</option>`).join('')}
                </select></div>
                <div class="form-group"><label>Date</label><input type="date" id="of-date" value="${o?o.date:new Date().toISOString().split('T')[0]}"></div>
            </div>
            <div class="form-group"><label>Status</label><select id="of-status">
                ${['Draft','Pending','Processing','Fulfilled','Cancelled'].map(s=>`<option ${o&&o.status===s?'selected':''}>${s}</option>`).join('')}
            </select></div>
            <h4 style="margin:16px 0 8px">Line Items <span style="font-weight:400;color:#64748B;font-size:12px">(retail prices)</span></h4>
            <div id="order-lines">
                ${lineItems.map((li,idx) => orderLineHTML(idx, li, items, 'retail')).join('')}
            </div>
            <button type="button" class="btn btn-ghost btn-sm" onclick="addOrderLine('retail')" style="margin-top:8px"><i class="fas fa-plus"></i> Add Line</button>
            <div class="totals-section" style="margin-top:16px">
                <table class="totals-table">
                    <tr><td>Subtotal</td><td id="order-subtotal">${fmt(0)}</td></tr>
                    <tr><td>GST (${DB.settings.taxRate}%)</td><td id="order-tax">${fmt(0)}</td></tr>
                    <tr class="grand-total"><td>Total</td><td id="order-total">${fmt(0)}</td></tr>
                </table>
            </div>
            <div class="form-group" style="margin-top:16px"><label>Notes</label><textarea id="of-notes">${o?o.notes:''}</textarea></div>
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:24px;">
                <button type="button" class="btn btn-secondary" onclick="closeDrawer()">Cancel</button>
                <button type="submit" class="btn btn-primary">${o?'Update':'Create'} Sales Order</button>
            </div>
        </form>`;
    recalcOrder();
    document.getElementById('order-form').addEventListener('submit', e => {
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
        const nextNum = DB.orders.filter(x=>x.type==='Sales').length + 1;
        const data = {
            id: o ? o.id : DB.nextId(DB.orders),
            type: 'Sales',
            orderNum: o ? o.orderNum : `SO-${String(nextNum).padStart(4,'0')}`,
            date: document.getElementById('of-date').value,
            customerId: parseInt(document.getElementById('of-customer').value),
            items: lines,
            status: document.getElementById('of-status').value,
            paymentStatus: o ? o.paymentStatus : 'Unpaid',
            notes: document.getElementById('of-notes').value
        };
        let arr = DB.orders;
        if (o) { const idx = arr.findIndex(x => x.id === o.id); arr[idx] = data; }
        else arr.push(data);
        DB.orders = arr;
        const wasFulfilled = o && o.status === 'Fulfilled';
        const nowFulfilled = data.status === 'Fulfilled';
        if (nowFulfilled && !wasFulfilled) {
            let inv = DB.inventory;
            data.items.forEach(li => {
                const ii = inv.findIndex(x => x.id === li.inventoryId);
                if (ii !== -1) {
                    inv[ii].quantity = Math.max(0, inv[ii].quantity - li.qty);
                    inv[ii].status = inv[ii].quantity === 0 ? 'Out of Stock' : inv[ii].quantity <= inv[ii].reorderLevel ? 'Low Stock' : 'In Stock';
                }
            });
            DB.inventory = inv;
        }
        closeDrawer(); toast(o ? 'Sales order updated' : `Sales order ${data.orderNum} created`); renderOrders();
    });
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
        const nextNum = DB.orders.filter(x=>x.type==='Purchase').length + 1;
        const newStatus = document.getElementById('po-status').value;
        const data = {
            id: o ? o.id : DB.nextId(DB.orders),
            type: 'Purchase',
            orderNum: o ? o.orderNum : `PO-${String(nextNum).padStart(4,'0')}`,
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
        else arr.push(data);
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

function generateInvoice(orderId) {
    const o = DB.orders.find(x => x.id === orderId);
    if (!o) return;
    const existing = DB.invoices.find(i => i.orderId === orderId);
    if (existing) { toast(`Invoice ${existing.invoiceNum} already exists for this order`, 'warning'); return; }
    const settings = DB.settings;
    const inv = {
        id: DB.nextId(DB.invoices),
        invoiceNum: `${settings.invoicePrefix}-${settings.nextInvoiceNum}`,
        orderId: o.id,
        customerId: o.customerId,
        date: new Date().toISOString().split('T')[0],
        dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + settings.paymentTerms); return d.toISOString().split('T')[0]; })(),
        items: o.items.map(li => { const item = getInventoryItem(li.inventoryId); return { description: item ? item.name : 'Item', qty: li.qty, rate: li.price * (1 - (li.discount||0)/100) }; }),
        status: 'Sent',
        amountPaid: 0,
        payments: [],
        notes: `Generated from ${o.orderNum}`
    };
    let invoices = DB.invoices; invoices.push(inv); DB.invoices = invoices;
    settings.nextInvoiceNum++; DB.settings = settings;
    sendInvoiceNotification(inv.id);
    toast(`Invoice ${inv.invoiceNum} generated & sent from ${o.orderNum}`);
    navigateTo('invoices');
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
    const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Void').reduce((s, inv) => {
        const total = calcInvoiceSubtotal(inv.items) + calcTax(calcInvoiceSubtotal(inv.items));
        return s + total - inv.amountPaid;
    }, 0);
    const el = document.getElementById('page-content');
    el.innerHTML = `
        <div class="page-header">
            <div class="page-header-left"><h1>Invoices <span class="record-count">${invoices.length}</span></h1><p>${fmt(outstanding)} outstanding across ${invoices.filter(i=>i.status!=='Paid'&&i.status!=='Void').length} invoices</p></div>
            <div class="page-header-right">
                <button class="btn btn-secondary" onclick="exportTable('invoices')"><i class="fas fa-download"></i> Export</button>
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
                    return `<tr data-status="${inv.status}" class="${inv.status==='Overdue'?'row-danger':''}">
                        <td><strong>${inv.invoiceNum}</strong></td><td>${fmtDate(inv.date)}</td><td>${fmtDate(inv.dueDate)}</td>
                        <td>${getCustomerName(inv.customerId)}</td>
                        <td>${fmt(total)}</td><td>${fmt(inv.amountPaid)}</td><td>${fmt(balance)}</td>
                        <td><span class="badge badge-${inv.status.toLowerCase()}">${inv.status}</span></td>
                        <td><div class="table-actions">
                            <button onclick="viewInvoiceDetail(${inv.id})" title="View"><i class="fas fa-eye"></i></button>
                            ${inv.status!=='Paid'?`<button onclick="sendInvoiceNotification(${inv.id});renderInvoices()" title="Send via Email & SMS"><i class="fas fa-paper-plane"></i></button>`:''}
                            ${inv.status!=='Paid'?`<button onclick="openDrawer('payment',${inv.id})" title="Record Payment"><i class="fas fa-credit-card"></i></button>`:''}
                            <button onclick="showSendLog(${inv.id})" title="Send Log"><i class="fas fa-history"></i></button>
                            <button onclick="openDrawer('invoice',${inv.id})" title="Edit"><i class="fas fa-pen"></i></button>
                            <button class="danger" onclick="deleteRecord('invoices',${inv.id})" title="Delete"><i class="fas fa-trash"></i></button>
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
                <tbody>${inv.items.map(li => `<tr style="border-bottom:1px solid #E2E8F0"><td style="padding:10px 0">${li.description}</td><td style="text-align:center">${li.qty}</td><td style="text-align:center">${fmt(li.rate)}</td><td style="text-align:right">${fmt(li.qty*li.rate)}</td></tr>`).join('')}</tbody>
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
            <div class="report-card" onclick="showReport('sales')">
                <div class="report-card-icon" style="background:#EFF6FF;color:#2563EB"><i class="fas fa-chart-line"></i></div>
                <h4>Sales Report</h4><p>Revenue trends, top products, sales performance</p>
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
            <div class="report-card" onclick="showReport('fulfilment')">
                <div class="report-card-icon" style="background:#FAF5FF;color:#8B5CF6"><i class="fas fa-check-double"></i></div>
                <h4>Order Fulfilment</h4><p>Processing times, fulfilment rates, status</p>
            </div>
        </div>
        <div id="report-detail"></div>`;
}

function showReport(type) {
    destroyCharts();
    const container = document.getElementById('report-detail');
    const reports = { sales: renderSalesReport, inventory: renderInventoryReport, customers: renderCustomerReport, suppliers: renderSupplierReport, financial: renderFinancialReport, fulfilment: renderFulfilmentReport };
    if (reports[type]) reports[type](container);
}

function renderSalesReport(el) {
    const orders = DB.orders.filter(o => o.type === 'Sales');
    const totalRev = orders.reduce((s, o) => s + calcOrderTotal(o.items), 0);
    const avgOrder = orders.length ? totalRev / orders.length : 0;
    el.innerHTML = `
        <div class="card" style="margin-bottom:20px">
            <div class="card-header"><h3>Sales Report</h3></div>
            <div class="card-body">
                <div class="kpi-grid" style="margin-bottom:24px">
                    <div class="kpi-card"><div class="kpi-value">${fmt(totalRev)}</div><div class="kpi-label">Total Revenue</div></div>
                    <div class="kpi-card"><div class="kpi-value">${orders.length}</div><div class="kpi-label">Total Orders</div></div>
                    <div class="kpi-card"><div class="kpi-value">${fmt(avgOrder)}</div><div class="kpi-label">Avg Order Value</div></div>
                    <div class="kpi-card"><div class="kpi-value">${orders.filter(o=>o.status==='Fulfilled').length}</div><div class="kpi-label">Fulfilled</div></div>
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
    const statuses = ['Draft','Pending','Processing','Fulfilled','Cancelled'];
    const statusCounts = statuses.map(s => orders.filter(o => o.status === s).length);
    chartInstances.salesStatus = new Chart(document.getElementById('salesStatusChart'), {
        type: 'doughnut', data: { labels: statuses, datasets: [{ data: statusCounts, backgroundColor: ['#94A3B8','#F59E0B','#0EA5E9','#16A34A','#DC2626'] }] },
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

function renderFulfilmentReport(el) {
    const orders = DB.orders.filter(o => o.type === 'Sales');
    const statuses = ['Draft','Pending','Processing','Fulfilled','Cancelled'];
    const counts = statuses.map(s => orders.filter(o => o.status === s).length);
    const rate = orders.length ? ((orders.filter(o=>o.status==='Fulfilled').length / orders.length)*100).toFixed(1) : 0;
    el.innerHTML = `
        <div class="card"><div class="card-header"><h3>Order Fulfilment Report</h3></div><div class="card-body">
            <div class="kpi-grid" style="margin-bottom:24px">
                <div class="kpi-card"><div class="kpi-value">${orders.length}</div><div class="kpi-label">Total Orders</div></div>
                <div class="kpi-card"><div class="kpi-value">${orders.filter(o=>o.status==='Fulfilled').length}</div><div class="kpi-label">Fulfilled</div></div>
                <div class="kpi-card"><div class="kpi-value">${rate}%</div><div class="kpi-label">Fulfilment Rate</div></div>
                <div class="kpi-card"><div class="kpi-value">${orders.filter(o=>o.status==='Pending'||o.status==='Processing').length}</div><div class="kpi-label">In Progress</div></div>
            </div>
            <div class="chart-container medium"><canvas id="fulfilChart"></canvas></div>
        </div></div>`;
    chartInstances.fulfil = new Chart(document.getElementById('fulfilChart'), {
        type: 'bar', data: { labels: statuses, datasets: [{ label: 'Orders', data: counts, backgroundColor: ['#94A3B8','#F59E0B','#0EA5E9','#16A34A','#DC2626'], borderRadius: 6 }] },
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
                    <div class="form-group"><label>Address</label><textarea id="sc-address">${settings.address}</textarea></div>
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
                <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td><strong>Admin User</strong></td><td>admin@formationx.com</td><td><span class="badge badge-sent">Administrator</span></td><td><span class="badge badge-active">Active</span></td></tr>
                    <tr><td><strong>Sales Manager</strong></td><td>sales@formationx.com</td><td><span class="badge badge-pending">Manager</span></td><td><span class="badge badge-active">Active</span></td></tr>
                    <tr><td><strong>Warehouse Staff</strong></td><td>warehouse@formationx.com</td><td><span class="badge badge-draft">Staff</span></td><td><span class="badge badge-active">Active</span></td></tr>
                </tbody></table>
                <button class="btn btn-primary" style="margin-top:16px" onclick="toast('Invite sent (prototype)','success')"><i class="fas fa-user-plus"></i> Invite User</button>
            </div>`,
            notifications: `<div class="settings-section"><h3>Email & SMS Configuration</h3>
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
                <div style="display:flex;gap:12px;margin-bottom:24px;">
                    <button class="btn btn-primary" onclick="backupData()"><i class="fas fa-download"></i> Export Backup (JSON)</button>
                    <label class="btn btn-secondary" style="cursor:pointer"><i class="fas fa-upload"></i> Import Backup<input type="file" accept=".json" onchange="restoreData(this)" style="display:none"></label>
                </div>
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
        const companyForm = document.getElementById('settings-company');
        if (companyForm) companyForm.addEventListener('submit', e => {
            e.preventDefault();
            const s = DB.settings;
            s.companyName = document.getElementById('sc-name').value;
            s.abn = document.getElementById('sc-abn').value;
            s.email = document.getElementById('sc-email').value;
            s.phone = document.getElementById('sc-phone').value;
            s.address = document.getElementById('sc-address').value;
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
    openModal('Confirm Delete',
        `<p>Are you sure you want to delete this record? This action cannot be undone.</p>`,
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
document.getElementById('global-search').addEventListener('keyup', function(e) {
    if (e.key === 'Enter' && this.value.trim()) {
        const q = this.value.trim().toLowerCase();
        const results = [];
        DB.customers.forEach(c => { if (`${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(q)) results.push({ type: 'Customer', name: `${c.firstName} ${c.lastName}`, page: 'customers' }); });
        DB.inventory.forEach(i => { if (`${i.name} ${i.sku}`.toLowerCase().includes(q)) results.push({ type: 'Inventory', name: i.name, page: 'inventory' }); });
        DB.orders.forEach(o => { if (o.orderNum.toLowerCase().includes(q)) results.push({ type: 'Order', name: o.orderNum, page: 'orders' }); });
        DB.invoices.forEach(i => { if (i.invoiceNum.toLowerCase().includes(q)) results.push({ type: 'Invoice', name: i.invoiceNum, page: 'invoices' }); });
        if (results.length) {
            toast(`Found ${results.length} result(s) — navigating to ${results[0].type}`);
            navigateTo(results[0].page);
        } else {
            toast('No results found', 'warning');
        }
    }
});

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
            const resp = await fetch('/api/backup');
            backup = await resp.json();
        } catch { backup = null; }
    }
    if (!backup) {
        backup = {};
        ['customers','suppliers','inventory','orders','invoices','settings'].forEach(k => { backup[k] = DB[k]; });
        backup._exportedAt = new Date().toISOString();
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `formationx_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast(`Backup exported${DB._useServer ? ' from file directory' : ''}`);
}

function restoreData(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            const keys = ['customers','suppliers','inventory','orders','invoices','settings'];
            const valid = keys.some(k => backup[k]);
            if (!valid) { toast('Invalid backup file', 'error'); return; }
            if (!confirm('This will replace all current data. Continue?')) return;
            keys.forEach(k => { if (backup[k]) DB[k] = backup[k]; });
            if (DB._useServer) await DB.syncToServer();
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
