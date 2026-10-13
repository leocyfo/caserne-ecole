/* ---------- Pages : classes ---------- */
const dis=()=>S.busy?' disabled':'';
function confirmBox(text,yesAct,id){return `<div class="confirm"><p>${text}</p><div class="row"><button class="btn sm danger" type="button" data-act="${yesAct}" data-id="${esc(id)}"${dis()}>Supprimer</button><button class="btn sm ghost" type="button" data-act="m-ask-no">Annuler</button></div></div>`;}
/* ---------- Classes : cartes, puis fiche de la classe en pleine page ---------- */
/* Avancement de l’année d’une classe : séances déjà passées sur toutes les séances à l’horaire */
function classProgress(gid){
  const t=todayISO();let total=0,done=0;
  for(const c of S.data.cours.filter(c=>c.groupe===gid)) for(const x of datedOf(c)){
    if((c.annulees||[]).includes(`${x.date}@${x.id}`)||offDay(x.date)) continue;
    total++;if(x.date<t)done++;
  }
  return {total,done,pct:total?Math.round(done/total*100):null};
}
const rateCls=r=>r==null?'':r>=95?'ok':r>=90?'warn':'bad';
function classesPage(){
  if(S.pg.fiche) return classFiche();
  const st=S.pg, gs=groups(), ts=teachers(), per=st.period||'mois', [from,to]=periodRange(per);
  ensureTerm(from);
  const stats=studentStats(from,to), sess=S.termLoaded?sessionsBetween(from,to).filter(s=>!s.cancelled&&isPast(s)):[];
  const add=st.adding?`<section class="panel cl-add"><form class="inline-add" data-form="m-add-group"><label class="field"><span>Nom de la nouvelle classe</span><input id="m-gname" maxlength="60" placeholder="Ex. Classe 124" autocomplete="off"></label><button class="btn primary" type="submit"${dis()}>Ajouter</button><button class="btn ghost" type="button" data-act="m-adding">Annuler</button></form></section>`:'';
  const tb=`<div class="toolbar"><p class="summary" style="margin:0"><span><b>${gs.length}</b>${gs.length>1?'classes':'classe'}</span><span><b>${S.data.eleves.length}</b>${S.data.eleves.length>1?'élèves':'élève'}</span></p><span class="grow"></span>${periodSeg(per)}${isAdmin()&&!st.adding?`<button class="btn primary" type="button" id="m-add-open" data-act="m-adding">${icon('plus')}Ajouter une classe</button>`:''}</div>`;
  if(!gs.length) return tb+add+(st.adding?'':emptyBox('Aucune classe pour l’instant','Ajoutez une classe, puis inscrivez ses élèves et planifiez ses cours.'));
  const rows=gs.map(g=>{
    const x=classAtt(g.id,from,to,stats,sess), pr=classProgress(g.id), pid=principalOf(g.id), c=rateCls(x.rate), n=x.els.length;
    const num=String(g.nom).replace(/^(Classe|Groupe)\s+/i,'').slice(0,4);
    const prin=isAdmin()?`<label class="vh" for="m-pr-${esc(g.id)}">${esc('Enseignant principal de '+g.nom)}</label><select id="m-pr-${esc(g.id)}" data-gp="${esc(g.id)}"${dis()}><option value="">Aucun enseignant principal</option>${ts.map(t=>`<option value="${esc(t.id)}"${g.principal===t.id?' selected':''}>${esc(t.nom)}</option>`).join('')}</select>`:pid?`<b>${esc(tName(pid))}</b>`:'<b class="none-t">Aucun</b>';
    const rate=!S.termLoaded?'<b class="none">…</b>':x.rate==null?'<b class="none">—</b>':`<b>${x.rate} %</b><div class="meter ${c}" aria-hidden="true"><i style="width:${x.rate}%"></i></div><small class="cl-basis">${x.done} ${W('séances prises','cours pris')} sur ${x.past}</small>`;
    const adv=pr.total?`<b>${pr.pct} %</b><div class="meter" aria-hidden="true"><i style="width:${pr.pct}%"></i></div>`:'<b class="none">—</b>';
    const state=!n?'<span class="chip off">Aucun élève</span>':!S.termLoaded?'':x.missing.length?`<span class="chip warn" title="${esc(pl(x.missing.length,W('séance sans présences','cours sans présences'),W('séances sans présences','cours sans présences')))}">${x.missing.length} à rattraper</span>`:x.past?'<span class="chip ok">À jour</span>':'';
    return `<article class="cl-row cl-cols" id="cl-${esc(g.id)}" data-act="class" data-id="${esc(g.id)}" tabindex="0" role="button" aria-label="${esc('Ouvrir '+g.nom)}">
      <div class="cl-c"><span class="cl-num" aria-hidden="true">${esc(num)}</span><span class="cl-name"><b>${esc(g.nom)}</b>${g.description?`<small>${esc(g.description)}</small>`:''}</span></div>
      <div class="cl-prin" data-act="stop" data-l="Enseignant principal">${pid?avHTML(tName(pid),''):'<span class="av none" aria-hidden="true">?</span>'}${prin}</div>
      <div class="cl-n${n?'':' zero'}" data-l="Élèves">${n}</div>
      <div class="cl-big cl-rate ${c}" data-l="Présence">${rate}</div>
      <div class="cl-big cl-adv" data-l="Avancement">${adv}</div>
      <div class="cl-st" data-l="Suivi des présences">${state}</div>
      <div class="cl-go"><button class="btn sm" type="button" data-act="see-group" data-id="${esc(g.id)}" title="Voir l’horaire" aria-label="${esc('Horaire de '+g.nom)}">${icon('cal')}<span class="cl-go-t">Horaire</span></button>${icon('right')}</div>
    </article>`;
  }).join('');
  const hd='<div class="cl-hd cl-cols" aria-hidden="true"><span>Classe</span><span>Enseignant principal</span><span class="n">Élèves</span><span>Présence</span><span class="cl-adv">Avancement</span><span>Suivi</span><span></span></div>';
  return tb+add+`<div class="cl-list">${hd}${rows}</div>`;
}
function classFiche(){
  const g=byId(S.data.groupes,S.pg.fiche);
  // une classe qui vient d’être ajoutée arrive un instant plus tard
  if(!g&&S.pg.justAdded===S.pg.fiche) return '<p class="help">Ouverture de la classe…</p>';
  if(!g){S.pg.fiche=null;return classesPage();}
  if(S.pg.justAdded===g.id) S.pg.justAdded=null;
  const list=groups(), ts=teachers(), per=S.pg.period||'mois', [from,to]=periodRange(per);
  ensureTerm(from);
  const stats=studentStats(from,to), sess=S.termLoaded?sessionsBetween(from,to).filter(s=>!s.cancelled&&isPast(s)):[], x=classAtt(g.id,from,to,stats,sess), els=x.els;
  const cs=S.data.cours.filter(c=>c.groupe===g.id).sort((a,b)=>collator.compare(a.code||'',b.code||'')||collator.compare(a.titre||'',b.titre||''));
  const pr=classProgress(g.id), ex=upcomingExams(y=>y.grp===g.id,1)[0], pid=principalOf(g.id);
  const numOf=y=>String(y.nom).replace(/^(Classe|Groupe)\s+/i,'').slice(0,4);
  const item=y=>`<span class="fl-row"><span class="cl-num sm" aria-hidden="true">${esc(numOf(y))}</span><span class="fl-txt"><span class="fl-name">${esc(y.nom)}</span><span class="fl-sub">${pl(studentsOf(y.id).length,'élève','élèves')}${principalOf(y.id)?' · '+esc(shortName(tName(principalOf(y.id)))):''}</span></span></span>`;
  const chips=`${g.description?`<span class="chip off">${esc(g.description)}</span>`:''}<span class="chip ${pid?'k0':'off'}">${pid?'Enseignant principal · '+esc(tName(pid)):'Sans enseignant principal'}</span>`;
  const curTab=S.pg.tab||'eleves', actions=`${curTab==='eleves'||curTab==='rattraper'?periodSeg(per):''}<button class="btn sm" type="button" data-act="see-group" data-id="${esc(g.id)}">${icon('cal')}Voir l’horaire</button><button class="btn sm" type="button" id="cl-print" data-act="pr-open" data-g="${esc(g.id)}">${icon('print')}Imprimer</button>`;
  const stat=[['Élèves',String(els.length),''],['Présence',!S.termLoaded?'…':x.rate==null?'—':x.rate+' %',rateCls(x.rate)],['À rattraper',String(x.missing.length),x.missing.length?'warn':''],['Avancement',pr.pct==null?'—':pr.pct+' %',''],['Prochain examen',ex?esc(dn(parse(ex.date))+' '+fMonthS.format(parse(ex.date))):'Aucun','']];
  const head=ficheHead(g.nom,chips,actions,stat,`<span class="cl-num lg" aria-hidden="true">${esc(numOf(g))}</span>`);
  const content=tab=>{
    if(tab==='examens') return classExamsTab(g);
    if(tab==='rattraper') return !S.termLoaded?'<section class="panel"><p class="help">Chargement des présences…</p></section>':!els.length?'<section class="panel"><p class="help">Aucun élève dans cette classe : il n’y a pas de présences à prendre.</p></section>':x.missing.length?`<div class="st-bar"><p class="summary"><span class="need"><b>${x.missing.length}</b>${x.missing.length>1?W('séances sans présences','cours sans présences'):W('séance sans présences','cours sans présences')}</span></p></div><div class="cl-list miss-list">${x.missing.map(missRow).join('')}</div>`:'<div class="cl-list"><p class="miss-ok"><span class="chip ok">À jour</span>Toutes les présences de la période sont prises.</p></div>';
    if(tab==='cours'){
      const A=acad(), mods=cs.filter(c=>!isActivity(c)), acts=cs.filter(isActivity);
      const tbl=(list,name,act)=>`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${name}</th><th class="num">${A?(act?'Jours':'Séances'):'Périodes'}</th><th class="num">Heures</th><th>${A?(act?'Responsable':'Chargé de cours'):'Enseignant'}</th><th>Local</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><span class="row" style="gap:6px;flex-wrap:nowrap">${c.code?`<span class="chip ${tone(c)}">${esc(c.code)}</span>`:''}<b>${esc(c.titre)}</b></span></td><td class="num">${courseLoad(c).label}</td><td class="num">${courseLoad(c).hours}</td><td>${A&&!act?(c.enseignant&&byId(S.data.enseignants,c.enseignant)?esc(tName(c.enseignant)):'<span class="muted">À choisir</span>'):`<select data-assign="${esc(c.id)}" aria-label="${esc((A?'Responsable de ':'Enseignant de ')+c.titre)}"${dis()}><option value="">À assigner</option>${ts.map(t=>`<option value="${esc(t.id)}"${c.enseignant===t.id?' selected':''}>${esc(t.nom)}</option>`).join('')}</select>`}</td><td>${esc(c.salle||'—')}</td><td class="num">${A&&modOf(c)?`<button class="btn sm ghost" type="button" data-act="module" data-id="${esc(modOf(c).code)}" data-g="${esc(g.id)}">Ouvrir</button>`:`<button class="btn sm ghost" type="button" data-act="edit-course" data-id="${esc(c.id)}">Modifier</button>`}</td></tr>`).join('')}</tbody></table></div>`;
      return `<section class="panel">${mods.length?tbl(mods,A?'Module':'Cours'):`<p class="help">${A?'Aucun module pour cette classe.':'Aucun cours pour cette classe.'}</p>`}
        ${acts.length?`<h3 class="fiche-h3">Activités</h3>${tbl(acts,'Activité',true)}`:''}
        ${isAdmin()?`<div class="row" style="margin-top:12px"><button class="btn sm" type="button" data-act="new-course" data-g="${esc(g.id)}">${icon('plus')}${A?'Ajouter une séance à '+esc(g.nom):'Planifier un cours pour '+esc(g.nom)}</button>${A?`<button class="btn sm" type="button" id="cp-open" data-act="pg-set" data-k="cpo" data-v="${S.pg.cpo?'':'1'}" aria-expanded="${!!S.pg.cpo}">Copier l’horaire d’une autre classe</button>`:''}</div>${A&&S.pg.cpo?copyPanel(g):''}`:''}</section>`;
    }
    if(tab==='reglages'){
      const conf=S.pg.ask===g.id;
      return `<div class="fiche-two"><section class="panel"><h2>La classe</h2><form class="stackf" data-form="m-save-group" data-g="${esc(g.id)}">
          <label class="field"><span>Nom</span><input id="m-gnom" value="${esc(g.nom)}" maxlength="60" autocomplete="off"></label>
          <label class="field"><span>Description</span><input id="m-gdesc" value="${esc(g.description||'')}" maxlength="120" placeholder="Ex. Intervention en sécurité incendie" autocomplete="off"></label>
          <label class="field"><span>Enseignant principal</span><select id="m-pr-fiche" data-gp="${esc(g.id)}"${dis()}><option value="">Aucun</option>${ts.map(t=>`<option value="${esc(t.id)}"${g.principal===t.id?' selected':''}>${esc(t.nom)}</option>`).join('')}</select></label>
          <div class="row"><button class="btn primary" type="submit"${dis()}>Enregistrer</button></div></form></section>
        <section class="panel"><h2>Supprimer la classe</h2><p class="help">Ses ${pl(els.length,'élève est retiré','élèves sont retirés')} de l’école. ${W('Ses séances','Ses cours')} restent à l’horaire, sans classe.</p>
          ${conf?confirmBox(`Supprimer ${esc(g.nom)} et ${pl(els.length,'élève','élèves')} ?`,'m-del-g',g.id):`<div class="row" style="margin-top:10px"><button class="btn sm danger" type="button" data-act="m-ask" data-id="${esc(g.id)}"${dis()}>Supprimer la classe</button></div>`}</section></div>`;
    }
    const ev=S.pg.enrol, enrol=isAdmin()&&(ev===g.id?true:ev==='non:'+g.id?false:!els.length);
    const nOf=e=>e.numero!=null&&e.numero!==''&&!isNaN(+e.numero)?+e.numero:1e9;
    const sorted=els.slice().sort((a,b)=>nOf(a)-nOf(b)||collator.compare(a.nom||'',b.nom||''));
    let nA=0,nR=0;for(const e of els){const s=stats[e.id];if(s){if(s.A+s.M)nA++;if(s.R)nR++;}}
    const bar=`<div class="st-bar"><p class="summary"><span><b>${els.length}</b>${els.length>1?'élèves':'élève'}</span>${els.length&&S.termLoaded?`<span class="${nA?'need':''}"><b>${nA}</b>${nA>1?'avec absences':'avec absence'}</span><span><b>${nR}</b>${nR>1?'avec retards':'avec retard'}</span>`:''}</p><span class="grow"></span>${isAdmin()&&!enrol?`<button class="btn primary" type="button" id="m-enrol-open" data-act="pg-set" data-k="enrol" data-v="${esc(g.id)}">${icon('plus')}Inscrire des élèves</button>`:''}</div>`;
    const form=enrol?`<section class="panel st-enrol"><form data-form="m-add-els" data-g="${esc(g.id)}"><label class="field"><span>Nouveaux élèves de ${esc(g.nom)} — un élève par ligne</span><textarea id="m-bulk-${esc(g.id)}" rows="5" placeholder="Prénom Nom"></textarea></label><p class="help" style="margin:6px 0 10px">Écrivez les noms, collez une liste (les cellules copiées d’Excel fonctionnent) ou choisissez un fichier CSV. Colonnes reconnues : numéro, nom (ou prénom et nom), courriel, téléphone. La première ligne peut contenir les titres.</p><input type="file" id="m-file-${esc(g.id)}" data-imp="${esc(g.id)}" accept=".csv,.txt,.tsv,text/csv,text/plain" hidden><div class="row"><button class="btn primary" type="submit"${dis()}>Inscrire</button><button class="btn" type="button" id="m-file-btn" data-act="m-file" data-g="${esc(g.id)}">${icon('up')}Choisir un fichier</button>${els.length?`<button class="btn ghost" type="button" data-act="pg-set" data-k="enrol" data-v="non:${esc(g.id)}">Annuler</button>`:''}</div></form></section>`:'';
    if(!els.length) return bar+form+(enrol?'':'<section class="panel"><p class="help">Aucun élève pour l’instant.</p></section>');
    const rows=sorted.map(e=>{const s=stats[e.id],r=rateOf(s),a=s?s.A+s.M:0,rt=s?s.R:0;
      const rate=!S.termLoaded?'<b class="none">…</b>':r==null?'<b class="none">—</b>':`<b>${r} %</b><div class="meter ${rateCls(r)}" aria-hidden="true"><i style="width:${r}%"></i></div>`;
      return `<article class="st-row st-cols" data-act="student" data-id="${esc(e.id)}" tabindex="0" role="button" aria-label="${esc('Ouvrir la fiche de '+e.nom)}">
        <span class="st-num" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span>
        <div class="st-name"><b>${esc(e.nom)}</b>${e.fonction?`<span class="role-chip">${esc(e.fonction)}</span>`:''}</div>
        <div class="cl-big st-rate ${rateCls(r)}" data-l="Présence">${rate}</div>
        <div class="st-n st-a ${a?'bad':'zero'}" data-l="Absences">${a}</div>
        <div class="st-n st-r ${rt?'warn':'zero'}" data-l="Retards">${rt}</div>
        <div class="st-x">${isAdmin()?`<button type="button" class="x" data-act="m-del-el" data-id="${esc(e.id)}" aria-label="${esc('Retirer '+e.nom)}" title="Retirer de la classe"${dis()}>×</button>`:''}</div>
      </article>`;}).join('');
    return bar+form+`<div class="cl-list st-list"><div class="st-hd st-cols" aria-hidden="true"><span>N°</span><span>Élève</span><span>Présence</span><span class="n">Absences</span><span class="n">Retards</span><span></span></div>${rows}</div>`;
  };
  return ficheShell('classes',list,g,item,head,[['eleves','Élèves'],['rattraper',`À rattraper${x.missing.length?' · '+x.missing.length:''}`],['examens','Examens'],['cours',acad()?'Modules':'Cours'],['reglages','Réglages']],content);
}

function courseLoad(c){
  const w=activeSlots(c).length, dated=datedOf(c), ann=c.annulees||[];
  const mins=dated.reduce((n,x)=>n+(ann.includes(`${x.date}@${x.id}`)?0:sessMinutes(x)),0), h=Math.round(mins/60);
  const label=w&&!dated.length?`${w} / sem.`:dated.length?String(dated.length)+(w?` + ${w} / sem.`:''):'—';
  const hp=heuresOf(c), hours=hp?`<span class="chip ${h>=hp?'ok':h>=hp*0.8?'warn':'bad'}" title="Heures planifiées / heures prévues au programme">${h} / ${hp} h</span>`:dated.length?`${h} h`:'—';
  return {label,hours};
}

