/* ---------- Comptes et profils ----------
   Un compte relie une personne (son accès claude.ai) à un rôle et à sa fiche.
   comptes/<id de la personne> : {role, ref, fiche, maj}. Chacun ne lit que son propre compte ;
   l’administration les lit et les écrit tous. La fiche copiée permet à l’élève de voir
   ses informations sans avoir accès aux dossiers des autres élèves. */
let USER=null, ROOM;
/* Sur le site (hors claude.ai), la connexion se fait par courriel et les comptes naissent d’une demande. */
const siteMode=()=>!!window.__AUTH;
const ROLES=['admin','teacher','student'];
const ROLE_CHIP={admin:'k2',teacher:'k0',student:'k6'};
const ACCESS={admin:'Éditeur',teacher:'Contributeur',student:'Lecteur'};
const PROF={}, profAsk=new Set();
const profOf=id=>PROF[id]||null;
function needProfiles(ids){
  if(!USER) return;
  const miss=[...new Set(ids)].filter(id=>id&&!PROF[id]&&!profAsk.has(id));
  if(!miss.length) return;
  miss.forEach(id=>profAsk.add(id));
  USER.profiles(miss).then(m=>{for(const [id,p] of Object.entries(m||{}))PROF[id]=p;schedule();}).catch(()=>{});
}
const initials=n=>String(n||'').trim().split(/\s+/).map(w=>(w.match(/\p{L}/u)||[''])[0]).filter(Boolean).slice(0,2).join('').toUpperCase()||'?';
const AV_COLORS=['#2C4F78','#7043A5','#146C62','#995D12','#A3326B','#1C7951'];
function avHTML(name,url,cls){
  if(url) return `<span class="av${cls?' '+cls:''}"><img src="${esc(url)}" alt=""></span>`;
  let h=0;for(const ch of String(name||''))h=(h*31+ch.charCodeAt(0))>>>0;
  return `<span class="av${cls?' '+cls:''}" style="background:${AV_COLORS[h%AV_COLORS.length]}" aria-hidden="true">${esc(initials(name))}</span>`;
}
const myAcct=()=>S.myAcct&&ROLES.includes(S.myAcct.role)?S.myAcct:null;
/* Un compte enseignant ou élève fixe le profil affiché ; le propriétaire et l’administration gardent le choix. */
const locked=()=>{const a=myAcct();return !!a&&a.role!=='admin'&&!S.isOwner;};
const acctForRole=()=>{const a=myAcct();return a&&a.role===S.role?a:null;};
const acctRec=a=>a.role==='student'?(byId(S.data.eleves,a.ref)||a.fiche||{}):(a.ref?(byId(S.data.enseignants,a.ref)||a.fiche||{}):(a.fiche||{}));
/* La personne affichée dans le menu et dans « Mon profil » : son compte, sinon l’aperçu choisi. */
function subject(){
  const a=acctForRole(), r=S.role;
  if(r==='teacher'){const id=a?a.ref:S.teacher, rec=byId(S.data.enseignants,id)||(a&&a.fiche)||null;return {a,id,rec,name:(rec&&rec.nom)||(a&&S.me.name)||'Enseignant'};}
  if(r==='student'){const id=a?a.ref:S.student, rec=byId(S.data.eleves,id)||(a&&a.fiche)||null;return {a,id,rec,name:(rec&&rec.nom)||(a&&S.me.name)||'Élève'};}
  const id=a?a.ref:'', rec=id?(byId(S.data.enseignants,id)||a.fiche||null):null;
  return {a,id,rec,name:(rec&&rec.nom)||S.me.name||'Administration'};
}
function ficheOf(role,ref,rec,dz){
  if(!ref) return {};
  if(role==='student'){const e=rec||byId(S.data.eleves,ref)||{};return {nom:e.nom||'',groupe:e.groupe||'',numero:e.numero==null?null:e.numero,fonction:e.fonction||'',naissance:e.naissance||'',parent:e.parent||'',courriel:e.courriel||'',telephone:e.telephone||''};}
  const p=rec||byId(S.data.enseignants,ref)||{}, z=dz||S.data.dossiers[ref]||{};
  return {nom:p.nom||'',fonction:p.fonction||'',statut:p.statut||'',courriel:p.courriel||'',telephone:z.telephone||''};
}
/* Quand l’administration modifie une fiche, les comptes qui y sont reliés suivent. */
async function dropAccounts(ref){for(const a of S.data.comptes.filter(x=>x.ref===ref)){try{await col('comptes').doc(a.id).delete();}catch(e){}}}
async function syncFiches(ref,rec,dz){
  for(const a of S.data.comptes.filter(x=>x.ref===ref)){
    try{await col('comptes').doc(a.id).update({fiche:ficheOf(a.role,ref,rec,dz),maj:new Date().toISOString()});}catch(e){}
  }
}
const ficheName=a=>acctRec(a).nom||'';

