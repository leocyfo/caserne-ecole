/* ---------- Outils ---------- */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* Sigles du métier : <abbr title> donne leur sens (lecteur d’écran, bulle au survol). Pour du texte déjà sûr (libellés du site), jamais dans un attribut. */
const ABBR={ENPQ:'École nationale des pompiers du Québec',EPI:'Équipement de protection individuelle',ARI:'Appareil respiratoire isolant',DEP:'Diplôme d’études professionnelles'};
const abbrs=s=>String(s??'').replace(/(^|[^\wÀ-ÿ])(ENPQ|EPI|ARI|DEP)(?![\wÀ-ÿ])/g,(m,p,k)=>p+'<abbr title="'+ABBR[k]+'">'+k+'</abbr>');
/* Un numéro de téléphone (450 555-1234) ne se coupe pas en fin de ligne : espace et trait d’union insécables */
const telNb=s=>String(s??'').replace(/(\d{3})[ .](\d{3})-(\d{4})/g,'$1 $2‑$3');
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d);};
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;};
const monday=d=>addDays(d,-((d.getDay()+6)%7));
const toMin=t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t||'');return m?(+m[1])*60+(+m[2]):NaN;};
const fmtT=v=>{if(typeof v!=='number')v=toMin(v);if(isNaN(v))return '';const h=Math.floor(v/60),m=v%60;return m?`${h} h ${pad(m)}`:`${h} h`;};
const DAYS=['Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
const WD=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const fMonth=new Intl.DateTimeFormat('fr-CA',{month:'long'});
const fMonthS=new Intl.DateTimeFormat('fr-CA',{month:'short'});
const dn=d=>d.getDate()===1?'1er':String(d.getDate());
const dayLabel=d=>`${WD[d.getDay()]} ${dn(d)} ${fMonth.format(d)}`;
const shortDate=d=>`${dn(d)} ${fMonthS.format(d)}`;
const longDate=d=>`${dn(d)} ${fMonth.format(d)} ${d.getFullYear()}`;
const pl=(n,s,p)=>`${n} ${n>1?p:s}`;
const pct=(a,b)=>b?Math.round(a/b*100):null;
const collator=new Intl.Collator('fr-CA',{sensitivity:'base',numeric:true});
const sortByName=a=>[...a].sort((x,y)=>collator.compare(x.nom||'',y.nom||''));
/* Les élèves se rangent par numéro dans leur classe (puis par nom) */
const numOfEl=e=>e&&e.numero!=null&&e.numero!==''&&!isNaN(+e.numero)?+e.numero:1e9;
const sortEls=a=>[...a].sort((x,y)=>numOfEl(x)-numOfEl(y)||collator.compare(x.nom||'',y.nom||''));
const genId=p=>`${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
const slotId=()=>'s'+Math.random().toString(36).slice(2,7);
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
const LBL={P:'Présent',A:'Absent',R:'Retard',M:'Motivé'};
const LBLS={P:['présent','présents'],A:['absent','absents'],R:['retard','retards'],M:['motivé','motivés']};
const CHIP={P:'ok',A:'bad',R:'warn',M:'info'};
const SLBL={P:'Présent',A:'Absent',C:'Congé',F:'Formation'};
const SCHIP={P:'ok',A:'bad',C:'warn',F:'info'};
const FONCTIONS=['Enseignant','Instructeur','Direction','Secrétariat','Professionnel','Soutien'];
const STATUTS={Actif:'ok','En congé':'warn','Suppléant':'info',Inactif:'off'};
/* « Remplacement » était l’ancien nom du statut « Suppléant » */
const statOf=p=>p&&p.statut==='Remplacement'?'Suppléant':(p&&p.statut)||'Actif';
const onLeave=p=>statOf(p)==='En congé';
const ROLE_LBL={admin:'Administrateur',teacher:'Enseignant',student:'Élève',service:'Service incendie'};
const IC={
  cam:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  home:'<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M10 21v-6h4v6"/>',
  pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  year:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  teach:'<path d="M2 3h20M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3M7 21l5-5 5 5"/>',
  card:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M14 10h4M14 14h4M5 16.5c.6-1.3 1.7-2 3-2s2.4.7 3 2"/>',
  clip:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  exam:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 14h6M9 18h4"/>',
  gear:'<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  spark:'<path d="M11 3l2 5.5L18.5 10.5 13 12.5 11 18l-2-5.5L3.5 10.5 9 8.5z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
  layers:'<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  calok:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  broom:'<path d="m16 22-1-4"/><path d="M19 14a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2h-3a1 1 0 0 1-1-1V4a2 2 0 0 0-4 0v5a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1"/><path d="M5 14h14l1.97 6.77A1 1 0 0 1 20 22H4a1 1 0 0 1-.97-1.23z"/><path d="m8 22 1-4"/>',
  key:'<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  move:'<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  left:'<path d="m15 18-6-6 6-6"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  down:'<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  up:'<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  vlist:'<path d="M9 6h12M9 12h12M9 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01" stroke-width="3"/>',
  vgrid:'<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  vdense:'<path d="M3 5h18M3 9.67h18M3 14.33h18M3 19h18"/>',
  mega:'<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  pin:'<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/>',
  ext:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  helmet:'<path d="M3 17h18M5 17a7 7 0 0 1 14 0M12 6V3M9 17V9.5M15 17V9.5"/>',
  tank:'<rect x="7" y="6" width="10" height="16" rx="5"/><path d="M10 6V3h4v3M12 3h3"/>',
  tool:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  receipt:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
  wallet:'<path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M17 14h.01"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-1-1.5-1.6-2.8-1.6-1.6 0-2.8.9-2.8 2.1 0 1.3 1.1 1.8 2.8 2.2 1.7.4 2.8 1 2.8 2.3 0 1.2-1.2 2.2-2.8 2.2-1.4 0-2.5-.7-2.9-1.7M12 6v1.6M12 16.4V18"/>'
};
const icon=k=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;

/* Montants en cents (stock, compta, formation, services) */
const _fmtM=new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD'});
const fmtM=c=>_fmtM.format((+c||0)/100);
const money=v=>{const s=String(v==null?'':v).replace(/[\s  $]/g,'').replace(',','.');if(!/^\d+(\.\d{0,2})?$/.test(s))return null;return Math.round(parseFloat(s)*100);};
const moneyIn=c=>c==null||c===''?'':((+c)/100).toFixed(2).replace('.',',');
const sumC=a=>a.reduce((n,x)=>n+(+x||0),0);
/* Le total d’une facture : la clôture de l’année s’en sert aussi quand la Compta n’est pas ajoutée */
function cpFTot(f){const ht=sumC((f.lignes||[]).map(l=>Math.round((+l.q||0)*(+l.p||0)))), tps=f.tx?Math.round(ht*f.tx.tps/100):0, tvq=f.tx?Math.round(ht*f.tx.tvq/100):0;return {ht,tps,tvq,ttc:ht+tps+tvq};}
const kpiBox=(id,l,v,cls,sub)=>`<div class="kpi" id="${id}"><span>${l}</span><b class="${cls||''}">${v}</b>${sub?`<small>${sub}</small>`:''}</div>`;
const addMonths=(d,m)=>{if(!d||!m)return '';const x=parse(d);x.setMonth(x.getMonth()+(+m));return iso(x);};
/* Bibliothèques et fichiers chargés à la demande */
const QR_GEN='https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js', QR_READ='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
const _scripts={};
function loadScript(url){return _scripts[url]||(_scripts[url]=new Promise((res,rej)=>{const x=document.createElement('script');x.src=url;x.onload=res;x.onerror=()=>{delete _scripts[url];rej(new Error('script'));};document.head.appendChild(x);}));}
