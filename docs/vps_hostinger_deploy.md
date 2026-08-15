# 🚀 DEPLOY NA VPS COM EASYPANEL — bytecrm.online

> Sua VPS já tem o **EasyPanel** instalado. Vamos criar o app pelo painel.

---

## ETAPA 1 — Acessar o EasyPanel

1. Abra no navegador: **https://bytecrm.online** (ou pelo IP: `https://179.198.113.136`)
2. Faça login no EasyPanel

---

## ETAPA 2 — Criar um Projeto no EasyPanel

1. No menu lateral, clique em **"Projects"** → **"+ Create Project"**
2. Nome do projeto: `nono-news`
3. Clique em **Create**

---

## ETAPA 3 — Criar uma App dentro do Projeto

1. Dentro do projeto `nono-news`, clique em **"+ Create Service"**
2. Escolha **"App"**
3. Nome do serviço: `web`

---

## ETAPA 4 — Conectar ao GitHub

1. Na aba **"Source"** da app:
   - Source Type: **GitHub**
   - Repository: `joaomoreiraxxz/nono-news`
   - Branch: `main`
2. Na aba **Build**:
   - Build Type: **Nixpacks** (ele detecta Node.js automaticamente)
3. Clique em **Deploy**

---

## ETAPA 5 — Configurar Variáveis de Ambiente

1. Vá na aba **"Environment"** da app
2. Adicione estas variáveis:

```
JWT_SECRET=nononews_jwt_secret_2026_escola_adventista_prod
PORT=3000
NODE_ENV=production
```

3. Clique em **Save** → **Redeploy**

---

## ETAPA 6 — Configurar o Domínio

1. Vá na aba **"Domains"** da app
2. Clique em **"+ Add Domain"**
3. Adicione: `nononews.bytecrm.online` (ou um subdomínio que quiser)
4. Porta: `3000`
5. O EasyPanel gera o SSL automaticamente!

---

## ETAPA 7 — Rodar a Migração (criar banco + admin)

1. Vá na aba **"Shell"** da app (ou **"Terminal"**)
2. Rode:
```bash
node server/db/migrate.js
```

---

## ✅ PRONTO!

| O que | URL |
|---|---|
| 🌐 Site | `https://nononews.bytecrm.online` |
| 🔐 Admin | `https://nononews.bytecrm.online/login.html` |

**Login:** `admin@escola.com` / `nono2026`

---

## ALTERNATIVA: Deploy via Terminal SSH

Se preferir fazer pelo terminal em vez do painel visual:

```bash
# Conectar na VPS
ssh root@179.198.113.136

# Clonar o projeto
cd /var/www
git clone https://github.com/joaomoreiraxxz/nono-news.git nononews
cd /var/www/nononews

# Instalar dependências
npm install

# Criar .env
cat > server/.env << 'EOF'
JWT_SECRET=nononews_jwt_secret_2026_escola_adventista_prod
PORT=3000
NODE_ENV=production
EOF

# Criar banco de dados
node server/db/migrate.js

# Gerar build do frontend
npm run build

# Iniciar com PM2
npm install -g pm2
pm2 start server/index.js --name "nononews"
pm2 save && pm2 startup
```

Depois no EasyPanel, crie um proxy domain apontando para `localhost:3000`.
