/* ---------- Affectation des enseignants : requis, candidatures, remplacements, disponibilités ----------
   candidatures/<séance__enseignant> : { seance, cours, groupe, date, debut, fin, enseignant, statut }
     statut : attente (a postulé) · approuve · refuse · retire (retiré de ce cours par l’administration)
   remplacements/<séance__enseignant> : l’enseignant attribué demande à être remplacé ({ motif })
   disponibilites/<enseignant> : { jours : { '2026-10-13' : 'J' | 'AM' | 'PM' } }
   Le titulaire du module (cours.enseignant) donne tous ses cours, sauf ceux dont on l’a retiré. */
const candId=(key,tid)=>(String(key)+'__'+String(tid)).replace(/[^A-Za-z0-9_-]/g,'-');
let _aff=null;
function affIdx(){
  const a=S.data.candidatures, r=S.data.remplacements;
  if(_aff&&_aff.a===a&&_aff.r===r) return _aff;
  const by={}, rp={};
  for(const d of a)(by[d.seance]||(by[d.seance]=[])).push(d);
  for(const d of r) rp[d.seance+'|'+d.enseignant]=d;
  return _aff={a,r,by,rp};
}
/* Module du programme (menu Modules) d’un cours, d’après son sigle « M7 » */
const modKey=c=>{const m=/^M?(\d+)$/i.exec(String(c&&c.code||'').trim());return m?+m[1]:null;};
const modOf=c=>{const k=modKey(c);return k==null?null:comps().find(x=>+x.code===k)||null;};
/* Enseignants requis : ceux du cours du module que la séance donne (le plus grand s’il y en a plusieurs).
   Pour un examen, une reprise ou une activité : la valeur réglée sur la séance, sinon 1 (0 pour une activité). */
const reqOf=s=>{const x=s.extra||s.sl||{}, m=modOf(s.c), ks=m?xCours(m,x):[];if(ks.length)return Math.max(...ks.map(cReq));if(x.requis!=null&&x.requis!=='')return Math.max(0,+x.requis||0);if(isActivity(s.c))return 0;return m&&+m.requis>0?+m.requis:1;};
const linkedX=s=>!!(s&&s.extra&&acad()&&xCours(modOf(s.c),s.extra).length);
function tchOf(c,key){
  const cs=affIdx().by[key];if(!cs) return [c.enseignant];
  const out=[];
  if(c.enseignant&&!cs.some(d=>d.enseignant===c.enseignant&&d.statut==='retire')) out.push(c.enseignant);
  for(const d of cs) if(d.statut==='approuve'&&!out.includes(d.enseignant)) out.push(d.enseignant);
  return out;
}
function staffing(s){
  const I=affIdx(), cs=I.by[s.key]||[], st={}, known=id=>!!byId(S.data.enseignants,id);
  for(const d of cs) st[d.enseignant]=d.statut;
  const assigned=s.tch.filter(id=>id&&known(id));
  const pending=cs.filter(d=>d.statut==='attente'&&known(d.enseignant)).map(d=>d.enseignant);
  const remp=assigned.filter(t=>I.rp[s.key+'|'+t]);
  const requis=reqOf(s), firm=assigned.length-remp.length, clash=isPast(s)?[]:assigned.filter(t=>busyAt(t,s));
  return {requis,assigned,pending,remp,st,firm,clash,rclash:isPast(s)?[]:ressClash(s),open:Math.max(0,requis-firm)};
}
const DISPO={J:'Toute la journée',AM:'Avant-midi',PM:'Après-midi'};
const dispoOf=(tid,ds)=>{const d=S.data.dispos[tid];return (d&&d.jours&&d.jours[ds])||'';};
const dispoCovers=(v,s)=>v==='J'||(v==='AM'&&momentOf(s)==='Avant-midi')||(v==='PM'&&momentOf(s)==='Après-midi');
const hasComp=(t,c)=>{const k=modKey(c);return k==null||((t&&t.competences)||[]).some(x=>+x===k);};
/* Le même module donné à deux classes au même moment n’est pas un conflit : l’enseignant a les deux classes ensemble */
const sameMod=(a,b)=>acad()&&modKey(a)!=null&&modKey(a)===modKey(b);
const busyAt=(tid,s)=>sessionsOn(s.date).some(o=>o.key!==s.key&&!o.cancelled&&o.tch.includes(tid)&&o.start<s.end&&s.start<o.end&&!sameMod(o.c,s.c));
const sHours=s=>Math.round((s.extra?sessMinutes(s.extra):s.end-s.start)/6)/10;
const sTitle=s=>`${codeOf(s.c)}${esc(s.c.titre)}`;
const sSub=s=>esc([sessLabel(s),cardKind(tagsOf(s)).kind].filter(Boolean).join(' · '));
const sAria=s=>`${s.c.titre} · ${dayLabel(parse(s.date))} · ${gName(s.grp)}`;
const sAt=s=>`data-key="${esc(s.key)}" data-date="${s.date}"`;
const sHot=s=>daysBetween(todayISO(),s.date)<=2?'hot':'';
const sDay=s=>{const d=parse(s.date);return `${WD[d.getDay()]} ${dn(d)} ${fMonthS.format(d)}`;};
const weekCount=(tid,mon)=>{let n=0;for(let i=0;i<5;i++)for(const x of sessionsOn(iso(addDays(mon,i))))if(!x.cancelled&&x.tch.includes(tid))n++;return n;};
function upcomingSessions(days){return sessionsBetween(todayISO(),iso(addDays(new Date(),days))).filter(s=>s.kind==='cours'&&!s.cancelled&&!isPast(s));}
const candDoc=(s,tid,statut)=>({seance:s.key,cours:s.c.id,groupe:s.grp||'',date:s.date,debut:s.sl.debut,fin:s.sl.fin,enseignant:tid,statut,maj:new Date().toISOString()});
const affTile=(k,key,tab,lbl,val,cls,sub)=>`<button type="button" class="xm-tile" id="${k}-${key}" data-act="pg-set" data-k="${k}" data-v="${key}" aria-pressed="${tab===key}"><span class="lbl">${lbl}</span><b class="${cls}">${val}</b><small>${sub}</small></button>`;

