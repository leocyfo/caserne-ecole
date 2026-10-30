/* ---------- Stock : équipement prêté aux élèves, matériel et inspections, consommables, uniformes et articles vendus ----------
   stock/<id> : un article — cat : epi | mat | conso | vente ; pour tous : nom, empl (emplacement), notes, maj.
     epi   : une pièce prêtée (habit de combat, casque, gants…) : num, taille, etat (bon | reparer | hs), pret ({ eleve, le } ou null)
     mat   : du matériel inspecté : num, qte, etat (service | hs), freq (jours entre deux inspections), insp (date de la dernière)
     conso : un consommable : qte, unite, seuil (à commander quand la quantité descend au seuil)
     vente : un article vendu aux élèves : prix ($ l’unité), qtes ({ taille : quantité } ; « U » = taille unique)
   stock-mvt/<id> : chaque mouvement, jamais modifié ensuite — { le, par, art, nom, cat, type, qte, taille, eleve, prix, total, etat, note }
     type : ajout | modif | suppr | entree | sortie | pret | retour | insp | vente
   Les quantités restent sur l’article ; les mouvements font l’historique et la liste des ventes. */
const STK_CAT={epi:['Équipement prêté','Pièce prêtée'],mat:['Matériel','Matériel'],conso:['Consommables','Consommable'],vente:['Uniformes et ventes','Article vendu']};
const STK_ETAT={bon:['ok','Bon'],reparer:['warn','À réparer'],hs:['bad','Hors service'],service:['ok','En service']};
const STK_TAILLES=['XS','S','M','L','XL','XXL'];
const STK_MVT={ajout:'Ajout',modif:'Modification',suppr:'Retrait',entree:'Entrée',sortie:'Sortie',pret:'Prêt',retour:'Retour',insp:'Inspection',vente:'Vente'};
const stk=()=>S.data.stock||[];
const stkOf=cat=>stk().filter(a=>a.cat===cat).sort((a,b)=>collator.compare(a.nom||'',b.nom||'')||collator.compare(String(a.num||''),String(b.num||'')));
const stkName=a=>`${a.nom||'Article'}${a.num?' · '+a.num:''}${a.cat==='epi'&&a.taille?' ('+a.taille+')':''}`;
const money=n=>(Math.round((+n||0)*100)/100).toLocaleString('fr-CA',{minimumFractionDigits:2,maximumFractionDigits:2})+' $';
const fmtQ=n=>(Math.round((+n||0)*100)/100).toLocaleString('fr-CA');
const sizeLbl=t=>t==='U'?'Taille unique':t;
const elLbl=id=>{const e=byId(S.data.eleves,id);return e?e.nom:'Élève retiré';};
const elGrp=id=>{const e=byId(S.data.eleves,id);return e?e.groupe:'';};
/* Matériel : prochaine inspection (date) et nombre de jours d’ici là (négatif : en retard). Jamais inspecté : à faire aujourd’hui. */
const stkNext=a=>a.cat==='mat'&&+a.freq>0?(a.insp?iso(addDays(parse(a.insp),+a.freq)):todayISO()):'';
const stkDue=a=>{const n=stkNext(a);return n?daysBetween(todayISO(),n):null;};
const stkLow=a=>a.cat==='conso'&&a.seuil!==''&&a.seuil!=null&&(+a.qte||0)<=(+a.seuil||0);
const stkTot=a=>Object.values(a.qtes||{}).reduce((s,n)=>s+(+n||0),0);
const stkSizes=a=>{const q=a.qtes||{};return STK_TAILLES.concat(['U']).filter(t=>q[t]!=null);};
function stkAlerts(){
  const out={reparer:[],retard:[],bientot:[],bas:[]};
  for(const a of stk()){
    if(a.cat==='epi'&&(a.etat==='reparer'||a.etat==='hs')) out.reparer.push(a);
    if(a.cat==='mat'&&a.etat!=='hs'){const d=stkDue(a);if(d!=null&&d<0)out.retard.push(a);else if(d!=null&&d<=14)out.bientot.push(a);}
    if(stkLow(a)) out.bas.push(a);
  }
  return out;
}
/* Les mouvements se lisent seulement quand une page en a besoin (Stock, fiche d’un élève) */
function ensureStockMvt(){
  if(!DB||S.smSub) return;S.smSub=true;
  try{col('stock-mvt').onSnapshot(q=>{S.data.stockMvt=q.docs.map(d=>Object.assign({},d.data(),{id:d.id})).sort((a,b)=>String(b.le).localeCompare(String(a.le)));S.smLoaded=true;schedule();},()=>{S.smLoaded=true;schedule();});}
  catch(e){S.smLoaded=true;}
}
const clean=o=>{const r={};for(const [k,v] of Object.entries(o)) if(v!==undefined&&v!=='') r[k]=v;return r;};
/* Écrit l’article (patch null : le retire), puis son mouvement, puis une ligne d’historique */
async function stkWrite(a,patch,mvt,msg,logTxt){
  if(S.busy) return false;
  const id=a.id||genId('st'), now=new Date().toISOString(), after=Object.assign({},a,patch||{});
  S.busy=true;renderDrawer();
  const ok=await write(async()=>{
    const ref=col('stock').doc(id);
    if(patch===null) await ref.delete();
    else if(!a.id) await ref.set(Object.assign({},patch,{maj:now}));
    else await ref.update(Object.assign({},patch,{maj:now}));
    if(mvt) await col('stock-mvt').doc(genId('mv')).set(clean(Object.assign({le:now,par:whoAmI(),art:id,nom:stkName(after),cat:after.cat},mvt)));
  },msg);
  S.busy=false;
  if(ok&&logTxt) logEv('stock',logTxt,stkName(after));
  if(ok&&S.dr&&S.dr.kind==='stock') S.dr=null;
  render();
  return ok;
}

