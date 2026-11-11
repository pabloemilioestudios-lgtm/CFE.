const API=(window.CFE_API||"").replace(/\/$/,""),NAME=window.CFE_NAME||"Consejo Familiar Electoral";
const $=s=>document.querySelector(s),val=i=>$("#"+i).value.trim();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
let token=localStorage.getItem("cfe_t")||sessionStorage.getItem("cfe_t"),me=null,view="inicio",tab="login",pending=0;
if(location.hash.startsWith("#token=")){token=decodeURIComponent(location.hash.slice(7));localStorage.setItem("cfe_t",token);history.replaceState(null,"",location.pathname)}
function toast(m){const t=$("#toast");t.textContent=m;t.style.display="block";setTimeout(()=>t.style.display="none",3500)}
async function api(p,m="GET",b){
  const r=await fetch(API+p,{method:m,headers:{"Content-Type":"application/json",...(token?{Authorization:"Bearer "+token}:{})},body:b?JSON.stringify(b):undefined});
  const d=await r.json().catch(()=>({}));
  if(!r.ok){if(r.status===401&&token&&!p.startsWith("/api/log"))logout();throw new Error(d.error||"Error de conexión")}
  return d}
async function run(fn,after){try{await fn();toast2("Listo");after?after():load()}catch(e){toast(e.message)}}
function toast2(m){const t=$("#toast");t.style.background="#16a34a";t.textContent=m;t.style.display="block";setTimeout(()=>{t.style.display="none";t.style.background=""},1500)}
function logout(){token=null;me=null;localStorage.removeItem("cfe_t");sessionStorage.removeItem("cfe_t");render()}
function session(d){token=d.token;me=d.user;(($("#rm")||{}).checked===false?sessionStorage:localStorage).setItem("cfe_t",token);view="inicio";render()}
const admin=()=>me&&me.role==="admin";
const go=v=>{view=v;render()};
const ago=s=>{const m=Math.max(0,(Date.now()-new Date(s.replace(" ","T")+"Z"))/6e4);return m<60?`Hace ${Math.round(m)} min`:m<1440?`Hace ${Math.round(m/60)} h`:`Hace ${Math.round(m/1440)} d`};
const fdate=d=>d?new Date(d+"T12:00").toLocaleDateString("es",{day:"numeric",month:"long",year:"numeric"}):"Por definir";

function authView(){
  const reg=tab==="reg";
  $("#app").innerHTML=`<div class="authwrap"><div class="brand"><img src="logo.png" alt="CFE"><p><i>Participación • Transparencia • Unidad</i></p><p>Organizamos, decidimos y construimos juntos una <b style="color:#f59e0b">familia</b> más participativa.</p></div>
  <div class="formside"><div class="auth"><h2>Bienvenido al<br>${esc(NAME)}</h2>
  <p style="text-align:center;margin-top:-6px">Inicia sesión en tu cuenta o regístrate para ser parte de nuestro consejo.</p>
  <div class="tabs"><button class="${reg?"":"on"}" onclick="tab='login';render()">👤 Iniciar sesión</button><button class="${reg?"on":""}" onclick="tab='reg';render()">👥 Registrar familiar</button></div>
  ${reg?`<input id="n" placeholder="Nombre completo" autocomplete="name">`:""}
  <input id="u" placeholder="${reg?"Correo electrónico":"Correo o usuario"}" autocomplete="username" autocapitalize="none">
  <input id="p" type="password" placeholder="Contraseña${reg?" (mín. 6)":""}" autocomplete="${reg?"new-password":"current-password"}" onkeydown="if(event.key==='Enter')enter()">
  ${reg?"":`<div class="row sp" style="margin-bottom:12px"><label><input id="rm" type="checkbox" checked style="width:auto;margin:0 6px 0 0">Recordar mi cuenta</label><button class="link lnk" onclick="toast('Pide al administrador que restablezca tu contraseña desde Miembros.')">¿Olvidaste tu contraseña?</button></div>`}
  <button class="go" onclick="enter()">${reg?"Crear mi cuenta":"Iniciar sesión"}</button>
  <p style="text-align:center;margin:12px 0 0">o continúa con</p>
  <div class="soc"><button title="GitHub" onclick="location.href=API+'/api/oauth/github'">🐙</button><button title="Google" onclick="location.href=API+'/api/oauth/google'">G</button><button title="Con correo" onclick="tab=reg?'login':'reg';render()">👤</button></div>
  <div class="note">🛡️ Tu información está protegida y solo se usará para fines del ${esc(NAME)}.</div></div></div></div>`}
