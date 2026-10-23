/* =========================================================
   AssetCare — app.js
   Auth + localStorage data layer + UI rendering (all pages)
   ========================================================= */

const AUTH_KEY   = 'ac_auth';
const K_ASSETS   = 'ac_assets';
const K_ISSUES   = 'ac_issues';
const K_TECHS    = 'ac_technicians';
const K_MAINT    = 'ac_maintenance';
const K_NOTIFS   = 'ac_notifications';
const K_SETTINGS = 'ac_settings';
const K_USERS    = 'ac_users';

const DEMO_USERS = [
  { email:'admin@assetcare.demo', password:'admin123', name:'Ayesha Siddiqui', role:'Administrator' },
  { email:'tech@assetcare.demo',  password:'tech123',  name:'Hamza Tariq',     role:'Technician' }
];

/* ---------------------------------------------------------
   AUTH
--------------------------------------------------------- */

function getAuth(){
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
  catch(e){ return null; }
}

function setAuth(obj){ localStorage.setItem(AUTH_KEY, JSON.stringify(obj)); }
function clearAuth(){ localStorage.removeItem(AUTH_KEY); }

function getSignedUpUsers(){
  try { return JSON.parse(localStorage.getItem(K_USERS)) || []; }
  catch(e){ return []; }
}
function setSignedUpUsers(list){ localStorage.setItem(K_USERS, JSON.stringify(list)); }

function requireAuth(){
  const auth = getAuth();
  if (!auth || !auth.loggedIn) window.location.href = 'login.html';
}

function attemptLogin(name, email, password, remember){
  const cleanEmail = String(email).trim().toLowerCase();

  const demoMatch = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (demoMatch) {
    const displayName = (name && name.trim()) ? name.trim() : demoMatch.name;
    setAuth({ loggedIn:true, email:demoMatch.email, name:displayName, role:demoMatch.role, remember: !!remember });
    return true;
  }

  const signedUpMatch = getSignedUpUsers().find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
  if (signedUpMatch) {
    const displayName = (name && name.trim()) ? name.trim() : signedUpMatch.name;
    setAuth({ loggedIn:true, email:signedUpMatch.email, name:displayName, role:signedUpMatch.role, remember: !!remember });
    return true;
  }

  return false;
}

function attemptSignup(name, email, password, remember){
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = (name || '').trim();

  if (!cleanName || !cleanEmail || !password) return { ok:false, reason:'missing' };

  const emailTaken =
    DEMO_USERS.some(u => u.email.toLowerCase() === cleanEmail) ||
    getSignedUpUsers().some(u => u.email.toLowerCase() === cleanEmail);
  if (emailTaken) return { ok:false, reason:'taken' };

  const users = getSignedUpUsers();
  users.push({ email:cleanEmail, password, name:cleanName, role:'User' });
  setSignedUpUsers(users);

  setAuth({ loggedIn:true, email:cleanEmail, name:cleanName, role:'User', remember: !!remember });
  return { ok:true };
}

function logout(){
  clearAuth();
  window.location.href = 'login.html';
}

function initials(name){
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  const a = parts[0] ? parts[0][0] : '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase();
}

/* ---------------------------------------------------------
   SEED DATA
--------------------------------------------------------- */

