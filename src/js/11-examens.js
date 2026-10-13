/* ---------- Pages : examens ---------- */
/* Résultats : réussi, échec, absent (à reprendre) et réussi en reprise */
const RES={reussi:['ok','Réussi'],echec:['bad','Échec'],absent:['warn','Absent'],reprise:['info','Réussi en reprise'],echecf:['bad','Échec du module']};
const resOk=v=>v==='reussi'||v==='reprise', resKo=v=>v==='echec'||v==='absent';
/* Notes en % : facultatives. resultats/<examen>.pct = { élève: note } ; une note inscrit le résultat (réussi à partir du seuil). */
const seuil=()=>{const n=+cfg().seuil;return n>=1&&n<=100?Math.round(n):60;};
const noteTxt=n=>n==null?'':`${String(Math.round(n*10)/10).replace('.',',')} %`;
function examPctOf(x){
  const d=S.data.resultats[resKeyOf(x)], p=Object.assign({},d&&d.pct), mine=(S.data.mesPct||{})[resKeyOf(x)];
  if(mine!=null&&S.student&&p[S.student]==null) p[S.student]=mine;
  return p;
}
const sxId=key=>'sx-'+String(key).replace(/[^A-Za-z0-9_-]/g,'-');
const resKeyOf=x=>x.fromSess?sxId(x.key):x.e.id;
const resElId=(el,id)=>(String(el)+'__'+String(id)).replace(/[^A-Za-z0-9_-]/g,'-');
/* Résultats d’un examen. Les anciens résultats, rangés dans la fiche d’examen, restent lus tant qu’on ne les a pas réenregistrés. */
function examResOf(x){
  const d=S.data.resultats[resKeyOf(x)];
  let r=d&&d.resultats;
  if(!r){if(x.fromSess){const old=S.data.examens.find(q=>q.seance===x.key);r=old&&old.resultats;}else r=x.e&&x.e.resultats;}
  r=r||{};
  const mine=S.data.mesRes[resKeyOf(x)];
  return mine&&S.student&&!r[S.student]?Object.assign({},r,{[S.student]:mine}):r;
}
/* Enregistre les résultats d’un examen, et le résultat de chaque élève touché dans sa propre fiche */
/* pct : les notes en % par élève ; reps : l’issue des reprises. Sans ces paramètres, ce qui est déjà inscrit est gardé.
   Une reprise n’est gardée que tant que le résultat de l’élève en vient (réussi en reprise, ou échec du module). */
