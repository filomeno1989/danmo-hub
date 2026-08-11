/* ==========================================================================
   DANMO HUB — Utilitários (Partilhado)
   Só funções comuns a todos os módulos.
   Cada módulo pode ter o seu utils-local.js para funções específicas.
   ========================================================================== */

/* ---- MESES e DIAS (pt-MZ) ---- */
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_CURTOS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS_CURTOS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

/* ---- Formatar número (MZN / pt-MZ) ---- */
function fmtNum(n, decimais) {
  if (n === null || n === undefined || isNaN(n)) return '0,00';
  decimais = decimais !== undefined ? decimais : 2;
  return Number(n).toLocaleString('pt-MZ', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais
  });
}

/* ---- Formatar data (DD/MM/YYYY) ---- */
function fmtData(d) {
  if (!d) return '—';
  const dt = new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(dt)) return d;
  const p = v => String(v).padStart(2, '0');
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()}`;
}

/* ---- Formatar data e hora (DD/MM/YYYY HH:mm) ---- */
function fmtDataHora(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  const p = v => String(v).padStart(2, '0');
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)}/${dt.getFullYear()} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

/* ---- Data de hoje (YYYY-MM-DD) ---- */
function hoje() {
  const n = new Date();
  const p = v => String(v).padStart(2, '0');
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

/* ---- Calcular idade ---- */
function calcularIdade(dataNasc) {
  if (!dataNasc) return null;
  const nasc = new Date(dataNasc + 'T00:00:00');
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return Math.max(0, idade);
}

/* ---- Calcular tempo de serviço ---- */
function calcularTempoServico(dataAdmissao) {
  if (!dataAdmissao) return '—';
  const adm = new Date(dataAdmissao + 'T00:00:00');
  const agora = new Date();
  let anos = agora.getFullYear() - adm.getFullYear();
  let meses = agora.getMonth() - adm.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  if (anos < 0) return '< 1 mês';
  if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
  return `${anos}a ${meses}m`;
}

/* ---- Toast (notificação flutuante) ---- */
function showToast(msg, tipo) {
  tipo = tipo || 'info';
 let existente = document.getElementById('danmo-toast');
  if (existente) existente.remove();
  const t = document.createElement('div');
  t.id = 'danmo-toast';
  const cores = { sucesso: '#22c55e', erro: '#ef4444', alerta: '#f59e0b', info: '#3b82f6' };
  t.style.cssText = `position:fixed;bottom:24px;right:24px;padding:12px 20px;border-radius:10px;color:#fff;font-size:13px;font-weight:600;font-family:'Source Sans 3',sans-serif;z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.4);background:${cores[tipo] || cores.info};opacity:0;transform:translateY(10px);transition:all .3s ease;`;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; setTimeout(() => t.remove(), 300); }, 3500);
}

/* ---- Confirmação personalizada (resolve o bug do confirmar vs confirm) ---- */
function confirmar(msg) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99998;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--navy2, #0f2044);border:1px solid var(--border, #1e3a6e);border-radius:14px;padding:24px 28px;max-width:400px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.5);">
        <p style="color:var(--text, #e2e8f0);font-size:14px;font-weight:500;margin-bottom:20px;font-family:'Source Sans 3',sans-serif;line-height:1.5;">${msg}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end;">
          <button id="danmo-confirm-nao" style="padding:8px 18px;border-radius:8px;border:1px solid var(--border, #1e3a6e);background:var(--navy3, #1a3a6e);color:var(--text, #e2e8f0);font-weight:600;cursor:pointer;font-family:inherit;font-size:13px;">Cancelar</button>
          <button id="danmo-confirm-sim" style="padding:8px 18px;border-radius:8px;border:none;background:var(--amber, #f59e0b);color:#000;font-weight:700;cursor:pointer;font-family:inherit;font-size:13px;">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('danmo-confirm-sim').onclick  = () => { overlay.remove(); resolve(true); };
    document.getElementById('danmo-confirm-nao').onclick = () => { overlay.remove(); resolve(false); };
  });
}

