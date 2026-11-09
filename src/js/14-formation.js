/* ---------- Formation : évaluations pratiques, carnets, préalables, certificats, dossier ENPQ, relevés ----------
   grilles/<id> : une grille d’évaluation pratique { nom, module, points [{ t, crit }], seuil (%), temps (min), essais, autre, enpq, note, maj, par }
     Un point critique manqué fait échouer l’essai ; sinon il est réussi à partir du seuil (et dans le temps limite).
   evaluations/<id> : un essai { grille, nom, eleve, groupe, date, essai, ens, evalNom, coches [bool], score, crit, temps (s), niveau,
     resultat reussi|echec, motif, note, sig { ev { nom, le }, el { nom, le, sur } }, lot (réussite en groupe), le, par }
   certificats/<élève> : { items [{ type, obtenu, expire, num }], maj } ; dossiers-enpq/<élève> : { coches { pièce : date }, envoye, note, maj }
   Réglages (config/ecole.formation) : types de certificats, préalables par module, pièces du dossier ENPQ, frais d’examen,
   niveaux de maîtrise 1 à 4, services incendie. */
const FO_DEF={
  certs:[{id:'ps',nom:'Premiers soins',mois:36,enpq:true},{id:'masque',nom:'Essai d’ajustement du masque',mois:12,enpq:false},{id:'med',nom:'Examen médical',mois:24,enpq:false},{id:'4a',nom:'Permis de conduire classe 4A',mois:0,enpq:false},{id:'embarc',nom:'Carte d’embarcation de plaisance',mois:0,enpq:false}],
  pieces:[{id:'form',nom:'Formulaire d’inscription signé'},{id:'id',nom:'Pièce d’identité vérifiée'},{id:'photo',nom:'Photo récente'}],
  frais:[{nom:'Examens théoriques de l’ENPQ',montant:46000},{nom:'Examen pratique de l’ENPQ',montant:34430}]
};
function foCfg(){
  const c=cfg().formation||{};
  return {certs:Array.isArray(c.certs)?c.certs:FO_DEF.certs,pieces:Array.isArray(c.pieces)?c.pieces:FO_DEF.pieces,frais:Array.isArray(c.frais)?c.frais:FO_DEF.frais,
    alerte:+c.alerte>0?+c.alerte:30,niveaux:c.niveaux===true,prereq:c.prereq&&typeof c.prereq==='object'?c.prereq:{},services:Array.isArray(c.services)?c.services:[]};
}
const FO_NIV=['','1 · Débutant','2 · En progrès','3 · Maîtrisé','4 · Très bonne maîtrise'];
/* Tout lire : l’administration et le personnel ; un compte élève ne reçoit que ses propres documents */
const foFull=()=>S.canAdmin!==false||S.role!=='student';
const foG=()=>(S.data.grilles||[]).slice().sort((a,b)=>(+a.module||99)-(+b.module||99)||collator.compare(a.nom||'',b.nom||''));
const foEvs=()=>S.data.evals||[];
const foEvOf=(eid,gid)=>foEvs().filter(x=>x.eleve===eid&&(!gid||x.grille===gid)).sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.le).localeCompare(String(b.le)));
const foGName=g=>(g.module?'M'+g.module+' · ':'')+(g.nom||'Grille');
/* L’élève affiché ; un compte élève ne lit pas la liste des élèves : sa fiche vient de son compte */
const foMe=()=>byId(S.data.eleves,S.student)||(()=>{const a=myAcct();return a&&a.role==='student'&&a.ref&&a.ref===S.student?Object.assign({},a.fiche||{},{id:a.ref}):null;})();
const foId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
/* Où en est un élève pour une grille : réussie, échouée (essais restants ou épuisés), ou pas encore évaluée */
function foState(eid,g){
  const E=foEvOf(eid,g.id), ok=E.find(x=>x.resultat==='reussi');
  if(ok) return {k:'ok',ev:ok,n:E.length,last:E[E.length-1]};
  if(!E.length) return {k:'none',n:0};
  const max=+g.essais||2;
  return {k:E.length>=max?'out':'ko',ev:E[E.length-1],n:E.length,last:E[E.length-1]};
}
const FO_ST={ok:['ok','Réussie'],ko:['warn','À reprendre'],out:['bad','Essais épuisés'],none:['off','Pas évaluée']};
function foScore(g,coches){
  const P=g.points||[], n=P.length, got=P.filter((p,i)=>coches[i]).length, crit=P.every((p,i)=>!p.crit||coches[i]);
  return {n,got,pct:n?Math.round(got/n*100):0,crit};
}
/* Le résultat d’un essai : critère, seuil, temps */
function foVerdict(g,coches,sec){
  const s=foScore(g,coches), lim=(+g.temps||0)*60, over=lim&&sec>lim, seuil=+g.seuil||70;
  const motif=!s.crit?'Point critique manqué':s.pct<seuil?`Sous le seuil de ${seuil} %`:over?'Temps limite dépassé':'';
  return Object.assign(s,{ok:!motif,motif,over,seuil});
}
/* ---------- Certificats ---------- */
const foCertDoc=eid=>(S.data.certs||{})[eid]||{};
const foCertOf=(eid,type)=>((foCertDoc(eid).items)||[]).find(x=>x.type===type)||null;
function foCertSt(it,at){
  const t=at||todayISO(), soon=iso(addDays(parse(t),foCfg().alerte));
  if(!it||(!it.obtenu&&!it.expire)) return ['off','Manquant'];
  if(it.expire&&it.expire<t) return ['bad','Expiré le '+shortDate(parse(it.expire))];
  if(it.expire&&it.expire<=soon) return ['warn','Expire le '+shortDate(parse(it.expire))];
  return ['ok',it.expire?'Valide jusqu’au '+shortDate(parse(it.expire)):'Valide'];
}
const foCertOk=(eid,type,at)=>{const s=foCertSt(foCertOf(eid,type),at)[0];return s==='ok'||s==='warn';};
/* ---------- Modules réussis (examens) ---------- */
let _foMod=null;
function foModOk(eid,code){
  if(!_foMod||_foMod.r!==S.data.resultats||_foMod.c!==S.data.cours||_foMod.x!==S.data.examens){
    const by={};
    for(const x of allExamItems()){const k=x.c?modKey(x.c):null;if(k==null||!x.past||x.rep)continue;(by[k]=by[k]||[]).push(x);}
    _foMod={r:S.data.resultats,c:S.data.cours,x:S.data.examens,by};
  }
  const L=(_foMod.by[+code]||[]).filter(x=>x.grp===(byId(S.data.eleves,eid)||{}).groupe);
  return !!L.length&&L.every(x=>resOk(x.res[eid]));
}
/* ---------- Préalables : ce qu’il faut avoir réussi avant les séances d’un module ---------- */
const foPre=code=>foCfg().prereq[String(code)]||null;
function foMissing(e,code,date){
  const p=foPre(code);if(!p) return [];
  const out=[];
  for(const gid of p.grilles||[]){const g=byId(S.data.grilles||[],gid);if(g&&foState(e.id,g).k!=='ok')out.push(g.nom);}
  for(const m of p.modules||[]) if(!foModOk(e.id,m)) out.push('module M'+m);
  for(const t of p.certs||[]){const c=foCfg().certs.find(x=>x.id===t);if(c&&!foCertOk(e.id,t,date))out.push(c.nom.toLowerCase());}
  return out;
}
/* Les séances à venir des modules qui ont des préalables, avec les élèves à qui il manque quelque chose */
let _foBl=null;
function foBlocked(days){
  const t=todayISO(), to=iso(addDays(new Date(),days||14));
  if(_foBl&&_foBl.t===t&&_foBl.to===to&&_foBl.c===S.data.cours&&_foBl.r===S.data.resultats&&_foBl.e===S.data.evals&&_foBl.ce===S.data.certs&&_foBl.g===S.data.config&&_foBl.el===S.data.eleves) return _foBl.out;
  const P=foCfg().prereq, out=[];
  if(Object.keys(P).length) for(const s of sessionsBetween(t,to)){
    if(s.kind!=='cours'||s.cancelled) continue;
    const code=modKey(s.c);if(code==null||!P[String(code)]) continue;
    const miss=studentsOf(s.grp).map(e=>({e,m:foMissing(e,code,s.date)})).filter(x=>x.m.length);
    if(miss.length) out.push({s,code,miss});
  }
  _foBl={t,to,c:S.data.cours,r:S.data.resultats,e:S.data.evals,ce:S.data.certs,g:S.data.config,el:S.data.eleves,out};
  return out;
}
/* ---------- Dossier ENPQ ---------- */
let _foN=null;
/* Résultats d’examens par élève ; un compte élève n’a que les siens (mesRes) */
const foNotes=()=>{
  if(!foFull()){const v=Object.values(S.data.mesRes||{}).filter(Boolean);return {[S.student]:{tot:v.length,ok:v.filter(resOk).length,todo:v.filter(resKo).length}};}
  if(!_foN||_foN.r!==S.data.resultats)_foN={r:S.data.resultats,v:studentNotes()};return _foN.v;
};
function foEnpq(e){
  const C=foCfg(), G=foG().filter(g=>g.enpq), d=(S.data.enpq||{})[e.id]||{}, items=[];
  for(const c of C.certs.filter(x=>x.enpq)) items.push({k:'c-'+c.id,l:c.nom,ok:foCertOk(e.id,c.id),detail:foCertSt(foCertOf(e.id,c.id))[1],auto:true});
  if(G.length){const n=G.filter(g=>foState(e.id,g).k==='ok').length;items.push({k:'grilles',l:'Grilles pratiques requises',ok:n===G.length,detail:`${n} sur ${G.length} réussies`,auto:true});}
  const N=foNotes()[e.id]||{tot:0,ok:0,todo:0};
  items.push({k:'exam',l:'Examens de l’école',ok:!N.todo&&!!N.tot,detail:N.tot?(N.todo?pl(N.todo,'examen à reprendre','examens à reprendre'):`${N.ok} réussis`):'Aucun résultat',auto:true});
  const cp=opt('compta'), cpt=!cp?null:foFull()?(S.loaded.compta?cp.entries():null):(permOn('compteEl')?S.data.mesCpt||[]:null);
  if(cpt){const f=cp.fee(e,cpt.filter(x=>x.note!=='ENPQ'));items.push({k:'frais',l:'Frais à jour',ok:f.etat!=='retard',detail:f.etat==='retard'?'paiement en retard':cp.feeStates[f.etat][1],auto:true});}
  for(const p of C.pieces) items.push({k:'p-'+p.id,id:p.id,l:p.nom,ok:!!(d.coches||{})[p.id],detail:(d.coches||{})[p.id]?'reçu le '+shortDate(parse((d.coches||{})[p.id])):'à recevoir',auto:false});
  const miss=items.filter(x=>!x.ok).length;
  return {items,miss,ok:!miss,envoye:d.envoye||'',note:d.note||'',doc:d};
}
/* ---------- Heures suivies par module (présences de l’élève) ---------- */
function foHours(e){
  const by={};
  for(const [k,p] of Object.entries(S.data.presTerm||{})){
    const v=p&&p.statuts&&p.statuts[e.id];if(v!=='P'&&v!=='R') continue;
    const s=findSess(p.date,k);if(!s) continue;
    const m=modKey(s.c);if(m==null) continue;
    by[m]=(by[m]||0)+sHours(s);
  }
  return by;
}

