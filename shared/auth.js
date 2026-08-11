/* ==========================================================================
   DANMO HUB — Autenticação (Partilhado)
   Sessão única para todos os módulos — chave: danmo_hub_user
   Tabelas: utilizadores (login), collaborators (dados do utilizador)
   ========================================================================== */

const AUTH = (() => {

  /* ---- Chave unificada de sessão (todos os módulos) ---- */
  const SESSION_KEY = 'danmo_hub_user';
  let _user = null;

  /* ---- Inicializar sessão a partir do sessionStorage ---- */
  function init() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        _user = JSON.parse(raw);
        return true;
      }
    } catch (e) { /* ignorar */ }
    return false;
  }

  /* ---- Login ---- */
  async function login(usuario, senha) {
    const users = await db.get('utilizadores', { usuario, senha, ativo: true });
    if (!users || users.length === 0) return null;
    const user = users[0];
    _user = {
      id:      user.id,
      nome:    user.nome,
      usuario: user.usuario,
      cargo:   user.cargo || '',
      nivel:   user.nivel || 'operador'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(_user));
    return _user;
  }

  /* ---- Logout ---- */
  function logout() {
    _user = null;
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = typeof HUB_BASE !== 'undefined' ? HUB_BASE + 'index.html' : 'index.html';
  }

  /* ---- Utilizador actual ---- */
  function getUser()  { return _user; }
  function nome()     { return _user ? _user.nome : ''; }
  function nivel()    { return _user ? _user.nivel : ''; }
  function id()       { return _user ? _user.id : null; }
  function usuario()  { return _user ? _user.usuario : ''; }
  function isLogged() { return _user !== null; }

  /* ---- Verificações de nível ---- */
  function isAdmin()   { return _user && _user.nivel === 'admin'; }
  function isGestor()  { return _user && (_user.nivel === 'admin' || _user.nivel === 'gestor'); }

  /* ---- Exigir autenticação (redireciona se não logado) ---- */
  function exigir(niveisPermitidos) {
    if (!isLogged()) {
      window.location.href = typeof HUB_BASE !== 'undefined' ? HUB_BASE + 'index.html' : 'index.html';
      return false;
    }
    if (niveisPermitidos && Array.isArray(niveisPermitidos)) {
      if (!niveisPermitidos.includes(_user.nivel)) {
        alert('Sem permissão para aceder a esta página.');
        logout();
        return false;
      }
    }
    return true;
  }

  return { init, login, logout, getUser, nome, nivel, id, usuario, isLogged, isAdmin, isGestor, exigir };

})();

/* Auto-inicializar */
AUTH.init();
