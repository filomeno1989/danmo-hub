/**
 * notificacoes.js - Sino de avisos do topo (Danmo Hub)
 *
 * Ligado ao botao do sino que o nav.js cria na topbar.
 * Mostra num pequeno painel os avisos de trabalho do dia:
 * pedidos de stock por confirmar, obras paradas ha mais de 14 dias,
 * planos de ferias a espera do RH e acidentes recentes.
 *
 * Cada fonte de avisos falha em silencio: se uma tabela nao existir
 * ou a coluna mudar de nome, esse aviso simplesmente nao aparece.
 *
 * Este ficheiro e carregado pelo proprio nav.js.
 * Nao depende de outros scripts alem do db (shared/supabase.js).
 * Ultima atualizacao: 2026-09-10
 */
(function () {
  'use strict';

  if (typeof window.db === 'undefined') return; // sem ligacao a base, nao faz nada

  /* Prefixo de caminho com que este ficheiro foi incluido */
  var scriptEl = document.currentScript || document.querySelector('script[src*="notificacoes.js"]');
  var BASE = scriptEl ? (scriptEl.getAttribute('src') || '').replace(/shared\/notificacoes\.js.*$/, '') : '';

  /* ===== Fontes de avisos (todas opcionais) ===== */

  function contarViaQuery(tabela, params) {
    return db.queryTudo(tabela, params).then(function (lista) { return lista.length; });
  }

  var FONTES = [
    {
      icon: '&#128230;',
      href: 'stock/entradas.html',
      contar: function () { return db.count('stock_movimentos', { estado: 'pendente', tipo: 'entrada' }); },
      texto: function (n) { return n === 1 ? 'pedido de compra por confirmar' : 'pedidos de compra por confirmar'; }
    },
    {
      icon: '&#128230;',
      href: 'stock/saidas.html',
      contar: function () { return db.count('stock_movimentos', { estado: 'pendente', tipo: 'saida' }); },
      texto: function (n) { return n === 1 ? 'saida da oficina por confirmar' : 'saidas da oficina por confirmar'; }
    },
    {
      icon: '&#128663;',
      href: 'oficina/ordens.html',
      contar: function () {
        var limite = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
        return contarViaQuery('ordens_servico', 'select=id&status_atual=not.in.(CdM,Fechada)&data_abertura=lte.' + limite);
      },
      texto: function (n) { return n === 1 ? 'obra na oficina ha mais de 14 dias' : 'obras na oficina ha mais de 14 dias'; }
    },
    {
      icon: '&#128197;',
      href: 'ferias/rh-mensal.html',
      contar: function () { return db.count('ferias_plano', { status: 'Aguarda RH' }); },
      texto: function (n) { return n === 1 ? 'plano de ferias a espera do RH' : 'planos de ferias a espera do RH'; }
    },
    {
      icon: '&#9888;',
      href: 'hst/acidentes.html',
      contar: function () {
        var limite = new Date(Date.now() - 7 * 86400000).toISOString();
        return contarViaQuery('hst_acidentes', 'select=id&created_at=gte.' + limite);
      },
      texto: function (n) { return n === 1 ? 'acidente registado nos ultimos 7 dias' : 'acidentes registados nos ultimos 7 dias'; }
    }
  ];

  /* ===== Construir o painel ===== */

  var painel = null;
  var listaEl = null;
  var aCarregar = false;

  function estilo() {
    if (document.getElementById('dh-notif-style')) return;
    var st = document.createElement('style');
    st.id = 'dh-notif-style';
    st.textContent =
      '.dh-notif-painel{position:fixed;top:calc(var(--topbar-h,60px) + 8px);right:12px;width:340px;max-width:calc(100vw - 20px);' +
      'background:var(--cor-superficie);border:1px solid var(--cor-borda);border-radius:var(--raio-md,10px);' +
      'box-shadow:var(--sombra-lg);z-index:1050;display:none;overflow:hidden;}' +
      '.dh-notif-painel.aberto{display:block;}' +
      '.dh-notif-cab{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;' +
      'border-bottom:1px solid var(--cor-borda);font-weight:700;color:var(--cor-texto);font-size:.95rem;}' +
      '.dh-notif-atualizar{background:none;border:0;color:var(--cor-texto-sec);cursor:pointer;font-size:1rem;padding:2px 6px;border-radius:6px;}' +
      '.dh-notif-atualizar:hover{color:var(--cor-ambar);background:var(--cor-borda);}' +
      '.dh-notif-lista{max-height:320px;overflow-y:auto;}' +
      '.dh-notif-item{display:flex;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--cor-borda);' +
      'color:var(--cor-texto);text-decoration:none;font-size:.9rem;}' +
      '.dh-notif-item:last-child{border-bottom:0;}' +
      '.dh-notif-item:hover{background:var(--cor-borda);}' +
      '.dh-notif-item .dh-ico{font-size:1.1rem;flex-shrink:0;}' +
      '.dh-notif-item .dh-seta{margin-left:auto;color:var(--cor-texto-sec);flex-shrink:0;}' +
      '.dh-notif-item strong{color:var(--cor-ambar);font-weight:700;}' +
      '.dh-notif-vazio{padding:22px 14px;text-align:center;color:var(--cor-texto-sec);font-size:.9rem;}';
    document.head.appendChild(st);
  }

  function montarPainel() {
    if (painel) return;
    estilo();
    painel = document.createElement('div');
    painel.className = 'dh-notif-painel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Avisos do sistema');
    painel.innerHTML =
      '<div class="dh-notif-cab"><span>Avisos</span>' +
      '<button class="dh-notif-atualizar" id="dh-notif-refresh" title="Atualizar avisos">&#8635;</button></div>' +
      '<div class="dh-notif-lista" id="dh-notif-lista"></div>';
    document.body.appendChild(painel);
    listaEl = document.getElementById('dh-notif-lista');

    document.getElementById('dh-notif-refresh').addEventListener('click', function (e) {
      e.stopPropagation();
      carregar();
    });

    /* Fechar ao clicar fora */
    document.addEventListener('click', function (e) {
      var btn = document.getElementById('btn-notif');
      if (!painel.classList.contains('aberto')) return;
      if (painel.contains(e.target) || (btn && btn.contains(e.target))) return;
      fechar();
    });
  }

  function fechar() {
    if (painel) painel.classList.remove('aberto');
  }

  function atualizarBadge(total) {
    var badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (total > 0) {
      badge.textContent = total > 99 ? '99+' : String(total);
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  function carregar() {
    if (aCarregar || !listaEl) return;
    aCarregar = true;
    listaEl.innerHTML = '<div class="dh-notif-vazio">A verificar avisos...</div>';

    var promessas = FONTES.map(function (f) {
      return f.contar().then(function (n) { return { fonte: f, total: Number(n) || 0 }; })
        .catch(function () { return null; }); // fonte falha, fica de fora
    });

    Promise.all(promessas).then(function (resultados) {
      aCarregar = false;
      var itens = resultados.filter(function (r) { return r && r.total > 0; });
      atualizarBadge(itens.reduce(function (s, r) { return s + r.total; }, 0));

      if (!itens.length) {
        listaEl.innerHTML = '<div class="dh-notif-vazio">Sem novidades por agora.</div>';
        return;
      }
      listaEl.innerHTML = '';
      itens.forEach(function (r) {
        var a = document.createElement('a');
        a.className = 'dh-notif-item';
        a.href = BASE + r.fonte.href;
        a.innerHTML = '<span class="dh-ico">' + r.fonte.icon + '</span>' +
          '<span><strong>' + r.total + '</strong> ' + r.fonte.texto(r.total) + '</span>' +
          '<span class="dh-seta">&#8250;</span>';
        a.addEventListener('click', function () { fechar(); }); // deixa navegar
        listaEl.appendChild(a);
      });
    }).catch(function () {
      aCarregar = false;
      listaEl.innerHTML = '<div class="dh-notif-vazio">Nao foi possivel verificar os avisos.</div>';
    });
  }

  /* ===== Ligar ao sino (que o nav.js cria mais tarde) ===== */

  var tentativas = 0;
  function procurarSino() {
    var btn = document.getElementById('btn-notif');
    if (btn && !btn.getAttribute('data-dh-notif')) {
      btn.setAttribute('data-dh-notif', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        montarPainel();
        var aberto = painel.classList.toggle('aberto');
        if (aberto) carregar();
      });
      /* Primeira contagem discreta, sem competir com o carregamento da pagina */
      setTimeout(carregar, 2500);
      return;
    }
    if (tentativas++ < 150) setTimeout(procurarSino, 100); // espera ate 15s
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', procurarSino);
  } else {
    procurarSino();
  }
})();
