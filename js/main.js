import { renderHome, renderSearch, retryLastRequest } from './app.js';
import { renderMovie } from './movie.js';
import { renderPerson } from './person.js';
import './logs-ui.js';

const root = document.querySelector('#app');
const headerTrigger = document.querySelector('#header-search-trigger');

const parseRoute = () => {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, queryString = ''] = raw.split('?');
  const segments = path.split('/').filter(Boolean);
  return { name: segments[0] || 'home', id: segments[1], params: Object.fromEntries(new URLSearchParams(queryString)) };
};

const setActiveNav = (name) => document.querySelectorAll('[data-nav]').forEach((link) => link.classList.toggle('active', link.dataset.nav === name || (name === 'movie' && link.dataset.nav === 'search') || (name === 'person' && link.dataset.nav === 'search')));

async function route() {
  const current = parseRoute();
  setActiveNav(current.name);
  root.classList.add('is-changing');
  window.setTimeout(() => root.classList.remove('is-changing'), 260);
  try {
    if (current.name === 'movie' && current.id) await renderMovie(root, current.id);
    else if (current.name === 'person' && current.id) await renderPerson(root, current.id);
    else if (current.name === 'search') await renderSearch(root, current.params);
    else if (current.name === 'about') renderAbout();
    else await renderHome(root);
    root.focus({ preventScroll: true });
  } catch (error) { root.innerHTML = `<section class="inner-page"><div class="error-state"><h2>Não foi possível abrir esta rota</h2><p>${error.message}</p></div></section>`; }
}

function renderAbout() {
  root.innerHTML = `<section class="inner-page about-page"><div class="about-grid"><div>${'<span class="kicker">SOBRE O CINEVERSE</span><h1>O cinema começa<br /><em>antes do play.</em></h1>'}</div><div class="about-copy"><p class="lead">O CineVerse é um catálogo académico construído para aproximar filmes, elenco e contexto — sempre a partir dos dados reais disponibilizados pelo TMDB.</p><div class="about-rule"></div><div class="about-facts"><div><span>01</span><strong>Dados reais</strong><p>Pesquisa, detalhes, créditos e filmografias chegam da API REST do TMDB.</p></div><div><span>02</span><strong>Sem atalhos</strong><p>Os filtros alteram os parâmetros da chamada; não são apenas efeitos visuais.</p></div><div><span>03</span><strong>Para apresentar</strong><p>Código modular, acessível e documentado para compreender cada decisão.</p></div></div><a class="button button-accent" href="#/search">Começar a explorar <span aria-hidden="true">↗</span></a></div></div></section>`;
  document.title = 'O projeto — CineVerse';
}

headerTrigger?.addEventListener('click', () => { window.location.hash = '#/search'; window.setTimeout(() => document.querySelector('#search-query')?.focus(), 120); });
document.addEventListener('click', (event) => { if (event.target.closest('[data-action="back"]')) { if (window.history.length > 1) window.history.back(); else window.location.hash = '#/'; } if (event.target.closest('.js-retry')) retryLastRequest(); });
window.addEventListener('hashchange', route);
if (!window.location.hash) window.location.hash = '#/'; else route();
