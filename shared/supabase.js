/* ==========================================================================
   DANMO HUB — Supabase REST Client (Partilhado)
   Wrapper leve usando fetch() nativo — PostgREST
   Único ficheiro de ligação à BD para todos os módulos.
   ========================================================================== */

const SUPABASE_URL  = 'https://czgnbzxoeylicrqjvncd.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Z25ienhvZXlsaWNycWp2bmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzcxNzcsImV4cCI6MjA5NDc1MzE3N30.CJcQ_y_YkVNMdXLo2Yt0NvlDQmKSuXpz6JkcnPD1n-Y';

const db = {

  /* ---- HEADERS ---- */
  headers() {
    return {
      'apikey':        SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation'
    };
  },

  /* ---- GET (com filtros opcionais) ---- */
  async get(tabela, filtros) {
    const base = `${SUPABASE_URL}/rest/v1/${tabela}`;
    let url = base + '?select=*';
    if (filtros && typeof filtros === 'object' && !Array.isArray(filtros)) {
      for (const [k, v] of Object.entries(filtros)) {
        url += `&${k}=eq.${encodeURIComponent(v)}`;
      }
    } else if (typeof filtros === 'string') {
      url += '&' + filtros;
    }
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`GET ${tabela}: ${res.status}`);
    return res.json();
  },

  /* ---- QUERY (filtros como string PostgREST) ---- */
  async query(tabela, params) {
    const base = `${SUPABASE_URL}/rest/v1/${tabela}`;
    const url = params ? `${base}?${params}` : base + '?select=*';
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`QUERY ${tabela}: ${res.status}`);
    return res.json();
  },

  /* ---- GET ONE (primeiro resultado) ---- */
  async getOne(tabela, filtros) {
    const base = `${SUPABASE_URL}/rest/v1/${tabela}`;
    let url = base + '?select=*&limit=1';
    if (filtros && typeof filtros === 'object') {
      for (const [k, v] of Object.entries(filtros)) {
        url += `&${k}=eq.${encodeURIComponent(v)}`;
      }
    } else if (typeof filtros === 'string') {
      url += '&' + filtros;
    }
    const res = await fetch(url, { headers: this.headers() });
    if (!res.ok) throw new Error(`GETONE ${tabela}: ${res.status}`);
    const data = await res.json();
    return data.length ? data[0] : null;
  },

  /* ---- INSERT ---- */
  async insert(tabela, dados) {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error(`INSERT ${tabela}: ${res.status}`);
    return res.json();
  },

  /* ---- UPDATE (por ID) ---- */
  async update(tabela, id, dados) {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(dados)
    });
    if (!res.ok) throw new Error(`UPDATE ${tabela}: ${res.status}`);
    return res.json();
  },

  /* ---- DELETE (por ID) ---- */
  async delete(tabela, id) {
    const url = `${SUPABASE_URL}/rest/v1/${tabela}?id=eq.${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headers()
    });
    if (!res.ok) throw new Error(`DELETE ${tabela}: ${res.status}`);
    return true;
  },

  /* ---- COUNT (sem transferir dados) ---- */
  async count(tabela, filtros) {
    let url = `${SUPABASE_URL}/rest/v1/${tabela}?select=*&head=true`;
    if (filtros && typeof filtros === 'string') {
      url += '&' + filtros;
    } else if (filtros && typeof filtros === 'object') {
      for (const [k, v] of Object.entries(filtros)) {
        url += `&${k}=eq.${encodeURIComponent(v)}`;
      }
    }
    const res = await fetch(url, {
      headers: {
        ...this.headers(),
        'Prefer': 'count=exact',
        'Range': '0-0'
      }
    });
    if (!res.ok) return 0;
    const range = res.headers.get('content-range');
    if (!range) return 0;
    return parseInt(range.split('/')[1], 10) || 0;
  }

};
