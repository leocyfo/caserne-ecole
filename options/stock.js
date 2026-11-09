/* PompierNote · option « stock » : généré par outils/construire.js à partir de src/options/stock/ */
'use strict';
optStyles("/* ---------- Stock ---------- */\n/* Inventaire et Achats : les onglets en haut de la page */\n.stk-seg{display:flex;width:fit-content;max-width:100%;margin-bottom:12px}\n.seg-n{margin-left:2px;color:var(--muted);font-style:normal;font-weight:500}\n.seg-n.bad{display:inline-block;min-width:18px;padding:0 5px;border-radius:999px;background:var(--accent);color:#FFFFFF;font-size:.75rem;font-weight:700;line-height:18px;text-align:center}\n.xm-sk{grid-template-columns:minmax(0,2.2fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.3fr) minmax(90px,auto)}\n.xm-hd.xm-sk{grid-template-columns:minmax(0,2.2fr) minmax(0,1fr) minmax(0,1.2fr) minmax(0,1.3fr) 90px}\n.xm-skm{grid-template-columns:44px minmax(0,2.4fr) minmax(0,1fr) minmax(0,1fr)}\n.xm-ski{grid-template-columns:44px minmax(0,2.4fr) minmax(0,1fr) minmax(150px,auto)}\n.xm-ski .xm-end,.xm-sk .xm-end{justify-content:flex-end}\n/* Stock en cartes : aucun libellé (.xm-lite) ; l’état, puis à qui ou combien, puis la catégorie (sélecteurs aussi forts que les règles générales des cartes, qui viennent après) */\n.skm-by{display:none}\n#main.view-cards .xm-list>.xm-row.xm-sk>.stk-c{order:1}\n#main.view-cards .xm-list>.xm-row.xm-sk>:nth-child(3 of :not(.row-open)){order:2}\n#main.view-cards .xm-list>.xm-row.xm-sk>.xm-m{order:3;color:var(--muted)}\n#main.view-cards .xm-list>.xm-row.xm-sk>.xm-end{order:4;flex:none;margin-left:auto;padding:0;border:0}\n#main.view-cards .skm-by{display:inline}\n.stk-c{display:inline-flex;align-items:center;gap:7px;font-size:.8125rem;min-width:0}\n.stk-q b{font-size:.9375rem;font-variant-numeric:tabular-nums}\n.stk-q b.warn{color:var(--warn)}.stk-q b.bad{color:var(--bad)}\n.stk-q small{color:var(--muted);font-size:.78125rem}\n.stk-chips{display:flex;flex-wrap:wrap;gap:5px}\n.stk-chips .chip{cursor:pointer;border:0}\n.stk-acts{flex-wrap:wrap;gap:6px}\n.stk-ig{margin-bottom:12px}\n.stk-ig h2{display:flex;align-items:center;gap:8px}\nform[data-suivi=\"qte\"] .sa-u,form[data-suivi=\"unite\"] .sa-q{display:none}\nform:not([data-cat=\"ari\"]) .sa-ari{display:none}\n\n/* Stock : sélection, emplacements, scanner, étiquettes, comptage */\n.stk-tt{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;align-items:center}\n.stk-tt .stk-ck{grid-row:1/3;width:18px;height:18px;accent-color:var(--accent);cursor:pointer}\n.stk-bulk{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin-bottom:10px;padding:8px 12px;border:1px solid var(--accent);border-radius:var(--r);background:var(--surface)}\n.stk-bulk .field{margin:0}\n.stk-bulk select{min-height:32px}\n.stk-empl{display:grid;grid-template-columns:minmax(220px,300px) minmax(0,1fr);gap:12px;align-items:start}\n.stk-tree ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}\n.stk-node{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px 6px calc(8px + var(--d,0) * 16px);border:0;border-radius:var(--r-sm);background:none;color:var(--ink-2);font-size:.84375rem;text-align:left;cursor:pointer}\n.stk-tree li{--d:0}\n.stk-tree li .stk-node{padding-left:calc(8px + var(--d) * 16px)}\n.stk-node:hover{background:var(--surface-2)}\n.stk-node.on{background:var(--role-bg);color:var(--ink);font-weight:600}\n.stk-node .ic{width:15px;height:15px;color:var(--muted)}\n.stk-node span{flex:1;min-width:0}\n.stk-node i{font-style:normal;font-size:.75rem;color:var(--muted)}\n.stk-elist{min-width:0;display:flex;flex-direction:column;gap:10px}\n.stk-cam{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;border:1px dashed var(--line-strong);border-radius:var(--r)}\n.stk-cam video{width:100%;max-height:300px;border-radius:var(--r-sm);background:#000;object-fit:cover}\n.stk-cam-hint{font-size:.78125rem;color:var(--muted)}\n.stk-pre{margin:0;padding:8px 10px;border-radius:var(--r-sm);background:var(--surface-2);font-size:.78125rem;line-height:1.5}\n.stk-prep{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px}\n.stk-count .stk-cl{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px}\n.stk-count .stk-cl.on{background:var(--surface-2)}\n.chip-btn{padding:3px 10px;border:1px solid var(--line-strong);border-radius:999px;background:var(--surface);color:var(--ink-2);font-size:.78125rem;font-weight:600;cursor:pointer}\n.chip-btn.ok{background:var(--ok);border-color:var(--ok);color:#FFFFFF}\n.chip-btn.bad{background:var(--bad);border-color:var(--bad);color:#FFFFFF}\n.chip-btn.warn{background:var(--warn);border-color:var(--warn);color:#FFFFFF}\n.xm-skb{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.2fr)}\n.stk-kit td{white-space:nowrap}\n.pr-labels{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}\n.lab{display:flex;gap:3mm;align-items:center;padding:2mm;border:1px dashed #999;break-inside:avoid;page-break-inside:avoid;min-height:24mm}\n.lab-qr{flex:none;width:20mm;height:20mm}\n.lab-qr svg{width:100%;height:100%}\n.lab-t{display:flex;flex-direction:column;gap:1px;font-size:9pt;min-width:0}\n.lab-t b{font-size:10pt}\n.lab-t small{font-size:7.5pt;color:#444}\n@media (max-width:900px){.stk-empl{grid-template-columns:1fr}}\n@media (max-width:760px){\n  #drawer .stk-acts .btn{min-height:44px;font-size:.9375rem;flex:1 1 45%}\n  .chip-btn{min-height:36px;padding:6px 12px;font-size:.8125rem}\n  .stk-tt .stk-ck{width:22px;height:22px}\n}\n\n/* Fiches d’objets */\n.stk-fiches{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:12px}\n.stk-fiche{display:flex;flex-direction:column;gap:8px;padding:12px 14px;border:1px solid var(--line);border-left:4px solid var(--line-strong);border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-sm)}\n.stk-fiche.warn{border-left-color:var(--warn)}.stk-fiche.bad{border-left-color:var(--bad)}\n.stk-fh{display:flex;align-items:center;gap:10px;padding:0;border:0;background:none;text-align:left;cursor:pointer;color:var(--ink)}\n.stk-fh b{display:block;font-size:.9375rem}\n.stk-fh small{display:block;font-size:.78125rem;color:var(--muted)}\n.stk-fi{flex:none;display:grid;place-items:center;width:36px;height:36px;border-radius:10px;background:var(--role-bg);color:var(--ink-2)}\n.stk-fi.lg{width:48px;height:48px;border-radius:12px}\n.stk-fi.lg .ic{width:24px;height:24px}\n.stk-fs{margin:0;font-size:.84375rem}\n.stk-fs b{font-size:1.0625rem;font-variant-numeric:tabular-nums}\n.stk-fs small{font-size:.78125rem;color:var(--muted)}\n.stk-ft{display:flex;flex-wrap:wrap;gap:5px;margin:0}\n.stk-fhead{display:flex;flex-direction:column;gap:8px}\n.stk-fhrow{display:flex;flex-wrap:wrap;align-items:center;gap:12px}\n.stk-pick{list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:4px;max-height:52vh;overflow-y:auto}\n.stk-pk{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface);text-align:left;cursor:pointer;color:var(--ink)}\n.stk-pk:hover{border-color:var(--line-strong);background:var(--surface-2)}\n.stk-pk>span:nth-child(2){flex:1;min-width:0}\n.stk-pk b{display:block;font-size:.875rem}\n.stk-pk small{display:block;font-size:.78125rem;color:var(--muted)}\nform[data-form=\"stk-mod\"][data-suivi=\"qte\"] .sa-u,form[data-form=\"stk-mod\"][data-suivi=\"unite\"] .sa-q{display:none}\n");
/* ---------- Stock (outils) : fiches d’objets, import, actions en lot, codes QR et scanner, emplacements, kits et tailles ----------
   stock-modeles/<id> : une fiche d’objet (voir plus bas)
   config/ecole.stock.lieux : l’arbre des emplacements [{ nom, parent, camion }] ; .kit : le kit d’aspirant [{ nom, mot, taille }]
   eleves/<id>.tailles : { casque, manteau, pantalon, bottes, gants }
   Une étiquette QR contient l’adresse du site suivie de #stk=<id> : l’appareil photo du téléphone ouvre l’article. */
