import { CONFIG, hasApiKey, loadRuntimeConfig } from './config.js';
import { registerLog } from './logs.js';

function buildUrl(path, params = {}) {
  const url = new URL(`${CONFIG.tmdbBaseUrl}${path}`);
  url.searchParams.set('language', CONFIG.language);
  url.searchParams.set('api_key', CONFIG.tmdbApiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(key, value);
  });
  return url;
}

// Resume o retorno da API num texto curto para o log.
function summarize(payload) {
  if (Array.isArray(payload?.results)) return `${payload.results.length} resultados de ${payload.total_results ?? '?'}`;
  if (Array.isArray(payload?.genres)) return `${payload.genres.length} géneros`;
  if (Array.isArray(payload?.cast)) return `${payload.cast.length} integrantes no elenco`;
  return payload?.title || payload?.name || 'OK';
}

// Funcionalidade 1: após receber os dados do TMDB, grava o log (sem bloquear a interface).
function logRequest(path, payload) {
  registerLog('TMDB', path.replace(/^\//, ''), summarize(payload));
}

async function request(path, params = {}) {
  await loadRuntimeConfig();
  if (!hasApiKey()) {
    const error = new Error('A chave do TMDB ainda não foi configurada.');
    error.code = 'MISSING_KEY';
    throw error;
  }
  const url = buildUrl(path, params);
  let response;
  try {
    response = await fetch(url, { headers: { accept: 'application/json' } });
  } catch (error) {
    const networkError = new Error('Não foi possível ligar ao TMDB. Verifique a sua ligação.');
    networkError.code = 'NETWORK';
    throw networkError;
  }
  let payload = null;
  try { payload = await response.json(); } catch { /* corpo vazio */ }
  if (!response.ok) {
    const error = new Error(payload?.status_message || `O TMDB respondeu com HTTP ${response.status}.`);
    error.code = response.status === 401 ? 'AUTH' : response.status === 404 ? 'NOT_FOUND' : 'HTTP';
    throw error;
  }
  logRequest(path, payload);
  return payload;
}

export const tmdb = {
  popular: (page = 1) => request('/discover/movie', { sort_by: 'popularity.desc', include_adult: 'false', page }),
  genres: () => request('/genre/movie/list'),
  search: ({ query, year = '', genre = '', page = 1 }) => {
    if (genre) return request('/discover/movie', { with_text_query: query, with_genres: genre, primary_release_year: year, sort_by: 'popularity.desc', page, include_adult: 'false' });
    return request('/search/movie', { query, year, page, include_adult: 'false' });
  },
  movie: (id) => request(`/movie/${encodeURIComponent(id)}`, { append_to_response: 'images' }),
  credits: (id) => request(`/movie/${encodeURIComponent(id)}/credits`),
  person: (id) => request(`/person/${encodeURIComponent(id)}`),
  personMovies: (id) => request(`/person/${encodeURIComponent(id)}/movie_credits`)
};

export const imageUrl = (path, size = 'w500') => path ? `${CONFIG.imageBaseUrl}/${size}${path}` : '';
