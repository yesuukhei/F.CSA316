// Application state
let currentUser = null;
let sessionId = null;

// DOM Elements
const nav = document.getElementById('nav');
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const historyPage = document.getElementById('historyPage');
const userInfo = document.getElementById('userInfo');
const usernameDisplay = document.getElementById('usernameDisplay');
const historyNav = document.getElementById('historyNav');
const logoutBtn = document.getElementById('logoutBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeForms();
    checkSession();
});

// Navigation
function initializeNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.getAttribute('data-page');
            showPage(page);
            
            // Update active state
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Load history if needed
    if (pageName === 'history' && currentUser) {
        loadHistory();
    }
}

// Forms
function initializeForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
    
    // Logout button
    logoutBtn.addEventListener('click', async () => {
        await handleLogout();
    });
}

// API Calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`/api/${endpoint}`, options);
        const result = await response.json();
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: 'Сервертэй холбогдох үед алдаа гарлаа',
        };
    }
}

// Login
async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const messageDiv = document.getElementById('loginMessage');
    
    if (!username || !password) {
        showMessage(messageDiv, 'Бүх талбарыг бөглөнө үү', 'error');
        return;
    }
    
    const result = await apiCall('login', 'POST', { username, password });
    
    if (result.success) {
        currentUser = result.user;
        sessionId = result.sessionId;
        updateUI();
        showMessage(messageDiv, result.message, 'success');
        
        // Clear form
        document.getElementById('loginForm').reset();
        
        // Show history page
        setTimeout(() => {
            showPage('history');
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-page') === 'history') {
                    btn.classList.add('active');
                }
            });
        }, 1000);
    } else {
        showMessage(messageDiv, result.error || 'Нэвтрэхэд алдаа гарлаа', 'error');
    }
}

// Register
async function handleRegister() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const email = document.getElementById('registerEmail').value.trim();
    const messageDiv = document.getElementById('registerMessage');
    
    if (!username || !password) {
        showMessage(messageDiv, 'Хэрэглэгчийн нэр болон нууц үг шаардлагатай', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage(messageDiv, 'Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт байх ёстой', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(messageDiv, 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой', 'error');
        return;
    }
    
    const result = await apiCall('register', 'POST', {
        username,
        password,
        email: email || null,
    });
    
    if (result.success) {
        showMessage(messageDiv, result.message + ' Одоо нэвтэрнэ үү.', 'success');
        document.getElementById('registerForm').reset();
        
        // Switch to login page
        setTimeout(() => {
            showPage('login');
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-page') === 'login') {
                    btn.classList.add('active');
                }
            });
        }, 1500);
    } else {
        showMessage(messageDiv, result.error || 'Бүртгэл үүсгэхэд алдаа гарлаа', 'error');
    }
}

// Logout
async function handleLogout() {
    if (!sessionId) {
        return;
    }
    
    const result = await apiCall('logout', 'POST', { sessionId });
    
    if (result.success) {
        currentUser = null;
        sessionId = null;
        updateUI();
        showPage('login');
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === 'login') {
                btn.classList.add('active');
            }
        });
    } else {
        alert('Гарах үед алдаа гарлаа: ' + result.error);
    }
}

// Load history
async function loadHistory() {
    if (!currentUser || !sessionId) {
        return;
    }
    
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '<div class="loading">Ачааллаж байна...</div>';
    
    const result = await apiCall(`history/${currentUser.id}?sessionId=${sessionId}`);
    
    if (result.success) {
        displayHistory(result.history);
    } else {
        historyContent.innerHTML = `<div class="message error">${result.error || 'Түүх авах үед алдаа гарлаа'}</div>`;
    }
}

// Display history
function displayHistory(history) {
    const historyContent = document.getElementById('historyContent');
    
    if (!history || history.length === 0) {
        historyContent.innerHTML = '<div class="empty-state">Нэвтрэх түүх хоосон байна</div>';
        return;
    }
    
    const historyHTML = history.map(entry => {
        const date = new Date(entry.loginTime);
        const formattedDate = date.toLocaleString('mn-MN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
        
        const statusClass = entry.success ? 'success' : 'failed';
        const statusText = entry.success ? '✓ Амжилттай' : '✗ Амжилтгүй';
        
        return `
            <div class="history-item ${entry.success ? '' : 'failed'}">
                <div>
                    <div class="status ${statusClass}">${statusText}</div>
                    <div class="time">${formattedDate}</div>
                </div>
            </div>
        `;
    }).join('');
    
    historyContent.innerHTML = historyHTML;
}

// Check session
async function checkSession() {
    const savedSessionId = localStorage.getItem('sessionId');
    if (!savedSessionId) {
        return;
    }
    
    const result = await apiCall(`user?sessionId=${savedSessionId}`);
    
    if (result.success) {
        sessionId = savedSessionId;
        currentUser = result.user;
        updateUI();
    } else {
        localStorage.removeItem('sessionId');
    }
}

// Update UI
function updateUI() {
    if (currentUser && sessionId) {
        // Show user info
        userInfo.style.display = 'flex';
        usernameDisplay.textContent = `Сайн байна уу, ${currentUser.username}!`;
        
        // Show history nav
        historyNav.style.display = 'block';
        
        // Save session
        localStorage.setItem('sessionId', sessionId);
    } else {
        // Hide user info
        userInfo.style.display = 'none';
        
        // Hide history nav
        historyNav.style.display = 'none';
        
        // Clear session
        localStorage.removeItem('sessionId');
    }
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

