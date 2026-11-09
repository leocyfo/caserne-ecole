/* ---------- Stock (suivi) : préparation des séances, achats, réparations, comptage d’inventaire, rapports, tournées ----------
   config/ecole.stock.besoins : { 'M7': [{ art, qte }] } consommables prévus par séance d’un module ; .retardH : heures avant un retour en retard
   stock-fourn/<id>  { nom, contact, tel, courriel, delai, note }
   stock-cmd/<id>    { num, fourn, date, statut brouillon|envoyee|partielle|recue|annulee, lignes [{ art, nom, qte, recu, prix }], note }
   stock-rep/<id>    { art, nom, probleme, reparateur, envoye, prevu, retour, cout, statut ouverte|terminee|annulee, note }
   stock-cpt/<id>    { date, empl, statut encours|termine, lignes { art: { e present|absent|abime, q } }, ecarts } */
const SK_CMD={brouillon:['off','Brouillon'],envoyee:['info','Envoyée'],partielle:['warn','Reçue en partie'],recue:['ok','Reçue'],annulee:['off','Annulée']};
const skModKey=s=>{const k=modOf(s.c);return k?'M'+k.code:'';};
const skBesoins=()=>((cfg().stock||{}).besoins)||{};
const skRetardH=()=>{const h=+((cfg().stock||{}).retardH);return h>0?h:24;};
const skLate=a=>a.sortie&&a.sortie.le&&(Date.now()-new Date(a.sortie.le).getTime())>skRetardH()*3600000;
/* Les séances qui utilisent un article réservable (30 prochains jours) */
function skResaSess(a){if(!a.resa) return [];const id='stk:'+a.id;return sessionsBetween(todayISO(),iso(addDays(new Date(),30))).filter(s=>s.kind==='cours'&&!s.cancelled&&ressOf(s).includes(id)).sort((x,y)=>x.date.localeCompare(y.date)||x.start-y.start);}
/* ---------- Préparation : le matériel et les consommables d’une journée ---------- */
function skPrepPage(){
  const st=S.pg, day=st.spd||iso(addDays(new Date(),1)), can=S.conn==='shared', B=skBesoins();
  const L=sessionsOn(day).filter(s=>s.kind==='cours'&&!s.cancelled).sort((a,b)=>a.start-b.start||collator.compare(gName(a.grp),gName(b.grp)));
  const out=skArts().filter(a=>a.sortie&&a.sortie.le).sort((a,b)=>String(a.sortie.le).localeCompare(String(b.sortie.le)));
  const tb=`<div class="toolbar"><label class="field"><span class="vh">Journée</span><input type="date" id="stk-pd" value="${esc(day)}"></label><span class="grow"></span><button class="btn" type="button" id="stk-prep-pr" data-act="stk-prep-pr">${icon('print')}Liste de préparation</button></div>`;
  const rows=L.map(s=>{const R=ressOf(s).filter(id=>id.startsWith('stk:')).map(id=>byId(skArts(),id.slice(4))).filter(Boolean), C=(B[skModKey(s)]||[]).map(x=>({a:byId(skArts(),x.art),q:+x.qte||0})).filter(x=>x.a&&x.q);
    const res=R.map(a=>`<span class="chip ${a.sortie&&a.sortie.le?'warn':a.statut==='hs'||a.statut==='maint'?'bad':'off'}">${esc(skName(a))}${a.sortie&&a.sortie.le?' · sorti':''}</span>`).join(''), con=C.map(x=>`<span class="chip ${(+x.a.qte||0)<x.q?'bad':'off'}">${esc(x.a.nom)} × ${x.q}</span>`).join('');
    return `<li class="stk-prep" id="stk-pp-${esc(s.key)}"><div><b>${esc((s.c.code?s.c.code+' ':'')+s.c.titre)}</b> <span class="muted sm">${esc(gName(s.grp))} · ${esc(momentOf(s))}</span><div class="stk-chips u-mt4">${res||''}${con||''}${!res&&!con?'<span class="muted sm">Aucun matériel ni consommable prévu.</span>':''}</div></div>
      ${can&&(R.length||C.length)?`<div class="row">${R.some(a=>!(a.sortie&&a.sortie.le)&&a.statut!=='hs'&&a.statut!=='maint')&&skCanDo('sortie')?`<button class="btn sm" type="button" data-act="stk-prep-out" data-key="${esc(s.key)}" data-date="${esc(day)}"${dis()}>Tout sortir</button>`:''}${C.length&&isAdmin()?`<button class="btn sm ghost" type="button" data-act="stk-prep-conso" data-key="${esc(s.key)}" data-date="${esc(day)}"${dis()}>Inscrire les consommables</button>`:''}</div>`:''}</li>`;}).join('');
  const late=out.filter(skLate);
  return tb+`<div class="two"><section class="panel" id="stk-prep"><h2>${esc(dayLabel(parse(day)))}</h2>${L.length?`<ul class="plist">${rows}</ul>`:'<p class="help">Aucune séance ce jour-là.</p>'}</section>
    <div class="stackp"><section class="panel" id="stk-out"><h2>Sorties en cours ${late.length?`<span class="chip bad">${pl(late.length,'en retard','en retard')}</span>`:''}</h2>${out.length?`<ul class="plist">${out.map(a=>`<li><span><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${esc(skName(a))}</button><span class="muted sm"> · ${esc(skSortieTxt(a))}</span></span>${skLate(a)?'<span class="chip bad">En retard</span>':''}</li>`).join('')}</ul>`:'<p class="help">Aucun matériel sorti.</p>'}<p class="help u-mt6">En retard après ${skRetardH()} h (Réglages du stock).</p></section>
    ${isAdmin()?skBesoinsHTML():''}</div></div>`;
}
/* Consommables prévus par séance de chaque module */
function skBesoinsHTML(){
  const B=skBesoins(), C=skArts().filter(skQte), mods=comps().map(k=>'M'+k.code), can=S.conn==='shared';
  const rows=Object.entries(B).filter(([,l])=>l&&l.length).sort((a,b)=>collator.compare(a[0],b[0])).map(([m,l])=>`<li><span><b>${esc(m)}</b> <span class="muted sm">${esc(l.map(x=>{const a=byId(skArts(),x.art);return (a?a.nom:'?')+' × '+x.qte;}).join(', '))}</span></span>${can?`<button class="ann-x" type="button" data-act="stk-bes-del" data-v="${esc(m)}" aria-label="Retirer">${icon('x')}</button>`:''}</li>`).join('');
  return `<section class="panel" id="stk-bes"><h2>Consommables par séance</h2><p class="help">Ce qu’une séance d’un module utilise : il paraît dans la préparation et dans les besoins à commander.</p>${rows?`<ul class="plist">${rows}</ul>`:''}
    ${can&&C.length?`<form class="inline-add u-mt8" data-form="stk-bes"><label class="field"><span>Module</span><select id="sb-mod">${mods.map(m=>`<option>${m}</option>`).join('')}</select></label><label class="field u-f2-160"><span>Consommable</span><select id="sb-art">${C.map(a=>`<option value="${esc(a.id)}">${esc(a.nom)}</option>`).join('')}</select></label><label class="field u-f0-70"><span>Qté</span><input id="sb-qte" type="number" min="1" value="1" inputmode="numeric"></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section>`;
}
async function skPrepOut(key,date){
  const s=findSess(date,key);if(!s) return;const se={key,date,titre:`${s.c.code?s.c.code+' ':''}${s.c.titre} · ${gName(s.grp)}`}, now=new Date().toISOString(), instr=(s.tch||[])[0]||'';
  const A=ressOf(s).filter(id=>id.startsWith('stk:')).map(id=>byId(skArts(),id.slice(4))).filter(a=>a&&!(a.sortie&&a.sortie.le)&&a.statut!=='hs'&&a.statut!=='maint');
  await runAll(A.map(a=>async()=>{await col('stock').doc(a.id).update({sortie:{le:now,instr,seance:se},maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'sortie',{seance:se,instr,note:'préparation'}));}),`${pl(A.length,'article sorti','articles sortis')}`);
}
async function skPrepConso(key,date){
  const s=findSess(date,key);if(!s) return;const se={key,date,titre:`${s.c.code?s.c.code+' ':''}${s.c.titre} · ${gName(s.grp)}`};
  const C=(skBesoins()[skModKey(s)]||[]).map(x=>({a:byId(skArts(),x.art),q:+x.qte||0})).filter(x=>x.a&&x.q);
  if(C.some(x=>(+x.a.qte||0)<x.q)){toast('Pas assez en stock : '+C.filter(x=>(+x.a.qte||0)<x.q).map(x=>x.a.nom).join(', ')+'.','bad');return;}
  await runAll(C.map(x=>async()=>{await col('stock').doc(x.a.id).update({qte:(+x.a.qte||0)-x.q,maj:new Date().toISOString()});await col('stock-mvt').doc(skId()).set(skMv(x.a,'conso',{qte:x.q,seance:se,note:'préparation'}));}),'Consommables inscrits');
}
async function skPrepPrint(){
  const day=S.pg.spd||iso(addDays(new Date(),1)), B=skBesoins();
  const L=sessionsOn(day).filter(s=>s.kind==='cours'&&!s.cancelled).sort((a,b)=>a.start-b.start);
  const body=`<section class="pr-page">${prHead('Préparation du matériel',esc(longDate(parse(day))))}<table class="pr-t"><thead><tr><th>Séance</th><th>Classe</th><th>Matériel</th><th>Consommables</th><th>Sorti</th></tr></thead><tbody>${L.map(s=>{const R=ressOf(s).filter(id=>id.startsWith('stk:')).map(id=>byId(skArts(),id.slice(4))).filter(Boolean), C=(B[skModKey(s)]||[]).map(x=>{const a=byId(skArts(),x.art);return a?a.nom+' × '+x.qte:'';}).filter(Boolean);
    return `<tr><td>${esc((s.c.code?s.c.code+' ':'')+s.c.titre)}<br><small>${esc(momentOf(s))}</small></td><td>${esc(gName(s.grp))}</td><td>${esc(R.map(skName).join(', ')||'—')}</td><td>${esc(C.join(', ')||'—')}</td><td>☐</td></tr>`;}).join('')}</tbody></table>${prFoot()}</section>`;
  await printDoc('Préparation · '+day,body,true,'preparation-'+day);
}
/* ---------- Achats : à commander, commandes, fournisseurs ---------- */
const skFourn=()=>(S.data.stockFourn||[]).slice().sort((a,b)=>collator.compare(a.nom||'',b.nom||''));
const skCmds=()=>(S.data.stockCmd||[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.num||'').localeCompare(String(a.num||'')));
/* Besoins : séances des 30 prochains jours × consommables prévus, plus le seuil, moins le stock et ce qui est déjà commandé */
function skNeeds(){
  const B=skBesoins(), need={}, enCmd={};
  for(const s of sessionsBetween(todayISO(),iso(addDays(new Date(),30)))){if(s.kind!=='cours'||s.cancelled) continue;for(const x of B[skModKey(s)]||[]) need[x.art]=(need[x.art]||0)+(+x.qte||0);}
  for(const c of skCmds()) if(c.statut==='envoyee'||c.statut==='partielle') for(const l of c.lignes||[]) enCmd[l.art]=(enCmd[l.art]||0)+Math.max(0,(+l.qte||0)-(+l.recu||0));
  return skArts().filter(skQte).map(a=>{const prev=need[a.id]||0, cmd=enCmd[a.id]||0, q=+a.qte||0, manque=Math.max(0,(+a.min||0)+prev-q-cmd), exp=a.exp&&a.exp<=iso(addDays(new Date(),skCfg().alerte));return {a,prev,cmd,q,manque,exp};}).filter(x=>x.manque>0||x.exp);
}
function skToBuyPage(){
  const N=skNeeds(), can=isAdmin()&&S.conn==='shared';
  if(!N.length) return emptyBox('Rien à commander','Les consommables couvrent leur seuil et les séances des 30 prochains jours, et aucun lot n’arrive à péremption.');
  const rows=N.map(x=>xRow('xm-skb xm-lite','',`<div class="xm-t"><button class="link" type="button" data-act="stk-open" data-id="${esc(x.a.id)}">${esc(x.a.nom)}</button><small>${esc([x.a.fourn,x.a.unite].filter(Boolean).join(' · ')||'—')}</small></div><span class="xm-m">${x.q} en stock · seuil ${+x.a.min||0}</span><span class="xm-m">${x.prev?x.prev+' prévus (30 j)':'—'}${x.cmd?' · '+x.cmd+' commandés':''}</span><span>${x.manque?`<b class="bad-t">${x.manque} à commander</b>`:''}${x.exp?` <span class="chip warn">Péremption ${esc(shortDate(parse(x.a.exp)))}</span>`:''}</span>`,'')).join('');
  return `<div class="toolbar"><span class="grow"></span>${can?`<button class="btn primary" type="button" id="stk-buy" data-act="stk-buy"${dis()}>${icon('plus')}Préparer les commandes</button>`:''}</div>`
    +xList('xm-skb',[['Consommable'],['Stock'],['Prévu'],['À commander']],rows)+'<p class="help u-mt8">« Préparer les commandes » crée un brouillon par fournisseur avec les quantités manquantes.</p>';
}
async function skBuy(){
  const N=skNeeds().filter(x=>x.manque>0), by={};
  for(const x of N){const k=x.a.fourn||'Sans fournisseur';(by[k]=by[k]||[]).push({art:x.a.id,nom:x.a.nom,qte:x.manque,recu:0,prix:+x.a.prix||0});}
  const yr=todayISO().slice(0,4), pre='BC-'+yr+'-';let n=Math.max(0,...skCmds().filter(c=>String(c.num||'').startsWith(pre)).map(c=>+String(c.num).slice(pre.length)||0));
  const fns=Object.entries(by).map(([f,L])=>{const num=pre+String(++n).padStart(3,'0');return ()=>col('stock-cmd').doc('bc'+Date.now().toString(36)+n).set({num,fourn:f,date:todayISO(),statut:'brouillon',lignes:L,note:'',le:new Date().toISOString(),par:whoAmI()});});
  if(await runAll(fns,`${pl(fns.length,'commande préparée','commandes préparées')}`)){S.pg.sk='cmd';render();}
}
function skCmdPage(){
  const C=skCmds(), can=isAdmin()&&S.conn==='shared';
  const tb=`<div class="toolbar"><span class="grow"></span>${can?`<button class="btn primary" type="button" id="stk-cmd-new" data-act="stk-cmd" data-id="">${icon('plus')}Nouvelle commande</button>`:''}</div>`;
  if(!C.length) return tb+emptyBox('Aucune commande','Les bons de commande aux fournisseurs : brouillon, envoyé, reçu en partie ou en entier. La réception met le stock à jour.');
  const tot=c=>sumC((c.lignes||[]).map(l=>Math.round((+l.qte||0)*(+l.prix||0))));
  return tb+`<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Numéro</th><th>Fournisseur</th><th>Date</th><th class="num">Lignes</th><th class="num">Total</th><th>État</th></tr></thead><tbody>${C.map(c=>`<tr class="row-link" data-act="stk-cmd" data-id="${esc(c.id)}"><td><button class="link" type="button" data-act="stk-cmd" data-id="${esc(c.id)}">${esc(c.num||'—')}</button></td><td>${esc(c.fourn||'')}</td><td>${c.date?esc(shortDate(parse(c.date))):''}</td><td class="num">${(c.lignes||[]).length}</td><td class="num">${esc(fmtM(tot(c)))}</td><td><span class="chip ${(SK_CMD[c.statut]||SK_CMD.brouillon)[0]}">${(SK_CMD[c.statut]||SK_CMD.brouillon)[1]}</span></td></tr>`).join('')}</tbody></table></div>`;
}
function skCmdDrawer(d){
  const c=d.id?byId(skCmds(),d.id):null, can=isAdmin()&&S.conn==='shared', ed=!c||c.statut==='brouillon';
  const C=skArts().filter(skQte).sort((a,b)=>collator.compare(a.nom,b.nom)), L=(c?c.lignes:[]).concat(ed?Array.from({length:Math.max(2,4-(c?c.lignes.length:0))},()=>({art:'',qte:'',prix:''})):[]);
  const tot=sumC((c?c.lignes:[]).map(l=>Math.round((+l.qte||0)*(+l.prix||0))));
  if(ed) return dTop('Commande',c?esc(c.num):'Nouvelle commande')
    +`<form class="dr-body" data-form="stk-cmd" novalidate><label class="field"><span>Fournisseur</span><input id="sc-fourn" list="sc-fourns" maxlength="60" autocomplete="off" value="${esc(c?c.fourn:'')}"><datalist id="sc-fourns">${skFourn().map(v=>`<option value="${esc(v.nom)}">`).join('')}</datalist></label>
      <fieldset><legend>Lignes</legend><div class="cp-fl">${L.map((l,i)=>`<div class="cp-fli"><label class="field"><span${i?' class="vh"':''}>Article</span><select data-cl="${i}" data-k="art"><option value="">—</option>${C.map(a=>`<option value="${esc(a.id)}"${l.art===a.id?' selected':''}>${esc(a.nom)}</option>`).join('')}</select></label><label class="field"><span${i?' class="vh"':''}>Qté</span><input data-cl="${i}" data-k="qte" inputmode="numeric" value="${esc(l.qte===''?'':String(l.qte))}"></label><label class="field"><span${i?' class="vh"':''}>Prix ($)</span><input data-cl="${i}" data-k="prix" inputmode="decimal" value="${esc(l.prix===''||l.prix==null?'':moneyIn(l.prix))}" placeholder="0,00"></label></div>`).join('')}</div></fieldset>
      <label class="field"><span>Note</span><textarea id="sc-note" rows="2" maxlength="300">${esc(c?c.note||'':'')}</textarea></label>
      <div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button>${c&&can?`<button class="btn" type="button" data-act="stk-cmd-st" data-v="envoyee"${dis()}>Marquer envoyée</button><span class="grow"></span><button class="btn sm ghost" type="button" data-act="stk-cmd-st" data-v="annulee"${dis()}>Annuler la commande</button>`:''}</div></form>`;
  return dTop('Commande',esc(c.num),esc(c.fourn||''))
    +`<form class="dr-body" data-form="stk-rcv" novalidate><p><span class="chip ${(SK_CMD[c.statut]||SK_CMD.brouillon)[0]}">${(SK_CMD[c.statut]||SK_CMD.brouillon)[1]}</span> <span class="muted sm">${esc(shortDate(parse(c.date)))} · ${esc(fmtM(tot))}</span></p>
      <table class="tbl cp-lines"><thead><tr><th>Article</th><th class="num">Commandé</th><th class="num">Reçu</th>${c.statut==='envoyee'||c.statut==='partielle'?'<th class="num">Reçu maintenant</th>':''}</tr></thead><tbody>${c.lignes.map((l,i)=>`<tr><td>${esc(l.nom)}</td><td class="num">${l.qte}</td><td class="num">${+l.recu||0}</td>${c.statut==='envoyee'||c.statut==='partielle'?`<td class="num"><input class="cp-in" data-rl="${i}" inputmode="numeric" value="${Math.max(0,(+l.qte||0)-(+l.recu||0))}" aria-label="Reçu maintenant : ${esc(l.nom)}"></td>`:''}</tr>`).join('')}</tbody></table>
      ${(c.statut==='envoyee'||c.statut==='partielle')&&can?`<div class="row u-mt12"><button class="btn primary" type="submit" id="stk-rcv-go"${dis()}>Inscrire la réception</button></div><p class="help">Le stock augmente${opt('compta')?' ; la valeur reçue s’inscrit comme dépense dans la Compta':''}.</p>`:''}</form>`;
}
async function skSaveCmd(f){
  const d=S.dr, old=d.id?byId(skCmds(),d.id):null, L=[];
  for(const i of new Set([...f.querySelectorAll('[data-cl]')].map(x=>x.dataset.cl))){const g=k=>f.querySelector(`[data-cl="${i}"][data-k="${k}"]`).value.trim(), art=g('art');if(!art)continue;const a=byId(skArts(),art), q=Math.round(+g('qte')), p=g('prix')?money(g('prix')):(+(a&&a.prix)||0);
    if(!(q>0)||p==null){toast('Chaque ligne a besoin d’une quantité et d’un prix valides.','bad');return;}L.push({art,nom:a?a.nom:'',qte:q,recu:0,prix:p});}
  if(!L.length){toast('Ajoutez au moins une ligne.','bad');return;}
  const yr=todayISO().slice(0,4), pre='BC-'+yr+'-', num=old?old.num:pre+String(Math.max(0,...skCmds().filter(c=>String(c.num||'').startsWith(pre)).map(c=>+String(c.num).slice(pre.length)||0))+1).padStart(3,'0');
  const doc=Object.assign({},old||{date:todayISO(),statut:'brouillon',le:new Date().toISOString(),par:whoAmI()},{num,fourn:f.querySelector('#sc-fourn').value.trim(),lignes:L,note:f.querySelector('#sc-note').value.trim()});delete doc.id;
  const id=d.id||'bc'+Date.now().toString(36);
  if(await write(()=>col('stock-cmd').doc(id).set(doc),old?'Commande enregistrée':`Commande ${num} créée`)){S.dr.id=id;renderDrawer();}
}
async function skReceive(f){
  const c=byId(skCmds(),S.dr.id);if(!c) return;
  const L=c.lignes.map(l=>Object.assign({},l)), fns=[], now=new Date().toISOString();let val=0;
  for(const x of f.querySelectorAll('[data-rl]')){const i=+x.dataset.rl, n=Math.max(0,Math.round(+x.value||0));if(!n) continue;const l=L[i], a=byId(skArts(),l.art);l.recu=(+l.recu||0)+n;val+=Math.round(n*(+l.prix||0));
    if(a) fns.push(async()=>{await col('stock').doc(a.id).update({qte:(+a.qte||0)+n,maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'reappro',{qte:n,note:`${c.num} · ${c.fourn||''}`}));});}
  if(!fns.length){toast('Indiquez ce qui a été reçu.','bad');return;}
  const all=L.every(l=>(+l.recu||0)>=(+l.qte||0));
  fns.push(()=>col('stock-cmd').doc(c.id).update({lignes:L,statut:all?'recue':'partielle',recueLe:now}));
  if(await runAll(fns,all?'Commande reçue':'Réception partielle inscrite')&&val&&S.role==='admin') await skExpense({date:todayISO(),poste:'conso',libelle:`Commande ${c.num}`,tiers:c.fourn||'',ht:val,source:'stock'});
  renderDrawer();
}
function skFournPage(){
  const F=skFourn(), can=isAdmin()&&S.conn==='shared', A=skArts();
  const tb=`<div class="toolbar"><span class="grow"></span>${can?`<button class="btn primary" type="button" id="stk-fo-new" data-act="stk-fo" data-id="">${icon('plus')}Nouveau fournisseur</button>`:''}</div>`;
  if(!F.length) return tb+emptyBox('Aucun fournisseur','Le carnet des fournisseurs : contact, téléphone, courriel, délai de livraison.');
  return tb+`<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Fournisseur</th><th>Contact</th><th>Téléphone</th><th>Courriel</th><th class="num">Délai</th><th class="num">Articles</th></tr></thead><tbody>${F.map(v=>`<tr class="row-link" data-act="stk-fo" data-id="${esc(v.id)}"><td><button class="link" type="button" data-act="stk-fo" data-id="${esc(v.id)}">${esc(v.nom)}</button></td><td>${esc(v.contact||'')}</td><td>${v.tel?`<a href="tel:${esc(String(v.tel).replace(/[^\d+]/g,''))}">${esc(v.tel)}</a>`:''}</td><td>${v.courriel?`<a href="mailto:${esc(v.courriel)}">${esc(v.courriel)}</a>`:''}</td><td class="num">${v.delai?esc(v.delai)+' j':''}</td><td class="num">${A.filter(a=>a.fourn===v.nom).length}</td></tr>`).join('')}</tbody></table></div>`;
}
function skFournDrawer(d){
  const v=d.id?byId(skFourn(),d.id):null, x=v||{}, f=(id,l,val,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(val==null?'':val)}" ${att||''}></label>`;
  return dTop('Fournisseur',v?esc(v.nom):'Nouveau fournisseur')+`<form class="dr-body" data-form="stk-fo" novalidate>${f('sf2-nom','Nom',x.nom,'maxlength="60" autocomplete="off"')}<div class="grid2">${f('sf2-contact','Contact',x.contact,'maxlength="60" autocomplete="off"')}${f('sf2-tel','Téléphone',x.tel,'maxlength="30" autocomplete="off"')}</div>
    <div class="grid2">${f('sf2-mail','Courriel',x.courriel,'type="email" maxlength="80" autocomplete="off"')}${f('sf2-delai','Délai de livraison (jours)',x.delai,'type="number" min="0" max="120" inputmode="numeric"')}</div>
    <label class="field"><span>Note</span><textarea id="sf2-note" rows="2" maxlength="300">${esc(x.note||'')}</textarea></label><div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button><button class="btn ghost" type="button" data-act="close">Annuler</button></div></form>`;
}
async function skSaveFourn(f){
  const v=id=>f.querySelector('#'+id).value.trim(), nom=v('sf2-nom');if(!nom){toast('Donnez le nom du fournisseur.','bad');return;}
  if(await write(()=>col('stock-fourn').doc(S.dr.id||'fo'+Date.now().toString(36)).set({nom,contact:v('sf2-contact'),tel:v('sf2-tel'),courriel:v('sf2-mail'),delai:+v('sf2-delai')||null,note:v('sf2-note')}),'Fournisseur enregistré')) closeDrawer(true);
}
/* ---------- Réparations : bons de travail ---------- */
const skReps=()=>(S.data.stockRep||[]).slice().sort((a,b)=>(a.statut==='ouverte'?0:1)-(b.statut==='ouverte'?0:1)||String(b.le||'').localeCompare(String(a.le||'')));
function skRepPage(){
  const R=skReps();if(!R.length) return emptyBox('Aucune réparation','Depuis la fiche d’un article : « Envoyer en réparation » ouvre un bon de travail (problème, réparateur, retour prévu, coût).');
  return `<div class="tbl-wrap"><table class="tbl stack"><thead><tr><th>Article</th><th>Problème</th><th>Réparateur</th><th>Retour prévu</th><th class="num">Coût</th><th>État</th></tr></thead><tbody>${R.map(r=>{const late=r.statut==='ouverte'&&r.prevu&&r.prevu<todayISO();return `<tr class="row-link" data-act="stk-rep" data-id="${esc(r.id)}"><td><button class="link" type="button" data-act="stk-rep" data-id="${esc(r.id)}">${esc(r.nom||'')}</button></td><td>${esc(r.probleme||'')}</td><td>${esc(r.reparateur||'')}</td><td>${r.prevu?esc(shortDate(parse(r.prevu))):''}</td><td class="num">${r.cout?esc(fmtM(r.cout)):''}</td><td><span class="chip ${r.statut==='terminee'?'ok':r.statut==='annulee'?'off':late?'bad':'warn'}">${r.statut==='terminee'?'Terminée':r.statut==='annulee'?'Annulée':late?'En retard':'En cours'}</span></td></tr>`;}).join('')}</tbody></table></div>`;
}
function skRepDrawer(d){
  const r=d.id?byId(skReps(),d.id):null, a=byId(skArts(),r?r.art:d.art), f=(id,l,val,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(val==null?'':val)}" ${att||''}></label>`, open=!r||r.statut==='ouverte';
  return dTop('Réparation',esc(r?r.nom:a?skName(a):''))+`<form class="dr-body" data-form="stk-rep" novalidate>
    <label class="field"><span>Problème</span><textarea id="sr2-pb" rows="2" maxlength="300"${open?'':' disabled'}>${esc(r?r.probleme||'':'')}</textarea></label>
    <div class="grid2">${f('sr2-rep','Réparateur',r?r.reparateur:'','maxlength="60" autocomplete="off" list="sc-fourns"'+(open?'':' disabled'))}${f('sr2-prevu','Retour prévu',r?r.prevu:iso(addDays(new Date(),14)),'type="date"'+(open?'':' disabled'))}</div>
    <datalist id="sc-fourns">${skFourn().map(v=>`<option value="${esc(v.nom)}">`).join('')}</datalist>
    ${r&&open?`<div class="cp-box"><h3 class="sb-h3">Réparation terminée</h3><div class="grid2">${f('sr2-cout','Coût ($)','','inputmode="decimal" placeholder="0,00"')}${f('sr2-ret','Retour le',todayISO(),'type="date"')}</div><div class="row"><button class="btn primary" type="button" id="stk-rep-done" data-act="stk-rep-done"${dis()}>Terminer et remettre en service</button></div>${opt('compta')?'<p class="help">Le coût s’inscrit dans la Compta (Entretien et réparations).</p>':''}</div>`:''}
    ${r&&!open?`<p class="help">${r.statut==='terminee'?`Revenu le ${esc(shortDate(parse(r.retour||todayISO())))}${r.cout?' · '+esc(fmtM(r.cout)):''}.`:'Annulée.'}</p>`:''}
    ${open?`<div class="row u-mt10"><button class="btn${r?'':' primary'}" type="submit"${dis()}>${r?'Enregistrer':'Envoyer en réparation'}</button>${r?`<button class="btn sm ghost" type="button" data-act="stk-rep-cancel"${dis()}>Annuler le bon</button>`:'<button class="btn ghost" type="button" data-act="stk-view">Annuler</button>'}</div>`:''}</form>`;
}
async function skSaveRep(f){
  const d=S.dr, r=d.id?byId(skReps(),d.id):null, a=byId(skArts(),r?r.art:d.art);if(!a) return;
  const v=id=>f.querySelector('#'+id).value.trim(), pb=v('sr2-pb');if(!pb){toast('Décrivez le problème.','bad');return;}
  const doc=Object.assign({},r||{art:a.id,nom:skName(a),statut:'ouverte',envoye:todayISO(),le:new Date().toISOString(),par:whoAmI()},{probleme:pb,reparateur:v('sr2-rep'),prevu:v('sr2-prevu')});delete doc.id;
  const id=d.id||'rp'+Date.now().toString(36);
  S.busy=true;renderDrawer();
  const ok=await write(async()=>{await col('stock-rep').doc(id).set(doc);if(!r){await col('stock').doc(a.id).update({statut:'maint',sortie:null,maj:new Date().toISOString()});await col('stock-mvt').doc(skId()).set(skMv(a,'maint',{note:`réparation : ${pb}${doc.reparateur?' · '+doc.reparateur:''}`}));}},r?'Bon enregistré':'Article envoyé en réparation');
  S.busy=false;if(ok){S.dr={kind:'stk',mode:'rep',id,uid:S.dr.uid};}render();
}
async function skRepDone(){
  const r=byId(skReps(),S.dr.id), a=r&&byId(skArts(),r.art);if(!r) return;
  const f=$('[data-form=stk-rep]'), ct=f.querySelector('#sr2-cout').value.trim()?money(f.querySelector('#sr2-cout').value):0, ret=f.querySelector('#sr2-ret').value||todayISO();
  if(ct==null){toast('Le coût n’est pas valide.','bad');return;}
  const ok=await runAll([()=>col('stock-rep').doc(r.id).update({statut:'terminee',retour:ret,cout:ct||0}),...(a?[async()=>{await col('stock').doc(a.id).update({statut:'service',maj:new Date().toISOString()});await col('stock-mvt').doc(skId()).set(skMv(a,'service',{note:`réparation terminée${r.reparateur?' · '+r.reparateur:''}${ct?' · '+fmtM(ct):''}`}));}]:[])],'Réparation terminée');
  if(ok&&ct&&S.role==='admin') await skExpense({date:ret,poste:'entretien',libelle:`Réparation : ${r.nom}`,tiers:r.reparateur||'',ht:ct,source:'stock'});
}
/* ---------- Comptage d’inventaire ---------- */
const skCpts=()=>(S.data.stockCpt||[]).slice().sort((a,b)=>String(b.le||'').localeCompare(String(a.le||'')));
function skCountPage(){
  const st=S.pg, C=skCpts(), cur=C.find(c=>c.id===st.scp)||C.find(c=>c.statut==='encours'), can=S.conn==='shared'&&isAdmin();
  if(cur&&cur.statut==='encours') return skCountRun(cur);
  const tb=`<div class="toolbar"><select id="stk-ce" aria-label="Emplacement à compter"><option value="">Tout le stock</option>${skLieux().map(l=>`<option value="${esc(l.nom)}"${st.sce===l.nom?' selected':''}>${esc(l.nom)}</option>`).join('')}</select>${can?`<button class="btn primary" type="button" id="stk-cpt-go" data-act="stk-cpt-new"${dis()}>Commencer le comptage</button>`:''}<span class="grow"></span></div>`;
  return tb+(C.length?`<section class="panel"><h2>Comptages</h2><ul class="plist">${C.map(c=>`<li><span><button class="link" type="button" data-act="pg-set" data-k="scp" data-v="${esc(c.id)}">${esc(c.empl||'Tout le stock')}</button><span class="muted sm"> · ${esc(shortDate(parse(c.date)))}${c.par?' · '+esc(c.par):''}</span></span><span class="chip ${c.statut==='encours'?'warn':c.ecarts?'bad':'ok'}">${c.statut==='encours'?'En cours':c.ecarts?pl(c.ecarts,'écart','écarts'):'Aucun écart'}</span></li>`).join('')}</ul></section>`:emptyBox('Aucun comptage','Choisissez un emplacement (ou tout le stock), puis notez chaque article : présent, absent ou abîmé (un article scanné est noté présent). Les écarts deviennent des ajustements ; un article non noté reste tel quel.'));
}
const skCountArts=c=>{const U=c.empl?skUnder(c.empl):null;return skArts().filter(a=>!U||U.has(a.empl)).sort((a,b)=>collator.compare(a.empl||'',b.empl||'')||collator.compare(a.nom,b.nom)||collator.compare(a.code||'',b.code||''));};
function skCountRun(c){
  const A=skCountArts(c), L=c.lignes||{}, done=A.filter(a=>L[a.id]).length, can=S.conn==='shared';
  const rows=A.map(a=>{const x=L[a.id]||{};return `<li class="stk-cl${x.e?' on':''}" id="stk-cl-${esc(a.id)}"><span><b>${esc(skName(a))}</b><span class="muted sm"> · ${esc(a.empl||'—')}${skQte(a)?' · attendu '+(+a.qte||0):''}</span></span>
    <span class="row">${skQte(a)?`<input class="cp-in" type="number" min="0" inputmode="numeric" data-cq="${esc(a.id)}" value="${x.q!=null?x.q:''}" placeholder="${+a.qte||0}" aria-label="Quantité comptée : ${esc(a.nom)}">`:[['present','Présent','ok'],['absent','Absent','bad'],['abime','Abîmé','warn']].map(([k,l,t])=>`<button type="button" class="chip-btn ${x.e===k?t:''}" data-act="stk-cl" data-id="${esc(a.id)}" data-v="${k}" aria-pressed="${x.e===k}">${l}</button>`).join('')}</span></li>`;}).join('');
  return `<div class="toolbar"><p class="summary u-m0"><span><b>${done}</b>sur ${A.length} comptés</span></p><span class="grow"></span><button class="btn" type="button" data-act="stk-scan">${icon('eye')}Scanner</button>${can?`<button class="btn primary" type="button" id="stk-cpt-end" data-act="stk-cpt-end"${dis()}>Terminer le comptage</button>`:''}</div>
    <section class="panel"><h2>Comptage · ${esc(c.empl||'Tout le stock')}</h2><p class="help">Un article scanné pendant le comptage est noté présent.</p><ul class="plist stk-count">${rows}</ul></section>`;
}
async function skCountNew(){
  const id='cp'+Date.now().toString(36);
  if(await write(()=>col('stock-cpt').doc(id).set({date:todayISO(),empl:S.pg.sce||'',statut:'encours',lignes:{},le:new Date().toISOString(),par:whoAmI()}),'Comptage commencé')){S.pg.scp=id;render();}
}
const skCountCur=()=>skCpts().find(c=>c.statut==='encours');
async function skCountMark(aid,e,q){
  const c=skCountCur();if(!c) return;const x=Object.assign({},(c.lignes||{})[aid]||{});if(e!=null)x.e=e;if(q!=null)x.q=q;
  await col('stock-cpt').doc(c.id).update({lignes:Object.assign({},c.lignes||{},{[aid]:x})}).catch(()=>{});
}
async function skCountEnd(){
  const c=skCountCur();if(!c) return;const L=c.lignes||{}, fns=[], now=new Date().toISOString();let n=0;
  for(const a of skCountArts(c)){const x=L[a.id];
    if(skQte(a)){if(x&&x.q!=null&&+x.q!==(+a.qte||0)){n++;fns.push(async()=>{await col('stock').doc(a.id).update({qte:+x.q,maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'ajust',{qte:+x.q-(+a.qte||0),note:`comptage : ${x.q}`}));});}}
    else if(!x) continue;
    else if(x.e==='absent'){if(a.statut!=='manquant'){n++;fns.push(async()=>{await col('stock').doc(a.id).update({statut:'manquant',maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'ajust',{note:'manquant au comptage'}));});}}
    else if(x.e==='abime'&&a.statut!=='maint'){n++;fns.push(async()=>{await col('stock').doc(a.id).update({statut:'maint',maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'maint',{note:'abîmé au comptage'}));});}
    else if(x.e==='present'&&a.statut==='manquant'){fns.push(async()=>{await col('stock').doc(a.id).update({statut:'service',maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'service',{note:'retrouvé au comptage'}));});}}
  fns.push(()=>col('stock-cpt').doc(c.id).update({statut:'termine',ecarts:n,fin:now}));
  if(await runAll(fns,n?`Comptage terminé : ${pl(n,'écart ajusté','écarts ajustés')}`:'Comptage terminé : aucun écart')){S.pg.scp='';render();}
}
/* ---------- Rapports du stock ---------- */
function skValue(a){const p=+a.prix||0;if(!p) return 0;if(skQte(a)) return p*(+a.qte||0);if(a.statut==='hs'||a.statut==='manquant') return 0;const vie=+((skCfg().cats[a.cat]||{}).vie)||0;if(!vie||!a.fab) return p;const age=(Date.now()-parse(a.fab).getTime())/(365.25*864e5);return Math.max(0,Math.round(p*(1-age/vie)));}
function skReportPage(){
  const A=skArts(), M=S.data.stockMvt||[], y0=yearStart();
  const byCat=SK_CATS.map(([k,l])=>{const xs=A.filter(a=>a.cat===k);return {l,n:xs.length,v:sumC(xs.map(a=>skQte(a)?(+a.prix||0)*(+a.qte||0):+a.prix||0)),r:sumC(xs.map(skValue))};});
  const out={};for(const m of M) if(m.type==='sortie'&&String(m.date)>=y0) out[m.art]=(out[m.art]||0)+1;
  const top=Object.entries(out).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,n])=>({a:byId(A,id),n})).filter(x=>x.a);
  const never=A.filter(a=>a.cat==='mat'&&!skQte(a)&&!out[a.id]);
  const bris={};for(const m of M) if(m.type==='bris') {const k=String(m.nom||'').split(' · ')[0];bris[k]=(bris[k]||0)+1;}
  const repC=sumC((S.data.stockRep||[]).filter(r=>r.statut==='terminee').map(r=>+r.cout||0));
  const conso={};for(const m of M) if(m.type==='conso'&&String(m.date)>=y0){const a=byId(A,m.art);conso[m.nom]=(conso[m.nom]||0)+(+m.qte||0)*(a&&+a.prix||0);}
  return `<div class="kpis">${kpiBox('skr-v','Valeur à neuf',fmtM(sumC(byCat.map(x=>x.v))),'',pl(A.length,'article','articles'))}${kpiBox('skr-r','Valeur actuelle',fmtM(sumC(byCat.map(x=>x.r))),'','après usure (durée de vie)')}${kpiBox('skr-rep','Réparations',fmtM(repC),'',pl((S.data.stockRep||[]).length,'bon de travail','bons de travail'))}${kpiBox('skr-c','Consommables utilisés',fmtM(sumC(Object.values(conso))),'','depuis la rentrée')}</div>
    <div class="two u-mt12"><section class="panel"><h2>Valeur par catégorie</h2><div class="tbl-wrap"><table class="tbl cp-tbl"><thead><tr><th>Catégorie</th><th class="num">Articles</th><th class="num">À neuf</th><th class="num">Actuelle</th></tr></thead><tbody>${byCat.map(x=>`<tr><td>${esc(x.l)}</td><td class="num">${x.n}</td><td class="num">${esc(fmtM(x.v))}</td><td class="num">${esc(fmtM(x.r))}</td></tr>`).join('')}</tbody></table></div></section>
    <div class="stackp"><section class="panel" id="skr-top"><h2>Les plus sortis</h2>${top.length?`<ul class="plist">${top.map(x=>`<li><span>${esc(skName(x.a))}</span><b>${pl(x.n,'sortie','sorties')}</b></li>`).join('')}</ul>`:'<p class="help">Aucune sortie depuis la rentrée.</p>'}${never.length?`<p class="help u-mt8">${pl(never.length,'pièce de matériel jamais sortie','pièces de matériel jamais sorties')} depuis la rentrée.</p>`:''}</section>
    <section class="panel"><h2>Bris</h2>${Object.keys(bris).length?`<ul class="plist">${Object.entries(bris).sort((a,b)=>b[1]-a[1]).map(([k,n])=>`<li><span>${esc(k)}</span><b>${n}</b></li>`).join('')}</ul>`:'<p class="help">Aucun bris déclaré.</p>'}</section></div></div>
    <section class="panel u-mt12"><h2>Exporter et imprimer</h2><div class="row"><button class="btn sm" type="button" id="skr-exp" data-act="stk-inv-exp">${icon('down')}Inventaire (CSV)</button><button class="btn sm" type="button" data-act="stk-mvt-exp">${icon('down')}Mouvements (CSV)</button><button class="btn sm" type="button" data-act="stk-inv-pr">${icon('print')}Inventaire par emplacement</button><button class="btn sm" type="button" data-act="stk-labels" data-v="all">${icon('print')}Toutes les étiquettes</button><button class="btn sm" type="button" data-act="stk-insp-pr">${icon('print')}Rapport d’inspections</button></div></section>`;
}
async function skInvExport(){
  await saveFile(`pompiernote-inventaire-${todayISO()}.csv`,new Blob([csvText([['Nom','Catégorie','Sous-catégorie','Code','N° de série','Taille','Emplacement','État','Conformité','Quantité','Seuil','Attribué à','Fabrication','Dernière inspection','Prix','Valeur actuelle']].concat(skArts().map(a=>[a.nom,skCat(a.cat)[1],a.sous||'',a.code||'',a.serie||'',a.taille||'',a.empl||'',skQte(a)?'':(SK_ST[a.statut]||SK_ST.service)[1],skConf(a)[1],skQte(a)?+a.qte||0:1,skQte(a)?+a.min||0:'',skWho(a),a.fab||'',a.inspDer||'',a.prix?((+a.prix)/100).toFixed(2):'',(skValue(a)/100).toFixed(2)])))],{type:'text/csv'}));
}
async function skInvPrint(){
  const by={};for(const a of skArts()) (by[a.empl||'Sans emplacement']=by[a.empl||'Sans emplacement']||[]).push(a);
  const body=Object.entries(by).sort((a,b)=>collator.compare(a[0],b[0])).map(([e,L])=>`<section class="pr-page">${prHead('Inventaire · '+e,pl(L.length,'article','articles'))}<table class="pr-t"><thead><tr><th>Article</th><th>Code</th><th>N° de série</th><th>État</th><th>Qté</th><th>Vérifié</th></tr></thead><tbody>${L.sort((x,y)=>collator.compare(x.nom,y.nom)||collator.compare(x.code||'',y.code||'')).map(a=>`<tr><td>${esc(a.nom)}</td><td>${esc(a.code||'')}</td><td>${esc(a.serie||'')}</td><td>${esc(skConf(a)[1])}</td><td>${skQte(a)?+a.qte||0:1}</td><td>☐</td></tr>`).join('')}</tbody></table>${prFoot()}</section>`).join('');
  await printDoc('Inventaire par emplacement',body,false,'inventaire');
}
/* Rapport des inspections : celles des 30 derniers jours, avec les points non conformes */
async function skInspPrint(){
  const d0=iso(addDays(new Date(),-30)), M=(S.data.stockMvt||[]).filter(m=>(m.type==='insp'||m.type==='epreuve')&&String(m.date)>=d0).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const body=`<section class="pr-page">${prHead('Rapport d’inspections','Du '+esc(longDate(parse(d0)))+' au '+esc(longDate(new Date())))}<table class="pr-t"><thead><tr><th>Date</th><th>Article</th><th>Type</th><th>Résultat</th><th>Par</th></tr></thead><tbody>${M.map(m=>`<tr><td>${esc(shortDate(parse(m.date)))}</td><td>${esc(m.nom||'')}</td><td>${m.type==='epreuve'?'Épreuve hydraulique':'Inspection'}</td><td>${esc(m.note||'')}${m.points&&Object.values(m.points).some(v=>!v)?'<br><small>Non conforme : '+esc(Object.entries(m.points).filter(([,v])=>!v).map(([k])=>k).join(', '))+'</small>':''}</td><td>${esc(m.par||'')}</td></tr>`).join('')||'<tr><td colspan="5">Aucune inspection.</td></tr>'}</tbody></table>${prFoot()}</section>`;
  await printDoc('Rapport d’inspections',body,false,'rapport-inspections');
}
/* ---------- Tournée d’inspection : les échéances d’un emplacement, une après l’autre ---------- */
function skTourHTML(){
  const st=S.pg, e=st.ste||'', U=e?skUnder(e):null, soon=iso(addDays(new Date(),skCfg().alerte)), can=isAdmin()&&S.conn==='shared';
  const L=skArts().filter(a=>!skQte(a)&&a.statut!=='hs'&&(!U||U.has(a.empl))&&skDue(a).some(d=>d.t==='insp'&&d.date<=soon));
  return `<section class="panel" id="stk-tour"><h2>Tournée d’inspection</h2><div class="row u-mb8"><select id="stk-te" aria-label="Emplacement de la tournée"><option value="">Tous les emplacements</option>${skLieux().map(l=>`<option value="${esc(l.nom)}"${e===l.nom?' selected':''}>${esc(l.nom)}</option>`).join('')}</select><span class="muted sm">${pl(L.length,'article à inspecter','articles à inspecter')}</span></div>
    ${L.length?`<ul class="plist">${L.slice(0,40).map(a=>`<li><span><button class="link" type="button" data-act="stk-go" data-id="${esc(a.id)}" data-v="insp">${esc(skName(a))}</button><span class="muted sm"> · ${esc(a.empl||'—')}</span></span>${can?`<span class="row"><button class="btn sm" type="button" data-act="stk-tour-ok" data-id="${esc(a.id)}"${dis()}>Conforme</button><button class="btn sm ghost" type="button" data-act="stk-go" data-id="${esc(a.id)}" data-v="insp">Détail…</button></span>`:''}</li>`).join('')}</ul>`:'<p class="help">Rien à inspecter ici.</p>'}</section>`;
}
async function skTourOk(id){const a=byId(skArts(),id);if(!a) return;await skApply(a,{inspDer:todayISO()},skMv(a,'insp',{note:'conforme · tournée',points:Object.fromEntries(skPoints(a).map(p=>[p,true]))}),'Inspection inscrite');}
