/* ---------- Séances : chaque séance d’une classe s’enregistre à part, dans cours/<id>.seances = { idSéance: {…} }.
   Deux personnes peuvent ainsi modifier deux séances du même module sans s’écraser.
   L’ancien tableau « extras » reste lu ; en mémoire, c.extras est toujours la liste des séances du cours. ---------- */
let RAWC=[];
function normCours(raw){
  const ch=new Map(comps().filter(k=>k.charge).map(k=>[+k.code,k.charge]));
  return raw.map(r=>{
    const c=Object.assign({},r), m=new Map();
    for(const x of r.extras||[]) if(x&&x.id) m.set(x.id,x);
    for(const [id,v] of Object.entries(r.seances||{})){
      if(!v){m.delete(id);continue;}
      const o=Object.assign({},m.get(id),v,{id});
      for(const k of Object.keys(o)) if(o[k]===null) delete o[k];
      m.set(id,o);
    }
    c.extras=[...m.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.debut).localeCompare(String(b.debut)));
    delete c.seances;
    /* Le chargé de cours du module donne ses séances à toutes les classes */
    const t=ch.get(modKey(r));
    if(t){c.ens0=r.enseignant||'';c.enseignant=t;}
    return c;
  });
}
/* Écrit seulement ce qui a changé dans cours/<id> : une séance ajoutée, modifiée ou retirée part seule */
const xBody=(x,old)=>{const o=Object.assign({},x);delete o.id;if(old)for(const k of Object.keys(old))if(k!=='id'&&!(k in o))o[k]=null;return o;};
function putCours(id,doc){
  const c0=byId(S.data.cours,id), same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  if(!c0){const o=Object.assign({},doc);delete o.id;delete o.ens0;o.seances={};for(const x of doc.extras||[])o.seances[x.id]=xBody(x);delete o.extras;return col('cours').doc(id).set(o);}
  const p={}, a=new Map((c0.extras||[]).map(x=>[x.id,x])), b=new Map((doc.extras||[]).map(x=>[x.id,x])), sx={};
  for(const k of Object.keys(doc)) if(k!=='extras'&&k!=='seances'&&k!=='id'&&k!=='ens0'&&!same(doc[k],c0[k])) p[k]=doc[k];
  for(const [xid,x] of b) if(!a.has(xid)||!same(a.get(xid),x)) sx[xid]=xBody(x,a.get(xid));
  for(const xid of a.keys()) if(!b.has(xid)) sx[xid]=null;
  if(Object.keys(sx).length) p.seances=sx;
  return Object.keys(p).length?col('cours').doc(id).update(p):Promise.resolve();
}
function moveSlotWeekly(cr,sid,jour,debut,fin,eff){
  const i=cr.findIndex(s=>s.id===sid);if(i<0)return cr;
  const s=cr[i];
  if(s.du&&s.du>=eff){cr[i]=Object.assign({},s,{jour,debut,fin});return cr;}
  const end=iso(addDays(parse(eff),-1));
  cr[i]=Object.assign({},s,{au:end});
  const n={id:slotId(),jour,debut,fin,salle:s.salle||'',du:eff};if(s.au)n.au=s.au;
  cr.push(n);
  return cr;
}
function moveOnce(doc,s,date,debut,fin){
  if(s.extra){
    const x=doc.extras.find(e=>e.id===s.extra.id);if(!x)return;
    if(x.de){const [od,osid]=x.de.split('@'),orig=doc.creneaux.find(e=>e.id===osid);
      if(orig&&od===date&&orig.debut===debut&&orig.fin===fin){doc.extras=doc.extras.filter(e=>e.id!==x.id);doc.annulees=doc.annulees.filter(t=>t!==x.de);return;}}
    Object.assign(x,{date,debut,fin});return;
  }
  const tag=`${s.date}@${s.sl.id}`;
  if(!doc.annulees.includes(tag)) doc.annulees.push(tag);
  doc.extras.push({id:'x'+Math.random().toString(36).slice(2,8),date,debut,fin,salle:s.sl.salle||'',de:tag});
}
async function applyMove(){
  const d=S.dr;if(!d||S.busy)return;
  const s=findSess(d.date,d.key), t=d.swapKey?findSess(d.toDate,d.swapKey):null;
  if(!s||(d.swapKey&&!t))return;
  const [deb,fin]=d.time.split('-');
  if(!t&&d.toDate===s.date&&deb===s.sl.debut&&fin===s.sl.fin){d.err='Choisissez un autre jour ou une autre heure.';renderDrawer();return;}
  const docs=new Map(), get=c=>{if(!docs.has(c.id))docs.set(c.id,courseDoc(c));return docs.get(c.id);};
  const prev=new Map();
  for(const c of [s.c,t&&t.c].filter(Boolean)) prev.set(c.id,courseDoc(c));
  const weekly=d.scope==='weekly'&&!s.extra&&(!t||!t.extra);
  const jourOf=ds=>(parse(ds).getDay()+6)%7+1, eff=iso(monday(parse(s.date)));
  if(t){
    if(weekly){
      const ds=get(s.c);ds.creneaux=moveSlotWeekly(ds.creneaux,s.sl.id,jourOf(t.date),t.sl.debut,t.sl.fin,eff);
      const dt=get(t.c);dt.creneaux=moveSlotWeekly(dt.creneaux,t.sl.id,jourOf(s.date),s.sl.debut,s.sl.fin,eff);
    }else{
      moveOnce(get(s.c),s,t.date,t.sl.debut,t.sl.fin);
      moveOnce(get(t.c),t,s.date,s.sl.debut,s.sl.fin);
    }
  }else if(weekly){const dc=get(s.c);dc.creneaux=moveSlotWeekly(dc.creneaux,s.sl.id,jourOf(d.toDate),deb,fin,eff);}
  else moveOnce(get(s.c),s,d.toDate,deb,fin);
  S.busy=true;renderDrawer();
  const ok=await write(async()=>{for(const [id,doc] of docs) await putCours(id,doc);});
  S.busy=false;
  if(ok){
    if(S.dr===d) S.dr=null;
    const what=t?`${sObj(s)} ⇄ ${sObj(t)}`:`${sObj(s)} → ${dayLabel(parse(d.toDate)).toLowerCase()}, ${momentIn(toMin(deb),toMin(fin)).replace(/^en /,'')}`;
    logEv('horaire',t?W('a échangé deux séances','a échangé deux cours'):W('a déplacé la séance','a déplacé le cours'),what);
    toast(t?W('Séances échangées','Cours échangés'):W('Séance déplacée','Cours déplacé'),null,{label:'Annuler',fn:async()=>{if(await write(async()=>{for(const [id,doc] of prev) await putCours(id,doc);},'Changement annulé'))logEv('horaire','a annulé son changement',what);}});
  }
  render();
}

