/* ---------- Rendu : cadre ---------- */
let cfgSeen=null, cfgN=0;
const cfgVer=()=>{if(S.data.config!==cfgSeen){cfgSeen=S.data.config;cfgN++;}return cfgN;};
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
/* Menu : [page, libellé, icône, section qui commence à cette entrée, pages réunies sous cette entrée (onglets), étiquette]
   Une entrée qui réunit plusieurs pages les montre en onglets à côté du titre ; elle s’ouvre sur sa première page. */
const NAV={
  admin:[['calendar','Calendrier','cal','Horaire',['calendar','annee']],['affectations','Affectations','clip'],['classes','Classes','teach','École'],['eleves','Élèves et personnel','users',null,['eleves','personnel']],['formation','Formation','check'],['modules','Modules et examens','layers','Ressources',['modules','examens']],['stock','Stock','box'],['compta','Compta','coin'],['comptes','Comptes','key','Administration'],['historique','Historique','clock'],['params','Paramètres','gear'],['nouveautes','Nouveautés','spark']],
  teacher:[['calendar','Mon horaire','cal',null,['calendar','annee']],['mescours','Mes cours','clip'],['dispos','Disponibilités','calok'],['examens','Examens','exam'],['formation','Évaluations','check'],['stock','Matériel','box'],['profil','Mon profil','user']],
  service:[['recrues','Mes recrues','users']],
  student:[['calendar','Mon horaire','cal',null,['calendar','annee']],['examens','Examens','exam'],['formation','Ma formation','check'],['profil','Mon profil','user']]
};
const TAB_LBL={calendar:'Horaire',annee:'Année scolaire',eleves:'Élèves',personnel:'Personnel',modules:'Modules',examens:'Examens'};
/* L’entrée du menu qui contient une page (elle-même, ou celle qui la réunit avec d’autres) */
/* Entrées masquées dans Paramètres (administration seulement ; jamais le calendrier, les paramètres ni les nouveautés) */
const navHidden=r=>r==='admin'?(cfg().menuMasque||[]).filter(k=>!['calendar','params','nouveautes'].includes(k)):r==='teacher'&&!(skCfg().perms.sortie||skCfg().perms.bris)?['stock']:[];
const navList=r=>NAV[r].filter(n=>!navHidden(r).includes(n[0]));
/* Le menu affiché : une section masquée en entier disparaît ; sinon son titre passe à sa première entrée visible */
function navShown(){const hid=navHidden(S.role), out=[];let pend='';for(const n of NAV[S.role]){if(n[3])pend=n[3];if(hid.includes(n[0]))continue;const x=[...n];x[3]=pend;out.push(x);pend='';}return out;}
const navGroup=p=>navList(S.role).find(n=>n[0]===p||(n[4]&&n[4].includes(p)));
function ensureSel(){
  if(S.view==='jour'&&(!S.dayDate||iso(monday(parse(S.dayDate)))!==iso(S.week))) S.dayDate=initDay();
  const vis=visibleRoles();
  // Sur le site, chaque connexion commence dans le rôle du compte (un administrateur arrive dans l’espace administrateur).
  if(siteMode()&&!S._role0){S._role0=true;S.role=vis[0];}
  if(!vis.includes(S.role)) S.role=vis[0];
  if(S.page==='presences') S.page='classes';
  if(!navGroup(S.page)&&S.page!=='profil') S.page=S.role==='service'?'recrues':'calendar';
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
  if(S.role!=='admin') ensureMine();
  foMine();
  svcMine();
}
/* Résultats de l’élève affiché : il ne peut lire que les siens */
function ensureMyRes(){
  if(!DB||S._mrFor===S.student) return;
  if(unsubMR){try{unsubMR();}catch(e){}unsubMR=null;}
  S._mrFor=S.student;S.data.mesRes={};
  if(S.archive){const m={},mp={};for(const v of S.archive.resEl) if(v&&v.eleve===S.student&&v.examen){m[v.examen]=v.v;if(v.pct!=null)mp[v.examen]=v.pct;}S.data.mesRes=m;S.data.mesPct=mp;return;}
  if(!S.student) return;
  const who=S.student;
  unsubMR=col('resultats-eleves').where('eleve','==',who).onSnapshot(q=>{if(S._mrFor!==who)return;const m={},mp={};for(const d of q.docs){const v=d.data();if(v&&v.examen){m[v.examen]=v.v;if(v.pct!=null)mp[v.examen]=v.pct;}}S.data.mesRes=m;S.data.mesPct=mp;schedule();},()=>{});
}
function exampleCount(){let n=0;for(const k of ['cours','enseignants','groupes','eleves','examens','comptes','candidatures','remplacements','stock','stockMvt','compta','factures','paie','stockModeles','stockFourn','stockCmd','stockRep','stockCpt','grilles','evals','questions','blancs','tentatives']) n+=(S.data[k]||[]).filter(d=>d.exemple).length;n+=Object.values(S.data.dispos).filter(d=>d&&d.exemple).length+Object.values(S.data.resultats).filter(d=>d&&d.exemple).length;return n;}
function renderSide(){
  const nom=(cfg().nomCourt||cfg().nom||'').trim();
  setHTML($('#brand-text'),`<span class="bn">Pompier<i>Note</i></span><small>${nom?esc(nom):'v2'}</small>`);
  $('#ws-label').textContent='Espace '+(S.role==='admin'?'administrateur':S.role==='teacher'?'enseignant':S.role==='service'?'service incendie':'élève');
  $('.app').classList.toggle('side-mini',S.sideMini);
  $('#logout-btn').hidden=!siteMode();
  const tg=$('#side-toggle'), tl=S.sideMini?'Afficher le menu':'Réduire le menu';
  tg.setAttribute('aria-expanded',String(!S.sideMini));tg.title=tl;tg.querySelector('span').textContent=tl;
  const cur=(navGroup(S.page)||[])[0], mode=SUBNAV[S.page]?S.page:'main';
  setHTML($('#nav'),mode!=='main'?subNavHTML(mode):navShown().map(([k,l,i,sec,,todo])=>`${sec?`<li class="nav-sec">${sec}</li>`:''}<li><button type="button" id="nav-${k}" title="${navLbl(k,l)}${todo?' · '+todo:''}" data-act="nav" data-page="${k}"${cur===k?' aria-current="page"':''}>${icon(i)}<span>${navLbl(k,l)}</span>${todo?`<i class="nav-todo">${todo}</i>`:''}${k==='nouveautes'&&nvUnseen()?`<i class="nav-n" id="nav-n" title="Changements depuis votre dernière visite">${nvUnseen()>9?'9+':nvUnseen()}</i>`:''}</button></li>`).join(''));
  /* passage d’un menu à l’autre : le contenu des entrées glisse (la bulle rouge, elle, glisse jusqu’à la nouvelle entrée) */
  if(navMode&&navMode!==mode){const n=$('#nav');n.classList.remove('nav-in','nav-back-in');void n.offsetWidth;n.classList.add(mode!=='main'?'nav-in':'nav-back-in');}
  navMode=mode;
  const P=subject(), own=!!P.a||S.role==='admin', sub=(S.role==='student'?'Élève · '+gName(S.group):ROLE_LBL[S.role])+(own?'':' · aperçu');
  placeNavBulle();
  setHTML($('#person'),`<button type="button" class="person-btn" id="person-btn" data-act="nav" data-page="profil" title="Mon profil"${S.page==='profil'?' aria-current="page"':''}>${avHTML(P.name,own?S.me.avatarUrl:'','')}<span class="pinfo"><b>${esc(P.name)}</b><small>${esc(sub)}</small></span></button>`);
}
/* Pages à sous-menu (Paramètres, Stock, Compta) : le menu de gauche cède la place aux sections de la page ;
   l’entrée en tête ramène au menu, sur la page d’avant. Une section : { k, l, i, sec (titre avant elle), n (pastille), bad, nt } */