async function writeResults(x,res,msg,pct,reps){
  const id=resKeyOf(x), prev=examResOf(x), cur=S.data.resultats[id]||null, p0=(cur&&cur.pct)||{}, p1={}, r0=reps||(cur&&cur.reprises)||{}, r1={}, now=new Date().toISOString(), ex=!!(cur&&cur.exemple);
  for(const el of Object.keys(res)){
    const n=pct?pct[el]:p0[el];if(n!=null&&n!==''&&!isNaN(+n)&&res[el]!=='absent') p1[el]=Math.max(0,Math.min(100,+n));
    if(r0[el]&&(res[el]==='reprise'||res[el]==='echecf')) r1[el]=r0[el];
  }
  const doc={examen:x.fromSess?'':x.e.id,seance:x.fromSess?x.key:'',cours:x.c?x.c.id:'',groupe:x.grp||'',titre:(x.e&&x.e.titre)||'Examen',date:x.date,resultats:res,pct:p1,reprises:r1,maj:now};
  if(ex) doc.exemple=true;
  const fns=[()=>col('resultats').doc(id).set(doc)];
  for(const el of new Set([...Object.keys(prev),...Object.keys(res)])){
    if(prev[el]===res[el]&&p0[el]===p1[el]&&cur) continue;
    const rid=resElId(el,id);
    fns.push(res[el]?()=>col('resultats-eleves').doc(rid).set(Object.assign({eleve:el,examen:id,v:res[el],date:x.date,maj:now},p1[el]!=null?{pct:p1[el]}:{},ex?{exemple:true}:{})):()=>col('resultats-eleves').doc(rid).delete());
  }
  if(x.fromSess){const old=S.data.examens.find(q=>q.seance===x.key);if(old)fns.push(()=>col('examens').doc(old.id).delete());}
  else if(x.e&&x.e.resultats&&Object.keys(x.e.resultats).length&&byId(S.data.examens,x.e.id)) fns.push(()=>col('examens').doc(x.e.id).update({resultats:{}}));
  return write(async()=>{for(const f of fns) await f();},msg);
}
const elNum=e=>e&&e.numero!=null&&e.numero!==''&&!isNaN(+e.numero)?+e.numero:1e9;
const byElNum=(a,b)=>elNum(a)-elNum(b)||collator.compare(a.nom||'',b.nom||'');
function canEditExam(e){
  if(S.role==='admin') return S.canAdmin!==false;
  if(S.role==='teacher'){if(!e)return true;const c=byId(S.data.cours,e.cours);return (c&&c.enseignant===S.teacher)||e.surveillant===S.teacher;}
  return false;
}
const canEditItem=x=>x.fromSess?(S.role==='admin'?S.canAdmin!==false:S.role==='teacher'&&(x.tch||[]).includes(S.teacher)):canEditExam(x.e);
/* Tous les examens de l’année avec leurs résultats : fiche d’examen, ou résultats rattachés à une séance « Examen » de l’horaire */
function examBoard(filter){
  const items=allExamItems().filter(filter).map(x=>{
    const res=examResOf(x), doc=S.data.resultats[resKeyOf(x)]||null, els=studentsOf(x.grp);
    let ok=0,ko=0,kf=0,got=0;for(const e of els){const v=res[e.id];if(!v)continue;got++;if(resOk(v))ok++;else if(resKo(v))ko++;else if(v==='echecf')kf++;}
    const pct=examPctOf(x), ps=els.map(e=>pct[e.id]).filter(n=>n!=null);
    return Object.assign(x,{doc,res,els,ok,ko,kf,got,pct,avg:ps.length?Math.round(ps.reduce((a,b)=>a+ +b,0)/ps.length):null,past:isPast(x)});
  });
  const asc=(a,b)=>a.date.localeCompare(b.date)||a.start-b.start, desc=(a,b)=>-asc(a,b);
  const up=items.filter(x=>!x.past&&(!x.rep||x.els.length)).sort(asc), graded=items.filter(x=>x.past&&!x.rep&&x.els.length);
  const todo=graded.filter(x=>x.got<x.els.length).sort(desc), done=graded.filter(x=>x.got).sort(desc);
  const reps=[];for(const x of graded) for(const e of x.els) if(resKo(x.res[e.id])) reps.push({x,e,v:x.res[e.id]});
  reps.sort((a,b)=>collator.compare(gName(a.x.grp),gName(b.x.grp))||asc(a.x,b.x)||byElNum(a.e,b.e));
  let ok=0,got=0;for(const x of done){ok+=x.ok;got+=x.ok+x.ko+x.kf;}
  return {items,up,todo,done,reps,rate:got?Math.round(ok/got*100):null,got};
}
/* Prochaine journée de reprise de chaque classe */
function nextReprises(){const t=todayISO(),m={};for(const x of allExamItems().filter(x=>x.rep&&!isPast(x)).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start)) if(!m[x.grp]) m[x.grp]=x;return m;}
const passCls=r=>r==null?'':r>=90?'ok':r>=75?'warn':'bad';
const xNum=g=>String(gName(g)).replace(/^(Classe|Groupe)\s+/i,'').slice(0,4);
const xDate=(x,cls)=>{const d=parse(x.date);return `<span class="xm-d${cls?' '+cls:''}" aria-hidden="true"><small>${WD[d.getDay()].slice(0,3)}</small><b>${d.getDate()}</b><small>${fMonthS.format(d).replace('.','')}</small></span>`;};
const xTitle=x=>x.rep?(x.c&&modKey(x.c)!=null?`Reprise · ${codeOf(x.c)}${esc(x.c.titre)}`:esc(x.c&&!/^reprise$/i.test(String(x.c.titre).trim())?x.c.titre:'Journée de reprise')):`${x.c?codeOf(x.c):''}${esc(x.c?x.c.titre:x.e.titre||'Examen')}`;
const xSub=x=>esc([x.c&&!x.rep&&x.e.titre&&x.e.titre!=='Examen'?x.e.titre:'',x.salle?'Local '+x.salle:'',x.e.surveillant?'Surveillance : '+shortName(tName(x.e.surveillant)):''].filter(Boolean).join(' · '));
const xWhen=x=>{const k=daysBetween(todayISO(),x.date);return `<span class="chip ${x.rep?'info':k<=2?'exam':'off'}">${k<=0?'Aujourd’hui':k===1?'Demain':k<14?'Dans '+k+' jours':'Dans '+Math.round(k/7)+' semaines'}</span>`;};
const xCls=x=>`<span class="cl-num sm" title="${esc(gName(x.grp))}">${esc(xNum(x.grp))}</span>`;
const xRow=(cls,act,cells,label)=>`<article class="xm-row xm-cols ${cls}${act?' go':''}"${act?` ${act} tabindex="0" role="button" aria-label="${esc(label)}"`:''}>${cells}</article>`;
const xList=(cls,head,rows)=>`<div class="cl-list xm-list"><div class="xm-hd xm-cols ${cls}" aria-hidden="true">${head.map(h=>`<span${h[1]?` class="${h[1]}"`:''}>${h[0]}</span>`).join('')}</div>${rows}</div>`;
const xLabel=x=>`${x.rep?'Journée de reprise':(x.c?x.c.titre:x.e.titre||'Examen')} · ${dayLabel(parse(x.date))} · ${gName(x.grp)}`;
/* Ouvrir un examen : la fiche pour un examen planifié, sinon les résultats de la séance (ou la séance si elle n’a pas encore eu lieu) */
const xOpen=x=>!x.fromSess?`data-act="exam" data-id="${esc(x.e.id)}"`:x.past&&!x.rep&&x.els&&x.els.length?`data-act="x-open" data-key="${esc(x.key)}"`:examAct(x);

