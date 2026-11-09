/* ---------- Confort : recherche Ctrl+K, vues enregistrées, modification sur place ---------- */
const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'');

/* Hors ligne : l’avis en haut de la page, puis le retour du réseau */
window.addEventListener('offline',()=>{S.offline=true;render();});
window.addEventListener('online',()=>{if(!S.offline)return;S.offline=false;render();toast('De retour en ligne : les modifications gardées partent maintenant.');});

/* Recherche Ctrl+K : une seule boîte pour aller à une page, trouver une personne, un article ou une grille, et lancer une action */
const CK_RECENT='pompiernote-recherche';
let CK={open:false,q:'',i:0,items:[],hits:[]};
function cmdkItems(){
  const out=[], r=S.role, adm=isAdmin(), add=(grp,label,sub,run,kw)=>out.push({id:grp+'|'+label+'|'+(sub||''),grp,label,sub:sub||'',run,k:fold([label,sub,kw].join(' '))});
  for(const n of navShown()){
    const pages=n[4]&&n[4].length>1?n[4]:[n[0]];
    for(const p of pages) add('Pages',pages.length>1?`${navLbl(n[0],n[1])} › ${TAB_LBL[p]||p}`:navLbl(n[0],n[1]),'',()=>goPage(p));
    const sn=SUBNAV[n[0]];
    if(sn) for(const t of sn.tabs()){
      add('Pages',`${navLbl(n[0],n[1])} › ${t.l}`,t.nt||'',()=>{goPage(n[0]);S.pg[sn.key]=t.k;render();});
      for(const s of t.sub||[]) if(s.k!==t.k) add('Pages',`${navLbl(n[0],n[1])} › ${t.l} › ${s.l}`,'',()=>{goPage(n[0]);S.pg[sn.key]=s.k;render();});
    }
  }
  add('Pages','Mon profil','',()=>goPage('profil'));
  if(adm){
    for(const e of S.data.eleves) add('Élèves',e.nom,[gName(e.groupe),e.numero!=null&&e.numero!==''?'n° '+e.numero:'',e.fonction].filter(Boolean).join(' · '),()=>openFiche('eleves',e.id),[e.courriel,e.telephone].join(' '));
    for(const p of staff()) add('Personnel',p.nom,p.fonction||'Enseignant',()=>openFiche('personnel',p.id),p.courriel);
    for(const g of groups()) add('Classes',g.nom,pl(studentsOf(g.id).length,'élève','élèves'),()=>openFiche('classes',g.id));
    for(const k of comps()) add('Modules',`M${k.code} · ${k.nom}`,'',()=>openFiche('modules',String(k.code)));
  }
  for(const o of optAll()) if(o.search) o.search(add,r,adm);
  if(r!=='student') for(const g of foG()) add('Grilles pratiques',g.nom,g.module?'M'+g.module:'',()=>{goPage('formation');S.pg.fo=r==='admin'?'grilles':'grilles';render();openDrawer({kind:'fo',mode:'grille',id:g.id});});
  const can=S.conn==='shared'&&!S.archive, A=(l,sub,run,kw)=>add('Actions',l,sub,run,kw);
  if(can&&adm){
    A(W('Nouvelle séance','Nouveau cours'),'Calendrier',()=>{goPage('calendar');if(acad())openAddCourse({});else openCourse(null,null,null);},'ajouter cours seance');
    for(const o of optAll()) if(o.actions) o.actions(A);
    A('Proposer des enseignants','Affectations',()=>{goPage('affectations');openDrawer({kind:'fo',mode:'afauto'});},'combler attribuer');
    A('Nouvelle grille pratique','Formation',()=>{goPage('formation');S.pg.fo='grilles';render();openDrawer({kind:'fo',mode:'grille',id:''});},'evaluation manoeuvre');
    A('Nouvelle annonce','Paramètres',()=>{goPage('params');S.pg.ps='annonces';render();},'message');
  }
  if(can&&r!=='student'){
    A('Évaluer un élève','Formation',()=>{goPage('formation');S.pg.fo='eval';render();},'grille pratique');
    A('Nouvelle question','Banque de questions',()=>{goPage('formation');S.pg.fo='quest';render();openDrawer({kind:'fo',mode:'q',id:''});},'qcm');
    A('Nouvel examen blanc','Formation',()=>{goPage('formation');S.pg.fo='blancs';render();openDrawer({kind:'fo',mode:'blanc',id:''});},'qcm');
  }
  if(can&&r==='student'){
    A('Signaler ma présence','Code de la séance',()=>openDrawer({kind:'fo',mode:'qrin',code:''}),'qr');
    A('Faire un examen blanc','Ma formation',()=>{goPage('formation');S.pg.fo='blancs';render();},'qcm');
    A('S’entraîner','Ma formation',()=>{goPage('formation');S.pg.fo='train';render();},'questions');
  }
  return out;
}
const ckRecent=()=>{try{const v=JSON.parse(localStorage.getItem(CK_RECENT)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}};
function ckFilter(){
  const q=fold(CK.q).trim(), T=q?q.split(/\s+/):[];
  if(!T.length){const R=ckRecent(), rec=R.map(id=>CK.items.find(x=>x.id===id)).filter(Boolean).map(x=>Object.assign({},x,{grp:'Récents'}));return rec.concat(CK.items.filter(x=>x.grp==='Actions'||x.grp==='Pages').filter(x=>!R.includes(x.id))).slice(0,40);}
  return CK.items.filter(x=>T.every(t=>x.k.includes(t))).map(x=>({x,s:(fold(x.label).startsWith(T[0])?0:1)+(x.grp==='Pages'||x.grp==='Actions'?0:0.5)})).sort((a,b)=>a.s-b.s||collator.compare(a.x.label,b.x.label)).slice(0,40).map(o=>o.x);
}
function ckRender(){
  const el=$('#cmdk');if(!el) return;
  CK.hits=ckFilter();CK.i=Math.min(CK.i,Math.max(0,CK.hits.length-1));
  let g='';
  $('#cmdk-l').innerHTML=CK.hits.length?CK.hits.map((x,i)=>{const h=x.grp!==g?`<li class="ck-g" role="presentation">${esc(x.grp)}</li>`:'';g=x.grp;return h+`<li role="option" id="ck-${i}" class="ck-it${i===CK.i?' on':''}" aria-selected="${i===CK.i}" data-i="${i}"><b>${esc(x.label)}</b>${x.sub?`<small>${esc(x.sub)}</small>`:''}</li>`;}).join(''):'<li class="ck-none">Rien ne correspond.</li>';
  $('#cmdk-q').setAttribute('aria-activedescendant',CK.hits.length?'ck-'+CK.i:'');
  const on=$('#ck-'+CK.i);if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
}
function cmdkOpen(){
  if(!allLoaded()||S.conn==='loading') return;
  let el=$('#cmdk');
  if(!el){el=document.createElement('div');el.id='cmdk';el.className='cmdk';el.innerHTML='<div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Recherche"><input id="cmdk-q" type="search" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="cmdk-l" aria-label="Rechercher une page, une personne, un article ou une action" placeholder="Page, élève, membre du personnel, article, action…"><ul id="cmdk-l" role="listbox"></ul><p class="cmdk-help">↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer</p></div>';document.body.appendChild(el);}
  CK={open:true,q:'',i:0,items:cmdkItems(),hits:[]};el.hidden=false;document.body.classList.add('lock');
  const q=$('#cmdk-q');q.value='';ckRender();q.focus();
}
function cmdkClose(){const el=$('#cmdk');if(el)el.hidden=true;CK.open=false;if(!S.dr)document.body.classList.remove('lock');}
function cmdkRun(i){
  const x=CK.hits[i];if(!x) return;
  try{const R=ckRecent().filter(id=>id!==x.id);R.unshift(x.id);localStorage.setItem(CK_RECENT,JSON.stringify(R.slice(0,6)));}catch(e){}
  cmdkClose();if(S.dr&&S.dr.kind!=='att')S.dr=null;x.run();window.scrollTo({top:0});
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&!e.altKey&&String(e.key).toLowerCase()==='k'){e.preventDefault();if(CK.open)cmdkClose();else cmdkOpen();return;}
  if(!CK.open||e.target.id!=='cmdk-q') return;
  if(e.key==='ArrowDown'){e.preventDefault();CK.i=Math.min(CK.i+1,CK.hits.length-1);ckRender();}
  else if(e.key==='ArrowUp'){e.preventDefault();CK.i=Math.max(CK.i-1,0);ckRender();}
  else if(e.key==='Enter'){e.preventDefault();cmdkRun(CK.i);}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();cmdkClose();}
},true);
document.addEventListener('input',e=>{if(e.target.id==='cmdk-q'){CK.q=e.target.value;CK.i=0;ckRender();}});
document.addEventListener('click',e=>{
  if(e.target.closest&&e.target.closest('[data-act=cmdk]')){cmdkOpen();return;}
  if(!CK.open) return;
  const it=e.target.closest&&e.target.closest('.ck-it');
  if(it){cmdkRun(+it.dataset.i);return;}
  if(e.target.id==='cmdk') cmdkClose();
});