function seedIfEmpty(){
  if (!localStorage.getItem(K_ASSETS)) {
    localStorage.setItem(K_ASSETS, JSON.stringify([
      { id:1, code:'AC-1001', name:'HVAC Chiller Unit 3',      category:'HVAC',       location:'Block A · Rooftop',      condition:'Good' },
      { id:2, code:'AC-1002', name:'Server Rack — Core Switch', category:'IT',         location:'Data Center · Rack 4',   condition:'Excellent' },
      { id:3, code:'AC-1003', name:'Fire Extinguisher Panel',   category:'Safety',     location:'Block B · Floor 2',      condition:'Fair' },
      { id:4, code:'AC-1004', name:'Elevator Motor Assembly',   category:'Mechanical', location:'Block C · Shaft 1',      condition:'Poor' },
      { id:5, code:'AC-1005', name:'Lecture Hall Projector',    category:'Electronics',location:'Block A · LH-101',       condition:'Good' },
      { id:6, code:'AC-1006', name:'Backup Generator',          category:'Electrical', location:'Utility Yard',           condition:'Excellent' },
      { id:7, code:'AC-1007', name:'Water Pump Station',        category:'Plumbing',   location:'Block D · Basement',     condition:'Fair' },
      { id:8, code:'AC-1008', name:'Lab Fume Hood',              category:'Safety',     location:'Block B · Lab 3',        condition:'Good' }
    ]));
  }

  if (!localStorage.getItem(K_TECHS)) {
    localStorage.setItem(K_TECHS, JSON.stringify([
      { id:1, name:'Hamza Tariq',    specialty:'HVAC & Mechanical', email:'tech@assetcare.demo', phone:'0300-1234567', active:3, completed:41 },
      { id:2, name:'Bilal Ahmed',    specialty:'Electrical',        email:'bilal@assetcare.demo', phone:'0301-2233445', active:1, completed:27 },
      { id:3, name:'Sana Malik',     specialty:'IT & Networking',   email:'sana@assetcare.demo',  phone:'0333-9988776', active:2, completed:35 },
      { id:4, name:'Usman Farooq',   specialty:'Plumbing',          email:'usman@assetcare.demo', phone:'0345-1122334', active:0, completed:19 }
    ]));
  }

  if (!localStorage.getItem(K_ISSUES)) {
    localStorage.setItem(K_ISSUES, JSON.stringify([
      { id:1, uid:'ISS-2041', assetName:'Elevator Motor Assembly',   description:'Unusual grinding noise on ascent', technician:'Hamza Tariq', priority:'Critical', status:'Open',        reported:'2026-07-10' },
      { id:2, uid:'ISS-2040', assetName:'Water Pump Station',        description:'Intermittent pressure drop',       technician:'Usman Farooq', priority:'High',     status:'In Progress', reported:'2026-07-09' },
      { id:3, uid:'ISS-2039', assetName:'Server Rack — Core Switch', description:'Port 14 flapping on uplink',       technician:'Sana Malik',   priority:'High',     status:'In Progress', reported:'2026-07-08' },
      { id:4, uid:'ISS-2038', assetName:'Lecture Hall Projector',    description:'Bulb dimming after 10 minutes',    technician:'Bilal Ahmed',  priority:'Medium',   status:'Open',        reported:'2026-07-07' },
      { id:5, uid:'ISS-2037', assetName:'Fire Extinguisher Panel',   description:'Pressure gauge in yellow zone',    technician:'Hamza Tariq',  priority:'Medium',   status:'Resolved',    reported:'2026-07-04' },
      { id:6, uid:'ISS-2036', assetName:'Lab Fume Hood',             description:'Airflow sensor miscalibrated',     technician:'Bilal Ahmed',  priority:'Low',      status:'Resolved',    reported:'2026-07-02' }
    ]));
  }

  if (!localStorage.getItem(K_MAINT)) {
    localStorage.setItem(K_MAINT, JSON.stringify([
      { id:1, assetName:'HVAC Chiller Unit 3',      task:'Quarterly coolant check',     technician:'Hamza Tariq', date:'2026-07-15', status:'Upcoming'  },
      { id:2, assetName:'Backup Generator',          task:'Load test & oil change',      technician:'Bilal Ahmed', date:'2026-07-13', status:'Upcoming'  },
      { id:3, assetName:'Server Rack — Core Switch', task:'Firmware update cycle',       technician:'Sana Malik',  date:'2026-07-12', status:'Upcoming'  },
      { id:4, assetName:'Water Pump Station',        task:'Seal replacement',            technician:'Usman Farooq',date:'2026-07-05', status:'Completed' },
      { id:5, assetName:'Lecture Hall Projector',    task:'Bulb replacement',            technician:'Bilal Ahmed', date:'2026-07-01', status:'Completed' }
    ]));
  }

  if (!localStorage.getItem(K_NOTIFS)) {
    localStorage.setItem(K_NOTIFS, JSON.stringify([
      { id:1, title:'Critical issue reported',    message:'Elevator Motor Assembly — grinding noise on ascent.', time:'2 hours ago',  read:false, type:'critical' },
      { id:2, title:'Maintenance due tomorrow',   message:'Backup Generator load test scheduled for Jul 13.',    time:'5 hours ago',  read:false, type:'maintenance' },
      { id:3, title:'Issue resolved',             message:'Fire Extinguisher Panel gauge fixed by Hamza Tariq.', time:'Yesterday',    read:true,  type:'resolved' },
      { id:4, title:'New technician added',       message:'Usman Farooq joined the Plumbing team.',              time:'2 days ago',   read:true,  type:'info' }
    ]));
  }

  if (!localStorage.getItem(K_SETTINGS)) {
    localStorage.setItem(K_SETTINGS, JSON.stringify({
      emailAlerts:true, criticalOnly:false, weeklyDigest:true
    }));
  }
}

