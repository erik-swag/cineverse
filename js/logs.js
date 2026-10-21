// Integração com a API de registro de logs (https://www.piway.com.br/unoesc/api/doc.html)
import { CONFIG } from './config.js';

const BASE = 'https://www.piway.com.br/unoesc/api';
const STORAGE_KEY = 'cineverse.matricula';
let askedOnce = false;

// A matrícula vem de js/config.js; se estiver vazia, é pedida uma única vez e guardada no navegador.
export function getMatricula({ ask = true } = {}) {
  let matricula = String(CONFIG.matricula || '').trim();
  if (matricula) return matricula;
  try { matricula = localStorage.getItem(STORAGE_KEY) || ''; } catch { matricula = ''; }
  if (!matricula && ask && !askedOnce) {
    askedOnce = true;
    matricula = (window.prompt('Informe o seu número de matrícula para registrar os logs de uso da API:') || '').trim();
    if (matricula) setMatricula(matricula);
  }
  return matricula;
}

export function setMatricula(value) {
  try { localStorage.setItem(STORAGE_KEY, String(value).trim()); } catch { /* armazenamento indisponível */ }
}

export function changeMatricula() {
  const current = getMatricula({ ask: false });
  const value = (window.prompt('Número de matrícula:', current) || '').trim();
  if (value) setMatricula(value);
  return value;
}

// Cada valor vira um segmento de rota: barras e caracteres especiais são removidos antes de codificar.
const segment = (value) => encodeURIComponent(String(value ?? '').replace(/[\\/?#%]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || '-');

async function callLogApi(url) {
  let response;
  try { response = await fetch(url); } catch { throw new Error('Não foi possível ligar à API de logs.'); }
  const text = await response.text();
  if (!response.ok || /inválida/i.test(text)) throw new Error(text.trim() || `A API de logs respondeu com HTTP ${response.status}.`);
  return text;
}

// Funcionalidade 1 — registrar log. Nunca lança erro: falhar o log não pode quebrar a aplicação.
export async function registerLog(api, metodo, resultado) {
  const matricula = getMatricula();
  if (!matricula) return false;
  try {
    await callLogApi(`${BASE}/inserir/log/${segment(matricula)}/${segment(api)}/${segment(metodo)}/${segment(resultado)}`);
    document.dispatchEvent(new CustomEvent('logs:changed'));
    return true;
  } catch (error) {
    console.warn('[CineVerse] Falha ao registrar log:', error.message);
    return false;
  }
}

// Funcionalidade 2 — listar logs.
export async function fetchLogs() {
  const matricula = getMatricula();
  if (!matricula) throw new Error('Informe a sua matrícula para consultar os logs.');
  const text = await callLogApi(`${BASE}/logs/${segment(matricula)}`);
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(text.trim() || 'Resposta inesperada da API de logs.'); }
  return Array.isArray(data) ? data : [];
}

// Funcionalidade 3 — excluir log.
export async function deleteLog(id) {
  const matricula = getMatricula();
  if (!matricula) throw new Error('Informe a sua matrícula para excluir logs.');
  return (await callLogApi(`${BASE}/excluir/log/${segment(id)}/aluno/${segment(matricula)}`)).trim();
}
