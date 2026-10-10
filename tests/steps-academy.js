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
ok('day window',!$('#c-form')&&!!$('#af-box')&&!!$('#c-open-mod')&&/Modifier ce cours/.test($('#drawer').textContent)&&!/Supprimer le cours/.test($('#drawer').textContent)&&/Cours/.test($('#drawer .eyebrow').textContent));
if(!$('#drawer').hidden){click($('#dr-close'));await wait(30);}
// drag a dated session to Thursday (once)
const src=$('.cc[data-key="k119-m08_a20261006am_2026-10-06"]');const cell=$('.wk-cell[data-date="2026-10-08"][data-grp="c119"]');
const pt=await dragTo(src,cell,true);ptr('pointerup',pt[0],pt[1]);await wait(40);
ok('move dialog no weekly',!!$('#drawer.dialog')&&!$('input[name=mv-scope][value=weekly]'));
click($('[data-act=mv-apply]'));await wait(150);
ok('dated moved',window.__store.get('cours/k119-m08').extras.some(x=>x.id==='a20261006am'&&x.date==='2026-10-08'));
click($$('.toast button').pop());await wait(150);
ok('undo dated move',window.__store.get('cours/k119-m08').extras.some(x=>x.id==='a20261006am'&&x.date==='2026-10-06'));
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
ok('cancel badge',$$('#main .week .cc-badge.bad').some(x=>x.textContent==='Cours annulé'));
click($('#main .week .cc.cancelled'));await wait(60);click($('[data-act=s-cancel]'));await wait(150);click($('#dr-close'));await wait(40);
ok('cancel badge removed',!$$('#main .week .cc-badge').some(x=>x.textContent==='Cours annulé'));
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
ok('add course drawer',!!$('#ac-form')&&$$('#ac-m option').length===27&&!$('#c-form')&&/Ajouter un cours/.test($('#drawer').textContent)&&$('#ac-g').value==='c119');
{const m=$('#ac-m');m.value='__act';m.dispatchEvent(new Event('input',{bubbles:true}));}await wait(40);
ok('activity name field',!!$('#ac-titre')&&$('#ac-m').value==='__act');
ok('type list',$$('#ac-type option').length===10&&$$('#ac-type option').some(o=>o.textContent==='Reprise')&&$$('#ac-type option').some(o=>o.textContent==='Examen pratique')&&$('#ac-type').value==='theorie'&&$('#ac-per').value==='jour');
$('#ac-form').requestSubmit();await wait(80);
ok('add course needs a name',/nom de l’activité/.test($('#drawer').textContent)&&!$('#drawer').hidden);
{const m=$('#ac-m');m.value='7';m.dispatchEvent(new Event('input',{bubbles:true}));}await wait(40);
ok('module chosen',/Autopompe/.test($('#dr-title').textContent)&&$('#ac-m').value==='7'&&!$('#ac-titre'));
typeIn('#ac-date','2026-10-10');await wait(40);$('#ac-form').requestSubmit();await wait(80);
ok('add course weekend refused',/fin de semaine/.test($('#drawer').textContent));
typeIn('#ac-date','2026-10-13');await wait(40);$('#ac-form').requestSubmit();await wait(80);
ok('add course clash refused',/a déjà/.test($('#drawer').textContent)&&!$('#drawer').hidden);
click($('#dr-close'));await wait(40);
click($('#nav-params'));await wait(60);
ok('params modules link',!!$('#p-modules')&&!$('#p-kcode')&&/25 modules/.test($('#main').textContent));
click($('#nav-calendar'));await wait(60);
/* PERIODE */
click($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]'));await wait(60);
ok('session period/activity',!!$('#sb-per')&&$('#sb-per').value==='jour'&&$('#sb-act').value==='theorie'&&/Toute la journée/.test($('#sb-per').selectedOptions[0].textContent),($('#sb-per')||{}).value+'|'+($('#sb-act')||{}).value);
{const sa=$('#sb-act');sa.value='pratique';sa.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
const xpm=()=>window.__store.get('cours/k119-m08').extras.find(x=>x.id==='a20261006am');
ok('activity saved',xpm().tags[0]==='Pratique'&&xpm().tags.includes('Ménage'),JSON.stringify(xpm().tags));
{const sp=$('#sb-per');sp.value='pm';sp.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('period saved',xpm().debut==='12:00'&&xpm().fin==='15:00');
click($('#dr-close'));await wait(40);
ok('card shows pratique',/Pratique/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]')||{}).textContent||'')&&/Après-midi/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"] .cc-time')||{}).textContent||''));
// remettre la séance comme avant : Théorie, toute la journée
click($('.cc[data-key="k119-m08_a20261006am_2026-10-06"]'));await wait(60);
{const sa=$('#sb-act');sa.value='theorie';sa.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
{const sp=$('#sb-per');sp.value='jour';sp.dispatchEvent(new Event('change',{bubbles:true}));}await wait(150);
ok('session restored',xpm().tags[0]==='Théorie'&&xpm().debut==='08:00'&&xpm().fin==='15:00');
click($('#dr-close'));await wait(40);
// classes
click($('#nav-classes'));await wait(50);
ok('5 classes',$$('.cl-row').length===5);
ok('class rows',$$('.cl-row').length===5&&$('#cl-c119 .cl-n').textContent.trim()==='12'&&!!$('#cl-c119 .cl-adv .meter')&&!!$('#m-pr-c119')&&$('#cl-c120 .cl-n').textContent.trim()==='10'&&/cours pris sur/.test($('#cl-c119 .cl-rate').textContent));
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
ok('tab presences',/Absences et retards/.test($('.fiche-body').textContent)&&/Par cours/.test($('.fiche-body').textContent)&&!/Parent ou tuteur/.test($('.fiche-body').textContent));
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
ok('staff fiche',/Marie Leduc/.test($('#fi-name').textContent)&&/responsable de la classe 119/.test($('.fiche-body').textContent)&&+(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Modules')>20&&(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Classes')==='1');
click($('#fi-tab-cours'));await wait(80);
ok('staff modules tab',$$('.cg-head').length===1&&/Modules par classe/.test($('.fiche-body').textContent)&&/Modules/.test($('#fi-tab-cours').textContent));
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
pick('#af-hz','90');await wait(150);pick('#x-g','c119');await wait(150);
click($('#at-all'));await wait(150);
const affRow=$$('#main .xm-row[data-act=sess-at]').find(r=>/^1 \/ 1$/.test(r.querySelector('.af-n b').textContent.trim()));
ok('aff all list',!!affRow&&/Enseignants/.test($('.xm-hd').textContent),$$('#main .xm-row').length);
const AK=affRow.dataset.key, AD=affRow.dataset.date, CID=(AK+'__e-vtremblay').replace(/[^A-Za-z0-9_-]/g,'-');
click(affRow);await wait(150);
ok('aff drawer',!!$('#af-box')&&$('#af-req-n').textContent==='1'&&/Titulaire du module/.test($('#af-box').textContent)&&!!$('#af-assign'));
click($('#af-req-p'));await wait(300);
{const c=window.__store.get('cours/'+AK.split('_')[0]),x=c.extras.find(e=>e.id===AK.split('_')[1]);ok('requis 2',$('#af-req-n').textContent==='2'&&/1 sur 2/.test($('#af-count').textContent)&&!!x&&x.requis===2,$('#af-count').textContent);}
click($('#dr-close'));await wait(60);
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
// ---- modules ----
click($('#nav-modules'));await wait(120);
ok('modules list',$$('#main .xm-row').length===25&&!!$('#md-7')&&/Théorie/.test($('.xm-hd').textContent)&&/Pratique/.test($('.xm-hd').textContent));
click($('#md-add-open'));await wait(60);
$('#md-code').value='26';$('#md-nom').value='Module d’essai';$('#md-ht').value='6';$('#md-hp').value='9';$('#md-req').value='2';
$('[data-form=md-add]').requestSubmit();await wait(400);
{const k=window.__store.get('config/ecole').competences.find(k=>k.code===26);ok('module created',!!k&&k.heuresT===6&&k.heuresP===9&&k.heures===15&&k.requis===2&&/Module d’essai/.test(($('#fi-name')||{}).textContent||''),JSON.stringify(k));}
await DBX.doc('groupes/c999').set({nom:'Classe 999'});await wait(200);
pick('#md-g','c999');await wait(120);
click($('[data-act=pg-set][data-k=xtype][data-v="examen-p"]'));await wait(80);
ok('quick exam type',$('#mx-type').value==='examen-p');
let MD='';for(let i=1;i<25&&!MD;i++){const d=new Date();d.setDate(d.getDate()+i);const ds=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');$('#mx-date').value=ds;$('#mx-label').value='26.1';$('[data-form=md-add-x]').requestSubmit();await wait(300);if(SK('cours').some(k=>window.__store.get(k).code==='M26'))MD=ds;}
const MC=SK('cours').find(k=>window.__store.get(k).code==='M26');
ok('course added to module',!!MC&&window.__store.get(MC).groupe==='c999'&&window.__store.get(MC).extras.length===1&&window.__store.get(MC).extras[0].tags.join()==='Examen,Pratique',MD);
ok('module course row',$$('#main article.md-x').length===1&&/Examens/.test($('.md-sum').textContent));
{const t=$('#main article.md-x select[data-mod=type]');t.value='theorie';t.dispatchEvent(new Event('change',{bubbles:true}));}await wait(300);
ok('course type changed',window.__store.get(MC).extras[0].tags.join()==='Théorie');
click($('#main article.md-x [data-act=af-req][data-d="1"]'));await wait(300);
ok('course requis',window.__store.get(MC).extras[0].requis===3,window.__store.get(MC).extras[0].requis);
click($('#main article.md-x [data-act=pg-set][data-k=askx]'));await wait(80);click($('[data-act=md-del-x]'));await wait(300);
ok('course removed',window.__store.get(MC).extras.length===0);
click($('#fi-tab-reglages'));await wait(100);
$('#md-ht').value='10';$('[data-form=md-save]').requestSubmit();await wait(450);
ok('module hours saved',window.__store.get('config/ecole').competences.find(k=>k.code===26).heuresT===10&&window.__store.get(MC).heures===19,window.__store.get(MC).heures);
click($('#md-ask'));await wait(80);click($('[data-act=md-del]'));await wait(350);
ok('module removed',window.__store.get('config/ecole').competences.length===25&&$$('#main .xm-row').length===25);
await DBX.doc(MC).delete();await DBX.doc('groupes/c999').delete();await wait(200);
// ---- nouveautés : sous Paramètres, pour l’administration ----
{const nav=$$('#nav button').map(b=>b.id);ok('news under params',nav[nav.length-1]==='nav-nouveautes'&&nav[nav.length-2]==='nav-params'&&!!$('#nav-n'),nav.slice(-2).join(','));}
click($('#nav-nouveautes'));await wait(150);
ok('news page',/Nouveautés/.test($('#heading').textContent)&&$$('#main .nv-list').length===2&&$$('#main .nv-row').length>15&&/Depuis votre dernière visite/.test($('#main').textContent)&&!$('#nav-n'),$$('#main .nv-row').length);
click($('#nv-f-fix'));await wait(60);
ok('news filter',$$('#main .nv-row').length>3&&$$('#main .nv-row>.chip').every(c=>c.textContent==='Correction'),$$('#main .nv-row').length);
click($('#nv-f-all'));await wait(60);click($('#nv-more'));await wait(60);
ok('news older',$$('#main .nv-list').length>=4&&!$('#nv-more')&&/Mise en service/.test($('#main').textContent));
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
ok('7 staff',$$('#main tbody tr').length===7&&/Marie Leduc/.test($('#main').textContent)&&/Instructeur/.test($('#main').textContent)&&/Cours cette semaine/.test($('#main thead').textContent));
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
ok('session summary',/Marie Leduc/.test($('#af-box').textContent)&&!/Enseignant/.test($('.sb-facts').textContent)&&$('.sb-facts').textContent.includes('9 / 12')&&/8\.1/.test($('.sb-facts').textContent)&&/Théorie/.test($('.sb-chips').textContent)&&/Modifier ce cours/.test($('.sess-box').textContent)&&!/éance/.test($('#drawer').textContent));
const xam=()=>window.__store.get('cours/k119-m08').extras.find(x=>x.id==='a20261006am');
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
