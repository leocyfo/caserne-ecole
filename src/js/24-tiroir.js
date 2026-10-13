/* ---------- Tiroir ---------- */
const dTop=(eyebrow,title,sub)=>`<div class="dr-top"><div class="dr-tt"><p class="eyebrow">${eyebrow}</p><h2 id="dr-title">${title}</h2>${sub?`<p class="dr-sub">${sub}</p>`:''}</div><button type="button" class="icon-btn" id="dr-close" data-act="close" aria-label="Fermer">×</button></div>`;
const goneHTML=(w)=>dTop(w||'Cours',(w||'Cours')+' introuvable')+'<div class="dr-body"><p class="help">Cet élément n’existe plus. Il a peut-être été modifié ou supprimé.</p></div>';
const findSess=(date,key)=>sessionsOn(date).find(x=>x.key===key);
const titleOf=c=>`${c.code?`<span class="chip ${tone(c)}">${esc(c.code)}</span>`:''}<span>${esc(c.titre)}</span>`;
function openDrawer(dr){
  dr.uid=++uidSeq;S.dr=dr;
  if(dr.kind==='att'||dr.kind==='info') loadPres(dr.key,dr.date);
  else if(dr.kind==='course'&&dr.sess) loadPres(dr.sess.key,dr.sess.date);
  renderDrawer();
}
function closeDrawer(force){
  const d=S.dr;if(!d)return;
  if(d.kind==='att'&&d.dirty&&!force){d.confirmClose=true;renderDrawer();return;}
  S.dr=null;renderDrawer();
}
function renderDrawer(){
  const el=$('#drawer'), sc=$('#scrim');
  if(!S.dr){
    if(!el.hidden){el.hidden=true;sc.hidden=true;el.innerHTML='';el._h='';el._k=undefined;document.body.classList.remove('lock');}
    return;
  }
  const d=S.dr;
  if(d.kind==='att') syncAtt();
  const html=d.kind==='att'?attDrawer():d.kind==='addc'?addCourseDrawer():d.kind==='course'?courseDrawer():d.kind==='exam'?examDrawer():d.kind==='student'?studentDrawer():d.kind==='staff'?staffDrawer():d.kind==='move'?moveDrawer():d.kind==='acct'?accountDrawer():d.kind==='print'?printDrawer():d.kind==='notifs'?notifDrawer():infoDrawer();
  const fresh=el._k!==d.uid;
  el.classList.toggle('dialog',d.kind==='move');
  setHTML(el,html,d.uid);
  if(fresh) el.scrollTop=0;
  if(el.hidden){el.hidden=false;sc.hidden=false;document.body.classList.add('lock');const c=$('#dr-close');if(c)c.focus({preventScroll:true});}
}

