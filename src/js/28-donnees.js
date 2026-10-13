/* ---------- Données partagées ---------- */
function onErr(e){
  if(e&&(e.code==='revoked'||e.code==='unavailable'||e.code==='not_granted'||e.code==='capability_disabled')){S.conn='off';schedule();}
}
function subWeek(){
  if(!DB)return;
  if(unsubPres){unsubPres();unsubPres=null;}
  S.data.presences={};
  const from=iso(S.week), to=iso(addDays(S.week,6));
  try{
    unsubPres=col('presences').where('date','>=',from).where('date','<=',to).onSnapshot(q=>{
      const m={};for(const d of q.docs)m[d.id]=d.data();S.data.presences=m;schedule();
    },onErr);
  }catch(e){onErr(e);}
}
/* Présences passées : on ne charge que la période que la page affiche (le mois en cours par défaut), et on l’élargit
   quand une page en demande plus (« Depuis la rentrée », la fiche d’un élève). Une fois élargie, elle le reste. */
function ensureTerm(from){
  if(!DB)return;
  const t=todayISO(), now=new Date(), want=from||iso(new Date(now.getFullYear(),now.getMonth(),1)), f=S.termFrom&&S.termFrom<=want?S.termFrom:want, k=f+'|'+t;
  if(S.termKey===k)return;
  if(unsubTerm){unsubTerm();unsubTerm=null;}
  S.termKey=k;S.termFrom=f;S.termLoaded=false;
  try{
    unsubTerm=col('presences').where('date','>=',f).where('date','<=',t).onSnapshot(q=>{
      const m={};for(const d of q.docs)m[d.id]=d.data();S.data.presTerm=Object.assign({},S.data.presOne,m);S.termLoaded=true;schedule();
    },e=>{S.termLoaded=true;onErr(e);});
  }catch(e){onErr(e);}
}
/* Les présences d’une séance hors de la période chargée (ouverte depuis l’historique ou les examens) se lisent à la demande,
   pour ne jamais ouvrir une feuille vide par-dessus des présences déjà prises. */
const _pw=new Set();
function loadPres(key,date){
  if(!DB||!key||!date||S.role==='student'||presDoc(key)||_pw.has(key)) return;
  if(date>todayISO()||(date>=iso(S.week)&&date<=iso(addDays(S.week,6)))||(S.termLoaded&&S.termFrom&&date>=S.termFrom)) return;
  _pw.add(key);
  col('presences').doc(key).get().then(s=>{
    if(!s.exists) return;
    S.data.presOne[key]=s.data();
    if(!S.data.presTerm[key]) S.data.presTerm=Object.assign({},S.data.presTerm,{[key]:s.data()});
    schedule();
  }).catch(()=>{_pw.delete(key);});
}
function subscribe(){
  DB.doc('config/ecole').onSnapshot(s=>{S.data.config=s.exists?s.data():null;S.loaded.config=true;S.data.cours=normCours(RAWC);schedule();},onErr);
  for(const k of ['cours','enseignants','groupes','eleves','examens']){
    col(k).onSnapshot(q=>{const a=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));if(k==='cours'){RAWC=a;S.data.cours=normCours(a);}else S.data[k]=a;S.loaded[k]=true;schedule();},e=>{S.loaded[k]=true;onErr(e);});
  }
  col('dossiers-personnel').onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=d.data();S.data.dossiers=m;schedule();},()=>{});
  col('resultats').onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=d.data();S.data.resultats=m;schedule();},()=>{});
  for(const k of ['candidatures','remplacements']) col(k).onSnapshot(q=>{S.data[k]=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{});
  col('disponibilites').onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=d.data();S.data.dispos=m;schedule();},()=>{});
  col('profs-absents').onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=(d.data().ids||[]);S.data.absProfs=m;schedule();},()=>{});
  col('presences-personnel').onSnapshot(q=>{const m={};for(const d of q.docs)m[d.id]=d.data();S.data.staffPres=m;schedule();},()=>{});
  if(S.me.id) DB.doc('comptes/'+S.me.id).onSnapshot(x=>{S.myAcct=x.exists?Object.assign({},x.data(),{id:x.id}):null;schedule();},()=>{});
  if(S.canAdmin!==false) col('demandes').onSnapshot(q=>{S.data.demandes=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{S.data.demandes=[];});
  if(S.canAdmin!==false) col('comptes').onSnapshot(q=>{S.data.comptes=q.docs.map(d=>Object.assign({},d.data(),{id:d.id}));schedule();},()=>{S.data.comptes=[];});
  subWeek();
}
async function init(){
  S.day=defaultDay();
  render();
  const C=window.claude;
  if(!C||typeof C.use!=='function'){S.conn='off';render();return;}
  let db=null,user=null;
  try{[db,user]=await Promise.all([C.use('db'),C.use('user')]);}catch(e){db=null;}
  if(user){
    try{S.canAdmin=await user.canEdit();}catch(e){S.canAdmin=null;}
    try{S.canWrite=await user.can('data.write');}catch(e){S.canWrite=null;}
    USER=user;
    try{const m=await user.me();S.me={id:m.id||null,name:m.name||'',avatarUrl:m.avatarUrl||''};S.isOwner=!!m.isOwner;}catch(e){}
  }
  if(!db){S.conn='off';render();return;}
  DB=db;S.conn='shared';
  subscribe();
  render();
  // Les personnes qui ont la page ouverte : l’administration peut leur créer un compte.
  C.use('room').then(r=>{ROOM=r||null;if(r)r.onPeers(ch=>{S.peers=ch.peers.filter(p=>p.kind==='viewer'&&p.by).map(p=>({by:p.by,isMe:p.isMe,guest:p.guest}));if(S.page==='comptes'||(S.dr&&S.dr.kind==='acct'))schedule();},()=>{});schedule();}).catch(()=>{ROOM=null;});
}
init();
