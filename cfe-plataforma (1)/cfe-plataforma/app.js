const API=(window.CFE_API||"").replace(/\/$/,""),NAME=window.CFE_NAME||"Consejo Familiar Electoral";
const $=s=>document.querySelector(s),val=i=>$("#"+i).value.trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
let token=localStorage.getItem("cfe_t")||sessionStorage.getItem("cfe_t"),me=null,view="inicio",tab="login",pending=0;
if(location.hash.startsWith("#token=")){token=decodeURIComponent(location.hash.slice(7));localStorage.setItem("cfe_t",token);history.replaceState(null,"",location.pathname)}

/* ---------- iconos y dibujos ---------- */
const P={home:'<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
vote:'<path d="M4 14h16v7H4z"/><path d="M8 14l-2-4h12l-2 4"/><path d="M9.5 3.5l5.5 1-1 5"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M17 14.5c3 0 5 1.6 5 4.5"/>',
chart:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
poll:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h6"/>',
bell:'<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',check:'<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
shield:'<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
out:'<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',play:'<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
login:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l4 4-4 4M14 12H3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>',
down:'<path d="M6 9l6 6 6-6"/>',trophy:'<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8"/>'};
const ic=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[n]}</svg>`;
const crowd=(seed=1)=>{const w=600,h=200;let s="";for(let i=0;i<9;i++){const x=45+i*(w-90)/8,r=19+((i*5+seed)%4)*4,top=h-r*2.3;s+=`<circle cx="${x}" cy="${top-r*.95}" r="${r*.8}"/><path d="M${x-r*1.9} ${h}q0-${r*2.3} ${r*1.9}-${r*2.3}t${r*1.9} ${r*2.3}z"/>`}return `<svg class="cr" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMaxYMax slice" fill="currentColor">${s}</svg>`};
const ballot=`<svg viewBox="0 0 160 140" width="150"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b97ff"/><stop offset="1" stop-color="#1e3fae"/></linearGradient></defs><path d="M20 62l60-18 60 18v54l-60 18-60-18z" fill="url(#g1)"/><path d="M20 62l60 18 60-18M80 80v54" fill="none" stroke="#b6caff" stroke-width="3"/><g transform="rotate(-10 80 40)"><rect x="52" y="4" width="54" height="54" rx="4" fill="#fff"/><path d="M64 31l9 9 16-18" stroke="#1e3fae" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><path d="M0 130l60-14 60 20-70 4z" fill="#f59e0b" opacity=".9"/></svg>`;

/* ---------- utilidades ---------- */
function toast(m,good){const t=$("#toast");t.style.background=good?"#16a34a":"";t.textContent=m;t.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>t.style.display="none",good?1500:3500)}
async function api(p,m="GET",b){
  const r=await fetch(API+p,{method:m,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:b?JSON.stringify(b):undefined});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){if(r.status===401&&token&&!p.startsWith("/api/log"))logout();throw new Error(d.error||"Error de conexión")}
  return d}
async function run(fn,after){try{await fn();toast("Listo",1);after?after():load()}catch(e){toast(e.message)}}
function logout(){token=null;me=null;localStorage.removeItem("cfe_t");sessionStorage.removeItem("cfe_t");render()}
function session(d){token=d.token;me=d.user;(($("#rm")||{}).checked===false?sessionStorage:localStorage).setItem("cfe_t",token);view="inicio";render()}
const admin=()=>me&&me.role==="admin";
const go=v=>{view=v;render()};
const ago=s=>{const m=Math.max(0,(Date.now()-new Date(s.replace(" ","T")+"Z"))/6e4);return m<60?`Hace ${Math.round(m)} min`:m<1440?`Hace ${Math.round(m/60)} h`:`Hace ${Math.round(m/1440)} d`};
const fdate=d=>d?new Date(d+"T12:00").toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"}):"Por definir";