const SK_TAILLES=[['casque','Casque'],['manteau','Manteau'],['pantalon','Pantalon'],['bottes','Bottes'],['gants','Gants']];
const SK_KIT_DEF=[{nom:'Casque',mot:'casque',taille:'casque'},{nom:'Habit de combat',mot:'habit',taille:'manteau'},{nom:'Bottes',mot:'botte',taille:'bottes'},{nom:'Gants',mot:'gant',taille:'gants'},{nom:'Cagoule',mot:'cagoule',taille:''}];
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
      ${can?`<div class="row"><button class="btn sm" type="button" data-act="stk-add-to" data-id="${esc(m.id)}">${icon('plus')}Ajouter</button><button class="btn sm ghost" type="button" data-act="stk-fiche" data-id="${esc(m.id)}">Ouvrir</button></div>`:''}</article>`;};
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
      <div class="stk-fhrow"><span class="stk-fi lg">${icon(skCat(m.cat)[2])}</span><div class="u-f1m"><h2 class="u-m0">${esc(m.nom)}</h2><p class="help u-m2-0-0">${esc(m.note||'')}</p></div>
        ${can?`<div class="row"><button class="btn primary" type="button" id="stk-fadd" data-act="stk-add-to" data-id="${esc(m.id)}">${icon('plus')}Ajouter</button><button class="btn" type="button" data-act="stk-mod" data-id="${esc(m.id)}">Modifier la fiche</button>${!q2&&A.length?`<button class="btn ghost" type="button" data-act="stk-flab" data-id="${esc(m.id)}">${icon('print')}Étiquettes</button>`:''}</div>`:''}</div>
      <dl class="facts facts3 u-mt12">${facts.map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></div>
    <div class="kpis u-mt12">${tiles}</div>${sizes?`<section class="panel u-mt12"><h2>Par taille</h2>${sizes}</section>`:''}
    <div class="stk-elist u-mt12">${A.length?skList('','',m.id):emptyBox('Aucun exemplaire',can?'« Ajouter » crée les exemplaires de cette fiche : le nombre, la taille et l’emplacement suffisent.':'')}</div>`;
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
      <div class="row u-mt12"><button class="btn" type="button" id="stk-pick-new" data-act="stk-mod" data-id="">${icon('plus')}Nouvelle fiche</button><button class="btn ghost" type="button" id="stk-pick-free" data-act="stk-free">Article sans fiche…</button></div></div>`;
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
    if(ok&&ct&&S.role==='admin') await skExpense({date:todayISO(),poste:m.cat==='conso'?'conso':'materiel',libelle:`${m.nom} (${n} ${m.unite||''})`.replace(/\s+\)/,')'),tiers:m.fourn||'',ht:ct,source:'stock'});
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
      ${L.length?`<h3 class="sb-h3 u-mt12">${pl(L.length,'article à importer','articles à importer')}</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nom</th><th>Catégorie</th><th>Code</th><th>Emplacement</th><th class="num">Qté</th></tr></thead><tbody>${L.slice(0,12).map(o=>`<tr><td>${esc(o.nom)}</td><td>${esc(skCat(o.cat)[1])}</td><td>${esc(o.code)}</td><td>${esc(o.empl)}</td><td class="num">${o.suivi==='qte'?esc(String(o.qte)):'1'}</td></tr>`).join('')}</tbody></table></div>${L.length>12?`<p class="help">… et ${L.length-12} autres.</p>`:''}
        <div class="row u-mt10"><button class="btn primary" type="submit" id="si-go"${dis()}>Importer ${L.length}</button></div>`:''}</form>`;
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
      <form class="inline-add u-mt10" data-form="stk-code"><label class="field u-f1-200"><span>Code, n° de série ou lien</span><input id="stk-code" autocomplete="off" placeholder="Ex. CAS-014"></label><button class="btn" type="submit">Ajouter</button></form>
      ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
      <h3 class="sb-h3 u-mt12">${L.length?pl(L.length,'article scanné','articles scannés'):'Aucun article scanné'}</h3>
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
      <div class="row u-mt12"><button class="btn primary" type="button" id="stk-kit-go" data-act="stk-kit-go" data-id="${esc(d.id)}"${n?dis():' disabled'}>Remettre ${pl(n,'pièce','pièces')}</button><button class="btn ghost" type="button" data-act="close">Annuler</button></div></div>`;
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
/* ---------- Stock : le matériel et les équipements de l’école (pas de vente) ----------
   stock/<id> : un article. À l’unité (EPI, ARI, matériel : numéro de série, état, inspections, à qui il est attribué)
     ou en quantité (consommables : quantité, seuil minimum).
     { nom, cat epi|ari|mat|conso, suivi unite|qte, code, serie, lot, empl, statut service|reserve|maint|hs, qte, min, unite,
       taille, fab, inspDer, inspFreq, epDer, resa, prix (cents), attrib { t eleve|classe, id, le }, sortie { le, instr, seance }, note }
   stock-mvt/<id> : un mouvement { le, date, type, art, nom, cat, qte, eleve, classe, seance { key, date, titre }, instr, par, note }
   Réglages (config/ecole.stock) : fréquences par catégorie, délai d’alerte, emplacements, droits des enseignants.
   Le matériel « réservable » (camion, lot d’ARI…) s’ajoute aux locaux et équipements des séances : deux séances qui le
   veulent au même moment sont en conflit. */
const SK_CATS=[['epi','EPI','helmet','Casques, habits de combat, bottes, gants'],['ari','ARI et air comprimé','tank','Bouteilles, masques, détendeurs'],['mat','Matériel','tool','Tuyaux, lances, échelles, désincarcération'],['conso','Consommables','drop','Émulseur, balises, premiers soins, carburant']];
const SK_ST={service:['ok','En service'],reserve:['info','En réserve'],maint:['warn','En maintenance'],hs:['bad','Hors service'],manquant:['bad','Manquant']};
const SK_MV={entree:['info','Entrée'],dotation:['k0','Dotation'],retourDot:['off','Retour de dotation'],sortie:['warn','Sortie'],retour:['ok','Retour'],bris:['bad','Bris'],maint:['warn','Maintenance'],service:['ok','Remise en service'],hs:['bad','Retrait'],insp:['ok','Inspection'],epreuve:['ok','Épreuve hydraulique'],conso:['k5','Consommation'],reappro:['info','Réapprovisionnement'],ajust:['off','Ajustement'],transfert:['info','Transfert'],remplissage:['ok','Remplissage'],nettoyage:['ok','Nettoyage avancé'],perte:['bad','Perte']};
const SK_DEF={cats:{epi:{insp:12,vie:10},ari:{insp:1,ep:5,vie:15},mat:{insp:12,vie:0},conso:{}},alerte:30,empl:['Réserve atelier','Salle ARI','Autopompe 119','Entrepôt'],perms:{sortie:true,bris:true}};
/* Listes de contrôle des inspections (réglables dans Réglages du stock) */
const SK_PTS_DEF={epi:['Coutures et fermetures intactes','Bandes réfléchissantes en place','Doublure et barrière d’humidité','Aucune contamination ni brûlure','Étiquette lisible'],ari:['Masque étanche','Détendeur et soupapes','Pression de la bouteille','Harnais et sangles','Alarme de fin de service'],mat:['Aucun dommage visible','Raccords et joints','Fonctionnement vérifié'],conso:[]};
const skPoints=a=>{const P=(cfg().stock||{}).points||{};return Array.isArray(P[a.cat])?P[a.cat]:SK_PTS_DEF[a.cat]||[];};
function skCfg(){
  const c=cfg().stock||{}, cc=c.cats||{}, cats={};
  for(const [k] of SK_CATS) cats[k]=Object.assign({},SK_DEF.cats[k],cc[k]||{});
  return {cats,alerte:+c.alerte>0?+c.alerte:SK_DEF.alerte,empl:Array.isArray(c.empl)?c.empl:SK_DEF.empl,perms:Object.assign({},SK_DEF.perms,c.perms||{})};
}
const skArts=()=>(S.data.stock||[]);
const skCat=k=>SK_CATS.find(c=>c[0]===k)||SK_CATS[2];
const skQte=a=>a.suivi==='qte';
const skName=a=>a.nom+(a.code?' · '+a.code:'');
/* Un coût devient une dépense dans la Compta, si elle est ajoutée */
const skExpense=x=>{const c=opt('compta');return c?c.autoExpense(x):null;};
/* L’épreuve hydraulique ne concerne que les bouteilles sous pression (ARI) */
const skEp=a=>a.cat==='ari'&&(!!a.epDer||/bouteille|cylindre/i.test(a.nom||''));
/* Les échéances d’un article à l’unité : inspection, épreuve hydraulique (bouteilles d’ARI), fin de vie */
function skDue(a){
  if(skQte(a)) return [];
  const k=skCfg().cats[a.cat]||{}, out=[], base=a.inspDer||a.fab||'';
  const f=+a.inspFreq||+k.insp;if(f&&base) out.push({t:'insp',l:'Inspection',date:addMonths(base,f)});
  if(skEp(a)&&k.ep&&(a.epDer||a.fab)) out.push({t:'epreuve',l:'Épreuve hydraulique',date:addMonths(a.epDer||a.fab,12*k.ep)});
  const vie=+a.vie||+k.vie;if(vie&&a.fab) out.push({t:'vie',l:'Fin de vie',date:addMonths(a.fab,12*vie)});
  return out.sort((x,y)=>x.date.localeCompare(y.date));
}
/* Conformité : ok (vert), warn (orange : échéance proche, maintenance, sous le seuil), bad (rouge : en retard, hors service, rupture) */
function skConf(a){
  const t=todayISO(), soon=iso(addDays(new Date(),skCfg().alerte));
  if(skQte(a)){const q=+a.qte||0;if(q<=0)return ['bad','Rupture'];if(a.exp&&a.exp<t)return ['bad','Périmé'];if(a.min&&q<+a.min)return ['warn','Sous le seuil'];if(a.exp&&a.exp<=soon)return ['warn',`Péremption le ${shortDate(parse(a.exp))}`];return ['ok','Suffisant'];}
  if(a.statut==='hs') return ['bad','Hors service'];
  if(a.statut==='manquant') return ['bad','Manquant'];
  const d=skDue(a)[0];
  if(d&&d.date<t) return ['bad',`${d.l} en retard`];
  if(a.statut==='maint') return ['warn','En maintenance'];
  if(d&&d.date<=soon) return ['warn',`${d.l} le ${shortDate(parse(d.date))}`];
  return ['ok','Conforme'];
}
const skWho=a=>{const x=a.attrib;if(!x||!x.id)return '';return x.t==='classe'?gName(x.id):(byId(S.data.eleves,x.id)||{}).nom||'';};
const skCanDo=act=>S.role==='admin'?isAdmin():S.role==='teacher'&&((act==='sortie'||act==='retour')?skCfg().perms.sortie:act==='bris'?skCfg().perms.bris:false);
/* Le menu du Stock. Inventaire et Achats regroupent plusieurs pages (sub) : des onglets en haut de la page. */
function stockTabs(){
  const A=skArts(), due=A.filter(a=>!skQte(a)&&skConf(a)[0]!=='ok'&&a.statut!=='hs'&&a.statut!=='manquant').length, low=A.filter(a=>skQte(a)&&skConf(a)[0]!=='ok').length, late=A.filter(skLate).length;
  const inv={k:'tout',l:'Inventaire',i:'box',n:A.length,sub:[{k:'tout',l:'Tout',n:A.length}].concat(SK_CATS.map(([k,l])=>({k,l,n:A.filter(a=>a.cat===k).length,bad:k==='conso'&&!!low,nb:low,nt:k==='conso'&&low?pl(low,'consommable bas ou périmé','consommables bas ou périmés'):''})))};
  const prep={k:'prep',l:'Sorties',i:'cal',n:late,bad:!!late,nt:'Sorties et préparation des séances'+(late?' · '+pl(late,'retour en retard','retours en retard'):'')};
  if(S.role!=='admin') return [inv,Object.assign({sec:'Suivi'},prep),{k:'mvt',l:'Mouvements',i:'move'}];
  const rep=(S.data.stockRep||[]).filter(r=>r.statut==='ouverte'), repLate=rep.filter(r=>r.prevu&&r.prevu<todayISO()).length, buy=skNeeds().length, rcv=skCmds().filter(c=>c.statut==='envoyee'||c.statut==='partielle').length;
  const buyT=buy?pl(buy,'consommable à commander','consommables à commander'):'', rcvT=rcv?pl(rcv,'commande à recevoir','commandes à recevoir'):'';
  return [{k:'dash',l:'Tableau de bord',i:'spark'},Object.assign({sec:'Inventaire'},inv),{k:'cat',l:'Fiches d’objets',i:'clip',n:skModeles().length},{k:'empl',l:'Emplacements',i:'layers'},{k:'cpt',l:'Comptage',i:'check',nt:'Comptage d’inventaire'},
    {k:'dot',l:'Dotations',i:'users',sec:'Suivi'},prep,{k:'mvt',l:'Mouvements',i:'move'},
    {k:'insp',l:'Inspections',i:'calok',sec:'Entretien',n:due,bad:!!due,nt:due?pl(due,'échéance proche ou dépassée','échéances proches ou dépassées'):''},{k:'rep',l:'Réparations',i:'tool',n:rep.length,bad:!!repLate,nt:rep.length?pl(rep.length,'réparation en cours','réparations en cours'):''},
    {k:'buy',l:'Achats',i:'receipt',sec:'Gestion',n:buy||rcv,bad:!!buy,nt:[buyT,rcvT].filter(Boolean).join(' · '),sub:[{k:'buy',l:'À commander',n:buy,bad:!!buy,nb:buy,nt:buyT},{k:'cmd',l:'Commandes',n:rcv,nt:rcvT},{k:'fourn',l:'Fournisseurs',n:skFourn().length}]},
    {k:'rap',l:'Rapports',i:'chart'},{k:'regl',l:'Réglages',i:'gear',nt:'Réglages du stock'}];
}
/* « Casque de pompier · CAS-001 » : le code ne se coupe pas en fin de ligne */
const skNw=s=>esc(s).replace(/ · ([^ ]+)$/,' · <span class="nw">$1</span>');
/* l’entrée du menu qui montre la page k (la page elle-même, ou un de ses onglets) */
const skTabOf=(tabs,k)=>tabs.find(t=>t.k===k||(t.sub||[]).some(s=>s.k===k));
function skSeg(t,cur){
  return `<div class="seg stk-seg" role="group" aria-label="${esc(t.l)}">${t.sub.map(s=>`<button type="button" id="skt-${s.k}" data-act="pg-set" data-k="sk" data-v="${s.k}" aria-pressed="${s.k===cur}"${s.nt?` title="${esc(s.nt)}"`:''}>${esc(s.l)}${s.bad?` <i class="seg-n bad">${s.nb}</i>`:s.n?` <i class="seg-n">${s.n}</i>`:''}</button>`).join('')}</div>`;
}
function stockPage(){
  const tabs=stockTabs(), t=skTabOf(tabs,S.pg.sk), tab=t?S.pg.sk:tabs[0].k;
  if(!S.loaded.stock) return '<div class="empty"><p>Chargement du stock…</p></div>';
  const P={dash:skDash,dot:skDotPage,mvt:skMvtPage,insp:skInspPage,regl:skReglPage,empl:skEmplPage,cat:skCatalogPage,prep:skPrepPage,rep:skRepPage,buy:skToBuyPage,cmd:skCmdPage,fourn:skFournPage,cpt:skCountPage,rap:skReportPage}[tab];
  return (t&&t.sub?skSeg(t,tab):'')+(P?P():skList(tab==='tout'?'':tab));
}
/* Par emplacement : l’arbre, et le contenu de l’emplacement choisi (avec ce qu’il contient) */
function skEmplPage(){
  const L=skLieux(), A=skArts(), sel=S.pg.sel2||'', cnt=n=>{const U=skUnder(n);return A.filter(a=>U.has(a.empl)).length;};
  const tree=(p,d)=>L.filter(l=>(l.parent||'')===p).map(l=>`<li style="--d:${d}"><button type="button" class="stk-node${sel===l.nom?' on':''}" id="stk-n-${esc(l.nom.replace(/[^A-Za-z0-9]+/g,'-'))}" data-act="pg-set" data-k="sel2" data-v="${esc(l.nom)}" aria-pressed="${sel===l.nom}">${icon(l.camion?'tool':'layers')}<span>${esc(l.nom)}</span><i>${cnt(l.nom)}</i></button></li>`+tree(l.nom,d+1)).join('');
  const orphan=A.filter(a=>!L.some(l=>l.nom===a.empl)).length;
  return `<div class="stk-empl"><section class="panel stk-tree"><h2>Emplacements</h2><ul>${tree('',0)}${orphan?`<li style="--d:0"><button type="button" class="stk-node${sel==='-'?' on':''}" data-act="pg-set" data-k="sel2" data-v="-">${icon('box')}<span>Ailleurs ou sans emplacement</span><i>${orphan}</i></button></li>`:''}</ul>${isAdmin()?'<p class="help u-mt8">L’arbre se règle dans Réglages du stock.</p>':''}</section>
    <div class="stk-elist">${sel?skList('',sel):emptyBox('Choisissez un emplacement','Son contenu paraît ici, avec ce qu’il contient (étagères, bacs, compartiments d’un camion).')}</div></div>`;
}
const skTile=(id,v,lbl,val,cls,sub)=>`<button type="button" class="xm-tile" id="${id}" data-act="pg-set" data-k="sk" data-v="${v}" aria-pressed="false"><span class="lbl">${lbl}</span><b class="${cls}">${val}</b><small>${sub}</small></button>`;
function skDash(){
  const A=skArts(), due=A.filter(a=>!skQte(a)&&a.statut!=='hs'&&skConf(a)[0]!=='ok'), late=due.filter(a=>skConf(a)[0]==='bad'), low=A.filter(a=>skQte(a)&&skConf(a)[0]!=='ok'), off=A.filter(a=>!skQte(a)&&(a.statut==='hs'||a.statut==='maint')), out=A.filter(a=>a.sortie&&a.sortie.le);
  const tb=`<div class="toolbar"><span class="grow"></span><button class="btn" type="button" id="stk-scan-open" data-act="stk-scan">${icon('eye')}Scanner</button></div>`;
  const tiles=`<div class="xm-tiles" role="group" aria-label="Indicateurs du stock">${skTile('skd-tout','tout','Inventaire',A.length,'',`${A.filter(a=>!skQte(a)).length} à l’unité · ${A.filter(skQte).length} en quantité`)}
    ${skTile('skd-insp','insp','Inspections dues',due.length,due.length?late.length?'bad':'warn':'',late.length?pl(late.length,'en retard','en retard'):`dans les ${skCfg().alerte} prochains jours`)}
    ${skTile('skd-conso','conso','Consommables bas',low.length,low.length?'warn':'',low.length?esc(low.slice(0,2).map(a=>a.nom).join(', ')):'Tout est suffisant')}
    ${skTile('skd-off','tout','Hors service ou en maintenance',off.length,off.length?'bad':'',off.length?pl(off.filter(a=>a.statut==='hs').length,'hors service','hors service'):'Aucun')}</div>`;
  const todo=[...late,...low.filter(a=>skConf(a)[0]==='bad'),...due.filter(a=>skConf(a)[0]!=='bad'),...low.filter(a=>skConf(a)[0]!=='bad'),...A.filter(a=>a.statut==='hs')].filter((a,i,arr)=>arr.indexOf(a)===i).slice(0,10);
  const li=a=>{const c=skConf(a);return `<li><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${esc(skName(a))}</button><span class="chip ${c[0]}">${esc(c[1])}</span></li>`;};
  const mv=(S.data.stockMvt||[]).slice(0,6);
  const rep=(S.data.stockRep||[]).filter(r=>r.statut==='ouverte'), rcv=(S.data.stockCmd||[]).filter(c=>c.statut==='envoyee'||c.statut==='partielle');
  return tb+tiles+`<div class="two">
    <section class="panel" id="skd-todo"><h2>À faire</h2>${todo.length?`<ul class="plist">${todo.map(li).join('')}</ul>`:'<p class="help">Rien à faire : tout le matériel est conforme et les consommables suffisent.</p>'}</section>
    <div class="stackp"><section class="panel" id="skd-out"><h2>Sorties en cours</h2>${out.length?`<ul class="plist">${out.map(a=>`<li><span><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${esc(skName(a))}</button><span class="muted sm"> · ${esc(skSortieTxt(a))}</span>${skLate(a)?' <span class="chip bad">En retard</span>':''}</span>${skCanDo('retour')&&S.conn==='shared'?`<button class="btn sm" type="button" data-act="stk-go" data-id="${esc(a.id)}" data-v="retour">Retour</button>`:''}</li>`).join('')}</ul>`:'<p class="help">Aucun matériel sorti.</p>'}</section>
    ${rep.length||rcv.length?`<section class="panel" id="skd-wait"><h2>En attente</h2><ul class="plist">${rep.map(r=>`<li><span><button class="link" type="button" data-act="stk-rep" data-id="${esc(r.id)}">${esc(r.nom)}</button><span class="muted sm"> · en réparation${r.prevu?' · retour prévu le '+esc(shortDate(parse(r.prevu))):''}</span></span>${r.prevu&&r.prevu<todayISO()?'<span class="chip bad">En retard</span>':''}</li>`).join('')}${rcv.map(c=>`<li><span><button class="link" type="button" data-act="stk-cmd" data-id="${esc(c.id)}">${esc(c.num)}</button><span class="muted sm"> · ${esc(c.fourn||'')} · à recevoir</span></span></li>`).join('')}</ul></section>`:''}
    <section class="panel" id="skd-mvt"><h2>Derniers mouvements</h2>${mv.length?`<ul class="plist">${mv.map(m=>`<li><span>${esc(m.nom||'')}<span class="muted sm"> · ${esc(ago(m.le))}</span></span><span class="chip ${(SK_MV[m.type]||['off'])[0]}">${esc((SK_MV[m.type]||['',m.type])[1])}</span></li>`).join('')}</ul><div class="row u-mt8"><button class="btn sm ghost" type="button" data-act="pg-set" data-k="sk" data-v="mvt">Tous les mouvements</button></div>`:'<p class="help">Aucun mouvement pour l’instant.</p>'}</section></div></div>`;
}
const skSortieTxt=a=>{const s=a.sortie||{};return ['sorti '+ago(s.le),s.seance&&s.seance.titre?s.seance.titre:'',s.instr?tName(s.instr):''].filter(Boolean).join(' · ');};
/* L’inventaire (tout, une catégorie, ou un emplacement et ce qu’il contient) */
function skList(cat,empl,mod){
  const st=S.pg, q=String(st.sq||'').trim().toLowerCase(), f=st.sf||'', can=S.conn==='shared', adm=isAdmin()&&can, sel=new Set(skSel());
  let A=skArts().filter(a=>!cat||a.cat===cat);
  if(mod) A=A.filter(a=>a.modele===mod);
  if(empl){const L=skLieux();if(empl==='-')A=A.filter(a=>!L.some(l=>l.nom===a.empl));else{const U=skUnder(empl);A=A.filter(a=>U.has(a.empl));}}
  const tot=A.length;
  if(q) A=A.filter(a=>[a.nom,a.code,a.serie,a.lot,a.empl,a.sous,a.fourn,skWho(a)].some(x=>String(x||'').toLowerCase().includes(q)));
  if(f) A=A.filter(a=>f==='late'?skConf(a)[0]==='bad'&&!skQte(a):f==='soon'?skConf(a)[0]!=='ok'&&!skQte(a):f==='low'?skQte(a)&&skConf(a)[0]!=='ok':f==='attr'?!!(a.attrib&&a.attrib.id):f==='out'?!!(a.sortie&&a.sortie.le):f==='resa'?!!a.resa:!skQte(a)&&a.statut===f);
  A=A.slice().sort((a,b)=>SK_CATS.findIndex(c=>c[0]===a.cat)-SK_CATS.findIndex(c=>c[0]===b.cat)||collator.compare(a.nom||'',b.nom||'')||collator.compare(a.code||'',b.code||''));
  st.svis=A.map(a=>a.id);
  const opts=[['','Tout afficher'],['soon','À inspecter bientôt'],['late','En retard'],['low','Consommables bas'],['attr','Attribués'],['out','Sortis'],['resa','Réservables'],['service','En service'],['reserve','En réserve'],['maint','En maintenance'],['hs','Hors service'],['manquant','Manquants']];
  const tb=`<div class="toolbar"><input class="search" id="stk-q" type="search" placeholder="Nom, code, n° de série, emplacement" aria-label="Rechercher dans le stock" autocomplete="off" value="${esc(st.sq||'')}"><select id="stk-f" aria-label="Afficher">${opts.map(([k,l])=>`<option value="${k}"${f===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span>
    ${empl&&empl!=='-'&&adm?`<button class="btn" type="button" id="stk-cpt-here" data-act="stk-cpt-at" data-v="${esc(empl)}">${icon('check')}Compter ici</button>`:''}<button class="btn" type="button" id="stk-scan-open" data-act="stk-scan">${icon('eye')}Scanner</button>
    ${adm&&!mod?`<button class="btn" type="button" id="stk-imp-open" data-act="stk-imp">${icon('up')}Importer</button><button class="btn primary" type="button" id="stk-add" data-act="stk-new" data-v="${cat||''}" data-e="${esc(empl&&empl!=='-'?empl:'')}">${icon('plus')}Ajouter un article</button>`:''}</div>`;
  const head=[['Article'],[cat?'Emplacement':'Catégorie'],['Qté ou attribué à'],['État'],['','r']];
  if(!tot) return tb+emptyBox(empl?'Rien à cet emplacement':cat?`Aucun article dans ${skCat(cat)[1]}`:'Le stock est vide',isAdmin()?'« Ajouter un article » inscrit un équipement, un lot ou un consommable ; « Importer » reprend une liste d’Excel.':'L’administration inscrit le matériel de l’école.');
  const rows=A.map(a=>{const c=skConf(a), who=skWho(a);
    const qty=skQte(a)?`<span class="stk-q"><b class="${c[0]==='ok'?'':c[0]}">${esc(String(+a.qte||0))}</b> ${esc(a.unite||'')}${a.min?`<small> · seuil ${esc(String(a.min))}</small>`:''}</span>`:who?`<span>${esc(who)}</span>`:a.sortie&&a.sortie.le?`<span class="${skLate(a)?'bad-t':'muted'}">Sorti${skLate(a)?' (en retard)':''}</span>`:`<span class="muted">${esc((SK_ST[a.statut]||SK_ST.service)[1])}</span>`;
    return xRow('xm-sk xm-lite',`data-act="stk-open" data-id="${esc(a.id)}"`,`<div class="xm-t${adm?' stk-tt':''}">${adm?`<input type="checkbox" class="stk-ck" data-act="stk-sel" data-id="${esc(a.id)}"${sel.has(a.id)?' checked':''} aria-label="Cocher ${esc(skName(a))}">`:''}<b>${esc(a.nom)}</b><small>${esc([a.code,a.serie?'n° '+a.serie:'',a.taille?'taille '+a.taille:''].filter(Boolean).join(' · ')||'—')}</small></div>
      <span class="xm-m">${esc(cat?a.empl||'—':skCat(a.cat)[1])}</span>${qty}<span class="stk-c"><i class="dot ${c[0]}" aria-hidden="true"></i>${esc(c[1])}</span><div class="xm-end">${a.resa?'<span class="chip off">Réservable</span>':''}</div>`,skName(a));}).join('');
  return tb+skBulkBar()+(A.length?xList('xm-sk',head,rows):'<section class="panel"><p class="help">Aucun article ne correspond.</p></section>')
    +`<p class="help u-mt8">${A.length===tot?pl(tot,'article','articles'):`${A.length} sur ${tot}`}.${adm&&A.length?` <button class="link" type="button" id="stk-all" data-act="stk-bk" data-v="all">Cocher les ${A.length}</button>`:''}</p>`;
}
/* Dotations : ce que chaque élève (ou la classe) a reçu ; tailles, kit d’aspirant, feuille signée */
function skDotPage(){
  const gs=groups(), g=gs.some(x=>x.id===S.pg.sg)?S.pg.sg:(gs[0]||{}).id, can=isAdmin()&&S.conn==='shared', A=skArts();
  if(!gs.length) return emptyBox('Aucune classe','Les dotations se font aux élèves d’une classe.');
  const tb=`<div class="toolbar"><select id="stk-g" aria-label="Classe">${gs.map(x=>`<option value="${esc(x.id)}"${x.id===g?' selected':''}>${esc(x.nom)}</option>`).join('')}</select><span class="grow"></span>${can?`<button class="btn primary" type="button" id="stk-kit-open" data-act="stk-kit" data-id="${esc(g)}">${icon('users')}Équiper la classe</button><button class="btn" type="button" id="stk-dot-cls" data-act="stk-dot" data-t="classe" data-id="${esc(g)}">${icon('plus')}Lot de la classe</button>`:''}</div>`;
  const els=sortElsByClass(S.data.eleves.filter(e=>e.groupe===g)), mine=id=>A.filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===id), cls=A.filter(a=>a.attrib&&a.attrib.t==='classe'&&a.attrib.id===g);
  const chips=list=>list.length?list.map(a=>`<button class="chip ${skConf(a)[0]==='ok'?'off':skConf(a)[0]}" type="button" data-act="stk-open" data-id="${esc(a.id)}" title="${esc(skConf(a)[1])}">${esc(a.nom)}${a.taille?' '+esc(a.taille):''}</button>`).join(''):'<span class="muted">Rien d’attribué</span>';
  const all=els.reduce((n,e)=>n+mine(e.id).length,0)+cls.length;
  const rows=els.map(e=>{const m=mine(e.id), t=e.tailles||{}, signe=m.length&&m.every(a=>a.attrib.signe);return `<tr id="stk-e-${esc(e.id)}"><td><span class="tb-who"><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span><span>${esc(e.nom)}</span></span><small class="tb-sub">${esc(SK_TAILLES.filter(([k])=>t[k]).map(([k,l])=>l+' '+t[k]).join(' · ')||'Tailles non inscrites')}</small></td><td><div class="stk-chips">${chips(m)}</div></td>
    <td class="r">${can?`<button class="btn sm" type="button" data-act="stk-dot" data-t="eleve" data-id="${esc(e.id)}">Attribuer</button><button class="btn sm ghost" type="button" data-act="stk-sizes" data-id="${esc(e.id)}">Tailles</button>`:''}${m.length?`<button class="btn sm ghost" type="button" data-act="stk-dot-pr" data-id="${esc(e.id)}">${icon('print')}Feuille</button>${can?`<button class="chip-btn ${signe?'ok':''}" type="button" data-act="stk-sign" data-id="${esc(e.id)}" data-v="${signe?'':'1'}" aria-pressed="${!!signe}">${signe?'Signée':'Non signée'}</button>`:''}`:''}</td></tr>`;}).join('');
  return tb+`<section class="panel" id="stk-cls"><h2>Lot de la classe</h2><div class="stk-chips">${chips(cls)}</div></section>
    <div class="tbl-wrap u-mt12"><table class="tbl stack"><thead><tr><th>Élève</th><th>Équipement attribué</th><th class="r"><span class="vh">Actions</span></th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="muted">Aucun élève dans cette classe.</td></tr>'}</tbody></table></div>
    ${can&&all?`<div class="row u-mt12">${S.pg.sback===g?`<span class="help">Reprendre les ${all} articles de ${esc(gName(g))} (fin de cohorte) ?</span><button class="btn sm danger" type="button" id="stk-back-go" data-act="stk-back" data-id="${esc(g)}"${dis()}>Oui, tout reprendre</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="sback" data-v="">Annuler</button>`:`<button class="btn sm ghost" type="button" id="stk-back" data-act="pg-set" data-k="sback" data-v="${esc(g)}">Tout reprendre (fin de cohorte)</button>`}</div>`:''}`;
}
/* Mouvements : le journal de tout ce qui bouge */
function skMvtPage(){
  const st=S.pg, ty=st.smt||'', q=String(st.smq||'').trim().toLowerCase(), lim=+st.lim||60;
  let M=(S.data.stockMvt||[]).filter(m=>!ty||m.type===ty);
  if(q) M=M.filter(m=>[m.nom,m.note,m.par,m.instr?tName(m.instr):'',m.eleve?(byId(S.data.eleves,m.eleve)||{}).nom:'',m.classe?gName(m.classe):'',m.seance&&m.seance.titre].some(x=>String(x||'').toLowerCase().includes(q)));
  const tb=`<div class="toolbar"><input class="search" id="stk-mq" type="search" placeholder="Article, personne, séance" aria-label="Rechercher un mouvement" autocomplete="off" value="${esc(st.smq||'')}"><select id="stk-mt" aria-label="Type de mouvement"><option value="">Tous les mouvements</option>${Object.entries(SK_MV).map(([k,[,l]])=>`<option value="${k}"${ty===k?' selected':''}>${l}</option>`).join('')}</select><span class="grow"></span><button class="btn" type="button" id="stk-mvt-exp" data-act="stk-mvt-exp">${icon('down')}Exporter</button></div>`;
  if(!M.length) return tb+emptyBox('Aucun mouvement','Les dotations, sorties, retours, bris, inspections et consommations paraîtront ici.');
  const det=m=>[m.qte&&m.qte!==1?`${m.qte>0&&m.type!=='conso'?'+':''}${m.type==='conso'?'−':''}${Math.abs(m.qte)}`:'',m.eleve?(byId(S.data.eleves,m.eleve)||{}).nom:'',m.classe?gName(m.classe):'',m.seance&&m.seance.titre,m.instr?tName(m.instr):'',m.note].filter(Boolean).join(' · ');
  const rows=M.slice(0,lim).map(m=>xRow('xm-skm xm-lite',m.art?`data-act="stk-open" data-id="${esc(m.art)}"`:'',`${xDate({date:m.date||String(m.le).slice(0,10)},'')}<div class="xm-t"><b>${skNw(m.nom||'')}</b>${det(m)?`<small>${esc(det(m))}</small>`:''}</div><span class="skm-ty"><span class="chip ${(SK_MV[m.type]||['off'])[0]}">${esc((SK_MV[m.type]||['',m.type])[1])}</span></span><span class="xm-m skm-par">${m.par?`<span class="skm-by">par </span>${esc(m.par)}`:''}</span>`,m.nom||'')).join('');
  return tb+xList('xm-skm',[[''],['Article'],['Mouvement'],['Par']],rows)+(M.length>lim?`<div class="row u-mt12"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+60}">Afficher plus (${M.length-lim})</button></div>`:'');
}
/* Inspections : les échéances, de la plus urgente à la plus lointaine (90 jours) */
function skInspPage(){
  const t=todayISO(), far=iso(addDays(new Date(),90)), soon=iso(addDays(new Date(),skCfg().alerte)), can=isAdmin()&&S.conn==='shared';
  const L=[];for(const a of skArts()) if(!skQte(a)&&a.statut!=='hs') for(const d of skDue(a)) if(d.date<=far) L.push({a,d});
  L.sort((x,y)=>x.d.date.localeCompare(y.d.date));
  const top=`<div class="toolbar"><span class="grow"></span><button class="btn" type="button" id="stk-insp-pr" data-act="stk-insp-pr">${icon('print')}Rapport d’inspections</button></div>`+(can?skTourHTML():'');
  if(!L.length) return top+emptyBox('Aucune échéance dans les 90 prochains jours','Les inspections, épreuves hydrauliques et fins de vie à venir paraîtront ici.');
  const grp=[['En retard',x=>x.d.date<t,'bad'],[`Dans les ${skCfg().alerte} prochains jours`,x=>x.d.date>=t&&x.d.date<=soon,'warn'],['Plus tard (90 jours)',x=>x.d.date>soon,'']];
  return top+grp.map(([l,f,cls])=>{const xs=L.filter(f);if(!xs.length)return '';
    return `<section class="panel stk-ig"><h2>${l} <span class="chip ${cls||'off'}">${xs.length}</span></h2>${xList('xm-ski',[[''],['Article'],['Échéance'],['','r']],xs.map(({a,d})=>xRow('xm-ski xm-lite','',`${xDate({date:d.date},cls==='bad'?'hot':'')}<div class="xm-t"><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${skNw(skName(a))}</button><small>${esc([skCat(a.cat)[1],a.empl,skWho(a)].filter(Boolean).join(' · '))}</small></div><span class="xm-m">${esc(d.l)}</span><div class="xm-end">${can?d.t==='vie'?`<button class="btn sm ghost" type="button" data-act="stk-go" data-id="${esc(a.id)}" data-v="hs">Retirer du service</button>`:`<button class="btn sm" type="button" data-act="stk-go" data-id="${esc(a.id)}" data-v="${d.t}">${d.t==='epreuve'?'Épreuve faite':'Inspection faite'}</button>`:''}</div>`,'')).join(''))}</section>`;}).join('');
}
/* Réglages du stock */
function skReglPage(){
  const k=skCfg(), c=cfg().stock||{}, can=isAdmin()&&S.conn==='shared', off=can?'':' disabled', num=(id,l,v,att)=>`<label class="field"><span>${l}</span><input id="${id}" type="number" inputmode="numeric" value="${esc(v==null?'':v)}" ${att}${off}></label>`;
  const area=(id,l,v,rows,ph)=>`<label class="field"><span>${l}</span><textarea id="${id}" rows="${rows}" maxlength="2000"${ph?` placeholder="${esc(ph)}"`:''}${off}>${esc(v)}</textarea></label>`;
  return `<form data-form="stk-regl" class="ps-form" novalidate><div class="ps-top"><h2 class="ps-h">Réglages du stock</h2><p class="help">Les valeurs par défaut de chaque catégorie ; un modèle ou un article peut avoir les siennes.</p></div><div class="ps-cards">
    ${SK_CATS.filter(x=>x[0]!=='conso').map(([x,l])=>`<section class="panel ps-card"><h3>${l}</h3>
      ${num('sr-'+x+'-insp','Inspection tous les (mois)',k.cats[x].insp||'','min="0" max="120" step="1"')}
      ${x==='ari'?num('sr-ari-ep','Épreuve hydraulique tous les (ans)',k.cats.ari.ep||'','min="0" max="20" step="1"'):''}
      ${num('sr-'+x+'-vie','Durée de vie (ans, 0 : aucune)',k.cats[x].vie||0,'min="0" max="50" step="1"')}</section>`).join('')}
    <section class="panel ps-card"><h3>Alertes</h3>${num('sr-alerte','Prévenir avant une échéance (jours)',k.alerte,'min="1" max="180" step="1"')}${num('sr-retard','Un retour est en retard après (heures)',skRetardH(),'min="1" max="720" step="1"')}</section>
    <section class="panel ps-card ps-wide"><h3>Emplacements</h3><div class="grid2">${area('sr-lieux','Un par ligne ; deux espaces pour ranger dans le précédent ; [camion] pour un camion',skLieuxTxt(),9,'Caserne-école\n  Réserve atelier\n    Étagère A\nAutopompe 119 [camion]')}
      <div><p class="help">Exemple :</p><pre class="stk-pre">Caserne-école\n  Réserve atelier\n    Étagère A\n  Salle ARI\nAutopompe 119 [camion]\nEntrepôt</pre><p class="help">Un article garde son emplacement par son nom : renommer un emplacement ne déplace pas les articles.</p></div></div></section>
    <section class="panel ps-card ps-wide"><h3>Listes de contrôle des inspections</h3><p class="help">Un point par ligne. À l’inspection, chaque point se coche ; un point décoché envoie l’article à réparer.</p><div class="ps-cards">${SK_CATS.filter(x=>x[0]!=='conso').map(([x,l])=>`<div class="ps-card u-fb260">${area('sr-pts-'+x,l,(Array.isArray((c.points||{})[x])?c.points[x]:SK_PTS_DEF[x]).join('\n'),5)}</div>`).join('')}</div></section>
    <section class="panel ps-card"><h3>Kit d’aspirant</h3>${area('sr-kit','Une pièce par ligne : nom ; mot dans le nom de l’article ; taille (casque, manteau, pantalon, bottes, gants)',skKit().map(x=>[x.nom,x.mot,x.taille].join(' ; ')).join('\n'),6)}<p class="help">« Équiper la classe » remet une pièce de chaque, à la taille de l’élève.</p></section>
    <section class="panel ps-card"><h3>Les enseignants peuvent</h3>
      <label class="ps-chk"><input type="checkbox" id="sr-p-sortie"${k.perms.sortie?' checked':''}${off}><span><b>Sortir et retourner le matériel</b><small>Pour une manœuvre, avec le contrôle au retour.</small></span></label>
      <label class="ps-chk"><input type="checkbox" id="sr-p-bris"${k.perms.bris?' checked':''}${off}><span><b>Déclarer un bris</b><small>L’article passe en maintenance ou hors service.</small></span></label>
      <p class="help">Sinon, l’entrée Matériel disparaît de leur menu.</p></section></div>
    <div class="ps-save"><button class="btn primary" type="submit" id="sr-save"${dis()}${off}>Enregistrer</button><span class="help">Valeurs habituelles : EPI inspectés chaque année et retirés après 10 ans ; bouteilles d’ARI vérifiées chaque mois, éprouvées tous les 5 ans, 15 ans de vie. À confirmer avec votre service.</span></div></form>`;
}
async function skSaveRegl(f){
  const q=id=>f.querySelector('#'+id), n=(id,a,b,d)=>{const v=Math.round(+q(id).value);return v>=a&&v<=b?v:d;}, lines=id=>q(id).value.split('\n').map(x=>x.trim()).filter(Boolean);
  const c=configDoc(), cats={};
  for(const [k] of SK_CATS) if(k!=='conso') cats[k]={insp:n('sr-'+k+'-insp',0,120,SK_DEF.cats[k].insp),vie:n('sr-'+k+'-vie',0,50,0)};
  cats.ari.ep=n('sr-ari-ep',0,20,5);cats.conso={};
  const lieux=skParseLieux(q('sr-lieux').value);if(!lieux.length){toast('Gardez au moins un emplacement.','bad');return;}
  const kit=lines('sr-kit').map(l=>{const [nom,mot,t]=l.split(/\s*;\s*/);return {nom:(nom||'').slice(0,40),mot:(mot||nom||'').toLowerCase().slice(0,30),taille:SK_TAILLES.some(x=>x[0]===String(t||'').toLowerCase())?String(t).toLowerCase():''};}).filter(x=>x.nom);
  const points={};for(const [k] of SK_CATS) if(k!=='conso') points[k]=[...new Set(lines('sr-pts-'+k).map(x=>x.slice(0,80)))];
  c.stock=Object.assign({},cfg().stock||{},{cats,alerte:n('sr-alerte',1,180,30),retardH:n('sr-retard',1,720,24),lieux,empl:lieux.map(l=>l.nom),points,kit,perms:{sortie:q('sr-p-sortie').checked,bris:q('sr-p-bris').checked}});
  await saveConfig(c,'Réglages du stock enregistrés');
}
/* ---------- La fenêtre d’un article : fiche, ajout et modification, actions ---------- */
function stockDrawer(){
  const d=S.dr, M={pick:skPickDrawer,add:skAddDrawer,dot:skDotDrawer,mod:skModDrawer,imp:skImportDrawer,scan:skScanDrawer,kit:skKitDrawer,sizes:skSizesDrawer,cmd:skCmdDrawer,fourn:skFournDrawer,rep:skRepDrawer}[d.mode];
  if(M) return M(d);
  const a=d.id?byId(skArts(),d.id):null;
  if(d.mode!=='new'&&!a) return goneHTML('Article');
  if(d.mode==='new'||d.mode==='edit') return skForm(d,a);
  if(d.mode==='act') return skActForm(d,a);
  const c=skConf(a), due=skDue(a), can=S.conn==='shared', adm=isAdmin()&&can, mv=(S.data.stockMvt||[]).filter(m=>m.art===a.id).slice(0,12), mo=a.modele?byId(skModeles(),a.modele):null, rs=skResaSess(a);
  const fact=(l,v)=>`<div><dt>${l}</dt><dd>${v||'<span class="muted">—</span>'}</dd></div>`, opt=(l,v)=>v?fact(l,v):'';
  const btn=(act,l,cls)=>skCanDo(act)&&can?`<button class="btn sm${cls?' '+cls:''}" type="button" data-act="stk-do" data-v="${act}">${l}</button>`:'';
  const adb=(act,l,cls,x)=>adm?`<button class="btn sm${cls?' '+cls:''}" type="button" data-act="${act}"${x||''}>${l}</button>`:'';
  const acts=skQte(a)?[btn('conso','Consommer'),btn('reappro','Réapprovisionner'),btn('ajust','Ajuster la quantité','ghost'),btn('transfert','Transférer','ghost')]
    :[a.sortie&&a.sortie.le?btn('retour','Retour de manœuvre','primary'):a.statut!=='hs'&&a.statut!=='maint'&&a.statut!=='manquant'?btn('sortie','Sortir pour une manœuvre'):'',
      a.attrib&&a.attrib.id?btn('retourDot','Reprendre l’article'):a.statut!=='hs'&&a.statut!=='manquant'?btn('dotation','Attribuer'):'',
      btn('insp','Inspection faite'),skEp(a)?btn('epreuve','Épreuve hydraulique faite'):'',skEp(a)?btn('remplissage','Remplissage'):'',a.cat==='epi'?btn('nettoyage','Nettoyage avancé','ghost'):'',
      a.statut==='maint'||a.statut==='hs'||a.statut==='manquant'?btn('service','Remettre en service'):btn('bris','Déclarer un bris'),
      a.statut!=='maint'&&a.statut!=='hs'?adb('stk-rep-new','Envoyer en réparation','ghost'):'',btn('transfert','Transférer','ghost'),a.statut!=='hs'?btn('hs','Retirer du service','ghost'):''];
  return dTop(esc(skCat(a.cat)[1]+(a.sous?' · '+a.sous:'')),esc(a.nom),esc([a.code,a.serie?'n° '+a.serie:''].filter(Boolean).join(' · ')))
    +`<div class="dr-body"><p><span class="chip ${c[0]}">${esc(c[1])}</span>${skQte(a)?'':` <span class="chip ${(SK_ST[a.statut]||SK_ST.service)[0]}">${esc((SK_ST[a.statut]||SK_ST.service)[1])}</span>`}${a.resa?' <span class="chip off">Réservable pour les séances</span>':''}${skLate(a)?' <span class="chip bad">Retour en retard</span>':''}</p>
      <dl class="facts u-mt12">${skQte(a)?fact('Quantité',`<b>${esc(String(+a.qte||0))}</b> ${esc(a.unite||'')}`)+fact('Seuil d’alerte',a.min?esc(String(a.min)):'')+opt('Lot',esc(a.lot||''))+opt('Péremption',a.exp?esc(longDate(parse(a.exp))):'')
        :fact('Attribué à',esc(skWho(a))+(a.attrib&&a.attrib.signe?' <span class="chip ok">Signée</span>':''))+fact('Sortie',a.sortie&&a.sortie.le?esc(skSortieTxt(a)):'')+opt('Taille',esc(a.taille||''))+fact('Fabrication',a.fab?esc(longDate(parse(a.fab))):'')+fact('Dernière inspection',a.inspDer?esc(longDate(parse(a.inspDer))):'')+(skEp(a)?fact('Dernière épreuve',a.epDer?esc(longDate(parse(a.epDer))):'')+opt('Remplissages',a.remplissages?esc(String(a.remplissages))+(a.pression?` · ${esc(String(a.pression))} psi`:''):''):'')+(a.cat==='epi'?opt('Nettoyages avancés',a.nettoyages?esc(String(a.nettoyages)):'')+opt('Expositions au feu réel',a.expos?esc(String(a.expos)):''):'')+opt('Garantie jusqu’au',a.garantie?esc(longDate(parse(a.garantie))):'')}
        ${fact('Emplacement',esc(a.empl||''))}${opt('Fournisseur',esc(a.fourn||''))}${a.prix?fact('Coût unitaire',esc(fmtM(a.prix))):''}${mo?fact('Fiche',`<button class="link" type="button" data-act="stk-fiche" data-id="${esc(mo.id)}">${esc(mo.nom)}</button>`):''}</dl>
      ${due.length?`<h3 class="sb-h3 u-mt14">Échéances</h3><ul class="plist">${due.map(x=>`<li><span>${esc(x.l)}</span><span class="chip ${x.date<todayISO()?'bad':x.date<=iso(addDays(new Date(),skCfg().alerte))?'warn':'off'}">${esc(longDate(parse(x.date)))}</span></li>`).join('')}</ul>`:''}
      ${a.resa?`<h3 class="sb-h3 u-mt14">Réservé pour</h3>${rs.length?`<ul class="plist">${rs.slice(0,8).map(x=>`<li><span>${esc(dayLabel(parse(x.date)))} · ${esc(momentOf(x))}</span><span class="muted sm">${esc(gName(x.grp))} · ${esc((x.c.code?x.c.code+' ':'')+x.c.titre)}</span></li>`).join('')}</ul>`:'<p class="help">Aucune séance ne le demande dans les 30 prochains jours.</p>'}`:''}
      ${a.note?`<p class="help u-mt10"><span class="pre">${esc(a.note)}</span></p>`:''}
      <div class="row stk-acts u-mt14">${acts.join('')}${adm?`<button class="btn sm ghost" type="button" id="stk-edit" data-act="stk-edit">Modifier</button><button class="btn sm ghost" type="button" data-act="stk-dup">${icon('copy')}Dupliquer</button><button class="btn sm ghost" type="button" data-act="stk-labels" data-v="one">${icon('print')}Étiquette</button>`:''}</div>
      <h3 class="sb-h3 u-mt16">Historique</h3>${mv.length?`<ul class="plist">${mv.map(m=>`<li><span><span class="chip ${(SK_MV[m.type]||['off'])[0]}">${esc((SK_MV[m.type]||['',m.type])[1])}</span> <span class="muted sm">${esc([m.eleve?(byId(S.data.eleves,m.eleve)||{}).nom:'',m.classe?gName(m.classe):'',m.seance&&m.seance.titre,m.note].filter(Boolean).join(' · '))}</span></span><span class="muted sm">${esc(shortDate(parse(m.date||String(m.le).slice(0,10))))}${m.par?' · '+esc(m.par):''}</span></li>`).join('')}</ul>`:'<p class="help">Aucun mouvement.</p>'}
      ${adm?`<div class="row u-mt16">${d.del?`<span class="help">Supprimer définitivement cet article ? Son historique reste dans les mouvements.</span><button class="btn sm danger" type="button" id="stk-del-go" data-act="stk-del"${dis()}>Supprimer</button><button class="btn sm ghost" type="button" data-act="stk-del-ask" data-v="">Annuler</button>`:'<button class="btn sm ghost" type="button" id="stk-del" data-act="stk-del-ask" data-v="1">Supprimer l’article</button>'}</div>`:''}</div>`;
}
function skForm(d,a){
  const isNew=d.mode==='new', mo=isNew&&d.modele?byId(skModeles(),d.modele):null, k=skCfg();
  const x=a||(mo?{cat:mo.cat,suivi:mo.suivi||'unite',nom:mo.nom,sous:mo.sous,prix:mo.prix,inspFreq:mo.inspFreq,vie:mo.vie,fourn:mo.fourn,unite:mo.unite,statut:'service',modele:mo.id,empl:d.empl||''}:{cat:d.cat||'epi',suivi:d.cat==='conso'?'qte':'unite',statut:'service',empl:d.empl||''});
  const f=(id,l,v,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(v==null?'':v)}" ${att||''}></label>`, sous=[...new Set(skArts().map(y=>y.sous).filter(Boolean))].sort(collator.compare);
  return dTop(isNew?'Nouvel article':'Modifier',isNew?(mo?esc(mo.nom):'Ajouter au stock'):esc(x.nom))
    +`<form class="dr-body" data-form="stk-save" data-suivi="${x.suivi==='qte'?'qte':'unite'}" data-cat="${esc(x.cat)}" data-mod="${esc(x.modele||'')}" novalidate>
      <div class="grid2"><label class="field"><span>Catégorie</span><select id="sa-cat">${SK_CATS.map(([c,l])=>`<option value="${c}"${x.cat===c?' selected':''}>${l}</option>`).join('')}</select></label>
        <label class="field"><span>Suivi</span><select id="sa-suivi"><option value="unite"${x.suivi!=='qte'?' selected':''}>À l’unité (n° de série)</option><option value="qte"${x.suivi==='qte'?' selected':''}>En quantité</option></select></label></div>
      ${f('sa-nom','Nom de l’article',x.nom,'maxlength="80" autocomplete="off" placeholder="Ex. Casque de pompier"')}
      <div class="grid2">${f('sa-sous','Sous-catégorie (facultatif)',x.sous,'maxlength="40" autocomplete="off" list="sa-souss"')}${f('sa-code','Code interne',x.code,'maxlength="30" autocomplete="off" placeholder="Ex. CAS-014"')}</div>
      <datalist id="sa-souss">${sous.map(y=>`<option value="${esc(y)}">`).join('')}</datalist>
      <div class="grid2"><label class="field"><span>Emplacement</span><input id="sa-empl" list="sa-empls" maxlength="60" autocomplete="off" value="${esc(x.empl||'')}"><datalist id="sa-empls">${skLieux().map(e=>`<option value="${esc(e.nom)}">`).join('')}</datalist></label>${f('sa-fourn','Fournisseur (facultatif)',x.fourn,'maxlength="60" autocomplete="off" list="sm-fourns"')}</div>
      <datalist id="sm-fourns">${(S.data.stockFourn||[]).map(v=>`<option value="${esc(v.nom)}">`).join('')}</datalist>
      <div class="sa-u"><div class="grid2">${f('sa-serie','Numéro de série',x.serie,'maxlength="40" autocomplete="off"')}${f('sa-taille','Taille (facultatif)',x.taille,'maxlength="12" autocomplete="off"')}</div>
        <div class="grid2"><label class="field"><span>État</span><select id="sa-statut">${Object.entries(SK_ST).map(([s2,[,l]])=>`<option value="${s2}"${(x.statut||'service')===s2?' selected':''}>${l}</option>`).join('')}</select></label>${f('sa-fab','Date de fabrication',x.fab,'type="date"')}</div>
        <div class="grid2">${f('sa-insp','Dernière inspection',x.inspDer,'type="date"')}${f('sa-freq','Inspection tous les (mois)',x.inspFreq||'','type="number" min="0" max="120" step="1" inputmode="numeric" placeholder="Selon la catégorie"')}</div>
        <div class="grid2">${f('sa-vie','Durée de vie (ans)',x.vie||'','type="number" min="0" max="50" step="1" inputmode="numeric" placeholder="Selon la catégorie"')}${f('sa-gar','Garantie jusqu’au (facultatif)',x.garantie,'type="date"')}</div>
        <div class="sa-ari">${f('sa-ep','Dernière épreuve hydraulique (bouteilles)',x.epDer,'type="date"')}</div>
        <label class="ps-chk"><input type="checkbox" id="sa-resa"${x.resa?' checked':''}><span><b>Réservable pour les séances</b><small>Camion, lot d’ARI… : il s’ajoute aux locaux et équipements qu’une séance peut demander.</small></span></label>
        ${isNew?f('sa-nb','Nombre d’exemplaires (le code est numéroté : -01, -02…)',1,'type="number" min="1" max="60" step="1" inputmode="numeric"'):''}</div>
      <div class="sa-q"><div class="grid2">${f('sa-qte','Quantité',x.qte==null?'':x.qte,'type="number" min="0" step="1" inputmode="numeric"')}${f('sa-unite','Unité',x.unite,'maxlength="20" autocomplete="off" placeholder="Ex. bidons, boîtes"')}</div>
        <div class="grid2">${f('sa-min','Seuil d’alerte',x.min==null?'':x.min,'type="number" min="0" step="1" inputmode="numeric"')}${f('sa-lot','Numéro de lot',x.lot,'maxlength="40" autocomplete="off"')}</div>
        ${f('sa-exp','Péremption du lot (facultatif)',x.exp,'type="date"')}</div>
      ${f('sa-prix','Coût unitaire (facultatif, $)',x.prix?moneyIn(x.prix):'','inputmode="decimal" autocomplete="off" placeholder="0,00"')}
      <label class="field"><span>Note</span><textarea id="sa-note" rows="2" maxlength="300">${esc(x.note||'')}</textarea></label>
      <div class="row"><button class="btn primary" type="submit"${dis()}>${isNew?'Ajouter':'Enregistrer'}</button><button class="btn ghost" type="button" data-act="${isNew?'close':'stk-view'}">Annuler</button></div></form>`;
}
/* Les séances autour d’aujourd’hui, pour une sortie ou une consommation */
function skSessOpts(sel){
  const L=sessionsBetween(iso(addDays(new Date(),-2)),iso(addDays(new Date(),7))).filter(s=>s.kind==='cours'&&!s.cancelled).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start);
  return `<option value="">Aucune séance</option>`+L.map(s=>`<option value="${esc(s.key+'|'+s.date)}"${sel===s.key?' selected':''}>${esc(`${dayLabel(parse(s.date))} · ${momentOf(s)} · ${gName(s.grp)} · ${(s.c.code?s.c.code+' ':'')+s.c.titre}`)}</option>`).join('');
}
function skActForm(d,a){
  const v=d.act, t=(SK_MV[v]||['',''])[1], f=(id,l,val,att)=>`<label class="field"><span>${l}</span><input id="${id}" value="${esc(val==null?'':val)}" ${att||''}></label>`;
  const note=`<label class="field"><span>Note (facultatif)</span><textarea id="sx-note" rows="2" maxlength="300"></textarea></label>`, ts=teachers();
  const instr=`<label class="field"><span>Instructeur responsable</span><select id="sx-instr"><option value="">—</option>${ts.map(x=>`<option value="${esc(x.id)}"${(S.role==='teacher'?S.teacher:'')===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select></label>`;
  const ctrl=`<label class="ps-chk"><input type="checkbox" id="sx-propre" checked><span><b>Nettoyé et décontaminé</b></span></label><label class="ps-chk"><input type="checkbox" id="sx-intact" checked><span><b>Intact</b><small>Sinon, l’article part en maintenance.</small></span></label>${a.cat==='epi'&&v==='retour'?'<label class="ps-chk"><input type="checkbox" id="sx-expo"><span><b>Exposé à la fumée ou au feu réel</b><small>Compté dans la fiche ; un nettoyage avancé est à prévoir.</small></span></label>':''}`;
  const el=a.attrib&&a.attrib.t==='eleve'?byId(S.data.eleves,a.attrib.id):null;
  let body='';
  if(v==='sortie') body=`<label class="field"><span>Séance</span><select id="sx-seance">${skSessOpts()}</select></label>${instr}${note}`;
  else if(v==='retour') body=ctrl+note;
  else if(v==='retourDot') body=`<label class="field"><span>L’article</span><select id="sx-etat"><option value="rendu">Rendu</option><option value="perdu">Perdu</option><option value="brise">Brisé</option></select></label>${ctrl}${el&&isAdmin()&&opt('compta')?`<label class="ps-chk"><input type="checkbox" id="sx-fact"><span><b>Facturer le remplacement à ${esc(el.nom)}</b><small>S’il est perdu ou brisé : le montant s’ajoute à son compte (Compta).</small></span></label>${f('sx-mt','Montant ($)',a.prix?moneyIn(a.prix):'','inputmode="decimal" autocomplete="off"')}`:''}${note}`;
  else if(v==='transfert') body=`<label class="field"><span>Nouvel emplacement</span><select id="sx-empl">${skLieux().map(l=>`<option value="${esc(l.nom)}"${l.nom===a.empl?' selected':''}>${esc(l.nom)}</option>`).join('')}</select></label>${note}`;
  else if(v==='remplissage') body=`${f('sx-date','Date',todayISO(),'type="date"')}${f('sx-pres','Pression après remplissage (psi)','','type="number" min="0" max="6000" inputmode="numeric" placeholder="4500"')}${note}`;
  else if(v==='nettoyage') body=`${f('sx-date','Date',todayISO(),'type="date"')}${note}`;
  else if(v==='dotation') return skDotDrawer({t:'eleve',one:a.id});
  else if(v==='bris') body=`<label class="field"><span>Conséquence</span><select id="sx-grav"><option value="maint">À réparer (maintenance)</option><option value="hs">Hors service</option></select></label><label class="field"><span>Ce qui est arrivé</span><textarea id="sx-note" rows="3" maxlength="300" placeholder="Ex. visière fissurée pendant la manœuvre"></textarea></label>`;
  else if(v==='insp'&&skPoints(a).length) body=`${f('sx-date','Date',todayISO(),'type="date"')}<fieldset><legend>Liste de contrôle</legend><div class="ps-list">${skPoints(a).map((p,i)=>`<label class="ps-chk"><input type="checkbox" data-pt="${i}" checked><span><b>${esc(p)}</b></span></label>`).join('')}</div></fieldset><label class="field"><span>Résultat</span><select id="sx-res"><option value="ok">Conforme (un point décoché : à réparer)</option><option value="maint">À réparer</option><option value="hs">À retirer du service</option></select></label>${note}`;
  else if(v==='insp'||v==='epreuve') body=`${f('sx-date','Date',todayISO(),'type="date"')}<label class="field"><span>Résultat</span><select id="sx-res"><option value="ok">Conforme</option><option value="maint">À réparer</option><option value="hs">À retirer du service</option></select></label>${note}`;
  else if(v==='conso') body=`${f('sx-qte',`Quantité utilisée (${esc(a.unite||'unités')})`,1,'type="number" min="1" step="1" inputmode="numeric"')}<label class="field"><span>Séance</span><select id="sx-seance">${skSessOpts()}</select></label>${note}`;
  else if(v==='reappro') body=`${f('sx-qte',`Quantité reçue (${esc(a.unite||'unités')})`,'','type="number" min="1" step="1" inputmode="numeric"')}${f('sx-cout','Coût total (facultatif, $)','','inputmode="decimal" autocomplete="off" placeholder="0,00"')}${f('sx-fourn','Fournisseur (facultatif)','','maxlength="60" autocomplete="off"')}${opt('compta')?'<p class="help">Avec un coût, la dépense s’inscrit dans la Compta.</p>':''}${note}`;
  else if(v==='ajust') body=`${f('sx-qte','Quantité comptée',+a.qte||0,'type="number" min="0" step="1" inputmode="numeric"')}${note}`;
  else body=note;
  return dTop(esc(a.nom),{maint:'Envoyer en maintenance',service:'Remettre en service',hs:'Retirer du service',retourDot:'Reprendre l’article',retour:'Retour de manœuvre',transfert:'Transférer',remplissage:'Remplissage de la bouteille',nettoyage:'Nettoyage avancé'}[v]||t)
    +`<form class="dr-body" data-form="stk-act" novalidate>${body}<div class="row u-mt12"><button class="btn primary" type="submit"${dis()}>Enregistrer</button><button class="btn ghost" type="button" data-act="stk-view">Annuler</button></div></form>`;
}
/* Attribuer : à un élève ou à la classe, un ou plusieurs articles libres */
function skDotDrawer(d){
  const A=skArts().filter(a=>!skQte(a)&&a.statut!=='hs'&&a.statut!=='maint'&&!(a.attrib&&a.attrib.id)&&!(a.sortie&&a.sortie.le)&&(!d.one||a.id===d.one));
  const one=d.one?byId(skArts(),d.one):null;
  const who=d.t==='classe'?`<p class="help">Pour ${esc(gName(d.id))} (lot commun de la classe).</p>`
    :d.id?`<p class="help">Pour ${esc((byId(S.data.eleves,d.id)||{}).nom||'')}.</p>`
    :`<label class="field"><span>Élève</span><select id="sx-el">${groups().map(g=>`<optgroup label="${esc(g.nom)}">${sortElsByClass(S.data.eleves.filter(e=>e.groupe===g.id)).map(e=>`<option value="${esc(e.id)}">${esc(e.nom)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
  const byC=SK_CATS.filter(c=>c[0]!=='conso').map(([c,l])=>{const xs=A.filter(a=>a.cat===c).sort((x,y)=>collator.compare(x.nom,y.nom)||collator.compare(x.code||'',y.code||''));return xs.length?`<fieldset><legend>${l}</legend><div class="pk-list">${xs.map(a=>`<label class="pk"><input type="checkbox" data-sk-dot="${esc(a.id)}"${one?' checked':''}><span>${esc(a.nom)}<small>${esc([a.code,a.taille?'taille '+a.taille:''].filter(Boolean).join(' · '))}</small></span></label>`).join('')}</div></fieldset>`:'';}).join('');
  return dTop('Dotation',one?esc(one.nom):'Attribuer du matériel')
    +`<form class="dr-body" data-form="stk-dot" data-t="${esc(d.t||'eleve')}" data-id="${esc(d.id||'')}" novalidate>${who}${byC||'<p class="help">Aucun article libre : tout est attribué, sorti, en maintenance ou hors service.</p>'}
      <div class="row u-mt12"><button class="btn primary" type="submit"${byC?dis():' disabled'}>Attribuer</button><button class="btn ghost" type="button" data-act="${one?'stk-view':'close'}">Annuler</button></div></form>`;
}
/* ---------- Enregistrement ---------- */
const skId=()=>'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const skMv=(a,type,x)=>Object.assign({le:new Date().toISOString(),date:todayISO(),type,art:a.id,nom:skName(a),cat:a.cat,par:whoAmI()},x||{});
/* Change un article et inscrit le mouvement */
async function skApply(a,ch,mv,msg){
  S.busy=true;renderDrawer();
  const ok=await write(async()=>{if(ch)await col('stock').doc(a.id).update(Object.assign(ch,{maj:new Date().toISOString()}));if(mv)await col('stock-mvt').doc(skId()).set(mv);},msg);
  S.busy=false;render();return ok;
}
async function skSave(f){
  const q=id=>f.querySelector('#'+id), v=id=>q(id)?String(q(id).value).trim():'', d=S.dr, isNew=d.mode==='new';
  const suivi=v('sa-suivi')==='qte'?'qte':'unite', nom=v('sa-nom');
  if(!nom){toast('Donnez un nom à l’article.','bad');return;}
  const pr=v('sa-prix')?money(v('sa-prix')):null;if(v('sa-prix')&&pr==null){toast('Le coût n’est pas un montant valide.','bad');return;}
  const x={nom,cat:v('sa-cat'),suivi,code:v('sa-code'),empl:v('sa-empl'),prix:pr||null,note:v('sa-note'),sous:v('sa-sous'),fourn:v('sa-fourn')};
  if(f.dataset.mod) x.modele=f.dataset.mod;
  if(suivi==='qte') Object.assign(x,{qte:Math.max(0,Math.round(+v('sa-qte')||0)),min:Math.max(0,Math.round(+v('sa-min')||0)),unite:v('sa-unite'),lot:v('sa-lot'),exp:v('sa-exp')});
  else Object.assign(x,{serie:v('sa-serie'),taille:v('sa-taille'),statut:v('sa-statut')||'service',fab:v('sa-fab'),inspDer:v('sa-insp'),inspFreq:v('sa-freq')?Math.max(0,Math.round(+v('sa-freq'))):null,epDer:x.cat==='ari'?v('sa-ep'):'',resa:q('sa-resa').checked,vie:v('sa-vie')?Math.max(0,Math.round(+v('sa-vie'))):null,garantie:v('sa-gar')});
  const now=new Date().toISOString();
  if(isNew){
    const nb=suivi==='qte'?1:Math.max(1,Math.min(60,Math.round(+v('sa-nb')||1))), fns=[];
    for(let i=1;i<=nb;i++){
      const id='s'+Date.now().toString(36)+i+Math.random().toString(36).slice(2,5), y=Object.assign({},x,{cree:now,maj:now});
      if(nb>1&&y.code) y.code=y.code+'-'+pad(i);
      fns.push(async()=>{await col('stock').doc(id).set(y);await col('stock-mvt').doc(skId()).set(skMv(Object.assign({id},y),'entree',{qte:suivi==='qte'?y.qte:1}));});
    }
    if(await runAll(fns,nb>1?`${nb} articles ajoutés`:'Article ajouté')) closeDrawer(true);
    return;
  }
  const a=byId(skArts(),d.id);if(!a) return;
  if(await skApply(a,x,null,'Article enregistré')){S.dr.mode='view';renderDrawer();}
}
async function skAct(f){
  const d=S.dr, a=byId(skArts(),d.id);if(!a) return;
  const q=id=>f.querySelector('#'+id), v=id=>q(id)?String(q(id).value).trim():'', act=d.act, note=v('sx-note');
  const seance=()=>{const s=v('sx-seance');if(!s)return null;const [key,date]=s.split('|'), x=findSess(date,key);return x?{key,date,titre:`${x.c.code?x.c.code+' ':''}${x.c.titre} · ${gName(x.grp)}`}:null;};
  let ch=null, mv=null, msg='';
  if(act==='sortie'){const se=seance();ch={sortie:{le:new Date().toISOString(),instr:v('sx-instr'),seance:se}};mv=skMv(a,'sortie',{seance:se,instr:v('sx-instr'),note});msg='Sortie inscrite';}
  else if(act==='retourDot'&&v('sx-etat')&&v('sx-etat')!=='rendu'){
    const lost=v('sx-etat')==='perdu', el=a.attrib&&a.attrib.t==='eleve'?a.attrib.id:'';
    ch={attrib:null,aId:'',statut:lost?'manquant':'maint'};mv=skMv(a,lost?'perte':'bris',{eleve:el,classe:a.attrib&&a.attrib.t==='classe'?a.attrib.id:(byId(S.data.eleves,el)||{}).groupe||'',note:[lost?'perdu par l’élève':'brisé par l’élève',note].filter(Boolean).join(' · ')});msg=lost?'Perte inscrite':'Bris inscrit';
    if(el&&q('sx-fact')&&q('sx-fact').checked){const mt=money(v('sx-mt'));if(!mt){toast('Indiquez le montant à facturer.','bad');return;}
      if(await skApply(a,ch,mv,msg)){await write(()=>opt('compta').addEntry({date:todayISO(),type:'chg',poste:'frais',ht:mt,ttc:mt,eleve:el,libelle:`Remplacement · ${a.nom}`,note:lost?'perdu':'brisé'}),'Remplacement ajouté au compte de l’élève');S.dr.mode='view';renderDrawer();}return;}
  }
  else if(act==='retour'||act==='retourDot'){
    const ok=q('sx-intact').checked, ctl=[q('sx-propre').checked?'nettoyé':'non nettoyé',ok?'intact':'endommagé',q('sx-expo')&&q('sx-expo').checked?'exposé au feu':''].filter(Boolean).join(', ');
    ch=act==='retour'?{sortie:null}:{attrib:null,aId:''};if(!ok) ch.statut='maint';if(q('sx-expo')&&q('sx-expo').checked) ch.expos=(+a.expos||0)+1;
    mv=skMv(a,act,{note:[ctl,note].filter(Boolean).join(' · '),eleve:act==='retourDot'&&a.attrib&&a.attrib.t==='eleve'?a.attrib.id:'',classe:act==='retourDot'&&a.attrib&&a.attrib.t==='classe'?a.attrib.id:'',seance:act==='retour'&&a.sortie?a.sortie.seance||null:null});
    msg=ok?(act==='retour'?'Retour inscrit':'Article repris'):'Retour inscrit ; l’article part en maintenance';
  }
  else if(act==='bris'){if(!note){toast('Décrivez ce qui est arrivé.','bad');return;}ch={statut:v('sx-grav')};mv=skMv(a,'bris',{note});msg='Bris déclaré';}
  else if(act==='insp'&&f.querySelector('[data-pt]')){const dt=v('sx-date')||todayISO(), P=skPoints(a), pts={};f.querySelectorAll('[data-pt]').forEach(x=>{pts[P[+x.dataset.pt]]=x.checked;});let r=v('sx-res');const ko=Object.entries(pts).filter(([,y])=>!y).map(([y])=>y);if(ko.length&&r==='ok')r='maint';
    ch={inspDer:dt};if(r!=='ok')ch.statut=r;mv=skMv(a,'insp',{date:dt,points:pts,note:[r==='ok'?'conforme':r==='maint'?'à réparer':'à retirer',ko.length?'non conforme : '+ko.join(', '):'',note].filter(Boolean).join(' · ')});msg=r==='ok'?'Inspection inscrite : conforme':'Inspection inscrite : non conforme';}
  else if(act==='transfert'){const e=v('sx-empl');if(!e||e===a.empl){toast('Choisissez un autre emplacement.','bad');return;}ch={empl:e};mv=skMv(a,'transfert',{note:[`${a.empl||'—'} → ${e}`,note].filter(Boolean).join(' · ')});msg='Transfert inscrit';}
  else if(act==='remplissage'){const pr=Math.round(+v('sx-pres'))||null;ch={remplissages:(+a.remplissages||0)+1,pression:pr};mv=skMv(a,'remplissage',{date:v('sx-date')||todayISO(),note:[pr?pr+' psi':'',note].filter(Boolean).join(' · ')});msg='Remplissage inscrit';}
  else if(act==='nettoyage'){ch={nettoyages:(+a.nettoyages||0)+1};mv=skMv(a,'nettoyage',{date:v('sx-date')||todayISO(),note});msg='Nettoyage inscrit';}
  else if(act==='insp'||act==='epreuve'){const dt=v('sx-date')||todayISO(), r=v('sx-res');ch=act==='insp'?{inspDer:dt}:{epDer:dt};if(r!=='ok')ch.statut=r;mv=skMv(a,act,{date:dt,note:[r==='ok'?'conforme':r==='maint'?'à réparer':'à retirer',note].filter(Boolean).join(' · ')});msg=act==='insp'?'Inspection inscrite':'Épreuve inscrite';}
  else if(act==='maint'||act==='service'||act==='hs'){ch={statut:act==='service'?'service':act};if(act==='hs')ch.sortie=null;mv=skMv(a,act,{note});msg=act==='maint'?'Article en maintenance':act==='service'?'Article remis en service':'Article retiré du service';}
  else if(act==='conso'){const n=Math.round(+v('sx-qte'));if(!(n>0)){toast('Indiquez la quantité utilisée.','bad');return;}if(n>(+a.qte||0)){toast(`Il n’en reste que ${+a.qte||0}.`,'bad');return;}const se=seance();ch={qte:(+a.qte||0)-n};mv=skMv(a,'conso',{qte:n,seance:se,note});msg='Consommation inscrite';}
  else if(act==='reappro'){const n=Math.round(+v('sx-qte'));if(!(n>0)){toast('Indiquez la quantité reçue.','bad');return;}const ct=v('sx-cout')?money(v('sx-cout')):null;if(v('sx-cout')&&ct==null){toast('Le coût n’est pas un montant valide.','bad');return;}
    ch={qte:(+a.qte||0)+n};mv=skMv(a,'reappro',{qte:n,note:[v('sx-fourn'),ct?fmtM(ct):'',note].filter(Boolean).join(' · ')});msg='Réapprovisionnement inscrit';
    if(ct&&S.role==='admin'){const ok=await skApply(a,ch,mv,msg);if(ok){await skExpense({date:todayISO(),poste:a.cat==='conso'?'conso':'materiel',libelle:`${a.nom} (${n} ${a.unite||''})`.replace(/\s+\)/,')'),tiers:v('sx-fourn'),ht:ct,source:'stock'});S.dr.mode='view';renderDrawer();}return;}}
  else if(act==='ajust'){const n=Math.round(+v('sx-qte'));if(!(n>=0)){toast('Indiquez la quantité comptée.','bad');return;}ch={qte:n};mv=skMv(a,'ajust',{qte:n-(+a.qte||0),note:[`compté : ${n}`,note].filter(Boolean).join(' · ')});msg='Quantité ajustée';}
  if(await skApply(a,ch,mv,msg)){S.dr.mode='view';renderDrawer();}
}
async function skDot(f){
  const t=f.dataset.t||'eleve', id=f.dataset.id||(f.querySelector('#sx-el')||{}).value||'', ids=[...f.querySelectorAll('[data-sk-dot]:checked')].map(x=>x.dataset.skDot);
  if(!id){toast('Choisissez un élève.','bad');return;}
  if(!ids.length){toast('Cochez au moins un article.','bad');return;}
  const le=new Date().toISOString(), fns=ids.map(aid=>{const a=byId(skArts(),aid);return async()=>{await col('stock').doc(aid).update({attrib:{t,id,le},aId:id,maj:le});await col('stock-mvt').doc(skId()).set(skMv(a,'dotation',t==='classe'?{classe:id}:{eleve:id,classe:(byId(S.data.eleves,id)||{}).groupe||''}));};});
  if(await runAll(fns,ids.length>1?`${ids.length} articles attribués`:'Article attribué')) closeDrawer(true);
}
/* Fin de cohorte : tout ce qui est attribué aux élèves de la classe et à la classe revient au stock */
async function skBack(g){
  const els=new Set(S.data.eleves.filter(e=>e.groupe===g).map(e=>e.id)), A=skArts().filter(a=>a.attrib&&((a.attrib.t==='classe'&&a.attrib.id===g)||(a.attrib.t==='eleve'&&els.has(a.attrib.id))));
  S.pg.sback='';
  await runAll(A.map(a=>async()=>{await col('stock').doc(a.id).update({attrib:null,aId:'',maj:new Date().toISOString()});await col('stock-mvt').doc(skId()).set(skMv(a,'retourDot',a.attrib.t==='classe'?{classe:g,note:'fin de cohorte'}:{eleve:a.attrib.id,classe:g,note:'fin de cohorte'}));}),`${pl(A.length,'article repris','articles repris')}`);
}
/* Feuille de dotation d’un élève, à signer */
async function skDotPrint(eid){
  const e=byId(S.data.eleves,eid)||(eid===S.student?subject().rec:null);if(!e) return;
  const A=(S.canAdmin!==false?skArts():S.data.mesStk||[]).filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===eid);
  const body=`<section class="pr-page">${prHead('Feuille de dotation',esc(e.nom)+' · '+esc(gName(e.groupe)))}<table class="pr-t"><thead><tr><th>Article</th><th>Code</th><th>N° de série</th><th>Taille</th><th>Reçu le</th><th>Rendu le</th></tr></thead><tbody>${A.map(a=>`<tr><td>${esc(a.nom)}</td><td>${esc(a.code||'')}</td><td>${esc(a.serie||'')}</td><td>${esc(a.taille||'')}</td><td>${a.attrib.le?esc(shortDate(new Date(a.attrib.le))):''}</td><td></td></tr>`).join('')}</tbody></table>
    <p class="pr-note">Je reconnais avoir reçu le matériel ci-dessus en bon état. Je m’engage à en prendre soin et à le rendre à la fin de ma formation.</p>
    <div class="pr-sign2"><p>Signature de l’élève</p><p>Signature du responsable</p></div>${prFoot()}</section>`;
  await printDoc('Feuille de dotation · '+e.nom,body,false,'dotation-'+prSlug(e.nom));
}
async function skMvtExport(){
  const M=S.data.stockMvt||[];
  await saveFile(`pompiernote-mouvements-stock-${todayISO()}.csv`,new Blob([csvText([['Date','Mouvement','Article','Catégorie','Quantité','Élève','Classe','Séance','Instructeur','Par','Note']].concat(M.map(m=>[m.date||String(m.le).slice(0,10),(SK_MV[m.type]||['',m.type])[1],m.nom,skCat(m.cat)[1],m.qte||'',m.eleve?(byId(S.data.eleves,m.eleve)||{}).nom:'',m.classe?gName(m.classe):'',m.seance&&m.seance.titre||'',m.instr?tName(m.instr):'',m.par||'',m.note||''])))],{type:'text/csv'}));
}
/* Fiche élève : l’onglet Équipement */
function skStudentTab(e){
  const A=skArts().filter(a=>a.attrib&&a.attrib.t==='eleve'&&a.attrib.id===e.id), cls=skArts().filter(a=>a.attrib&&a.attrib.t==='classe'&&a.attrib.id===e.groupe), can=isAdmin()&&S.conn==='shared';
  const li=a=>{const c=skConf(a);return `<li><span><button class="link" type="button" data-act="stk-open" data-id="${esc(a.id)}">${esc(a.nom)}</button><span class="muted sm"> · ${esc([a.code,a.taille?'taille '+a.taille:'',a.attrib.le?'reçu le '+shortDate(new Date(a.attrib.le)):''].filter(Boolean).join(' · '))}</span></span><span class="chip ${c[0]}">${esc(c[1])}</span></li>`;};
  return `<div class="fiche-two"><section class="panel" id="fi-equip"><h2>Équipement attribué</h2>${A.length?`<ul class="plist">${A.map(li).join('')}</ul>`:'<p class="help">Rien d’attribué à cet élève.</p>'}
      <div class="row u-mt10">${can?`<button class="btn sm" type="button" data-act="stk-dot" data-t="eleve" data-id="${esc(e.id)}">${icon('plus')}Attribuer</button>`:''}${A.length?`<button class="btn sm ghost" type="button" data-act="stk-dot-pr" data-id="${esc(e.id)}">${icon('print')}Feuille de dotation</button>`:''}</div></section>
    <section class="panel"><h2>Lot de la classe</h2>${cls.length?`<ul class="plist">${cls.map(li).join('')}</ul>`:'<p class="help">Aucun lot commun pour sa classe.</p>'}</section></div>`;
}
/* Pour les séances : le matériel réservable s’ajoute aux locaux et équipements */
const skResa=()=>skArts().filter(a=>a.resa&&!skQte(a)).map(a=>({id:'stk:'+a.id,nom:skName(a),type:'equip',stk:a}));
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
