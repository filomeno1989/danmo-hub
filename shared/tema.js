/**
 * tema.js — Tema claro/escuro unificado (Danmo Hub)
 * Todas as 7 aplicações usam ESTE ficheiro.
 * Chave única no localStorage: dss_tema
 * Última atualização: 2026-08-11
 */

const TEMA_KEY = 'dss_tema';

/**
 * Inicia o tema ao carregar a página.
 * Deve ser chamado no <head> ou no DOMContentLoaded.
 */
function iniciarTema() {
  const tema = localStorage.getItem(TEMA_KEY) || 'claro';
  document.documentElement.setAttribute('data-tema', tema);
  atualizarIconeTema(tema);
}

/**
 * Alterna entre 'claro' e 'escuro'.
 */
function alternarTema() {
  const atual = document.documentElement.getAttribute('data-tema') || 'claro';
  const novo = atual === 'claro' ? 'escuro' : 'claro';
  document.documentElement.setAttribute('data-tema', novo);
  localStorage.setItem(TEMA_KEY, novo);
  atualizarIconeTema(novo);
}

/**
 * Atualiza o ícone do botão de tema (se existir no DOM).
 */
function atualizarIconeTema(tema) {
  const btn = document.getElementById('btn-tema');
  if (!btn) return;
  btn.innerHTML = tema === 'escuro'
    ? '<i class="icon-sun"></i>'
    : '<i class="icon-moon"></i>';
  btn.setAttribute('aria-label', tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro');
}

/* Auto-iniciar tema imediatamente (antes do render) */
iniciarTema();
