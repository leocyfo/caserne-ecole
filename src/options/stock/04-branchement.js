/* ---------- Le branchement de l’option Stock sur le site (voir src/js/02-options.js) ---------- */
function skListen(){
  /* le personnel */
  if(S.canAdmin!==false||S.role!=='student'){
    col('stock').onSnapshot(q=>{LIVE().stock=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));S.loaded.stock=true;schedule();},()=>{S.loaded.stock=true;schedule();});
    col('stock-mvt').onSnapshot(q=>{LIVE().stockMvt=q.docs.map(d=>Object.assign({},d.data(),{id:d.id})).sort((x,y)=>String(y.le||'').localeCompare(String(x.le||'')));schedule();},()=>{});
  }else S.loaded.stock=true;
  if(S.canAdmin!==false) for(const [c,k] of [['stock-modeles','stockModeles'],['stock-fourn','stockFourn'],['stock-cmd','stockCmd'],['stock-rep','stockRep'],['stock-cpt','stockCpt']]) col(c).onSnapshot(q=>{LIVE()[k]=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{});
}
/* ---------- Ce que l’élève voit de lui-même : son équipement attribué (stock.aId) ---------- */
let unsubSkMine=null;
function skMine(){
  const who=S.role==='student'?S.student:'', k=S.role+'|'+who;
  if(!DB||S.archive||S._skMineFor===k) return;
  if(unsubSkMine){try{unsubSkMine();}catch(e){}unsubSkMine=null;}
  S._skMineFor=k;S.data.mesStk=[];
  if(!who||S.canAdmin!==false||!permOn('equipEl')) return;
  try{unsubSkMine=col('stock').where('aId','==',who).onSnapshot(x=>{if(S._skMineFor!==k)return;S.data.mesStk=x.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{});}catch(e){}
}
const myStk=id=>(S.canAdmin!==false?skArts():S.data.mesStk||[]).filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===id);
function skProfile(e){
  let h='';
  if(permOn('equipEl')){
    const A=myStk(e.id);
    h+=`<section class="panel" id="pf-equip"><h2>Mon équipement</h2>${A.length?`<ul class="acc-list">${A.map(a=>`<li><span>${esc(a.nom)}<span class="muted sm">${esc([' · '+(a.code||''),a.taille?'taille '+a.taille:''].filter(x=>x&&x!==' · ').join(' · '))}</span></span><span class="muted sm">${a.attrib.le?'reçu le '+esc(shortDate(new Date(a.attrib.le))):''}</span></li>`).join('')}</ul>
      <div class="row u-mt10"><button class="btn sm ghost" type="button" data-act="stk-dot-pr" data-id="${esc(e.id)}">${icon('print')}Ma feuille de dotation</button></div>`:'<p class="help">Aucun équipement ne vous est attribué.</p>'}</section>`;
  }
  return h;
}
function skNotifs(D,day,who){
  const out=[];
  if(S.role==='admin'&&nfOn('stock')){
    const A=D.stock||[], late=A.filter(a=>!skQte(a)&&a.statut!=='hs'&&skConf(a)[0]==='bad').length, low=A.filter(a=>skQte(a)&&skConf(a)[0]!=='ok').length;
    if(late) out.push({id:`sk:late:${late}:${day}`,t:day+'T07:00',tone:'bad',title:'Stock',text:`${pl(late,'échéance d’inspection dépassée','échéances d’inspection dépassées')}.`,go:{k:'stock',tab:'insp'}});
    const lr=A.filter(skLate).length, rl=(D.stockRep||[]).filter(r=>r.statut==='ouverte'&&r.prevu&&r.prevu<day).length;
    if(lr) out.push({id:`sk:ret:${lr}:${day}`,t:day+'T07:00',tone:'warn',title:'Stock',text:`${pl(lr,'retour de matériel en retard','retours de matériel en retard')}.`,go:{k:'stock',tab:'prep'}});
    if(rl) out.push({id:`sk:rep:${rl}:${day}`,t:day+'T07:00',tone:'warn',title:'Stock',text:`${pl(rl,'réparation en retard','réparations en retard')}.`,go:{k:'stock',tab:'rep'}});
    if(low) out.push({id:`sk:low:${low}:${day}`,t:day+'T07:00',tone:'warn',title:'Stock',text:`${pl(low,'consommable sous le seuil','consommables sous le seuil')}.`,go:{k:'stock',tab:'conso'}});
  }
  if(S.role==='teacher'&&who){const mine=(D.stock||[]).filter(a=>skLate(a)&&a.sortie.instr===who);if(mine.length) out.push({id:`sk:mine:${mine.length}:${day}`,t:day+'T07:00',tone:'warn',title:'Matériel à rentrer',text:mine.map(a=>skName(a)).slice(0,4).join(', ')+(mine.length>4?'…':'')+'.',go:{k:'stock',tab:'prep'}});}
  return out;
}
function skSearch(add,r,adm){
  if(r!=='student'&&S.loaded.stock&&(adm||!navHidden(r).includes('stock'))) for(const a of skArts()) add('Stock',skName(a),[skCat(a.cat)[1],a.empl].filter(Boolean).join(' · '),()=>{if(S.page!=='stock')goPage('stock');openDrawer({kind:'stk',id:a.id,mode:'view'});},[a.serie,a.lot].join(' '));
}
function skActions(A){
  A('Ajouter un article au stock','Stock',()=>{goPage('stock');openDrawer({kind:'stk',mode:'pick',cat:'',empl:''});},'materiel equipement');
}
function skOnRender(){
  /* une étiquette QR scannée avec l’appareil photo : l’article s’ouvre dès que le stock est chargé */
  if(!S._skHash&&S.loaded.stock&&S.conn==='shared'&&/#stk=/.test(location.hash)){S._skHash=true;setTimeout(skHash,0);}
}
async function skClick(a,b,e){
  switch(a){
    case 'stk-open':openDrawer({kind:'stk',id:b.dataset.id,mode:'view'});break;
    case 'stk-new':openDrawer({kind:'stk',mode:'pick',cat:b.dataset.v||'',empl:b.dataset.e||''});break;
    case 'stk-free':if(S.dr){S.dr.mode='new';S.dr.cat=S.dr.cat||'epi';renderDrawer();}break;
    case 'stk-add-to':openDrawer({kind:'stk',mode:'add',id:b.dataset.id});break;
    case 'stk-fiche':if(S.dr)closeDrawer(true);if(S.page!=='stock')goPage('stock');S.pg.sk='cat';S.pg.sfi=b.dataset.id;render();window.scrollTo({top:0});break;
    case 'stk-fiches-auto':await skFichesAuto();break;
    case 'stk-flab':{const m=byId(skModeles(),b.dataset.id);if(m)await skLabels(skFicheArts(m));break;}
    case 'stk-edit':if(S.dr){S.dr.mode='edit';renderDrawer();}break;
    case 'stk-view':if(S.dr){S.dr.mode='view';S.dr.act='';renderDrawer();}break;
    case 'stk-do':if(S.dr){S.dr.mode='act';S.dr.act=b.dataset.v;renderDrawer();}break;
    case 'stk-go':openDrawer({kind:'stk',id:b.dataset.id,mode:'act',act:b.dataset.v});break;
    case 'stk-dot':openDrawer({kind:'stk',mode:'dot',t:b.dataset.t,id:b.dataset.id});break;
    case 'stk-dot-pr':await skDotPrint(b.dataset.id);break;
    case 'stk-back':await skBack(b.dataset.id);break;
    case 'stk-del-ask':if(S.dr){S.dr.del=!!b.dataset.v;renderDrawer();}break;
    case 'stk-del':{const id=S.dr&&S.dr.id;if(id&&await write(()=>col('stock').doc(id).delete(),'Article supprimé'))closeDrawer(true);break;}
    case 'stk-mvt-exp':await skMvtExport();break;
    case 'stk-mod':openDrawer({kind:'stk',mode:'mod',id:b.dataset.id||''});break;
    case 'stk-from':openDrawer({kind:'stk',mode:'new',modele:b.dataset.id});break;
    case 'stk-mod-del':if(await write(()=>col('stock-modeles').doc(b.dataset.id).delete(),'Modèle retiré'))closeDrawer(true);break;
    case 'stk-imp':openDrawer({kind:'stk',mode:'imp'});break;
    case 'stk-imp-read':{const d=S.dr, fi=$('#si-file'), t=fi&&fi.files&&fi.files[0]?await readTextFile(fi.files[0]):$('#si-txt').value;d.txt=t;const r=skParseImport(t);d.rows=r||[];d.err=r==null?'Il manque une colonne « Nom » sur la première ligne.':!r.length?'Aucune ligne à importer.':'';renderDrawer();break;}
    case 'stk-sel':{const id=b.dataset.id, L=skSel(), i=L.indexOf(id);if(i<0)L.push(id);else L.splice(i,1);render();break;}
    case 'stk-bk':if(b.dataset.v==='none'){S.pg.ssel=[];render();}else if(b.dataset.v==='all'){S.pg.ssel=(S.pg.svis||[]).slice();render();}else await skBulk(b.dataset.v);break;
    case 'stk-labels':await skLabels(b.dataset.v==='sel'?skSel().map(id=>byId(skArts(),id)).filter(Boolean):b.dataset.v==='one'&&S.dr?[byId(skArts(),S.dr.id)].filter(Boolean):skArts().filter(a=>!skQte(a)));break;
    case 'stk-scan':openDrawer({kind:'stk',mode:'scan',list:[]});break;
    case 'stk-cam':await skCamStart();break;
    case 'stk-scan-x':if(S.dr&&S.dr.list){S.dr.list=S.dr.list.filter(x=>x!==b.dataset.id);renderDrawer();}break;
    case 'stk-grp':await skGroup(b.dataset.v);break;
    case 'stk-kit':openDrawer({kind:'stk',mode:'kit',id:b.dataset.id});break;
    case 'stk-kit-go':await skKitGo(b.dataset.id);break;
    case 'stk-sizes':openDrawer({kind:'stk',mode:'sizes',id:b.dataset.id});break;
    case 'stk-sign':await skSigned(b.dataset.id,!!b.dataset.v);break;
    case 'stk-dup':{const a=S.dr&&byId(skArts(),S.dr.id);if(!a)break;const y=Object.assign({},a,{code:a.code?a.code+'-copie':'',serie:'',attrib:null,aId:'',sortie:null,cree:new Date().toISOString(),maj:new Date().toISOString()});delete y.id;delete y.exemple;const id='s'+Date.now().toString(36);if(await write(()=>col('stock').doc(id).set(y),'Article dupliqué'))openDrawer({kind:'stk',id,mode:'edit'});break;}
    case 'stk-rep-new':{const a=S.dr&&byId(skArts(),S.dr.id);if(a)openDrawer({kind:'stk',mode:'rep',art:a.id});break;}
    case 'stk-rep':openDrawer({kind:'stk',mode:'rep',id:b.dataset.id});break;
    case 'stk-rep-done':await skRepDone();break;
    case 'stk-rep-cancel':{const r=S.dr&&byId(skReps(),S.dr.id);if(r&&await write(()=>col('stock-rep').doc(r.id).update({statut:'annulee'}),'Bon annulé'))closeDrawer(true);break;}
    case 'stk-prep-out':await skPrepOut(b.dataset.key,b.dataset.date);break;
    case 'stk-prep-conso':await skPrepConso(b.dataset.key,b.dataset.date);break;
    case 'stk-prep-pr':await skPrepPrint();break;
    case 'stk-bes-del':{const c=configDoc(), st=Object.assign({},c.stock||{}), B=Object.assign({},st.besoins||{});delete B[b.dataset.v];st.besoins=B;c.stock=st;await saveConfig(c,'Besoins retirés');break;}
    case 'stk-buy':await skBuy();break;
    case 'stk-cmd':openDrawer({kind:'stk',mode:'cmd',id:b.dataset.id||''});break;
    case 'stk-cmd-st':{const id=S.dr&&S.dr.id;if(id&&await write(()=>col('stock-cmd').doc(id).update({statut:b.dataset.v}),b.dataset.v==='envoyee'?'Commande envoyée':'Commande annulée'))renderDrawer();break;}
    case 'stk-fo':openDrawer({kind:'stk',mode:'fourn',id:b.dataset.id||''});break;
    case 'stk-cpt-new':await skCountNew();break;
    case 'stk-cpt-at':S.pg.sk='cpt';S.pg.sce=b.dataset.v;S.pg.scp='';render();break;
    case 'stk-cl':await skCountMark(b.dataset.id,b.dataset.v,null);break;
    case 'stk-cpt-end':await skCountEnd();break;
    case 'stk-inv-exp':await skInvExport();break;
    case 'stk-inv-pr':await skInvPrint();break;
    case 'stk-insp-pr':await skInspPrint();break;
    case 'stk-tour-ok':await skTourOk(b.dataset.id);break;
    default:return false;
  }
  return true;
}
async function skSubmit(k,f){
  if(k==='stk-save'){await skSave(f);return true;}
  if(k==='stk-act'){await skAct(f);return true;}
  if(k==='stk-dot'){await skDot(f);return true;}
  if(k==='stk-regl'){await skSaveRegl(f);return true;}
  if(k==='stk-mod'){await skSaveMod(f);return true;}
  if(k==='stk-add'){await skQuickAdd(f);return true;}
  if(k==='stk-imp'){await skImport();return true;}
  if(k==='stk-code'){const x=f.querySelector('#stk-code');skScanAdd(x.value);x.value='';x.focus();return true;}
  if(k==='stk-sizes'){await skSaveSizes(f);return true;}
  if(k==='stk-cmd'){await skSaveCmd(f);return true;}
  if(k==='stk-rcv'){await skReceive(f);return true;}
  if(k==='stk-fo'){await skSaveFourn(f);return true;}
  if(k==='stk-rep'){await skSaveRep(f);return true;}
  if(k==='stk-bes'){const m=f.querySelector('#sb-mod').value, a=f.querySelector('#sb-art').value, q=Math.max(1,Math.round(+f.querySelector('#sb-qte').value||1)), c=configDoc(), st=Object.assign({},c.stock||{}), B=Object.assign({},st.besoins||{});B[m]=(B[m]||[]).filter(x=>x.art!==a).concat([{art:a,qte:q}]);st.besoins=B;c.stock=st;await saveConfig(c,'Besoin ajouté');return true;}
  return false;
}
function skInput(t){
  if(t.id==='stk-q'){S.pg.sq=t.value;render();return true;}
  if(t.id==='stk-fq'){S.pg.sfq=t.value;render();return true;}
  if(t.id==='stk-pk-q'&&S.dr){S.dr.q=t.value;renderDrawer();return true;}
  if(t.id==='sq-nb'&&S.dr){const m=byId(skModeles(),S.dr.id), c=$('#sq-codes');if(m&&c)c.textContent=skCodesTxt(m,Math.max(1,Math.min(60,Math.round(+t.value||1))));return true;}
  if(t.id==='sm-suivi'){t.form.dataset.suivi=t.value;return true;}
  if(t.id==='stk-mq'){S.pg.smq=t.value;render();return true;}
  /* fiche d’article : le suivi suit la catégorie ; les champs affichés suivent le suivi */
  if(t.id==='sa-cat'||t.id==='sa-suivi'){const f=t.form;if(t.id==='sa-cat'){f.dataset.cat=t.value;const su=f.querySelector('#sa-suivi');if(su&&f.dataset.suivi!==(t.value==='conso'?'qte':'unite')&&!f.dataset.touched){su.value=t.value==='conso'?'qte':'unite';}}else f.dataset.touched='1';f.dataset.suivi=f.querySelector('#sa-suivi').value;return true;}
  return false;
}
async function skChange(t){
  if(t.id==='stk-bk-empl'&&t.value){await skBulk('empl',t.value);return true;}
  if(t.id==='stk-bk-st'&&t.value){await skBulk('st',t.value);return true;}
  if(t.dataset&&t.dataset.cq){await skCountMark(t.dataset.cq,null,t.value===''?null:Math.max(0,Math.round(+t.value)));return true;}
  {const m={'stk-fc':'sfc','stk-pd':'spd','stk-ce':'sce','stk-te':'ste','stk-f':'sf','stk-mt':'smt','stk-g':'sg'}[t.id];if(m){S.pg[m]=t.value;if(m==='sg')S.pg.sback='';render();return true;}}
  return false;
}
addOption('stock',{
  page:stockPage,sub:{lbl:'Stock',key:'sk',id:'sk',tabs:stockTabs},
  listen:skListen,mine:skMine,hidden:r=>r==='teacher'&&!(skCfg().perms.sortie||skCfg().perms.bris),
  drawers:{stk:stockDrawer},closeDrawer:skStopCam,
  shapes:{stk:['side',600],'stk:pick':['center',680],'stk:add':['center',520],'stk:dot':['sheet',980],'stk:mod':['side',720],'stk:imp':['center',840],'stk:scan':['center',560],
    'stk:kit':['sheet',1100],'stk:sizes':['sheet',980],'stk:cmd':['sheet',1100],'stk:fourn':['center',600],'stk:rep':['center',600],},
  click:skClick,submit:skSubmit,input:skInput,change:skChange,
  notifs:skNotifs,search:skSearch,actions:skActions,render:skOnRender,
  profileStudent:skProfile,
  /* pour le reste du site */
  studentTab:skStudentTab,resources:skResa
});