/* ---------- Page Stock (administration) ---------- */
function stockPage(){
  ensureStockMvt();
  const st=S.pg, tab=STK_CAT[st.sk]?st.sk:'epi', A=stkAlerts(), can=isAdmin()&&S.conn==='shared';
  const epi=stkOf('epi'), mat=stkOf('mat'), con=stkOf('conso'), ven=stkOf('vente');
  const lent=epi.filter(a=>a.pret&&a.pret.eleve).length, ym=todayISO().slice(0,7);
  const sales=(S.data.stockMvt||[]).filter(m=>m.type==='vente'), month=sales.filter(m=>String(m.le).slice(0,7)===ym), monthTot=month.reduce((s,m)=>s+(+m.total||0),0);
  const insp=A.retard.length+A.bientot.length;
  const tiles=`<div class="xm-tiles" role="group" aria-label="Stock">
    ${affTile('sk','epi',tab,'Équipement prêté',`${lent}<span class="xm-of"> / ${epi.length}</span>`,'',A.reparer.length?pl(A.reparer.length,'pièce à réparer','pièces à réparer'):pl(epi.length-lent,'pièce en stock','pièces en stock'))}
    ${affTile('sk','mat',tab,'Matériel',insp,A.retard.length?'bad':insp?'warn':'',A.retard.length?`inspections à faire, ${A.retard.length} en retard`:insp?'inspections d’ici 14 jours':'Inspections à jour')}
    ${affTile('sk','conso',tab,'Consommables',A.bas.length,A.bas.length?'warn':'',A.bas.length?'à commander':'Stock suffisant')}
    ${affTile('sk','vente',tab,'Uniformes et ventes',money(monthTot),'',pl(month.length,'vente ce mois','ventes ce mois'))}
  </div>`;
  const segs={epi:[['','Toutes'],['pret','Prêtées'],['stock','En stock'],['reparer','À réparer']],mat:[['','Tout'],['due','À inspecter'],['hs','Hors service']],conso:[['','Tout'],['bas','À commander']],vente:[['','Articles'],['ventes','Ventes']]};
  const fl=segs[tab].some(x=>x[0]===st.sf)?st.sf||'':'', q=String(st.sq||'').trim().toLowerCase();
  const seg=`<div class="seg" role="group" aria-label="Filtrer">${segs[tab].map(([k,l])=>`<button type="button" id="sk-f-${k||'all'}" data-act="pg-set" data-k="sf" data-v="${k}" aria-pressed="${fl===k}">${l}</button>`).join('')}</div>`;
  const tb=`<div class="toolbar">${seg}<span class="grow"></span><input class="search" id="stk-q" type="search" placeholder="Rechercher un article, un numéro, un élève…" aria-label="Rechercher dans le stock" autocomplete="off" value="${esc(st.sq||'')}">${can?`<button class="btn primary" type="button" id="stk-new" data-act="stk-new" data-cat="${tab}">${icon('plus')}Ajouter un article</button>`:''}</div>`;
  const match=a=>!q||`${a.nom} ${a.num||''} ${a.taille||''} ${a.empl||''} ${a.pret&&a.pret.eleve?elLbl(a.pret.eleve):''}`.toLowerCase().includes(q);
  const open=a=>`data-act="stk-open" data-id="${esc(a.id)}"`;
  const etat=a=>{const e=STK_ETAT[a.etat]||STK_ETAT[a.cat==='mat'?'service':'bon'];return `<span class="chip ${e[0]}">${e[1]}</span>`;};
  const sub=a=>esc([a.cat==='epi'&&a.taille?'Taille '+a.taille:'',a.cat!=='epi'&&a.num?a.num:'',a.empl].filter(Boolean).join(' · '));
  const btn=(act,a,l,dis2)=>`<button class="btn sm" type="button" id="${act}-${esc(a.id)}" data-act="${act}" data-id="${esc(a.id)}"${dis2||!can?' disabled':''}>${l}</button>`;
  const empty=(t,x)=>emptyBox(t,x,can?`<button class="btn primary" type="button" data-act="stk-new" data-cat="${tab}">${icon('plus')}Ajouter un article</button>`:'');
  let body='';
  if(tab==='epi'){
    const list=epi.filter(a=>(fl==='pret'?a.pret&&a.pret.eleve:fl==='stock'?!(a.pret&&a.pret.eleve):fl==='reparer'?a.etat==='reparer'||a.etat==='hs':true)&&match(a));
    body=!epi.length?empty('Aucune pièce d’équipement','Ajoutez les habits de combat, casques, gants ou bottes que l’école prête aux élèves. Chaque pièce a son numéro et sa taille.')
      :!list.length?'<section class="panel"><p class="help">Aucune pièce ne correspond.</p></section>'
      :xList('xm-sk-epi',[['N°'],['Pièce'],['État'],['Prêtée à'],['','r']],list.map(a=>{const p=a.pret&&a.pret.eleve;
        return xRow('xm-sk-epi',open(a),`<span class="stk-num">${esc(a.num||'—')}</span><div class="xm-t"><b>${esc(a.nom)}</b><small>${sub(a)}</small></div><span>${etat(a)}</span>${p?`<div class="xm-t"><b>${esc(elLbl(p))}</b><small>${esc(gName(elGrp(p)))}${a.pret.le?' · depuis le '+esc(shortDate(parse(a.pret.le))):''}</small></div>`:'<span class="muted">En stock</span>'}<div class="xm-end">${p?btn('stk-retour',a,'Retour'):btn('stk-pret',a,'Prêter',a.etat==='hs')}</div>`,stkName(a));}).join(''));
  }else if(tab==='mat'){
    const list=mat.filter(a=>(fl==='due'?a.etat!=='hs'&&stkDue(a)!=null&&stkDue(a)<=14:fl==='hs'?a.etat==='hs':true)&&match(a));
    const when=a=>{const n=stkNext(a), d=stkDue(a);if(!n) return '<span class="muted">Pas d’inspection prévue</span>';
      const c=a.etat==='hs'?'off':d<0?'bad':d<=14?'warn':'';const t=d<0?`En retard de ${pl(-d,'jour','jours')}`:d===0?'Aujourd’hui':d<=14?`Dans ${pl(d,'jour','jours')}`:shortDate(parse(n));
      return `<div class="xm-t"><b>${c?`<span class="chip ${c}">${t}</span>`:esc(t)}</b><small>${a.insp?'Dernière : '+esc(shortDate(parse(a.insp))):'Jamais inspecté'}</small></div>`;};
    body=!mat.length?empty('Aucun matériel','Ajoutez les APRIA, boyaux, lances, échelles et outils. Indiquez tous les combien de jours chacun doit être inspecté.')
      :!list.length?'<section class="panel"><p class="help">Aucun matériel ne correspond.</p></section>'
      :xList('xm-sk-mat',[['Matériel'],['Quantité','n'],['Inspection'],['État'],['','r']],list.map(a=>xRow('xm-sk-mat',open(a),`<div class="xm-t"><b>${esc(a.nom)}</b><small>${sub(a)}</small></div><span class="stk-q">${fmtQ(a.qte||1)}</span>${when(a)}<span>${etat(a)}</span><div class="xm-end">${btn('stk-insp',a,'Inspecter')}</div>`,stkName(a))).join(''));
  }else if(tab==='conso'){
    const list=con.filter(a=>(fl==='bas'?stkLow(a):true)&&match(a));
    body=!con.length?empty('Aucun consommable','Ajoutez la mousse, les cartouches, les fournitures ou les produits de ménage, avec le seuil où il faut en commander.')
      :!list.length?'<section class="panel"><p class="help">Aucun consommable ne correspond.</p></section>'
      :xList('xm-sk-con',[['Consommable'],['Quantité','n'],['Seuil','n'],['État'],['','r']],list.map(a=>xRow('xm-sk-con',open(a),`<div class="xm-t"><b>${esc(a.nom)}</b><small>${sub(a)}</small></div><span class="stk-q${stkLow(a)?' warn':''}">${fmtQ(a.qte)}<small>${esc(a.unite||'')}</small></span><span class="stk-s">${a.seuil!==''&&a.seuil!=null?fmtQ(a.seuil):'—'}</span><span>${stkLow(a)?'<span class="chip warn">À commander</span>':'<span class="chip ok">Suffisant</span>'}</span><div class="xm-end">${btn('stk-in',a,'Entrée')}${btn('stk-out',a,'Sortie',!(+a.qte>0))}</div>`,stkName(a))).join(''));
  }else if(fl==='ventes'){
    const list=sales.filter(m=>!q||`${m.nom} ${elLbl(m.eleve)}`.toLowerCase().includes(q));
    body=!S.smLoaded?'<section class="panel"><p class="help">Chargement des ventes…</p></section>'
      :!list.length?emptyBox('Aucune vente','Les ventes faites avec le bouton « Vendre » d’un article apparaissent ici.')
      :`<p class="stk-sum" id="stk-month">Ce mois : <b>${money(monthTot)}</b> · ${pl(month.length,'vente','ventes')}</p>`+xList('xm-sk-sale',[['Date'],['Vente'],['Montant','r']],list.slice(0,+st.sl||60).map(m=>{const d=new Date(m.le);
        return xRow('xm-sk-sale','',`<span class="jr-w"><b>${dn(d)} ${esc(fMonthS.format(d))}</b><small>${pad(d.getHours())} h ${pad(d.getMinutes())}</small></span><div class="xm-t"><b>${esc(elLbl(m.eleve))}</b><small>${esc(m.nom)}${m.taille?' · '+esc(sizeLbl(m.taille)):''} × ${fmtQ(m.qte||1)} à ${money(m.prix)}</small></div><div class="xm-end"><b class="stk-money">${money(m.total)}</b></div>`,'');}).join(''))
      +(list.length>(+st.sl||60)?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="sl" data-v="${(+st.sl||60)+60}">Afficher plus (${list.length-(+st.sl||60)})</button></div>`:'');
  }else{
    const list=ven.filter(match);
    const sizes=a=>{const ts=stkSizes(a);return ts.length?`<span class="stk-sizes">${ts.map(t=>`<span class="chip ${+a.qtes[t]>0?'':'off'}">${t==='U'?'Unique':t} · ${fmtQ(a.qtes[t])}</span>`).join('')}</span>`:'<span class="muted">—</span>';};
    body=!ven.length?empty('Aucun article à vendre','Ajoutez les uniformes, chandails ou manuels vendus aux élèves, avec leur prix et la quantité de chaque taille.')
      :!list.length?'<section class="panel"><p class="help">Aucun article ne correspond.</p></section>'
      :xList('xm-sk-ven',[['Article'],['Prix','n'],['En stock'],['','r']],list.map(a=>xRow('xm-sk-ven',open(a),`<div class="xm-t"><b>${esc(a.nom)}</b><small>${sub(a)||pl(stkTot(a),'unité en stock','unités en stock')}</small></div><span class="stk-money">${money(a.prix)}</span>${sizes(a)}<div class="xm-end">${btn('stk-sell',a,'Vendre',!(stkTot(a)>0))}</div>`,stkName(a))).join(''));
  }
  return tiles+tb+body;
}

/* ---------- Fenêtre d’un article : modifier, prêter, retour, inspecter, entrée, sortie, vendre ---------- */
function stkDraft(a,cat){
  a=a||{};
  const d={cat,nom:a.nom||'',num:a.num||'',taille:a.taille||'',etat:a.etat||(cat==='mat'?'service':'bon'),empl:a.empl||'',notes:a.notes||'',qte:a.qte!=null?String(a.qte):(cat==='mat'?'1':'0'),unite:a.unite||'',seuil:a.seuil!=null?String(a.seuil):'',freq:a.freq!=null?String(a.freq):'',insp:a.insp||'',prix:a.prix!=null?String(a.prix):''};
  for(const t of STK_TAILLES.concat(['U'])) d['q_'+t]=a.qtes&&a.qtes[t]!=null?String(a.qtes[t]):'';
  return d;
}
function openStock(id,mode,cat){
  const a=id?byId(stk(),id):null;
  if(id&&!a) return;
  const c=a?a.cat:(STK_CAT[cat]?cat:'epi');
  if(mode!=='edit') ensureStockMvt();
  const draft=mode==='edit'?stkDraft(a,c):{qte:'',eleve:'',etat:mode==='retour'?(a.etat==='hs'?'hs':'bon'):'ok',note:'',date:todayISO(),taille:a&&a.cat==='vente'?(stkSizes(a).find(t=>+a.qtes[t]>0)||''):'',prix:a&&a.prix!=null?String(a.prix):''};
  if(mode==='sell'||mode==='in'||mode==='out') draft.qte='1';
  openDrawer({kind:'stock',id:id||null,mode,cat:c,draft,err:''});
}
const stkSel=(id,f,val,opts)=>`<select id="${id}" data-f="${f}">${opts.map(([v,l])=>`<option value="${esc(v)}"${String(val)===String(v)?' selected':''}>${esc(l)}</option>`).join('')}</select>`;
const elOpts=val=>`<option value="">Choisir un élève…</option>`+groups().map(g=>{const els=studentsOf(g.id);return els.length?`<optgroup label="${esc(g.nom)}">${els.map(e=>`<option value="${esc(e.id)}"${e.id===val?' selected':''}>${esc(e.nom)}</option>`).join('')}</optgroup>`:'';}).join('');
function stockDrawer(){
  const d=S.dr, f=d.draft, a=d.id?byId(stk(),d.id):null;
  if(d.id&&!a) return goneHTML('Article');
  const err=d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:'';
  const fld=(id,lbl,f2,attrs,val)=>`<label class="field"><span>${lbl}</span><input id="${id}" data-f="${f2}" value="${esc(val!=null?val:f[f2])}" ${attrs||''}></label>`;
  const note=`<label class="field"><span>Remarque (facultatif)</span><input id="sk-note" data-f="note" value="${esc(f.note||'')}" maxlength="140" autocomplete="off"></label>`;
  const save=l=>`<button class="btn primary" type="submit" form="sk-form"${dis()}>${l}</button><button class="btn ghost" type="button" data-act="close">Annuler</button>`;
  let body='', foot='', title='', sub='';
  if(d.mode==='edit'){
    const c=f.cat, cats=Object.keys(STK_CAT).map(k=>[k,STK_CAT[k][0]]);
    title=a?esc(a.nom):'Nouvel article';sub=a?STK_CAT[c][1]:'';
    const spec=c==='epi'?`<div class="grid2">${fld('sk-num','Numéro de la pièce','num','maxlength="20" autocomplete="off" placeholder="Ex. HC-07"')}<label class="field"><span>Taille</span>${stkSel('sk-taille','taille',f.taille,[['','—']].concat(STK_TAILLES.map(t=>[t,t])))}</label></div>
        <label class="field"><span>État</span>${stkSel('sk-etat','etat',f.etat,[['bon','Bon'],['reparer','À réparer'],['hs','Hors service']])}</label>`
      :c==='mat'?`<div class="grid2">${fld('sk-num','Numéro ou identifiant (facultatif)','num','maxlength="20" autocomplete="off"')}${fld('sk-qte','Quantité','qte','type="number" min="0" step="1" inputmode="numeric"')}</div>
        <div class="grid2">${fld('sk-freq','Inspection tous les … jours','freq','type="number" min="0" step="1" inputmode="numeric" placeholder="Ex. 30"')}${fld('sk-insp','Dernière inspection','insp','type="date"')}</div>
        <label class="field"><span>État</span>${stkSel('sk-etat','etat',f.etat,[['service','En service'],['hs','Hors service']])}</label>`
      :c==='conso'?`<div class="grid2">${fld('sk-qte','Quantité','qte','type="number" min="0" step="any" inputmode="decimal"')}${fld('sk-unite','Unité','unite','maxlength="20" autocomplete="off" placeholder="Ex. bidons, boîtes"')}</div>
        ${fld('sk-seuil','À commander quand il en reste','seuil','type="number" min="0" step="any" inputmode="decimal" placeholder="Ex. 5"')}`
      :`${fld('sk-prix','Prix à l’unité ($)','prix','type="number" min="0" step="0.01" inputmode="decimal"')}
        <fieldset><legend>Quantité de chaque taille (laissez vide les tailles qui n’existent pas)</legend><div class="stk-qgrid">${STK_TAILLES.concat(['U']).map(t=>`<label class="field"><span>${t==='U'?'Unique':t}</span><input id="sk-q-${t}" data-f="q_${t}" value="${esc(f['q_'+t])}" type="number" min="0" step="1" inputmode="numeric"></label>`).join('')}</div></fieldset>`;
    body=`<form id="sk-form" data-form="stk" novalidate>
      ${a?'':`<label class="field"><span>Catégorie</span>${stkSel('sk-cat','cat',c,cats)}</label>`}
      ${fld('sk-nom','Nom','nom','maxlength="80" autocomplete="off" placeholder="'+(c==='epi'?'Ex. Habit de combat':c==='mat'?'Ex. Boyau 38 mm (15 m)':c==='conso'?'Ex. Mousse classe B':'Ex. Chandail d’uniforme')+'"')}
      ${spec}
      ${fld('sk-empl','Emplacement (facultatif)','empl','maxlength="60" autocomplete="off" placeholder="Ex. Entrepôt, camion 2"')}
      <label class="field"><span>Remarques</span><textarea id="sk-notes" data-f="notes" rows="2" maxlength="300">${esc(f.notes)}</textarea></label>
      ${err}</form>${a?stkHistory(a):''}`;
    foot=d.confirmDel?`<p>Retirer ${esc(stkName(a))} du stock ? Son historique reste dans les mouvements.</p><button class="btn danger" type="button" id="sk-del-yes" data-act="stk-del-yes"${dis()}>Retirer</button><button class="btn ghost" type="button" data-act="stk-del-no">Annuler</button>`
      :`<button class="btn primary" type="submit" form="sk-form"${dis()}>${a?'Enregistrer':'Ajouter au stock'}</button>${a?`<button class="btn ghost" type="button" id="sk-del" data-act="stk-del">Retirer du stock</button>`:''}`;
  }else{
    title=esc(stkName(a));sub=STK_CAT[a.cat][1];
    const M={pret:'Prêter la pièce',retour:'Retour de la pièce',insp:'Inspection',in:'Entrée en stock',out:'Sortie du stock',sell:'Vente'}[d.mode];
    let x='', b='';
    if(d.mode==='pret'){x=`<label class="field"><span>Élève</span><select id="sk-eleve" data-f="eleve">${elOpts(f.eleve)}</select></label>${fld('sk-date','Date du prêt','date','type="date"')}${note}`;b='Prêter';}
    else if(d.mode==='retour'){x=`<p class="help">Prêtée à <b>${esc(elLbl(a.pret.eleve))}</b>${a.pret.le?` depuis le ${esc(shortDate(parse(a.pret.le)))}`:''}.</p><label class="field"><span>État au retour</span>${stkSel('sk-etat','etat',f.etat,[['bon','Bon'],['reparer','À réparer'],['hs','Hors service']])}</label>${note}`;b='Enregistrer le retour';}
    else if(d.mode==='insp'){x=`<div class="grid2">${fld('sk-date','Date de l’inspection','date','type="date"')}<label class="field"><span>Résultat</span>${stkSel('sk-res','etat',f.etat,[['ok','Conforme : en service'],['hs','Non conforme : hors service']])}</label></div>${note}<p class="help">${+a.freq>0?`Prochaine inspection ${pl(+a.freq,'jour','jours')} après celle-ci.`:'Aucune fréquence d’inspection n’est réglée pour cet article.'}</p>`;b='Enregistrer l’inspection';}
    else if(d.mode==='in'||d.mode==='out'){x=`<p class="help">En stock : <b>${fmtQ(a.qte)} ${esc(a.unite||'')}</b>${stkLow(a)?' · <span class="chip warn">À commander</span>':''}</p>${fld('sk-qte',d.mode==='in'?'Quantité reçue':'Quantité sortie','qte','type="number" min="0" step="any" inputmode="decimal"')}${note}`;b=d.mode==='in'?'Ajouter au stock':'Retirer du stock';}
    else{const ts=stkSizes(a);x=`<label class="field"><span>Élève</span><select id="sk-eleve" data-f="eleve">${elOpts(f.eleve)}</select></label>
        <div class="grid2"><label class="field"><span>Taille</span>${stkSel('sk-taille','taille',f.taille,ts.map(t=>[t,`${sizeLbl(t)} (${fmtQ(a.qtes[t])} en stock)`]))}</label>${fld('sk-qte','Quantité','qte','type="number" min="1" step="1" inputmode="numeric"')}</div>
        ${fld('sk-prix','Prix à l’unité ($)','prix','type="number" min="0" step="0.01" inputmode="decimal"')}${note}
        <p class="help" id="sk-total">Total : <b>${money((+f.prix||0)*(+f.qte||0))}</b></p>`;b='Enregistrer la vente';}
    body=`<p class="eyebrow" style="margin-bottom:-6px">${M}</p><form id="sk-form" data-form="stk" novalidate>${x}${err}</form>${stkHistory(a)}`;
    foot=save(b);
  }
  return dTop('Stock',title,sub)+`<div class="dr-body">${body}</div><div class="dr-foot">${foot}</div>`;
}
function stkHistory(a){
  const ms=(S.data.stockMvt||[]).filter(m=>m.art===a.id).slice(0,20);
  if(!S.smLoaded) return '';
  const what=m=>{const t=STK_MVT[m.type]||m.type;
    if(m.type==='pret') return `${t} à ${elLbl(m.eleve)}`;
    if(m.type==='retour') return `${t}${m.eleve?' de '+elLbl(m.eleve):''}${m.etat&&STK_ETAT[m.etat]?' · '+STK_ETAT[m.etat][1].toLowerCase():''}`;
    if(m.type==='insp') return `${t} · ${m.etat==='hs'?'non conforme':'conforme'}`;
    if(m.type==='entree'||m.type==='sortie') return `${t} de ${fmtQ(m.qte)}`;
    if(m.type==='vente') return `${t} à ${elLbl(m.eleve)} · ${m.taille?sizeLbl(m.taille)+' · ':''}${fmtQ(m.qte)} × ${money(m.prix)}`;
    return t;};
  return `<section class="dr-sec" id="sk-hist"><h3>Historique</h3>${ms.length?`<ul class="plist">${ms.map(m=>{const d=new Date(m.le);return `<li><span>${esc(what(m))}${m.note?`<span class="muted sm"> — ${esc(m.note)}</span>`:''}</span><span class="muted sm">${dn(d)} ${esc(fMonthS.format(d))}${m.par?' · '+esc(m.par):''}</span></li>`;}).join('')}</ul>`:'<p class="help">Aucun mouvement pour l’instant.</p>'}</section>`;
}
async function stockSubmit(){
  const d=S.dr;if(!d||d.kind!=='stock'||S.busy) return;
  const f=d.draft, a=d.id?byId(stk(),d.id):null, fail=m=>{d.err=m;renderDrawer();};
  const num=v=>v===''||v==null?NaN:+v;
  if(d.mode==='edit'){
    const c=f.cat;if(!f.nom.trim()) return fail('Indiquez le nom de l’article.');
    const p={cat:c,nom:f.nom.trim(),empl:f.empl.trim(),notes:f.notes.trim()};
    if(c==='epi'){p.num=f.num.trim();p.taille=f.taille;p.etat=f.etat;if(!a)p.pret=null;}
    else if(c==='mat'){const q=num(f.qte), fr=f.freq===''?0:num(f.freq);if(!(q>=0))return fail('Indiquez la quantité.');if(!(fr>=0))return fail('La fréquence d’inspection doit être un nombre de jours.');p.num=f.num.trim();p.qte=q;p.freq=fr;p.insp=f.insp||'';p.etat=f.etat;}
    else if(c==='conso'){const q=num(f.qte), s=f.seuil===''?'':num(f.seuil);if(!(q>=0))return fail('Indiquez la quantité.');if(s!==''&&!(s>=0))return fail('Le seuil doit être un nombre.');p.qte=q;p.unite=f.unite.trim();p.seuil=s;}
    else{const pr=num(f.prix);if(!(pr>=0))return fail('Indiquez le prix.');const qs={};for(const t of STK_TAILLES.concat(['U'])){const v=f['q_'+t];if(v==='')continue;const n=num(v);if(!(n>=0))return fail('Les quantités doivent être des nombres.');qs[t]=Math.round(n);}if(!Object.keys(qs).length)return fail('Indiquez la quantité d’au moins une taille (ou « Unique »).');p.prix=Math.round(pr*100)/100;p.qtes=qs;}
    if(a&&c==='vente') p.qtes=Object.assign(Object.fromEntries(Object.keys(a.qtes||{}).map(k=>[k,null])),p.qtes);
    await stkWrite(a||{},p,{type:a?'modif':'ajout'},a?'Article enregistré':'Article ajouté au stock',a?'a modifié l’article':'a ajouté au stock');
    return;
  }
  if(!a) return;
  const note=String(f.note||'').trim().slice(0,140);
  if(d.mode==='pret'){
    if(!f.eleve) return fail('Choisissez l’élève.');
    if(a.pret&&a.pret.eleve) return fail('Cette pièce est déjà prêtée.');
    await stkWrite(a,{pret:{eleve:f.eleve,le:f.date||todayISO()}},{type:'pret',eleve:f.eleve,note},'Pièce prêtée',`a prêté à ${elLbl(f.eleve)}`);
  }else if(d.mode==='retour'){
    const who=a.pret&&a.pret.eleve;
    await stkWrite(a,{pret:null,etat:f.etat},{type:'retour',eleve:who||undefined,etat:f.etat,note},'Retour enregistré',`a reçu le retour de ${who?elLbl(who):'la pièce'}`);
  }else if(d.mode==='insp'){
    if(!f.date) return fail('Indiquez la date de l’inspection.');
    const ok=f.etat!=='hs';
    await stkWrite(a,{insp:f.date,etat:ok?'service':'hs'},{type:'insp',etat:ok?'service':'hs',note},'Inspection enregistrée',ok?'a inspecté (conforme)':'a inspecté (hors service)');
  }else if(d.mode==='in'||d.mode==='out'){
    const q=num(f.qte);if(!(q>0)) return fail('Indiquez une quantité plus grande que zéro.');
    const left=(+a.qte||0)+(d.mode==='in'?q:-q);
    if(left<0) return fail(`Il n’en reste que ${fmtQ(a.qte)} ${a.unite||''}.`.trim());
    await stkWrite(a,{qte:Math.round(left*100)/100},{type:d.mode==='in'?'entree':'sortie',qte:q,note},d.mode==='in'?'Entrée enregistrée':'Sortie enregistrée',d.mode==='in'?`a ajouté ${fmtQ(q)} ${a.unite||''}`.trim():`a sorti ${fmtQ(q)} ${a.unite||''}`.trim());
  }else if(d.mode==='sell'){
    const q=num(f.qte), pr=num(f.prix), t=f.taille;
    if(!f.eleve) return fail('Choisissez l’élève.');
    if(!t||(a.qtes||{})[t]==null) return fail('Choisissez la taille.');
    if(!(q>=1)||Math.round(q)!==q) return fail('La quantité doit être un nombre entier.');
    if(!(pr>=0)) return fail('Indiquez le prix.');
    const have=+a.qtes[t]||0;if(q>have) return fail(have?`Il n’en reste que ${have} en ${t==='U'?'stock':'taille '+t}.`:'Cette taille est épuisée.');
    await stkWrite(a,{qtes:{[t]:have-q}},{type:'vente',eleve:f.eleve,taille:t,qte:q,prix:pr,total:Math.round(pr*q*100)/100,note},'Vente enregistrée',`a vendu à ${elLbl(f.eleve)} (${q} × ${money(pr)})`);
  }
}
async function stockClick(a,b){
  const id=b.dataset.id;
  if(a==='stk-new'){openStock(null,'edit',b.dataset.cat);return;}
  if(a==='stk-open'){openStock(id,'edit');return;}
  const m={'stk-pret':'pret','stk-retour':'retour','stk-insp':'insp','stk-in':'in','stk-out':'out','stk-sell':'sell'}[a];
  if(m){openStock(id,m);return;}
  const d=S.dr;if(!d||d.kind!=='stock') return;
  if(a==='stk-del'){d.confirmDel=true;renderDrawer();}
  else if(a==='stk-del-no'){d.confirmDel=false;renderDrawer();}
  else if(a==='stk-del-yes'){const x=byId(stk(),d.id);if(x)await stkWrite(x,null,{type:'suppr'},'Article retiré du stock','a retiré du stock');}
}
/* Un champ de la fenêtre change : la catégorie et la vente redessinent la fenêtre (champs et total) */
function stockInput(t,f){
  const d=S.dr;d.draft[f]=t.value;
  if(f==='cat'||d.err){d.err='';renderDrawer();}
  else if(d.mode==='sell'&&(f==='qte'||f==='prix')){const el=$('#sk-total');if(el)el.innerHTML=`Total : <b>${money((+d.draft.prix||0)*(+d.draft.qte||0))}</b>`;}
}

/* ---------- Ce qu’un élève a reçu : dans sa fiche (administration) et dans « Mon profil » ---------- */
function stockOfStudent(id,withBuys){
  const lent=stk().filter(a=>a.cat==='epi'&&a.pret&&a.pret.eleve===id).sort((a,b)=>collator.compare(a.nom||'',b.nom||''));
  const buys=withBuys?(S.data.stockMvt||[]).filter(m=>m.type==='vente'&&m.eleve===id):[];
  const tot=buys.reduce((s,m)=>s+(+m.total||0),0);
  const li=lent.map(a=>`<li><span><b>${esc(a.nom)}</b><span class="muted sm"> · ${esc([a.num,a.taille?'taille '+a.taille:''].filter(Boolean).join(' · '))}</span></span><span class="muted sm">${a.pret.le?'depuis le '+esc(shortDate(parse(a.pret.le))):''}</span></li>`).join('');
  const lb=buys.map(m=>{const d=new Date(m.le);return `<li><span>${esc(m.nom)}<span class="muted sm"> · ${m.taille?esc(sizeLbl(m.taille))+' · ':''}× ${fmtQ(m.qte||1)}, le ${dn(d)} ${esc(fMonthS.format(d))}</span></span><b>${money(m.total)}</b></li>`;}).join('');
  return `<section class="panel" id="stk-eleve"><h2>${withBuys?'Équipement et achats':'Mon équipement'}</h2>
    ${lent.length?`<ul class="plist">${li}</ul>`:'<p class="help">Aucun équipement prêté.</p>'}
    ${withBuys?`<h2 style="margin-top:16px">Achats</h2>${buys.length?`<ul class="plist">${lb}</ul><p class="help" style="margin-top:8px">Total : <b>${money(tot)}</b></p>`:'<p class="help">Aucun achat.</p>'}`:''}</section>`;
}