async function enter(){try{session(tab==="reg"?await api("/api/register","POST",{name:val("n"),username:val("u"),password:$("#p").value}):await api("/api/login","POST",{username:val("u"),password:$("#p").value}))}catch(e){toast(e.message)}}

const NAV=[["inicio","🏠","Inicio"],["elecciones","🗳️","Elecciones"],["candidatos","🧑‍💼","Candidatos"],["encuestas","📝","Encuestas"],["miembros","👥","Miembros"],["resultados","📊","Resultados"],["historial","🕘","Historial"],["config","⚙️","Configuración"]];
async function render(){
  if(!token)return authView();
  if(!me){try{me=await api("/api/me")}catch(e){return authView()}}
  try{pending=(await api("/api/dashboard")).pending}catch{}
  $("#app").innerHTML=`<aside><img class="logo" src="logo.png" alt="">
   ${NAV.map(n=>`<button class="nav ${view===n[0]?"on":""}" onclick="go('${n[0]}')"><span>${n[1]}</span>${n[2]}</button>`).join("")}
   <div class="shield">🛡️<br><b>Transparencia</b><br>en cada decisión</div>
   <div class="me"><b>${esc(me.name)}</b><small>${admin()?"Administrador":"Miembro"}</small></div></aside>
   <div class="col"><header><span>Participación • Transparencia • Unidad</span><div class="r"><button class="bell" onclick="go('elecciones')" title="Pendientes">🔔${pending?`<b>${pending}</b>`:""}</button><button class="ghost" onclick="logout()">Cerrar sesión ⇥</button></div></header><main id="v"></main></div>`;
  load()}
async function load(){const el=$("#v");if(!el)return;try{el.innerHTML=await VIEWS[view]()}catch(e){toast(e.message)}}

const total=a=>a.reduce((s,x)=>s+(x.votes||0),0);
const bars=(items,label)=>{const t=total(items);return items.map(o=>{const pc=t?Math.round(o.votes/t*100):0;return `<div class="opt blk"><div class="row sp"><span>${label(o)}</span><b>${o.votes} · ${pc}%</b></div><div class="bar"><i style="width:${pc}%"></i></div></div>`}).join("")+`<small class="mu">${t} voto(s)</small>`};
const cl=c=>`<span class="dot" style="background:${esc(c.color||"#888")}"></span>${esc(c.name)} <small class="mu">${esc(c.party||"Independiente")}</small>`;
const empty=t=>`<div class="card mu">${t}</div>`;
const lbl={draft:"Borrador",open:"Votación abierta",closed:"Finalizada"};
const winner=e=>{const c=[...e.candidates].sort((a,b)=>b.votes-a.votes)[0];return c&&c.votes?c:null};

