/* ---------- Services incendie : l’accès du service qui envoie ses recrues à l’école ----------
   Les services sont dans config/ecole.formation.services [{ id, nom, contact, courriel, tel }] ; chaque élève peut avoir le sien
   (eleves.service). Un compte « Service incendie » (comptes.role = service, ref = id du service) ne lit que son rapport :
   rapports-service/<id> { nom, maj, eleves [...], factures [...] }, écrit par l’administration (« Mettre à jour les rapports »,
   et tout seul quand elle ouvre la page des services). Il lit aussi les réglages de l’école (config/ecole), mais ni les élèves, ni l’horaire, ni le reste de la base. */
const svcList=()=>foCfg().services;
const svcOf=id=>svcList().find(s=>s.id===id)||null;
const svcEls=id=>sortElsByClass(S.data.eleves.filter(e=>e.service===id));
/* Le rapport d’un service, calculé avec les données de l’école (l’administration) */
function svcReport(sv){
  const st=studentStats(yearStart(),todayISO()), N=foNotes(), G=foG(), n=fold(sv.nom);
  const eleves=svcEls(sv.id).map(e=>{const P=foEnpq(e), certs=foCfg().certs.map(c=>({nom:c.nom,enpq:c.enpq,it:foCertOf(e.id,c.id),st:foCertSt(foCertOf(e.id,c.id))})).filter(c=>c.st[0]==='bad'||c.st[0]==='warn'?!!c.it:c.st[0]!=='ok'&&c.enpq);
    return {id:e.id,nom:e.nom,classe:gName(e.groupe),pres:rateOf(st[e.id]),abs:(st[e.id]||{}).A||0,note:(N[e.id]||{}).avg==null?null:N[e.id].avg,todo:(N[e.id]||{}).todo||0,
      grilles:G.filter(g=>foState(e.id,g).k==='ok').length,nGrilles:G.length,enpq:P.envoye?'inscrit':P.ok?'pret':'incomplet',manque:P.miss,certs:certs.map(c=>c.nom+' : '+c.st[1].toLowerCase())};});
  const factures=(S.data.factures||[]).filter(f=>f.statut!=='brouillon'&&(fold(f.client)===n||(sv.client&&fold(f.client)===fold(sv.client)))).map(f=>{const t=cpFTot(f).ttc;return {num:f.num||'',date:f.date||'',echeance:f.echeance||'',total:t,paye:cpFPaid(f),etat:cpFState(f)};});
  return {nom:sv.nom,eleves,factures};
}
/* Le rapport lu par le service : calculé sur place quand la page a les données (aperçu de l’administration, démo), sinon le document */
function svcData(id){
  const sv=svcOf(id);
  if(sv&&(S.canAdmin!==false||window.__DEMO_LOCAL)&&S.data.eleves.some(e=>e.service===id)&&S.termLoaded) return Object.assign(svcReport(sv),{maj:'',live:true});
  return (S.data.monRapport&&S.data.monRapport.id===id)?S.data.monRapport:(S.data.rapports||[]).find(r=>r.id===id)||null;
}
let svcUnsub=null;
function svcMine(){
  const a=myAcct(), id=a&&a.role==='service'?a.ref:'';
  if(!DB||S._svcFor===id) return;
  if(svcUnsub){try{svcUnsub();}catch(e){}svcUnsub=null;}S._svcFor=id;S.data.monRapport=null;
  if(!id) return;
  try{svcUnsub=DB.doc('rapports-service/'+id).onSnapshot(s=>{S.data.monRapport=s.exists?Object.assign({},s.data(),{id}):null;schedule();},()=>{});}catch(e){}
}
const svcCur=()=>{const a=myAcct();if(a&&a.role==='service') return a.ref;const L=svcList();return (L.find(s=>s.id===S.pg.svc)||L[0]||{}).id||'';};
function recruesPage(){
  const id=svcCur(), sv=svcOf(id), me=myAcct()&&myAcct().role==='service';
  if(!me||window.__DEMO_LOCAL) ensureTerm(yearStart());
  const pick=!me&&svcList().length>1?`<select id="svc-pick" aria-label="Service incendie">${svcList().map(s=>`<option value="${esc(s.id)}"${s.id===id?' selected':''}>${esc(s.nom)}</option>`).join('')}</select>`:'';
  const R=id?svcData(id):null;
  if(!id||(!R&&!sv)) return emptyBox('Aucun service incendie',me?'Votre compte n’est relié à aucun service. Écrivez à l’administration de l’école.':'Ajoutez les services incendie dans Formation › Services incendie.');
  if(!R) return `<div class="toolbar">${pick}</div>`+emptyBox('Rapport pas encore prêt','L’administration de l’école doit d’abord mettre à jour les rapports des services.');
  const E=R.eleves||[], pres=E.filter(x=>x.pres!=null), avg=pres.length?Math.round(pres.reduce((n,x)=>n+x.pres,0)/pres.length):null, ready=E.filter(x=>x.enpq!=='incomplet').length, due=(R.factures||[]).filter(f=>f.etat==='envoyee'||f.etat==='retard');
  const tb=`<div class="toolbar">${pick}<p class="summary" style="margin:0">${pick?'':`<span>${esc(R.nom||(sv&&sv.nom)||'')}</span>`}${R.maj?`<span>Mis à jour ${esc(ago(R.maj))}</span>`:''}</p><span class="grow"></span></div>`;
  const tiles=`<div class="xm-tiles" role="group" aria-label="Vos recrues"><div class="xm-tile"><span class="lbl">Recrues</span><b>${E.length}</b><small>à l’école cette année</small></div>
    <div class="xm-tile"><span class="lbl">Présence moyenne</span><b class="${avg!=null&&avg<(cfg().presWarn||90)?'warn':''}">${avg==null?'—':avg+' %'}</b><small>depuis la rentrée</small></div>
    <div class="xm-tile"><span class="lbl">Prêtes pour l’ENPQ</span><b>${ready}</b><small>sur ${E.length}</small></div>
    <div class="xm-tile"><span class="lbl">Factures à payer</span><b class="${due.some(f=>f.etat==='retard')?'bad':''}">${due.length}</b><small>${due.length?fmtM(due.reduce((n,f)=>n+f.total-f.paye,0))+' à payer':'Tout est payé'}</small></div></div>`;
  const ENP={inscrit:['info','Inscrite à l’ENPQ'],pret:['ok','Prête pour l’ENPQ'],incomplet:['off','Dossier incomplet']};
  const rows=E.map(x=>`<tr><th scope="row">${esc(x.nom)}<small class="muted"> · ${esc(x.classe)}</small></th><td class="num">${x.pres==null?'—':x.pres+' %'}${x.abs?`<small class="muted"> · ${pl(x.abs,'absence','absences')}</small>`:''}</td><td class="num">${x.note==null?'—':x.note+' %'}${x.todo?` <span class="chip warn">${pl(x.todo,'à reprendre','à reprendre')}</span>`:''}</td><td class="num">${x.grilles} / ${x.nGrilles}</td><td><span class="chip ${ENP[x.enpq][0]}">${ENP[x.enpq][1]}</span>${(x.certs||[]).length?`<small class="bad-t"> · ${esc(x.certs.join(', '))}</small>`:''}</td></tr>`).join('');
  return tb+tiles+(E.length?`<div class="tbl-wrap"><table class="tbl" id="svc-t"><thead><tr><th>Recrue</th><th class="num">Présence</th><th class="num">Moyenne aux examens</th><th class="num">Grilles pratiques</th><th>Dossier</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<section class="panel"><p class="help">Aucune recrue de ce service cette année.</p></section>')
    +`<section class="panel" id="svc-fact" style="margin-top:14px"><h2>Factures</h2>${(R.factures||[]).length?`<ul class="plist">${R.factures.map(f=>`<li><span><b>${esc(f.num)}</b><span class="muted sm"> · ${esc(f.date?shortDate(parse(f.date)):'')}${f.echeance?' · payable le '+esc(shortDate(parse(f.echeance))):''}</span></span><span>${esc(fmtM(f.total))} <span class="chip ${(CP_FS[f.etat]||['off'])[0]}">${esc((CP_FS[f.etat]||['',f.etat])[1])}</span></span></li>`).join('')}</ul>`:'<p class="help">Aucune facture.</p>'}</section>`;
}
/* Formation › Services incendie (administration) */
function foServPage(){
  const L=svcList(), can=isAdmin()&&S.conn==='shared', R=S.data.rapports||[];
  if(can&&!S._svcAuto&&L.length&&S.termLoaded){S._svcAuto=true;setTimeout(()=>svcPublish(true),0);}
  ensureTerm(yearStart());
  const tb=`<div class="toolbar"><p class="summary" style="margin:0"><span><b>${L.length}</b>${L.length>1?'services':'service'}</span><span><b>${S.data.eleves.filter(e=>e.service).length}</b>recrues</span></p><span class="grow"></span>
    ${can&&L.length?`<button class="btn" type="button" id="svc-pub" data-act="svc-pub">${icon('up')}Mettre à jour les rapports</button>`:''}${can?`<button class="btn primary" type="button" id="svc-new" data-act="svc-edit">${icon('plus')}Ajouter un service</button>`:''}</div>`;
  if(!L.length) return tb+emptyBox('Aucun service incendie','Ajoutez les villes et services incendie qui envoient des recrues. Avec un compte « Service incendie », chacun voit la présence, les résultats, le carnet et les factures de ses recrues seulement.');
  const accts=id=>(S.data.comptes||[]).filter(a=>a.role==='service'&&a.ref===id).length;
  const rows=L.map(s=>{const r=R.find(x=>x.id===s.id);return xRow('xm-sv',`data-act="svc-edit" data-id="${esc(s.id)}"`,`<div class="xm-t"><b>${esc(s.nom)}</b><small>${esc([s.contact,s.courriel].filter(Boolean).join(' · ')||'—')}</small></div><span class="xm-m">${pl(svcEls(s.id).length,'recrue','recrues')}</span><span class="xm-m">${pl(accts(s.id),'compte','comptes')}</span><span class="xm-m">${r&&r.maj?'Rapport '+esc(ago(r.maj)):'Rapport pas encore publié'}</span><div class="xm-end"><button class="btn sm ghost" type="button" data-act="svc-view" data-id="${esc(s.id)}">Voir son rapport</button></div>`,s.nom);}).join('');
  return tb+xList('xm-sv',[['Service'],['Recrues'],['Comptes'],['Rapport'],['','r',1]],rows)+`<p class="help" style="margin-top:8px">Pour donner l’accès : Comptes › Nouveau compte, rôle « Service incendie ». Les factures sont celles dont le client porte le nom du service.</p>`;
}
function foServDrawer(d){
  const s=d.id?svcOf(d.id):null;if(d.id&&!s) return goneHTML('Service');
  const x=s||{}, mine=new Set(S.data.eleves.filter(e=>d.id&&e.service===d.id).map(e=>e.id));
  return dTop(s?'Service incendie':'Nouveau service',s?esc(s.nom):'Ville ou service qui envoie des recrues')+`<form class="dr-body" data-form="svc" novalidate>
    <label class="field"><span>Nom</span><input id="sv-n" maxlength="80" value="${esc(x.nom||'')}" placeholder="Ex. Ville de Saint-Jérôme, service incendie" autocomplete="off"></label>
    <div class="grid2"><label class="field"><span>Personne-ressource</span><input id="sv-c" maxlength="60" value="${esc(x.contact||'')}" autocomplete="off"></label><label class="field"><span>Courriel</span><input id="sv-m" type="email" maxlength="80" value="${esc(x.courriel||'')}" autocomplete="off"></label></div>
    <h3 class="sb-h3">Ses recrues</h3>${groups().map(g=>{const els=studentsOf(g.id);return els.length?`<p class="sb-h3 sm muted">${esc(g.nom)}</p><div class="ck-grid">${els.map(e=>{const o=e.service&&e.service!==d.id?svcOf(e.service):null;return `<label class="ck"><input type="checkbox" name="sv-el" value="${esc(e.id)}"${mine.has(e.id)?' checked':''}> <span>${esc(e.nom)}${o?` <small class="muted">(${esc(o.nom)})</small>`:''}</span></label>`;}).join('')}</div>`:'';}).join('')}
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    <div class="dr-foot"><button class="btn primary" type="submit" id="sv-save"${dis()}>Enregistrer</button>${s?(d.ask?`<button class="btn danger" type="button" id="sv-del-yes" data-act="svc-del-yes">Supprimer le service</button><button class="btn ghost" type="button" data-act="fo-ask-no">Annuler</button>`:'<button class="btn ghost" type="button" data-act="fo-ask">Supprimer</button>'):''}</div></form>`;
}
async function svcSave(f){
  const d=S.dr, v=id=>String(($('#'+id)||{}).value||'').trim(), nom=v('sv-n');
  if(!nom){d.err='Indiquez le nom du service.';renderDrawer();return;}
  const id=d.id||foId('s'), c=configDoc(), fo=Object.assign({},c.formation||{}), L=(fo.services||[]).filter(s=>s.id!==id);
  L.push({id,nom,contact:v('sv-c'),courriel:v('sv-m')});L.sort((a,b)=>collator.compare(a.nom,b.nom));fo.services=L;c.formation=fo;
  const want=new Set([...f.querySelectorAll('input[name=sv-el]:checked')].map(i=>i.value)), fns=[()=>DB.doc('config/ecole').set(c)];
  for(const e of S.data.eleves){if(want.has(e.id)&&e.service!==id)fns.push(()=>col('eleves').doc(e.id).update({service:id}));else if(!want.has(e.id)&&e.service===id)fns.push(()=>col('eleves').doc(e.id).update({service:''}));}
  S.dr=null;S._svcAuto=false;
  if(await runAll(fns,d.id?'Service enregistré':'Service ajouté')) logEv('formation',(d.id?'a modifié':'a ajouté')+' le service incendie « '+nom+' »');
}
async function svcDel(){
  const d=S.dr;if(!d||S.busy) return;
  const c=configDoc(), fo=Object.assign({},c.formation||{});fo.services=(fo.services||[]).filter(s=>s.id!==d.id);c.formation=fo;
  const fns=[()=>DB.doc('config/ecole').set(c),()=>col('rapports-service').doc(d.id).delete()].concat(S.data.eleves.filter(e=>e.service===d.id).map(e=>()=>col('eleves').doc(e.id).update({service:''})));
  S.dr=null;await runAll(fns,'Service supprimé');
}
/* Publier les rapports : un document par service ; seulement ce qui a changé (auto : sans message) */
async function svcPublish(auto){
  if(!isAdmin()||S.conn!=='shared'||S.archive||S.busy) return;
  const R=S.data.rapports||[], now=new Date().toISOString(), fns=[];
  for(const s of svcList()){const r=svcReport(s), old=R.find(x=>x.id===s.id), same=old&&JSON.stringify({nom:old.nom,eleves:old.eleves,factures:old.factures})===JSON.stringify(r);if(!same)fns.push(()=>col('rapports-service').doc(s.id).set(Object.assign(r,{maj:now})));}
  for(const o of R) if(!svcOf(o.id)) fns.push(()=>col('rapports-service').doc(o.id).delete());
  if(!fns.length){if(!auto)toast('Les rapports sont déjà à jour.');return;}
  if(auto){for(const f of fns){try{await f();}catch(e){}}return;}
  await runAll(fns,pl(fns.length,'rapport mis à jour','rapports mis à jour'));
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled||!/^svc-/.test(b.dataset.act))return;
  switch(b.dataset.act){
    case 'svc-edit':openDrawer({kind:'fo',mode:'serv',id:b.dataset.id||''});break;
    case 'svc-del-yes':await svcDel();break;
    case 'svc-pub':await svcPublish(false);break;
    case 'svc-view':S.role='service';S.page='recrues';S.pg={svc:b.dataset.id};S.dr=null;savePrefs();render();window.scrollTo({top:0});break;
  }
});
document.addEventListener('submit',async e=>{if(e.target.dataset.form!=='svc')return;e.preventDefault();if(!S.busy)await svcSave(e.target);});
document.addEventListener('change',e=>{if(e.target.id==='svc-pick'){S.pg.svc=e.target.value;render();}});
