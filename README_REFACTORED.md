# 🚀 Aphaday 2.0 - PWA & Electron App

Uma aplicação completa de gerenciamento pessoal com autenticação segura, controle financeiro, tarefas e notas em tempo real.

## ✨ Características

### 🔐 Segurança
- **Autenticação com SHA-256**: Hashing seguro de senhas
- **Controle de Usuários**: Sistema admin com permissões diferentes
- **Ban de Usuários**: Gerenciamento de usuários problemáticos
- **Recovery Code**: Sistema de recuperação de acesso
- **Logs de Acesso**: Rastreamento de todas as tentativas de login

### 📊 Dashboard
- **Visão Geral**: Resumo de saldo, tarefas e transações recentes
- **Tarefas**: Sistema completo com prioridades (alta, normal, baixa)
- **Finanças**: Controle de receitas/despesas com gráficos Chart.js
- **Notas**: Editor de notas com sincronização em tempo real

### 👤 Perfil & Admin
- **Histórico de Uso**: Rastreamento de páginas visitadas e tempo gasto
- **Estatísticas**: Páginas mais visitadas e duração média
- **Modo Admin**: Gerenciamento completo de usuários e logs
- **Histórico de Logins**: Visualização de todos os acessos

### 🎨 Interface
- **Tema Escuro/Claro**: Toggle dinâmico de temas
- **Responsivo**: Funciona em diferentes tamanhos de tela
- **Offline**: Progressive Web App (PWA) com Service Worker
- **Animações**: Transições suaves e feedback visual

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: LocalStorage + SessionStorage (PWA)
- **Segurança**: Web Crypto API (SHA-256)
- **Visualização**: Chart.js 4.4.0
- **Desktop**: Electron 26.0.0
- **Styling**: CSS Variables, CSS Grid, Flexbox

## 📋 Requisitos

### Para executar como PWA
- Node.js 14+ (opcional, para servidor)
- Navegador moderno com suporte a Service Worker

### Para executar como Desktop (Electron)
- Node.js 14+
- npm

## 🚀 Como Começar

### Opção 1: Executar como PWA

```bash
# Basta abrir index.html em um navegador moderno
# O app será autoinstalável como PWA
```

### Opção 2: Executar como Electron

```bash
# Instalar dependências
npm install

# Iniciar o app
npm start

# Compilar para Windows
npm run package
```

### Dados de Teste

**Admin padrão:**
- 📝 Usuário: `Chok`
- 🔑 Senha: `Ceo123`

> ⚠️ Altere as credenciais admin após o primeiro acesso!

## 📁 Estrutura de Arquivos

```
aphaday-app/
├── index.html          # Arquivo principal HTML
├── style.css          # Estilos CSS consolidados
├── app.js             # Lógica principal da aplicação
├── electron-main.js   # Configuração Electron
├── preload.js         # Preload script Electron
├── manifest.json      # Manifesto PWA
├── sw.js              # Service Worker
├── suporte.html       # Página de suporte
└── icons/             # Ícones da aplicação
```

## 🔧 Configuração

### LocalStorage Keys

- `users_database` - Base de dados de usuários
- `auth_session` - Sessão ativa do usuário
- `login_logs` - Histórico de logins
- `user_bans` - Usuários banidos
- `usage_history` - Histórico de uso por página
- `tasks` - Lista de tarefas
- `transactions` - Histórico financeiro
- `notes` - Notas salvas
- `dark` - Preferência de tema

## 🔒 Segurança

### Senhas
- SHA-256 via Web Crypto API
- Não são armazenadas em texto plano
- Mínimo 4 caracteres (recomenda-se 8+)

### Dados
- Armazenados apenas no navegador (LocalStorage)
- Sem sincronização na nuvem
- Privacidade total do usuário

### Validações
- Entrada sanitizada com `escHtml()`
- Validação de limites (tamanho máximo)
- Prevenção de XSS

## 📱 Responsividade

### Desktop (1200px+)
- Sidebar completa com textos
- Grid de 2+ colunas

### Tablet (768px - 1199px)
- Sidebar em ícones compactos
- Grid adaptável

### Mobile (< 768px)
- Sidebar minimizado (ícones apenas)
- Layout em coluna única
- Otimizado para toque

## 🐛 Conhecidos/Melhorias

- [ ] Sincronização em nuvem
- [ ] Exportar/Importar dados (JSON, CSV)
- [ ] Backups automáticos
- [ ] Notificações de tarefas
- [ ] Compartilhamento de notas
- [ ] Múltiplos idiomas
- [ ] Temas customizados

## 🔄 Changelog

### v2.0 - Refactored Edition
✅ Corrigidos erros de sintaxe no app.js
✅ Melhorado tratamento de erros
✅ Validações mais rigorosas de entrada
✅ CSS responsivo aprimorado
✅ Bug fixes no recovery code
✅ Melhor gerenciamento de credenciais
✅ Animações suaves adicionadas

## 📄 Licença

Desenvolvimento privado - Todos os direitos reservados

## 👤 Suporte

Para dúvidas ou problemas:
1. Verifique o console do navegador (F12)
2. Consulte a página de suporte em-app
3. Limpe o cache (Ctrl+Shift+Delete)

---

**Desenvolvido com ❤️ para Aphaday**
