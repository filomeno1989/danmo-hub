/**
 * faturacao.js - Ponte entre o módulo de Faturação e o núcleo do Hub
 * O billing original tinha o seu próprio auth.js e utils.js. No Hub:
 * - A sessão vem do login do Hub (guard.js + shared/auth.js, token no servidor);
 * - As funções utilitárias (fmtNum, fmtData, hoje, numPorExtenso,
 *   proximoNumero, abrirModal, fecharModal, setVal, getVal, confirmar)
 *   já existem no shared/utils.js do Hub com o mesmo nome;
 * - Aqui só se reconstrói o objeto "auth" que as páginas da Faturação
 *   conhecem, e o showToast mapeia para o toast do Hub.
 * Última atualização: 2026-09-22
 */

const auth = {
  /** Sessão atual do Hub (null se não houver) */
  getUser() {
    return verificarSessao();
  },

  /** Garante sessão e devolve o utilizador (o guard.js já validou no servidor) */
  require() {
    return protegerPagina();
  },

  logout() {
    terminarSessao();
  },

  isAdmin()    { const u = verificarSessao(); return !!u && u.nivel === 'admin'; },
  isGestor()   { const u = verificarSessao(); return !!u && ['admin', 'gestor'].includes(u.nivel); },
  isOperador() { return !!verificarSessao(); },

  /** Permissões por ação, no estilo que as páginas da Faturação já usavam.
      Admin tem sempre acesso; os restantes níveis seguem a matriz do Hub. */
  pode: {
    verDashboard()    { return pode('faturacao', 'ver'); },
    criarDocumento()  { return pode('faturacao', 'criar'); },
    editarDocumento() { return pode('faturacao', 'editar'); },
    apagarDocumento() { return pode('faturacao', 'apagar'); },
    verClientes()     { return pode('faturacao', 'ver'); },
    gerirClientes()   { return pode('faturacao', 'apagar'); },
    gerirTecnicos()   { return pode('faturacao', 'apagar'); },
    gerirUtilizadores() { return pode('faturacao', 'apagar'); }
  }
};

/** Os toasts da Faturação usavam os tipos success/error: mapear para os do Hub */
function showToast(msg, tipo) {
  const mapa = { success: 'sucesso', error: 'erro', info: 'info' };
  mostrarToast(msg, mapa[tipo] || 'sucesso');
}

/** Data local em AAAA-MM-DD (sem o salto da meia-noite do toISOString) */
function isoLocalFat(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