const getData = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } };
const setData = (key, val) => localStorage.setItem(key, JSON.stringify(val));

/* ---------------------------------------------------------
   SIDEBAR + TOPBAR + MOBILE HAMBURGER
--------------------------------------------------------- */

const NAV_ITEMS = [
  { key:'dashboard',     label:'Dashboard',     href:'index.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>' },
  { key:'assets',        label:'Assets',        href:'assets.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>' },
  { key:'issues',        label:'Issues',        href:'issues.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>' },
  { key:'maintenance',   label:'Maintenance',   href:'maintenance.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v.5h1.5a1.5 1.5 0 011.5 1.5V7h.5a2 2 0 010 4H18v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6h-.5a2 2 0 010-4H6V6a1.5 1.5 0 011.5-1.5H9V4z"/>' },
  { key:'technicians',   label:'Technicians',   href:'technicians.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.65"/>' },
  { key:'analytics',     label:'Analytics',     href:'analytics.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l4-3 4 3v13M9 19H5a1 1 0 01-1-1v-6a1 1 0 011-1h4m0 8h8m0 0h4a1 1 0 001-1V9a1 1 0 00-1-1h-4m0 11V6"/>' },
  { key:'notifications', label:'Notifications', href:'notifications.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>' },
  { key:'settings',      label:'Settings',      href:'settings.html',
    icon:'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>' }
];

