/**
 * supabase.js — Ligação à base de dados (Danmo Hub)
 * Wrapper mínimo por cima do REST API do Supabase (fetch puro, sem SDK externo).
 * MESMO padrão já usado e testado em danmo-billing e danmo-oficina.
 * Todas as aplicações do Hub usam ESTE ficheiro.
 * Última atualização: 2026-08-11
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

  /** Query avançada — aceita query-string PostgREST completa (filtros, order, limit, etc.) */
  async query(tabela, params = '') {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?${params}`;
    const r = await fetch(url, { headers: headers() });
    if (!r.ok) throw await r.json();
    return r.json();
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
  }
};

function headers() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };
}
