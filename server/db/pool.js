// ==========================================
// Nono News — Conexão SQLite
// O banco é um simples arquivo .db
// Zero instalação, zero configuração!
// ==========================================
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Garante que a pasta data/ existe
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

// O banco é só um arquivo dentro de server/data/
const dbPath = join(dataDir, 'nono_news.db');
const db = new Database(dbPath);

// Ativar WAL mode para melhor performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log(`📦 SQLite conectado: ${dbPath}`);

export default db;
