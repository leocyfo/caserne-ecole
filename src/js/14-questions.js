/* ---------- Banque de questions et examens blancs ----------
   questions/<id> : une question à choix multiples { module, texte, choix [texte…], bonne (index), expl, maj, par }
   ex-blancs/<id> : un examen blanc { nom, modules [codes], nb, duree (min), classes [ids], du, au, seuil, maj, par }
   ex-tentatives/<id> : une tentative d’un élève { exam, nom, eleve, groupe, debut, fin, q [ids], r [index|null], score, total, pct }
   Les questions sont tirées au hasard dans les modules de l’examen au moment où l’élève commence. C’est de l’entraînement :
   l’élève voit la correction et l’explication de chaque question une fois l’examen remis. */
const qbQ=()=>(S.data.questions||[]).slice().sort((a,b)=>(+a.module||99)-(+b.module||99)||collator.compare(a.texte||'',b.texte||''));
const qbTen=()=>S.data.tentatives||[];
const LET='ABCDEF';
/* Réussite de chaque question, d’après les tentatives remises */
let _qbS=null;
function qbStats(){
  if(_qbS&&_qbS.t===S.data.tentatives&&_qbS.q===S.data.questions) return _qbS.v;
  const Q=new Map((S.data.questions||[]).map(q=>[q.id,q])), v={};
  for(const t of qbTen()){if(!t.fin) continue;(t.q||[]).forEach((id,i)=>{const q=Q.get(id);if(!q)return;const o=v[id]||(v[id]={n:0,ok:0});if(t.r&&t.r[i]!=null){o.n++;if(+t.r[i]===+q.bonne)o.ok++;}});}
  _qbS={t:S.data.tentatives,q:S.data.questions,v};return v;
}
const qbPct=o=>o&&o.n?Math.round(o.ok/o.n*100):null;
function qbQuestPage(){
  const Q=qbQ(), can=S.conn==='shared'&&S.role!=='student', m=S.pg.qm||'', q=String(S.pg.qq||'').trim().toLowerCase(), st=qbStats();
  const L=Q.filter(x=>(!m||String(x.module)===m)&&(!q||[x.texte,...(x.choix||[]),x.expl].some(y=>String(y||'').toLowerCase().includes(q))));
  const tb=`<div class="toolbar"><select id="qb-m" aria-label="Module"><option value="">Tous les modules</option>${comps().map(k=>{const n=Q.filter(x=>+x.module===+k.code).length;return n?`<option value="${esc(k.code)}"${m===String(k.code)?' selected':''}>M${esc(k.code)} · ${esc(k.nom)} (${n})</option>`:'';}).join('')}</select>
    <input class="search" id="qb-q" type="search" placeholder="Chercher une question" aria-label="Chercher une question" autocomplete="off" value="${esc(S.pg.qq||'')}"><span class="grow"></span>
    ${can?`<button class="btn" type="button" id="qb-imp" data-act="qb-imp">${icon('up')}Importer</button><button class="btn primary" type="button" id="qb-new" data-act="qb-q">${icon('plus')}Ajouter une question</button>`:''}</div>`;
  if(!Q.length) return tb+emptyBox('Aucune question','Ajoutez des questions à choix multiples par module. Les élèves s’en servent pour les examens blancs et pour s’entraîner.');
  const hard=Q.map(x=>({x,p:qbPct(st[x.id]),n:(st[x.id]||{}).n||0})).filter(o=>o.n>=3&&o.p<60).sort((a,b)=>a.p-b.p).slice(0,5);
  const rows=L.map(x=>{const p=qbPct(st[x.id]), n=(st[x.id]||{}).n||0;
    return xRow('xm-qb',`data-act="qb-q" data-id="${esc(x.id)}"`,`<div class="xm-t"><b>${esc(x.texte)}</b><small>${esc(x.module?'M'+x.module:'Sans module')} · ${pl((x.choix||[]).length,'choix','choix')}</small></div>
      <span class="xm-m">${esc(LET[+x.bonne]||'')} · ${esc((x.choix||[])[+x.bonne]||'')}</span><span class="xm-m">${p==null?'—':`${p} % sur ${n}`}</span><div class="xm-end">${p!=null&&n>=3&&p<60?'<span class="chip bad">Souvent ratée</span>':''}</div>`,x.texte);}).join('');
  return tb+(hard.length?`<section class="panel" id="qb-hard"><h2>Les plus ratées</h2><ul class="plist">${hard.map(o=>`<li><span><button class="link" type="button" data-act="qb-q" data-id="${esc(o.x.id)}">${esc(o.x.texte)}</button><span class="muted sm"> · M${esc(o.x.module||'')}</span></span><span class="chip bad">${o.p} % de bonnes réponses</span></li>`).join('')}</ul><p class="help u-mt6">À revoir en classe, ou à reformuler si la question prête à confusion.</p></section>`:'')
    +(L.length?xList('xm-qb',[['Question'],['Bonne réponse'],['Réussite'],['','r',1]],rows):'<section class="panel"><p class="help">Aucune question ne correspond.</p></section>')
    +`<p class="help u-mt8">${L.length===Q.length?pl(Q.length,'question','questions'):`${L.length} sur ${Q.length}`}.</p>`;
}
const qbModSel=(id,cur,any)=>`<select id="${id}">${any?`<option value="">${any}</option>`:''}${comps().map(k=>`<option value="${esc(k.code)}"${String(cur)===String(k.code)?' selected':''}>M${esc(k.code)} · ${esc(k.nom)}</option>`).join('')}</select>`;
function qbQDrawer(d){
  const x=d.id?byId(S.data.questions||[],d.id):null, can=S.conn==='shared'&&S.role!=='student';
  if(d.id&&!x) return goneHTML('Question');
  const v=x||{module:S.pg.qm||(comps()[0]||{}).code||'',choix:['','','',''],bonne:0}, ch=(v.choix||[]).concat(['','','','']).slice(0,Math.max(4,(v.choix||[]).length));
  const st=x&&qbStats()[x.id], pc=st&&st.n?Math.round(st.ok*100/st.n):null;
  const sub=pc==null?(x?'Pas encore posée dans un examen blanc':''):`<span class="chip ${pc>=70?'ok':pc>=50?'warn':'bad'}">${pc} % de bonnes réponses</span> <span class="muted">sur ${pl(st.n,'réponse','réponses')}</span>`;
  return dTop(x?'Modifier la question':'Nouvelle question','Question à choix multiples',sub)+`<form class="dr-body" data-form="qb-q" novalidate>
    <label class="field"><span>Module</span>${qbModSel('qq-mod',v.module)}</label>
    <label class="field"><span>Question</span><textarea id="qq-texte" rows="3" maxlength="400">${esc(v.texte||'')}</textarea></label>
    <fieldset class="qb-ch"><legend>Choix de réponse · cochez la bonne</legend>${ch.map((c,i)=>`<label class="qb-c"><input type="radio" name="qq-bonne" value="${i}"${+v.bonne===i?' checked':''} aria-label="Bonne réponse : ${LET[i]}"><b>${LET[i]}</b><input id="qq-c${i}" maxlength="200" value="${esc(c)}" autocomplete="off" aria-label="Texte du choix ${LET[i]}" placeholder="Choix ${LET[i]}${i>1?' (facultatif)':''}"><span class="qb-good">Bonne réponse</span></label>`).join('')}</fieldset>
    <label class="field qb-expl"><span>Explication <small>montrée à l’élève après l’examen</small></span><textarea id="qq-expl" rows="2" maxlength="400" placeholder="Pourquoi c’est la bonne réponse">${esc(v.expl||'')}</textarea></label>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    ${can?`<div class="dr-foot"><button class="btn primary" type="submit" id="qq-save"${dis()}>Enregistrer</button>${x?(d.ask?`<button class="btn danger" type="button" id="qq-del-yes" data-act="qb-del-yes">Supprimer la question</button><button class="btn ghost" type="button" data-act="fo-ask-no">Annuler</button>`:'<button class="btn ghost" type="button" data-act="fo-ask">Supprimer</button>'):''}</div>`:''}</form>`;
}
async function qbSaveQ(){
  const d=S.dr, v=id=>String(($('#'+id)||{}).value||'').trim();
  const choix=[0,1,2,3,4,5].map(i=>v('qq-c'+i)), bi=+((document.querySelector('input[name=qq-bonne]:checked')||{}).value||0);
  const keep=choix.map((c,i)=>({c,i})).filter(o=>o.c), bonne=keep.findIndex(o=>o.i===bi);
  if(!v('qq-texte')){d.err='Écrivez la question.';renderDrawer();return;}
  if(keep.length<2){d.err='Inscrivez au moins deux choix de réponse.';renderDrawer();return;}
  if(bonne<0){d.err='La bonne réponse cochée est vide.';renderDrawer();return;}
  const old=d.id?byId(S.data.questions,d.id):null, doc=Object.assign({},old&&old.exemple?{exemple:true}:{},{module:+v('qq-mod')||null,texte:v('qq-texte'),choix:keep.map(o=>o.c),bonne,expl:v('qq-expl'),maj:new Date().toISOString(),par:whoAmI()});
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('questions').doc(d.id||foId('q')).set(doc),d.id?'Question enregistrée':'Question ajoutée');
  S.busy=false;if(ok&&S.dr===d)S.dr=null;render();
}
/* Importer : « Question ; choix A ; choix B ; choix C ; choix D ; lettre de la bonne réponse », une par ligne */
function qbParse(txt){
  const ok=[], bad=[];
  String(txt||'').split(/\r?\n/).map(l=>l.trim()).filter(Boolean).forEach((l,n)=>{
    const p=l.split(l.includes('\t')?'\t':';').map(x=>x.trim()), last=(p[p.length-1]||'').toUpperCase(), bi=LET.indexOf(last);
    const choix=p.slice(1,-1).filter(Boolean);
    if(p.length<4||last.length!==1||bi<0||bi>=choix.length||!p[0]) bad.push(n+1);else ok.push({texte:p[0],choix,bonne:bi});
  });
  return {ok,bad};
}
function qbImpDrawer(d){
  const P=qbParse(d.txt||'');
  return dTop('Importer des questions','Coller une liste')+`<form class="dr-body" data-form="qb-imp" novalidate>
    <label class="field"><span>Module</span>${qbModSel('qi-mod',d.mod||S.pg.qm||(comps()[0]||{}).code)}</label>
    <label class="field"><span>Une question par ligne</span><textarea id="qi-txt" rows="10" placeholder="Quels sont les trois éléments du triangle du feu ? ; Combustible, comburant, chaleur ; Eau, air, feu ; Fumée, flamme, braise ; A">${esc(d.txt||'')}</textarea>
      <small class="help">Question ; choix A ; choix B ; choix C… ; lettre de la bonne réponse. Les colonnes d’Excel collées (tabulations) fonctionnent aussi.</small></label>
    <p class="help" id="qi-sum">${P.ok.length?pl(P.ok.length,'question prête','questions prêtes'):'Aucune question reconnue.'}${P.bad.length?` · lignes ignorées : ${P.bad.slice(0,8).join(', ')}${P.bad.length>8?'…':''}`:''}</p>
    <div class="dr-foot"><button class="btn primary" type="submit" id="qi-go"${P.ok.length&&!S.busy?'':' disabled'}>Importer ${P.ok.length?pl(P.ok.length,'question','questions'):''}</button></div></form>`;
}
async function qbImport(){
  const d=S.dr, P=qbParse(($('#qi-txt')||{}).value||''), mod=+(($('#qi-mod')||{}).value)||null, now=new Date().toISOString();
  if(!P.ok.length) return;
  const fns=P.ok.map(x=>()=>col('questions').doc(foId('q')).set(Object.assign(x,{module:mod,expl:'',maj:now,par:whoAmI()})));
  S.dr=null;
  if(await runAll(fns,pl(P.ok.length,'question importée','questions importées'))) logEv('formation',`a importé ${pl(P.ok.length,'question','questions')} (M${mod||''})`);
}
/* ---------- Examens blancs ---------- */
const qbB=()=>(S.data.blancs||[]).slice().sort((a,b)=>String(b.du||'').localeCompare(String(a.du||''))||collator.compare(a.nom||'',b.nom||''));
const qbState=x=>{const t=todayISO();return x.du&&t<x.du?['info','À venir']:x.au&&t>x.au?['off','Terminé']:['ok','Ouvert'];};
const qbFor=(x,gid)=>!(x.classes||[]).length||(x.classes||[]).includes(gid);
const qbOpenFor=e=>qbB().filter(x=>qbFor(x,e.groupe)&&qbState(x)[1]==='Ouvert');
const qbTries=(x,eid)=>qbTen().filter(t=>t.exam===x.id&&t.eleve===eid).sort((a,b)=>String(a.debut).localeCompare(String(b.debut)));
const qbDone=(x,eid)=>qbTries(x,eid).some(t=>t.fin);
const qbBest=(x,eid)=>qbTries(x,eid).filter(t=>t.fin).reduce((m,t)=>Math.max(m,+t.pct||0),-1);
const qbPool=x=>(S.data.questions||[]).filter(q=>!(x.modules||[]).length||(x.modules||[]).map(Number).includes(+q.module));
const qbSeuil=x=>+x.seuil||seuil();
function qbBlancsPage(){
  if(S.role==='student') return S.pg.qt?qbTakeView():qbMyBlancs(foMe());
  const B=qbB(), can=S.conn==='shared';
  const tb=`<div class="toolbar"><p class="summary u-m0"><span><b>${B.length}</b>${B.length>1?'examens blancs':'examen blanc'}</span><span><b>${(S.data.questions||[]).length}</b>questions</span></p><span class="grow"></span>${can?`<button class="btn primary" type="button" id="qb-b-new" data-act="qb-b">${icon('plus')}Nouvel examen blanc</button>`:''}</div>`;
  if(!B.length) return tb+emptyBox('Aucun examen blanc','Un examen blanc tire au hasard des questions des modules choisis, comme les examens théoriques de l’ENPQ (30 ou 40 questions). Les élèves le font en ligne et voient la correction tout de suite.');
  const rows=B.map(x=>{const st=qbState(x), T=qbTen().filter(t=>t.exam===x.id&&t.fin), avg=T.length?Math.round(T.reduce((n,t)=>n+(+t.pct||0),0)/T.length):null, who=new Set(T.map(t=>t.eleve)).size;
    return xRow('xm-qe',`data-act="qb-b" data-id="${esc(x.id)}"`,`<div class="xm-t"><b>${esc(x.nom)}</b><small>${esc((x.modules||[]).length?(x.modules||[]).map(m=>'M'+m).join(', '):'Tous les modules')}</small></div>
      <span class="xm-m">${pl(+x.nb||30,'question','questions')} · ${esc(String(+x.duree||45))} min</span><span class="xm-m">${esc((x.classes||[]).length?(x.classes||[]).map(gName).join(', '):'Toutes les classes')}</span>
      <span class="xm-m">${x.du?esc(shortDate(parse(x.du))):''}${x.au?' au '+esc(shortDate(parse(x.au))):''}</span><span class="xm-m">${who?`${pl(who,'élève','élèves')} · moyenne ${avg} %`:'Aucune tentative'}</span><div class="xm-end"><span class="chip ${st[0]}">${st[1]}</span></div>`,x.nom);}).join('');
  return tb+xList('xm-qe',[['Examen'],['Format'],['Classes'],['Période'],['Résultats'],['','r',1]],rows);
}
function qbBDrawer(d){
  const x=d.id?byId(S.data.blancs||[],d.id):null, can=S.conn==='shared';
  if(d.id&&!x) return goneHTML('Examen blanc');
  const v=x||{nb:30,duree:45,modules:[],classes:[],du:todayISO(),au:iso(addDays(new Date(),14)),seuil:seuil()}, has=(a,k)=>(a||[]).map(String).includes(String(k));
  let res='';
  if(x){
    const T=qbTen().filter(t=>t.exam===x.id&&t.fin), by={};for(const t of T){const o=by[t.eleve]||(by[t.eleve]={n:0,best:-1,last:null});o.n++;o.best=Math.max(o.best,+t.pct||0);o.last=t;}
    const els=S.data.eleves.filter(e=>qbFor(x,e.groupe)).sort((a,b)=>collator.compare(gName(a.groupe),gName(b.groupe))||collator.compare(a.nom,b.nom));
    res=`<h3 class="sb-h3">Résultats</h3>${els.length?`<ul class="plist" id="qb-b-res">${els.map(e=>{const o=by[e.id];return `<li><span>${esc(e.nom)}<span class="muted sm"> · ${esc(gName(e.groupe))}${o?' · '+pl(o.n,'tentative','tentatives'):''}</span></span>${o?`<span class="chip ${o.best>=qbSeuil(x)?'ok':'bad'}">${o.best} %</span>`:'<span class="chip off">Pas fait</span>'}</li>`;}).join('')}</ul>`:'<p class="help">Aucun élève.</p>'}`;
  }
  return dTop(x?'Examen blanc':'Nouvel examen blanc',x?esc(x.nom):'Questions tirées au hasard')+`<form class="dr-body" data-form="qb-b" novalidate>
    <label class="field"><span>Nom</span><input id="qe-nom" maxlength="80" value="${esc(v.nom||'')}" placeholder="Ex. Examen blanc · section 1" autocomplete="off"></label>
    <h3 class="sb-h3">Modules (aucun coché : tous)</h3><div class="ck-grid">${comps().map(k=>{const n=(S.data.questions||[]).filter(q=>+q.module===+k.code).length;return `<label class="ck"><input type="checkbox" name="qe-m" value="${esc(k.code)}"${has(v.modules,k.code)?' checked':''}> <span>M${esc(k.code)} ${esc(k.nom)} <small class="muted">(${n})</small></span></label>`;}).join('')}</div>
    <div class="grid3"><label class="field"><span>Questions</span><input id="qe-nb" type="number" min="1" max="100" value="${esc(String(+v.nb||30))}"></label><label class="field"><span>Durée (min)</span><input id="qe-duree" type="number" min="1" max="240" value="${esc(String(+v.duree||45))}"></label><label class="field"><span>Réussite (%)</span><input id="qe-seuil" type="number" min="1" max="100" value="${esc(String(qbSeuil(v)))}"></label></div>
    <div class="grid2"><label class="field"><span>Ouvert du</span><input id="qe-du" type="date" value="${esc(v.du||'')}"></label><label class="field"><span>au</span><input id="qe-au" type="date" value="${esc(v.au||'')}"></label></div>
    <h3 class="sb-h3">Classes (aucune cochée : toutes)</h3><div class="ck-grid">${groups().map(g=>`<label class="ck"><input type="checkbox" name="qe-g" value="${esc(g.id)}"${has(v.classes,g.id)?' checked':''}> ${esc(g.nom)}</label>`).join('')}</div>
    ${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    ${can?`<div class="dr-foot"><button class="btn primary" type="submit" id="qe-save"${dis()}>Enregistrer</button>${x?(d.ask?`<button class="btn danger" type="button" id="qe-del-yes" data-act="qb-b-del-yes">Supprimer l’examen</button><button class="btn ghost" type="button" data-act="fo-ask-no">Annuler</button>`:'<button class="btn ghost" type="button" data-act="fo-ask">Supprimer</button>'):''}</div>`:''}${res}</form>`;
}
async function qbSaveB(f){
  const d=S.dr, v=id=>String(($('#'+id)||{}).value||'').trim(), vals=n=>[...f.querySelectorAll(`input[name=${n}]:checked`)].map(i=>i.value);
  const doc={nom:v('qe-nom'),modules:vals('qe-m').map(Number),classes:vals('qe-g'),nb:Math.min(100,Math.max(1,Math.round(+v('qe-nb')||30))),duree:Math.min(240,Math.max(1,Math.round(+v('qe-duree')||45))),seuil:Math.min(100,Math.max(1,Math.round(+v('qe-seuil')||seuil()))),du:v('qe-du'),au:v('qe-au'),maj:new Date().toISOString(),par:whoAmI()};
  if(!doc.nom){d.err='Donnez un nom à l’examen.';renderDrawer();return;}
  if(doc.du&&doc.au&&doc.au<doc.du){d.err='La fin précède le début.';renderDrawer();return;}
  if(!qbPool(doc).length){d.err='Aucune question dans ces modules : ajoutez-en dans la banque de questions.';renderDrawer();return;}
  const old=d.id?byId(S.data.blancs,d.id):null;
  S.busy=true;renderDrawer();
  const ok=await write(()=>col('ex-blancs').doc(d.id||foId('b')).set(Object.assign({},old&&old.exemple?{exemple:true}:{},doc)),d.id?'Examen blanc enregistré':'Examen blanc créé');
  S.busy=false;if(ok){logEv('formation',(d.id?'a modifié':'a créé')+' l’examen blanc « '+doc.nom+' »');if(S.dr===d)S.dr=null;}render();
}
/* L’élève : ses examens blancs ouverts, ses résultats */
function qbMyBlancs(e){
  if(!e) return '';
  const B=qbB().filter(x=>qbFor(x,e.groupe)&&qbState(x)[1]!=='À venir'), can=S.conn==='shared';
  if(!B.length) return emptyBox('Aucun examen blanc','Vos enseignants ouvriront des examens blancs avant les examens. En attendant, entraînez-vous dans « S’entraîner ».');
  return `<div class="qb-my">${B.map(x=>{const st=qbState(x), T=qbTries(x,e.id), cur=T.find(t=>!t.fin), best=qbBest(x,e.id), pool=qbPool(x).length;
    return `<section class="panel qb-card" id="qb-my-${esc(x.id)}"><div class="qb-h"><h2>${esc(x.nom)}</h2><span class="chip ${st[0]}">${st[1]}</span></div><p class="muted">${pl(Math.min(+x.nb||30,pool),'question','questions')} · ${esc(String(+x.duree||45))} min · réussite à ${qbSeuil(x)} %${x.au?' · jusqu’au '+esc(shortDate(parse(x.au))):''}</p>
      ${best>=0?`<p>Meilleur résultat : <b class="${best>=qbSeuil(x)?'ok-t':'bad-t'}">${best} %</b> · ${pl(T.filter(t=>t.fin).length,'tentative','tentatives')}</p>`:''}
      <div class="row">${can&&st[1]==='Ouvert'?(cur?`<button class="btn primary" type="button" data-act="qb-go" data-id="${esc(cur.id)}">Reprendre</button>`:`<button class="btn primary" type="button" id="qb-start-${esc(x.id)}" data-act="qb-start" data-id="${esc(x.id)}">${T.length?'Recommencer':'Commencer'}</button>`):''}${T.filter(t=>t.fin).slice(-1).map(t=>`<button class="btn ghost" type="button" data-act="qb-go" data-id="${esc(t.id)}">Voir ma correction</button>`).join('')}</div></section>`;}).join('')}</div>`;
}
const qbShuffle=a=>{const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
async function qbStart(id){
  const x=byId(S.data.blancs||[],id), e=foMe();if(!x||!e||S.busy) return;
  const Q=qbShuffle(qbPool(x)).slice(0,+x.nb||30);
  if(!Q.length){toast('Cet examen n’a pas encore de questions.','bad');return;}
  const tid=foId('t'), now=new Date().toISOString();
  S.busy=true;render();
  const ok=await write(()=>col('ex-tentatives').doc(tid).set({exam:x.id,nom:x.nom,eleve:e.id,groupe:e.groupe||'',debut:now,fin:'',q:Q.map(q=>q.id),r:Q.map(()=>null),duree:+x.duree||45,score:null,total:Q.length,pct:null}));
  S.busy=false;if(ok){S.pg.qt=tid;S.pg.qi=0;S.pg.qask=false;}render();
}
const qbLeft=t=>Math.max(0,Math.round(((+t.duree||45)*60*1000-(Date.now()-new Date(t.debut).getTime()))/1000));
let qbTimer=null;
function qbTick(){
  const t=S.pg.qt&&qbTen().find(x=>x.id===S.pg.qt);
  if(!t||t.fin||S.page!=='formation'){clearInterval(qbTimer);qbTimer=null;return;}
  const s=qbLeft(t), el=$('#qb-left');if(el){el.textContent=foClock(s);el.classList.toggle('bad-t',s<60);}
  if(s<=0&&!S.busy) qbFinish(t.id,true);
}
function qbTakeView(){
  const t=qbTen().find(x=>x.id===S.pg.qt);
  if(!t) return '<div class="empty"><p>Préparation de l’examen…</p></div>';
  if(t.fin) return qbCorrection(t);
  if(!qbTimer) qbTimer=setInterval(qbTick,1000);
  const Q=new Map((S.data.questions||[]).map(q=>[q.id,q])), n=(t.q||[]).length, i=Math.min(Math.max(0,+S.pg.qi||0),n-1), q=Q.get(t.q[i]), done=(t.r||[]).filter(v=>v!=null).length;
  const dots=(t.q||[]).map((id,k)=>`<button type="button" class="qb-dot${k===i?' on':''}${(t.r||[])[k]!=null?' done':''}" data-act="qb-i" data-v="${k}" aria-label="Question ${k+1}">${k+1}</button>`).join('');
  return `<div class="toolbar qb-bar"><b>${esc(t.nom)}</b><span class="grow"></span><span class="muted">${done} sur ${n} répondues</span><span class="qb-time">Temps restant <b id="qb-left">${foClock(qbLeft(t))}</b></span></div>
    <section class="panel qb-q" id="qb-take"><p class="eyebrow">Question ${i+1} sur ${n}${q&&q.module?' · M'+esc(q.module):''}</p><h2 id="qb-texte">${q?esc(q.texte):'Question retirée de la banque'}</h2>
      <div class="qb-opts" role="radiogroup" aria-labelledby="qb-texte">${q?(q.choix||[]).map((c,k)=>`<button type="button" class="qb-opt" role="radio" aria-checked="${+(t.r||[])[i]===k&&(t.r||[])[i]!=null}" data-act="qb-ans" data-i="${i}" data-c="${k}" id="qb-o${k}"><b>${LET[k]}</b><span>${esc(c)}</span></button>`).join(''):''}</div>
      <div class="row qb-nav"><button class="btn" type="button" data-act="qb-i" data-v="${i-1}"${i?'':' disabled'}>${icon('left')}Précédente</button><span class="grow"></span>${i<n-1?`<button class="btn" type="button" id="qb-next" data-act="qb-i" data-v="${i+1}">Suivante${icon('right')}</button>`:''}</div></section>
    <div class="qb-dots" aria-label="Questions">${dots}</div>
    <div class="row qb-end">${S.pg.qask?`<p>${n-done?pl(n-done,'question est sans réponse','questions sont sans réponse')+'. ':''}Remettre l’examen ? Vous ne pourrez plus changer vos réponses.</p><button class="btn primary" type="button" id="qb-finish-yes" data-act="qb-finish"${dis()}>Remettre</button><button class="btn ghost" type="button" data-act="qb-ask" data-v="">Continuer l’examen</button>`:`<button class="btn primary" type="button" id="qb-finish" data-act="qb-ask" data-v="1">Remettre l’examen</button>`}</div>`;
}
async function qbAnswer(i,c){
  const t=qbTen().find(x=>x.id===S.pg.qt);if(!t||t.fin) return;
  const r=(t.r||[]).slice();r[i]=c;t.r=r;render();
  await write(()=>col('ex-tentatives').doc(t.id).update({r}));
}
async function qbFinish(id,auto){
  const t=qbTen().find(x=>x.id===id);if(!t||t.fin||S.busy) return;
  const Q=new Map((S.data.questions||[]).map(q=>[q.id,q])), ids=(t.q||[]).filter(x=>Q.has(x));
  const score=(t.q||[]).filter((qid,i)=>Q.has(qid)&&(t.r||[])[i]!=null&&+t.r[i]===+Q.get(qid).bonne).length, total=ids.length||1, pct=Math.round(score/total*100);
  S.busy=true;S.pg.qask=false;render();
  const ok=await write(()=>col('ex-tentatives').doc(t.id).update({fin:new Date().toISOString(),score,total,pct}),auto?'Temps écoulé : l’examen est remis.':'Examen remis');
  S.busy=false;if(ok)S.pg.qi=0;render();
}
function qbCorrection(t){
  const Q=new Map((S.data.questions||[]).map(q=>[q.id,q])), x=byId(S.data.blancs||[],t.exam)||{}, ok=(+t.pct||0)>=qbSeuil(x);
  const items=(t.q||[]).map((id,i)=>{const q=Q.get(id);if(!q) return '';const r=(t.r||[])[i], good=r!=null&&+r===+q.bonne;
    return `<li class="qb-cor ${good?'good':'bad'}"><p><b>${i+1}.</b> ${esc(q.texte)}</p><p class="muted sm">${r==null?'Sans réponse':'Votre réponse : '+esc(LET[r]+' · '+((q.choix||[])[r]||''))}${good?'':` · Bonne réponse : <b>${esc(LET[q.bonne]+' · '+((q.choix||[])[q.bonne]||''))}</b>`}</p>${q.expl?`<p class="sm">${esc(q.expl)}</p>`:''}</li>`;}).join('');
  return `<div class="toolbar"><button class="btn ghost" type="button" data-act="qb-back">${icon('left')}Mes examens blancs</button><span class="grow"></span></div>
    <section class="panel" id="qb-result"><h2>${esc(t.nom||'Examen blanc')}</h2><p class="qb-score"><b class="${ok?'ok-t':'bad-t'}">${esc(String(t.pct))} %</b> · ${esc(String(t.score))} sur ${esc(String(t.total))} · ${ok?'réussi':'sous le seuil de '+qbSeuil(x)+' %'}</p></section>
    <section class="panel"><h2>Correction</h2><ol class="qb-cors">${items}</ol></section>`;
}
/* S’entraîner : dix questions d’un module, la réponse tout de suite ; rien n’est enregistré */
function qbTrainPage(){
  const e=foMe(), tr=S.pg.tr, Q=new Map((S.data.questions||[]).map(q=>[q.id,q]));
  const mods=comps().filter(k=>(S.data.questions||[]).some(q=>+q.module===+k.code));
  if(!mods.length) return emptyBox('Aucune question','La banque de questions est vide pour l’instant.');
  if(!tr||!tr.q) return `<section class="panel" id="qb-train"><h2>S’entraîner</h2><p>Dix questions au hasard d’un module, avec la bonne réponse et l’explication tout de suite. Rien n’est noté.</p>
    <div class="row"><select id="qb-tm" aria-label="Module">${mods.map(k=>`<option value="${esc(k.code)}"${String(S.pg.tm||'')===String(k.code)?' selected':''}>M${esc(k.code)} · ${esc(k.nom)}</option>`).join('')}</select><button class="btn primary" type="button" id="qb-train-go" data-act="qb-train">Commencer</button></div></section>`;
  if(tr.i>=tr.q.length){const good=tr.r.filter((r,i)=>Q.get(tr.q[i])&&+r===+Q.get(tr.q[i]).bonne).length;
    return `<section class="panel" id="qb-train-end"><h2>Résultat</h2><p class="qb-score"><b>${good} sur ${tr.q.length}</b></p><div class="row"><button class="btn primary" type="button" data-act="qb-train">Recommencer</button><button class="btn ghost" type="button" data-act="qb-train-stop">Choisir un autre module</button></div></section>`;}
  const q=Q.get(tr.q[tr.i]), r=tr.r[tr.i];if(!q){tr.i++;return qbTrainPage();}
  return `<section class="panel qb-q" id="qb-train-q"><p class="eyebrow">Question ${tr.i+1} sur ${tr.q.length} · M${esc(q.module||'')}</p><h2>${esc(q.texte)}</h2>
    <div class="qb-opts">${(q.choix||[]).map((c,k)=>`<button type="button" class="qb-opt${r!=null?(k===+q.bonne?' good':k===r?' bad':''):''}" data-act="qb-tans" data-c="${k}"${r!=null?' disabled':''}><b>${LET[k]}</b><span>${esc(c)}</span></button>`).join('')}</div>
    ${r!=null?`<p class="${+r===+q.bonne?'ok-t':'bad-t'}" id="qb-fb"><b>${+r===+q.bonne?'Bonne réponse.':'Mauvaise réponse.'}</b> ${esc(q.expl||'')}</p><div class="row"><button class="btn primary" type="button" id="qb-tnext" data-act="qb-tnext">${tr.i<tr.q.length-1?'Question suivante':'Voir le résultat'}</button></div>`:''}</section>`;
}
function qbDrawer(d){return d.mode==='q'?qbQDrawer(d):d.mode==='qimp'?qbImpDrawer(d):d.mode==='blanc'?qbBDrawer(d):goneHTML();}

document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled||!/^qb-/.test(b.dataset.act))return;
  const a=b.dataset.act, pg=S.pg;
  switch(a){
    case 'qb-q':openDrawer({kind:'fo',mode:'q',id:b.dataset.id||''});break;
    case 'qb-imp':openDrawer({kind:'fo',mode:'qimp',txt:''});break;
    case 'qb-del-yes':{const d=S.dr;if(!d||S.busy)break;S.busy=true;renderDrawer();const ok=await write(()=>col('questions').doc(d.id).delete(),'Question supprimée');S.busy=false;if(ok)S.dr=null;render();break;}
    case 'qb-b':openDrawer({kind:'fo',mode:'blanc',id:b.dataset.id||''});break;
    case 'qb-b-del-yes':{const d=S.dr;if(!d||S.busy)break;S.busy=true;renderDrawer();const ok=await write(()=>col('ex-blancs').doc(d.id).delete(),'Examen blanc supprimé');S.busy=false;if(ok)S.dr=null;render();break;}
    case 'qb-start':await qbStart(b.dataset.id);break;
    case 'qb-go':pg.qt=b.dataset.id;pg.qi=0;pg.qask=false;render();window.scrollTo({top:0});break;
    case 'qb-back':pg.qt='';render();break;
    case 'qb-i':pg.qi=+b.dataset.v;render();break;
    case 'qb-ans':await qbAnswer(+b.dataset.i,+b.dataset.c);break;
    case 'qb-ask':pg.qask=!!b.dataset.v;render();break;
    case 'qb-finish':await qbFinish(pg.qt,false);break;
    case 'qb-train':{const m=pg.tm||String((comps().find(k=>(S.data.questions||[]).some(q=>+q.module===+k.code))||{}).code||'');pg.tm=m;const Q=qbShuffle((S.data.questions||[]).filter(q=>String(q.module)===String(m))).slice(0,10);pg.tr={q:Q.map(q=>q.id),i:0,r:[]};render();break;}
    case 'qb-tans':if(pg.tr){pg.tr.r[pg.tr.i]=+b.dataset.c;render();}break;
    case 'qb-tnext':if(pg.tr){pg.tr.i++;render();}break;
    case 'qb-train-stop':pg.tr=null;render();break;
  }
});
document.addEventListener('submit',async e=>{
  const f=e.target, k=f.dataset.form;if(!/^qb-/.test(k||''))return;
  e.preventDefault();if(S.busy) return;
  if(k==='qb-q') await qbSaveQ();else if(k==='qb-imp') await qbImport();else if(k==='qb-b') await qbSaveB(f);
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='qi-txt'&&S.dr&&S.dr.mode==='qimp'){S.dr.txt=t.value;const P=qbParse(t.value), s=$('#qi-sum'), g=$('#qi-go');if(s)s.textContent=(P.ok.length?pl(P.ok.length,'question prête','questions prêtes'):'Aucune question reconnue.')+(P.bad.length?` · lignes ignorées : ${P.bad.slice(0,8).join(', ')}${P.bad.length>8?'…':''}`:'');if(g){g.disabled=!P.ok.length;g.textContent='Importer '+(P.ok.length?pl(P.ok.length,'question','questions'):'');}return;}
  if(t.id==='qb-q'){S.pg.qq=t.value;render();}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.id==='qb-m'){S.pg.qm=t.value;render();}
  else if(t.id==='qb-tm'){S.pg.tm=t.value;}
  else if(t.id==='qi-mod'&&S.dr){S.dr.mod=t.value;}
});