/* Vues enregistrées : les filtres, le tri et l’affichage d’une page, gardés sous un nom (dans ce navigateur) */
const SV_PAGES=['affectations','classes','eleves','personnel','modules','examens','stock','compta','formation'];
const SV_SKIP=new Set(['fiche','from','listY','ask','askx','adding','justAdded','enrol','close','qt','qi','qask','tr','aed','adup','adraft','pick','fsel','fesel','ssel','lim','sfi','sback','rp','svAsk']);
const svOn=()=>S.role==='admin'&&SV_PAGES.includes(S.page)&&!S.pg.fiche&&S.conn==='shared';
const svList=()=>((S.saved||{})[S.page]||[]);
const svNow=()=>{const o={};for(const [k,v] of Object.entries(S.pg||{})) if(!SV_SKIP.has(k)&&(typeof v==='string'||typeof v==='number'||typeof v==='boolean')&&v!=='') o[k]=v;return o;};
const svSame=v=>{const n=svNow(), a=Object.keys(n), b=Object.keys(v.pg||{});return a.length===b.length&&b.every(k=>String(n[k])===String(v.pg[k]))&&(!v.vm||!viewMode()||v.vm===viewMode());};
const svBtnHTML=()=>svOn()?`<button type="button" class="bell" id="sv-save" data-act="sv-ask" aria-label="Enregistrer la vue" title="Enregistrer cette vue : filtres, tri et affichage">${icon('pin')}</button>`:'';
function svBarHTML(){
  if(!svOn()) return '';
  const L=svList();if(!L.length&&!S.pg.svAsk) return '';
  const any=L.findIndex(svSame);
  return `<div class="sv-bar" id="sv-bar" role="group" aria-label="Vues enregistrées"><button type="button" class="sv-chip${any<0?' on':''}" id="sv-def" data-act="sv-def" aria-pressed="${any<0}">Vue de base</button>${L.map((v,i)=>`<span class="sv-chip${i===any?' on':''}"><button type="button" id="sv-${i}" data-act="sv-go" data-i="${i}" aria-pressed="${i===any}">${esc(v.nom)}</button><button type="button" class="sv-x" data-act="sv-del" data-i="${i}" aria-label="Retirer la vue ${esc(v.nom)}" title="Retirer cette vue">×</button></span>`).join('')}
    ${S.pg.svAsk?`<form class="sv-form" data-form="sv-save" novalidate><input id="sv-nom" maxlength="40" placeholder="Nom de la vue" autocomplete="off" aria-label="Nom de la vue"><button class="btn sm primary" type="submit" id="sv-ok">Enregistrer</button><button class="btn sm ghost" type="button" data-act="sv-cancel">Annuler</button></form>`:''}</div>`;
}
function svSet(list){S.saved=Object.assign({},S.saved||{},{[S.page]:list});savePrefs();}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||!/^sv-/.test(b.dataset.act)) return;
  const a=b.dataset.act, L=svList();
  if(a==='sv-ask'){S.pg.svAsk=true;render();const i=$('#sv-nom');if(i)i.focus();}
  else if(a==='sv-cancel'){S.pg.svAsk=false;render();}
  else if(a==='sv-def'){const keep=S.pg.svAsk;S.pg={};if(keep)S.pg.svAsk=true;render();}
  else if(a==='sv-go'){const v=L[+b.dataset.i];if(!v)return;S.pg=Object.assign({},v.pg);if(v.vm){S.views=Object.assign({},S.views,{[S.page]:v.vm});savePrefs();}render();}
  else if(a==='sv-del'){const v=L[+b.dataset.i];svSet(L.filter((x,i)=>i!==+b.dataset.i));render();if(v)toast(`Vue « ${v.nom} » retirée`);}
});
document.addEventListener('submit',e=>{
  if(e.target.dataset.form!=='sv-save') return;
  e.preventDefault();
  const nom=String(($('#sv-nom')||{}).value||'').trim();if(!nom){const i=$('#sv-nom');if(i)i.focus();return;}
  const L=svList().filter(v=>v.nom.toLowerCase()!==nom.toLowerCase());
  S.pg.svAsk=false;svSet(L.concat([{nom,pg:svNow(),vm:viewMode()||''}]).slice(-12));render();toast(`Vue « ${nom} » enregistrée`);
});