/* Examens */
function openExam(id,preset){
  const e=id?byId(S.data.examens,id):null;
  const draft=e?{resultats:Object.assign({},examResOf(examItem(e))),pct:Object.assign({},examPctOf(examItem(e))),cours:e.cours||'',groupe:e.groupe||'',titre:e.titre||'',date:e.date||'',debut:e.debut||'',fin:e.fin||'',salle:e.salle||'',surveillant:e.surveillant||'',notes:e.notes||''}
    :{resultats:{},pct:{},cours:'',groupe:S.role==='student'?S.group:'',titre:'Examen',date:'',debut:'08:00',fin:'11:00',salle:'',surveillant:S.role==='teacher'?S.teacher:'',notes:''};
  if(preset){Object.assign(draft,preset);if(preset.cours)fillExamFromCourse(draft,true);}
  openDrawer({kind:'exam',id:id||null,draft,err:'',warn:null,confirmDel:false});
}
function fillExamFromCourse(f,all){
  const c=byId(S.data.cours,f.cours);if(!c)return;
  if(all){f.groupe=c.groupe||f.groupe;f.salle=c.salle||f.salle;f.surveillant=c.enseignant||f.surveillant;}
  if(f.date){const j=(parse(f.date).getDay()+6)%7+1, sl=activeSlots(c).find(s=>+s.jour===j);if(sl){f.debut=sl.debut;f.fin=sl.fin;if(sl.salle)f.salle=sl.salle;}}
}
function examDrawer(){
  const d=S.dr, f=d.draft, e=d.id?byId(S.data.examens,d.id):null;
  if(d.sess){
    const x=allExamItems().find(k=>k.key===d.sess);if(!x) return goneHTML('Examen');
    const can=canEditItem(x);
    const body=`<form id="x-form" data-form="exam" novalidate><dl class="facts"><div><dt>Quand</dt><dd>${esc(dayLabel(parse(x.date)))}, ${esc(momentOf(x).toLowerCase())}</dd></div><div><dt>Classe</dt><dd>${esc(gName(x.grp))}</dd></div><div><dt>Enseignant</dt><dd>${x.c&&x.c.enseignant?esc(tName(x.c.enseignant)):'—'}</dd></div></dl>${examResultsHTML(f,can)||'<p class="help">Aucun élève dans cette classe.</p>'}${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>`;
    const foot=can?`<button class="btn primary" type="submit" form="x-form"${dis()}>Enregistrer les résultats</button><button class="btn ghost" type="button" data-act="sess-at" data-key="${esc(x.key)}" data-date="${x.date}">Voir ${W('la séance','le cours')}</button>`:'';
    return dTop('Résultats de l’examen',xTitle(x),esc(x.e.titre&&x.e.titre!=='Examen'?x.e.titre:''))+`<div class="dr-body">${body}</div>${foot?`<div class="dr-foot">${foot}</div>`:''}`;
  }
  if(d.id&&!e) return goneHTML('Examen');
  if(!canEditExam(e)){
    const x=examItem(e);
    return dTop('Examen',x.c?titleOf(x.c):esc(e.titre||'Examen'),esc(e.titre||''))+`<div class="dr-body"><dl class="facts"><div><dt>Quand</dt><dd>${esc(dayLabel(parse(e.date)))}, ${momentOf(x).toLowerCase()}</dd></div><div><dt>Local</dt><dd>${esc(x.salle)||'À confirmer'}</dd></div><div><dt>Classe</dt><dd>${esc(gName(x.grp))}</dd></div><div><dt>Surveillance</dt><dd>${esc(e.surveillant?tName(e.surveillant):'À confirmer')}</dd></div></dl>${e.notes?`<section class="dr-sec"><h3>À savoir</h3><p style="margin:0;white-space:pre-wrap">${esc(e.notes)}</p></section>`:''}</div>`;
  }
  let cs=S.data.cours.slice().sort((a,b)=>collator.compare(gName(a.groupe)+a.titre,gName(b.groupe)+b.titre));
  if(S.role==='teacher') cs=cs.filter(c=>c.enseignant===S.teacher||c.id===f.cours);
  const cOpts=`<option value="">${S.role==='teacher'?'Choisir un de vos cours':'Aucun cours précis'}</option>`+cs.map(c=>`<option value="${esc(c.id)}"${f.cours===c.id?' selected':''}>${esc(c.titre+' · '+gName(c.groupe))}</option>`).join('');
  const gOpts='<option value="">Choisir une classe</option>'+groups().map(g=>`<option value="${esc(g.id)}"${f.groupe===g.id?' selected':''}>${esc(g.nom)}</option>`).join('');
  const sOpts='<option value="">À confirmer</option>'+staff().filter(p=>p.statut!=='Inactif').map(p=>`<option value="${esc(p.id)}"${f.surveillant===p.id?' selected':''}>${esc(p.nom)}</option>`).join('');
  const body=`<form id="x-form" data-form="exam" novalidate>
    <label class="field"><span>Cours</span><select id="x-cours" data-f="cours">${cOpts}</select></label>
    <div class="grid2"><label class="field"><span>Titre de l’examen</span><input id="x-titre" data-f="titre" value="${esc(f.titre)}" maxlength="80" placeholder="Examen de mi-étape" autocomplete="off"></label><label class="field"><span>Classe</span><select id="x-groupe" data-f="groupe"${f.cours?' disabled':''}>${gOpts}</select></label></div>
    <div class="grid2"><label class="field"><span>Date</span><input type="date" id="x-date" data-f="date" value="${esc(f.date)}"></label><label class="field"><span>Moment</span>${periodSelect('x-per',f.debut,f.fin,'',d.customT)}</label></div>
    ${d.customT||periodOf(f.debut,f.fin)==='autre'?`<div class="grid2"><label class="field"><span>Début</span><input type="time" id="x-debut" data-f="debut" value="${esc(f.debut)}" step="300"></label><label class="field"><span>Fin</span><input type="time" id="x-fin" data-f="fin" value="${esc(f.fin)}" step="300"></label></div>`:''}
    <div class="grid2"><label class="field"><span>Local</span><input id="x-salle" data-f="salle" value="${esc(f.salle)}" maxlength="40" autocomplete="off"></label><label class="field"><span>Surveillance</span><select id="x-surv" data-f="surveillant">${sOpts}</select></label></div>
    ${examResultsHTML(f,true)}
    <label class="field"><span>À savoir pour les élèves</span><textarea id="x-notes" data-f="notes" rows="2" placeholder="Matière couverte, matériel permis…">${esc(f.notes)}</textarea></label>
    <p class="help">En choisissant un cours et une date, le moment et le local de ce cours sont proposés.</p>
    ${d.warn?`<div class="notice warn"><p><b>Conflit d’examens.</b></p><ul>${d.warn.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>`;
  const foot=d.confirmDel
    ?`<p>Supprimer cet examen ? Il disparaîtra de l’horaire de la classe.</p><button class="btn danger" type="button" data-act="x-del-yes"${dis()}>Supprimer</button><button class="btn ghost" type="button" data-act="x-del-no">Annuler</button>`
    :`<button class="btn primary" type="submit" form="x-form"${dis()}>${d.warn?'Enregistrer quand même':d.id?'Enregistrer':'Planifier l’examen'}</button>${d.id?'<button class="btn ghost" type="button" data-act="x-del">Supprimer l’examen</button>':''}`;
  return dTop(d.id?'Modifier l’examen':'Planifier un examen',esc(f.titre||'Examen'))+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveExam(force){
  const d=S.dr, f=d.draft;if(S.busy)return;
  const err=m=>{d.err=m;renderDrawer();};
  if(d.sess){
    const x=allExamItems().find(k=>k.key===d.sess);if(!x) return err('Cet examen n’existe plus.');
    const res={};
    for(const el of studentsOf(x.grp)) if(f.resultats&&f.resultats[el.id]) res[el.id]=f.resultats[el.id];
    S.busy=true;d.err='';renderDrawer();
    const ok=await writeResults(x,res,'Résultats enregistrés',f.pct||{});
    S.busy=false;if(ok&&S.dr===d)S.dr=null;render();return;
  }
  if(S.role==='teacher'&&!f.cours) return err('Choisissez le cours visé par l’examen.');
  if(!f.groupe) return err('Choisissez la classe qui passe l’examen.');
  if(!f.date) return err('Indiquez la date de l’examen.');
  const j=parse(f.date).getDay();
  if(j===0||j===6) return err('L’examen tombe une fin de semaine.');
  const off=offDay(f.date);
  if(off) return err(`Le ${dn(parse(f.date))} ${fMonth.format(parse(f.date))} n’est pas un jour de classe (${off}).`);
  const a=toMin(f.debut),b=toMin(f.fin);
  if(isNaN(a)||isNaN(b)) return err('Indiquez l’heure de début et de fin.');
  if(b<=a) return err('L’examen se termine avant de commencer.');
  if(!force){
    const w=S.data.examens.filter(x=>!x.seance&&x.id!==d.id&&x.date===f.date&&x.groupe===f.groupe&&toMin(x.debut)<b&&a<toMin(x.fin)).map(x=>`${gName(f.groupe)} a déjà « ${x.titre||'un examen'} » ${momentIn(toMin(x.debut),toMin(x.fin))}.`);
    if(w.length){d.warn=w;d.err='';renderDrawer();return;}
  }
  const res={};for(const el of studentsOf(f.groupe)) if(f.resultats&&f.resultats[el.id]) res[el.id]=f.resultats[el.id];
  const doc={cours:f.cours,groupe:f.groupe,titre:f.titre.trim()||'Examen',date:f.date,debut:f.debut,fin:f.fin,salle:f.salle.trim(),surveillant:f.surveillant,notes:f.notes.trim(),maj:new Date().toISOString()};
  const id=d.id||genId('x');
  S.busy=true;d.err='';renderDrawer();
  const prevX=d.id?byId(S.data.examens,d.id):null;
  if(prevX&&prevX.exemple) doc.exemple=true;
  let ok=await write(()=>col('examens').doc(id).set(doc),d.id?'Examen enregistré':'Examen planifié');
  if(ok&&(Object.keys(res).length||Object.keys(examResOf(examItem(Object.assign({id},prevX||doc)))).length)) ok=await writeResults(examItem(Object.assign({},prevX||{},doc,{id})),res,'',f.pct||{});
  S.busy=false;
  if(ok&&S.dr===d) S.dr=null;
  render();
}

function examResultsHTML(f,can){
  const els=f.groupe?studentsOf(f.groupe).slice().sort(byElNum):[];
  if(!els.length) return '';
  const r=f.resultats||{}, p=f.pct||{}, cnt={reussi:0,reprise:0,echec:0,absent:0,echecf:0};for(const e of els){const v=r[e.id];if(cnt[v]!=null)cnt[v]++;}
  const ps=els.map(e=>p[e.id]).filter(n=>n!=null&&n!==''), avg=ps.length?Math.round(ps.reduce((a,b)=>a+ +b,0)/ps.length):null;
  const none=els.length-cnt.reussi-cnt.reprise-cnt.echec-cnt.absent-cnt.echecf;
  const sum=`<div class="att-sum">${cnt.reussi?`<span class="chip ok">${pl(cnt.reussi,'réussite','réussites')}</span>`:''}${cnt.reprise?`<span class="chip info">${pl(cnt.reprise,'réussi en reprise','réussis en reprise')}</span>`:''}${cnt.echec?`<span class="chip bad">${pl(cnt.echec,'échec','échecs')}</span>`:''}${cnt.absent?`<span class="chip warn">${pl(cnt.absent,'absent','absents')}</span>`:''}${cnt.echecf?`<span class="chip bad">${pl(cnt.echecf,'échec de module','échecs de module')}</span>`:''}${none?`<span class="chip off">${none} sans résultat</span>`:''}${avg!=null?`<span class="chip off" id="xr-avg">Moyenne ${avg} %</span>`:''}</div>`;
  const btn=(e,v,k,cls,l)=>`<button type="button" class="ab ${cls}" id="xr-${esc(e.id)}-${k}" data-act="x-res" data-el="${esc(e.id)}" data-v="${v}" aria-pressed="${r[e.id]===v}">${l}</button>`;
  const li=e=>{const v=r[e.id];return `<li><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span><span class="nm">${esc(e.nom)}${v==='reprise'?'<small>Réussi en reprise</small>':v==='echecf'?'<small>Échec du module</small>':''}</span>${can?`<input class="xr-n" type="number" id="xn-${esc(e.id)}" data-xn="${esc(e.id)}" data-f="pct" min="0" max="100" step="1" inputmode="numeric" placeholder="%" aria-label="${esc('Note de '+e.nom+' en %')}" value="${p[e.id]!=null?esc(p[e.id]):''}"><span class="att-btns" role="group" aria-label="${esc('Résultat de '+e.nom)}">${btn(e,'reussi','r','ab-P','Réussi')}${btn(e,'echec','e','ab-A','Échec')}${btn(e,'absent','a','ab-R','Absent')}</span>`:v?`<span class="chip ${RES[v][0]}">${RES[v][1]}${p[e.id]!=null?' · '+esc(noteTxt(p[e.id])):''}</span>`:'<span class="chip off">—</span>'}</li>`;};
  return `<fieldset class="xr"><legend>Résultats</legend>${sum}<ul class="att-list">${els.map(li).join('')}</ul>${can?`<p class="help" style="margin-top:8px">La note en % est facultative. Elle inscrit le résultat : réussi à partir de ${seuil()} %.</p>`:''}${can&&none?'<div class="row" style="margin-top:10px"><button class="btn sm" type="button" data-act="x-res-all">Marquer les autres réussis</button></div>':''}</fieldset>`;
}
/* Dossier d’un élève */
function openStudent(id){
  const e=id?byId(S.data.eleves,id):null;
  const draft=e?{fonction:e.fonction||'',numero:e.numero!=null?String(e.numero):'',nom:e.nom||'',groupe:e.groupe||'',naissance:e.naissance||'',parent:e.parent||'',courriel:e.courriel||'',telephone:e.telephone||'',notes:e.notes||''}
    :{fonction:'',numero:'',nom:'',groupe:S.pg.g||((groups()[0]||{}).id||''),naissance:'',parent:'',courriel:'',telephone:'',notes:''};
  ensureTerm(yearStart());
  openDrawer({kind:'student',id:id||null,draft,err:'',confirmDel:false});
}
function studentDrawer(){
  const d=S.dr, f=d.draft;
  if(d.id&&!byId(S.data.eleves,d.id)) return goneHTML('Élève');
  let track='';
  if(d.id){
    const from=yearStart(), s=studentStats(from,todayISO())[d.id], r=rateOf(s);
    const log=s?s.log.sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6):[];
    track=`<section class="dr-sec"><h3>Présences depuis la rentrée</h3>${!S.termLoaded?'<p class="help">Chargement…</p>':s?`<div class="att-sum"><span class="chip ${r>=95?'ok':r>=90?'warn':'bad'}">${r} % de présence</span><span class="chip bad">${pl(s.A,'absence','absences')}</span>${s.M?`<span class="chip info">${pl(s.M,'absence motivée','absences motivées')}</span>`:''}<span class="chip warn">${pl(s.R,'retard','retards')}</span></div>
      ${log.length?`<ul class="plist">${log.map(x=>{const c=byId(S.data.cours,x.cours);return `<li><span>${esc(dayLabel(parse(x.date)))} · ${esc(c?c.titre:'Cours')}</span><span class="chip ${CHIP[x.v]}">${LBL[x.v]}</span></li>`;}).join('')}</ul>`:''}`:'<p class="help">Aucune présence notée pour l’instant.</p>'}</section>`;
  }
  const gOpts='<option value="">Choisir une classe</option>'+groups().map(g=>`<option value="${esc(g.id)}"${f.groupe===g.id?' selected':''}>${esc(g.nom)}</option>`).join('');
  const body=`${track}<form id="st-form" data-form="student" novalidate>
    <h3 class="dr-h3">Dossier</h3>
    <div class="grid2"><label class="field"><span>Nom de l’élève</span><input id="st-nom" data-f="nom" value="${esc(f.nom)}" maxlength="80" autocomplete="off"></label><label class="field"><span>Classe</span><select id="st-groupe" data-f="groupe">${gOpts}</select></label></div>
    <div class="grid2"><label class="field"><span>Date de naissance</span><input type="date" id="st-naiss" data-f="naissance" value="${esc(f.naissance)}"></label><label class="field"><span>Personne à joindre en cas d’urgence</span><input id="st-parent" data-f="parent" value="${esc(f.parent)}" maxlength="80" autocomplete="off"></label></div>
    <div class="grid2"><label class="field"><span>Courriel</span><input type="email" id="st-mail" data-f="courriel" value="${esc(f.courriel)}" maxlength="80" autocomplete="off"></label><label class="field"><span>Téléphone</span><input id="st-tel" data-f="telephone" value="${esc(f.telephone)}" maxlength="30" autocomplete="off"></label></div>
    <div class="grid2"><label class="field"><span>Fonction dans la classe</span><select id="st-fonc" data-f="fonction">${['','Capitaine','Lieutenant 1','Lieutenant 2'].map(x=>`<option value="${x}"${f.fonction===x?' selected':''}>${x||'Aucune'}</option>`).join('')}</select></label><label class="field"><span>Numéro dans la classe</span><input type="number" id="st-num" data-f="numero" value="${esc(f.numero)}" min="1" step="1" inputmode="numeric"></label></div>
    <label class="field"><span>Suivi</span><textarea id="st-notes" data-f="notes" rows="3" placeholder="Rencontres, mesures d’aide, remarques…">${esc(f.notes)}</textarea></label>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>`;
  const foot=d.confirmDel
    ?`<p>Retirer ${esc(f.nom||'cet élève')} de l’école ? Ses présences passées restent dans les statistiques des cours.</p><button class="btn danger" type="button" data-act="st-del-yes"${dis()}>Retirer</button><button class="btn ghost" type="button" data-act="st-del-no">Annuler</button>`
    :`<button class="btn primary" type="submit" form="st-form"${dis()}>${d.id?'Enregistrer':'Ajouter l’élève'}</button>${d.id?'<button class="btn ghost" type="button" data-act="st-del">Retirer l’élève</button>':''}`;
  return dTop('Élève',esc(f.nom||'Nouvel élève'),d.id?esc(gName(f.groupe)):'')+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveStudent(){
  const d=S.dr, f=d.draft;if(S.busy)return;
  if(!f.nom.trim()){d.err='Indiquez le nom de l’élève.';renderDrawer();return;}
  if(!f.groupe){d.err='Choisissez la classe de l’élève.';renderDrawer();return;}
  const doc={fonction:f.fonction||'',numero:f.numero===''?null:Math.max(1,Math.round(+f.numero))||null,nom:f.nom.trim(),groupe:f.groupe,naissance:f.naissance,parent:f.parent.trim(),courriel:f.courriel.trim(),telephone:f.telephone.trim(),notes:f.notes.trim()};
  const id=d.id||genId('el');
  S.busy=true;d.err='';renderDrawer();
  const ok=await write(async()=>{await col('eleves').doc(id).set(doc);if(d.id)await syncFiches(id,doc);},d.id?'Dossier enregistré':'Élève ajouté');
  S.busy=false;if(ok&&S.dr===d)S.dr=null;render();
}

/* Dossier du personnel */
function openStaff(id){
  const p=id?byId(S.data.enseignants,id):null, z=(id&&S.data.dossiers[id])||{};
  const draft=p?{nom:p.nom||'',fonction:p.fonction||'Enseignant',statut:statOf(p),courriel:p.courriel||'',telephone:z.telephone||'',embauche:z.embauche||'',notes:z.notes||''}
    :{nom:'',fonction:'Enseignant',statut:'Actif',courriel:'',telephone:'',embauche:'',notes:''};
  openDrawer({kind:'staff',id:id||null,draft,err:'',confirmDel:false});
}
function staffDrawer(){
  const d=S.dr, f=d.draft;
  if(d.id&&!byId(S.data.enseignants,d.id)) return goneHTML('Membre');
  const cs=d.id?S.data.cours.filter(c=>c.enseignant===d.id):[];
  const body=`<form id="sf-form" data-form="staff" novalidate>
    <label class="field"><span>Nom</span><input id="sf-nom" data-f="nom" value="${esc(f.nom)}" maxlength="80" autocomplete="off"></label>
    <div class="grid2"><label class="field"><span>Fonction</span><select id="sf-fonc" data-f="fonction">${FONCTIONS.map(x=>`<option${f.fonction===x?' selected':''}>${x}</option>`).join('')}</select></label><label class="field"><span>Statut d’emploi</span><select id="sf-stat" data-f="statut">${Object.keys(STATUTS).map(x=>`<option${f.statut===x?' selected':''}>${x}</option>`).join('')}</select></label></div>
    <div class="grid2"><label class="field"><span>Courriel</span><input type="email" id="sf-mail" data-f="courriel" value="${esc(f.courriel)}" maxlength="80" autocomplete="off"></label><label class="field"><span>Téléphone</span><input id="sf-tel" data-f="telephone" value="${esc(f.telephone)}" maxlength="30" autocomplete="off"></label></div>
    <label class="field"><span>Date d’embauche</span><input type="date" id="sf-emb" data-f="embauche" value="${esc(f.embauche)}"></label>
    <label class="field"><span>Remarques</span><textarea id="sf-notes" data-f="notes" rows="3">${esc(f.notes)}</textarea></label>
    <p class="help">Le téléphone, la date d’embauche et les remarques ne sont visibles que par l’administration.</p>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>
    ${cs.length?`<section class="dr-sec"><h3>${W('Modules et activités','Cours assignés')}</h3><ul class="plist">${cs.map(c=>`<li><span>${esc(c.titre)} · ${esc(gName(c.groupe))}</span><span class="muted sm">${pl(activeSlots(c).length,'période','périodes')}</span></li>`).join('')}</ul></section>`:''}`;
  const foot=d.confirmDel
    ?`<p>Supprimer le dossier de ${esc(f.nom||'ce membre')} ? ${cs.length?`Ses ${cs.length} cours resteront à l’horaire, à assigner.`:''}</p><button class="btn danger" type="button" data-act="sf-del-yes"${dis()}>Supprimer</button><button class="btn ghost" type="button" data-act="sf-del-no">Annuler</button>`
    :`<button class="btn primary" type="submit" form="sf-form"${dis()}>${d.id?'Enregistrer':'Ajouter au personnel'}</button>${d.id?'<button class="btn ghost" type="button" data-act="sf-del">Supprimer le dossier</button>':''}`;
  return dTop('Personnel',esc(f.nom||'Nouveau membre du personnel'),d.id?esc(f.fonction):'')+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveStaff(){
  const d=S.dr, f=d.draft;if(S.busy)return;
  if(!f.nom.trim()){d.err='Indiquez le nom.';renderDrawer();return;}
  const id=d.id||genId('e');
  S.busy=true;d.err='';renderDrawer();
  const ok=await write(async()=>{await col('enseignants').doc(id).set({nom:f.nom.trim(),fonction:f.fonction,statut:f.statut,courriel:f.courriel.trim()});await col('dossiers-personnel').doc(id).set({telephone:f.telephone.trim(),embauche:f.embauche,notes:f.notes.trim()});if(d.id)await syncFiches(id,{nom:f.nom.trim(),fonction:f.fonction,statut:f.statut,courriel:f.courriel.trim()},{telephone:f.telephone.trim()});},d.id?'Dossier enregistré':'Membre ajouté');
  S.busy=false;if(ok&&S.dr===d)S.dr=null;render();
}

/* ---------- Écriture ---------- */
/* Texte CSV lisible par Excel en français : point-virgule, guillemets au besoin, accents conservés */
const csvText=lines=>String.fromCharCode(0xFEFF)+lines.map(l=>l.map(v=>{const s=String(v==null?'':v);return /[;"\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}).join(';')).join('\r\n')+'\r\n';
/* Remet un fichier à la personne : par la fenêtre de claude.ai quand la page y est ouverte, sinon par le navigateur */
async function saveFile(name,data){
  try{
    const C=window.claude, dl=C&&typeof C.use==='function'?await C.use('downloads'):null;
    if(dl){await dl.save({filename:name,data});toast('Fichier enregistré : '+name);return true;}
  }catch(e){
    const c=e&&e.code;
    if(c==='declined'||c==='rate_limited') return false;
    if(c&&!['unavailable','not_granted','capability_disabled','capability_removed'].includes(c)){toast('Le fichier n’a pas pu être préparé.','bad');return false;}
  }
  try{
    const u=URL.createObjectURL(data instanceof Blob?data:new Blob([data])), a=document.createElement('a');
    a.href=u;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},1500);
    toast('Fichier téléchargé : '+name);return true;
  }catch(e){toast('Téléchargement impossible dans cette fenêtre.','bad');return false;}
}
function toast(msg,kind,action){
  const t=document.createElement('div');t.className='toast'+(kind?' '+kind:'');t.setAttribute('role','status');
  const s=document.createElement('span');s.textContent=msg;t.appendChild(s);
  if(action){const b=document.createElement('button');b.type='button';b.textContent=action.label;b.addEventListener('click',()=>{t.remove();action.fn();});t.appendChild(b);}
  $('#toasts').appendChild(t);setTimeout(()=>t.remove(),action?9000:4000);
}
function errMsg(e){
  const c=e&&e.code;
  if(c==='invalid_argument') return 'Modification refusée : votre accès à cette page ne le permet pas.';
  if(c==='quota_exceeded') return 'Stockage plein. Supprimez d’anciennes données, puis réessayez.';
  if(c==='revoked'){S.conn='off';return 'Votre accès a changé. Rechargez la page.';}
  return 'Enregistrement impossible pour le moment. Réessayez.';
}
async function write(fn,okMsg){
  if(!DB){toast('Ouvrez la page dans claude.ai, connecté, pour enregistrer.','bad');return false;}
  for(let i=0;i<2;i++){
    try{await fn();if(okMsg)toast(okMsg);return true;}
    catch(e){
      if(e&&e.code==='unavailable'&&i===0){await new Promise(r=>setTimeout(r,400+Math.random()*600));continue;}
      toast(errMsg(e),'bad');return false;
    }
  }
  return false;
}
async function runAll(fns,okMsg){
  if(!DB){toast('Ouvrez la page dans claude.ai, connecté, pour enregistrer.','bad');return false;}
  S.busy=true;render();
  const q=[...fns];let fail=0,first=null;
  const worker=async()=>{while(q.length){const f=q.shift();try{await f();}catch(e){fail++;first=first||e;}}};
  await Promise.all([worker(),worker(),worker(),worker()]);
  S.busy=false;
  if(fail) toast(errMsg(first),'bad'); else if(okMsg) toast(okMsg);
  render();
  return !fail;
}
const col=n=>DB.collection(n);
const configDoc=()=>{const c=Object.assign({nom:'',annee:'',debut:'',fin:'',conges:[],etapes:[],competences:[]},S.data.config||{});c.conges=[...(c.conges||[])];c.etapes=[...(c.etapes||[])];c.competences=(c.competences||[]).map(k=>Object.assign({},k));c.ressources=(c.ressources||[]).map(r=>Object.assign({},r));return c;};
async function saveConfig(c,msg){S.busy=true;render();const ok=await write(()=>DB.doc('config/ecole').set(c),msg);S.busy=false;render();return ok;}
async function importDemo(){
  if(S.busy)return;
  if(!window.__SEED){
    try{await new Promise((res,rej)=>{const x=document.createElement('script');x.src='demo/donnees.js';x.onload=res;x.onerror=rej;document.head.appendChild(x);});}
    catch(e){toast('Impossible de charger l’exemple. Vérifiez votre connexion.','bad');return;}
  }
  const docs=(window.__SEED||[]).filter(d=>d&&d.path&&!/^comptes\//.test(d.path));
  await runAll(docs.map(d=>()=>DB.doc(d.path).set(d.data)),`Exemple chargé : ${pl(docs.length,'élément','éléments')}`);
}
async function clearExamples(){
  const fns=[];
  for(const k of ['comptes','cours','eleves','enseignants','groupes','examens']) for(const d of S.data[k]) if(d.exemple) fns.push(()=>col(k).doc(d.id).delete());
  for(const [id,z] of Object.entries(S.data.dossiers)) if(z&&z.exemple) fns.push(()=>col('dossiers-personnel').doc(id).delete());
  for(const k of ['candidatures','remplacements']) for(const d of S.data[k]) if(d.exemple) fns.push(()=>col(k).doc(d.id).delete());
  for(const [id,z] of Object.entries(S.data.dispos)) if(z&&z.exemple) fns.push(()=>col('disponibilites').doc(id).delete());
  for(const [id,z] of Object.entries(S.data.resultats)) if(z&&z.exemple) fns.push(()=>col('resultats').doc(id).delete());
  try{const q=await col('resultats-eleves').where('exemple','==',true).get();for(const d of q.docs)fns.push(()=>col('resultats-eleves').doc(d.id).delete());}catch(e){}
  for(const [id,z] of Object.entries(S.data.staffPres)) if(z&&z.exemple) fns.push(()=>col('presences-personnel').doc(id).delete());
  try{const q=await col('presences').where('exemple','==',true).get();for(const d of q.docs)fns.push(()=>col('presences').doc(d.id).delete());}catch(e){}
  if(S.data.config&&S.data.config.exemple){const c=configDoc();c.nom='';c.exemple=false;fns.push(()=>DB.doc('config/ecole').set(c));}
  S.confirmClear=false;
  await runAll(fns,'Données d’exemple effacées');
}

