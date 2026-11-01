(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const S_page=()=>($('#nav [aria-current=page]')||{}).dataset?$('#nav [aria-current=page]').dataset.page:'';
const click=el=>{if(!el)throw new Error('missing element');el.click();};
const navBtn=p=>{if(p!=='params'&&!$('#nav-'+p)&&$('#nav .nav-back'))click($('#nav .nav-back'));const b=$('#nav-'+p);if(b)return b;const g={annee:'calendar',personnel:'eleves',examens:'modules'}[p];if(g&&$('#nav-'+g))click($('#nav-'+g));return $('#tab-'+p);};
const ptr=(type,x,y,target)=>(target||window).dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:type==='pointerup'?0:1,pointerType:'mouse',isPrimary:true}));
const center=el=>{const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+Math.min(r.height/2,30)];};
const freePoint=cell=>{const r=cell.getBoundingClientRect(),x=r.left+r.width/2;for(let y=Math.min(r.bottom-4,innerHeight-70);y>r.top;y-=8){const el=document.elementFromPoint(x,y);if(el&&el.closest('.wk-cell')===cell&&!el.closest('.cc'))return [x,y];}return [x,r.top+4];};
const dragTo=async(src,target,isCell)=>{src.scrollIntoView({block:'center'});await wait(30);const [x0,y0]=center(src);ptr('pointerdown',x0,y0,src);ptr('pointermove',x0+12,y0+8);const p=isCell?freePoint(target):center(target);ptr('pointermove',p[0],p[1]);return p;};
const pick0=(sel,v)=>{const x=$(sel);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));};
const typeIn=(id,v)=>{const i=$(id);i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};
/* Séances d’un cours telles que la page les voit : tableau extras d’origine + carte seances */
const XS=id=>{const d=window.__store.get('cours/'+id)||{},m=new Map((d.extras||[]).map(x=>[x.id,x]));for(const [k,v] of Object.entries(d.seances||{})){if(!v)m.delete(k);else{const o=Object.assign({},m.get(k),v,{id:k});for(const f of Object.keys(o))if(o[f]===null)delete o[f];m.set(k,o);}}return [...m.values()];};
try{
await wait(600);
ok('brand',/ACADÉMIE|Académie/.test($('#brand-text').textContent)&&/pompiers/i.test($('#brand-text').textContent),$('#brand-text').textContent);
/* la bulle rouge du menu : sur la page ouverte, puis elle glisse jusqu’à la page choisie (menu ouvert et menu réduit) */
{const at=()=>{const sb=$('.sidebar'),b=$('#nav [aria-current=page]').getBoundingClientRect();return b.top-sb.getBoundingClientRect().top+sb.scrollTop+b.height/2;}, y=()=>{const m=/translate\((-?[\d.]+)px, *(-?[\d.]+)px\)/.exec($('#nav-bulle').style.transform);return m?+m[2]+parseFloat($('#nav-bulle').style.height)/2:NaN;};
 ok('red bubble on the open page',$('#nav-bulle').classList.contains('on')&&Math.abs(y()-at())<1.5&&getComputedStyle($('#nav-bulle')).backgroundColor===getComputedStyle($('.brand-icon')).backgroundColor,Math.round(y())+' / '+Math.round(at()));
 const y0=y();click(navBtn('historique'));await wait(120);
 ok('red bubble slides to the new page',Math.abs(y()-at())<1.5&&y()>y0+100&&!$('#nav-bulle').classList.contains('still')&&/transform/.test(getComputedStyle($('#nav-bulle')).transitionProperty),Math.round(y0)+' -> '+Math.round(y())+' / '+Math.round(at()));
 click($('#side-toggle'));await wait(150);$('.app').dispatchEvent(new Event('transitionend'));await wait(30);
 ok('collapsed menu: bubble the size of the logo',$('#nav-bulle').style.width==='36px'&&$('#nav-bulle').style.height==='36px'&&Math.abs(y()-at())<1.5,$('#nav-bulle').style.cssText);
 click($('#side-toggle'));await wait(150);click(navBtn('calendar'));await wait(120);}
ok('5 class rows',$$('#main .wk-class').length===5,$$('#main .wk-class').map(x=>x.textContent).join('|'));
click($('#pick-c120'));await wait(80);
ok('row pick',$$('#main .wk-class').length===1&&/120/.test($('#main .wk-class').textContent)&&!!$('#class-token')&&/Classe 120/.test($('#class-token').textContent)&&/← Toutes/.test($('#main .wk-class').textContent),$$('#main .wk-class').map(x=>x.textContent).join('|'));
click($('#pick-c120'));await wait(80);
ok('row unpick',$$('#main .wk-class').length===5&&!$('.fchip')&&!$('#class-token'));
click($('#fm-e'));await wait(40);click($('#pick-c121'));await wait(80);
ok('row pick from teacher mode',$$('#main .wk-class').length===1&&$('#fm-g').getAttribute('aria-pressed')==='true');
click($('#pick-c121'));await wait(80);
ok('cards this week',$$('#main .week button.cc').length>=25,$$('#main .week button.cc').length);
ok('type tags',$$('#main .week .cc-kind').some(x=>x.textContent==='Théorie')&&$$('#main .week .cc-kind').some(x=>x.textContent==='Pratique'));
ok('one line per card top',$$('#main .week button.cc').every(x=>x.querySelectorAll('.cc-top').length===1&&!x.querySelector('.chip')));
ok('status in foot',!!$('#main .week .cc-foot .cc-st.warn')&&$$('#main .week .cell-chore').some(x=>/Corvée de ménage/.test(x.textContent)));
ok('menage tag',/Corvée de ménage/.test($('#main .week').textContent));
const am=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');
{const c=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');ok('card moment + code',!!c&&c.querySelector('.cc-time').textContent==='Toute la journée'&&/^M8 /.test(c.querySelector('strong').textContent)&&!/\d h/.test(c.querySelector('.cc-top').textContent),c&&c.querySelector('strong').textContent);}
ok('card session label',/Cours 8\.1 et 8\.2/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"] .cc-meta')||{}).textContent||''));
ok('119 AM today',!!am&&/9\/12 marqués/.test(am.textContent),am&&am.textContent.replace(/\s+/g,' ').slice(0,120));
{const ex=$$('#main .week .cc.kx:not(.has-badge)'),th=$('#main .week .cc.k0');ok('exams dark',ex.length>2&&ex.every(x=>getComputedStyle(x).backgroundColor==='rgb(159, 45, 53)')&&!!th&&getComputedStyle(th).backgroundColor!=='rgb(159, 45, 53)',ex.length);}
// course drawer of a dated course
click(am);await wait(50);
ok('day window',!$('#c-form')&&!!$('#af-box')&&!!$('#c-open-mod')&&/Modifier cette séance/.test($('#drawer').textContent)&&!/Supprimer le cours/.test($('#drawer').textContent)&&/Supprimer cette séance/.test($('#drawer').textContent)&&/Séance/.test($('#drawer .eyebrow').textContent));
ok('linked session: type and requis come from the module',!$('#sb-act')&&!!$('#af-req-ro')&&!$('#af-req-p')&&$('#af-req-n').textContent==='1'&&/Chargé de cours/.test($('#af-box').textContent)&&/Olivier Bouchard/.test($('#af-box').textContent),$('#af-box').textContent.slice(0,120));
if(!$('#drawer').hidden){click($('#dr-close'));await wait(30);}
// drag a dated session to Thursday (once)
const src=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');const cell=$('.wk-cell[data-date="2026-10-08"][data-grp="c119"]');
const pt=await dragTo(src,cell,true);ptr('pointerup',pt[0],pt[1]);await wait(40);
ok('move dialog no weekly',!!$('#drawer.sh-bottom')&&!$('input[name=mv-scope][value=weekly]'));
click($('[data-act=mv-apply]'));await wait(150);
ok('dated moved',XS('k119-m08').some(x=>x.id==='a20261006am'&&x.date==='2026-10-08'));
click($$('.toast button').pop());await wait(150);
ok('undo dated move',XS('k119-m08').some(x=>x.id==='a20261006am'&&x.date==='2026-10-06'));
// next week: Action de grâce
click($('#w-next'));await wait(60);
ok('thanksgiving off',$$('#main .cc.offday strong').some(x=>x.textContent==='Action de grâce'));
click($('#w-today'));await wait(60);
// compact
click($('#exp-btn'));await wait(400);
ok('compact',!!$('#main .week.compact'));
click($('#exp-btn'));await wait(400);
/* BADGE */
click($('.cc[data-key="k120-m04_a20261005am_2026-10-05"]')||$('#main .week .cc[data-act=sess]'));await wait(60);
click($('[data-act=s-cancel]'));await wait(150);click($('#dr-close'));await wait(40);
ok('cancel badge',$$('#main .week .cc-badge.bad').some(x=>x.textContent==='Séance annulée'));
click($('#main .week .cc.cancelled'));await wait(60);click($('[data-act=s-cancel]'));await wait(150);click($('#dr-close'));await wait(40);
ok('cancel badge removed',!$$('#main .week .cc-badge').some(x=>x.textContent==='Séance annulée'));
/* PRÉSENCES : seulement la période affichée, et à la demande pour une séance ancienne */
{const term=()=>(window.__subs||[]).filter(x=>/^presences\?date>=.*&date<=2026-10-09$/.test(x));
 ok('year attendance not loaded at start',term().length===0,(window.__subs||[]).filter(x=>x.startsWith('presences')).join(' | '));
 click(navBtn('examens'));await wait(100);click($('#xt-done'));await wait(100);
 click($('#main [data-act=x-open][data-key="k119-m03_a20260928am_2026-09-28"]'));await wait(100);
 click($('#drawer [data-act=sess-at]'));await wait(250);
 ok('old session loads its attendance on demand',/[1-9]\d? \/ 12/.test($('.sb-facts').textContent)&&!/à prendre/.test($('.sb-facts').textContent)&&term().length===0,$('.sb-facts').textContent.replace(/\s+/g,' ').slice(0,120));
 click($('#dr-close'));await wait(40);
 click(navBtn('classes'));await wait(150);
 ok('classes page loads the month only',term().length===1&&/date>=2026-10-01&/.test(term()[0])&&/%/.test($('#cl-c119 .cl-rate').textContent),term().join(' | '));
 click(navBtn('eleves'));await wait(150);
 ok('students page has the same periods',!!$('#pp-mois')&&$('#pp-mois').getAttribute('aria-pressed')==='true'&&/depuis le 1er octobre 2026/.test($('.summary').textContent)&&term().length===1,$('.summary').textContent);
 click($('#pp-annee'));await wait(150);
 ok('since the start of the year loads the year',term().length===2&&/date>=2026-08-/.test(term()[1])&&/août 2026/.test($('.summary').textContent),term().join(' | '));
 click(navBtn('calendar'));await wait(100);}
/* SIDE */
document.head.insertAdjacentHTML('beforeend','<style id="no-tr">.app{transition:none!important}</style>');
click($('#side-toggle'));await wait(400);
ok('side collapsed',$('.app').classList.contains('side-mini')&&$('.sidebar').getBoundingClientRect().width<=80&&$('#side-toggle').getAttribute('aria-expanded')==='false',Math.round($('.sidebar').getBoundingClientRect().width));
ok('nav labels hidden but named',getComputedStyle($('#nav-classes span')).position==='absolute'&&$('#nav-classes').title==='Classes'&&$('#nav-classes').textContent.includes('Classes'));
click(navBtn('classes'));await wait(60);
ok('nav works collapsed',/Classes/.test($('#heading').textContent)&&$('.app').classList.contains('side-mini'));
click(navBtn('calendar'));await wait(60);
click($('#side-toggle'));await wait(400);
ok('side expanded',!$('.app').classList.contains('side-mini')&&$('.sidebar').getBoundingClientRect().width>200,Math.round($('.sidebar').getBoundingClientRect().width));
$('#no-tr').remove();
/* COMPS */
click($('[data-act=new-course]'));await wait(60);
ok('add course drawer',!!$('#ac-form')&&$$('#ac-m option').length===27&&!$('#c-form')&&/Ajouter une séance/.test($('#drawer').textContent)&&$('#ac-g').value==='c119');
{const m=$('#ac-m');m.value='__act';m.dispatchEvent(new Event('input',{bubbles:true}));}await wait(40);
ok('activity name field',!!$('#ac-titre')&&$('#ac-m').value==='__act');
ok('type list',$$('#ac-type option').length===11&&$$('#ac-type option').some(o=>o.textContent==='Reprise')&&$$('#ac-type option').some(o=>o.textContent==='Visite')&&$('#ac-type').value==='activite'&&$('#ac-per').value==='jour'&&!$('#ac-picks'));
$('#ac-form').requestSubmit();await wait(80);
ok('add course needs a name',/nom de l’activité/.test($('#drawer').textContent)&&!$('#drawer').hidden);
{const m=$('#ac-m');m.value='7';m.dispatchEvent(new Event('input',{bubbles:true}));}await wait(40);
ok('module chosen',/Autopompe/.test($('#dr-title').textContent)&&$('#ac-m').value==='7'&&!$('#ac-titre')&&!$('#ac-type'));
ok('module courses to tick',$$('#ac-picks input').length===8&&$$('#ac-picks .pk.done').length===7&&/7\.1/.test($('#ac-picks').textContent)&&/Examen 7\.6/.test($('#ac-picks').textContent)&&/Reprise/.test($('#ac-picks').textContent),$$('#ac-picks input').length+' '+$$('#ac-picks .pk.done').length);
typeIn('#ac-date','2026-10-10');await wait(40);$('#ac-form').requestSubmit();await wait(80);
ok('add session needs a course',/Cochez le cours/.test($('#drawer').textContent)&&!$('#drawer').hidden);
click($('#ac-picks input'));await wait(40);
$('#ac-form').requestSubmit();await wait(80);
ok('add course weekend refused',/fin de semaine/.test($('#drawer').textContent));
typeIn('#ac-date','2026-10-13');await wait(40);$('#ac-form').requestSubmit();await wait(80);
ok('add course clash refused',/a déjà/.test($('#drawer').textContent)&&!$('#drawer').hidden);
click($('#dr-close'));await wait(40);
click($('#nav-params'));await wait(60);
ok('params modules link',!!$('#p-modules')&&!$('#p-kcode')&&/25 modules/.test($('#main').textContent));
click(navBtn('calendar'));await wait(60);
/* PERIODE */
click($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]'));await wait(60);
ok('session period',!!$('#sb-per')&&$('#sb-per').value==='jour'&&!$('#sb-act')&&/Toute la journée/.test($('#sb-per').selectedOptions[0].textContent),($('#sb-per')||{}).value);
const xpm=()=>XS('k119-m08').find(x=>x.id==='a20261006am');
const nM8=XS('k119-m08').length;
{const sp=$('#sb-per');sp.value='pm';sp.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
// la séance s’enregistre seule : les autres séances du module ne sont pas réécrites
ok('period saved',xpm().debut==='12:00'&&xpm().fin==='15:00'&&xpm().tags[0]==='Théorie'&&xpm().cours.length===2&&XS('k119-m08').length===nM8&&!window.__store.get('cours/k119-m08').extras,JSON.stringify(xpm()));
click($('#dr-close'));await wait(40);
ok('card shows afternoon',/Théorie/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]')||{}).textContent||'')&&/Après-midi/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"] .cc-time')||{}).textContent||''));
// remettre la séance comme avant : toute la journée
click($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]'));await wait(60);
{const sp=$('#sb-per');sp.value='jour';sp.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('session restored',xpm().tags[0]==='Théorie'&&xpm().debut==='08:00'&&xpm().fin==='15:00');
click($('#dr-close'));await wait(40);
// une journée sans cours du module (la reprise de la classe) garde son type modifiable
click($('#w-next'));await wait(80);
click($('.cc[data-key="k119-reprise_a20261016am_2026-10-16"]'));await wait(60);
ok('free day keeps its type select',!!$('#sb-act')&&$('#sb-act').value==='reprise'&&/Activité/.test($('#drawer .eyebrow').textContent),($('#sb-act')||{}).value);
{const sa=$('#sb-act');sa.value='activite';sa.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
const xrp=()=>XS('k119-reprise').find(x=>x.id==='a20261016am');
ok('activity saved',!xrp().tags.includes('Reprise'),JSON.stringify(xrp().tags));
{const sa=$('#sb-act');sa.value='reprise';sa.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('activity restored',xrp().tags[0]==='Reprise',JSON.stringify(xrp().tags));
click($('#dr-close'));await wait(40);click($('#w-today'));await wait(80);
// classes
click(navBtn('classes'));await wait(50);
ok('5 classes',$$('.cl-row').length===5);
ok('class rows',$$('.cl-row').length===5&&$('#cl-c119 .cl-n').textContent.trim()==='12'&&!!$('#cl-c119 .cl-adv .meter')&&!!$('#m-pr-c119')&&$('#cl-c120 .cl-n').textContent.trim()==='10'&&/séances prises sur/.test($('#cl-c119 .cl-rate').textContent));
click($('#cl-c119'));await wait(80);
ok('class fiche',/Classe 119/.test($('#fi-name').textContent)&&$$('.fiche-tabs button').length===5&&$$('.fh-stats>div').length===5&&$$('.fiche-list .fl-item').length===5);
ok('roles in class list',/Capitaine/.test($('#main').textContent)&&$$('.st-row').length===12);
ok('students by number',$$('.st-row .st-num').slice(0,3).map(x=>x.textContent).join(',')==='1,2,3',$$('.st-row .st-num').slice(0,3).map(x=>x.textContent).join(','));
ok('enrol form hidden',!$('[data-form=m-add-els]')&&!!$('#m-enrol-open'));
click($('#m-enrol-open'));await wait(60);
ok('enrol form opens',!!$('[data-form=m-add-els]')&&!$('#m-enrol-open'));
click($('[data-form=m-add-els] [data-act=pg-set]'));await wait(60);
ok('enrol form closes',!$('[data-form=m-add-els]'));
click($('#fi-tab-examens'));await wait(80);
ok('class exam grid',$$('.xg tbody tr').length===12&&$$('.xg thead .xg-h').length>=9&&$$('.xg .xg-c.bad').length>=1&&/réussite/.test($('.fiche-body .summary').textContent),$$('.xg thead .xg-h').length);
click($('.xg tbody .xg-c'));await wait(80);
ok('grid cell opens results',/Résultats/.test($('#drawer').textContent)&&$$('#drawer [data-act=x-res]').length===36);
click($('#dr-close'));await wait(40);
click($('#fi-tab-cours'));await wait(60);
ok('hours column',$$('.tbl td .chip').some(x=>/\/ 75 h/.test(x.textContent)),$$('.tbl td .chip').slice(0,3).map(x=>x.textContent).join('|'));
click($('#fi-tab-reglages'));await wait(60);
$('#m-gdesc').value='Intervention en sécurité incendie (groupe A)';
$('[data-form=m-save-group]').requestSubmit();await wait(250);
ok('class saved',window.__store.get('groupes/c119').description==='Intervention en sécurité incendie (groupe A)');
click($('#fi-back'));await wait(80);
click($('#m-add-open'));await wait(60);
$('#m-gname').value='Classe 124';$('[data-form=m-add-group]').requestSubmit();await wait(300);
ok('class added opens fiche',/Classe 124/.test(($('#fi-name')||{}).textContent||''));
ok('empty class shows enrol form',!!$('[data-form=m-add-els]'));
click($('#fi-tab-reglages'));await wait(60);click($('[data-act=m-ask]'));await wait(60);click($('[data-act=m-del-g]'));await wait(350);
ok('class deleted',!$$('.cl-row').some(x=>/Classe 124/.test(x.textContent))&&![...window.__store.keys()].some(k=>k.startsWith('groupes/')&&window.__store.get(k).nom==='Classe 124')&&$$('.cl-row').length===5);
// élèves
click(navBtn('eleves'));await wait(80);
ok('52 students',$$('#main tbody tr').length===52&&/Téléphone/.test($('#main thead').textContent)&&!/Parent/.test($('#main thead').textContent)&&$$('#main tbody tr').slice(0,3).map(r=>r.querySelector('.st-num').textContent).join(',')==='1,2,3');
ok('captain chip',$$('#main .role-chip').some(x=>x.textContent==='Capitaine'));
{const tr=$('#main tr.row-link[data-id="el-119-08"]');click(tr&&tr.children[4]);}await wait(80);
ok('row click opens fiche',/Juliette Lavoie/.test(($('#fi-name')||{}).textContent||''));
click($('#fi-back'));await wait(80);
window.scrollTo(0,300);await wait(30);const listY=window.scrollY;
click($$('#main tbody .link').find(x=>/Camille/.test(x.textContent)));await wait(80);
ok('student fiche',/Camille Bergeron/.test($('#fi-name').textContent)&&/Lieutenant 1/.test($('.fiche-head').textContent)&&/Cravate oubliée/.test($('#main').textContent)&&$$('.fiche-list .fl-item').length===52);
ok('fiche simple',$$('.fiche-tabs button').length===4&&!!$('#fi-tab-equipement')&&$('#fi-tab-dossier').getAttribute('aria-pressed')==='true'&&$$('.fh-stats>div').length===4&&$$('.fiche-body .panel').length===1&&!/Semaine de la classe/.test($('#main').textContent));
click($('#fi-tab-presences'));await wait(80);
ok('tab presences',/Absences et retards/.test($('.fiche-body').textContent)&&/Par module/.test($('.fiche-body').textContent)&&!/Parent ou tuteur/.test($('.fiche-body').textContent));
click($('#fi-tab-examens'));await wait(80);
ok('tab examens',/Résultats/.test($('.fiche-body').textContent)&&/À venir/.test($('.fiche-body').textContent)&&/de réussite/.test($('.fiche-body .summary').textContent));
// impression du relevé de résultats (la fenêtre d’impression du navigateur est simulée)
{const p0=window.print;let got='';window.print=()=>{got=$('#print-root').innerHTML;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};
 const b=$('#pr-releve');if(b){click(b);await wait(500);}
 ok('print transcript',!!b&&/Relevé de résultats/.test(got)&&/Camille Bergeron/.test(got)&&/pr-res/.test(got)&&/Réussi|Échec|Absent/.test(got)&&/Signature/.test(got)&&/@page\{size:letter portrait/.test(got)&&$('#print-root').innerHTML===''&&!document.body.classList.contains('printing'),got.length);
 window.print=p0;}
click($('#fi-tab-dossier'));await wait(80);
ok('account in header',/Compte élève · compte d’exemple/.test($('#fi-acct-chip').textContent)&&/Modifier le compte/.test($('#fi-acct-btn').textContent));
click($('#fi-next'));await wait(80);
ok('fiche next',/Thomas Bouchard/.test($('#fi-name').textContent)&&$('#fl-el-119-03').getAttribute('aria-current')==='true');
click($('#fi-tab-presences'));await wait(60);click($('#fi-next'));await wait(80);
ok('tab kept when switching',$('#fi-tab-presences').getAttribute('aria-pressed')==='true'&&/Absences et retards/.test($('.fiche-body').textContent));
click($('#fi-prev'));await wait(60);click($('#fi-tab-dossier'));await wait(60);
document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));await wait(80);
ok('fiche arrow key',/Camille Bergeron/.test($('#fi-name').textContent));
click($('#fl-el-119-12'));await wait(80);
ok('fiche list switch',/Léa Tremblay/.test($('#fi-name').textContent)&&!$('#fi-next').disabled);
click($('#fl-el-123-10'));await wait(80);
ok('fiche last',/Wendy Jacques/.test($('#fi-name').textContent)&&$('#fi-next').disabled&&/52 sur 52/.test($('.fiche-nav').textContent));
click($('#fi-edit'));await wait(60);
ok('edit from fiche',!$('#drawer').hidden&&$('#st-nom').value==='Wendy Jacques'&&/urgence/.test($('#drawer').textContent)&&!/parent/i.test($('#drawer').textContent));
click($('#dr-close'));await wait(40);
document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(80);
ok('fiche escape back',!$('.fiche')&&$$('#main tbody tr').length===52&&Math.abs(window.scrollY-listY)<5&&listY>0,Math.round(listY)+' -> '+Math.round(window.scrollY));
// personnel
click(navBtn('personnel'));await wait(80);
click($$('#main tbody .link').find(x=>/Marie Leduc/.test(x.textContent)));await wait(80);
ok('staff fiche',/Marie Leduc/.test($('#fi-name').textContent)&&/responsable de la classe 119/.test($('.fiche-body').textContent)&&+(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Modules')===3&&(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Classes')==='5');
click($('#fi-tab-cours'));await wait(80);
ok('staff modules tab',$$('#sf-mods li').length===3&&/M9/.test($('#sf-mods').textContent)&&/Chargé de cours/.test($('.fiche-body').textContent)&&/Activités par classe/.test($('.fiche-body').textContent)&&$$('.cg-head').length===1&&/Modules/.test($('#fi-tab-cours').textContent),$$('#sf-mods li').length+' '+$$('.cg-head').length);
click($('#cg-c119'));await wait(80);
ok('staff courses by class',$('#cg-c119').getAttribute('aria-expanded')==='true'&&$$('.cg-body li').length>5);
click($('#fi-next'));await wait(80);
ok('staff fiche next',/Nadia Pelletier/.test($('#fi-name').textContent));
click($$('.fiche-act button').find(x=>/Son horaire/.test(x.textContent)));await wait(150);
ok('staff to schedule',S_page()==='calendar'&&$('#fm-e').getAttribute('aria-pressed')==='true'&&$('#fc-e-npelletier').getAttribute('aria-pressed')==='true'&&/^\d+$/.test($('#fc-e-npelletier small').textContent)&&+$('#fc-e-npelletier small').textContent<12);
{const mid=e=>{const r=e.getBoundingClientRect();return r.top+r.height/2;}, h=$('#heading .pg-tabs'), parts=[$('#heading #w-prev'),$('#heading #vw-jour'),$('#heading #fm-e'),$('#heading #new-course'),$('#heading #nf-bell')];
 ok('teacher mode keeps one line',parts.every(Boolean)&&parts.every(p=>Math.abs(mid(p)-mid(h))<8)&&!$('#heading .fchip')&&!!$('#main .tch-row #fc-e-npelletier'),parts.map(p=>p?Math.round(mid(p)):'-').join(',')+' / '+Math.round(mid(h)));}
click($('#fc-all'));await wait(60);click($('#fm-g'));await wait(60);
click(navBtn('eleves'));await wait(80);
// examens
click(navBtn('examens'));await wait(60);
ok('exams list',$$('#main [data-act=sess-at]').length>0,($('.summary')||{}).textContent);
click($('#main [data-act=sess-at]'));await wait(50);
ok('session exam opens day window',!!$('#af-box')&&!$('#c-form'));
click($('#dr-close'));await wait(30);
ok('exam tiles',$$('.xm-tile').length===4&&$('#xt-up').getAttribute('aria-pressed')==='true'&&!!$('.xm-hd'));
pick0('#x-g','c119');await wait(100);
click($('#xt-todo'));await wait(60);
{const n=$$('#main [data-act=x-open]').length;ok('results to enter',n>=1&&/[1-9]/.test($('#xt-todo b').textContent),n);}
click($('#main [data-act=x-open]'));await wait(80);
ok('results drawer',/Résultats de l’examen/.test($('#drawer').textContent)&&$$('#drawer [data-act=x-res]').length===36,$$('#drawer [data-act=x-res]').length);
// notes en % : la note inscrit le résultat selon le seuil (60 %)
{const ins=$$('#drawer .xr-n'), id0=ins[0].dataset.xn, id1=ins[1].dataset.xn;window.__g=[id0,id1];
 typeIn('#xn-'+id0,'85');await wait(60);typeIn('#xn-'+id1,'42');await wait(60);
 ok('grade sets the result',$$('#drawer .xr-n').length===12&&$('#xr-'+id0+'-r').getAttribute('aria-pressed')==='true'&&$('#xr-'+id1+'-e').getAttribute('aria-pressed')==='true'&&/Moyenne 64 %/.test(($('#xr-avg')||{}).textContent||'')&&$('#xn-'+id0).value==='85'&&/à partir de 60 %/.test($('#drawer').textContent),($('#xr-avg')||{}).textContent);
 // un résultat choisi à la main retire la note
 click($('#xr-'+id1+'-a'));await wait(60);
 ok('manual result clears the grade',$('#xn-'+id1).value===''&&$('#xr-'+id1+'-a').getAttribute('aria-pressed')==='true'&&/Moyenne 85 %/.test($('#xr-avg').textContent));
 typeIn('#xn-'+id1,'42');await wait(60);}
click($('[data-act=x-res-all]'));await wait(30);
$('#x-form').requestSubmit();await wait(250);
{const [g0,g1]=window.__g, k=[...window.__store.keys()].find(k=>k.startsWith('resultats/')&&(window.__store.get(k).pct||{})[g0]===85), d=k?window.__store.get(k):null, own=k?window.__store.get('resultats-eleves/'+(g0+'__'+k.split('/')[1]).replace(/[^A-Za-z0-9_-]/g,'-')):null;
 ok('grades saved',!!d&&d.pct[g1]===42&&d.resultats[g0]==='reussi'&&d.resultats[g1]==='echec'&&Object.keys(d.pct).length===2&&!!own&&own.pct===85&&own.v==='reussi',k+' '+JSON.stringify(d&&d.pct));}
{const full=[...window.__store.keys()].filter(k=>k.startsWith('resultats/sx-')&&window.__store.get(k).groupe==='c119'&&Object.keys(window.__store.get(k).resultats||{}).length===12);ok('session results saved apart',full.length>=9&&![...window.__store.keys()].some(k=>k.startsWith('examens/sx-')),full.length);
 const own=[...window.__store.entries()].filter(([k,v])=>k.startsWith('resultats-eleves/')&&v.eleve==='el-119-01');ok('student result docs',own.length>=9&&own.every(([k,v])=>v.examen&&v.v),own.length);}
click($('#xt-reps'));await wait(60);
{const todo=()=>$$('#main [data-act=rp-set][data-v=ok]'), n=todo().length, day=$('#rd-2026-10-16'), ridOf=k=>'sx-'+k.replace(/[^A-Za-z0-9_-]/g,'-'), RD=k=>window.__store.get('resultats/'+ridOf(k));
 const mods=()=>$$('#rd-2026-10-16 .rd-mod').map(x=>parseInt(x.textContent.replace('M',''),10)), X16=()=>XS('k119-reprise').find(x=>x.id==='a20261016am');
 ok('reprise day with its modules',!!day&&/16 octobre/.test(day.textContent)&&mods().join()==='3,5,22'&&n>=4&&$$('#rd-2026-10-16 [data-act=rp-set][data-v=ok]').length>=3&&/reprises? à faire/.test(day.textContent)&&!!$('#rd-new-open'),n+' · '+mods().join());
 // une reprise réussie : « réussi en reprise », avec la date de la journée et le premier résultat
 {const b=$('#rd-2026-10-16 [data-act=rp-set][data-v=ok]'), key=b.dataset.key, el=b.dataset.el;click(b);await wait(300);
  const own=window.__store.get('resultats-eleves/'+(el+'__'+ridOf(key)).replace(/[^A-Za-z0-9_-]/g,'-')), rp=(RD(key).reprises||{})[el]||{};
  ok('reprise marked',todo().length===n-1&&RD(key).resultats[el]==='reprise'&&!!own&&own.v==='reprise'&&rp.v==='reussi'&&rp.date==='2026-10-16'&&/^(echec|absent)$/.test(rp.de)&&$$('#rd-2026-10-16 .xm-rp.is-done').length===1,todo().length+' / '+n+' '+JSON.stringify(rp));}
 // une reprise ratée : échec du module pour cet élève
 const b2=$('#rd-2026-10-16 [data-act=rp-set][data-v=ko]'), key2=b2.dataset.key, el2=b2.dataset.el;click(b2);await wait(300);
 ok('failed reprise is a module failure',RD(key2).resultats[el2]==='echecf'&&RD(key2).reprises[el2].v==='echec'&&!!$('#rd-fails')&&/Échec du module/.test($('#rd-fails').textContent)&&/échec de module/.test($('#main .st-bar').textContent)&&todo().length===n-2,todo().length+' / '+n);
 // une note de reprise en % inscrit l’issue selon le seuil ; puis on annule cette reprise
 {const i=$('#rd-2026-10-16 input[data-rpn]'), key3=i.dataset.key, el3=i.dataset.el;i.value='72';i.dispatchEvent(new Event('change',{bubbles:true}));await wait(300);
  ok('reprise grade',RD(key3).resultats[el3]==='reprise'&&RD(key3).reprises[el3].pct===72&&$$('#main .xm-rp.is-done').some(r=>/72 %/.test(r.textContent)),JSON.stringify(RD(key3).reprises));
  click($$('#main [data-act=rp-undo]').find(u=>u.dataset.key===key3&&u.dataset.el===el3));await wait(300);
  ok('reprise undone',/^(echec|absent)$/.test(RD(key3).resultats[el3])&&!RD(key3).reprises[el3]&&todo().length===n-2,RD(key3).resultats[el3]);}
 // les modules d’une journée : on en retire un, puis on le rajoute ; les reprises suivent
 {const before=todo().length;
  click($('#rd-2026-10-16 [data-act=rd-mod-del][data-m="22"]'));await wait(600);
  ok('module removed from the day',mods().join()==='3,5'&&X16().modules.join()==='3,5'&&XS('k120-reprise').find(x=>x.id==='a20261016am').modules.join()==='5,6,7'&&todo().length<=before,mods().join()+' '+todo().length);
  pick0('#rd-add-2026-10-16','22');await wait(600);
  ok('module added back',mods().join()==='3,5,22'&&X16().modules.join()==='3,5,22'&&todo().length===before,mods().join()+' '+todo().length+'/'+before);}
 // créer une journée de reprise : refusée la fin de semaine ; créée pour la classe libre, signalée pour la classe occupée
 {const db0=await window.claude.use('db');await db0.doc('groupes/c997').set({nom:'Classe 997'});await wait(250);
  click($('#rd-new-open'));await wait(80);
  ok('new reprise day form',!!$('#rd-form')&&$$('#rd-classes input').length===6&&$$('#rd-classes input:checked').length===1&&$('#rd-classes input:checked').value==='c119');
  $('#rd-date').value='2026-10-31';$('[data-form=rd-new]').requestSubmit();await wait(300);
  ok('reprise day refused on a weekend',$$('.toast').some(t=>/fin de semaine/.test(t.textContent))&&!XS('k119-reprise').some(x=>x.date==='2026-10-31')&&!!$('#rd-form'));
  $('#rd-date').value='2026-10-28';$('#rd-classes input[value=c119]').checked=false;$('#rd-classes input[value=c120]').checked=true;$('#rd-classes input[value=c997]').checked=true;
  $('[data-form=rd-new]').requestSubmit();await wait(900);
  const kd=[...window.__store.keys()].find(k=>k.startsWith('cours/')&&window.__store.get(k).groupe==='c997'), x=kd?Object.values(window.__store.get(kd).seances||{})[0]:null;
  ok('reprise day created',!!x&&x.date==='2026-10-28'&&x.tags.join()==='Reprise'&&window.__store.get(kd).titre==='Reprise'&&!XS('k120-reprise').some(y=>y.date==='2026-10-28')&&!$('#rd-form')&&$$('.toast').some(t=>/créée pour 1 classe · Classe 120 a déjà/.test(t.textContent)),JSON.stringify(x||null)+' '+$$('.toast').slice(-1).map(t=>t.textContent).join());
  pick0('#x-g','');await wait(150);
  ok('new day waits for its modules',!!$('#rd-2026-10-28')&&/Aucun module/.test($('#rd-2026-10-28').textContent)&&/997/.test($('#rd-2026-10-28').textContent)&&!!$('#rd-add-2026-10-28'),($('#rd-2026-10-28')||{}).textContent);
  if(kd) await db0.doc(kd).delete();await db0.doc('groupes/c997').delete();await wait(250);pick0('#x-g','c119');await wait(150);}
 // la fiche de l’élève dit quel module est échoué, et quand se font ses reprises
 click(navBtn('eleves'));await wait(100);click($('[data-act=student][data-id="'+el2+'"]'));await wait(120);click($('#fi-tab-examens'));await wait(100);
 ok('student fiche shows the failed module',!!$('#rp-fail')&&/Module échoué/.test($('#rp-fail').textContent)&&/Échec du module/.test($('.fiche-body').textContent),($('#rp-fail')||{}).textContent);
 click(navBtn('examens'));await wait(100);pick0('#x-g','c119');await wait(100);click($('#xt-reps'));await wait(80);
 ok('pending reprises keep their day',!!$('#rd-2026-10-16')&&todo().length===n-2);}
click($('#xt-done'));await wait(60);
ok('results list',$$('#main .xm-done.xm-row').length>=8&&/%/.test($('#xt-done b').textContent),$$('#main .xm-done.xm-row').length);
click($('#xv-grille'));await wait(80);
ok('exam grid view',!!$('.xg')&&$$('.xg tbody tr').length===12&&!$('.xm-tile')&&$('#x-g').value==='c119');
ok('grid shows grades',$$('.xg .xg-c.ok').some(c=>c.textContent.trim()==='85')&&$$('.xg .xg-c.bad').some(c=>c.textContent.trim()==='42')&&$$('.xg .xg-c').some(c=>/· 85 %/.test(c.title)),$$('.xg .xg-c.bad').map(c=>c.textContent.trim()).join());
click($('#xv-board'));await wait(40);
// ---- affectation des enseignants : parcours complet (requis → compétences → disponibilité → candidature → approbation → remplacement) ----
const DBX=await window.claude.use('db');
const SK=k=>[...window.__store.keys()].filter(x=>x.startsWith(k+'/'));
const pick=(sel,v)=>{const x=$(sel);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));};
click(navBtn('affectations'));await wait(150);
ok('aff page',$$('.xm-tile').length===4&&!!$('#at-open')&&!!$('#af-hz')&&$('#at-open').getAttribute('aria-pressed')==='true');
pick('#af-hz','90');await wait(150);
// un chargé de cours par module : personne n’est dans deux modules au même moment
ok('no clash with one course leader per module',!$$('#main .xm-row .chip.bad').some(c=>c.textContent==='Conflit'),$('#at-open').textContent.replace(/\s+/g,' '));
pick('#x-g','c119');await wait(150);
click($('#at-all'));await wait(150);
const one=r=>{const [c,x]=r.dataset.key.split('_'),e=XS(c).find(y=>y.id===x);return !!e&&(e.cours||[]).length===1;};
const affRow=$$('#main .xm-row[data-act=sess-at]').find(r=>/^1 \/ 1$/.test(r.querySelector('.af-n b').textContent.trim())&&one(r));
ok('aff all list',!!affRow&&/Enseignants/.test($('.xm-hd').textContent),$$('#main .xm-row').length);
const AK=affRow.dataset.key, AD=affRow.dataset.date, CID=(AK+'__e-vtremblay').replace(/[^A-Za-z0-9_-]/g,'-');
click(affRow);await wait(150);
ok('aff drawer',!!$('#af-box')&&$('#af-req-n').textContent==='1'&&/Chargé de cours/.test($('#af-box').textContent)&&!!$('#af-req-ro')&&!$('#af-req-p')&&!!$('#af-assign'));
// le nombre d’enseignants requis se règle sur le cours, dans le module : il vaut pour toutes les classes
const AC=XS(AK.split('_')[0]).find(e=>e.id===AK.split('_')[1]).cours[0], AM=+window.__store.get('cours/'+AK.split('_')[0]).code.slice(1);
click($('#c-open-mod'));await wait(150);
ok('module opens on the class sessions',/Modules/.test($('#heading').textContent)&&$('#fi-tab-seances').getAttribute('aria-pressed')==='true'&&$('#md-g').value==='c119'&&$('#drawer').hidden);
click($('#fi-tab-cours'));await wait(100);
click($('#mc-rp-'+AC));await wait(350);
ok('requis 2',window.__store.get('config/ecole').competences.find(k=>k.code===AM).cours.find(c=>c.id===AC).requis===2&&$('#mc-rn-'+AC).textContent==='2');
click(navBtn('affectations'));await wait(150);pick('#af-hz','90');await wait(150);pick('#x-g','c119');await wait(150);
click($('#at-open'));await wait(100);
ok('open list has it',!!$('#main .xm-row[data-key="'+AK+'"]')&&/1 à combler/.test($('#main .xm-row[data-key="'+AK+'"]').textContent));
click(navBtn('personnel'));await wait(80);
click($('[data-act=staff][data-id=e-vtremblay]'));await wait(100);
click($('#fi-tab-competences'));await wait(100);
ok('competences tab',$$('[data-form=sf-comp] input[name=comp]').length===25&&$$('[data-form=sf-comp] input:checked').length===8&&!!$('.dp-grid'),$$('[data-form=sf-comp] input:checked').length);
click($('[data-act=sf-comp-all][data-v="1"]'));await wait(30);
$('[data-form=sf-comp]').requestSubmit();await wait(300);
ok('competences saved',window.__store.get('enseignants/e-vtremblay').competences.length===25);
click($('[data-role=teacher]'));await wait(120);
pick('#sel-teacher','e-vtremblay');await wait(120);
ok('teacher nav 7',$$('#nav button').length===7&&!!$('#nav-stock')&&!!$('#nav-mescours')&&!!$('#nav-dispos'));
click(navBtn('dispos'));await wait(120);
ok('dispo calendar',!!$('.dp-grid')&&$$('.dp-c').length>=20&&$('#dp-save').disabled&&$$('.dp-wd').length===5);
for(let i=0;i<12&&!$('#dp-'+AD);i++){click($('#dp-next'));await wait(50);}
for(let i=0;i<4&&!$('#dp-'+AD).classList.contains('v-J');i++){click($('#dp-'+AD));await wait(50);}
ok('dispo day set',$('#dp-'+AD).classList.contains('v-J')&&/Toute la journée/.test($('#dp-'+AD).textContent));
if(!$('#dp-save').disabled){click($('#dp-save'));await wait(300);}
ok('dispo saved',window.__store.get('disponibilites/e-vtremblay').jours[AD]==='J'&&$('#dp-save').disabled);
click(navBtn('mescours'));await wait(200);
ok('my courses page',$$('.xm-tile').length===4&&/M1, M2/.test($('.summary b').title)&&/25 modules/.test($('.summary').textContent)&&!!$('#go-dispos'));
{const ap=$('[data-act=af-apply][data-key="'+AK+'"]');ok('open course offered',!!ap,$$('[data-act=af-apply]').length);click(ap);await wait(300);}
ok('application sent',(window.__store.get('candidatures/'+CID)||{}).statut==='attente'&&!$('[data-act=af-apply][data-key="'+AK+'"]'));
click($('#mt-wait'));await wait(100);
ok('waiting list',!!$('[data-act=af-withdraw][data-key="'+AK+'"]')&&/En attente/.test($('#main .xm-list').textContent));
click($('[data-role=admin]'));await wait(120);
click(navBtn('affectations'));await wait(150);click($('#at-cand'));await wait(120);
ok('candidate listed',!!$('[data-act=af-approve][data-id="'+CID+'"]')&&/Vincent Tremblay/.test($('#main .xm-list').textContent)&&/Disponible/.test($('#main .xm-list').textContent));
click($('[data-act=af-approve][data-id="'+CID+'"]'));await wait(300);
ok('application approved',window.__store.get('candidatures/'+CID).statut==='approuve'&&!$('[data-act=af-approve][data-id="'+CID+'"]'));
click($('[data-role=teacher]'));await wait(120);
click(navBtn('mescours'));await wait(200);click($('#mt-mine'));await wait(100);
{const b=$('[data-act=pg-set][data-k=rp][data-v="'+AK+'"]');ok('course attributed',!!b);click(b);await wait(80);}
$('#rp-motif').value='Garde en caserne';$('[data-form=af-remp]').requestSubmit();await wait(300);
ok('replacement asked',(window.__store.get('remplacements/'+CID)||{}).motif==='Garde en caserne'&&/Remplacement demandé/.test($('#main').textContent));
click($('[data-role=admin]'));await wait(120);
click(navBtn('affectations'));await wait(150);click($('#at-remp'));await wait(120);
ok('replacement listed',/Garde en caserne/.test($('#main .xm-list').textContent));
click($('[data-act=af-retire][data-key="'+AK+'"][data-t="e-vtremblay"]'));await wait(350);
ok('teacher released',window.__store.get('candidatures/'+CID).statut==='retire'&&!window.__store.get('remplacements/'+CID));
click($('[data-role=teacher]'));await wait(100);pick('#sel-teacher','e-mleduc');await wait(100);click($('[data-role=admin]'));await wait(100);
// ---- modules : structure (cours, examens, chargé de cours), séances par classe, suppression protégée ----
click(navBtn('modules'));await wait(120);
ok('modules list',$$('#main .xm-row').length===25&&!!$('#md-7')&&/Théorie/.test($('.xm-hd').textContent)&&/Pratique/.test($('.xm-hd').textContent)&&/Chargé de cours/.test($('.xm-hd').textContent)&&!/requis/i.test($('.xm-hd').textContent)&&/Olivier Bouchard/.test($('#md-7').textContent),$('#md-7').textContent);
click($('#md-add-open'));await wait(60);
ok('module form has a course leader',!!$('#md-charge')&&!$('#md-req')&&$$('#md-charge option').length>=9);
$('#md-code').value='7';$('#md-nom').value='Doublon';$('[data-form=md-add]').requestSubmit();await wait(300);
ok('module number must be new',window.__store.get('config/ecole').competences.length===25&&$$('.toast').some(t=>/existe déjà/.test(t.textContent)));
$('#md-code').value='26';$('#md-nom').value='Module d’essai';$('#md-ht').value='6';$('#md-hp').value='9';$('#md-charge').value='e-proy';
$('[data-form=md-add]').requestSubmit();await wait(400);
const K26=()=>window.__store.get('config/ecole').competences.find(k=>k.code===26);
ok('module created',!!K26()&&K26().heuresT===6&&K26().heuresP===9&&K26().heures===15&&K26().charge==='e-proy'&&K26().requis===undefined&&/Module d’essai/.test(($('#fi-name')||{}).textContent||'')&&/Chargé de cours · Philippe Roy/.test(($('#md-charge-chip')||{}).textContent||''),JSON.stringify(K26()));
// les cours du module
ok('module starts without courses',!!$('#mc-none')&&$('#fi-tab-cours').getAttribute('aria-pressed')==='true'&&$$('.fiche-tabs button').length===4);
$('#mc-num').value='26.1';$('[data-form=mc-add]').requestSubmit();await wait(350);
$('#mc-num').value='26.2';$('#mc-type').value='pratique';$('#mc-req').value='2';$('[data-form=mc-add]').requestSubmit();await wait(350);
ok('courses added to module',K26().cours.length===2&&K26().cours[0].num==='26.1'&&K26().cours[0].type==='theorie'&&K26().cours[0].requis===1&&K26().cours[1].type==='pratique'&&K26().cours[1].requis===2&&$$('#main article.md-c').length===2,JSON.stringify(K26().cours));
$('#mc-num').value='26.1';$('[data-form=mc-add]').requestSubmit();await wait(250);
ok('course number unique in module',K26().cours.length===2&&$$('.toast').some(t=>/existe déjà dans le module/.test(t.textContent)));
const C1=K26().cours[0].id, C2=K26().cours[1].id;
click($('#mc-rp-'+C1));await wait(350);
ok('requis set on the course',K26().cours.find(c=>c.id===C1).requis===2&&$('#mc-rn-'+C1).textContent==='2');
click($('#mc-rm-'+C1));await wait(350);
// les examens du module
click($('#fi-tab-examens'));await wait(100);
$('#me-type').value='p';$('#me-nom').value='Examen final';$('[data-form=me-add]').requestSubmit();await wait(350);
ok('exam added to module',K26().examens.length===1&&K26().examens[0].type==='p'&&K26().examens[0].nom==='Examen final'&&$$('#main article.md-e').length===1,JSON.stringify(K26().examens));
const E1=K26().examens[0].id;
// les séances : un cours du module donné à une classe, à une date
await DBX.doc('groupes/c999').set({nom:'Classe 999'});await wait(200);
click($('#fi-tab-seances'));await wait(100);
pick('#md-g','c999');await wait(120);
ok('session form lists the courses',$$('#mx-picks input').length===4&&$$('#mx-picks .pk.done').length===0&&!$('#mx-type')&&!$('#mx-label'),$$('#mx-picks input').length);
$('#mx-date').value='2026-10-20';$('[data-form=md-add-x]').requestSubmit();await wait(200);
ok('session needs a course',!SK('cours').some(k=>window.__store.get(k).code==='M26')&&$$('.toast').some(t=>/Cochez le cours/.test(t.textContent)));
const tick=v=>{const i=$('#mx-picks input[data-pick="'+v+'"]');if(i&&!i.checked)i.click();};
const X26=()=>{const k=SK('cours').find(k=>window.__store.get(k).code==='M26');return k?Object.values(window.__store.get(k).seances||{}).filter(Boolean):[];};
const addOn=async(vals,n)=>{for(let i=1;i<30&&X26().length<n;i++){const d=new Date();d.setDate(d.getDate()+i+(n-1)*3);const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');vals.forEach(tick);await wait(30);$('#mx-date').value=ds;$('[data-form=md-add-x]').requestSubmit();await wait(300);}};
await addOn(['c:'+C1,'c:'+C2],1);
const MC=SK('cours').find(k=>window.__store.get(k).code==='M26');
ok('session added to class',!!MC&&window.__store.get(MC).groupe==='c999'&&X26().length===1&&X26()[0].tags.join()==='Théorie'&&X26()[0].label==='26.1–26.2'&&X26()[0].cours.join()===C1+','+C2&&!window.__store.get(MC).extras,JSON.stringify(X26()));
ok('session row',$$('#main article.md-x').length===1&&/Cours 26\.1 et 26\.2/.test($('#main article.md-x').textContent)&&!$('#main article.md-x select')&&!$('#main article.md-x [data-act=af-req]')&&$$('#mx-picks .pk.done').length===2&&/Examens/.test($('.md-sum').textContent),$('#main article.md-x').textContent.replace(/\s+/g,' ').slice(0,90));
ok('session requis follows the courses',$('#main article.md-x .af-n b').textContent.trim()==='1 / 2',$('#main article.md-x .af-n b').textContent);
// le type d’un cours se change dans le module : la séance suit
click($('#fi-tab-cours'));await wait(100);
{const t=$('#mc-t-'+C1);t.value='pratique';t.dispatchEvent(new Event('change',{bubbles:true}));}await wait(600);
ok('course type follows in sessions',K26().cours.find(c=>c.id===C1).type==='pratique'&&X26()[0].tags.join()==='Pratique',JSON.stringify(X26()[0].tags));
// un cours déjà à l’horaire ne se retire pas
click($('#mc-'+C1+' [data-act=pg-set][data-k=askc]'));await wait(80);
ok('course in use cannot be removed',/retirez d’abord ses séances/.test($('#mc-'+C1).textContent)&&!$('#mc-'+C1+' [data-act=mc-del]')&&/1 sur/.test($('#mc-'+C1).textContent));
click($('#mc-'+C1+' [data-act=pg-set][data-k=askc]'));await wait(60);
// une séance d’examen
click($('#fi-tab-seances'));await wait(100);
await addOn(['e:'+E1],2);
ok('exam session added',X26().length===2&&X26().some(x=>x.tags.join()==='Examen,Pratique'&&(x.examens||[])[0]===E1&&x.label==='Examen final'),JSON.stringify(X26()));
// un module qui a des cours ne se supprime pas
click($('#fi-tab-reglages'));await wait(100);
ok('module with courses cannot be deleted',$('#md-ask').disabled&&/ne peut pas être supprimé/.test($('#md-del-why').textContent)&&/2 cours, 1 examen, 2 séances/.test($('#md-del-why').textContent),($('#md-del-why')||{}).textContent);
$('#md-ht').value='10';$('#md-charge').value='e-sgagnon';$('[data-form=md-save]').requestSubmit();await wait(450);
ok('module settings saved',K26().heuresT===10&&K26().charge==='e-sgagnon'&&K26().cours.length===2&&window.__store.get(MC).heures===19&&/Sophie Gagnon/.test($('#md-charge-chip').textContent),window.__store.get(MC).heures);
// on retire les séances, puis les cours et l’examen : le module peut alors être supprimé
click($('#fi-tab-seances'));await wait(100);
for(let i=0;i<2;i++){click($('#main article.md-x [data-act=pg-set][data-k=askx]'));await wait(80);click($('[data-act=md-del-x]'));await wait(300);}
ok('sessions removed',X26().length===0&&$$('#main article.md-x').length===0);
click($('#fi-tab-cours'));await wait(100);
for(const id of [C1,C2]){click($('#mc-'+id+' [data-act=pg-set][data-k=askc]'));await wait(80);click($('#mc-'+id+' [data-act=mc-del]'));await wait(350);}
click($('#fi-tab-examens'));await wait(100);
click($('#me-'+E1+' [data-act=pg-set][data-k=aske]'));await wait(80);click($('#me-'+E1+' [data-act=me-del]'));await wait(350);
ok('courses and exam removed',K26().cours.length===0&&K26().examens.length===0);
click($('#fi-tab-reglages'));await wait(100);
click($('#md-ask'));await wait(80);click($('[data-act=md-del]'));await wait(350);
ok('module removed',window.__store.get('config/ecole').competences.length===25&&$$('#main .xm-row').length===25);
await DBX.doc(MC).delete();await DBX.doc('groupes/c999').delete();await wait(200);
// ---- seuil de réussite des examens ----
click($('#nav-params'));await wait(120);click($('#ps-resultats'));await wait(100);
ok('pass threshold setting',!!$('#p-seuil')&&$('#p-seuil').value==='60');
$('#p-seuil').value='70';$('[data-form=p-save]').requestSubmit();await wait(350);
ok('pass threshold saved',window.__store.get('config/ecole').seuil===70&&$('#p-seuil').value==='70');
$('#p-seuil').value='60';$('[data-form=p-save]').requestSubmit();await wait(350);
// ---- locaux et équipements : la liste, ce que demande un cours du module, une séance, les conflits ----
click($('#ps-horaire'));await wait(100);
{const RS=()=>window.__store.get('config/ecole').ressources||[];
 const K9=()=>window.__store.get('config/ecole').competences.find(k=>k.code===9), C97=K9().cours.find(c=>c.num==='9.7').id, c97=()=>K9().cours.find(c=>c.id===C97);
 ok('resources panel',!!$('#p-ress')&&$$('#p-ress-list li').length===6&&/Tour d’entraînement/.test($('#p-ress-list').textContent)&&/relié à des cours/.test($('#p-ress-list').textContent),$$('#p-ress-list li').length);
 $('#p-rnom').value='Simulateur de fumée';$('#p-rtype').value='equip';$('[data-form=p-add-res]').requestSubmit();await wait(350);
 const SIM=(RS().find(r=>r.nom==='Simulateur de fumée')||{}).id;
 ok('resource added',!!SIM&&RS().length===7&&$$('#p-ress-list li').length===7);
 $('#p-rnom').value='simulateur de fumée';$('[data-form=p-add-res]').requestSubmit();await wait(250);
 ok('resource name unique',RS().length===7&&$$('.toast').some(t=>/déjà dans la liste/.test(t.textContent)));
 // dans le module : ce que chaque cours demande, pour toutes les classes
 click(navBtn('modules'));await wait(120);click($('#md-9'));await wait(150);
 ok('course resources column',/Locaux et équipements/.test($('.xm-hd.md-c').textContent)&&!!$('#mc-rs-'+C97)&&/Aucun/.test($('#mc-rs-'+C97).textContent)&&!$('.md-rs'));
 click($('#mc-rs-'+C97));await wait(80);
 ok('course resources picker',!!$('#mc-rsp-'+C97)&&$$('#mc-rsp-'+C97+' input').length===8&&/Lot d’ARI A/.test($('#mc-rsp-'+C97).textContent));
 click($('#mc-rsp-'+C97+' input[value="r-tour"]'));await wait(450);
 ok('resource set on the course',(c97().ress||[]).join()==='r-tour'&&/Tour d’entraînement/.test($('#mc-rs-'+C97).textContent),JSON.stringify(c97()));
 // la tour sert déjà au module M8 : les séances de M8 et de M9 du même jour sont en conflit
 click(navBtn('affectations'));await wait(200);
 ok('resource conflict in affectations',/conflit/i.test($('#at-open').textContent)&&$$('#main .xm-row .chip.bad').some(c=>/Conflit d’équipement/.test(c.textContent)),$('#at-open').textContent.replace(/\s+/g,' '));
 const row=$$('#main .xm-row').find(r=>[...r.querySelectorAll('.chip.bad')].some(c=>/Conflit d’équipement/.test(c.textContent))), K=row.dataset.key, xk=()=>{const [cid,xid]=K.split('_');return XS(cid).find(e=>e.id===xid);};
 click(row);await wait(150);
 ok('resource conflict in the session window',!!$('#rs-box')&&!!$('#rs-clash')&&/Tour d’entraînement/.test($('#rs-box').textContent)&&/aussi pour Classe 1\d\d \(M[89]\)/.test($('#rs-box').textContent)&&/Selon le cours du module/.test($('#rs-box').textContent),$('#rs-box').textContent.replace(/\s+/g,' ').slice(0,170));
 // pour cette séance seulement : sans la tour, plus de conflit ; puis retour à ce que demande le module
 click($('#rs-edit'));await wait(60);
 ok('session resources picker',$$('#rs-picks input').length===8&&$('#rs-picks input[value="r-tour"]').checked);
 click($('#rs-picks input[value="r-tour"]'));await wait(450);
 ok('session override saved',Array.isArray(xk().ress)&&xk().ress.length===0&&!$('#rs-clash')&&/Aucun pour cette séance/.test($('#rs-box').textContent)&&!!$('#rs-reset'),JSON.stringify(xk().ress));
 click($('#rs-reset'));await wait(450);
 ok('session back to module resources',xk().ress===undefined&&!!$('#rs-clash')&&!$('#rs-reset'),JSON.stringify(xk().ress));
 click($('#dr-close'));await wait(40);
 // on remet tout comme avant
 click(navBtn('modules'));await wait(120);click($('#md-9'));await wait(150);
 click($('#mc-rs-'+C97));await wait(80);click($('#mc-rsp-'+C97+' input[value="r-tour"]'));await wait(450);
 click($('#nav-params'));await wait(120);click($('#ps-horaire'));await wait(100);
 click($('#p-ress-list [data-act=p-del-res][data-id="'+SIM+'"]'));await wait(350);
 ok('resources cleaned up',RS().length===6&&!(c97().ress||[]).length);
 click(navBtn('affectations'));await wait(200);
 ok('no conflict left',!/conflit/i.test($('#at-open').textContent),$('#at-open').textContent.replace(/\s+/g,' '));}
// ---- import : liste d’élèves (fichier ou collage) et copie de l’horaire d’une classe ----
await DBX.doc('groupes/c998').set({nom:'Classe 998'});await wait(250);
click(navBtn('classes'));await wait(120);click($('#cl-c998'));await wait(150);
{const EL=()=>[...window.__store.entries()].filter(([k,v])=>k.startsWith('eleves/')&&v.groupe==='c998').map(([k,v])=>v);
 const FR0=window.FileReader, TXT={};window.FileReader=class{readAsText(f){setTimeout(()=>{this.result=TXT[f.name]||'';if(this.onload)this.onload();},0);}};
 const drop=(name,text)=>{TXT[name]=text.replace(/^\uFEFF/,'');const dt=new DataTransfer();dt.items.add(new File([text],name,{type:'text/csv'}));const fi=$('#m-file-c998');fi.files=dt.files;fi.dispatchEvent(new Event('change',{bubbles:true}));};
 ok('empty class shows the import form',!!$('#m-bulk-c998')&&!!$('#m-file-c998')&&!!$('#m-file-btn')&&/fichier CSV/.test($('.st-enrol').textContent));
 // un fichier CSV (titres, point-virgule, guillemets) arrive dans la zone de texte, à vérifier
 drop('liste.csv','\uFEFFN°;Prénom;Nom;Courriel\r\n1;Zoé;Lemieux;zoe@exemple.ca\r\n2;Marc-André;"Roy; Jr";\r\n');await wait(300);
 ok('file read into the list',/Zoé;Lemieux/.test($('#m-bulk-c998').value)&&$$('.toast').some(t=>/2 élèves reconnus dans liste\.csv/.test(t.textContent))&&EL().length===0,$('#m-bulk-c998').value.slice(0,60));
 $('[data-form=m-add-els]').requestSubmit();await wait(400);
 {const z=EL().find(e=>e.numero===1), m=EL().find(e=>e.numero===2);
  ok('students imported with number and e-mail',EL().length===2&&!!z&&z.nom==='Zoé Lemieux'&&z.courriel==='zoe@exemple.ca'&&!!m&&m.nom==='Marc-André Roy; Jr'&&m.courriel===undefined,JSON.stringify(EL()));}
 // une liste collée d’Excel (tabulations, sans titres) ; l’élève déjà inscrit est ignoré
 click($('#m-enrol-open'));await wait(80);
 $('#m-bulk-c998').value='3\tLéa Gagné\tlea@exemple.ca\n\nZoé Lemieux\nSimon Petit';
 $('[data-form=m-add-els]').requestSubmit();await wait(400);
 ok('pasted list, duplicate skipped',EL().length===4&&EL().some(e=>e.nom==='Léa Gagné'&&e.numero===3&&e.courriel==='lea@exemple.ca')&&EL().some(e=>e.nom==='Simon Petit'&&e.numero===undefined)&&$$('.toast').some(t=>/2 élèves inscrits · 1 déjà dans la classe/.test(t.textContent)),JSON.stringify(EL().map(e=>e.nom)));
 click($('#m-enrol-open'));await wait(80);
 drop('liste.xlsx','PK');await wait(150);
 ok('excel workbook refused with advice',$$('.toast').some(t=>/enregistrez la feuille en CSV/.test(t.textContent))&&$('#m-bulk-c998').value==='');
 window.FileReader=FR0;
 // copie de l’horaire de la classe 119, à partir du lundi 19 octobre 2026
 click($('#fi-tab-cours'));await wait(100);
 ok('copy button',!!$('#cp-open')&&!$('#cp-box'));
 click($('#cp-open'));await wait(80);
 ok('copy panel',!!$('#cp-box')&&$$('#cp-src option').length===6&&$('#cp-go').disabled&&/Choisissez la classe/.test($('#cp-info').textContent),$$('#cp-src option').length);
 pick('#cp-src','c119');await wait(80);
 {const di=$('#cp-date');di.value='2026-10-19';di.dispatchEvent(new Event('change',{bubbles:true}));}await wait(200);
 const nCopy=parseInt(($('#cp-go').textContent.match(/\d+/)||['0'])[0],10);
 ok('copy preview',nCopy>50&&!$('#cp-go').disabled&&$('#cp-date').value==='2026-10-19'&&/19 octobre 2026/.test($('#cp-info').textContent)&&/Classe 119/.test($('#cp-info').textContent)&&/fin de l’année scolaire/.test($('#cp-info').textContent),nCopy+' · '+$('#cp-info').textContent.slice(0,200));
 $('[data-form=cp-go]').requestSubmit();await wait(1500);
 {const docs=SK('cours').map(k=>window.__store.get(k)).filter(c=>c.groupe==='c998'), xs=[];for(const c of docs)for(const x of Object.values(c.seances||{}))if(x)xs.push(x);
  const dates=xs.map(x=>x.date).sort(), hol=(window.__store.get('config/ecole').conges||[]), off=ds=>hol.some(k=>ds>=k.du&&ds<=(k.au||k.du));
  const m7=docs.find(c=>c.code==='M7'), s71=m7&&Object.values(m7.seances).find(x=>x&&x.label==='7.1');
  ok('schedule copied',xs.length===nCopy&&dates[0]==='2026-10-19'&&dates.every(ds=>{const j=new Date(ds+'T12:00').getDay();return j!==0&&j!==6&&!off(ds);})&&docs.length>=20&&docs.every(c=>!c.extras),xs.length+' '+dates[0]+' '+docs.length);
  ok('copied sessions keep their course links',!!s71&&(s71.cours||[]).join()==='k1'&&s71.tags.join()==='Théorie'&&s71.minutes===360&&!xs.some(x=>(x.tags||[]).some(t=>/Ménage/.test(t)))&&m7.enseignant==='',JSON.stringify(s71||null));
  ok('copy closes its panel and is logged',!$('#cp-box')&&$$('.tbl tbody tr').length>=20&&SK('journal').some(k=>Object.values(window.__store.get(k).ev||{}).some(e=>/a copié l’horaire de Classe 119 vers Classe 998/.test(e.txt))),$$('.tbl tbody tr').length);}
 // on retire la classe d’essai, ses élèves et ses séances
 for(const k of SK('cours')) if(window.__store.get(k).groupe==='c998') await DBX.doc(k).delete();
 for(const k of SK('eleves')) if(window.__store.get(k).groupe==='c998') await DBX.doc(k).delete();
 await DBX.doc('groupes/c998').delete();await wait(300);}
// ---- notifications : la cloche (rien de plus n’est enregistré, tout se déduit des données) ----
click(navBtn('calendar'));await wait(100);
{const rows=()=>$$('#drawer .nf-row').map(r=>r.textContent);
 ok('admin bell',!!$('#nf-bell')&&!!$('#nf-n')&&parseInt($('#nf-n').textContent,10)>=2,($('#nf-n')||{}).textContent);
 click($('#nf-bell'));await wait(100);
 ok('admin notifications',/Notifications/.test($('#drawer .eyebrow').textContent)&&rows().some(t=>/Remplacement demandé/.test(t)&&/Marie Leduc/.test(t))&&rows().some(t=>/Nouvelle candidature/.test(t))&&$$('#drawer .nf-row.new').length>=2&&!$('#nf-n'),rows().length);
 click($$('#drawer .nf-row').find(r=>/Remplacement demandé/.test(r.textContent)));await wait(150);
 ok('notification opens its page',/Affectations/.test($('#heading').textContent)&&$('#at-remp').getAttribute('aria-pressed')==='true'&&$('#drawer').hidden);
 click($('#nf-bell'));await wait(80);
 ok('notifications seen',/Tout est vu/.test($('#dr-title').textContent)&&!$('#drawer .nf-row.new')&&$$('#drawer .nf-row').length>=2);
 click($('#dr-close'));await wait(40);
 // une séance annulée : l’enseignant qui la donnait et la classe sont prévenus
 click(navBtn('calendar'));await wait(100);click($('#w-next'));await wait(120);
 const KA='k120-m09_a20261013am_2026-10-13', TG='2026-10-13@a20261013am';
 click($('.cc[data-key="'+KA+'"]'));await wait(80);click($('[data-act=s-cancel]'));await wait(250);click($('#dr-close'));await wait(40);
 const mk=window.__store.get('cours/k120-m09').annule||{};
 ok('cancellation is stamped',!!mk[TG]&&/^20\d\d-/.test(mk[TG].le)&&window.__store.get('cours/k120-m09').annulees.includes(TG),JSON.stringify(mk));
 click($('[data-role=teacher]'));await wait(150);
 ok('teacher bell',!!$('#nf-n'),($('#nf-n')||{}).textContent);
 click($('#nf-bell'));await wait(100);
 ok('teacher notified of cancelled session',rows().some(t=>/Séance annulée/.test(t)&&/Classe 120/.test(t)&&/M9/.test(t)),rows().join(' | ').slice(0,200));
 click($$('#drawer .nf-row').find(r=>/Séance annulée/.test(r.textContent)));await wait(200);
 ok('cancelled session opens',!$('#drawer').hidden&&/annulée/.test($('#drawer').textContent)&&/Matières dangereuses/.test($('#drawer').textContent),$('#drawer').textContent.slice(0,80));
 click($('#dr-close'));await wait(40);
 click($('[data-role=student]'));await wait(150);pick('#sel-group','c120');await wait(150);
 click($('#nf-bell'));await wait(100);
 ok('class notified of cancelled session',rows().some(t=>/Séance annulée/.test(t)&&/Classe 120/.test(t)),rows().join(' | ').slice(0,160));
 click($('#dr-close'));await wait(40);pick('#sel-group','c119');await wait(100);
 // une fois la séance rétablie, la notification disparaît
 click($('[data-role=admin]'));await wait(150);
 click($('.cc[data-key="'+KA+'"]'));await wait(80);click($('[data-act=s-cancel]'));await wait(250);click($('#dr-close'));await wait(40);
 click($('[data-role=teacher]'));await wait(150);click($('#nf-bell'));await wait(100);
 ok('restored session leaves the bell',!rows().some(t=>/Séance annulée/.test(t)&&/Classe 120/.test(t))&&!(window.__store.get('cours/k120-m09').annule||{})[TG]&&!window.__store.get('cours/k120-m09').annulees.includes(TG));
 click($('#dr-close'));await wait(40);click($('[data-role=admin]'));await wait(120);if($('#w-today')){click($('#w-today'));await wait(100);}}
// ---- historique : qui a fait quoi, et quand (un document par mois, une entrée par action) ----
click(navBtn('historique'));await wait(250);
{const rows=()=>$$('#main .xm-jr.xm-row').map(r=>r.textContent.replace(/\s+/g,' '));
 const J=()=>{const out=[];for(const k of SK('journal'))for(const e of Object.values(window.__store.get(k).ev||{}))out.push(e);return out;};
 ok('history page',/Historique/.test($('#heading').textContent)&&rows().length>=10&&$$('#heading .toolbar .seg button').length===4&&!!$('#jr-q'),rows().length);
 ok('history: cancel and restore',rows().some(t=>/a annulé la séance/.test(t)&&/M9/.test(t)&&/Classe 120/.test(t))&&rows().some(t=>/a rétabli la séance/.test(t))&&rows().every(t=>/\d\d h \d\d/.test(t)),rows()[0]);
 ok('history: affectations',J().some(e=>e.cat==='aff'&&/a postulé/.test(e.txt))&&J().some(e=>/a approuvé la candidature de Vincent Tremblay/.test(e.txt))&&J().some(e=>/a demandé un remplacement/.test(e.txt)&&/Garde en caserne/.test(e.obj))&&J().some(e=>/a retiré Vincent Tremblay/.test(e.txt)),J().filter(e=>e.cat==='aff').map(e=>e.txt).join(' | '));
 ok('history: modules',J().some(e=>e.cat==='module'&&/a créé le module M26/.test(e.txt))&&J().some(e=>/a ajouté le cours 26\.1 au module M26/.test(e.txt))&&J().some(e=>/a retiré le cours 26\.1 du module M26/.test(e.txt))&&J().some(e=>/a supprimé le module M26/.test(e.txt))&&J().some(e=>/a ajouté la séance/.test(e.txt)&&/Classe 999/.test(e.obj))&&J().some(e=>/a supprimé la séance/.test(e.txt)),J().filter(e=>e.cat==='module').map(e=>e.txt).join(' | '));
 ok('history: one document per month',SK('journal').length===1&&/^journal\/\d{4}-\d\d$/.test(SK('journal')[0])&&J().length>=15&&J().every(e=>/^20\d\d-/.test(e.le)&&e.par==='Thierry Mayrand'&&!!e.cat),SK('journal').join()+' '+J().length);
 click($('#jr-f-aff'));await wait(80);
 ok('history filter',rows().length>=4&&rows().every(t=>/Affectations/.test(t)),rows().length);
 click($('#jr-f-all'));await wait(60);typeIn('#jr-q','rétabli');await wait(150);
 ok('history search',rows().length>=1&&rows().every(t=>/rétabli/.test(t))&&$('#jr-q').value==='rétabli',rows().length);
 typeIn('#jr-q','');await wait(100);
 // une ligne ouvre la séance concernée
 click($$('#main .xm-jr.xm-row.go').find(r=>/a annulé la séance/.test(r.textContent)&&/Classe 120/.test(r.textContent)));await wait(150);
 ok('history row opens the session',!$('#drawer').hidden&&/Matières dangereuses/.test($('#drawer').textContent));
 click($('#dr-close'));await wait(40);}
// ---- nouveautés : sous Paramètres, pour l’administration ----
{const nav=$$('#nav button').map(b=>b.id);ok('news under params',nav[nav.length-1]==='nav-nouveautes'&&nav[nav.length-2]==='nav-params'&&!!$('#nav-n'),nav.slice(-2).join(','));}
click(navBtn('nouveautes'));await wait(150);
ok('news page',/Nouveautés/.test($('#heading').textContent)&&$$('#main .nv-list').length===5&&$$('#main .nv-row').length>=5&&/Depuis votre dernière visite/.test($('#main').textContent)&&!$('#nav-n'),$$('#main .nv-row').length);
// un bloc par push : numéro, titre du push, date, identifiant avec un lien vers GitHub
{const h=$$('#main .nv-push'), n=h.map(x=>+x.querySelector('.nv-num').textContent), ls=$$('#main .nv-push a');
 ok('news by push',$('#nv-v-push').getAttribute('aria-pressed')==='true'&&h.length===5&&n[0]>=32&&n.every((x,i)=>i===0||x===n[i-1]-1)&&ls.length===5&&ls.every(l=>l.target==='_blank'&&/github\.com\/leocyfo\/caserne-ecole\/(commit\/[0-9a-f]{7}|commits\/main)$/.test(l.href))&&ls.filter(l=>/\/commit\//.test(l.href)).length>=4&&h.every(x=>/20\d\d · push/.test(x.textContent))&&/pushes précédents/.test($('#nv-more').textContent),n.join(','));}
click($('#nv-f-fix'));await wait(60);
ok('news filter',$$('#main .nv-row').length>3&&$$('#main .nv-row>.chip').every(c=>c.textContent==='Correction'),$$('#main .nv-row').length);
click($('#nv-f-all'));await wait(60);click($('#nv-more'));await wait(60);
ok('news older',$$('#main .nv-list').length>=32&&!$('#nv-more')&&/Mise en service/.test($('#main').textContent)&&!!$('#main .nv-push a[href$="/commit/12976b2"]')&&/13 octobre 2026/.test($('#main .nv-push a[href$="/commit/12976b2"]').closest('.nv-push').textContent)&&/Modules : cours, examens et chargé de cours/.test($('#main').textContent)&&$$('#main .nv-push').every(x=>x.querySelector('.nv-pt b').textContent.length>5)&&$$('#main .nv-list').every(x=>x.querySelectorAll('.nv-row').length>=1),$$('#main .nv-list').length);
// les mêmes changements regroupés par date : les pushes d’un même jour sont réunis
{const rows=$$('#main .nv-row').length;click($('#nv-v-date'));await wait(80);
 ok('news by date',$('#nv-v-date').getAttribute('aria-pressed')==='true'&&!$('#main .nv-push')&&$$('#main .nv-list').length>=5&&$$('#main .nv-list').length<12&&$$('#main .nv-row').length===rows&&$$('#main .nv-hd').some(h=>/pushes/.test(h.textContent)),$$('#main .nv-list').length+' '+$$('#main .nv-row').length+'/'+rows);
 click($('#nv-v-push'));await wait(80);}
click($('#main .nv-row [data-act=nav][data-page=modules]'));await wait(120);
ok('news opens page',/Modules/.test($('#heading').textContent));
click(navBtn('nouveautes'));await wait(120);
ok('news seen',!/Depuis votre dernière visite/.test($('#main').textContent)&&!$('#nav-n'));
// calendrier scolaire
click(navBtn('annee'));await wait(50);
ok('year noel',/Congé de Noël/.test($('#main').textContent)&&/15 juin 2027/.test($('#main').textContent));
ok('year without exam list',!!$('#yr-exams')&&/examens à venir/.test($('#yr-exams').textContent)&&$$('#main .tl li').length<14&&/Année écoulée/.test($('#main').textContent),$$('#main .tl li').length);
// personnel
click(navBtn('personnel'));await wait(50);
ok('10 staff',$$('#main tbody tr').length===10&&/Marie Leduc/.test($('#main').textContent)&&/Instructeur/.test($('#main').textContent)&&/Séances cette semaine/.test($('#main thead').textContent));
// heures enseignées : par enseignant et par mois, avec export pour la paie
click($('#st-heures'));await wait(120);
{const tr=$$('#hr-tbl tbody tr'), ml=tr.find(r=>/Marie Leduc/.test(r.textContent)), months=$$('#hr-tbl thead .hr-m').length;
 ok('hours table',tr.length>=9&&months>=3&&!!ml&&/\d/.test(ml.querySelector('td:last-child').textContent)&&$('#hm-2026-10').getAttribute('aria-pressed')==='true'&&/octobre 2026/.test($('.summary').textContent)&&/Exporter octobre/.test($('#hr-export').textContent)&&/Total/.test($('#hr-tbl .hr-tot').textContent),tr.length+' '+months);
 const u0=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u0(n);
 click($('#hr-export'));await wait(250);
 const txt=(window.__saved||{}).data||'';
 ok('hours export',(window.__saved||{}).filename==='heures-2026-10.csv'&&/Enseignant;Fonction;Séances;Heures/.test(txt)&&/Marie Leduc;Enseignant;\d+;[\d,]+/.test(txt)&&/;2026-10-0\d;Classe 1\d\d;M\d+ /.test(txt)&&!/2026-09-/.test(txt)&&$$('.toast').some(t=>/heures-2026-10\.csv/.test(t.textContent)),txt.slice(0,200));
 click($('#hm-all'));await wait(80);click($('#hr-export'));await wait(250);
 ok('hours export year',/^heures-2026.2027\.csv$/.test((window.__saved||{}).filename||'')&&/2026-09-/.test((window.__saved||{}).data||'')&&/depuis la rentrée/.test($('.summary').textContent),(window.__saved||{}).filename);
 window.claude.use=u0;}
click($('#st-liste'));await wait(80);
// présences (dans les classes)
ok('no presences menu',!$('#nav-presences'));
click(navBtn('classes'));await wait(150);
ok('att cards',$$('.cl-row').length===5&&!$('.att-card')&&/%/.test($('#cl-c119 .cl-rate').textContent),$('#cl-c119 .cl-rate').textContent);
click($('#cl-c119'));await wait(100);
ok('att class fiche',/Classe 119/.test($('#fi-name').textContent)&&$$('.fiche-tabs button').length===5&&$$('.st-row').length===12&&$$('.fh-stats>div').length===5&&/Présence/.test($('.fh-stats').textContent));
click($('#fi-tab-rattraper'));await wait(60);
ok('att to catch up',$$('.fiche-body [data-act=open-att]').length>0||/Toutes les présences/.test($('.fiche-body').textContent));
click($('#pp-annee'));await wait(100);
ok('att period in fiche',$('#pp-annee').getAttribute('aria-pressed')==='true'&&!!$('#fi-name'));
click($('#fi-back'));await wait(100);
ok('att back',$$('.cl-row').length===5);
/* ABS */
click(navBtn('personnel'));await wait(60);
click($('#pt-personnel'));await wait(60);
click($('#sp-e-mleduc-A'));await wait(30);
click($('[data-act=sp-save]'));await wait(150);
{const _d=new Date();if(_d.getDay()===6)_d.setDate(_d.getDate()-1);else if(_d.getDay()===0)_d.setDate(_d.getDate()-2);const _k='profs-absents/'+_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');ok('prof absent saved',(window.__store.get(_k)||{ids:[]}).ids.includes('e-mleduc'),_k+' '+JSON.stringify(window.__store.get(_k)));}
click(navBtn('calendar'));await wait(60);
ok('prof absent badge in week',$$('#main .week .cc.has-badge .cc-badge').some(x=>x.textContent==='Enseignant absent'));
// enseignant
click($('[data-role=teacher]'));await wait(80);
ok('teacher board',$$('#main .week button.cc').length>0,$$('#main .week button.cc').length);
click($('[data-role=student]'));await wait(80);
ok('student board',$$('#main .week button.cc').length>0&&/Prochains examens/.test($('#main').textContent));
click(navBtn('examens'));await wait(80);
ok('student exams page',/Prochains examens/.test($('#main').textContent)&&!$('.xm-tile')&&!$('[data-act=x-rep]'));
ok('student sees own results',/Mes résultats/.test($('#main').textContent)&&$$('#main .xm-me .chip.ok').length>=5,$$('#main .xm-me .chip.ok').length);
ok('student can print own transcript',!!$('#pr-releve')&&/Imprimer mon relevé/.test($('#pr-releve').textContent));
/* DEMO */
{const st=document.createElement('style');st.textContent='.demo,.demo.is-hidden{transition:none!important}';document.head.appendChild(st);}
click($('[data-role=admin]'));await wait(80);
/* CTL */
ok('one-row toolbar',!$('.ctl-bottom')&&!$('.keys')&&!$('#heading p')&&!$('.saved'));
{const mid=e=>{const r=e.getBoundingClientRect();return r.top+r.height/2;}, h=$('#heading .pg-tabs'), parts=[$('#heading #w-prev'),$('#heading #fm-g'),$('#heading #new-course'),$('#heading #nf-bell')];
 ok('title, toolbar and bell on one line',parts.every(Boolean)&&parts.every(p=>Math.abs(mid(p)-mid(h))<8)&&!$('#main .ctl'),parts.map(p=>p?Math.round(mid(p)):'-').join(',')+' / '+Math.round(mid(h)));}
// impression de l’horaire de la semaine et de la feuille de présences
{const p0=window.print;let got='';window.print=()=>{got=$('#print-root').innerHTML;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};
 const pages=()=>(got.match(/class="pr-page"/g)||[]).length;
 click($('#pr-open'));await wait(80);
 ok('print drawer',/Imprimer/.test($('#drawer .eyebrow').textContent)&&!!$('#pr-week')&&$$('#pr-who option').length>=14&&!!$('#pr-horaire')&&!!$('#pr-feuille'),$$('#pr-who option').length);
 pick0('#pr-who','');await wait(60);
 click($('#pr-horaire'));await wait(500);
 ok('print week: one page per class',pages()===5&&/Horaire · Classe 119/.test(got)&&/Horaire · Classe 123/.test(got)&&/Avant-midi/.test(got)&&/Après-midi/.test(got)&&/<b>M\d+ /.test(got)&&/@page\{size:letter landscape/.test(got),pages());
 pick0('#pr-who','e:e-mleduc');await wait(60);got='';
 click($('#pr-horaire'));await wait(500);
 ok('print week of a teacher',pages()===1&&/Horaire · Marie Leduc/.test(got)&&/M9 /.test(got)&&/Classe 1\d\d/.test(got),pages());
 pick0('#pr-who','g:c119');await wait(60);got='';
 click($('#pr-feuille'));await wait(500);
 ok('print attendance sheet',pages()===1&&/Feuille de présences · Classe 119/.test(got)&&(got.match(/<td class="nm">/g)||[]).length===12&&/Signature de l’enseignant/.test(got)&&/<td class="c">P<\/td>/.test(got)&&!/Accueil/.test(got),(got.match(/<td class="nm">/g)||[]).length);
 // la semaine choisie est ramenée au lundi
 {const w=$('#pr-week');w.value='2026-10-22';w.dispatchEvent(new Event('change',{bubbles:true}));}await wait(60);
 ok('print week snaps to monday',$('#pr-week').value==='2026-10-19'&&/19 au 23 octobre 2026/.test($('#dr-title').textContent),$('#pr-week').value);
 // sans fenêtre d’impression (page intégrée dans une autre) : la feuille est remise en fichier
 const u0=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u0(n);window.print=()=>{};
 click($('#pr-horaire'));await wait(700);
 ok('print falls back to a file',(window.__saved||{}).filename==='horaire-2026-10-19.html'&&/^<!doctype html>/.test((window.__saved||{}).data||'')&&/Horaire · Classe 119/.test((window.__saved||{}).data||'')&&$('#print-root').innerHTML==='',(window.__saved||{}).filename);
 window.claude.use=u0;window.print=p0;click($('#dr-close'));await wait(40);}
ok('late pill',!!$('#late-pill')&&/en retard/.test($('#late-pill').textContent));
ok('demo hide button',!!$('#demo-hide')&&!$('#demo').classList.contains('is-hidden')&&!$('#demo-show'));
click($('#demo-hide'));await wait(400);
ok('demo hidden',$('#demo').classList.contains('is-hidden')&&$('#demo').inert&&$('#demo').getBoundingClientRect().height<2&&!!$('#demo-show')&&document.activeElement===$('#demo-show'),Math.round($('#demo').getBoundingClientRect().height));
ok('demo pref saved',/"demoHidden":true/.test(localStorage.getItem(Object.keys(localStorage).find(k=>/"demoHidden"/.test(localStorage.getItem(k)))||'')||''));
click(navBtn('classes'));await wait(60);
ok('demo stays hidden on other page',$('#demo').classList.contains('is-hidden')&&!!$('#demo-show'));
click($('#demo-show'));await wait(400);
ok('demo shown again',!$('#demo').classList.contains('is-hidden')&&!$('#demo').inert&&$('#demo').getBoundingClientRect().height>60&&!$('#demo-show')&&document.activeElement===$('#demo-hide'));
click(navBtn('calendar'));await wait(60);
/* ANCHOR */
{const top=id=>document.getElementById('pick-'+id).closest('.wk-class').getBoundingClientRect().top;
window.scrollTo(0,0);await wait(30);
const y0=top('c123');window.scrollBy(0,y0-420);await wait(30);
const t0=top('c123'), s0=window.scrollY;
click($('#pick-c123'));await wait(150);
ok('isolate 123',$$('#main .wk-class').length===1&&!!$('#class-token'));
click($('#pick-c123'));await wait(150);
ok('back to 123 by row',$$('#main .wk-class').length===5&&Math.abs(top('c123')-t0)<2&&window.scrollY>200,Math.round(t0)+' -> '+Math.round(top('c123'))+' scrollY '+Math.round(s0)+'/'+Math.round(window.scrollY));
click($('#pick-c123'));await wait(150);
window.scrollTo(0,0);await wait(30);
click($('#tok-clear'));await wait(150);
ok('back to 123 by token',$$('#main .wk-class').length===5&&Math.abs(top('c123')-t0)<2,Math.round(t0)+' -> '+Math.round(top('c123')));
window.scrollTo(0,0);await wait(30);}
/* JOUR */
click($('#vw-jour'));await wait(150);
ok('day view',!!$('.day-board')&&$$('.day-board .wk-day').length===5&&$$('.day-board .wk-class').length===1&&$('#vw-jour').getAttribute('aria-pressed')==='true');
for(let i=0;i<6&&!/6 oct/.test($('.day-head').textContent);i++){click($('#w-prev'));await wait(80);}
ok('day view tuesday',/mardi/i.test($('.day-head').textContent)&&$$('.day-board .wk-cell.chore').length>=1&&$$('.day-board .cc').length>=5,$('.day-head').textContent+' / '+$$('.day-board .cc').length);
ok('day view no drag',!$('.day-board .cc[data-drag]'));
click($('#dpick-c119'));await wait(100);
ok('day view isolate',$$('.day-board .wk-day').length===1&&/Toutes/.test($('.day-board .wk-day').textContent));
click($('#dpick-c119'));await wait(100);
click($('#w-next'));await wait(80);
ok('day view next',/mercredi/i.test($('.day-head').textContent)&&$$('.day-board .wk-day').length===5);
click($('#vw-semaine'));await wait(150);
ok('back to week',!$('.day-board')&&$$('#main .week .wk-day').length===5);
/* PRINCIPAL */
click(navBtn('classes'));await wait(120);
ok('principal select',$('#m-pr-c119').value==='e-mleduc'&&$('#m-pr-c121').value==='e-sgagnon');
{const s=$('#m-pr-c121');s.value='e-proy';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(250);
ok('principal saved',window.__store.get('groupes/c121').principal==='e-proy');
{const s=$('#m-pr-c121');s.value='e-sgagnon';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(250);
click(navBtn('calendar'));await wait(120);
ok('principal on board',/M\. Leduc/.test($('#pick-c119').textContent)&&/S\. Gagnon/.test($('#pick-c121').textContent));
click(navBtn('personnel'));await wait(120);
ok('principal in staff list',/Principal · 119/.test($('#main').textContent));
click($$('#main tbody .link').find(x=>/Marie Leduc/.test(x.textContent)));await wait(100);
ok('principal on staff fiche',/Enseignant principal · Classe 119/.test($('.fiche-head').textContent)&&!/Classe 122/.test($('.fiche-head').textContent));
click($('#fi-back'));await wait(80);
click(navBtn('eleves'));await wait(120);
click($('#main tr.row-link[data-id="el-119-01"]'));await wait(100);
ok('principal on student fiche',/Enseignant principal/.test($('.fiche-body').textContent)&&/Marie Leduc/.test($('.fiche-body').textContent));
click($('#fi-back'));await wait(80);
click(navBtn('calendar'));await wait(120);
/* MENAGE */
{const am=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');
ok('chore fills the day',$('.wk-cell[data-date="2026-10-06"][data-grp="c119"]').classList.contains('chore')&&getComputedStyle($('.wk-cell[data-date="2026-10-06"][data-grp="c119"]')).backgroundColor==='rgb(255, 224, 138)'&&!$('.wk-cell[data-date="2026-10-07"][data-grp="c119"]').classList.contains('chore'));
ok('chore once per class-day',$('.wk-cell[data-date="2026-10-06"][data-grp="c119"]').querySelectorAll('.cell-chore').length===1&&/toute la journée/.test($('.wk-cell[data-date="2026-10-06"][data-grp="c119"]').querySelector('.cell-chore').textContent)&&!!am&&!am.querySelector('.cc-chore-pill')&&!$$('#main .cc-flag').some(x=>/Ménage/.test(x.textContent)));}
click($('#exp-btn'));await wait(400);
{const c=$('#main .week.compact .cell-chore');ok('chore band compact',!!c&&c.getBoundingClientRect().height>0&&c.getBoundingClientRect().height<40);}
{const c=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');ok('compact shows moment + kind',!!c&&c.querySelector('.cc-time').textContent==='Toute la journée'&&getComputedStyle(c.querySelector('.cc-kind')).display!=='none'&&/Théorie/.test(c.querySelector('.cc-kind').textContent));}
click($('#exp-btn'));await wait(400);
click($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]'));await wait(80);
ok('chore checkbox',!!$('#sb-menage')&&$('#sb-menage').checked);
ok('session summary',/Olivier Bouchard/.test($('#af-box').textContent)&&!/Enseignant/.test($('.sb-facts').textContent)&&$('.sb-facts').textContent.includes('9 / 12')&&/8\.1 et 8\.2/.test($('.sb-facts').textContent)&&/Théorie/.test($('.sb-chips').textContent)&&/Modifier cette séance/.test($('.sess-box').textContent)&&!/ce cours/.test($('#drawer').textContent));
const xam=()=>XS('k119-m08').find(x=>x.id==='a20261006am');
click($('#sb-menage'));await wait(250);
ok('chore removed for the day',!xam().tags.includes('Ménage')&&xam().tags.includes('Théorie')&&!(window.__store.get('groupes/c119').menage||[]).includes('2026-10-06')&&!$('.wk-cell[data-date="2026-10-06"][data-grp="c119"]').querySelector('.cell-chore'),JSON.stringify(xam().tags));
click($('#sb-menage'));await wait(250);
ok('chore added for the day',(window.__store.get('groupes/c119').menage||[]).includes('2026-10-06')&&$('.wk-cell[data-date="2026-10-06"][data-grp="c119"]').querySelectorAll('.cell-chore').length===1&&/toute la journée/.test($('#sb-menage').closest('label').textContent),JSON.stringify(window.__store.get('groupes/c119').menage));
click($('#dr-close'));await wait(60);
click($('[data-role=teacher]'));await wait(100);
{const c=$('#main .week .cc-chore-pill');ok('teacher sees chore',!!c);
if(c){click(c.closest('.cc'));await wait(100);ok('chore note in attendance',!!$('#drawer .chore-note')&&/Corvée de ménage/.test($('#drawer .chore-note').textContent));click($('#dr-close'));await wait(60);}}
click($('[data-role=student]'));await wait(100);
ok('student sees chore',$$('#main .week .cell-chore').length>0&&!$('#main .week .cc-chore-pill'));
click($('[data-role=admin]'));await wait(100);
/* COMPTES */
click(navBtn('comptes'));await wait(200);
ok('accounts page',/Comptes/.test($('#heading').textContent)&&$$('#main .tbl tbody tr').length===8,$$('#main .tbl tbody tr').length);
click($('#acf-student'));await wait(60);
ok('accounts filter',$$('#main .tbl tbody tr').length===4);
click($('#acf-all'));await wait(60);
click($('#ac-new'));await wait(200);
ok('peers listed',!!$('#pk-u3')&&/Léo Gagnon/.test($('#pk-u3').textContent)&&/\(vous\)/.test(($('#pk-u1')||{}).textContent||''));
click($('#pk-u3'));await wait(60);
ok('person picked',/Léo Gagnon/.test($('#ac-person').textContent));
click($('#ac-save'));await wait(80);
ok('needs fiche',/fiche de l’élève/.test(($('#drawer .form-err')||{}).textContent||''));
{const s=$('#ac-ref');s.value='el-119-05';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(60);
click($('#ac-save'));await wait(250);
{const c3=window.__store.get('comptes/u3');ok('student account saved',!!c3&&c3.role==='student'&&c3.ref==='el-119-05'&&c3.fiche&&c3.fiche.groupe==='c119'&&!!c3.fiche.nom&&!$('#drawer:not([hidden])'),JSON.stringify(c3));}
click($('#ac-new'));await wait(150);
{const q=$('#ac-q');q.focus();q.value='Julie';q.dispatchEvent(new Event('input',{bubbles:true}));}await wait(150);
ok('search finds',!!$('#pk-u2')&&$('#ac-q').value==='Julie');
click($('#pk-u2'));await wait(60);
click($('#ac-role-teacher'));await wait(60);
{const s=$('#ac-ref');s.value='e-proy';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(60);
click($('#ac-save'));await wait(250);
ok('teacher account saved',(window.__store.get('comptes/u2')||{}).role==='teacher'&&window.__store.get('comptes/u2').ref==='e-proy');
ok('accounts table grows',$$('#main .tbl tbody tr').length===10&&/Julie Tremblay/.test($('#main .tbl').textContent));
// la fiche suit les modifications du dossier
click(navBtn('eleves'));await wait(150);
click($('[data-act=student][data-id="el-119-05"]'));await wait(100);click($('#fi-edit'));await wait(80);
{const i=$('#st-nom');i.value='Florence Morin-Test';i.dispatchEvent(new Event('input',{bubbles:true}));}
click($('#drawer button.primary[type=submit]'));await wait(300);
ok('fiche synced',window.__store.get('comptes/u3').fiche.nom==='Florence Morin-Test',window.__store.get('comptes/u3').fiche.nom);
// profils
click($('#person-btn'));await wait(150);
ok('admin profile',/Mon profil/.test($('#heading').textContent)&&/Thierry Mayrand/.test($('#pf-name').textContent)&&/Gérer les comptes/.test($('#main').textContent));
click($('[data-role=teacher]'));await wait(120);
click(navBtn('profil'));await wait(150);
ok('teacher profile preview',!!$('#pf-who')&&/Mes classes/.test($('#main').textContent)&&/aperçu/.test($('#person').textContent),$('#pf-name').textContent);
{const s=$('#pf-who');s.value='e-proy';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('teacher profile switch',/Philippe Roy/.test($('#pf-name').textContent)&&/Philippe Roy/.test($('#person').textContent));
click($('[data-role=student]'));await wait(120);
click(navBtn('profil'));await wait(150);
ok('student profile preview',/Mes informations/.test($('#main').textContent)&&/Classe 119/.test($('#main').textContent)&&!!$('#pf-who'));
click($('[data-role=admin]'));await wait(120);
// suppression
click(navBtn('comptes'));await wait(150);
click($('#ac-edit-u2'));await wait(120);
click($('#ac-del'));await wait(60);click($('#ac-del-yes'));await wait(250);
ok('account deleted',!window.__store.get('comptes/u2')&&$$('#main .tbl tbody tr').length===9);
/* entrées réunies : leurs pages sont des onglets à côté du titre ; Compta est « À faire » */
{click(navBtn('modules'));await wait(150);
 ok('modules and exams together',$('#nav-modules').getAttribute('aria-current')==='page'&&$('#tab-modules').getAttribute('aria-pressed')==='true'&&!!$('#tab-examens')&&/Modules et examens/.test($('#heading h1').textContent)&&/Ressources/.test($('#nav-modules').closest('li').previousElementSibling.textContent));
 click($('#tab-examens'));await wait(150);
 ok('exams tab keeps the menu entry',$('#nav-modules').getAttribute('aria-current')==='page'&&$('#tab-examens').getAttribute('aria-pressed')==='true'&&!!$('#xt-up'));
 click(navBtn('eleves'));await wait(150);click($('#tab-personnel'));await wait(150);
 ok('students and staff together',$('#nav-eleves').getAttribute('aria-current')==='page'&&/Élèves et personnel/.test($('#heading h1').textContent)&&$('#tab-personnel').getAttribute('aria-pressed')==='true');
 /* ---------- Stock : menu à sections, tableau de bord, inventaire, article, mouvements, dotation, inspections, réglages ---------- */
 {const ST=id=>window.__store.get('stock/'+id), MV=()=>[...window.__store.entries()].filter(([k])=>k.startsWith('stock-mvt/')).map(([,v])=>v), setv=(id,v)=>{$(id).value=v;}, find=async q=>{const x=$('#stk-q');x.value=q;x.dispatchEvent(new Event('input',{bubbles:true}));await wait(150);}, sub=async()=>{$('#drawer form').requestSubmit();await wait(350);};
 click(navBtn('stock'));await wait(200);
 ok('stock side menu',$('#nav-stock').classList.contains('nav-back')&&$$('#nav [data-k=sk]').length===13&&$('#sk-dash').getAttribute('aria-current')==='page'&&!!$('#sk-insp .nav-todo.bad')&&!!$('#sk-buy .nav-todo.bad')&&!$('#sk-conso')&&!$('#sk-cmd')&&/Inventaire/.test($('#nav').textContent),$$('#nav [data-k=sk]').length);
 ok('stock dashboard',$$('#main .xm-tile').length===4&&/75/.test($('#skd-tout').textContent)&&$$('#skd-todo li').length>3&&/Tuyau/.test($('#skd-out').textContent)&&/Derniers mouvements/.test($('#main').textContent));
 click($('#sk-tout'));await wait(150);
 ok('inventory tabs',$$('#main .stk-seg button').length===5&&!!$('#skt-conso .seg-n.bad')&&$('#skt-tout').getAttribute('aria-pressed')==='true',$$('#main .stk-seg button').length);
 click($('#skt-epi'));await wait(150);
 ok('stock category',$('#sk-tout').getAttribute('aria-current')==='page'&&$('#skt-epi').getAttribute('aria-pressed')==='true'&&$$('#main .xm-row').length===44&&!!$('#heading #stk-q')&&!!$('#heading #stk-add')&&!!$('#vm-cards'),$$('#main .xm-row').length);
 // cartes légères : pas de titres de colonnes ; « par … » sous le mouvement
 click($('#vm-cards'));await wait(150);
 ok('light inventory cards',$('#main').classList.contains('view-cards')&&!!$('#main .xm-sk .stk-c')&&!$('#main .xm-row.xm-sk>[data-l]'));
 click($('#sk-mvt'));await wait(150);
 {const by=$('#main .xm-skm .skm-by');ok('light movement cards',!$('#main .xm-row.xm-skm>[data-l]')&&!!by&&getComputedStyle(by).display==='inline'&&!!$('#main .xm-skm .nw'));}
 click($('#vm-list'));await wait(150);click($('#sk-mvt'));await wait(150);
 ok('movement list keeps its columns',!$('#main').classList.contains('view-cards')&&getComputedStyle($('#main .xm-skm .skm-by')).display==='none');
 click($('#sk-tout'));await wait(150);await find('BAR-007');
 ok('stock search and state',$$('#main .xm-row').length===1&&/Épreuve hydraulique en retard/.test($('#main .xm-row').textContent),$$('#main .xm-row').map(r=>r.textContent).join('|'));
 click($('#main .xm-row'));await wait(150);
 ok('stock article',/Bouteille d’air/.test($('#drawer').textContent)&&/Échéances/.test($('#drawer').textContent)&&!!$('#drawer [data-v=epreuve]')&&!!$('#drawer [data-v=sortie]'));
 click($('#drawer [data-v=epreuve]'));await wait(100);await sub();
 ok('hydro test recorded',ST('sk-bar07').epDer==='2026-10-09'&&MV().some(m=>m.type==='epreuve'&&m.art==='sk-bar07')&&/Bouteille d’air/.test($('#drawer').textContent)&&!$('[data-form=stk-act]'));
 click($('#dr-close'));await wait(80);
 // sortie pour une manœuvre, puis retour avec contrôle : endommagé, il part en maintenance
 await find('TUY-001');click($('#main .xm-row'));await wait(150);
 click($('#drawer [data-v=sortie]'));await wait(100);setv('#sx-instr','e-mleduc');await sub();
 ok('item out',!!ST('sk-tuy01').sortie&&ST('sk-tuy01').sortie.instr==='e-mleduc'&&!!$('#drawer [data-v=retour]'));
 click($('#drawer [data-v=retour]'));await wait(100);$('#sx-intact').checked=false;await sub();
 ok('item back, damaged',!ST('sk-tuy01').sortie&&ST('sk-tuy01').statut==='maint'&&MV().some(m=>m.type==='retour'&&m.art==='sk-tuy01'&&/endommagé/.test(m.note)));
 click($('#dr-close'));await wait(80);
 // consommable : consommer (pas plus que le stock), réapprovisionner avec un coût : la dépense va dans la compta
 await find('Émulseur');click($('#main .xm-row'));await wait(150);
 click($('#drawer [data-v=conso]'));await wait(100);setv('#sx-qte','5');await sub();
 ok('cannot use more than the stock',ST('sk-emu').qte===3&&$$('.toast').some(t=>/n’en reste que 3/.test(t.textContent)));
 setv('#sx-qte','1');await sub();
 ok('consumption recorded',ST('sk-emu').qte===2);
 click($('#drawer [data-v=reappro]'));await wait(100);setv('#sx-qte','10');setv('#sx-cout','1850,00');setv('#sx-fourn','Aréo-Feu');await sub();await wait(200);
 ok('restock and expense',ST('sk-emu').qte===12&&[...window.__store.entries()].some(([k,v])=>k.startsWith('compta/')&&v.type==='dep'&&v.poste==='conso'&&v.ttc===185000&&v.tiers==='Aréo-Feu'));
 click($('#dr-close'));await wait(80);await find('');
 // ajouter trois casques d’un coup
 click($('#stk-add'));await wait(120);click($('#stk-pick-free'));await wait(120);setv('#sa-nom','Casque neuf');setv('#sa-code','CAS-N');setv('#sa-nb','3');await sub();await wait(200);
 {const ns=[...window.__store.values()].filter(v=>v.nom==='Casque neuf');ok('add several items',ns.length===3&&ns.map(v=>v.code).sort().join(',')==='CAS-N-01,CAS-N-02,CAS-N-03');}
 // fiche élève : l’onglet Équipement
 click($('#nav-stock'));await wait(150);click(navBtn('eleves'));await wait(150);
 {const r=$$('#main tbody tr[data-id]')[0];click(r);await wait(150);click($('#fi-tab-equipement'));await wait(120);
  ok('student equipment tab',/Équipement attribué/.test($('#main').textContent)&&/Casque de pompier/.test($('#fi-equip').textContent)&&/Lot de la classe/.test($('#main').textContent),$('#fi-equip')&&$('#fi-equip').textContent.slice(0,80));}
 // dotations : attribuer à un élève, puis tout reprendre en fin de cohorte
 click(navBtn('stock'));await wait(150);click($('#sk-dot'));await wait(150);
 {const r=$$('#main tbody tr').find(x=>/Rien d’attribué/.test(x.textContent));click(r.querySelector('[data-act=stk-dot]'));await wait(150);
  const ck=$('#drawer [data-sk-dot]');ck.checked=true;const aid=ck.dataset.skDot;await sub();
  ok('equipment given',ST(aid).attrib&&ST(aid).attrib.t==='eleve'&&MV().some(m=>m.type==='dotation'&&m.art===aid));}
 click($('#stk-back'));await wait(100);click($('#stk-back-go'));await wait(800);
 ok('end of cohort: everything back',![...window.__store.entries()].some(([k,v])=>k.startsWith('stock/')&&v.attrib&&(v.attrib.id==='c119'||(window.__store.get('eleves/'+v.attrib.id)||{}).groupe==='c119'))&&MV().filter(m=>m.type==='retourDot'&&/fin de cohorte/.test(m.note||'')).length>=14);
 // inspections : la plus urgente en premier
 click($('#sk-insp'));await wait(150);
 {const b=$('#main [data-act=stk-go][data-v=insp]');const aid=b.dataset.id;click(b);await wait(120);await sub();
  ok('inspection from the list',ST(aid).inspDer==='2026-10-09'&&/En retard/.test($('#main').textContent));}
 click($('#dr-close'));await wait(80);
 // réglages : les enseignants ne gèrent plus le matériel
 click($('#sk-regl'));await wait(150);setv('#sr-alerte','45');$('#sr-p-sortie').checked=false;$('#sr-p-bris').checked=false;$('[data-form=stk-regl]').requestSubmit();await wait(350);
 click($('#nav-stock'));await wait(120);click($('[data-role=teacher]'));await wait(150);
 ok('stock settings',window.__store.get('config/ecole').stock.alerte===45&&!$('#nav-stock'));
 click($('[data-role=admin]'));await wait(150);click(navBtn('stock'));await wait(150);click($('#sk-regl'));await wait(150);$('#sr-p-sortie').checked=true;$('#sr-p-bris').checked=true;$('[data-form=stk-regl]').requestSubmit();await wait(350);
 // l’enseignant : le matériel, sans tableau de bord ni réglages, et seulement sortir ou déclarer un bris
 click($('#nav-stock'));await wait(120);click($('[data-role=teacher]'));await wait(150);click(navBtn('stock'));await wait(200);
 ok('teacher stock menu',/Matériel/.test($('#nav-stock').textContent)&&!$('#sk-dash')&&!$('#sk-regl')&&!!$('#sk-tout')&&!$('#heading #stk-add'));
 await find('LAN-001');click($('#main .xm-row'));await wait(150);
 ok('teacher stock actions',!!$('#drawer [data-v=sortie]')&&!!$('#drawer [data-v=bris]')&&!$('#drawer [data-v=insp]')&&!$('#stk-edit'));
 click($('#dr-close'));await wait(80);await find('');click($('#nav-stock'));await wait(120);click($('[data-role=admin]'));await wait(150);}
 /* ---------- Stock à fond : catalogue, import, lot, étiquettes, QR, scanner, emplacements, inspections, kit, préparation, achats, réparations, comptage, rapports ---------- */
 {const ST=id=>window.__store.get('stock/'+id), ALL=pre=>[...window.__store.entries()].filter(([k])=>k.startsWith(pre+'/')).map(([k,v])=>Object.assign({_id:k.split('/')[1]},v)), setv=(id,v)=>{$(id).value=v;}, sub=async()=>{$('#drawer form').requestSubmit();await wait(350);}, chg=(id,v)=>{const x=$(id);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));}, find=async q=>{const x=$('#stk-q');x.value=q;x.dispatchEvent(new Event('input',{bubbles:true}));await wait(150);}, printed=async fn=>{const p0=window.print;let got='';window.print=()=>{got=$('#print-root').innerHTML;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};await fn();await wait(500);window.print=p0;return got;};
 click(navBtn('stock'));await wait(200);
 // fiches d’objets : une fiche par objet ; « Ajouter » crée les exemplaires numérotés
 click($('#sk-cat'));await wait(150);
 ok('object sheets',$$('#main .stk-fiche').length===17&&/Casque de pompier/.test($('#main').textContent)&&/3 articles n’ont pas de fiche/.test(($('#stk-loose')||{}).textContent||''),$$('#main .stk-fiche').length);
 click($('#stk-f-mo-cas [data-act=stk-add-to]'));await wait(150);
 ok('quick add form',!!$('#sq-nb')&&/CAS-013/.test($('#sq-codes').textContent));
 {const x=$('#sq-nb');x.value='2';x.dispatchEvent(new Event('input',{bubbles:true}));}
 ok('codes follow the number',/CAS-013 à CAS-014/.test($('#sq-codes').textContent));
 setv('#sq-empl','Étagère A');await sub();await wait(250);
 ok('items added to the sheet',['CAS-013','CAS-014'].every(c=>ALL('stock').some(v=>v.code===c&&v.modele==='mo-cas'&&v.nom==='Casque de pompier'&&v.empl==='Étagère A')));
 // une fiche : chiffres, tailles, exemplaires
 click($('#stk-f-mo-hab [data-act=stk-fiche]'));await wait(200);
 ok('object sheet page',/Habit de combat/.test($('.stk-fhead').textContent)&&$$('#main .kpi').length===4&&/M : \d+ libres? sur \d+/.test($('#main').textContent)&&$$('#main .stk-elist .xm-row').length===10,$$('#main .stk-elist .xm-row').length);
 click($('#stk-fadd'));await wait(150);setv('#sq-taille','L');{const x=$('#sq-nb');x.value='3';x.dispatchEvent(new Event('input',{bubbles:true}));}await sub();await wait(250);
 ok('add by size',ALL('stock').filter(v=>v.modele==='mo-hab'&&v.taille==='L').length===7&&ALL('stock').some(v=>v.code==='HAB-013'));
 click($('#stk-fback'));await wait(150);
 // une nouvelle fiche, puis ses premiers exemplaires
 click($('#stk-mod-new'));await wait(150);setv('#sm-nom','Lampe de casque');setv('#sm-pre','lmp');setv('#sm-tailles','');await sub();await wait(200);
 {const m=ALL('stock-modeles').find(v=>v.nom==='Lampe de casque');
  ok('new object sheet',!!m&&m.prefixe==='LMP'&&!!$('#sq-nb')&&/LMP-001/.test($('#sq-codes').textContent));
  {const x=$('#sq-nb');x.value='3';x.dispatchEvent(new Event('input',{bubbles:true}));}await sub();await wait(250);
  ok('first items of a new sheet',['LMP-001','LMP-002','LMP-003'].every(c=>ALL('stock').some(v=>v.code===c&&v.modele===m._id))&&/Lampe de casque/.test($('.stk-fhead').textContent));}
 // un consommable : on ajoute une quantité
 click($('#stk-fback'));await wait(150);
 {const q0=ST('sk-bal').qte;click($('#stk-f-mo-bal [data-act=stk-add-to]'));await wait(150);setv('#sq-qte','15');await sub();await wait(200);
  ok('add a quantity',ST('sk-bal').qte===q0+15&&ALL('stock-mvt').some(m=>m.art==='sk-bal'&&m.type==='reappro'&&m.qte===15));}
 // « Ajouter un article » de l’inventaire : choisir la fiche
 click($('#sk-tout'));await wait(150);click($('#stk-add'));await wait(150);
 {const x=$('#stk-pk-q');x.value='botte';x.dispatchEvent(new Event('input',{bubbles:true}));await wait(120);}
 ok('pick a sheet',$$('#drawer .stk-pk').length===1&&/Bottes de combat/.test($('#drawer .stk-pk').textContent));
 click($('#drawer .stk-pk'));await wait(150);
 ok('pick opens the quick add',!!$('#sq-nb')&&/BOT-007/.test($('#sq-codes').textContent));
 click($('#dr-close'));await wait(80);
 // import d’une liste d’Excel
 click($('#sk-tout'));await wait(150);click($('#stk-imp-open'));await wait(150);
 setv('#si-txt','Nom;Catégorie;Code;Emplacement;Quantité\nLance-canon portative;Matériel;LC-001;Entrepôt;1\nBalises orange;Consommables;BAL-O;Réserve atelier;25');
 click($('#si-read'));await wait(120);
 ok('import preview',/2 articles à importer/.test($('#drawer').textContent));
 click($('#si-go'));await wait(500);
 ok('import',ALL('stock').some(v=>v.code==='LC-001'&&v.cat==='mat'&&v.empl==='Entrepôt')&&ALL('stock').some(v=>v.code==='BAL-O'&&v.suivi==='qte'&&v.qte===25));
 click($('#sk-cat'));await wait(150);
 ok('items without a sheet',!!$('#stk-loose')&&/5 articles n’ont pas de fiche/.test($('#stk-loose').textContent));
 click($('#stk-fiches-auto'));await wait(500);
 ok('sheets created from the inventory',!$('#stk-loose')&&ALL('stock-modeles').some(m=>m.nom==='Lance-canon portative'&&m.prefixe==='LC')&&ALL('stock').filter(v=>v.code==='LC-001'||v.code==='BAL-O').every(v=>!!v.modele));
 click($('#sk-tout'));await wait(150);
 // actions en lot : cocher, déplacer ; étiquettes QR
 await find('LAN-00');
 click($$('#main .stk-ck')[0]);await wait(80);click($$('#main .stk-ck')[1]);await wait(80);
 ok('selection bar',!!$('#stk-bulk')&&/2 articles cochés/.test($('#stk-bulk').textContent));
 chg('#stk-bk-empl','Salle ARI');await wait(500);
 ok('bulk move',ST('sk-lan01').empl==='Salle ARI'&&ST('sk-lan02').empl==='Salle ARI'&&ALL('stock-mvt').some(m=>m.type==='transfert'&&m.art==='sk-lan01')&&!$('#stk-bulk'));
 window.qrcode=()=>({addData(){},make(){},createSvgTag(){return '<svg class="fakeqr"></svg>';}});
 click($('#stk-all'));await wait(100);
 {const got=await printed(async()=>click($('#stk-bulk [data-act=stk-labels]')));ok('QR labels',(got.match(/class="lab"/g)||[]).length===3&&/LAN-001/.test(got)&&/fakeqr/.test(got),(got.match(/class="lab"/g)||[]).length);}
 click($('#stk-bulk [data-act=stk-bk][data-v=none]'));await wait(80);await find('');
 // une étiquette scannée avec l’appareil photo ouvre l’article
 location.hash='#stk=sk-cas08';await wait(300);
 ok('QR link opens the item',!$('#drawer').hidden&&/CAS-008/.test($('#drawer').textContent)&&!/stk=/.test(location.hash));
 click($('#dr-close'));await wait(80);
 // scanner : par code ou n° de série, sortie et retour groupés
 click($('#stk-scan-open'));await wait(150);
 {const code=async c=>{$('#stk-code').value=c;$('[data-form=stk-code]').requestSubmit();await wait(150);};
  await code('CAS-009');await code('MSA-240010');await code('inconnu');
  ok('scan by code',$$('#stk-scan-list li').length===2&&/Aucun article pour/.test($('#drawer').textContent));
  click($('#stk-grp-out'));await wait(500);
  ok('group checkout',!!ST('sk-cas09').sortie&&!!ST('sk-cas10').sortie&&!!$('#stk-grp-in'));
  click($('#stk-grp-in'));await wait(500);
  ok('group return',!ST('sk-cas09').sortie&&!ST('sk-cas10').sortie);}
 click($('#dr-close'));await wait(80);
 // emplacements : l’arbre, le contenu avec les sous-emplacements, un transfert
 click($('#sk-empl'));await wait(150);
 ok('locations tree',$$('#main .stk-node').length>=6&&/Autopompe 119/.test($('#main .stk-tree').textContent));
 click($$('#main .stk-node').find(b=>/Réserve atelier/.test(b.textContent)));await wait(150);
 ok('location with its shelves',$$('#main .stk-elist .xm-row').length>40&&!!$('#stk-cpt-here'),$$('#main .stk-elist .xm-row').length);
 click($('#main .stk-elist .xm-row'));await wait(150);
 {const id=ST? null:null;const t=$('#drawer h2').textContent;click($('#drawer [data-v=transfert]'));await wait(120);setv('#sx-empl','Autopompe 119');const aid=ALL('stock').find(v=>v.nom===t&&v.empl!=='Autopompe 119')._id;await sub();
  ok('transfer',ALL('stock-mvt').some(m=>m.type==='transfert'&&/→ Autopompe 119/.test(m.note||''))&&ALL('stock').filter(v=>v.empl==='Autopompe 119').length>=7);}
 click($('#dr-close'));await wait(80);
 // inspections : tournée, liste de contrôle, rapport
 click($('#sk-insp'));await wait(150);
 ok('inspection round',!!$('#stk-tour')&&$$('#stk-tour li').length>0);
 {const b=$('#stk-tour [data-act=stk-tour-ok]'), id=b.dataset.id;click(b);await wait(400);ok('round: compliant',ST(id).inspDer==='2026-10-09'&&ALL('stock-mvt').some(m=>m.art===id&&m.type==='insp'&&m.points));}
 {const b=$('#stk-tour li [data-act=stk-go][data-v=insp]'), id=b.dataset.id;click(b);await wait(150);
  ok('inspection checklist',$$('#drawer [data-pt]').length>=3);
  $$('#drawer [data-pt]')[0].checked=false;await sub();
  ok('a failed point sends it to repair',ST(id).statut==='maint'&&ALL('stock-mvt').some(m=>m.art===id&&m.type==='insp'&&/non conforme/.test(m.note||'')));
  click($('#dr-close'));await wait(80);}
 {const got=await printed(async()=>click($('#stk-insp-pr')));ok('inspection report',/Rapport d’inspections/.test(got)&&/Non conforme/.test(got));}
 // kit d’aspirant et tailles
 click($('#sk-dot'));await wait(150);chg('#stk-g','c120');await wait(150);
 click($('#stk-e-el-120-02 [data-act=stk-sizes]'));await wait(120);
 ok('sizes form',$('#sz-manteau').value==='XL');
 setv('#sz-casque','7 ¼');await sub();
 ok('sizes saved',window.__store.get('eleves/el-120-02').tailles.casque==='7 ¼'&&window.__store.get('eleves/el-120-02').tailles.manteau==='XL');
 click($('#stk-kit-open'));await wait(200);
 const nOk=$$('#drawer .stk-kit .chip.ok').length;
 ok('kit plan',$$('#drawer .stk-kit tbody tr').length>=5&&nOk>10,nOk);
 click($('#stk-kit-go'));await wait(1500);
 {const mine=id=>ALL('stock').filter(v=>v.attrib&&v.attrib.t==='eleve'&&v.attrib.id===id);
  ok('class equipped with the kit',ALL('stock').filter(v=>v.attrib&&v.attrib.t==='eleve'&&/^el-120-/.test(v.attrib.id)).length===nOk&&ALL('stock-mvt').some(m=>/kit/.test(m.note||'')));
  ok('kit follows sizes',mine('el-120-02').some(v=>/Habit/.test(v.nom)&&v.taille==='XL')&&mine('el-120-02').some(v=>/Gants/.test(v.nom)&&v.taille==='XL'));}
 click($('#stk-e-el-120-02 [data-act=stk-sign]'));await wait(400);
 ok('signed sheet',ALL('stock').filter(v=>v.attrib&&v.attrib.id==='el-120-02').every(v=>v.attrib.signe===true)&&/Signée/.test($('#stk-e-el-120-02').textContent));
 // une pièce perdue, facturée à l’élève
 {const h=ALL('stock').find(v=>v.attrib&&v.attrib.id==='el-120-02'&&/Casque/.test(v.nom));location.hash='#stk='+h._id;await wait(300);
  click($('#drawer [data-v=retourDot]'));await wait(120);setv('#sx-etat','perdu');$('#sx-fact').checked=true;setv('#sx-mt','420,00');await sub();await wait(300);
  ok('lost item billed to the student',ST(h._id).statut==='manquant'&&!ST(h._id).attrib&&ALL('compta').some(x=>x.type==='chg'&&x.eleve==='el-120-02'&&x.ttc===42000)&&ALL('stock-mvt').some(m=>m.type==='perte'&&m.art===h._id));
  click($('#dr-close'));await wait(80);}
 // préparation d’une journée : besoins par module, consommables inscrits
 click($('#sk-prep'));await wait(150);chg('#stk-pd','2026-10-13');await wait(200);
 ok('preparation day',$$('#stk-prep li').length>0&&!!$('#stk-out'));
 {const m=(/^M\d+/.exec($('#stk-prep li b').textContent)||[''])[0];setv('#sb-mod',m);setv('#sb-art','sk-emu');setv('#sb-qte','1');$('[data-form=stk-bes]').requestSubmit();await wait(400);
  ok('needs per module',(window.__store.get('config/ecole').stock.besoins[m]||[]).some(x=>x.art==='sk-emu'),m);
  const q0=ST('sk-emu').qte;click($('#stk-prep [data-act=stk-prep-conso]'));await wait(500);
  ok('planned consumables',ST('sk-emu').qte===q0-1,q0+' -> '+ST('sk-emu').qte);}
 ok('late returns',/en retard/i.test($('#stk-out').textContent)&&/LAN-003/.test($('#stk-out').textContent));
 // achats : à commander, commandes préparées, réception partielle, fournisseurs
 click($('#sk-buy'));await wait(150);
 ok('to buy',$$('#main .xm-row').length>0&&/à commander/.test($('#main').textContent));
 {const n0=ALL('stock-cmd').length;click($('#stk-buy'));await wait(700);ok('purchase orders drafted',ALL('stock-cmd').length>n0&&$('#sk-buy').getAttribute('aria-current')==='page'&&$('#skt-cmd').getAttribute('aria-pressed')==='true');}
 click($('#main [data-act=stk-cmd][data-id=bc-001]'));await wait(150);
 ok('purchase order',/BC-2026-001/.test($('#drawer').textContent)&&!!$('#drawer [data-rl="0"]'));
 {const q1=ST('sk-emu').qte;$('#drawer [data-rl="0"]').value='4';$('[data-form=stk-rcv]').requestSubmit();await wait(700);
  ok('partial receipt',ST('sk-emu').qte===q1+4&&window.__store.get('stock-cmd/bc-001').statut==='partielle'&&ALL('compta').some(x=>/BC-2026-001/.test(x.libelle||'')&&x.ttc===74000),ST('sk-emu').qte);}
 click($('#dr-close'));await wait(80);
 click($('#skt-fourn'));await wait(150);
 ok('suppliers',$$('#main tbody tr').length===3);
 click($('#stk-fo-new'));await wait(120);setv('#sf2-nom','Hydro-Pro');setv('#sf2-delai','10');await sub();
 ok('new supplier',ALL('stock-fourn').some(v=>v.nom==='Hydro-Pro'&&v.delai===10));
 // réparations : envoyer une lance, la recevoir avec la facture
 click($('#sk-rep'));await wait(150);
 ok('repairs',$$('#main tbody tr').length===1&&/Cisaille/.test($('#main').textContent)&&/En retard/.test($('#main').textContent));
 location.hash='#stk=sk-lan02';await wait(300);
 click($('#drawer [data-act=stk-rep-new]'));await wait(120);setv('#sr2-pb','Robinet qui fuit');setv('#sr2-rep','Hydro-Pro');await sub();
 {const r=ALL('stock-rep').find(x=>x.art==='sk-lan02');ok('sent to repair',ST('sk-lan02').statut==='maint'&&!!r&&!!$('#stk-rep-done'));
  setv('#sr2-cout','85,50');click($('#stk-rep-done'));await wait(700);
  ok('repair done',ST('sk-lan02').statut==='service'&&window.__store.get('stock-rep/'+r._id).statut==='terminee'&&ALL('compta').some(x=>x.poste==='entretien'&&x.ttc===8550));}
 click($('#dr-close'));await wait(80);
 // comptage d’un emplacement : un absent, un abîmé
 click($('#sk-cpt'));await wait(150);chg('#stk-ce','Entrepôt');await wait(100);click($('#stk-cpt-go'));await wait(400);
 {const L=$$('#main .stk-cl');ok('count started',L.length>=2,L.length);
  const a1=L[0].id.slice(7), a2=L[1].id.slice(7);
  click(L[0].querySelector('[data-v=absent]'));await wait(300);click($('#stk-cl-'+a2+' [data-v=abime]'));await wait(300);
  click($('#stk-cpt-end'));await wait(700);
  ok('count adjustments',ST(a1).statut==='manquant'&&ST(a2).statut==='maint'&&ALL('stock-cpt').some(c=>c.statut==='termine'&&c.ecarts===2),[ST(a1).statut,ST(a2).statut].join(','));}
 // rapports et export
 click($('#sk-rap'));await wait(150);
 ok('stock reports',$$('#main .kpi').length===4&&/Valeur par catégorie/.test($('#main').textContent)&&/Les plus sortis/.test($('#main').textContent));
 {const u0=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u0(n);
  click($('#skr-exp'));await wait(250);const sv=window.__saved, txt=sv&&sv.data&&sv.data.text?await sv.data.text():'';window.claude.use=u0;
  ok('inventory export',!!sv&&/pompiernote-inventaire-/.test(sv.filename)&&/Valeur actuelle/.test(txt)&&/CAS-013/.test(txt));}
 delete window.qrcode;click($('#nav-stock'));await wait(150);}
 /* ---------- Compta : menu à sections, frais des élèves, factures, dépenses, paie, budget, rapports, réglages ---------- */
 {const CE=()=>[...window.__store.entries()].filter(([k])=>k.startsWith('compta/')).map(([k,v])=>Object.assign({id:k.slice(7)},v)), setv=(id,v)=>{$(id).value=v;}, pk=(id,v)=>{const x=$(id);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));}, sub=async()=>{$('#drawer form').requestSubmit();await wait(350);};
 click(navBtn('compta'));await wait(250);
 ok('compta side menu',$('#nav-compta').classList.contains('nav-back')&&$$('#nav [data-k=cp]').length===9&&$('#cpt-dash').getAttribute('aria-current')==='page'&&!!$('#cpt-frais .nav-todo.bad')&&!!$('#cpt-fact .nav-todo.bad')&&!!$('#cpt-paie .nav-todo.bad'));
 ok('compta dashboard',$$('#main .kpi').length===4&&/\$/.test($('#cpd-rev').textContent)&&/en retard de paiement/.test($('#cpd-todo').textContent)&&/facture en retard/.test($('#cpd-todo').textContent)&&/relevés? de paie/.test($('#cpd-todo').textContent));
 click($('#cpt-frais'));await wait(150);
 ok('student fees',$$('#main tbody tr').length===52&&/En retard/.test($('#main tbody').textContent)&&!!$('#heading #ca-g'),$$('#main tbody tr').length);
 pk('#ca-e','retard');await wait(120);
 const nLate=$$('#main tbody tr').length;
 ok('late filter',nLate>3&&$$('#main tbody tr').every(r=>/En retard/.test(r.textContent)),nLate);
 {const r=$('#main tbody tr');const eid=r.dataset.id;click(r);await wait(150);
  ok('student account',/Compte de l’élève/.test($('#drawer').textContent)&&/Frais de formation/.test($('#drawer').textContent)&&!!$('#cx-mt').value);
  const mt=Math.round(parseFloat($('#cx-mt').value.replace(',','.'))*100);await sub();
  ok('fee payment',CE().some(x=>x.eleve===eid&&x.type==='rev'&&x.ttc===mt&&x.date==='2026-10-09'));
  click($('[data-act=ca-sub][data-v=red]'));await wait(100);setv('#cx-mt','100');await sub();
  ok('discount needs a reason',!CE().some(x=>x.eleve===eid&&x.type==='red'));
  setv('#cx-mt','100');setv('#cx-note','Entente de paiement');await sub();
  ok('discount',CE().some(x=>x.eleve===eid&&x.type==='red'&&x.ttc===10000));
  click($('#dr-close'));await wait(80);
  ok('paid student no longer late',$$('#main tbody tr').length===nLate-1,$$('#main tbody tr').length);}
 pk('#ca-e','');await wait(80);
 // factures : créer, envoyer, encaisser, imprimer
 click($('#cpt-fact'));await wait(150);
 ok('invoices',$$('#main tbody tr').length===3&&/En retard/.test($('#main tbody').textContent)&&/Payée/.test($('#main tbody').textContent)&&/Brouillon/.test($('#main tbody').textContent));
 click($('#ca-fact-new'));await wait(120);setv('#cf-client','Ville de Blainville');setv('[data-fl="0"][data-k=d]','Formation ARI');setv('[data-fl="0"][data-k=q]','2');setv('[data-fl="0"][data-k=p]','500');await sub();
 {const f=[...window.__store.entries()].find(([k,v])=>k.startsWith('compta-factures/')&&v.client==='Ville de Blainville');
  ok('invoice created',!!f&&f[1].num==='F-2026-004'&&f[1].statut==='brouillon'&&/F-2026-004/.test($('#drawer').textContent)&&/1\s?000,00/.test($('#drawer').textContent));
  click($('#ca-fact-send'));await wait(300);
  ok('invoice sent',window.__store.get(f[0]).statut==='envoyee'&&!!$('[data-form=ca-fact-pay]'));
  $('[data-form=ca-fact-pay]').requestSubmit();await wait(350);
  ok('invoice paid',CE().some(x=>x.facture===f[0].split('/')[1]&&x.ttc===100000)&&/Payée/.test($('#drawer').textContent));
  const p0=window.print;let got='';window.print=()=>{got=$('#print-root').innerHTML;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};
  click($('#ca-fact-pr'));await wait(500);window.print=p0;
  ok('invoice print',/Facture F-2026-004/.test(got)&&/Facturé à/.test(got)&&/Ville de Blainville/.test(got));
  click($('#dr-close'));await wait(80);}
 // une dépense
 click($('#cpt-dep'));await wait(150);
 ok('expenses',$$('#main tbody tr').length>=8&&/Réparation de l’autopompe/.test($('#main').textContent));
 click($('#ca-new-dep'));await wait(120);setv('#ce-lib','Pneus de la remorque');setv('#ce-tiers','Garage Lessard');setv('#ce-poste','entretien');setv('#ce-mt','640,00');await sub();
 ok('expense saved',CE().some(x=>x.libelle==='Pneus de la remorque'&&x.ttc===64000&&x.poste==='entretien'&&x.type==='dep'));
 // paie : approuver, puis payer (la dépense va au poste Salaires)
 click($('#cpt-paie'));await wait(150);
 {const r=$('#main tbody tr');ok('payroll',$$('#main tbody tr').length>0&&/À approuver/.test(r.textContent),$$('#main tbody tr').length);
  const t=r.id.slice(5);click(r.querySelector('[data-act=ca-paie-ok]'));await wait(350);
  const sid=[...window.__store.keys()].find(k=>k.startsWith('compta-paie/')&&k.endsWith('_'+t));
  ok('payroll approved',!!sid&&window.__store.get(sid).statut==='approuve'&&window.__store.get(sid).montant>0);
  click($('#ca-p-'+t+' [data-act=ca-paie-pay]'));await wait(400);
  ok('payroll paid',window.__store.get(sid).statut==='paye'&&CE().some(x=>x.paie===sid.split('/')[1]&&x.poste==='salaires'&&x.ttc===window.__store.get(sid).montant));}
 // budget : un poste dépassé
 click($('#cpt-budget'));await wait(150);setv('#ca-b-salaires','100,00');$('[data-form=ca-budget]').requestSubmit();await wait(350);
 ok('budget',window.__store.get('compta-reglages/ecole').budget.salaires===10000&&!!$('#cpt-budget .nav-todo.bad')&&$$('#main tbody tr').length===7);
 // rapports et export
 click($('#cpt-rap'));await wait(150);
 ok('reports',$$('#main .kpi').length===4&&/Par module/.test($('#main').textContent)&&/M\d+/.test($('#main').textContent));
 {const u0=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u0(n);
  click($('#ca-exp-ecritures'));await wait(250);const sv=window.__saved, txt=sv&&sv.data&&sv.data.text?await sv.data.text():'';window.claude.use=u0;
  ok('accounting export',!!sv&&/pompiernote-ecritures-.*\.csv/.test(sv.filename)&&/Pneus de la remorque/.test(txt)&&/Subvention/.test(txt));}
 // réglages : taxes, un nouveau tarif ; les échéances doivent faire 100 %
 click($('#cpt-regl'));await wait(150);
 $('#cr-tx').checked=true;setv('[data-tf="3"][data-k=nom]','Frais de dossier');setv('[data-tf="3"][data-k=montant]','50');setv('[data-tf="3"][data-e="0"][data-k=date]','2026-11-01');setv('[data-tf="3"][data-e="0"][data-k=pct]','60');$('[data-form=ca-regl]').requestSubmit();await wait(300);
 ok('installments must total 100 %',window.__store.get('config/ecole').tarifs.length===3);
 setv('[data-tf="3"][data-e="0"][data-k=pct]','100');$('[data-form=ca-regl]').requestSubmit();await wait(350);
 {const c=window.__store.get('compta-reglages/ecole'), t=window.__store.get('config/ecole').tarifs;ok('compta settings',c.taxes.on===true&&!c.tarifs&&t.length===4&&t[3].montant===5000&&t[3].ech[0].pct===100);}
 click($('#nav-compta'));await wait(150);}
 /* ce que chacun voit de lui-même : l’élève (équipement, compte), l’enseignant (paie) */
 {click(navBtn('stock'));await wait(150);click($('#sk-dot'));await wait(150);pick('#stk-g','c120');await wait(150);
  click($('#stk-e-el-120-01 [data-act=stk-dot]'));await wait(150);const ck=$('#drawer [data-sk-dot]');ck.checked=true;const aid=ck.dataset.skDot;$('#drawer form').requestSubmit();await wait(350);
  ok('item given with its owner',window.__store.get('stock/'+aid).aId==='el-120-01');
  click($('#nav-stock'));await wait(120);click($('[data-role=student]'));await wait(150);click(navBtn('profil'));await wait(150);pick('#pf-who','el-120-01');await wait(200);
  ok('student sees own equipment',!!$('#pf-equip')&&$('#pf-equip').textContent.includes(window.__store.get('stock/'+aid).nom)&&!!$('#pf-equip [data-act=stk-dot-pr]'));
  ok('student sees own account',!!$('#pf-compte')&&/Solde/.test($('#pf-compte').textContent)&&/Prochaine échéance/.test($('#pf-compte').textContent));
  const sl=[...window.__store.entries()].find(([k])=>k.startsWith('compta-paie/'));
  click($('[data-role=teacher]'));await wait(150);click(navBtn('profil'));await wait(150);pick('#pf-who',sl[1].ens);await wait(200);
  ok('teacher sees own pay',!!$('#pf-paie')&&/Payé/.test($('#pf-paie').textContent)&&!!$('#pf-paie [data-act=ca-slip-pr]'));
  click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);click($('#ps-acces'));await wait(120);
  $('#p-perm-equipEl').checked=false;$('#p-perm-paieEns').checked=false;$('#ps-save').closest('form').requestSubmit();await wait(350);
  click($('#nav-params'));await wait(120);click($('[data-role=student]'));await wait(150);click(navBtn('profil'));await wait(150);
  {const e=!$('#pf-equip')&&!!$('#pf-compte');click($('[data-role=teacher]'));await wait(150);click(navBtn('profil'));await wait(150);ok('what people see of themselves can be turned off',e&&!$('#pf-paie'));}
  click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);click($('#ps-acces'));await wait(120);
  $('#p-perm-equipEl').checked=true;$('#p-perm-paieEns').checked=true;$('#ps-save').closest('form').requestSubmit();await wait(350);click($('#nav-params'));await wait(120);}
 click(navBtn('calendar'));await wait(150);
 ok('calendar and school year together',$('#tab-calendar').getAttribute('aria-pressed')==='true'&&/Année scolaire/.test($('#tab-annee').textContent)&&!$('#nav-annee')&&/Calendrier/.test($('#heading h1').textContent));
 click($('#tab-annee'));await wait(150);
 ok('school year tab',$('#nav-calendar').getAttribute('aria-current')==='page'&&$('#tab-annee').getAttribute('aria-pressed')==='true'&&/Dates importantes/.test($('#main').textContent)&&!$('#hd-tools').firstElementChild);
 click(navBtn('calendar'));await wait(150);}
/* barre du titre : la barre de chaque page y monte ; affichages des listes Liste, Cartes, Compact (retenus par page) */
{const mid=e=>{const r=e.getBoundingClientRect();return r.top+r.height/2;};
 click(navBtn('classes'));await wait(150);
 ok('page toolbar in the title bar',!!$('#heading .toolbar #pp-mois')&&!$('#main > .toolbar')&&Math.abs(mid($('#heading h1'))-mid($('#heading .toolbar .btn.primary')))<8&&!$('#heading').classList.contains('hd-two'),$('#heading').className);
 click($('#vm-cards'));await wait(150);
 ok('cards view',$('#main').classList.contains('view-cards')&&getComputedStyle($('#main .cl-list')).display==='grid'&&$('#vm-cards').getAttribute('aria-pressed')==='true'&&JSON.parse(localStorage.getItem('calendrier-cours-prefs')).views.classes==='cards');
 click(navBtn('affectations'));await wait(150);
 ok('view kept per page',!$('#main').classList.contains('view-cards')&&$('#vm-list').getAttribute('aria-pressed')==='true');
 click($('#vm-cards'));await wait(150);
 {const L=$$('#main .xm-row [data-l]'), en=L.find(x=>x.dataset.l==='Enseignants'), bf=en&&getComputedStyle(en,'::before');
 ok('light cards: small labels in front of the values',!!en&&!L.some(x=>x.dataset.l==='Moment')&&bf.textTransform==='none'&&getComputedStyle(en).flexDirection==='row'&&!$('#main .xm-row .xm-t[data-l]'));}
 click($('#vm-dense'));await wait(150);
 ok('dense view',$('#main').classList.contains('view-dense')&&parseFloat(getComputedStyle($('#main .xm-row')).paddingTop)<=4,getComputedStyle($('#main .xm-row')).paddingTop);
 click($('#vm-list'));await wait(100);click(navBtn('classes'));await wait(120);click($('#vm-list'));await wait(100);
 click(navBtn('eleves'));await wait(150);
 ok('long page toolbar on a second line, never a third',$('#heading').classList.contains('hd-two')&&mid($('#heading .toolbar #s-q'))>mid($('#heading #tab-eleves'))+10&&$$('#heading .toolbar>*').every(x=>Math.abs(mid(x)-mid($('#heading #s-q')))<10)&&document.documentElement.scrollWidth<=innerWidth,$('#heading').className+' '+$$('#heading .toolbar>*').map(x=>Math.round(mid(x))).join(','));}
/* cartes des élèves : compactes, capitaine en rouge foncé, lieutenants en bleu marine */
{click(navBtn('eleves'));await wait(150);click($('#vm-cards'));await wait(150);
 const cap=$('#main tr[data-fn=cap]'), lt=$('#main tr[data-fn=lt]'), plain=$('#main tbody tr:not([data-fn])');
 ok('student cards by role',!!cap&&!!lt&&!!plain&&getComputedStyle(cap).backgroundColor==='rgb(159, 45, 53)'&&getComputedStyle(lt).backgroundColor==='rgb(30, 58, 95)'&&getComputedStyle(plain).backgroundColor==='rgb(255, 255, 255)'&&getComputedStyle(cap.querySelector('.link')).color==='rgb(255, 255, 255)');
 ok('compact student cards',getComputedStyle(plain.querySelector('.tb-tel')).display==='none'&&$$('#main tbody tr').every(r=>[...r.querySelectorAll('.tb-n.zero')].every(z=>getComputedStyle(z.closest('td')).display==='none'))&&cap.getBoundingClientRect().height<110,Math.round(cap.getBoundingClientRect().height));
 click($('#vm-list'));await wait(120);
 ok('role chips coloured in the list',!!$('#main .role-chip.rc-cap')&&getComputedStyle($('#main .role-chip.rc-lt')).backgroundColor==='rgb(30, 58, 95)');}
/* élèves : filtres (grade, notes) et tris (nom, grade, notes) */
{const pk=(id,v)=>{const x=$(id);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));}, rows=()=>$$('#main tbody tr[data-id]'), name=r=>r.querySelector('.link').textContent, note=r=>{const m=/(\d+) %/.exec(r.querySelector('td[data-l=Note]').textContent);return m?+m[1]:null;};
 click(navBtn('eleves'));await wait(150);
 ok('student filters and sorts',!!$('#heading #s-ff')&&!!$('#heading #s-so')&&$$('#main thead th').some(h=>h.textContent==='Note'));
 pk('#s-ff','g0');await wait(120);
 ok('filter captains',rows().length===5&&rows().every(r=>r.dataset.fn==='cap'),rows().length);
 pk('#s-ff','');pk('#s-so','nom');await wait(120);
 {const fam=rows().map(r=>name(r).split(' ').slice(1).join(' '));ok('sort by family name',fam.every((x,i)=>!i||fam[i-1].localeCompare(x,'fr',{sensitivity:'base'})<=0),fam.slice(0,4).join(', '));}
 pk('#s-so','grade');await wait(120);
 ok('sort by grade',rows().slice(0,5).every(r=>r.dataset.fn==='cap')&&rows()[5].dataset.fn==='lt'&&!rows()[rows().length-1].dataset.fn);
 pk('#s-so','note-d');await wait(120);
 {const ns=rows().map(note).filter(x=>x!=null);ok('sort by best marks',ns.length>10&&ns.every((x,i)=>!i||ns[i-1]>=x),ns.slice(0,5).join(','));}
 pk('#s-ff','sous');await wait(120);
 ok('filter marks under the pass mark',rows().every(r=>note(r)!=null&&note(r)<60),rows().length);
 pk('#s-ff','');pk('#s-so','num');await wait(100);}
/* paramètres : douze sections ; chaque réglage agit sur le site */
{const C=()=>window.__store.get('config/ecole'), save=async()=>{$('#ps-save').closest('form').requestSubmit();await wait(350);}, tab=async k=>{click($('#ps-'+k));await wait(120);}, setv=(id,v)=>{$(id).value=v;}, check=(id,on)=>{$(id).checked=on;};
 click($('#nav-params'));await wait(150);
 ok('settings sections in the side menu',$$('#nav [data-k=ps]').length===12&&$('#ps-ecole').getAttribute('aria-current')==='page'&&!$('#nav-calendar')&&$('#nav-params').classList.contains('nav-back')&&!!$('#p-nom')&&!!$('#p-court')&&!!$('#p-web'));
 setv('#p-court','Académie');setv('#p-resp','Julie Gagnon, directrice');setv('#p-web','https://academie.example');await save();
 ok('school identity saved',C().nomCourt==='Académie'&&C().resp==='Julie Gagnon, directrice'&&C().web==='https://academie.example'&&$('#brand-text small').textContent==='Académie',$('#brand-text small').textContent);
 setv('#p-court','');await save();
 // horaire : heures des moments, avec retour aux heures par défaut ; corvées de ménage
 await tab('horaire');
 setv('#p-pm-d','10:00');await save();
 ok('times must follow each other',!C().moments&&$$('.toast').some(t=>/doivent se suivre/.test(t.textContent)),JSON.stringify(C().moments)+' | '+$$('.toast').map(t=>t.textContent).join(' / '));
 setv('#p-pm-d','13:00');setv('#p-pm-f','16:00');await save();
 ok('times of day saved',C().moments&&C().moments.pm.debut==='13:00'&&/de 08 h 00 à 16 h 00/.test($('#p-jour').textContent)&&!!$('#p-mom-reset'),$('#p-jour').textContent);
 click($('#p-mom-reset'));await wait(350);
 ok('default times back',!C().moments&&/de 08 h 00 à 15 h 00/.test($('#p-jour').textContent)&&$('#p-pm-d').value==='12:00'&&$('#p-pm-f').value==='15:00',$('#p-pm-d').value+' '+$('#p-pm-f').value);
 check('#p-menage',false);await save();
 click(navBtn('calendar'));await wait(150);
 ok('chores can be turned off',C().menage===false&&!/Corvée de ménage/.test($('#main .week').textContent));
 click($('#nav-params'));await wait(120);await tab('horaire');check('#p-menage',true);await save();
 // résultats et présences : seuils des couleurs, notes visibles par les élèves
 await tab('resultats');setv('#p-pres-ok','100');setv('#p-pres-warn','99');await save();
 click(navBtn('classes'));await wait(150);
 ok('attendance colour thresholds',C().presOk===100&&!$('#main .cl-rate.ok')&&!!$('#main .cl-rate.bad'),$$('#main .cl-rate').map(x=>x.className).join(' | '));
 click($('#nav-params'));await wait(120);await tab('resultats');setv('#p-pres-ok','95');setv('#p-pres-warn','90');check('#p-notes-el',false);await save();
 click($('[data-role=student]'));await wait(150);click(navBtn('examens'));await wait(150);
 ok('students can stop seeing marks',C().notesEleves===false&&!/\d %/.test($('#main').textContent));
 click($('[data-role=admin]'));await wait(150);click($('#nav-params'));await wait(120);await tab('resultats');check('#p-notes-el',true);await save();
 // menu et affichage : couleur, affichage par défaut, entrées masquées
 await tab('menu');click($('#p-col-vert'));setv('#p-vue','cards');check('#p-menu-historique',false);check('#p-menu-modules',false);check('#p-menu-stock',false);check('#p-menu-compta',false);await save();
 ok('main colour',getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase()==='#15803D'&&C().couleur==='vert');
 click($('#nav-params'));await wait(150);
 ok('menu entries hidden',!$('#nav-historique')&&!$('#nav-modules')&&!$('#nav-stock')&&!$('#nav-compta')&&!/Ressources/.test($('#nav').textContent)&&/Administration/.test($('#nav').textContent)&&!!$('#nav-params'),$('#nav').textContent.replace(/\s+/g,' ').slice(0,200));
 click(navBtn('affectations'));await wait(150);
 ok('default list display',$('#main').classList.contains('view-cards')||JSON.parse(localStorage.getItem('calendrier-cours-prefs')).views.affectations!==undefined);
 click($('#nav-params'));await wait(120);await tab('menu');click($('#p-col-rouge'));setv('#p-vue','list');['historique','modules','stock','compta'].forEach(k=>check('#p-menu-'+k,true));await save();
 click($('#nav-params'));await wait(150);
 ok('menu back',!!$('#nav-historique')&&!!$('#nav-modules')&&getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase()==='#C62F2A');
 click($('#nav-params'));await wait(150);
 // notifications
 await tab('notifs');check('#p-nf-remp',false);check('#p-nf-cand',false);await save();
 click($('#nf-bell'));await wait(120);
 {const t=$$('#drawer .nf-row').map(r=>r.textContent);ok('notifications can be turned off',C().notifs.remp===false&&!t.some(x=>/Remplacement demandé|Nouvelle candidature/.test(x)),t.length);}
 click($('#dr-close'));await wait(80);await tab('notifs');check('#p-nf-remp',true);check('#p-nf-cand',true);await save();
 // comptes et données
 await tab('acces');
 ok('accounts section',/Qui voit quoi/.test($('#main').textContent)&&!!$('#p-comptes'));
 click(navBtn('classes'));await wait(150);click($('#nav-params'));await wait(150);
 ok('side menu swaps to sections',!$('#nav-classes')&&$('#ps-ecole').getAttribute('aria-current')==='page');
 click($('#nav-params'));await wait(150);
 ok('settings entry brings the menu back',!!$('#nav-classes')&&!$('#ps-ecole')&&$('#nav-classes').getAttribute('aria-current')==='page'&&!!$('#main .cl-rate'));
 click($('#nav-params'));await wait(150);
 await tab('donnees');
 const u0=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u0(n);
 click($('#p-exp-el'));await wait(200);
 {const sv=window.__saved, txt=sv&&sv.data&&sv.data.text?await sv.data.text():'';ok('students export',!!sv&&/pompiernote-eleves-.*\.csv/.test(sv.filename)&&/Alexandre Beaulieu/.test(txt)&&/Classe 119/.test(txt),sv&&sv.filename);}
 click($('#p-exp-json'));await wait(200);
 {const sv=window.__saved, txt=sv&&sv.data&&sv.data.text?await sv.data.text():'';let j=null;try{j=JSON.parse(txt);}catch(e){}ok('full data export',!!j&&j.site==='PompierNote'&&j.eleves.length===52&&j.groupes.length===5&&!!j.config,sv&&sv.filename);}
 window.claude.use=u0;
 // la page prend toute la largeur : les cartes d’une section se placent côte à côte
 await tab('resultats');
 {const cs=$$('.ps-card').map(x=>x.getBoundingClientRect());ok('settings use the whole width',cs.length===3&&Math.abs(cs[0].top-cs[1].top)<2&&$('.ps-body').getBoundingClientRect().right>$('#main').getBoundingClientRect().right-4,cs.map(r=>Math.round(r.left)+'/'+Math.round(r.top)).join(' '));}
 // annonces : section à part, modèles, aperçu, public, masquer, cloche, classe précise, programmée, terminée, brouillon
 {const A=()=>C().annonces||[], pk=(id,v)=>{const x=$(id);x.value=v;x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));}, an=t=>A().find(x=>t.test(x.titre||'')), box=a=>a&&$('#ann-'+a.id);
 await tab('annonces');
 ok('announcements section',/Aucune annonce pour l’instant/.test($('#main').textContent)&&!!$('#an-new')&&!$('#ps-annonces .nav-todo'));
 click($('#an-new'));await wait(120);
 $('[data-form=an-save]').requestSubmit();await wait(150);
 ok('announcement needs a message',!A().length&&!!$('[data-form=an-save]'));
 pk('#an-modele','evac');await wait(60);
 ok('announcement template',/évacuation/i.test($('#an-titre').value)&&/\[jour\]/.test($('#an-texte').value)&&$('[name=an-niv]:checked').value==='warn');
 setv('#an-texte','Exercice d’évacuation jeudi à 10 h. Détails : https://exemple.ca/evac');pk('#an-pub','teacher');await wait(60);
 ok('announcement preview',/Exercice d’évacuation jeudi/.test($('#an-prev').textContent)&&!!$('#an-prev a[href="https://exemple.ca/evac"]')&&$('#an-prev .notice').classList.contains('warn')&&$('#an-cls-box').hidden);
 $('[data-form=an-save]').requestSubmit();await wait(350);
 const a1=()=>an(/évacuation/i);
 ok('announcement published',A().length===1&&a1().pub==='teacher'&&a1().niv==='warn'&&a1().actif&&!$('[data-form=an-save]')&&$$('.an-row').length===1&&/En cours/.test($('.an-row').textContent),JSON.stringify(A()[0]||{}).slice(0,160));
 ok('announcement for admin',!!box(a1())&&box(a1()).classList.contains('warn')&&/Les enseignants/.test(box(a1()).textContent)&&!!box(a1()).querySelector('a[href="https://exemple.ca/evac"]'));
 ok('settings menu counts announcements',($('#ps-annonces .nav-todo')||{}).textContent==='1');
 click($('#demo-hide'));await wait(150);
 ok('announcement stays when the demo bar is hidden',$('#demo').classList.contains('is-hidden')&&box(a1()).getBoundingClientRect().height>20&&!box(a1()).closest('[inert]'));
 click($('#demo-show'));await wait(150);
 click($('[data-role=teacher]'));await wait(150);
 {const t=!!box(a1());click($('[data-role=student]'));await wait(150);ok('announcement for the chosen people',t&&!box(a1()));}
 // la personne la masque ; elle reste dans la cloche, qui la fait réapparaître
 click($('[data-role=teacher]'));await wait(150);
 click(box(a1()).querySelector('[data-act=an-hide]'));await wait(120);
 ok('announcement can be hidden',!box(a1())&&JSON.parse(localStorage.getItem('calendrier-cours-prefs')).annVu.length===1);
 click($('#nf-bell'));await wait(120);
 {const r=$$('#drawer .nf-row').find(x=>/Annonce/.test(x.textContent)&&/évacuation/i.test(x.textContent));ok('announcement in the bell',!!r);if(r){click(r);await wait(200);}}
 ok('bell brings the announcement back',!!box(a1()));
 // une classe précise, urgente : on ne peut pas la masquer
 click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);await tab('annonces');
 click($('#an-new'));await wait(120);
 setv('#an-titre','Classe 119 : local changé');setv('#an-texte','La séance de demain se donne au gymnase.');pk('#an-pub','classes');await wait(60);
 ok('class picker shows for classes',!$('#an-cls-box').hidden&&$$('[data-an-cl]').length===5);
 $('[data-form=an-save]').requestSubmit();await wait(150);
 ok('class announcement needs a class',!an(/local changé/));
 $('#an-cl-c119').checked=true;click($('#an-niv-urgent'));$('[data-form=an-save]').requestSubmit();await wait(350);
 const a2=()=>an(/local changé/);
 ok('announcement for one class',!!a2()&&JSON.stringify(a2().classes)==='["c119"]'&&a2().niv==='urgent'&&/Élèves de Classe 119/.test($('#main').textContent));
 ok('urgent first',$$('#annonces .notice.ann')[0].id==='ann-'+a2().id&&!!box(a2()).querySelector('.ann-u'));
 click($('[data-role=student]'));await wait(150);pick('#sel-group','c119');await wait(150);
 {const in119=!!box(a2())&&!box(a2()).querySelector('[data-act=an-hide]');pick('#sel-group','c120');await wait(150);ok('class announcement for its students only',in119&&!box(a2()));}
 // programmée : pas encore en haut des pages
 click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);await tab('annonces');
 click($('#an-r-'+a2().id+' [data-act=an-edit]'));await wait(120);
 ok('edit keeps the values',$('#an-titre').value==='Classe 119 : local changé'&&$('#an-pub').value==='classes'&&$('#an-cl-c119').checked&&$('#an-niv-urgent').checked);
 setv('#an-du','2026-10-12');$('[data-form=an-save]').requestSubmit();await wait(350);
 ok('scheduled announcement',/Programmée/.test($('#an-r-'+a2().id).textContent)&&!box(a2())&&($('#ps-annonces .nav-todo')||{}).textContent==='1');
 click($('#an-r-'+a2().id+' [data-act=an-now]'));await wait(350);
 ok('publish now',a2().du==='2026-10-09'&&!!box(a2()));
 // terminer, dupliquer en brouillon, filtrer, supprimer
 click($('#an-r-'+a2().id+' [data-act=an-end]'));await wait(350);
 ok('end an announcement',/Terminée/.test($('#an-r-'+a2().id).textContent)&&!box(a2()));
 click($('#an-r-'+a1().id+' [data-act=an-dup]'));await wait(120);
 ok('duplicate opens a copy',/\(copie\)/.test($('#an-titre').value)&&$('#an-pub').value==='teacher');
 click($('#an-draft'));await wait(350);
 const a3=()=>an(/\(copie\)/);
 ok('draft saved',!!a3()&&!a3().actif&&!box(a3())&&/Brouillon/.test($('#an-r-'+a3().id).textContent));
 click($('#an-f-brouillon'));await wait(100);
 ok('filter announcements',$$('.an-row').length===1&&!!$('#an-r-'+a3().id));
 click($('#an-f-tout'));await wait(100);
 click($('#an-r-'+a3().id+' [data-k=andel]'));await wait(100);click($('#an-r-'+a3().id+' [data-act=an-del]'));await wait(350);
 ok('delete an announcement',!a3()&&A().length===2);
 // plus de deux : les autres se déplient
 click($('#an-r-'+a2().id+' [data-act=an-again]'));await wait(350);
 click($('#an-new'));await wait(120);setv('#an-texte','Troisième annonce.');$('[data-form=an-save]').requestSubmit();await wait(350);
 if($('#ann-more')&&/Réduire/.test($('#ann-more').textContent)){click($('#ann-more'));await wait(100);}
 ok('more than two fold',$$('#annonces .notice.ann').length===2&&/Voir 1 autre annonce/.test($('#ann-more').textContent));
 click($('#ann-more'));await wait(100);
 ok('unfold announcements',$$('#annonces .notice.ann').length===3);
 // banner Modifier opens the editor
 click($('#nav-params'));await wait(150);
 click(box(a1()).querySelector('[data-act=an-edit]'));await wait(150);
 ok('edit from the banner',!!$('[data-form=an-save]')&&$('#an-titre').value===a1().titre&&$('#ps-annonces').getAttribute('aria-current')==='page');
 click($('[data-act=an-cancel]'));await wait(80);
 for(const x of A().map(y=>y.id)){click($('#an-r-'+x+' [data-k=andel]'));await wait(80);click($('#an-r-'+x+' [data-act=an-del]'));await wait(300);}
 ok('announcements cleared',!A().length&&!$('#annonces .notice'));}
 // horaire : séances proposées aux enseignants, vue du calendrier
 await tab('horaire');setv('#p-horizon','3');await save();
 ok('horizon must be 7 to 365 days',C().horizon!==3,JSON.stringify(C().horizon)+' '+$$('.toast').map(t=>t.textContent).join('/'));
 setv('#p-horizon','60');setv('#p-vuecal','jour');await save();
 ok('horizon and calendar view saved',C().horizon===60&&C().vueCal==='jour'&&$('#p-horizon').value==='60');
 setv('#p-horizon','150');setv('#p-vuecal','semaine');await save();
 // présences : les retards peuvent faire baisser le taux
 await tab('resultats');check('#p-retard',false);await save();
 ok('lates can lower the rate',C().retardPresent===false);
 check('#p-retard',true);await save();
 // élèves : un grade de plus, avec sa couleur
 await tab('eleves');
 ok('grades editor',$$('[data-grade]').length===8&&$('#p-grade-0').value==='Capitaine'&&$('#p-grade-c-1').value==='lt');
 setv('#p-grade-3','capitaine');await save();
 ok('grade names are unique',C().grades===undefined||C().grades.length===3);
 setv('#p-grade-3','Sergent');setv('#p-grade-c-3','vert');await save();
 click(navBtn('eleves'));await wait(150);
 ok('new grade in the filters',C().grades.length===4&&C().grades[3].c==='vert'&&$$('#s-ff option').some(o=>o.textContent==='Sergent'&&o.value==='g3'));
 click(navBtn('params'));await wait(150);await tab('eleves');setv('#p-grade-3','');await save();
 ok('grade removed',C().grades.length===3&&$('#p-grade-3').value==='');
 // personnel : les fonctions proposées
 await tab('personnel');setv('#p-fonctions','Enseignant\nInstructeur\n\ninstructeur\nChef aux opérations');await save();
 ok('staff functions saved',JSON.stringify(C().fonctions)===JSON.stringify(['Enseignant','Instructeur','Chef aux opérations'])&&/Chef aux opérations/.test($('#p-fonctions').value)&&!!$('#p-fn-reset'));
 click($('#p-fn-reset'));await wait(350);
 ok('default staff functions back',C().fonctions===undefined&&/Secrétariat/.test($('#p-fonctions').value),JSON.stringify(C().fonctions)+' | '+$('#p-fonctions').value.split('\n').join(','));
 // droits : les enseignants ne postulent plus, l’administration attribue
 await tab('acces');
 ok('teacher rights',$$('[data-perm]').length===8&&$('#p-perm-cand').checked&&!$('#p-perm-auto').checked);
 click($('[data-role=teacher]'));await wait(150);click(navBtn('mescours'));await wait(200);
 const t0=$('#sel-teacher').value;let nOpen=0;
 for(const o of $$('#sel-teacher option')){pick('#sel-teacher',o.value);await wait(150);nOpen=$$('[data-act=af-apply]').length;if(nOpen)break;}
 click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);await tab('acces');check('#p-perm-cand',false);await save();
 click($('[data-role=teacher]'));await wait(150);click(navBtn('mescours'));await wait(200);
 ok('teachers can be kept from applying',nOpen>0&&!$('[data-act=af-apply]')&&/Attribuée par l’administration/.test($('#main').textContent),nOpen);
 pick('#sel-teacher',t0);await wait(120);
 click($('[data-role=admin]'));await wait(150);click(navBtn('params'));await wait(150);await tab('acces');check('#p-perm-cand',true);await save();
 // menu : renommer une entrée, couleur libre
 await tab('menu');setv('#p-mnom-classes','Groupes');click($('#p-col-perso'));setv('#p-col-hex','#0f766e');await save();
 click($('#nav-params'));await wait(150);
 ok('menu entry renamed',$('#nav-classes').textContent.trim()==='Groupes'&&C().menuNoms.classes==='Groupes');
 click(navBtn('classes'));await wait(150);
 ok('page title follows the menu name',$('#heading h1').textContent.trim()==='Groupes');
 ok('free main colour',getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase()==='#0F766E'&&C().couleurPerso==='#0F766E');
 // impression : coordonnées, date, mention, signature
 click($('#nav-params'));await wait(150);await tab('impression');
 check('#p-imp-coord',false);check('#p-imp-date',true);setv('#p-pied','Document interne');setv('#p-sign','Signature de la direction');await save();
 click(navBtn('eleves'));await wait(150);click($$('#main tbody .link').find(x=>/Camille/.test(x.textContent)));await wait(120);click($('#fi-tab-examens'));await wait(120);
 {const p0=window.print;let got='';window.print=()=>{got=$('#print-root').innerHTML;window.dispatchEvent(new Event('beforeprint'));window.dispatchEvent(new Event('afterprint'));};
  const b=$('#pr-releve');if(b){click(b);await wait(500);}window.print=p0;
  const txt=got.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  ok('print header settings',!!b&&C().pied==='Document interne'&&/Imprimé le/.test(txt)&&!/Julie Gagnon/.test(txt)&&/Document interne/.test(txt)&&/class="pr-sign">Signature de la direction/.test(got),txt.slice(0,240));}
 click(navBtn('params'));await wait(150);
 // données : l’horaire de l’année en CSV ; remise des réglages par défaut
 await tab('donnees');
 {const u1=window.claude.use;window.__saved=null;window.claude.use=async n=>n==='downloads'?{save:async o=>{window.__saved=o;}}:u1(n);
  click($('#p-exp-seances'));await wait(250);
  const sv=window.__saved, txt=sv&&sv.data&&sv.data.text?await sv.data.text():'';window.claude.use=u1;
  ok('schedule export',!!sv&&/pompiernote-horaire-.*\.csv/.test(sv.filename)&&/Date.+Début.+Fin.+Moment.+Classe/.test(txt)&&txt.split('\n').length>100&&/Classe 119/.test(txt),sv&&sv.filename);}
 click($('#p-reset'));await wait(120);
 ok('reset asks first',!!$('#p-reset-go')&&C().menuNoms.classes==='Groupes');
 click($('#p-reset-go'));await wait(350);
 ok('settings back to default',C().menuNoms===undefined&&C().couleur===undefined&&C().impDate===undefined&&C().pied===undefined&&C().nomCourt===''&&getComputedStyle(document.documentElement).getPropertyValue('--accent').trim().toUpperCase()==='#C62F2A'&&!$('#p-reset-go'));
 click($('#nav-params'));await wait(150);
 ok('menu names back',$('#nav-classes').textContent.trim()==='Classes');}
