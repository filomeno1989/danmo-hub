/**
 * utils.js - Funções utilitárias unificadas (Danmo Hub)
 * Todas as 7 aplicações usam ESTE ficheiro.
 * Função de toast: mostrarToast (nome único, corrigido dos 3 nomes diferentes)
 * Última atualização: 2026-08-11
 */

/* ═══════════════════════════════════════════════
   TOAST - Notificações
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
  if (!dataISO) return '-';
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
  if (!dataISO) return '-';
  var d = new Date(dataISO);
  if (isNaN(d.getTime())) return '-';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

/**
 * Retorna a data atual em formato ISO (YYYY-MM-DD).
 * Usa a hora LOCAL (nao a UTC): o toISOString() desandava entre a
 * meia-noite e as 02:00 em Mocambique (UTC+2), onde devolvia a data
 * de ontem em vez de hoje.
 */
function dataHojeISO() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
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
 * Diálogo de confirmação LEGADO (síncrono). Mantido só para páginas antigas.
 * Nas páginas novas usa dhConfirmar(), que abre o modal do sistema.
 * @param {string} mensagem
 * @returns {boolean}
 */
function confirmarAcao(mensagem) {
  return window.confirm(mensagem);
}

/* ═══════════════════════════════════════════════
   MODAL DE CONFIRMAÇÃO DO SISTEMA
   Substitui as janelas cinzentas do navegador.
   Fecha com ESC, confirma com Enter.
   ═══════════════════════════════════════════════ */

var __dhModalAberto = false;

/**
 * Diálogo de confirmação com a cara do sistema.
 * @param {string} mensagem - Texto mostrado ao utilizador
 * @param {Object} [opcoes] - { titulo, botaoOk, botaoCancelar, perigo }
 * @returns {Promise<boolean>} true se o utilizador confirmou
 */
function dhConfirmar(mensagem, opcoes) {
  return new Promise(function (resolve) {
    opcoes = opcoes || {};
    if (__dhModalAberto) { resolve(false); return; }
    __dhModalAberto = true;

    var perigo = opcoes.perigo === true;
    var overlay = document.createElement('div');
    overlay.className = 'dh-modal-overlay';
    overlay.innerHTML =
      '<div class="dh-modal" role="dialog" aria-modal="true">' +
        '<div class="dh-modal-titulo">' + escaparHTML(opcoes.titulo || (perigo ? 'Acção irreversível' : 'Confirmar acção')) + '</div>' +
        '<div class="dh-modal-texto">' + escaparHTML(mensagem) + '</div>' +
        '<div class="dh-modal-botoes">' +
          '<button type="button" class="btn btn-secundario" data-dh-modal="nao">' + escaparHTML(opcoes.botaoCancelar || 'Cancelar') + '</button>' +
          '<button type="button" class="btn ' + (perigo ? 'btn-vermelho' : 'btn-primario') + '" data-dh-modal="sim">' + escaparHTML(opcoes.botaoOk || 'Confirmar') + '</button>' +
        '</div>' +
      '</div>';

    function fechar(valor) {
      if (!overlay.parentNode) return;
      document.removeEventListener('keydown', aoTecla, true);
      overlay.parentNode.removeChild(overlay);
      __dhModalAberto = false;
      resolve(valor);
    }
    function aoTecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(false); }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); fechar(true); }
    }

    overlay.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dh-modal]');
      if (b) fechar(b.getAttribute('data-dh-modal') === 'sim');
      else if (e.target === overlay) fechar(false);
    });
    document.addEventListener('keydown', aoTecla, true);

    (document.body || document.documentElement).appendChild(overlay);
    var botaoOk = overlay.querySelector('[data-dh-modal="sim"]');
    if (botaoOk) botaoOk.focus();
  });
}

/**
 * Pede a chave de administração num modal do sistema e valida no servidor.
 * Usada antes de acções destrutivas (limpeza total, eliminação em massa).
 * @param {string} mensagem - Explica o que está a ser autorizado
 * @returns {Promise<boolean>} true se a chave foi validada
 */
