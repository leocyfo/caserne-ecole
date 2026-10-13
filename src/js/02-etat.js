/* ---------- État ---------- */
const PREF='calendrier-cours-prefs';
let prefs={};
try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}')||{};}catch(e){prefs={};}
const S={
  role:['admin','teacher','student'].includes(prefs.role)?prefs.role:'admin',
  teacher:prefs.teacher||'', group:prefs.group||'', student:prefs.student||'', filtre:prefs.filtre||'', fmode:prefs.fmode==='e'?'e':'g', compact:prefs.compact===true, view:prefs.view==='jour'?'jour':'semaine', dayDate:'', sideMini:prefs.sideMini===true||(prefs.sideMini===undefined&&typeof window!=='undefined'&&window.innerWidth<=900), demoHidden:prefs.demoHidden===true, nvSeen:typeof prefs.nvSeen==='string'?prefs.nvSeen:'', nfSeen:Array.isArray(prefs.nfSeen)?prefs.nfSeen.slice(-400):[],
  page:'calendar', pg:{},
  week:(()=>{const d=new Date(),j=d.getDay();return monday(j===6?addDays(d,2):j===0?addDays(d,1):d);})(), day:0,
  conn:'loading', canAdmin:null, canWrite:null,
  me:{id:null,name:'',avatarUrl:''}, isOwner:false, myAcct:null, peers:[],
  loaded:{}, busy:false, confirmClear:false, termKey:'', termLoaded:false,
  data:{comptes:[],demandes:[],config:null,cours:[],enseignants:[],dossiers:{},groupes:[],eleves:[],examens:[],presences:{},presTerm:{},presOne:{},staffPres:{},absProfs:{},candidatures:[],remplacements:[],dispos:{},resultats:{},mesRes:{},mesPct:{},journal:[]},
  dr:null
};
let DB=null, unsubPres=null, unsubTerm=null, unsubMR=null, uidSeq=0;
function savePrefs(){try{localStorage.setItem(PREF,JSON.stringify({role:S.role,teacher:S.teacher,group:S.group,student:S.student,filtre:S.filtre,fmode:S.fmode,compact:S.compact,view:S.view,sideMini:S.sideMini,demoHidden:S.demoHidden,nvSeen:S.nvSeen,nfSeen:S.nfSeen}));}catch(e){}}

const byId=(arr,id)=>arr.find(x=>x.id===id);
const cfg=()=>Object.assign({nom:'',annee:'',debut:'',fin:'',conges:[],etapes:[],competences:[]},S.data.config||{});
const comps=()=>(cfg().competences||[]).slice().sort((a,b)=>(+a.code)-(+b.code));
const staff=()=>sortByName(S.data.enseignants);
const isTeacher=p=>!p.fonction||p.fonction==='Enseignant'||p.fonction==='Instructeur';
const teachers=()=>staff().filter(p=>isTeacher(p)&&p.statut!=='Inactif');
const groups=()=>sortByName(S.data.groupes);
const studentsOf=gid=>sortEls(S.data.eleves.filter(e=>e.groupe===gid));
const sortElsByClass=a=>[...a].sort((x,y)=>collator.compare(gName(x.groupe),gName(y.groupe))||numOfEl(x)-numOfEl(y)||collator.compare(x.nom||'',y.nom||''));
/* Enseignant principal : assigné à une classe ; les autres profs donnent seulement des cours */
const principalOf=gid=>{const g=byId(S.data.groupes,gid);return g&&g.principal&&byId(S.data.enseignants,g.principal)?g.principal:'';};
const principalClasses=tid=>groups().filter(g=>g.principal===tid);
const tName=id=>(byId(S.data.enseignants,id)||{}).nom||'Enseignant à assigner';
const gName=id=>(byId(S.data.groupes,id)||{}).nom||'Sans classe';
const shortName=n=>{const p=String(n||'').trim().split(/\s+/);return p.length>1?`${p[0][0]}. ${p.slice(1).join(' ')}`:(n||'');};
const todayISO=()=>iso(new Date());
/* La semaine « courante » : samedi et dimanche, c’est celle qui commence lundi */
const baseMonday=()=>{const d=new Date(),j=d.getDay();return monday(j===6?addDays(d,2):j===0?addDays(d,1):d);};
const nowMin=()=>{const d=new Date();return d.getHours()*60+d.getMinutes();};
const isCurWeek=()=>iso(S.week)===iso(baseMonday());
const defaultDay=()=>{if(!isCurWeek())return 0;const j=(new Date().getDay()+6)%7;return j>4?0:j;};
const allLoaded=()=>['config','cours','enseignants','groupes','eleves','examens'].every(k=>S.loaded[k]);
const tone=c=>`k${(+((c&&c.couleur)||0))%8}`;
const isAdmin=()=>S.role==='admin'&&S.canAdmin!==false;
function yearStart(){const c=cfg();if(c.debut)return c.debut;const d=new Date();return `${d.getMonth()>=7?d.getFullYear():d.getFullYear()-1}-08-01`;}
function lastSchoolDay(){const t=new Date();const j=t.getDay();return iso(j===0?addDays(t,-2):j===6?addDays(t,-1):t);}

function visibleRoles(){
  if(locked()) return [myAcct().role];
  const r=[];
  if(S.canAdmin!==false) r.push('admin');
  if(S.canAdmin===true||S.canWrite!==false) r.push('teacher');
  r.push('student');
  return r;
}

