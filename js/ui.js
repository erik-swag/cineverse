import { imageUrl } from './api.js';

export const escapeHTML = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

export const formatDate = (date) => {
  if (!date) return 'Data não disponível';
  const parsed = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

export const yearOf = (date) => date ? String(date).slice(0, 4) : '—';

export const rating = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? `<span class="rating"><span aria-hidden="true">✦</span> ${number.toFixed(1)}</span>` : '<span class="muted">Sem avaliação</span>';
};

export const posterMarkup = (path, alt, size = 'w500', className = '') => path
  ? `<img class="${className}" src="${imageUrl(path, size)}" alt="${escapeHTML(alt)}" loading="lazy" />`
  : `<div class="poster-fallback ${className}" role="img" aria-label="Imagem não disponível"><span>CV</span></div>`;

export const avatarMarkup = (path, name) => path
  ? `<img src="${imageUrl(path, 'w185')}" alt="Fotografia de ${escapeHTML(name)}" loading="lazy" />`
  : `<div class="avatar-fallback" role="img" aria-label="Fotografia não disponível"><span>${escapeHTML((name || '?').split(' ').map((part) => part[0]).slice(0, 2).join(''))}</span></div>`;

export const movieCard = (movie, index = 0) => `
  <article class="movie-card reveal" style="--card-index:${Math.min(index, 8)}">
    <a class="movie-poster" href="#/movie/${movie.id}" aria-label="Ver detalhes de ${escapeHTML(movie.title || movie.original_title || 'filme')}">
      ${posterMarkup(movie.poster_path, `Pôster de ${movie.title || movie.original_title || 'filme'}`)}
      <span class="poster-shade" aria-hidden="true"></span><span class="card-arrow" aria-hidden="true">↗</span>
    </a>
    <div class="movie-card-copy">
      <div class="eyebrow-row"><span>${yearOf(movie.release_date)}</span>${rating(movie.vote_average)}</div>
      <h3><a href="#/movie/${movie.id}">${escapeHTML(movie.title || movie.original_title || 'Título não disponível')}</a></h3>
      <p>${escapeHTML((movie.overview || 'Sem sinopse disponível.').slice(0, 110))}${movie.overview?.length > 110 ? '…' : ''}</p>
    </div>
  </article>`;

export const personCard = (person, index = 0) => `
  <article class="person-card reveal" style="--card-index:${Math.min(index, 8)}">
    <a class="person-photo" href="#/person/${person.id}" aria-label="Ver perfil de ${escapeHTML(person.name || 'ator')}">${avatarMarkup(person.profile_path, person.name)}</a>
    <div class="person-copy"><h3><a href="#/person/${person.id}">${escapeHTML(person.name || 'Nome não disponível')}</a></h3><p>${escapeHTML(person.character || 'Personagem não informado')}</p><a class="text-link" href="#/person/${person.id}">Ver perfil <span aria-hidden="true">↗</span></a></div>
  </article>`;

export const grid = (items, renderer, emptyTitle = 'Nada para mostrar ainda', emptyText = 'Tente outra pesquisa ou volte daqui a pouco.') => items?.length
  ? items.map(renderer).join('')
  : emptyState(emptyTitle, emptyText);

export const skeletonGrid = (count = 6, type = 'movie') => Array.from({ length: count }, (_, index) => `<div class="${type === 'movie' ? 'skeleton-card' : 'skeleton-person'}" style="--card-index:${index}"><span></span><span></span><span></span></div>`).join('');

export const emptyState = (title, text, action = '') => `<div class="empty-state"><span class="empty-glyph" aria-hidden="true">∅</span><h2>${escapeHTML(title)}</h2><p>${escapeHTML(text)}</p>${action}</div>`;

export const errorState = (error, action = '') => {
  const messages = { MISSING_KEY: ['Chave TMDB necessária', 'Configure a sua chave de leitura no ficheiro js/config.js antes de publicar. A chave nunca deve ser inventada.'], AUTH: ['A chave TMDB foi recusada', 'Confirme se a chave está ativa e se é uma chave de leitura da API.'], NETWORK: ['Sem ligação ao cinema', 'Não conseguimos contactar o TMDB agora. Verifique a rede e tente novamente.'], NOT_FOUND: ['Título não encontrado', 'A produção pode ter sido removida ou o endereço já não é válido.'] };
  const [title, text] = messages[error?.code] || ['A sessão foi interrompida', error?.message || 'Ocorreu um erro inesperado. Tente novamente.'];
  return `<div class="error-state"><span class="error-glyph" aria-hidden="true">!</span><h2>${title}</h2><p>${escapeHTML(text)}</p>${action || '<button class="button button-dark js-retry" type="button">Tentar novamente</button>'}</div>`;
};

export const pageHeader = (kicker, title, text = '') => `<div class="page-heading"><span class="kicker">${escapeHTML(kicker)}</span><h1>${title}</h1>${text ? `<p>${escapeHTML(text)}</p>` : ''}</div>`;

export const setLoading = (container, label = 'A carregar dados reais do TMDB…') => { container.innerHTML = `<div class="loading-block" role="status"><span class="spinner"></span><span>${escapeHTML(label)}</span></div>`; };

export const showToast = (message) => { const toast = document.querySelector('#toast'); if (!toast) return; toast.textContent = message; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 3600); };
