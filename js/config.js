
export const CONFIG = {
  tmdbApiKey: "8164b5ab391cb70d5c24b3ec3cbb8f85" ,
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  language: 'pt-BR',
  matricula: '465582',
  imageSizes: { poster: 'w500', backdrop: 'w1280', profile: 'w185' }
};

let runtimeConfigLoaded = false;

export const loadRuntimeConfig = async () => {
  if (runtimeConfigLoaded || hasApiKey()) return;
  runtimeConfigLoaded = true;
  try {
    const response = await fetch('./__cineverse_config', { headers: { accept: 'application/json' } });
    if (!response.ok) return;
    const payload = await response.json();
    if (payload.tmdbApiKey) CONFIG.tmdbApiKey = payload.tmdbApiKey;
  } catch { /* GitHub Pages não possui este endpoint opcional. */ }
};

export const hasApiKey = () => Boolean(CONFIG.tmdbApiKey?.trim());
