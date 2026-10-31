/* ---------- Stock (outils) : fiches d’objets, import, actions en lot, codes QR et scanner, emplacements, kits et tailles ----------
   stock-modeles/<id> : une fiche d’objet (voir plus bas)
   config/ecole.stock.lieux : l’arbre des emplacements [{ nom, parent, camion }] ; .kit : le kit d’aspirant [{ nom, mot, taille }]
   eleves/<id>.tailles : { casque, manteau, pantalon, bottes, gants }
   Une étiquette QR contient l’adresse du site suivie de #stk=<id> : l’appareil photo du téléphone ouvre l’article. */
const SK_TAILLES=[['casque','Casque'],['manteau','Manteau'],['pantalon','Pantalon'],['bottes','Bottes'],['gants','Gants']];
const SK_KIT_DEF=[{nom:'Casque',mot:'casque',taille:'casque'},{nom:'Habit de combat',mot:'habit',taille:'manteau'},{nom:'Bottes',mot:'botte',taille:'bottes'},{nom:'Gants',mot:'gant',taille:'gants'},{nom:'Cagoule',mot:'cagoule',taille:''}];
const QR_GEN='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', QR_READ='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
const _scripts={};
function loadScript(url){return _scripts[url]||(_scripts[url]=new Promise((res,rej)=>{const x=document.createElement('script');x.src=url;x.onload=res;x.onerror=()=>{delete _scripts[url];rej(new Error('script'));};document.head.appendChild(x);}));}
const skModeles=()=>(S.data.stockModeles||[]).slice().sort((a,b)=>collator.compare(a.nom||'',b.nom||''));
/* ---------- Emplacements : un arbre (bâtiment, local, rangement, camion) ---------- */
function skLieux(){
  const c=cfg().stock||{};
  if(Array.isArray(c.lieux)&&c.lieux.length) return c.lieux;
  return skCfg().empl.map(n=>({nom:n,parent:'',camion:/autopompe|camion|citerne|échelle aérienne|unité/i.test(n)}));
}
/* « Réserve atelier » et tout ce qu’elle contient */
function skUnder(nom){const L=skLieux(), out=new Set([nom]);let grew=true;while(grew){grew=false;for(const l of L) if(out.has(l.parent)&&!out.has(l.nom)){out.add(l.nom);grew=true;}}return out;}
const skLieuxTxt=()=>{const L=skLieux(), lines=[], walk=(p,d)=>{for(const l of L.filter(x=>(x.parent||'')===p)){lines.push('  '.repeat(d)+l.nom+(l.camion?' [camion]':''));walk(l.nom,d+1);}};walk('',0);for(const l of L) if(!lines.some(x=>x.trim().replace(/ \[camion\]$/,'')===l.nom)) lines.push(l.nom);return lines.join('\n');};
function skParseLieux(txt){
  const out=[], stack=[];
  for(const raw of String(txt||'').split('\n')){
    if(!raw.trim()) continue;
    const d=Math.floor((raw.match(/^\s*/)[0].replace(/\t/g,'  ').length)/2), camion=/\[camion\]\s*$/i.test(raw), nom=raw.trim().replace(/\s*\[camion\]\s*$/i,'').slice(0,60);
    if(!nom||out.some(l=>l.nom===nom)) continue;
    stack.length=Math.min(stack.length,d);
    out.push({nom,parent:stack[stack.length-1]||'',camion});stack.push(nom);
  }
  return out;
}
/* ---------- Fiches d’objets : une fiche par objet (Casque, Habit de combat, Émulseur…) ----------
   stock-modeles/<id> : { nom, cat, sous, suivi, prefixe, tailles [], empl, resa, inspFreq, vie, prix, fourn, unite, min, note }
   On ajoute des exemplaires à une fiche en donnant seulement le nombre, la taille et l’emplacement : les codes se numérotent
   (CAS-013, CAS-014…). Une fiche en quantité (consommable) a un seul article dont on augmente la quantité. */
