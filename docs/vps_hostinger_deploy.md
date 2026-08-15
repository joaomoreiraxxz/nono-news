# 🚀 PASSO A PASSO COMPLETO — Deploy na VPS Hostinger

> **Guia feito para quem nunca mexeu com VPS.**
> Cada comando está explicado. Copie e cole no terminal.

---

## 📋 ANTES DE COMEÇAR — O que você precisa ter:

- ✅ Uma **VPS na Hostinger** (plano KVM ou qualquer um com Ubuntu)
- ✅ Um **domínio** (pode ser comprado na Hostinger ou outro lugar)
- ✅ O **IP da sua VPS** (aparece no painel da Hostinger)
- ✅ A **senha de root** da VPS (definida ao criar a VPS)
- ✅ Uma **conta no GitHub** (gratuita em https://github.com)

---

## ETAPA 1 — Apontar o Domínio para a VPS

> Faça isso PRIMEIRO porque demora até 24h para propagar.

1. Entre no painel da **Hostinger** (ou onde comprou o domínio)
2. Vá em **DNS / Zona DNS** do seu domínio
3. Crie (ou edite) estes 2 registros:

```
Tipo: A    |  Nome: @    |  Valor: SEU_IP_DA_VPS    |  TTL: 3600
Tipo: A    |  Nome: www  |  Valor: SEU_IP_DA_VPS    |  TTL: 3600
```

4. Salve e espere propagar (pode levar de 5 min a 24h)

---

## ETAPA 2 — Conectar na VPS via SSH

Abra o **Prompt de Comando** ou **PowerShell** no seu computador e digite:

```bash
ssh root@SEU_IP_DA_VPS
```

> Exemplo real: `ssh root@154.32.87.123`

Ele vai perguntar: `Are you sure you want to continue connecting?`
- Digite: **yes** e aperte Enter

Depois ele pede a senha:
- **Digite a senha de root** (nada aparece na tela, é normal)
- Aperte Enter

Se aparecer algo como `root@vps:~#` — **você está dentro!** 🎉

---

## ETAPA 3 — Preparar o Servidor (Instalar tudo)

Copie e cole **um por um** na ordem:

### 3.1 — Atualizar o sistema
```bash
apt update && apt upgrade -y
```

### 3.2 — Instalar o Node.js 20
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 3.3 — Verificar se instalou certo
```bash
node -v
npm -v
```
> Deve aparecer algo como: `v20.x.x` e `10.x.x`

### 3.4 — Instalar o Nginx (servidor web) e Git
```bash
apt install -y nginx git
```

### 3.5 — Instalar o PM2 (mantém o backend rodando 24h)
```bash
npm install -g pm2
```

### 3.6 — Instalar o Certbot (SSL / HTTPS / Cadeado)
```bash
apt install -y certbot python3-certbot-nginx
```

---

## ETAPA 4 — Subir o Projeto pro GitHub

> Em vez de copiar arquivos manualmente, vamos usar o **GitHub**.
> Você sobe o código pro GitHub e na VPS faz `git clone`.

### 4.1 — Criar um repositório no GitHub
1. No GitHub, clique no **+** (canto superior direito) → **New repository**
2. Nome: `nono-news`
3. Deixe como **Public**
4. **NÃO** marque "Add a README"
5. Clique em **Create repository**
6. O GitHub vai mostrar uma URL tipo: `https://github.com/SEU_USUARIO/nono-news.git` — **copie essa URL**

### 4.2 — No seu PC, enviar o código pro GitHub

Abra o **terminal do VSCode** (na pasta do projeto) e rode:

```powershell
git init
git add .
git commit -m "Nono News - site completo com backend"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nono-news.git
git push -u origin main
```

> ⚠️ Troque `SEU_USUARIO` pelo seu nome de usuário do GitHub!
> Ele pode pedir seu login do GitHub na primeira vez.

### 4.3 — Na VPS, baixar o projeto do GitHub

Agora **no terminal da VPS** (aquele com `root@vps:~#`):

```bash
cd /var/www
git clone https://github.com/SEU_USUARIO/nono-news.git nononews
```

> Isso baixa **tudo** automaticamente pra pasta `/var/www/nononews`. 🎉

---

## ETAPA 5 — Instalar e Configurar na VPS

### 5.1 — Entrar na pasta do projeto
```bash
cd /var/www/nononews
```

### 5.2 — Instalar as dependências
```bash
npm install
```

### 5.3 — Criar o arquivo .env
```bash
nano server/.env
```
Cole este conteúdo:
```
JWT_SECRET=MinhaChaveSecretaMuitoLonga123456789
PORT=3000
NODE_ENV=production
```
Salvar: `Ctrl + O` → `Enter` → `Ctrl + X`

### 5.4 — Criar o banco de dados + admin
```bash
npm run migrate
```

> Deve aparecer:
> ```
> ✅ Tabela "users" criada/verificada.
> ✅ Tabela "articles" criada/verificada.
> ✅ Tabela "ratings" criada/verificada.
> ✅ Primeiro admin criado: admin@escola.com / nono2026
> 🎉 Migração concluída com sucesso!
> ```

### 5.5 — Gerar o build do frontend
```bash
npm run build
```

---

## ETAPA 6 — Iniciar o Backend com PM2

```bash
pm2 start server/index.js --name "nononews"
pm2 save
pm2 startup
```

Verificar: `pm2 status` → Deve mostrar `nononews | online`

---

## ETAPA 7 — Configurar o Nginx

### 7.1 — Criar configuração
```bash
nano /etc/nginx/sites-available/nononews
```

### 7.2 — Cole isso (troque `seudominio.com.br`):
```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    root /var/www/nononews/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Salvar: `Ctrl + O` → `Enter` → `Ctrl + X`

### 7.3 — Ativar e reiniciar
```bash
ln -s /etc/nginx/sites-available/nononews /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## ETAPA 8 — HTTPS (Cadeado 🔒)

```bash
certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

Ele vai perguntar seu e-mail e se aceita os termos → digite **Y**.

---

## ✅ PRONTO! Seu site está no ar!

| O que | Endereço |
|---|---|
| 🌐 Site | `https://seudominio.com.br` |
| 🔐 Admin | `https://seudominio.com.br/login.html` |
| 📡 API | `https://seudominio.com.br/api/health` |

**Login:** `admin@escola.com` / `nono2026`

---

## 🔄 COMO ATUALIZAR O SITE DEPOIS

### No seu PC (quando fizer mudanças):
```powershell
git add .
git commit -m "Descricao do que mudou"
git push
```

### Na VPS:
```bash
cd /var/www/nononews
git pull
npm install
npm run build
pm2 restart nononews
```

---

## 🔧 COMANDOS ÚTEIS

```bash
pm2 status                # Ver se está rodando
pm2 restart nononews      # Reiniciar backend
pm2 logs nononews         # Ver erros
systemctl restart nginx   # Reiniciar Nginx
```
