// ── Storage helpers ───────────────────────────────────────────────────────────
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
  syncToServer(key, val); // Sincronizar com servidor imediatamente
};

// ── Sincronização com Servidor ────────────────────────────────────────────────
async function syncToServer(key, value) {
  try {
    await fetch(`/api/data/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    });
    console.log(`✓ Sincronizado para servidor: ${key}`);
  } catch (e) {
    console.log('Erro ao sincronizar com servidor:', e.message);
  }
}

async function syncFromServer(key) {
  try {
    const res = await fetch(`/api/data/${key}`);
    const data = await res.json();
    if (data.value) {
      localStorage.setItem(key, JSON.stringify(data.value));
      return data.value;
    }
  } catch (e) {
    console.log('Erro ao carregar do servidor:', e.message);
  }
  return null;
}

// ── Sincronizar do servidor periodicamente (para pegar dados do celular) ──────
async function autosyncFromServer() {
  const keys = ['tasks', 'transactions', 'notes', 'users_database', 'login_logs', 'user_bans', 'support_messages'];
  let synced = false;
  
  for (const key of keys) {
    try {
      const res = await fetch(`/api/data/${key}`);
      const data = await res.json();
      if (data.value) {
        const local = load(key, null);
        // Se os dados no servidor são diferentes, atualizar localmente
        if (JSON.stringify(local) !== JSON.stringify(data.value)) {
          localStorage.setItem(key, JSON.stringify(data.value));
          synced = true;
          // Disparar evento para recarregar UI
          window.dispatchEvent(new CustomEvent('datasynced', { detail: { key } }));
        }
      }
    } catch (e) {
      // Silencioso
    }
  }
  
  // Registrar última sincronização
  if (synced) {
    save('last_sync_time', new Date().toISOString());
    updateSyncStatus();
  }
}

// Iniciar autosync após login
document.addEventListener('DOMContentLoaded', () => {
  // Iniciar sincronização a cada 300ms (ultra rápido!)
  setInterval(autosyncFromServer, 300);
  
  // Setup do botão de registro
  setupRegisterButton();
  
  const registerClose = document.getElementById('register-close');
  if (registerClose) registerClose.addEventListener('click', closeRegister);
  
  const registerCancel = document.getElementById('register-cancel');
  if (registerCancel) registerCancel.addEventListener('click', closeRegister);
  
  const registerOverlay = document.getElementById('register-overlay');
  if (registerOverlay) {
    registerOverlay.addEventListener('click', function(e) {
      if (e.target === this) closeRegister();
    });
  }
});

// ── SHA256 simples em JS puro (funciona sem crypto.subtle) ────────────────────

function sha256Simple(str) {
  // Implementação simples baseada em SHA256 - funciona sem crypto.subtle
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  let hex = (Math.abs(hash) >>> 0).toString(16);
  // Completar para 64 caracteres (SHA256 simplified)
  return hex.padEnd(64, '0');
}

async function sha256(str) {
  try {
    // Tentar usar crypto.subtle se disponível (HTTPS/localhost)
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
    }
  } catch (e) {
    console.log('crypto.subtle não disponível, usando fallback');
  }
  // Fallback para HTTP
  return sha256Simple(str);
}

// ── Auth ──────────────────────────────────────────────────────────────────────
const AUTH_KEY = 'users_database';
const SESSION_KEY = 'auth_session';
const LOGS_KEY = 'login_logs';
const BANS_KEY = 'user_bans';
const USAGE_HISTORY_KEY = 'usage_history';

// Usuário admin
const ADMIN_USER = 'Chok';
const ADMIN_PASS = 'Ceo123';

async function initDatabase() {
  const existing = load(AUTH_KEY, null);
  if (existing) return;
  
  const adminHash = await sha256(ADMIN_USER);
  const passHash = await sha256(ADMIN_PASS);
  save(AUTH_KEY, {
    users: [{
      id: 1,
      username: ADMIN_USER,
      usernameHash: adminHash,
      passHash: passHash,
      isAdmin: true,
      createdAt: new Date().toISOString()
    }]
  });
  console.log('✓ Database inicializado com admin');
}

function getAllUsers() {
  const db = load(AUTH_KEY, { users: [] });
  return db.users || [];
}

function getUserByUsername(username) {
  const users = getAllUsers();
  return users.find(u => u.username === username);
}

async function validateLogin(user, pass) {
  const users = getAllUsers();
  const found = users.find(u => u.username === user);
  if (!found) return { valid: false };
  
  const passHash = await sha256(pass);
  const valid = passHash === found.passHash;
  return { valid, isAdmin: found.isAdmin || false };
}

async function registerUser(user, pass) {
  const users = getAllUsers();
  console.log('📋 Total de perfis existentes:', users.length);
  
  const existing = users.find(u => u.username === user);
  if (existing) {
    console.warn('⚠️ Esse nome de perfil ja existe:', user);
    return { success: false, error: 'esse nome de perfil ja existe. escolha outro' };
  }
  
  if (user.length < 2) return { success: false, error: 'minimo 2 caracteres' };
  if (pass.length < 4) return { success: false, error: 'minimo 4 caracteres' };
  
  const usernameHash = await sha256(user);
  const passHash = await sha256(pass);
  
  users.push({
    id: Date.now(),
    username: user,
    usernameHash: usernameHash,
    passHash: passHash,
    isAdmin: false,  // Sempre false para novos perfis
    createdAt: new Date().toISOString()
  });
  
  const db = load(AUTH_KEY, { users: [] });
  db.users = users;
  save(AUTH_KEY, db);
  
  console.log('✓ Novo perfil criado:', user);
  console.log('📋 Total de perfis agora:', db.users.length);
  
  return { success: true };
}

function addLoginLog(user, success, isAdmin) {
  const logs = load(LOGS_KEY, []);
  logs.unshift({
    username: user,
    timestamp: new Date().toISOString(),
    success: success,
    isAdmin: isAdmin || false
  });
  // Manter apenas últimos 1000 logs
  if (logs.length > 1000) logs.pop();
  save(LOGS_KEY, logs);
}

function getLoginLogs() {
  return load(LOGS_KEY, []);
}

function clearLoginLogs() {
  save(LOGS_KEY, []);
}

function clearUserLogs(username) {
  const logs = load(LOGS_KEY, []);
  const filtered = logs.filter(log => log.username !== username);
  save(LOGS_KEY, filtered);
  console.log('✓ Logs do usuario ' + username + ' foram limpos');
}

function deleteUser(username, reason) {
  const users = getAllUsers();
  const filtered = users.filter(u => u.username !== username);
  const db = load(AUTH_KEY, { users: [] });
  db.users = filtered;
  save(AUTH_KEY, db);
  
  // Record the ban
  const bans = load(BANS_KEY, []);
  bans.unshift({
    username: username,
    reason: reason || 'sem motivo especificado',
    bannedAt: new Date().toISOString(),
    bannedBy: 'admin'
  });
  save(BANS_KEY, bans);
  
  console.log('✓ Usuario banido:', username, '|', reason);
}

function getBans() {
  return load(BANS_KEY, []);
}
function getSession() {
  try {
    const s = sessionStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function setSession(username, isAdmin) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, isAdmin }));
}

function isAdmin() {
  const session = getSession();
  return session && session.isAdmin;
}

// ── Usage History ─────────────────────────────────────────────────────────────
let currentPageStartTime = Date.now();
let currentPageName = 'overview';

function addUsageHistory(pageName) {
  const session = getSession();
  if (!session) return;
  
  const now = Date.now();
  const duration = Math.round((now - currentPageStartTime) / 1000); // em segundos
  
  if (duration > 1 && currentPageName !== pageName) {
    // Registrar página anterior se tiver duração > 1s
    const allHistory = load(USAGE_HISTORY_KEY, {});
    
    if (!allHistory[session.username]) {
      allHistory[session.username] = [];
    }
    
    const pageLabel = getPageLabel(currentPageName);
    allHistory[session.username].push({
      page: currentPageName,
      pageLabel: pageLabel,
      timestamp: new Date().toISOString(),
      duration: duration,
      id: Date.now()
    });
    
    // Manter apenas últimos 500 registros por usuário
    if (allHistory[session.username].length > 500) {
      allHistory[session.username].shift();
    }
    
    save(USAGE_HISTORY_KEY, allHistory);
  }
  
  currentPageName = pageName;
  currentPageStartTime = now;
}

function getPageLabel(page) {
  const labels = {
    'overview': 'Visão Geral',
    'tasks': 'Tarefas',
    'finance': 'Finanças',
    'notes': 'Notas',
    'admin': 'Admin',
    'profile': 'Perfil',
    'support': 'Suporte'
  };
  return labels[page] || page;
}

function getUsageHistory(username) {
  const allHistory = load(USAGE_HISTORY_KEY, {});
  return allHistory[username] || [];
}

function getFilteredHistory(username, filter) {
  const history = getUsageHistory(username);
  const now = new Date();
  
  if (filter === 'today') {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return history.filter(h => new Date(h.timestamp) >= dayStart);
  }
  if (filter === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter(h => new Date(h.timestamp) >= weekAgo);
  }
  if (filter === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return history.filter(h => new Date(h.timestamp) >= monthAgo);
  }
  return history;
}

function clearUsageHistory(username) {
  const allHistory = load(USAGE_HISTORY_KEY, {});
  delete allHistory[username];
  save(USAGE_HISTORY_KEY, allHistory);
}

function getTopPages(username) {
  const history = getUsageHistory(username);
  const pageStats = {};
  
  history.forEach(entry => {
    if (!pageStats[entry.page]) {
      pageStats[entry.page] = { count: 0, totalTime: 0, label: entry.pageLabel };
    }
    pageStats[entry.page].count++;
    pageStats[entry.page].totalTime += entry.duration;
  });
  
  return Object.entries(pageStats)
    .map(([page, stats]) => ({
      page,
      ...stats,
      avgTime: Math.round(stats.totalTime / stats.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ── Login UI ──────────────────────────────────────────────────────────────────
const loginScreen = document.getElementById('login-screen');
const appEl = document.getElementById('app');

function showLogin() {
  loginScreen.classList.remove('hidden');
  appEl.classList.add('hidden');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-pass').type = 'password';
}

function showApp() {
  loginScreen.classList.add('hidden');
  // Mostrar welcome overlay primeiro
  showWelcomeOverlay();
  // Atualizar status de sincronização
  updateSyncStatus();
}

function showWelcomeOverlay() {
  const welcomeOverlay = document.getElementById('welcome-overlay');
  const session = getSession();
  
  if (!welcomeOverlay || !session) return;
  
  // Atualizar nome do usuário no welcome
  document.getElementById('welcome-username').textContent = session.username.toUpperCase();
  
  // Mostrar o overlay
  welcomeOverlay.classList.remove('hidden');
  
  // Esconder após 2.5 segundos
  setTimeout(() => {
    welcomeOverlay.classList.add('hidden');
    appEl.classList.remove('hidden');
    updateAdminNav();
  }, 2500);
}

function updateAdminNav() {
  const adminBtn = document.getElementById('admin-nav-btn');
  const adminPanelBtn = document.getElementById('admin-panel-btn');
  if (isAdmin()) {
    adminBtn.style.display = 'flex';
    adminPanelBtn.style.display = 'flex';
  } else {
    adminBtn.style.display = 'none';
    adminPanelBtn.style.display = 'flex'; // Sempre mostrar o painel admin, mas só admins podem acessá-lo
  }
}

function initApp() {} // Forward declaration

// Toggle password visibility
document.getElementById('toggle-pass').addEventListener('click', function(e) {
  e.preventDefault();
  const input = document.getElementById('login-pass');
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  const icon = document.getElementById('eye-icon');
  if (icon) icon.style.opacity = isPassword ? '1' : '0.5';
});

// Login form submit
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const btn = this.querySelector('.login-btn');
  
  if (!user || !pass) {
    errEl.textContent = 'preencha usuario e senha';
    return;
  }
  
  try {
    const result = await validateLogin(user, pass);
    
    if (result.valid) {
      addLoginLog(user, true, result.isAdmin);
      console.log('✓ Login bem-sucedido');
      setSession(user, result.isAdmin);
      showApp();
      initApp();
    } else {
      addLoginLog(user, false, false);
      console.log('✗ Credenciais incorretas');
      errEl.textContent = 'usuario ou senha incorretos';
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 500);
    }
  } catch (err) {
    console.error('Erro no login:', err);
    errEl.textContent = 'erro ao fazer login';
  }
});

// Register button
// Register button - com validação
function setupRegisterButton() {
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const overlay = document.getElementById('register-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        document.getElementById('reg-user').value = '';
        document.getElementById('reg-pass').value = '';
        document.getElementById('reg-pass2').value = '';
        document.getElementById('register-error').textContent = '';
      }
    });
  }
}

function closeRegister() {
  const overlay = document.getElementById('register-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Setup dos listeners de registro
document.addEventListener('DOMContentLoaded', () => {
  setupRegisterButton();
  
  const registerClose = document.getElementById('register-close');
  if (registerClose) registerClose.addEventListener('click', closeRegister);
  
  const registerCancel = document.getElementById('register-cancel');
  if (registerCancel) registerCancel.addEventListener('click', closeRegister);
  
  const registerOverlay = document.getElementById('register-overlay');
  if (registerOverlay) {
    registerOverlay.addEventListener('click', function(e) {
      if (e.target === this) closeRegister();
    });
  }

  // Botão para criar conta adicional (na página de perfil)
  const createAdditionalAccountBtn = document.getElementById('create-additional-account-btn');
  if (createAdditionalAccountBtn) {
    createAdditionalAccountBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const overlay = document.getElementById('register-overlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        document.getElementById('reg-user').value = '';
        document.getElementById('reg-pass').value = '';
        document.getElementById('reg-pass2').value = '';
        document.getElementById('register-error').textContent = '';
      }
    });
  }
});

// Register form submit
document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const user = document.getElementById('reg-user').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const errEl = document.getElementById('register-error');
  const submitBtn = this.querySelector('button[type="submit"]');
  
  errEl.textContent = '';
  
  // Validations
  if (!user) { errEl.textContent = 'digite seu nome de perfil'; return; }
  if (user.length < 2) { errEl.textContent = 'nome de perfil deve ter minimo 2 caracteres'; return; }
  if (user.length > 30) { errEl.textContent = 'nome de perfil nao pode ter mais de 30 caracteres'; return; }
  if (!/^[a-zA-Z0-9_-]+$/.test(user)) { errEl.textContent = 'nome so pode conter letras, numeros, _ e -'; return; }
  if (!pass) { errEl.textContent = 'digite uma senha'; return; }
  if (pass.length < 4) { errEl.textContent = 'senha deve ter minimo 4 caracteres'; return; }
  if (pass.length > 50) { errEl.textContent = 'senha nao pode ter mais de 50 caracteres'; return; }
  if (!pass2) { errEl.textContent = 'confirme a senha'; return; }
  if (pass !== pass2) { errEl.textContent = 'senhas nao coincidem'; return; }
  
  // Disable button during submit
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'criando perfil...';
  
  try {
    console.log('🔄 Criando novo perfil de usuário:', user);
    const result = await registerUser(user, pass);
    
    if (result.success) {
      console.log('✓ Perfil criado com sucesso:', user);
      
      // Verify user was created
      const users = getAllUsers();
      const created = users.find(u => u.username === user);
      if (created) {
        console.log('✓ Verificado: novo perfil existe no banco');
      } else {
        console.warn('⚠️ Aviso: perfil nao encontrado apos criacao');
      }
      
      closeRegister();
      
      // Fill login form
      document.getElementById('login-user').value = user;
      document.getElementById('login-pass').value = pass;
      document.getElementById('login-error').textContent = '';
      
      // Wait a bit then auto-login
      setTimeout(async () => {
        console.log('🔄 Fazendo login automático como:', user);
        const loginResult = await validateLogin(user, pass);
        console.log('Login validation result:', loginResult);
        
        if (loginResult.valid) {
          document.getElementById('login-form').dispatchEvent(new Event('submit'));
        } else {
          console.warn('⚠️ Login automático falhou. Preencha novamente e tente.');
          errEl.textContent = 'perfil criado! faça login agora.';
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }, 500);
    } else {
      console.warn('Falha ao criar perfil:', result.error);
      errEl.textContent = result.error;
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  } catch (err) {
    console.error('Erro ao criar perfil:', err);
    errEl.textContent = 'erro ao criar perfil. tente novamente';
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', function() {
  addUsageHistory('logout');
  sessionStorage.removeItem(SESSION_KEY);
  updateAdminNav();
  showLogin();
});

// ── Forgot password ────────────────────────────────────────────────────────────
const RECOVERY_KEY = 'auth_recovery';
const DEFAULT_RECOVERY = 'APHADAY-CEO';

async function initRecoveryCode() {
  if (load(RECOVERY_KEY, null)) return;
  const hash = await sha256(DEFAULT_RECOVERY);
  save(RECOVERY_KEY, { hash });
}

initRecoveryCode();

function openForgot() {
  document.getElementById('forgot-overlay').classList.remove('hidden');
  document.getElementById('forgot-step1').classList.remove('hidden');
  document.getElementById('forgot-step2').classList.add('hidden');
  document.getElementById('forgot-step3').classList.add('hidden');
  document.getElementById('recover-code').value = '';
  document.getElementById('forgot-error').textContent = '';
}

function closeForgot() {
  document.getElementById('forgot-overlay').classList.add('hidden');
}

document.getElementById('forgot-btn').addEventListener('click', openForgot);
document.getElementById('forgot-close').addEventListener('click', closeForgot);
document.getElementById('forgot-cancel').addEventListener('click', closeForgot);
document.getElementById('forgot-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeForgot();
});

document.getElementById('forgot-back').addEventListener('click', function() {
  document.getElementById('forgot-step2').classList.add('hidden');
  document.getElementById('forgot-step1').classList.remove('hidden');
});

document.getElementById('forgot-verify-btn').addEventListener('click', async function() {
  const code = document.getElementById('recover-code').value.trim();
  const errEl = document.getElementById('forgot-error');
  
  if (!code) {
    errEl.textContent = 'digite o codigo de recuperacao';
    return;
  }
  
  const stored = load(RECOVERY_KEY, null);
  if (!stored) {
    errEl.textContent = 'codigo invalido';
    return;
  }
  
  const hash = await sha256(code);
  if (hash === stored.hash) {
    document.getElementById('forgot-step1').classList.add('hidden');
    document.getElementById('forgot-step2').classList.remove('hidden');
    document.getElementById('recover-user').value = '';
    document.getElementById('recover-pass').value = '';
    document.getElementById('recover-pass2').value = '';
    document.getElementById('forgot-error2').textContent = '';
  } else {
    errEl.textContent = 'codigo incorreto';
    this.classList.add('shake');
    setTimeout(() => this.classList.remove('shake'), 500);
  }
});

document.getElementById('forgot-save-btn').addEventListener('click', async function() {
  const newUser = document.getElementById('recover-user').value.trim();
  const newPass = document.getElementById('recover-pass').value;
  const newPass2 = document.getElementById('recover-pass2').value;
  const errEl = document.getElementById('forgot-error2');
  
  if (!newUser) { errEl.textContent = 'digite um novo usuario'; return; }
  if (newUser.length < 2) { errEl.textContent = 'usuario deve ter minimo 2 caracteres'; return; }
  if (newUser.length > 30) { errEl.textContent = 'usuario nao pode ter mais de 30 caracteres'; return; }
  if (!/^[a-zA-Z0-9_-]+$/.test(newUser)) { errEl.textContent = 'usuario so pode conter letras, numeros, _ e -'; return; }
  if (!newPass) { errEl.textContent = 'digite uma nova senha'; return; }
  if (newPass.length < 4) { errEl.textContent = 'senha deve ter minimo 4 caracteres'; return; }
  if (newPass.length > 50) { errEl.textContent = 'senha nao pode ter mais de 50 caracteres'; return; }
  if (!newPass2) { errEl.textContent = 'confirme a nova senha'; return; }
  if (newPass !== newPass2) { errEl.textContent = 'as senhas nao coincidem'; return; }
  
  try {
    const [userHash, passHash] = await Promise.all([sha256(newUser), sha256(newPass)]);
    
    // Check if username already exists (except for recovery use case)
    const users = getAllUsers();
    if (users.find(u => u.username === newUser)) {
      errEl.textContent = 'esse usuario ja existe';
      return;
    }
    
    // Update admin user (first user) with new credentials
    const db = load(AUTH_KEY, { users: [] });
    if (db.users && db.users.length > 0) {
      db.users[0].username = newUser;
      db.users[0].usernameHash = userHash;
      db.users[0].passHash = passHash;
      save(AUTH_KEY, db);
      
      document.getElementById('forgot-step2').classList.add('hidden');
      document.getElementById('forgot-step3').classList.remove('hidden');
    } else {
      errEl.textContent = 'erro: usuario admin nao encontrado';
    }
  } catch (err) {
    console.error('Erro ao recuperar acesso:', err);
    errEl.textContent = 'erro ao processar recuperacao';
  }
});

document.getElementById('forgot-finish-btn').addEventListener('click', function() {
  closeForgot();
  showLogin();
});

// ── Change credentials ────────────────────────────────────────────────────────
document.getElementById('change-creds-btn').addEventListener('click', function() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('new-user').value = '';
  document.getElementById('new-pass').value = '';
  document.getElementById('new-pass2').value = '';
  document.getElementById('modal-error').textContent = '';
});

// Sincronização manual
document.getElementById('sync-btn').addEventListener('click', async function() {
  const btn = this;
  btn.disabled = true;
  btn.style.opacity = '0.5';
  
  // Sincronizar todos os dados
  const keys = ['tasks', 'transactions', 'notes', 'users_database', 'login_logs', 'user_bans', 'support_messages'];
  for (const key of keys) {
    const data = load(key, null);
    if (data) {
      await syncToServer(key, data);
    }
  }
  
  // Atualizar data/hora de última sincronização
  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('last-update').textContent = `atualizado: ${timeStr}`;
  
  // Mostrar feedback visual
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 1000);
});

// Inicializar data/hora de sincronização
function updateSyncStatus() {
  const lastSync = load('last_sync_time', null);
  if (lastSync) {
    const date = new Date(lastSync);
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update').textContent = `atualizado: ${timeStr}`;
  } else {
    document.getElementById('last-update').textContent = 'nunca sincronizado';
  }
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.getElementById('change-creds-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const newUser = document.getElementById('new-user').value.trim();
  const newPass = document.getElementById('new-pass').value;
  const newPass2 = document.getElementById('new-pass2').value;
  const errEl = document.getElementById('modal-error');
  
  if (!newUser) { errEl.textContent = 'digite um novo usuario'; return; }
  if (newUser.length < 2) { errEl.textContent = 'usuario deve ter minimo 2 caracteres'; return; }
  if (newUser.length > 30) { errEl.textContent = 'usuario nao pode ter mais de 30 caracteres'; return; }
  if (!/^[a-zA-Z0-9_-]+$/.test(newUser)) { errEl.textContent = 'usuario so pode conter letras, numeros, _ e -'; return; }
  if (!newPass) { errEl.textContent = 'digite uma nova senha'; return; }
  if (newPass.length < 4) { errEl.textContent = 'senha deve ter minimo 4 caracteres'; return; }
  if (newPass.length > 50) { errEl.textContent = 'senha nao pode ter mais de 50 caracteres'; return; }
  if (!newPass2) { errEl.textContent = 'confirme a nova senha'; return; }
  if (newPass !== newPass2) { errEl.textContent = 'as senhas nao coincidem'; return; }
  
  try {
    const session = getSession();
    if (!session) { errEl.textContent = 'sessao invalida'; return; }
    
    // Check if new username already exists
    const existingUser = getUserByUsername(newUser);
    if (existingUser && existingUser.username !== session.username) {
      errEl.textContent = 'esse usuario ja existe';
      return;
    }
    
    const [userHash, passHash] = await Promise.all([sha256(newUser), sha256(newPass)]);
    
    const db = load(AUTH_KEY, { users: [] });
    const userIndex = db.users.findIndex(u => u.username === session.username);
    if (userIndex !== -1) {
      db.users[userIndex].username = newUser;
      db.users[userIndex].usernameHash = userHash;
      db.users[userIndex].passHash = passHash;
      save(AUTH_KEY, db);
    }
    
    console.log('✓ Credenciais atualizadas');
    setSession(newUser, session.isAdmin);
    closeModal();
    alert('✓ Credenciais alteradas com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar credenciais:', err);
    errEl.textContent = 'erro ao atualizar. Tente novamente.';
  }
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(async function() {
  try {
    console.log('⏳ Inicializando...');
    await initDatabase();
    
    const session = getSession();
    if (session && session.username) {
      console.log('✓ Sessão ativa para:', session.username);
      showApp();
      initApp();
    } else {
      console.log('→ Mostrando login');
      showLogin();
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar:', err);
    console.error('Stack:', err.stack);
    alert('Erro ao inicializar a aplicação. Verifique o console para detalhes.');
    showLogin();
  }
})();

// ── Sobrescrever initApp com função real ──────────────────────────────────────
initApp = function() {

// ── State ─────────────────────────────────────────────────────────────────────
let tasks = load('tasks', []);
let transactions = load('transactions', []);
let notes = load('notes', []);
let activeNote = null;
let taskFilter = 'all';

// ── Utilities ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const today = () => new Date().toLocaleDateString('pt-BR');
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// ── Navigation ────────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    addUsageHistory(btn.dataset.page);
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('page-' + btn.dataset.page).classList.add('active');
    if (btn.dataset.page === 'overview') renderOverview();
    if (btn.dataset.page === 'admin') renderAdminDashboard();
    if (btn.dataset.page === 'profile') renderProfile();
  });
});

// Sidebar date
const dateEl = $('sidebar-date');
const now = new Date();
dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

// ── TASKS ─────────────────────────────────────────────────────────────────────
function renderTasks() {
  const list = $('task-list');
  let filtered = tasks;
  if (taskFilter === 'pending') filtered = tasks.filter(t => !t.done);
  if (taskFilter === 'done') filtered = tasks.filter(t => t.done);
  list.innerHTML = filtered.length ? '' : '<li style="color:var(--text-muted);font-size:13px;padding:12px 0">nenhuma tarefa</li>';
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item' + (t.done ? ' done' : '');
    li.innerHTML = `
      <div class="task-check ${t.done ? 'checked' : ''}" data-id="${t.id}"></div>
      <span class="task-text">${escHtml(t.text)}</span>
      <span class="priority-tag ${t.priority}">${t.priority}</span>
      <button class="del-btn" data-id="${t.id}" title="remover">×</button>`;
    list.appendChild(li);
  });
}

$('task-form').addEventListener('submit', e => {
  e.preventDefault();
  const text = $('task-input').value.trim();
  
  if (!text) { console.warn('⚠️ Tarefa vazia'); return; }
  if (text.length > 200) { console.warn('⚠️ Tarefa muito longa (max 200 caracteres)'); return; }
  if (tasks.length >= 500) { console.warn('⚠️ Limite de tarefas atingido (500)'); return; }
  
  try {
    tasks.unshift({ 
      id: uid(), 
      text: escHtml(text), 
      priority: $('task-priority').value, 
      done: false, 
      date: today() 
    });
    save('tasks', tasks);
    $('task-input').value = '';
    renderTasks();
    renderOverview();
  } catch (err) {
    console.error('Erro ao salvar tarefa:', err);
  }
});

$('task-list').addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (e.target.classList.contains('task-check')) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save('tasks', tasks); renderTasks(); renderOverview(); }
  }
  if (e.target.classList.contains('del-btn')) {
    tasks = tasks.filter(t => t.id !== id);
    save('tasks', tasks);
    renderTasks();
    renderOverview();
  }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    taskFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ── FINANCE ───────────────────────────────────────────────────────────────────
function calcFinance() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthly = transactions.filter(t => t.date.startsWith(thisMonth));
  const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
}

function renderFinance() {
  const { income, expense, balance } = calcFinance();
  $('fin-income').textContent = fmt(income);
  $('fin-expense').textContent = fmt(expense);
  const balEl = $('fin-balance');
  balEl.textContent = fmt(balance);
  balEl.className = 'card-value ' + (balance >= 0 ? 'green' : 'red');

  const list = $('transaction-list');
  list.innerHTML = transactions.length ? '' : '<li style="color:var(--text-muted);font-size:13px;padding:12px 0">nenhuma transacao</li>';
  transactions.slice(0, 50).forEach(t => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.innerHTML = `
      <div class="tx-indicator ${t.type}"></div>
      <span class="tx-desc">${escHtml(t.desc)}</span>
      <span class="tx-cat">${t.category}</span>
      <span class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span>
      <span class="tx-date">${t.date.slice(5).split('-').reverse().join('/')}</span>
      <button class="del-btn" data-id="${t.id}" title="remover">×</button>`;
    list.appendChild(li);
  });

  renderCharts();
}

// ── CHARTS ────────────────────────────────────────────────────────────────────
let chartCategory = null;
let chartMonthly = null;

const CHART_COLORS = ['#6c8ebf','#82b366','#d79b00','#a67c52','#9673a6','#d6a7a7','#6ab0c5','#c4a24d'];

function getTextColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#1a1a1a';
}
function getMutedColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#888880';
}
function getSurfaceColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff';
}

function renderCharts() {
  renderCategoryChart();
  renderMonthlyChart();
}

function renderCategoryChart() {
  const thisMonth = new Date().toISOString().slice(0, 7);
  const expenses = transactions.filter(t => t.type === 'expense' && t.date.startsWith(thisMonth));
  const byCategory = {};
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
  const labels = Object.keys(byCategory);
  const data = Object.values(byCategory);

  const ctx = $('chart-category').getContext('2d');
  if (chartCategory) chartCategory.destroy();

  if (!labels.length) {
    chartCategory = new Chart(ctx, {
      type: 'doughnut',
      data: { labels: ['sem dados'], datasets: [{ data: [1], backgroundColor: [getMutedColor()], borderWidth: 0 }] },
      options: { plugins: { legend: { display: false }, tooltip: { enabled: false } }, cutout: '65%', responsive: true, maintainAspectRatio: false }
    });
    return;
  }

  chartCategory = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: CHART_COLORS.slice(0, labels.length),
        borderWidth: 2,
        borderColor: getSurfaceColor()
      }]
    },
    options: {
      cutout: '60%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: getMutedColor(), font: { size: 11 }, padding: 12, boxWidth: 10 }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${fmt(ctx.parsed)}`
          }
        }
      }
    }
  });
}

