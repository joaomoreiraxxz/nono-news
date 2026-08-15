// ==========================================
// Nono News — Camada de Dados (API Client)
// Substituiu o localStorage por chamadas à API REST
// ==========================================

const API_BASE = '/api';

// ========== Helper para fetch ==========
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('nononews_token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }

  return data;
}


// ==========================================
// ARTIGOS (Notícias)
// ==========================================

/**
 * Retorna as notícias do banco de dados.
 * @param {string} [category] — Filtro opcional por categoria
 * @returns {Promise<Array>}
 */
export async function getNews(category) {
  try {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return await apiFetch(`/articles${query}`);
  } catch (err) {
    console.error('Erro ao buscar notícias:', err.message);
    return [];
  }
}

/**
 * Retorna os destaques do banco de dados.
 * @returns {Promise<Array>}
 */
export async function getFeatured() {
  try {
    return await apiFetch('/articles/featured');
  } catch (err) {
    console.error('Erro ao buscar destaques:', err.message);
    return [];
  }
}

/**
 * Salva uma nova notícia no banco. Requer autenticação.
 * @param {Object} article — { title, summary, category, image }
 * @returns {Promise<Object>}
 */
export async function saveNews(article) {
  const result = await apiFetch('/articles', {
    method: 'POST',
    body: JSON.stringify({
      title: article.title,
      summary: article.summary,
      category: article.category,
      image: article.image,
      isFeatured: false,
    }),
  });
  return result.article;
}

/**
 * Salva um destaque no banco. Requer autenticação.
 * @param {Object} article — { title, summary, category, image }
 * @returns {Promise<Object>}
 */
export async function saveFeatured(article) {
  const result = await apiFetch('/articles', {
    method: 'POST',
    body: JSON.stringify({
      title: article.title,
      summary: article.summary,
      category: article.category,
      image: article.image,
      isFeatured: true,
    }),
  });
  return result.article;
}

/**
 * Remove um artigo. Requer autenticação.
 * @param {number} id
 */
export async function deleteArticle(id) {
  return await apiFetch(`/articles/${id}`, { method: 'DELETE' });
}


// ==========================================
// AUTENTICAÇÃO
// ==========================================

/**
 * Faz login com email/senha.
 * Salva o token JWT no localStorage.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} — { token, user }
 */
export async function login(email, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  // Salva o token para uso futuro
  localStorage.setItem('nononews_token', data.token);
  localStorage.setItem('nononews_user', JSON.stringify(data.user));
  return data;
}

/**
 * Retorna os dados do usuário logado (do token).
 * @returns {Promise<Object|null>}
 */
export async function getMe() {
  try {
    const data = await apiFetch('/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

/**
 * Faz logout — remove token do localStorage.
 */
export function logout() {
  localStorage.removeItem('nononews_token');
  localStorage.removeItem('nononews_user');
}

/**
 * Verifica se há um token salvo.
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!localStorage.getItem('nononews_token');
}


// ==========================================
// AVALIAÇÕES
// ==========================================

/**
 * Envia uma avaliação do site.
 * @param {Object} rating — { name, comment, stars }
 * @returns {Promise<Object>}
 */
export async function submitRating(rating) {
  return await apiFetch('/ratings', {
    method: 'POST',
    body: JSON.stringify({
      name: rating.name,
      comment: rating.comment,
      stars: rating.stars,
      is_site: true,
    }),
  });
}

/**
 * Busca estatísticas de avaliação do site.
 * @returns {Promise<Object>} — { total, average, distribution }
 */
export async function getRatingStats() {
  try {
    return await apiFetch('/ratings/stats?is_site=true');
  } catch {
    return { total: 0, average: 0, distribution: {} };
  }
}

/**
 * Busca todas as avaliações do site.
 * @param {number} [limit]
 * @returns {Promise<Array>}
 */
export async function getRatings(limit) {
  try {
    const query = limit ? `?is_site=true&limit=${limit}` : '?is_site=true';
    return await apiFetch(`/ratings${query}`);
  } catch {
    return [];
  }
}
