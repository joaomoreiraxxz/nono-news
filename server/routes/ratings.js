// ==========================================
// Nono News — Rotas de Avaliações (SQLite)
// ==========================================
import { Router } from 'express';
import db from '../db/pool.js';

const router = Router();

// ========== GET /api/ratings ==========
router.get('/', (req, res) => {
  try {
    const { is_site, article_id, limit } = req.query;

    let query = 'SELECT * FROM ratings WHERE 1=1';
    const params = [];

    if (is_site === 'true') {
      query += ' AND is_site = 1';
    }

    if (article_id) {
      query += ' AND article_id = ?';
      params.push(parseInt(article_id));
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const rows = db.prepare(query).all(...params);

    const ratings = rows.map(row => ({
      id: row.id,
      name: row.name,
      comment: row.comment,
      stars: row.stars,
      articleId: row.article_id,
      isSite: !!row.is_site,
      date: new Date(row.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
    }));

    res.json(ratings);
  } catch (err) {
    console.error('Erro ao listar avaliações:', err.message);
    res.status(500).json({ error: 'Erro ao buscar avaliações.' });
  }
});

// ========== GET /api/ratings/stats ==========
router.get('/stats', (req, res) => {
  try {
    const { is_site, article_id } = req.query;

    let query = 'SELECT COUNT(*) as total, COALESCE(AVG(stars), 0) as average FROM ratings WHERE 1=1';
    const params = [];

    if (is_site === 'true') {
      query += ' AND is_site = 1';
    }

    if (article_id) {
      query += ' AND article_id = ?';
      params.push(parseInt(article_id));
    }

    const stats = db.prepare(query).get(...params);

    // Distribuição de estrelas
    let distQuery = 'SELECT stars, COUNT(*) as count FROM ratings WHERE 1=1';
    const distParams = [];

    if (is_site === 'true') {
      distQuery += ' AND is_site = 1';
    }

    if (article_id) {
      distQuery += ' AND article_id = ?';
      distParams.push(parseInt(article_id));
    }

    distQuery += ' GROUP BY stars ORDER BY stars DESC';
    const distRows = db.prepare(distQuery).all(...distParams);

    const distribution = {};
    for (let i = 1; i <= 5; i++) distribution[i] = 0;
    distRows.forEach(row => {
      distribution[row.stars] = row.count;
    });

    res.json({
      total: stats.total,
      average: parseFloat(parseFloat(stats.average).toFixed(1)),
      distribution,
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas:', err.message);
    res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
  }
});

// ========== POST /api/ratings ==========
router.post('/', (req, res) => {
  try {
    const { name, comment, stars, article_id, is_site } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Nota deve ser de 1 a 5 estrelas.' });
    }

    const result = db.prepare(
      'INSERT INTO ratings (name, comment, stars, article_id, is_site) VALUES (?, ?, ?, ?, ?)'
    ).run(
      name.trim(),
      comment || null,
      stars,
      article_id || null,
      is_site ? 1 : 0
    );

    const row = db.prepare('SELECT * FROM ratings WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: `Valeu, ${row.name}! Sua avaliação de ${row.stars} estrela${row.stars > 1 ? 's' : ''} foi registrada.`,
      rating: {
        id: row.id,
        name: row.name,
        comment: row.comment,
        stars: row.stars,
        isSite: !!row.is_site,
        date: new Date(row.created_at).toLocaleDateString('pt-BR', {
          day: '2-digit', month: 'short', year: 'numeric'
        }),
      },
    });
  } catch (err) {
    console.error('Erro ao criar avaliação:', err.message);
    res.status(500).json({ error: 'Erro ao enviar avaliação.' });
  }
});

export default router;
