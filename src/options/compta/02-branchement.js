/* ---------- Le branchement de l’option Compta sur le site (voir src/js/02-options.js) ---------- */
function cpListen(){
  if(S.canAdmin!==false){
    let n=0;const done=()=>{if(++n>=4){S.loaded.compta=true;}schedule();};
    for(const [c,k] of [['compta','compta'],['compta-factures','factures'],['compta-paie','paie']]) col(c).onSnapshot(q=>{LIVE()[k]=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));if(!S['_cp'+k]){S['_cp'+k]=1;done();}else schedule();},()=>{if(!S['_cp'+k]){S['_cp'+k]=1;done();}});
    DB.doc('compta-reglages/ecole').onSnapshot(x=>{LIVE().cptCfg=x.exists?x.data():null;if(!S._cpcfg){S._cpcfg=1;done();}else schedule();},()=>{if(!S._cpcfg){S._cpcfg=1;done();}});
  }
}
function cpNotifs(D,day,who){
  const out=[];
  if(S.role==='admin'&&nfOn('compta')&&S.loaded.compta){
    const late=D.eleves.filter(e=>cpFee(e).etat==='retard').length, ap=cpToApprove();
    if(late) out.push({id:`cp:late:${late}:${day}`,t:day+'T07:00',tone:'bad',title:'Compta',text:`${pl(late,'élève en retard de paiement','élèves en retard de paiement')}.`,go:{k:'compta',tab:'frais'}});
    if(ap) out.push({id:`cp:paie:${ap}:${day}`,t:day+'T07:00',tone:'warn',title:'Compta',text:`${pl(ap,'relevé de paie à approuver','relevés de paie à approuver')}.`,go:{k:'compta',tab:'paie'}});
  }
  return out;
}
async function cpClick(a,b,e){
  switch(a){
    case 'ca-el':openDrawer({kind:'cpt',mode:'eleve',id:b.dataset.id});break;
    case 'ca-sub':if(S.dr){S.dr.sub=b.dataset.v;renderDrawer();}break;
    case 'ca-fact-new':openDrawer({kind:'cpt',mode:'factEdit'});break;
    case 'ca-fact':openDrawer({kind:'cpt',mode:'fact',id:b.dataset.id});break;
    case 'ca-fact-edit':if(S.dr){S.dr.mode='factEdit';renderDrawer();}break;
    case 'ca-fact-view':if(S.dr){S.dr.mode='fact';renderDrawer();}break;
    case 'ca-fact-send':{const id=S.dr&&S.dr.id;if(id)await write(()=>col('compta-factures').doc(id).update({statut:'envoyee',envoyee:new Date().toISOString()}),'Facture marquée envoyée');break;}
    case 'ca-fact-cancel':{const id=S.dr&&S.dr.id;if(id)await write(()=>col('compta-factures').doc(id).update({statut:'annulee'}),'Facture annulée');break;}
    case 'ca-fact-pr':{const f=S.dr&&byId(S.data.factures||[],S.dr.id);if(f)await cpPrintFact(f);break;}
    case 'ca-entry-new':openDrawer({kind:'cpt',mode:'entry',t:b.dataset.t});break;
    case 'ca-entry':openDrawer({kind:'cpt',mode:'entry',id:b.dataset.id});break;
    case 'ca-entry-del':{const id=b.dataset.id;if(await write(()=>col('compta').doc(id).delete(),'Écriture retirée')&&S.dr&&S.dr.mode==='entry')closeDrawer(true);break;}
    case 'ca-recu':{const x=byId(S.data.compta||[],b.dataset.id)||byId(S.data.mesCpt||[],b.dataset.id);if(x)await cpPrintRecu(x,myCpt());break;}
    case 'ca-releve':{const e=byId(S.data.eleves,b.dataset.id)||(b.dataset.id===S.student?Object.assign({},subject().rec,{id:S.student}):null);if(e)await cpPrintReleve(e,myCpt());break;}
    case 'ca-paie-ok':await cpApprove(b.dataset.t,b.dataset.m);break;
    case 'ca-paie-all':{const m=b.dataset.m;await runAll(cpPayRows(m).filter(r=>!cpSlip(r.t,m)).map(r=>()=>col('compta-paie').doc(m+'_'+r.t).set({mois:m,ens:r.t,h:r.h,montant:r.mt,lignes:r.lignes,statut:'approuve',le:new Date().toISOString(),par:whoAmI()})),'Paie approuvée');break;}
    case 'ca-paie-pay':await cpPaid(b.dataset.id);break;
    case 'ca-slip':openDrawer({kind:'cpt',mode:'slip',t:b.dataset.t,m:b.dataset.m});break;
    case 'ca-slip-pr':await cpPrintSlip(b.dataset.t,b.dataset.m);break;
    case 'ca-exp':await cpExport(b.dataset.v,b.dataset.m);break;
    default:return false;
  }
  return true;
}
async function cpSubmit(k,f){
  if(k==='ca-pay-el'){await cpPayEl(f);return true;}
  if(k==='ca-fact'){await cpSaveFact(f);return true;}
  if(k==='ca-fact-pay'){await cpFactPay(f);return true;}
  if(k==='ca-entry'){await cpSaveEntry(f);return true;}
  if(k==='ca-budget'){await cpSaveBudget(f);return true;}
  if(k==='ca-regl'){await cpSaveRegl(f);return true;}
  return false;
}
function cpInput(t){
  if(t.id==='ca-q'){S.pg.cq=t.value;render();return true;}
  if(t.id==='ca-q2'){S.pg.cq2=t.value;render();return true;}
  return false;
}
function cpChange(t){
  {const m={'ca-g':'cg','ca-e':'ce','ca-fe':'cfe','ca-pf':'cpf','ca-m':'cm'}[t.id];if(m){S.pg[m]=t.value;if(m==='cm')S.pg.sback='';render();return true;}}
  return false;
}
addOption('compta',{
  page:comptaPage,sub:{lbl:'Compta',key:'cp',id:'cpt',tabs:comptaTabs},
  listen:cpListen,mine:cpMine,
  drawers:{cpt:comptaDrawer},
  shapes:{'cpt:eleve':['side',600],'cpt:fact':['center',840],'cpt:factEdit':['center',840],'cpt:entry':['center',560],'cpt:slip':['center',840],},
  click:cpClick,submit:cpSubmit,input:cpInput,change:cpChange,
  notifs:cpNotifs,
  profileStudent:myStudentPanel,profileTeacher:myTeacherPanel,
  /* pour le reste du site */
  entries:cpE,fee:cpFee,feeStates:CP_FE,invoicePaid:cpFPaid,invoiceState:cpFState,invoiceStates:CP_FS,
  addEntry:x=>col('compta').doc(cpId('e')).set(cpEntry(x)),autoExpense:cpAutoDepense
});
