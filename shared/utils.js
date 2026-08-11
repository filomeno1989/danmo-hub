/**
 * utils.js — Funções utilitárias unificadas (Danmo Hub)
 * Todas as 7 aplicações usam ESTE ficheiro.
 * Função de toast: mostrarToast (nome único, corrigido dos 3 nomes diferentes)
 * Última atualização: 2026-08-11
 */

/* ═══════════════════════════════════════════════
   TOAST — Notificações
   ═══════════════════════════════════════════════ */

/**
 * Mostra uma notificação toast na tela.
 * @param {string} mensagem - Texto da notificação
 * @param {'sucesso'|'erro'|'aviso'|'info'} tipo - Tipo da notificação
 * @param {number} duracao - Duração em ms (padrão: 3500)
 */
function mostrarToast(mensagem, tipo = 'info', duracao = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + tipo;
  toast.setAttribute('role', 'alert');

  const icones = {
    sucesso: '&#10003;',
    erro: '&#10007;',
    aviso: '&#9888;',
    info: '&#8505;'
  };

  toast.innerHTML =
    '<span class="toast-icon">' + (icones[tipo] || icones.info) + '</span>' +
    '<span class="toast-msg">' + mensagem + '</span>' +
    '<button class="toast-fechar" aria-label="Fechar">&times;</button>';

  container.appendChild(toast);

  /* Animação de entrada */
  requestAnimationFrame(function () {
    toast.classList.add('toast-visivel');
  });

  /* Fechar ao clicar no X */
  toast.querySelector('.toast-fechar').addEventListener('click', function () {
    removerToast(toast);
  });

  /* Auto-remover após a duração */
  setTimeout(function () {
    removerToast(toast);
  }, duracao);
}

function removerToast(el) {
  if (!el || !el.parentNode) return;
  el.classList.remove('toast-visivel');
  el.classList.add('toast-saindo');
  el.addEventListener('transitionend', function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  });
  /* Fallback: remover após 400ms mesmo sem transitionend */
  setTimeout(function () {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 400);
}

/* ═══════════════════════════════════════════════
   FORMATAÇÃO DE DATA E HORA
   ═══════════════════════════════════════════════ */

/**
 * Formata uma data ISO para formato legível.
 * @param {string} dataISO - Data em formato ISO (ex: '2026-08-11T14:30:00')
 * @param {boolean} comHora - Se true, inclui a hora
 * @returns {string} Data formatada: '11/08/2026' ou '11/08/2026 14:30'
 */
function formataData(dataISO, comHora) {
  if (!dataISO) return '—';
  var d = new Date(dataISO);
  if (isNaN(d.getTime())) return dataISO;
  var dia = String(d.getDate()).padStart(2, '0');
  var mes = String(d.getMonth() + 1).padStart(2, '0');
  var ano = d.getFullYear();
  if (comHora) {
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return dia + '/' + mes + '/' + ano + ' ' + h + ':' + m;
  }
  return dia + '/' + mes + '/' + ano;
}

/**
 * Formata hora only: '14:30'
 */
function formataHora(dataISO) {
  if (!dataISO) return '—';
  var d = new Date(dataISO);
  if (isNaN(d.getTime())) return '—';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/**
 * Retorna a data atual em formato ISO (YYYY-MM-DD)
 */
function dataHojeISO() {
  return new Date().toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════════
   FORMATAÇÃO DE MOEDA
   ═══════════════════════════════════════════════ */

/**
 * Formata valor numérico como MZN (Meticais).
 * @param {number} valor
 * @returns {string} Ex: '1.250.000,00 MZN'
 */
function formataMoeda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '0,00 MZN';
  return Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' MZN';
}

/* ═══════════════════════════════════════════════
   DIÁLOGOS
   ═══════════════════════════════════════════════ */

/**
 * Diálogo de confirmação. Substitui a função `confirmar` inexistente no RH.
 * @param {string} mensagem
 * @returns {boolean}
 */
function confirmarAcao(mensagem) {
  return window.confirm(mensagem);
}

/* ═══════════════════════════════════════════════
   MANIPULAÇÃO DE DOM
   ═══════════════════════════════════════════════ */

/**
 * Seleciona um elemento pelo ID (atalho).
 */
function el(id) {
  return document.getElementById(id);
}

/**
 * Cria um elemento HTML com classes e atributos opcionais.
 * @param {string} tag
 * @param {string} [classes='']
 * @param {Object} [attrs={}]
 * @returns {HTMLElement}
 */
function criarElemento(tag, classes, attrs) {
  var elem = document.createElement(tag);
  if (classes) elem.className = classes;
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      elem.setAttribute(k, attrs[k]);
    });
  }
  return elem;
}

/**
 * Escapa HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
function escaparHTML(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Preenche um <select> com opções de um array de objetos.
 * @param {string} selectId - ID do <select>
 * @param {Array} items - Array de { value, label }
 * @param {string} [placeholder='Selecione...']
 */
function preencherSelect(selectId, items, placeholder) {
  var sel = el(selectId);
  if (!sel) return;
  sel.innerHTML = '';
  if (placeholder) {
    var opt = document.createElement('option');
    opt.value = '';
    opt.textContent = placeholder;
    sel.appendChild(opt);
  }
  items.forEach(function (item) {
    var opt = document.createElement('option');
    opt.value = item.value;
    opt.textContent = item.label;
    sel.appendChild(opt);
  });
}

/**
 * Mostra/esconde um loader sobre um elemento.
 * @param {string} containerId - ID do container
 * @param {boolean} mostrar
 */
function toggleLoader(containerId, mostrar) {
  var container = el(containerId);
  if (!container) return;
  var loader = container.querySelector('.loader-overlay');
  if (mostrar) {
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'loader-overlay';
      loader.innerHTML = '<div class="loader-spinner"></div>';
      container.style.position = 'relative';
      container.appendChild(loader);
    }
    loader.style.display = 'flex';
  } else if (loader) {
    loader.style.display = 'none';
  }
}

/* ═══════════════════════════════════════════════
   UTILITÁRIOS GERAIS
   ═══════════════════════════════════════════════ */

/**
 * Atraso (para usar em async/await).
 * @param {number} ms
 * @returns {Promise}
 */
function atrasar(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

/**
 * Gera um ID simples baseado em timestamp.
 * @returns {string}
 */
function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Debounce simples.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
function debounce(fn, delay) {
  var timer;
  return function () {
    var args = arguments;
    var ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function () { fn.apply(ctx, args); }, delay);
  };
}

/**
 * Normaliza texto: trim + lowercase.
 */
function normalizarTexto(str) {
  return (str || '').trim().toLowerCase();
}