/* Présences d’un cours */
function syncAtt(){
  const d=S.dr;if(d.dirty)return;
  const p=presDoc(d.key);
  d.draft={statuts:Object.assign({},(p&&p.statuts)||{}),note:(p&&p.note)||''};
  d.savedAt=p&&p.maj||null;
}
function attDrawer(){
  const d=S.dr, s=findSess(d.date,d.key);
  if(!s) return goneHTML();
  const c=s.c, els=studentsOf(c.groupe), st=d.draft.statuts;
  const cnt={P:0,A:0,R:0,M:0};let marked=0;
  for(const e of els){const v=st[e.id];if(cnt[v]!=null){cnt[v]++;marked++;}}
  const sub=esc(`${dayLabel(parse(s.date))} · ${momentOf(s)} · ${gName(c.groupe)}${s.salle?' · Local '+s.salle:''}`);
  let body=choreNote(s);
  if(!isPast(s)) body+='<p class="help">'+W('Cette séance n’a pas encore commencé.','Ce cours n’a pas encore commencé.')+' Vous pouvez quand même préparer la liste.</p>';
  if(!els.length) body+=`<div class="notice"><p>Aucun élève dans ${esc(gName(c.groupe))}. L’administration les inscrit dans le menu Classes.</p></div>`;
  else{
    const chips=['P','A','R','M'].filter(k=>cnt[k]).map(k=>`<span class="chip ${CHIP[k]}">${cnt[k]} ${LBLS[k][cnt[k]>1?1:0]}</span>`).join('');
    body+=`<div class="row"><div class="att-sum">${chips}${els.length-marked?`<span class="chip off">${pl(els.length-marked,'non marqué','non marqués')}</span>`:''}</div><span style="flex:1"></span><button class="btn sm" type="button" data-act="att-all"${els.length===marked?' disabled':''}>Marquer les autres présents</button></div>
    <ul class="att-list">${els.map(e=>`<li><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span><span class="nm">${esc(e.nom)}${e.fonction?`<span class="role-chip">${esc(e.fonction)}</span>`:''}</span><span class="att-btns" role="group" aria-label="${esc('Présence de '+e.nom)}">${['P','A','R','M'].map(v=>`<button type="button" class="ab ab-${v}" id="ab-${esc(e.id)}-${v}" data-act="att-set" data-el="${esc(e.id)}" data-v="${v}" aria-pressed="${st[e.id]===v}" title="${LBL[v]}"><span class="full">${LBL[v]}</span><span class="abbr">${v}</span></button>`).join('')}</span></li>`).join('')}</ul>`;
  }
  body+=`<label class="field"><span>Remarque pour ${W('cette séance','ce cours')}</span><textarea id="a-note" data-f="note" rows="2" placeholder="Ex. exercice à l’extérieur, matériel manquant…">${esc(d.draft.note)}</textarea></label>`;
  let foot;
  if(d.confirmClose) foot=`<p>Les présences modifiées ne sont pas enregistrées.</p><button class="btn primary" type="button" data-act="att-save-close"${dis()}>Enregistrer et fermer</button><button class="btn danger" type="button" data-act="att-discard">Fermer sans enregistrer</button><button class="btn ghost" type="button" data-act="att-keep">Continuer</button>`;
  else{
    let state='Pas encore enregistrées';
    if(d.dirty) state='Modifications non enregistrées';
    else if(d.savedAt){const t=new Date(d.savedAt);if(!isNaN(t))state=`Enregistrées le ${shortDate(t)} à ${fmtT(t.getHours()*60+t.getMinutes())}`;}
    foot=`<button class="btn primary" type="button" data-act="att-save"${S.busy||!d.dirty?' disabled':''}>Enregistrer les présences</button><span class="state${d.dirty?' dirty':''}">${state}</span>`;
  }
  return dTop('Présences',titleOf(c),sub)+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveAtt(closeAfter){
  const d=S.dr, s=findSess(d.date,d.key);if(!s||S.busy)return;
  const st={};for(const e of studentsOf(s.c.groupe)) if(d.draft.statuts[e.id]) st[e.id]=d.draft.statuts[e.id];
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('presences').doc(d.key).set({cours:s.c.id,creneau:s.sl.id,date:s.date,groupe:s.c.groupe||'',statuts:st,note:String(d.draft.note||'').trim(),maj:new Date().toISOString()}),'Présences enregistrées');
  S.busy=false;
  if(ok){d.dirty=false;d.confirmClose=false;if(closeAfter&&S.dr===d)S.dr=null;}
  render();
}

/* Fiche d’un cours (élève) */
function infoDrawer(){
  const d=S.dr, s=findSess(d.date,d.key);
  if(!s) return goneHTML();
  const c=s.c;
  const weekly=activeSlots(c).slice().sort((a,b)=>a.jour-b.jour||toMin(a.debut)-toMin(b.debut)).map(sl=>`<li><span class="d">${DAYS[sl.jour-1]?DAYS[sl.jour-1].slice(0,3)+'.':''}</span><span>${moment(toMin(sl.debut),toMin(sl.fin))}${(sl.salle||c.salle)?' · Local '+esc(sl.salle||c.salle):''}</span></li>`).join('');
  return dTop(W('Séance','Cours'),titleOf(c))+`<div class="dr-body">
    ${s.cancelled?'<div class="notice warn"><p>'+W('Cette séance est annulée.','Ce cours est annulé ce jour-là.')+'</p></div>':choreNote(s)}
    <dl class="facts"><div><dt>Quand</dt><dd>${esc(dayLabel(parse(s.date)))}, ${momentOf(s).toLowerCase()}</dd></div><div><dt>Local</dt><dd>${esc(s.salle)||'À confirmer'}</dd></div><div><dt>Enseignant</dt><dd>${esc(tchNames(s))}</dd></div><div><dt>Classe</dt><dd>${esc(gName(c.groupe))}</dd></div></dl>
    <section class="dr-sec"><h3>Chaque semaine</h3><ul class="wlist">${weekly}</ul></section></div>`;
}

