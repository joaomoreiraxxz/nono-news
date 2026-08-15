// ==========================================
// Nono News — Migração do Banco SQLite
// Cria as tabelas e o primeiro admin
// Uso: node server/db/migrate.js
// ==========================================
import db from './pool.js';
import bcrypt from 'bcrypt';

function migrate() {
  console.log('🔄 Iniciando migração do banco de dados...\n');

  // ==========================================
  // TABELA: users
  // ==========================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      role       TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela "users" criada/verificada.');

  // ==========================================
  // TABELA: articles
  // ==========================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      summary     TEXT,
      category    TEXT,
      image_url   TEXT,
      is_featured INTEGER DEFAULT 0,
      author_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela "articles" criada/verificada.');

  // ==========================================
  // TABELA: ratings
  // ==========================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS ratings (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      comment    TEXT,
      stars      INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
      article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
      is_site    INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela "ratings" criada/verificada.');

  // ==========================================
  // SEED: Primeiro admin (idempotente)
  // ==========================================
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@escola.com');

  if (!existing) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('nono2026', salt);

    db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    ).run('Administrador', 'admin@escola.com', hashedPassword, 'admin');

    console.log('✅ Primeiro admin criado: admin@escola.com / nono2026');
  } else {
    console.log('ℹ️  Admin "admin@escola.com" já existe, pulando seed.');
  }

  console.log('\n🎉 Migração concluída com sucesso!');
  console.log('📁 Banco de dados salvo em: server/data/nono_news.db\n');
}

migrate();
