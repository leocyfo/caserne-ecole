/* ---------- Présences : aides des classes et du personnel ---------- */
const periodSeg=per=>`<div class="seg" role="group" aria-label="Période">${[['semaine','Cette semaine'],['mois','Ce mois'],['annee','Depuis la rentrée']].map(([k,l])=>`<button type="button" id="pp-${k}" data-act="pg-set" data-k="period" data-v="${k}" aria-pressed="${per===k}">${l}</button>`).join('')}</div>`;
/* Présences d’une classe sur une période : cours passés, complétés, à rattraper, et totaux des élèves */
function classAtt(gid,from,to,stats,sess){
  const els=studentsOf(gid), mine=sess.filter(s=>s.grp===gid);
  let done=0;const missing=[];for(const s of mine){const a=attInfo(s);if(a.state==='done')done++;else if(a.due)missing.push(s);}
  let P=0,A=0,R=0,M=0,N=0;for(const e of els){const s=stats[e.id];if(s){P+=s.P;A+=s.A;R+=s.R;M+=s.M;N+=s.n;}}
  return {els,past:mine.length,done,missing:missing.sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start),P,A,R,M,N,rate:N?Math.round((P+R)/N*100):null};
}
const missRow=(s,mode)=>{const d=parse(s.date);return `<button type="button" class="lrow" data-act="open-att" data-date="${s.date}" data-key="${esc(s.key)}"><span class="miss-d" aria-hidden="true"><b>${d.getDate()}</b><small>${fMonthS.format(d).replace('.','')}</small></span><span class="what"><span class="ti">${codeOf(s.c)}${esc(s.c.titre)}${choreChip(s)}</span><span class="sub">${esc(`${WD[d.getDay()]} ${dn(d)} ${fMonthS.format(d)} · ${momentOf(s)} · ${mode==='teacher'?gName(s.grp):tchLabel(s)}`)}</span></span><span class="btn sm miss-go">Prendre les présences</span></button>`;};

function staffDraft(){
  const st=S.pg, ds=st.sdate;
  if(!st.sdraft||st.sdraft.date!==ds||!st.sdraft.dirty){const doc=S.data.staffPres[ds];st.sdraft={date:ds,statuts:Object.assign({},(doc&&doc.statuts)||{}),dirty:false,maj:doc&&doc.maj};}
  return st.sdraft;
}
function attStaff(tabs){
  const st=S.pg;if(!st.sdate) st.sdate=lastSchoolDay();
  const ds=st.sdate, mon=monday(parse(ds)), dr=staffDraft(), people=staff().filter(p=>p.statut!=='Inactif'&&(p.fonction!=='Instructeur'||sessionsOn(ds).some(x=>!x.cancelled&&x.tch.includes(p.id)))), today=todayISO();
  let days='<div class="daytabs show" role="group" aria-label="Jour">';
  for(let i=0;i<5;i++){const d=addDays(mon,i),x=iso(d),doc=S.data.staffPres[x];days+=`<button type="button" id="sd-${i}" data-act="sp-day" data-date="${x}" aria-pressed="${x===ds}" class="${x===today?'is-today':''}"><span>${DAYS[i].slice(0,3).toLowerCase()}.</span><strong>${d.getDate()}</strong>${doc?'<span class="mark" title="Enregistré"></span>':''}</button>`;}
  days+='</div>';
  const off=offDay(ds), cnt={P:0,A:0,C:0,F:0};let marked=0;for(const p of people){const v=dr.statuts[p.id];if(cnt[v]!=null){cnt[v]++;marked++;}}
  const list=people.length?`<ul class="att-list">${people.map(p=>`<li><span class="nm">${esc(p.nom)}<small>${esc(p.fonction||'Enseignant')}${p.statut&&p.statut!=='Actif'?' · '+esc(p.statut):''}</small></span><span class="att-btns" role="group" aria-label="${esc('Présence de '+p.nom)}">${['P','A','C','F'].map(v=>`<button type="button" class="ab ab-${v}" id="sp-${esc(p.id)}-${v}" data-act="sp-set" data-id="${esc(p.id)}" data-v="${v}" aria-pressed="${dr.statuts[p.id]===v}" title="${SLBL[v]}"><span class="full">${SLBL[v]}</span><span class="abbr">${v}</span></button>`).join('')}</span></li>`).join('')}</ul>`:'<p class="help">Aucun membre du personnel actif.</p>';
  let state='Pas encore enregistrées';if(dr.dirty)state='Modifications non enregistrées';else if(dr.maj){const t=new Date(dr.maj);if(!isNaN(t))state=`Enregistrées le ${shortDate(t)} à ${fmtT(t.getHours()*60+t.getMinutes())}`;}
  const wk=people.map(p=>`<tr><td><b>${esc(p.nom)}</b></td>${[0,1,2,3,4].map(i=>{const x=iso(addDays(mon,i)),v=((S.data.staffPres[x]||{}).statuts||{})[p.id];return `<td>${v?`<span class="chip ${SCHIP[v]}">${SLBL[v]}</span>`:offDay(x)?'<span class="muted sm">Congé</span>':'<span class="muted">—</span>'}</td>`;}).join('')}</tr>`).join('');
  return `<div class="toolbar">${tabs}<span class="grow"></span><div class="weeknav"><button class="icon-btn" type="button" id="sp-prev" data-act="sp-week" data-n="-7" aria-label="Semaine précédente">${icon('left')}</button><span class="range">Semaine du ${dn(mon)} ${fMonthS.format(mon)}</span><button class="icon-btn" type="button" id="sp-next" data-act="sp-week" data-n="7" aria-label="Semaine suivante">${icon('right')}</button></div></div>
    ${days}
    <section class="panel"><div class="t-head" style="margin-bottom:8px"><h2 style="margin:0">${esc(dayLabel(parse(ds)))}</h2><div class="att-sum">${['P','A','C','F'].filter(k=>cnt[k]).map(k=>`<span class="chip ${SCHIP[k]}">${cnt[k]} ${SLBL[k].toLowerCase()}</span>`).join('')}${people.length-marked?`<span class="chip off">${pl(people.length-marked,'non marqué','non marqués')}</span>`:''}</div></div>
      ${off?`<div class="notice warn" style="margin-bottom:10px"><p>${esc(off)} : ${W('aucune séance','aucun cours')} ce jour-là.</p></div>`:''}${list}
      <div class="row" style="margin-top:12px"><button class="btn primary" type="button" data-act="sp-save"${S.busy||!dr.dirty?' disabled':''}>Enregistrer</button><button class="btn" type="button" data-act="sp-all"${people.length===marked?' disabled':''}>Marquer les autres présents</button><span class="state${dr.dirty?' dirty':''}">${state}</span></div></section>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Personnel</th>${[0,1,2,3,4].map(i=>{const d=addDays(mon,i);return `<th>${DAYS[i]} ${dn(d)}</th>`;}).join('')}</tr></thead><tbody>${wk}</tbody></table></div>`;
}