function renderMonthlyChart() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }
  const incomes = months.map(m => transactions.filter(t => t.type === 'income' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));
  const expenses = months.map(m => transactions.filter(t => t.type === 'expense' && t.date.startsWith(m)).reduce((s, t) => s + t.amount, 0));
  const labels = months.map(m => { const [y, mo] = m.split('-'); return `${mo}/${y.slice(2)}`; });

  const ctx = $('chart-monthly').getContext('2d');
  if (chartMonthly) chartMonthly.destroy();

  chartMonthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'receitas', data: incomes, backgroundColor: '#52b78866', borderColor: '#52b788', borderWidth: 1.5, borderRadius: 5 },
        { label: 'despesas', data: expenses, backgroundColor: '#e05c5c66', borderColor: '#e05c5c', borderWidth: 1.5, borderRadius: 5 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: getMutedColor(), font: { size: 11 }, padding: 12, boxWidth: 10 } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.parsed.y)}` } }
      },
      scales: {
        x: { ticks: { color: getMutedColor(), font: { size: 11 } }, grid: { display: false } },
        y: { ticks: { color: getMutedColor(), font: { size: 11 }, callback: v => 'R$' + v.toLocaleString('pt-BR') }, grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border').trim() } }
      }
    }
  });
}

$('finance-form').addEventListener('submit', e => {
  e.preventDefault();
  const desc = $('fin-desc').value.trim();
  const amountStr = $('fin-amount').value.trim();
  
  // Validation
  if (!desc) { console.warn('⚠️ Descricao vazia'); return; }
  if (desc.length > 100) { console.warn('⚠️ Descricao muito longa (max 100 caracteres)'); return; }
  if (!amountStr) { console.warn('⚠️ Valor n\u00e3o informado'); return; }
  
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) { console.warn('⚠️ Valor invalido (deve ser maior que zero)'); return; }
  if (amount > 1000000) { console.warn('⚠️ Valor muito alto'); return; }
  
  try {
    transactions.unshift({
      id: uid(), 
      desc: escHtml(desc), 
      amount: Math.round(amount * 100) / 100,
      type: $('fin-type').value,
      category: $('fin-category').value,
      date: new Date().toISOString().slice(0, 10)
    });
    save('transactions', transactions);
    $('fin-desc').value = '';
    $('fin-amount').value = '';
    renderFinance();
    renderOverview();
  } catch (err) {
    console.error('Erro ao salvar transacao:', err);
  }
});

$('transaction-list').addEventListener('click', e => {
  if (e.target.classList.contains('del-btn')) {
    const id = e.target.dataset.id;
    transactions = transactions.filter(t => t.id !== id);
    save('transactions', transactions);
    renderFinance();
    renderOverview();
  }
});

// ── NOTES ─────────────────────────────────────────────────────────────────────
function renderNotesList() {
  const list = $('notes-list');
  list.innerHTML = '';
  notes.forEach(n => {
    const li = document.createElement('li');
    li.className = 'note-list-item' + (activeNote === n.id ? ' active' : '');
    li.dataset.id = n.id;
    li.innerHTML = `<div class="note-list-title">${escHtml(n.title || 'sem titulo')}</div><div class="note-list-date">${n.date}</div>`;
    li.addEventListener('click', () => { activeNote = n.id; renderNotesList(); openNote(n.id); });
    list.appendChild(li);
  });
}

function openNote(id) {
  const n = notes.find(n => n.id === id);
  if (!n) return;
  const editor = $('note-editor');
  editor.innerHTML = `
    <input class="note-title-input" id="note-title" value="${escAttr(n.title)}" placeholder="titulo..." />
    <textarea class="note-body-input" id="note-body" placeholder="escreva aqui...">${escHtml(n.body)}</textarea>
    <div class="note-actions">
      <button class="note-del-btn" id="note-del">excluir nota</button>
    </div>`;

  const titleInput = $('note-title');
  const bodyInput = $('note-body');

  const saveNote = () => {
    n.title = titleInput.value;
    n.body = bodyInput.value;
    n.date = today();
    save('notes', notes);
    renderNotesList();
  };

  titleInput.addEventListener('input', saveNote);
  bodyInput.addEventListener('input', saveNote);

  $('note-del').addEventListener('click', () => {
    notes = notes.filter(x => x.id !== id);
    activeNote = null;
    save('notes', notes);
    renderNotesList();
    $('note-editor').innerHTML = '<div class="note-placeholder">selecione ou crie uma nota</div>';
  });
}

$('new-note-btn').addEventListener('click', () => {
  const n = { id: uid(), title: '', body: '', date: today() };
  notes.unshift(n);
  save('notes', notes);
  activeNote = n.id;
  renderNotesList();
  openNote(n.id);
  setTimeout(() => { const t = $('note-title'); if (t) t.focus(); }, 50);
});

// ── OVERVIEW ──────────────────────────────────────────────────────────────────
function renderOverview() {
  const { income, expense, balance } = calcFinance();
  const balEl = $('ov-balance');
  balEl.textContent = fmt(balance);
  balEl.className = 'card-value ' + (balance >= 0 ? 'green' : 'red');
  $('ov-income').textContent = fmt(income);
  $('ov-expense').textContent = fmt(expense);

  const done = tasks.filter(function(t) { return t.done; }).length;
  $('ov-tasks').textContent = done + ' / ' + tasks.length;

  var greetEl = $('ov-greeting');
  if (greetEl) {
    var h = new Date().getHours();
    var greet = h < 12 ? 'bom dia' : h < 18 ? 'boa tarde' : 'boa noite';
    var pendingCount = tasks.filter(function(t) { return !t.done; }).length;
    greetEl.textContent = greet + ' — ' + (pendingCount > 0 ? pendingCount + ' tarefa(s) pendente(s)' : 'tudo em dia!');
  }

  const txList = $('ov-transactions');
  const recent = transactions.slice(0, 5);
  txList.innerHTML = recent.length
    ? recent.map(t => `<li><span>${escHtml(t.desc)}</span><span class="${t.type === 'income' ? 'green' : 'red'}" style="color:var(--${t.type === 'income' ? 'green' : 'red'})">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</span></li>`).join('')
    : '<li class="empty">nenhuma transacao</li>';

  const pendList = $('ov-pending-tasks');
  const pendingTasks = tasks.filter(t => !t.done).slice(0, 5);
  pendList.innerHTML = pendingTasks.length
    ? pendingTasks.map(t => `<li><span>${escHtml(t.text)}</span><span class="priority-tag ${t.priority}">${t.priority}</span></li>`).join('')
    : '<li class="empty">nenhuma tarefa pendente</li>';
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function renderAdminDashboard() {
  // Count users
  const users = getAllUsers();
  $('admin-users-count').textContent = users.length;

  // Get logs
  const logs = getLoginLogs();
  
  // Count logins today
  const today = new Date().toLocaleDateString('pt-BR');
  const loginsToday = logs.filter(function(log) {
    const logDate = new Date(log.timestamp).toLocaleDateString('pt-BR');
    return logDate === today && log.success;
  }).length;
  $('admin-logins-today').textContent = loginsToday;

  // Total logins
  const totalLogins = logs.filter(function(log) { return log.success; }).length;
  $('admin-logins-total').textContent = totalLogins;

  // Render users table
  const usersTable = $('admin-users-table');
  if (users.length === 0) {
    usersTable.innerHTML = '<tr><td colspan="3" style="padding: 12px; text-align: center; color: var(--text-muted);">nenhum usuario registrado</td></tr>';
  } else {
    usersTable.innerHTML = users.map(function(user) {
      const created = new Date(user.createdAt).toLocaleDateString('pt-BR');
      const adminBadge = user.isAdmin ? '<span style="color: var(--green); font-size: 10px; background: var(--border); padding: 2px 6px; border-radius: 4px; margin-left: 8px;">admin</span>' : '';
      return `<tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 8px; color: var(--text);">${escHtml(user.username)}${adminBadge}</td>
        <td style="padding: 8px; color: var(--text-muted);">${created}</td>
        <td style="padding: 8px; display: flex; gap: 6px;">
          <button class="btn-clear-user-logs" data-user="${escAttr(user.username)}" style="padding: 4px 8px; font-size: 11px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 4px; cursor: pointer;">limpar logs</button>
          ${!user.isAdmin ? `<button class="btn-ban-user" data-user="${escAttr(user.username)}" style="padding: 4px 8px; font-size: 11px; border: 1px solid var(--red); background: var(--red); color: white; border-radius: 4px; cursor: pointer;">banir</button>` : ''}
        </td>
      </tr>`;
    }).join('');
    
    // Add event listeners for user actions
    document.querySelectorAll('.btn-clear-user-logs').forEach(btn => {
      btn.addEventListener('click', function() {
        const user = this.dataset.user;
        if (confirm('limpar todos os logs de ' + user + '?')) {
          clearUserLogs(user);
          renderAdminDashboard();
        }
      });
    });
    
    document.querySelectorAll('.btn-ban-user').forEach(btn => {
      btn.addEventListener('click', function() {
        const user = this.dataset.user;
        openBanModal(user);
      });
    });
  }

  // Render bans table
  const bansTable = $('admin-bans-table');
  const bans = getBans();
  if (bans.length === 0) {
    bansTable.innerHTML = '<tr><td colspan="3" style="padding: 12px; text-align: center; color: var(--text-muted);">nenhum usuario banido</td></tr>';
  } else {
    bansTable.innerHTML = bans.slice(0, 50).map(function(ban) {
      const date = new Date(ban.bannedAt).toLocaleDateString('pt-BR');
      return `<tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 8px; color: var(--text);">${escHtml(ban.username)}</td>
        <td style="padding: 8px; color: var(--text-muted);">${escHtml(ban.reason)}</td>
        <td style="padding: 8px; color: var(--text-muted);">${date}</td>
      </tr>`;
    }).join('');
  }

  // Render logs table
  const tableBody = $('admin-logs-table');
  if (logs.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3" style="padding: 12px; text-align: center; color: var(--text-muted);">nenhum login registrado</td></tr>';
  } else {
    tableBody.innerHTML = logs.slice(0, 50).map(function(log) {
      const time = new Date(log.timestamp).toLocaleString('pt-BR');
      const status = log.success ? '<span style="color: var(--green); font-weight: 500;">sucesso</span>' : '<span style="color: var(--red); font-weight: 500;">falha</span>';
      return `<tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 8px; color: var(--text);">${escHtml(log.username)}</td>
        <td style="padding: 8px; color: var(--text-muted);">${time}</td>
        <td style="padding: 8px;">${status}</td>
      </tr>`;
    }).join('');
  }
}

// Wire admin clear logs
document.getElementById('admin-clear-logs').addEventListener('click', function() {
  if (confirm('tem certeza que deseja limpar todos os logs?')) {
    clearLoginLogs();
    renderAdminDashboard();
  }
});

// ── Profile Page ──────────────────────────────────────────────────────────────
function renderProfile() {
  const session = getSession();
  if (!session) return;

  const username = session.username;
  const history = getUsageHistory(username);
  const loginLogs = getLoginLogs().filter(log => log.username === username && log.success);
  
  // Update profile info
  $('profile-username').textContent = username;
  $('profile-total-logins').textContent = loginLogs.length;
  
  // Last login
  if (loginLogs.length > 0) {
    const lastLogin = new Date(loginLogs[0].timestamp);
    $('profile-last-login').textContent = lastLogin.toLocaleString('pt-BR');
  } else {
    $('profile-last-login').textContent = '--';
  }

  // Render history table
  const currentFilter = $('history-filter')?.value || 'all';
  const filteredHistory = getFilteredHistory(username, currentFilter).reverse();
  
  const historyTable = $('profile-history-table');
  if (filteredHistory.length === 0) {
    historyTable.innerHTML = '<tr><td colspan="3" style="padding: 12px; text-align: center; color: var(--text-muted);">nenhum historico para este periodo</td></tr>';
  } else {
    historyTable.innerHTML = filteredHistory.map(entry => {
      const date = new Date(entry.timestamp).toLocaleString('pt-BR');
      const durationStr = entry.duration < 60 ? entry.duration + 's' : Math.floor(entry.duration / 60) + 'm ' + (entry.duration % 60) + 's';
      return `<tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 8px; color: var(--text);">${entry.pageLabel}</td>
        <td style="padding: 8px; color: var(--text-muted); font-size: 11px;">${date}</td>
        <td style="padding: 8px; color: var(--text-muted); text-align: right; font-size: 11px;">${durationStr}</td>
      </tr>`;
    }).join('');
  }

  // Render top pages
  const topPages = getTopPages(username);
  const topPagesEl = $('profile-top-pages');
  if (topPages.length === 0) {
    topPagesEl.innerHTML = '<div style="padding: 12px; color: var(--text-muted); text-align: center; font-size: 12px;">nenhuma pagina visitada ainda</div>';
  } else {
    topPagesEl.innerHTML = topPages.map(page => {
      const percentage = (page.count / filteredHistory.length * 100).toFixed(1);
      return `<div style="padding: 8px; background: var(--surface-2); border-radius: 8px; border: 1px solid var(--border-2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 13px; color: var(--text); font-weight: 500;">${page.label}</span>
          <span style="font-size: 11px; color: var(--text-muted);">${page.count} visitas</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
          <span>${percentage}% do tempo</span>
          <span>${page.avgTime} seg media</span>
        </div>
      </div>`;
    }).join('');
  }

  // Calculate statistics
  if (history.length > 0) {
    const totalSeconds = history.reduce((sum, h) => sum + h.duration, 0);
    const totalMinutes = Math.round(totalSeconds / 60);
    const uniqueDates = new Set(history.map(h => new Date(h.timestamp).toLocaleDateString('pt-BR')));
    const dailyAvgMinutes = Math.round(totalMinutes / uniqueDates.size);
    const uniquePages = new Set(history.map(h => h.page)).size;
    const avgTimePerPage = Math.round(totalSeconds / history.length);

    $('profile-total-time').textContent = totalMinutes + ' min';
    $('profile-daily-avg').textContent = dailyAvgMinutes + ' min';
    $('profile-pages-count').textContent = uniquePages;
    $('profile-avg-time').textContent = (Math.round(avgTimePerPage / 60 * 10) / 10) + ' min';
  } else {
    $('profile-total-time').textContent = '0 min';
    $('profile-daily-avg').textContent = '0 min';
    $('profile-pages-count').textContent = '0';
    $('profile-avg-time').textContent = '0 min';
  }
}

// Profile event listeners
const historyFilterEl = $('history-filter');
if (historyFilterEl) {
  historyFilterEl.addEventListener('change', renderProfile);
}

const clearHistoryBtn = $('clear-history-btn');
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', function() {
    const session = getSession();
    if (!session) return;
    if (confirm('tem certeza? Esta acao nao podera ser desfeita.')) {
      clearUsageHistory(session.username);
      renderProfile();
    }
  });
}

// Ban modal handlers
let banningUser = null;

function openBanModal(username) {
  banningUser = username;
  document.getElementById('ban-username').textContent = 'Banir usuario: ' + escHtml(username);
  document.getElementById('ban-reason').value = '';
  document.getElementById('ban-modal').classList.remove('hidden');
  document.getElementById('ban-reason').focus();
}

function closeBanModal() {
  document.getElementById('ban-modal').classList.add('hidden');
  banningUser = null;
}

function confirmBan() {
  if (!banningUser) return;
  const reason = document.getElementById('ban-reason').value.trim();
  if (!reason) {
    alert('digite um motivo para o ban');
    return;
  }
  deleteUser(banningUser, reason);
  closeBanModal();
  renderAdminDashboard();
}

document.getElementById('ban-close').addEventListener('click', closeBanModal);
document.getElementById('ban-cancel').addEventListener('click', closeBanModal);
document.getElementById('ban-confirm').addEventListener('click', confirmBan);
document.getElementById('ban-modal').addEventListener('click', function(e) {
  if (e.target === this) closeBanModal();
});

// ── Escape helpers ────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

// ── Init ──────────────────────────────────────────────────────────────────────
renderTasks();
renderFinance();
renderNotesList();
renderOverview();
renderProfile();

// ── Delete Account ────────────────────────────────────────────────────────────
const deleteAccountBtn = $('delete-account-btn');
const deleteAccountModal = $('delete-account-modal');
const deleteAccountClose = $('delete-account-close');
const deleteAccountCancel = $('delete-account-cancel');
const deleteAccountConfirm = $('delete-account-confirm');
const deleteUsernameConfirm = $('delete-username-confirm');

function openDeleteAccountModal() {
  deleteAccountModal.classList.remove('hidden');
  deleteUsernameConfirm.value = '';
  deleteAccountConfirm.disabled = true;
}

function closeDeleteAccountModal() {
  deleteAccountModal.classList.add('hidden');
}

deleteAccountBtn.addEventListener('click', openDeleteAccountModal);
deleteAccountClose.addEventListener('click', closeDeleteAccountModal);
deleteAccountCancel.addEventListener('click', closeDeleteAccountModal);
deleteAccountModal.addEventListener('click', function(e) {
  if (e.target === this) closeDeleteAccountModal();
});

deleteUsernameConfirm.addEventListener('input', function() {
  const currentSession = load(SESSION_KEY, null);
  const isMatch = this.value === currentSession.username;
  deleteAccountConfirm.disabled = !isMatch;
  if (isMatch) {
    deleteAccountConfirm.style.opacity = '1';
  } else {
    deleteAccountConfirm.style.opacity = '0.5';
  }
});

deleteAccountConfirm.addEventListener('click', function() {
  const currentSession = load(SESSION_KEY, null);
  const confirmUsername = deleteUsernameConfirm.value;
  
  if (!currentSession) {
    alert('erro: sessao invalida');
    return;
  }
  
  if (confirmUsername !== currentSession.username) {
    alert('nome de usuario nao corresponde');
    return;
  }
  
  if (!confirm('⚠️ ÚLTIMO AVISO:\n\nSua conta será PERMANENTEMENTE DELETADA.\nTodos os seus dados, tarefas, notas e histórico serão perdidos.\n\nDeseja continuar?')) {
    return;
  }
  
  // Delete user from database
  const db = load(AUTH_KEY, { users: [] });
  const userIndex = db.users.findIndex(u => u.username === currentSession.username);
  
  if (userIndex !== -1) {
    db.users.splice(userIndex, 1);
    save(AUTH_KEY, db);
  }
  
  // Clear all user data
  localStorage.clear();
  sessionStorage.removeItem(SESSION_KEY);
  
  // Show confirmation and redirect to login
  alert('✓ Conta deletada com sucesso.\n\nVocê será redirecionado para a tela de login.');
  location.reload();
});

// ── Dark mode ─────────────────────────────────────────────────────────────────────
const themeBtn = $('theme-btn');
const sunIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const moonIcon = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

const applyTheme = function(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  var icon = $('theme-icon');
  var label = $('theme-label');
  if (icon) icon.outerHTML = (dark ? sunIcon : moonIcon).replace('<svg', '<svg id="theme-icon"');
  if (label) label.textContent = dark ? 'modo claro' : 'modo escuro';
};

let isDark = load('dark', true);
applyTheme(isDark);

themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  save('dark', isDark);
  applyTheme(isDark);
  renderCharts();
});

} // end initApp
