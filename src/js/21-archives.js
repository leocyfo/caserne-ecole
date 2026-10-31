/* ---------- Clôture de l’année et archives ----------
   archives/<id>        une année clôturée : { nom, debut, fin, cloture, par, parts, taille, garde, compte { classes, eleves, seances, examens, presences } }
   archives-parts/<id>-<k>  le contenu de l’année, en morceaux de texte JSON : { archive, part, json }
   Clôturer : tout ce qui appartient à l’année est copié dans une archive, puis retiré pour repartir à neuf. On garde l’école,
   les réglages, les modules, les locaux, le personnel et les comptes ; au choix, les classes et leurs élèves.
   Consulter : tout le site s’affiche avec les données de l’archive, en lecture seule (S.conn = 'archive') ; les données en
   cours restent dans S.liveData et continuent de s’y mettre à jour. */
const ARCH_PART=100000;
const LIVE=()=>S.archive?S.liveData:S.data;
const archList=()=>(LIVE().archives||[]);
/* « 2026–2027 » devient « 2027–2028 » ; une date avance d’un an */
const nextYearName=n=>{const m=/(\d{4})(\D+)(\d{4})/.exec(n||'');return m?n.replace(m[0],`${+m[1]+1}${m[2]}${+m[3]+1}`):'';};
const plusYear=d=>/^\d{4}-/.test(d||'')?(+d.slice(0,4)+1)+d.slice(4):'';
/* Tout ce qui appartient à l’année. Présences, résultats par élève et historique sont lus en entier dans la base
   (le site n’en charge qu’une partie). */
