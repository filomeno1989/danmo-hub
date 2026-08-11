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


/* ═══════════════════════════════════════════════════════════════
   COMPATIBILIDADE LEGADA (NÃO APAGAR)
   Mantém as páginas antigas do portal a funcionar sem falhas
   ═══════════════════════════════════════════════════════════════ */

// Atalhos para nomes de funções de Datas
function formatarData(d, h) { return formataData(d, h); }
function fmtData(d, h) { return formataData(d, h); }
function hoje() { return dataHojeISO(); }

// Atalho para Notificações (Toast)
function showToast(msg, tipo) { mostrarToast(msg, tipo); }

// Atalhos para Fechar/Abrir Modais e Manipular Inputs
function fecharModal(id) { document.getElementById(id)?.classList.remove('open', 'aberto', 'visivel'); }
function abrirModal(id) { document.getElementById(id)?.classList.add('open', 'aberto'); }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function getVal(id) { return document.getElementById(id)?.value ?? ''; }

// Atalho para Diálogo de Confirmação
function confirmar(msg, callback) { if (confirmarAcao(msg)) callback(); }

// Atalho para Formatação de Número Simples (sem MZN)
function fmtNum(n) {
  if (isNaN(n) || n === null || n === undefined) return '0,00';
  return Number(n).toLocaleString('pt-MZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Extenso corrigido para o Módulo de Faturação
function numPorExtenso(numero) {
  numero = Math.round(numero * 100) / 100;
  if (!numero || numero === 0) return 'Zero meticais';

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const dezenas10 = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
  const dezenas = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function converteBloco(n) {
    if (n === 0) return '';
    if (n === 100) return 'cem'; 
    let c = Math.floor(n / 100);
    let d = Math.floor((n % 100) / 10);
    let u = n % 10;
    let partes = [];
    if (c > 0) partes.push(centenas[c]); 
    if (d === 1) {
      partes.push(dezenas10[u]);
    } else {
      if (d > 1) partes.push(dezenas[d]);
      if (u > 0) partes.push(unidades[u]);
    }
    return partes.join(' e ');
  }

  let meticais = Math.floor(numero);
  let centavos = Math.round((numero - meticais) * 100);
  let resultado = [];
  
  if (meticais > 0) {
    let bilhoes = Math.floor(meticais / 1000000000);
    let milhoes = Math.floor((meticais % 1000000000) / 1000000);
    let milhares = Math.floor((meticais % 1000000) / 1000);
    let resto = meticais % 1000;
    let partesMeticais = [];
    
    if (bilhoes > 0) partesMeticais.push(converteBloco(bilhoes) + (bilhoes === 1 ? ' bilião' : ' biliões'));
    if (milhoes > 0) partesMeticais.push(converteBloco(milhoes) + (milhoes === 1 ? ' milhão' : ' milhões'));
    if (milhares > 0) {
      let strMilhares = converteBloco(milhares);
      if (strMilhares === 'um') strMilhares = ''; 
      partesMeticais.push((strMilhares ? strMilhares + ' ' : '') + 'mil');
    }
    if (resto > 0) {
      let strResto = converteBloco(resto);
      if (partesMeticais.length > 0) {
         if (resto < 100 || resto % 100 === 0) partesMeticais.push('e ' + strResto);
         else partesMeticais.push(strResto); 
      } else {
         partesMeticais.push(strResto);
      }
    } else if ((bilhoes > 0 || milhoes > 0) && milhares === 0 && resto === 0) {
      partesMeticais.push('de');
    }
    
    let strExtenso = partesMeticais.join(' ').replace(/\s+/g, ' ').trim();
    strExtenso += (meticais === 1 ? ' metical' : ' meticais');
    resultado.push(strExtenso);
  }
  
  if (centavos > 0) {
    let strCentavos = converteBloco(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
    resultado.push(strCentavos);
  }
  
  let finalStr = resultado.join(' e ');
  return finalStr.charAt(0).toUpperCase() + finalStr.slice(1);
}

// Gerar próximo número de documento ex: "005/26"
function proximoNumero(tipo, lista) {
  const anoActual = new Date().getFullYear().toString().slice(-2);
  const docs = lista.filter(d => d.tipo === tipo);
  let maxNum = 0;
  docs.forEach(d => {
    const match = (d.numero || '').match(/^(\d+)\//);
    if (match) { const n = parseInt(match[1]); if (n > maxNum) maxNum = n; }
  });
  return String(maxNum + 1).padStart(3, '0') + '/' + anoActual;
}