/* Page Comptes (administration) */
function accountsPage(){
  const r=S.pg.r||'', all=S.data.comptes;
  needProfiles(all.filter(a=>!a.exemple).map(a=>a.id));
  const n=k=>all.filter(a=>a.role===k).length;
  const seg=`<div class="seg" role="group" aria-label="Filtrer les comptes">${[['','Tous',all.length],['admin','Administrateurs',n('admin')],['teacher','Enseignants',n('teacher')],['student','Élèves',n('student')]].map(([k,l,c])=>`<button type="button" id="acf-${k||'all'}" data-act="ac-filter" data-v="${k}" aria-pressed="${r===k}">${l} ${c}</button>`).join('')}</div>`;
  const tb=`<div class="toolbar">${seg}<span class="grow"></span><button class="btn primary" type="button" id="ac-new" data-act="ac-new"${dis()}>${icon('plus')}Créer un compte</button></div>`;
  const dem=S.data.demandes.filter(x=>x.statut==='en attente').sort((a,b)=>String(a.cree||'').localeCompare(String(b.cree||'')));
  const demHTML=dem.length?`<section class="panel" id="dem-panel"><h2>Demandes de compte · ${dem.length}</h2><ul class="dem-list">${dem.map(x=>`<li><span class="who">${avHTML(x.nom,'')}<span><b>${esc(x.nom||'Sans nom')}</b><small>${esc(x.courriel||'')}</small></span></span><span class="dem-what">${x.message?`<span class="dem-msg">« ${esc(x.message)} »</span>`:'<span class="muted sm">Aucun message</span>'}</span><span class="dem-act"><button class="btn sm primary" type="button" id="dm-ok-${esc(x.id)}" data-act="ac-approve" data-id="${esc(x.id)}"${dis()}>Approuver</button><button class="btn sm ghost" type="button" id="dm-no-${esc(x.id)}" data-act="ac-refuse" data-id="${esc(x.id)}"${dis()}>Refuser</button></span></li>`).join('')}</ul></section>`:'';
  const how=siteMode()?`<section class="panel acc-how"><h2>Comment ça marche</h2><ol class="steps">
    <li><b>La personne va sur le site</b> et clique « Demander un compte » : nom, courriel et mot de passe.</li>
    <li><b>Sa demande apparaît ici.</b> Approuvez-la en choisissant son rôle et sa fiche (dossier du personnel ou de l’élève).</li>
    <li><b>C’est prêt.</b> Elle se connecte et arrive directement sur son horaire et son profil.</li></ol></section>`
  :`<section class="panel acc-how"><h2>Comment ça marche</h2><ol class="steps">
    <li><b>Partagez la page</b> avec la personne (bouton Partager de claude.ai) : <b>Éditeur</b> pour l’administration, <b>Contributeur</b> pour les enseignants, <b>Lecteur</b> pour les élèves.</li>
    <li><b>Créez son compte ici</b> : la personne, son rôle et sa fiche (dossier du personnel ou de l’élève).</li>
    <li><b>C’est prêt.</b> En ouvrant la page, elle arrive directement sur son horaire et son profil.</li></ol></section>`;
  const share=!siteMode();
  const list=all.filter(a=>!r||a.role===r).sort((x,y)=>ROLES.indexOf(x.role)-ROLES.indexOf(y.role)||collator.compare(ficheName(x),ficheName(y)));
  const rows=list.map(a=>{
    const rec=acctRec(a);let who;
    if(a.exemple) who=`${avHTML(ficheName(a)||'?','')}<span><b>Compte d’exemple</b><small>Aucune personne reliée</small></span>`;
    else{const p=profOf(a.id);who=`${avHTML((p&&p.name)||'?',p?p.avatarUrl:'')}<span><b>${p?esc(p.name||'Personne non identifiée'):'Chargement…'}${a.id===S.me.id?' (vous)':''}</b><small>${p&&p.guest?'Invitée de l’extérieur':share?'Accès claude.ai':'Compte du site'}</small></span>`;}
    const fiche=a.role==='admin'&&!a.ref?'<span class="muted tb-empty">Aucune fiche</span>':rec.nom?`${esc(rec.nom)}${a.role==='student'&&rec.groupe?`<span class="muted sm"> · ${esc(gName(rec.groupe))}</span>`:''}`:'<span class="muted">Fiche supprimée</span>';
    return `<tr><td><span class="who">${who}</span></td><td class="tb-top"><span class="chip ${ROLE_CHIP[a.role]}">${ROLE_LBL[a.role]}</span></td><td data-l="Fiche">${fiche}</td>${share?`<td data-l="Accès">${ACCESS[a.role]}</td>`:''}<td class="num tb-act"><button class="btn sm" type="button" id="ac-edit-${esc(a.id)}" data-act="ac-edit" data-id="${esc(a.id)}">Modifier</button></td></tr>`;
  }).join('');
  const linked=new Set(all.map(a=>a.ref).filter(Boolean));
  const noT=teachers().filter(t=>!linked.has(t.id)).length, noE=S.data.eleves.filter(e=>!linked.has(e.id)).length;
  const table=all.length?`<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Personne</th><th>Rôle</th><th>Fiche</th>${share?'<th>Accès dans Partager</th>':''}<th class="num"><span class="vh">Actions</span></th></tr></thead><tbody>${rows||'<tr><td colspan="${share?5:4}" class="muted">Aucun compte de ce type.</td></tr>'}</tbody></table></div>`
    :emptyBox('Aucun compte pour l’instant','Créez le compte de chaque personne qui utilise la page : elle arrivera directement sur son horaire et son profil.');
  return tb+demHTML+how+table+(all.length?`<p class="help">${noT||noE?`Sans compte : ${pl(noT,'enseignant','enseignants')} et ${pl(noE,'élève','élèves')}.`:'Chaque enseignant et chaque élève a son compte.'}</p>`:'');
}
function openAccount(id,pre){
  const a=id?byId(S.data.comptes,id):null;
  const draft={uid:a&&!a.exemple?a.id:'',role:a?a.role:'student',ref:a?a.ref||'':''};
  if(pre) Object.assign(draft,pre.draft);
  openDrawer({kind:'acct',id:id||null,draft,q:'',hits:[],err:'',over:false,confirmDel:false,ex:!!(a&&a.exemple),demande:pre?pre.demande:null});
}
/* Rôle et fiche proposés pour une demande : la fiche d’élève ou du personnel qui porte le même nom */
function guessAcct(x){
  const s=guessRef('student',x);if(s)return {role:'student',ref:s};
  const t=guessRef('teacher',x);if(t){const p=byId(S.data.enseignants,t);return {role:p&&!isTeacher(p)?'admin':'teacher',ref:t};}
  return {role:'student',ref:''};
}
function guessRef(role,x){
  const same=(a,b)=>collator.compare(String(a||'').trim(),String(b||'').trim())===0;
  if(role==='student'){const e=S.data.eleves.find(e=>same(e.nom,x.nom));return e?e.id:'';}
  const p=S.data.enseignants.find(p=>same(p.nom,x.nom));return p?p.id:'';
}
function accountDrawer(){
  const d=S.dr, f=d.draft, all=S.data.comptes;
  if(d.id&&!byId(all,d.id)) return goneHTML('Compte');
  needProfiles([...S.peers.map(p=>p.by),f.uid]);
  const has=id=>{const o=byId(all,id);return o&&o.id!==d.id?o:null;};
  let person;
  if(f.uid){
    const p=profOf(f.uid)||{}, o=has(f.uid);
    const dm=d.demande&&d.demande.id===f.uid?d.demande:null, nm=p.name||(dm&&dm.nom)||'Personne choisie';
    person=`<div class="pick-sel" id="ac-person">${avHTML(nm,p.avatarUrl||'')}<span><b>${esc(nm)}${f.uid===S.me.id?' (vous)':''}</b><small>${o?`A déjà un compte : ${ROLE_LBL[o.role]}`:siteMode()?esc((dm&&dm.courriel)||'Compte du site'):'Accès claude.ai'}</small></span><button class="btn sm ghost" type="button" id="ac-change" data-act="ac-change">Changer</button></div>`;
  }else{
    const btn=(id,sub)=>{const p=profOf(id)||{};return `<li><button type="button" class="pick-person" id="pk-${esc(id)}" data-act="ac-pick" data-uid="${esc(id)}">${avHTML(p.name||'?',p.avatarUrl||'')}<span><b>${esc(p.name||'Personne sans nom')}${id===S.me.id?' (vous)':''}</b><small>${esc(sub)}</small></span></button></li>`;};
    const seen=new Set(), here=S.peers.filter(p=>!seen.has(p.by)&&seen.add(p.by));
    const tag=(id,dflt)=>{const o=has(id);return o?`A déjà un compte : ${ROLE_LBL[o.role]}`:dflt;};
    const hereHTML=ROOM===undefined?'<p class="help">Recherche des personnes connectées…</p>':!ROOM?'<p class="help">La liste des personnes connectées n’est pas disponible dans cette fenêtre.</p>'
      :here.length?`<ul class="pick-list">${here.map(p=>btn(p.by,tag(p.by,p.isMe?'Vous':'A la page ouverte en ce moment'))).join('')}</ul>`:'<p class="help">Personne n’a la page ouverte. Demandez à la personne de l’ouvrir : elle apparaîtra ici.</p>';
    person=`${siteMode()?'':`<div class="field"><span>Personnes qui ont la page ouverte</span>${hereHTML}</div>`}
      <label class="field"><span>${siteMode()?'Cherchez une personne inscrite sur le site':'Ou cherchez dans votre organisation'}</span><input id="ac-q" type="search" placeholder="Nom ou courriel" autocomplete="off"></label>
      ${d.q.trim()?(d.hits.length?`<ul class="pick-list">${d.hits.map(h=>btn(h.id,tag(h.id,h.guest?'Invitée de l’extérieur':'Membre de l’organisation'))).join('')}</ul>`:(siteMode()?'<p class="help">Aucune personne trouvée. Demandez-lui de cliquer « Demander un compte » sur le site.</p>':'<p class="help">Aucune personne trouvée. Si elle ne fait pas partie de votre organisation, demandez-lui d’ouvrir la page.</p>')):''}`;
  }
  const roleSeg=`<div class="seg" role="group" aria-label="Rôle">${ROLES.map(k=>`<button type="button" id="ac-role-${k}" data-act="ac-role" data-v="${k}" aria-pressed="${f.role===k}">${ROLE_LBL[k]}</button>`).join('')}</div>`;
  const used=new Set(all.filter(a=>a.ref&&a.id!==d.id).map(a=>a.ref)), mark=id=>used.has(id)?' (a déjà un compte)':'';
  const opts=f.role==='student'
    ?'<option value="">Choisir l’élève</option>'+groups().map(g=>{const els=studentsOf(g.id);return els.length?`<optgroup label="${esc(g.nom)}">${els.map(e=>`<option value="${esc(e.id)}"${f.ref===e.id?' selected':''}>${esc(e.nom+mark(e.id))}</option>`).join('')}</optgroup>`:'';}).join('')
    :`<option value="">${f.role==='admin'?'Aucune fiche':'Choisir l’enseignant'}</option>`+staff().filter(p=>f.role==='admin'||isTeacher(p)).map(p=>`<option value="${esc(p.id)}"${f.ref===p.id?' selected':''}>${esc(p.nom+mark(p.id))}</option>`).join('');
  const body=`<form id="ac-form" data-form="acct" novalidate>
    ${d.ex?'<div class="notice"><p>Compte d’exemple : choisissez la vraie personne à relier à cette fiche.</p></div>':''}
    ${d.demande?`<div class="notice"><p><b>Demande de ${esc(d.demande.nom||'')}</b>${d.demande.message?` : « ${esc(d.demande.message)} »`:''}. Choisissez son rôle et sa fiche (la fiche d’un élève donne sa classe), puis approuvez.</p></div>`:''}
    <section class="dr-sec"><h3>1. La personne</h3>${person}</section>
    <section class="dr-sec"><h3>2. Son rôle</h3>${roleSeg}${siteMode()?'':`<p class="help">Dans Partager, donnez-lui l’accès <b>${ACCESS[f.role]}</b>.</p>`}</section>
    <section class="dr-sec"><h3>3. Sa fiche</h3><label class="field"><span>${f.role==='student'?'Fiche de l’élève':f.role==='teacher'?'Fiche de l’enseignant':'Fiche du personnel (facultatif)'}</span><select id="ac-ref">${opts}</select></label>${f.role==='student'?'<p class="help">L’élève voit seulement sa propre fiche dans « Mon profil ».</p>':''}</section>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>`;
  const foot=d.confirmDel
    ?`<p>Supprimer ce compte ? La personne garde son accès à la page, mais n’arrivera plus directement sur son profil.</p><button class="btn danger" type="button" id="ac-del-yes" data-act="ac-del-yes"${dis()}>Supprimer</button><button class="btn ghost" type="button" data-act="ac-del-no">Annuler</button>`
    :`<button class="btn primary" type="submit" form="ac-form" id="ac-save"${dis()}>${d.demande?'Approuver et créer le compte':d.id?'Enregistrer':'Créer le compte'}</button>${d.id?'<button class="btn ghost" type="button" id="ac-del" data-act="ac-del">Supprimer le compte</button>':''}`;
  return dTop('Compte',d.id?'Modifier le compte':'Nouveau compte','Reliez une personne à son rôle et à sa fiche.')+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveAccount(){
  const d=S.dr, f=d.draft;if(S.busy)return;
  if(!f.uid){d.err='Choisissez la personne à relier.';renderDrawer();return;}
  if(f.role!=='admin'&&!f.ref){d.err=f.role==='student'?'Choisissez la fiche de l’élève.':'Choisissez la fiche de l’enseignant.';renderDrawer();return;}
  const o=byId(S.data.comptes,f.uid);
  if(o&&o.id!==d.id&&!d.over){d.over=true;d.err=`Cette personne a déjà un compte (${ROLE_LBL[o.role]}). Enregistrez de nouveau pour le remplacer.`;renderDrawer();return;}
  const doc={role:f.role,ref:f.ref||'',fiche:ficheOf(f.role,f.ref),maj:new Date().toISOString()};
  S.busy=true;d.err='';renderDrawer();
  const ok=await write(async()=>{await col('comptes').doc(f.uid).set(doc);if(d.id&&d.id!==f.uid)await col('comptes').doc(d.id).delete();if(d.demande&&d.demande.id===f.uid)await col('demandes').doc(f.uid).update({statut:'approuvée',traitee:new Date().toISOString()});},d.demande?'Demande approuvée':d.id?'Compte enregistré':'Compte créé');
  S.busy=false;if(ok&&S.dr===d)S.dr=null;render();
}

/* Page Mon profil */
function profilePage(){
  const P=subject(), a=P.a, r=S.role, rec=P.rec||{}, own=!!a||r==='admin';
  const chips=[`<span class="chip ${ROLE_CHIP[r]}">${ROLE_LBL[r]}</span>`];
  if(r==='student'&&(rec.groupe||S.group)) chips.push(`<span class="chip">${esc(gName(rec.groupe||S.group))}</span>`);
  if(r==='student'&&rec.fonction) chips.push(`<span class="role-chip">${esc(rec.fonction)}</span>`);
  if(r!=='student'&&rec.fonction&&rec.fonction!=='Enseignant') chips.push(`<span class="chip">${esc(rec.fonction)}</span>`);
  const note=a&&siteMode()?`Connecté avec ${esc((window.__AUTH.email&&window.__AUTH.email())||'votre courriel')}.`:a?`Compte relié à votre accès claude.ai${S.me.name&&S.me.name!==P.name?` (${esc(S.me.name)})`:''}.`
    :r==='admin'?(S.me.name?`Connecté avec l’accès claude.ai de ${esc(S.me.name)}.`:'Administration de l’établissement.')
    :'Aperçu : aucun compte n’est relié à votre accès. L’administration relie les comptes dans le menu Comptes.';
  let pick='';
  if(!a&&!locked()&&(r==='teacher'||r==='student')){
    const o=r==='teacher'?teachers().map(t=>`<option value="${esc(t.id)}"${t.id===S.teacher?' selected':''}>${esc(t.nom)}</option>`).join('')
      :groups().map(g=>{const els=studentsOf(g.id);return els.length?`<optgroup label="${esc(g.nom)}">${els.map(e=>`<option value="${esc(e.id)}"${e.id===S.student?' selected':''}>${esc(e.nom)}</option>`).join('')}</optgroup>`:'';}).join('');
    if(o) pick=`<label class="field pf-pick"><span>Voir le profil de</span><select id="pf-who">${o}</select></label>`;
  }
  const head=`<section class="panel prof-head">${avHTML(P.name,own?S.me.avatarUrl:'','lg')}<div class="prof-id"><h2 id="pf-name">${esc(P.name)}</h2><div class="prof-chips">${chips.join('')}</div><p class="help">${note}</p>${siteMode()?'<button class="btn sm" type="button" id="pf-logout" data-act="logout">Se déconnecter</button>':''}</div>${pick}</section>`;
  const facts=rows=>`<dl class="facts">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v!=null&&v!==''?esc(v):'<span class="muted">—</span>'}</dd></div>`).join('')}</dl>`;
  const sess=s=>`${dayLabel(parse(s.date))} · ${momentOf(s).toLowerCase()}`;
  let panels='', warn='';
  if(r==='student'){
    const gid=rec.groupe||S.group, wk=weekItems().filter(s=>s.grp===gid&&s.kind!=='exam'&&!s.cancelled);
    const chores=wk.filter(s=>choreOf(s)), nx=nextSession(s=>s.c.groupe===gid), ex=upcomingExams(x=>x.grp===gid,4);
    panels+=`<section class="panel"><h2>Mes informations</h2>${facts([['Classe',gName(gid)],['Enseignant principal',principalOf(gid)?tName(principalOf(gid)):''],['Numéro',rec.numero],['Fonction',rec.fonction||'Aucune'],['Date de naissance',rec.naissance?longDate(parse(rec.naissance)):''],['Contact d’urgence',rec.parent],['Courriel',rec.courriel],['Téléphone',rec.telephone]])}</section>`;
    panels+=`<section class="panel"><h2>Ma semaine</h2><p class="big">${wk.length}<span> ${wk.length>1?'cours':'cours'}</span></p>
      <p class="help">${nx?`${W('Prochaine séance','Prochain cours')} : ${esc(nx.s.c.titre)}, ${esc(sess(nx.s).toLowerCase())}.`:W('Aucune séance prévue prochainement.','Aucun cours prévu prochainement.')}</p>
      ${chores.length?`<h2 style="margin-top:14px">Corvées de ménage</h2><ul class="acc-list">${[...new Set(chores.map(s=>s.date))].sort().map(ds=>`<li><span>${esc(dayLabel(parse(ds)))}</span><span class="muted sm">toute la journée</span></li>`).join('')}</ul>`:'<p class="help">Aucune corvée de ménage cette semaine.</p>'}</section>`;
    panels+=`<section class="panel"><h2>Prochains examens</h2>${ex.length?`<div class="list">${examRows(ex,'student')}</div>`:'<p class="help">Aucun examen prévu.</p>'}</section>`;
  }else if(r==='teacher'){
    const id=P.id, z=S.data.dossiers[id]||{}, cs=S.data.cours.filter(c=>c.enseignant===id);
    const byG={};for(const c of cs)byG[c.groupe]=(byG[c.groupe]||0)+1;
    const wk=weekItems().filter(s=>s.kind!=='exam'&&!s.cancelled&&s.tch.includes(id));
    let late=0;for(const s of wk){const x=attInfo(s);if(x.due)late++;}
    const nx=nextSession(s=>s.tch.includes(id));
    panels+=`<section class="panel"><h2>Mes informations</h2>${facts([['Fonction',rec.fonction||'Enseignant'],['Statut',rec.statut||'Actif'],['Courriel',rec.courriel],['Téléphone',z.telephone||rec.telephone]])}</section>`;
    panels+=`<section class="panel"><h2>Mes classes</h2>${Object.keys(byG).length?`<ul class="acc-list">${Object.entries(byG).sort((x,y)=>collator.compare(gName(x[0]),gName(y[0]))).map(([g,n])=>`<li><span>${esc(gName(g))}${principalOf(g)===id?' <span class="chip k0">Enseignant principal</span>':''}</span><span class="muted">${pl(n,'cours','cours')}</span></li>`).join('')}</ul>`:'<p class="help">Aucun cours assigné pour l’instant.</p>'}</section>`;
    panels+=`<section class="panel"><h2>Ma semaine</h2><p class="big">${wk.length}<span> ${W(wk.length>1?'séances':'séance','cours')}</span></p><p class="help">${late?`<b class="need-t">${pl(late,'présence à prendre','présences à prendre')}</b> pour des ${W('séances passées','cours passés')}. `:''}${nx?`${W('Prochaine séance','Prochain cours')} : ${esc(nx.s.c.titre)}, ${esc(sess(nx.s).toLowerCase())}.`:W('Aucune séance prévue prochainement.','Aucun cours prévu prochainement.')}</p></section>`;
    if(a&&S.canWrite===false) warn='<div class="notice warn"><p>Votre accès à cette page ne permet pas encore d’enregistrer les présences. Demandez à l’administration l’accès <b>Contributeur</b> dans Partager.</p></div>';
  }else{
    const c=cfg(), all=S.data.comptes, n=k=>all.filter(x=>x.role===k).length;
    panels+=`<section class="panel"><h2>Mes informations</h2>${facts([['Rôle','Administrateur'],['Établissement',c.nom],['Année scolaire',c.annee],['Fiche du personnel',rec.nom||'']])}</section>`;
    panels+=`<section class="panel"><h2>Comptes</h2><ul class="acc-list"><li><span>Administrateurs</span><b>${n('admin')}</b></li><li><span>Enseignants</span><b>${n('teacher')}</b></li><li><span>Élèves</span><b>${n('student')}</b></li></ul><div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-act="nav" data-page="comptes">Gérer les comptes</button></div></section>`;
  }
  return head+warn+`<div class="panels">${panels}</div>`;
}

