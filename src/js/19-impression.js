/* ---------- Impression (et PDF) ----------
   La page prépare une feuille, puis ouvre la fenêtre d’impression du navigateur, qui sait aussi enregistrer en PDF.
   Si cette fenêtre ne peut pas s’ouvrir (page intégrée dans une autre), la feuille est remise en fichier à ouvrir et à imprimer.
   Trois feuilles : l’horaire de la semaine (classe ou enseignant), la feuille de présences d’une classe, le relevé de résultats d’un élève. */
const prCSS=land=>`@page{size:letter ${land?'landscape':'portrait'};margin:12mm}
.pr-doc{font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#111;font-size:10.5pt;line-height:1.35;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pr-page{break-after:page;page-break-after:always}
.pr-page:last-child{break-after:auto;page-break-after:auto}
.pr-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:10px}
.pr-head h1{margin:0;font-size:16pt;line-height:1.2}
.pr-head p{margin:3px 0 0;font-size:10.5pt;color:#333}
.pr-org{text-align:right;font-size:10pt;color:#333}
.pr-t{width:100%;border-collapse:collapse;table-layout:fixed}
.pr-t th,.pr-t td{border:1px solid #777;padding:5px 6px;vertical-align:top;text-align:left;overflow-wrap:anywhere}
.pr-t thead th{background:#e8e8e8;font-size:9.5pt}
.pr-t th small{display:block;font-weight:400;font-size:8.5pt}
.pr-wk .pr-m{width:22mm;background:#f3f3f3;font-size:9.5pt;vertical-align:middle}
.pr-wk tbody td{height:66mm}
.pr-s{margin-bottom:7px}
.pr-s b{display:block;font-size:10.5pt}
.pr-s span{display:block;font-size:9.5pt;color:#222}
.pr-s i{display:block;font-size:9.5pt}
.pr-s.ex{border-left:3px solid #111;padding-left:5px}
.pr-s.off b,.pr-s.off span{text-decoration:line-through;color:#666}
.pr-off{background:#f0f0f0;text-align:center!important;vertical-align:middle!important;color:#333}
.pr-none{color:#999}
.pr-att th,.pr-att td{padding:3px 4px;font-size:9pt}
.pr-att .n{width:8mm;text-align:center}
.pr-att .nm{width:52mm}
.pr-att .c{text-align:center}
.pr-att thead th.c{font-weight:400;line-height:1.2}
.pr-att thead th.c b{display:block}
.pr-att tbody td{height:7.2mm;vertical-align:middle}
.pr-res td,.pr-res th{font-size:10.5pt;padding:6px 8px}
.pr-sum{margin:10px 0 0;font-size:10.5pt}
.pr-foot{display:flex;justify-content:space-between;gap:20px;margin-top:10px;font-size:9.5pt;color:#222}
.pr-sign{display:flex;justify-content:space-between;gap:20px;margin-top:26px;font-size:10.5pt}
`;
const prSlug=v=>String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'feuille';
function prHead(title,sub){const c=cfg();return `<header class="pr-head"><div><h1>${esc(title)}</h1><p>${sub}</p></div><div class="pr-org"><b>${esc(c.nom||'')}</b><br>${esc(c.annee||'')}</div></header>`;}
const prWeekLbl=mon=>{const a=mon, b=addDays(mon,4);return a.getMonth()===b.getMonth()?`${dn(a)} au ${dn(b)} ${fMonth.format(b)} ${b.getFullYear()}`:`${dn(a)} ${fMonth.format(a)} au ${dn(b)} ${fMonth.format(b)} ${b.getFullYear()}`;};
/* Tout ce qui est à l’horaire d’une semaine (du lundi au vendredi) */
function weekItemsOf(mon){
  let out=[];for(let i=0;i<5;i++) out=out.concat(sessionsOn(iso(addDays(mon,i))));
  const a=iso(mon), b=iso(addDays(mon,4));
  return out.concat(S.data.examens.filter(e=>!e.seance&&e.date>=a&&e.date<=b).map(examItem));
}
function prSess(s,who){
  const where=who==='g'?(s.tch||[]).filter(id=>id&&byId(S.data.enseignants,id)).map(id=>shortName(tName(id))).join(', '):gName(s.grp);
  if(s.kind==='exam') return `<div class="pr-s ex"><b>${esc(s.c?(s.c.code?s.c.code+' ':'')+s.c.titre:(s.e.titre||'Examen'))}</b><span>${esc(s.c?(s.e.titre||'Examen'):'Examen')}</span><span>${esc([where,s.salle?'Local '+s.salle:''].filter(Boolean).join(' · '))}</span></div>`;
  const tg=tagsOf(s);
  return `<div class="pr-s${s.cancelled?' off':''}${tg.includes('Examen')?' ex':''}"><b>${esc((s.c.code?s.c.code+' ':'')+s.c.titre)}</b><span>${esc([sessLabel(s),cardKind(tg).kind].filter(Boolean).join(' · '))}</span><span>${esc([where,s.salle?'Local '+s.salle:'',ressNames(ressOf(s))].filter(Boolean).join(' · '))}</span>${s.cancelled?`<i>${W('Séance annulée','Cours annulé')}</i>`:''}</div>`;
}
/* Une page : les cinq jours en colonnes, l’avant-midi et l’après-midi en lignes ; une journée complète occupe les deux */
function prWeekPage(title,sub,items,mon,who,gid){
  const days=[0,1,2,3,4].map(i=>{const d=addDays(mon,i), ds=iso(d), list=items.filter(s=>s.date===ds).sort((a,b)=>a.start-b.start), part=k=>list.filter(s=>moment(s.start,s.end)===k);
    return {d,off:offDay(ds),full:part('Toute la journée'),am:part('Avant-midi'),pm:part('Après-midi'),chore:gid?choreDay(gid,ds):''};});
  const lines=a=>a.map(s=>prSess(s,who)).join('')||'<span class="pr-none">—</span>';
  const span=x=>x.off||(x.full.length&&!x.am.length&&!x.pm.length);
  const head=days.map(x=>`<th>${esc(WD[x.d.getDay()])} ${dn(x.d)} ${esc(fMonthS.format(x.d))}${x.chore?`<small>Corvée de ménage${x.chore==='maybe'?' ?':''}</small>`:''}</th>`).join('');
  const am=days.map(x=>x.off?`<td rowspan="2" class="pr-off">${esc(x.off)}</td>`:span(x)?`<td rowspan="2">${lines(x.full)}</td>`:`<td>${lines(x.full.concat(x.am))}</td>`).join('');
  const pm=days.map(x=>span(x)?'':`<td>${lines(x.full.concat(x.pm))}</td>`).join('');
  return `<section class="pr-page">${prHead(title,sub)}<table class="pr-t pr-wk"><thead><tr><th class="pr-m"></th>${head}</tr></thead><tbody><tr><th class="pr-m">Avant-midi</th>${am}</tr><tr><th class="pr-m">Après-midi</th>${pm}</tr></tbody></table></section>`;
}
/* Pour qui on imprime : la classe ou l’enseignant choisi, sinon toutes les classes ; un enseignant ou un élève imprime le sien */
function printTargets(d){
  if(S.role==='student') return S.group?[{k:'g',id:S.group}]:[];
  if(S.role==='teacher') return S.teacher?[{k:'t',id:S.teacher}]:[];
  if(d.t) return [{k:'t',id:d.t}];
  return (d.g?[d.g]:groups().map(g=>g.id)).map(id=>({k:'g',id}));
}
function weekSheet(d){
  const mon=parse(d.week), items=weekItemsOf(mon), wk='Semaine du '+esc(prWeekLbl(mon));
  return printTargets(d).map(t=>t.k==='g'
    ?prWeekPage('Horaire · '+gName(t.id),wk+(principalOf(t.id)?' · Enseignant principal : '+esc(tName(principalOf(t.id))):''),items.filter(s=>s.grp===t.id),mon,'g',t.id)
    :prWeekPage('Horaire · '+tName(t.id),wk,items.filter(s=>(s.tch||[]).includes(t.id)),mon,'t','')).join('');
}
/* Feuille de présences : une page par classe, les élèves en lignes, les séances de la semaine en colonnes.
   Les présences déjà prises y sont inscrites ; le reste est à cocher à la main. */
