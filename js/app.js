(function () {
  const API = window.SUJUMI.API, K = 'sujumi_token', U = 'sujumi_usuario';
  const token = localStorage.getItem(K);
  if (!token) { window.S = null; location.replace('sujumi-login.html'); return; }
  let user = null; try { user = JSON.parse(localStorage.getItem(U)); } catch (e) {}
  const logout = () => { localStorage.removeItem(K); localStorage.removeItem(U); location.replace('sujumi-login.html'); };
  async function api(path, o = {}) {
    const h = { Authorization: 'Bearer ' + token };
    if (o.body) { h['Content-Type'] = 'application/json'; o = { ...o, body: JSON.stringify(o.body) }; }
    let r; try { r = await fetch(API + path, { ...o, headers: h }); } catch (e) { throw new Error('No se pudo conectar con el servidor'); }
    if (r.status === 401) { logout(); throw new Error('Sesión expirada'); }
    const d = r.status === 204 ? null : await r.json().catch(() => null);
    if (!r.ok) throw new Error((d && d.error) || 'Error ' + r.status);
    return d;
  }
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => (n === null || n === undefined || n === '' || isNaN(n)) ? '—' : 'RD$ ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => iso(new Date());
  const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const fdate = s => s ? String(s).slice(0, 10).split('-').reverse().join('/') : '—';
  const hours = (a, b) => { if (!a || !b) return 0; const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); let e = h2 * 60 + m2, s = h1 * 60 + m1; if (e < s) e += 1440; return (e - s) / 60; };
  function toast(msg, type) {
    const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 4200);
  }
  function nav() {
    const page = location.pathname.split('/').pop() || 'sujumi-dashboard.html';
    let cur = page;
    if (page.includes('tarifas')) { const h = location.hash.slice(1); cur += '#' + (['vehiculos', 'transportistas'].includes(h) ? h : 'hora-km'); }
    document.querySelectorAll('.sidebar a.nav-item[href]').forEach(a => a.classList.toggle('active', a.getAttribute('href') === cur));
  }
  function init() {
    const g = id => document.getElementById(id), name = (user && user.usuario) || '';
    g('uName').textContent = name; g('uAv').textContent = name.slice(0, 2).toUpperCase();
    g('uRole').textContent = user && user.rol === 'admin_costeo' ? 'Administrador' : (user && user.rol) || '';
    g('logout').onclick = e => { e.preventDefault(); logout(); };
    nav(); window.addEventListener('hashchange', nav);
  }
  window.S = { user, api, esc, money, today, addDays, fdate, hours, toast, init, logout };
})();
