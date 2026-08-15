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
  // Em produção, serve o build do Vite (pasta dist/)
  const distPath = join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // SPA fallback — qualquer rota que não seja /api vai pro index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// ==========================================
// Iniciar servidor
// ==========================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🗞️  Nono News — Backend Ativo               ║
║                                               ║
║   📡  API:   http://localhost:${PORT}/api       ║
║   💚  Health: http://localhost:${PORT}/api/health║
║   🌐  Env:   ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}                   ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
