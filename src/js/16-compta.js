/* ---------- Compta : l’argent de l’école (un outil de gestion, pas la comptabilité officielle) ----------
   Montants en cents. Réservé à l’administration (règles de la base).
   compta/<id>           une écriture { date, type rev|dep|red, poste, libelle, tiers, ht, tps, tvq, ttc, mode, eleve, facture, paie, source, note, par, le }
                         rev : revenu ; dep : dépense ; red : réduction accordée à un élève (diminue ce qu’il doit)
   compta-factures/<id>  { num, client, adresse, courriel, date, echeance, lignes [{ d, q, p }], tx { tps, tvq } | null, statut brouillon|envoyee|annulee, report, note }
   compta-paie/<mois_ens> un relevé de paie approuvé { mois, ens, h, montant, lignes [{ date, titre, h, taux }], statut approuve|paye }
   compta-reglages/ecole { taxes { on, tps, tvq }, prefixe, modes [], taux { defaut, theorie, pratique, par { ens: cents } }, budget { poste: cents } }
   config/ecole.tarifs  [{ id, nom, montant, classe, ech [{ date, pct }] }] : à part, pour que chaque élève puisse calculer son compte
   La paie se calcule avec les heures réellement données (taughtRows) ; un réapprovisionnement du Stock avec un coût
   devient une dépense. */