let navMode='';
const SUBNAV={
  params:{lbl:'Paramètres',key:'ps',id:'ps',tabs:()=>PS_TABS.map(([k,l,i])=>{const n=k==='annonces'?annList().filter(a=>annState(a)==='cours').length:0;return {k,l,i,n,nt:n?pl(n,'annonce en cours','annonces en cours'):''};})},
  stock:{lbl:'Stock',key:'sk',id:'sk',tabs:stockTabs},
  compta:{lbl:'Compta',key:'cp',id:'cpt',tabs:comptaTabs},
  formation:{lbl:'Formation',key:'fo',id:'fo',tabs:foTabs}
};
function subNavHTML(p){
  const d=SUBNAV[p], ts=d.tabs(), hit=ts.find(t=>t.k===S.pg[d.key]||(t.sub||[]).some(s=>s.k===S.pg[d.key])), cur=(hit||ts[0]).k, lbl=S.role==='teacher'&&p==='stock'?'Matériel':p==='formation'&&S.role!=='admin'?(S.role==='teacher'?'Évaluations':'Ma formation'):(S.role==='admin'&&menuNom(p))||d.lbl;
  return `<li><button type="button" class="nav-back" id="nav-${p}" title="Revenir au menu" data-act="nav" data-page="${esc(S.navFrom&&S.navFrom!==p?S.navFrom:'calendar')}">${icon('left')}<span>${esc(lbl)}</span></button></li>`
    +ts.map(t=>`${t.sec?`<li class="nav-sec">${t.sec}</li>`:''}<li><button type="button" id="${d.id}-${t.k}" title="${t.l}${t.nt?' · '+t.nt:''}" data-act="pg-set" data-k="${d.key}" data-v="${t.k}"${cur===t.k?' aria-current="page"':''}>${icon(t.i)}<span>${t.l}</span>${t.n?`<i class="nav-todo${t.bad?' bad':''}"${t.nt?` title="${esc(t.nt)}"`:''}>${t.n}</i>`:''}</button></li>`).join('');
}
/* Page ouverte : la bulle rouge (comme le logo) glisse jusqu’à l’entrée choisie ; pas d’animation au premier placement.
   Menu réduit : un carré de la taille du logo, centré sur l’icône. */
