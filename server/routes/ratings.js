// ==========================================
// Nono News — Rotas de Avaliações (SQLite)
// ==========================================
import { Router } from 'express';
import db from '../db/pool.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ========== GET /api/ratings ==========
router.get('/', (req, res) => {
  try {
    const { is_site, article_id, limit } = req.query;
    let query = 'SELECT * FROM ratings WHERE is_approved = 1';
    const params = [];
    if (is_site === 'true') query += ' AND is_site = 1';
    if (article_id) { query += ' AND article_id = ?'; params.push(parseInt(article_id)); }
    query += ' ORDER BY created_at DESC';
    if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(row => ({
      id: row.id, name: row.name, comment: row.comment, stars: row.stars,
      articleId: row.article_id, isSite: !!row.is_site, isApproved: !!row.is_approved,
      date: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    })));
  } catch (err) {
    console.error('Erro ao listar avaliacoes:', err.message);
    res.status(500).json({ error: 'Erro ao buscar avaliacoes.' });
  }
});

// ========== GET /api/ratings/admin (requer auth) ==========
router.get('/admin', authMiddleware, (req, res) => {
  try {
    const { is_site, article_id, limit } = req.query;
    let query = 'SELECT * FROM ratings WHERE 1=1';
    const params = [];
    if (is_site === 'true') query += ' AND is_site = 1';
    if (article_id) { query += ' AND article_id = ?'; params.push(parseInt(article_id)); }
    query += ' ORDER BY created_at DESC';
    if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(row => ({
      id: row.id, name: row.name, comment: row.comment, stars: row.stars,
      articleId: row.article_id, isSite: !!row.is_site, isApproved: !!row.is_approved,
      date: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    })));
  } catch (err) {
    console.error('Erro ao listar avaliacoes (admin):', err.message);
    res.status(500).json({ error: 'Erro ao buscar avaliacoes.' });
  }
});

// ========== GET /api/ratings/stats ==========
router.get('/stats', (req, res) => {
  try {
    const { is_site, article_id } = req.query;
    let query = 'SELECT COUNT(*) as total, COALESCE(AVG(stars), 0) as average FROM ratings WHERE is_approved = 1';
    const params = [];
    if (is_site === 'true') query += ' AND is_site = 1';
    if (article_id) { query += ' AND article_id = ?'; params.push(parseInt(article_id)); }
    const stats = db.prepare(query).get(...params);

    let distQuery = 'SELECT stars, COUNT(*) as count FROM ratings WHERE is_approved = 1';
    const distParams = [];
    if (is_site === 'true') distQuery += ' AND is_site = 1';
    if (article_id) { distQuery += ' AND article_id = ?'; distParams.push(parseInt(article_id)); }
    distQuery += ' GROUP BY stars ORDER BY stars DESC';
    const distRows = db.prepare(distQuery).all(...distParams);

    const distribution = {};
    for (let i = 1; i <= 5; i++) distribution[i] = 0;
    distRows.forEach(row => { distribution[row.stars] = row.count; });

    res.json({ total: stats.total, average: parseFloat(parseFloat(stats.average).toFixed(1)), distribution });
  } catch (err) {
    console.error('Erro ao buscar estatisticas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar estatisticas.' });
  }
});

// ========== POST /api/ratings ==========
router.post('/', (req, res) => {
  try {
    const { name, comment, stars, article_id, is_site } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ error: 'Nome e obrigatorio.' });
    if (!stars || stars < 1 || stars > 5) return res.status(400).json({ error: 'Nota deve ser de 1 a 5 estrelas.' });

    const result = db.prepare(
      'INSERT INTO ratings (name, comment, stars, article_id, is_site, is_approved) VALUES (?, ?, ?, ?, ?, 0)'
    ).run(name.trim(), comment || null, stars, article_id || null, is_site ? 1 : 0);

    const row = db.prepare('SELECT * FROM ratings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({
      message: 'Sua avaliacao foi enviada e esta aguardando aprovacao.',
      rating: {
        id: row.id, name: row.name, comment: row.comment, stars: row.stars, isSite: !!row.is_site, isApproved: false,
        date: new Date(row.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
    });
  } catch (err) {
    console.error('Erro ao criar avaliacao:', err.message);
    res.status(500).json({ error: 'Erro ao enviar avaliacao.' });
  }
});

// ========== PUT /api/ratings/:id/approve (requer auth) ==========
router.put('/:id/approve', authMiddleware, (req, res) => {
  try {
    const row = db.prepare('SELECT id FROM ratings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Avaliacao nao encontrada.' });
    db.prepare('UPDATE ratings SET is_approved = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Avaliacao aprovada com sucesso.' });
  } catch (err) {
    console.error('Erro ao aprovar avaliacao:', err.message);
    res.status(500).json({ error: 'Erro ao aprovar avaliacao.' });
  }
});

// ========== DELETE /api/ratings/:id (requer auth) ==========
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const row = db.prepare('SELECT id, name FROM ratings WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Avaliacao nao encontrada.' });
    db.prepare('DELETE FROM ratings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Avaliacao removida.' });
  } catch (err) {
    console.error('Erro ao remover avaliacao:', err.message);
    res.status(500).json({ error: 'Erro ao remover avaliacao.' });
  }
});

export default router;