/* Cours (administration) */
function nextColor(){const used=S.data.cours.map(c=>+c.couleur||0);for(let i=0;i<8;i++)if(!used.includes(i))return i;return S.data.cours.length%8;}
function openCourse(id,sess,preset){
  const c=id?byId(S.data.cours,id):null;
  const draft=c?{heures:c.heures!=null?String(c.heures):'',titre:c.titre||'',code:c.code||'',couleur:+c.couleur||0,groupe:c.groupe||'',enseignant:c.enseignant||'',salle:c.salle||'',du:c.du||'',au:c.au||'',creneaux:activeSlots(c).map(s=>({type:s.type||'activite',id:s.id,jour:String(s.jour),debut:s.debut||'',fin:s.fin||'',salle:s.salle||'',du:s.du||'',au:s.au||''}))}
    :{heures:'',titre:'',code:'',couleur:nextColor(),groupe:S.filtre.startsWith('g:')?S.filtre.slice(2):((groups()[0]||{}).id||''),enseignant:S.filtre.startsWith('e:')?S.filtre.slice(2):'',salle:'',du:'',au:'',creneaux:[(()=>{const [a,b]=(commonPeriod()||periodOptions()[0]||'08:15-09:30').split('-');return {id:slotId(),jour:'1',debut:a,fin:b,salle:'',type:'theorie'};})()]};
  if(preset) Object.assign(draft,preset);
  openDrawer({kind:'course',id:id||null,sess:sess||null,draft,err:'',warn:null,confirmDel:false});
}
function conflicts(f,selfId){
  const out=[];
  for(const sl of f.creneaux){
    const a=toMin(sl.debut),b=toMin(sl.fin);if(isNaN(a)||isNaN(b))continue;
    for(const c of S.data.cours){
      if(c.id===selfId)continue;
      const sameG=f.groupe&&c.groupe===f.groupe, sameT=f.enseignant&&c.enseignant===f.enseignant;
      if(!sameG&&!sameT)continue;
      for(const s2 of activeSlots(c)){
        if(+s2.jour!==+sl.jour)continue;
        const x=toMin(s2.debut),y=toMin(s2.fin);
        if(a<y&&x<b) out.push(`${DAYS[sl.jour-1]} ${momentIn(a,b)} : ${sameG?`${gName(f.groupe)} a déjà ${c.titre}`:`${tName(f.enseignant)} donne déjà ${c.titre} (${gName(c.groupe)})`}`);
      }
    }
  }
  return [...new Set(out)];
}
function courseDrawer(){
  const d=S.dr, f=d.draft;
  let sessBox='';
  if(d.sess){
    const s=findSess(d.sess.date,d.sess.key);
    if(s){
      const a=attInfo(s), kind=cardKind(tagsOf(s)).kind, cnt={P:0,A:0,R:0,M:0}, lab=sessLabel(s);
      for(const v of Object.values((a.doc&&a.doc.statuts)||{})) if(cnt[v]!=null) cnt[v]++;
      const status=s.cancelled?(s.movedX?`<span class="chip info">${esc(movedLabel(s))}</span>`:'<span class="chip bad">'+W('Séance annulée','Cours annulé')+'</span>'):profAbsent(s)?'<span class="chip bad">Enseignant absent</span>':'';
      const pres=s.cancelled?'<span class="muted">'+W('Aucune : la séance est annulée.','Aucune : le cours est annulé.')+'</span>':a.total?`<b>${a.marked} / ${a.total}</b> élèves marqués${a.marked?` <span class="muted">· ${['P','A','R','M'].filter(k=>cnt[k]).map(k=>pl(cnt[k],LBLS[k][0],LBLS[k][1])).join(' · ')}</span>`:a.past?' <span class="need-t">· à prendre</span>':''}`:'<span class="muted">Aucun élève dans la classe.</span>';
      sessBox=`<section class="sess-box"><div class="sb-head"><p class="per-lg">${esc(dayLabel(parse(s.date)))} · ${momentOf(s)}</p><div class="sb-chips">${kind?`<span class="chip ${sessTone(s)}">${esc(kind)}</span>`:''}${choreChip(s)}${status}</div></div>
        <dl class="facts sb-facts"><div><dt>Classe</dt><dd>${esc(gName(s.c.groupe))}</dd></div><div><dt>Local</dt><dd>${s.salle?esc(s.salle):'<span class="muted">—</span>'}</dd></div>${lab?`<div><dt>${tagsOf(s).includes('Examen')?'Examen':'Cours'}</dt><dd>${esc(lab.replace(/^Cours /,''))}</dd></div>`:''}<div class="wide"><dt>Présences</dt><dd>${pres}</dd></div></dl>
        ${s.cancelled?'':affBoxHTML(s)+ressBoxHTML(s)}
        <div class="row">${s.cancelled?'':`<button class="btn sm primary" type="button" data-act="goto-att">${a.state==='done'?'Voir les présences':'Prendre les présences'}</button><button class="btn sm" type="button" data-act="move-open">${icon('move')}Déplacer</button>`}${acad()?'':`<button class="btn sm" type="button" data-act="new-exam" data-cours="${esc(s.c.id)}" data-date="${esc(s.date)}">Planifier un examen</button>`}<button class="btn sm${s.cancelled?'':' danger'}" type="button" data-act="s-cancel"${dis()}>${s.cancelled?W('Rétablir cette séance','Rétablir ce cours'):W('Annuler cette séance','Annuler ce cours')}</button></div>${s.extra&&!s.cancelled?`<h3 class="sb-h3">${acad()?'Modifier cette séance':'Modifier ce cours'}</h3><div class="grid2"><label class="field"><span>Moment</span>${periodSelect('sb-per',s.sl.debut,s.sl.fin,'data-sb="per"'+(S.busy?' disabled':''))}</label>${acad()&&(xCours(modOf(s.c),s.extra).length||xExams(modOf(s.c),s.extra).length)?'':`<label class="field"><span>Type</span>${actSelect('sb-act',actOf(tagsOf(s)),'data-sb="act"'+(S.busy?' disabled':''))}</label>`}</div>`:''}${s.cancelled?'':`<label class="chore-check"><input type="checkbox" id="sb-menage" data-sb="menage"${choreOf(s)?' checked':''}${S.busy?' disabled':''}>${icon('broom')}Corvée de ménage pour ${esc(gName(s.grp))}, toute la journée du ${esc(dayLabel(parse(s.date)).toLowerCase())}</label>`}</section>`;
      if(acad()){
        const mk=modOf(s.c), foot=d.confirmDel
          ?`<p>Supprimer ${mk?'cette séance':'cette activité'} du ${esc(dayLabel(parse(s.date)).toLowerCase())} ? Les présences déjà prises restent enregistrées.</p><button class="btn danger" type="button" data-act="sx-del-yes"${dis()}>Supprimer</button><button class="btn ghost" type="button" data-act="c-del-no">Annuler</button>`
          :`${mk?`<button class="btn" type="button" id="c-open-mod" data-act="module" data-id="${esc(mk.code)}" data-g="${esc(s.c.groupe)}">Ouvrir le module ${esc(s.c.code)}</button>`:`<button class="btn" type="button" data-act="edit-course" data-id="${esc(s.c.id)}">Réglages de l’activité</button>`}${s.extra?`<button class="btn ghost" type="button" data-act="c-del">${mk?'Supprimer cette séance':'Supprimer cette journée'}</button>`:''}`;
        return dTop(mk?'Séance':'Activité',titleOf(s.c),esc(gName(s.c.groupe)))+`<div class="dr-body">${sessBox}</div><div class="dr-foot">${foot}</div>`;
      }
      sessBox+='<h3 class="dr-h3">Le cours, toutes les semaines</h3>';
    }
  }
  const gOpts='<option value="">Choisir une classe</option>'+groups().map(g=>`<option value="${esc(g.id)}"${f.groupe===g.id?' selected':''}>${esc(g.nom)}</option>`).join('');
  const tOpts='<option value="">À assigner</option>'+teachers().map(t=>`<option value="${esc(t.id)}"${f.enseignant===t.id?' selected':''}>${esc(t.nom)}</option>`).join('');
  const colors=[0,1,2,3,4,5,6,7].map(i=>`<label class="sw k${i}"><input type="radio" name="c-color" value="${i}"${+f.couleur===i?' checked':''}><span class="sw-dot"></span><span class="vh">Couleur ${i+1}</span></label>`).join('');
  const rows=f.creneaux.map((s,i)=>`<div class="slot">
    <label class="field"><span>Jour</span><select id="c-j-${i}" data-f="jour" data-i="${i}">${DAYS.map((n,k)=>`<option value="${k+1}"${+s.jour===k+1?' selected':''}>${n}</option>`).join('')}</select></label>
    <label class="field"><span>Période</span>${periodSelect('c-p-'+i,s.debut,s.fin,`data-slotp="${i}"`,s.custom)}</label>
    <label class="field"><span>Activité</span>${actSelect('c-a-'+i,s.type||'activite',`data-f="type" data-i="${i}"`)}</label>
    <label class="field"><span>Local</span><input id="c-s-${i}" data-f="salle" data-i="${i}" value="${esc(s.salle)}" placeholder="${esc(f.salle||'Habituel')}" autocomplete="off"></label>
    <button type="button" class="icon-btn" data-act="c-del-slot" data-i="${i}" aria-label="Retirer cette période"${f.creneaux.length<2?' disabled':''}>×</button>${s.custom||periodOf(s.debut,s.fin)==='autre'?`<div class="slot-times"><label class="field"><span>Début</span><input type="time" id="c-d-${i}" data-f="debut" data-i="${i}" value="${esc(s.debut)}" step="300"></label><label class="field"><span>Fin</span><input type="time" id="c-f-${i}" data-f="fin" data-i="${i}" value="${esc(s.fin)}" step="300"></label></div>`:''}${s.du&&s.du>todayISO()?`<p class="help" style="grid-column:1/-1;margin-top:-4px">À partir du ${esc(longDate(parse(s.du)))}</p>`:''}</div>`).join('');
  const prevC=d.id?byId(S.data.cours,d.id):null, t0=iso(addDays(new Date(),-14));
  const extras=prevC?(prevC.extras||[]).filter(x=>x.de&&x.date>=t0).sort((a,b)=>a.date.localeCompare(b.date)):[];
  const dated=prevC?datedOf(prevC).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.debut.localeCompare(b.debut)):[], tday=todayISO(), upc=dated.filter(x=>x.date>=tday);
  const plannedH=Math.round(dated.reduce((n,x)=>n+((prevC.annulees||[]).includes(`${x.date}@${x.id}`)?0:sessMinutes(x)),0)/60);
  const datedHTML=dated.length?`<section class="dr-sec"><h3>${acad()?'Les séances':'Cours datés de l’horaire annuel'}</h3><p class="help">${pl(dated.length,W('séance','cours'),W('séances','cours'))} · ${plannedH} h planifiées${heuresOf(prevC)?` sur ${heuresOf(prevC)} h prévues`:''} · ${upc.length} à venir.</p>${upc.length?`<ul class="plist">${upc.slice(0,6).map(x=>`<li><span><b>${esc(dayLabel(parse(x.date)))}</b> <span class="muted">${moment(toMin(x.debut),toMin(x.fin)).toLowerCase()}${x.label&&x.label.toLowerCase()!==String(prevC.titre).toLowerCase()?' · '+esc(x.label):''}</span></span><span class="cc-tags">${(x.tags||[]).map(t=>`<span class="chip ${TAGCHIP[t]||'off'}">${esc(t)}</span>`).join('')}</span></li>`).join('')}</ul>${upc.length>6?`<p class="help">Et ${upc.length-6} autres ${W('séances','cours')}.</p>`:''}`:''}</section>`:'';
  const extrasHTML=extras.length?`<section class="dr-sec"><h3>Changements ponctuels</h3><ul class="plist">${extras.map(x=>{const od=x.de?parse(x.de.split('@')[0]):null;return `<li><span><b>${esc(dayLabel(parse(x.date)))}, ${moment(toMin(x.debut),toMin(x.fin)).toLowerCase()}</b>${od?` <span class="muted">au lieu du ${esc(dayLabel(od).toLowerCase())}</span>`:''}</span><button type="button" class="btn sm ghost" data-act="x-extra" data-id="${esc(x.id)}"${dis()}>Remettre comme avant</button></li>`;}).join('')}</ul></section>`:'';
  const ks=comps(), kSel=ks.find(k=>k.nom===f.titre), custom=!!ks.length&&(d.customName||(!!f.titre&&!kSel));
  const nameField=!ks.length
    ?`<label class="field"><span>Nom du cours</span><input id="c-titre" data-f="titre" value="${esc(f.titre)}" maxlength="80" placeholder="Ex. Autopompe" autocomplete="off"></label>`
    :`<label class="field"><span>Nom du cours</span><select id="c-nom-sel"><option value=""${!kSel&&!custom?' selected':''}>Choisir un nom…</option>${ks.map(k=>`<option value="${esc(k.code)}"${kSel===k&&!custom?' selected':''}>${esc(k.code)} · ${esc(k.nom)}</option>`).join('')}<option value="__autre"${custom?' selected':''}>Autre nom…</option></select></label>`;
  const customField=custom?`<label class="field"><span>Autre nom</span><input id="c-titre" data-f="titre" value="${esc(f.titre)}" maxlength="80" placeholder="Ex. Accueil" autocomplete="off"></label>`:'';
  if(acad()&&d.id&&!d.sess){
    const pc=prevC||{}, mk=modOf(pc), gl=gName(f.groupe);
    const bodyA=`<form id="c-form" data-form="course" novalidate>
      ${mk?'':`<label class="field"><span>Nom de l’activité</span><input id="c-titre" data-f="titre" value="${esc(f.titre)}" maxlength="80" autocomplete="off"></label>`}
      <div class="grid2"><label class="field"><span>Classe</span><select id="c-groupe" data-f="groupe" disabled>${gOpts}</select></label>${mk?`<label class="field"><span>Chargé de cours</span><input id="c-ens-ro" value="${esc(f.enseignant&&byId(S.data.enseignants,f.enseignant)?tName(f.enseignant):'À choisir dans le module')}" disabled></label>`:`<label class="field"><span>Responsable</span><select id="c-ens" data-f="enseignant">${tOpts}</select></label>`}</div>
      <div class="grid2"><label class="field"><span>Local habituel</span><input id="c-salle" data-f="salle" value="${esc(f.salle)}" maxlength="40" placeholder="Ex. Salle 2" autocomplete="off"></label>
      <fieldset style="padding-top:4px"><legend>Couleur</legend><div class="swatches">${colors}</div></fieldset></div>
      ${f.creneaux.length?`<fieldset><legend>Périodes chaque semaine</legend>${rows}</fieldset>`:''}
      <p class="help">${mk?'Le chargé de cours donne les séances du module à toutes les classes. Il se choisit dans le menu Modules, comme le nom et les heures.':'Une activité n’appartient à aucun module : aucun enseignant n’est requis par défaut.'}</p>
      ${d.warn?`<div class="notice warn"><p><b>Conflits d’horaire.</b> Vérifiez avant d’enregistrer.</p><ul>${d.warn.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
      ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}</form>${datedHTML}${extrasHTML}`;
    const footA=d.confirmDel
      ?`<p>Retirer « ${esc(f.titre)} » de ${esc(gl)} ? Toutes ses séances disparaissent de l’horaire. Les présences déjà prises restent enregistrées.</p><button class="btn danger" type="button" data-act="c-del-yes"${dis()}>Retirer</button><button class="btn ghost" type="button" data-act="c-del-no">Annuler</button>`
      :`<button class="btn primary" type="submit" form="c-form"${dis()}>${d.warn?'Enregistrer quand même':'Enregistrer'}</button><button class="btn ghost" type="button" data-act="c-del">${mk?'Retirer le module de la classe':'Supprimer l’activité'}</button>`;
    return dTop(mk?'Module de la classe':'Activité',titleOf(Object.assign({},f,{titre:f.titre||'Sans nom'})),esc(gl))+`<div class="dr-body">${bodyA}</div><div class="dr-foot">${footA}</div>`;
  }
  const body=`${sessBox}<form id="c-form" data-form="course" novalidate>
    <div class="grid-code">${nameField}<label class="field"><span>Code</span><input id="c-code" data-f="code" value="${esc(f.code)}" maxlength="5" placeholder="Ex. M7" autocomplete="off"></label></div>${customField}
    <div class="grid2"><label class="field"><span>Classe</span><select id="c-groupe" data-f="groupe">${gOpts}</select></label><label class="field"><span>Enseignant</span><select id="c-ens" data-f="enseignant">${tOpts}</select></label></div>
    <label class="field" style="max-width:220px"><span>Heures prévues au programme</span><input type="number" id="c-heures" data-f="heures" value="${esc(f.heures)}" min="0" step="1" inputmode="numeric"></label>
    <div class="grid2"><label class="field"><span>Local habituel</span><input id="c-salle" data-f="salle" value="${esc(f.salle)}" maxlength="40" placeholder="Ex. Salle 2" autocomplete="off"></label>
    <fieldset style="padding-top:4px"><legend>Couleur</legend><div class="swatches">${colors}</div></fieldset></div>
    <fieldset><legend>Périodes chaque semaine</legend>${!f.creneaux.length&&dated.length?'<p class="help">Ce cours suit les dates de l’horaire annuel. Ajoutez une période seulement s’il revient aussi chaque semaine.</p>':''}${rows}<div><button class="btn sm" type="button" data-act="c-add-slot">${icon('plus')}Ajouter une période</button></div></fieldset>
    <div class="grid2"><label class="field"><span>Premier cours</span><input type="date" id="c-du" data-f="du" value="${esc(f.du)}"></label><label class="field"><span>Dernier cours</span><input type="date" id="c-au" data-f="au" value="${esc(f.au)}"></label></div>
    <p class="help">Laissez les dates vides pour suivre toute l’année scolaire. Les congés du calendrier scolaire sont retirés automatiquement.</p>
    ${d.warn?`<div class="notice warn"><p><b>Conflits d’horaire.</b> Vérifiez avant d’enregistrer.</p><ul>${d.warn.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></div>`:''}
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
  </form>${datedHTML}${extrasHTML}`;
  const foot=d.confirmDel
    ?`<p>Supprimer « ${esc(f.titre||'ce cours')} » de l’horaire ? Les présences déjà prises restent enregistrées.</p><button class="btn danger" type="button" data-act="c-del-yes"${dis()}>Supprimer</button><button class="btn ghost" type="button" data-act="c-del-no">Annuler</button>`
    :`<button class="btn primary" type="submit" form="c-form"${dis()}>${d.warn?'Enregistrer quand même':d.id?'Enregistrer':'Ajouter le cours'}</button>${d.id?'<button class="btn ghost" type="button" data-act="c-del">Supprimer le cours</button>':''}`;
  return dTop(d.id?'Modifier le cours':'Planifier un cours',d.id?titleOf(Object.assign({},f,{titre:f.titre||'Sans nom'})):'Nouveau cours')+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
async function saveCourse(force){
  const d=S.dr, f=d.draft;if(S.busy)return;
  const err=m=>{d.err=m;renderDrawer();};
  if(!f.titre.trim()) return err('Choisissez ou écrivez le nom du cours.');
  if(!f.groupe) return err('Choisissez la classe qui suit ce cours.');
  if(!f.creneaux.length&&!datedOf(d.id?byId(S.data.cours,d.id):null).length) return err('Ajoutez au moins une période.');
  for(const s of f.creneaux){
    const a=toMin(s.debut),b=toMin(s.fin);
    if(isNaN(a)||isNaN(b)) return err('Chaque période doit avoir une heure de début et une heure de fin.');
    if(b<=a) return err(`La période du ${DAYS[s.jour-1].toLowerCase()} se termine avant de commencer.`);
  }
  if(f.du&&f.au&&f.au<f.du) return err('La date du dernier cours précède celle du premier.');
  if(!force){const w=conflicts(f,d.id);if(w.length){d.warn=w;d.err='';renderDrawer();return;}}
  const prev=d.id?byId(S.data.cours,d.id):null;
  const ended=prev?(prev.creneaux||[]).filter(s=>s.au&&s.au<todayISO()):[];
  const doc={titre:f.titre.trim(),code:f.code.trim().toUpperCase(),couleur:+f.couleur||0,groupe:f.groupe,enseignant:f.enseignant,salle:f.salle.trim(),du:f.du,au:f.au,heures:f.heures===''||f.heures==null?null:Math.max(0,Math.round(+f.heures))||null,
    creneaux:f.creneaux.map(s=>{const o={id:s.id,jour:+s.jour,debut:s.debut,fin:s.fin,salle:String(s.salle||'').trim(),type:s.type||'activite'};if(s.du)o.du=s.du;if(s.au)o.au=s.au;return o;}).concat(ended),
    annulees:prev&&prev.annulees?[...prev.annulees]:[],extras:prev&&prev.extras?JSON.parse(JSON.stringify(prev.extras)):[]};
  const id=d.id||genId('c');
  S.busy=true;d.err='';renderDrawer();
  const ok=await write(()=>putCours(id,doc),d.id?W('Enregistré','Cours enregistré'):'Cours ajouté');
  S.busy=false;
  if(ok&&S.dr===d) S.dr=null;
  render();
}

/* Déplacer ou échanger des cours */
/* La période la plus utilisée dans l’horaire : proposée par défaut pour un nouveau cours */
function commonPeriod(){
  const n=new Map();
  for(const c of S.data.cours) for(const x of activeSlots(c).concat(datedOf(c))){if(x.debut&&x.fin){const k=x.debut+'-'+x.fin;n.set(k,(n.get(k)||0)+1);}}
  let best='',m=0;for(const [k,v] of n) if(v>m){best=k;m=v;}
  return best;
}
function periodOptions(extra){
  const m=new Map();
  for(const c of S.data.cours) for(const s of activeSlots(c).concat(datedOf(c))){const k=s.debut+'-'+s.fin;if(s.debut&&s.fin&&!m.has(k))m.set(k,toMin(s.debut));}
  if(extra&&!m.has(extra)) m.set(extra,toMin(extra.split('-')[0]));
  return [...m].sort((a,b)=>a[1]-b[1]).map(([k])=>k);
}
function openMove(key,date,toDate,swapKey){
  const s=findSess(date,key);if(!s)return;
  const t=swapKey?findSess(toDate,swapKey):null;
  openDrawer({kind:'move',key,date,toDate:toDate||date,time:`${s.sl.debut}-${s.sl.fin}`,scope:'once',swapKey:t?swapKey:null,err:''});
}
function moveWarnings(s,t,toDate,a,b){
  const w=[];
  if(t){
    for(const [x,y] of [[s,t],[t,s]]){
      for(const o of sessionsOn(y.date)) if(o.key!==s.key&&o.key!==t.key&&!o.cancelled&&o.start<y.end&&y.start<o.end) for(const tt of (x.tch||[]).filter(q=>q&&o.tch.includes(q)))
        w.push(`${tName(tt)} donne déjà ${o.c.titre} (${gName(o.grp)}) le ${WD[parse(y.date).getDay()].toLowerCase()} ${momentIn(o.start,o.end)}.`);
    }
    return w;
  }
  for(const o of sessionsOn(toDate)){
    if(o.key===s.key||o.cancelled||!(o.start<b&&a<o.end)) continue;
    if(o.grp===s.grp) w.push(`${gName(s.grp)} a déjà ${o.c.titre} ${momentIn(o.start,o.end)}. Glissez plutôt sur ${W('cette séance','ce cours')} pour les échanger.`);
    else for(const tt of (s.tch||[]).filter(q=>q&&o.tch.includes(q))) w.push(`${tName(tt)} donne déjà ${o.c.titre} (${gName(o.grp)}) ${momentIn(o.start,o.end)}.`);
  }
  for(const e of S.data.examens) if(!e.seance&&e.date===toDate&&e.groupe===s.grp&&toMin(e.debut)<b&&a<toMin(e.fin)) w.push(`${gName(s.grp)} a un examen (${e.titre||'examen'}) ${momentIn(toMin(e.debut),toMin(e.fin))}.`);
  return w;
}
function moveDrawer(){
  const d=S.dr, s=findSess(d.date,d.key);
  if(!s) return goneHTML();
  const t=d.swapKey?findSess(d.toDate,d.swapKey):null;
  if(d.swapKey&&!t) return goneHTML();
  const [deb,fin]=d.time.split('-'), a=toMin(deb), b=toMin(fin), src=parse(s.date), to=parse(d.toDate);
  const regular=!s.extra&&(!t||!t.extra), wdS=WD[src.getDay()].toLowerCase(), wdT=WD[to.getDay()].toLowerCase();
  const warn=moveWarnings(s,t,d.toDate,a,b), off=offDay(d.toDate);
  let body, title, eyebrow;
  if(t){
    eyebrow=W('Échanger deux séances','Échanger deux cours');title=`${esc(s.c.titre)} ⇄ ${esc(t.c.titre)}`;
    body=`<div class="mv-route"><div class="mv-box"><small>${esc(s.c.titre)} passe au</small><b>${esc(dayLabel(parse(t.date)))}</b><span>${momentOf(t)}</span></div><span class="mv-arrow" aria-hidden="true">⇄</span><div class="mv-box"><small>${esc(t.c.titre)} passe au</small><b>${esc(dayLabel(src))}</b><span>${momentOf(s)}</span></div></div>`;
  }else{
    eyebrow=W('Déplacer une séance','Déplacer un cours');title=esc(s.c.titre);
    const mon=monday(src);
    const dayOpts=[0,1,2,3,4].map(i=>{const x=addDays(mon,i),ds=iso(x),o=offDay(ds);return `<option value="${ds}"${ds===d.toDate?' selected':''}${o?' disabled':''}>${esc(dayLabel(x))}${o?' ('+esc(o)+')':''}</option>`;}).join('');
    const timeOpts=periodOptions(d.time).map(k=>{const [x,y]=k.split('-'),p=PERIODES.find(z=>z.debut===x&&z.fin===y);return `<option value="${k}"${k===d.time?' selected':''}>${p?p.label:moment(toMin(x),toMin(y))+' ('+fmtT(x)+' – '+fmtT(y)+')'}</option>`;}).join('');
    body=`<div class="mv-route"><div class="mv-box"><small>De</small><b>${esc(dayLabel(src))}</b><span>${momentOf(s)}</span></div><span class="mv-arrow" aria-hidden="true">→</span><div class="mv-box"><small>Vers</small><b>${esc(dayLabel(to))}</b><span>${moment(a,b)}</span></div></div>
      <div class="grid2"><label class="field"><span>Jour</span><select id="mv-day" data-mv="toDate">${dayOpts}</select></label><label class="field"><span>Période</span><select id="mv-time" data-mv="time">${timeOpts}</select></label></div>`;
  }
  const once=t?`Seulement cette semaine`:`Seulement le ${dn(src)} ${fMonth.format(src)}`;
  const onceSub=t?W('Les deux séances changent de place.','Les deux cours changent de place cette semaine. Les autres semaines ne changent pas.'):acad()?`La séance du ${wdS} ${dn(src)} est donnée le ${wdT} ${dn(to)}.`:`Le cours du ${wdS} ${dn(src)} est donné le ${wdT} ${dn(to)}. Les autres semaines ne changent pas.`;
  const weeklySub=t?'Les deux périodes sont échangées pour cette semaine et les suivantes. Les semaines passées ne changent pas.':`Le cours du ${wdS} devient un cours du ${wdT} ${momentIn(a,b)}, dès cette semaine. Les semaines passées ne changent pas.`;
  body+=`<div class="choice" role="radiogroup" aria-label="Portée du changement">
    <label class="opt"><input type="radio" name="mv-scope" value="once"${d.scope==='once'?' checked':''}><div><b>${once}</b><span>${onceSub}</span></div></label>
    ${regular?`<label class="opt"><input type="radio" name="mv-scope" value="weekly"${d.scope==='weekly'?' checked':''}><div><b>Chaque semaine, à partir de celle-ci</b><span>${weeklySub}</span></div></label>`:''}</div>`;
  if(presDoc(s.key)||(t&&presDoc(t.key))) body+='<p class="help">Les présences déjà prises restent enregistrées à l’ancien horaire.</p>';
  if(off) body+=`<p class="form-err">Le ${wdT} ${dn(to)} est un congé (${esc(off)}).</p>`;
  else if(warn.length) body+=`<div class="notice warn"><p><b>À vérifier</b></p><ul>${warn.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
  if(d.err) body+=`<p class="form-err" role="alert">${esc(d.err)}</p>`;
  const sub=esc(`${gName(s.grp)} · ${shortName(tName(s.c.enseignant))}`);
  const foot=`<button class="btn primary" type="button" data-act="mv-apply"${S.busy||off?' disabled':''}>${t?'Échanger':'Déplacer'}${warn.length?' quand même':''}</button><button class="btn ghost" type="button" data-act="close">Annuler</button>`;
  return dTop(eyebrow,title,sub)+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
const courseDoc=c=>{const o=JSON.parse(JSON.stringify(c));delete o.id;delete o.ens0;delete o.seances;o.annulees=o.annulees||[];o.extras=o.extras||[];o.creneaux=o.creneaux||[];return o;};
