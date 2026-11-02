/* Rôle d’un élève dans sa classe : capitaine ou lieutenant (couleur de sa carte et de son étiquette) */
/* Le grade d’un élève : sa place dans la liste des grades (Paramètres > Élèves), -1 s’il n’en a pas ;
   « Lieutenant » seul retrouve « Lieutenant 1 » (même premier mot). Sa couleur sert aux cartes et aux étiquettes. */
const gradeIdx=f=>{const x=String(f||'').trim().toLowerCase();if(!x)return -1;const gs=gradesL();let i=gs.findIndex(g=>g.nom.toLowerCase()===x);
  if(i<0){const w=x.split(/\s+/)[0];i=gs.findIndex(g=>g.nom.toLowerCase().split(/\s+/)[0]===w);}return i;};
const fnKind=f=>{const i=gradeIdx(f);return i<0?'':gradesL()[i].c||'gris';};
/* ---------- Pages : élèves ---------- */
/* Notes d’un élève, d’après les résultats d’examens : moyenne des notes en %, examens réussis, examens à reprendre */
function studentNotes(){
  const out={};
  for(const d of Object.values(S.data.resultats||{})){
    const r=(d&&d.resultats)||{}, p=(d&&d.pct)||{};
    for(const [id,v] of Object.entries(r)){
      if(!v) continue;
      const o=out[id]||(out[id]={sum:0,np:0,ok:0,tot:0,todo:0});
      o.tot++;if(v==='reussi'||v==='reprise')o.ok++;if(v==='echec'||v==='absent')o.todo++;
      const x=p[id];if(x!=null&&x!==''&&!isNaN(+x)){o.sum+=+x;o.np++;}
    }
  }
  for(const o of Object.values(out)) o.avg=o.np?Math.round(o.sum/o.np):null;
  return out;
}
/* Ordre des grades : celui de la liste, puis les autres fonctions, puis sans grade */
const gradeRank=f=>{const x=String(f||'').trim();if(!x)return 999;const i=gradeIdx(x);return i<0?500:i;};
/* Nom de famille d’abord (« Beaulieu Alexandre ») pour trier par nom */
const famKey=n=>{const p=String(n||'').trim().split(/\s+/);return p.length>1?p.slice(1).join(' ')+' '+p[0]:String(n||'');};
const EL_SORTS=[['num','numéro'],['nom','nom'],['classe','classe'],['grade','grade'],['note-d','note ↓'],['note-a','note ↑'],['pres','présence ↑']];
/* Filtre « Afficher » : un grade (g0, g1… dans l’ordre de la liste), sans grade, ou un état des notes */
const elFilters=()=>gradesL().map((g,i)=>['g'+i,g.nom]).concat([['none','Sans grade'],['sous','Moyenne sous le seuil'],['rep','Examens à reprendre']]);
function studentsPage(){
  if(S.pg.fiche) return studentFiche();
  const st=S.pg, q=String(st.q||'').trim().toLowerCase(), g=st.g||'';
  const per=st.period||'mois', [from,to]=periodRange(per);
  ensureTerm(from);
  const stats=studentStats(from,to);
  const ff=elFilters().some(x=>x[0]===st.ff)?st.ff:'', fg=/^(g\d+|none)$/.test(ff)?ff:'', fn=['sous','rep'].includes(ff)?ff:'', so=EL_SORTS.some(x=>x[0]===st.so)?st.so:'num', notes=studentNotes(), sl=seuil();
  let els=sortElsByClass(S.data.eleves);
  if(g) els=els.filter(e=>e.groupe===g);
  if(q) els=els.filter(e=>String(e.nom||'').toLowerCase().includes(q));
  if(fg) els=els.filter(e=>fg==='none'?gradeIdx(e.fonction)<0:gradeIdx(e.fonction)===+fg.slice(1));
  if(fn==='sous') els=els.filter(e=>notes[e.id]&&notes[e.id].avg!=null&&notes[e.id].avg<sl);
  if(fn==='rep') els=els.filter(e=>notes[e.id]&&notes[e.id].todo>0);
  /* tri : à égalité, l’ordre habituel (classe, puis numéro) départage */
  const base=new Map(els.map((e,i)=>[e.id,i])), avg=e=>notes[e.id]&&notes[e.id].avg!=null?notes[e.id].avg:null, pr=e=>rateOf(stats[e.id]);
  const last=(x,y,f)=>x==null&&y==null?0:x==null?1:y==null?-1:f(x,y);
  const cmp={nom:(a,b)=>collator.compare(famKey(a.nom),famKey(b.nom)),classe:(a,b)=>collator.compare(gName(a.groupe),gName(b.groupe)),grade:(a,b)=>gradeRank(a.fonction)-gradeRank(b.fonction),
    'note-d':(a,b)=>last(avg(a),avg(b),(x,y)=>y-x),'note-a':(a,b)=>last(avg(a),avg(b),(x,y)=>x-y),pres:(a,b)=>last(pr(a),pr(b),(x,y)=>x-y)}[so];
  if(cmp) els=[...els].sort((a,b)=>cmp(a,b)||base.get(a.id)-base.get(b.id));
  const tb=`<div class="toolbar"><input class="search" id="s-q" type="search" placeholder="Rechercher un élève" aria-label="Rechercher un élève" autocomplete="off" value="${esc(S.pg.q||'')}"><select id="s-g" aria-label="Classe"><option value="">Toutes les classes</option>${groups().map(x=>`<option value="${esc(x.id)}"${g===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select><select id="s-ff" aria-label="Afficher"><option value="">Tous les élèves</option><optgroup label="Grade">${elFilters().filter(x=>/^(g\d+|none)$/.test(x[0])).map(([k,l])=>`<option value="${k}"${ff===k?' selected':''}>${esc(l)}</option>`).join('')}</optgroup><optgroup label="Notes (seuil ${sl} %)">${elFilters().filter(x=>x[0]==='sous'||x[0]==='rep').map(([k,l])=>`<option value="${k}"${ff===k?' selected':''}>${l}</option>`).join('')}</optgroup></select><select id="s-so" aria-label="Trier par">${EL_SORTS.map(([k,l])=>`<option value="${k}"${so===k?' selected':''}>Tri : ${l}</option>`).join('')}</select>${periodSeg(per)}<span class="grow"></span><button class="btn" type="button" id="st-import" data-act="st-import" title="Importer une liste" aria-label="Importer une liste">${icon('up')}<span class="t-long">Importer une liste</span></button><button class="btn primary" type="button" data-act="new-student">${icon('plus')}<span class="t-long">Ajouter un élève</span><span class="t-short">Ajouter</span></button></div>`;
  if(!S.data.eleves.length) return tb+emptyBox('Aucun élève inscrit','Ajoutez des élèves un à la fois ici, ou collez une liste complète dans le menu Classes.');
  const body=els.map(e=>{const s=stats[e.id], r=rateOf(s);
    const a=s?s.A+s.M:0, rt=s?s.R:0, cls=rateCls(r);
    const fk=fnKind(e.fonction);
    return `<tr class="row-link" data-act="student" data-id="${esc(e.id)}"${fk?` data-fn="${fk}"`:''}><td><span class="tb-who"><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span><span><button class="link" type="button" data-act="student" data-id="${esc(e.id)}">${esc(e.nom)}</button>${e.fonction?`<span class="role-chip${fk?' rc-'+fk:''}">${esc(e.fonction)}</span>`:''}</span></span></td><td class="tb-cls"><span class="tb-who"><span class="cl-num sm" aria-hidden="true">${esc(String(gName(e.groupe)).replace(/^(Classe|Groupe)\s+/i,'').slice(0,4))}</span><span class="muted sm">${esc(gName(e.groupe))}</span></span></td><td class="tb-top">${r==null?'<span class="muted tb-empty">—</span>':`<div class="cl-big tb-rate ${cls}"><b>${r} %</b><div class="meter ${cls}" aria-hidden="true"><i style="width:${r}%"></i></div></div>`}</td><td class="num" data-l="Note">${avg(e)!=null?`<span class="tb-n${avg(e)<sl?' bad':''}">${avg(e)} %</span>`:'<span class="muted tb-empty">—</span>'}</td><td class="num" data-l="Absences"><span class="tb-n ${a?'bad':'zero'}">${a}</span></td><td class="num" data-l="Retards"><span class="tb-n ${rt?'warn':'zero'}">${rt}</span></td><td class="tb-tel ie-cell">${e.telephone?esc(e.telephone):'<span class="muted tb-empty">—</span>'}${ieBtn('el-tel',e.id)}</td></tr>`;}).join('');
  return tb+`<p class="summary"><span><b>${els.length}</b>${els.length>1?'élèves':'élève'}</span><span>Présences comptées depuis le ${esc(longDate(parse(from)))}</span>${S.termLoaded?'':'<span>Chargement des présences…</span>'}</p>
    <div class="tbl-wrap"><table class="tbl stack st-cards"><thead><tr><th>Élève</th><th>Classe</th><th>Présence</th><th class="num" title="Moyenne des notes d’examens en %">Note</th><th class="num">Absences</th><th class="num">Retards</th><th>Téléphone</th></tr></thead><tbody>${body||'<tr><td colspan="7" class="muted">Aucun élève ne correspond à la recherche ou aux filtres.</td></tr>'}</tbody></table></div>`;
}

/* ---------- Photos de profil (élèves et personnel) ----------
   Gardée dans la fiche de la personne (eleves/<id>.photo, enseignants/<id>.photo) : une image JPEG carrée de 240 px,
   recadrée au centre et allégée dans le navigateur (une quinzaine de Ko). L’administration la choisit en cliquant
   sur la photo (ou les initiales) de la fiche, ou dans « Modifier » ; sans photo, les initiales restent. */
const PH_COL={eleve:'eleves',staff:'enseignants'};
const photoOf=id=>{const p=byId(S.data.eleves,id)||byId(S.data.enseignants,id);return (p&&p.photo)||'';};
const canPhoto=()=>isAdmin()&&S.conn==='shared'&&!S.archive;
/* La photo (ou les initiales) ; pour l’administration, un clic choisit une image (l’appareil photo sur un téléphone) */
const photoPick=(kind,p,cls)=>{
  const av=avHTML(p.nom,p.photo||'',cls), lbl=(p.photo?'Changer la photo de ':'Ajouter une photo de ')+(p.nom||'');
  return canPhoto()&&p.id?`<label class="ph-pick" title="${esc(p.photo?'Changer la photo':'Ajouter une photo')}">${av}<span class="ph-cam" aria-hidden="true">${icon('cam')}</span><input type="file" accept="image/*" class="vh" data-photo="${kind}" data-id="${esc(p.id)}" aria-label="${esc(lbl)}"></label>`:av;
};
/* Dans « Modifier » : la photo, puis Changer / Retirer (enregistré tout de suite, sans attendre le bouton du formulaire) */
const photoRow=(kind,p)=>!p?'':`<div class="ph-row">${photoPick(kind,p,'lg')}<div><b>Photo</b><p class="help">${canPhoto()?(p.photo?'Cliquez sur la photo pour la changer.':'Cliquez sur les initiales pour choisir une photo.'):'Seule l’administration peut changer la photo.'}</p>${p.photo&&canPhoto()?`<button class="btn sm ghost" type="button" data-act="photo-del" data-kind="${kind}" data-id="${esc(p.id)}">Retirer la photo</button>`:''}</div></div>`;
function readPhoto(file){
  return new Promise((ok,ko)=>{
    if(!file||!/^image\//.test(file.type)) return ko(new Error('Choisissez une image (photo JPEG, PNG…).'));
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>{
      const n=240, w=img.naturalWidth, h=img.naturalHeight, s=Math.min(w,h), c=document.createElement('canvas'), x=c.getContext('2d');
      c.width=c.height=n;x.fillStyle='#FFFFFF';x.fillRect(0,0,n,n);x.drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,n,n);
      URL.revokeObjectURL(url);ok(c.toDataURL('image/jpeg',.82));
    };
    img.onerror=()=>{URL.revokeObjectURL(url);ko(new Error('Cette image ne peut pas être lue.'));};
    img.src=url;
  });
}
async function setPhoto(kind,id,data){
  if(!PH_COL[kind]||!id) return;
  await write(()=>col(PH_COL[kind]).doc(id).update({photo:data||''}),data?'Photo enregistrée':'Photo retirée');
  render();
}
document.addEventListener('change',async ev=>{
  const t=ev.target;if(!t||!t.dataset||!t.dataset.photo) return;
  const f=t.files&&t.files[0], kind=t.dataset.photo, id=t.dataset.id;t.value='';if(!f) return;
  try{await setPhoto(kind,id,await readPhoto(f));}catch(err){toast(err.message,'bad');}
});

/* ---------- Fiches en pleine page (élèves et personnel) ----------
   Une liste à gauche pour passer d’une personne à l’autre, « Précédent / Suivant » (ou ← →),
   et « Retour à la liste » (ou Échap) qui revient à l’endroit où l’on était. */
const studentList=()=>{
  const q=String(S.pg.q||'').trim().toLowerCase(), g=S.pg.g||'';
  let els=sortElsByClass(S.data.eleves);
  if(g) els=els.filter(e=>e.groupe===g);
  if(q) els=els.filter(e=>String(e.nom||'').toLowerCase().includes(q));
  return els;
};
function openFiche(page,id){
  const from=S.page===page?(S.pg.from||null):S.page;
  if(S.page!==page){
    S.page=page;S.pg={};
    if(page==='eleves'){const e=byId(S.data.eleves,id);if(e&&from==='classes')S.pg.g=e.groupe;}
    if(page==='eleves'||page==='classes')ensureTerm();
  }else if(!S.pg.fiche) S.pg.listY=window.scrollY;
  S.pg.fiche=id;S.pg.from=from;S.dr=null;
  render();window.scrollTo({top:0});
}
function closeFiche(){
  const from=S.pg.from, y=S.pg.listY||0;
  if(from&&from!==S.page){goPage(from);return;}
  S.pg.fiche=null;render();window.scrollTo({top:y});
}
function ficheStep(d){
  const list=S.page==='eleves'?studentList():S.page==='classes'?groups():S.page==='modules'?modList():staff(), i=list.findIndex(x=>x.id===S.pg.fiche), n=list[i+d];
  if(n){S.pg.fiche=n.id;render();window.scrollTo({top:0});const b=$(d<0?'#fi-prev':'#fi-next');if(b&&!b.disabled)b.focus({preventScroll:true});}
}
const ageOf=d=>{if(!d)return null;const b=parse(d),t=new Date();let a=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;return a>=0&&a<120?a:null;};
const acctOfRef=id=>S.data.comptes.find(a=>a.ref===id&&!a.exemple)||S.data.comptes.find(a=>a.ref===id)||null;
function ficheShell(kind,list,cur,listItem,head,tabs,content){
  const i=list.findIndex(x=>x.id===cur.id), prev=list[i-1], next=list[i+1];
  const from=S.pg.from&&S.pg.from!==S.page?S.pg.from:null;
  const backLbl=from==='classes'?'Retour aux classes':kind==='eleves'?'Retour à la liste des élèves':kind==='classes'?'Retour aux classes':kind==='modules'?'Retour aux modules':'Retour à la liste du personnel';
  const filt=kind==='eleves'?`<div class="fl-tools"><input class="search" id="s-q" type="search" placeholder="Rechercher" aria-label="Rechercher un élève" autocomplete="off" value="${esc(S.pg.q||'')}"><select id="s-g" aria-label="Classe"><option value="">Toutes les classes</option>${groups().map(x=>`<option value="${esc(x.id)}"${S.pg.g===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select></div>`:'';
  const nav=`<div class="fiche-nav"><button class="btn sm" type="button" id="fi-back" data-act="fi-back">${icon('left')}${backLbl}</button><span class="grow"></span>
    ${i>=0?`<span class="muted sm">${i+1} sur ${list.length}</span>`:''}
    <button class="btn sm" type="button" id="fi-prev" data-act="fi-step" data-d="-1"${prev?` title="${esc(prev.nom)} (←)"`:' disabled'}>${icon('left')}<span class="fi-lbl">${prev?esc(prev.nom):'Précédent'}</span></button>
    <button class="btn sm" type="button" id="fi-next" data-act="fi-step" data-d="1"${next?` title="${esc(next.nom)} (→)"`:' disabled'}><span class="fi-lbl">${next?esc(next.nom):'Suivant'}</span>${icon('right')}</button></div>`;
  const tab=S.pg.tab&&tabs.some(t=>t[0]===S.pg.tab)?S.pg.tab:tabs[0][0];
  const tabBar=`<div class="seg fiche-tabs" role="group" aria-label="Sections de la fiche">${tabs.map(([k,l])=>`<button type="button" id="fi-tab-${k}" data-act="fi-tab" data-v="${k}" aria-pressed="${k===tab}">${l}</button>`).join('')}</div>`;
  return `<div class="fiche"><aside class="fiche-list" aria-label="${kind==='eleves'?'Élèves':kind==='classes'?'Classes':kind==='modules'?'Modules':'Personnel'}">${filt}<ul>${list.map(x=>`<li><button type="button" class="fl-item" id="fl-${esc(x.id)}" data-act="${kind==='eleves'?'student':kind==='classes'?'class':kind==='modules'?'module':'staff'}" data-id="${esc(x.id)}" aria-current="${x.id===cur.id}">${listItem(x)}</button></li>`).join('')||'<li class="muted sm" style="padding:12px">Aucun résultat.</li>'}</ul></aside>
    <div class="fiche-main">${nav}${head}${tabBar}<div class="fiche-body">${content(tab)}</div></div></div>`;
}
/* Compte de la personne, affiché dans l’en-tête de sa fiche */
function acctChip(id){
  const a=acctOfRef(id);
  if(!a) return '<span class="chip off" id="fi-acct-chip" title="La personne ne peut pas encore se connecter à son horaire.">Sans compte</span>';
  const p=a.exemple?null:profOf(a.id);
  if(!a.exemple) needProfiles([a.id]);
  const who=a.exemple?'compte d’exemple':((p&&p.name)||(siteMode()?'compte du site':'accès claude.ai'));
  return `<span class="chip ok" id="fi-acct-chip" title="${esc('Compte '+ROLE_LBL[a.role]+(a.maj?' · mis à jour le '+longDate(new Date(a.maj)):''))}">Compte ${esc(ROLE_LBL[a.role].toLowerCase())} · ${esc(who)}</span>`;
}
function acctBtn(id,role){
  const a=acctOfRef(id);
  return a?`<button class="btn sm" type="button" id="fi-acct-btn" data-act="ac-edit" data-id="${esc(a.id)}">Modifier le compte</button>`
    :`<button class="btn sm" type="button" id="fi-acct-btn" data-act="fi-acct" data-role="${role}" data-id="${esc(id)}"${dis()}>${icon('plus')}Créer son compte</button>`;
}

/* En-tête : identité, actions, puis quelques chiffres clés */
const ficheHead=(name,chips,actions,stats,av)=>`<section class="panel fiche-head"><div class="fh-top">${av||avHTML(name,'','lg')}<div class="prof-id"><h2 id="fi-name">${esc(name)}</h2>${chips?`<div class="prof-chips">${chips}</div>`:''}</div><div class="fiche-act">${actions}</div></div>
  <dl class="fh-stats">${stats.map(([k,v,cls])=>`<div><dt>${k}</dt><dd${cls?` class="${cls}"`:''}>${v}</dd></div>`).join('')}</dl></section>`;
const rows=items=>items.length?`<ul class="plist">${items.join('')}</ul>`:'';

/* Fiche d’un élève : une chemise de dossier.
   En haut, des intercalaires (Identité, Présences, Examens, Équipement, Documents, Suivi) ; dans la chemise, une feuille :
   l’en-tête (classe, numéro, nom, « Modifier » et « ⋯ »), puis le contenu de l’intercalaire. Sur « Identité », la photo
   d’identité et les renseignements en formulaire. « Retour », « n sur N » et « Précédent / Suivant » (ou ← →) sont dans l’en-tête de la page. */
const DOCS_ADM=[['naiss','Certificat de naissance (grand format)'],['dip','Diplôme d’études secondaires ou dernier relevé de notes'],['cv','Curriculum vitae'],['permis','Permis de conduire'],['sante','Déclaration de bonne santé'],['opto','Rapport d’optométriste'],['embarc','Carte de conducteur d’embarcation de plaisance']];
const DOS_TABS=[['identite','Identité'],['presences','Présences'],['examens','Examens'],['equipement','Équipement'],['documents','Documents'],['suivi','Suivi']];
function studentFiche(){
  const e=byId(S.data.eleves,S.pg.fiche);
  if(!e){S.pg.fiche=null;return studentsPage();}
  ensureTerm(yearStart());
  const list=studentList(), i=list.findIndex(x=>x.id===e.id), prev=list[i-1], next=list[i+1], fk=fnKind(e.fonction), ac=acctOfRef(e.id);
  const s=studentStats(yearStart(),todayISO())[e.id], r=rateOf(s), age=ageOf(e.naissance), loaded=S.termLoaded, n=s?s.n:0, ab=s?s.A+s.M:0, rt=s?s.R:0;
  const nextEx=upcomingExams(x=>x.grp===e.groupe,1)[0], tab=DOS_TABS.some(t=>t[0]===S.pg.tab)?S.pg.tab:'identite';
  const from=S.pg.from&&S.pg.from!==S.page?S.pg.from:null;
  /* barre d’outils : elle monte dans l’en-tête de la page, à côté des onglets Élèves / Personnel */
  const nav=`<div class="toolbar fiche-nav sf-nav"><button class="btn sm ghost" type="button" id="fi-back" data-act="fi-back">${icon('left')}${from==='classes'?'Retour aux classes':'Retour à la liste'}</button><span class="grow"></span>${i>=0?`<span class="muted sm">${i+1} sur ${list.length}</span>`:''}
    <button class="btn sm" type="button" id="fi-prev" data-act="fi-step" data-d="-1"${prev?` title="${esc(prev.nom)} (←)"`:' disabled'}>${icon('left')}Précédent</button>
    <button class="btn sm" type="button" id="fi-next" data-act="fi-step" data-d="1"${next?` title="${esc(next.nom)} (→)"`:' disabled'}>Suivant${icon('right')}</button></div>`;
  const more=`<details class="sf-more"><summary class="btn sm" id="fi-more" title="Autres actions" aria-label="Autres actions">⋯</summary><div class="sf-menu">${e.groupe?`<button type="button" data-act="see-group" data-id="${esc(e.groupe)}">Horaire de la classe</button>`:''}${ac?`<button type="button" id="fi-acct-btn" data-act="ac-edit" data-id="${esc(ac.id)}">Modifier le compte</button>`:`<button type="button" id="fi-acct-btn" data-act="fi-acct" data-role="student" data-id="${esc(e.id)}"${dis()}>Créer son compte</button>`}${e.photo&&canPhoto()?`<button type="button" id="fi-photo-del" data-act="photo-del" data-kind="eleve" data-id="${esc(e.id)}">Retirer la photo</button>`:''}</div></details>`;
  const docs=e.docs||{}, nDocs=DOCS_ADM.filter(([k])=>docs[k]).length;
  /* une ligne du formulaire : le libellé, des pointillés, la valeur */
  const ln=(k,v)=>`<div class="dos-l"><span class="k">${k}</span><i aria-hidden="true"></i><span class="v">${v||'<span class="muted">—</span>'}</span></div>`;
  const tabs=`<div class="dos-tabs fiche-tabs" role="group" aria-label="Intercalaires du dossier">${DOS_TABS.map(([k,l])=>`<button type="button" class="dos-tab" id="fi-tab-${k}" data-act="fi-tab" data-v="${k}" aria-pressed="${k===tab}">${l}${k==='documents'?` <small>${nDocs}/${DOCS_ADM.length}</small>`:''}</button>`).join('')}</div>`;
  const top=`<div class="dos-top"><div class="dos-tt"><span class="dos-kind">Dossier de l’élève</span><span class="dos-ref">${esc(gName(e.groupe))}${e.numero?` · n° ${esc(e.numero)}`:''}</span><h2 id="fi-name">${esc(e.nom)}</h2></div><span class="grow"></span><button class="btn sm primary" type="button" id="fi-edit" data-act="st-edit" data-id="${esc(e.id)}">Modifier</button>${more}</div>`;
  const stats=!loaded?'<p class="sf-line muted">Chargement des présences…</p>'
    :`<p class="sf-line" id="sf-stats">${n?`<span class="${rateCls(r)}-t"><b>${r} %</b> de présence</span>`:'<span class="muted">Aucune présence notée</span>'}<span class="sf-dot">·</span><span${ab?' class="bad-t"':''}><b>${ab}</b> ${ab>1?'absences':'absence'}</span><span class="sf-dot">·</span><span${rt?' class="warn-t"':''}><b>${rt}</b> ${rt>1?'retards':'retard'}</span></p>`;
  const content=()=>{
    if(tab==='presences'){
      if(!loaded) return '<p class="help">Chargement des présences…</p>';
      const log=s?s.log.slice().sort((p,q)=>q.date.localeCompare(p.date)):[], byC={};
      for(const p of Object.values(S.data.presTerm)){const v=p&&p.statuts&&p.statuts[e.id];if(!v||!LBL[v])continue;const x=byC[p.cours]||(byC[p.cours]={P:0,A:0,R:0,M:0,n:0});x[v]++;x.n++;}
      const per=Object.entries(byC).map(([cid,x])=>({c:byId(S.data.cours,cid),x})).sort((p,q)=>collator.compare(p.c?p.c.titre:'',q.c?q.c.titre:''));
      return stats+`<div class="sf-two"><div><h4>Absences et retards</h4>${log.length?rows(log.map(x=>{const c=byId(S.data.cours,x.cours);return `<li><span>${esc(dayLabel(parse(x.date)))}<span class="muted sm"> · ${esc(c?c.titre:'Cours')}</span></span><span class="chip ${CHIP[x.v]}">${LBL[x.v]}</span></li>`;})):'<p class="help">Aucune absence ni aucun retard depuis la rentrée.</p>'}</div>
        <div><h4>${W('Par module','Par cours')}</h4>${per.length?rows(per.map(({c,x})=>{const rr=pct(x.P+x.R,x.n);return `<li><span>${esc(c?c.titre:W('Module supprimé','Cours supprimé'))}</span><span class="chip ${rr>=95?'ok':rr>=90?'warn':'bad'}">${rr} %</span></li>`;})):`<p class="help">${W('Aucune séance notée','Aucun cours noté')} pour l’instant.</p>`}</div></div>
        ${n?`<p class="help">${pl(n,W('séance notée','cours noté'),W('séances notées','cours notés'))} depuis le ${esc(longDate(parse(yearStart())))}.</p>`:''}`;
    }
    if(tab==='examens') return studentExamsTab(e);
    if(tab==='equipement') return skStudentTab(e);
    if(tab==='documents'){
      const can=canPhoto();
      return `<h4>Pièces du dossier d’admission · ${nDocs} sur ${DOCS_ADM.length} reçues</h4><ul class="dos-docs">${DOCS_ADM.map(([k,l])=>`<li><label class="ck"><input type="checkbox" data-doc="${k}" data-id="${esc(e.id)}"${docs[k]?' checked':''}${can?'':' disabled'}><span>${l}${docs[k]?`<small>reçue le ${esc(shortDate(parse(docs[k])))}</small>`:''}</span></label></li>`).join('')}</ul>
        ${can?'<p class="help">Cochez une pièce quand elle est reçue : la date du jour est notée.</p>':''}`;
    }
    if(tab==='suivi') return e.notes?`<p class="pre">${esc(e.notes)}</p>`:'<p class="help">Aucune note. Les rencontres, mesures d’aide et remarques s’ajoutent avec « Modifier ».</p>';
    /* Identité : la photo d’identité, le nom, puis le formulaire */
    return `<div class="dos-id">${photoPick('eleve',e,'id')}<div class="dos-form">
      <div class="dos-lines">${ln('Classe',esc(gName(e.groupe))+(e.numero?' · n° '+esc(e.numero):''))}${ln('Grade',e.fonction?`<span class="role-chip${fk?' rc-'+fk:''}">${esc(e.fonction)}</span>`:'')}${ln('Date de naissance',e.naissance?esc(longDate(parse(e.naissance)))+(age!=null?` (${age} ans)`:''):'')}
      ${ln('Téléphone',e.telephone?`<a href="tel:${esc(String(e.telephone).replace(/\s+/g,''))}">${esc(e.telephone)}</a>`:'')}${ln('Courriel',e.courriel?`<a href="mailto:${esc(e.courriel)}">${esc(e.courriel)}</a>`:'')}${ln('Contact d’urgence',e.parent?esc(e.parent):'')}</div></div></div>
      <div class="dos-foot">${stats}<p class="sf-line sf-sub">Prochain examen : ${nextEx?`<b>${esc(dn(parse(nextEx.date))+' '+fMonthS.format(parse(nextEx.date)))}</b>${nextEx.c?' · '+esc((nextEx.c.code?nextEx.c.code+' ':'')+nextEx.c.titre):''}`:'aucun'}</p></div>`;
  };
  return `${nav}<div class="dos" data-enter="fiche">${tabs}<div class="dos-body"><article class="dos-sheet">${top}<div class="dos-c fiche-body" data-enter="tab">${content()}</div></article></div></div>`;
}
/* Documents : cocher une pièce note la date du jour ; décocher l’efface */
document.addEventListener('change',async ev=>{
  const t=ev.target;if(!t||!t.dataset||!t.dataset.doc) return;
  const el=byId(S.data.eleves,t.dataset.id);if(!el) return;
  /* une pièce décochée garde sa clé, vide : la mise à jour ne dépend pas de la façon dont la base fusionne les objets */
  const docs=Object.assign({},el.docs||{},{[t.dataset.doc]:t.checked?todayISO():''});
  await write(()=>col('eleves').doc(el.id).update({docs}),t.checked?'Pièce reçue':'Pièce retirée');render();
});
/* « ⋯ » : le petit menu se referme quand on clique ailleurs */
document.addEventListener('click',ev=>{for(const d of document.querySelectorAll('details.sf-more[open]'))if(!d.contains(ev.target))d.open=false;});

function staffFiche(){
  const p=byId(S.data.enseignants,S.pg.fiche);
  if(!p){S.pg.fiche=null;return staffPage();}
  const list=staff(), z=S.data.dossiers[p.id]||{}, st=statOf(p), teach=isTeacher(p);
  const item=x=>{const pc=principalClasses(x.id);return `<span class="fl-name">${esc(x.nom)}</span><span class="fl-sub">${esc(x.fonction||'Enseignant')}${pc.length?` · principal ${esc(pc.map(g=>g.nom.replace(/^(Classe|Groupe)\s+/i,'')).join(', '))}`:''}</span>`;};
  const cs=S.data.cours.filter(c=>c.enseignant===p.id).sort((x,y)=>collator.compare(gName(x.groupe),gName(y.groupe))||collator.compare(x.titre,y.titre));
  const byG={};for(const c of cs)(byG[c.groupe]=byG[c.groupe]||[]).push(c);
  const wk=weekItems().filter(x=>x.kind!=='exam'&&!x.cancelled&&x.tch.includes(p.id));
  let late=0;for(const x of wk){const ai=attInfo(x);if(ai.due)late++;}
  const chips=`<span class="chip">${esc(p.fonction||'Enseignant')}</span>${principalClasses(p.id).map(g=>`<span class="chip k0">Enseignant principal · ${esc(g.nom)}</span>`).join('')}<span class="chip ${STATUTS[st]||'off'}">${esc(st)}</span>${acctChip(p.id)}`;
  const actions=`<button class="btn sm primary" type="button" id="fi-edit" data-act="sf-edit" data-id="${esc(p.id)}">Modifier le dossier</button>${teach?`<button class="btn sm" type="button" data-act="see-teacher" data-id="${esc(p.id)}">Son horaire</button>`:''}${acctBtn(p.id,p.fonction&&!teach?'admin':'teacher')}`;
  const stats=teach?[['Modules',String(acad()?new Set(cs.map(modKey).filter(x=>x!=null)).size:cs.length),''],['Classes',String(Object.keys(byG).length),''],['Cette semaine',pl(wk.length,W('séance','cours'),W('séances','cours')),''],['Présences à prendre',String(late),late?'warn':'']]
    :[['Statut',esc(st),''],['Courriel',p.courriel?esc(p.courriel):'—','']];
  const head=ficheHead(p.nom,chips,actions+(p.photo&&canPhoto()?`<button class="btn sm ghost" type="button" id="fi-photo-del" data-act="photo-del" data-kind="staff" data-id="${esc(p.id)}">Retirer la photo</button>`:''),stats,photoPick('staff',p,'lg'));
  const SCH={P:'ok',A:'bad',C:'warn',F:'info'};
  const tabs=[['dossier','Dossier']].concat(teach?[['cours',acad()?'Modules':'Cours'],['competences','Compétences et disponibilités']]:[],[['travail','Présences au travail']]);
  const content=tab=>{
    if(tab==='competences'){
      const mine=new Set((p.competences||[]).map(Number)), can=isAdmin()&&S.conn==='shared';
      return `<section class="panel"><h2>Compétences</h2><p class="help" style="margin-bottom:10px">Les modules que ${esc(p.nom)} peut donner. Les séances à pourvoir lui sont proposées selon cette liste.</p>
          ${comps().length?`<form data-form="sf-comp" data-id="${esc(p.id)}"><div class="ck-grid">${comps().map(k=>`<label class="ck"><input type="checkbox" name="comp" value="${esc(k.code)}"${mine.has(+k.code)?' checked':''}${can?'':' disabled'}><span><b>M${esc(k.code)}</b> ${esc(k.nom)}</span></label>`).join('')}</div>
          ${can?`<div class="row" style="margin-top:12px"><button class="btn primary" type="submit"${dis()}>Enregistrer les compétences</button><button class="btn sm ghost" type="button" data-act="sf-comp-all" data-v="1">Tout cocher</button><button class="btn sm ghost" type="button" data-act="sf-comp-all" data-v="">Tout décocher</button></div>`:''}</form>`:'<p class="help">Créez d’abord les modules du programme dans le menu Modules.</p>'}</section>
        <section class="panel dp-panel" style="margin-top:14px"><h2>Disponibilités</h2>${dispoCalHTML(p.id,can)}</section>`;
    }
    if(tab==='cours'){
      const og=S.pg.og||{}, nx=nextSession(x=>x.tch.includes(p.id)), surv=upcomingExams(x=>x.e&&x.e.surveillant===p.id,5);
      const myMods=acad()?comps().filter(k=>k.charge===p.id):[];
      const modsHTML=myMods.length?`<ul class="plist" id="sf-mods">${myMods.map(k=>`<li><button class="link" type="button" data-act="module" data-id="${esc(k.code)}"><span class="muted">M${esc(k.code)}</span> ${esc(k.nom)}</button><span class="muted sm">${pl(new Set(modCourses(k.code).map(c=>c.groupe)).size,'classe','classes')}${modTot(k)?' · '+modTot(k)+' h':''}</span></li>`).join('')}</ul>`:'';
      const lst=acad()?cs.filter(isActivity):cs, byL={};for(const c of lst)(byL[c.groupe]=byL[c.groupe]||[]).push(c);
      const groupsHTML=lst.length?`<ul class="cg-list">${Object.entries(byL).sort((x,y)=>collator.compare(gName(x[0]),gName(y[0]))).map(([g,arr])=>{const h=arr.reduce((t,c)=>t+heuresOf(c),0), open=!!og[g];
        return `<li><button type="button" class="cg-head" id="cg-${esc(g)}" data-act="fi-og" data-g="${esc(g)}" aria-expanded="${open}"><span><b>${esc(gName(g))}</b><span class="muted sm"> · ${acad()?pl(arr.length,'activité','activités'):pl(arr.length,'cours','cours')}${h?` · ${h} h prévues`:''}</span></span>${icon('right')}</button>
        ${open?`<ul class="plist cg-body">${arr.map(c=>`<li><button class="link" type="button" data-act="edit-course" data-id="${esc(c.id)}">${c.code?`<span class="muted">${esc(c.code)}</span> `:''}${esc(c.titre)}</button><span class="muted sm">${heuresOf(c)?heuresOf(c)+' h':''}</span></li>`).join('')}</ul>`:''}</li>`;}).join('')}</ul>`:acad()?'':'<p class="help">Aucun cours assigné.</p>';
      return `<div class="fiche-two"><section class="panel">${acad()?`<h2>Chargé de cours</h2>${modsHTML||'<p class="help" id="sf-nomods">Chargé de cours d’aucun module.</p>'}${groupsHTML?`<h3 class="fiche-h3">Activités par classe</h3>${groupsHTML}`:''}`:`<h2>Cours par classe</h2>${groupsHTML}`}</section>
        <section class="panel"><h2>À venir</h2><p class="help">${nx?`${W('Prochaine séance','Prochain cours')} : <b>${esc(nx.s.c.titre)}</b> (${esc(gName(nx.s.c.groupe))}), ${esc(dayLabel(parse(nx.s.date)).toLowerCase())}, ${momentIn(nx.s.start,nx.s.end).replace(/^en /,'')}.`:W('Aucune séance prévue prochainement.','Aucun cours prévu prochainement.')}</p>
        ${surv.length?`<h3 class="fiche-h3">Examens à surveiller</h3><div class="list">${examRows(surv,'admin')}</div>`:''}</section></div>`;
    }
    if(tab==='travail'){
      const cnt={P:0,A:0,C:0,F:0}, off=[];
      for(const [ds,doc] of Object.entries(S.data.staffPres)){if(ds<yearStart()||ds>todayISO())continue;const v=doc&&doc.statuts&&doc.statuts[p.id];if(!v||cnt[v]==null)continue;cnt[v]++;if(v!=='P')off.push([ds,v]);}
      off.sort((x,y)=>y[0].localeCompare(x[0]));
      return `<section class="panel"><div class="att-sum">${Object.entries(cnt).map(([k,v])=>`<span class="chip ${SCH[k]}">${v} ${SLBL[k].toLowerCase()}${v>1&&k!=='F'?'s':''}</span>`).join('')}</div>
        <p class="help" style="margin:6px 0 10px">Depuis le ${esc(longDate(parse(yearStart())))}.</p>${off.length?rows(off.map(([ds,v])=>`<li><span>${esc(dayLabel(parse(ds)))}</span><span class="chip ${SCH[v]}">${SLBL[v]}</span></li>`)):'<p class="help">Aucune absence ni aucun congé.</p>'}</section>`;
    }
    const emb=z.embauche?parse(z.embauche):null, yrs=emb?Math.floor((Date.now()-emb.getTime())/(365.25*864e5)):null;
    return `<section class="panel"><dl class="facts facts3">
      <div><dt>Courriel</dt><dd>${p.courriel?`<a href="mailto:${esc(p.courriel)}">${esc(p.courriel)}</a>`:'<span class="muted">—</span>'}</dd></div>
      <div><dt>Téléphone</dt><dd>${z.telephone?`<a href="tel:${esc(String(z.telephone).replace(/\s+/g,''))}">${esc(z.telephone)}</a>`:'<span class="muted">—</span>'}</dd></div>
      <div><dt>Date d’embauche</dt><dd>${emb?esc(longDate(emb))+(yrs!=null&&yrs>=1?` <span class="muted">(${pl(yrs,'an','ans')})</span>`:''):'<span class="muted">—</span>'}</dd></div>
      <div class="wide"><dt>Remarques</dt><dd>${z.notes?`<span class="pre">${esc(z.notes)}</span>`:'<span class="muted">Aucune remarque.</span>'}</dd></div></dl></section>`;
  };
  return ficheShell('personnel',list,p,item,head,tabs,content);
}

