/* ---------- Rendu : cadre ---------- */
function setHTML(el,html,key){
  if(el._h===html&&el._k===key) return;
  const same=key!==undefined&&el._k===key, vals={};
  const a=document.activeElement;let fid=null,sel=null;
  if(a&&el.contains(a)&&a.id){fid=a.id;try{sel=[a.selectionStart,a.selectionEnd];}catch(e){sel=null;}}
  if(same) el.querySelectorAll('input[id],textarea[id]').forEach(i=>{if(!i.dataset.f&&i.type!=='radio'&&i.type!=='checkbox')vals[i.id]=i.value;});
  const st=el.scrollTop;
  el.innerHTML=html;el._h=html;el._k=key;
  for(const [id,v] of Object.entries(vals)){const i=document.getElementById(id);if(i&&el.contains(i))i.value=v;}
  if(same) el.scrollTop=st;
  if(fid){const f=document.getElementById(fid);if(f&&el.contains(f)){f.focus({preventScroll:true});if(sel&&sel[0]!=null){try{f.setSelectionRange(sel[0],sel[1]);}catch(e){}}}}
}
const NAV={
  admin:[['calendar','Calendrier','cal'],['classes','Classes','teach'],['eleves','Élèves','users'],['personnel','Personnel','card'],['modules','Modules','layers'],['affectations','Affectations','clip'],['examens','Examens','exam'],['annee','Calendrier scolaire','year'],['comptes','Comptes','key'],['historique','Historique','clock'],['params','Paramètres','gear'],['nouveautes','Nouveautés','spark']],
  teacher:[['calendar','Mon horaire','cal'],['mescours','Mes cours','clip'],['dispos','Disponibilités','calok'],['examens','Examens','exam'],['annee','Calendrier scolaire','year'],['profil','Mon profil','user']],
  student:[['calendar','Mon horaire','cal'],['examens','Examens','exam'],['annee','Calendrier scolaire','year'],['profil','Mon profil','user']]
};
function ensureSel(){
  if(S.view==='jour'&&(!S.dayDate||iso(monday(parse(S.dayDate)))!==iso(S.week))) S.dayDate=initDay();
  const vis=visibleRoles();
  // Sur le site, chaque connexion commence dans le rôle du compte (un administrateur arrive dans l’espace administrateur).
  if(siteMode()&&!S._role0){S._role0=true;S.role=vis[0];}
  if(!vis.includes(S.role)) S.role=vis[0];
  if(S.page==='presences') S.page='classes';
  if(!NAV[S.role].some(n=>n[0]===S.page)&&S.page!=='profil') S.page='calendar';
  if(!allLoaded()) return;
  // Un compte enseignant ou élève choisit lui-même l’enseignant ou la classe affichés.
  const a=locked()?myAcct():null;
  if(a&&a.role==='teacher'&&a.ref) S.teacher=a.ref;
  if(a&&a.role==='student'){S.student=a.ref||'';const e=byId(S.data.eleves,a.ref), g=(e&&e.groupe)||(a.fiche&&a.fiche.groupe);if(g)S.group=g;}
  const ts=teachers(), gs=groups();
  if(!a&&ts.length&&!ts.some(t=>t.id===S.teacher)) S.teacher=ts[0].id;
  if(!a&&gs.length&&!gs.some(g=>g.id===S.group)) S.group=gs[0].id;
  if(!a){const els=studentsOf(S.group);if(els.length&&!els.some(e=>e.id===S.student))S.student=els[0].id;}
  if(S.filtre){const k=S.filtre[0],id=S.filtre.slice(2);if((k==='g'&&!gs.some(g=>g.id===id))||(k==='e'&&!ts.some(t=>t.id===id)))S.filtre='';else S.fmode=k;}
  if(S.role==='student') ensureMyRes();
}
/* Résultats de l’élève affiché : il ne peut lire que les siens */
function ensureMyRes(){
  if(!DB||S._mrFor===S.student) return;
  if(unsubMR){try{unsubMR();}catch(e){}unsubMR=null;}
  S._mrFor=S.student;S.data.mesRes={};
  if(!S.student) return;
  const who=S.student;
  unsubMR=col('resultats-eleves').where('eleve','==',who).onSnapshot(q=>{if(S._mrFor!==who)return;const m={},mp={};for(const d of q.docs){const v=d.data();if(v&&v.examen){m[v.examen]=v.v;if(v.pct!=null)mp[v.examen]=v.pct;}}S.data.mesRes=m;S.data.mesPct=mp;schedule();},()=>{});
}
function exampleCount(){let n=0;for(const k of ['cours','enseignants','groupes','eleves','examens','comptes','candidatures','remplacements']) n+=S.data[k].filter(d=>d.exemple).length;n+=Object.values(S.data.dispos).filter(d=>d&&d.exemple).length+Object.values(S.data.resultats).filter(d=>d&&d.exemple).length;return n;}
function renderSide(){
  const nom=(cfg().nom||'Calendrier des cours').trim(), sp=nom.indexOf(' ');
  setHTML($('#brand-text'),siteMode()?`<span class="bn">Caserne‑École</span><small>${esc(nom)}</small>`:sp>0?`${esc(nom.slice(0,sp))}<small>${esc(nom.slice(sp+1))}</small>`:esc(nom));
  $('#ws-label').textContent='Espace '+(S.role==='admin'?'administrateur':S.role==='teacher'?'enseignant':'élève');
  $('.app').classList.toggle('side-mini',S.sideMini);
  $('#logout-btn').hidden=!siteMode();
  const tg=$('#side-toggle'), tl=S.sideMini?'Afficher le menu':'Réduire le menu';
  tg.setAttribute('aria-expanded',String(!S.sideMini));tg.title=tl;tg.querySelector('span').textContent=tl;
  setHTML($('#nav'),NAV[S.role].map(([k,l,i])=>`<li><button type="button" id="nav-${k}" title="${navLbl(k,l)}" data-act="nav" data-page="${k}"${S.page===k?' aria-current="page"':''}>${icon(i)}<span>${navLbl(k,l)}</span>${k==='nouveautes'&&nvUnseen()?`<i class="nav-n" id="nav-n" title="Changements depuis votre dernière visite">${nvUnseen()>9?'9+':nvUnseen()}</i>`:''}</button></li>`).join(''));
  const P=subject(), own=!!P.a||S.role==='admin', sub=(S.role==='student'?'Élève · '+gName(S.group):ROLE_LBL[S.role])+(own?'':' · aperçu');
  setHTML($('#person'),`<button type="button" class="person-btn" id="person-btn" data-act="nav" data-page="profil" title="Mon profil"${S.page==='profil'?' aria-current="page"':''}>${avHTML(P.name,own?S.me.avatarUrl:'','')}<span class="pinfo"><b>${esc(P.name)}</b><small>${esc(sub)}</small></span></button>`);
}
function renderTop(){
  const vis=visibleRoles();
  document.querySelectorAll('.roles [data-role]').forEach(b=>{b.hidden=!vis.includes(b.dataset.role);b.setAttribute('aria-pressed',String(b.dataset.role===S.role));});
  $('.roles').hidden=vis.length<2;
  const demo=!!window.__DEMO_LOCAL&&S.conn==='shared';
  const t=demo?['Démo','Vos modifications restent dans ce navigateur. Sur le vrai site, tout le monde partage le même horaire.']:S.conn==='shared'?['Horaire partagé','Les modifications sont enregistrées en temps réel pour tous les utilisateurs de cette page.']
    :S.conn==='off'?['Hors connexion','Ouvrez la page dans claude.ai, en étant connecté, pour voir les cours et prendre les présences.']
    :['Connexion…','Chargement de l’horaire.'];
  setHTML($('#banner-text'),`<strong>${t[0]}</strong><p>${t[1]}${demo?' <button type="button" class="link" id="demo-reset" data-act="demo-reset">Réinitialiser la démo</button>':''}</p>`);
  const dm=$('#demo'), hide=demoHidden();
  dm.classList.toggle('is-hidden',hide);dm.inert=hide;dm.setAttribute('aria-hidden',String(hide));
}
const demoHidden=()=>S.demoHidden&&S.conn!=='off';
function renderNotices(){
  let h='';
  const n=S.conn==='shared'&&allLoaded()?exampleCount():0;
  if(n&&S.role==='admin'&&S.canAdmin!==false){
    h+=S.confirmClear
      ?`<div class="notice warn"><p>Effacer les ${n} éléments d’exemple (cours, classes, élèves, personnel, examens et présences d’exemple) ? Ce que vous avez ajouté vous-même est conservé.</p><div class="row"><button class="btn sm danger" type="button" data-act="clear-ex-yes"${dis()}>Effacer les exemples</button><button class="btn sm ghost" type="button" data-act="clear-ex-no">Annuler</button></div></div>`
      :`<div class="notice"><p><b>Données d’exemple.</b> Les classes, élèves, membres du personnel, cours et examens affichés montrent le fonctionnement du site. Modifiez-les ou effacez-les pour partir de zéro.</p><div class="row"><button class="btn sm" type="button" data-act="clear-ex">Effacer les exemples</button></div></div>`;
  }
  setHTML($('#notices'),h);
}
const HEAD={
  comptes:['Comptes','Qui ouvre la page, avec quel rôle et quelle fiche.'],
  profil:['Mon profil','Vos informations et votre semaine.'],
  admin:['Calendrier','Les cours et les examens de la semaine pour chaque classe.'],
  teacher:['Mon horaire','Vos cours de la semaine et les présences à prendre.'],
  student:['Mon horaire','Les cours et les examens de votre classe cette semaine.'],
  classes:['Classes','Les élèves, les présences et les cours de chaque classe.'],
  eleves:['Élèves','Les dossiers des élèves et le suivi de leurs présences.'],
  personnel:['Personnel','Les dossiers du personnel, leur statut et leurs présences.'],
  examens:['Examens','Les examens à venir, les résultats à entrer et les reprises.'],
  annee:['Calendrier scolaire','La rentrée, les étapes et les congés de l’année.'],
  modules:['Modules','Les modules du programme, leurs heures et leurs cours.'],
  affectations:['Affectations','Les enseignants requis, les candidatures et les remplacements.'],
  mescours:['Mes cours','Les cours à pourvoir, vos candidatures et vos cours attribués.'],
  dispos:['Mes disponibilités','Les jours où vous pouvez donner des cours.'],
  historique:['Historique','Qui a annulé, déplacé, attribué ou approuvé quoi, et quand.'],
  params:['Paramètres','L’établissement, l’année scolaire et les accès.'],
  nouveautes:['Nouveautés','Ce qui a changé sur le site : nouvelles fonctions, améliorations et corrections.']
};
/* Les mêmes titres, avec le mot « séance », quand l’école a des modules */
const HEAD_AC={
  admin:['Calendrier','Les séances et les examens de la semaine pour chaque classe.'],
  teacher:['Mon horaire','Vos séances de la semaine et les présences à prendre.'],
  student:['Mon horaire','Les séances et les examens de votre classe cette semaine.'],
  classes:['Classes','Les élèves, les présences et les séances de chaque classe.'],
  modules:['Modules','Les modules du programme : leurs cours, leurs examens, leur chargé de cours et les séances de chaque classe.'],
  affectations:['Affectations','Les enseignants requis à chaque séance, les candidatures et les remplacements.'],
  mescours:['Mes séances','Les séances à pourvoir, vos candidatures et vos séances attribuées.']
};
const navLbl=(k,l)=>k==='mescours'&&acad()?'Mes séances':l;
function renderHeading(){
  const h0=S.page==='calendar'?HEAD[S.role]:S.page==='examens'&&S.role==='student'?['Mes examens','Vos prochains examens, vos résultats et vos reprises.']:S.page==='profil'&&S.role==='admin'?['Mon profil','Vos informations et les comptes du site.']:HEAD[S.page];
  const hk=S.page==='calendar'?S.role:S.page, h=acad()&&HEAD_AC[hk]&&h0===HEAD[hk]?HEAD_AC[hk]:h0;
  const show=demoHidden()?`<button type="button" class="demo-show" id="demo-show" data-act="demo" title="Réafficher le bandeau des profils et des données d’exemple">${icon('eye')}Afficher le bandeau</button>`:'';
  const sub=S.page==='calendar'?'':`<p>${h[1]}</p>`;
  const prBtn=S.page==='calendar'&&S.conn==='shared'&&allLoaded()?`<button type="button" class="bell" id="pr-open" data-act="pr-open" aria-label="Imprimer" title="Imprimer l’horaire de la semaine ou la feuille de présences">${icon('print')}</button>`:'';
  const side=show+prBtn+bellHTML();
  setHTML($('#heading'),`<div><h1>${h[0]}</h1>${sub}</div>${side?`<div class="head-side">${side}</div>`:''}`);
}
function renderMain(){
  if(typeof DRAG!=='undefined'&&DRAG&&DRAG.active){pendingMain=true;return;}
  const loading=S.conn==='loading'||(S.conn==='shared'&&!allLoaded());
  const wait=loading?'<div class="empty"><p>Chargement de l’horaire…</p></div>':S.conn==='off'?emptyBox('Horaire indisponible','L’horaire partagé n’est pas accessible dans cette fenêtre. Ouvrez la page dans claude.ai en étant connecté.'):'';
  let html;
  const p=S.page;
  if(p==='calendar'){S._stats=null;const body=wait||(S.role==='admin'?adminMain():S.role==='teacher'?teacherMain():studentMain());html=toolbarHTML()+body;}
  else html=wait||(p==='classes'?classesPage():p==='eleves'?studentsPage():p==='personnel'?staffPage():p==='modules'?modulesPage():p==='affectations'?affPage():p==='mescours'?myCoursesPage():p==='dispos'?disposPage():p==='examens'?examsPage():p==='annee'?yearPage():p==='nouveautes'?newsPage():p==='historique'?historyPage():p==='comptes'?accountsPage():p==='profil'?profilePage():paramsPage());
  const el=$('#main'), key=S.role+'/'+p;
  const before=el._k===key&&el._h!==html&&!reduceMotion()?measureCards(el):null;
  setHTML(el,html,key);
  const pin=S._pin;S._pin=null;
  if(pin) pinRow(pin);
  if(before) glide(el,before,!!pin);
}
/* Ligne d’une classe : quand on isole une classe puis qu’on revient à toutes les classes,
   la ligne de cette classe revient exactement à l’endroit de l’écran où on l’avait cliquée. */
