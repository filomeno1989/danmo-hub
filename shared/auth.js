/**
 * auth.js — Autenticação unificada (Danmo Hub)
 * Todas as 7 aplicações usam ESTE ficheiro.
 * Chave de sessão única: dss_user
 * Última atualização: 2026-08-11
 */

const AUTH_KEY = 'dss_user';

/**
 * Guarda de autenticação — chamar no <head> de cada página protegida.
 * Se não houver sessão válida, redireciona para login.html.
 * Retorna o objeto do utilizador ou null.
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
 * Bloqueia o render da página se não autenticado.
 * Exemplo: var user = protegerPagina();
 * Retorna o utilizador logado ou null (e redireciona).
 */
function protegerPagina() {
  const user = verificarSessao();
  if (!user) {
    window.location.replace('login.html');
    return null;
  }
  return user;
}

/**
 * Iniciar sessão — verifica credenciais na tabela 'users' do Supabase.
 * Retorna { sucesso: true, utilizador: {...} } ou { sucesso: false, erro: '...' }
 */
async function iniciarSessao(email, senha) {
  try {
    const { data: utilizador, error } = await db
      .from('users')
      .select('id, name, email, role, department, active')
      .eq('email', email.trim().toLowerCase())
      .eq('password', senha)
      .eq('active', true)
      .single();

    if (error || !utilizador) {
      return { sucesso: false, erro: 'E-mail ou senha incorretos.' };
    }

    /* Guardar sessão (sem guardar a senha) */
    localStorage.setItem(AUTH_KEY, JSON.stringify(utilizador));
    return { sucesso: true, utilizador };
  } catch (err) {
    console.error('Erro ao iniciar sessão:', err);
    return { sucesso: false, erro: 'Erro de ligação. Tente novamente.' };
  }
}

/**
 * Terminar sessão — limpa localStorage e redireciona.
 */
function terminarSessao() {
  localStorage.removeItem(AUTH_KEY);
  window.location.replace('login.html');
}

/**
 * Obtém o utilizador atual (null se não logado).
 */
function obterUtilizador() {
  return verificarSessao();
}

/**
 * Verifica se o utilizador tem uma das roles indicadas.
 * Exemplo: temPermissao(['admin', 'gestor'])
 */
function temPermissao(rolesPermitidas) {
  const user = obterUtilizador();
  if (!user) return false;
  return rolesPermitidas.includes(user.role);
}