function renderSidebar(active){
  const root = document.getElementById('sidebar-root');
  if (!root) return;

  const links = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="side-link ${item.key === active ? 'active' : ''}">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
      <span>${item.label}</span>
    </a>
  `).join('');

  root.innerHTML = `
    <aside id="sidebar">
      <div class="side-logo">
        <div class="badge-square">AC</div>
        <span class="text-white font-extrabold tracking-[0.18em] text-sm">ASSETCARE</span>
        <button class="side-close-btn" onclick="toggleSidebar(false)" aria-label="Close menu">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <nav>${links}</nav>
      <div class="p-4 border-t border-white/10">
        <button onclick="logout()" class="w-full flex items-center gap-2 text-[#a9bbcf] hover:text-white text-sm font-semibold px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Log out
        </button>
      </div>
    </aside>
    <div id="sidebar-overlay" class="sidebar-overlay" onclick="toggleSidebar(false)"></div>
  `;
}

function toggleSidebar(show){
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if (!sb || !ov) return;
  if (show === undefined) show = !sb.classList.contains('sidebar-open');
  sb.classList.toggle('sidebar-open', show);
  ov.classList.toggle('active', show);
  document.body.style.overflow = show ? 'hidden' : '';
}

function renderTopbar(placeholder){
  const root = document.getElementById('topbar-root');
  if (!root) return;

  const auth = getAuth() || { name:'Guest User', email:'', role:'' };
  const unreadCount = getData(K_NOTIFS).filter(n => !n.read).length;

  root.innerHTML = `
    <header class="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-40">
      <button class="hamburger-btn" onclick="toggleSidebar(true)" aria-label="Open menu">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      <div class="flex items-center flex-1 min-w-0 relative">
        <svg class="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" placeholder="${placeholder || 'Search…'}"
               class="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-gray-200 rounded-full text-sm focus:outline-none focus:border-[var(--teal-dark)]" />
      </div>

      <div class="flex items-center gap-2 sm:gap-5 flex-shrink-0">
        <a href="notifications.html" class="relative text-gray-500 hover:text-gray-700" aria-label="Notifications">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          ${unreadCount > 0 ? '<span class="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-white"></span>' : ''}
        </a>

        <div class="hidden sm:flex items-center gap-3">
          <div class="avatar-circle w-10 h-10 text-sm" style="background:var(--teal-bg); color:var(--teal-dark);">
            ${initials(auth.name)}
          </div>
          <div class="hidden md:flex flex-col leading-tight">
            <span class="text-sm font-semibold text-gray-900">${auth.name || 'Guest User'}</span>
            <span class="text-xs text-gray-500">${auth.role || ''}</span>
          </div>
        </div>

        <button onclick="toggleLogoutModal(true)"
                class="bg-[#ccfbf1] text-[#115e59] hover:bg-[#99f6e4] transition-all duration-200 font-semibold px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap">
          Menu
        </button>
      </div>
    </header>
  `;

  renderLogoutModal();
}

function renderLogoutModal(){
  if (document.getElementById('logout-modal')) return;
  const auth = getAuth() || { name:'Guest User', email:'', role:'' };

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="logout-modal" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4 hidden">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-gray-100">
        <button onclick="toggleLogoutModal(false)" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <p class="text-xs font-bold text-teal-800 tracking-wider uppercase mb-1">AssetCare</p>
        <h2 class="text-xl font-bold text-gray-900 mb-6">User Menu</h2>

        <div class="flex items-center gap-4 mb-6">
          <div class="avatar-circle w-12 h-12 text-base" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">
            ${initials(auth.name)}
          </div>
          <div class="min-w-0">
            <h4 class="text-base font-bold text-gray-900 truncate">${auth.name || 'Guest User'}</h4>
            <p class="text-xs text-gray-500 truncate">${auth.email || ''}${auth.role ? ' • ' + auth.role : ''}</p>
          </div>
        </div>

        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-600 mb-6 leading-relaxed">
          Use reset to restore the original sample data in localStorage, including demo issues, schedules, notifications, and history entries.
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button onclick="resetDemoData()"
                  class="bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
            Reset Demo Data
          </button>
          <button onclick="logout()"
                  class="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all text-center">
            Logout
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap.firstElementChild);
}

function toggleLogoutModal(show){
  const modal = document.getElementById('logout-modal');
  if (!modal) return;
  modal.classList.toggle('hidden', !show);
}

function resetDemoData(){
  [K_ASSETS, K_ISSUES, K_TECHS, K_MAINT, K_NOTIFS, K_SETTINGS].forEach(k => localStorage.removeItem(k));
  seedIfEmpty();
  alert('Demo data has been reset.');
  toggleLogoutModal(false);
  window.location.reload();
}

/* ---------------------------------------------------------
   SMALL UI HELPERS (donut chart, priority/status chips)
--------------------------------------------------------- */

function priorityChip(p){
  const map = { Critical:'chip-red', High:'chip-orange', Medium:'chip-amber', Low:'chip-teal' };
  return `<span class="chip ${map[p] || 'chip-gray'}">${p}</span>`;
}
function statusChip(s){
  const map = { Open:'chip-red', 'In Progress':'chip-blue', Resolved:'chip-emerald', Upcoming:'chip-amber', Completed:'chip-emerald' };
  return `<span class="chip ${map[s] || 'chip-gray'}">${s}</span>`;
}
function conditionChip(c){
  const map = { Excellent:'chip-emerald', Good:'chip-teal', Fair:'chip-amber', Poor:'chip-red' };
  return `<span class="chip ${map[c] || 'chip-gray'}">${c}</span>`;
}

function buildDonut(entries, size){
  size = size || 128;
  const total = entries.reduce((s,e) => s + e.value, 0) || 1;
  let acc = 0;
  const stops = entries.map(e => {
    const start = (acc / total) * 360;
    acc += e.value;
    const end = (acc / total) * 360;
    return `${e.color} ${start}deg ${end}deg`;
  }).join(', ');

  const legend = entries.map(e => `
    <div class="flex items-center justify-between py-1.5 text-sm">
      <span class="flex items-center gap-2 text-[var(--ink-soft)] font-medium">
        <span class="w-2.5 h-2.5 rounded-full inline-block" style="background:${e.color}"></span>${e.label}
      </span>
      <span class="font-bold text-[var(--ink)]">${e.value}</span>
    </div>
  `).join('');

  const donutHtml = `
    <div style="width:${size}px;height:${size}px;border-radius:999px;background:conic-gradient(${stops});
                display:flex;align-items:center;justify-content:center;flex-shrink:0;">
      <div style="width:${size*0.62}px;height:${size*0.62}px;border-radius:999px;background:#fff;
                  display:flex;align-items:center;justify-content:center;flex-direction:column;">
        <span class="text-xl font-extrabold">${total}</span>
        <span class="text-[10px] text-[var(--ink-soft)] font-bold uppercase">Total</span>
      </div>
    </div>
  `;
  return { donutHtml, legend };
}

/* ---------------------------------------------------------
   PAGE RENDERERS
--------------------------------------------------------- */

function renderDashboard(){
  const assets = getData(K_ASSETS);
  const issues = getData(K_ISSUES);
  const maint  = getData(K_MAINT);

  const openIssues = issues.filter(i => i.status !== 'Resolved').length;
  const critical   = issues.filter(i => i.priority === 'Critical').length;
  const scheduled  = maint.filter(m => m.status === 'Upcoming').length;

  setText('kpi-total-assets', assets.length);
  setText('kpi-open-issues', openIssues);
  setText('kpi-critical', critical);
  setText('kpi-scheduled', scheduled);

  const condCounts = {};
  assets.forEach(a => condCounts[a.condition] = (condCounts[a.condition]||0)+1);
  const condColors = { Excellent:'#059669', Good:'#14b8a6', Fair:'#d97706', Poor:'#dc2626' };
  const condEntries = Object.keys(condCounts).map(k => ({ label:k, value:condCounts[k], color:condColors[k] || '#94a3b8' }));
  const cond = buildDonut(condEntries, 128);
  setHtml('condition-donut', cond.donutHtml);
  setHtml('condition-legend', cond.legend);

  const prioCounts = {};
  issues.forEach(i => prioCounts[i.priority] = (prioCounts[i.priority]||0)+1);
  const prioColors = { Critical:'#dc2626', High:'#ea580c', Medium:'#d97706', Low:'#0f766e' };
  const prioEntries = Object.keys(prioCounts).map(k => ({ label:k, value:prioCounts[k], color:prioColors[k] || '#94a3b8' }));
  const prio = buildDonut(prioEntries, 128);
  setHtml('priority-donut', prio.donutHtml);
  setHtml('priority-legend', prio.legend);

  const recentIssues = [...issues].sort((a,b) => new Date(b.reported)-new Date(a.reported)).slice(0,4);
  setHtml('recent-issues', recentIssues.map(i => `
    <div class="flex items-center justify-between gap-3 py-3 border-b border-[var(--line)] last:border-0">
      <div class="min-w-0">
        <p class="text-sm font-bold truncate">${i.assetName}</p>
        <p class="text-xs text-[var(--ink-soft)] truncate">${i.description}</p>
      </div>
      <div class="flex-shrink-0">${priorityChip(i.priority)}</div>
    </div>
  `).join('') || emptyRow());

  const upcoming = maint.filter(m => m.status === 'Upcoming').slice(0,4);
  setHtml('upcoming-maintenance', upcoming.map(m => `
    <div class="flex items-center justify-between gap-3 py-3 border-b border-[var(--line)] last:border-0">
      <div class="min-w-0">
        <p class="text-sm font-bold truncate">${m.assetName}</p>
        <p class="text-xs text-[var(--ink-soft)] truncate">${m.task} · ${m.date}</p>
      </div>
      <div class="flex-shrink-0">${statusChip(m.status)}</div>
    </div>
  `).join('') || emptyRow());

  const auth = getAuth();
  if (auth) {
    setText('user-name-slot', auth.name);
    setText('user-role-slot', auth.role);
    setHtml('user-initials-slot', initials(auth.name));
  }
}

function renderAssets(){
  const assets = getData(K_ASSETS);
  setHtml('asset-grid', assets.map(a => `
    <div class="card p-5">
      <div class="flex items-start justify-between mb-3">
        <span class="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wide">${a.code}</span>
        ${conditionChip(a.condition)}
      </div>
      <p class="font-bold text-[15px] leading-snug mb-1">${a.name}</p>
      <p class="text-xs text-[var(--ink-soft)] mb-3">${a.category}</p>
      <div class="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="truncate">${a.location}</span>
      </div>
    </div>
  `).join('') || emptyState('No assets registered yet.'));
}

function renderIssues(){
  const issues = getData(K_ISSUES);
  setHtml('issues-tbody', issues.map(i => `
    <tr class="border-b border-[var(--line)] last:border-0 row-flash">
      <td class="py-3 px-5 font-bold whitespace-nowrap">${i.uid}</td>
      <td class="py-3 px-5">${i.assetName}</td>
      <td class="py-3 px-5 text-[var(--ink-soft)]">${i.description}</td>
      <td class="py-3 px-5 whitespace-nowrap">${i.technician}</td>
      <td class="py-3 px-5">${priorityChip(i.priority)}</td>
      <td class="py-3 px-5">${statusChip(i.status)}</td>
      <td class="py-3 px-5 text-[var(--ink-soft)] whitespace-nowrap">${i.reported}</td>
    </tr>
  `).join('') || `<tr><td colspan="7" class="py-8 text-center text-[var(--ink-soft)]">No issues logged yet.</td></tr>`);
}

function renderMaintenance(){
  const maint = getData(K_MAINT);
  const upcoming  = maint.filter(m => m.status === 'Upcoming').length;
  const completed = maint.filter(m => m.status === 'Completed').length;
  const thisWeek  = maint.filter(m => m.status === 'Upcoming').length; // demo approximation

  setText('kpi-upcoming', upcoming);
  setText('kpi-this-week', thisWeek);
  setText('kpi-completed', completed);

  setHtml('maintenance-tbody', maint.map(m => `
    <tr class="border-b border-[var(--line)] last:border-0 row-flash">
      <td class="py-3 px-5 font-bold">${m.assetName}</td>
      <td class="py-3 px-5">${m.task}</td>
      <td class="py-3 px-5 whitespace-nowrap">${m.technician}</td>
      <td class="py-3 px-5 text-[var(--ink-soft)] whitespace-nowrap">${m.date}</td>
      <td class="py-3 px-5">${statusChip(m.status)}</td>
    </tr>
  `).join('') || `<tr><td colspan="5" class="py-8 text-center text-[var(--ink-soft)]">Nothing scheduled yet.</td></tr>`);
}

function renderTechnicians(){
  const techs = getData(K_TECHS);
  const colors = ['#ccfbf1|#115e59', '#dbeafe|#1d4ed8', '#fef3c7|#b45309', '#fee2e2|#dc2626'];
  setHtml('tech-grid', techs.map((t, idx) => {
    const [bg, ink] = colors[idx % colors.length].split('|');
    return `
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-4">
        <div class="avatar-circle w-12 h-12 text-sm" style="background:${bg};color:${ink};">${initials(t.name)}</div>
        <div class="min-w-0">
          <p class="font-bold truncate">${t.name}</p>
          <p class="text-xs text-[var(--ink-soft)] truncate">${t.specialty}</p>
        </div>
      </div>
      <div class="flex items-center justify-between text-xs text-[var(--ink-soft)] mb-1">
        <span>Active issues</span><span class="font-bold text-[var(--ink)]">${t.active}</span>
      </div>
      <div class="flex items-center justify-between text-xs text-[var(--ink-soft)]">
        <span>Completed</span><span class="font-bold text-[var(--ink)]">${t.completed}</span>
      </div>
      <div class="mt-4 pt-4 border-t border-[var(--line)] text-xs text-[var(--ink-soft)] truncate">${t.email}</div>
    </div>`;
  }).join('') || emptyState('No technicians added yet.'));
}

function renderAnalytics(){
  const assets = getData(K_ASSETS);
  const issues = getData(K_ISSUES);
  const maint  = getData(K_MAINT);

  const resolved = issues.filter(i => i.status === 'Resolved').length;
  const rate = issues.length ? Math.round((resolved/issues.length)*100) : 0;
  setText('kpi-resolution-rate', rate + '%');
  setText('kpi-avg-open', issues.filter(i => i.status !== 'Resolved').length);
  setText('kpi-completed-maint', maint.filter(m => m.status === 'Completed').length);

  const catCounts = {};
  assets.forEach(a => catCounts[a.category] = (catCounts[a.category]||0)+1);
  const maxCat = Math.max(...Object.values(catCounts), 1);
  setHtml('category-bars', Object.keys(catCounts).map(cat => `
    <div>
      <div class="flex items-center justify-between text-sm mb-1.5">
        <span class="font-semibold">${cat}</span>
        <span class="text-[var(--ink-soft)] font-bold">${catCounts[cat]}</span>
      </div>
      <div class="w-full h-2.5 rounded-full bg-[#f1f5f9]">
        <div class="h-2.5 rounded-full" style="width:${(catCounts[cat]/maxCat)*100}%; background:var(--teal-dark);"></div>
      </div>
    </div>
  `).join(''));

  const statusCounts = {};
  issues.forEach(i => statusCounts[i.status] = (statusCounts[i.status]||0)+1);
  const statusColors = { Open:'#dc2626', 'In Progress':'#1d4ed8', Resolved:'#059669' };
  const entries = Object.keys(statusCounts).map(k => ({ label:k, value:statusCounts[k], color:statusColors[k] || '#94a3b8' }));
  const donut = buildDonut(entries, 128);
  setHtml('status-donut', donut.donutHtml);
  setHtml('status-legend', donut.legend);
}

function renderNotifications(){
  const notifs = getData(K_NOTIFS);
  const iconMap = {
    critical:    { bg:'#fee2e2', ink:'#dc2626', glyph:'!' },
    maintenance: { bg:'#fef3c7', ink:'#b45309', glyph:'🛠' },
    resolved:    { bg:'#d1fae5', ink:'#059669', glyph:'✓' },
    info:        { bg:'#dbeafe', ink:'#1d4ed8', glyph:'i' }
  };

  setHtml('notif-list', notifs.map(n => {
    const ic = iconMap[n.type] || iconMap.info;
    return `
    <div class="flex items-start gap-3 sm:gap-4 py-4 border-b border-[var(--line)] last:border-0 ${n.read ? '' : 'bg-[#f8fdfc]'}">
      <div class="avatar-circle w-9 h-9 text-sm flex-shrink-0" style="background:${ic.bg};color:${ic.ink};">${ic.glyph}</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-bold truncate">${n.title}</p>
          ${!n.read ? '<span class="w-2 h-2 rounded-full bg-[var(--teal-dark)] flex-shrink-0"></span>' : ''}
        </div>
        <p class="text-sm text-[var(--ink-soft)] mt-0.5">${n.message}</p>
        <p class="text-xs text-[var(--ink-soft)] mt-1.5">${n.time}</p>
      </div>
    </div>`;
  }).join('') || emptyState('You’re all caught up.'));

  const markAllBtn = document.querySelector('[data-mark-all]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Mark all as read');
  if (markAllBtn) {
    markAllBtn.onclick = () => {
      const all = getData(K_NOTIFS).map(n => ({ ...n, read:true }));
      setData(K_NOTIFS, all);
      renderNotifications();
      renderTopbar(document.querySelector('#topbar-root input') ? document.querySelector('#topbar-root input').placeholder : '');
    };
  }
}

function renderSettings(){
  const auth = getAuth() || {};
  const settings = getData(K_SETTINGS) || {};

  setValue('settings-name', auth.name || '');
  setValue('settings-email', auth.email || '');
  setText('settings-role', auth.role || 'User');

  setChecked('toggle-email-alerts', !!settings.emailAlerts);
  setChecked('toggle-critical-only', !!settings.criticalOnly);
  setChecked('toggle-weekly-digest', !!settings.weeklyDigest);

  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      setData(K_SETTINGS, {
        emailAlerts: document.getElementById('toggle-email-alerts').checked,
        criticalOnly: document.getElementById('toggle-critical-only').checked,
        weeklyDigest: document.getElementById('toggle-weekly-digest').checked
      });
      const saved = document.getElementById('settings-saved');
      if (saved) {
        saved.classList.remove('hidden');
        setTimeout(() => saved.classList.add('hidden'), 2000);
      }
    });
  }
}

/* ---------------------------------------------------------
   TINY DOM HELPERS
--------------------------------------------------------- */

function setText(id, val){ const el = document.getElementById(id); if (el) el.textContent = val; }
function setHtml(id, val){ const el = document.getElementById(id); if (el) el.innerHTML = val; }
function setValue(id, val){ const el = document.getElementById(id); if (el) el.value = val; }
function setChecked(id, val){ const el = document.getElementById(id); if (el) el.checked = val; }
function emptyRow(){ return `<div class="py-6 text-center text-sm text-[var(--ink-soft)]">Nothing here yet.</div>`; }
function emptyState(msg){ return `<div class="col-span-full py-14 text-center text-sm text-[var(--ink-soft)]">${msg}</div>`; }