function examsPage(){
  const st=S.pg, g=st.g||'';
  if(S.role==='student') return studentExams();
  const view=st.xv==='grille'?'grille':'board';
  const vseg=`<div class="seg" role="group" aria-label="Affichage"><button type="button" id="xv-board" data-act="pg-set" data-k="xv" data-v="board" aria-pressed="${view==='board'}">Tableau de bord</button><button type="button" id="xv-grille" data-act="pg-set" data-k="xv" data-v="grille" aria-pressed="${view==='grille'}">Grille des résultats</button></div>`;
  if(view==='grille'){
    const mineOnly=S.role==='teacher'?x=>x.tch.includes(S.teacher):null;
    const gs=groups().filter(y=>studentsOf(y.id).length&&(!mineOnly||allExamItems().some(x=>x.grp===y.id&&mineOnly(x))));
    const gid=gs.some(y=>y.id===g)?g:(gs[0]||{}).id;
    const gsel=gs.length?`<select id="x-g" aria-label="Classe">${gs.map(y=>`<option value="${esc(y.id)}"${gid===y.id?' selected':''}>${esc(y.nom)}</option>`).join('')}</select>`:'';
    const tbG=`<div class="toolbar">${vseg}${gsel}<span class="grow"></span>${S.role==='teacher'?identitySelect():''}</div>`;
    return tbG+(gid?`<section class="panel xg-panel">${resultsGrid(gid,mineOnly)}</section>`:emptyBox('Aucune classe avec des élèves','La grille apparaîtra dès qu’une classe aura des élèves et des examens passés.'));
  }
  const filter=S.role==='teacher'?x=>x.tch.includes(S.teacher):g?x=>x.grp===g:()=>true;
  const B=examBoard(filter), tab=['up','todo','reps','done'].includes(st.xt)?st.xt:'up', nr=nextReprises();
  const sel=S.role==='admin'?`<select id="x-g" aria-label="Classe"><option value="">Toutes les classes</option>${groups().map(x=>`<option value="${esc(x.id)}"${g===x.id?' selected':''}>${esc(x.nom)}</option>`).join('')}</select>`:identitySelect();
  const can=canEditExam(null)&&S.conn==='shared';
  const tb=`<div class="toolbar">${vseg}${sel}<span class="grow"></span>${can?`<button class="btn primary" type="button" data-act="new-exam">${icon('plus')}Planifier un examen</button>`:''}</div>`;
  const nx=B.up.find(x=>!x.rep), nStud=new Set(B.reps.map(r=>r.e.id)).size;
  const tile=(k,lbl,val,cls,sub)=>`<button type="button" class="xm-tile" id="xt-${k}" data-act="pg-set" data-k="xt" data-v="${k}" aria-pressed="${tab===k}"><span class="lbl">${lbl}</span><b class="${cls}">${val}</b><small>${sub}</small></button>`;
  const tiles=`<div class="xm-tiles" role="group" aria-label="Tableau des examens">
    ${tile('up','À venir',B.up.filter(x=>!x.rep).length,'',nx?'Prochain : '+esc(WD[parse(nx.date).getDay()].slice(0,3).toLowerCase()+'. '+dn(parse(nx.date))+' '+fMonthS.format(parse(nx.date))):'Aucun examen prévu')}
    ${tile('todo','Résultats à entrer',B.todo.length,B.todo.length?'warn':'',B.todo.length?(B.todo.length>1?'examens passés':'examen passé'):'Tout est à jour')}
    ${tile('reps','Reprises à faire',B.reps.length,B.reps.length?'bad':'',B.reps.length?pl(nStud,'élève','élèves'):'Aucune reprise')}
    ${tile('done','Taux de réussite',B.rate==null?'—':B.rate+' %',passCls(B.rate),B.got?pl(B.got,'résultat','résultats'):'Aucun résultat')}
  </div>`;
  let body='';
  if(tab==='up'){
    const lim=+st.lim||25, list=B.up.slice(0,lim), RSu=repSessions();
    body=list.length?xList('xm-up',[['Date'],['Examen'],['Classe'],['Moment'],['','r']],list.map(x=>{const k=daysBetween(todayISO(),x.date);
      const rs=x.rep?RSu.find(y=>y.key===x.key):null, nq=rs?B.reps.filter(q=>{const dq=repDayFor(q.x,RSu);return dq&&dq.key===rs.key;}).length:0;
      const sub=x.rep?(rs&&rs.mods.length?`${rs.mods.map(m=>'M'+m).join(', ')}${nq?' · '+pl(nq,'reprise à faire','reprises à faire'):''}`:'Modules à reprendre : à choisir'):xSub(x);
      return xRow('xm-up'+(x.rep?' is-rep':''),xOpen(x),`${xDate(x,x.rep?'rep':k<=2?'hot':'')}<div class="xm-t"><b>${xTitle(x)}</b>${sub?`<small>${sub}</small>`:''}</div>${xCls(x)}<span class="xm-m">${esc(momentOf(x))}</span><div class="xm-end">${x.rep?'<span class="chip info">Reprise</span>':xWhen(x)}</div>`,xLabel(x));}).join(''))
      +(B.up.length>lim?`<div class="row" style="margin-top:12px"><button class="btn" type="button" data-act="pg-set" data-k="lim" data-v="${lim+25}">Afficher plus (${B.up.length-lim})</button></div>`:'')
      :`<section class="panel"><p class="help">Aucun examen à venir.</p></section>`;
  }else if(tab==='todo'){
    body=B.todo.length?xList('xm-todo',[['Date'],['Examen'],['Classe'],['Résultats entrés'],['','r']],B.todo.map(x=>{const p=Math.round(x.got/x.els.length*100);
      return xRow('xm-todo',xOpen(x),`${xDate(x,'')}<div class="xm-t"><b>${xTitle(x)}</b><small>${esc(dayLabel(parse(x.date)))} · ${esc(momentOf(x))}</small></div>${xCls(x)}<div class="cl-big xm-p"><b>${x.got} / ${x.els.length}</b><div class="meter" aria-hidden="true"><i style="width:${p}%"></i></div></div><div class="xm-end">${canEditItem(x)?'<span class="btn sm">Entrer les résultats</span>':'<span class="chip warn">À entrer</span>'}</div>`,'Entrer les résultats : '+xLabel(x));}).join(''))
      :`<div class="cl-list"><p class="miss-ok"><span class="chip ok">À jour</span>Tous les résultats des examens passés sont entrés.</p></div>`;
  }else if(tab==='reps'){
    body=repsTab(B,S.role==='admin'?g:'');
  }else{
    body=B.done.length?xList('xm-done',[['Date'],['Examen'],['Classe'],['Réussite'],['','r']],B.done.map(x=>{const t=x.ok+x.ko+x.kf, r=t?Math.round(x.ok/t*100):null, c=passCls(r);
      return xRow('xm-done',xOpen(x),`${xDate(x,'')}<div class="xm-t"><b>${xTitle(x)}</b><small>${esc(dayLabel(parse(x.date)))}${x.avg!=null?` · moyenne ${x.avg} %`:''}</small></div>${xCls(x)}<div class="cl-big xm-p ${c}"><b>${x.ok} / ${t}</b><div class="meter ${c}" aria-hidden="true"><i style="width:${r||0}%"></i></div></div><div class="xm-end">${x.ko?`<span class="chip bad">${pl(x.ko,'à reprendre','à reprendre')}</span>`:x.kf?`<span class="chip bad">${pl(x.kf,'échec de module','échecs de module')}</span>`:'<span class="chip ok">Tous réussis</span>'}</div>`,xLabel(x));}).join(''))
      :`<section class="panel"><p class="help">Aucun résultat pour l’instant.</p></section>`;
  }
  return tb+tiles+body;
}
/* Élève : ses prochains examens, ses résultats et ses reprises */
function studentExams(){
  const sid=S.student, me=!!sid, B=examBoard(x=>x.grp===S.group), nr=nextReprises();
  const mine=B.items.filter(x=>x.past&&!x.rep&&x.res[sid]).sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start);
  const todo=mine.filter(x=>resKo(x.res[sid])), n=nr[S.group];
  const up=B.items.filter(x=>!x.past).sort((a,b)=>a.date.localeCompare(b.date)||a.start-b.start).slice(0,6);
  const tb=`<div class="toolbar">${identitySelect()}<span class="grow"></span>${me&&mine.length?`<button class="btn" type="button" id="pr-releve" data-act="pr-releve" data-id="${esc(sid)}">${icon('print')}Imprimer mon relevé</button>`:''}</div>`;
  const note=me?repNotice({id:sid},B.items):'';
  const upH=up.length?xList('xm-me',[['Date'],['Examen'],['Moment'],['','r']],up.map(x=>{const k=daysBetween(todayISO(),x.date);return xRow('xm-me',examAct(x),`${xDate(x,x.rep?'rep':k<=2?'hot':'')}<div class="xm-t"><b>${xTitle(x)}</b>${xSub(x)?`<small>${xSub(x)}</small>`:''}</div><span class="xm-m">${esc(momentOf(x))}</span><div class="xm-end">${x.rep?'<span class="chip info">Reprise</span>':xWhen(x)}</div>`,xLabel(x));}).join('')):`<section class="panel"><p class="help">Les examens de votre classe apparaîtront ici dès qu’ils seront planifiés.</p></section>`;
  const resH=!me?'':mine.length?xList('xm-me',[['Date'],['Examen'],['Moment'],['Résultat','r']],mine.map(x=>{const v=x.res[sid];return xRow('xm-me','',`${xDate(x,'')}<div class="xm-t"><b>${xTitle(x)}</b></div><span class="xm-m">${esc(momentOf(x))}</span><div class="xm-end"><span class="chip ${RES[v][0]}">${RES[v][1]}${x.pct[sid]!=null?' · '+esc(noteTxt(x.pct[sid])):''}</span></div>`,'');}).join('')):`<section class="panel"><p class="help">Aucun résultat pour l’instant.</p></section>`;
  return tb+note+`<h2 class="xm-h">Prochains examens</h2>${upH}${me?`<h2 class="xm-h">Mes résultats</h2>${resH}`:''}`;
}
/* Ouvre les résultats d’une séance « Examen » de l’horaire */
function openSessExam(key){
  const x=allExamItems().find(k=>k.key===key);if(!x)return;
  if(!x.fromSess) return openExam(x.e.id);
  openDrawer({kind:'exam',id:null,sess:key,draft:{resultats:Object.assign({},examResOf(x)),pct:Object.assign({},examPctOf(x)),groupe:x.grp},err:'',warn:null,confirmDel:false});
}