/* clôture de l’année : tout est archivé, la nouvelle année commence, l’ancienne se consulte en lecture seule */
{const C=()=>window.__store.get('config/ecole'), n=pre=>[...window.__store.keys()].filter(k=>k.startsWith(pre+'/')).length;
 const nEl=n('eleves'), nPres=n('presences'), nEns=n('enseignants');
 click(navBtn('params'));await wait(150);click($('#ps-annee'));await wait(150);
 ok('close year form',!!$('[data-form=p-close]')&&$('#p-ny-nom').value==='2027–2028'&&$('#p-ny-debut').value==='2027-08-10'&&$('#p-ny-fin').value==='2028-06-15'&&/Aucune année archivée/.test($('#p-archives').textContent));
 $('#p-ny-nom').value='2026–2027';$('[data-form=p-close]').requestSubmit();await wait(120);
 ok('new year needs another name',!$('#p-close-ask'));
 $('#p-ny-nom').value='2027–2028';$('[data-form=p-close]').requestSubmit();await wait(120);
 ok('close year asks first',!!$('#p-close-ask')&&/Clôturer 2026–2027 et commencer 2027–2028/.test($('#p-close-ask').textContent)&&/n’est pas terminée/.test($('#p-close-ask').textContent)&&n('archives')===0);
 click($('#p-close-go'));
 for(let k=0;k<80&&C().annee!=='2027–2028';k++) await wait(250);
 await wait(600);
 const A=[...window.__store.keys()].filter(k=>k.startsWith('archives/')), meta=A.length?window.__store.get(A[0]):null;
 ok('year archived',A.length===1&&meta.nom==='2026–2027'&&meta.compte.eleves===nEl&&meta.compte.presences===nPres&&meta.compte.seances>100&&n('archives-parts')===meta.parts&&meta.parts>=3,JSON.stringify(meta&&meta.compte)+' '+(meta&&meta.parts));
 ok('new year started',C().annee==='2027–2028'&&C().debut==='2027-08-10'&&!C().conges.length&&n('cours')===0&&n('presences')===0&&n('eleves')===0&&n('groupes')===0&&n('resultats-eleves')===0&&n('enseignants')===nEns&&C().competences.length===25,[n('cours'),n('presences'),n('eleves')].join(','));
 ok('archive listed',$$('#p-archives .ps-arow').length===1&&/2026–2027/.test($('#p-archives').textContent)&&/52 élèves/.test($('#p-archives').textContent));
 // consulter l’archive : tout le site, en lecture seule
 click($('#p-archives [data-act=arch-open]'));await wait(400);
 ok('archive opens on the calendar',!!$('#arch-bar')&&/Archive · 2026–2027/.test($('#arch-bar').textContent)&&$$('#main .cc').length>5,$$('#main .cc').length);
 click(navBtn('eleves'));await wait(200);
 ok('archived students',$$('#main tbody tr[data-id]').length===52,$$('#main tbody tr[data-id]').length);
 click($('#main tbody tr[data-id]'));await wait(150);
 ok('archived student file',!!$('#fi-name')&&$$('.fh-stats>div').length===4);
 click(navBtn('params'));await wait(150);click($('#ps-annee'));await wait(150);
 ok('archive is read-only',$('#p-annee').disabled&&!$('[data-form=p-close]')&&/Consultée/.test($('#p-archives').textContent)&&n('archives')===1);
 click($('#arch-exit'));await wait(300);
 ok('back to the current year',!$('#arch-bar')&&$('#p-annee').value==='2027–2028'&&!$('#p-annee').disabled&&!!$('[data-form=p-close]'));
 click(navBtn('eleves'));await wait(150);
 ok('current year has no students',!$$('#main tbody tr[data-id]').length);}
click(navBtn('calendar'));await wait(120);
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
