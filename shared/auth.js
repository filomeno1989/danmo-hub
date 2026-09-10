/**
 * auth.js - Autenticação e permissões (Danmo Hub)
 * Todas as aplicações do Hub usam ESTE ficheiro.
 *
 * Como funciona:
 * - A senha nunca fica guardada em texto simples. O login chama a
 *   função "autenticar" no Supabase, que compara o hash bcrypt na base.
 * - Cada sessão tem um token com validade de 12 horas, guardado numa
 *   tabela própria. Ao desativar um utilizador, as sessões dele morrem
 *   de imediato.
 * - O guard.js (no <head> de cada página) valida a sessão no servidor
 *   e carrega a matriz de permissões para window.__DH__.
 * - pode(modulo, acao) decide se o utilizador atual pode fazer essa
 *   ação nesse módulo. O nível admin tem sempre acesso total.
 * Última atualização: 2026-09-10
 */

const AUTH_KEY = 'dss_user';

/* ============ Sessão local (leitura rápida) ============ */

function verificarSessao() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s || !s.token || !s.id) return null;
    if (s.expira_em && new Date(s.expira_em).getTime() < Date.now()) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return s;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

/** Obtém o utilizador atual (null se não houver sessão). */
function obterUtilizador() {
  return verificarSessao();
}

/**
 * Caminho relativo para login.html, consoante a profundidade da página
 * (usa o prefixo com que o próprio auth.js foi incluído).
 */
function caminhoLogin() {
  const script = document.currentScript || document.querySelector('script[src*="auth.js"]');
  const src = script ? script.getAttribute('src') : 'shared/auth.js';
  return src.replace(/shared\/auth\.js.*$/, '') + 'login.html';
}

/**
 * Legado: mantido para compatibilidade. A validação real acontece no
 * guard.js, que fala com o servidor. Aqui só se verifica a sessão local.
 */
function protegerPagina() {
  const s = verificarSessao();
  if (!s) {
    window.location.replace(caminhoLogin());
    return null;
  }
  return s;
}

/* ============ Permissões ============ */

/**
 * pode('oficina', 'criar') -> true/false
 * Admin tem sempre acesso total. Os outros níveis seguem a matriz
 * carregada pelo guard.js. Sem matriz carregada, só admin passa.
 */
function pode(modulo, acao) {
  const s = verificarSessao();
  if (!s) return false;
  if (s.nivel === 'admin') return true;
  const dh = window.__DH__;
  if (!dh || !dh.matriz) return false;
  const lista = dh.matriz;
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i];
    if (p.nivel === s.nivel && p.modulo === modulo && p.acao === acao) {
      return p.permitido === true;
    }
  }
  return false;
}

/** Legado: verificar níveis diretamente (ex.: temPermissao(['admin','gestor'])) */
function temPermissao(niveisPermitidos) {
  const s = obterUtilizador();
  return !!s && niveisPermitidos.includes(s.nivel);
}

/* ============ Entrar / Sair ============ */

/**
 * Inicia sessão com código (ex.: DM0069) + senha.
 * Retorna { sucesso: true, utilizador } ou { sucesso: false, erro }.
 */
async function iniciarSessao(codigo, senha) {
  try {
    const res = await db.rpc('autenticar', {
      p_usuario: String(codigo || '').trim().toUpperCase(),
      p_senha: String(senha || '')
    });
    if (!res || !res.token) {
      return { sucesso: false, erro: 'Não foi possível entrar. Tenta de novo.' };
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      token: res.token,
      expira_em: res.expira_em,
      id: res.utilizador.id,
      usuario: res.utilizador.usuario,
      nome: res.utilizador.nome,
      cargo: res.utilizador.cargo,
      nivel: res.utilizador.nivel,
      precisa_trocar: res.utilizador.precisa_trocar
    }));
    return { sucesso: true, utilizador: res.utilizador };
  } catch (err) {
    if (err && (err.code === 'PGRST202' || err.status === 404)) {
      return { sucesso: false, erro: 'O sistema está em atualização. Tenta dentro de momentos.' };
    }
    return { sucesso: false, erro: (err && err.message) || 'Erro de ligação. Tenta novamente.' };
  }
}

/** Troca da própria senha (primeiro acesso ou por vontade). */
async function trocarPropriaSenha(atual, nova) {
  const s = verificarSessao();
  if (!s) return { sucesso: false, erro: 'Sessão expirada. Entra de novo.' };
  try {
    await db.rpc('trocar_senha', {
      p_token: s.token,
      p_atual: String(atual || ''),
      p_nova: String(nova || '')
    });
    s.precisa_trocar = false;
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    return { sucesso: true };
  } catch (err) {
    return { sucesso: false, erro: (err && err.message) || 'Não foi possível trocar a senha.' };
  }
}

/** Termina a sessão no servidor e no browser, e volta ao login. */
async function terminarSessao() {
  const s = verificarSessao();
  if (s && typeof db !== 'undefined' && db.rpc) {
    try { await db.rpc('terminar_sessao', { p_token: s.token }); } catch (e) { /* segue */ }
  }
  localStorage.removeItem(AUTH_KEY);
  window.location.replace(caminhoLogin());
}