const CP_DEP=[['salaires','Salaires des instructeurs'],['materiel','Matériel et équipement'],['conso','Consommables'],['entretien','Entretien et réparations'],['examens','Frais d’examens'],['admin','Administration'],['autres','Autres dépenses']];
const CP_REV=[['frais','Frais des élèves'],['factures','Contrats de formation'],['subv','Subventions'],['autres','Autres revenus']];
const CP_DEF={taxes:{on:false,tps:5,tvq:9.975},prefixe:'F-',modes:['Comptant','Chèque','Virement','Carte de crédit'],taux:{defaut:4500,theorie:null,pratique:null}};
const _fmtM=new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD'});
const fmtM=c=>_fmtM.format((+c||0)/100);
const money=v=>{const s=String(v==null?'':v).replace(/[\s  $]/g,'').replace(',','.');if(!/^\d+(\.\d{0,2})?$/.test(s))return null;return Math.round(parseFloat(s)*100);};
const moneyIn=c=>c==null||c===''?'':((+c)/100).toFixed(2).replace('.',',');
const sumC=a=>a.reduce((n,x)=>n+(+x||0),0);
function cpCfg(){
  const c=S.data.cptCfg||{}, t=c.taux||{};
  return {taxes:Object.assign({},CP_DEF.taxes,c.taxes||{}),prefixe:c.prefixe!=null?c.prefixe:CP_DEF.prefixe,modes:Array.isArray(c.modes)&&c.modes.length?c.modes:CP_DEF.modes,
    taux:{defaut:t.defaut!=null?+t.defaut:CP_DEF.taux.defaut,theorie:t.theorie||null,pratique:t.pratique||null,par:Object.assign({},t.par||{})},tarifs:Array.isArray(cfg().tarifs)?cfg().tarifs:Array.isArray(c.tarifs)?c.tarifs:[],budget:Object.assign({},c.budget||{})};
}
const cpE=()=>(S.data.compta||[]);
const cpPoste=(t,k)=>((t==='dep'?CP_DEP:CP_REV).find(x=>x[0]===k)||['',k||'—'])[1];
const cpTax=(ht,on)=>{const t=cpCfg().taxes;return on&&t.on?{tps:Math.round(ht*t.tps/100),tvq:Math.round(ht*t.tvq/100)}:{tps:0,tvq:0};};
/* Frais d’un élève : ce qu’il doit (tarifs de sa classe, par échéance), ce qu’il a payé, les réductions, le retard */
function cpFee(e,src){
  const t=todayISO(), T=cpCfg().tarifs.filter(x=>!x.classe||x.classe===e.groupe);let du=0,dueNow=0,next=null;
  for(const x of T){
    const m=+x.montant||0, ech=(x.ech||[]).filter(y=>y.date&&+y.pct>0).sort((a,b)=>a.date.localeCompare(b.date));du+=m;
    if(!ech.length){dueNow+=m;continue;}
    let acc=0;ech.forEach((y,i)=>{const part=i===ech.length-1?m-acc:Math.round(m*(+y.pct)/100);acc+=part;if(y.date<=t)dueNow+=part;else if(!next||y.date<next.date)next={date:y.date,m:part};});
  }
  const E=(src||cpE()).filter(x=>x.eleve===e.id), paid=sumC(E.filter(x=>x.type==='rev').map(x=>x.ttc)), red=sumC(E.filter(x=>x.type==='red').map(x=>x.ttc));
  const solde=du-red-paid, retard=Math.max(0,Math.min(solde,dueNow-red-paid));
  return {du,paid,red,solde,retard,next,T,E,etat:!du?'aucun':solde<=0?'paye':retard>0?'retard':'ajour'};
}
const CP_FE={paye:['ok','Payé'],retard:['bad','En retard'],ajour:['info','À jour'],aucun:['off','Aucun frais']};
/* Factures */
function cpFTot(f){const ht=sumC((f.lignes||[]).map(l=>Math.round((+l.q||0)*(+l.p||0)))), tps=f.tx?Math.round(ht*f.tx.tps/100):0, tvq=f.tx?Math.round(ht*f.tx.tvq/100):0;return {ht,tps,tvq,ttc:ht+tps+tvq};}
const cpFPaid=f=>sumC(cpE().filter(x=>x.type==='rev'&&x.facture===f.id).map(x=>x.ttc))+(+f.report||0);
function cpFState(f){const tot=cpFTot(f).ttc, p=cpFPaid(f);if(f.statut==='annulee')return 'annulee';if(f.statut==='brouillon')return 'brouillon';if(p>=tot&&tot>0)return 'payee';if(f.echeance&&f.echeance<todayISO())return 'retard';return 'envoyee';}
const CP_FS={brouillon:['off','Brouillon'],envoyee:['info','Envoyée'],retard:['bad','En retard'],payee:['ok','Payée'],annulee:['off','Annulée']};
const cpFacts=()=>(S.data.factures||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.num||'').localeCompare(String(a.num||'')));
/* Paie : heures données dans le mois, au taux de chaque instructeur (ou selon le type de séance) */
function cpRate(tid,s){const T=cpCfg().taux;if(+T.par[tid])return +T.par[tid];const tg=s?tagsOf(s):[];if(tg.includes('Pratique')&&+T.pratique)return +T.pratique;if(tg.includes('Théorie')&&+T.theorie)return +T.theorie;return +T.defaut||0;}
function cpPayRows(m){
  const by={};
  for(const r of taughtRows()){if(r.s.date.slice(0,7)!==m) continue;const o=by[r.t]||(by[r.t]={t:r.t,h:0,mt:0,lignes:[]}), rate=cpRate(r.t,r.s);
    o.h=Math.round((o.h+r.h)*10)/10;o.mt+=Math.round(r.h*rate);o.lignes.push({date:r.s.date,titre:`${r.s.c.code?r.s.c.code+' ':''}${r.s.c.titre} · ${gName(r.s.grp)}`,h:r.h,taux:rate});}
  return Object.values(by).sort((a,b)=>collator.compare(tName(a.t),tName(b.t)));
}
const cpSlip=(t,m)=>(S.data.paie||[]).find(p=>p.ens===t&&p.mois===m);
/* Mois terminés (les trois derniers) dont des heures attendent un relevé */
function cpToApprove(){const cur=todayISO().slice(0,7);let n=0;for(const m of hrMonths().filter(x=>x<cur).slice(-3)) for(const r of cpPayRows(m)) if(!cpSlip(r.t,m)) n++;return n;}
function cpOver(){const b=cpCfg().budget;return CP_DEP.filter(([k])=>+b[k]>0&&sumC(cpE().filter(x=>x.type==='dep'&&x.poste===k).map(x=>x.ttc))>+b[k]).length;}
function comptaTabs(){
  const late=S.data.eleves.filter(e=>cpFee(e).etat==='retard').length, fl=cpFacts().filter(f=>cpFState(f)==='retard').length, ap=cpToApprove(), ov=cpOver();
  return [{k:'dash',l:'Tableau de bord',i:'spark'},
    {k:'frais',l:'Frais des élèves',i:'users',sec:'Revenus',n:late,bad:!!late,nt:late?pl(late,'élève en retard','élèves en retard'):''},
    {k:'fact',l:'Factures',i:'receipt',n:fl,bad:!!fl,nt:fl?pl(fl,'facture en retard','factures en retard'):''},
    {k:'pay',l:'Paiements reçus',i:'wallet'},
    {k:'paie',l:'Paie des instructeurs',i:'clock',sec:'Dépenses',n:ap,bad:!!ap,nt:ap?pl(ap,'relevé à approuver','relevés à approuver'):''},
    {k:'dep',l:'Achats et dépenses',i:'coin'},
    {k:'budget',l:'Budget de l’année',i:'target',sec:'Budget',n:ov,bad:!!ov,nt:ov?pl(ov,'poste dépassé','postes dépassés'):''},
    {k:'rap',l:'Rapports',i:'chart'},
    {k:'regl',l:'Réglages de la compta',i:'gear',sec:'Réglages'}];
}
function comptaPage(){
  if(!isAdmin()) return emptyBox('Compta','Réservée à l’administration.');
  if(!S.loaded.compta) return '<div class="empty"><p>Chargement de la compta…</p></div>';
  const tabs=comptaTabs(), tab=tabs.some(t=>t.k===S.pg.cp)?S.pg.cp:'dash';
  return tab==='frais'?cpFraisPage():tab==='fact'?cpFactPage():tab==='pay'?cpEntriesPage('rev'):tab==='dep'?cpEntriesPage('dep'):tab==='paie'?cpPaiePage():tab==='budget'?cpBudgetPage():tab==='rap'?cpRapPage():tab==='regl'?cpReglPage():cpDash();
}
const cpKpi=(id,l,v,cls,sub)=>`<div class="kpi" id="${id}"><span>${l}</span><b class="${cls||''}">${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
function cpDash(){
  const E=cpE(), rev=sumC(E.filter(x=>x.type==='rev').map(x=>x.ttc)), dep=sumC(E.filter(x=>x.type==='dep').map(x=>x.ttc));
  const fees=S.data.eleves.map(e=>({e,f:cpFee(e)})), du=sumC(fees.map(x=>Math.max(0,x.f.solde))), late=fees.filter(x=>x.f.etat==='retard');
  const fo=cpFacts().filter(f=>['envoyee','retard'].includes(cpFState(f))), fdu=sumC(fo.map(f=>cpFTot(f).ttc-cpFPaid(f))), fl=fo.filter(f=>cpFState(f)==='retard');
  const ap=cpToApprove(), b=cpCfg().budget, over=CP_DEP.filter(([k])=>+b[k]>0&&sumC(E.filter(x=>x.type==='dep'&&x.poste===k).map(x=>x.ttc))>+b[k]);
  const todo=[late.length?[`${pl(late.length,'élève en retard de paiement','élèves en retard de paiement')} · ${fmtM(sumC(late.map(x=>x.f.retard)))}`,'frais','bad']:null,
    fl.length?[`${pl(fl.length,'facture en retard','factures en retard')} · ${fmtM(sumC(fl.map(f=>cpFTot(f).ttc-cpFPaid(f))))}`,'fact','bad']:null,
    ap?[`${pl(ap,'relevé de paie à approuver','relevés de paie à approuver')}`,'paie','warn']:null,
    ...over.map(([k,l])=>[`Budget dépassé : ${l}`,'budget','warn'])].filter(Boolean);
  const last=E.slice().sort((x,y)=>String(y.le||y.date).localeCompare(String(x.le||x.date))).slice(0,8);
  return `<div class="kpis">${cpKpi('cpd-rev','Revenus',fmtM(rev),'','depuis le début de l’année')}${cpKpi('cpd-dep','Dépenses',fmtM(dep),'','depuis le début de l’année')}${cpKpi('cpd-sol','Solde',fmtM(rev-dep),rev-dep<0?'bad':'ok','revenus moins dépenses')}${cpKpi('cpd-du','À recevoir',fmtM(du+fdu),du+fdu?'warn':'',`${fmtM(du)} des élèves · ${fmtM(fdu)} en factures`)}</div>
    <div class="two" style="margin-top:12px"><section class="panel" id="cpd-todo"><h2>À faire</h2>${todo.length?`<ul class="plist">${todo.map(([l,k,c])=>`<li><span><span class="chip ${c}">${c==='bad'?'Retard':'À faire'}</span> ${esc(l)}</span><button class="btn sm ghost" type="button" data-act="pg-set" data-k="cp" data-v="${k}">Voir</button></li>`).join('')}</ul>`:'<p class="help">Rien à faire : les paiements sont à jour, la paie est approuvée et le budget est respecté.</p>'}</section>
    <section class="panel" id="cpd-last"><h2>Dernières écritures</h2>${last.length?`<ul class="plist">${last.map(x=>`<li><span>${esc(x.libelle||cpPoste(x.type,x.poste))}<span class="muted sm"> · ${esc(shortDate(parse(x.date)))}</span></span><b class="cp-amt ${x.type==='dep'?'dep':'rev'}">${x.type==='dep'?'−':'+'}${esc(fmtM(x.ttc))}</b></li>`).join('')}</ul>`:'<p class="help">Aucune écriture pour l’instant.</p>'}</section></div>`;
}
/* Frais des élèves */
function cpFraisPage(){
  const st=S.pg, g=st.cg||'', e0=st.ce||'', q=String(st.cq||'').trim().toLowerCase(), T=cpCfg().tarifs;
  const tb=`<div class="toolbar"><input class="search" id="ca-q" type="search" placeholder="Rechercher un élève" aria-label="Rechercher un élève" autocomplete="off" value="${esc(st.cq||'')}"><select id="ca-g" aria-label="Classe"><option value="">Toutes les classes</option>${groups().map(x=>`<option value="${esc(x.id)}"${g===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select><select id="ca-e" aria-label="État"><option value="">Tous les états</option>${['retard','ajour','paye'].map(k=>`<option value="${k}"${e0===k?' selected':''}>${CP_FE[k][1]}</option>`).join('')}</select><span class="grow"></span><button class="btn" type="button" data-act="ca-exp" data-v="frais">${icon('down')}Exporter</button></div>`;
  if(!T.length) return tb+emptyBox('Aucun tarif','Les frais des élèves se calculent à partir des tarifs (formation, matériel, examens) et de leurs échéances.',`<button class="btn primary" type="button" id="ca-go-regl" data-act="pg-set" data-k="cp" data-v="regl">Créer les tarifs</button>`);
  let L=sortElsByClass(S.data.eleves).map(e=>({e,f:cpFee(e)}));
  if(g) L=L.filter(x=>x.e.groupe===g);if(q) L=L.filter(x=>String(x.e.nom||'').toLowerCase().includes(q));if(e0) L=L.filter(x=>x.f.etat===e0);
  const tot=k=>fmtM(sumC(L.map(x=>x.f[k])));
  const rows=L.map(({e,f})=>`<tr class="row-link" data-act="ca-el" data-id="${esc(e.id)}"><td><span class="tb-who"><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span><button class="link" type="button" data-act="ca-el" data-id="${esc(e.id)}">${esc(e.nom)}</button></span></td><td>${esc(gName(e.groupe))}</td><td class="num">${esc(fmtM(f.du))}</td><td class="num">${esc(fmtM(f.paid+f.red))}</td><td class="num"><b>${esc(fmtM(f.solde))}</b></td><td>${f.next?esc(shortDate(parse(f.next.date)))+` <span class="muted sm">${esc(fmtM(f.next.m))}</span>`:'<span class="muted">—</span>'}</td><td><span class="chip ${CP_FE[f.etat][0]}">${CP_FE[f.etat][1]}${f.etat==='retard'?' · '+esc(fmtM(f.retard)):''}</span></td></tr>`).join('');
  return tb+`<div class="tbl-wrap"><table class="tbl stack cp-tbl"><thead><tr><th>Élève</th><th>Classe</th><th class="num">Dû</th><th class="num">Payé et réductions</th><th class="num">Solde</th><th>Prochaine échéance</th><th>État</th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="muted">Aucun élève.</td></tr>'}</tbody>
    <tfoot><tr><th colspan="2">${pl(L.length,'élève','élèves')}</th><th class="num">${tot('du')}</th><th class="num">${esc(fmtM(sumC(L.map(x=>x.f.paid+x.f.red))))}</th><th class="num">${tot('solde')}</th><th colspan="2"></th></tr></tfoot></table></div>`;
}
/* Factures */
function cpFactPage(){
  const st=S.pg, fe=st.cfe||'', F=cpFacts().filter(f=>!fe||cpFState(f)===fe);
  const tb=`<div class="toolbar"><select id="ca-fe" aria-label="État"><option value="">Toutes les factures</option>${Object.entries(CP_FS).map(([k,[,l]])=>`<option value="${k}"${fe===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span><button class="btn" type="button" data-act="ca-exp" data-v="factures">${icon('down')}Exporter</button><button class="btn primary" type="button" id="ca-fact-new" data-act="ca-fact-new">${icon('plus')}Nouvelle facture</button></div>`;
  if(!(S.data.factures||[]).length) return tb+emptyBox('Aucune facture','Pour les contrats de formation avec des municipalités ou des services : numérotées, avec taxes au besoin, et imprimables.');
  const rows=F.map(f=>{const t=cpFTot(f), s=cpFState(f), p=cpFPaid(f);return `<tr class="row-link" data-act="ca-fact" data-id="${esc(f.id)}"><td><button class="link" type="button" data-act="ca-fact" data-id="${esc(f.id)}">${esc(f.num||'—')}</button></td><td>${esc(f.client||'')}</td><td>${f.date?esc(shortDate(parse(f.date))):''}</td><td>${f.echeance?esc(shortDate(parse(f.echeance))):''}</td><td class="num">${esc(fmtM(t.ttc))}</td><td class="num">${esc(fmtM(p))}</td><td><span class="chip ${CP_FS[s][0]}">${CP_FS[s][1]}</span></td></tr>`;}).join('');
  return tb+`<div class="tbl-wrap"><table class="tbl stack cp-tbl"><thead><tr><th>Numéro</th><th>Client</th><th>Date</th><th>Échéance</th><th class="num">Total</th><th class="num">Payé</th><th>État</th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="muted">Aucune facture dans cette liste.</td></tr>'}</tbody></table></div>`;
}
/* Paiements reçus et dépenses : le journal des écritures */
function cpEntriesPage(t){
  const st=S.pg, pf=st.cpf||'', q=String(st.cq2||'').trim().toLowerCase(), P=t==='dep'?CP_DEP:CP_REV, lim=+st.lim||80;
  let E=cpE().filter(x=>t==='dep'?x.type==='dep':x.type==='rev'||x.type==='red');
  if(pf) E=E.filter(x=>x.poste===pf);
  if(q) E=E.filter(x=>[x.libelle,x.tiers,x.note,x.eleve?(byId(S.data.eleves,x.eleve)||{}).nom:''].some(y=>String(y||'').toLowerCase().includes(q)));
  E=E.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.le||'').localeCompare(String(a.le||'')));
  const tb=`<div class="toolbar"><input class="search" id="ca-q2" type="search" placeholder="Libellé, fournisseur, élève" aria-label="Rechercher" autocomplete="off" value="${esc(st.cq2||'')}"><select id="ca-pf" aria-label="Poste"><option value="">Tous les postes</option>${P.map(([k,l])=>`<option value="${k}"${pf===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span><button class="btn" type="button" data-act="ca-exp" data-v="ecritures">${icon('down')}Exporter</button><button class="btn primary" type="button" id="ca-new-${t}" data-act="ca-entry-new" data-t="${t}">${icon('plus')}${t==='dep'?'Nouvelle dépense':'Autre revenu'}</button></div>`;
  if(!E.length) return tb+emptyBox(t==='dep'?'Aucune dépense':'Aucun paiement reçu',t==='dep'?'Les achats, l’entretien et la paie payée paraîtront ici. Un réapprovisionnement du Stock avec un coût s’y ajoute tout seul.':'Les paiements des élèves, des factures et les autres revenus (subventions) paraîtront ici.');
  const rows=E.slice(0,lim).map(x=>`<tr class="row-link" data-act="ca-entry" data-id="${esc(x.id)}"><td>${esc(shortDate(parse(x.date)))}</td><td><b>${esc(x.libelle||cpPoste(x.type,x.poste))}</b>${x.type==='red'?' <span class="chip off">Réduction</span>':''}<small class="tb-sub">${esc([cpPoste(x.type==='red'?'rev':x.type,x.poste),x.eleve?(byId(S.data.eleves,x.eleve)||{}).nom:'',x.tiers].filter(Boolean).join(' · '))}</small></td><td>${esc(x.mode||'')}</td><td class="num"><b class="cp-amt ${x.type==='dep'?'dep':'rev'}">${esc(fmtM(x.ttc))}</b>${x.tps||x.tvq?`<small class="tb-sub">dont taxes ${esc(fmtM((+x.tps||0)+(+x.tvq||0)))}</small>`:''}</td></tr>`).join('');
  return tb+`<div class="tbl-wrap"><table class="tbl stack cp-tbl"><thead><tr><th>Date</th><th>Écriture</th><th>Mode</th><th class="num">Montant</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th colspan="3">${pl(E.length,'écriture','écritures')}</th><th class="num">${esc(fmtM(sumC(E.map(x=>x.ttc))))}</th></tr></tfoot></table></div>`
    +(E.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+80}">Afficher plus (${E.length-lim})</button></div>`:'');
}
/* Paie des instructeurs */
function cpPaiePage(){
  const ms=hrMonths(), m=ms.includes(S.pg.cm)?S.pg.cm:(ms.filter(x=>x<todayISO().slice(0,7)).pop()||ms[ms.length-1]), R=cpPayRows(m), cur=m>=todayISO().slice(0,7);
  const tb=`<div class="toolbar"><select id="ca-m" aria-label="Mois">${ms.map(x=>`<option value="${x}"${x===m?' selected':''}>${esc(hrMonthName(x))}</option>`).join('')}</select><span class="grow"></span><button class="btn" type="button" data-act="ca-exp" data-v="paie" data-m="${m}">${icon('down')}Exporter</button>${R.some(r=>!cpSlip(r.t,m))&&!cur?`<button class="btn primary" type="button" id="ca-paie-all" data-act="ca-paie-all" data-m="${m}"${dis()}>Tout approuver</button>`:''}</div>`;
  if(!R.length) return tb+emptyBox('Aucune heure donnée ce mois-ci','La paie se calcule avec les séances passées et non annulées de chaque instructeur (sauf ses absences).');
  const rows=R.map(r=>{const sl=cpSlip(r.t,m), h=sl?sl.h:r.h, mt=sl?sl.montant:r.mt, changed=sl&&(sl.h!==r.h||sl.montant!==r.mt);
    const st=sl?sl.statut==='paye'?['ok','Payé']:['info','Approuvé']:['warn',cur?'Mois en cours':'À approuver'];
    return `<tr id="ca-p-${esc(r.t)}"><td><button class="link" type="button" data-act="ca-slip" data-t="${esc(r.t)}" data-m="${m}">${esc(tName(r.t))}</button>${changed?'<small class="tb-sub bad-t">Les heures ont changé depuis l’approbation</small>':''}</td><td class="num">${esc(hrFmt(h))} h</td><td class="num">${esc(fmtM(Math.round(mt/(h||1))))} / h</td><td class="num"><b>${esc(fmtM(mt))}</b></td><td><span class="chip ${st[0]}">${st[1]}</span></td>
      <td class="r">${!sl&&!cur?`<button class="btn sm" type="button" data-act="ca-paie-ok" data-t="${esc(r.t)}" data-m="${m}"${dis()}>Approuver</button>`:''}${sl&&sl.statut!=='paye'?`<button class="btn sm" type="button" data-act="ca-paie-pay" data-id="${esc(sl.id)}"${dis()}>Marquer payé</button>`:''}${sl?`<button class="btn sm ghost" type="button" data-act="ca-slip-pr" data-t="${esc(r.t)}" data-m="${m}">${icon('print')}Relevé</button>`:''}</td></tr>`;}).join('');
  return tb+`<div class="tbl-wrap"><table class="tbl stack cp-tbl"><thead><tr><th>Instructeur</th><th class="num">Heures</th><th class="num">Taux moyen</th><th class="num">Montant</th><th>État</th><th class="r"></th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>${pl(R.length,'instructeur','instructeurs')}</th><th class="num">${esc(hrFmt(sumC(R.map(r=>r.h))))} h</th><th></th><th class="num">${esc(fmtM(sumC(R.map(r=>r.mt))))}</th><th colspan="2"></th></tr></tfoot></table></div>
    <p class="help" style="margin-top:8px">${cur?'Le mois n’est pas terminé : la paie s’approuve une fois le mois fini. ':''}Les taux se règlent dans Réglages de la compta. « Marquer payé » inscrit la dépense au poste Salaires.</p>`;
}
/* Budget de l’année : prévu et réel par poste */
function cpBudgetPage(){
  const b=cpCfg().budget, E=cpE().filter(x=>x.type==='dep');
  const rows=CP_DEP.map(([k,l])=>{const p=+b[k]||0, r=sumC(E.filter(x=>x.poste===k).map(x=>x.ttc)), pc=p?Math.round(r/p*100):0, cls=!p?'':pc>100?'bad':pc>=85?'warn':'';
    return `<tr><td>${l}</td><td class="num"><input class="cp-in" id="ca-b-${k}" data-cpb="${k}" inputmode="decimal" autocomplete="off" value="${esc(p?moneyIn(p):'')}" placeholder="0,00" aria-label="Prévu : ${esc(l)}"></td><td class="num">${esc(fmtM(r))}</td><td class="num ${cls}">${p?esc(fmtM(p-r)):'—'}</td><td class="cp-bar">${p?`<div class="meter ${cls}"><i style="width:${Math.min(100,pc)}%"></i></div><small>${pc} %</small>`:''}</td></tr>`;}).join('');
  const P=sumC(CP_DEP.map(([k])=>+b[k]||0)), Rr=sumC(E.map(x=>x.ttc));
  return `<form data-form="ca-budget" novalidate><div class="tbl-wrap"><table class="tbl cp-tbl"><thead><tr><th>Poste</th><th class="num">Prévu</th><th class="num">Réel</th><th class="num">Reste</th><th>Utilisé</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>Total</th><th class="num">${esc(fmtM(P))}</th><th class="num">${esc(fmtM(Rr))}</th><th class="num ${P&&Rr>P?'bad':''}">${P?esc(fmtM(P-Rr)):'—'}</th><th></th></tr></tfoot></table></div>
    <div class="ps-save" style="margin-top:12px"><button class="btn primary" type="submit" id="ca-budget-save"${dis()}>Enregistrer le budget</button><span class="help">Le réel additionne les dépenses de chaque poste, taxes comprises.</span></div></form>`;
}
/* Rapports */
function cpRapPage(){
  const E=cpE(), ms=hrMonths(), sm=(t,m)=>sumC(E.filter(x=>x.type===t&&String(x.date).slice(0,7)===m).map(x=>x.ttc));
  const rows=ms.map(m=>{const r=sm('rev',m), d=sm('dep',m);return `<tr><td>${esc(hrMonthName(m))}</td><td class="num">${esc(fmtM(r))}</td><td class="num">${esc(fmtM(d))}</td><td class="num ${r-d<0?'bad':''}">${esc(fmtM(r-d))}</td></tr>`;}).join('');
  const dep=sumC(E.filter(x=>x.type==='dep').map(x=>x.ttc)), nEl=S.data.eleves.length, TR=taughtRows(), hrs=sumC(TR.map(r=>r.h)), sal=sumC(TR.map(r=>Math.round(r.h*cpRate(r.t,r.s))));
  /* coût par module : heures données au taux des instructeurs, et consommables utilisés pendant ses séances */
  const byM={};const mk=s=>{const k=modOf(s.c);return k?`M${k.code} ${k.nom||''}`.trim():(s.c.code||s.c.titre||'—');};
  for(const r of TR){const k=mk(r.s), o=byM[k]||(byM[k]={h:0,sal:0,con:0});o.h+=r.h;o.sal+=Math.round(r.h*cpRate(r.t,r.s));}
  for(const m of S.data.stockMvt||[]) if(m.type==='conso'&&m.seance){const s=findSess(m.seance.date,m.seance.key), a=byId(skArts(),m.art);if(!s||!a||!a.prix) continue;const k=mk(s), o=byM[k]||(byM[k]={h:0,sal:0,con:0});o.con+=Math.round((+m.qte||0)*a.prix);}
  const mods=Object.entries(byM).sort((a,b)=>collator.compare(a[0],b[0]));
  return `<div class="kpis">${cpKpi('cpr-el','Coût par élève',nEl?fmtM(Math.round(dep/nEl)):'—','',`dépenses ÷ ${pl(nEl,'élève','élèves')}`)}${cpKpi('cpr-h','Heures d’instruction',hrFmt(hrs)+' h','','données depuis la rentrée')}${cpKpi('cpr-ch','Coût d’une heure',hrs?fmtM(Math.round(sal/hrs)):'—','','au taux des instructeurs')}${cpKpi('cpr-sal','Salaires estimés',fmtM(sal),'','pour les heures données')}</div>
    <div class="two" style="margin-top:12px"><section class="panel"><h2>Par mois</h2><div class="tbl-wrap"><table class="tbl cp-tbl"><thead><tr><th>Mois</th><th class="num">Revenus</th><th class="num">Dépenses</th><th class="num">Solde</th></tr></thead><tbody>${rows}</tbody></table></div></section>
    <section class="panel"><h2>Par module</h2>${mods.length?`<div class="tbl-wrap"><table class="tbl cp-tbl"><thead><tr><th>Module</th><th class="num">Heures</th><th class="num">Instructeurs</th><th class="num">Consommables</th><th class="num">Total</th></tr></thead><tbody>${mods.map(([k,o])=>`<tr><td>${esc(k)}</td><td class="num">${esc(hrFmt(o.h))}</td><td class="num">${esc(fmtM(o.sal))}</td><td class="num">${esc(fmtM(o.con))}</td><td class="num"><b>${esc(fmtM(o.sal+o.con))}</b></td></tr>`).join('')}</tbody></table></div>`:'<p class="help">Aucune heure donnée pour l’instant.</p>'}</section></div>
    <section class="panel" style="margin-top:12px"><h2>Exporter pour le comptable</h2><div class="row">${[['ecritures','Toutes les écritures'],['frais','Frais des élèves'],['factures','Factures'],['paie','Paie du mois']].map(([k,l])=>`<button class="btn sm" type="button" id="ca-exp-${k}" data-act="ca-exp" data-v="${k}">${icon('down')}${l}</button>`).join('')}</div><p class="help" style="margin-top:6px">Des fichiers CSV qui s’ouvrent dans Excel et s’importent dans la plupart des logiciels comptables.</p></section>`;
}
/* Réglages de la compta */
function cpReglPage(){
  const c=cpCfg(), ts=teachers(), gs=groups(), T=c.tarifs.concat([{id:'',nom:'',montant:'',classe:'',ech:[]}]);
  const ech=(t,i,j)=>{const e=(t.ech||[])[j]||{};return `<div class="grid2 cp-ech"><label class="field"><span>Échéance ${j+1}</span><input type="date" data-tf="${i}" data-e="${j}" data-k="date" value="${esc(e.date||'')}"></label><label class="field"><span>Part (%)</span><input type="number" min="0" max="100" step="1" inputmode="numeric" data-tf="${i}" data-e="${j}" data-k="pct" value="${esc(e.pct==null?'':e.pct)}"></label></div>`;};
  return `<form data-form="ca-regl" class="ps-form" novalidate><div class="ps-top"><h2 class="ps-h">Réglages de la compta</h2><p class="help">Taxes, tarifs des élèves, taux des instructeurs et modes de paiement.</p></div><div class="ps-cards">
    <section class="panel ps-card"><h3>Taxes</h3><label class="ps-chk"><input type="checkbox" id="cr-tx"${c.taxes.on?' checked':''}><span><b>Facturer la TPS et la TVQ</b><small>Certaines formations professionnelles en sont exemptées : à confirmer avec votre comptable.</small></span></label>
      <div class="grid2"><label class="field"><span>TPS (%)</span><input id="cr-tps" inputmode="decimal" value="${esc(String(c.taxes.tps).replace('.',','))}"></label><label class="field"><span>TVQ (%)</span><input id="cr-tvq" inputmode="decimal" value="${esc(String(c.taxes.tvq).replace('.',','))}"></label></div></section>
    <section class="panel ps-card"><h3>Factures et paiements</h3><label class="field"><span>Préfixe des numéros de facture</span><input id="cr-pre" maxlength="8" value="${esc(c.prefixe)}"></label><p class="help">Ex. ${esc(c.prefixe)}${new Date().getFullYear()}-001</p>
      <label class="field"><span>Modes de paiement (un par ligne)</span><textarea id="cr-modes" rows="4" maxlength="300">${esc(c.modes.join('\n'))}</textarea></label></section>
    <section class="panel ps-card"><h3>Taux horaires des instructeurs</h3><div class="grid2"><label class="field"><span>Taux par défaut ($ / h)</span><input id="cr-taux" inputmode="decimal" value="${esc(moneyIn(c.taux.defaut))}"></label><span></span>
      <label class="field"><span>Théorie (facultatif)</span><input id="cr-taux-t" inputmode="decimal" value="${esc(moneyIn(c.taux.theorie))}" placeholder="Taux par défaut"></label><label class="field"><span>Pratique (facultatif)</span><input id="cr-taux-p" inputmode="decimal" value="${esc(moneyIn(c.taux.pratique))}" placeholder="Taux par défaut"></label></div>
      <details class="cp-det"${Object.keys(c.taux.par).length?' open':''}><summary>Un taux pour un instructeur</summary><div class="cp-tx">${ts.map(t=>`<label class="field"><span>${esc(t.nom)}</span><input data-tp="${esc(t.id)}" inputmode="decimal" value="${esc(moneyIn(c.taux.par[t.id]))}" placeholder="—"></label>`).join('')}</div></details>
      <p class="help">Ordre : le taux de l’instructeur, sinon celui du type de séance, sinon le taux par défaut.</p></section>
    <section class="panel ps-card ps-wide"><h3>Tarifs des élèves</h3><p class="help">Chaque élève doit les tarifs de sa classe (ou de toutes les classes), payables selon les échéances. Sans échéance, le montant est dû tout de suite.</p>
      <div class="cp-tarifs">${T.map((t,i)=>`<fieldset class="cp-tarif"><legend>${t.id?esc(t.nom):'Nouveau tarif'}</legend>
        <div class="grid2"><label class="field"><span>Nom</span><input data-tf="${i}" data-k="nom" maxlength="60" value="${esc(t.nom||'')}" placeholder="Ex. Frais de formation"></label><label class="field"><span>Montant ($)</span><input data-tf="${i}" data-k="montant" inputmode="decimal" value="${esc(t.montant===''?'':moneyIn(t.montant))}" placeholder="0,00"></label></div>
        <label class="field"><span>Pour</span><select data-tf="${i}" data-k="classe"><option value="">Toutes les classes</option>${gs.map(g=>`<option value="${esc(g.id)}"${t.classe===g.id?' selected':''}>${esc(g.nom)}</option>`).join('')}</select></label>
        ${[0,1,2].map(j=>ech(t,i,j)).join('')}${t.id?'<p class="help">Videz le nom pour retirer ce tarif.</p>':''}</fieldset>`).join('')}</div></section></div>
    <div class="ps-save"><button class="btn primary" type="submit" id="ca-regl-save"${dis()}>Enregistrer</button></div></form>`;
}
/* ---------- Fenêtres : compte d’un élève, facture, écriture, relevé de paie ---------- */
function comptaDrawer(){
  const d=S.dr;
  if(d.mode==='eleve') return cpElDrawer(d);
  if(d.mode==='fact') return cpFactDrawer(d);
  if(d.mode==='factEdit') return cpFactForm(d);
  if(d.mode==='entry') return cpEntryForm(d);
  if(d.mode==='slip') return cpSlipDrawer(d);
  return goneHTML('Compta');
}
const cpField=(id,l,v,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(v==null?'':v)}" ${att||''}></label>`;
const cpModes=(id,v)=>`<label class="field"><span>Mode</span><select id="${id}">${cpCfg().modes.map(m=>`<option${v===m?' selected':''}>${esc(m)}</option>`).join('')}</select></label>`;
function cpElDrawer(d){
  const e=byId(S.data.eleves,d.id);if(!e) return goneHTML('Élève');
  const f=cpFee(e), E=f.E.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const fact=(l,v,cls)=>`<div><dt>${l}</dt><dd class="${cls||''}">${v}</dd></div>`;
  return dTop('Compte de l’élève',esc(e.nom),esc(gName(e.groupe)))
    +`<div class="dr-body"><dl class="facts">${fact('Dû',esc(fmtM(f.du)))}${fact('Payé',esc(fmtM(f.paid)))}${fact('Réductions',esc(fmtM(f.red)))}${fact('Solde',`<b>${esc(fmtM(f.solde))}</b>`)}${fact('En retard',esc(fmtM(f.retard)),f.retard?'bad-t':'')}${fact('Prochaine échéance',f.next?esc(shortDate(parse(f.next.date))+' · '+fmtM(f.next.m)):'—')}</dl>
      <h3 class="sb-h3" style="margin-top:14px">Tarifs</h3>${f.T.length?`<ul class="plist">${f.T.map(t=>`<li><span>${esc(t.nom)}<span class="muted sm">${(t.ech||[]).filter(y=>y.date&&+y.pct>0).length?' · '+esc((t.ech||[]).filter(y=>y.date&&+y.pct>0).map(y=>`${y.pct} % le ${shortDate(parse(y.date))}`).join(', ')):''}</span></span><b>${esc(fmtM(t.montant))}</b></li>`).join('')}</ul>`:'<p class="help">Aucun tarif pour sa classe.</p>'}
      <form class="cp-box" data-form="ca-pay-el" novalidate><h3 class="sb-h3">${d.sub==='red'?'Accorder une réduction':'Enregistrer un paiement'}</h3>
        <div class="grid2">${cpField('cx-mt','Montant ($)',moneyIn(d.sub==='red'?'':f.retard||Math.max(0,f.solde)||''),'inputmode="decimal" autocomplete="off" placeholder="0,00"')}${cpField('cx-date','Date',todayISO(),'type="date"')}</div>
        ${d.sub==='red'?cpField('cx-note','Raison','','maxlength="120" autocomplete="off" placeholder="Ex. bourse, entente de paiement"'):`<div class="grid2">${cpModes('cx-mode')}${cpField('cx-note','Note (facultatif)','','maxlength="120" autocomplete="off"')}</div>`}
        <div class="row"><button class="btn primary" type="submit"${dis()}>${d.sub==='red'?'Accorder':'Enregistrer le paiement'}</button><button class="btn ghost" type="button" data-act="ca-sub" data-v="${d.sub==='red'?'':'red'}">${d.sub==='red'?'Plutôt un paiement':'Accorder une réduction'}</button></div></form>
      <h3 class="sb-h3" style="margin-top:14px">Paiements et réductions</h3>${E.length?`<ul class="plist">${E.map(x=>`<li><span>${esc(shortDate(parse(x.date)))} · ${x.type==='red'?'Réduction':esc(x.mode||'Paiement')}${x.note?` <span class="muted sm">· ${esc(x.note)}</span>`:''}</span><span class="row"><b class="cp-amt ${x.type==='red'?'':'rev'}">${esc(fmtM(x.ttc))}</b>${x.type==='rev'?`<button class="btn sm ghost" type="button" data-act="ca-recu" data-id="${esc(x.id)}" aria-label="Imprimer le reçu">${icon('print')}Reçu</button>`:''}<button class="btn sm ghost" type="button" data-act="ca-entry-del" data-id="${esc(x.id)}" aria-label="Retirer">${icon('x')}</button></span></li>`).join('')}</ul>`:'<p class="help">Aucun paiement.</p>'}
      <div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-act="ca-releve" data-id="${esc(e.id)}">${icon('print')}Relevé de compte</button></div></div>`;
}
function cpFactDrawer(d){
  const f=byId(S.data.factures||[],d.id);if(!f) return goneHTML('Facture');
  const t=cpFTot(f), s=cpFState(f), p=cpFPaid(f), pays=cpE().filter(x=>x.type==='rev'&&x.facture===f.id), open=s==='envoyee'||s==='retard';
  return dTop('Facture',esc(f.num||''),esc(f.client||''))
    +`<div class="dr-body"><p><span class="chip ${CP_FS[s][0]}">${CP_FS[s][1]}</span> <span class="muted sm">Émise le ${esc(f.date?longDate(parse(f.date)):'—')}${f.echeance?' · payable le '+esc(longDate(parse(f.echeance))):''}</span></p>
      <table class="tbl cp-lines"><thead><tr><th>Description</th><th class="num">Qté</th><th class="num">Prix</th><th class="num">Montant</th></tr></thead><tbody>${(f.lignes||[]).map(l=>`<tr><td>${esc(l.d)}</td><td class="num">${esc(String(l.q))}</td><td class="num">${esc(fmtM(l.p))}</td><td class="num">${esc(fmtM(Math.round(l.q*l.p)))}</td></tr>`).join('')}</tbody>
        <tfoot><tr><th colspan="3">Sous-total</th><th class="num">${esc(fmtM(t.ht))}</th></tr>${f.tx?`<tr><th colspan="3">TPS (${esc(String(f.tx.tps).replace('.',','))} %)</th><th class="num">${esc(fmtM(t.tps))}</th></tr><tr><th colspan="3">TVQ (${esc(String(f.tx.tvq).replace('.',','))} %)</th><th class="num">${esc(fmtM(t.tvq))}</th></tr>`:''}<tr><th colspan="3">Total</th><th class="num">${esc(fmtM(t.ttc))}</th></tr><tr><th colspan="3">Payé</th><th class="num">${esc(fmtM(p))}</th></tr><tr><th colspan="3">Solde</th><th class="num"><b>${esc(fmtM(t.ttc-p))}</b></th></tr></tfoot></table>
      ${open?`<form class="cp-box" data-form="ca-fact-pay" novalidate><h3 class="sb-h3">Enregistrer un paiement</h3><div class="grid2">${cpField('cx-mt','Montant ($)',moneyIn(t.ttc-p),'inputmode="decimal" autocomplete="off"')}${cpField('cx-date','Date',todayISO(),'type="date"')}</div><div class="grid2">${cpModes('cx-mode')}<span></span></div><div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer le paiement</button></div></form>`:''}
      ${pays.length?`<h3 class="sb-h3" style="margin-top:12px">Paiements</h3><ul class="plist">${pays.map(x=>`<li><span>${esc(shortDate(parse(x.date)))} · ${esc(x.mode||'')}</span><b class="cp-amt rev">${esc(fmtM(x.ttc))}</b></li>`).join('')}</ul>`:''}
      <div class="row" style="margin-top:14px">${s==='brouillon'?`<button class="btn sm primary" type="button" id="ca-fact-send" data-act="ca-fact-send"${dis()}>Marquer envoyée</button><button class="btn sm" type="button" data-act="ca-fact-edit">Modifier</button>`:''}<button class="btn sm" type="button" id="ca-fact-pr" data-act="ca-fact-pr">${icon('print')}Imprimer</button>${s!=='annulee'&&s!=='payee'?`<button class="btn sm ghost" type="button" data-act="ca-fact-cancel"${dis()}>Annuler la facture</button>`:''}</div></div>`;
}
function cpFactForm(d){
  const f=d.id?byId(S.data.factures||[],d.id):null, x=f||{date:todayISO(),echeance:iso(addDays(new Date(),30)),lignes:[],tx:cpCfg().taxes.on?{}:null};
  const L=(x.lignes||[]).concat(Array.from({length:Math.max(2,5-(x.lignes||[]).length)},()=>({d:'',q:'',p:''})));
  return dTop(f?'Modifier':'Nouvelle facture',f?esc(f.num):'Facturer un client')
    +`<form class="dr-body" data-form="ca-fact" novalidate>${cpField('cf-client','Client',x.client,'maxlength="80" autocomplete="off" placeholder="Ex. Ville de Saint-Jérôme, service incendie"')}
      ${cpField('cf-adresse','Adresse',x.adresse,'maxlength="120" autocomplete="off"')}${cpField('cf-courriel','Courriel',x.courriel,'type="email" maxlength="80" autocomplete="off"')}
      <div class="grid2">${cpField('cf-date','Date',x.date,'type="date"')}${cpField('cf-ech','Payable le',x.echeance,'type="date"')}</div>
      <fieldset><legend>Lignes</legend><div class="cp-fl">${L.map((l,i)=>`<div class="cp-fli"><label class="field"><span${i?' class="vh"':''}>Description</span><input data-fl="${i}" data-k="d" maxlength="120" autocomplete="off" value="${esc(l.d||'')}"></label><label class="field"><span${i?' class="vh"':''}>Qté</span><input data-fl="${i}" data-k="q" inputmode="decimal" value="${esc(l.q===''?'':String(l.q).replace('.',','))}"></label><label class="field"><span${i?' class="vh"':''}>Prix ($)</span><input data-fl="${i}" data-k="p" inputmode="decimal" value="${esc(l.p===''?'':moneyIn(l.p))}"></label></div>`).join('')}</div></fieldset>
      <label class="ps-chk"><input type="checkbox" id="cf-tx"${x.tx?' checked':''}><span><b>Ajouter la TPS et la TVQ</b><small>Aux taux des réglages (${esc(String(cpCfg().taxes.tps).replace('.',','))} % et ${esc(String(cpCfg().taxes.tvq).replace('.',','))} %).</small></span></label>
      <label class="field"><span>Note sur la facture</span><textarea id="cf-note" rows="2" maxlength="300">${esc(x.note||'')}</textarea></label>
      <div class="row"><button class="btn primary" type="submit"${dis()}>${f?'Enregistrer':'Créer la facture'}</button><button class="btn ghost" type="button" data-act="${f?'ca-fact-view':'close'}">Annuler</button></div></form>`;
}
function cpEntryForm(d){
  const x=d.id?byId(cpE(),d.id):null, t=x?x.type:d.t||'dep', P=t==='dep'?CP_DEP:CP_REV;
  if(d.id&&!x) return goneHTML('Écriture');
  return dTop(t==='dep'?'Dépense':'Revenu',x?esc(x.libelle||cpPoste(t,x.poste)):t==='dep'?'Nouvelle dépense':'Autre revenu')
    +`<form class="dr-body" data-form="ca-entry" data-t="${t}" novalidate><div class="grid2">${cpField('ce-date','Date',x?x.date:todayISO(),'type="date"')}<label class="field"><span>Poste</span><select id="ce-poste">${P.filter(p=>t==='dep'||p[0]!=='frais').map(([k,l])=>`<option value="${k}"${(x?x.poste:t==='dep'?'materiel':'subv')===k?' selected':''}>${l}</option>`).join('')}</select></label></div>
      ${cpField('ce-lib','Libellé',x?x.libelle:'','maxlength="100" autocomplete="off" placeholder="'+(t==='dep'?'Ex. Réparation de l’autopompe':'Ex. Subvention du ministère')+'"')}${cpField('ce-tiers',t==='dep'?'Fournisseur':'Provenance',x?x.tiers:'','maxlength="80" autocomplete="off"')}
      <div class="grid2">${cpField('ce-mt','Montant avant taxes ($)',x?moneyIn(x.ht):'','inputmode="decimal" autocomplete="off" placeholder="0,00"')}${cpModes('ce-mode',x?x.mode:'')}</div>
      <label class="ps-chk"><input type="checkbox" id="ce-tx"${x?(x.tps||x.tvq?' checked':''):cpCfg().taxes.on&&t==='dep'?' checked':''}><span><b>Avec TPS et TVQ</b><small>Calculées aux taux des réglages.</small></span></label>
      ${cpField('ce-note','Note (facultatif)',x?x.note:'','maxlength="200" autocomplete="off"')}
      <div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button><button class="btn ghost" type="button" data-act="close">Annuler</button>${x?`<span class="grow"></span><button class="btn sm ghost" type="button" data-act="ca-entry-del" data-id="${esc(x.id)}">Retirer l’écriture</button>`:''}</div></form>`;
}
function cpSlipDrawer(d){
  const R=cpPayRows(d.m).find(r=>r.t===d.t), sl=cpSlip(d.t,d.m), L=sl?sl.lignes:R?R.lignes:[];
  return dTop('Paie · '+esc(hrMonthName(d.m)),esc(tName(d.t)),sl?(sl.statut==='paye'?'Payé':'Approuvé'):'À approuver')
    +`<div class="dr-body"><table class="tbl cp-lines"><thead><tr><th>Date</th><th>Séance</th><th class="num">Heures</th><th class="num">Taux</th><th class="num">Montant</th></tr></thead><tbody>${L.map(l=>`<tr><td>${esc(shortDate(parse(l.date)))}</td><td>${esc(l.titre)}</td><td class="num">${esc(hrFmt(l.h))}</td><td class="num">${esc(fmtM(l.taux))}</td><td class="num">${esc(fmtM(Math.round(l.h*l.taux)))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th colspan="2">Total</th><th class="num">${esc(hrFmt(sumC(L.map(l=>l.h))))}</th><th></th><th class="num">${esc(fmtM(sumC(L.map(l=>Math.round(l.h*l.taux)))))}</th></tr></tfoot></table>
      <div class="row" style="margin-top:12px">${!sl&&d.m<todayISO().slice(0,7)?`<button class="btn sm primary" type="button" data-act="ca-paie-ok" data-t="${esc(d.t)}" data-m="${d.m}"${dis()}>Approuver</button>`:''}${sl?`<button class="btn sm" type="button" data-act="ca-slip-pr" data-t="${esc(d.t)}" data-m="${d.m}">${icon('print')}Imprimer le relevé</button>`:''}</div></div>`;
}
/* ---------- Enregistrement ---------- */
const cpId=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const cpEntry=x=>Object.assign({ht:0,tps:0,tvq:0,ttc:0,mode:'',libelle:'',tiers:'',eleve:'',facture:'',paie:'',note:'',par:whoAmI(),le:new Date().toISOString()},x);
async function cpPut(id,doc,msg){S.busy=true;renderDrawer();const ok=await write(()=>col('compta').doc(id).set(doc),msg);S.busy=false;render();return ok;}
/* Une dépense venue d’ailleurs (Stock) */
async function cpAutoDepense(x){const t=cpTax(x.ht,false);return write(()=>col('compta').doc(cpId('e')).set(cpEntry(Object.assign({type:'dep',ttc:x.ht+t.tps+t.tvq},t,x))),'Dépense inscrite dans la Compta');}
async function cpPayEl(f){
  const d=S.dr, e=byId(S.data.eleves,d.id);if(!e) return;
  const q=id=>f.querySelector('#'+id), mt=money(q('cx-mt').value);
  if(!mt){toast('Indiquez un montant valide.','bad');return;}
  const red=d.sub==='red', x=cpEntry({date:q('cx-date').value||todayISO(),type:red?'red':'rev',poste:'frais',ht:mt,ttc:mt,eleve:e.id,mode:red?'':q('cx-mode').value,note:q('cx-note').value.trim(),libelle:(red?'Réduction · ':'Frais · ')+e.nom});
  if(red&&!x.note){toast('Indiquez la raison de la réduction.','bad');return;}
  if(await cpPut(cpId('e'),x,red?'Réduction accordée':'Paiement enregistré')){S.dr.sub='';renderDrawer();}
}
async function cpSaveFact(f){
  const d=S.dr, q=id=>f.querySelector('#'+id), v=id=>String(q(id).value).trim(), old=d.id?byId(S.data.factures||[],d.id):null;
  const client=v('cf-client');if(!client){toast('Indiquez le client.','bad');return;}
  const L=[];for(const i of new Set([...f.querySelectorAll('[data-fl]')].map(x=>x.dataset.fl))){const g=k=>f.querySelector(`[data-fl="${i}"][data-k="${k}"]`).value.trim();const dd=g('d');if(!dd&&!g('p'))continue;
    const qq=+g('q').replace(',','.')||1, p=money(g('p'));if(!dd||p==null){toast('Chaque ligne a besoin d’une description et d’un prix.','bad');return;}L.push({d:dd,q:qq,p});}
  if(!L.length){toast('Ajoutez au moins une ligne.','bad');return;}
  const c=cpCfg(), yr=(v('cf-date')||todayISO()).slice(0,4);
  let num=old?old.num:'';
  if(!num){const pre=c.prefixe+yr+'-', n=(S.data.factures||[]).filter(x=>String(x.num||'').startsWith(pre)).map(x=>+String(x.num).slice(pre.length)||0);num=pre+String((n.length?Math.max(...n):0)+1).padStart(3,'0');}
  const doc=Object.assign({},old||{statut:'brouillon',cree:new Date().toISOString(),par:whoAmI()},{num,client,adresse:v('cf-adresse'),courriel:v('cf-courriel'),date:v('cf-date')||todayISO(),echeance:v('cf-ech'),lignes:L,tx:q('cf-tx').checked?{tps:c.taxes.tps,tvq:c.taxes.tvq}:null,note:v('cf-note')});
  delete doc.id;
  const id=d.id||cpId('f');
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('compta-factures').doc(id).set(doc),old?'Facture enregistrée':`Facture ${num} créée`);
  S.busy=false;if(ok){S.dr={kind:'cpt',mode:'fact',id,uid:S.dr.uid};}render();
}
async function cpFactPay(f){
  const fa=byId(S.data.factures||[],S.dr.id);if(!fa) return;
  const q=id=>f.querySelector('#'+id), mt=money(q('cx-mt').value);if(!mt){toast('Indiquez un montant valide.','bad');return;}
  await cpPut(cpId('e'),cpEntry({date:q('cx-date').value||todayISO(),type:'rev',poste:'factures',ht:mt,ttc:mt,mode:q('cx-mode').value,facture:fa.id,tiers:fa.client,libelle:'Facture '+fa.num}),'Paiement enregistré');
}
async function cpSaveEntry(f){
  const d=S.dr, q=id=>f.querySelector('#'+id), v=id=>String(q(id).value).trim(), t=f.dataset.t, mt=money(v('ce-mt'));
  if(mt==null||!mt){toast('Indiquez un montant valide.','bad');return;}
  const old=d.id?byId(cpE(),d.id):null;
  const x=Object.assign({},old||cpEntry({}),{date:v('ce-date')||todayISO(),type:t,poste:v('ce-poste'),libelle:v('ce-lib'),tiers:v('ce-tiers'),ht:mt,tps:q('ce-tx').checked?Math.round(mt*cpCfg().taxes.tps/100):0,tvq:q('ce-tx').checked?Math.round(mt*cpCfg().taxes.tvq/100):0,mode:v('ce-mode'),note:v('ce-note')});
  x.ttc=x.ht+x.tps+x.tvq;delete x.id;
  if(await cpPut(d.id||cpId('e'),x,old?'Écriture enregistrée':t==='dep'?'Dépense enregistrée':'Revenu enregistré')) closeDrawer(true);
}
async function cpApprove(t,m){
  const r=cpPayRows(m).find(x=>x.t===t);if(!r) return false;
  return write(()=>col('compta-paie').doc(m+'_'+t).set({mois:m,ens:t,h:r.h,montant:r.mt,lignes:r.lignes,statut:'approuve',le:new Date().toISOString(),par:whoAmI()}),'Paie approuvée');
}
async function cpPaid(id){
  const sl=(S.data.paie||[]).find(p=>p.id===id);if(!sl) return;
  await runAll([()=>col('compta-paie').doc(id).update({statut:'paye',payeLe:new Date().toISOString()}),()=>col('compta').doc(cpId('e')).set(cpEntry({date:todayISO(),type:'dep',poste:'salaires',ht:sl.montant,ttc:sl.montant,paie:id,tiers:tName(sl.ens),libelle:`Paie · ${tName(sl.ens)} · ${hrMonthName(sl.mois)}`}))],'Paie marquée payée');
}
async function cpSaveBudget(f){
  const b={};for(const x of f.querySelectorAll('[data-cpb]')){const v=x.value.trim();if(!v)continue;const m=money(v);if(m==null){toast('Un montant du budget n’est pas valide.','bad');return;}b[x.dataset.cpb]=m;}
  const c=Object.assign({},S.data.cptCfg||{},{budget:b});delete c.id;
  await write(()=>DB.doc('compta-reglages/ecole').set(c),'Budget enregistré');
}
async function cpSaveRegl(f){
  const q=id=>f.querySelector('#'+id), pc=id=>{const n=+String(q(id).value).replace(',','.');return n>=0&&n<=50?n:null;};
  const tps=pc('cr-tps'), tvq=pc('cr-tvq');if(tps==null||tvq==null){toast('Les taux de taxes sont entre 0 et 50 %.','bad');return;}
  const td=money(q('cr-taux').value);if(td==null){toast('Le taux horaire par défaut n’est pas valide.','bad');return;}
  const opt=id=>{const v=q(id).value.trim();return v?money(v):null;}, par={};
  for(const x of f.querySelectorAll('[data-tp]')){const v=x.value.trim();if(!v)continue;const m=money(v);if(m==null){toast('Un taux d’instructeur n’est pas valide.','bad');return;}par[x.dataset.tp]=m;}
  const tarifs=[];
  for(const i of new Set([...f.querySelectorAll('[data-tf]')].map(x=>x.dataset.tf))){
    const g=k=>{const x=f.querySelector(`[data-tf="${i}"][data-k="${k}"]:not([data-e])`);return x?x.value.trim():'';}, nom=g('nom');if(!nom) continue;
    const m=money(g('montant'));if(!m){toast(`Le montant du tarif « ${nom} » n’est pas valide.`,'bad');return;}
    const ech=[];for(const j of [0,1,2]){const dt=(f.querySelector(`[data-tf="${i}"][data-e="${j}"][data-k="date"]`)||{}).value, p=+(f.querySelector(`[data-tf="${i}"][data-e="${j}"][data-k="pct"]`)||{}).value;if(dt&&p>0)ech.push({date:dt,pct:p});}
    if(ech.length&&sumC(ech.map(x=>x.pct))!==100){toast(`Les échéances du tarif « ${nom} » doivent totaliser 100 %.`,'bad');return;}
    const old=cpCfg().tarifs[+i];tarifs.push({id:old&&old.id?old.id:cpId('t'),nom,montant:m,classe:g('classe'),ech});
  }
  const c=Object.assign({},S.data.cptCfg||{},{taxes:{on:q('cr-tx').checked,tps,tvq},prefixe:q('cr-pre').value.trim(),modes:[...new Set(q('cr-modes').value.split('\n').map(x=>x.trim()).filter(Boolean))],taux:{defaut:td,theorie:opt('cr-taux-t'),pratique:opt('cr-taux-p'),par}});
  delete c.id;delete c.tarifs;
  const cd=configDoc();cd.tarifs=tarifs;
  S.busy=true;render();
  await write(async()=>{await DB.doc('compta-reglages/ecole').set(c);await DB.doc('config/ecole').set(cd);},'Réglages de la compta enregistrés');
  S.busy=false;render();
}
/* ---------- Impressions et exports ---------- */
async function cpPrintFact(f){
  const t=cpFTot(f), p=cpFPaid(f);
  const body=`<section class="pr-page">${prHead('Facture '+(f.num||''),'Émise le '+esc(f.date?longDate(parse(f.date)):'')+(f.echeance?' · payable le '+esc(longDate(parse(f.echeance))):''))}
    <p class="pr-to"><b>Facturé à</b><br>${esc(f.client||'')}${f.adresse?'<br>'+esc(f.adresse):''}${f.courriel?'<br>'+esc(f.courriel):''}</p>
    <table class="pr-t"><thead><tr><th>Description</th><th>Qté</th><th>Prix</th><th>Montant</th></tr></thead><tbody>${(f.lignes||[]).map(l=>`<tr><td>${esc(l.d)}</td><td>${esc(String(l.q))}</td><td>${esc(fmtM(l.p))}</td><td>${esc(fmtM(Math.round(l.q*l.p)))}</td></tr>`).join('')}</tbody>
      <tfoot><tr><th colspan="3">Sous-total</th><td>${esc(fmtM(t.ht))}</td></tr>${f.tx?`<tr><th colspan="3">TPS</th><td>${esc(fmtM(t.tps))}</td></tr><tr><th colspan="3">TVQ</th><td>${esc(fmtM(t.tvq))}</td></tr>`:''}<tr><th colspan="3">Total</th><td><b>${esc(fmtM(t.ttc))}</b></td></tr>${p?`<tr><th colspan="3">Déjà payé</th><td>${esc(fmtM(p))}</td></tr><tr><th colspan="3">Solde</th><td><b>${esc(fmtM(t.ttc-p))}</b></td></tr>`:''}</tfoot></table>
    ${f.note?`<p class="pr-note">${esc(f.note)}</p>`:''}${prFoot()}</section>`;
  await printDoc('Facture '+(f.num||''),body,false,'facture-'+prSlug(f.num||'facture'));
}
async function cpPrintRecu(x,src){
  const e=x.eleve?(byId(S.data.eleves,x.eleve)||(x.eleve===S.student?subject().rec:null)):null;
  const body=`<section class="pr-page">${prHead('Reçu de paiement',esc(e?e.nom:x.tiers||'')+' · '+esc(longDate(parse(x.date))))}<table class="pr-t"><tbody><tr><th>Reçu de</th><td>${esc(e?e.nom+' ('+gName(e.groupe)+')':x.tiers||'')}</td></tr><tr><th>Pour</th><td>${esc(x.libelle||cpPoste('rev',x.poste))}</td></tr><tr><th>Mode</th><td>${esc(x.mode||'')}</td></tr><tr><th>Montant</th><td><b>${esc(fmtM(x.ttc))}</b></td></tr></tbody></table>${e?`<p class="pr-note">Solde du compte : ${esc(fmtM(cpFee(Object.assign({id:x.eleve},e),src).solde))}.</p>`:''}${prFoot()}</section>`;
  await printDoc('Reçu · '+(e?e.nom:''),body,false,'recu-'+prSlug(e?e.nom:x.id));
}
async function cpPrintReleve(e,src){
  const f=cpFee(e,src), E=f.E.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const body=`<section class="pr-page">${prHead('Relevé de compte',esc(e.nom)+' · '+esc(gName(e.groupe)))}<table class="pr-t"><thead><tr><th>Date</th><th>Description</th><th>Montant</th></tr></thead><tbody>${f.T.map(t=>`<tr><td></td><td>${esc(t.nom)}</td><td>${esc(fmtM(t.montant))}</td></tr>`).join('')}${E.map(x=>`<tr><td>${esc(shortDate(parse(x.date)))}</td><td>${x.type==='red'?'Réduction':'Paiement'}${x.mode?' · '+esc(x.mode):''}${x.note?' · '+esc(x.note):''}</td><td>−${esc(fmtM(x.ttc))}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">Solde</th><td><b>${esc(fmtM(f.solde))}</b></td></tr></tfoot></table>${f.next?`<p class="pr-note">Prochaine échéance : ${esc(fmtM(f.next.m))} le ${esc(longDate(parse(f.next.date)))}.</p>`:''}${prFoot()}</section>`;
  await printDoc('Relevé · '+e.nom,body,false,'releve-compte-'+prSlug(e.nom));
}
async function cpPrintSlip(t,m){
  const sl=cpSlip(t,m)||myPaie(t).find(p=>p.mois===m);if(!sl) return;
  const body=`<section class="pr-page">${prHead('Relevé de paie',esc(tName(t))+' · '+esc(hrMonthName(m)))}<table class="pr-t"><thead><tr><th>Date</th><th>Séance</th><th>Heures</th><th>Taux</th><th>Montant</th></tr></thead><tbody>${sl.lignes.map(l=>`<tr><td>${esc(shortDate(parse(l.date)))}</td><td>${esc(l.titre)}</td><td>${esc(hrFmt(l.h))}</td><td>${esc(fmtM(l.taux))}</td><td>${esc(fmtM(Math.round(l.h*l.taux)))}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">Total</th><td>${esc(hrFmt(sl.h))}</td><td></td><td><b>${esc(fmtM(sl.montant))}</b></td></tr></tfoot></table>${prFoot()}</section>`;
  await printDoc('Paie · '+tName(t),body,false,'paie-'+m+'-'+prSlug(tName(t)));
}
async function cpExport(kind,m){
  const day=todayISO(), num=c=>((+c||0)/100).toFixed(2), csv=(n,rows)=>saveFile(`pompiernote-${n}-${day}.csv`,new Blob([csvText(rows)],{type:'text/csv'}));
  if(kind==='frais') return csv('frais-eleves',[['Élève','Classe','Dû','Payé','Réductions','Solde','En retard','État']].concat(sortElsByClass(S.data.eleves).map(e=>{const f=cpFee(e);return [e.nom,gName(e.groupe),num(f.du),num(f.paid),num(f.red),num(f.solde),num(f.retard),CP_FE[f.etat][1]];})));
  if(kind==='factures') return csv('factures',[['Numéro','Client','Date','Échéance','Avant taxes','TPS','TVQ','Total','Payé','État']].concat(cpFacts().map(f=>{const t=cpFTot(f);return [f.num,f.client,f.date,f.echeance,num(t.ht),num(t.tps),num(t.tvq),num(t.ttc),num(cpFPaid(f)),CP_FS[cpFState(f)][1]];})));
  if(kind==='paie'){const mm=m||S.pg.cm||hrMonths().slice(-1)[0];return csv('paie-'+mm,[['Instructeur','Mois','Heures','Montant','État']].concat(cpPayRows(mm).map(r=>{const sl=cpSlip(r.t,mm);return [tName(r.t),mm,String(sl?sl.h:r.h).replace('.',','),num(sl?sl.montant:r.mt),sl?sl.statut==='paye'?'Payé':'Approuvé':'À approuver'];})));}
  return csv('ecritures',[['Date','Type','Poste','Libellé','Tiers','Élève','Mode','Avant taxes','TPS','TVQ','Total','Note']].concat(cpE().slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(x=>[x.date,x.type==='dep'?'Dépense':x.type==='red'?'Réduction':'Revenu',cpPoste(x.type==='red'?'rev':x.type,x.poste),x.libelle,x.tiers,x.eleve?(byId(S.data.eleves,x.eleve)||{}).nom:'',x.mode,num(x.ht),num(x.tps),num(x.tvq),num(x.ttc),x.note])));
}
/* ---------- Ce que chacun voit de lui-même (profil) ----------
   L’élève : son équipement attribué et son compte ; l’enseignant : ses relevés de paie. L’administration a déjà tout ;
   les autres ne lisent que leurs propres documents (stock.aId, compta.eleve, compta-paie.ens). */
let unsubMine=[];
function ensureMine(){
  const who=S.role==='student'?S.student:S.role==='teacher'?S.teacher:'', k=S.role+'|'+who;
  if(!DB||S.archive||S._mineFor===k) return;
  unsubMine.forEach(u=>{try{u();}catch(e){}});unsubMine=[];S._mineFor=k;S.data.mesStk=[];S.data.mesCpt=[];S.data.mesPaie=[];
  if(!who||S.canAdmin!==false) return;
  const sub=(q,key)=>{try{unsubMine.push(q.onSnapshot(x=>{if(S._mineFor!==k)return;S.data[key]=x.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{}));}catch(e){}};
  if(S.role==='student'){if(permOn('equipEl'))sub(col('stock').where('aId','==',who),'mesStk');if(permOn('compteEl'))sub(col('compta').where('eleve','==',who),'mesCpt');}
  else if(permOn('paieEns')) sub(col('compta-paie').where('ens','==',who),'mesPaie');
}
const mine=()=>S.canAdmin!==false;
const myStk=id=>(mine()?skArts():S.data.mesStk||[]).filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===id);
const myCpt=()=>mine()?cpE():S.data.mesCpt||[];
const myPaie=id=>(mine()?S.data.paie||[]:S.data.mesPaie||[]).filter(p=>p.ens===id);
function myStudentPanels(e){
  let h='';
  if(permOn('equipEl')){
    const A=myStk(e.id);
    h+=`<section class="panel" id="pf-equip"><h2>Mon équipement</h2>${A.length?`<ul class="acc-list">${A.map(a=>`<li><span>${esc(a.nom)}<span class="muted sm">${esc([' · '+(a.code||''),a.taille?'taille '+a.taille:''].filter(x=>x&&x!==' · ').join(' · '))}</span></span><span class="muted sm">${a.attrib.le?'reçu le '+esc(shortDate(new Date(a.attrib.le))):''}</span></li>`).join('')}</ul>
      <div class="row" style="margin-top:10px"><button class="btn sm ghost" type="button" data-act="stk-dot-pr" data-id="${esc(e.id)}">${icon('print')}Ma feuille de dotation</button></div>`:'<p class="help">Aucun équipement ne vous est attribué.</p>'}</section>`;
  }
  if(permOn('compteEl')&&cpCfg().tarifs.length){
    const f=cpFee(e,myCpt()), P=f.E.filter(x=>x.type==='rev').sort((a,b)=>String(b.date).localeCompare(String(a.date)));
    h+=`<section class="panel" id="pf-compte"><h2>Mon compte</h2><dl class="facts"><div><dt>Solde</dt><dd><b>${esc(fmtM(f.solde))}</b></dd></div><div><dt>En retard</dt><dd class="${f.retard?'bad-t':''}">${esc(fmtM(f.retard))}</dd></div>
      <div><dt>Prochaine échéance</dt><dd>${f.next?esc(shortDate(parse(f.next.date))+' · '+fmtM(f.next.m)):'—'}</dd></div><div><dt>Payé</dt><dd>${esc(fmtM(f.paid))}</dd></div></dl>
      ${P.length?`<ul class="acc-list" style="margin-top:10px">${P.slice(0,6).map(x=>`<li><span>${esc(shortDate(parse(x.date)))} · ${esc(x.mode||'Paiement')}</span><span class="row"><b>${esc(fmtM(x.ttc))}</b><button class="btn sm ghost" type="button" data-act="ca-recu" data-id="${esc(x.id)}" aria-label="Imprimer le reçu">${icon('print')}</button></span></li>`).join('')}</ul>`:''}
      <div class="row" style="margin-top:10px"><button class="btn sm ghost" type="button" data-act="ca-releve" data-id="${esc(e.id)}">${icon('print')}Mon relevé de compte</button></div></section>`;
  }
  return h;
}
function myTeacherPanel(id){
  if(!permOn('paieEns')) return '';
  const L=myPaie(id).slice().sort((a,b)=>String(b.mois).localeCompare(String(a.mois))), m=todayISO().slice(0,7), h=sumC(taughtRows().filter(r=>r.t===id&&r.s.date.slice(0,7)===m).map(r=>r.h));
  return `<section class="panel" id="pf-paie"><h2>Ma paie</h2><p class="help">Ce mois-ci : <b>${esc(hrFmt(h))} h</b> données. Le relevé suit la fin du mois, une fois approuvé par l’administration.</p>
    ${L.length?`<ul class="acc-list" style="margin-top:8px">${L.slice(0,6).map(p=>`<li><span>${esc(hrMonthName(p.mois))} · ${esc(hrFmt(p.h))} h</span><span class="row"><b>${esc(fmtM(p.montant))}</b><span class="chip ${p.statut==='paye'?'ok':'info'}">${p.statut==='paye'?'Payé':'Approuvé'}</span><button class="btn sm ghost" type="button" data-act="ca-slip-pr" data-t="${esc(id)}" data-m="${esc(p.mois)}" aria-label="Imprimer le relevé">${icon('print')}</button></span></li>`).join('')}</ul>`:'<p class="help" style="margin-top:6px">Aucun relevé approuvé pour l’instant.</p>'}</section>`;
}
