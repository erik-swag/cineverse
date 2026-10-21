import { changeMatricula, deleteLog, fetchLogs, getMatricula } from './logs.js';
import { escapeHTML, showToast } from './ui.js';

const dialog = document.createElement('dialog');
dialog.className = 'logs-dialog';
dialog.setAttribute('aria-labelledby', 'logs-title');
dialog.innerHTML = `<div class="logs-head"><div><span class="kicker">REGISTO DE ATIVIDADE</span><h2 id="logs-title">Logs de consumo da API</h2></div><button class="logs-close" type="button" data-logs-close aria-label="Fechar logs">×</button></div><div class="logs-toolbar"><span id="logs-count" class="result-count" aria-live="polite"></span><div><button class="button button-outline" type="button" id="logs-matricula">Matrícula</button><button class="button button-outline" type="button" id="logs-refresh">Atualizar</button></div></div><div id="logs-body" class="logs-body" aria-live="polite"></div>`;
document.body.appendChild(dialog);

const body = dialog.querySelector('#logs-body');
const count = dialog.querySelector('#logs-count');

const formatStamp = (value = '') => {
  const [date = '', time = ''] = String(value).split(' ');
  const [y, m, d] = date.split('-');
  return y && m && d ? `${d}/${m}/${y} ${time}` : escapeHTML(value);
};

async function loadLogs() {
  body.innerHTML = '<div class="loading-block" role="status"><span class="spinner"></span><span>A carregar logs…</span></div>';
  count.textContent = '';
  try {
    const logs = (await fetchLogs()).sort((a, b) => Number(b.id) - Number(a.id));
    count.textContent = `${logs.length} ${logs.length === 1 ? 'registo' : 'registos'}`;
    body.innerHTML = logs.length
      ? `<div class="logs-table-wrap"><table class="logs-table"><thead><tr><th>Data</th><th>API</th><th>Método</th><th>Resultado</th><th><span class="sr-only">Ações</span></th></tr></thead><tbody>${logs.map((log) => `<tr><td data-label="Data">${formatStamp(log.desclog)}</td><td data-label="API">${escapeHTML(log.descapi)}</td><td data-label="Método">${escapeHTML(log.descmetodo)}</td><td data-label="Resultado">${escapeHTML(log.descresultado)}</td><td><button class="logs-delete" type="button" data-log-id="${escapeHTML(log.id)}" aria-label="Excluir log ${escapeHTML(log.id)}">Excluir</button></td></tr>`).join('')}</tbody></table></div>`
      : '<div class="empty-state"><span class="empty-glyph" aria-hidden="true">∅</span><h2>Nenhum log registado</h2><p>Navegue pelo catálogo: cada consulta à API é registada aqui.</p></div>';
  } catch (error) {
    body.innerHTML = `<div class="error-state"><span class="error-glyph" aria-hidden="true">!</span><h2>Não foi possível carregar os logs</h2><p>${escapeHTML(error.message)}</p></div>`;
  }
}

function openLogs() {
  if (!getMatricula()) { showToast('Matrícula necessária para consultar os logs.'); return; }
  if (!dialog.open) dialog.showModal();
  loadLogs();
}

dialog.addEventListener('click', async (event) => {
  if (event.target === dialog || event.target.closest('[data-logs-close]')) { dialog.close(); return; }
  if (event.target.closest('#logs-refresh')) { loadLogs(); return; }
  if (event.target.closest('#logs-matricula')) { if (changeMatricula()) loadLogs(); return; }
  const button = event.target.closest('[data-log-id]');
  if (!button) return;
  button.disabled = true;
  try {
    showToast(await deleteLog(button.dataset.logId));
    await loadLogs();
  } catch (error) { button.disabled = false; showToast(error.message); }
});

// Mantém a lista atualizada se um novo log for gravado com o painel aberto.
document.addEventListener('logs:changed', () => { if (dialog.open) loadLogs(); });
document.querySelector('#header-logs-trigger')?.addEventListener('click', openLogs);
