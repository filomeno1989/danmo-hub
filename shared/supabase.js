/**
 * supabase.js - Ligação à base de dados (Danmo Hub)
 * Wrapper mínimo por cima do REST API do Supabase (fetch puro, sem SDK externo).
 * MESMO padrão já usado e testado em danmo-billing e danmo-oficina.
 * Todas as aplicações do Hub usam ESTE ficheiro.
 * Última atualização: 2026-09-16 (paginação estável no queryTudo)
 */

const SUPABASE_URL = 'https://czgnbzxoeylicrqjvncd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z25ienhvZXlsaWNycWp2bmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzcxNzcsImV4cCI6MjA5NDc1MzE3N30.g_msMjIqje6UtMf4Cy-eTodGlRKVWIa5Q0-9s5YpJJw';

const db = {

  /** Buscar registos com filtros simples { coluna: valor } (tudo eq.) */
  async get(tabela, filtros = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${tabela}?select=*`;
    for (const [col, val] of Object.entries(filtros)) {
      url += `&${col}=eq.${encodeURIComponent(val)}`;
    }
    const r = await fetch(url, { headers: headers() });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  /** Buscar um único registo (ou null) */
  async getOne(tabela, filtros = {}) {
    const lista = await this.get(tabela, filtros);
    return lista[0] || null;
  },

  /** Query avançada - aceita query-string PostgREST completa (filtros, order, limit, etc.) */
  async query(tabela, params = '') {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?${params}`;
    const r = await fetch(url, { headers: headers() });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  /**
   * Igual ao query(), mas traz a tabela TODA, em páginas.
   *
   * Porquê: o PostgREST devolve no máximo 1000 linhas por pedido. Num query()
   * simples com order=...asc, isso significa receber só as 1000 linhas MAIS
   * ANTIGAS - os registos recentes ficam de fora sem dar erro nenhum, o que
   * fazia colunas como "Foi à CDM em" aparecerem vazias para obras novas.
   * Aqui pedimos bloco a bloco (cabeçalho Range) até a tabela acabar.
   *
   * Detalhe importante: sem ORDER BY o Postgres não garante a mesma ordem
   * entre pedidos, o que podia duplicar/perder linhas entre páginas. Se o
   * params não trouxer "order=", acrescentamos order=id.asc aqui dentro
   * para a paginação ser sempre estável.
   */
  async queryTudo(tabela, params = '', tamanhoPagina = 1000) {
    if (!/(^|&)order=/.test(params)) {
      params += (params ? '&' : '') + 'order=id.asc';
    }
    const todas = [];
    let inicio = 0;
    // trava de segurança: no máximo 200 páginas (200 mil linhas)
    for (let i = 0; i < 200; i++) {
      const fim = inicio + tamanhoPagina - 1;
      const url = `${SUPABASE_URL}/rest/v1/${tabela}?${params}`;
      const r = await fetch(url, {
        headers: { ...headers(), 'Range-Unit': 'items', 'Range': `${inicio}-${fim}` }
      });
      if (!r.ok) throw await r.json();
      const bloco = await r.json();
      todas.push(...bloco);
      if (bloco.length < tamanhoPagina) break; // acabou a tabela
      inicio += tamanhoPagina;
    }
    return todas;
  },

  /** Criar um ou mais registos */
  async insert(tabela, dados) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}`, {
      method: 'POST',
      headers: { ...headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(dados)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  /** Atualizar registo por id */
  async update(tabela, id, dados) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers(), 'Prefer': 'return=representation' },
      body: JSON.stringify(dados)
    });
    if (!r.ok) throw await r.json();
    return r.json();
  },

  /** Apagar registo por id */
  async delete(tabela, id) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    if (!r.ok) throw await r.json();
    return true;
  },

  /** Contar registos que cumprem os filtros (usa header Prefer: count=exact) */
  async count(tabela, filtros = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${tabela}?select=id`;
    for (const [col, val] of Object.entries(filtros)) {
      url += `&${col}=eq.${encodeURIComponent(val)}`;
    }
    const r = await fetch(url, { headers: { ...headers(), 'Prefer': 'count=exact' } });
    if (!r.ok) throw await r.json();
    const range = r.headers.get('content-range'); // formato "0-24/137"
    return range ? parseInt(range.split('/')[1], 10) : (await r.json()).length;
  },

  /** Chamar uma função do servidor (RPC) criada no SQL Editor */
  async rpc(nome, params = {}) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(params)
    });
    if (!r.ok) {
      const erro = await r.json().catch(() => ({}));
      erro.status = r.status;
      throw erro;
    }
    const texto = await r.text();
    return texto ? JSON.parse(texto) : null;
  }
};

function headers() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
}
