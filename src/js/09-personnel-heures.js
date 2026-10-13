/* ---------- Pages : personnel ---------- */
function staffPage(){
  if(S.pg.fiche) return staffFiche();
  const who=S.pg.who||'liste';
  const segP=`<div class="seg" role="group" aria-label="Affichage"><button type="button" id="st-liste" data-act="pg-set" data-k="who" data-v="liste" aria-pressed="${who==='liste'}">Liste</button><button type="button" id="pt-personnel" data-act="pg-set" data-k="who" data-v="presences" aria-pressed="${who==='presences'}">Présences</button><button type="button" id="st-heures" data-act="pg-set" data-k="who" data-v="heures" aria-pressed="${who==='heures'}">Heures</button></div>`;
  if(who==='presences') return attStaff(segP);
  if(who==='heures') return hoursPage(segP);
  const all=staff(), d=new Date(), m0=iso(new Date(d.getFullYear(),d.getMonth(),1)), t=todayISO();
  const abs={};
  for(const [ds,doc] of Object.entries(S.data.staffPres)){ if(ds<m0||ds>t) continue; for(const [id,v] of Object.entries((doc&&doc.statuts)||{})) if(v==='A') abs[id]=(abs[id]||0)+1; }
  const nT=all.filter(isTeacher).length, nC=all.filter(onLeave).length;
  const tb=`<div class="toolbar">${segP}<p class="summary" style="margin:0"><span><b>${all.length}</b>membres</span><span><b>${nT}</b>${nT>1?'enseignants':'enseignant'}</span><span class="${nC?'need':''}"><b>${nC}</b>en congé</span></p><span class="grow"></span><button class="btn primary" type="button" data-act="new-staff">${icon('plus')}Ajouter un membre du personnel</button></div>`;
  if(!all.length) return tb+emptyBox('Aucun membre du personnel','Ajoutez les enseignants et le reste du personnel. Les enseignants pourront ensuite être assignés aux cours.');
  return tb+`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nom</th><th>Statut</th><th>Courriel</th><th>Téléphone</th><th class="num">${W('Séances','Cours')} cette semaine</th><th class="num">Absences ce mois</th></tr></thead><tbody>${all.map(p=>{const dz=S.data.dossiers[p.id]||{}, st=statOf(p), nc=isTeacher(p)?weekCount(p.id,baseMonday()):0;
    return `<tr class="row-link" data-act="staff" data-id="${esc(p.id)}"><td><span class="tb-who">${avHTML(p.nom,'')}<span><button class="link" type="button" data-act="staff" data-id="${esc(p.id)}">${esc(p.nom)}</button><small class="tb-sub">${esc(p.fonction||'Enseignant')}${principalClasses(p.id).map(g=>`<span class="role-chip prin-chip">Principal · ${esc(g.nom.replace(/^(Classe|Groupe)\s+/i,''))}</span>`).join('')}</small></span></span></td><td><span class="chip ${STATUTS[st]||'off'}">${esc(st)}</span></td><td>${esc(p.courriel||'—')}</td><td>${esc(dz.telephone||'—')}</td><td class="num">${nc}</td><td class="num">${abs[p.id]||0}</td></tr>`;}).join('')}</tbody></table></div>`;
}

/* ---------- Heures enseignées : par enseignant et par mois, pour la paie des instructeurs ----------
   Une séance compte une fois qu’elle a eu lieu (passée, non annulée), pour chaque enseignant qui y était attribué
   et qui n’était pas marqué absent ce jour-là. */