async function yearSnapshot(){
  const D=S.data, c=cfg(), strip=a=>(a||[]).map(x=>Object.assign({},x));
  const all=async k=>{const q=await col(k).get();return q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));};
  const [pres,resEl,journal,stockMvt,compta,factures,paie]=await Promise.all([all('presences'),all('resultats-eleves'),all('journal'),all('stock-mvt'),all('compta'),all('compta-factures'),all('compta-paie')]);
  return {version:1,nom:c.annee||'',debut:c.debut||'',fin:c.fin||'',config:D.config,groupes:strip(D.groupes),eleves:strip(D.eleves),enseignants:strip(D.enseignants),dossiers:D.dossiers,
    cours:strip(RAWC),examens:strip(D.examens),resultats:D.resultats,resultatsEleves:resEl,presences:pres,candidatures:strip(D.candidatures),remplacements:strip(D.remplacements),
    dispos:D.dispos,staffPres:D.staffPres,absProfs:D.absProfs,journal,stock:strip(D.stock),stockMvt,compta,factures,paie};
}
/* Une facture envoyée et pas encore payée en entier reste ouverte */
function yearOpenInv(f,sn){if(f.statut!=='envoyee')return false;const paid=sumC((sn.compta||[]).filter(x=>x.type==='rev'&&x.facture===f.id).map(x=>x.ttc))+(+f.report||0);return paid<cpFTot(f).ttc;}
/* Les documents que la clôture retire (ils sont dans l’archive) */
function yearDocs(sn,keep){
  const out=[], add=(k,ids)=>{for(const id of ids) out.push([k,id]);}, ids=a=>(a||[]).map(d=>d.id), keys=o=>Object.keys(o||{});
  add('cours',ids(sn.cours));add('examens',ids(sn.examens));add('resultats',keys(sn.resultats));add('resultats-eleves',ids(sn.resultatsEleves));
  add('presences',ids(sn.presences));add('candidatures',ids(sn.candidatures));add('remplacements',ids(sn.remplacements));
  add('disponibilites',keys(sn.dispos));add('presences-personnel',keys(sn.staffPres));add('profs-absents',keys(sn.absProfs));add('journal',ids(sn.journal));
  add('stock-mvt',ids(sn.stockMvt));add('compta',ids(sn.compta));add('compta-paie',ids(sn.paie));add('compta-factures',ids((sn.factures||[]).filter(f=>!yearOpenInv(f,sn))));
  if(!keep){add('groupes',ids(sn.groupes));add('eleves',ids(sn.eleves));}
  return out;
}
/* Première étape : vérifier la nouvelle année et demander confirmation */
function askCloseYear(f){
  const q=id=>f.querySelector('#'+id), nom=String(q('p-ny-nom').value).trim(), debut=q('p-ny-debut').value, fin=q('p-ny-fin').value, c=cfg();
  if(!nom){toast('Donnez un nom à la nouvelle année ou session.','bad');return;}
  if(!debut||!fin){toast('Indiquez le premier et le dernier jour de la nouvelle année.','bad');return;}
  if(fin<debut){toast('Le dernier jour précède le premier jour.','bad');return;}
  if(c.debut&&debut<=c.debut){toast('La nouvelle année doit commencer après le début de l’année en cours.','bad');return;}
  if(nom===(c.annee||'')){toast('La nouvelle année doit porter un autre nom que l’année en cours.','bad');return;}
  S.pg.close={nom,debut,fin,keep:q('p-ny-keep').checked};render();
}
async function closeYear(){
  const p=S.pg.close;if(!p||S.busy||S.archive) return;
  S.busy=true;S.pg.close=null;render();
  let sn;try{sn=await yearSnapshot();}catch(e){S.busy=false;render();toast(errMsg(e),'bad');return;}
  const id='a'+Date.now().toString(36), txt=JSON.stringify(sn), parts=[];
  for(let i=0;i<txt.length;i+=ARCH_PART) parts.push(txt.slice(i,i+ARCH_PART));
  const seances=sessionsBetween(sn.debut||yearStart(),sn.fin||todayISO()).filter(s=>s.kind==='cours'&&!s.cancelled).length;
  const meta={nom:sn.nom||'Année sans nom',debut:sn.debut,fin:sn.fin,cloture:new Date().toISOString(),par:S.me.name||'',parts:parts.length,taille:txt.length,garde:p.keep,
    compte:{classes:sn.groupes.length,eleves:sn.eleves.length,seances,examens:sn.examens.length,presences:sn.presences.length}};
  /* 1. l’archive, le résumé en dernier : une archive incomplète n’apparaît jamais dans la liste */
  try{for(let k=0;k<parts.length;k++) await col('archives-parts').doc(id+'-'+k).set({archive:id,part:k,json:parts[k]});await col('archives').doc(id).set(meta);}
  catch(e){S.busy=false;render();toast('L’archive n’a pas pu être enregistrée ; rien n’a été retiré. '+errMsg(e),'bad');return;}
  /* 2. on retire l’année archivée et on ouvre la nouvelle (dates, sans étapes ni congés) */
  const c=configDoc();c.annee=p.nom;c.debut=p.debut;c.fin=p.fin;c.etapes=[];c.conges=[];
  const fns=yearDocs(sn,p.keep).map(([k,d])=>()=>col(k).doc(d).delete());
  /* une facture encore ouverte passe à la nouvelle année, avec ce qui a déjà été payé */
  for(const f of (sn.factures||[]).filter(x=>yearOpenInv(x,sn))) fns.push(()=>col('compta-factures').doc(f.id).update({report:sumC((sn.compta||[]).filter(x=>x.type==='rev'&&x.facture===f.id).map(x=>x.ttc))+(+f.report||0)}));
  fns.push(()=>DB.doc('config/ecole').set(c));
  S.busy=false;
  if(await runAll(fns,`${meta.nom} est archivée ; ${p.nom} commence.`)){S.week=monday(parse(p.debut>todayISO()?todayISO():p.debut));render();}
}
async function loadArchive(id){
  const meta=archList().find(a=>a.id===id);if(!meta) throw {message:'Archive introuvable.'};
  const q=await col('archives-parts').where('archive','==',id).get();
  const ps=q.docs.map(d=>d.data()).sort((a,b)=>a.part-b.part);
  if(ps.length!==meta.parts) throw {message:'Cette archive est incomplète.'};
  return {meta,sn:JSON.parse(ps.map(x=>x.json).join(''))};
}
/* Consulter : le site entier passe sur les données de l’archive, en lecture seule */
async function openArchive(id){
  if(S.archive||S.busy) return;
  S.busy=true;render();
  let a;try{a=await loadArchive(id);}catch(e){S.busy=false;render();toast(e&&e.message&&!e.code?e.message:errMsg(e),'bad');return;}
  S.busy=false;
  const sn=a.sn, map=arr=>{const m={};for(const d of arr||[]){const x=Object.assign({},d);delete x.id;m[d.id]=x;}return m;}, pres=map(sn.presences);
  S.liveData=S.data;S.liveRawc=RAWC;S.liveConn=S.conn;S.liveWeek=S.week;
  S.archive={id,nom:a.meta.nom,debut:sn.debut,fin:sn.fin,resEl:sn.resultatsEleves||[]};
  S.data=Object.assign({},S.liveData,{stock:sn.stock||S.liveData.stock,stockMvt:(sn.stockMvt||[]).slice().sort((x,y)=>String(y.le||'').localeCompare(String(x.le||''))),compta:sn.compta||[],factures:sn.factures||[],paie:sn.paie||[],config:sn.config,groupes:sn.groupes||[],eleves:sn.eleves||[],enseignants:sn.enseignants||[],dossiers:sn.dossiers||{},examens:sn.examens||[],resultats:sn.resultats||{},
    presences:pres,presTerm:pres,presOne:{},candidatures:sn.candidatures||[],remplacements:sn.remplacements||[],dispos:sn.dispos||{},staffPres:sn.staffPres||{},absProfs:sn.absProfs||{},journal:sn.journal||[],mesRes:{},mesPct:{}});
  RAWC=sn.cours||[];S.data.cours=normCours(RAWC);
  S.conn='archive';S.termLoaded=true;S.termFrom=sn.debut||'0000-01-01';S._mrFor=null;S.jrLoaded=true;
  S.week=monday(parse(sn.debut||todayISO()));S.page='calendar';S.pg={};S.dr=null;
  render();window.scrollTo({top:0});
}
function closeArchive(){
  if(!S.archive) return;
  S.data=S.liveData;RAWC=S.liveRawc;S.data.cours=normCours(RAWC);S.conn=S.liveConn;S.week=S.liveWeek;
  S.archive=null;S.liveData=null;S.termKey='';S._mrFor=null;S.dr=null;S.page='params';S.pg={ps:'annee'};
  subWeek();render();window.scrollTo({top:0});
}
async function exportArchive(id){
  let a;try{a=await loadArchive(id);}catch(e){toast(e&&e.message&&!e.code?e.message:errMsg(e),'bad');return;}
  await saveFile(`pompiernote-archive-${prSlug(a.meta.nom)}.json`,new Blob([JSON.stringify(Object.assign({archive:a.meta},a.sn),null,2)],{type:'application/json'}));
}
async function deleteArchive(id){
  const a=archList().find(x=>x.id===id);if(!a||S.busy) return;
  S.pg.adel='';
  const fns=[];for(let k=0;k<(a.parts||0);k++) fns.push(()=>col('archives-parts').doc(id+'-'+k).delete());
  fns.push(()=>col('archives').doc(id).delete());
  await runAll(fns,`Archive ${a.nom} supprimée`);
}
/* Paramètres > Année scolaire : clôturer, et les années archivées */
function archivesHTML(can){
  const c=cfg(), st=S.pg, p=st.close, arcs=archList(), dn=d=>d?shortDate(parse(d)):'—';
  let close='';
  if(S.archive) close='';
  else if(p) close=`<section class="panel ps-card ps-wide ps-close" id="p-close-ask"><h3>Clôturer ${esc(c.annee||'l’année')} et commencer ${esc(p.nom)} ?</h3>
      <ul class="ps-recap">
        <li><b>Archivés puis retirés :</b> l’horaire et les séances, les présences, les examens et les résultats, les candidatures, les remplacements, les disponibilités, les étapes, les congés, l’historique, les mouvements du stock et la compta de l’année (paiements, dépenses, paie, factures réglées)${p.keep?'':' ; les classes et leurs élèves'}.</li>
        <li><b>Gardés :</b> l’école et les réglages, les modules et les locaux, le personnel et les comptes, l’inventaire du stock, les réglages de la compta et les factures encore ouvertes${p.keep?', les classes et leurs élèves':''}.</li>
        <li><b>Nouvelle année :</b> ${esc(p.nom)}, du ${esc(dn(p.debut))} au ${esc(dn(p.fin))}.</li>
      </ul>
      ${c.fin&&c.fin>todayISO()?`<p class="notice warn" style="margin:0"><span>L’année en cours n’est pas terminée : son dernier jour est le ${esc(dn(c.fin))}.</span></p>`:''}
      <p class="help">L’archive se consulte en tout temps ici, en lecture seule, et s’exporte.</p>
      <div class="row"><button class="btn primary" type="button" id="p-close-go" data-act="p-close-go"${dis()}>Oui, clôturer ${esc(c.annee||'l’année')}</button><button class="btn ghost" type="button" data-act="p-close-no">Annuler</button></div></section>`;
  else if(can) close=`<form class="panel ps-card ps-wide" data-form="p-close" novalidate><h3>Clôturer l’année et commencer la suivante</h3>
      <p class="help">${esc(c.annee||'L’année en cours')}${c.debut&&c.fin?` (du ${esc(dn(c.debut))} au ${esc(dn(c.fin))})`:''} est copiée dans une archive que vous pourrez rouvrir en tout temps, puis on repart à neuf.</p>
      <div class="ps-ny"><label class="field"><span>Nom de la nouvelle année ou session</span><input id="p-ny-nom" maxlength="30" autocomplete="off" value="${esc(nextYearName(c.annee))}" placeholder="2027–2028"></label>
        <label class="field"><span>Premier jour de classe</span><input id="p-ny-debut" type="date" value="${esc(plusYear(c.debut))}"></label>
        <label class="field"><span>Dernier jour de classe</span><input id="p-ny-fin" type="date" value="${esc(plusYear(c.fin))}"></label></div>
      <label class="ps-chk"><input type="checkbox" id="p-ny-keep"><span><b>Garder les classes et leurs élèves</b><small>Pour une cohorte qui continue. Sinon, elles sont archivées puis retirées.</small></span></label>
      <div class="row"><button class="btn" type="submit" id="p-close"${dis()}>${icon('year')}Clôturer l’année…</button></div></form>`;
  const rows=arcs.map(a=>{const k=a.compte||{}, cur=S.archive&&S.archive.id===a.id, del=st.adel===a.id;
    return `<li class="ps-arow${cur?' cur':''}" id="arch-${esc(a.id)}"><div class="ps-at"><b>${esc(a.nom)}</b>${cur?' <span class="chip info">Consultée</span>':''}
        <small>Du ${esc(dn(a.debut))} au ${esc(dn(a.fin))} · clôturée le ${esc(a.cloture?shortDate(new Date(a.cloture)):'—')}${a.par?' par '+esc(a.par):''}</small>
        <small>${pl(k.classes||0,'classe','classes')} · ${pl(k.eleves||0,'élève','élèves')} · ${pl(k.seances||0,'séance','séances')} · ${pl(k.examens||0,'examen','examens')}</small></div>
      <div class="row">${cur?'<button class="btn sm primary" type="button" data-act="arch-exit">Revenir à l’année en cours</button>':S.archive?'':`<button class="btn sm" type="button" data-act="arch-open" data-id="${esc(a.id)}"${dis()}>${icon('eye')}Consulter</button>`}
        <button class="btn sm ghost" type="button" data-act="arch-exp" data-id="${esc(a.id)}">${icon('down')}Exporter</button>
        ${can&&!S.archive?del?`<button class="btn sm danger" type="button" data-act="arch-del" data-id="${esc(a.id)}"${dis()}>Supprimer définitivement</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="adel" data-v="">Annuler</button>`:`<button class="btn sm ghost" type="button" data-act="pg-set" data-k="adel" data-v="${esc(a.id)}">Supprimer</button>`:''}</div></li>`;}).join('');
  return close+`<section class="panel ps-card ps-wide" id="p-archives"><h3>Années archivées</h3>${arcs.length?`<ul class="ps-alist">${rows}</ul>`:'<p class="help">Aucune année archivée pour l’instant. Une année clôturée apparaît ici.</p>'}</section>`;
}
