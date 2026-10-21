import { tmdb } from './api.js';
import { errorState, escapeHTML, formatDate, grid, movieCard, pageHeader, posterMarkup, setLoading, yearOf } from './ui.js';

let retryPerson = null;

const detail = (label, value) => value ? `<div class="person-detail"><span>${label}</span><strong>${escapeHTML(value)}</strong></div>` : '';

export async function renderPerson(root, id) {
  root.innerHTML = `<section class="detail-page person-page"><div class="detail-loading"><span class="spinner"></span><span>A carregar o perfil…</span></div></section>`;
  retryPerson = () => renderPerson(root, id);
  try {
    const [person, credits] = await Promise.all([tmdb.person(id), tmdb.personMovies(id)]);
    const knownFor = (credits?.cast || []).filter((movie) => movie.poster_path).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    const name = person.name || 'Pessoa sem nome';
    root.innerHTML = `<section class="inner-page person-page"><button class="back-link" type="button" data-action="back">← Voltar</button><div class="person-hero"><div class="person-portrait">${posterMarkup(person.profile_path, `Fotografia de ${name}`, 'w500')}</div><div class="person-bio"><span class="kicker">PERFIL · ${escapeHTML(person.known_for_department || 'ELENCO')}</span><h1>${escapeHTML(name)}</h1><div class="person-facts">${detail('Nascimento', formatDate(person.birthday))}${detail('Local de nascimento', person.place_of_birth)}${detail('Também conhecido como', person.also_known_as?.[0])}</div><div class="bio-copy"><h2>Em poucas palavras</h2><p>${escapeHTML(person.biography || 'A biografia desta pessoa ainda não está disponível no TMDB.')}</p></div></div></div><section class="filmography"><div class="section-title"><div><span class="kicker">FILMOGRAFIA DISPONÍVEL</span><h2>Outras histórias</h2></div><span class="result-count">${knownFor.length} títulos</span></div><div class="movie-grid">${grid(knownFor, movieCard, 'Filmografia indisponível', 'Não há filmes com imagem disponíveis para esta pessoa.')}</div></section></section>`;
    document.title = `${name} — CineVerse`;
  } catch (error) { root.innerHTML = `<section class="inner-page"><button class="back-link" type="button" data-action="back">← Voltar</button>${errorState(error, '<button class="button button-dark js-retry" type="button">Tentar novamente</button>')}</section>`; root.querySelector('.js-retry')?.addEventListener('click', retryPerson); }
}

export const retryPersonRequest = () => retryPerson?.();