/* ---------- Enseignant : mes cours (à pourvoir, en attente, attribués, donnés) ---------- */
function teacherBoard(tid){
  const t=byId(S.data.enseignants,tid)||{}, I=affIdx(), open=[], wait=[], mine=[];let noDispo=0;
  for(const s of upcomingSessions(150)){
    const st=staffing(s), my=st.st[tid];
    if(st.assigned.includes(tid)){mine.push({s,st,remp:I.rp[s.key+'|'+tid]||null});continue;}
    if(my==='attente'||my==='refuse'){wait.push({s,st,v:my});continue;}
    if(my==='retire'||st.open<=0||!hasComp(t,s.c)||onLeave(t)) continue;
    if(!dispoCovers(dispoOf(tid,s.date),s)){noDispo++;continue;}
    if(busyAt(tid,s)) continue;
    open.push({s,st});
  }
  const past=sessionsBetween(yearStart(),todayISO()).filter(s=>s.kind==='cours'&&!s.cancelled&&isPast(s)&&s.tch.includes(tid)).sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start);
  return {t,open,wait,mine,past,noDispo};
}
function myCoursesPage(){
  if(!teachers().length) return emptyBox('Aucun enseignant inscrit','L’administration ajoute les enseignants dans le menu Personnel.');
  const tid=S.teacher, st=S.pg, B=teacherBoard(tid), tab=['open','wait','mine','past'].includes(st.mt)?st.mt:'open', can=S.conn==='shared';
  const nWait=B.wait.filter(x=>x.v==='attente').length, nRef=B.wait.length-nWait, nx=B.mine[0], hrs=Math.round(B.past.reduce((n,s)=>n+sHours(s),0));
  const myMods=((B.t.competences||[]).map(Number).filter(n=>!isNaN(n)).sort((a,b)=>a-b));
  const hasDispo=Object.keys((S.data.dispos[tid]||{}).jours||{}).some(d=>d>=todayISO());
  const tb=`<div class="toolbar">${identitySelect()}<p class="summary" style="margin:0"><span>${myMods.length?`Vos modules : <b style="font-size:14px">${esc(myMods.map(n=>'M'+n).join(', '))}</b>`:'Aucun module inscrit à vos compétences'}</span></p><span class="grow"></span><button class="btn" type="button" id="go-dispos" data-act="nav" data-page="dispos">${icon('calok')}Mes disponibilités</button></div>`;
  const tiles=`<div class="xm-tiles" role="group" aria-label="${W('Mes séances','Mes cours')}">
    ${affTile('mt','open',tab,'À pourvoir',B.open.length,'','selon vos disponibilités')}
    ${affTile('mt','wait',tab,'En attente de réponse',nWait,nWait?'warn':'',nRef?pl(nRef,'candidature refusée','candidatures refusées'):nWait?(nWait>1?'candidatures envoyées':'candidature envoyée'):'Aucune candidature')}
    ${affTile('mt','mine',tab,W('Séances attribuées','Cours attribués'),B.mine.length,'',nx?'Prochain : '+esc(sDay(nx.s).toLowerCase()):W('Aucune séance à venir','Aucun cours à venir'))}
    ${affTile('mt','past',tab,W('Séances données','Cours donnés'),B.past.length,'',B.past.length?`${hrs} h depuis la rentrée`:'Aucun pour l’instant')}
  </div>`;
  const head=[['Date'],[W('Séance','Cours')],['Classe'],['Moment'],['','r']];
  const cells=(s,end)=>`${xDate(s,sHot(s))}<div class="xm-t"><b>${sTitle(s)}</b>${sSub(s)?`<small>${sSub(s)}</small>`:''}</div>${xCls(s)}<span class="xm-m">${esc(momentOf(s))}</span><div class="xm-end">${end}</div>`;
  let body='';
  if(tab==='open'){
    body=B.open.length?xList('xm-a5',head,B.open.map(({s,st})=>xRow('xm-a5','',cells(s,`${st.requis>1?`<span class="chip off">${st.firm} sur ${st.requis}</span>`:''}${can?`<button class="btn sm" type="button" data-act="af-apply" ${sAt(s)}${dis()}>${icon('plus')}Postuler</button>`:''}`),'')).join(''))
      :onLeave(B.t)?emptyBox('Vous êtes en congé',W('Les séances à pourvoir vous seront proposées à votre retour.','Les cours à pourvoir vous seront proposés à votre retour.'))
      :!myMods.length?emptyBox('Vos compétences ne sont pas encore inscrites','L’administration indique dans votre dossier les modules que vous pouvez donner. '+W('Les séances','Les cours')+' à pourvoir apparaîtront ici ensuite.')
      :!hasDispo?emptyBox('Indiquez vos disponibilités',W('Les séances à pourvoir sont proposées selon les jours où vous êtes disponible.','Les cours à pourvoir sont proposés selon les jours où vous êtes disponible.'),`<button class="btn primary" type="button" data-act="nav" data-page="dispos">${icon('calok')}Indiquer mes disponibilités</button>`)
      :`<section class="panel"><p class="help">${W('Aucune séance','Aucun cours')} à pourvoir les jours où vous êtes disponible.${B.noDispo?` ${pl(B.noDispo,W('séance cherche','cours cherche'),W('séances cherchent','cours cherchent'))} un enseignant d’autres jours : ajoutez des disponibilités pour les voir.`:''}</p></section>`;
  }else if(tab==='wait'){
    body=B.wait.length?xList('xm-a5',head,B.wait.map(({s,v})=>xRow('xm-a5','',cells(s,v==='attente'?`<span class="chip warn">En attente</span>${can?`<button class="btn sm ghost" type="button" data-act="af-withdraw" ${sAt(s)}${dis()}>Retirer</button>`:''}`:'<span class="chip bad">Refusée</span>'),'')).join(''))
      :'<section class="panel"><p class="help">Aucune candidature en attente.</p></section>';
  }else if(tab==='mine'){
    const lim=+st.lim||25;
    body=B.mine.length?xList('xm-a5',head,B.mine.slice(0,lim).map(({s,remp})=>{
        const ask=st.rp===s.key&&!remp;
        return xRow('xm-a5','',cells(s,remp?`<span class="chip warn">Remplacement demandé</span>${can?`<button class="btn sm ghost" type="button" data-act="af-remp-cancel" ${sAt(s)}${dis()}>Annuler</button>`:''}`:can&&!ask?`<button class="btn sm" type="button" data-act="pg-set" data-k="rp" data-v="${esc(s.key)}">Demander un remplacement</button>`:''),'')
          +(ask?`<form class="xm-row af-ask" data-form="af-remp" ${sAt(s)}><label class="field"><span>Raison du remplacement (facultatif)</span><input id="rp-motif" maxlength="140" autocomplete="off" placeholder="Ex. garde en caserne ce jour-là"></label><button class="btn sm primary" type="submit"${dis()}>Envoyer la demande</button><button class="btn sm ghost" type="button" data-act="pg-set" data-k="rp" data-v="">Annuler</button></form>`:'');}).join(''))
        +(B.mine.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+25}">Afficher plus (${B.mine.length-lim})</button></div>`:'')
      :`<section class="panel"><p class="help">${W('Aucune séance attribuée','Aucun cours attribué')} à venir.</p></section>`;
  }else{
    const lim=+st.lim||25;
    body=B.past.length?xList('xm-a5',head,B.past.slice(0,lim).map(s=>xRow('xm-a5','',cells(s,`<span class="xm-m">${String(sHours(s)).replace('.',',')} h</span>`),'')).join(''))
        +(B.past.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+25}">Afficher plus (${B.past.length-lim})</button></div>`:'')
      :`<section class="panel"><p class="help">${W('Aucune séance donnée','Aucun cours donné')} depuis la rentrée.</p></section>`;
  }
  return tb+tiles+body;
}

