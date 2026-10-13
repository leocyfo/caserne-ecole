/* ---------- Rendu : tableau de la semaine ---------- */
/* Carte d’un cours : heure et activité en haut, nom, enseignant et local, puis une ligne discrète
   (présences, Ménage…) seulement quand il y a quelque chose à dire. */
function cardKind(tags){
  const k=actOf(tags), used=new Set();let kind='';
  if(k==='examen-t'||k==='examen-p'){kind=k==='examen-t'?'Examen théorique':'Examen pratique';used.add('Examen').add(k==='examen-t'?'Théorie':'Pratique');}
  else{const f=tags.find(x=>TAGTONE[x]);if(f){kind=f;used.add(f);}}
  return {kind,flags:tags.filter(x=>!used.has(x))};
}
function cardStatus(s,mode){
  if(s.kind==='exam'||s.cancelled) return '';
  const moved=s.extra&&s.extra.de?'<span class="cc-st info">Déplacé ici</span>':'';
  if(mode==='student') return moved;
  const a=attInfo(s);
  let aff='';
  if(mode==='admin'&&!isPast(s)){const f=staffing(s);aff=(f.clash.length?`<span class="cc-st bad" title="${esc(f.clash.map(tName).join(', ')+W(' : aussi dans une autre séance à ce moment',' : aussi dans un autre cours à ce moment'))}">Conflit</span>`:'')+(f.rclash.length?`<span class="cc-st bad" title="${esc(ressNames([...new Set(f.rclash.map(x=>x.id))])+' : déjà pris à ce moment')}">${ressClashLbl(f.rclash)}</span>`:'')+(f.open>0?`<span class="cc-st warn" title="Enseignants attribués sur enseignants requis">${f.firm}/${f.requis} ens.</span>`:f.requis>1?`<span class="cc-st ok">${f.firm}/${f.requis} ens.</span>`:'')+(f.pending.length?`<span class="cc-st info">${f.pending.length} cand.</span>`:'')+(f.remp.length?'<span class="cc-st warn">Remplacement</span>':'');}
  return moved+aff+(a.state==='done'?'<span class="cc-st ok">Présences faites</span>':a.state==='partial'?`<span class="cc-st warn">${a.marked}/${a.total} marqués</span>`:a.state==='todo'?'<span class="cc-st warn">Présences à faire</span>':'');
}
const cardTop=(time,kind,ch)=>`<span class="cc-top"><span class="cc-time">${time}</span><span class="cc-tr">${ch?`<span class="cc-chore-pill${ch==='maybe'?' maybe':''}" title="Corvée de ménage de la classe, toute la journée">${icon('broom')}<span class="vh">Corvée de ménage</span></span>`:''}${kind?`<span class="cc-kind">${esc(kind)}</span>`:''}</span></span>`;
function cardHTML(s,mode,dayChore){
  if(s.kind==='exam'){
    const e=s.e, meta=metaFor(s,mode), ti=s.c?s.c.titre:(e.titre||'Examen');
    return `<button type="button" class="cc exam kx" data-act="exam" data-id="${esc(e.id)}" data-key="${esc(s.key)}" title="${esc(`Examen · ${ti} · ${fmtT(s.start)} – ${fmtT(s.end)}`)}" aria-label="${esc(`Examen, ${ti}, ${fmtT(s.start)} à ${fmtT(s.end)}${meta?', '+meta:''}`)}">
      ${cardTop(momentOf(s),'Examen')}
      <span class="cc-title"><span class="tstart">${fmtT(s.start)}</span><span class="xtag">Examen</span><strong>${s.c?codeOf(s.c):''}${esc(ti)}</strong></span>${meta?`<span class="cc-meta">${esc(meta)}</span>`:''}</button>`;
  }
  const c=s.c, meta=metaFor(s,mode), drag=mode==='admin'&&isAdmin()&&!s.cancelled&&S.conn==='shared';
  const st=s.cancelled||mode==='student'?'':attInfo(s).state, dot=st==='done'||st==='todo'||st==='partial'?` data-st="${st}"`:'';
  const stTxt=st==='done'?'présences faites':st==='partial'?'présences commencées':st==='todo'?'présences à faire':'';
  const badge=s.cancelled&&s.movedX?['info',W('Séance déplacée','Cours déplacé')]:s.cancelled?['bad',W('Séance annulée','Cours annulé')]:profAbsent(s)?['bad','Enseignant absent']:null;
  const {kind,flags}=cardKind(tagsOf(s)), ch=dayChore?'':choreOf(s), foot=s.cancelled?'':cardStatus(s,mode)+flags.filter(t=>!CHORE_TAGS.has(t)).map(t=>`<span class="cc-flag">${esc(t)}</span>`).join('');
  const note=s.cancelled&&s.movedX?(s.movedX.date===s.date?movedLabel(s):`${movedLabel(s)}, ${momentIn(toMin(s.movedX.debut),toMin(s.movedX.fin)).replace(/^en /,'')}`):'';
  return `<button type="button" class="cc ${sessTone(s)}${s.cancelled?' cancelled':''}${badge?' has-badge':''}" data-act="sess" data-key="${esc(s.key)}" data-date="${s.date}" data-grp="${esc(s.grp||'')}"${dot}${drag?' data-drag="1"':''} title="${esc(`${c.titre} · ${fmtT(s.start)} – ${fmtT(s.end)}${meta?' · '+meta:''}${stTxt?' · '+stTxt:''}${drag?' · glisser pour déplacer':''}`)}" aria-label="${esc(`${c.titre}, ${fmtT(s.start)} à ${fmtT(s.end)}${meta?', '+meta:''}${s.cancelled?', '+(s.movedX?movedLabel(s):'annulé'):''}${ch?', corvée de ménage'+(ch==='maybe'?' à confirmer':''):''}`)}">
    ${cardTop(momentOf(s),kind,ch)}
    <span class="cc-title"><span class="tstart">${fmtT(s.start)}</span><strong>${codeOf(c)}${esc(c.titre)}</strong></span>${meta?`<span class="cc-meta">${esc(meta)}</span>`:''}${note?`<span class="cc-note">${esc(note)}</span>`:''}${foot?`<span class="cc-foot">${foot}</span>`:''}${badge?`<span class="cc-badge ${badge[0]}">${badge[1]}</span>`:''}</button>`;
}
function rowLabel(name){
  const m=/^(groupe|classe)\s+(.+)$/i.exec(String(name||''));
  return m?`<small>${esc(m[1].charAt(0).toUpperCase()+m[1].slice(1).toLowerCase())}</small>${esc(m[2])}`:esc(name);
}
function daytabsHTML(){
  const today=todayISO();let h='<div class="daytabs" role="group" aria-label="Jour affiché">';
  for(let i=0;i<5;i++){const d=addDays(S.week,i);h+=`<button type="button" id="day-${i}" data-act="day" data-i="${i}" aria-pressed="${S.day===i}" class="${iso(d)===today?'is-today':''}"><span>${DAYS[i].slice(0,3).toLowerCase()}.</span><strong>${d.getDate()}</strong></button>`;}
  return h+'</div>';
}
function expBtn(){
  const lbl=S.compact?'Agrandir : voir l’enseignant, le local et les présences de chaque '+W('séance','cours')+' (touche +)':'Réduire : deux lignes par '+W('séance','cours')+' pour tout voir d’un coup d’œil (touche −)';
  return `<button type="button" class="expander" id="exp-btn" data-act="toggle-size" aria-expanded="${!S.compact}" aria-label="${lbl}" title="${lbl}"><svg aria-hidden="true" viewBox="0 0 10 12" class="exp-arrow"><path d="M1 0.5 9.5 6 1 11.5Z" fill="currentColor"/></svg><span class="lbl">${S.compact?W('Agrandir les séances','Agrandir les cours'):W('Réduire les séances','Réduire les cours')}</span></button>`;
}
/* Vue « Jour » : les classes en colonnes, la journée en ligne */
function dayBoardHTML(list,cols){
  const ds=S.dayDate, d=parse(ds), off=offDay(ds), today=todayISO(), edit=isAdmin()&&S.conn==='shared';
  let h=`<div class="boardbox">${expBtn()}<div class="week day-board${S.compact?' compact':''}" style="grid-template-columns:118px repeat(${cols.length},minmax(0,1fr))" role="table" aria-label="${esc('Horaire du '+dayLabel(d).toLowerCase())}"><div class="wk-row wk-head" role="row"><div class="wk-corner" role="columnheader">Journée</div>`;
  for(const g of cols){
    const on=S.filtre==='g:'+g.id;
    h+=g.id?`<div class="wk-day day-col${on?' on':''}" role="columnheader"><button type="button" class="day-pick" id="dpick-${esc(g.id)}" data-act="filt" data-v="${on?'':'g:'+esc(g.id)}" aria-pressed="${on}" title="${esc(on?'Revenir à toutes les classes':'Afficher seulement '+g.name)}">${esc(g.name)}${principalOf(g.id)?`<small class="col-prin" title="Enseignant principal">${esc(shortName(tName(principalOf(g.id))))}</small>`:''}${on?'<small>← Toutes</small>':''}</button></div>`
      :`<div class="wk-day" role="columnheader">${esc(g.name)}</div>`;
  }
  h+=`</div><div class="wk-row" role="row"><div class="wk-class day-head${ds===today?' is-today':''}" role="rowheader"><small>${esc(WD[d.getDay()])}</small>${dn(d)} ${esc(fMonthS.format(d))}</div>`;
  for(const g of cols){
    const items=list.filter(x=>x.date===ds&&g.match(x));
    let inner;
    if(off) inner=`<div class="cc offday k7"><span class="cc-top"><span class="cc-kind">${off==='Hors année scolaire'?'Hors calendrier':'Congé'}</span></span><strong>${esc(off)}</strong><span class="cc-meta">${W('Aucune séance','Aucun cours')}</span></div>`;
    else if(!items.length) inner='<p class="cell-note">'+W('Aucune séance','Aucun cours')+'</p>';
    else inner=items.map(x=>cardHTML(x,'admin',!!g.id)).join('').replace(/ data-drag="1"/g,'');
    const ch=g.id&&!off?choreDay(g.id,ds):'';
    if(ch) inner=`<div class="cell-chore${ch==='maybe'?' maybe':''}" title="Corvée de ménage pour toute la classe, toute la journée">${icon('broom')}<span><b>Corvée de ménage${ch==='maybe'?' ?':''}</b><small>toute la journée</small></span></div>`+inner;
    if(edit&&g.id&&!off) inner+=`<button type="button" class="cell-add" data-act="add-at" data-date="${ds}" data-g="${esc(g.id)}" aria-label="${esc(W('Ajouter une séance pour ','Ajouter un cours pour ')+g.name)}">+ Ajouter</button>`;
    h+=`<div class="wk-cell${ds===today?' is-today':''}${ch?' chore'+(ch==='maybe'?' maybe':''):''}" role="cell">${inner}</div>`;
  }
  return h+'</div></div></div>';
}
function boardHTML(list,rows,mode,corner){
  const today=todayISO();
  let h=`<div class="boardbox">${expBtn()}<div class="week${S.compact?' compact':''}" role="table" aria-label="Horaire du lundi au vendredi"><div class="wk-row wk-head" role="row"><div class="wk-corner" role="columnheader">${esc(corner||'')}</div>`;
  for(let i=0;i<5;i++){const d=addDays(S.week,i);h+=`<div class="wk-day${iso(d)===today?' is-today':''}" role="columnheader">${DAYS[i]} ${dn(d)} ${fMonthS.format(d)}</div>`;}
  h+='</div>';
  const edit=mode==='admin'&&isAdmin()&&S.conn==='shared';
  for(const r of rows){
    const on=S.filtre==='g:'+r.id;
    h+=mode==='admin'&&r.id
      ?`<div class="wk-row" role="row"><div class="wk-class pick${on?' on':''}" role="rowheader"><button type="button" class="wk-pick" id="pick-${esc(r.id)}" data-act="filt" data-v="${on?'':'g:'+esc(r.id)}" aria-pressed="${on}" title="${esc(on?'Revenir à toutes les classes':'Afficher seulement '+r.name)}">${rowLabel(r.name)}${principalOf(r.id)?`<span class="row-prin" title="Enseignant principal">${esc(shortName(tName(principalOf(r.id))))}</span>`:''}<span class="pick-hint">${on?'← Toutes':'Voir seulement cette classe'}</span></button></div>`
      :`<div class="wk-row" role="row"><div class="wk-class" role="rowheader">${rowLabel(r.name)}</div>`;
    for(let i=0;i<5;i++){
      const ds=iso(addDays(S.week,i)), off=offDay(ds), items=list.filter(s=>s.date===ds&&r.match(s)), cg=mode==='admin'?r.id:mode==='student'?S.group:null;
      let inner;
      if(off) inner=`<div class="cc offday k7"><span class="cc-top"><span class="cc-kind">${off==='Hors année scolaire'?'Hors calendrier':'Congé'}</span></span><strong>${esc(off)}</strong><span class="cc-meta">${W('Aucune séance','Aucun cours')}</span></div>`;
      else if(!items.length) inner='<p class="cell-note">'+W('Aucune séance','Aucun cours')+'</p>';
      else inner=items.map(s=>cardHTML(s,mode,!!cg)).join('');
      // la corvée de ménage : une bande pour la classe, toute la journée
      const ch=cg&&!off?choreDay(cg,ds):'';
      if(ch) inner=`<div class="cell-chore${ch==='maybe'?' maybe':''}" title="Corvée de ménage pour toute la classe, toute la journée${ch==='maybe'?' (à confirmer)':''}">${icon('broom')}<span><b>Corvée de ménage${ch==='maybe'?' ?':''}</b><small>toute la journée</small></span></div>`+inner;
      if(edit&&r.id&&!off) inner+=`<button type="button" class="cell-add" data-act="add-at" data-date="${ds}" data-g="${esc(r.id)}" aria-label="${esc(`${W('Ajouter une séance','Ajouter un cours')} pour ${r.name}, ${DAYS[i].toLowerCase()} ${dn(addDays(S.week,i))}`)}">+ Ajouter</button>`;
      h+=`<div class="wk-cell${ds===today?' is-today':''}${S.day===i?' sel':''}${ch?' chore'+(ch==='maybe'?' maybe':''):''}" role="cell"${edit&&r.id?` data-date="${ds}" data-grp="${esc(r.id)}"${off?' data-off="1"':''}`:''}>${inner}</div>`;
    }
    h+='</div>';
  }
  return h+'</div></div>';
}
function rowHTML(s,mode){
  if(s.kind==='exam') return `<button type="button" class="lrow" data-act="exam" data-id="${esc(s.e.id)}"><span class="when">${momentShort(s)}</span><span class="what"><span class="ti">${s.c?codeOf(s.c):''}${esc(s.c?s.c.titre:s.e.titre)}</span><span class="sub">${esc(metaFor(s,mode))}</span></span><span class="chip exam">Examen</span></button>`;
  return `<button type="button" class="lrow${s.cancelled?' cancelled':''}" data-act="sess" data-key="${esc(s.key)}">
    <span class="when">${momentShort(s)}</span>
    <span class="what"><span class="ti">${codeOf(s.c)}${esc(s.c.titre)}${choreChip(s)}</span><span class="sub">${esc(metaFor(s,mode))}</span></span>${mode==='teacher'?statusChip(s,mode):(s.cancelled?'<span class="chip off">Annulé</span>':'')}</button>`;
}

const profAbsent=s=>{if(!s||s.kind==='exam'||!s.c)return false;const abs=S.data.absProfs[s.date]||[];return (s.tch||[]).some(t=>t&&abs.includes(t));};
/* Les enseignants d’un cours, en court : « M. Leduc +1 » */
const tchLabel=s=>{const ids=(s.tch||[]).filter(t=>t&&byId(S.data.enseignants,t));return ids.length?shortName(tName(ids[0]))+(ids.length>1?' +'+(ids.length-1):''):'À assigner';};
const tchNames=s=>{const ids=(s.tch||[]).filter(t=>t&&byId(S.data.enseignants,t));return ids.length?ids.map(tName).join(', '):'À assigner';};
