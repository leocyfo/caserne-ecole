/* ---------- Pages : horaire ---------- */
function emptyBox(title,text,actions){return `<div class="empty"><h2>${title}</h2><p>${text}</p>${actions?`<div class="row">${actions}</div>`:''}</div>`;}
function identitySelect(){
  if(locked()) return '';
  if(S.role==='teacher'){const ts=teachers();return ts.length?`<select id="sel-teacher" aria-label="Enseignant">${ts.map(t=>`<option value="${esc(t.id)}"${t.id===S.teacher?' selected':''}>${esc(t.nom)}</option>`).join('')}</select>`:'';}
  if(S.role==='student'){const gs=groups();return gs.length?`<select id="sel-group" aria-label="Ma classe">${gs.map(g=>`<option value="${esc(g.id)}"${g.id===S.group?' selected':''}>${esc(g.nom)}</option>`).join('')}</select>`:'';}
  return '';
}
function schoolWeek(){
  const c=cfg();if(!c.debut)return null;
  const n=Math.floor(daysBetween(iso(monday(parse(c.debut))),iso(S.week))/7)+1;
  return n<1||(c.fin&&iso(S.week)>c.fin)?null:n;
}
function rangeLabel(m){const f=addDays(m,4);return m.getMonth()===f.getMonth()?`${dn(m)} – ${dn(f)} ${fMonth.format(f)}`:`${dn(m)} ${fMonthS.format(m)} – ${dn(f)} ${fMonthS.format(f)}`;}
/* Barre de contrôle : semaine, regroupement, retard des présences et action, sur une seule ligne. */
/* Jours de classe : on saute la fin de semaine */
const weekday=d=>{d=new Date(d);while(d.getDay()===0||d.getDay()===6)d=addDays(d,1);return iso(d);};
function setDay(ds){S.dayDate=ds;const m=monday(parse(ds));if(iso(m)!==iso(S.week)){S.week=m;S.day=defaultDay();subWeek();}render();}
function stepDay(k){let d=parse(S.dayDate||todayISO());do{d=addDays(d,k);}while(d.getDay()===0||d.getDay()===6);setDay(iso(d));}
const dayMode=()=>S.role==='admin'&&S.view==='jour';
/* Premier jour affiché : aujourd’hui (ou le vendredi en fin de semaine), sinon le lundi de la semaine affichée */
const initDay=()=>isCurWeek()?weekday(new Date()):iso(S.week);
function toolbarHTML(){
  const ready=S.conn==='shared'&&allLoaded(), n=schoolWeek(), r=rangeLabel(S.week);
  const tip=`${r} ${S.week.getFullYear()}${n?` · semaine ${n} de l’année`:''}${isCurWeek()?' · cette semaine':''}`;
  const nav=`<div class="wk" role="group" aria-label="Semaine affichée"><button type="button" id="w-prev" data-act="prev" aria-label="Semaine précédente" title="Semaine précédente (←)">${icon('left')}</button><div class="wk-range" title="${esc(tip)}">${r}</div><button type="button" id="w-next" data-act="next" aria-label="Semaine suivante" title="Semaine suivante (→)">${icon('right')}</button></div>`
    +(isCurWeek()?'':'<button type="button" class="today-btn" id="w-today" data-act="today">Aujourd’hui</button>');
  const dd=dayMode()?parse(S.dayDate):null;
  const navDay=dd?`<div class="wk" role="group" aria-label="Jour affiché"><button type="button" id="w-prev" data-act="prev" aria-label="Jour précédent" title="Jour précédent (←)">${icon('left')}</button><div class="wk-range wk-day-range">${esc(WD[dd.getDay()])} ${dn(dd)} ${esc(fMonth.format(dd))}</div><button type="button" id="w-next" data-act="next" aria-label="Jour suivant" title="Jour suivant (→)">${icon('right')}</button></div>`
    +(S.dayDate===weekday(new Date())?'':'<button type="button" class="today-btn" id="w-today" data-act="today">Aujourd’hui</button>'):'';
  const viewSeg=S.role==='admin'?`<div class="seg sm" role="group" aria-label="Affichage"><button type="button" id="vw-semaine" data-act="view" data-v="semaine" aria-pressed="${!dayMode()}">Semaine</button><button type="button" id="vw-jour" data-act="view" data-v="jour" aria-pressed="${dayMode()}">Jour</button></div>`:'';
  let mid='',right='';
  if(S.role==='admin'){
    if(S.data.cours.length&&ready) mid=viewSelHTML();
    const late=S._stats?S._stats.late:0;
    if(late) right+=`<button type="button" class="late" id="late-pill" data-act="nav" data-page="classes" title="${W('Séances passées','Cours passés')} de la semaine dont les présences n’ont pas été prises. Ouvrir les classes.">${late} <span class="t-long">${late>1?'présences en retard':'présence en retard'} cette semaine</span><span class="t-short">en retard</span></button>`;
    if(ready&&S.canAdmin!==false) right+=`<button class="btn primary" type="button" id="new-course" data-act="new-course">${icon('plus')}<span class="t-long">${acad()?'Ajouter une séance':'Planifier un cours'}</span><span class="t-short">${acad()?'Ajouter':'Planifier'}</span></button>`;
  }else right=identitySelect();
  return `<section class="ctl" aria-label="Affichage de l’horaire">${dd?navDay:nav}${viewSeg}${mid?'<span class="vsep" aria-hidden="true"></span>'+mid:''}<span class="grow"></span>${right}</section>`;
}
function viewSelHTML(){
  const mode=S.fmode, f=S.filtre;
  const seg=`<div class="seg sm" role="group" aria-label="Regrouper par"><button type="button" id="fm-g" data-act="fmode" data-v="g" aria-pressed="${mode==='g'}">Classes</button><button type="button" id="fm-e" data-act="fmode" data-v="e" aria-pressed="${mode==='e'}">Enseignants</button></div>`;
  if(mode==='g'){
    // Les classes se choisissent en cliquant sur leur ligne dans le tableau.
    const sel=f.startsWith('g:')?gName(f.slice(2)):'';
    return `<div class="viewsel">${seg}${sel?`<span class="token" id="class-token">${esc(sel)}<button type="button" id="tok-clear" data-act="filt" data-v="" aria-label="Revoir toutes les classes" title="Revoir toutes les classes">×</button></span>`:''}</div>`;
  }
  const chips=[`<button type="button" class="fchip" id="fc-all" data-act="filt" data-v="" aria-pressed="${!f}">Tous</button>`]
    .concat(teachers().map(t=>`<button type="button" class="fchip" id="fc-${esc(t.id)}" data-act="filt" data-v="e:${esc(t.id)}" aria-pressed="${f==='e:'+t.id}">${esc(t.nom)}<small title="${W('Séances','Cours')} cette semaine">${weekCount(t.id,S.week)}</small></button>`));
  return `<div class="viewsel">${seg}<div class="chips" role="group" aria-label="Enseignants">${chips.join('')}</div></div>`;
}
function adminMain(){
  if(!S.data.cours.length){
    const can=S.canAdmin!==false;
    return `<div class="empty"><h2>Aucun cours pour l’instant</h2><p>Préparez l’horaire de la session en trois étapes.</p>
      <ol class="steps"><li><b>Classes et élèves.</b> Créez vos classes, puis collez la liste des élèves de chacune.</li><li><b>Personnel.</b> Ajoutez chaque enseignant qui donne des cours.</li><li><b>Cours.</b> Planifiez chaque cours avec sa classe, son enseignant et ses périodes de la semaine.</li></ol>
      ${can&&siteMode()?`<p class="help">Ou partez de l’exemple : l’horaire 2026–2027 des classes 119 à 123, avec leurs enseignants et leurs élèves.</p><div class="row" style="margin-bottom:10px"><button class="btn" type="button" id="import-demo" data-act="import-demo"${dis()}>Charger l’exemple de l’Académie</button></div>`:''}
      ${can?`<div class="row"><button class="btn" type="button" data-act="nav" data-page="classes">Gérer les classes</button><button class="btn primary" type="button" data-act="new-course">${icon('plus')}Planifier un cours</button></div>`:''}</div>`;
  }
  const f=S.filtre, list=filterItems(weekItems(),'admin');
  const known=new Set(S.data.groupes.map(g=>g.id));
  let rows;
  if(f.startsWith('g:')) rows=[{id:f.slice(2),name:gName(f.slice(2)),match:()=>true}];
  else{
    let gs=groups();
    if(f.startsWith('e:')) gs=gs.filter(g=>list.some(s=>s.grp===g.id));
    rows=gs.map(g=>({id:g.id,name:g.nom,match:s=>s.grp===g.id}));
    if(list.some(s=>!known.has(s.grp))) rows.push({id:null,name:'Sans classe',match:s=>!known.has(s.grp)});
    if(!rows.length) rows=[{id:null,name:f?W('Aucune séance','Aucun cours'):W('Toutes les séances','Tous les cours'),match:()=>true}];
  }
  let done=0,late=0,cancel=0,live=0,exams=0;
  for(const s of list){if(s.kind==='exam'){exams++;continue;}const a=attInfo(s);if(a.state==='cancelled')cancel++;else{live++;if(a.state==='done')done++;else if(a.due)late++;}}
  if(S.view==='jour'){
    const dl=list.filter(x=>x.date===S.dayDate);
    let dlate=0;for(const x of dl){if(x.kind==='exam')continue;const a=attInfo(x);if(a.due)dlate++;}
    S._stats={live:0,exams:0,cancel:0,done:0,late:dlate};
    return dayBoardHTML(list,rows);
  }
  S._stats={live,exams,cancel,done,late};
  return daytabsHTML()+boardHTML(list,rows,'admin','Classe');
}
function teacherMain(){
  const ts=teachers();
  if(!ts.length) return emptyBox('Aucun enseignant inscrit','L’administration ajoute les enseignants dans le menu Personnel. Ils pourront ensuite voir leurs cours ici et prendre les présences.');
  const list=filterItems(weekItems(),'teacher');
  let panels='';
  if(isCurWeek()){
    const td=todayISO(), off=offDay(td), tl=list.filter(s=>s.date===td);
    panels+=`<section class="panel"><h2>Aujourd’hui</h2>${off?`<p class="help">${esc(off)}</p>`:tl.length?`<div class="list">${tl.map(s=>rowHTML(s,'teacher')).join('')}</div>`:`<p class="help">${W('Aucune séance','Aucun cours')} aujourd’hui.</p>`}</section>`;
  }
  const live=list.filter(s=>s.kind==='cours'&&!s.cancelled);
  let done=0;const late=[];
  for(const s of live){const a=attInfo(s);if(a.state==='done')done++;else if(a.due)late.push(s);}
  const p=pct(done,live.length)||0;
  panels+=`<section class="panel"><h2>Présences de la semaine</h2>
    <p class="big">${done}<span> / ${live.length}</span></p><div class="meter" role="img" aria-label="${p} % des ${W('séances','cours')}"><i style="width:${p}%"></i></div>
    <p class="help">${live.length?`${pl(done,W('séance complétée','cours complété'),W('séances complétées','cours complétés'))} sur ${live.length} cette semaine.`:W('Aucune séance cette semaine.','Aucun cours cette semaine.')}</p>
    ${late.length?`<h2 style="margin-top:14px">À rattraper</h2><div class="miss-list">${late.slice(0,5).map(s=>missRow(s,'teacher')).join('')}</div>${late.length>5?`<p class="help">Et ${late.length-5} autres.</p>`:''}`:''}</section>`;
  return `<div class="panels">${panels}</div>`+daytabsHTML()+boardHTML(list,[{name:W('Mes séances','Mes cours'),match:()=>true}],'teacher');
}
function nextSession(filter){
  const base=new Date(), nm=nowMin();
  for(let i=0;i<35;i++){
    const ss=sessionsOn(iso(addDays(base,i))).filter(filter).filter(s=>!s.cancelled&&(i>0||s.end>nm));
    if(ss.length) return {s:ss[0],i};
  }
  return null;
}
/* Examens planifiés (fiches) et séances « Examen » de l’horaire annuel, réunis. */
function sessionExamItems(){
  const out=[];
  for(const c of S.data.cours) for(const x of datedOf(c)){
    if(!(x.tags||[]).some(t=>t==='Examen'||t==='Reprise')) continue;
    if((c.annulees||[]).includes(`${x.date}@${x.id}`)||offDay(x.date)) continue;
    const a=toMin(x.debut), b=toMin(x.fin);
    out.push({kind:'exam',fromSess:true,rep:!(x.tags||[]).includes('Examen'),key:`${c.id}_${x.id}_${x.date}`,e:{id:'',titre:x.label&&x.label.toLowerCase()!==String(c.titre).toLowerCase()?'Examen '+x.label:'Examen',date:x.date,debut:x.debut,fin:x.fin,salle:x.salle||'',surveillant:''},c,date:x.date,start:a,end:b,grp:c.groupe,tch:tchOf(c,`${c.id}_${x.id}_${x.date}`),salle:String(x.salle||c.salle||'').trim()});
  }
  return out;
}
const allExamItems=()=>S.data.examens.filter(e=>!e.seance).map(examItem).concat(sessionExamItems());
const examAct=x=>x.fromSess?`data-act="sess-at" data-key="${esc(x.key)}" data-date="${x.date}"`:`data-act="exam" data-id="${esc(x.e.id)}"`;
function upcomingExams(filter,n){const t=todayISO();return allExamItems().filter(x=>!x.rep&&x.date>=t&&filter(x)).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start).slice(0,n);}
function examRows(items,mode){
  return items.map(x=>`<button type="button" class="xm-mini" ${examAct(x)}>${xDate(x,x.rep?'rep':daysBetween(todayISO(),x.date)<=2?'hot':'')}<span class="xm-t"><b>${xTitle(x)}</b><small>${esc([x.c&&!x.rep&&x.e.titre&&x.e.titre!=='Examen'?x.e.titre:'',momentOf(x),mode==='student'?'':gName(x.grp)].filter(Boolean).join(' · '))}</small></span>${x.rep?'<span class="chip info">Reprise</span>':xWhen(x)}</button>`).join('');
}
function studentMain(){
  const gs=groups();
  if(!gs.length) return emptyBox('Aucune classe pour l’instant','L’horaire apparaîtra ici dès que l’administration aura créé les classes et leurs cours.');
  const gid=S.group, list=filterItems(weekItems(),'student');
  const nx=nextSession(s=>s.c.groupe===gid);
  let next=`<p class="help">${W('Aucune séance prévue','Aucun cours prévu')} dans les prochaines semaines.</p>`;
  if(nx){
    const s=nx.s, ongoing=nx.i===0&&s.start<=nowMin();
    const when=nx.i===0?'Aujourd’hui':nx.i===1?'Demain':dayLabel(parse(s.date));
    next=`<div class="next ${tone(s.c)}"><div class="row">${ongoing?'<span class="chip today">En cours</span>':`<span class="chip">${esc(when)}</span>`}${choreChip(s)}</div>
      <p class="nx-t">${codeOf(s.c)}${esc(s.c.titre)}</p><div class="nx-w">${ongoing?'En cours · ':''}${momentOf(s)}</div>
      <div class="muted">${esc([s.salle?'Local '+s.salle:'',tchNames(s)].filter(Boolean).join(' · '))}</div></div>`;
  }
  const ex=upcomingExams(x=>x.grp===gid,4);
  return `<div class="panels"><section class="panel"><h2>${W('Prochaine séance','Prochain cours')}</h2>${next}</section><section class="panel"><h2>Prochains examens</h2>${ex.length?`<div class="list">${examRows(ex,'student')}</div>`:'<p class="help">Aucun examen prévu.</p>'}</section></div>`
    +daytabsHTML()+boardHTML(list,[{name:gName(gid),match:()=>true}],'student');
}

