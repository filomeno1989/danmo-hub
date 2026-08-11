/**
 * nav.js — Topbar + Sidebar unificados (Danmo Hub)
 * Injeta a navegação completa dentro de <div id="navbar"></div>.
 * Todas as aplicações do Hub usam ESTE ficheiro.
 * Requer: shared/style.css, shared/auth.js, shared/tema.js já carregados antes.
 * Última atualização: 2026-08-11
 */

(function () {
  'use strict';

  const scriptEl = document.currentScript || document.querySelector('script[src*="nav.js"]');
  const srcAttr = scriptEl ? scriptEl.getAttribute('src') : 'shared/nav.js';
  const BASE = srcAttr.replace(/shared\/nav\.js.*$/, '');

  const MODULOS = [
    { id: 'inicio', label: 'Painel Principal', icon: '&#9776;', href: 'index.html' },

    { id: 'oficina', label: 'Oficina & Manutenção', icon: '&#9881;', pasta: 'oficina',
      sub: [
        { label: 'Visão Geral',        href: 'oficina/dashboard.html' },
        { label: 'Ordens de Serviço',  href: 'oficina/ordens.html' },
        { label: 'Checklist',          href: 'oficina/checklist_gestao.html' },
        { label: 'Equipamentos',       href: 'oficina/equipamentos.html' }
      ] },

    { id: 'disponibilidade', label: 'Disponibilidade Equip.', icon: '&#128666;', href: '#', dev: true },

    { id: 'admin', label: 'Admin. Oficinal', icon: '&#128188;', pasta: 'rh|financeiro',
      sub: [
        { label: 'RH & Quadro de Pessoal',   href: 'rh/index.html' },
        { label: 'Finanças & Faturas',       href: 'financeiro/index.html' }
      ] },

    { id: 'stock', label: 'Gestão de Stock', icon: '&#9638;', href: 'stock/index.html', pasta: 'stock' },

    { id: 'hst', label: 'Portal HST', icon: '&#9762;', href: 'hst/index.html', pasta: 'hst' },

    { id: 'ferramentaria', label: 'Ferramentaria', icon: '&#128295;', href: '#', dev: true },

    { id: 'gestao', label: 'Gestão & Registos', icon: '&#9881;', href: '#', dev: true }
  ];

  const caminhoAtual = window.location.pathname;
  function ehAtivo(mod) {
    if (!mod.pasta) return false;
    return mod.pasta.split('|').some(p => caminhoAtual.includes('/' + p + '/'));
  }

  function htmlModulo(mod) {
    if (mod.sub) {
      const aberto = ehAtivo(mod);
      const subHtml = mod.sub.map(s => {
        const subAtivo = caminhoAtual.endsWith(s.href) || caminhoAtual.includes(s.href);
        return `<a href="${BASE}${s.href}" class="${subAtivo ? 'ativo' : ''}">${s.label}</a>`;
      }).join('');
      return `
        <li class="sidebar-modulo">
          <button class="sidebar-modulo-btn${aberto ? ' ativo' : ''}" data-alvo="sub-${mod.id}" aria-expanded="${aberto}">
            <span class="modulo-icon">${mod.icon}</span>
            <span class="modulo-label">${mod.label}</span>
            <span class="modulo-seta">&#9654;</span>
          </button>
          <div class="sidebar-submenu${aberto ? ' visivel' : ''}" id="sub-${mod.id}">${subHtml}</div>
        </li>`;
    }
    if (mod.dev) {
      return `
        <li class="sidebar-modulo">
          <span class="sidebar-modulo-btn" style="opacity:.5;cursor:default;">
            <span class="modulo-icon">${mod.icon}</span>
            <span class="modulo-label">${mod.label}</span>
            <span class="badge badge-aviso" style="margin-left:auto;font-size:9px;">Dev</span>
          </span>
        </li>`;
    }
    const ativo = mod.id === 'inicio'
      ? (caminhoAtual.endsWith('/index.html') || caminhoAtual === '/' || caminhoAtual.endsWith('/danmo-hub/') || caminhoAtual.endsWith('/danmo-hub'))
      : ehAtivo(mod);
    return `
      <li class="sidebar-modulo">
        <a href="${BASE}${mod.href}" class="sidebar-modulo-btn${ativo ? ' ativo' : ''}">
          <span class="modulo-icon">${mod.icon}</span>
          <span class="modulo-label">${mod.label}</span>
        </a>
      </li>`;
  }

  const sidebarHtml = `
    <nav class="sidebar" id="sidebar" aria-label="Menu principal">
      <ul class="sidebar-nav" role="menubar">
        ${MODULOS.map(htmlModulo).join('')}
        <div class="sidebar-separador"></div>
        <li class="sidebar-modulo">
          <button class="sidebar-modulo-btn" id="btn-sair" style="color:var(--cor-vermelho-danmo);">
            <span class="modulo-icon">&#10006;</span>
            <span class="modulo-label">Terminar Sessão</span>
          </button>
        </li>
      </ul>
    </nav>`;

  const topbarHtml = `
    <header class="topbar">
      <a href="${BASE}index.html" class="topbar-logo">
        <img src="${BASE}shared/logos/danmo-logo.png" alt="Logo Danmo Service System" width="36" height="36">
        <div class="logo-texto">Portal Danmo <span>Service System, Lda</span></div>
      </a>
      <div class="topbar-centro">
        <span class="topbar-data" id="topbar-data"></span>
        <span class="topbar-relogio" id="topbar-relogio"></span>
      </div>
      <div class="topbar-direita">
        <button class="topbar-tema-btn" id="btn-tema" aria-label="Alternar tema" title="Claro / Escuro">&#9790;</button>
        <button class="topbar-notif-btn" id="btn-notif" aria-label="Notificações" title="Notificações">
          &#128276;
          <span class="notif-badge" id="notif-badge" style="display:none;">0</span>
        </button>
        <div class="topbar-perfil" id="perfil-botao" tabindex="0" role="button" aria-label="Menu do utilizador">
          <div class="avatar" id="topbar-avatar">?</div>
          <div class="perfil-info">
            <span class="perfil-nome" id="topbar-nome">Utilizador</span>
            <span class="perfil-funcao" id="topbar-funcao">---</span>
          </div>
        </div>
      </div>
    </header>`;

  const modalHtml = `
    <div class="perfil-dropdown" id="perfil-menu" style="display:none;">
      <div class="perfil-dropdown-cabecalho">
        <span>Meu Perfil</span>
        <button class="modal-fechar" id="perfil-fechar" aria-label="Fechar">&times;</button>
      </div>
      <div class="perfil-dropdown-corpo">
        <p><strong>Nome:</strong> <span id="perfil-nome-detalhe"></span></p>
        <p><strong>Código:</strong> <span id="perfil-codigo-detalhe"></span></p>
        <p><strong>Cargo:</strong> <span id="perfil-cargo-detalhe"></span></p>
        <p><strong>Nível:</strong> <span id="perfil-nivel-detalhe"></span></p>
      </div>
      <div class="perfil-dropdown-rodape">
        <button class="btn btn-vermelho btn-sm" id="perfil-sair" style="width:100%;">Terminar Sessão</button>
      </div>
    </div>`;
    </div>`;

  function montar() {
    const alvo = document.getElementById('navbar');
    if (!alvo) {
      console.warn('nav.js: elemento <div id="navbar"> não encontrado nesta página.');
      return;
    }
    alvo.outerHTML = topbarHtml + '<div class="layout">' + sidebarHtml + '<div id="conteudo-principal-wrap"></div></div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const wrap = document.getElementById('conteudo-principal-wrap');
    const layout = wrap.parentElement;
    let no = layout.nextSibling;
    while (no) {
      const proximo = no.nextSibling;
      if (no.nodeType === 1 && no.classList && no.classList.contains('main')) {
        layout.appendChild(no);
      } else if (no.nodeType === 1 || (no.nodeType === 3 && no.textContent.trim())) {
        layout.appendChild(no);
      }
      no = proximo;
    }
    wrap.remove();

    ativarRelogio();
    ativarPerfil();
    ativarEventos();
  }

  const DIAS_SEMANA = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  function ativarRelogio() {
    function tick() {
      const agora = new Date();
      const h = String(agora.getHours()).padStart(2, '0');
      const m = String(agora.getMinutes()).padStart(2, '0');
      const s = String(agora.getSeconds()).padStart(2, '0');
      const elRelogio = document.getElementById('topbar-relogio');
      const elData = document.getElementById('topbar-data');
      if (elRelogio) elRelogio.textContent = `${h}:${m}:${s}`;
      if (elData) elData.textContent = `${DIAS_SEMANA[agora.getDay()]}, ${agora.getDate()} de ${MESES[agora.getMonth()]} de ${agora.getFullYear()}`;
    }
    tick();
    setInterval(tick, 1000);
  }

  function ativarPerfil() {
    if (typeof obterUtilizador !== 'function') return;
    const user = obterUtilizador();
    if (!user) return;

    const nivelLabel = { admin: 'Admin', gestor: 'Gestor', operador: 'Operador' };

    const avatar = document.getElementById('topbar-avatar');
    const nomeEl = document.getElementById('topbar-nome');
    const funcaoEl = document.getElementById('topbar-funcao');
    if (avatar) avatar.textContent = (user.nome || '?').charAt(0).toUpperCase();
    if (nomeEl) nomeEl.textContent = user.nome || 'Utilizador';
    if (funcaoEl) funcaoEl.textContent = nivelLabel[user.nivel] || user.cargo || '---';

    const pNome = document.getElementById('perfil-nome-detalhe');
    const pCodigo = document.getElementById('perfil-codigo-detalhe');
    const pCargo = document.getElementById('perfil-cargo-detalhe');
    const pNivel = document.getElementById('perfil-nivel-detalhe');
    if (pNome) pNome.textContent = user.nome || '—';
    if (pCodigo) pCodigo.textContent = user.usuario || '—';
    if (pCargo) pCargo.textContent = user.cargo || '—';
    if (pNivel) pNivel.textContent = nivelLabel[user.nivel] || user.nivel || '—';
  }

  function ativarEventos() {
    const perfilBotao = document.getElementById('perfil-botao');
    const perfilMenu = document.getElementById('perfil-menu');
    const perfilFechar = document.getElementById('perfil-fechar');
    
    if (perfilBotao && perfilMenu) {
      perfilBotao.addEventListener('click', (e) => {
        e.stopPropagation();
        const aberto = perfilMenu.style.display === 'block';
        perfilMenu.style.display = aberto ? 'none' : 'block';
      });
      
      if (perfilFechar) {
        perfilFechar.addEventListener('click', () => { perfilMenu.style.display = 'none'; });
      }

      // Fecha ao clicar fora
      document.addEventListener('click', (e) => {
        if (!perfilMenu.contains(e.target) && !perfilBotao.contains(e.target)) {
          perfilMenu.style.display = 'none';
        }
      });
    }

    const btnTema = document.getElementById('btn-tema');
    if (btnTema && typeof alternarTema === 'function') {
      btnTema.addEventListener('click', alternarTema);
    }

    const btnSair = document.getElementById('btn-sair');
    const perfilSair = document.getElementById('perfil-sair');
    if (typeof terminarSessao === 'function') {
      if (btnSair) btnSair.addEventListener('click', terminarSessao);
      if (perfilSair) perfilSair.addEventListener('click', terminarSessao);
    }

    const perfilBotao = document.getElementById('perfil-botao');
    const perfilMenu = document.getElementById('perfil-menu');
    const perfilFechar = document.getElementById('perfil-fechar');
    if (perfilBotao && perfilMenu) {
      perfilBotao.addEventListener('click', () => perfilMenu.classList.add('visivel'));
      if (perfilFechar) perfilFechar.addEventListener('click', () => perfilMenu.classList.remove('visivel'));
      perfilMenu.addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('visivel');
      });
    }

    if (!document.getElementById('btn-menu-mobile')) {
      const btnMenu = document.createElement('button');
      btnMenu.id = 'btn-menu-mobile';
      btnMenu.setAttribute('aria-label', 'Alternar menu');
      btnMenu.innerHTML = '&#9776;';
      btnMenu.style.cssText = 'background:none;border:none;color:#fff;font-size:22px;cursor:pointer;padding:4px 8px;transition:color 0.2s;';
      const topbarLogo = document.querySelector('.topbar-logo');
      if (topbarLogo && topbarLogo.parentElement) {
        topbarLogo.parentElement.insertBefore(btnMenu, topbarLogo);
      }
      btnMenu.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-recolhida');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