function attSheet(d){
  const mon=parse(d.week), tid=S.role==='teacher'?S.teacher:(d.t||''), wk='Semaine du '+esc(prWeekLbl(mon));
  const items=weekItemsOf(mon).filter(s=>s.kind==='cours'&&!s.cancelled&&!isActivity(s.c)&&(!tid||(s.tch||[]).includes(tid)));
  const gs=tid?groups().map(g=>g.id).filter(id=>items.some(s=>s.grp===id)):(d.g?[d.g]:groups().map(g=>g.id));
  return gs.map(gid=>{
    const ss=items.filter(s=>s.grp===gid).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start), els=studentsOf(gid);
    if(!ss.length||!els.length) return '';
    const th=ss.map(s=>{const dd=parse(s.date);return `<th class="c"><b>${esc(WD[dd.getDay()].slice(0,3))} ${dn(dd)}</b>${esc(momentShort(s))}<br>${esc((s.c.code||s.c.titre)+(sessLabel(s)?' '+sessLabel(s).replace(/^Cours /,''):''))}</th>`;}).join('');
    const rows=els.map(e=>`<tr><td class="n">${e.numero!=null&&e.numero!==''?esc(e.numero):''}</td><td class="nm">${esc(e.nom)}</td>${ss.map(s=>{const p=presDoc(s.key), v=p&&p.statuts&&p.statuts[e.id];return `<td class="c">${v&&LBL[v]?v:''}</td>`;}).join('')}<td></td></tr>`).join('');
    return `<section class="pr-page">${prHead('Feuille de présences · '+gName(gid),wk+(tid?' · '+esc(tName(tid)):''))}<table class="pr-t pr-att"><thead><tr><th class="n">N°</th><th class="nm">Élève</th>${th}<th>Remarques</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="pr-foot"><span>P : présent · A : absent · R : retard · M : absence motivée</span><span>Signature de l’enseignant : ______________________________</span></div></section>`;
  }).join('');
}
/* Relevé de résultats d’un élève */
function transcriptHTML(e){
  const B=examBoard(x=>x.grp===e.groupe), mine=B.items.filter(x=>x.past&&!x.rep&&x.res[e.id]).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start);
  const ok=mine.filter(x=>resOk(x.res[e.id])).length, ko=mine.filter(x=>resKo(x.res[e.id])).length, kf=mine.filter(x=>resFail(x.res[e.id])).length, rate=ok+ko+kf?Math.round(ok/(ok+ko+kf)*100):null;
  const rows=mine.map(x=>{const dd=parse(x.date);return `<tr><td>${esc(shortDate(dd))} ${dd.getFullYear()}</td><td>${esc(x.c?(x.c.code?x.c.code+' ':'')+x.c.titre:'')}</td><td>${esc((x.e&&x.e.titre)||'Examen')}</td><td>${x.pct[e.id]!=null?esc(noteTxt(x.pct[e.id])):''}</td><td><b>${esc(RES[x.res[e.id]][1])}</b></td></tr>`;}).join('');
  return `<section class="pr-page">${prHead('Relevé de résultats',esc(e.nom)+(e.numero!=null&&e.numero!==''?' · n° '+esc(e.numero):'')+' · '+esc(gName(e.groupe)))}
    ${mine.length?`<table class="pr-t pr-res"><thead><tr><th style="width:17%">Date</th><th>Module</th><th style="width:20%">Examen</th><th style="width:11%">Note</th><th style="width:21%">Résultat</th></tr></thead><tbody>${rows}</tbody></table>`:'<p>Aucun résultat inscrit pour l’instant.</p>'}
    <p class="pr-sum">${pl(mine.length,'examen','examens')} · ${ok} ${ok>1?'réussis':'réussi'}${ko?` · ${ko} à reprendre`:''}${kf?` · ${pl(kf,'échec de module','échecs de module')}`:''}${rate!=null?` · ${rate} % de réussite`:''}</p>
    <div class="pr-sign"><span>Remis le ${esc(longDate(new Date()))}</span><span>Signature : ______________________________</span></div></section>`;
}
async function printDoc(title,body,land,file){
  const root=$('#print-root'), css=prCSS(land), t0=document.title;
  let shown=false, done=false;
  const clean=()=>{if(done)return;done=true;window.removeEventListener('afterprint',clean);document.title=t0;document.body.classList.remove('printing');root.innerHTML='';};
  const on=()=>{shown=true;};
  root.innerHTML=`<style>${css}</style><div class="pr-doc">${body}</div>`;
  document.body.classList.add('printing');document.title=title;
  window.addEventListener('beforeprint',on);window.addEventListener('afterprint',clean);
  try{window.print();}catch(e){}
  await new Promise(r=>setTimeout(r,350));
  window.removeEventListener('beforeprint',on);
  if(shown){setTimeout(clean,120000);return true;}
  clean();
  /* la fenêtre d’impression ne s’est pas ouverte : la feuille part en fichier */
  const ok=await saveFile(file+'.html',`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}body{margin:0}</style></head><body><div class="pr-doc">${body}</div></body></html>`);
  if(ok) toast('Ouvrez ce fichier, puis imprimez-le (Ctrl+P).');
  return ok;
}
/* Fenêtre « Imprimer » : la semaine, pour qui, et la feuille voulue */
function openPrint(preset){
  const f=S.role==='admin'?S.filtre:'';
  openDrawer(Object.assign({kind:'print',week:iso(S.week),g:f.startsWith('g:')?f.slice(2):'',t:f.startsWith('e:')?f.slice(2):''},preset||{}));
}
function printDrawer(){
  const d=S.dr, mon=parse(d.week), cur=d.t?'e:'+d.t:d.g?'g:'+d.g:'';
  const who=S.role!=='admin'?'':`<label class="field"><span>Pour</span><select id="pr-who" data-pr="who"><option value="">Toutes les classes</option>${groups().map(g=>`<option value="g:${esc(g.id)}"${cur==='g:'+g.id?' selected':''}>${esc(g.nom)}</option>`).join('')}<optgroup label="Enseignants">${teachers().map(t=>`<option value="e:${esc(t.id)}"${cur==='e:'+t.id?' selected':''}>${esc(t.nom)}</option>`).join('')}</optgroup></select></label>`;
  const sub=S.role==='student'?esc(gName(S.group)):S.role==='teacher'?esc(tName(S.teacher)):d.t?esc(tName(d.t)):d.g?esc(gName(d.g)):'Toutes les classes';
  return dTop('Imprimer','Semaine du '+esc(prWeekLbl(mon)),sub)+`<div class="dr-body"><div class="stackf">
    <label class="field"><span>Semaine du</span><input type="date" id="pr-week" data-pr="week" data-f="week" value="${esc(d.week)}"></label>${who}
    <div class="pr-btns"><button class="btn primary" type="button" id="pr-horaire" data-act="pr-go" data-doc="horaire">${icon('print')}Horaire de la semaine</button>${S.role==='student'?'':`<button class="btn" type="button" id="pr-feuille" data-act="pr-go" data-doc="feuille">${icon('print')}Feuille de présences</button>`}</div>
    <p class="help">Une page par classe. La fenêtre d’impression permet aussi d’enregistrer en PDF.</p></div></div>`;
}