const VIEWS={
 async inicio(){const d=await api("/api/dashboard");
  const st=(i,n,l,b)=>`<div class="stat"><span class="ic">${i}</span><div><b>${n}</b><span>${l}</span></div>${b?`<button class="link" onclick="go('${b[0]}')">${b[1]} ›</button>`:""}</div>`;
  const n=d.next;
  return `<div class="banner"><img src="logo.png" alt=""><div><small>Bienvenido al</small><h1>${esc(NAME)}</h1><i>Juntos construimos una familia más participativa</i></div></div>
  <div class="stats">${st("👥",d.members,"Miembros registrados",admin()&&["miembros","Ver"])}${st("🗳️",d.open,"Elección activa",["elecciones","Ver detalles"])}${st("✅",d.participation+"%","Participación actual")}${st("📊",d.closed,"Elecciones realizadas",["historial","Ver historial"])}</div>
  <div class="grid3"><div class="card"><h3>📅 Próxima elección</h3>${n?`<p class="mu" style="margin:0">Elección para:</p><h2 style="margin:4px 0">${esc(n.title)}</h2><p class="mu">Fecha: ${fdate(n.date)}<br>Inicio de votación: ${n.status==="open"?"En curso":"Próximamente"}</p><button class="or" onclick="go('elecciones')">▶ Ver detalles</button>`:`<p class="mu">No hay elecciones programadas.</p>${admin()?`<button class="or" onclick="go('elecciones')">Crear elección</button>`:""}`}</div>
  <div class="card"><h3>⚡ Acciones rápidas</h3><div class="qa">${admin()?`<button onclick="go('miembros')">👥 Gestionar miembros</button><button onclick="go('elecciones')">🗳️ Crear elección</button>`:`<button onclick="go('elecciones')">🗳️ Votar</button><button onclick="go('encuestas')">📝 Encuestas</button>`}<button onclick="go('resultados')">📊 Ver resultados</button><button onclick="go('config')">⚙️ Configuración</button></div></div>
  <div class="card"><div class="row sp"><h3>🕘 Actividad reciente</h3><button class="link" onclick="go('historial')">Ver todo ›</button></div><div class="tl">${d.recent.map(a=>`<div><div class="row sp"><b>${esc(a.text)}</b><small class="mu">${ago(a.created)}</small></div><small class="mu">${esc(a.detail)}</small></div>`).join("")||`<span class="mu">Sin actividad todavía</span>`}</div></div></div>
  <div class="foot">Una familia unida, decide mejor</div>`},

 async elecciones(){const els=await api("/api/elections");
  const form=admin()?`<div class="card"><h3>Crear elección</h3><input id="et" placeholder="Título (ej. Presidente Familiar)"><input id="ed" placeholder="Descripción (opcional)"><label class="mu">Fecha</label><input id="edt" type="date"><button class="or" onclick="run(()=>api('/api/elections','POST',{title:val('et'),description:val('ed'),date:val('edt')}))">Crear elección</button></div>`:"";
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
  const form=admin()?`<div class="card"><h3>Crear encuesta previa</h3><input id="qq" placeholder="Pregunta"><textarea id="qo" rows="4" placeholder="Una opción por línea (mínimo 2)"></textarea><button class="or" onclick="run(()=>api('/api/polls','POST',{question:val('qq'),options:$('#qo').value.split('\\n')}))">Publicar encuesta</button></div>`:"";
  return form+(qs.map(q=>`<div class="card"><div class="row sp"><h3 style="margin:0">${esc(q.question)}</h3><span class="badge ${q.status}">${q.status==="open"?"Abierta":"Cerrada"}</span></div><div style="margin-top:8px">
   ${q.options.some(o=>o.votes!==null)?bars(q.options,o=>esc(o.text)):q.options.map(o=>`<div class="opt">${esc(o.text)}${q.status==="open"?`<button class="or" onclick="run(()=>api('/api/polls/${q.id}/vote','POST',{option_id:${o.id}}),render)">Elegir</button>`:""}</div>`).join("")}</div>
   ${admin()?`<div class="row" style="margin-top:10px"><button class="ghost" onclick="run(()=>api('/api/polls/${q.id}/status','POST',{status:'${q.status==="open"?"closed":"open"}'}))">${q.status==="open"?"Cerrar":"Reabrir"}</button><button class="bad" onclick="if(confirm('¿Eliminar encuesta?'))run(()=>api('/api/polls/${q.id}','DELETE'))">Eliminar</button></div>`:""}</div>`).join("")||empty("No hay encuestas."))},

 async miembros(){const ms=await api("/api/members");
  const form=admin()?`<div class="card"><h3>Registrar miembro</h3><input id="mn" placeholder="Nombre completo"><input id="mu" placeholder="Usuario o correo" autocapitalize="none"><input id="mp" placeholder="Contraseña (mín. 4)"><button class="or" onclick="run(()=>api('/api/members','POST',{name:val('mn'),username:val('mu'),password:val('mp')}))">Registrar miembro</button></div>`:"";
  return form+`<div class="card"><h3>${ms.length} miembros</h3>${ms.map(m=>`<div class="opt"><span><b>${esc(m.name)}</b> <span class="badge">${m.role==="admin"?"Admin":"Miembro"}</span>${m.username?`<div class="mu" style="font-size:13px">${esc(m.username)}</div>`:""}</span>${admin()&&m.role!=="admin"?`<span class="row"><button class="ghost" onclick="resetPw(${m.id})">Nueva clave</button><button class="bad" onclick="if(confirm('¿Eliminar miembro?'))run(()=>api('/api/members/${m.id}','DELETE'))">Eliminar</button></span>`:""}</div>`).join("")}</div>`},

 async resultados(){const els=(await api("/api/elections")).filter(e=>e.status==="closed"||(admin()&&e.status==="open"));
  return els.map(e=>`<div class="card"><div class="row sp"><h3 style="margin:0">${esc(e.title)}</h3><span class="badge ${e.status}">${e.status==="open"?"Parcial (solo admin)":"Final"}</span></div>${bars(e.candidates,cl)}</div>`).join("")||empty("Aún no hay resultados publicados.")},

 async historial(){const[els,act]=await Promise.all([api("/api/elections"),api("/api/activity")]);
  const done=els.filter(e=>e.status==="closed");
  return `<div class="card"><h3>Elecciones realizadas</h3>${done.map(e=>{const w=winner(e);return `<div class="opt"><span><b>${esc(e.title)}</b><div class="mu" style="font-size:13px">${fdate(e.date)} · ${total(e.candidates)} votos</div></span><span>${w?`🏆 ${esc(w.name)}`:"Sin votos"}</span></div>`}).join("")||'<span class="mu">Todavía no hay elecciones finalizadas.</span>'}</div>
  <div class="card"><h3>Actividad</h3><div class="tl">${act.map(a=>`<div><div class="row sp"><b>${esc(a.text)}</b><small class="mu">${ago(a.created)}</small></div><small class="mu">${esc(a.detail)}</small></div>`).join("")}</div></div>`},

 async config(){
  return `<div class="card"><h3>Mi perfil</h3><p class="mu">Usuario: ${esc(me.username)} · ${admin()?"Administrador":"Miembro"}</p><input id="cn2" value="${esc(me.name)}" placeholder="Nombre"><button class="or" onclick="run(async()=>{await api('/api/profile','POST',{name:val('cn2')});me=await api('/api/me')},render)">Guardar nombre</button></div>
  <div class="card"><h3>Cambiar contraseña</h3><input id="po" type="password" placeholder="Contraseña actual" autocomplete="current-password"><input id="pn2" type="password" placeholder="Nueva contraseña (mín. 4)" autocomplete="new-password"><button class="or" onclick="run(()=>api('/api/password','POST',{old:$('#po').value,new:$('#pn2').value}))">Cambiar contraseña</button></div>
  <div class="card"><button class="bad" onclick="logout()">Cerrar sesión</button></div>`}
};
function vote(e,c){if(confirm("¿Confirmas tu voto? No se puede cambiar."))run(()=>api(`/api/elections/${e}/vote`,"POST",{candidate_id:c}),render)}
function resetPw(id){const p=prompt("Nueva contraseña para este miembro (mín. 4):");if(p)run(()=>api(`/api/members/${id}/password`,"POST",{password:p}))}
render();
