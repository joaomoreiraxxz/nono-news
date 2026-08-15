#!/bin/bash
# ==========================================
# Nono News — Script de Deploy Automático
# Cole esse script na VPS e ele faz TUDO!
# ==========================================

echo ""
echo "🚀 =============================="
echo "   NONO NEWS — DEPLOY AUTOMÁTICO"
echo "============================== 🚀"
echo ""

# 1. Atualizar sistema
echo "📦 [1/8] Atualizando sistema..."
apt update -y && apt upgrade -y

# 2. Instalar Node.js 20
echo "📦 [2/8] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Instalar Nginx, Git, Certbot
echo "📦 [3/8] Instalando Nginx, Git, Certbot..."
apt install -y nginx git certbot python3-certbot-nginx

# 4. Instalar PM2
echo "📦 [4/8] Instalando PM2..."
npm install -g pm2

# 5. Clonar o projeto do GitHub
echo "📦 [5/8] Baixando projeto do GitHub..."
rm -rf /var/www/nononews
cd /var/www
git clone https://github.com/joaomoreiraxxz/nono-news.git nononews
cd /var/www/nononews

# 6. Instalar dependências
echo "📦 [6/8] Instalando dependências Node.js..."
npm install

# 7. Criar .env
echo "📦 [7/8] Criando arquivo .env..."
mkdir -p server/data
cat > server/.env << 'EOF'
JWT_SECRET=nononews_jwt_secret_2026_escola_adventista_prod
PORT=3000
NODE_ENV=production
EOF

# 8. Migrar banco + build
echo "📦 [8/8] Criando banco de dados e gerando build..."
node server/db/migrate.js
npm run build

# 9. Iniciar com PM2
echo "🟢 Iniciando backend com PM2..."
pm2 delete nononews 2>/dev/null
pm2 start server/index.js --name "nononews"
pm2 save
pm2 startup | tail -1 | bash

# 10. Configurar Nginx
echo "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/nononews << 'NGINX'
server {
    listen 80;
    server_name _;

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
NGINX

ln -sf /etc/nginx/sites-available/nononews /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "✅ =============================="
echo "   DEPLOY CONCLUÍDO COM SUCESSO!"
echo "============================== ✅"
echo ""
echo "🌐 Site: http://179.198.113.136"
echo "🔐 Admin: http://179.198.113.136/login.html"
echo "📡 API: http://179.198.113.136/api/health"
echo ""
echo "Login: admin@escola.com / nono2026"
echo ""
echo "Depois, rode o certbot para HTTPS:"
echo "  certbot --nginx -d seudominio.com.br -d www.seudominio.com.br"
echo ""