let bulleAt='', bulleMini=null;
function placeNavBulle(){
  const sb=$('.sidebar'), bu=$('#nav-bulle');if(!sb||!bu) return;
  /* le menu change de largeur (animé) : on recale la bulle une fois la largeur finale atteinte */
  if(bulleMini!==null&&bulleMini!==S.sideMini) setTimeout(placeNavBulle,280);
  bulleMini=S.sideMini;
  const b=$('#nav button[aria-current="page"]');
  if(!b||!b.offsetParent){bu.classList.remove('on');return;}
  const rs=sb.getBoundingClientRect(), r=b.getBoundingClientRect(), mini=S.sideMini&&getComputedStyle($('.nav')).flexDirection==='column';
  const w=mini?36:r.width, h=mini?36:r.height, x=r.left-rs.left+sb.scrollLeft+(r.width-w)/2, y=r.top-rs.top+sb.scrollTop+(r.height-h)/2;
  const k=[x,y,w,h].map(Math.round).join(',');
  if(k===bulleAt&&bu.classList.contains('on')) return;
  const first=!bulleAt;bulleAt=k;
  if(first) bu.classList.add('still');
  bu.style.cssText=`width:${w}px;height:${h}px;transform:translate(${x}px,${y}px)`;
  bu.classList.add('on');
  if(first){bu.getBoundingClientRect();bu.classList.remove('still');}
}
window.addEventListener('resize',()=>placeNavBulle());
$('.app').addEventListener('transitionend',e=>{if(e.target===$('.app'))placeNavBulle();});
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>placeNavBulle());
function renderTop(){
  const vis=visibleRoles();
  document.querySelectorAll('.roles [data-role]').forEach(b=>{b.hidden=!vis.includes(b.dataset.role);b.setAttribute('aria-pressed',String(b.dataset.role===S.role));});
  $('.roles').hidden=vis.length<2;
  const demo=!!window.__DEMO_LOCAL&&S.conn==='shared';
  const t=S.archive?['Archive · '+S.archive.nom,'Vous consultez une année clôturée, en lecture seule.']:demo?['Démo','Vos modifications restent dans ce navigateur. Sur le vrai site, tout le monde partage le même horaire.']:S.conn==='shared'?['Horaire partagé','Les modifications sont enregistrées en temps réel pour tous les utilisateurs de cette page.']
    :S.conn==='off'?['Hors connexion','Ouvrez la page dans claude.ai, en étant connecté, pour voir les cours et prendre les présences.']
    :['Connexion…','Chargement de l’horaire.'];
  setHTML($('#banner-text'),`<strong>${t[0]}</strong><p>${t[1]}${demo?' <button type="button" class="link" id="demo-reset" data-act="demo-reset">Réinitialiser la démo</button>':''}</p>`);
  const dm=$('#demo'), hide=demoHidden();
  dm.classList.toggle('is-hidden',hide);dm.inert=hide;dm.setAttribute('aria-hidden',String(hide));
}
const demoHidden=()=>S.demoHidden&&S.conn!=='off';
function renderNotices(){
  let h='';
  if(S.offline&&S.conn==='shared'&&!S.archive) h+='<div class="notice warn" id="offline-note" role="status"><p><b>Hors ligne.</b> Vous pouvez continuer : présences, évaluations et autres modifications sont gardées sur cet appareil et partiront au retour du réseau.</p></div>';
  /* les annonces (Paramètres > Annonces), ou la barre d’une archive consultée ; hors du bandeau de démo,
     pour rester visibles quand on le masque */
  let ah='';
  if(S.archive) ah=`<div class="notice arch" id="arch-bar" role="status"><p><b>Archive · ${esc(S.archive.nom)}</b> — vous consultez une année clôturée${S.archive.debut&&S.archive.fin?` (du ${esc(shortDate(parse(S.archive.debut)))} au ${esc(shortDate(parse(S.archive.fin)))})`:''}, en lecture seule.</p><button class="btn sm primary" type="button" id="arch-exit" data-act="arch-exit">Revenir à l’année en cours</button></div>`;
  else ah=annoncesHTML();
  const n=S.conn==='shared'&&allLoaded()?exampleCount():0;
  if(n&&S.role==='admin'&&S.canAdmin!==false){
    h+=S.confirmClear
      ?`<div class="notice warn"><p>Effacer les ${n} éléments d’exemple (cours, classes, élèves, personnel, examens et présences d’exemple) ? Ce que vous avez ajouté vous-même est conservé.</p><div class="row"><button class="btn sm danger" type="button" data-act="clear-ex-yes"${dis()}>Effacer les exemples</button><button class="btn sm ghost" type="button" data-act="clear-ex-no">Annuler</button></div></div>`
      :`<div class="notice"><p><b>Données d’exemple.</b> Les classes, élèves, membres du personnel, cours et examens affichés montrent le fonctionnement du site. Modifiez-les ou effacez-les pour partir de zéro.</p><div class="row"><button class="btn sm" type="button" data-act="clear-ex">Effacer les exemples</button></div></div>`;
  }
  setHTML($('#notices'),h);
  setHTML($('#annonces'),ah);
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
  stock:['Stock','Le matériel et les équipements de l’école : inventaire, dotations, mouvements et inspections.'],
  params:['Paramètres','L’établissement, l’année scolaire et les accès.'],
  nouveautes:['Nouveautés','Ce qui a changé sur le site : nouvelles fonctions, améliorations et corrections.'],
  compta:['Compta','L’argent de l’école : frais des élèves, factures, paie des instructeurs, dépenses et budget.'],
  recrues:['Mes recrues','La présence, les résultats et le dossier de vos recrues, et les factures de votre service.'],
  formation:['Formation','Évaluations pratiques, carnets de compétences, examens blancs, certificats et dossier ENPQ.']
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
const navLbl=(k,l)=>(S.role==='admin'&&menuNom(k))||(k==='mescours'&&acad()?'Mes séances':l);
/* Barre de la page affichée dans la barre du titre (pour la redessiner seule, par exemple quand on ouvre la cloche) */
let hdTools={k:'',html:''};
function renderHeading(){
  const h0=S.page==='calendar'?HEAD[S.role]:S.page==='examens'&&S.role==='student'?['Mes examens','Vos prochains examens, vos résultats et vos reprises.']:S.page==='profil'&&S.role==='admin'?['Mon profil','Vos informations et les comptes du site.']:HEAD[S.page];
  const hk=S.page==='calendar'?S.role:S.page, h1=acad()&&HEAD_AC[hk]&&h0===HEAD[hk]?HEAD_AC[hk]:h0, nm=S.role==='admin'?menuNom(S.page):'', h=nm?[nm,h1[1]]:h1;
  const show=demoHidden()?`<button type="button" class="demo-show" id="demo-show" data-act="demo" title="Réafficher le bandeau des profils et des données d’exemple" aria-label="Afficher le bandeau">${icon('eye')}<span class="ds-t">Afficher le bandeau</span></button>`:'';
  const prBtn=S.page==='calendar'&&S.conn==='shared'&&allLoaded()?`<button type="button" class="bell" id="pr-open" data-act="pr-open" aria-label="Imprimer" title="Imprimer l’horaire de la semaine ou la feuille de présences">${icon('print')}</button>`:'';
  /* affichage des listes (Liste, Cartes, Compact) : à côté de la cloche */
  const vmode=viewMode();
  const side=svBtnHTML()+(vmode?viewSwitchHTML(vmode):'')+show+prBtn+qrBtnHTML()+bellHTML();
  /* Calendrier : la barre de l’horaire (remplie par renderMain) se place dans la barre du titre, sur la même ligne */
  const cal=S.page==='calendar', g=navGroup(S.page), tabs=g&&g[4]&&g[4].length>1?g[4]:null;
  /* entrée qui réunit plusieurs pages : le titre est celui de l’entrée, et ses pages sont des onglets à côté */
  const title=tabs?navLbl(g[0],g[1]):h[0];
  const tabsHTML=tabs?`<div class="seg pg-tabs" role="group" aria-label="${esc(title)}">${tabs.map(p=>`<button type="button" id="tab-${p}" data-act="nav" data-page="${p}" aria-pressed="${S.page===p}">${TAB_LBL[p]}</button>`).join('')}</div>`:'';
  const hd=$('#heading');
  hd.classList.toggle('has-tabs',!!tabs);
  setHTML(hd,`<div class="ph-t"><div class="ph-row"><h1 title="${esc(h[1]||'')}">${title}</h1>${tabsHTML}</div></div><div class="ph-tools" id="hd-tools"></div>${side?`<div class="head-side">${side}</div>`:''}`);
  const ht=$('#hd-tools');if(ht&&ht._h===undefined&&hdTools.k===S.role+'/'+S.page) setHTML(ht,hdTools.html);
  fitHeading();
}
/* La barre du titre tient sur une ligne si tout y entre ; sinon les libellés raccourcissent ; sinon la barre de la page passe sur une deuxième ligne */
function fitHeading(){
  const h=$('#heading'), t=$('#hd-tools');if(!h) return;
  h.classList.remove('hd-short','hd-two');
  if(!t||!t.firstElementChild||!h.offsetParent) return;
  const over=()=>t.scrollWidth>t.clientWidth+1||h.scrollWidth>h.clientWidth+1;
  if(over()) h.classList.add('hd-short');
  if(over()) h.classList.add('hd-two');
}
window.addEventListener('resize',()=>fitHeading());
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>fitHeading());
/* La première barre d’outils d’une page (au premier niveau) monte dans la barre du titre */
const _tpl=document.createElement('template');
function splitTools(html){
  _tpl.innerHTML=html;
  const t=[..._tpl.content.children].find(e=>e.classList.contains('toolbar'));
  if(!t) return {tools:'',body:html};
  t.remove();
  const box=document.createElement('div');box.appendChild(_tpl.content.cloneNode(true));
  return {tools:t.outerHTML,body:box.innerHTML};
}
/* Affichage des listes : Liste, Cartes ou Compact, retenu pour chaque page */
const VIEW_PAGES=['affectations','classes','eleves','personnel','modules','examens','stock'];
const VIEW_M=[['list','Liste','vlist'],['cards','Cartes','vgrid'],['dense','Compact','vdense']];
function viewMode(){
  if(S.role!=='admin'||!VIEW_PAGES.includes(S.page)||S.pg.fiche||(S.page==='personnel'&&(S.pg.who||'liste')!=='liste')) return '';
  const v=(S.views||{})[S.page]||cfg().vueDefaut;return VIEW_M.some(m=>m[0]===v)?v:'list';
}
/* Cartes : chaque valeur d’une ligne reçoit le libellé de sa colonne, écrit en petit devant elle
   (sauf la vignette, les titres, les boutons et les colonnes data-nl). Les lignes .xm-lite (Stock) n’en ont aucun. */
