# 🚀 Deploy Aphaday on Railway.app

## Opção 1: Deploy Online em 2 Minutos (Recomendado)

### Passo 1: Preparar GitHub
```bash
# 1. Criar repositório no GitHub
# 2. Fazer push do código:
git init
git add .
git commit -m "Aphaday v2.0"
git branch -M main
git remote add origin https://github.com/SEU_USER/aphaday.git
git push -u origin main
```

### Passo 2: Deploy no Railway
1. Acesse https://railway.app
2. Clique em "New Project"
3. Selecione "Deploy from GitHub" 
4. Conecte sua conta GitHub
5. Selecione o repositório `aphaday`
6. Railway detecta automaticamente Node.js
7. Clique "Deploy"
8. **Pronto!** 🎉 Sua URL estará pronta em 2-5 minutos

### Resultado:
- URL pública: `https://aphaday-xxx.railway.app`
- Dados salvos em `data.json` (persistente)
- Acesse de qualquer lugar do mundo
- Mobile + Desktop sincronizados
- Domain customizado (opcional)

---

## Opção 2: Deploy Local com ngrok (Gratuito)

Se quiser testar online sem GitHub:

```bash
# 1. Instalar ngrok
# De: https://ngrok.com/download

# 2. Rodar servidor localmente (já rodando)
# node server.js

# 3. Em outro terminal, expor para o mundo
ngrok http 8000

# 4. Sua URL pública:
# https://xxxxxxx.ngrok.io
```

---

## Opção 3: Vercel (Alternativa)

```bash
npm install -g vercel
vercel --prod
```

---

## FAQ

**P: Vai perder dados quando reiniciar?**
R: Não! Os dados ficam salvos em `data.json` que é persistente no Railway.

**P: Quantos usuários podem usar?**
R: Apenas um (usuário "Chok"). Para múltiplos usuários, precisa adaptar o sistema de auth.

**P: Precisa de banco de dados?**
R: Não! Railway permite usar arquivo JSON por enquanto. Para escalar, use MongoDB/PostgreSQL.

**P: Qual é o custo?**
R: Railway tem $5/mês free, depois são bem baratos.

---

## Informações de Login

- **Usuário:** Chok
- **Senha:** Ceo123

---

Após deploy, acesse:
- 🖥️ Desktop: https://seu-dominio.railway.app
- 📱 Mobile: Escaneie o QR code na aba "Celular"

Tudo sincronizado em tempo real! 🔄✨