function taughtRows(){
  const out=[];
  for(const s of sessionsBetween(yearStart(),todayISO())){
    if(s.kind!=='cours'||s.cancelled||!isPast(s)) continue;
    const abs=S.data.absProfs[s.date]||[];
    for(const id of new Set(s.tch)) if(id&&byId(S.data.enseignants,id)&&!abs.includes(id)) out.push({t:id,s,h:sHours(s)});
  }
  return out;
}
const hrMonths=()=>{const out=[];let d=parse(yearStart());d=new Date(d.getFullYear(),d.getMonth(),1);const end=new Date();while(d<=end&&out.length<14){out.push(d.getFullYear()+'-'+pad(d.getMonth()+1));d=new Date(d.getFullYear(),d.getMonth()+1,1);}return out;};
const hrDate=m=>new Date(+m.slice(0,4),+m.slice(5)-1,1);
const hrMonthName=m=>`${fMonth.format(hrDate(m))} ${hrDate(m).getFullYear()}`;
const hrFmt=h=>String(Math.round(h*10)/10).replace('.',',');
function hoursPage(segP){
  const rows=taughtRows(), ms=hrMonths(), cur=S.pg.hm==='all'||ms.includes(S.pg.hm)?S.pg.hm:ms[ms.length-1], by={}, totM={};let tot=0;
  for(const r of rows){const m=r.s.date.slice(0,7), o=by[r.t]||(by[r.t]={tot:0});o[m]=(o[m]||0)+r.h;o.tot+=r.h;totM[m]=(totM[m]||0)+r.h;tot+=r.h;}
  const ts=staff().filter(p=>by[p.id]||(isTeacher(p)&&p.statut!=='Inactif')), all=cur==='all', sel=all?tot:(totM[cur]||0);
  const cell=(h,m)=>`<td class="num${m===cur?' on':''}">${h?hrFmt(h):'<span class="muted">—</span>'}</td>`;
  const tb=`<div class="toolbar">${segP}<p class="summary" style="margin:0"><span><b id="hr-sum">${hrFmt(sel)}</b>${sel>=2?'heures':'heure'} ${all?'depuis la rentrée':'en '+esc(hrMonthName(cur))}</span></p><span class="grow"></span><button class="btn primary" type="button" id="hr-export" data-act="hr-export" data-m="${esc(cur)}"${sel?'':' disabled'}>${icon('down')}Exporter ${all?'l’année':esc(fMonth.format(hrDate(cur)))}</button></div>`;
  if(!ts.length) return tb+emptyBox('Aucun enseignant','Ajoutez les enseignants dans la liste du personnel.');
  const th=m=>`<th class="num${m===cur?' on':''}"><button type="button" class="hr-m" id="hm-${m}" data-act="pg-set" data-k="hm" data-v="${m}" aria-pressed="${m===cur}" title="${esc('Choisir '+hrMonthName(m)+' pour l’export')}">${esc(fMonthS.format(hrDate(m)))}</button></th>`;
  const body=ts.map(p=>{const o=by[p.id]||{tot:0};
    return `<tr class="row-link" data-act="staff" data-id="${esc(p.id)}"><td><span class="tb-who">${avHTML(p.nom,'')}<span><button class="link" type="button" data-act="staff" data-id="${esc(p.id)}">${esc(p.nom)}</button><small class="tb-sub">${esc(p.fonction||'Enseignant')}</small></span></span></td>${ms.map(m=>cell(o[m],m)).join('')}<td class="num${all?' on':''}"><b>${o.tot?hrFmt(o.tot):'—'}</b></td></tr>`;}).join('');
  const foot=`<tr class="hr-tot"><td>Total</td>${ms.map(m=>cell(totM[m],m)).join('')}<td class="num${all?' on':''}"><b>${tot?hrFmt(tot):'—'}</b></td></tr>`;
  return tb+`<div class="tbl-wrap"><table class="tbl hr-tbl" id="hr-tbl"><thead><tr><th>Enseignant</th>${ms.map(th).join('')}<th class="num${all?' on':''}"><button type="button" class="hr-m" id="hm-all" data-act="pg-set" data-k="hm" data-v="all" aria-pressed="${all}" title="Choisir toute l’année pour l’export">Total</button></th></tr></thead><tbody>${body}${foot}</tbody></table></div>
    <p class="help" style="margin-top:10px">Heures des ${W('séances données','cours donnés')} depuis la rentrée. Une ${W('séance annulée','période annulée')} ou un enseignant marqué absent ne compte pas. Cliquez un mois pour le choisir, puis Exporter.</p>`;
}
/* Fichier pour la paie : un sommaire par enseignant, puis le détail séance par séance */
function hoursCSV(m){
  const rows=taughtRows().filter(r=>m==='all'||r.s.date.slice(0,7)===m);
  if(!rows.length){toast('Aucune heure à exporter pour cette période.','bad');return null;}
  const T=id=>byId(S.data.enseignants,id)||{}, fn=id=>T(id).fonction||'Enseignant';
  rows.sort((a,b)=>collator.compare(T(a.t).nom||'',T(b.t).nom||'')||a.s.date.localeCompare(b.s.date)||a.s.start-b.s.start);
  const sum=new Map();for(const r of rows){const o=sum.get(r.t)||{n:0,h:0};o.n++;o.h+=r.h;sum.set(r.t,o);}
  const L=[['Enseignant','Fonction',W('Séances','Cours'),'Heures']];
  for(const [id,o] of sum) L.push([T(id).nom,fn(id),o.n,hrFmt(o.h)]);
  L.push([],['Enseignant','Fonction','Date','Classe',W('Module','Cours'),W('Séance','Détail'),'Type','Moment','Heures']);
  for(const r of rows){const s=r.s;L.push([T(r.t).nom,fn(r.t),s.date,gName(s.grp),(s.c.code?s.c.code+' ':'')+s.c.titre,sessLabel(s),cardKind(tagsOf(s)).kind||'',momentOf(s),hrFmt(r.h)]);}
  return {name:`heures-${m==='all'?(String(cfg().annee||'').replace(/[^0-9A-Za-z]+/g,'-').replace(/^-|-$/g,'')||'annee'):m}.csv`,text:csvText(L)};
}

