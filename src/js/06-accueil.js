/* ---------- Accueil : la journée de chacun ----------
   La page où l’on arrive en se connectant, et où l’on revient en cliquant sur le logo ou le nom du site.
   À gauche, la journée en ligne du temps (ou le prochain jour de classe) ; à droite, l’avancement de l’année,
   ce qui est à faire (les notifications) et les prochains examens ; chacun ne voit que ce qui le concerne.
   Le service incendie n’a qu’une page : ses recrues. */
const homePage=()=>S.role==='service'?'recrues':'accueil';
const goHome=()=>goPage(homePage());
/* Le titre de l’accueil : « Bonjour Marie » (le jour est en tête de la journée) */
function accueilTitle(){
  const nm=S.role==='teacher'?tName(S.teacher):S.role==='student'?(byId(S.data.eleves,S.student)||{}).nom||'':whoAmI();
  const first=String(nm||'').trim().split(/\s+/)[0];
  return first?'Bonjour '+first:'Accueil';
}
const homeMine=s=>S.role==='teacher'?s.tch.includes(S.teacher):S.role==='student'?s.grp===S.group:true;
/* Le jour à montrer : aujourd’hui s’il y a des séances, sinon le prochain jour de classe (trois semaines au plus) */
function homeDay(){
  const t=parse(todayISO());
  for(let i=0;i<21;i++){const ds=iso(addDays(t,i)), ss=sessionsOn(ds).filter(homeMine);if(ss.length) return {ds,i,ss:ss.slice().sort((a,b)=>a.start-b.start||a.end-b.end)};}
  return null;
}
/* Les classes d’un enseignant : celles où il donne une séance dans les quatre prochaines semaines */
function homeGroups(){const t=parse(todayISO()), g=new Set();for(let i=0;i<28;i++)for(const s of sessionsOn(iso(addDays(t,i))))if(s.tch.includes(S.teacher))g.add(s.grp);return g;}
/* Présences en retard cette semaine (séances passées dont les présences ne sont pas prises) */
const homeLate=()=>weekItems().filter(s=>s.kind!=='exam'&&homeMine(s)&&attInfo(s).due).length;

