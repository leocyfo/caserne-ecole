/* ---------- Pages : calendrier scolaire ---------- */
function keyDates(){
  const c=cfg(), out=[];
  if(c.debut) out.push({date:c.debut,label:'Premier jour de classe',chip:['ok','Rentrée']});
  for(const e of c.etapes||[]){if(e.du)out.push({date:e.du,label:'Début : '+(e.nom||'Étape'),chip:['info','Étape']});if(e.au)out.push({date:e.au,label:'Fin : '+(e.nom||'Étape'),chip:['info','Étape']});}
  for(const k of c.conges||[]) if(k.du) out.push({date:k.du,end:k.au&&k.au!==k.du?k.au:'',label:k.nom||'Congé',chip:['warn','Congé']});
  if(c.fin) out.push({date:c.fin,label:'Dernier jour de classe',chip:['ok','Fin']});
  return out.sort((a,b)=>a.date.localeCompare(b.date));
}
function yearPage(){
  const c=cfg(), t=todayISO(), st=S.pg, all=!!st.all, adm=isAdmin();
  let head='';
  if(c.debut&&c.fin){
    const tot=Math.max(1,daysBetween(c.debut,c.fin)), el=Math.min(tot,Math.max(0,daysBetween(c.debut,t))), p=Math.round(el/tot*100);
    const cur=(c.etapes||[]).find(e=>e.du<=t&&t<=e.au), nx=(c.conges||[]).filter(k=>k.du>=t).sort((a,b)=>a.du.localeCompare(b.du))[0];
    head=`<div class="kpis"><div class="kpi"><span>Année scolaire</span><b>${esc(c.annee||c.debut.slice(0,4))}</b><small>Du ${esc(longDate(parse(c.debut)))} au ${esc(longDate(parse(c.fin)))}</small></div><div class="kpi"><span>Étape en cours</span><b>${esc(cur?cur.nom:'—')}</b><small>${cur?'Jusqu’au '+esc(longDate(parse(cur.au))):'Aucune étape en cours'}</small></div><div class="kpi"><span>Année écoulée</span><b>${p} %</b><div class="meter" style="margin:8px 0 0"><i style="width:${p}%"></i></div></div><div class="kpi"><span>Prochain congé</span><b style="font-size:20px">${esc(nx?nx.nom:'—')}</b><small>${nx?esc(longDate(parse(nx.du)))+' · dans '+pl(daysBetween(t,nx.du),'jour','jours'):''}</small></div></div>`;
  }else if(adm) head='<div class="notice warn"><p>Indiquez le premier et le dernier jour de classe dans Paramètres pour afficher l’avancement de l’année.</p></div>';
  const items=keyDates().filter(x=>all||(x.end||x.date)>=t);
  const tl=items.length?`<ul class="tl">${items.map(x=>{const d=parse(x.date), past=(x.end||x.date)<t;
    return `<li class="${past?'past':''}">${xDate({date:x.date},'')}<span class="t">${x.exam?`<button class="link" type="button" data-act="exam" data-id="${esc(x.exam)}">${esc(x.label)}</button>`:`<b>${esc(x.label)}</b>`}<span>${esc(WD[d.getDay()]+' '+dn(d)+' '+fMonth.format(d))}${x.end?' au '+esc(shortDate(parse(x.end))):''}${x.sub?' · '+esc(x.sub):''}</span></span><span class="chip ${x.chip[0]}">${x.chip[1]}</span></li>`;}).join('')}</ul>`:'<p class="help">Aucune date à venir.</p>';
  const et=(c.etapes||[]).map((e,i)=>({e,i})).sort((a,b)=>String(a.e.du).localeCompare(String(b.e.du)));
  const cg=(c.conges||[]).map((k,i)=>({k,i})).sort((a,b)=>String(a.k.du).localeCompare(String(b.k.du)));
  const rng=(a,b)=>b&&b!==a?`${shortDate(parse(a))} au ${shortDate(parse(b))}`:shortDate(parse(a));
  return head+`<div class="two"><section class="panel"><div class="t-head" style="margin-bottom:6px"><h2 style="margin:0">Dates importantes</h2><button class="btn sm ghost" type="button" data-act="pg-set" data-k="all" data-v="${all?'':'1'}">${all?'Masquer les dates passées':'Voir toute l’année'}</button></div>${tl}</section>
    <div class="stackp">${(()=>{const mine=x=>S.role==='teacher'?x.tch.includes(S.teacher):S.role==='student'?x.grp===S.group:true, up=allExamItems().filter(x=>x.date>=t&&mine(x)).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start), ex=up.filter(x=>!x.rep), rp=up.find(x=>x.rep), d0=ex[0]&&parse(ex[0].date), d1=rp&&parse(rp.date);
      return `<section class="panel" id="yr-exams"><h2>Examens</h2><p class="help" style="margin-bottom:8px">${ex.length?`<b>${ex.length}</b> ${ex.length>1?'examens à venir':'examen à venir'}. Prochain : ${esc(dayLabel(d0).toLowerCase())}.`:'Aucun examen à venir.'}${rp?` Prochaine journée de reprise : ${esc(dayLabel(d1).toLowerCase())}.`:''}</p><div class="row"><button class="btn sm" type="button" data-act="nav" data-page="examens">Voir les examens</button></div></section>`;})()}<section class="panel"><h2>Étapes</h2>${et.length?`<ul class="plist">${et.map(({e,i})=>`<li><span><b>${esc(e.nom||'Étape')}</b> <span class="muted">${esc(rng(e.du,e.au))}</span></span>${adm?`<button type="button" class="x" data-act="p-del-etape" data-i="${i}" aria-label="${esc('Retirer '+(e.nom||'cette étape'))}"${dis()}>×</button>`:''}</li>`).join('')}</ul>`:'<p class="help">Aucune étape inscrite.</p>'}
      ${adm?`<form class="inline-add" data-form="p-add-etape" style="margin-top:10px"><label class="field"><span>Nom</span><input id="p-enom" maxlength="40" placeholder="Étape 1" autocomplete="off"></label><label class="field" style="flex:0 1 150px"><span>Du</span><input type="date" id="p-edu"></label><label class="field" style="flex:0 1 150px"><span>Au</span><input type="date" id="p-eau"></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section>
    <section class="panel"><h2>Congés et journées pédagogiques</h2><p class="help" style="margin-bottom:8px">Aucun cours n’est affiché ces jours-là.</p>${cg.length?`<ul class="plist">${cg.map(({k,i})=>`<li><span><b>${esc(k.nom||'Congé')}</b> <span class="muted">${esc(rng(k.du,k.au))}</span></span>${adm?`<button type="button" class="x" data-act="p-del-conge" data-i="${i}" aria-label="${esc('Retirer '+(k.nom||'ce congé'))}"${dis()}>×</button>`:''}</li>`).join('')}</ul>`:'<p class="help">Aucun congé inscrit.</p>'}
      ${adm?`<form class="inline-add" data-form="p-add-conge" style="margin-top:10px"><label class="field"><span>Nom</span><input id="p-cnom" maxlength="60" placeholder="Journée pédagogique" autocomplete="off"></label><label class="field" style="flex:0 1 150px"><span>Du</span><input type="date" id="p-cdu"></label><label class="field" style="flex:0 1 150px"><span>Au</span><input type="date" id="p-cau"></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section></div></div>`;
}

/* ---------- Pages : paramètres ---------- */
function paramsPage(){
  const c=cfg(), n=S.conn==='shared'?exampleCount():0;
  return `<section class="page-panel narrow"><form data-form="p-save">
    <h2 class="sec-title">L’école</h2>
    <label class="field"><span>Nom de l’établissement</span><input id="p-nom" value="${esc(c.nom)}" maxlength="80" autocomplete="off"></label>
    <label class="field"><span>Année scolaire</span><input id="p-annee" value="${esc(c.annee)}" maxlength="20" placeholder="2026–2027" autocomplete="off"></label>
    <div class="grid2"><label class="field"><span>Premier jour de classe</span><input type="date" id="p-debut" value="${esc(c.debut)}"></label><label class="field"><span>Dernier jour de classe</span><input type="date" id="p-fin" value="${esc(c.fin)}"></label></div>
    <label class="field" style="max-width:280px"><span>Seuil de réussite des examens (%)</span><input type="number" id="p-seuil" min="1" max="100" step="1" inputmode="numeric" value="${seuil()}"></label>
    <p class="help">Les étapes et les congés se gèrent dans Calendrier scolaire.</p>
    <div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button></div></form>
  <section class="dr-sec"><h2 class="sec-title">Modules du programme</h2><p class="help">${pl(comps().length,'module','modules')}. Leur nom, leurs heures de théorie et de pratique et leurs cours se gèrent dans le menu Modules.</p><div class="row" style="margin-top:8px"><button class="btn sm" type="button" id="p-modules" data-act="nav" data-page="modules">Ouvrir les modules</button></div></section>
  ${acad()?ressPanel():''}
  <section class="dr-sec"><h2 class="sec-title">Qui voit quoi</h2>${siteMode()?'<p class="help">Chaque personne a son compte sur le site, approuvé dans le menu <b>Comptes</b>. Son rôle décide de ce qu’elle voit.</p><ul class="access"><li><b>Administrateur</b><span>Tous les menus, y compris les comptes, les dossiers et les présences du personnel.</span></li><li><b>Enseignant</b><span>Son horaire, ses disponibilités, les cours à pourvoir et ses candidatures, ainsi que les présences et les examens de ses cours.</span></li><li><b>Élève</b><span>L’horaire et les examens de sa classe, et le calendrier scolaire. Les listes d’élèves, les présences et les dossiers du personnel lui restent cachés.</span></li></ul></section>':`<p class="help">Chaque profil suit le niveau de partage de cette page dans claude.ai. Reliez ensuite chaque personne à sa fiche dans le menu <b>Comptes</b> : elle arrivera directement sur son horaire et son profil.</p>
    <ul class="access"><li><b>Éditeur</b><span>Administrateur : tous les menus, y compris les dossiers et les présences du personnel.</span></li><li><b>Contributeur</b><span>Enseignant : son horaire, ses disponibilités, les cours à pourvoir et ses candidatures, ainsi que les présences et les examens de ses cours.</span></li><li><b>Lecteur</b><span>Élève : l’horaire et les examens de sa classe, et le calendrier scolaire. Les listes d’élèves, les présences et les dossiers du personnel lui restent cachés.</span></li></ul></section>`}
  ${n?`<section class="dr-sec"><h2 class="sec-title">Données d’exemple</h2><p class="help">${pl(n,'élément d’exemple est encore présent','éléments d’exemple sont encore présents')}.</p><div class="row"><button class="btn sm danger" type="button" data-act="clear-ex"${dis()}>Effacer les exemples</button></div></section>`:''}</section>`;
}