const skFicheArts=m=>skArts().filter(a=>a.modele===m.id);
const skFree=a=>!skQte(a)&&!(a.attrib&&a.attrib.id)&&!(a.sortie&&a.sortie.le)&&(a.statut==='service'||a.statut==='reserve');
/* Le prochain numéro d’un préfixe : CAS-012 existe, on continue à CAS-013 */
function skNextNum(pre){let n=0;const re=new RegExp('^'+String(pre).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'-(\\d+)$','i');for(const a of skArts()){const m=re.exec(a.code||'');if(m)n=Math.max(n,+m[1]);}return n+1;}
const skCodes=(pre,n)=>{if(!pre)return [];const s=skNextNum(pre);return Array.from({length:n},(_,i)=>`${pre}-${String(s+i).padStart(3,'0')}`);};
const skPrefixe=nom=>String(nom||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z]/g,'').slice(0,3).toUpperCase()||'ART';
function skCatalogPage(){
  if(S.pg.sfi&&byId(skModeles(),S.pg.sfi)) return skFichePage(byId(skModeles(),S.pg.sfi));
  const st=S.pg, q=String(st.sfq||'').trim().toLowerCase(), fc=st.sfc||'', can=isAdmin()&&S.conn==='shared';
  const M=skModeles().filter(m=>(!fc||m.cat===fc)&&(!q||[m.nom,m.sous,m.fourn,m.prefixe].some(x=>String(x||'').toLowerCase().includes(q)))), loose=skArts().filter(a=>!a.modele||!byId(skModeles(),a.modele));
  const tb=`<div class="toolbar"><input class="search" id="stk-fq" type="search" placeholder="Rechercher une fiche" aria-label="Rechercher une fiche" autocomplete="off" value="${esc(st.sfq||'')}"><select id="stk-fc" aria-label="Catégorie"><option value="">Toutes les catégories</option>${SK_CATS.map(([k,l])=>`<option value="${k}"${fc===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span>${can?`<button class="btn primary" type="button" id="stk-mod-new" data-act="stk-mod" data-id="">${icon('plus')}Nouvelle fiche</button>`:''}</div>`;
  const auto=can&&loose.length?`<div class="notice" id="stk-loose"><p>${pl(loose.length,'article n’a pas de fiche','articles n’ont pas de fiche')}. Les fiches peuvent se créer toutes seules, en regroupant les articles du même nom.</p><button class="btn sm" type="button" id="stk-fiches-auto" data-act="stk-fiches-auto"${dis()}>Créer les fiches</button></div>`:'';
  if(!skModeles().length) return tb+auto+emptyBox('Aucune fiche d’objet','Une fiche décrit un objet une fois (Casque, Habit de combat, Émulseur…) : catégorie, tailles, inspection, prix, fournisseur. Ensuite, « Ajouter » crée les exemplaires en un clic.');
  const card=m=>{const A=skFicheArts(m), q2=skQte(m);
    const stat=q2?(()=>{const a=A[0], n=a?+a.qte||0:0;return `<b class="${a&&skConf(a)[0]!=='ok'?skConf(a)[0]+'-t':''}">${n}</b> ${esc(m.unite||(a&&a.unite)||'en stock')}${m.min||(a&&a.min)?` <small>· seuil ${+(m.min||a.min)}</small>`:''}`;})()
      :`<b>${A.length}</b> ${A.length>1?'exemplaires':'exemplaire'} <small>· ${pl(A.filter(skFree).length,'libre','libres')} · ${pl(A.filter(a=>a.attrib&&a.attrib.id).length,'attribué','attribués')}${A.some(a=>a.statut==='hs'||a.statut==='maint'||a.statut==='manquant')?` · ${A.filter(a=>a.statut==='hs'||a.statut==='maint'||a.statut==='manquant').length} hors d’usage`:''}</small>`;
    const alert=A.some(a=>skConf(a)[0]==='bad')?'bad':A.some(a=>skConf(a)[0]==='warn')?'warn':'';
    return `<article class="stk-fiche${alert?' '+alert:''}" id="stk-f-${esc(m.id)}"><button type="button" class="stk-fh" data-act="stk-fiche" data-id="${esc(m.id)}"><span class="stk-fi">${icon(skCat(m.cat)[2])}</span><span><b>${esc(m.nom)}</b><small>${esc([skCat(m.cat)[1],m.sous].filter(Boolean).join(' · '))}</small></span></button>
      <p class="stk-fs">${stat}</p>${m.tailles&&m.tailles.length&&!q2?`<p class="stk-ft">${m.tailles.map(t=>{const n=A.filter(a=>skFree(a)&&String(a.taille||'')===t).length;return `<span class="chip ${n?'off':'warn'}" title="${pl(n,'libre','libres')}">${esc(t)} · ${n}</span>`;}).join('')}</p>`:''}
      ${can?`<div class="row"><button class="btn sm primary" type="button" data-act="stk-add-to" data-id="${esc(m.id)}">${icon('plus')}Ajouter</button><button class="btn sm ghost" type="button" data-act="stk-fiche" data-id="${esc(m.id)}">Ouvrir</button></div>`:''}</article>`;};
  return tb+auto+(M.length?`<div class="stk-fiches">${M.map(card).join('')}</div>`:'<section class="panel"><p class="help">Aucune fiche ne correspond.</p></section>');
}
/* Une fiche : ce qu’elle décrit, ses chiffres (par état et par taille), ses exemplaires */
function skFichePage(m){
  const A=skFicheArts(m), can=isAdmin()&&S.conn==='shared', q2=skQte(m), a0=A[0];
  const facts=[['Catégorie',skCat(m.cat)[1]+(m.sous?' · '+m.sous:'')],['Préfixe des codes',q2?'':m.prefixe?m.prefixe+'-001, '+m.prefixe+'-002…':''],['Tailles',(m.tailles||[]).join(', ')],['Emplacement habituel',m.empl],['Inspection',q2?'':`tous les ${+m.inspFreq||+(skCfg().cats[m.cat]||{}).insp||'—'} mois`],['Durée de vie',q2?'':(+m.vie||+(skCfg().cats[m.cat]||{}).vie)?(+m.vie||+(skCfg().cats[m.cat]||{}).vie)+' ans':''],['Prix',m.prix?fmtM(m.prix):''],['Fournisseur',m.fourn]].filter(x=>x[1]);
  const tile=(l,v,cls,sub)=>`<div class="kpi"><span>${l}</span><b class="${cls||''}">${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
  const tiles=q2?tile('En stock',a0?+a0.qte||0:0,a0&&skConf(a0)[0]!=='ok'?skConf(a0)[0]:'',esc(m.unite||(a0&&a0.unite)||''))+tile('Seuil d’alerte',+(m.min||(a0&&a0.min))||'—','','')
    :tile('Exemplaires',A.length,'','')+tile('Libres',A.filter(skFree).length,'','prêts à remettre ou à sortir')+tile('Attribués',A.filter(a=>a.attrib&&a.attrib.id).length,'','aux élèves et aux classes')+tile('Hors d’usage',A.filter(a=>a.statut==='hs'||a.statut==='maint'||a.statut==='manquant').length,A.some(a=>a.statut==='hs'||a.statut==='manquant')?'bad':'','maintenance, hors service, manquants');
  const sizes=!q2&&(m.tailles||[]).length?`<div class="stk-ft">${m.tailles.map(t=>{const all=A.filter(a=>String(a.taille||'')===t), n=all.filter(skFree).length;return `<span class="chip ${n?'off':'warn'}">${esc(t)} : ${n} ${n>1?'libres':'libre'} sur ${all.length}</span>`;}).join('')}</div>`:'';
  return `<div class="stk-fhead panel"><button type="button" class="link" id="stk-fback" data-act="pg-set" data-k="sfi" data-v="">${icon('left')}Toutes les fiches</button>
      <div class="stk-fhrow"><span class="stk-fi lg">${icon(skCat(m.cat)[2])}</span><div style="flex:1;min-width:0"><h2 style="margin:0">${esc(m.nom)}</h2><p class="help" style="margin:2px 0 0">${esc(m.note||'')}</p></div>
        ${can?`<div class="row"><button class="btn primary" type="button" id="stk-fadd" data-act="stk-add-to" data-id="${esc(m.id)}">${icon('plus')}Ajouter</button><button class="btn" type="button" data-act="stk-mod" data-id="${esc(m.id)}">Modifier la fiche</button>${!q2&&A.length?`<button class="btn ghost" type="button" data-act="stk-flab" data-id="${esc(m.id)}">${icon('print')}Étiquettes</button>`:''}</div>`:''}</div>
      <dl class="facts facts3" style="margin-top:12px">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
    <div class="kpis" style="margin-top:12px">${tiles}</div>${sizes?`<section class="panel" style="margin-top:12px"><h2>Par taille</h2>${sizes}</section>`:''}
    <div class="stk-elist" style="margin-top:12px">${A.length?skList('','',m.id):emptyBox('Aucun exemplaire',can?'« Ajouter » crée les exemplaires de cette fiche : le nombre, la taille et l’emplacement suffisent.':'')}</div>`;
}
function skModDrawer(d){
  const m=d.id?byId(skModeles(),d.id):null, x=m||{cat:d.cat||'epi',suivi:'unite'}, f=(id,l,v,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(v==null?'':v)}" ${att||''}></label>`;
  return dTop('Fiche d’objet',m?esc(m.nom):'Nouvelle fiche')
    +`<form class="dr-body" data-form="stk-mod" data-suivi="${x.suivi==='qte'?'qte':'unite'}" novalidate>${f('sm-nom','Nom de l’objet',x.nom,'maxlength="80" autocomplete="off" placeholder="Ex. Casque"')}
      <div class="grid2"><label class="field"><span>Catégorie</span><select id="sm-cat">${SK_CATS.map(([c,l])=>`<option value="${c}"${x.cat===c?' selected':''}>${l}</option>`).join('')}</select></label><label class="field"><span>Suivi</span><select id="sm-suivi"${m?' disabled':''}><option value="unite"${x.suivi!=='qte'?' selected':''}>À l’unité (chaque exemplaire a son code)</option><option value="qte"${x.suivi==='qte'?' selected':''}>En quantité (consommable)</option></select></label></div>
      <div class="sa-u"><div class="grid2">${f('sm-pre','Préfixe des codes',x.prefixe||'','maxlength="8" autocomplete="off" placeholder="Ex. CAS"')}${f('sm-tailles','Tailles (séparées par des virgules)',(x.tailles||[]).join(', '),'maxlength="120" autocomplete="off" placeholder="Ex. S, M, L, XL"')}</div>
        <div class="grid2">${f('sm-insp','Inspection tous les (mois)',x.inspFreq||'','type="number" min="0" max="120" inputmode="numeric" placeholder="Selon la catégorie"')}${f('sm-vie','Durée de vie (ans)',x.vie||'','type="number" min="0" max="50" inputmode="numeric" placeholder="Selon la catégorie"')}</div>
        <label class="ps-chk"><input type="checkbox" id="sm-resa"${x.resa?' checked':''}><span><b>Réservable pour les séances</b><small>Pour un camion, un lot d’ARI…</small></span></label></div>
      <div class="sa-q"><div class="grid2">${f('sm-unite','Unité',x.unite,'maxlength="20" autocomplete="off" placeholder="Ex. bidons, boîtes"')}${f('sm-min','Seuil d’alerte',x.min||'','type="number" min="0" inputmode="numeric"')}</div></div>
      <div class="grid2">${f('sm-sous','Sous-catégorie (facultatif)',x.sous,'maxlength="40" autocomplete="off" placeholder="Ex. Casques"')}<label class="field"><span>Emplacement habituel</span><select id="sm-empl"><option value="">—</option>${skLieux().map(l=>`<option value="${esc(l.nom)}"${x.empl===l.nom?' selected':''}>${esc(l.nom)}</option>`).join('')}</select></label></div>
      <div class="grid2">${f('sm-prix','Prix unitaire ($)',x.prix?moneyIn(x.prix):'','inputmode="decimal" placeholder="0,00"')}${f('sm-fourn','Fournisseur',x.fourn,'maxlength="60" autocomplete="off" list="sm-fourns"')}</div>
      <datalist id="sm-fourns">${(S.data.stockFourn||[]).map(v=>`<option value="${esc(v.nom)}">`).join('')}</datalist>
      <label class="field"><span>Note (facultatif)</span><textarea id="sm-note" rows="2" maxlength="300">${esc(x.note||'')}</textarea></label>
      <div class="row"><button class="btn primary" type="submit"${dis()}>${m?'Enregistrer':'Créer la fiche'}</button><button class="btn ghost" type="button" data-act="close">Annuler</button>${m&&isAdmin()&&!skFicheArts(m).length?`<span class="grow"></span><button class="btn sm ghost" type="button" data-act="stk-mod-del" data-id="${esc(m.id)}">Supprimer la fiche</button>`:''}</div></form>`;
}
async function skSaveMod(f){
  const q=id=>f.querySelector('#'+id), v=id=>String(q(id).value).trim(), nom=v('sm-nom');if(!nom){toast('Donnez un nom à l’objet.','bad');return;}
  const pr=v('sm-prix')?money(v('sm-prix')):null;if(v('sm-prix')&&pr==null){toast('Le prix n’est pas valide.','bad');return;}
  const old=S.dr.id?byId(skModeles(),S.dr.id):null, suivi=old?old.suivi:v('sm-suivi'), pre=v('sm-pre').toUpperCase().replace(/[^A-Z0-9]/g,'');
  const doc={nom,cat:v('sm-cat'),sous:v('sm-sous'),suivi,prefixe:suivi==='qte'?'':pre||skPrefixe(nom),tailles:[...new Set(v('sm-tailles').split(',').map(x=>x.trim()).filter(Boolean))].slice(0,20),empl:v('sm-empl'),resa:suivi!=='qte'&&q('sm-resa').checked,
    inspFreq:+v('sm-insp')||null,vie:+v('sm-vie')||null,prix:pr,fourn:v('sm-fourn'),unite:v('sm-unite'),min:+v('sm-min')||null,note:v('sm-note'),maj:new Date().toISOString()};
  const id=S.dr.id||'mo'+Date.now().toString(36);
  if(await write(()=>col('stock-modeles').doc(id).set(doc),old?'Fiche enregistrée':`Fiche « ${nom} » créée`)){if(old)closeDrawer(true);else{S.dr={kind:'stk',mode:'add',id,uid:S.dr.uid};S.pg.sk='cat';S.pg.sfi=id;render();}}
}
/* Choisir la fiche à laquelle ajouter (bouton « Ajouter un article » de l’inventaire) */
function skPickDrawer(d){
  const q=String(d.q||'').trim().toLowerCase(), M=skModeles().filter(m=>(!d.cat||m.cat===d.cat)&&(!q||[m.nom,m.sous,m.prefixe].some(x=>String(x||'').toLowerCase().includes(q))));
  return dTop('Ajouter au stock','Quel objet ?')
    +`<div class="dr-body"><label class="field"><span>Rechercher une fiche</span><input id="stk-pk-q" type="search" autocomplete="off" value="${esc(d.q||'')}" placeholder="Ex. casque, émulseur"></label>
      <ul class="stk-pick">${M.map(m=>`<li><button type="button" class="stk-pk" data-act="stk-add-to" data-id="${esc(m.id)}"><span class="stk-fi">${icon(skCat(m.cat)[2])}</span><span><b>${esc(m.nom)}</b><small>${esc([skCat(m.cat)[1],m.sous,skQte(m)?'en quantité':pl(skFicheArts(m).length,'exemplaire','exemplaires')].filter(Boolean).join(' · '))}</small></span>${icon('plus')}</button></li>`).join('')||'<li class="help">Aucune fiche ne correspond.</li>'}</ul>
      <div class="row" style="margin-top:12px"><button class="btn" type="button" id="stk-pick-new" data-act="stk-mod" data-id="">${icon('plus')}Nouvelle fiche</button><button class="btn ghost" type="button" id="stk-pick-free" data-act="stk-free">Article sans fiche…</button></div></div>`;
}
/* Ajouter à une fiche : le nombre, la taille, l’emplacement (ou la quantité reçue pour un consommable) */
function skAddDrawer(d){
  const m=byId(skModeles(),d.id);if(!m) return goneHTML('Fiche');
  const f=(id,l,v,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(v==null?'':v)}" ${att||''}></label>`, a0=skFicheArts(m)[0];
  const empl=`<label class="field"><span>Emplacement</span><select id="sq-empl">${skLieux().map(l=>`<option value="${esc(l.nom)}"${(m.empl||(a0&&a0.empl))===l.nom?' selected':''}>${esc(l.nom)}</option>`).join('')}</select></label>`;
  if(skQte(m)) return dTop('Ajouter',esc(m.nom),a0?`${+a0.qte||0} ${esc(a0.unite||m.unite||'')} en stock`:'Premier ajout')
    +`<form class="dr-body" data-form="stk-add" novalidate><div class="grid2">${f('sq-qte',`Quantité reçue (${esc(m.unite||'unités')})`,'','type="number" min="1" step="1" inputmode="numeric"')}${f('sq-cout','Coût total (facultatif, $)','','inputmode="decimal" autocomplete="off" placeholder="0,00"')}</div>
      <div class="grid2">${f('sq-lot','Numéro de lot (facultatif)','','maxlength="40" autocomplete="off"')}${f('sq-exp','Péremption (facultatif)','','type="date"')}</div>${a0?'':empl}
      <div class="row"><button class="btn primary" type="submit" id="sq-go"${dis()}>Ajouter au stock</button><button class="btn ghost" type="button" data-act="close">Annuler</button></div></form>`;
  const codes=skCodes(m.prefixe||skPrefixe(m.nom),1);
  return dTop('Ajouter',esc(m.nom),esc(skCat(m.cat)[1]+(m.sous?' · '+m.sous:'')))
    +`<form class="dr-body" data-form="stk-add" novalidate><div class="grid2">${f('sq-nb','Nombre d’exemplaires',1,'type="number" min="1" max="60" step="1" inputmode="numeric"')}${(m.tailles||[]).length?`<label class="field"><span>Taille</span><select id="sq-taille"><option value="">—</option>${m.tailles.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>`:f('sq-taille','Taille (facultatif)','','maxlength="12" autocomplete="off"')}</div>
      <div class="grid2">${empl}<label class="field"><span>État</span><select id="sq-st"><option value="service">En service</option><option value="reserve">En réserve</option></select></label></div>
      <div class="grid2">${f('sq-fab','Date de fabrication (facultatif)','','type="date"')}${f('sq-serie','N° de série (s’il y en a un seul)','','maxlength="40" autocomplete="off"')}</div>
      <p class="help" id="sq-codes">Code : ${esc(codes[0])}</p>
      <div class="row"><button class="btn primary" type="submit" id="sq-go"${dis()}>Ajouter</button><button class="btn ghost" type="button" data-act="close">Annuler</button><span class="grow"></span><button class="link" type="button" data-act="stk-from" data-id="${esc(m.id)}">Plus de champs…</button></div></form>`;
}
const skCodesTxt=(m,n)=>{const c=skCodes(m.prefixe||skPrefixe(m.nom),n);return c.length>1?`Codes : ${c[0]} à ${c[c.length-1]}`:`Code : ${c[0]||'—'}`;};
async function skQuickAdd(f){
  const m=byId(skModeles(),S.dr.id);if(!m) return;
  const q=id=>f.querySelector('#'+id), v=id=>q(id)?String(q(id).value).trim():'', now=new Date().toISOString();
  if(skQte(m)){
    const n=Math.round(+v('sq-qte'));if(!(n>0)){toast('Indiquez la quantité reçue.','bad');return;}
    const ct=v('sq-cout')?money(v('sq-cout')):null;if(v('sq-cout')&&ct==null){toast('Le coût n’est pas valide.','bad');return;}
    let a=skFicheArts(m)[0];const id=a?a.id:'s'+Date.now().toString(36);
    const ch=a?{qte:(+a.qte||0)+n,maj:now}:{nom:m.nom,cat:m.cat,suivi:'qte',sous:m.sous||'',qte:n,min:+m.min||0,unite:m.unite||'',empl:v('sq-empl'),prix:m.prix||null,fourn:m.fourn||'',modele:m.id,cree:now,maj:now};
    if(v('sq-lot')) ch.lot=v('sq-lot');if(v('sq-exp')) ch.exp=v('sq-exp');
    const ok=await write(async()=>{if(a)await col('stock').doc(id).update(ch);else await col('stock').doc(id).set(ch);await col('stock-mvt').doc(skId()).set(skMv(Object.assign({id},a||ch),a?'reappro':'entree',{qte:n,note:[m.fourn,ct?fmtM(ct):''].filter(Boolean).join(' · ')}));},`${n} ${m.unite||''} ajoutés`.replace(/\s+ajoutés/,' ajoutés'));
    if(ok&&ct&&S.role==='admin') await cpAutoDepense({date:todayISO(),poste:m.cat==='conso'?'conso':'materiel',libelle:`${m.nom} (${n} ${m.unite||''})`.replace(/\s+\)/,')'),tiers:m.fourn||'',ht:ct,source:'stock'});
    if(ok) closeDrawer(true);return;
  }
  const n=Math.max(1,Math.min(60,Math.round(+v('sq-nb')||1))), codes=skCodes(m.prefixe||skPrefixe(m.nom),n);
  const fns=codes.map((code,i)=>{const id='s'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5);
    const y={nom:m.nom,cat:m.cat,suivi:'unite',sous:m.sous||'',code,serie:n===1?v('sq-serie'):'',taille:v('sq-taille'),empl:v('sq-empl'),statut:v('sq-st')||'service',fab:v('sq-fab'),inspDer:'',inspFreq:m.inspFreq||null,vie:m.vie||null,prix:m.prix||null,fourn:m.fourn||'',resa:!!m.resa,modele:m.id,cree:now,maj:now};
    return async()=>{await col('stock').doc(id).set(y);await col('stock-mvt').doc(skId()).set(skMv(Object.assign({id},y),'entree',{qte:1}));};});
  if(await runAll(fns,n>1?`${n} exemplaires ajoutés (${codes[0]} à ${codes[n-1]})`:`${codes[0]} ajouté`)) closeDrawer(true);
}
/* Les articles sans fiche : une fiche par nom (et catégorie), avec le préfixe de leurs codes et leurs tailles */
async function skFichesAuto(){
  const G={};for(const a of skArts()) if(!a.modele||!byId(skModeles(),a.modele)){const k=a.cat+'|'+String(a.nom).toLowerCase();(G[k]=G[k]||[]).push(a);}
  const fns=[], now=new Date().toISOString();let i=0;
  for(const L of Object.values(G)){const a=L[0], id='mo'+Date.now().toString(36)+(i++), pres=[...new Set(L.map(x=>(/^([A-Za-z]+)-\d+$/.exec(x.code||'')||[])[1]).filter(Boolean))];
    const doc={nom:a.nom,cat:a.cat,sous:a.sous||'',suivi:skQte(a)?'qte':'unite',prefixe:skQte(a)?'':(pres[0]||skPrefixe(a.nom)).toUpperCase(),tailles:[...new Set(L.map(x=>x.taille).filter(Boolean))].sort(collator.compare),empl:a.empl||'',resa:!!a.resa,inspFreq:a.inspFreq||null,vie:a.vie||null,prix:a.prix||null,fourn:a.fourn||'',unite:a.unite||'',min:a.min||null,note:'',maj:now};
    fns.push(async()=>{await col('stock-modeles').doc(id).set(doc);for(const x of L) await col('stock').doc(x.id).update({modele:id});});}
  await runAll(fns,`${pl(fns.length,'fiche créée','fiches créées')}`);
}
/* ---------- Import d’un inventaire (CSV ou cellules d’Excel) ---------- */
const SK_IMP_H={nom:/^(nom|article|description|d[ée]signation)$/i,cat:/^cat[ée]gorie$/i,code:/^(code|code interne)$/i,serie:/^(n[°ºo]\.? ?de s[ée]rie|s[ée]rie|num[ée]ro de s[ée]rie)$/i,taille:/^taille$/i,empl:/^(emplacement|lieu|local)$/i,qte:/^(quantit[ée]|qt[ée]|qt[ée]\.)$/i,min:/^(seuil|minimum|min)$/i,fab:/^(fabrication|date de fabrication)$/i,insp:/^(derni[èe]re inspection|inspection)$/i,prix:/^(prix|co[ûu]t)$/i};
const skCatOf=t=>{const x=String(t||'').toLowerCase();return /ari|air|bouteille|masque/.test(x)?'ari':/conso|consommable/.test(x)?'conso':/epi|protection|casque|habit|botte|gant/.test(x)?'epi':'mat';};
const skDate=t=>{const s=String(t||'').trim();if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(s);return m?`${m[3]}-${pad(+m[2])}-${pad(+m[1])}`:'';};
function skParseImport(text){
  const lines=String(text||'').replace(/^﻿/,'').split(/\r?\n/).filter(l=>l.trim()).slice(0,1000);if(lines.length<2) return [];
  const cnt=ch=>lines.slice(0,10).reduce((n,l)=>n+l.split(ch).length-1,0), sep=cnt('\t')?'\t':cnt(';')?';':',';
  const head=csvCells(lines[0],sep).map(c=>Object.keys(SK_IMP_H).find(k=>SK_IMP_H[k].test(c))||'');
  if(!head.includes('nom')) return null;
  return lines.slice(1).map(l=>{const c=csvCells(l,sep), o={};head.forEach((k,i)=>{if(k)o[k]=c[i]||'';});return o;}).filter(o=>o.nom).map(o=>{
    const cat=skCatOf(o.cat||o.nom), qte=o.qte!==''&&o.qte!=null&&!isNaN(+String(o.qte).replace(',','.'))?Math.round(+String(o.qte).replace(',','.')):null, suivi=cat==='conso'||(qte!=null&&qte>1&&!o.serie)?'qte':'unite';
    return {nom:o.nom.slice(0,80),cat,suivi,code:o.code||'',serie:o.serie||'',taille:o.taille||'',empl:o.empl||'',qte:suivi==='qte'?(qte||0):null,min:suivi==='qte'?Math.max(0,Math.round(+o.min||0)):null,fab:skDate(o.fab),inspDer:skDate(o.insp),prix:o.prix?money(o.prix):null,statut:'service'};
  });
}
function skImportDrawer(d){
  const L=d.rows||[];
  return dTop('Stock','Importer un inventaire')
    +`<form class="dr-body" data-form="stk-imp" novalidate><p class="help">Collez des cellules d’Excel ou un fichier CSV. Première ligne : les titres. Reconnus : Nom, Catégorie, Code, N° de série, Taille, Emplacement, Quantité, Seuil, Fabrication, Dernière inspection, Prix.</p>
      <label class="field"><span>Fichier</span><input type="file" id="si-file" accept=".csv,.txt,text/csv,text/plain"></label>
      <label class="field"><span>Ou collez ici</span><textarea id="si-txt" rows="6" placeholder="Nom;Catégorie;Code;Taille;Emplacement">${esc(d.txt||'')}</textarea></label>
      <div class="row"><button class="btn" type="button" id="si-read" data-act="stk-imp-read">Lire</button></div>
      ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
      ${L.length?`<h3 class="sb-h3" style="margin-top:12px">${pl(L.length,'article à importer','articles à importer')}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nom</th><th>Catégorie</th><th>Code</th><th>Emplacement</th><th class="num">Qté</th></tr></thead><tbody>${L.slice(0,12).map(o=>`<tr><td>${esc(o.nom)}</td><td>${esc(skCat(o.cat)[1])}</td><td>${esc(o.code)}</td><td>${esc(o.empl)}</td><td class="num">${o.suivi==='qte'?esc(String(o.qte)):'1'}</td></tr>`).join('')}</tbody></table></div>${L.length>12?`<p class="help">… et ${L.length-12} autres.</p>`:''}
        <div class="row" style="margin-top:10px"><button class="btn primary" type="submit" id="si-go"${dis()}>Importer ${L.length}</button></div>`:''}</form>`;
}
async function skImport(){
  const L=S.dr.rows||[];if(!L.length) return;const now=new Date().toISOString();
  const fns=L.map((o,i)=>{const id='s'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5), y=Object.assign({},o,{cree:now,maj:now});return async()=>{await col('stock').doc(id).set(y);await col('stock-mvt').doc(skId()).set(skMv(Object.assign({id},y),'entree',{qte:y.suivi==='qte'?y.qte:1,note:'import'}));};});
  if(await runAll(fns,`${pl(L.length,'article importé','articles importés')}`)) closeDrawer(true);
}
/* ---------- Actions en lot (cases cochées dans l’inventaire) ---------- */
const skSel=()=>S.pg.ssel||(S.pg.ssel=[]);
function skBulkBar(){
  const n=skSel().length;if(!n) return '';
  const opts=skLieux().map(l=>`<option value="${esc(l.nom)}">${esc(l.nom)}</option>`).join('');
  return `<div class="stk-bulk" id="stk-bulk" role="region" aria-label="Actions sur la sélection"><b>${pl(n,'article coché','articles cochés')}</b>
    <label class="field"><span class="vh">Déplacer vers</span><select id="stk-bk-empl"><option value="">Déplacer vers…</option>${opts}</select></label>
    <label class="field"><span class="vh">Changer l’état</span><select id="stk-bk-st"><option value="">Changer l’état…</option>${Object.entries(SK_ST).map(([k,[,l]])=>`<option value="${k}">${l}</option>`).join('')}</select></label>
    <button class="btn sm" type="button" data-act="stk-bk" data-v="insp"${dis()}>Inspection faite</button><button class="btn sm" type="button" data-act="stk-labels" data-v="sel">${icon('print')}Étiquettes</button><button class="btn sm ghost" type="button" data-act="stk-bk" data-v="none">Tout décocher</button></div>`;
}
async function skBulk(kind,val){
  const ids=skSel().slice(), A=ids.map(id=>byId(skArts(),id)).filter(Boolean);if(!A.length) return;
  const now=new Date().toISOString();let fns=[], msg='';
  if(kind==='empl'){fns=A.map(a=>async()=>{await col('stock').doc(a.id).update({empl:val,maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'transfert',{note:`${a.empl||'—'} → ${val}`}));});msg=`${pl(A.length,'article déplacé','articles déplacés')} vers ${val}`;}
  else if(kind==='st'){fns=A.filter(a=>!skQte(a)).map(a=>async()=>{await col('stock').doc(a.id).update({statut:val,maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,val==='service'?'service':val==='hs'?'hs':'maint',{note:'en lot'}));});msg='État changé';}
  else if(kind==='insp'){fns=A.filter(a=>!skQte(a)).map(a=>async()=>{await col('stock').doc(a.id).update({inspDer:todayISO(),maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'insp',{note:'conforme · en lot'}));});msg=`${pl(fns.length,'inspection inscrite','inspections inscrites')}`;}
  if(await runAll(fns,msg)){S.pg.ssel=[];render();}
}
/* ---------- Étiquettes QR ---------- */
const skUrl=id=>location.href.split('#')[0]+'#stk='+encodeURIComponent(id);
async function skLabels(A){
  if(!A.length){toast('Aucun article à étiqueter.','bad');return;}
  let qr=null;try{if(typeof qrcode!=='function')await loadScript(QR_GEN);qr=window.qrcode;}catch(e){qr=null;}
  const svg=a=>{if(!qr) return '';try{const q=qr(0,'M');q.addData(skUrl(a.id));q.make();return q.createSvgTag({cellSize:3,margin:0,scalable:true});}catch(e){return '';}};
  const body=`<section class="pr-page pr-labels">${A.map(a=>`<div class="lab"><div class="lab-qr">${svg(a)}</div><div class="lab-t"><b>${esc(a.nom)}</b><span>${esc(a.code||'')}</span><small>${esc([a.serie?'n° '+a.serie:'',a.taille?'taille '+a.taille:''].filter(Boolean).join(' · '))}</small><small>${esc(cfg().nomCourt||cfg().nom||'')}</small></div></div>`).join('')}</section>`;
  if(!qr) toast('Les codes QR n’ont pas pu être préparés (connexion) : les étiquettes n’ont que le texte.','bad');
  await printDoc('Étiquettes du stock',body,false,'etiquettes-stock');
}
/* ---------- Scanner : la caméra (ou le code tapé), un article ou une sortie groupée ---------- */
function skFind(code){
  const c=String(code||'').trim();if(!c) return null;
  const m=/#stk=([^&\s]+)/.exec(c), id=m?decodeURIComponent(m[1]):c;
  return skArts().find(a=>a.id===id)||skArts().find(a=>[a.code,a.serie].some(x=>x&&String(x).toLowerCase()===c.toLowerCase()))||null;
}
let skCam=null;
function skStopCam(){if(skCam){skCam.stop=true;try{skCam.stream.getTracks().forEach(t=>t.stop());}catch(e){}skCam=null;}}
function skScanDrawer(d){
  const L=(d.list||[]).map(id=>byId(skArts(),id)).filter(Boolean), out=L.filter(a=>a.sortie&&a.sortie.le), ins=L.filter(a=>!(a.sortie&&a.sortie.le));
  return dTop('Mode terrain','Scanner du matériel')
    +`<div class="dr-body"><div class="stk-cam" id="stk-cam">${d.cam?'<video id="stk-video" playsinline muted></video><span class="stk-cam-hint">Visez le code QR</span>':`<button class="btn primary" type="button" id="stk-cam-go" data-act="stk-cam">${icon('eye')}Ouvrir la caméra</button><p class="help">Ou visez l’étiquette avec l’appareil photo du téléphone : l’article s’ouvre tout seul.</p>`}</div>
      <form class="inline-add" data-form="stk-code" style="margin-top:10px"><label class="field" style="flex:1 1 200px"><span>Code, n° de série ou lien</span><input id="stk-code" autocomplete="off" placeholder="Ex. CAS-014"></label><button class="btn" type="submit">Ajouter</button></form>
      ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
      <h3 class="sb-h3" style="margin-top:12px">${L.length?pl(L.length,'article scanné','articles scannés'):'Aucun article scanné'}</h3>
      ${L.length?`<ul class="plist" id="stk-scan-list">${L.map(a=>`<li><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${esc(skName(a))}</button><span class="row"><span class="chip ${a.sortie&&a.sortie.le?'warn':skConf(a)[0]}">${a.sortie&&a.sortie.le?'Sorti':esc(skConf(a)[1])}</span><button class="ann-x" type="button" data-act="stk-scan-x" data-id="${esc(a.id)}" aria-label="Retirer de la liste">${icon('x')}</button></span></li>`).join('')}</ul>
        <form data-form="stk-group" class="cp-box" novalidate>${ins.length&&skCanDo('sortie')?`<label class="field"><span>Séance</span><select id="sx-seance">${skSessOpts()}</select></label><label class="field"><span>Instructeur responsable</span><select id="sx-instr"><option value="">—</option>${teachers().map(x=>`<option value="${esc(x.id)}"${(S.role==='teacher'?S.teacher:'')===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select></label>`:''}
          <div class="row">${ins.length&&skCanDo('sortie')?`<button class="btn primary" type="button" id="stk-grp-out" data-act="stk-grp" data-v="sortie"${dis()}>Sortir ${ins.length}</button>`:''}${out.length&&skCanDo('retour')?`<button class="btn" type="button" id="stk-grp-in" data-act="stk-grp" data-v="retour"${dis()}>Rentrer ${out.length} (intacts)</button>`:''}${isAdmin()?`<button class="btn ghost" type="button" data-act="stk-grp" data-v="insp"${dis()}>Inspection faite</button>`:''}</div></form>`:''}</div>`;
}
function skScanAdd(code){
  const d=S.dr;if(!d||d.mode!=='scan') return;
  const a=skFind(code);if(!a){d.err=`Aucun article pour « ${String(code).slice(0,40)} ».`;renderDrawer();return;}
  d.err='';d.list=d.list||[];if(!d.list.includes(a.id)){d.list.push(a.id);if(navigator.vibrate)try{navigator.vibrate(60);}catch(e){}}
  if(S.page==='stock'&&S.pg.sk==='cpt'&&skCountCur()) skCountMark(a.id,'present');
  renderDrawer();
}
async function skCamStart(){
  const d=S.dr;if(!d) return;d.cam=true;renderDrawer();
  const v=$('#stk-video');if(!v||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){d.cam=false;d.err='La caméra n’est pas disponible sur cet appareil : tapez le code.';renderDrawer();return;}
  let det=null;
  if('BarcodeDetector' in window){try{det=new window.BarcodeDetector({formats:['qr_code']});}catch(e){det=null;}}
  if(!det){try{if(typeof jsQR!=='function')await loadScript(QR_READ);}catch(e){}}
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});skStopCam();
    skCam={stream,stop:false};v.srcObject=stream;await v.play();
    const cv=document.createElement('canvas'), cx=cv.getContext('2d',{willReadFrequently:true});let last='';
    const tick=async()=>{if(!skCam||skCam.stop||!document.body.contains(v)) {skStopCam();return;}
      let txt='';
      try{if(det){const r=await det.detect(v);txt=r[0]&&r[0].rawValue||'';}
        else if(typeof jsQR==='function'&&v.videoWidth){cv.width=v.videoWidth;cv.height=v.videoHeight;cx.drawImage(v,0,0);const im=cx.getImageData(0,0,cv.width,cv.height), r=jsQR(im.data,im.width,im.height);txt=r&&r.data||'';}}catch(e){}
      if(txt&&txt!==last){last=txt;skScanAdd(txt);setTimeout(()=>{last='';},2500);}
      requestAnimationFrame(tick);};
    tick();
  }catch(e){d.cam=false;d.err='La caméra est refusée ou occupée : tapez le code.';renderDrawer();}
}
async function skGroup(kind){
  const d=S.dr, A=(d.list||[]).map(id=>byId(skArts(),id)).filter(Boolean);
  const f=$('[data-form=stk-group]'), v=id=>f&&f.querySelector('#'+id)?f.querySelector('#'+id).value:'';
  const se=(()=>{const s=v('sx-seance');if(!s)return null;const [key,date]=s.split('|'), x=findSess(date,key);return x?{key,date,titre:`${x.c.code?x.c.code+' ':''}${x.c.titre} · ${gName(x.grp)}`}:null;})();
  const now=new Date().toISOString();let fns=[];
  if(kind==='sortie') fns=A.filter(a=>!(a.sortie&&a.sortie.le)).map(a=>async()=>{await col('stock').doc(a.id).update({sortie:{le:now,instr:v('sx-instr'),seance:se},maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'sortie',{seance:se,instr:v('sx-instr'),note:'sortie groupée'}));});
  else if(kind==='retour') fns=A.filter(a=>a.sortie&&a.sortie.le).map(a=>async()=>{await col('stock').doc(a.id).update({sortie:null,maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'retour',{note:'nettoyé, intact · retour groupé',seance:a.sortie.seance||null}));});
  else fns=A.filter(a=>!skQte(a)).map(a=>async()=>{await col('stock').doc(a.id).update({inspDer:todayISO(),maj:now});await col('stock-mvt').doc(skId()).set(skMv(a,'insp',{note:'conforme · scan'}));});
  if(await runAll(fns,kind==='sortie'?`${pl(fns.length,'article sorti','articles sortis')}`:kind==='retour'?`${pl(fns.length,'article rentré','articles rentrés')}`:`${pl(fns.length,'inspection inscrite','inspections inscrites')}`)) renderDrawer();
}
/* Une étiquette scannée avec l’appareil photo ouvre l’article (#stk=<id>) */
function skHash(){
  const m=/#stk=([^&]+)/.exec(location.hash||'');if(!m||S.role==='student'||!S.loaded.stock) return false;
  const a=byId(skArts(),decodeURIComponent(m[1]));history.replaceState(null,'',location.href.split('#')[0]);
  if(!a){toast('Cet article n’est plus dans le stock.','bad');return true;}
  goPage('stock');S.pg.sk='tout';openDrawer({kind:'stk',id:a.id,mode:'view'});return true;
}
/* ---------- Kits et tailles ---------- */
const skKit=()=>{const k=(cfg().stock||{}).kit;return Array.isArray(k)&&k.length?k:SK_KIT_DEF;};
/* Pour chaque élève de la classe, chaque pièce du kit : ce qu’il a déjà, la pièce libre proposée (à sa taille), ou ce qui manque */
function skKitPlan(g){
  const els=sortElsByClass(S.data.eleves.filter(e=>e.groupe===g)), K=skKit(), used=new Set();
  const free=skArts().filter(a=>!skQte(a)&&!(a.attrib&&a.attrib.id)&&!(a.sortie&&a.sortie.le)&&(a.statut==='service'||a.statut==='reserve'));
  return els.map(e=>({e,parts:K.map(k=>{
    const mot=String(k.mot||k.nom).toLowerCase(), has=skArts().find(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===e.id&&String(a.nom).toLowerCase().includes(mot));
    if(has) return {k,has};
    const t=k.taille&&(e.tailles||{})[k.taille], cand=free.filter(a=>!used.has(a.id)&&String(a.nom).toLowerCase().includes(mot)), pick=(t?cand.find(a=>String(a.taille||'').toLowerCase()===String(t).toLowerCase()):null)||(!t||!cand.some(a=>a.taille)?cand[0]:null);
    if(pick) used.add(pick.id);
    return {k,pick,manque:!pick,taille:t||''};})}));
}
function skKitDrawer(d){
  const P=skKitPlan(d.id), K=skKit(), n=P.reduce((x,r)=>x+r.parts.filter(p=>p.pick).length,0), miss=P.reduce((x,r)=>x+r.parts.filter(p=>p.manque).length,0);
  return dTop('Dotation','Équiper '+esc(gName(d.id)),`Kit d’aspirant : ${esc(K.map(k=>k.nom).join(', '))}`)
    +`<div class="dr-body"><p class="help">Les pièces libres sont choisies à la taille de chaque élève (fiche Dotations → Tailles). ${miss?`<b class="bad-t">${pl(miss,'pièce manque','pièces manquent')}</b> : à commander ou à libérer.`:'Rien ne manque.'}</p>
      <div class="tbl-wrap"><table class="tbl stk-kit"><thead><tr><th>Élève</th>${K.map(k=>`<th>${esc(k.nom)}</th>`).join('')}</tr></thead><tbody>${P.map(r=>`<tr><td>${esc(r.e.nom)}</td>${r.parts.map(p=>`<td>${p.has?`<span class="chip off" title="Déjà remis">${esc(p.has.code||'✓')}</span>`:p.pick?`<span class="chip ok">${esc(p.pick.code||p.pick.nom)}${p.pick.taille?' · '+esc(p.pick.taille):''}</span>`:`<span class="chip bad">Manque${p.taille?' ('+esc(p.taille)+')':''}</span>`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="row" style="margin-top:12px"><button class="btn primary" type="button" id="stk-kit-go" data-act="stk-kit-go" data-id="${esc(d.id)}"${n?dis():' disabled'}>Remettre ${pl(n,'pièce','pièces')}</button><button class="btn ghost" type="button" data-act="close">Annuler</button></div></div>`;
}
async function skKitGo(g){
  const le=new Date().toISOString(), fns=[];
  for(const r of skKitPlan(g)) for(const p of r.parts) if(p.pick){const a=p.pick, e=r.e;fns.push(async()=>{await col('stock').doc(a.id).update({attrib:{t:'eleve',id:e.id,le},aId:e.id,maj:le});await col('stock-mvt').doc(skId()).set(skMv(a,'dotation',{eleve:e.id,classe:g,note:'kit d’aspirant'}));});}
  if(await runAll(fns,`${pl(fns.length,'pièce remise','pièces remises')}`)) closeDrawer(true);
}
function skSizesDrawer(d){
  const e=byId(S.data.eleves,d.id);if(!e) return goneHTML('Élève');const t=e.tailles||{};
  return dTop('Tailles',esc(e.nom))+`<form class="dr-body" data-form="stk-sizes" novalidate><div class="grid2">${SK_TAILLES.map(([k,l])=>`<label class="field"><span>${l}</span><input id="sz-${k}" maxlength="10" autocomplete="off" value="${esc(t[k]||'')}"></label>`).join('')}</div>
    <div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button><button class="btn ghost" type="button" data-act="close">Annuler</button></div></form>`;
}
async function skSaveSizes(f){const t={};for(const [k] of SK_TAILLES){const v=f.querySelector('#sz-'+k).value.trim();if(v)t[k]=v;}if(await write(()=>col('eleves').doc(S.dr.id).update({tailles:t}),'Tailles enregistrées')) closeDrawer(true);}
/* Feuille signée : la dotation papier est rangée au dossier */
async function skSigned(eid,on){const A=skArts().filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===eid);await runAll(A.map(a=>()=>col('stock').doc(a.id).update({attrib:Object.assign({},a.attrib,{signe:on})})),on?'Feuille signée notée':'Signature retirée');}
window.addEventListener('hashchange',()=>{if(/#stk=/.test(location.hash))skHash();});
