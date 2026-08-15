// ==========================================
// Nono News — Servidor Backend Express
// Entry point: node server/index.js
// ==========================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Rotas
import authRoutes from './routes/auth.js';
import articlesRoutes from './routes/articles.js';
import ratingsRoutes from './routes/ratings.js';

// Banco de dados — auto migração
import db from './db/pool.js';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// ==========================================
// Middlewares Globais
// ==========================================
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Helmet para segurança (mais permissivo em dev para Vite)
if (isProd) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://www.google.com"],
        connectSrc: ["'self'"],
      },
    },
  }));
}

// ==========================================
// Rotas da API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/ratings', ratingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: isProd ? 'production' : 'development',
  });
});

// ==========================================
// Servir arquivos estáticos (PRODUÇÃO)
// Em dev, o Vite serve os arquivos e faz proxy das /api
// ==========================================
if (isProd) {
  const distPath = join(__dirname, '..', 'dist');

  // Intercept root to serve admin.html if it's the admin subdomain
  app.get('/', (req, res, next) => {
    const host = req.hostname || '';
    if (host.startsWith('admin.')) {
      return res.sendFile(join(distPath, 'admin.html'));
    }
    next();
  });

  app.use(express.static(distPath));

  // SPA fallback — roteia corretamente dependendo do subdomínio
  app.get('{*path}', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
    
    const host = req.hostname || '';
    if (host.startsWith('admin.')) {
      res.sendFile(join(distPath, 'admin.html'));
    } else {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// ==========================================
// Auto-migração (cria tabelas + admin ao iniciar)
// ==========================================
function autoMigrate() {
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
      role TEXT DEFAULT 'admin', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      summary TEXT, category TEXT, image_url TEXT,
      is_featured INTEGER DEFAULT 0, author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.exec(`CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
      comment TEXT, stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      is_site INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Migracao para adicionar coluna is_approved se nao existir
    try {
      db.prepare('ALTER TABLE ratings ADD COLUMN is_approved INTEGER DEFAULT 0').run();
    } catch (e) {
      // Ignora erro se a coluna ja existe
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@escola.com');
    if (!existing) {
      const hash = bcrypt.hashSync('nono2026', 10);
      db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Administrador', 'admin@escola.com', hash, 'admin');
      console.log('✅ Admin criado: admin@escola.com / nono2026');
    }
    console.log('✅ Banco de dados OK');
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
  }
}
autoMigrate();

// ==========================================
// Iniciar servidor
// ==========================================
app.listen(PORT, () => {
  console.log(`🗞️ Nono News rodando na porta ${PORT} (${isProd ? 'PRODUÇÃO' : 'DEV'})`);
});

export default app;
