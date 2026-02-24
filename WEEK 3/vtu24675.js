// ============================================
// AutoManager: Vehicle & Sales Management System
// VTU24675
// ============================================

// GLOBAL APPLICATION STATE
const autoState = {
    isLoggedIn: false,
    currentUser: null,
    vehicles: [],
    sales: [],
    currentTab: 'dashboard'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    bindUIEvents();
    showAlert("AutoManager Loaded Successfully 🚗", "success");
});

function bindUIEvents() {
    // Login
    const loginForm = document.getElementById('loginForm');
    loginForm && loginForm.addEventListener('submit', handleLogin);

    // Menu navigation
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', handleMenuClick);
    });

    // Vehicle actions
    document.getElementById('addVehicleBtn')?.addEventListener('click', addVehicle);
    document.getElementById('addVehicleBtn')?.addEventListener('dblclick', resetVehicleForm);

    // Keyboard events
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Search input live event
    document.getElementById('vehicleSearch')?.addEventListener('input', liveVehicleSearch);

    // Mouse events
    document.getElementById('salesBox')?.addEventListener('mouseover', highlightSales);
    document.getElementById('salesBox')?.addEventListener('mouseout', resetSalesHighlight);

    // Disable right click
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        showAlert("Right click disabled ❌", "warning");
    });
}

// ============================================
// LOGIN FUNCTIONALITY
// ============================================

function handleLogin(e) {
    e.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (!user || !pass) {
        showAlert("Enter username & password", "error");
        return;
    }

    autoState.isLoggedIn = true;
    autoState.currentUser = user;
    document.getElementById('loggedUser').textContent = user;

    switchPage('dashboardPage');
    showAlert("Login successful ✔", "success");
}

function logout() {
    if (confirm("Logout from AutoManager?")) {
        autoState.isLoggedIn = false;
        autoState.currentUser = null;
        switchPage('loginPage');
        showAlert("Logged out successfully", "info");
    }
}

// ============================================
// PAGE & MENU
// ============================================

function handleMenuClick(e) {
    e.preventDefault();
    const tab = this.dataset.tab;
    switchTab(tab);
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    autoState.currentTab = tabId;
}

// ============================================
// VEHICLE MANAGEMENT
// ============================================

function addVehicle() {
    const model = document.getElementById('vehicleModel').value;
    const price = document.getElementById('vehiclePrice').value;

    if (!model || !price) {
        showAlert("Fill all vehicle details", "error");
        return;
    }

    const vehicle = {
        id: "VEH-" + generateId(),
        model,
        price,
        addedOn: new Date().toLocaleDateString()
    };

    autoState.vehicles.push(vehicle);
    renderVehicles();

    showAlert("Vehicle added successfully 🚘", "success");
}

function resetVehicleForm() {
    document.getElementById('vehicleForm')?.reset();
    showAlert("Vehicle form reset (Double Click)", "info");
}

function renderVehicles() {
    const list = document.getElementById('vehicleList');
    list.innerHTML = "";

    autoState.vehicles.forEach(v => {
        const row = document.createElement('div');
        row.className = "vehicle-row";
        row.innerHTML = `
            <span>${v.model}</span>
            <span>₹${v.price}</span>
            <button onclick="sellVehicle('${v.id}')">Sell</button>
        `;
        list.appendChild(row);
    });
}

// ============================================
// SALES MANAGEMENT
// ============================================

function sellVehicle(vehicleId) {
    const vehicle = autoState.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    autoState.sales.push({
        ...vehicle,
        soldOn: new Date().toLocaleDateString()
    });

    autoState.vehicles = autoState.vehicles.filter(v => v.id !== vehicleId);
    renderVehicles();
    renderSales();

    showAlert("Vehicle sold 💰", "success");
}

function renderSales() {
    const salesList = document.getElementById('salesList');
    salesList.innerHTML = "";

    autoState.sales.forEach(s => {
        salesList.innerHTML += `
            <div class="sale-item">
                ${s.model} - ₹${s.price} (Sold on ${s.soldOn})
            </div>
        `;
    });
}

// ============================================
// KEYBOARD EVENTS
// ============================================

function handleKeyboardShortcuts(e) {
    // Ctrl + S → Save sales
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        showAlert("Sales data saved 💾", "success");
    }

    // ESC → Reset forms
    if (e.key === "Escape") {
        document.querySelectorAll('form').forEach(f => f.reset());
        showAlert("Forms reset (ESC)", "info");
    }
}

// ============================================
// LIVE SEARCH
// ============================================

function liveVehicleSearch(e) {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.vehicle-row').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query)
            ? "flex"
            : "none";
    });
}

// ============================================
// MOUSE EVENTS
// ============================================

function highlightSales() {
    this.style.transform = "scale(1.1)";
    this.style.backgroundColor = "#e3f2fd";
}

function resetSalesHighlight() {
    this.style.transform = "scale(1)";
    this.style.backgroundColor = "";
}

// ============================================
// UTILITIES
// ============================================

function generateId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function showAlert(msg, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

// ============================================
// EXPORT FOR HTML
// ============================================

window.logout = logout;
window.switchTab = switchTab;
window.sellVehicle = sellVehicle;