/* Modification sur place : le crayon d’une cellule la change en champ ; Entrée enregistre, Échap annule */
const IE={on:false};
const IE_K={
  'el-tel':{lbl:'Téléphone',get:id=>(byId(S.data.eleves,id)||{}).telephone||'',save:(id,v)=>col('eleves').doc(id).update({telephone:v}),max:30},
  'pe-st':{lbl:'Statut',opts:()=>Object.keys(STATUTS),get:id=>statOf(byId(S.data.enseignants,id)),save:(id,v)=>col('enseignants').doc(id).update({statut:v})},
  'pe-tel':{lbl:'Téléphone',get:id=>(S.data.dossiers[id]||{}).telephone||'',save:(id,v)=>col('dossiers-personnel').doc(id).set(Object.assign({},S.data.dossiers[id]||{},{telephone:v})),max:30}
};
const ieBtn=(k,id)=>isAdmin()&&S.conn==='shared'&&!S.archive?`<button type="button" class="ie-btn" data-act="ie" data-k="${k}" data-id="${esc(id)}" aria-label="Modifier ${IE_K[k].lbl.toLowerCase()}" title="Modifier ici">${icon('pen')}</button>`:'';
function ieStart(b){
  const K=IE_K[b.dataset.k], cell=b.closest('td,.ie-cell');if(!K||!cell||IE.on) return;
  const id=b.dataset.id, v=K.get(id);
  IE.on=true;IE.k=b.dataset.k;IE.id=id;IE.v=v;IE.cell=cell;
  cell.classList.add('ie-edit');
  cell.innerHTML=`<span class="ie-wrap" data-act="stop">${K.opts?`<select id="ie-in" aria-label="${esc(K.lbl)}">${K.opts().map(o=>`<option value="${esc(o)}"${o===v?' selected':''}>${esc(o||'—')}</option>`).join('')}</select>`:`<input id="ie-in" value="${esc(v)}" maxlength="${K.max||60}" aria-label="${esc(K.lbl)}" autocomplete="off">`}</span>`;
  const i=$('#ie-in');i.focus();if(i.select)i.select();
}
async function ieEnd(save){
  if(!IE.on) return;
  const i=$('#ie-in'), K=IE_K[IE.k], v=i?String(i.value).trim():IE.v, id=IE.id;
  IE.on=false;IE.cell=null;
  const go=save&&v!==IE.v;
  if(go) await write(()=>K.save(id,v),`${K.lbl} enregistré`);
  /* la cellule a été changée à la main : la liste se redessine même si rien n’a changé */
  if(typeof pendingMain!=='undefined') pendingMain=false;
  const m=$('#main');if(m)m._h='';
  render();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act=ie]');if(b){e.stopPropagation();ieStart(b);}},true);
document.addEventListener('keydown',e=>{
  if(!IE.on||e.target.id!=='ie-in') return;
  if(e.key==='Enter'){e.preventDefault();ieEnd(true);}
  else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();ieEnd(false);}
},true);
document.addEventListener('focusout',e=>{if(IE.on&&e.target.id==='ie-in')setTimeout(()=>{if(IE.on&&document.activeElement&&document.activeElement.id!=='ie-in')ieEnd(true);},0);});
document.addEventListener('change',e=>{if(IE.on&&e.target.id==='ie-in'&&e.target.tagName==='SELECT')ieEnd(true);});