/* Grille des résultats d’une classe : une ligne par élève, une colonne par examen passé (le plus récent à gauche) */
const GRID={reussi:['ok','✓'],echec:['bad','✗'],absent:['warn','Abs'],reprise:['info','✓R'],echecf:['fail','ÉM']};
function resultsGrid(gid,filter){
  const B=examBoard(x=>x.grp===gid&&(!filter||filter(x)));
  const xs=B.items.filter(x=>x.past&&!x.rep).sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start);
  const els=studentsOf(gid).slice().sort(byElNum);
  if(!els.length) return '<p class="help">Aucun élève dans cette classe.</p>';
  if(!xs.length) return '<p class="help">Aucun examen passé pour l’instant : la grille se remplira au fil des examens.</p>';
  const code=x=>x.c&&x.c.code?x.c.code:'Exam.';
  const sub=x=>{const t=String(x.e.titre||'');return x.fromSess?t.replace(/^Examen\s*/,''):t;};
  const name=x=>x.c?(x.c.code?x.c.code+' ':'')+x.c.titre:(x.e.titre||'Examen');
  const head=xs.map(x=>{const d=parse(x.date),todo=x.got<x.els.length;
    return `<th scope="col" class="xg-h${todo?' todo':''}"><button type="button" ${xOpen(x)} title="${esc(`${name(x)}${sub(x)?' · '+sub(x):''} · ${dayLabel(d)}${todo?' · résultats à entrer':''}`)}"><b>${esc(code(x))}</b><small>${esc(sub(x))||'&nbsp;'}</small><small>${dn(d)} ${esc(fMonthS.format(d).replace('.',''))}</small></button></th>`;}).join('');
  const rows=els.map(e=>{let ok=0,ko=0,kf=0;
    const cells=xs.map(x=>{const v=x.res[e.id], g=GRID[v];if(resOk(v))ok++;else if(resKo(v))ko++;else if(v==='echecf')kf++;
      return `<td><button type="button" class="xg-c ${g?g[0]:'none'}" ${xOpen(x)} aria-label="${esc(`${e.nom} · ${name(x)} · ${v?RES[v][1]:'sans résultat'}`)}" title="${esc(v?RES[v][1]+(x.pct[e.id]!=null?' · '+noteTxt(x.pct[e.id]):''):'Sans résultat')}">${g&&x.pct[e.id]!=null?Math.round(x.pct[e.id]):g?g[1]:'·'}</button></td>`;}).join('');
    const t=ok+ko+kf, r=t?Math.round(ok/t*100):null;
    return `<tr><th scope="row" class="xg-n"><button type="button" class="xg-who" data-act="student" data-id="${esc(e.id)}"><span class="st-num sm" aria-hidden="true">${e.numero!=null&&e.numero!==''?esc(e.numero):'—'}</span>${esc(e.nom)}</button></th><td class="xg-r ${passCls(r)}">${r==null?'—':r+' %'}${ko?`<small>${pl(ko,'à reprendre','à reprendre')}</small>`:''}${kf?`<small>${pl(kf,'échec de module','échecs de module')}</small>`:''}</td>${cells}</tr>`;}).join('');
  const foot=xs.map(x=>{const t=x.ok+x.ko+x.kf;return `<td class="xg-f">${t?`${x.ok}/${t}`:'—'}</td>`;}).join('');
  const legend=`<div class="xg-legend">${Object.entries(GRID).map(([k,[c,l]])=>`<span><i class="xg-c ${c}" aria-hidden="true">${l}</i>${RES[k][1]}</span>`).join('')}<span><i class="xg-c none" aria-hidden="true">·</i>Sans résultat</span></div>`;
  return legend+`<div class="xg-wrap"><table class="xg"><thead><tr><th scope="col" class="xg-n">Élève</th><th scope="col" class="xg-r">Réussite</th>${head}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" class="xg-n">Réussis</th><td class="xg-r"></td>${foot}</tr></tfoot></table></div>`;
}
/* Onglet Examens d’une fiche d’élève : ses résultats, ses reprises et ses prochains examens */
function studentExamsTab(e){
  const B=examBoard(x=>x.grp===e.groupe), nr=nextReprises(), n=nr[e.groupe];
  const mine=B.items.filter(x=>x.past&&!x.rep&&x.res[e.id]).sort((a,b)=>b.date.localeCompare(a.date)||b.start-a.start);
  const pend=mine.filter(x=>resKo(x.res[e.id])), ok=mine.filter(x=>resOk(x.res[e.id])).length, t=ok+pend.length+mine.filter(x=>resFail(x.res[e.id])).length, rate=t?Math.round(ok/t*100):null;
  const bar=`<div class="st-bar"><p class="summary"><span><b>${mine.length}</b>${mine.length>1?'résultats':'résultat'}</span><span><b class="${passCls(rate)}">${rate==null?'—':rate+' %'}</b>de réussite</span><span class="${pend.length?'need':''}"><b>${pend.length}</b>à reprendre</span></p><span class="grow"></span>${mine.length?`<button class="btn sm" type="button" id="pr-releve" data-act="pr-releve" data-id="${esc(e.id)}">${icon('print')}Imprimer le relevé</button>`:''}</div>`;
  const note=repNotice(e,B.items);
  const res=mine.length?xList('xm-sres',[['Date'],['Examen'],['Résultat'],['','r']],mine.map(x=>{const v=x.res[e.id], can=canEditItem(x);
    return xRow('xm-sres',can?xOpen(x):'',`${xDate(x,'')}<div class="xm-t"><b>${xTitle(x)}</b>${xSub(x)?`<small>${xSub(x)}</small>`:''}</div><div><span class="chip ${RES[v][0]}">${RES[v][1]}${x.pct[e.id]!=null?' · '+esc(noteTxt(x.pct[e.id])):''}</span></div><div class="xm-end">${resKo(v)&&can?`<button class="btn sm" type="button" data-act="x-rep" data-key="${esc(x.key)}" data-el="${esc(e.id)}"${dis()}>Réussi en reprise</button>`:''}</div>`,xLabel(x));}).join('')):'<section class="panel"><p class="help">Aucun résultat inscrit.</p></section>';
  const up=B.up.slice(0,5);
  const upH=up.length?xList('xm-me',[['Date'],['Examen'],['Moment'],['','r']],up.map(x=>{const k=daysBetween(todayISO(),x.date);return xRow('xm-me',examAct(x),`${xDate(x,x.rep?'rep':k<=2?'hot':'')}<div class="xm-t"><b>${xTitle(x)}</b>${xSub(x)?`<small>${xSub(x)}</small>`:''}</div><span class="xm-m">${esc(momentOf(x))}</span><div class="xm-end">${x.rep?'<span class="chip info">Reprise</span>':xWhen(x)}</div>`,xLabel(x));}).join('')):'<section class="panel"><p class="help">Aucun examen prévu.</p></section>';
  return bar+note+`<h2 class="xm-h">Résultats</h2>${res}<h2 class="xm-h">À venir</h2>${upH}`;
}
/* Onglet Examens d’une fiche de classe : réussite, grille des résultats et prochains examens */
function classExamsTab(g){
  const B=examBoard(x=>x.grp===g.id);
  const bar=`<div class="st-bar"><p class="summary"><span><b class="${passCls(B.rate)}">${B.rate==null?'—':B.rate+' %'}</b>de réussite</span><span class="${B.todo.length?'need':''}"><b>${B.todo.length}</b>${B.todo.length>1?'examens à compléter':'examen à compléter'}</span><span class="${B.reps.length?'need':''}"><b>${B.reps.length}</b>${B.reps.length>1?'reprises à faire':'reprise à faire'}</span></p></div>`;
  const up=B.up.slice(0,5);
  const upH=up.length?xList('xm-me',[['Date'],['Examen'],['Moment'],['','r']],up.map(x=>{const k=daysBetween(todayISO(),x.date);return xRow('xm-me',xOpen(x),`${xDate(x,x.rep?'rep':k<=2?'hot':'')}<div class="xm-t"><b>${xTitle(x)}</b>${xSub(x)?`<small>${xSub(x)}</small>`:''}</div><span class="xm-m">${esc(momentOf(x))}</span><div class="xm-end">${x.rep?'<span class="chip info">Reprise</span>':xWhen(x)}</div>`,xLabel(x));}).join('')):'<section class="panel"><p class="help">Aucun examen prévu.</p></section>';
  return bar+`<section class="panel xg-panel"><h2>Grille des résultats</h2>${resultsGrid(g.id)}</section><h2 class="xm-h">Prochains examens</h2>${upH}`;
}

