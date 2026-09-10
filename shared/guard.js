/**
 * guard.js - Porta de entrada de todas as páginas (Danmo Hub)
 *
 * Colocar no <head> da página:
 *   <script src="../shared/guard.js" data-modulo="oficina"></script>
 *
 * O que faz:
 * 1. Esconde a página até confirmar a sessão no servidor (nada pisca);
 * 2. Sem sessão válida: manda para o login;
 * 3. Sem permissão "ver" para o módulo da página: mostra "Sem acesso";
 * 4. Primeiro acesso com senha temporária: manda trocar a senha;
 * 5. Se as funções do servidor ainda não existirem (SQL por correr),
 *    mostra aviso de atualização em vez de deixar entrar.
 *
 * Este ficheiro é autónomo: não depende de outros scripts.
 * Última atualização: 2026-09-10
 */
(function () {
  'use strict';

  var MODULO = (document.currentScript && document.currentScript.getAttribute('data-modulo')) || '';

  /* Mesmo projeto do shared/supabase.js (mantidos iguais) */
  var SUPABASE_URL = 'https://czgnbzxoeylicrqjvncd.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z25ienhvZXlsaWNycWp2bmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzcxNzcsImV4cCI6MjA5NDc1MzE3N30.g_msMjIqje6UtMf4Cy-eTodGlRKVWIa5Q0-9s5YpJJw';

  function base() {
    var src = (document.currentScript && document.currentScript.getAttribute('src')) || 'shared/guard.js';
    return src.replace(/shared\/guard\.js.*$/, '');
  }

  function irLogin(motivo) {
    var url = base() + 'login.html';
    if (motivo) url += '?motivo=' + encodeURIComponent(motivo);
    window.location.replace(url);
  }

  /* Verificação de permissões, também usada por outras páginas via window.dhPode */
  window.dhPode = function (modulo, acao) {
    var dh = window.__DH__;
    var raw = null;
    try { raw = localStorage.getItem('dss_user'); } catch (e) { return false; }
    if (!raw) return false;
    var s;
    try { s = JSON.parse(raw); } catch (e) { return false; }
    if (!s || !s.id) return false;
    if (s.nivel === 'admin') return true;
    if (!dh || !dh.matriz) return false;
    for (var i = 0; i < dh.matriz.length; i++) {
      var p = dh.matriz[i];
      if (p.nivel === s.nivel && p.modulo === modulo && p.acao === acao) {
        return p.permitido === true;
      }
    }
    return false;
  };

  /* Esconde a página inteira até a validação terminar */
  document.documentElement.style.visibility = 'hidden';

  function revelar() {
    document.documentElement.style.visibility = '';
    try { document.dispatchEvent(new CustomEvent('dh:autorizado')); } catch (e) {}
  }

  /* Ecrã a ecrã inteiro (sem acesso / atualização / sem ligação) */
  function ecra(titulo, texto, botaoLabel, botaoAcao) {
    document.documentElement.style.visibility = '';
    function montar() {
      if (!document.body) { setTimeout(montar, 30); return; }
      while (document.body.firstChild) document.body.removeChild(document.body.firstChild);
      var box = document.createElement('div');
      box.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;' +
        'background:#0B1F3A;font-family:system-ui,Segoe UI,Arial,sans-serif;padding:24px;';
      box.innerHTML =
        '<div style="background:#FFFFFF;border-radius:14px;max-width:420px;width:100%;' +
        'padding:36px 30px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.35);">' +
        '<div style="font-size:40px;margin-bottom:10px;">&#128274;</div>' +
        '<h1 style="margin:0 0 8px;font-size:1.15rem;color:#0B1F3A;">' + titulo + '</h1>' +
        '<p style="margin:0 0 22px;color:#5B6B84;font-size:.92rem;line-height:1.5;">' + texto + '</p>' +
        (botaoLabel
          ? '<button id="dh-guard-btn" style="background:#F59E0B;color:#0B1F3A;font-weight:700;' +
            'border:0;border-radius:9px;padding:11px 22px;cursor:pointer;font-size:.95rem;">' +
            botaoLabel + '</button>'
          : '') +
        '</div>';
      document.body.appendChild(box);
      var b = document.getElementById('dh-guard-btn');
      if (b) b.addEventListener('click', botaoAcao || function () { window.location.reload(); });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', montar);
    } else {
      montar();
    }
  }

  /* ===== Validação ===== */

  var raw = null;
  try { raw = localStorage.getItem('dss_user'); } catch (e) {}
  var sessao = null;
  try { sessao = raw ? JSON.parse(raw) : null; } catch (e) { sessao = null; }

  if (!sessao || !sessao.token) { irLogin(''); return; }

  if (sessao.expira_em && new Date(sessao.expira_em).getTime() < Date.now()) {
    try { localStorage.removeItem('dss_user'); } catch (e) {}
    irLogin('expirada');
    return;
  }

  fetch(SUPABASE_URL + '/rest/v1/rpc/validar_sessao', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_token: sessao.token })
  })
    .then(function (r) {
      if (r.status === 404) {
        /* A função validar_sessao ainda não existe: SQL do módulo por correr */
        return { __manutencao: true };
      }
      return r.json();
    })
    .then(function (res) {
      if (res && res.__manutencao) {
        ecra('Sistema em atualização',
          'As funções de acesso ainda não foram instaladas na base de dados. ' +
          'Volta a tentar dentro de momentos.',
          'Tentar de novo', function () { window.location.reload(); });
        return;
      }

      if (!res || res.valido !== true) {
        var motivo = (res && res.motivo) || '';
        try { localStorage.removeItem('dss_user'); } catch (e) {}
        if (motivo === 'bloqueado') {
          ecra('Sistema bloqueado',
            'O acesso está suspenso temporariamente pela administração. Volta mais tarde.',
            'Voltar ao login', function () { irLogin(''); });
        } else {
          irLogin(motivo);
        }
        return;
      }

      var u = res.utilizador;
      window.__DH__ = { utilizador: u, matriz: res.matriz || [] };
      try {
        localStorage.setItem('dss_user', JSON.stringify({
          token: sessao.token,
          expira_em: sessao.expira_em,
          id: u.id,
          usuario: u.usuario,
          nome: u.nome,
          cargo: u.cargo,
          nivel: u.nivel,
          precisa_trocar: u.precisa_trocar
        }));
      } catch (e) {}

      if (u.precisa_trocar) {
        window.location.replace(base() + 'login.html?trocar=1');
        return;
      }

      if (MODULO && !window.dhPode(MODULO, 'ver')) {
        ecra('Sem acesso a esta área',
          'O teu perfil não tem permissão para abrir este módulo. Fala com a administração se achas que é um erro.',
          'Voltar ao Painel', function () { window.location.replace(base() + 'index.html'); });
        return;
      }

      revelar();
    })
    .catch(function () {
      ecra('Sem ligação ao servidor',
        'Não foi possível confirmar a tua sessão. Verifica a internet e tenta de novo.',
        'Tentar de novo', function () { window.location.reload(); });
    });
})();