/* ---------- Le menu de la page ---------- */
function foTabs(){
  const G=foG();
  if(S.role==='student'){
    const e=foMe(), open=typeof qbOpenFor==='function'&&e?qbOpenFor(e).filter(x=>!qbDone(x,e.id)).length:0, cb=e?foCfg().certs.filter(c=>foCertSt(foCertOf(e.id,c.id))[0]==='bad').length:0, uns=e?foEvOf(e.id).filter(x=>!(x.sig&&x.sig.el)).length:0;
    return [{k:'carnet',l:'Mon carnet',i:'check',n:uns,nt:uns?pl(uns,'évaluation à signer','évaluations à signer'):''},{k:'blancs',l:'Examens blancs',i:'exam',n:open,bad:!!open,nt:open?pl(open,'examen blanc ouvert','examens blancs ouverts'):''},{k:'train',l:'S’entraîner',i:'target'},
      {k:'certs',l:'Mes certificats',i:'calok',n:cb,bad:!!cb,sec:'Dossier'},{k:'enpq',l:'Mon dossier ENPQ',i:'key'},{k:'releve',l:'Mon relevé',i:'print'}];
  }
  if(S.role==='teacher') return [{k:'eval',l:'Évaluer',i:'check'},{k:'carnet',l:'Carnets',i:'users'},{k:'grilles',l:'Grilles pratiques',i:'clip',n:G.length},{k:'quest',l:'Questions',i:'exam',sec:'Théorie',nt:'Banque de questions'},{k:'blancs',l:'Examens blancs',i:'cal'}];
  const bl=foBlocked(14), nb=new Set(bl.flatMap(b=>b.miss.map(x=>x.e.id))).size;
  const exp=S.data.eleves.filter(e=>foCfg().certs.some(c=>{const s=foCertSt(foCertOf(e.id,c.id))[0];return (s==='bad'||s==='warn')&&!!foCertOf(e.id,c.id);})).length;
  const ready=S.data.eleves.filter(e=>foEnpq(e).ok&&!foEnpq(e).envoye).length;
  return [{k:'dash',l:'Tableau de bord',i:'spark'},
    {k:'eval',l:'Évaluations',i:'check',sec:'Pratique'},{k:'carnet',l:'Carnets',i:'users'},{k:'grilles',l:'Grilles pratiques',i:'clip',n:G.length},
    {k:'quest',l:'Questions',i:'exam',sec:'Théorie',n:(S.data.questions||[]).length,nt:'Banque de questions'},{k:'blancs',l:'Examens blancs',i:'cal'},
    {k:'prereq',l:'Préalables',i:'key',sec:'Dossiers',n:nb,bad:!!nb,nt:nb?pl(nb,'élève sans les préalables d’une séance prochaine','élèves sans les préalables d’une séance prochaine'):''},
    {k:'certs',l:'Certificats',i:'calok',n:exp,bad:!!exp,nt:exp?pl(exp,'élève avec un certificat expiré ou à renouveler','élèves avec un certificat expiré ou à renouveler'):''},
    {k:'enpq',l:'Dossier ENPQ',i:'target',n:ready,nt:ready?pl(ready,'élève prêt à inscrire','élèves prêts à inscrire'):''},{k:'releve',l:'Relevés',i:'print',nt:'Relevés de formation'},
    {k:'serv',l:'Services incendie',i:'teach',sec:'Gestion',n:foCfg().services.length},{k:'regl',l:'Réglages',i:'gear',nt:'Réglages de la formation'}];
}
function formationPage(){
  const tabs=foTabs(), tab=tabs.some(t=>t.k===S.pg.fo)?S.pg.fo:tabs[0].k;
  if(S.role==='student'&&!foMe()) return emptyBox('Aucun élève','Choisissez un élève dans le bandeau pour voir son carnet.');
  const P={dash:foDash,eval:foEvalPage,carnet:foCarnetPage,grilles:foGrillesPage,prereq:foPrePage,certs:foCertsPage,enpq:foEnpqPage,releve:foRelevePage,serv:typeof foServPage==='function'?foServPage:null,regl:foReglPage,
    quest:typeof qbQuestPage==='function'?qbQuestPage:null,blancs:typeof qbBlancsPage==='function'?qbBlancsPage:null,train:typeof qbTrainPage==='function'?qbTrainPage:null}[tab];
  return P?P():'';
}
/* Classe affichée (liste « Classe ») : celle choisie, sinon celle de l’enseignant, sinon la première */
function foGroup(){
  const gs=groups();if(S.pg.fg&&gs.some(g=>g.id===S.pg.fg)) return S.pg.fg;
  if(S.role==='teacher'){const mine=principalClasses(S.teacher);if(mine.length) return mine[0].id;}
  return (byId(S.data.groupes,S.group)||gs[0]||{}).id||'';
}
const foGroupSel=(id,cur)=>`<select id="${id}" aria-label="Classe">${groups().map(g=>`<option value="${esc(g.id)}"${g.id===cur?' selected':''}>${esc(g.nom)}</option>`).join('')}</select>`;
const foTile=(id,v,lbl,val,cls,sub)=>`<button type="button" class="xm-tile" id="${id}" data-act="pg-set" data-k="fo" data-v="${v}" aria-pressed="false"><span class="lbl">${lbl}</span><b class="${cls}">${val}</b><small>${sub}</small></button>`;
const foWhen=x=>x.date?shortDate(parse(x.date)):'';
function foDash(){
  const G=foG(), E=foEvs(), m0=todayISO().slice(0,7), em=E.filter(x=>String(x.date).startsWith(m0)), bl=foBlocked(14), nb=new Set(bl.flatMap(b=>b.miss.map(x=>x.e.id))).size;
  const els=S.data.eleves, ready=els.filter(e=>foEnpq(e).ok), certBad=[];
  for(const e of els) for(const c of foCfg().certs){const it=foCertOf(e.id,c.id), s=foCertSt(it);if(it&&(s[0]==='bad'||s[0]==='warn'))certBad.push({e,c,s});}
  const second=[];
  for(const g of G) for(const e of els){const st=foState(e.id,g);if(st.k==='ko'&&g.autre)second.push({e,g,st});}
  const tiles=`<div class="xm-tiles" role="group" aria-label="Indicateurs de la formation">${foTile('fod-grilles','grilles','Grilles pratiques',G.length,'',pl(G.reduce((n,g)=>n+(g.points||[]).filter(p=>p.crit).length,0),'point critique','points critiques'))}
    ${foTile('fod-eval','eval','Évaluations ce mois',em.length,'',`${em.filter(x=>x.resultat==='reussi').length} réussies · ${em.filter(x=>x.resultat!=='reussi').length} à reprendre`)}
    ${foTile('fod-enpq','enpq','Prêts pour l’ENPQ',ready.length,'',`sur ${els.length} élèves`)}
    ${foTile('fod-pre','prereq','Préalables manquants',nb,nb?'bad':'',nb?'pour les séances des 14 prochains jours':'Tout le monde peut suivre ses séances')}</div>`;
  const todo=[...bl.slice(0,6).map(b=>`<li><span>${esc(b.miss.length>1?pl(b.miss.length,'élève','élèves'):b.miss[0].e.nom)} · <span class="muted sm">${esc('M'+b.code+' '+b.s.c.titre+', '+dayLabel(parse(b.s.date)).toLowerCase()+' · '+gName(b.s.grp))}</span></span><span class="chip bad">Préalables</span></li>`),
    ...certBad.slice(0,6).map(x=>`<li><span>${esc(x.e.nom)} · <span class="muted sm">${esc(x.c.nom)}</span></span><span class="chip ${x.s[0]}">${esc(x.s[1])}</span></li>`),
    ...second.slice(0,6).map(x=>`<li><span>${esc(x.e.nom)} · <span class="muted sm">${esc(x.g.nom)} : deuxième essai, avec un autre évaluateur</span></span><span class="chip warn">À reprendre</span></li>`)];
  const last=E.slice().sort((a,b)=>String(b.le||b.date).localeCompare(String(a.le||a.date))).slice(0,8);
  return tiles+`<div class="two"><section class="panel" id="fod-todo"><h2>À surveiller</h2>${todo.length?`<ul class="plist">${todo.join('')}</ul>`:'<p class="help">Rien à signaler : préalables, certificats et reprises sont à jour.</p>'}</section>
    <section class="panel" id="fod-last"><h2>Dernières évaluations</h2>${last.length?`<ul class="plist">${last.map(x=>`<li><span><button class="link" type="button" data-act="fo-view" data-id="${esc(x.id)}">${esc((byId(S.data.eleves,x.eleve)||{}).nom||'Élève')}</button><span class="muted sm"> · ${esc(x.nom||'')} · ${esc(foWhen(x))}</span></span><span class="chip ${x.resultat==='reussi'?'ok':'bad'}">${x.resultat==='reussi'?'Réussie':'Échec'}</span></li>`).join('')}</ul>`:'<p class="help">Aucune évaluation pour l’instant.</p>'}</section></div>`;
}
/* ---------- Grilles pratiques ---------- */
function foGrillesPage(){
  const G=foG(), adm=isAdmin()&&S.conn==='shared', st=S.data.eleves;
  const tb=`<div class="toolbar"><p class="summary u-m0"><span><b>${G.length}</b>${G.length>1?'grilles':'grille'}</span><span><b>${G.filter(g=>g.enpq).length}</b>requises pour l’ENPQ</span></p><span class="grow"></span>${adm?`<button class="btn primary" type="button" id="fo-g-new" data-act="fo-grille">${icon('plus')}Nouvelle grille</button>`:''}</div>`;
  if(!G.length) return tb+emptyBox('Aucune grille','Une grille décrit une manœuvre : ses étapes, ses points critiques, le seuil de réussite et le temps limite. L’instructeur la remplit sur la tablette pendant l’exercice.');
  const rows=G.map(g=>{const P=g.points||[], ok=st.filter(e=>foState(e.id,g).k==='ok').length;
    return xRow('xm-fg',`data-act="fo-grille" data-id="${esc(g.id)}"`,`<div class="xm-t"><b>${esc(g.nom)}</b><small>${esc(g.module?modLbl(g.module):'Sans module')}</small></div>
      <span class="xm-m">${pl(P.length,'point','points')} · ${P.filter(p=>p.crit).length} critiques</span><span class="xm-m">${esc(String(+g.seuil||70))} %${+g.temps?` · ${esc(String(g.temps))} min`:''}</span><span class="xm-m">${ok} sur ${st.length}</span>
      <div class="xm-end">${g.enpq?'<span class="chip info">ENPQ</span>':''}${g.autre?'<span class="chip off">2ᵉ essai : autre évaluateur</span>':''}</div>`,g.nom);}).join('');
  return tb+xList('xm-fg',[['Grille'],['Points'],['Seuil et temps'],['Réussie par'],['','r',1]],rows);
}
function foGrilleDrawer(d){
  const g=d.id?byId(S.data.grilles||[],d.id):null, x=g||{seuil:70,essais:2,autre:true,points:[]}, adm=isAdmin()&&S.conn==='shared';
  if(d.id&&!g) return goneHTML('Grille');
  const pts=(x.points||[]).map(p=>(p.crit?'! ':'')+p.t).join('\n');
  if(!adm){
    return dTop('Grille pratique',esc(x.nom),esc(x.module?modLbl(x.module):''))+`<div class="dr-body"><ol class="fo-pts">${(x.points||[]).map(p=>`<li>${esc(p.t)}${p.crit?' <span class="chip bad">Critique</span>':''}</li>`).join('')}</ol>
      <p class="help">Réussite à partir de ${esc(String(+x.seuil||70))} %, sans point critique manqué${+x.temps?`, en ${esc(String(x.temps))} min au plus`:''}. ${pl(+x.essais||2,'essai permis','essais permis')}.</p>${x.note?`<p>${esc(x.note)}</p>`:''}</div>`;
  }
  return dTop(g?'Modifier la grille':'Nouvelle grille',g?esc(g.nom):'Grille d’évaluation pratique')+`<form class="dr-body" data-form="fo-grille" novalidate>
    <label class="field"><span>Nom de la manœuvre</span><input id="fg-nom" maxlength="90" value="${esc(x.nom||'')}" placeholder="Ex. Dresser une échelle à coulisse de 24 pi" autocomplete="off"></label>
    <label class="field"><span>Module</span><select id="fg-mod"><option value="">Sans module</option>${comps().map(k=>`<option value="${esc(k.code)}"${+x.module===+k.code?' selected':''}>M${esc(k.code)} · ${esc(k.nom)}</option>`).join('')}</select></label>
    <label class="field"><span>Étapes, une par ligne</span><textarea id="fg-pts" rows="9" placeholder="! Vérifier l’état de l’échelle&#10;Placer le pied à la bonne distance">${esc(pts)}</textarea><small class="help">Un point d’exclamation au début marque un point critique : manqué, l’essai échoue.</small></label>
    <div class="grid2"><label class="field"><span>Seuil de réussite (%)</span><input id="fg-seuil" type="number" min="1" max="100" value="${esc(String(+x.seuil||70))}"></label><label class="field"><span>Temps limite (min, 0 = aucun)</span><input id="fg-temps" type="number" min="0" max="240" step="0.5" value="${esc(String(+x.temps||0))}"></label></div>
    <div class="grid2"><label class="field"><span>Essais permis</span><input id="fg-essais" type="number" min="1" max="5" value="${esc(String(+x.essais||2))}"></label><span></span></div>
    <label class="ck"><input type="checkbox" id="fg-autre"${x.autre?' checked':''}> Le deuxième essai se fait avec un autre évaluateur</label>
    <label class="ck"><input type="checkbox" id="fg-enpq"${x.enpq?' checked':''}> Requise pour l’examen de l’ENPQ</label>
    <label class="field"><span>Consignes (facultatif)</span><textarea id="fg-note" rows="2">${esc(x.note||'')}</textarea></label>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    <div class="dr-foot"><button class="btn primary" type="submit"${dis()}>Enregistrer</button>${g?(d.ask?`<button class="btn danger" type="button" id="fg-del-yes" data-act="fo-g-del-yes">Supprimer la grille</button><button class="btn ghost" type="button" data-act="fo-ask-no">Annuler</button>`:`<button class="btn ghost" type="button" id="fg-del" data-act="fo-ask">Supprimer</button>`):''}</div></form>`;
}
async function foSaveGrille(){
  const d=S.dr, v=id=>String(($('#'+id)||{}).value||'').trim();
  const nom=v('fg-nom'), points=v('fg-pts').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>/^[!*]/.test(l)?{t:l.replace(/^[!*]\s*/,''),crit:true}:{t:l,crit:false}).filter(p=>p.t);
  if(!nom){d.err='Indiquez le nom de la manœuvre.';renderDrawer();return;}
  if(!points.length){d.err='Inscrivez au moins une étape.';renderDrawer();return;}
  const doc={nom,module:v('fg-mod')?+v('fg-mod'):null,points,seuil:Math.min(100,Math.max(1,Math.round(+v('fg-seuil')||70))),temps:Math.max(0,+v('fg-temps')||0),essais:Math.min(5,Math.max(1,Math.round(+v('fg-essais')||2))),
    autre:!!($('#fg-autre')||{}).checked,enpq:!!($('#fg-enpq')||{}).checked,note:v('fg-note'),maj:new Date().toISOString(),par:whoAmI()};
  const id=d.id||foId('g'), old=d.id?byId(S.data.grilles,d.id):null;
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('grilles').doc(id).set(Object.assign({},old&&old.exemple?{exemple:true}:{},doc)),d.id?'Grille enregistrée':'Grille ajoutée');
  S.busy=false;if(ok){logEv('formation',(d.id?'a modifié':'a créé')+' la grille « '+nom+' »');if(S.dr===d)S.dr=null;}render();
}
/* ---------- Évaluer ---------- */
function foEvalPage(){
  const G=foG(), gid=foGroup(), gr=G.find(g=>g.id===S.pg.fgr)||G[0], can=S.conn==='shared', sel=new Set(S.pg.fsel||[]);
  if(!G.length) return emptyBox('Aucune grille pratique',isAdmin()?'Créez d’abord les grilles dans « Grilles pratiques ».':'L’administration prépare les grilles d’évaluation pratique.');
  const els=studentsOf(gid);
  const tb=`<div class="toolbar">${foGroupSel('fo-g',gid)}<select id="fo-gr" aria-label="Grille">${G.map(g=>`<option value="${esc(g.id)}"${g===gr?' selected':''}>${esc(foGName(g))}</option>`).join('')}</select><span class="grow"></span>
    ${can?`<button class="btn" type="button" id="fo-grp" data-act="fo-grp"${sel.size?'':' disabled'}>${icon('users')}Réussite en groupe${sel.size?' ('+sel.size+')':''}</button>`:''}</div>`;
  const rows=els.map(e=>{const st=foState(e.id,gr), ch=FO_ST[st.k], L=st.last;
    return `<li class="fo-er${st.k==='ok'?' done':''}"><label class="fo-ck">${can&&st.k!=='ok'?`<input type="checkbox" data-act="fo-sel" data-id="${esc(e.id)}"${sel.has(e.id)?' checked':''} aria-label="Cocher ${esc(e.nom)}">`:'<span></span>'}</label><span class="st-num sm">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span>
      <span class="nm">${esc(e.nom)}<small class="muted">${L?` · essai ${L.essai||st.n} : ${esc(String(L.score))} % le ${esc(foWhen(L))}`:''}</small></span><span class="chip ${ch[0]}">${ch[1]}</span>
      ${L?`<button class="btn sm ghost" type="button" data-act="fo-view" data-id="${esc(L.id)}">Voir</button>`:''}${can&&st.k!=='ok'?`<button class="btn sm" type="button" id="fo-ev-${esc(e.id)}" data-act="fo-sheet" data-el="${esc(e.id)}" data-gr="${esc(gr.id)}">${st.n?'Reprendre':'Évaluer'}</button>`:''}</li>`;}).join('');
  const recent=foEvs().filter(x=>x.groupe===gid).sort((a,b)=>String(b.le||b.date).localeCompare(String(a.le||a.date))).slice(0,12);
  const rr=recent.map(x=>xRow('xm-fe',`data-act="fo-view" data-id="${esc(x.id)}"`,`<span class="xm-m">${esc(foWhen(x))}</span><div class="xm-t"><b>${esc((byId(S.data.eleves,x.eleve)||{}).nom||'Élève')}</b><small>${esc(x.nom||'')}</small></div>
    <span class="xm-m">Essai ${esc(String(x.essai||1))} · ${esc(String(x.score))} %</span><span class="xm-m">${esc(x.evalNom||'')}</span><div class="xm-end"><span class="chip ${x.resultat==='reussi'?'ok':'bad'}">${x.resultat==='reussi'?'Réussie':esc(x.motif||'Échec')}</span>${x.sig&&x.sig.el?'':'<span class="chip off">Non signée par l’élève</span>'}</div>`,x.nom||'')).join('');
  return tb+`<section class="panel"><h2>${esc(gr.nom)}<small class="muted"> · ${esc(gName(gid))}</small></h2>${els.length?`<ul class="fo-elist">${rows}</ul>`:'<p class="help">Aucun élève dans cette classe.</p>'}
      <p class="help u-mt8">${pl((gr.points||[]).length,'étape','étapes')}, dont ${(gr.points||[]).filter(p=>p.crit).length} critiques · réussite à ${esc(String(+gr.seuil||70))} %${+gr.temps?` en ${esc(String(gr.temps))} min`:''} · ${pl(+gr.essais||2,'essai','essais')}.${can?' Cochez des élèves pour inscrire une réussite à tout un groupe.':''}</p></section>
    <h2 class="sec-h">Dernières évaluations de la classe</h2>${recent.length?xList('xm-fe',[['Date','',1],['Élève'],['Essai et note'],['Évaluateur'],['','r',1]],rr):'<section class="panel"><p class="help">Aucune évaluation pour cette classe.</p></section>'}`;
}
/* L’évaluateur proposé : l’enseignant connecté, sinon le chargé du module, sinon le premier */
const foDefEval=g=>S.role==='teacher'&&S.teacher?S.teacher:((comps().find(k=>+k.code===+g.module)||{}).charge||(teachers()[0]||{}).id||'');
function foSheetDrawer(d){
  const g=byId(S.data.grilles||[],d.gr), e=byId(S.data.eleves,d.el);
  if(!g||!e) return goneHTML('Évaluation');
  const prev=foEvOf(e.id,g.id), essai=prev.length+1, max=+g.essais||2, first=prev[0];
  if(!d.coches) d.coches=(g.points||[]).map(()=>false);
  if(d.ens==null) d.ens=foDefEval(g);
  const v=foVerdict(g,d.coches,foSec(d)), same=g.autre&&prev.length&&prev.some(x=>x.ens&&x.ens===d.ens);
  const pts=(g.points||[]).map((p,i)=>`<li><label class="ck fo-pt${p.crit?' crit':''}"><input type="checkbox" data-fo-pt="${i}"${d.coches[i]?' checked':''}> <span>${esc(p.t)}</span>${p.crit?'<span class="chip bad">Critique</span>':''}</label></li>`).join('');
  const lim=+g.temps?`Temps limite : ${esc(String(g.temps))} min`:'Sans temps limite';
  return dTop('Évaluation pratique',esc(g.nom),esc(`${e.nom} · ${gName(e.groupe)} · essai ${essai} sur ${max}`))+`<form class="dr-body" data-form="fo-sheet" novalidate>
    ${essai>max?`<div class="notice warn"><p>Les ${max} essais permis sont faits. Cet essai s’ajoute au dossier comme une reprise.</p></div>`:''}
    ${same?`<div class="notice warn" id="fo-same"><p>Cette grille demande un autre évaluateur pour le deuxième essai : ${esc(tName(first.ens))} a fait le premier.</p></div>`:''}
    <div class="fo-chrono"><span class="fo-time${v.over?' bad-t':''}" id="fo-chrono">${foClock(foSec(d))}</span><button class="btn sm" type="button" id="fo-run" data-act="fo-run">${d.run?'Arrêter':foSec(d)?'Reprendre':'Démarrer'}</button>${foSec(d)&&!d.run?'<button class="btn sm ghost" type="button" data-act="fo-zero">Remettre à zéro</button>':''}<small class="muted">${lim}</small></div>
    <ol class="fo-pts">${pts}</ol>
    <div class="row"><button class="btn sm ghost" type="button" data-act="fo-allpts">Tout cocher</button></div>
    <p class="fo-sum" id="fo-score"><b>${v.got} / ${v.n}</b> · ${v.pct} % · ${v.motif?`<span class="bad-t">${esc(v.motif)}</span>`:'<span class="ok-t">réussite</span>'}</p>
    ${foCfg().niveaux?`<label class="field"><span>Niveau de maîtrise</span><select id="fo-niv">${FO_NIV.map((l,i)=>i?`<option value="${i}"${+d.niv===i?' selected':''}>${l}</option>`:'<option value="">—</option>').join('')}</select></label>`:''}
    <div class="grid2"><label class="field"><span>Évaluateur</span><select id="fo-ens" data-fo="ens">${teachers().map(t=>`<option value="${esc(t.id)}"${t.id===d.ens?' selected':''}>${esc(t.nom)}</option>`).join('')}</select></label><label class="field"><span>Date</span><input type="date" id="fo-date" value="${esc(d.date||todayISO())}"></label></div>
    <label class="field"><span>Commentaire</span><textarea id="fo-note" rows="2" placeholder="Ce qui est à retravailler">${esc(d.note||'')}</textarea></label>
    <fieldset class="fo-sig"><legend>Signatures</legend><label class="ck"><input type="checkbox" id="fo-sig-ev"${d.sigEv?' checked':''}> Je confirme ce résultat (évaluateur)</label><label class="ck"><input type="checkbox" id="fo-sig-el"${d.sigEl?' checked':''}> ${esc(e.nom)} a pris connaissance du résultat et signe sur cet appareil</label><small class="help">L’élève peut aussi signer plus tard, dans son carnet.</small></fieldset>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    <div class="dr-foot"><button class="btn primary" type="submit" id="fo-save"${dis()}>Enregistrer l’évaluation</button></div></form>`;
}
/* Chronomètre : il tourne même si le tiroir se redessine */
const foSec=d=>Math.round((d.acc||0)+(d.run?(Date.now()-d.t0)/1000:0));
const foClock=s=>`${pad(Math.floor(s/60))}:${pad(s%60)}`;
let foTimer=null;
function foTick(){
  const d=S.dr;if(!d||d.kind!=='fo'||d.mode!=='sheet'||!d.run){clearInterval(foTimer);foTimer=null;return;}
  const el=$('#fo-chrono');if(!el) return;
  const s=foSec(d), g=byId(S.data.grilles||[],d.gr), over=g&&+g.temps&&s>g.temps*60;
  el.textContent=foClock(s);el.classList.toggle('bad-t',!!over);
}
async function foSaveSheet(){
  const d=S.dr, g=byId(S.data.grilles||[],d.gr), e=byId(S.data.eleves,d.el);if(!g||!e) return;
  d.note=String(($('#fo-note')||{}).value||'').trim();d.date=($('#fo-date')||{}).value||todayISO();d.sigEv=!!($('#fo-sig-ev')||{}).checked;d.sigEl=!!($('#fo-sig-el')||{}).checked;
  const niv=$('#fo-niv')?+$('#fo-niv').value||null:null;
  if(!d.ens){d.err='Choisissez l’évaluateur.';renderDrawer();return;}
  const prev=foEvOf(e.id,g.id);
  if(g.autre&&prev.length&&prev.some(x=>x.ens===d.ens)){d.err='Choisissez un autre évaluateur pour cet essai.';renderDrawer();return;}
  if(!d.sigEv){d.err='Cochez la confirmation de l’évaluateur pour signer l’évaluation.';renderDrawer();return;}
  if(d.run){d.acc=foSec(d);d.run=false;}
  const sec=foSec(d), v=foVerdict(g,d.coches,sec), now=new Date().toISOString(), en=tName(d.ens);
  const doc={grille:g.id,nom:g.nom,module:g.module||null,eleve:e.id,groupe:e.groupe||'',date:d.date,essai:prev.length+1,ens:d.ens,evalNom:en,coches:d.coches.slice(),score:v.pct,crit:v.crit,temps:sec,niveau:niv,
    resultat:v.ok?'reussi':'echec',motif:v.motif,note:d.note,sig:{ev:{nom:en,le:now},el:d.sigEl?{nom:e.nom,le:now,sur:'appareil de l’évaluateur'}:null},le:now,par:whoAmI()};
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('evaluations').doc(foId('v')).set(doc),v.ok?`${e.nom} : réussite enregistrée`:`${e.nom} : échec enregistré (${v.motif.toLowerCase()})`);
  S.busy=false;if(ok){logEv('formation',`a évalué ${e.nom} : ${g.nom} (${v.ok?'réussie':'échec'})`);if(S.dr===d)S.dr=null;}render();
}
/* Réussite en groupe : un essai réussi, tous les points cochés, pour chaque élève choisi */
function foGrpDrawer(d){
  const g=byId(S.data.grilles||[],d.gr), E=(d.ids||[]).map(id=>byId(S.data.eleves,id)).filter(Boolean);
  if(!g||!E.length) return goneHTML('Évaluation');
  if(d.ens==null) d.ens=foDefEval(g);
  return dTop('Réussite en groupe',esc(g.nom),pl(E.length,'élève','élèves'))+`<form class="dr-body" data-form="fo-grp" novalidate>
    <p>Chaque élève reçoit un essai réussi, avec toutes les étapes cochées et la signature de l’évaluateur.</p><ul class="plist">${E.map(e=>`<li><span>${esc(e.nom)}</span><span class="muted sm">essai ${foEvOf(e.id,g.id).length+1}</span></li>`).join('')}</ul>
    <div class="grid2"><label class="field"><span>Évaluateur</span><select id="fo-ens" data-fo="ens">${teachers().map(t=>`<option value="${esc(t.id)}"${t.id===d.ens?' selected':''}>${esc(t.nom)}</option>`).join('')}</select></label><label class="field"><span>Date</span><input type="date" id="fo-date" value="${esc(todayISO())}"></label></div>
    <label class="field"><span>Commentaire (facultatif)</span><textarea id="fo-note" rows="2"></textarea></label>
    <label class="ck"><input type="checkbox" id="fo-sig-ev"> Je confirme que ces élèves ont réussi la manœuvre (évaluateur)</label>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    <div class="dr-foot"><button class="btn primary" type="submit" id="fo-grp-save"${dis()}>Inscrire ${pl(E.length,'réussite','réussites')}</button></div></form>`;
}
async function foSaveGrp(){
  const d=S.dr, g=byId(S.data.grilles||[],d.gr), E=(d.ids||[]).map(id=>byId(S.data.eleves,id)).filter(Boolean);if(!g||!E.length) return;
  if(!d.ens){d.err='Choisissez l’évaluateur.';renderDrawer();return;}
  if(!($('#fo-sig-ev')||{}).checked){d.err='Cochez la confirmation de l’évaluateur.';renderDrawer();return;}
  const date=($('#fo-date')||{}).value||todayISO(), note=String(($('#fo-note')||{}).value||'').trim(), now=new Date().toISOString(), en=tName(d.ens), lot=foId('l');
  const fns=E.map(e=>()=>col('evaluations').doc(foId('v')).set({grille:g.id,nom:g.nom,module:g.module||null,eleve:e.id,groupe:e.groupe||'',date,essai:foEvOf(e.id,g.id).length+1,ens:d.ens,evalNom:en,coches:(g.points||[]).map(()=>true),score:100,crit:true,temps:0,niveau:null,
    resultat:'reussi',motif:'',note,sig:{ev:{nom:en,le:now},el:null},lot,le:now,par:whoAmI()}));
  S.dr=null;S.pg.fsel=[];
  if(await runAll(fns,pl(E.length,'réussite inscrite','réussites inscrites'))) logEv('formation',`a inscrit une réussite en groupe : ${g.nom} (${pl(E.length,'élève','élèves')})`);
}
function foViewDrawer(d){
  const x=foEvs().find(v=>v.id===d.id);if(!x) return goneHTML('Évaluation');
  const g=byId(S.data.grilles||[],x.grille)||{points:[]}, e=byId(S.data.eleves,x.eleve)||(x.eleve===S.student&&foMe())||{nom:'Élève'}, me=S.role==='student'&&x.eleve===S.student, sig=x.sig||{};
  const pts=(g.points||[]).map((p,i)=>`<li class="${(x.coches||[])[i]?'ok-t':'bad-t'}">${(x.coches||[])[i]?'✓':'✗'} ${esc(p.t)}${p.crit?' <span class="chip bad">Critique</span>':''}</li>`).join('');
  return dTop('Évaluation pratique',esc(x.nom||g.nom||''),esc(`${e.nom} · essai ${x.essai||1} · ${longDate(parse(x.date))}`))+`<div class="dr-body">
    <p class="fo-sum"><span class="chip ${x.resultat==='reussi'?'ok':'bad'}">${x.resultat==='reussi'?'Réussie':'Échec'}</span> <b>${esc(String(x.score))} %</b>${x.temps?` · ${foClock(x.temps)}`:''}${x.motif?` · ${esc(x.motif)}`:''}${x.niveau?` · niveau ${esc(FO_NIV[x.niveau])}`:''}</p>
    ${pts?`<ol class="fo-pts fo-done">${pts}</ol>`:''}${x.note?`<p><b>Commentaire :</b> ${esc(x.note)}</p>`:''}${x.lot?'<p class="help">Inscrite en groupe.</p>':''}
    <h3 class="sb-h3">Signatures</h3><ul class="plist"><li><span>Évaluateur : ${esc((sig.ev&&sig.ev.nom)||x.evalNom||'')}</span><span class="muted sm">${sig.ev?esc(shortDate(new Date(sig.ev.le))):'—'}</span></li>
      <li><span>Élève : ${esc(e.nom)}</span><span class="muted sm">${sig.el?'signé le '+esc(shortDate(new Date(sig.el.le))):'<span class="chip off">Pas encore signée</span>'}</span></li></ul>
    ${me&&!sig.el&&S.conn==='shared'?`<div class="row u-mt10"><button class="btn primary" type="button" id="fo-sign" data-act="fo-sign" data-id="${esc(x.id)}">Je signe : j’ai pris connaissance du résultat</button></div>`:''}
    ${isAdmin()&&S.conn==='shared'?`<div class="row u-mt14">${d.ask?`<button class="btn danger" type="button" id="fo-ev-del-yes" data-act="fo-ev-del-yes" data-id="${esc(x.id)}">Supprimer cette évaluation</button><button class="btn ghost" type="button" data-act="fo-ask-no">Annuler</button>`:`<button class="btn ghost sm" type="button" data-act="fo-ask">Supprimer</button>`}</div>`:''}</div>`;
}
/* ---------- Carnets ---------- */
function foCarnetPage(){
  if(S.role==='student') return foMyCarnet(foMe());
  const G=foG(), gid=foGroup(), els=studentsOf(gid), niv=foCfg().niveaux;
  const tb=`<div class="toolbar">${foGroupSel('fo-g',gid)}<span class="grow"></span><span class="muted sm">✓ réussie · ✗ à reprendre · ✗✗ essais épuisés · · pas évaluée</span></div>`;
  if(!G.length) return tb+emptyBox('Aucune grille','Les carnets se remplissent avec les évaluations pratiques.');
  const cell=(e,g,i)=>{const st=foState(e.id,g), t=st.k==='ok'?(niv&&st.ev.niveau?st.ev.niveau:'✓'):st.k==='ko'?'✗':st.k==='out'?'✗✗':'·';
    return `<td class="fo-c ${st.k}"><button type="button" class="fo-cb" data-act="fo-cell" data-el="${esc(e.id)}" data-gr="${esc(g.id)}" title="${esc(`${e.nom} · ${g.nom} : ${FO_ST[st.k][1]}${st.ev?' le '+foWhen(st.ev):''}`)}">${t}</button></td>`;};
  const rows=els.map(e=>{const n=G.filter(g=>foState(e.id,g).k==='ok').length, P=foEnpq(e);
    return `<tr><th scope="row">${esc(e.nom)}</th>${G.map((g,i)=>cell(e,g,i)).join('')}<td class="num"><b>${n}</b>/${G.length}</td><td>${P.envoye?'<span class="chip info">Inscrit</span>':P.ok?'<span class="chip ok">Prêt</span>':`<span class="chip off">${pl(P.miss,'manque','manques')}</span>`}</td></tr>`;}).join('');
  return tb+`<div class="tbl-wrap"><table class="tbl fo-mat" id="fo-mat"><thead><tr><th>Élève</th>${G.map((g,i)=>`<th class="fo-gh" title="${esc(foGName(g))}">${i+1}</th>`).join('')}<th class="num">Réussies</th><th>ENPQ</th></tr></thead><tbody>${rows}</tbody></table></div>
    <ol class="fo-leg">${G.map(g=>`<li>${esc(foGName(g))}${g.enpq?' <span class="chip info">ENPQ</span>':''}</li>`).join('')}</ol>`;
}
function foMyCarnet(e){
  const G=foG(), done=G.filter(g=>foState(e.id,g).k==='ok').length, P=foEnpq(e), uns=foEvOf(e.id).filter(x=>!(x.sig&&x.sig.el));
  const li=g=>{const st=foState(e.id,g), ch=FO_ST[st.k];return `<li><span>${esc(foGName(g))}${st.ev?`<span class="muted sm"> · ${st.k==='ok'?'réussie le '+esc(foWhen(st.ev))+' avec '+esc(st.ev.evalNom||''):pl(st.n,'essai','essais')}</span>`:''}</span><span class="chip ${ch[0]}">${ch[1]}</span>${st.last?`<button class="btn sm ghost" type="button" data-act="fo-view" data-id="${esc(st.last.id)}">Voir</button>`:''}</li>`;};
  return `<div class="xm-tiles" role="group" aria-label="Mon carnet"><div class="xm-tile"><span class="lbl">Grilles réussies</span><b>${done} / ${G.length}</b><small><span class="fo-bar"><i style="width:${G.length?Math.round(done/G.length*100):0}%"></i></span></small></div>
    <div class="xm-tile"><span class="lbl">Examen de l’ENPQ</span><b class="${P.ok?'ok-t':''}">${P.envoye?'Inscrit':P.ok?'Prêt':pl(P.miss,'élément manque','éléments manquent')}</b><small>${P.ok?'Votre dossier est complet.':'Voir « Mon dossier ENPQ ».'}</small></div>
    <div class="xm-tile"><span class="lbl">À signer</span><b class="${uns.length?'warn':''}">${uns.length}</b><small>${uns.length?'évaluations à confirmer':'Tout est signé'}</small></div></div>
    ${uns.length?`<div class="notice warn" id="fo-tosign"><p>${pl(uns.length,'évaluation attend votre signature','évaluations attendent votre signature')} : ouvrez-la et signez pour confirmer que vous en avez pris connaissance.</p></div>`:''}
    <section class="panel" id="fo-mycarnet"><h2>Mon carnet de compétences</h2>${G.length?`<ul class="plist">${G.map(li).join('')}</ul>`:'<p class="help">Aucune grille pour l’instant.</p>'}</section>`;
}
/* ---------- Préalables ---------- */
function foPrePage(){
  const P=foCfg().prereq, adm=isAdmin()&&S.conn==='shared', bl=foBlocked(14);
  const chips=p=>[...(p.grilles||[]).map(id=>(byId(S.data.grilles||[],id)||{}).nom).filter(Boolean),...(p.modules||[]).map(m=>'M'+m),...(p.certs||[]).map(t=>(foCfg().certs.find(c=>c.id===t)||{}).nom).filter(Boolean)].map(t=>`<span class="chip off">${esc(t)}</span>`).join(' ');
  const mods=comps().map(k=>{const p=P[String(k.code)];return `<li><span><b>M${esc(k.code)}</b> ${esc(k.nom)}<span class="fo-req"> ${p?chips(p)||'<span class="muted sm">aucun</span>':'<span class="muted sm">aucun préalable</span>'}</span></span>${adm?`<button class="btn sm ghost" type="button" id="fo-pre-${esc(k.code)}" data-act="fo-pre" data-v="${esc(k.code)}">Modifier</button>`:''}</li>`;}).join('');
  const up=bl.map(b=>`<li><div><b>${esc('M'+b.code+' '+b.s.c.titre)}</b><span class="muted sm"> · ${esc(dayLabel(parse(b.s.date)).toLowerCase())} · ${esc(gName(b.s.grp))}</span><ul class="fo-miss">${b.miss.map(x=>`<li>${esc(x.e.nom)} : <span class="bad-t">${esc(x.m.join(', '))}</span></li>`).join('')}</ul></div><span class="chip bad">${pl(b.miss.length,'élève','élèves')}</span></li>`).join('');
  return `<div class="two"><section class="panel" id="fo-pre-up"><h2>Séances des 14 prochains jours</h2>${up?`<ul class="plist">${up}</ul>`:'<p class="help">Tous les élèves ont les préalables de leurs prochaines séances.</p>'}<p class="help u-mt8">L’instructeur voit aussi l’avertissement en prenant les présences de la séance.</p></section>
    <section class="panel" id="fo-pre-mods"><h2>Préalables par module</h2><p class="help">Ce qu’un élève doit avoir réussi avant de suivre les séances du module : des grilles pratiques, d’autres modules, un certificat valide le jour de la séance.</p><ul class="plist">${mods}</ul></section></div>`;
}
function foPreDrawer(d){
  const k=comps().find(x=>+x.code===+d.code);if(!k) return goneHTML('Module');
  const p=foPre(d.code)||{}, has=(a,v)=>(a||[]).map(String).includes(String(v));
  return dTop('Préalables',`M${esc(k.code)} · ${esc(k.nom)}`,'Avant de suivre les séances de ce module')+`<form class="dr-body" data-form="fo-pre" data-code="${esc(k.code)}" novalidate>
    <h3 class="sb-h3">Grilles pratiques réussies</h3><div class="ck-grid">${foG().map(g=>`<label class="ck"><input type="checkbox" name="pg" value="${esc(g.id)}"${has(p.grilles,g.id)?' checked':''}> ${esc(foGName(g))}</label>`).join('')||'<p class="help">Aucune grille.</p>'}</div>
    <h3 class="sb-h3">Modules réussis</h3><div class="ck-grid">${comps().filter(x=>+x.code!==+k.code).map(x=>`<label class="ck"><input type="checkbox" name="pm" value="${esc(x.code)}"${has(p.modules,x.code)?' checked':''}> M${esc(x.code)} ${esc(x.nom)}</label>`).join('')}</div>
    <h3 class="sb-h3">Certificats valides</h3><div class="ck-grid">${foCfg().certs.map(c=>`<label class="ck"><input type="checkbox" name="pc" value="${esc(c.id)}"${has(p.certs,c.id)?' checked':''}> ${esc(c.nom)}</label>`).join('')}</div>
    <div class="dr-foot"><button class="btn primary" type="submit" id="fo-pre-save"${dis()}>Enregistrer</button></div></form>`;
}
async function foSavePre(f){
  const code=f.dataset.code, vals=n=>[...f.querySelectorAll(`input[name=${n}]:checked`)].map(i=>i.value);
  const p={grilles:vals('pg'),modules:vals('pm').map(Number),certs:vals('pc')}, c=configDoc(), fo=Object.assign({},c.formation||{}), pr=Object.assign({},fo.prereq||{});
  if(p.grilles.length||p.modules.length||p.certs.length) pr[code]=p;else delete pr[code];
  fo.prereq=pr;c.formation=fo;
  S.busy=true;renderDrawer();const ok=await saveConfig(c,'Préalables enregistrés');S.busy=false;if(ok&&S.dr&&S.dr.code===code)S.dr=null;render();
}
/* À la prise des présences : les élèves à qui il manque un préalable pour cette séance */
function foAttWarn(s){
  const code=modKey(s.c);if(code==null||!foPre(code)) return '';
  const miss=studentsOf(s.c.groupe).map(e=>({e,m:foMissing(e,code,s.date)})).filter(x=>x.m.length);
  return miss.length?`<div class="notice bad" id="fo-att-pre"><p><b>Préalables manquants</b> pour cette séance :</p><ul>${miss.map(x=>`<li>${esc(x.e.nom)} : ${esc(x.m.join(', '))}</li>`).join('')}</ul></div>`:'';
}
/* ---------- Certificats ---------- */
function foCertsPage(){
  if(S.role==='student') return foMyCerts(foMe());
  const C=foCfg().certs, gid=foGroup(), els=studentsOf(gid), adm=isAdmin()&&S.conn==='shared';
  const tb=`<div class="toolbar">${foGroupSel('fo-g',gid)}<span class="grow"></span><span class="muted sm">Alerte ${esc(String(foCfg().alerte))} jours avant l’expiration</span></div>`;
  const rows=els.map(e=>`<tr${adm?` class="row-link" data-act="fo-certs" data-id="${esc(e.id)}"`:''}><th scope="row">${adm?`<button class="link" type="button" data-act="fo-certs" data-id="${esc(e.id)}">${esc(e.nom)}</button>`:esc(e.nom)}</th>${C.map(c=>{const s=foCertSt(foCertOf(e.id,c.id));return `<td><span class="chip ${s[0]}">${esc(s[1])}</span></td>`;}).join('')}</tr>`).join('');
  return tb+(els.length?`<div class="tbl-wrap"><table class="tbl" id="fo-certs-t"><thead><tr><th>Élève</th>${C.map(c=>`<th>${esc(c.nom)}${c.enpq?' <span class="chip info">ENPQ</span>':''}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`:emptyBox('Aucun élève','Choisissez une autre classe.'));
}
function foMyCerts(e){
  const C=foCfg().certs;
  return `<section class="panel" id="fo-mycerts"><h2>Mes certificats</h2><ul class="plist">${C.map(c=>{const it=foCertOf(e.id,c.id), s=foCertSt(it);return `<li><span>${esc(c.nom)}${it&&it.num?`<span class="muted sm"> · n° ${esc(it.num)}</span>`:''}${c.enpq?' <span class="chip info">ENPQ</span>':''}</span><span class="chip ${s[0]}">${esc(s[1])}</span></li>`;}).join('')}</ul><p class="help u-mt8">Apportez votre nouveau certificat à l’administration avant l’expiration.</p></section>`;
}
function foCertsDrawer(d){
  const e=byId(S.data.eleves,d.id);if(!e) return goneHTML('Élève');
  return dTop('Certificats',esc(e.nom),esc(gName(e.groupe)))+`<form class="dr-body" data-form="fo-certs" data-id="${esc(e.id)}" novalidate>${foCfg().certs.map(c=>{const it=foCertOf(e.id,c.id)||{};
    return `<fieldset class="fo-cf"><legend>${esc(c.nom)}${c.mois?` <small class="muted">· valide ${esc(String(c.mois))} mois</small>`:''}</legend><div class="grid3"><label class="field"><span>Obtenu le</span><input type="date" id="fc-o-${esc(c.id)}" value="${esc(it.obtenu||'')}"></label><label class="field"><span>Expire le</span><input type="date" id="fc-e-${esc(c.id)}" value="${esc(it.expire||'')}" title="Laissée vide, elle est calculée"></label><label class="field"><span>Numéro</span><input id="fc-n-${esc(c.id)}" maxlength="40" value="${esc(it.num||'')}" autocomplete="off"></label></div></fieldset>`;}).join('')}
    <p class="help">Sans date d’expiration, elle se calcule à partir de la date d’obtention et de la durée de validité.</p>
    <div class="dr-foot"><button class="btn primary" type="submit" id="fc-save"${dis()}>Enregistrer</button></div></form>`;
}
async function foSaveCerts(f){
  const id=f.dataset.id, items=[];
  for(const c of foCfg().certs){
    const o=($('#fc-o-'+c.id)||{}).value||'', x=($('#fc-e-'+c.id)||{}).value||'', n=String(($('#fc-n-'+c.id)||{}).value||'').trim();
    if(!o&&!x&&!n) continue;
    items.push({type:c.id,obtenu:o,expire:x||(o&&c.mois?addMonths(o,c.mois):''),num:n});
  }
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('certificats').doc(id).set({items,maj:new Date().toISOString()}),'Certificats enregistrés');
  S.busy=false;if(ok&&S.dr&&S.dr.id===id)S.dr=null;render();
}
/* ---------- Dossier ENPQ ---------- */
function foEnpqPage(){
  if(S.role==='student') return foMyEnpq(foMe());
  const gid=foGroup(), els=studentsOf(gid), can=isAdmin()&&S.conn==='shared', sel=new Set(S.pg.fesel||[]), f=S.pg.fef||'';
  const L=els.map(e=>({e,P:foEnpq(e)})).filter(x=>!f||(f==='pret'?x.P.ok&&!x.P.envoye:f==='inc'?!x.P.ok:!!x.P.envoye));
  const tb=`<div class="toolbar">${foGroupSel('fo-g',gid)}<select id="fo-ef" aria-label="Afficher">${[['','Tous'],['pret','Prêts à inscrire'],['inc','Incomplets'],['env','Inscrits']].map(([k,l])=>`<option value="${k}"${f===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span>
    <button class="btn" type="button" id="fo-enpq-csv" data-act="fo-enpq-csv">${icon('down')}Exporter les prêts</button>${can&&opt('compta')?`<button class="btn" type="button" id="fo-enpq-fees" data-act="fo-enpq-fees"${sel.size?'':' disabled'}>${icon('coin')}Ajouter les frais${sel.size?' ('+sel.size+')':''}</button><button class="btn primary" type="button" id="fo-enpq-sent" data-act="fo-enpq-sent"${sel.size?'':' disabled'}>Marquer inscrits</button>`:''}</div>`;
  /* ce qui manque, en clair : « Premiers soins : expiré le 15 sept. », « Grilles pratiques requises : 4 sur 6 réussies »… */
  const miss=P=>P.items.filter(x=>!x.ok).map(x=>x.auto?`${x.l} : ${x.detail}`:x.l).join(' · ');
  const rows=L.map(({e,P})=>`<tr><td class="fo-ck">${can?`<input type="checkbox" data-act="fo-esel" data-id="${esc(e.id)}"${sel.has(e.id)?' checked':''} aria-label="Cocher ${esc(e.nom)}">`:''}</td><th scope="row"><button class="link" type="button" data-act="fo-enpq" data-id="${esc(e.id)}">${esc(e.nom)}</button></th>
    <td class="fo-miss-t">${P.ok?`<span class="muted">${pl(P.items.length,'condition remplie','conditions remplies')}</span>`:esc(miss(P))}</td><td>${P.envoye?`<span class="chip info">Inscrit le ${esc(shortDate(parse(P.envoye)))}</span>`:P.ok?'<span class="chip ok">Prêt</span>':`<span class="chip warn">${pl(P.miss,'manque','manques')}</span>`}</td></tr>`).join('');
  return tb+`<p class="help">Les conditions d’admission à l’examen de qualification de l’ENPQ : certificats, grilles pratiques requises, examens de l’école, frais à jour, pièces du dossier. Cliquez un nom pour la liste complète. Les frais d’examen se règlent dans Réglages.</p>`
    +(L.length?`<div class="tbl-wrap"><table class="tbl fo-enpq" id="fo-enpq-t"><thead><tr><th><span class="vh">Cocher</span></th><th>Élève</th><th>Ce qui manque</th><th>État</th></tr></thead><tbody>${rows}</tbody></table></div>`:emptyBox('Aucun élève','Aucun élève ne correspond.'));
}
function foMyEnpq(e){
  const P=foEnpq(e);
  return `<section class="panel" id="fo-myenpq"><h2>Mon dossier pour l’examen de l’ENPQ</h2><p>${P.envoye?`Votre inscription a été envoyée le ${esc(longDate(parse(P.envoye)))}.`:P.ok?'Votre dossier est complet : l’administration peut vous inscrire.':pl(P.miss,'élément manque encore','éléments manquent encore')+'.'}</p>
    <ul class="plist">${P.items.map(x=>`<li><span>${esc(x.l)}<span class="muted sm"> · ${esc(x.detail)}</span></span><span class="chip ${x.ok?'ok':'warn'}">${x.ok?'Fait':'À faire'}</span></li>`).join('')}</ul></section>`;
}
function foEnpqDrawer(d){
  const e=byId(S.data.eleves,d.id);if(!e) return goneHTML('Élève');
  const P=foEnpq(e), can=isAdmin()&&S.conn==='shared';
  return dTop('Dossier ENPQ',esc(e.nom),esc(gName(e.groupe)))+`<form class="dr-body" data-form="fo-enpq" data-id="${esc(e.id)}" novalidate>
    <h3 class="sb-h3">Conditions</h3><ul class="plist">${P.items.filter(x=>x.auto).map(x=>`<li><span>${esc(x.l)}<span class="muted sm"> · ${esc(x.detail)}</span></span><span class="chip ${x.ok?'ok':'warn'}">${x.ok?'Fait':'À faire'}</span></li>`).join('')}</ul>
    <h3 class="sb-h3">Pièces du dossier</h3>${P.items.filter(x=>!x.auto).map(x=>`<label class="ck"><input type="checkbox" name="pc" value="${esc(x.id)}"${x.ok?' checked':''}${can?'':' disabled'}> ${esc(x.l)}</label>`).join('')||'<p class="help">Aucune pièce demandée (Réglages).</p>'}
    <label class="field"><span>Inscription envoyée à l’ENPQ le</span><input type="date" id="fe-env" value="${esc(P.envoye)}"${can?'':' disabled'}></label>
    <label class="field"><span>Note</span><textarea id="fe-note" rows="2"${can?'':' disabled'}>${esc(P.note)}</textarea></label>
    ${can?`<div class="dr-foot"><button class="btn primary" type="submit" id="fe-save"${dis()}>Enregistrer</button></div>`:''}</form>`;
}
async function foSaveEnpq(f){
  const id=f.dataset.id, old=((S.data.enpq||{})[id]||{}).coches||{}, coches={};
  for(const i of f.querySelectorAll('input[name=pc]')) if(i.checked) coches[i.value]=old[i.value]||todayISO();
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('dossiers-enpq').doc(id).set({coches,envoye:($('#fe-env')||{}).value||'',note:String(($('#fe-note')||{}).value||'').trim(),maj:new Date().toISOString()}),'Dossier enregistré');
  S.busy=false;if(ok&&S.dr&&S.dr.id===id)S.dr=null;render();
}
function foEnpqCSV(){
  const L=S.data.eleves.filter(e=>foEnpq(e).ok).sort((a,b)=>collator.compare(gName(a.groupe),gName(b.groupe))||collator.compare(a.nom,b.nom));
  if(!L.length){toast('Aucun élève prêt à inscrire.','bad');return null;}
  const ps=foCfg().certs.find(c=>c.enpq)||null;
  return {name:'candidats-enpq.csv',text:csvText([['Nom','Classe','Numéro','Date de naissance','Courriel','Téléphone',ps?ps.nom+' : numéro':'',ps?ps.nom+' : expiration':'','Inscription envoyée']].concat(L.map(e=>{const it=ps?foCertOf(e.id,ps.id)||{}:{};return [e.nom,gName(e.groupe),e.numero==null?'':e.numero,e.naissance||'',e.courriel||'',e.telephone||'',it.num||'',it.expire||'',foEnpq(e).envoye];})))};
}
/* Les frais d’examen de l’ENPQ s’ajoutent au compte des élèves choisis (Compta) */
async function foEnpqFees(){
  const cp=opt('compta');if(!cp) return;
  const ids=(S.pg.fesel||[]).filter(id=>byId(S.data.eleves,id)), F=foCfg().frais.filter(x=>+x.montant>0);
  if(!ids.length||!F.length){toast(F.length?'Cochez des élèves.':'Aucun frais d’examen dans Réglages.','bad');return;}
  const fns=[];
  for(const id of ids) for(const x of F) fns.push(()=>cp.addEntry({date:todayISO(),type:'chg',poste:'frais',ht:+x.montant,ttc:+x.montant,eleve:id,libelle:x.nom,note:'ENPQ'}));
  S.pg.fesel=[];
  if(await runAll(fns,`Frais d’examen ajoutés au compte de ${pl(ids.length,'élève','élèves')}`)) logEv('formation',`a ajouté les frais d’examen de l’ENPQ à ${pl(ids.length,'élève','élèves')}`);
}
async function foEnpqSent(){
  const ids=(S.pg.fesel||[]).filter(id=>byId(S.data.eleves,id)), t=todayISO();if(!ids.length) return;
  const fns=ids.map(id=>()=>{const d=(S.data.enpq||{})[id]||{};return col('dossiers-enpq').doc(id).set({coches:d.coches||{},note:d.note||'',envoye:t,maj:new Date().toISOString()});});
  S.pg.fesel=[];
  if(await runAll(fns,`${pl(ids.length,'élève marqué inscrit','élèves marqués inscrits')} à l’ENPQ`)) logEv('formation',`a marqué ${pl(ids.length,'élève','élèves')} inscrits à l’examen de l’ENPQ`);
}
/* ---------- Relevé de formation : heures par module, évaluations pratiques, examens, certificats ---------- */
function foReleveData(e){
  const H=foHours(e), mods=comps().map(k=>({k,plan:(+k.heuresT||0)+(+k.heuresP||0)||+k.heures||0,fait:Math.round((H[+k.code]||0)*10)/10})).filter(x=>x.plan||x.fait);
  const ev=foEvOf(e.id), B=examBoard(x=>x.grp===e.groupe), ex=B.items.filter(x=>x.past&&!x.rep&&x.res[e.id]).sort((a,b)=>a.date.localeCompare(b.date));
  return {mods,ev,ex,certs:foCfg().certs.map(c=>({c,it:foCertOf(e.id,c.id)})),P:foEnpq(e)};
}
function foReleveBody(e,pr){
  const D=foReleveData(e), T=pr?'pr-t':'tbl', tot=D.mods.reduce((n,x)=>n+x.fait,0), plan=D.mods.reduce((n,x)=>n+x.plan,0);
  const h2=t=>pr?`<h2 class="pr-h2">${t}</h2>`:`<h3 class="sb-h3">${t}</h3>`;
  /* un compte élève ne lit ni les présences ni les résultats de la classe : ces deux parties sont sur le relevé remis par l’administration */
  const full=foFull();
  return `${full?h2('Heures de formation suivies')+`<table class="${T}"><thead><tr><th>Module</th><th class="num">Prévues</th><th class="num">Suivies</th></tr></thead><tbody>${D.mods.map(x=>`<tr><td>M${esc(x.k.code)} ${esc(x.k.nom)}</td><td class="num">${hrFmt(x.plan)} h</td><td class="num">${hrFmt(x.fait)} h</td></tr>`).join('')}<tr><th>Total</th><th class="num">${hrFmt(plan)} h</th><th class="num">${hrFmt(tot)} h</th></tr></tbody></table>`:'<p class="help">Les heures suivies et les résultats d’examens paraissent sur le relevé remis par l’administration ; vos résultats sont aussi dans « Examens ».</p>'}
    ${h2('Évaluations pratiques')}${D.ev.length?`<table class="${T}"><thead><tr><th>Date</th><th>Grille</th><th>Essai</th><th>Note</th><th>Résultat</th><th>Évaluateur</th><th>Signée par l’élève</th></tr></thead><tbody>${D.ev.map(x=>`<tr><td>${esc(foWhen(x))}</td><td>${esc(x.nom||'')}</td><td>${esc(String(x.essai||1))}</td><td>${esc(String(x.score))} %</td><td>${x.resultat==='reussi'?'Réussie':'Échec'}${x.motif?' ('+esc(x.motif.toLowerCase())+')':''}</td><td>${esc(x.evalNom||'')}</td><td>${x.sig&&x.sig.el?esc(shortDate(new Date(x.sig.el.le))):'—'}</td></tr>`).join('')}</tbody></table>`:'<p>Aucune évaluation pratique.</p>'}
    ${!full?'':h2('Examens')+(D.ex.length?`<table class="${T}"><thead><tr><th>Date</th><th>Module</th><th>Examen</th><th>Note</th><th>Résultat</th></tr></thead><tbody>${D.ex.map(x=>`<tr><td>${esc(shortDate(parse(x.date)))}</td><td>${esc(x.c?(x.c.code?x.c.code+' ':'')+x.c.titre:'')}</td><td>${esc((x.e&&x.e.titre)||'Examen')}</td><td>${x.pct[e.id]!=null?esc(noteTxt(x.pct[e.id])):''}</td><td>${esc(RES[x.res[e.id]][1])}</td></tr>`).join('')}</tbody></table>`:'<p>Aucun résultat d’examen.</p>')}
    ${h2('Certificats')}<table class="${T}"><tbody>${D.certs.map(({c,it})=>`<tr><td>${esc(c.nom)}</td><td>${esc(foCertSt(it)[1])}${it&&it.num?' · n° '+esc(it.num):''}</td></tr>`).join('')}</tbody></table>
    <p>${D.P.envoye?`Inscrit à l’examen de l’ENPQ le ${esc(longDate(parse(D.P.envoye)))}.`:D.P.ok?'Dossier complet pour l’examen de l’ENPQ.':`Dossier ENPQ : ${pl(D.P.miss,'élément manque','éléments manquent')}.`}</p>`;
}
function foRelevePage(){
  const me=S.role==='student', gid=me?(foMe()||{}).groupe:foGroup(), els=studentsOf(gid), e=me?foMe():(els.find(x=>x.id===S.pg.fre)||els[0]);
  if(!me) ensureTerm(yearStart());
  const tb=`<div class="toolbar">${me?'':foGroupSel('fo-g',gid)+`<select id="fo-re" aria-label="Élève">${els.map(x=>`<option value="${esc(x.id)}"${e&&x.id===e.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select>`}<span class="grow"></span>${e?`<button class="btn primary" type="button" id="fo-print" data-act="fo-print" data-id="${esc(e.id)}">${icon('print')}Imprimer le relevé</button>`:''}</div>`;
  if(!e) return tb+emptyBox('Aucun élève','Choisissez une classe qui a des élèves.');
  return tb+`<section class="panel fo-rel" id="fo-rel"><h2>Relevé de formation · ${esc(e.nom)}</h2><p class="help">${esc(gName(e.groupe))}${e.numero!=null&&e.numero!==''?' · n° '+esc(e.numero):''} · heures comptées depuis la rentrée, selon les présences.</p>${foReleveBody(e,false)}</section>`;
}
async function foPrint(id){
  const e=byId(S.data.eleves,id);if(!e) return;
  const body=`<section class="pr-page">${prHead('Relevé de formation',esc(e.nom)+(e.numero!=null&&e.numero!==''?' · n° '+esc(e.numero):'')+' · '+esc(gName(e.groupe)))}${foReleveBody(e,true)}
    <div class="pr-sign"><span>Remis le ${esc(longDate(new Date()))}</span><span>Signature : ______________________________</span></div>${prFoot()}</section>`;
  await printDoc('Relevé de formation · '+e.nom,body,false,'releve-formation-'+String(e.nom).toLowerCase().replace(/[^a-z0-9]+/gi,'-'));
}
/* ---------- Réglages ---------- */
function foReglPage(){
  const C=foCfg(), can=isAdmin()&&S.conn==='shared', ro=can?'':' disabled';
  return `<form data-form="fo-regl" novalidate><h2 class="vh">Réglages de la formation</h2><div class="ps-cards">
    <section class="panel ps-card"><h3>Certificats suivis</h3><label class="field"><span>Un par ligne : nom ; validité en mois ; ENPQ</span><textarea id="fr-certs" rows="6"${ro}>${esc(C.certs.map(c=>`${c.nom} ; ${c.mois||0}${c.enpq?' ; ENPQ':''}`).join('\n'))}</textarea></label><p class="help">« ENPQ » : exigé pour l’examen de qualification. Validité 0 : n’expire pas.</p>
      <label class="field"><span>Alerte avant l’expiration (jours)</span><input id="fr-alerte" type="number" min="1" max="365" value="${esc(String(C.alerte))}"${ro}></label></section>
    <section class="panel ps-card"><h3>Dossier ENPQ</h3><label class="field"><span>Pièces à recevoir, une par ligne</span><textarea id="fr-pieces" rows="4"${ro}>${esc(C.pieces.map(p=>p.nom).join('\n'))}</textarea></label>
      ${opt('compta')?`<label class="field"><span>Frais d’examen ajoutés au compte : libellé ; montant</span><textarea id="fr-frais" rows="3"${ro}>${esc(C.frais.map(x=>`${x.nom} ; ${moneyIn(x.montant)}`).join('\n'))}</textarea></label><p class="help">Par défaut, la grille tarifaire 2026 de l’ENPQ : 5 examens théoriques à 92,00 $ et l’examen pratique à 344,30 $. À vérifier chaque année.</p>`:''}</section>
    <section class="panel ps-card"><h3>Évaluations pratiques</h3><label class="ck"><input type="checkbox" id="fr-niv"${C.niveaux?' checked':''}${ro}> Noter aussi un niveau de maîtrise de 1 à 4</label><p class="help">1 débutant, 2 en progrès, 3 maîtrisé, 4 très bonne maîtrise. Le niveau s’affiche dans les carnets.</p></section>
  </div>${can?`<div class="ps-save"><button class="btn primary" type="submit" id="fr-save"${dis()}>Enregistrer</button></div>`:''}</form>`;
}
const foSlug=s=>String(s||'').toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24)||'x';
async function foSaveRegl(){
  const C=foCfg(), v=id=>String(($('#'+id)||{}).value||''), lines=id=>v(id).split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const certs=lines('fr-certs').map(l=>{const p=l.split(';').map(x=>x.trim()), nom=p[0], old=C.certs.find(c=>c.nom.toLowerCase()===nom.toLowerCase());return {id:old?old.id:foSlug(nom),nom,mois:Math.max(0,Math.round(+(p[1]||0)||0)),enpq:/enpq/i.test(p[2]||'')};}).filter(c=>c.nom);
  const pieces=lines('fr-pieces').map(nom=>{const old=C.pieces.find(p=>p.nom.toLowerCase()===nom.toLowerCase());return {id:old?old.id:foSlug(nom),nom};});
  const frais=$('#fr-frais')?[]:C.frais;if($('#fr-frais')) for(const l of lines('fr-frais')){const p=l.split(';').map(x=>x.trim()), m=money(p[1]||'');if(!p[0]||m==null){toast('Frais : écrivez « libellé ; montant », par exemple « Examen pratique ; 344,30 ».','bad');return;}frais.push({nom:p[0],montant:m});}
  const c=configDoc();c.formation=Object.assign({},c.formation||{},{certs,pieces,frais,alerte:Math.max(1,Math.round(+v('fr-alerte')||30)),niveaux:!!($('#fr-niv')||{}).checked});
  await saveConfig(c,'Réglages de la formation enregistrés');
}

/* Le tiroir de la formation (et de la banque de questions) */
function foDrawer(){
  const d=S.dr, P={grille:foGrilleDrawer,sheet:foSheetDrawer,grp:foGrpDrawer,view:foViewDrawer,pre:foPreDrawer,certs:foCertsDrawer,enpq:foEnpqDrawer,qrin:qrDrawer,afauto:afAutoDrawer,serv:foServDrawer}[d.mode];
  return P?P(d):typeof qbDrawer==='function'?qbDrawer(d):goneHTML();
}
/* ---------- Événements ---------- */
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled||!/^fo-/.test(b.dataset.act))return;
  const a=b.dataset.act, d=S.dr, pg=S.pg;
  switch(a){
    case 'fo-grille':openDrawer({kind:'fo',mode:'grille',id:b.dataset.id||''});break;
    case 'fo-ask':if(d){d.ask=true;renderDrawer();}break;
    case 'fo-ask-no':if(d){d.ask=false;renderDrawer();}break;
    case 'fo-g-del-yes':{if(!d||S.busy)break;const g=byId(S.data.grilles,d.id);S.busy=true;renderDrawer();const ok=await write(()=>col('grilles').doc(d.id).delete(),'Grille supprimée');S.busy=false;if(ok){if(g)logEv('formation','a supprimé la grille « '+g.nom+' »');S.dr=null;}render();break;}
    case 'fo-sheet':openDrawer({kind:'fo',mode:'sheet',el:b.dataset.el,gr:b.dataset.gr,date:todayISO()});break;
    case 'fo-cell':{const st=foState(b.dataset.el,byId(S.data.grilles,b.dataset.gr)||{id:b.dataset.gr});if(st.last)openDrawer({kind:'fo',mode:'view',id:st.last.id});else if(S.conn==='shared')openDrawer({kind:'fo',mode:'sheet',el:b.dataset.el,gr:b.dataset.gr,date:todayISO()});break;}
    case 'fo-view':openDrawer({kind:'fo',mode:'view',id:b.dataset.id});break;
    case 'fo-run':if(d&&d.mode==='sheet'){if(d.run){d.acc=foSec(d);d.run=false;}else{d.t0=Date.now();d.run=true;if(!foTimer)foTimer=setInterval(foTick,500);}renderDrawer();}break;
    case 'fo-zero':if(d){d.acc=0;d.run=false;renderDrawer();}break;
    case 'fo-allpts':if(d&&d.coches){d.coches=d.coches.map(()=>true);renderDrawer();}break;
    case 'fo-sel':{const s=new Set(pg.fsel||[]);if(b.checked)s.add(b.dataset.id);else s.delete(b.dataset.id);pg.fsel=[...s];render();break;}
    case 'fo-grp':{const G=foG(), gr=G.find(g=>g.id===pg.fgr)||G[0];if(gr&&(pg.fsel||[]).length)openDrawer({kind:'fo',mode:'grp',gr:gr.id,ids:pg.fsel.slice()});break;}
    case 'fo-sign':{if(S.busy)break;const x=foEvs().find(v=>v.id===b.dataset.id), el=x&&(byId(S.data.eleves,x.eleve)||foMe());if(!x)break;S.busy=true;renderDrawer();
      await write(()=>col('evaluations').doc(x.id).update({sig:{el:{nom:(el&&el.nom)||whoAmI(),le:new Date().toISOString(),sur:'compte de l’élève'}}}),'Évaluation signée');S.busy=false;render();break;}
    case 'fo-ev-del-yes':{if(S.busy)break;S.busy=true;renderDrawer();const ok=await write(()=>col('evaluations').doc(b.dataset.id).delete(),'Évaluation supprimée');S.busy=false;if(ok)S.dr=null;render();break;}
    case 'fo-pre':openDrawer({kind:'fo',mode:'pre',code:b.dataset.v});break;
    case 'fo-certs':openDrawer({kind:'fo',mode:'certs',id:b.dataset.id});break;
    case 'fo-enpq':openDrawer({kind:'fo',mode:'enpq',id:b.dataset.id});break;
    case 'fo-esel':{const s=new Set(pg.fesel||[]);if(b.checked)s.add(b.dataset.id);else s.delete(b.dataset.id);pg.fesel=[...s];render();break;}
    case 'fo-enpq-csv':{const r=foEnpqCSV();if(r)await saveFile(r.name,r.text);break;}
    case 'fo-enpq-fees':await foEnpqFees();break;
    case 'fo-enpq-sent':await foEnpqSent();break;
    case 'fo-print':await foPrint(b.dataset.id);break;
  }
});
document.addEventListener('submit',async e=>{
  const f=e.target, k=f.dataset.form;if(!/^fo-/.test(k||''))return;
  e.preventDefault();if(S.busy) return;
  if(k==='fo-grille') await foSaveGrille();
  else if(k==='fo-sheet') await foSaveSheet();
  else if(k==='fo-grp') await foSaveGrp();
  else if(k==='fo-pre') await foSavePre(f);
  else if(k==='fo-certs') await foSaveCerts(f);
  else if(k==='fo-enpq') await foSaveEnpq(f);
  else if(k==='fo-regl') await foSaveRegl();
});
document.addEventListener('change',e=>{
  const t=e.target, d=S.dr;
  if(t.dataset&&t.dataset.foPt!=null&&d&&d.mode==='sheet'){d.coches[+t.dataset.foPt]=t.checked;d.note=String(($('#fo-note')||{}).value||'');renderDrawer();return;}
  if(t.dataset&&t.dataset.fo==='ens'&&d){d.ens=t.value;d.err='';renderDrawer();return;}
  if(t.id==='fo-sig-ev'&&d){d.sigEv=t.checked;return;}
  if(t.id==='fo-sig-el'&&d){d.sigEl=t.checked;return;}
  if(t.id==='fo-niv'&&d){d.niv=t.value;return;}
  const m={'fo-g':'fg','fo-gr':'fgr','fo-ef':'fef','fo-re':'fre'}[t.id];
  if(m){S.pg[m]=t.value;if(m==='fg'){S.pg.fsel=[];S.pg.fesel=[];S.pg.fre='';}render();}
});

/* ---------- Données : tout pour le personnel ; ses propres documents pour un compte élève ---------- */
/* Les listes complètes restent de côté (FO_ALL) : elles reviennent dès qu’on quitte l’aperçu d’un élève, ou dès que le rôle du
   compte est connu (au tout premier chargement, il vaut « élève » un instant) */
const FO_ALL={};
function foSubscribe(){
  const L=(c,k,own)=>{try{col(c).onSnapshot(q=>{const v=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));if(own){FO_ALL[k]=v;if(!foFull())return;}LIVE()[k]=v;schedule();},()=>{});}catch(e){}};
  const M=(c,k)=>{try{col(c).onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=d.data();FO_ALL[k]=m;if(!foFull())return;LIVE()[k]=m;schedule();},()=>{});}catch(e){}};
  L('grilles','grilles');L('questions','questions');L('ex-blancs','blancs');
  /* tout lire : le personnel (un compte élève ne demande que ses propres documents, dans foMine) ; dans la démo, rien n’est protégé */
  if(S.canAdmin!==false||S.canWrite!==false||window.__DEMO_LOCAL){L('evaluations','evals',1);L('ex-tentatives','tentatives',1);M('certificats','certs');M('dossiers-enpq','enpq');}
  if(S.canAdmin!==false) L('rapports-service','rapports');
}
let foUnsub=[];
function foMine(){
  if(!DB||S.archive) return;
  const who=foFull()?'':S.student||'';
  if(S._foFor===who) return;
  foUnsub.forEach(u=>{try{u();}catch(e){}});foUnsub=[];S._foFor=who;
  if(!who){Object.assign(S.data,FO_ALL);return;}
  Object.assign(S.data,{evals:[],tentatives:[],certs:{},enpq:{}});
  const sub=(q,key)=>{try{foUnsub.push(q.onSnapshot(x=>{if(S._foFor!==who||foFull())return;S.data[key]=x.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{}));}catch(e){}};
  const one=(c,key)=>{try{foUnsub.push(DB.doc(c+'/'+who).onSnapshot(s=>{if(S._foFor!==who||foFull())return;S.data[key]=s.exists?{[who]:s.data()}:{};schedule();},()=>{}));}catch(e){}};
  sub(col('evaluations').where('eleve','==',who),'evals');sub(col('ex-tentatives').where('eleve','==',who),'tentatives');
  one('certificats','certs');one('dossiers-enpq','enpq');
}
/* La cloche : préalables et certificats (administration), séances de l’enseignant, examens blancs et signatures (élève) */
function foNotifs(){
  const out=[], day=todayISO();
  if(!nfOn('formation')) return out;
  if(S.role==='admin'){
    const bl=foBlocked(7), n=new Set(bl.flatMap(b=>b.miss.map(x=>x.e.id))).size;
    if(n) out.push({id:`fo:pre:${n}:${day}`,t:day+'T07:00',tone:'bad',title:'Formation',text:`${n>1?n+' élèves n’ont pas':'1 élève n’a pas'} les préalables d’une séance des 7 prochains jours.`,go:{k:'fo',tab:'prereq'}});
    let ex=0,so=0;for(const e of S.data.eleves) for(const c of foCfg().certs){const it=foCertOf(e.id,c.id);if(!it)continue;const s=foCertSt(it)[0];if(s==='bad')ex++;else if(s==='warn')so++;}
    if(ex||so) out.push({id:`fo:cert:${ex}:${so}:${day}`,t:day+'T07:00',tone:ex?'bad':'warn',title:'Certificats',text:[ex?pl(ex,'certificat expiré','certificats expirés'):'',so?pl(so,'certificat à renouveler bientôt','certificats à renouveler bientôt'):''].filter(Boolean).join(' · ')+'.',go:{k:'fo',tab:'certs'}});
  }else if(S.role==='teacher'&&S.teacher){
    const bl=foBlocked(7).filter(b=>(b.s.tch||[]).includes(S.teacher));
    for(const b of bl) out.push({id:`fo:pre:${b.s.key}:${b.miss.length}`,t:day+'T07:00',tone:'warn',title:'Préalables manquants',text:`${pl(b.miss.length,'élève','élèves')} · M${b.code} ${b.s.c.titre}, ${dayLabel(parse(b.s.date)).toLowerCase()} (${gName(b.s.grp)}).`,go:{k:'sess',key:b.s.key,date:b.s.date}});
  }else if(S.role==='student'){
    const e=foMe();if(!e) return out;
    for(const x of qbOpenFor(e)) if(!qbDone(x,e.id)) out.push({id:'qb:'+x.id,t:(x.du||day)+'T07:00',tone:'info',title:'Examen blanc',text:`${x.nom} est ouvert${x.au?' jusqu’au '+shortDate(parse(x.au)):''}.`,go:{k:'fo',tab:'blancs'}});
    const u=foEvOf(e.id).filter(x=>!(x.sig&&x.sig.el));
    if(u.length) out.push({id:'fo:sig:'+u.map(x=>x.id).join(','),t:u[u.length-1].le||day,tone:'warn',title:'Évaluation à signer',text:`${u.map(x=>x.nom).slice(0,3).join(', ')}.`,go:{k:'fo',tab:'carnet'}});
    for(const c of foCfg().certs){const it=foCertOf(e.id,c.id), s=foCertSt(it);if(it&&(s[0]==='bad'||s[0]==='warn')) out.push({id:`fo:mc:${c.id}:${it.expire}`,t:day+'T07:00',tone:s[0],title:'Certificat',text:`${c.nom} : ${s[1].toLowerCase()}.`,go:{k:'fo',tab:'certs'}});}
  }
  return out;
}
