/* ---------- Journées de reprise ----------
   Une journée de reprise est une séance « Reprise » à l’horaire d’une classe. On la crée d’abord, puis on y ajoute des
   modules (x.modules). Chaque élève qui a échoué ou manqué un examen d’un de ces modules le reprend ce jour-là :
   une reprise par examen échoué. Réussie : le résultat devient « réussi en reprise ». Ratée : « échec du module ».
   La liste des reprises se déduit des résultats ; resultats/<examen>.reprises = { élève : { date, v, de, pct } }
   garde la date et l’issue de chaque reprise (de : le premier résultat, pour pouvoir annuler). */
const resFail=v=>v==='echecf';
function repSessions(){
  const out=[];
  for(const c of S.data.cours) for(const x of datedOf(c)){
    const tg=x.tags||[];if(!tg.includes('Reprise')||tg.includes('Examen')) continue;
    if((c.annulees||[]).includes(`${x.date}@${x.id}`)||offDay(x.date)) continue;
    const own=modKey(c), mods=[...new Set((own!=null?[own]:[]).concat((x.modules||[]).map(Number).filter(n=>n>0)))].sort((a,b)=>a-b);
    out.push({c,x,own,date:x.date,grp:c.groupe,mods,key:`${c.id}_${x.id}_${x.date}`});
  }
  return out.sort((a,b)=>a.date.localeCompare(b.date)||collator.compare(gName(a.grp),gName(b.grp)));
}
/* La journée où se reprend un examen échoué : la première journée de reprise de la classe, après l’examen et pas encore passée, qui a son module */
function repDayFor(x,RS){
  const mk=x.c?modKey(x.c):null, t=todayISO();
  return mk==null?null:(RS||repSessions()).find(r=>r.grp===x.grp&&r.date>=t&&r.date>x.date&&r.mods.includes(mk))||null;
}
const modLbl=code=>{const k=comps().find(m=>+m.code===+code);return k?`M${k.code} ${k.nom}`:'M'+code;};
/* Modules échoués par un élève : une reprise ratée suffit */
function failedModules(e,items){
  const out=new Map();
  for(const x of items) if(resFail(x.res[e.id])&&x.c) out.set(modKey(x.c)!=null?'M'+modKey(x.c):x.c.id,(x.c.code?x.c.code+' ':'')+x.c.titre);
  return [...out.values()];
}
/* Ce qu’un élève doit reprendre, avec la date de chaque reprise quand elle est fixée */
function repNotice(e,items,RS){
  const pend=items.filter(x=>x.past&&!x.rep&&resKo(x.res[e.id])), fail=failedModules(e,items);
  const one=x=>{const d=repDayFor(x,RS);return `${esc((x.c&&x.c.code?x.c.code+' ':'')+(x.c?x.c.titre:'Examen'))}${x.e&&x.e.titre&&x.e.titre!=='Examen'?' ('+esc(x.e.titre)+')':''} : ${d?'reprise le '+esc(dayLabel(parse(d.date)).toLowerCase()):'date de reprise à venir'}`;};
  return (pend.length?`<div class="notice warn" id="rp-note"><p><b>${pl(pend.length,'reprise à faire','reprises à faire')}</b></p><ul>${pend.map(x=>`<li>${one(x)}</li>`).join('')}</ul></div>`:'')
    +(fail.length?`<div class="notice bad" id="rp-fail"><p><b>${fail.length>1?'Modules échoués':'Module échoué'}</b> : ${esc(fail.join(', '))}. La reprise n’a pas été réussie.</p></div>`:'');
}
/* Inscrit l’issue d’une reprise : réussie → « réussi en reprise » ; ratée → « échec du module » ; ok === null : on annule */
async function setRetake(key,el,ok,date,pct){
  const x=allExamItems().find(k=>k.key===key);if(!x||S.busy) return false;
  const cur=S.data.resultats[resKeyOf(x)]||{}, reps=Object.assign({},cur.reprises), res=Object.assign({},examResOf(x)), was=res[el], t=todayISO();
  if(ok===null){const r=reps[el];if(!r) return false;res[el]=r.de||'echec';delete reps[el];}
  else{
    if(!resKo(was)&&!reps[el]) return false;
    reps[el]=Object.assign({date:date||t,v:ok?'reussi':'echec',de:reps[el]?reps[el].de:was},pct!=null?{pct}:{});
    res[el]=ok?'reprise':'echecf';
  }
  S.busy=true;render();
  const done=await writeResults(x,res,ok===null?'Reprise annulée':ok?'Reprise réussie inscrite':'Échec du module inscrit',undefined,reps);
  S.busy=false;render();
  return done;
}
/* Ajoute ou retire un module d’une journée de reprise, pour toutes les classes qui ont cette journée */
async function repModules(date,code,add){
  const jobs=[];
  for(const r of repSessions().filter(r=>r.date===date)){
    if(r.own===+code) continue;
    const doc=courseDoc(r.c), x=doc.extras.find(e=>e.id===r.x.id);if(!x) continue;
    const set=new Set((x.modules||[]).map(Number));if(add)set.add(+code);else set.delete(+code);
    x.modules=[...set].sort((a,b)=>a-b);
    jobs.push(()=>putCours(r.c.id,doc));
  }
  if(!jobs.length) return false;
  const lbl=dayLabel(parse(date)).toLowerCase(), ok=await runAll(jobs,add?`M${code} ajouté à la reprise du ${lbl}`:`M${code} retiré de la reprise du ${lbl}`);
  if(ok) logEv('horaire',add?`a ajouté le module M${code} à la journée de reprise`:`a retiré le module M${code} de la journée de reprise`,lbl);
  return ok;
}
/* Onglet « Reprises » des examens : les journées de reprise, les reprises à faire, les échecs de module */
function repsTab(B,g){
  const st=S.pg, adm=isAdmin()&&S.conn==='shared', t=todayISO(), RS=repSessions().filter(r=>!g||r.grp===g), dm=new Map();
  for(const r of RS){const d=dm.get(r.date)||{date:r.date,items:[],mods:[],groups:[],own:[]};d.items.push(r);d.groups.push(r.grp);for(const k of r.mods)if(!d.mods.includes(k))d.mods.push(k);if(r.own!=null&&!d.own.includes(r.own))d.own.push(r.own);dm.set(r.date,d);}
  for(const d of dm.values()) d.mods.sort((a,b)=>a-b);
  const pend=B.reps.map(r=>Object.assign({day:repDayFor(r.x,RS)},r)), noDay=pend.filter(r=>!r.day), doneBy={}, fails=[];
  for(const x of B.items){
    for(const [el,r] of Object.entries((x.doc&&x.doc.reprises)||{})){const e=x.els.find(y=>y.id===el);if(e&&r&&r.date)(doneBy[r.date]||(doneBy[r.date]=[])).push({x,e,r});}
    for(const e of x.els) if(resFail(x.res[e.id])) fails.push({x,e});
  }
  const days=[...dm.values()].filter(d=>d.date>=t||doneBy[d.date]).sort((a,b)=>(a.date>=t?0:1)-(b.date>=t?0:1)||(a.date>=t?a.date.localeCompare(b.date):b.date.localeCompare(a.date)));
  const orphan=Object.keys(doneBy).filter(d=>!dm.has(d)).sort().reverse().reduce((a,d)=>a.concat(doneBy[d]),[]);
  const num=e=>e.numero!=null&&e.numero!==''?esc(e.numero):'—';
  const who=e=>`<div class="xm-who"><span class="st-num sm" aria-hidden="true">${num(e)}</span><span class="xm-t"><b>${esc(e.nom)}</b><small>${esc(gName(e.groupe))}</small></span></div>`;
  const what=(x,sub)=>`<div class="xm-t"><b>${xTitle(x)}</b><small>${esc([x.e&&x.e.titre&&x.e.titre!=='Examen'?x.e.titre:'',sub].filter(Boolean).join(' · '))}</small></div>`;
  const todoRow=(r,date)=>{const {x,e,v}=r, at=`data-key="${esc(x.key)}" data-el="${esc(e.id)}" data-date="${esc(date||'')}"`, p=x.pct[e.id];
    return `<article class="xm-row xm-cols xm-rp" id="rp-${esc(e.id)}-${esc(resKeyOf(x))}">${who(e)}${what(x,RES[v][1]+(p!=null?' · '+noteTxt(p):''))}
      <div class="xm-end rp-acts">${canEditItem(x)?`<input class="xr-n" type="number" min="0" max="100" step="1" inputmode="numeric" placeholder="%" aria-label="${esc('Note de reprise de '+e.nom+' en %')}" data-rpn="1" ${at}${dis()}><button class="btn sm yes" type="button" data-act="rp-set" data-v="ok" ${at}${dis()}>Réussi</button><button class="btn sm ghost" type="button" data-act="rp-set" data-v="ko" ${at}${dis()}>Échec</button>`:'<span class="chip bad">À reprendre</span>'}</div></article>`;};
  const doneRow=({x,e,r})=>{const ok=r.v==='reussi';
    return `<article class="xm-row xm-cols xm-rp is-done">${who(e)}${what(x,'Premier résultat : '+((RES[r.de]||RES.echec)[1]).toLowerCase())}
      <div class="xm-end rp-acts"><span class="chip ${ok?'info':'bad'}">${ok?'Réussi en reprise':'Échec du module'}${r.pct!=null?' · '+esc(noteTxt(r.pct)):''}</span>${canEditItem(x)?`<button class="btn sm ghost" type="button" data-act="rp-undo" data-key="${esc(x.key)}" data-el="${esc(e.id)}"${dis()}>Annuler</button>`:''}</div></article>`;};
  const dayBlock=d=>{
    const up=d.date>=t, mine=pend.filter(r=>r.day&&r.day.date===d.date), done=(doneBy[d.date]||[]).filter(r=>d.groups.includes(r.x.grp)), pm={};
    for(const r of B.reps) if(d.groups.includes(r.x.grp)&&r.x.c&&modKey(r.x.c)!=null&&r.x.date<d.date) pm[modKey(r.x.c)]=(pm[modKey(r.x.c)]||0)+1;
    const chips=d.mods.map(m=>`<span class="chip k${m%8} rd-mod">M${m}${adm&&up&&!d.own.includes(m)?`<button type="button" class="rd-x" data-act="rd-mod-del" data-date="${d.date}" data-m="${m}" aria-label="${esc('Retirer '+modLbl(m)+' de cette journée')}" title="Retirer ce module"${dis()}>×</button>`:''}</span>`).join('');
    const opts=comps().filter(k=>!d.mods.includes(+k.code)).sort((a,b)=>(pm[+b.code]?1:0)-(pm[+a.code]?1:0)||a.code-b.code);
    const add=adm&&up&&opts.length?`<select class="rd-add" id="rd-add-${d.date}" data-rd="add" data-date="${d.date}" aria-label="Ajouter un module à cette journée de reprise"${dis()}><option value="">Ajouter un module…</option>${opts.map(k=>`<option value="${esc(k.code)}">M${esc(k.code)} · ${esc(k.nom)}${pm[+k.code]?` (${pm[+k.code]} à reprendre)`:''}</option>`).join('')}</select>`:'';
    const cls=d.groups.map(id=>xNum(id)).join(', ');
    const state=mine.length?`<span class="chip bad">${pl(mine.length,'reprise à faire','reprises à faire')}</span>`:done.length?`<span class="chip off">${pl(done.length,'reprise faite','reprises faites')}</span>`:`<span class="chip off">${d.mods.length?'Aucune reprise':'Aucun module'}</span>`;
    return `<section class="cl-list xm-list rd-day${up?'':' is-past'}" id="rd-${d.date}"><div class="rd-hd">${xDate({date:d.date},'rep')}<div class="xm-t"><b>${esc(dayLabel(parse(d.date)))}${up?'':' · passée'}</b><small>${d.groups.length>1?'Classes':'Classe'} ${esc(cls)}</small></div><div class="rd-mods">${chips||'<span class="muted sm">Aucun module</span>'}${add}</div>${state}</div>
      ${(st.rdx===d.date?mine:mine.slice(0,8)).map(r=>todoRow(r,d.date)).join('')}${mine.length>8&&st.rdx!==d.date?`<div class="rd-more"><button class="btn sm" type="button" id="rd-more-${d.date}" data-act="pg-set" data-k="rdx" data-v="${d.date}">Afficher les ${mine.length-8} autres reprises</button></div>`:''}${done.map(doneRow).join('')}${!mine.length&&!done.length&&up?`<p class="rd-none">${d.mods.length?'Aucun élève n’a d’examen à reprendre dans ces modules.':adm?'Ajoutez les modules à reprendre ce jour-là : les élèves concernés apparaîtront ici.':'Les modules à reprendre n’ont pas encore été choisis.'}</p>`:''}</section>`;};
  const form=adm&&st.rnew?`<section class="panel md-add" id="rd-form"><h2>Créer une journée de reprise</h2><form class="stackf" data-form="rd-new">
      <div class="mx-row"><label class="field" style="flex:0 1 190px"><span>Date</span><input type="date" id="rd-date" required></label><label class="field" style="flex:0 1 200px"><span>Moment</span><select id="rd-per">${PERIODES.map(p=>`<option value="${p.k}"${p.k==='jour'?' selected':''}>${p.label}</option>`).join('')}</select></label></div>
      <fieldset class="pk-set"><legend>Classes</legend><div class="pk-list" id="rd-classes">${groups().map(x=>`<label class="pk"><input type="checkbox" name="rdg" value="${esc(x.id)}"${!g||g===x.id?' checked':''}${dis()}><span>${esc(x.nom)}</span></label>`).join('')}</div></fieldset>
      <div class="row"><button class="btn primary" type="submit"${dis()}>Créer la journée</button><button class="btn ghost" type="button" data-act="pg-set" data-k="rnew" data-v="">Annuler</button></div>
      <p class="help">La journée s’ajoute à l’horaire des classes choisies. On y ajoute ensuite les modules à reprendre.</p></form></section>`:'';
  const bar=`<div class="st-bar"><p class="summary" style="margin:0"><span class="${B.reps.length?'need':''}"><b>${B.reps.length}</b>${B.reps.length>1?'reprises à faire':'reprise à faire'}</span>${fails.length?`<span><b class="bad">${fails.length}</b>${fails.length>1?'échecs de module':'échec de module'}</span>`:''}</p><span class="grow"></span>${adm&&!st.rnew?`<button class="btn" type="button" id="rd-new-open" data-act="pg-set" data-k="rnew" data-v="1">${icon('plus')}Créer une journée de reprise</button>`:''}</div>`;
  return bar+form
    +`<h2 class="xm-h">Journées de reprise</h2>`+(days.length?days.map(dayBlock).join(''):`<section class="panel"><p class="help" id="rd-empty">Aucune journée de reprise à venir.${adm?' Créez-en une, puis ajoutez-y les modules à reprendre.':''}</p></section>`)
    +(noDay.length?`<h2 class="xm-h">Sans journée de reprise</h2><div class="cl-list xm-list" id="rd-noday">${noDay.map(r=>todoRow(r,'')).join('')}</div><p class="help" style="margin-top:8px">Ces examens seront repris quand leur module sera ajouté à une journée de reprise de la classe.</p>`:'')
    +(orphan.length?`<h2 class="xm-h">Reprises inscrites hors journée</h2><div class="cl-list xm-list" id="rd-orphan">${orphan.map(doneRow).join('')}</div>`:'')
    +(fails.length?`<h2 class="xm-h">Échecs de module</h2><div class="cl-list xm-list" id="rd-fails">${fails.map(({x,e})=>`<article class="xm-row xm-cols xm-rp">${who(e)}${what(x,'Reprise non réussie')}<div class="xm-end"><span class="chip bad">Échec du module</span></div></article>`).join('')}</div>`:'');
}

