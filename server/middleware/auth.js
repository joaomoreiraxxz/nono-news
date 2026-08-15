// ==========================================
// Nono News — Middleware de Autenticação JWT
// ==========================================
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware que verifica o token JWT.
 * Uso: router.post('/rota-protegida', authMiddleware, handler)
 * 
 * O token deve vir no header: Authorization: Bearer <token>
 * Se válido, adiciona req.user com { id, email, role }
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Acesso não autorizado. Token não fornecido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Token inválido ou expirado.',
    });
  }
}

/**
 * Gera um JWT para o usuário.
 * Expira em 7 dias.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
