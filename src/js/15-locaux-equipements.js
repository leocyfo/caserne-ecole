/* ---------- Locaux et équipements (salles, camions, tour, bassin…) ----------
   Le catalogue est dans config/ecole.ressources : { id, nom, type } — type : local | equip.
   Chaque cours d’un module peut en demander (cours[].ress), pour toutes les classes ; une séance peut avoir les siens (x.ress).
   Deux séances au même moment avec le même local ou équipement sont en conflit, sauf si c’est le même module
   (les classes sont alors réunies), comme pour les enseignants. */
const RES_T={local:'Local',equip:'Équipement'};
const ressAll=()=>(cfg().ressources||[]).slice().sort((a,b)=>(a.type===b.type?0:a.type==='local'?-1:1)||collator.compare(a.nom||'',b.nom||''));
const ressName=id=>{const r=(cfg().ressources||[]).find(x=>x.id===id);return r?r.nom:'';};
const ressNames=ids=>ids.map(ressName).filter(Boolean).join(', ');
function ressOf(s){
  if(!s||s.kind!=='cours'||!(cfg().ressources||[]).length) return [];
  const x=s.extra||{};
  if(Array.isArray(x.ress)) return x.ress.filter(ressName);
  const out=[];for(const c of xCours(modOf(s.c),x)) for(const id of c.ress||[]) if(ressName(id)&&!out.includes(id)) out.push(id);
  return out;
}
function ressClash(s){
  const mine=ressOf(s);if(!mine.length||s.cancelled) return [];
  const out=[];
  for(const o of sessionsOn(s.date)){
    if(o.key===s.key||o.cancelled||o.kind!=='cours'||!(o.start<s.end&&s.start<o.end)||sameMod(o.c,s.c)) continue;
    const theirs=ressOf(o);for(const id of mine) if(theirs.includes(id)) out.push({id,o});
  }
  return out;
}
const ressClashLbl=cl=>{const types=new Set(cl.map(x=>((cfg().ressources||[]).find(r=>r.id===x.id)||{}).type));return types.size===1&&types.has('local')?'Conflit de local':types.size===1?'Conflit d’équipement':'Conflit de local et d’équipement';};
/* Cases à cocher des locaux et équipements (dans la fenêtre d’une séance, ou pour un cours du module) */
const ressPicks=(ids,attrs)=>ressAll().map(r=>`<label class="pk"><input type="checkbox" value="${esc(r.id)}" ${attrs}${ids.includes(r.id)?' checked':''}${dis()}><span>${esc(r.nom)}<small>${RES_T[r.type]||''}</small></span></label>`).join('');
/* Dans la fenêtre d’une séance : ce qu’elle utilise, les conflits, et la modification pour cette séance seulement */
function ressBoxHTML(s){
  const all=ressAll(), ids=ressOf(s);
  if(!all.length) return '';
  const cl=isPast(s)?[]:ressClash(s), can=isAdmin()&&S.conn==='shared'&&!!s.extra, own=Array.isArray((s.extra||{}).ress), ed=!!(S.dr&&S.dr.ressEd)&&can;
  const li=ids.map(id=>{const c=cl.filter(x=>x.id===id);return `<li><span class="chip ${c.length?'bad':'off'}">${esc(ressName(id))}</span>${c.length?`<span class="bad-t">aussi pour ${esc(c.map(x=>gName(x.o.grp)+(x.o.c.code?' ('+x.o.c.code+')':'')).join(', '))} à ce moment</span>`:''}</li>`;}).join('');
  return `<section class="af-box" id="rs-box"><div class="af-box-h"><h3 class="sb-h3">Locaux et équipements${cl.length?' <span class="chip bad" id="rs-clash">Conflit</span>':''}</h3>${can?`<button class="btn sm ghost" type="button" id="rs-edit" data-act="rs-edit">${ed?'Terminer':'Modifier'}</button>`:''}</div>
    ${ids.length?`<ul class="rs-list">${li}</ul>`:'<p class="help" id="rs-none">Aucun pour cette séance.</p>'}
    ${ed?`<div class="pk-list" id="rs-picks" style="margin-top:10px">${ressPicks(ids,`data-rs="1" ${sAt(s)}`)}</div>${own&&linkedX(s)?`<div class="row" style="margin-top:8px"><button class="btn sm ghost" type="button" id="rs-reset" data-act="rs-reset" ${sAt(s)}${dis()}>Revenir à ceux du cours du module</button></div>`:''}`
      :!own&&ids.length&&linkedX(s)?'<p class="help" style="margin-top:6px">Selon le cours du module.</p>':own&&linkedX(s)?'<p class="help" style="margin-top:6px">Choisis pour cette séance seulement.</p>':''}</section>`;
}
/* Enregistre les locaux et équipements d’une séance (null : revenir à ceux du cours du module) */
async function saveSessRess(s,ids){
  const c=byId(S.data.cours,s.c.id);if(!c||!s.extra||S.busy) return false;
  const doc=courseDoc(c), x=doc.extras.find(e=>e.id===s.extra.id);if(!x) return false;
  if(ids) x.ress=ids; else delete x.ress;
  S.busy=true;renderDrawer();
  const ok=await write(()=>putCours(c.id,doc),ids?'Locaux et équipements enregistrés':'Locaux et équipements du module repris');
  S.busy=false;render();
  return ok;
}
/* Paramètres : la liste des locaux et des équipements de l’école */
function ressPanel(){
  const all=ressAll(), can=isAdmin()&&S.conn==='shared';
  const used=id=>comps().some(k=>(k.cours||[]).some(c=>(c.ress||[]).includes(id)));
  return `<section class="dr-sec" id="p-ress"><h2 class="sec-title">Locaux et équipements</h2>
    <p class="help">Les salles, camions, tours ou bassins que les séances se partagent. On les relie aux cours dans le menu Modules ; deux séances qui veulent le même au même moment sont signalées.</p>
    ${all.length?`<ul class="plist" id="p-ress-list" style="margin-top:8px">${all.map(r=>`<li><span><b>${esc(r.nom)}</b> <span class="muted sm">${RES_T[r.type]||''}${used(r.id)?' · relié à des cours':''}</span></span>${can?`<button type="button" class="x" data-act="p-del-res" data-id="${esc(r.id)}" aria-label="${esc('Retirer '+r.nom)}" title="Retirer"${dis()}>×</button>`:''}</li>`).join('')}</ul>`:''}
    ${can?`<form class="inline-add" data-form="p-add-res" style="margin-top:10px"><label class="field" style="flex:2 1 200px"><span>Nom</span><input id="p-rnom" maxlength="50" autocomplete="off" placeholder="Ex. Tour d’entraînement"></label><label class="field" style="flex:0 1 160px"><span>Type</span><select id="p-rtype"><option value="equip">Équipement</option><option value="local">Local</option></select></label><button class="btn" type="submit"${dis()}>Ajouter</button></form>`:''}</section>`;
}