/* ---------- Disponibilités : un mois, du lundi au vendredi ; un clic change la journée ---------- */
function dispoDraft(tid){
  const st=S.pg, doc=S.data.dispos[tid];
  if(!st.dd||st.dd.tid!==tid||!st.dd.dirty) st.dd={tid,jours:Object.assign({},(doc&&doc.jours)||{}),dirty:false,maj:doc&&doc.maj};
  return st.dd;
}
function dispoMonthDays(ym){
  const [Y,M]=ym.split('-').map(Number), out=[];
  for(let d=new Date(Y,M-1,1);d.getMonth()===M-1;d=addDays(d,1)){const j=(d.getDay()+6)%7;if(j<5)out.push({d,ds:iso(d),j});}
  return out;
}
const dispoLocked=ds=>ds<todayISO()||!!offDay(ds);
function dispoCalHTML(tid,edit){
  const st=S.pg, ym=/^\d{4}-\d{2}$/.test(st.dm||'')?st.dm:todayISO().slice(0,7), [Y,M]=ym.split('-').map(Number);
  const dr=dispoDraft(tid), days=dispoMonthDays(ym), today=todayISO(), mName=fMonth.format(new Date(Y,M-1,1));
  const mine=new Set();for(const {ds} of days) if(sessionsOn(ds).some(s=>!s.cancelled&&s.tch.includes(tid))) mine.add(ds);
  let n=0;for(const {ds} of days) if(dr.jours[ds]) n++;
  const first=days[0], lead=first?first.j:0;
  let cells='';for(let i=0;i<lead;i++) cells+='<span class="dp-x" aria-hidden="true"></span>';
  for(const {d,ds,j} of days){
    const v=dr.jours[ds]||'', off=offDay(ds), lock=dispoLocked(ds);
    cells+=`<button type="button" class="dp-c${v?' on v-'+v:''}${ds<today?' past':''}${off?' off':''}${ds===today?' is-today':''}" id="dp-${ds}" data-act="dp-day" data-date="${ds}"${edit&&!lock?'':' disabled'} aria-label="${esc(`${dayLabel(d)} : ${off||DISPO[v]||'non disponible'}${mine.has(ds)?W(', séance attribuée',', cours attribué'):''}`)}"><b>${d.getDate()}</b><span>${off?esc(off):v?DISPO[v]:'—'}</span>${mine.has(ds)?`<i class="dp-dot" title="${W('Séance attribuée','Cours attribué')} ce jour-là"></i>`:''}</button>`;
  }
  let state='Aucune modification';if(dr.dirty)state='Modifications non enregistrées';else if(dr.maj){const t=new Date(dr.maj);if(!isNaN(t))state=`Enregistrées le ${shortDate(t)}`;}
  return `<div class="toolbar dp-bar"><div class="weeknav"><button class="icon-btn" type="button" id="dp-prev" data-act="dp-month" data-n="-1" aria-label="Mois précédent">${icon('left')}</button><span class="range" id="dp-month">${esc(mName.charAt(0).toUpperCase()+mName.slice(1))} ${Y}</span><button class="icon-btn" type="button" id="dp-next" data-act="dp-month" data-n="1" aria-label="Mois suivant">${icon('right')}</button></div>
      <p class="summary" style="margin:0"><span><b>${n}</b>${n>1?'jours disponibles':'jour disponible'}</span></p><span class="grow"></span>
      ${edit?`<button class="btn sm" type="button" data-act="dp-all">Tout le mois</button><button class="btn sm ghost" type="button" data-act="dp-none">Effacer le mois</button>`:''}</div>
    <div class="dp-grid" role="group" aria-label="${esc('Disponibilités de '+mName+' '+Y)}">${DAYS.map((nm,i)=>edit?`<button type="button" class="dp-wd" data-act="dp-col" data-j="${i}" title="${esc('Tous les '+nm.toLowerCase()+'s du mois')}">${nm}</button>`:`<span class="dp-wd">${nm}</span>`).join('')}${cells}</div>
    <div class="dp-legend"><span><i class="dp-k v-J"></i>Toute la journée</span><span><i class="dp-k v-AM"></i>Avant-midi</span><span><i class="dp-k v-PM"></i>Après-midi</span><span><i class="dp-dot"></i>${W('Séance attribuée','Cours attribué')}</span></div>
    ${edit?`<div class="row dp-save"><button class="btn primary" type="button" id="dp-save" data-act="dp-save"${S.busy||!dr.dirty?' disabled':''}>Enregistrer</button><span class="muted sm" id="dp-state">${state}</span></div><p class="help">Un clic sur un jour : toute la journée, puis avant-midi, puis après-midi, puis non disponible. Un clic sur « Lundi » change tous les lundis du mois.</p>`:''}`;
}
function disposPage(){
  if(!teachers().length) return emptyBox('Aucun enseignant inscrit','L’administration ajoute les enseignants dans le menu Personnel.');
  const sel=identitySelect();
  return (sel?`<div class="toolbar">${sel}</div>`:'')+`<section class="panel dp-panel">${dispoCalHTML(S.teacher,S.conn==='shared')}</section>`;
}