/* ---- Modal abrir/fechar ---- */
function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}
function fecharModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/* ---- Set/Get valor de campo ---- */
function setVal(id, val) { const el = document.getElementById(id); if (el) el.value = val; }
function getVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }

/* ---- Abreviar nome ("João Manuel Silva" → "João M. Silva") ---- */
function abreviarNome(nome) {
  if (!nome) return '';
  const partes = nome.trim().split(/\s+/);
  if (partes.length <= 2) return nome;
  return partes[0] + ' ' + partes.slice(1, -1).map(p => p.charAt(0) + '.').join(' ') + ' ' + partes[partes.length - 1];
}

/* ---- Iniciais do nome ("Filomeno Alexandre" → "FA") ---- */
function iniciais(nome) {
  if (!nome) return '??';
  return nome.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('');
}

/* ---- Cor da badge por estado ---- */
function badgeCor(estado) {
  const map = {
    activo: '#22c55e', ativo: '#22c55e', true: '#22c55e',
    inativo: '#ef4444', false: '#ef4444',
    pendente: '#f59e0b', aberto: '#3b82f6', aberta: '#3b82f6',
    fechado: '#64748b', fechada: '#64748b',
    concluida: '#22c55e', liquidado: '#22c55e',
    parcial: '#f59e0b', anulado: '#ef4444',
    aprovado: '#22c55e', gozado: '#22c55e'
  };
  return map[String(estado).toLowerCase()] || '#64748b';
}

/* ---- Número por extenso (pt-MZ, até 999.999.999,99) ---- */
function numPorExtenso(valor) {
  const unidades = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
  const teens = ['dez','onze','doze','treze','quatorze','quinze','dezasseis','dezassete','dezoito','dezanove'];
  const dezenas = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const centenas = ['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

  function grupo(n) {
    if (n === 0) return '';
    if (n === 1) return 'um';
    let r = '';
    const c = Math.floor(n / 100), d = Math.floor((n % 100) / 10), u = n % 10;
    if (c > 0) r += centenas[c] + (c === 1 && d === 0 && u === 0 ? 'o' : ' e '.length ? ' e ' : '');
    if (n >= 10 && n <= 19) r += teens[n - 10];
    else if (d > 0) { r += dezenas[d]; if (u > 0) r += ' e ' + unidades[u]; }
    else if (u > 0) r += unidades[u];
    return r;
  }

  if (valor === 0) return 'zero';
  const neg = valor < 0;
  if (neg) valor = -valor;
  const inteiro = Math.floor(valor);
  const cents = Math.round((valor - inteiro) * 100);
  let ext = '';
  if (inteiro >= 1000000) {
    const m = Math.floor(inteiro / 1000000);
    ext += (m === 1 ? 'um milhão' : grupo(m) + ' milhões');
    if (inteiro % 1000000 > 0) ext += ' e ';
  }
  if (inteiro % 1000000 >= 1000) {
    const m = Math.floor((inteiro % 1000000) / 1000);
    ext += (m === 1 ? 'um mil' : grupo(m) + ' mil');
    if (inteiro % 1000 > 0) ext += ' e ';
  }
  if (inteiro % 1000 > 0) ext += grupo(inteiro % 1000);
  if (neg) ext = 'menos ' + ext;
  ext = ext.charAt(0).toUpperCase() + ext.slice(1);
  if (cents > 0) ext += ' e ' + grupo(cents) + (cents === 1 ? ' cêntimo' : ' cêntimos');
  return ext;
}

/* ---- Alias para compatibilidade com módulos antigos ---- */
const mostrarToast  = showToast;
const formatarData  = fmtData;
const formatarDataHora = fmtDataHora;
const dataHoje      = hoje;
const mostrarCarregando = (msg) => showToast(msg || 'A carregar...', 'info');
