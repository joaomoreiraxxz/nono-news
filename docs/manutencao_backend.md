# Manutenção — Backend SQLite (Simplificado)

**Data:** 14/08/2026  
**Conversa:** a9fde0b9-7877-43a2-a9a6-705accc8ee4f

---

## O que mudou (PostgreSQL → SQLite)

O banco foi trocado de **PostgreSQL** (que precisa instalar, configurar, criar usuários) para **SQLite** (que é só um arquivo `.db`).

### Vantagens:
- ❌ NÃO precisa instalar nenhum banco de dados
- ❌ NÃO precisa criar usuários ou senhas de banco
- ❌ NÃO precisa configurar conexão
- ✅ O banco é criado automaticamente ao rodar `npm run migrate`
- ✅ O arquivo fica em `server/data/nono_news.db`
- ✅ Para fazer backup, basta copiar esse arquivo

---

## Como rodar o projeto (2 comandos!)

```bash
# 1. Cria o banco + tabelas + admin (só na primeira vez)
npm run migrate

# 2. Inicia o backend (terminal 1)
npm run dev:server

# 3. Inicia o frontend (terminal 2)  
npm run dev
```

**Pronto!** Acessa http://localhost:5173/

---

## Testes realizados com sucesso

| Teste | Resultado |
|---|---|
| `npm run migrate` | ✅ 3 tabelas criadas + admin |
| `POST /api/auth/login` | ✅ JWT gerado |
| `POST /api/articles` | ✅ Artigo salvo no banco |
| `POST /api/ratings` | ✅ Avaliação salva |
| `GET /api/health` | ✅ Backend ativo |

---

## Arquivos mudados

| Arquivo | Mudança |
|---|---|
| `server/db/pool.js` | PostgreSQL → SQLite (better-sqlite3) |
| `server/db/migrate.js` | Sintaxe SQL adaptada para SQLite |
| `server/routes/auth.js` | pool.query → db.prepare |
| `server/routes/articles.js` | pool.query → db.prepare |
| `server/routes/ratings.js` | pool.query → db.prepare |
| `server/.env` | Removido DATABASE_URL |
| `package.json` | `pg` → `better-sqlite3` |
