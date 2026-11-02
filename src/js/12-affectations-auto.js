/* ---------- Proposer des enseignants ----------
   Pour une séance à combler : les enseignants qui ne sont pas déjà pris à ce moment ni en congé, qui ont le module dans leurs
   compétences ; d’abord ceux qui se sont dits disponibles et le chargé du module, puis ceux qui ont le moins d’heures
   prévues dans les 30 prochains jours (pour équilibrer). Rien n’est attribué sans un clic. */
let _afLoad=null;
function afLoad(){
  const t=todayISO();
  if(_afLoad&&_afLoad.t===t&&_afLoad.c===S.data.cours&&_afLoad.a===S.data.candidatures) return _afLoad.v;
  const v={};
  for(const s of sessionsBetween(t,iso(addDays(new Date(),30)))) if(s.kind==='cours'&&!s.cancelled) for(const id of new Set(s.tch)) if(id) v[id]=(v[id]||0)+sHours(s);
  _afLoad={t,c:S.data.cours,a:S.data.candidatures,v};return v;
}
function afSuggest(s,a,extra){
  const L=afLoad(), add=extra||{}, k=modKey(s.c), mod=k!=null?comps().find(x=>+x.code===k):null;
  return teachers().filter(t=>!a.assigned.includes(t.id)&&!onLeave(t)&&hasComp(t,s.c)&&!busyAt(t.id,s)&&!(add[t.id]||[]).some(o=>o.date===s.date&&o.start<s.end&&s.start<o.end))
    .map(t=>{const dispo=dispoCovers(dispoOf(t.id,s.date),s), ch=!!mod&&mod.charge===t.id, pend=a.pending.includes(t.id), h=(L[t.id]||0)+(add[t.id]||[]).reduce((n,o)=>n+sHours(o),0);
      return {t,dispo,ch,pend,h,score:(pend?4:0)+(dispo?3:0)+(ch?2:0)};})
    .sort((x,y)=>y.score-x.score||x.h-y.h||collator.compare(x.t.nom,y.t.nom));
}
const afWhy=o=>[o.pend?'a postulé':'',o.dispo?'disponible':'',o.ch?'chargé du module':'',`${hrFmt(o.h)} h prévues sur 30 jours`].filter(Boolean).join(' · ');
/* Dans la fenêtre d’une séance : les trois meilleurs */
function afSuggestHTML(s,a){
  const L=afSuggest(s,a).slice(0,3);if(!L.length) return '';
  return `<div class="af-sugg" id="af-sugg"><p class="sb-h3">Proposés</p><ul class="af-list">${L.map(o=>`<li>${avHTML(o.t.nom,o.t.photo||'')}<span class="nm">${esc(o.t.nom)}<small>${esc(afWhy(o))}</small></span><span class="af-btns"><button class="btn sm yes" type="button" data-act="af-sugg" data-tid="${esc(o.t.id)}" ${sAt(s)}${dis()}>Attribuer</button></span></li>`).join('')}</ul></div>`;
}
/* Sur la page des affectations : une proposition pour chaque place à combler, à accepter d’un coup */
function afAutoBar(open){
  const n=open.filter(x=>x.st.open>0).length;if(!n) return '';
  return `<div class="row af-auto"><button class="btn" type="button" id="af-auto" data-act="af-auto">${icon('spark')}Proposer des enseignants</button><span class="muted sm">pour ${pl(n,'séance à combler','séances à combler')}, selon les disponibilités, les compétences et les heures de chacun.</span></div>`;
}
function afPlan(){
  const hz=[7,30,90].includes(+S.pg.hz)?+S.pg.hz:30, g=S.pg.g||'', add={}, out=[];
  for(const s of upcomingSessions(hz).filter(x=>!g||x.grp===g)){
    const a=staffing(s);if(a.open<=0) continue;
    const picks=[];
    for(let i=0;i<a.open;i++){const o=afSuggest(s,Object.assign({},a,{assigned:a.assigned.concat(picks.map(p=>p.t.id))}),add)[0];if(!o)break;picks.push(o);(add[o.t.id]=add[o.t.id]||[]).push(s);}
    out.push({s,a,picks});
  }
  return out;
}
function afAutoDrawer(d){
  if(!d.plan) d.plan=afPlan();
  const P=d.plan, n=P.reduce((k,x)=>k+x.picks.length,0), none=P.filter(x=>x.picks.length<x.a.open);
  return dTop('Affectations','Enseignants proposés',`${pl(n,'proposition','propositions')} pour ${pl(P.length,'séance','séances')}`)+`<div class="dr-body">
    <p class="help">Chaque proposition respecte les compétences, les congés et les autres séances ; elle tient compte des disponibilités et équilibre les heures. Décochez celles que vous ne voulez pas.</p>
    <ul class="af-plan">${P.map((x,i)=>`<li><div><b>${sTitle(x.s)}</b><small class="muted"> · ${esc(sDay(x.s))} · ${esc(momentOf(x.s))} · ${esc(gName(x.s.grp))}</small></div>${x.picks.map((o,j)=>`<label class="ck"><input type="checkbox" data-afp="${i}:${j}"${(d.off||[]).includes(i+':'+j)?'':' checked'}> ${esc(o.t.nom)} <small class="muted">${esc(afWhy(o))}</small></label>`).join('')}${x.picks.length<x.a.open?`<p class="bad-t sm">${x.picks.length?'Pas assez d’enseignants libres':'Aucun enseignant libre avec ce module'}.</p>`:''}</li>`).join('')}</ul>
    ${none.length?`<p class="help">${pl(none.length,'séance reste','séances restent')} à combler à la main.</p>`:''}</div>
    <div class="dr-foot"><button class="btn primary" type="button" id="af-auto-go" data-act="af-auto-go"${n&&!S.busy?'':' disabled'}>Attribuer les propositions cochées</button></div>`;
}
async function afAutoGo(){
  const d=S.dr;if(!d||!d.plan||S.busy) return;
  const off=new Set(d.off||[]), fns=[];let n=0;
  d.plan.forEach((x,i)=>x.picks.forEach((o,j)=>{if(off.has(i+':'+j))return;n++;fns.push(()=>col('candidatures').doc(candId(x.s.key,o.t.id)).set(Object.assign(candDoc(x.s,o.t.id,'approuve'),{par:'admin'})));}));
  if(!n) return;
  S.dr=null;
  if(await runAll(fns,pl(n,'enseignant attribué','enseignants attribués'))) logEv('aff',`a attribué ${pl(n,'enseignant proposé','enseignants proposés')} automatiquement`);
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled||!/^af-(sugg|auto)/.test(b.dataset.act))return;
  if(b.dataset.act==='af-auto') openDrawer({kind:'fo',mode:'afauto'});
  else if(b.dataset.act==='af-auto-go') await afAutoGo();
  else if(b.dataset.act==='af-sugg'){const se=findSess(b.dataset.date,b.dataset.key), tv=b.dataset.tid;if(!se||!tv)return;
    if(await affSetStatus(se,tv,'approuve',`${tName(tv)} est attribué à ${W('cette séance','ce cours')}`,{par:'admin'})) logEv('aff',`a attribué ${tName(tv)} à la séance (proposé)`,sObj(se),se);}
});
document.addEventListener('change',e=>{
  const t=e.target;if(!t.dataset||t.dataset.afp==null||!S.dr||S.dr.mode!=='afauto') return;
  const s=new Set(S.dr.off||[]);if(t.checked)s.delete(t.dataset.afp);else s.add(t.dataset.afp);S.dr.off=[...s];
});