/* ---------- acceso ---------- */
function authView(){
  const reg=tab==="reg";
  $("#app").innerHTML=`<div class="authwrap"><div class="brand"><img src="logo.png" alt="CFE"><p class="p1"><i style="margin-left:0"></i>Participación<i>•</i>Transparencia<i>•</i>Unidad</p><p class="p2">Organizamos, decidimos y construimos<br>juntos una <b style="color:#f59e0b">familia</b> más participativa.</p>${crowd(2)}</div>
  <div class="formside"><div class="auth"><h2>Bienvenido al<br>${esc(NAME)}</h2>
  <p class="sub">Inicia sesión en tu cuenta o regístrate para ser parte de nuestro consejo.</p><div class="star">${ic("star",18)}</div>
  <div class="tabs"><button class="${reg?"":"on"}" onclick="tab='login';render()">${ic("user")} Iniciar Sesión</button><button class="${reg?"on":""}" onclick="tab='reg';render()">${ic("users")} Registrar Familiar</button></div>
  ${reg?`<div class="f">${ic("user")}<input id="n" placeholder="Nombre completo" autocomplete="name"></div>`:""}
  <div class="f">${ic("mail")}<input id="u" placeholder="${reg?"Correo electrónico":"Correo electrónico o usuario"}" autocomplete="username" autocapitalize="none"></div>
  <div class="f">${ic("lock")}<input id="p" type="password" placeholder="Contraseña${reg?" (mín. 6)":""}" autocomplete="${reg?"new-password":"current-password"}" onkeydown="if(event.key==='Enter')enter()"><button class="eye" type="button" onclick="const i=$('#p');i.type=i.type==='password'?'text':'password'">${ic("eye")}</button></div>
  ${reg?"":`<div class="row sp" style="margin-bottom:14px"><label style="display:flex;align-items:center;gap:8px"><input id="rm" type="checkbox" checked style="width:auto;margin:0">Recordar mi cuenta</label><button class="link lnk" onclick="toast('Pide al administrador que restablezca tu contraseña desde Miembros.')">¿Olvidaste tu contraseña?</button></div>`}
  <button class="go" onclick="enter()">${ic("login",22)} ${reg?"Crear mi cuenta":"Iniciar Sesión"}</button>
  <div class="sepr">o continúa con</div>
  <div class="soc"><button title="GitHub" onclick="location.href=API+'/api/oauth/github'"><svg width="26" height="26" viewBox="0 0 24 24" fill="#111"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg></button>
   <button title="Google" onclick="location.href=API+'/api/oauth/google'"><span style="font:700 26px Poppins;background:linear-gradient(90deg,#4285f4,#ea4335,#fbbc05,#34a853);-webkit-background-clip:text;color:transparent">G</span></button>
   <button title="${reg?"Ya tengo cuenta":"Crear cuenta"}" onclick="tab='${reg?"login":"reg"}';render()">${ic("user",26)}</button></div>
  <div class="note">${ic("shield",24)}<span>Tu información está protegida y solo se usará para fines del ${esc(NAME)}.</span></div></div></div></div>`}
async function enter(){try{session(tab==="reg"?await api("/api/register","POST",{name:val("n"),username:val("u"),password:$("#p").value}):await api("/api/login","POST",{username:val("u"),password:$("#p").value}))}catch(e){toast(e.message)}}

/* ---------- estructura ---------- */
const NAV=[["inicio","home","Inicio"],["elecciones","vote","Elecciones"],["candidatos","user","Candidatos"],["encuestas","poll","Encuestas"],["miembros","users","Miembros"],["resultados","chart","Resultados"],["historial","clock","Historial"],["config","gear","Configuración"]];
async function render(){
  if(!token)return authView();
  if(!me){try{me=await api("/api/me")}catch(e){return authView()}}
  try{pending=(await api("/api/dashboard")).pending}catch{}
  $("#app").innerHTML=`<aside><img class="logo" src="logo-dark.png" alt="CFE">
   ${NAV.map(n=>`<button class="nav ${view===n[0]?"on":""}" onclick="go('${n[0]}')">${ic(n[1],22)}<span>${n[2]}</span></button>`).join("")}
   <div class="shield">${ic("shield",34)}<b>Transparencia</b><br>en cada decisión</div>
   <button class="me" onclick="go('config')"><div class="av">${esc(me.name[0]||"?").toUpperCase()}</div><span>${esc(me.name)}<small>${admin()?"Administrador":"Miembro"}</small></span>${ic("down",16)}</button></aside>
   <div class="col"><header><span class="tag">Participación<i>•</i>Transparencia<i>•</i>Unidad</span><div class="r"><button class="bell" onclick="go('elecciones')" title="Pendientes">${ic("bell",24)}${pending?`<b>${pending}</b>`:""}</button><button class="ghost" onclick="logout()">Cerrar sesión ${ic("out",18)}</button></div></header><main id="v"></main></div>`;
  load()}
async function load(){const el=$("#v");if(!el)return;try{el.innerHTML=await VIEWS[view]()}catch(e){toast(e.message)}}