/* ---------- Administration : affectations (cours à combler, candidatures, remplacements) ---------- */
const dispoChip=(tid,s)=>{const v=dispoOf(tid,s.date);return dispoCovers(v,s)?'<span class="chip ok">Disponible</span>':v?`<span class="chip warn">Disponible : ${DISPO[v].toLowerCase()}</span>`:'<span class="chip off">Disponibilité non indiquée</span>';};
const whoCell=(tid,sub)=>`<div class="xm-who">${avHTML(tName(tid),'')}<span class="xm-t"><b>${esc(tName(tid))}</b>${sub?`<small>${sub}</small>`:''}</span></div>`;
function affCell(st){
  const c=st.clash.length?'bad':st.open>0?(st.firm?'warn':'bad'):'ok';
  if(!st.requis&&!st.clash.length) return `<div class="af-n"><b class="none">—</b><small>${st.assigned.length?st.assigned.map(id=>esc(shortName(tName(id)))).join(', '):'aucun enseignant requis'}</small></div>`;
  return `<div class="af-n ${c}"><b>${st.firm} / ${st.requis}</b><small>${st.clash.length?'Conflit : '+st.clash.map(id=>esc(shortName(tName(id)))).join(', '):st.pending.length?pl(st.pending.length,'candidat','candidats'):st.open>0?'aucun candidat':st.assigned.map(id=>esc(shortName(tName(id)))).join(', ')}</small></div>`;
}
function affPage(){
  const st=S.pg, g=st.g||'', hz=[7,30,90].includes(+st.hz)?+st.hz:30, tab=['open','cand','remp','all'].includes(st.at)?st.at:'open', t=todayISO(), can=isAdmin()&&S.conn==='shared';
  const up=upcomingSessions(hz).filter(s=>!g||s.grp===g).map(s=>({s,st:staffing(s)}));
  const open=up.filter(x=>x.st.open>0||x.st.clash.length||x.st.rclash.length), nClash=open.filter(x=>x.st.clash.length||x.st.rclash.length).length;
  const live=d=>{if(d.date<t||(g&&d.groupe!==g))return null;const s=findSess(d.date,d.seance);return s&&!s.cancelled&&!isPast(s)&&byId(S.data.enseignants,d.enseignant)?s:null;};
  const cands=[];for(const d of S.data.candidatures){if(d.statut!=='attente')continue;const s=live(d);if(s)cands.push({d,s});}
  const remps=[];for(const d of S.data.remplacements){const s=live(d);if(s&&s.tch.includes(d.enseignant))remps.push({d,s});}
  const bySess=(a,b)=>a.s.date.localeCompare(b.s.date)||a.s.start-b.s.start;cands.sort(bySess);remps.sort(bySess);
  const tb=`<div class="toolbar"><select id="x-g" aria-label="Classe"><option value="">Toutes les classes</option>${groups().map(x=>`<option value="${esc(x.id)}"${g===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select><select id="af-hz" aria-label="Période"><option value="7"${hz===7?' selected':''}>7 prochains jours</option><option value="30"${hz===30?' selected':''}>30 prochains jours</option><option value="90"${hz===90?' selected':''}>90 prochains jours</option></select></div>`;
  const full=up.filter(x=>x.st.open<=0&&!x.st.clash.length&&!x.st.rclash.length).length;
  const tiles=`<div class="xm-tiles" role="group" aria-label="Affectations">
    ${affTile('at','open',tab,W('Séances à régler','Cours à régler'),open.length,open.length?'warn':'',open.length?(nClash?`${pl(nClash,'conflit d’horaire','conflits d’horaire')}`:`à combler d’ici ${hz} jours`):W('Toutes les séances sont comblées','Tous les cours sont comblés'))}
    ${affTile('at','cand',tab,'Candidatures',cands.length,cands.length?'warn':'',cands.length?'en attente de votre réponse':'Aucune en attente')}
    ${affTile('at','remp',tab,'Remplacements',remps.length,remps.length?'bad':'',remps.length?(remps.length>1?'demandés':'demandé'):'Aucune demande')}
    ${affTile('at','all',tab,W('Toutes les séances','Tous les cours'),up.length,'',`${full} ${full>1?'complets':'complet'} · ${hz} jours`)}
  </div>`;
  const sessRows=list=>{const lim=+st.lim||30;
    return xList('xm-a6',[['Date'],[W('Séance','Cours')],['Classe'],['Moment'],['Enseignants'],['','r']],list.slice(0,lim).map(({s,st:a})=>xRow('xm-a6',`data-act="sess-at" ${sAt(s)}`,`${xDate(s,sHot(s))}<div class="xm-t"><b>${sTitle(s)}</b>${sSub(s)?`<small>${sSub(s)}</small>`:''}</div>${xCls(s)}<span class="xm-m">${esc(momentOf(s))}</span>${affCell(a)}<div class="xm-end">${a.clash.length?'<span class="chip bad">Conflit</span>':a.rclash.length?`<span class="chip bad">${ressClashLbl(a.rclash)}</span>`:a.remp.length?'<span class="chip warn">Remplacement</span>':a.open>0?`<span class="chip ${a.firm?'warn':'bad'}">${a.open} à combler</span>`:'<span class="chip ok">Complet</span>'}</div>`,sAria(s))).join(''))
      +(list.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+30}">Afficher plus (${list.length-lim})</button></div>`:'');};
  let body='';
  if(tab==='open') body=open.length?sessRows(open):`<div class="cl-list"><p class="miss-ok"><span class="chip ok">Complet</span>${W('Toutes les séances','Tous les cours')} des ${hz} prochains jours ont leurs enseignants.</p></div>`;
  else if(tab==='all') body=up.length?sessRows(up):`<section class="panel"><p class="help">${W('Aucune séance','Aucun cours')} dans cette période.</p></section>`;
  else if(tab==='cand') body=cands.length?xList('xm-afc',[['Enseignant'],[W('Séance','Cours')],['Quand'],['','r']],cands.map(({d,s})=>{const a=staffing(s), tt=byId(S.data.enseignants,d.enseignant);
      return xRow('xm-afc',`data-act="sess-at" ${sAt(s)}`,`${whoCell(d.enseignant,`${dispoChip(d.enseignant,s)}${hasComp(tt,s.c)?'':'<span class="chip bad">Hors compétences</span>'}${onLeave(tt)?'<span class="chip warn">En congé</span>':''}`)}<div class="xm-t"><b>${sTitle(s)}</b><small>${esc(gName(s.grp))} · ${a.firm} sur ${a.requis}${sSub(s)?' · '+sSub(s):''}</small></div><span class="xm-m">${esc(sDay(s))}<br><span class="muted">${esc(momentOf(s))}</span></span><div class="xm-end">${can?`<button class="btn sm yes" type="button" data-act="af-approve" data-id="${esc(d.id)}"${dis()}>Approuver</button><button class="btn sm ghost" type="button" data-act="af-refuse" data-id="${esc(d.id)}"${dis()}>Refuser</button>`:''}</div>`,`${tName(d.enseignant)} · ${sAria(s)}`);}).join(''))
    :'<div class="cl-list"><p class="miss-ok"><span class="chip ok">À jour</span>Aucune candidature en attente.</p></div>';
  else body=remps.length?xList('xm-afc',[['Enseignant'],[W('Séance','Cours')],['Quand'],['','r']],remps.map(({d,s})=>{const a=staffing(s);
      return xRow('xm-afc',`data-act="sess-at" ${sAt(s)}`,`${whoCell(d.enseignant,d.motif?esc(d.motif):'Aucune raison indiquée')}<div class="xm-t"><b>${sTitle(s)}</b><small>${esc(gName(s.grp))} · ${a.pending.length?pl(a.pending.length,'candidat','candidats'):'aucun candidat'}</small></div><span class="xm-m">${esc(sDay(s))}<br><span class="muted">${esc(momentOf(s))}</span></span><div class="xm-end">${can?`<button class="btn sm primary" type="button" data-act="af-retire" ${sAt(s)} data-t="${esc(d.enseignant)}"${dis()}>Libérer l’enseignant</button><button class="btn sm ghost" type="button" data-act="af-remp-no" data-id="${esc(d.id)}"${dis()}>Refuser</button>`:''}</div>`,`${tName(d.enseignant)} · ${sAria(s)}`);}).join(''))
    :'<div class="cl-list"><p class="miss-ok"><span class="chip ok">À jour</span>Aucune demande de remplacement.</p></div>';
  return tb+tiles+body;
}
/* Dans la fenêtre d’un cours (administration) : enseignants requis, attribués et candidats */
function affBoxHTML(s){
  const a=staffing(s), I=affIdx(), can=isAdmin()&&S.conn==='shared', past=isPast(s), lk=linkedX(s);
  const li=(tid,sub,btns)=>`<li>${avHTML(tName(tid),'')}<span class="nm">${esc(tName(tid))}<small>${sub}</small></span><span class="af-btns">${btns}</span></li>`;
  const got=a.assigned.map(tid=>{const r=I.rp[s.key+'|'+tid];
    return li(tid,(r?`<span class="need-t">Remplacement demandé${r.motif?' : '+esc(r.motif):''}</span>`:tid===s.c.enseignant?(modOf(s.c)?'Chargé de cours':acad()?'Responsable de l’activité':'Enseignant du cours'):'Approuvé')+(a.clash.includes(tid)?' · <span class="bad-t">'+W('déjà dans une autre séance à ce moment','déjà dans un autre cours à ce moment')+'</span>':''),can?`<button class="btn sm ghost" type="button" data-act="af-retire" ${sAt(s)} data-t="${esc(tid)}"${dis()}>Retirer</button>`:'');}).join('');
  const cand=a.pending.map(tid=>li(tid,`A postulé · ${dispoCovers(dispoOf(tid,s.date),s)?'disponible':'disponibilité non indiquée'}`,can?`<button class="btn sm yes" type="button" data-act="af-approve" data-id="${esc(candId(s.key,tid))}"${dis()}>Approuver</button><button class="btn sm ghost" type="button" data-act="af-refuse" data-id="${esc(candId(s.key,tid))}"${dis()}>Refuser</button>`:'')).join('');
  const others=teachers().filter(t=>!a.assigned.includes(t.id)&&!a.pending.includes(t.id)&&!onLeave(t));
  const hint=t=>[dispoCovers(dispoOf(t.id,s.date),s)?'disponible':'',hasComp(t,s.c)?'':'hors compétences',busyAt(t.id,s)?W('déjà pris à ce moment','déjà en cours'):''].filter(Boolean).join(', ');
  return `<section class="af-box" id="af-box"><div class="af-box-h"><h3 class="sb-h3">Enseignants <span class="chip ${a.open>0?(a.firm?'warn':'bad'):'ok'}" id="af-count">${a.firm} sur ${a.requis}</span></h3>
      ${lk?`<div class="af-req" id="af-req-ro"><span>Requis</span><b id="af-req-n">${a.requis}</b><small class="muted">selon le cours du module</small></div>`:can?`<div class="af-req" role="group" aria-label="Enseignants requis"><span>Requis</span><button type="button" class="icon-btn" id="af-req-m" data-act="af-req" ${sAt(s)} data-d="-1" aria-label="Un enseignant de moins"${S.busy||a.requis<=0?' disabled':''}>−</button><b id="af-req-n">${a.requis}</b><button type="button" class="icon-btn" id="af-req-p" data-act="af-req" ${sAt(s)} data-d="1" aria-label="Un enseignant de plus"${S.busy||a.requis>=9?' disabled':''}>+</button></div>`:''}</div>
    ${got||cand?`<ul class="af-list">${got}${cand}</ul>`:'<p class="help">Aucun enseignant attribué.</p>'}
    ${can&&!past&&others.length?`<label class="field af-add"><span>Attribuer un enseignant</span><select id="af-assign" data-af="assign" ${sAt(s)}${dis()}><option value="">Choisir…</option>${others.map(t=>`<option value="${esc(t.id)}">${esc(t.nom)}${hint(t)?' ('+hint(t)+')':''}</option>`).join('')}</select></label>`:''}</section>`;
}
/* Écritures */
async function affWrite(fn,msg){if(S.busy)return false;S.busy=true;render();const ok=await write(fn,msg);S.busy=false;render();return ok;}
async function affSetStatus(s,tid,statut,msg,extra){
  const id=candId(s.key,tid), rp=affIdx().rp[s.key+'|'+tid];
  return affWrite(async()=>{await col('candidatures').doc(id).set(Object.assign(candDoc(s,tid,statut),extra||{}));if(statut==='retire'&&rp)await col('remplacements').doc(rp.id).delete();},msg);
}
async function affReq(s,d){
  const c=byId(S.data.cours,s.c.id);if(!c||linkedX(s))return;
  const doc=courseDoc(c), x=s.extra?doc.extras.find(e=>e.id===s.extra.id):doc.creneaux.find(e=>e.id===s.sl.id);if(!x)return;
  x.requis=Math.max(0,Math.min(9,reqOf(s)+d));
  await affWrite(()=>putCours(c.id,doc),`${pl(x.requis,'enseignant requis','enseignants requis')}`);
}