function dhPedirChaveAdmin(mensagem) {
  return new Promise(function (resolve) {
    var token = null;
    try {
      if (typeof sessao === 'function') {
        var s = sessao();
        token = s ? s.token : null;
      }
    } catch (e) { token = null; }
    if (!token) {
      mostrarToast('Sessão inválida. Entra de novo no sistema.', 'erro');
      resolve(false);
      return;
    }
    if (__dhModalAberto) { resolve(false); return; }
    __dhModalAberto = true;

    var overlay = document.createElement('div');
    overlay.className = 'dh-modal-overlay';
    overlay.innerHTML =
      '<div class="dh-modal" role="dialog" aria-modal="true">' +
        '<div class="dh-modal-titulo">&#128274; Autorização da administração</div>' +
        '<div class="dh-modal-texto">' + escaparHTML(mensagem || 'Esta acção é sensível e precisa de autorização.') + '</div>' +
        '<input type="password" class="form-input dh-modal-input" id="dh-chave-input" placeholder="Escreve a chave de administração" autocomplete="off">' +
        '<div class="dh-modal-botoes">' +
          '<button type="button" class="btn btn-secundario" data-dh-modal="nao">Cancelar</button>' +
          '<button type="button" class="btn btn-primario" data-dh-modal="sim">Autorizar</button>' +
        '</div>' +
      '</div>';

    function fechar(valor) {
      document.removeEventListener('keydown', aoTecla, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      __dhModalAberto = false;
      resolve(valor);
    }
    async function autorizar() {
      var input = overlay.querySelector('#dh-chave-input');
      var btnOk = overlay.querySelector('[data-dh-modal="sim"]');
      var chave = (input.value || '').trim();
      if (!chave) { input.focus(); return; }
      btnOk.disabled = true;
      btnOk.textContent = 'A validar...';
      var ok = false;
      try {
        ok = (await db.rpc('verificar_chave_admin', { p_token: token, p_chave: chave })) === true;
      } catch (e) { ok = false; }
      if (!ok) {
        mostrarToast('Chave de administração errada. Nota: não é a senha da tua conta.', 'erro');
        btnOk.disabled = false;
        btnOk.textContent = 'Autorizar';
        input.value = '';
        input.focus();
        return;
      }
      fechar(true);
    }
    function aoTecla(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(false); }
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); autorizar(); }
    }

    overlay.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dh-modal]');
      if (!b) return;
      if (b.getAttribute('data-dh-modal') === 'sim') autorizar();
      else fechar(false);
    });
    document.addEventListener('keydown', aoTecla, true);

    (document.body || document.documentElement).appendChild(overlay);
    setTimeout(function () {
      var input = overlay.querySelector('#dh-chave-input');
      if (input) input.focus();
    }, 60);
  });
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

// Atalhos usados pelas páginas antigas da Oficina (exportação do danmo-oficina),
// que chamavam estes nomes e não os que existem acima. Sem isto, ReferenceError
// interrompia: Iniciar Checklist, Trocar Revisão, Fechar OS, datas automáticas em
// modais de Intervenção/Peça, Guardar Cabeçalho do checklist, e os históricos
// (intervenções, mudanças de estado, trocas de checklist) em os_detalhe.html.
function dataHoje() { return dataHojeISO(); }
function formatarDataHora(d) {
  if (!d) return '-';
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Atalho para Notificações (Toast)
function showToast(msg, tipo) { mostrarToast(msg, tipo); }

// Atalhos para Fechar/Abrir Modais e Manipular Inputs
function fecharModal(id) { document.getElementById(id)?.classList.remove('open', 'aberto', 'visivel'); }
function abrirModal(id) { document.getElementById(id)?.classList.add('open', 'aberto'); }
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val ?? ''; }
function getVal(id) { return document.getElementById(id)?.value ?? ''; }

// Atalho para Diálogo de Confirmação (legado, com callback - abre o modal do sistema)
function confirmar(msg, callback) { dhConfirmar(msg).then(function (ok) { if (ok) callback(); }); }

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

/**
 * Seletor de Colaborador com pesquisa por nome ou código (autocomplete).
 * MESMO padrão já usado em oficina/os_detalhe.html - generalizado para
 * poder ser usado em qualquer módulo do Hub.
 *
 * Requer no HTML:
 *   <div class="tech-search-wrap">
 *     <input type="text" id="{inputId}" placeholder="Pesquisar por nome ou código..." autocomplete="off">
 *     <div class="tech-dropdown" id="{dropdownId}"></div>
 *   </div>
 *   <input type="hidden" id="{hiddenId}">
 *   <div class="chips-wrap" id="{chipId}"></div>   (opcional, mas recomendado)
 *
 * Uso:
 *   const seletor = await criarSeletorColaborador({
 *     inputId: 'f-colab-search', dropdownId: 'f-colab-dropdown',
 *     hiddenId: 'f-colaborador', chipId: 'f-colab-chip'
 *   });
 *   ... mais tarde: seletor.reset();  ou  seletor.getColaboradores();
 */
