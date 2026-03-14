# 🚀 Quick Start Guide - Aphaday 2.0

## ⚡ Começar em 60 Segundos

### Opção 1: Browser (Recomendado)
```bash
# 1. Abra o arquivo index.html no navegador
# 2. O app será oferecido para instalar
# 3. Clique em \"Instalar\" ou use as credenciais:

Usuário: Chok
Senha: Ceo123
```

### Opção 2: Electron Desktop
```bash
# 1. Abra o terminal na pasta do app
cd Aphaday\ 2.0

# 2. Instale as dependências
npm install

# 3. Inicie o app
npm start
```

---

## 🎮 Primeiros Passos

### 1. Fazer Login
```
Usuario: Chok
Senha: Ceo123
```

### 2. Mudar Senha
- Clique em \"Alterar Senha\" na sidebar
- Digite nova senha (min. 4 caracteres)
- Confirme a senha

### 3. Adicionar Tarefa
- Vá para \"Tarefas\"
- Digite sua tarefa
- Selecione prioridade (alta/normal/baixa)
- Clique \"+Adicionar\"

### 4. Registrar Transação
- Vá para \"Finanças\"
- Digite: descrição, valor, tipo (receita/despesa), categoria
- Clique \"+Adicionar\"

### 5. Criar Nota
- Vá para \"Notas\"
- Clique \"Nova Nota\"
- Digite conteúdo (auto-salva)

---

## 📊 Explorar as Seções

### 🏠 Visão Geral
- Resumo financeiro (saldo atual, receitas, despesas)
- Progresso de tarefas
- Transações recentes
- Tarefas pendentes

### ✅ Tarefas
- Criar, marcar como concluída, excluir
- Filtrar por status (todas, pendentes, concluídas)
- Prioridades: Alta, Normal, Baixa

### 💰 Finanças
- Adicionar receitas e despesas
- Categorizar (alimentação, transporte, etc.)
- Gráficos de despesas por categoria
- Comparativo 6 meses

### 📝 Notas
- Criar notas com título e corpo
- Auto-salva em tempo real
- Lista lateral (pesquisador de notas)
- Excluir notas

### 👤 Perfil
- Histórico de uso por página
- Estatísticas (tempo total, média, etc.)
- Páginas mais visitadas
- Opção de limpar histórico

### ⚙️ Admin (apenas para admin)
- Count de usuários
- Visualizar logins de hoje e total
- Histórico de logins (últimas 100)
- Usuários registrados com ações
- Usuários banidos
- Limpar todos os logs

---

## 🎨 Interface

### Tema
- **Escuro** (padrão): Confortável para noite
- **Claro**: Melhor para ambientes com luz

### Sidebar
- Clique nos ícones para navegar
- No mobile: Sidebar se reduz a ícones

### Responsive
- **Desktop** (1400px+): Layout completo
- **Tablet** (768-1399px): Sidebar compacta
- **Mobile** (<768px): Layout otimizado

---

## 🔒 Segurança

### Senhas
- Mínimo 4 caracteres (recomenda-se 8+)
- Hasheadas com SHA-256
- Nunca armazenadas em texto plano

### Dados
- Armazenados apenas no seu navegador
- Sem sincronização na nuvem
- 100% privado

### Validações
- Entrada de usuários sanitizada
- Proteção contra XSS
- Confirmação em ações destrutivas

---

## ⚠️ Cuidados

### Deletar Conta
```
⚠️ AÇÃO IRREVERSÍVEL!
- Todos os dados são apagados
- Histórico não pode ser recuperado
- Precisa confirmar com username
```

### Limpar Logs
```
- Afeta apenas o usuário logado
- Não apaga tarefas, notas ou transações
- Apenas histórico de acesso
```

### Ban de Usuários
```
🚫 ADMIN ONLY
- Usuário banido não pode mais fazer login
- Pode ser revertido editando localStorage
```

---

## 🐛 Troubleshooting

### Esqueci minha senha
```
1. Clique em \"Esqueceu a senha?\"
2. Digite o recovery code (padrão: \"Ceo123\")
3. Defina novas credenciais
4. Faça login normalmente
```

### Dados desapareceram
```
1. Abra DevTools (F12)
2. Application > LocalStorage
3. Verifique as chaves (users_database, tasks, etc.)
4. Se vazio, foram realmente deletados
```

### App não abre
```
1. Feche todas as abas
2. Limpe cache (Ctrl+Shift+Delete)
3. Reabra a página
4. Se persistir, verifique console (F12)
```

### Performance lenta
```
1. Muitas tarefas/transações?
2. Limpe histórico de uso
3. Exporte dados para backup
4. Crie novo perfil (fresh start)
```

---

## 💾 Backup & Restore

### Fazer Backup
```
1. Abra DevTools (F12)
2. Application > LocalStorage
3. Copie cada entrada
4. Cole em arquivo .txt ou tome screenshot
```

### Exportar Dados (Manual)
```javascript
// Cole no Console (F12):
localStorage // Para ver tudo
JSON.parse(localStorage.getItem('tasks'))
JSON.parse(localStorage.getItem('transactions'))
JSON.parse(localStorage.getItem('notes'))
```

### Restaurar
```javascript
// Se perdeu dados, restaure via localStorage
localStorage.setItem('tasks', '[...]')
// Em seguida, recarregue a página
```

---

## ❓ FAQ

**P: Posso usar em celular?**
R: Sim! O app é PWA e responsivo. Funciona em qualquer navegador moderno.

**P: Os dados são salvos na nuvem?**
R: Não. Tudo fica apenas no seu navegador/computador. Totalmente privado.

**P: Posso sincronizar entre dispositivos?**
R: Não no momento. Futura versão terá opção de cloud sync.

**P: Preciso de internet?**
R: Não! Funciona 100% offline. Instalado como PWA funciona sem internet.

**P: Posso compartilhar notas com outros?**
R: Não no momento. Apenas uso pessoal por enquanto.

**P: Como faço backup?**
R: Via LocalStorage (DevTools). Próxima versão terá exportação automática.

**P: É seguro colocar informações sensíveis?**
R: Sim, mas recomenda-se usar senhas fortes. Não é criptografado em disco.

**P: Posso usar em trabalho?**
R: Sim! É ideal para controle pessoal de projeto, tarefas e finanças.

---

## 📞 Suporte

### Problemas Técnicos
1. Verifique o console (F12)
2. Procure por mensagens de erro
3. Tente limpar cache
4. Reabra o app

### Sugestões & Features
- Página de suporte in-app
- Ou entre em contato via email

### Bugs
- Documente o erro
- Tire screenshot/video
- Relate com passos para reproduzir

---

## 🎓 Dicas & Tricks

### Atalhos
- **Tema**: Botão na sidebar
- **Logout**: Botão \"Sair\" na sidebar
- **Perfil**: Clique em \"Perfil\" na sidebar

### Design
- Dark mode é melhor para noite
- Light mode para ambiente claro
- Ajuste zoom do navegador se needed

### Organização
- Use prioridades em tarefas
- Categorize bem as transações
- Crie notas de referência

---

**Versão**: 2.0.1
**Data**: Março 2026
**Status**: ✅ Pronto para usar

Aproveite! 🎉