/* La ligne du temps : l’heure, un point de la couleur du module, la carte de la séance ; « Maintenant » entre le passé et la suite */
function homeTimeline(day){
  const now=day.i===0?nowMin():null;let out='', prev=null, nowDone=now==null;
  const nowLi=()=>`<li class="tl-now"><span class="tl-h">${fmtT(now)}</span><span class="tl-dot" aria-hidden="true"></span><span class="tl-nl">Maintenant</span></li>`;
  for(const s of day.ss){
    if(!nowDone&&s.start>now){out+=nowLi();nowDone=true;}
    const on=now!=null&&s.start<=now&&now<s.end&&!s.cancelled, meta=[S.role==='student'?'':gName(s.grp),S.role==='teacher'?'':tchNames(s),sessLabel(s),s.salle?'Local '+s.salle:''].filter(Boolean).join(' · ');
    const st=on?'<span class="chip today">En cours</span>':S.role==='student'?(s.cancelled?'<span class="chip off">Annulé</span>':''):statusChip(s,S.role);
    out+=`<li class="tl-it ${tone(s.c)}${s.cancelled?' off':''}"><span class="tl-h">${prev===s.start+'-'+s.end?'':fmtT(s.start)+'<small>à '+fmtT(s.end)+'</small>'}</span><span class="tl-dot" aria-hidden="true"></span>
      <button type="button" class="tl-card" data-act="sess-at" data-key="${esc(s.key)}" data-date="${s.date}"><span class="tl-t"><b>${codeOf(s.c)}${esc(s.c.titre)}</b>${choreChip(s)}</span><span class="tl-m">${esc(meta)}</span>${st?`<span class="tl-s">${st}</span>`:''}</button></li>`;
    prev=s.start+'-'+s.end;
  }
  if(!nowDone) out+=nowLi();
  return `<ol class="tl-day">${out}</ol>`;
}
/* L’année scolaire : un anneau d’avancement, la semaine en cours et le programme */
function homeYear(){
  const c=cfg(), t=todayISO(), a=c.debut, b=c.fin;
  if(!a||!b||b<=a) return '';
  const tot=daysBetween(a,b), pct=Math.max(0,Math.min(100,Math.round(daysBetween(a,t)*100/tot)));
  const wk=Math.max(1,Math.min(Math.ceil((tot+1)/7),Math.floor(daysBetween(iso(monday(parse(a))),t)/7)+1)), wks=Math.ceil((daysBetween(iso(monday(parse(a))),b)+1)/7);
  const ms=comps(), h=ms.reduce((n,k)=>n+modTot(k),0), u=ms.reduce((n,k)=>n+(+k.unites||0),0);
  const prog=[c.programme||'',h?h+' h':'',u?u+' unités':''].filter(Boolean).join(' · ');
  const when=t<a?'Débute le '+shortDate(parse(a)):t>b?'Terminée le '+shortDate(parse(b)):`<b>Semaine ${wk}</b> sur ${wks}`;
  return `<section class="panel hm-year"><div class="ring" role="img" aria-label="${pct} % de l’année scolaire"><svg viewBox="0 0 36 36" aria-hidden="true"><circle class="rt" cx="18" cy="18" r="15.915"/><circle class="rv" cx="18" cy="18" r="15.915" stroke-dasharray="${pct} 100"/></svg><b>${pct} %</b></div>
    <div class="hm-yt"><h2>${S.role==='student'?'Mon année':'L’année scolaire'}</h2><p>${when}</p><p class="muted">${esc(c.annee||'')}${c.annee?' · ':''}du ${esc(shortDate(parse(a)))} au ${esc(shortDate(parse(b)))}</p>${prog?`<p class="muted">${esc(prog)}</p>`:''}</div></section>`;
}
function accueilPage(){
  /* site vide : l’administration voit les premiers pas (et l’exemple à importer), comme dans le calendrier */
  if(!S.data.cours.length) return S.role==='admin'?adminMain():emptyBox('Rien pour l’instant','L’horaire apparaîtra ici dès que l’administration aura créé les classes et leurs cours.');
  /* aperçu d’un autre rôle : choisir l’enseignant ou la classe, comme dans l’horaire */
  const who=S.role==='teacher'||S.role==='student'?identitySelect():'', tb=who?'<div class="toolbar">'+who+'</div>':'';
  const day=homeDay(), nf=notifs(), mx=5;
  const dayT=!day||day.i===0?'Aujourd’hui · '+dayLabel(new Date()).toLowerCase():day.i===1?'Demain · '+dayLabel(parse(day.ds)).toLowerCase():dayLabel(parse(day.ds));
  const go=`<button class="btn sm ghost" type="button" id="hm-cal" data-act="nav" data-page="calendar">${icon('cal')}${S.role==='admin'?'Calendrier':'Mon horaire'}</button>`;
  const tl=day?(day.i>0?`<p class="help hm-next">${W('Aucune séance aujourd’hui','Aucun cours aujourd’hui')} : voici le prochain jour de classe.</p>`:'')+homeTimeline(day):`<p class="help">${W('Aucune séance prévue','Aucun cours prévu')} dans les trois prochaines semaines.</p>`;
  /* le résumé sous la journée : chaque chiffre mène à sa page */
  const lnk=(id,txt,act,cls)=>`<button type="button" class="link hm-k${cls?' '+cls:''}" id="${id}" ${act}>${txt}</button>`;
  const nT=day&&day.i===0?day.ss.filter(s=>!s.cancelled).length:0, late=S.role==='student'?0:homeLate();
  const sum=[lnk('hm-today',pl(nT,W('séance','cours'),W('séances','cours'))+' aujourd’hui','data-act="nav" data-page="calendar"'),
    S.role==='student'?'':lnk('hm-late',late?pl(late,'présence en retard','présences en retard'):'présences à jour','data-act="nav" data-page="'+(S.role==='admin'?'classes':'calendar')+'"',late?'warn-t':''),
    lnk('hm-todo',nf.length?pl(nf.length,'chose à faire','choses à faire'):'rien à faire','data-act="nf-open"'),
    S.role==='admin'?lnk('hm-els',pl(S.data.eleves.length,'élève','élèves'),'data-act="nav" data-page="eleves"'):''].filter(Boolean).join('<span aria-hidden="true">·</span>');
  const todo=nf.length?`<ul class="hm-todo">${nf.slice(0,mx).map((x,i)=>`<li><button type="button" class="hm-td" data-act="nf-go" data-i="${i}"><i class="hm-dot ${x.tone}" aria-hidden="true"></i><span><b>${esc(x.title)}</b><small>${esc(x.text)}</small></span></button></li>`).join('')}</ul>${nf.length>mx?`<button class="btn sm ghost hm-more" type="button" data-act="nf-open">Voir tout (${nf.length})</button>`:''}`:'<p class="help">Rien à faire pour l’instant.</p>';
  const tg=S.role==='teacher'?homeGroups():null, ex=upcomingExams(x=>S.role==='student'?x.grp===S.group:tg?tg.has(x.grp):true,4);
  const exH=ex.length?`<ul class="hm-exs">${ex.map(x=>{const d=parse(x.date);return `<li><button type="button" class="hm-ex" ${examAct(x)}><span class="hm-d" aria-hidden="true"><b>${d.getDate()}</b><small>${esc(fMonthS.format(d).replace('.',''))}</small></span><span><b>${xTitle(x)}</b><small>${esc([S.role==='student'?'':gName(x.grp),momentOf(x)].filter(Boolean).join(' · '))}</small></span></button></li>`;}).join('')}</ul>`:'<p class="help">Aucun examen prévu.</p>';
  return tb+`<div class="hm"><section class="panel hm-tl"><div class="t-head"><h2>${esc(dayT)}</h2>${go}</div>${tl}<p class="hm-sum">${sum}</p></section>
    <div class="hm-side">${homeYear()}<section class="panel"><h2>À faire${nf.length?` <span class="hm-n">${nf.length}</span>`:''}</h2>${todo}</section><section class="panel"><h2>Prochains examens</h2>${exH}</section></div></div>`;
}
