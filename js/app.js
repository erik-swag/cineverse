import { tmdb } from './api.js';
import { errorState, escapeHTML, grid, movieCard, pageHeader, rating, setLoading, skeletonGrid, yearOf } from './ui.js';

let lastLoader = null;
let genresCache = [];

const genreOptions = (selected = '') => `<option value="">Todos os géneros</option>${genresCache.map((genre) => `<option value="${genre.id}" ${String(selected) === String(genre.id) ? 'selected' : ''}>${escapeHTML(genre.name)}</option>`).join('')}`;

async function loadGenres() {
  if (genresCache.length) return genresCache;
  try { genresCache = (await tmdb.genres()).genres || []; } catch { genresCache = []; }
  return genresCache;
}

const searchForm = (state = {}) => `<form class="search-panel" id="movie-search-form" role="search">
  <div class="search-main"><label for="search-query">Encontre o seu próximo filme</label><div class="search-input-wrap"><span aria-hidden="true">⌕</span><input id="search-query" name="query" type="search" value="${escapeHTML(state.query || '')}" placeholder="Título, realizador, universo…" autocomplete="off" /><button class="search-submit" type="submit" aria-label="Pesquisar filmes">Pesquisar <span aria-hidden="true">↗</span></button></div></div>
  <div class="search-filters"><div><label for="search-year">Ano</label><input id="search-year" name="year" type="number" min="1888" max="2099" value="${escapeHTML(state.year || '')}" placeholder="2024" /></div><div><label for="search-genre">Género</label><select id="search-genre" name="genre">${genreOptions(state.genre)}</select></div></div>
</form>`;

const sectionTitle = (eyebrow, title, link = '') => `<div class="section-title"><div><span class="kicker">${eyebrow}</span><h2>${title}</h2></div>${link ? `<a class="text-link" href="${link.href}">${link.label} <span aria-hidden="true">↗</span></a>` : ''}</div>`;

const heroMarkup = () => `<section class="hero hero-loading"><div class="hero-copy"><span class="kicker">CINEMA, EM ESTADO PURO</span><h1>Há sempre uma<br /><em>nova história</em><br />para descobrir.</h1><p>Explore filmes, percorra elencos e conheça as pessoas por trás das personagens que ficam consigo.</p><div class="hero-actions"><a class="button button-accent" href="#/search">Explorar filmes <span aria-hidden="true">↗</span></a><span class="live-note"><i></i> Dados ao vivo do TMDB</span></div></div><div class="hero-poster-zone" aria-hidden="true"><div class="hero-orbit"></div><div class="hero-poster"></div></div></section>`;

// Guarda a primeira página de populares: home e pesquisa partilham o mesmo destaque do hero sem repetir a chamada.
let popularFirstPage = null;
const getPopularFirstPage = () => {
  if (!popularFirstPage) popularFirstPage = tmdb.popular(1).catch((error) => { popularFirstPage = null; throw error; });
  return popularFirstPage;
};

function applyHero(movie) {
  if (!movie?.backdrop_path) return;
  const hero = document.querySelector('.hero');
  hero?.classList.remove('hero-loading');
  hero?.style.setProperty('--hero-image', `url(${`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`})`);
  const posterZone = hero?.querySelector('.hero-poster-zone');
  if (posterZone) posterZone.innerHTML = `<div class="hero-orbit"></div><img class="hero-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}" alt="Pôster de ${escapeHTML(movie.title || 'filme em destaque')}" /><a class="hero-film-link" href="#/movie/${movie.id}" aria-label="Ver ${escapeHTML(movie.title || 'filme em destaque')}">↗</a>`;
}

// Estrutura única usada pela home e pela pesquisa: hero + formulário sobreposto + grelha de filmes.
function renderCatalogShell(root, state = {}, { resultsId, resultsClass = '', skeletonCount, title }) {
  root.innerHTML = `${heroMarkup()}<section class="home-content"><div class="search-slot">${searchForm(state)}</div><div id="${resultsId}" class="${resultsClass}">${title}<div class="movie-grid">${skeletonGrid(skeletonCount)}</div></div></section>`;
  root.querySelector('#movie-search-form').addEventListener('submit', handleSearchSubmit);
  return root.querySelector(`#${resultsId}`);
}

