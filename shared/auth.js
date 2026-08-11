/**
 * auth.js — Autenticação unificada (Danmo Hub)
 * Todas as aplicações do Hub usam ESTE ficheiro.
 * Tabela real: 'utilizadores' (usuario, senha, nome, cargo, nivel, ativo)
 * Chave de sessão: dss_user (localStorage)
 * Última atualização: 2026-08-11
 */

const AUTH_KEY = 'dss_user';

/**
 * Verifica se há sessão válida no localStorage.
 * Retorna o objeto do utilizador ou null (nunca redireciona sozinha).
 */
function verificarSessao() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || !user.id) return null;
    return user;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

/**
 * Bloqueia o acesso à página se não autenticado — chamar no <head>.
 * Exemplo: const user = protegerPagina();
 */
function protegerPagina() {
  const user = verificarSessao();
  if (!user) {
    window.location.replace(caminhoLogin());
    return null;
  }
  return user;
}

/**
 * Calcula o caminho relativo para login.html consoante a profundidade da página
 * (usa o mesmo prefixo com que o próprio auth.js foi incluído).
 */
function caminhoLogin() {
  const script = document.currentScript || document.querySelector('script[src*="auth.js"]');
  const src = script ? script.getAttribute('src') : 'shared/auth.js';
  const prefixo = src.replace(/shared\/auth\.js.*$/, '');
  return prefixo + 'login.html';
}

/**
 * Inicia sessão — verifica código + senha na tabela 'utilizadores'.
 * Retorna { sucesso: true, utilizador } ou { sucesso: false, erro }
 */
async function iniciarSessao(codigo, senha) {
  try {
    const usuario = codigo.trim().toUpperCase();
    const resultado = await db.get('utilizadores', { usuario, senha });
    const utilizador = resultado[0];

    if (!utilizador || !utilizador.ativo) {
      return { sucesso: false, erro: 'Código ou senha incorretos.' };
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify(utilizador));
    return { sucesso: true, utilizador };
  } catch (err) {
    console.error('Erro ao iniciar sessão:', err);
    return { sucesso: false, erro: 'Erro de ligação. Tente novamente.' };
  }
}

/** Termina sessão e volta ao login. */
function terminarSessao() {
  localStorage.removeItem(AUTH_KEY);
  window.location.replace(caminhoLogin());
}

/** Obtém o utilizador atual (null se não logado). */
function obterUtilizador() {
  return verificarSessao();
}

/**
 * Verifica se o utilizador tem um dos níveis indicados.
 * Níveis reais: 'admin' | 'gestor' | 'operador'
 * Exemplo: temPermissao(['admin', 'gestor'])
 */
function temPermissao(niveisPermitidos) {
  const user = obterUtilizador();
  if (!user) return false;
  return niveisPermitidos.includes(user.nivel);
}