function labelCards(el){
  for(const l of el.querySelectorAll('.xm-list')){
    const hd=l.querySelector(':scope>.xm-hd');if(!hd) continue;
    const labels=[...hd.children].map(x=>x.hasAttribute('data-nl')?'':x.textContent.trim());
    for(const r of l.querySelectorAll(':scope>.xm-row:not(.xm-lite)'))
      [...r.children].forEach((c,i)=>{
        if(c.matches('.xm-d,.cl-num,.xm-end,.xm-t,.xm-who')) return;
        if(labels[i]&&!c.dataset.l) c.dataset.l=labels[i];
      });
  }
}
function viewSwitchHTML(v){
  return `<div class="seg vm-seg" role="group" aria-label="Affichage de la liste">${VIEW_M.map(([k,l,i])=>`<button type="button" id="vm-${k}" data-act="view-mode" data-v="${k}" aria-pressed="${v===k}" title="${l}" aria-label="${l}">${icon(i)}</button>`).join('')}</div>`;
}
function renderMain(){
  if((typeof DRAG!=='undefined'&&DRAG&&DRAG.active)||IE.on){pendingMain=true;return;}
  const loading=S.conn==='loading'||(S.conn==='shared'&&!allLoaded());
  const wait=loading?'<div class="empty"><p>Chargement de l’horaire…</p></div>':S.conn==='off'?emptyBox('Horaire indisponible','L’horaire partagé n’est pas accessible dans cette fenêtre. Ouvrez la page dans claude.ai en étant connecté.'):'';
  let html;
  const p=S.page;
  let tools='';
  if(p==='calendar'){S._stats=null;html=wait||(S.role==='admin'?teacherChipsHTML()+adminMain():S.role==='teacher'?teacherMain():studentMain());tools=toolbarHTML();}
  else{
    html=wait||(p==='classes'?classesPage():p==='eleves'?studentsPage():p==='personnel'?staffPage():p==='modules'?modulesPage():p==='affectations'?affPage():p==='mescours'?myCoursesPage():p==='dispos'?disposPage():p==='examens'?examsPage():p==='annee'?yearPage():p==='nouveautes'?newsPage():p==='historique'?historyPage():p==='stock'?stockPage():p==='compta'?comptaPage():p==='formation'?formationPage():p==='recrues'?recruesPage():p==='comptes'?accountsPage():p==='profil'?profilePage():paramsPage());
    if(!wait){const x=splitTools(html);html=svBarHTML()+x.body;tools=x.tools;}
  }
  const vm=wait?'':viewMode();
  /* Paramètres : chaque enregistrement (nouvelle version des réglages) redonne aux champs les valeurs enregistrées */
  const el=$('#main'), key=S.role+'/'+p+(p==='params'?'/'+cfgVer():'');
  const before=el._k===key&&el._h!==html&&!reduceMotion()?measureCards(el):null;
  setHTML(el,html,key);
  el.classList.toggle('view-cards',vm==='cards');el.classList.toggle('view-dense',vm==='dense');
  if(vm==='cards') labelCards(el);
  hdTools={k:S.role+'/'+p,html:tools};
  $('#heading').classList.toggle('with-tools',!!tools);
  const ht=$('#hd-tools');if(ht) setHTML(ht,tools);
  fitHeading();
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
function render(){choreMemo=new Map();applyConfig();ensureSel();
  /* une étiquette QR scannée avec l’appareil photo : l’article s’ouvre dès que le stock est chargé */
  if(!S._skHash&&S.loaded.stock&&S.conn==='shared'&&/#stk=/.test(location.hash)){S._skHash=true;setTimeout(skHash,0);}
  if(!S._qrHash&&S.conn==='shared'&&allLoaded()&&/#pres=/.test(location.hash)){S._qrHash=true;setTimeout(qrHash,0);}renderSide();renderTop();renderNotices();renderHeading();renderMain();renderDrawer();}
let rq=false;
function schedule(){if(rq)return;rq=true;setTimeout(()=>{rq=false;render();},16);}