export async function renderHome(root) {
  document.title = 'CineVerse — Descubra o próximo filme';
  const films = renderCatalogShell(root, {}, {
    resultsId: 'home-films',
    skeletonCount: 6,
    title: '<div class="section-title"><div><span class="kicker">EM DESTAQUE AGORA</span><h2>Uma seleção para si</h2></div></div>'
  });
  lastLoader = () => loadHomeFilms(films);
  await loadGenres();
  await loadHomeFilms(films);
}

async function loadHomeFilms(container) {
  setLoading(container, 'A procurar histórias em destaque…');
  try {
    const data = await getPopularFirstPage();
    const movies = data.results || [];
    applyHero(movies[0]);
    container.innerHTML = `<div class="section-title"><div><span class="kicker">EM DESTAQUE AGORA</span><h2>Uma seleção para si</h2></div><span class="result-count">${data.total_results ? `${new Intl.NumberFormat('pt-BR').format(data.total_results)} títulos` : 'Dados reais'}</span></div><div class="movie-grid">${grid(movies, movieCard, 'Nenhuma sessão encontrada', 'O TMDB não devolveu filmes desta vez.')}</div>`;
  } catch (error) { container.innerHTML = errorState(error); }
}

export async function renderSearch(root, state = {}) {
  document.title = 'Explorar filmes — CineVerse';
  await loadGenres();
  const results = renderCatalogShell(root, state, {
    resultsId: 'search-results',
    resultsClass: 'search-results',
    skeletonCount: 8,
    title: '<div class="section-title"><div><span class="kicker">RESULTADOS</span><h2>Prontos para descobrir</h2></div></div>'
  });
  // O hero é o mesmo da home; falhar aqui não deve impedir os resultados.
  getPopularFirstPage().then((data) => applyHero(data.results?.[0])).catch(() => {});
  lastLoader = () => loadSearchResults(results, state);
  await loadSearchResults(results, state);
  if (state.query || state.genre || state.year || state.page) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('.search-slot')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
}

async function loadSearchResults(container, state) {
  setLoading(container, 'A consultar o catálogo do TMDB…');
  try {
    const hasQuery = Boolean(state.query?.trim());
    const data = hasQuery ? await tmdb.search(state) : await tmdb.popular(Number(state.page) || 1);
    const movies = data.results || [];
    const queryLabel = hasQuery ? `Resultados para “${escapeHTML(state.query)}”` : 'Mais populares agora';
    const requestLabel = state.genre ? 'discover/movie · texto + género + ano' : hasQuery ? 'search/movie · título + ano' : 'discover/movie · sem filtros';
    container.innerHTML = `<div class="section-title"><div><span class="kicker">${requestLabel}</span><h2>${queryLabel}</h2></div><span class="result-count">${data.total_results ? `${new Intl.NumberFormat('pt-BR').format(data.total_results)} encontrados` : '0 resultados'}</span></div><div class="movie-grid">${grid(movies, movieCard, 'Nenhum filme encontrado', 'Tente retirar um filtro, mudar o ano ou procurar outro título.')}</div>${data.total_pages > 1 ? `<div class="pagination"><button class="button button-outline js-page" data-page="${Math.max(1, (data.page || 1) - 1)}" ${data.page <= 1 ? 'disabled' : ''}>← Anterior</button><span>Página ${data.page} de ${Math.min(data.total_pages, 500)}</span><button class="button button-outline js-page" data-page="${Math.min(data.total_pages, (data.page || 1) + 1)}">Próxima →</button></div>` : ''}`;
    container.querySelectorAll('.js-page').forEach((button) => button.addEventListener('click', () => {
      const urlState = { ...state, page: Number(button.dataset.page) };
      const params = new URLSearchParams(urlState); window.location.hash = `#/search?${params}`;
    }));
  } catch (error) { container.innerHTML = errorState(error); }
}

async function handleSearchSubmit(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget).entries());
  if (!values.query?.trim() && !values.genre && !values.year) {
    window.location.hash = '#/'; return;
  }
  const params = new URLSearchParams(); Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
  window.location.hash = `#/search?${params}`;
}

export const retryLastRequest = () => lastLoader?.();