const total=a=>a.reduce((s,x)=>s+(x.votes||0),0);
const bars=(items,label)=>{const t=total(items);return items.map(o=>{const pc=t?Math.round(o.votes/t*100):0;return `<div class="opt blk"><div class="row sp"><span>${label(o)}</span><b>${o.votes} · ${pc}%</b></div><div class="bar"><i style="width:${pc}%"></i></div></div>`}).join("")+`<small class="mu">${t} voto(s)</small>`};
const cl=c=>`<span class="dot" style="background:${esc(c.color||"#888")}"></span>${esc(c.name)} <small class="mu">${esc(c.party||"Independiente")}</small>`;
const empty=t=>`<div class="card mu">${t}</div>`;
const lbl={draft:"Borrador",open:"Votación abierta",closed:"Finalizada"};
const winner=e=>{const c=[...e.candidates].sort((a,b)=>b.votes-a.votes)[0];return c&&c.votes?c:null};
const timeline=a=>`<div class="tl">${a.map(x=>`<div><div class="row sp"><b>${esc(x.text)}</b><small class="mu">${ago(x.created)}</small></div><small class="mu">${esc(x.detail)}</small></div>`).join("")||'<span class="mu">Sin actividad todavía</span>'}</div>`;

const VIEWS={
 async inicio(){const d=await api("/api/dashboard"),n=d.next;
  const st=(i,col,n,l,b)=>`<div class="stat"><div class="bi" style="color:${col}">${ic(i,40)}</div><div><b>${n}</b><span>${l}</span></div>${b?`<button class="link" onclick="go('${b[0]}')">${b[1]} ›</button>`:""}</div>`;
  return `<div class="banner"><img src="logo.png" alt=""><div class="t"><small>Bienvenido al</small><h1>${esc(NAME)}</h1><i>Juntos construimos una familia más participativa</i></div>${crowd(1)}</div>
  <div class="stats">${st("users","#5b8cff",d.members,"Miembros registrados",admin()&&["miembros","Ver"])}${st("vote","#f59e0b",d.open,"Elección activa",["elecciones","Ver detalles"])}${st("check","#fff",d.participation+"%","Participación actual")}${st("chart","#3b82f6",d.closed,"Elecciones realizadas",["historial","Ver historial"])}</div>
  <div class="grid3"><div class="card"><h3>${ic("cal",24)} Próxima Elección</h3>${n?`<div class="next">${ballot}<div><span class="mu">Elección para:</span><h2>${esc(n.title)}</h2><p>${ic("cal",16)} Fecha: ${fdate(n.date)}</p><p>${ic("clock",16)} Inicio de votación: ${n.status==="open"?"En curso":"Próximamente"}</p><button class="or" onclick="go('elecciones')" style="width:100%;margin-top:8px">${ic("play",14)} Ver detalles</button></div></div>`:`<p class="mu">No hay elecciones programadas.</p>${admin()?`<button class="or" onclick="go('elecciones')">Crear elección</button>`:""}`}</div>
  <div class="card"><h3><span style="color:#f59e0b">${ic("bolt",24)}</span> Acciones Rápidas</h3><div class="qa">${admin()?`<button onclick="go('miembros')">${ic("users")}Gestionar Miembros</button><button onclick="go('elecciones')">${ic("vote")}Crear Elección</button>`:`<button onclick="go('elecciones')">${ic("vote")}Votar</button><button onclick="go('encuestas')">${ic("poll")}Encuestas</button>`}<button onclick="go('resultados')">${ic("chart")}Ver Resultados</button><button onclick="go('config')">${ic("gear")}Configuración</button></div></div>
  <div class="card"><div class="row sp"><h3>${ic("clock",24)} Actividad Reciente</h3><button class="link" onclick="go('historial')">Ver todo ›</button></div>${timeline(d.recent)}</div></div>
  <div class="foot"><span>Una familia unida, decide mejor</span>${crowd(3)}</div>`},

 async elecciones(){const els=await api("/api/elections");
  const form=admin()?`<div class="card"><h3>${ic("vote",24)} Crear elección</h3><input id="et" placeholder="Título (ej. Presidente Familiar)"><input id="ed" placeholder="Descripción (opcional)"><label class="mu">Fecha</label><input id="edt" type="date"><button class="or" onclick="run(()=>api('/api/elections','POST',{title:val('et'),description:val('ed'),date:val('edt')}))">Crear elección</button></div>`:"";
  return form+(els.map(e=>`<div class="card"><div class="row sp"><h3 style="margin:0">${esc(e.title)}</h3><span class="badge ${e.status}">${lbl[e.status]}</span></div>
   <p class="mu">${esc(e.description)} ${e.date?"· "+fdate(e.date):""}</p>
   ${e.candidates.some(c=>c.votes!==null)?bars(e.candidates,cl):e.candidates.map(c=>`<div class="opt"><span>${cl(c)}<div class="mu" style="font-size:13px">${esc(c.bio)}</div></span>${e.status==="open"&&!e.voted?`<button class="or" onclick="vote(${e.id},${c.id})">Votar</button>`:""}</div>`).join("")}
   ${!e.candidates.length?`<p class="mu">Aún no hay candidatos${admin()?" — agrégalos en Candidatos":""}.</p>`:""}
   ${e.voted?`<p class="ok">✔ Tu voto fue registrado</p>`:""}
   ${admin()?`<div class="row" style="margin-top:10px">${e.status!=="open"?`<button class="or" onclick="run(()=>api('/api/elections/${e.id}/status','POST',{status:'open'}))">Abrir votación</button>`:`<button class="or" onclick="run(()=>api('/api/elections/${e.id}/status','POST',{status:'closed'}))">Cerrar y publicar resultados</button>`}<button class="bad" onclick="if(confirm('¿Eliminar esta elección y sus votos?'))run(()=>api('/api/elections/${e.id}','DELETE'))">Eliminar</button></div>`:""}</div>`).join("")||empty("No hay elecciones todavía."))},

 async candidatos(){const[ps,cs,els]=await Promise.all([api("/api/parties"),api("/api/candidates"),api("/api/elections")]);
  const forms=admin()?`<div class="card"><h3>Registrar partido</h3><input id="pn" placeholder="Nombre del partido"><input id="pd" placeholder="Descripción"><input id="pc" type="color" value="#f59e0b" style="height:46px"><button class="or" onclick="run(()=>api('/api/parties','POST',{name:val('pn'),description:val('pd'),color:val('pc')}))">Registrar partido</button></div>
  <div class="card"><h3>Registrar candidato</h3><select id="ce">${els.map(e=>`<option value="${e.id}">${esc(e.title)}</option>`).join("")}</select><select id="cp"><option value="">Independiente</option>${ps.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select><input id="cn" placeholder="Nombre del candidato"><input id="cb" placeholder="Propuesta / presentación"><button class="or" onclick="run(()=>api('/api/candidates','POST',{election_id:val('ce'),party_id:val('cp')||null,name:val('cn'),bio:val('cb')}))">Registrar candidato</button></div>`:"";
  return forms+`<div class="card"><h3>Partidos</h3>${ps.map(p=>`<div class="opt"><span><span class="dot" style="background:${esc(p.color)}"></span><b>${esc(p.name)}</b> <small class="mu">${esc(p.description)}</small></span>${admin()?`<button class="bad" onclick="if(confirm('¿Eliminar partido?'))run(()=>api('/api/parties/${p.id}','DELETE'))">Eliminar</button>`:""}</div>`).join("")||'<span class="mu">Sin partidos.</span>'}</div>
  <div class="card"><h3>Candidatos</h3>${cs.map(c=>`<div class="opt"><span>${cl(c)} <small class="mu">· ${esc(c.election)}</small><div class="mu" style="font-size:13px">${esc(c.bio)}</div></span>${admin()?`<button class="bad" onclick="if(confirm('¿Eliminar candidato?'))run(()=>api('/api/candidates/${c.id}','DELETE'))">Eliminar</button>`:""}</div>`).join("")||'<span class="mu">Sin candidatos.</span>'}</div>`},

 async encuestas(){const qs=await api("/api/polls");
  const form=admin()?`<div class="card"><h3>${ic("poll",24)} Crear encuesta previa</h3><input id="qq" placeholder="Pregunta"><textarea id="qo" rows="4" placeholder="Una opción por línea (mínimo 2)"></textarea><button class="or" onclick="run(()=>api('/api/polls','POST',{question:val('qq'),options:$('#qo').value.split('\\n')}))">Publicar encuesta</button></div>`:"";
  return form+(qs.map(q=>`<div class="card"><div class="row sp"><h3 style="margin:0">${esc(q.question)}</h3><span class="badge ${q.status}">${q.status==="open"?"Abierta":"Cerrada"}</span></div><div style="margin-top:8px">
   ${q.options.some(o=>o.votes!==null)?bars(q.options,o=>esc(o.text)):q.options.map(o=>`<div class="opt">${esc(o.text)}${q.status==="open"?`<button class="or" onclick="run(()=>api('/api/polls/${q.id}/vote','POST',{option_id:${o.id}}),render)">Elegir</button>`:""}</div>`).join("")}</div>
   ${admin()?`<div class="row" style="margin-top:10px"><button class="ghost" onclick="run(()=>api('/api/polls/${q.id}/status','POST',{status:'${q.status==="open"?"closed":"open"}'}))">${q.status==="open"?"Cerrar":"Reabrir"}</button><button class="bad" onclick="if(confirm('¿Eliminar encuesta?'))run(()=>api('/api/polls/${q.id}','DELETE'))">Eliminar</button></div>`:""}</div>`).join("")||empty("No hay encuestas."))},

 async miembros(){const ms=await api("/api/members");
  const form=admin()?`<div class="card"><h3>${ic("users",24)} Registrar miembro</h3><input id="mn" placeholder="Nombre completo"><input id="mu" placeholder="Usuario o correo" autocapitalize="none"><input id="mp" placeholder="Contraseña (mín. 4)"><button class="or" onclick="run(()=>api('/api/members','POST',{name:val('mn'),username:val('mu'),password:val('mp')}))">Registrar miembro</button></div>`:"";
  return form+`<div class="card"><h3>${ms.length} miembros</h3>${ms.map(m=>`<div class="opt"><span class="row"><div class="av" style="width:34px;height:34px">${esc((m.name||"?")[0]).toUpperCase()}</div><span><b>${esc(m.name)}</b> <span class="badge">${m.role==="admin"?"Admin":"Miembro"}</span>${m.username?`<div class="mu" style="font-size:13px">${esc(m.username)}</div>`:""}</span></span>${admin()&&m.role!=="admin"?`<span class="row"><button class="ghost" onclick="resetPw(${m.id})">Nueva clave</button><button class="bad" onclick="if(confirm('¿Eliminar miembro?'))run(()=>api('/api/members/${m.id}','DELETE'))">Eliminar</button></span>`:""}</div>`).join("")}</div>`},

 async resultados(){const els=(await api("/api/elections")).filter(e=>e.status==="closed"||(admin()&&e.status==="open"));
  return els.map(e=>`<div class="card"><div class="row sp"><h3 style="margin:0">${esc(e.title)}</h3><span class="badge ${e.status}">${e.status==="open"?"Parcial (solo admin)":"Final"}</span></div>${bars(e.candidates,cl)}</div>`).join("")||empty("Aún no hay resultados publicados.")},

 async historial(){const[els,act]=await Promise.all([api("/api/elections"),api("/api/activity")]);
  const done=els.filter(e=>e.status==="closed");
  return `<div class="card"><h3>${ic("trophy",24)} Elecciones realizadas</h3>${done.map(e=>{const w=winner(e);return `<div class="opt"><span><b>${esc(e.title)}</b><div class="mu" style="font-size:13px">${fdate(e.date)} · ${total(e.candidates)} votos</div></span><span>${w?`${esc(w.name)}`:"Sin votos"}</span></div>`}).join("")||'<span class="mu">Todavía no hay elecciones finalizadas.</span>'}</div>
  <div class="card"><h3>${ic("clock",24)} Actividad</h3>${timeline(act)}</div>`},

 async config(){
  return `<div class="card"><h3>${ic("user",24)} Mi perfil</h3><p class="mu">Usuario: ${esc(me.username)} · ${admin()?"Administrador":"Miembro"}</p><input id="cn2" value="${esc(me.name)}" placeholder="Nombre"><button class="or" onclick="run(async()=>{await api('/api/profile','POST',{name:val('cn2')});me=await api('/api/me')},render)">Guardar nombre</button></div>
  <div class="card"><h3>${ic("lock",24)} Cambiar contraseña</h3><input id="po" type="password" placeholder="Contraseña actual" autocomplete="current-password"><input id="pn2" type="password" placeholder="Nueva contraseña (mín. 4)" autocomplete="new-password"><button class="or" onclick="run(()=>api('/api/password','POST',{old:$('#po').value,new:$('#pn2').value}))">Cambiar contraseña</button></div>
  <div class="card"><button class="bad" onclick="logout()">${ic("out",18)} Cerrar sesión</button></div>`}
};
function vote(e,c){if(confirm("¿Confirmas tu voto? No se puede cambiar."))run(()=>api(`/api/elections/${e}/vote`,"POST",{candidate_id:c}),render)}
function resetPw(id){const p=prompt("Nueva contraseña para este miembro (mín. 4):");if(p)run(()=>api(`/api/members/${id}/password`,"POST",{password:p}))}
render();
