// ==========================================
// Nono News — Rotas de Artigos (SQLite)
// ==========================================
import { Router } from 'express';
import db from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Helper para formatar data
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

// ========== GET /api/articles ==========
router.get('/', (req, res) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT a.*, u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.is_featured = 0
    `;
    const params = [];

    if (category) {
      query += ' AND a.category = ?';
      params.push(category);
    }

    query += ' ORDER BY a.created_at DESC';

    const rows = db.prepare(query).all(...params);

    const articles = rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category,
      image: row.image_url,
      isFeatured: false,
      author: row.author_name,
      date: formatDate(row.created_at),
    }));

    res.json(articles);
  } catch (err) {
    console.error('Erro ao listar artigos:', err.message);
    res.status(500).json({ error: 'Erro ao buscar artigos.' });
  }
});

// ========== GET /api/articles/featured ==========
router.get('/featured', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT a.*, u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.is_featured = 1
      ORDER BY a.created_at DESC
    `).all();

    const featured = rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category,
      image: row.image_url,
      isFeatured: true,
      author: row.author_name,
      date: formatDate(row.created_at),
    }));

    res.json(featured);
  } catch (err) {
    console.error('Erro ao listar destaques:', err.message);
    res.status(500).json({ error: 'Erro ao buscar destaques.' });
  }
});

// ========== GET /api/articles/:id ==========
router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT a.*, u.name as author_name
      FROM articles a LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    res.json({
      id: row.id,
      title: row.title,
      summary: row.summary,
      category: row.category,
      image: row.image_url,
      isFeatured: !!row.is_featured,
      author: row.author_name,
      date: formatDate(row.created_at),
    });
  } catch (err) {
    console.error('Erro ao buscar artigo:', err.message);
    res.status(500).json({ error: 'Erro ao buscar artigo.' });
  }
});

// ========== POST /api/articles ==========
router.post('/', authMiddleware, (req, res) => {
  try {
    const { title, summary, category, image, isFeatured } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Título é obrigatório.' });
    }

    const result = db.prepare(
      `INSERT INTO articles (title, summary, category, image_url, is_featured, author_id)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      title.trim(),
      summary || null,
      category || null,
      image || null,
      isFeatured ? 1 : 0,
      req.user.id
    );

    const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: isFeatured
        ? 'Destaque publicado com sucesso!'
        : 'Notícia publicada com sucesso!',
      article: {
        id: row.id,
        title: row.title,
        summary: row.summary,
        category: row.category,
        image: row.image_url,
        isFeatured: !!row.is_featured,
        date: formatDate(row.created_at),
      },
    });
  } catch (err) {
    console.error('Erro ao criar artigo:', err.message);
    res.status(500).json({ error: 'Erro ao publicar artigo.' });
  }
});

// ========== PUT /api/articles/:id ==========
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { title, summary, category, image, isFeatured } = req.body;
    const existing = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    db.prepare(`
      UPDATE articles SET
        title = ?, summary = ?, category = ?, image_url = ?,
        is_featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? existing.title,
      summary ?? existing.summary,
      category ?? existing.category,
      image ?? existing.image_url,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : existing.is_featured,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM articles WHERE id = ?').get(req.params.id);
    res.json({ message: 'Artigo atualizado!', article: updated });
  } catch (err) {
    console.error('Erro ao atualizar artigo:', err.message);
    res.status(500).json({ error: 'Erro ao atualizar artigo.' });
  }
});

// ========== DELETE /api/articles/:id ==========
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const row = db.prepare('SELECT id, title FROM articles WHERE id = ?').get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Artigo não encontrado.' });
    }

    db.prepare('DELETE FROM articles WHERE id = ?').run(req.params.id);
    res.json({ message: `Artigo "${row.title}" removido com sucesso.` });
  } catch (err) {
    console.error('Erro ao remover artigo:', err.message);
    res.status(500).json({ error: 'Erro ao remover artigo.' });
  }
});

export default router;
