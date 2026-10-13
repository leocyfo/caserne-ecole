/* ---------- Historique : qui a fait quoi, et quand ----------
   journal/<AAAA-MM> : un document par mois, où chaque action est une entrée de « ev » (la base ne grossit pas d’un
   document par clic ; au-delà de 600 entrées le mois continue dans AAAA-MM-2). Entrée : { le, par, role, cat, txt, obj,
   seance, date, groupe } — cat : horaire | aff | module. L’écriture ne bloque ni ne fait échouer l’action elle-même. */
const sObj=s=>`${s.c.code?s.c.code+' ':''}${s.c.titre} · ${gName(s.grp)}, ${dayLabel(parse(s.date)).toLowerCase()}`;
async function logEv(cat,txt,obj,s){
  if(!DB) return;
  try{
    const now=new Date(), ym=now.getFullYear()+'-'+pad(now.getMonth()+1);
    const cur=(S.data.journal||[]).filter(d=>d.id===ym||d.id.startsWith(ym+'-')).sort((a,b)=>collator.compare(a.id,b.id)).pop();
    const id=!cur?ym:Object.keys(cur.ev||{}).length>=600?ym+'-'+((+(cur.id.split('-')[2]||1))+1):cur.id;
    const ev={le:now.toISOString(),par:whoAmI(),role:S.role,cat,txt,obj:obj||''};
    if(s){ev.seance=s.key;ev.date=s.date;ev.groupe=s.grp||'';}
    const body={ev:{[now.getTime().toString(36)+Math.random().toString(36).slice(2,5)]:ev}}, ref=col('journal').doc(id);
    try{await ref.update(body);}
    catch(e){
      /* le document du mois n’existe pas encore : on le crée (jamais d’écrasement d’un mois existant) */
      if(!e||e.code!=='invalid_argument') return;
      const snap=await ref.get();if(!snap.exists) await ref.set(body);
    }
  }catch(e){}
}
function ensureJournal(){
  if(!DB||S.jrSub) return;S.jrSub=true;
  try{col('journal').onSnapshot(q=>{S.data.journal=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));S.jrLoaded=true;schedule();},()=>{S.jrLoaded=true;schedule();});}
  catch(e){S.jrLoaded=true;}
}
const JR_CAT={horaire:['info','Horaire'],aff:['warn','Affectations'],module:['k5','Modules']};
function historyPage(){
  ensureJournal();
  const st=S.pg, f=JR_CAT[st.jc]?st.jc:'', q=String(st.jq||'').trim().toLowerCase(), lim=+st.jl||60, all=[];
  for(const d of S.data.journal||[]) for(const [id,e] of Object.entries(d.ev||{})) if(e&&e.le&&JR_CAT[e.cat]) all.push(Object.assign({id},e));
  all.sort((a,b)=>b.le.localeCompare(a.le));
  const cnt={horaire:0,aff:0,module:0};for(const e of all) cnt[e.cat]++;
  const list=all.filter(e=>(!f||e.cat===f)&&(!q||`${e.par} ${e.txt} ${e.obj}`.toLowerCase().includes(q)));
  const seg=`<div class="seg" role="group" aria-label="Filtrer">${[['','Tout',all.length],['horaire','Horaire',cnt.horaire],['aff','Affectations',cnt.aff],['module','Modules',cnt.module]].map(([k,l,n])=>`<button type="button" id="jr-f-${k||'all'}" data-act="pg-set" data-k="jc" data-v="${k}" aria-pressed="${f===k}">${l} · ${n}</button>`).join('')}</div>`;
  const tb=`<div class="toolbar">${seg}<span class="grow"></span><input class="search" id="jr-q" type="search" placeholder="Rechercher une personne, un module…" aria-label="Rechercher dans l’historique" autocomplete="off" value="${esc(st.jq||'')}"></div>`;
  if(!S.jrLoaded) return tb+'<section class="panel"><p class="help">Chargement de l’historique…</p></section>';
  if(!all.length) return tb+emptyBox('Rien dans l’historique pour l’instant','Les séances annulées, déplacées, ajoutées ou supprimées, les candidatures et les attributions s’inscrivent ici, avec le nom de la personne et l’heure.');
  if(!list.length) return tb+'<section class="panel"><p class="help">Aucune action ne correspond.</p></section>';
  const rows=list.slice(0,lim).map(e=>{const d=new Date(e.le), s=e.seance&&e.date?findSess(e.date,e.seance):null;
    return xRow('xm-jr',s?`data-act="sess-at" ${sAt(s)}`:'',`<span class="jr-w"><b>${dn(d)} ${esc(fMonthS.format(d))}</b><small>${pad(d.getHours())} h ${pad(d.getMinutes())}</small></span><div class="xm-t"><b>${esc(e.par||'Quelqu’un')} ${esc(e.txt)}</b>${e.obj?`<small>${esc(e.obj)}</small>`:''}</div><div class="xm-end"><span class="chip ${JR_CAT[e.cat][0]}">${JR_CAT[e.cat][1]}</span></div>`,`${e.par} ${e.txt} ${e.obj}`);}).join('');
  return tb+xList('xm-jr',[['Quand'],['Action'],['','r']],rows)+(list.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" id="jr-more" data-act="pg-set" data-k="jl" data-v="${lim+60}">Afficher plus (${list.length-lim})</button></div>`:'');
}

