import { tmdb } from './api.js';
import { avatarMarkup, errorState, escapeHTML, formatDate, grid, movieCard, pageHeader, personCard, rating, setLoading, skeletonGrid, yearOf } from './ui.js';

let retryMovie = null;

const infoItem = (label, value) => value ? `<div class="info-item"><span>${label}</span><strong>${escapeHTML(value)}</strong></div>` : '';

export async function renderMovie(root, id) {
  root.innerHTML = `<section class="detail-page"><div class="detail-loading"><span class="spinner"></span><span>A abrir esta história…</span></div></section>`;
  retryMovie = () => renderMovie(root, id);
  try {
    const [movie, credits] = await Promise.all([tmdb.movie(id), tmdb.credits(id)]);
    const cast = credits?.cast || [];
    const backdrop = movie.backdrop_path ? `style="--detail-image:url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})"` : '';
    const title = movie.title || movie.original_title || 'Filme sem título';
    const directors = credits?.crew?.filter((member) => member.job === 'Director').map((member) => member.name).join(', ');
    root.innerHTML = `<section class="detail-page" ${backdrop}><div class="detail-backdrop" aria-hidden="true"></div><div class="detail-wrap"><button class="back-link" type="button" data-action="back">← Voltar</button><div class="film-hero"><div class="film-poster">${movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="Pôster de ${escapeHTML(title)}" />` : '<div class="poster-fallback poster-large" role="img" aria-label="Pôster não disponível"><span>CV</span></div>'}</div><div class="film-copy"><div class="eyebrow-row"><span class="kicker">FILME · ${yearOf(movie.release_date)}</span>${rating(movie.vote_average)}</div><h1>${escapeHTML(title)}</h1>${movie.original_title && movie.original_title !== title ? `<p class="original-title">${escapeHTML(movie.original_title)}</p>` : ''}<p class="film-overview">${escapeHTML(movie.overview || 'A sinopse não está disponível para este título.')}</p><div class="genre-list">${(movie.genres || []).map((genre) => `<span>${escapeHTML(genre.name)}</span>`).join('')}</div><div class="film-meta">${infoItem('Estreia', formatDate(movie.release_date))}${infoItem('Duração', movie.runtime ? `${movie.runtime} min` : '')}${infoItem('Realização', directors)}${infoItem('Votos', movie.vote_count ? new Intl.NumberFormat('pt-BR').format(movie.vote_count) : '')}</div></div></div><div class="credits-note"><span class="kicker">CRÉDITOS DE ELENCO</span><p>Lista completa de integrantes disponibilizada pelo TMDB, respeitando a ordem dos créditos da fonte.</p></div><div class="cast-section"><div class="section-title"><div><span class="kicker">${cast.length} PARTICIPANTES</span><h2>Quem vive esta história</h2></div></div><div class="people-grid">${grid(cast, personCard, 'Elenco indisponível', 'Não há créditos de elenco disponíveis para este título.')}</div></div></div></section>`;
    document.title = `${title} — CineVerse`;
  } catch (error) { root.innerHTML = `<section class="inner-page"><button class="back-link" type="button" data-action="back">← Voltar</button>${errorState(error, '<button class="button button-dark js-retry" type="button">Tentar novamente</button>')}</section>`; root.querySelector('.js-retry')?.addEventListener('click', retryMovie); }
}

export const retryMovieRequest = () => retryMovie?.();
