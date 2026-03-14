const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8000;
const DIR = __dirname;
const DATA_FILE = path.join(DIR, 'data.json');

// Carregar dados salvos
let appData = {};
try {
  if (fs.existsSync(DATA_FILE)) {
    appData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (e) {
  console.log('Erro ao carregar dados.json:', e.message);
}

// Salvar dados para arquivo
function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2));
  } catch (e) {
    console.log('Erro ao salvar dados:', e.message);
  }
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ── API Endpoints ──────────────────────────────────
  if (req.url.startsWith('/api/')) {
    // GET /api/data/:key
    if (req.method === 'GET' && req.url.startsWith('/api/data/')) {
      const key = req.url.split('/api/data/')[1];
      const value = appData[key];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ key, value: value || null }));
      return;
    }

    // POST /api/data/:key
    if (req.method === 'POST' && req.url.startsWith('/api/data/')) {
      const key = req.url.split('/api/data/')[1];
      let body = '';
      
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          appData[key] = data.value;
          saveData();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, key }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    // GET /api/all - retorna todos os dados
    if (req.method === 'GET' && req.url === '/api/all') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(appData));
      return;
    }
  }

  // ── Servir arquivos ──────────────────────────────
  let filePath = path.join(DIR, req.url === '/' ? 'index.html' : req.url);
  
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const ext = path.extname(filePath);
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://192.168.0.7:${PORT}`);
  console.log(`📱 Acesse do celular: http://192.168.0.7:${PORT}`);
  console.log(`💾 Dados sincronizados em: ${DATA_FILE}`);
});
