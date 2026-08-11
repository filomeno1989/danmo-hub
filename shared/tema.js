/* ==========================================================================
   DANMO HUB — Gestor de Temas (Partilhado)
   5 temas de cor × 2 modos (escuro/claro)
   Chaves unificadas: danmo_tema_cor, danmo_tema_modo
   ========================================================================== */

const tema = (() => {

  const KEY_COR  = 'danmo_tema_cor';
  const KEY_MODO = 'danmo_tema_modo';

  /* ---- Paleta de cada tema (modo escuro) ---- */
  const TEMAS = {
    oceano: {
      label: 'Oceano',
      icon: '\u{1F535}',
      escuro: { navy: '#0a1628', navy2: '#0f2044', navy3: '#1a3a6e', amber: '#f59e0b', amber2: '#d97706' },
      claro:  { navy: '#f0f4f8', navy2: '#ffffff', navy3: '#e2e8f0', amber: '#d97706', amber2: '#b45309' }
    },
    floresta: {
      label: 'Floresta',
      icon: '\u{1F7E2}',
      escuro: { navy: '#0a1f0f', navy2: '#0f2f18', navy3: '#1a4a25', amber: '#22c55e', amber2: '#16a34a' },
      claro:  { navy: '#f0faf4', navy2: '#ffffff', navy3: '#dcfce7', amber: '#16a34a', amber2: '#15803d' }
    },
    roxo: {
      label: 'Roxo',
      icon: '\u{1F7E3}',
      escuro: { navy: '#1a0a2e', navy2: '#251040', navy3: '#3b1a60', amber: '#a855f7', amber2: '#9333ea' },
      claro:  { navy: '#faf5ff', navy2: '#ffffff', navy3: '#f3e8ff', amber: '#9333ea', amber2: '#7e22ce' }
    },
    carvao: {
      label: 'Carvao',
      icon: '\u26AB',
      escuro: { navy: '#111111', navy2: '#1a1a1a', navy3: '#2a2a2a', amber: '#a1a1aa', amber2: '#71717a' },
      claro:  { navy: '#f4f4f5', navy2: '#ffffff', navy3: '#e4e4e7', amber: '#71717a', amber2: '#52525b' }
    },
    rubi: {
      label: 'Rubi',
      icon: '\u{1F534}',
      escuro: { navy: '#2a0a0a', navy2: '#3f1010', navy3: '#5a1a1a', amber: '#ef4444', amber2: '#dc2626' },
      claro:  { navy: '#fef2f2', navy2: '#ffffff', navy3: '#fee2e2', amber: '#dc2626', amber2: '#b91c1c' }
    }
  };

  /* ---- Valores fixos por modo ---- */
  const MODO_VALORES = {
    escuro: {
      white: '#f1f5f9', light: '#e2e8f0', steel: '#94a3b8', steel2: '#64748b',
      border: '#1e3a6e', card: 'rgba(255,255,255,0.04)', text: '#e2e8f0', text2: '#94a3b8'
    },
    claro: {
      white: '#1e293b', light: '#334155', steel: '#475569', steel2: '#64748b',
      border: '#cbd5e1', card: 'rgba(0,0,0,0.04)', text: '#1e293b', text2: '#475569'
    }
  };

  /* ---- Aplicar tema ao DOM ---- */
  function aplicar(cor, modo) {
    const t = TEMAS[cor] || TEMAS.oceano;
    const m = MODO_VALORES[modo] || MODO_VALORES.escuro;
    const c = t[modo] || t.escuro;
    const r = document.documentElement;
    r.style.setProperty('--navy',   c.navy);
    r.style.setProperty('--navy2',  c.navy2);
    r.style.setProperty('--navy3',  c.navy3);
    r.style.setProperty('--amber',  c.amber);
    r.style.setProperty('--amber2', c.amber2);
    for (const [k, v] of Object.entries(m)) {
      r.style.setProperty('--' + k, v);
    }
  }

  /* ---- Ler preferência ---- */
  function getCor()  { return localStorage.getItem(KEY_COR) || 'oceano'; }
  function getModo() { return localStorage.getItem(KEY_MODO) || 'escuro'; }

  /* ---- Definir preferência ---- */
  function setCor(cor) {
    localStorage.setItem(KEY_COR, cor);
    aplicar(cor, getModo());
  }
  function setModo(modo) {
    localStorage.setItem(KEY_MODO, modo);
    aplicar(getCor(), modo);
  }
  function toggleModo() {
    setModo(getModo() === 'escuro' ? 'claro' : 'escuro');
  }

  /* ---- Inicialização automática ---- */
  function init() {
    aplicar(getCor(), getModo());
  }

  /* ---- Gerar painel flutuante de temas ---- */
  function criarPainel() {
    if (document.getElementById('tema-painel')) return;
    const painel = document.createElement('div');
    painel.id = 'tema-painel';
    painel.innerHTML = `
      <div id="tema-painel-btn" title="Tema" style="cursor:pointer;padding:6px 10px;border-radius:8px;background:var(--navy2);border:1px solid var(--border);color:var(--amber);font-size:16px;line-height:1;">\u{1F3A8}</div>
      <div id="tema-painel-body" style="display:none;position:absolute;top:42px;right:0;width:200px;background:var(--navy2);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:0 8px 24px rgba(0,0,0,.4);z-index:9999;">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--steel);margin-bottom:8px;">Cores</div>
        <div id="tema-cores" style="display:flex;gap:6px;margin-bottom:12px;"></div>
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--steel);margin-bottom:6px;">Modo</div>
        <div id="tema-modos" style="display:flex;gap:6px;"></div>
      </div>
    `;
    painel.style.cssText = 'position:relative;display:inline-block;';
    document.body.appendChild(painel);

    /* Cores */
    const coresEl = document.getElementById('tema-cores');
    for (const [id, t] of Object.entries(TEMAS)) {
      const btn = document.createElement('button');
      btn.textContent = t.icon;
      btn.title = t.label;
      btn.style.cssText = 'width:28px;height:28px;border-radius:8px;border:2px solid var(--border);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;background:var(--navy);';
      if (id === getCor()) btn.style.borderColor = 'var(--amber)';
      btn.onclick = () => {
        setCor(id);
        coresEl.querySelectorAll('button').forEach(b => b.style.borderColor = 'var(--border)');
        btn.style.borderColor = 'var(--amber)';
      };
      coresEl.appendChild(btn);
    }

    /* Modos */
    const modosEl = document.getElementById('tema-modos');
    const modos = [{ id: 'escuro', label: '\u{1F319} Escuro' }, { id: 'claro', label: '\u2600\uFE0F Claro' }];
    modos.forEach(m => {
      const btn = document.createElement('button');
      btn.textContent = m.label;
      btn.style.cssText = 'flex:1;padding:6px 8px;border-radius:8px;border:1px solid var(--border);cursor:pointer;font-size:11px;font-weight:600;background:var(--navy);color:var(--text);font-family:inherit;';
      if (m.id === getModo()) btn.style.borderColor = 'var(--amber)';
      btn.onclick = () => {
        setModo(m.id);
        modosEl.querySelectorAll('button').forEach(b => b.style.borderColor = 'var(--border)');
        btn.style.borderColor = 'var(--amber)';
      };
      modosEl.appendChild(btn);
    });

    /* Toggle painel */
    document.getElementById('tema-painel-btn').onclick = () => {
      const body = document.getElementById('tema-painel-body');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };

    /* Fechar ao clicar fora */
    document.addEventListener('click', e => {
      if (!painel.contains(e.target)) {
        document.getElementById('tema-painel-body').style.display = 'none';
      }
    });
  }

  return { init, getCor, getModo, setCor, setModo, toggleModo, aplicar, criarPainel, TEMAS };

})();

/* Auto-init */
tema.init();