async function criarSeletorColaborador({ inputId, dropdownId, hiddenId, chipId, onSelect }) {
  const inputEl = document.getElementById(inputId);
  const ddEl = document.getElementById(dropdownId);
  const hiddenEl = document.getElementById(hiddenId);
  const chipEl = chipId ? document.getElementById(chipId) : null;
  if (!inputEl || !ddEl || !hiddenEl) {
    console.warn('criarSeletorColaborador: elementos em falta para', inputId);
    return null;
  }

  let colaboradores = [];
  try {
    colaboradores = await db.query('collaborators', 'select=id,name,code,setor&active=eq.true&order=name.asc');
  } catch (err) {
    console.error('Erro ao carregar colaboradores para o seletor:', err);
  }

  function renderChip() {
    if (!chipEl) return;
    const nome = hiddenEl.value;
    chipEl.innerHTML = nome
      ? '<span class="chip-colab">' + nome + '<button type="button" aria-label="Remover">&times;</button></span>'
      : '';
  }

  if (chipEl) {
    chipEl.addEventListener('click', function (e) {
      if (e.target.closest('button')) {
        hiddenEl.value = '';
        inputEl.value = '';
        renderChip();
        if (onSelect) onSelect(null);
      }
    });
  }

  inputEl.addEventListener('input', function () {
    const q = inputEl.value.toLowerCase().trim();
    hiddenEl.value = '';
    if (!q) { ddEl.classList.remove('open'); ddEl.innerHTML = ''; return; }
    const matches = colaboradores.filter(function (c) {
      return c.name.toLowerCase().indexOf(q) !== -1 || (c.code || '').toLowerCase().indexOf(q) !== -1;
    }).slice(0, 15);
    ddEl.innerHTML = matches.length
      ? matches.map(function (c) {
          const nomeAttr = c.name.replace(/"/g, '&quot;');
          return '<div class="tech-option" data-nome="' + nomeAttr + '" data-codigo="' + (c.code || '') + '">' +
                 c.name + (c.code ? ' (' + c.code + ')' : '') + (c.setor ? ' - ' + c.setor : '') + '</div>';
        }).join('')
      : '<div class="tech-option text-muted">Nenhum resultado.</div>';
    ddEl.classList.add('open');
  });

  ddEl.addEventListener('click', function (e) {
    const opt = e.target.closest('.tech-option');
    if (!opt || !opt.dataset.nome) return;
    hiddenEl.value = opt.dataset.nome;
    inputEl.value = opt.dataset.nome;
    ddEl.classList.remove('open');
    renderChip();
    if (onSelect) onSelect({ name: opt.dataset.nome, code: opt.dataset.codigo || null });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('#' + inputId) && !e.target.closest('#' + dropdownId)) {
      ddEl.classList.remove('open');
    }
  });

  return {
    reset: function () { hiddenEl.value = ''; inputEl.value = ''; renderChip(); },
    getColaboradores: function () { return colaboradores; },
    setValor: function (nome) { hiddenEl.value = nome || ''; inputEl.value = ''; renderChip(); }
  };
}

/**
 * Calcula a idade (em anos completos) a partir de uma data de
 * nascimento (string ISO 'YYYY-MM-DD' ou Date).
 */
function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  var nasc = new Date(dataNascimento);
  if (isNaN(nasc.getTime())) return null;
  var hoje = new Date();
  var idade = hoje.getFullYear() - nasc.getFullYear();
  var m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/**
 * Sanitiza HTML rico permitindo apenas etiquetas seguras de formatação
 * (negrito, itálico, sublinhado, parágrafos, listas) e o estilo
 * text-align. Remove scripts, atributos e tudo o resto.
 * Usado pela Descrição do Serviço da Faturação (editor + impressão).
 */
function sanitizarHTMLRico(html) {
  if (!html) return '';
  var PERMITIDAS = ['B','STRONG','I','EM','U','S','P','DIV','BR','UL','OL','LI','SPAN'];
  var dt = new DOMParser().parseFromString(String(html), 'text/html');
  var mudou = true;
  while (mudou) {
    mudou = false;
    dt.body.querySelectorAll('*').forEach(function (el) {
      if (PERMITIDAS.indexOf(el.tagName) === -1) {
        var frag = dt.createDocumentFragment();
        while (el.firstChild) frag.appendChild(el.firstChild);
        el.replaceWith(frag);
        mudou = true;
      }
    });
  }
  dt.body.querySelectorAll('*').forEach(function (el) {
    Array.prototype.slice.call(el.attributes).forEach(function (a) {
      // só se mantém um style cujo conteúdo inteiro seja um text-align
      var ok = a.name === 'style' && /^text-align\s*:\s*[a-z\-]+\s*;?$/i.test(a.value.trim());
      if (!ok) el.removeAttribute(a.name);
    });
  });
  return dt.body.innerHTML;
}

/**
 * Converte HTML rico (ex.: descrição formatada) em texto simples,
 * sem etiquetas - para listagens, pesquisas e Excel.
 */
function textoSemTags(str) {
  if (!str) return '';
  var s = String(str);
  if (!/<[a-z][^>]*>/i.test(s)) return s;
  var d = document.createElement('div');
  d.innerHTML = sanitizarHTMLRico(s);
  return (d.textContent || '').replace(/\s+/g, ' ').trim();
}
