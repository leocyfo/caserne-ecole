/* ---------- Présence par code QR ----------
   Dans la feuille de présences, l’enseignant affiche un code pour la séance. L’élève le scanne avec l’appareil photo de son
   téléphone (le lien ouvre le site) ou tape le code dans « Présence » ; il s’inscrit dans presences-qr/<code>__<élève>
   { code, eleve, nom, le }. L’enseignant voit qui a scanné et les marque présents d’un clic, puis enregistre comme d’habitude.
   Un code vaut 20 minutes ; il n’est gardé que dans la page de l’enseignant. */
const QR_MIN=20;
const qrCodes={};
let qrUnsub=null;
const qrNew=()=>{const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=A[Math.floor(Math.random()*A.length)];return s;};
const qrLive=q=>!!q&&Date.now()-q.t<QR_MIN*60000;
const qrUrl=code=>location.href.split('#')[0]+'#pres='+code;
function qrAttHTML(s){
  const d=S.dr;if(!d||S.role==='student'||S.conn!=='shared'||S.archive) return '';
  const q=qrCodes[d.key];
  if(!qrLive(q)) return `<div class="row qr-row"><button class="btn sm" type="button" id="qr-open" data-act="qr-open">${icon('eye')}Présence par code QR</button><span class="muted sm">Les élèves scannent le code avec leur téléphone.</span></div>`;
  const els=studentsOf(s.c.groupe), ids=new Set(els.map(e=>e.id)), got=(S.data.qrScans||[]).filter(x=>x.code===q.code&&ids.has(x.eleve)), todo=got.filter(x=>d.draft.statuts[x.eleve]!=='P');
  const end=new Date(q.t+QR_MIN*60000);
  return `<div class="qr-box" id="qr-box"><div class="qr-img" id="qr-img">${q.svg||'<span class="muted sm">Préparation du code…</span>'}</div><div class="qr-t">
    <p>Scannez ce code, ou tapez <b class="qr-code" id="qr-code">${esc(q.code)}</b> dans « Présence » de l’espace élève.</p><p class="muted sm">Valide jusqu’à ${fmtT(end.getHours()*60+end.getMinutes())}.</p>
    <p id="qr-n"><b>${got.length}</b> sur ${els.length} ${got.length>1?'ont scanné':'a scanné'}${got.length?' : '+esc(got.map(x=>(byId(S.data.eleves,x.eleve)||x).nom).join(', ')):''}.</p>
    <div class="row">${todo.length?`<button class="btn sm primary" type="button" id="qr-mark" data-act="qr-mark">Marquer présents (${todo.length})</button>`:''}<button class="btn sm ghost" type="button" data-act="qr-close">Retirer le code</button></div></div></div>`;
}
async function qrOpen(){
  const d=S.dr;if(!d||d.kind!=='att') return;
  const q={code:qrNew(),t:Date.now(),svg:''};qrCodes[d.key]=q;
  if(qrUnsub){try{qrUnsub();}catch(e){}}
  try{qrUnsub=col('presences-qr').where('code','==',q.code).onSnapshot(x=>{S.data.qrScans=x.docs.map(y=>Object.assign({},y.data(),{id:y.id}));if(S.dr&&S.dr.kind==='att')renderDrawer();},()=>{});}catch(e){}
  renderDrawer();
  let lib=null;try{if(typeof qrcode!=='function')await loadScript(QR_GEN);lib=window.qrcode;}catch(e){lib=null;}
  if(lib){try{const g=lib(0,'M');g.addData(qrUrl(q.code));g.make();q.svg=g.createSvgTag({cellSize:4,margin:0,scalable:true});}catch(e){}}
  if(!q.svg) q.svg='<span class="muted sm">Code QR indisponible (connexion) : donnez le code aux élèves.</span>';
  if(S.dr&&S.dr.kind==='att') renderDrawer();
}
/* L’élève : le bouton « Présence » à côté de la cloche, et le lien du code QR */
function qrBtnHTML(){
  if(S.role!=='student'||S.conn!=='shared'||S.archive||!allLoaded()) return '';
  return `<button type="button" class="bell" id="qr-in" data-act="qr-in" aria-label="Présence" title="Je suis présent : scanner ou taper le code de la séance">${icon('calok')}</button>`;
}
function qrDrawer(d){
  return dTop('Présence','Je suis présent','Le code est affiché par votre enseignant.')+`<form class="dr-body" data-form="qr-in" novalidate>
    <label class="field"><span>Code de la séance</span><input id="qr-c" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ex. K7Q2MD" value="${esc(d.code||'')}" class="qr-input"></label>
    <p class="help">Avec l’appareil photo du téléphone, vous pouvez aussi scanner directement le code QR.</p>${d.err?`<p class="form-err" role="alert">${esc(d.err)}</p>`:''}
    <div class="dr-foot"><button class="btn primary" type="submit" id="qr-send"${dis()}>Signaler ma présence</button></div></form>`;
}
async function qrSend(code){
  const c=String(code||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(c.length!==6){if(S.dr&&S.dr.mode==='qrin'){S.dr.err='Le code a 6 caractères.';renderDrawer();}else toast('Code de présence invalide.','bad');return false;}
  const e=byId(S.data.eleves,S.student)||((myAcct()||{}).fiche)||null;
  if(S.role!=='student'||!S.student){toast('Ouvrez ce code avec un compte élève.','bad');return false;}
  S.busy=true;if(S.dr)renderDrawer();
  const ok=await write(()=>col('presences-qr').doc(c+'__'+S.student).set({code:c,eleve:S.student,nom:(e&&e.nom)||whoAmI(),le:new Date().toISOString()}),'Présence signalée : votre enseignant la confirme.');
  S.busy=false;if(ok&&S.dr&&S.dr.mode==='qrin')S.dr=null;render();return ok;
}
function qrHash(){
  const m=/#pres=([A-Za-z0-9]{6})/.exec(location.hash);if(!m) return;
  try{history.replaceState(null,'',location.href.split('#')[0]);}catch(e){}
  qrSend(m[1]);
}
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-act]');if(!b||b.disabled||!/^qr-/.test(b.dataset.act))return;
  const d=S.dr;
  switch(b.dataset.act){
    case 'qr-open':await qrOpen();break;
    case 'qr-close':if(d){delete qrCodes[d.key];if(qrUnsub){try{qrUnsub();}catch(x){}qrUnsub=null;}renderDrawer();}break;
    case 'qr-mark':{if(!d||d.kind!=='att')break;const q=qrCodes[d.key];if(!q)break;for(const x of S.data.qrScans||[]) if(x.code===q.code&&studentsOf(findSess(d.date,d.key).c.groupe).some(el=>el.id===x.eleve)) d.draft.statuts[x.eleve]='P';d.dirty=true;renderDrawer();break;}
    case 'qr-in':openDrawer({kind:'fo',mode:'qrin',code:''});{const i=$('#qr-c');if(i)i.focus();}break;
  }
});
document.addEventListener('submit',async e=>{
  if(e.target.dataset.form!=='qr-in') return;
  e.preventDefault();if(S.busy) return;
  await qrSend(($('#qr-c')||{}).value);
});
