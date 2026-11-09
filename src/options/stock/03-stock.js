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
