# Aphaday v2.1.0 ✨

**Interface renovada com gradientes modernos e animações suaves!**

Aphaday é um gestor pessoal completo para tarefas, finanças e notas, com sincronização perfeita entre desktop e mobile.

## ✨ Novidades na v2.1.0

- **Interface renovada**: Gradientes modernos e cores vibrantes
- **Animações suaves**: Efeitos de glow e transições fluidas
- **Melhor responsividade**: Otimizado para desktop e mobile
- **Visual aprimorado**: Cards com efeitos de hover e sombras dinâmicas
- **Performance**: Carregamento mais rápido e interações mais suaves
- **Painel Administrativo**: Controle completo do sistema (admin.html)

## Funcionalidades

### 🏠 Aplicação Principal
- **Gestão de Tarefas**: Organize seu dia com listas de tarefas
- **Controle Financeiro**: Acompanhe receitas e despesas
- **Notas Pessoais**: Anotações rápidas e organizadas
- **Sincronização**: Dados sincronizados entre dispositivos
- **PWA**: Funciona offline como app nativo

### 👑 Painel Administrativo (admin.html)
**Acesso exclusivo para administradores**

- **📊 Dashboard**: Estatísticas e gráficos em tempo real
- **📢 Sistema de Avisos**: Envie notificações para todos os usuários
- **👥 Gerenciamento de Usuários**: Controle completo dos perfis
- **📋 Logs do Sistema**: Histórico detalhado de todas as atividades
- **⚙️ Configurações**: Modo manutenção, backups automáticos

To use a custom logo image for the site, save your image file in the `icons` folder as `logo.png`. The application uses this file in the sidebar and login screen. For best results, make sure the image is square; the code will resize it to fit 16×16 or 40×40 pixels.

If you want the Progressive Web App icons (in `manifest.json`) to match the new logo, replace `icons/icon-192.png` and `icons/icon-512.png` with 192×192 and 512×512 versions of your logo. Keep the same filenames or update the manifest accordingly.

## Desktop application (offline)

The site can be wrapped into a simple desktop app using [Electron]. A minimal setup is already included:

1. install [Node.js] (which provides `npm`).
2. run `npm install` in the project root to fetch `electron` and `electron-packager`.
3. start the app during development with:
   ```bash
   npm run start
   ```
   This launches an Electron window that loads `index.html` locally; it does not require any network connection.
4. to build a self-contained Windows executable, run:
   ```bash
   npm run package
   ```
   The packaged application will be output under the `dist` folder. You can copy it to any offline PC and run it directly.

The configuration lives in `electron-main.js` (window size, menu, etc.) and can be customized.

[Electron]: https://www.electronjs.org/
[Node.js]: https://nodejs.org/
To preview the app, open `index.html` in a browser or run `Iniciar.ps1`/`Iniciar-App.bat` which starts a simple HTTP server and opens the page automatically.