function rowTop(id){const b=document.getElementById('pick-'+id), r=b&&b.closest('.wk-class');return r?r.getBoundingClientRect().top:null;}
function pinRow(pin){const t=rowTop(pin.id);if(t!=null) window.scrollBy({top:t-pin.top,behavior:'instant'});}
/* Comme l’arbre de l’Encyclopédie : les cartes glissent vers leur nouvelle place, la hauteur suit,
   les nouvelles cartes apparaissent en fondu. */
const RM=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
const reduceMotion=()=>!!(RM&&RM.matches);
function measureCards(el){
  const cards=new Map();
  el.querySelectorAll('.cc[data-key]').forEach(n=>cards.set(n.dataset.key,n.getBoundingClientRect()));
  const w=el.querySelector('.week');
  return {cards,h:w?w.getBoundingClientRect().height:null};
}
function glide(el,b,keepH){
  const w=el.querySelector('.week');
  if(w&&b.h!=null&&!keepH){
    const h=w.getBoundingClientRect().height;
    if(Math.abs(h-b.h)>2){
      w.style.height=b.h+'px';w.style.overflow='hidden';w.getBoundingClientRect();
      w.style.transition='height 240ms ease-out';w.style.height=h+'px';
      const done=()=>{w.style.height='';w.style.overflow='';w.style.transition='';};
      w.addEventListener('transitionend',done,{once:true});setTimeout(done,340);
    }
  }
  el.querySelectorAll('.cc[data-key]').forEach(n=>{
    const r0=b.cards.get(n.dataset.key);
    if(!r0){n.classList.add('enter');return;}
    const r=n.getBoundingClientRect(), dx=r0.left-r.left, dy=r0.top-r.top;
    if(Math.abs(dx)<1&&Math.abs(dy)<1) return;
    n.style.transition='none';n.style.transform=`translate(${dx}px,${dy}px)`;n.getBoundingClientRect();
    n.style.transition='transform 240ms ease-out';n.style.transform='';
    const clear=()=>{n.style.transition='';};
    n.addEventListener('transitionend',clear,{once:true});setTimeout(clear,340);
  });
}
function render(){choreMemo=new Map();ensureSel();renderSide();renderTop();renderNotices();renderHeading();renderMain();renderDrawer();}
let rq=false;
function schedule(){if(rq)return;rq=true;setTimeout(()=>{rq=false;render();},16);}

