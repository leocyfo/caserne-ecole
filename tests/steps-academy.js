(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const S_page=()=>($('#nav [aria-current=page]')||{}).dataset?$('#nav [aria-current=page]').dataset.page:'';
const click=el=>{if(!el)throw new Error('missing element');el.click();};
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
ok('move dialog no weekly',!!$('#drawer.dialog')&&!$('input[name=mv-scope][value=weekly]'));
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
/* SIDE */
document.head.insertAdjacentHTML('beforeend','<style id="no-tr">.app{transition:none!important}</style>');
click($('#side-toggle'));await wait(400);
ok('side collapsed',$('.app').classList.contains('side-mini')&&$('.sidebar').getBoundingClientRect().width<=80&&$('#side-toggle').getAttribute('aria-expanded')==='false',Math.round($('.sidebar').getBoundingClientRect().width));
ok('nav labels hidden but named',getComputedStyle($('#nav-classes span')).position==='absolute'&&$('#nav-classes').title==='Classes'&&$('#nav-classes').textContent.includes('Classes'));
click($('#nav-classes'));await wait(60);
ok('nav works collapsed',/Classes/.test($('#heading').textContent)&&$('.app').classList.contains('side-mini'));
click($('#nav-calendar'));await wait(60);
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
click($('#nav-calendar'));await wait(60);
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
click($('#nav-classes'));await wait(50);
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
click($('#nav-eleves'));await wait(80);
ok('52 students',$$('#main tbody tr').length===52&&/Téléphone/.test($('#main thead').textContent)&&!/Parent/.test($('#main thead').textContent)&&$$('#main tbody tr').slice(0,3).map(r=>r.querySelector('.st-num').textContent).join(',')==='1,2,3');
ok('captain chip',$$('#main .role-chip').some(x=>x.textContent==='Capitaine'));
{const tr=$('#main tr.row-link[data-id="el-119-08"]');click(tr&&tr.children[4]);}await wait(80);
ok('row click opens fiche',/Juliette Lavoie/.test(($('#fi-name')||{}).textContent||''));
click($('#fi-back'));await wait(80);
window.scrollTo(0,300);await wait(30);const listY=window.scrollY;
click($$('#main tbody .link').find(x=>/Camille/.test(x.textContent)));await wait(80);
ok('student fiche',/Camille Bergeron/.test($('#fi-name').textContent)&&/Lieutenant 1/.test($('.fiche-head').textContent)&&/Cravate oubliée/.test($('#main').textContent)&&$$('.fiche-list .fl-item').length===52);
ok('fiche simple',$$('.fiche-tabs button').length===3&&$('#fi-tab-dossier').getAttribute('aria-pressed')==='true'&&$$('.fh-stats>div').length===4&&$$('.fiche-body .panel').length===1&&!/Semaine de la classe/.test($('#main').textContent));
click($('#fi-tab-presences'));await wait(80);
ok('tab presences',/Absences et retards/.test($('.fiche-body').textContent)&&/Par module/.test($('.fiche-body').textContent)&&!/Parent ou tuteur/.test($('.fiche-body').textContent));
click($('#fi-tab-examens'));await wait(80);
ok('tab examens',/Résultats/.test($('.fiche-body').textContent)&&/À venir/.test($('.fiche-body').textContent)&&/de réussite/.test($('.fiche-body .summary').textContent));
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
click($('#nav-personnel'));await wait(80);
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
click($('#fc-all'));await wait(60);click($('#fm-g'));await wait(60);
click($('#nav-eleves'));await wait(80);
// examens
click($('#nav-examens'));await wait(60);
ok('exams list',$$('#main [data-act=sess-at]').length>0,($('#main .summary')||{}).textContent);
click($('#main [data-act=sess-at]'));await wait(50);
ok('session exam opens day window',!!$('#af-box')&&!$('#c-form'));
click($('#dr-close'));await wait(30);
ok('exam tiles',$$('.xm-tile').length===4&&$('#xt-up').getAttribute('aria-pressed')==='true'&&!!$('.xm-hd'));
pick0('#x-g','c119');await wait(100);
click($('#xt-todo'));await wait(60);
{const n=$$('#main [data-act=x-open]').length;ok('results to enter',n>=1&&/[1-9]/.test($('#xt-todo b').textContent),n);}
click($('#main [data-act=x-open]'));await wait(80);
ok('results drawer',/Résultats de l’examen/.test($('#drawer').textContent)&&$$('#drawer [data-act=x-res]').length===36,$$('#drawer [data-act=x-res]').length);
click($('[data-act=x-res-all]'));await wait(30);
$('#x-form').requestSubmit();await wait(250);
{const full=[...window.__store.keys()].filter(k=>k.startsWith('resultats/sx-')&&window.__store.get(k).groupe==='c119'&&Object.keys(window.__store.get(k).resultats||{}).length===12);ok('session results saved apart',full.length>=9&&![...window.__store.keys()].some(k=>k.startsWith('examens/sx-')),full.length);
 const own=[...window.__store.entries()].filter(([k,v])=>k.startsWith('resultats-eleves/')&&v.eleve==='el-119-01');ok('student result docs',own.length>=9&&own.every(([k,v])=>v.examen&&v.v),own.length);}
click($('#xt-reps'));await wait(60);
{const n=$$('#main [data-act=x-rep]').length;ok('reprises list',n>=4,n);
 const b=$('#main [data-act=x-rep]'),key=b.dataset.key,el=b.dataset.el;click(b);await wait(250);
 const rid='sx-'+key.replace(/[^A-Za-z0-9_-]/g,'-'), doc=window.__store.get('resultats/'+rid), own=window.__store.get('resultats-eleves/'+(el+'__'+rid).replace(/[^A-Za-z0-9_-]/g,'-'));
 ok('reprise marked',$$('#main [data-act=x-rep]').length===n-1&&!!doc&&doc.resultats[el]==='reprise'&&!!own&&own.v==='reprise',$$('#main [data-act=x-rep]').length+' / '+n);}
click($('#xt-done'));await wait(60);
ok('results list',$$('#main .xm-done.xm-row').length>=8&&/%/.test($('#xt-done b').textContent),$$('#main .xm-done.xm-row').length);
click($('#xv-grille'));await wait(80);
ok('exam grid view',!!$('.xg')&&$$('.xg tbody tr').length===12&&!$('.xm-tile')&&$('#x-g').value==='c119');
click($('#xv-board'));await wait(40);
// ---- affectation des enseignants : parcours complet (requis → compétences → disponibilité → candidature → approbation → remplacement) ----
const DBX=await window.claude.use('db');
const SK=k=>[...window.__store.keys()].filter(x=>x.startsWith(k+'/'));
const pick=(sel,v)=>{const x=$(sel);x.value=v;x.dispatchEvent(new Event('change',{bubbles:true}));};
click($('#nav-affectations'));await wait(150);
ok('aff page',$$('.xm-tile').length===4&&!!$('#at-open')&&!!$('#af-hz')&&$('#at-open').getAttribute('aria-pressed')==='true');
pick('#af-hz','90');await wait(150);
// un chargé de cours par module : personne n’est dans deux modules au même moment
ok('no clash with one course leader per module',!/conflit/i.test($('#at-open').textContent)&&!$$('#main .xm-row .chip.bad').some(c=>c.textContent==='Conflit'),$('#at-open').textContent.replace(/\s+/g,' '));
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
click($('#nav-affectations'));await wait(150);pick('#af-hz','90');await wait(150);pick('#x-g','c119');await wait(150);
click($('#at-open'));await wait(100);
ok('open list has it',!!$('#main .xm-row[data-key="'+AK+'"]')&&/1 à combler/.test($('#main .xm-row[data-key="'+AK+'"]').textContent));
click($('#nav-personnel'));await wait(80);
click($('[data-act=staff][data-id=e-vtremblay]'));await wait(100);
click($('#fi-tab-competences'));await wait(100);
ok('competences tab',$$('[data-form=sf-comp] input[name=comp]').length===25&&$$('[data-form=sf-comp] input:checked').length===8&&!!$('.dp-grid'),$$('[data-form=sf-comp] input:checked').length);
click($('[data-act=sf-comp-all][data-v="1"]'));await wait(30);
$('[data-form=sf-comp]').requestSubmit();await wait(300);
ok('competences saved',window.__store.get('enseignants/e-vtremblay').competences.length===25);
click($('[data-role=teacher]'));await wait(120);
pick('#sel-teacher','e-vtremblay');await wait(120);
ok('teacher nav 6',$$('#nav button').length===6&&!!$('#nav-mescours')&&!!$('#nav-dispos'));
click($('#nav-dispos'));await wait(120);
ok('dispo calendar',!!$('.dp-grid')&&$$('.dp-c').length>=20&&$('#dp-save').disabled&&$$('.dp-wd').length===5);
for(let i=0;i<12&&!$('#dp-'+AD);i++){click($('#dp-next'));await wait(50);}
for(let i=0;i<4&&!$('#dp-'+AD).classList.contains('v-J');i++){click($('#dp-'+AD));await wait(50);}
ok('dispo day set',$('#dp-'+AD).classList.contains('v-J')&&/Toute la journée/.test($('#dp-'+AD).textContent));
if(!$('#dp-save').disabled){click($('#dp-save'));await wait(300);}
ok('dispo saved',window.__store.get('disponibilites/e-vtremblay').jours[AD]==='J'&&$('#dp-save').disabled);
click($('#nav-mescours'));await wait(200);
ok('my courses page',$$('.xm-tile').length===4&&/M1, M2/.test($('#main .summary').textContent)&&!!$('#go-dispos'));
{const ap=$('[data-act=af-apply][data-key="'+AK+'"]');ok('open course offered',!!ap,$$('[data-act=af-apply]').length);click(ap);await wait(300);}
ok('application sent',(window.__store.get('candidatures/'+CID)||{}).statut==='attente'&&!$('[data-act=af-apply][data-key="'+AK+'"]'));
click($('#mt-wait'));await wait(100);
ok('waiting list',!!$('[data-act=af-withdraw][data-key="'+AK+'"]')&&/En attente/.test($('#main .xm-list').textContent));
click($('[data-role=admin]'));await wait(120);
click($('#nav-affectations'));await wait(150);click($('#at-cand'));await wait(120);
ok('candidate listed',!!$('[data-act=af-approve][data-id="'+CID+'"]')&&/Vincent Tremblay/.test($('#main .xm-list').textContent)&&/Disponible/.test($('#main .xm-list').textContent));
click($('[data-act=af-approve][data-id="'+CID+'"]'));await wait(300);
ok('application approved',window.__store.get('candidatures/'+CID).statut==='approuve'&&!$('[data-act=af-approve][data-id="'+CID+'"]'));
click($('[data-role=teacher]'));await wait(120);
click($('#nav-mescours'));await wait(200);click($('#mt-mine'));await wait(100);
{const b=$('[data-act=pg-set][data-k=rp][data-v="'+AK+'"]');ok('course attributed',!!b);click(b);await wait(80);}
$('#rp-motif').value='Garde en caserne';$('[data-form=af-remp]').requestSubmit();await wait(300);
ok('replacement asked',(window.__store.get('remplacements/'+CID)||{}).motif==='Garde en caserne'&&/Remplacement demandé/.test($('#main').textContent));
click($('[data-role=admin]'));await wait(120);
click($('#nav-affectations'));await wait(150);click($('#at-remp'));await wait(120);
ok('replacement listed',/Garde en caserne/.test($('#main .xm-list').textContent));
click($('[data-act=af-retire][data-key="'+AK+'"][data-t="e-vtremblay"]'));await wait(350);
ok('teacher released',window.__store.get('candidatures/'+CID).statut==='retire'&&!window.__store.get('remplacements/'+CID));
click($('[data-role=teacher]'));await wait(100);pick('#sel-teacher','e-mleduc');await wait(100);click($('[data-role=admin]'));await wait(100);
// ---- modules : structure (cours, examens, chargé de cours), séances par classe, suppression protégée ----
click($('#nav-modules'));await wait(120);
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
// ---- nouveautés : sous Paramètres, pour l’administration ----
{const nav=$$('#nav button').map(b=>b.id);ok('news under params',nav[nav.length-1]==='nav-nouveautes'&&nav[nav.length-2]==='nav-params'&&!!$('#nav-n'),nav.slice(-2).join(','));}
click($('#nav-nouveautes'));await wait(150);
ok('news page',/Nouveautés/.test($('#heading').textContent)&&$$('#main .nv-list').length===5&&$$('#main .nv-row').length>15&&/Depuis votre dernière visite/.test($('#main').textContent)&&!$('#nav-n'),$$('#main .nv-row').length);
// un bloc par push : numéro, titre du push, date, identifiant avec un lien vers GitHub
{const h=$$('#main .nv-push'), n=h.map(x=>+x.querySelector('.nv-num').textContent), l=$('#main .nv-push a[href*="/commit/12976b2"]');
 ok('news by push',$('#nv-v-push').getAttribute('aria-pressed')==='true'&&h.length===5&&n[0]>=32&&n.every((x,i)=>i===0||x===n[i-1]-1)&&/Modules : cours, examens et chargé de cours/.test($('#main').textContent)&&!!l&&l.target==='_blank'&&/github\.com\/leocyfo\/caserne-ecole/.test(l.href)&&/13 octobre 2026/.test(l.closest('.nv-push').textContent)&&/pushes précédents/.test($('#nv-more').textContent),n.join(','));}
click($('#nv-f-fix'));await wait(60);
ok('news filter',$$('#main .nv-row').length>3&&$$('#main .nv-row>.chip').every(c=>c.textContent==='Correction'),$$('#main .nv-row').length);
click($('#nv-f-all'));await wait(60);click($('#nv-more'));await wait(60);
ok('news older',$$('#main .nv-list').length>=32&&!$('#nv-more')&&/Mise en service/.test($('#main').textContent)&&$$('#main .nv-push').every(x=>x.querySelector('.nv-pt b').textContent.length>5)&&$$('#main .nv-list').every(x=>x.querySelectorAll('.nv-row').length>=1),$$('#main .nv-list').length);
// les mêmes changements regroupés par date : les pushes d’un même jour sont réunis
{const rows=$$('#main .nv-row').length;click($('#nv-v-date'));await wait(80);
 ok('news by date',$('#nv-v-date').getAttribute('aria-pressed')==='true'&&!$('#main .nv-push')&&$$('#main .nv-list').length>=5&&$$('#main .nv-list').length<12&&$$('#main .nv-row').length===rows&&/pushes/.test($('#main .nv-hd').textContent),$$('#main .nv-list').length+' '+$$('#main .nv-row').length+'/'+rows);
 click($('#nv-v-push'));await wait(80);}
click($('#main .nv-row [data-act=nav][data-page=modules]'));await wait(120);
ok('news opens page',/Modules/.test($('#heading').textContent));
click($('#nav-nouveautes'));await wait(120);
ok('news seen',!/Depuis votre dernière visite/.test($('#main').textContent)&&!$('#nav-n'));
// calendrier scolaire
click($('#nav-annee'));await wait(50);
ok('year noel',/Congé de Noël/.test($('#main').textContent)&&/15 juin 2027/.test($('#main').textContent));
ok('year without exam list',!!$('#yr-exams')&&/examens à venir/.test($('#yr-exams').textContent)&&$$('#main .tl li').length<14&&/Année écoulée/.test($('#main').textContent),$$('#main .tl li').length);
// personnel
click($('#nav-personnel'));await wait(50);
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
click($('#nav-classes'));await wait(150);
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
click($('#nav-personnel'));await wait(60);
click($('#pt-personnel'));await wait(60);
click($('#sp-e-mleduc-A'));await wait(30);
click($('[data-act=sp-save]'));await wait(150);
{const _d=new Date();if(_d.getDay()===6)_d.setDate(_d.getDate()-1);else if(_d.getDay()===0)_d.setDate(_d.getDate()-2);const _k='profs-absents/'+_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');ok('prof absent saved',(window.__store.get(_k)||{ids:[]}).ids.includes('e-mleduc'),_k+' '+JSON.stringify(window.__store.get(_k)));}
click($('#nav-calendar'));await wait(60);
ok('prof absent badge in week',$$('#main .week .cc.has-badge .cc-badge').some(x=>x.textContent==='Enseignant absent'));
// enseignant
click($('[data-role=teacher]'));await wait(80);
ok('teacher board',$$('#main .week button.cc').length>0,$$('#main .week button.cc').length);
click($('[data-role=student]'));await wait(80);
ok('student board',$$('#main .week button.cc').length>0&&/Prochains examens/.test($('#main').textContent));
click($('#nav-examens'));await wait(80);
ok('student exams page',/Prochains examens/.test($('#main').textContent)&&!$('.xm-tile')&&!$('[data-act=x-rep]'));
ok('student sees own results',/Mes résultats/.test($('#main').textContent)&&$$('#main .xm-me .chip.ok').length>=5,$$('#main .xm-me .chip.ok').length);
/* DEMO */
{const st=document.createElement('style');st.textContent='.demo,.demo.is-hidden{transition:none!important}';document.head.appendChild(st);}
click($('[data-role=admin]'));await wait(80);
/* CTL */
ok('one-row toolbar',!$('.ctl-bottom')&&!$('.keys')&&!$('#heading p')&&!$('.saved'));
ok('late pill',!!$('#late-pill')&&/en retard/.test($('#late-pill').textContent));
ok('demo hide button',!!$('#demo-hide')&&!$('#demo').classList.contains('is-hidden')&&!$('#demo-show'));
click($('#demo-hide'));await wait(400);
ok('demo hidden',$('#demo').classList.contains('is-hidden')&&$('#demo').inert&&$('#demo').getBoundingClientRect().height<2&&!!$('#demo-show')&&document.activeElement===$('#demo-show'),Math.round($('#demo').getBoundingClientRect().height));
ok('demo pref saved',/"demoHidden":true/.test(localStorage.getItem(Object.keys(localStorage).find(k=>/"demoHidden"/.test(localStorage.getItem(k)))||'')||''));
click($('#nav-classes'));await wait(60);
ok('demo stays hidden on other page',$('#demo').classList.contains('is-hidden')&&!!$('#demo-show'));
click($('#demo-show'));await wait(400);
ok('demo shown again',!$('#demo').classList.contains('is-hidden')&&!$('#demo').inert&&$('#demo').getBoundingClientRect().height>60&&!$('#demo-show')&&document.activeElement===$('#demo-hide'));
click($('#nav-calendar'));await wait(60);
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
click($('#nav-classes'));await wait(120);
ok('principal select',$('#m-pr-c119').value==='e-mleduc'&&$('#m-pr-c121').value==='e-sgagnon');
{const s=$('#m-pr-c121');s.value='e-proy';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(250);
ok('principal saved',window.__store.get('groupes/c121').principal==='e-proy');
{const s=$('#m-pr-c121');s.value='e-sgagnon';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(250);
click($('#nav-calendar'));await wait(120);
ok('principal on board',/M\. Leduc/.test($('#pick-c119').textContent)&&/S\. Gagnon/.test($('#pick-c121').textContent));
click($('#nav-personnel'));await wait(120);
ok('principal in staff list',/Principal · 119/.test($('#main').textContent));
click($$('#main tbody .link').find(x=>/Marie Leduc/.test(x.textContent)));await wait(100);
ok('principal on staff fiche',/Enseignant principal · Classe 119/.test($('.fiche-head').textContent)&&!/Classe 122/.test($('.fiche-head').textContent));
click($('#fi-back'));await wait(80);
click($('#nav-eleves'));await wait(120);
click($('#main tr.row-link[data-id="el-119-01"]'));await wait(100);
ok('principal on student fiche',/Enseignant principal/.test($('.fiche-body').textContent)&&/Marie Leduc/.test($('.fiche-body').textContent));
click($('#fi-back'));await wait(80);
click($('#nav-calendar'));await wait(120);
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
click($('#nav-comptes'));await wait(200);
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
click($('#nav-eleves'));await wait(150);
click($('[data-act=student][data-id="el-119-05"]'));await wait(100);click($('#fi-edit'));await wait(80);
{const i=$('#st-nom');i.value='Florence Morin-Test';i.dispatchEvent(new Event('input',{bubbles:true}));}
click($('#drawer button.primary[type=submit]'));await wait(300);
ok('fiche synced',window.__store.get('comptes/u3').fiche.nom==='Florence Morin-Test',window.__store.get('comptes/u3').fiche.nom);
// profils
click($('#person-btn'));await wait(150);
ok('admin profile',/Mon profil/.test($('#heading').textContent)&&/Thierry Mayrand/.test($('#pf-name').textContent)&&/Gérer les comptes/.test($('#main').textContent));
click($('[data-role=teacher]'));await wait(120);
click($('#nav-profil'));await wait(150);
ok('teacher profile preview',!!$('#pf-who')&&/Mes classes/.test($('#main').textContent)&&/aperçu/.test($('#person').textContent),$('#pf-name').textContent);
{const s=$('#pf-who');s.value='e-proy';s.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('teacher profile switch',/Philippe Roy/.test($('#pf-name').textContent)&&/Philippe Roy/.test($('#person').textContent));
click($('[data-role=student]'));await wait(120);
click($('#nav-profil'));await wait(150);
ok('student profile preview',/Mes informations/.test($('#main').textContent)&&/Classe 119/.test($('#main').textContent)&&!!$('#pf-who'));
click($('[data-role=admin]'));await wait(120);
// suppression
click($('#nav-comptes'));await wait(150);
click($('#ac-edit-u2'));await wait(120);
click($('#ac-del'));await wait(60);click($('#ac-del-yes'));await wait(250);
ok('account deleted',!window.__store.get('comptes/u2')&&$$('#main .tbl tbody tr').length===9);
click($('#nav-calendar'));await wait(120);
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
