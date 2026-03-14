// Simple working version of Aphaday
const AUTH_KEY = 'aphaday_users';
const SESSION_KEY = 'aphaday_session';

// Initialize database on load
function initDB() {
  let db = JSON.parse(localStorage.getItem(AUTH_KEY));
  if (!db) {
    db = {
      users: [{
        id: 1,
        username: 'Chok',
        password: 'Ceo123',
        isAdmin: true,
        createdAt: new Date().toISOString()
      }]
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(db));
  }
  return db;
}

// Get session
function getSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

// Set session
function setSession(username) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, isAdmin: username === 'Chok' }));
}

// Validate login
function validateLogin(username, password) {
  const db = initDB();
  const user = db.users.find(u => u.username === username && u.password === password);
  return user ? { valid: true, isAdmin: user.isAdmin } : { valid: false };
}

// Register user
function registerUser(username, password) {
  const db = initDB();
  if (db.users.find(u => u.username === username)) {
    return { success: false, error: 'Usuario ja existe' };
  }
  db.users.push({
    id: Date.now(),
    username,
    password,
    isAdmin: false,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(AUTH_KEY, JSON.stringify(db));
  return { success: true };
}

// UI Elements
const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const registerBtn = document.getElementById('register-btn');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');

// Show login
function showLogin() {
  loginScreen.classList.remove('hidden');
  appEl.classList.add('hidden');
  loginForm.reset();
  document.getElementById('login-error').textContent = '';
}

// Show app
function showApp() {
  loginScreen.classList.add('hidden');
  appEl.classList.remove('hidden');
  updateProfile();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
  initDB();
  
  const session = getSession();
  if (session) {
    showApp();
  } else {
    showLogin();
  }

  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');

    if (!username || !password) {
      errEl.textContent = 'preencha usuario e senha';
      return;
    }

    const result = validateLogin(username, password);
    if (result.valid) {
      setSession(username);
      showApp();
    } else {
      errEl.textContent = 'usuario ou senha incorretos';
    }
  });

  // Register button
  registerBtn.addEventListener('click', () => {
    document.getElementById('register-overlay').classList.remove('hidden');
  });

  // Register form
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-user').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const errEl = document.getElementById('register-error');

    errEl.textContent = '';

    if (!username || username.length < 2) {
      errEl.textContent = 'usuario deve ter minimo 2 caracteres';
      return;
    }
    if (!pass || pass.length < 4) {
      errEl.textContent = 'senha deve ter minimo 4 caracteres';
      return;
    }
    if (pass !== pass2) {
      errEl.textContent = 'senhas nao coincidem';
      return;
    }

    const result = registerUser(username, pass);
    if (result.success) {
      alert('Conta criada com sucesso! Faca login.');
      document.getElementById('register-overlay').classList.add('hidden');
      registerForm.reset();
    } else {
      errEl.textContent = result.error;
    }
  });

  // Close register
  document.getElementById('register-close').addEventListener('click', () => {
    document.getElementById('register-overlay').classList.add('hidden');
  });

  document.getElementById('register-cancel').addEventListener('click', () => {
    document.getElementById('register-overlay').classList.add('hidden');
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_KEY);
    showLogin();
  });

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const page = document.getElementById('page-' + btn.dataset.page);
      if (page) page.classList.add('active');
    });
  });
});

function updateProfile() {
  const session = getSession();
  if (session) {
    document.getElementById('profile-username').textContent = session.username;
  }
}
