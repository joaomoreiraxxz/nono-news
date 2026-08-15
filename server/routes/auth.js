// ==========================================
// Nono News — Rotas de Autenticação (SQLite)
// POST /api/auth/login  — Login com email/senha
// GET  /api/auth/me     — Dados do usuário logado
// ==========================================
import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/pool.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';

const router = Router();

// ========== POST /api/auth/login ==========
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const user = db.prepare(
      'SELECT id, name, email, password, role FROM users WHERE email = ?'
    ).get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = generateToken(user);

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// ========== GET /api/auth/me ==========
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

export default router;
