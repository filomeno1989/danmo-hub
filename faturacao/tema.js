/**
 * tema.js - Cores do conteúdo da Faturação (Danmo Hub)
 * O modo claro/escuro vem do Hub (data-tema no <html>, botão da lua na topbar).
 * A cor de destaque é escolhida na Faturação e fica guardada neste navegador.
 */
(function () {
  'use strict';

  var TEMAS_FAT = {
    oceano:   { escuro:{ primary:'#0a1628', primary2:'#0f2040', primary3:'#162d55', accent:'#f59e0b', accent2:'#d97706' }, claro:{ primary:'#dbeafe', primary2:'#eff6ff', primary3:'#bfdbfe', accent:'#1d4ed8', accent2:'#1e40af' } },
    floresta: { escuro:{ primary:'#052e16', primary2:'#14532d', primary3:'#166534', accent:'#4ade80', accent2:'#16a34a' }, claro:{ primary:'#dcfce7', primary2:'#f0fdf4', primary3:'#bbf7d0', accent:'#15803d', accent2:'#166534' } },
    roxo:     { escuro:{ primary:'#1e0a3c', primary2:'#2e1065', primary3:'#3b0764', accent:'#c084fc', accent2:'#a855f7' }, claro:{ primary:'#f3e8ff', primary2:'#faf5ff', primary3:'#e9d5ff', accent:'#7e22ce', accent2:'#6b21a8' } },
    carvao:   { escuro:{ primary:'#0a0a0a', primary2:'#171717', primary3:'#262626', accent:'#f59e0b', accent2:'#d97706' }, claro:{ primary:'#f5f5f5', primary2:'#fafafa', primary3:'#e5e5e5', accent:'#374151', accent2:'#1f2937' } },
    rubi:     { escuro:{ primary:'#1c0a0a', primary2:'#3b0f0f', primary3:'#7f1d1d', accent:'#fca5a5', accent2:'#ef4444' }, claro:{ primary:'#fee2e2', primary2:'#fff1f2', primary3:'#fecaca', accent:'#b91c1c', accent2:'#991b1b' } }
  };

  var CHAVE_COR = 'fat_tema_cor';

  function corAtual() {
    try { return localStorage.getItem(CHAVE_COR) || 'oceano'; } catch (e) { return 'oceano'; }
  }

  function aplicar() {
    var t = TEMAS_FAT[corAtual()];
    if (!t) return;
    var escuro = (document.documentElement.getAttribute('data-tema') || 'claro') === 'escuro';
    var v = escuro ? t.escuro : t.claro;
    var r = document.documentElement.style;
    r.setProperty('--navy',  v.primary);
    r.setProperty('--navy2', v.primary2);
    r.setProperty('--navy3', v.primary3);
    r.setProperty('--amber', v.accent);
    r.setProperty('--amber2', v.accent2);
    if (escuro) {
      r.setProperty('--white', '#f8fafc');
      r.setProperty('--light', '#e2e8f0');
      r.setProperty('--steel', '#94a3b8');
      r.setProperty('--steel2', '#64748b');
      r.setProperty('--border', 'rgba(148,163,184,0.2)');
      r.setProperty('--card', 'rgba(15,32,64,0.85)');
    } else {
      r.setProperty('--white', '#1a1a1a');
      r.setProperty('--light', '#374151');
      r.setProperty('--steel', '#4b5563');
      r.setProperty('--steel2', '#6b7280');
      r.setProperty('--border', 'rgba(0,0,0,0.12)');
      r.setProperty('--card', 'rgba(255,255,255,0.92)');
    }
  }

  /** Troca a cor de destaque da Faturação (para usar mais tarde, se precisar) */
  window.fatMudarCor = function (cor) {
    try { localStorage.setItem(CHAVE_COR, cor); } catch (e) {}
    aplicar();
  };

  /* O tema do Hub muda no <html data-tema>: quando muda, repintar a faturação */
  try {
    new MutationObserver(function () { aplicar(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  } catch (e) {}

  aplicar();
})();
