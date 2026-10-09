(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const S_page=()=>($('#nav [aria-current=page]')||{}).dataset?$('#nav [aria-current=page]').dataset.page:'';
const click=el=>{if(!el)throw new Error('missing element');el.click();};
const ptr=(type,x,y,target)=>(target||window).dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0,buttons:type==='pointerup'?0:1,pointerType:'mouse',isPrimary:true}));
const center=el=>{const r=el.getBoundingClientRect();return [r.left+r.width/2,r.top+Math.min(r.height/2,30)];};
const freePoint=cell=>{const r=cell.getBoundingClientRect(),x=r.left+r.width/2;for(let y=Math.min(r.bottom-4,innerHeight-70);y>r.top;y-=8){const el=document.elementFromPoint(x,y);if(el&&el.closest('.wk-cell')===cell&&!el.closest('.cc'))return [x,y];}return [x,r.top+4];};
const dragTo=async(src,target,isCell)=>{src.scrollIntoView({block:'center'});await wait(30);const [x0,y0]=center(src);ptr('pointerdown',x0,y0,src);ptr('pointermove',x0+12,y0+8);const p=isCell?freePoint(target):center(target);ptr('pointermove',p[0],p[1]);return p;};
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
ok('card session label',/Séances 8\.1 et 8\.2/.test(($('.cc[data-key="k119-m08_a20261006am_2026-10-06"] .cc-meta')||{}).textContent||''));
ok('119 AM today',!!am&&/9\/12 marqués/.test(am.textContent),am&&am.textContent.replace(/\s+/g,' ').slice(0,120));
{const ex=$$('#main .week .cc.kx:not(.has-badge)'),th=$('#main .week .cc.k0');ok('exams dark',ex.length>2&&ex.every(x=>getComputedStyle(x).backgroundColor==='rgb(159, 45, 53)')&&!!th&&getComputedStyle(th).backgroundColor!=='rgb(159, 45, 53)',ex.length);}
ok('exam doc on board',$$('#main .cc.exam').some(x=>/Métier et formation/.test(x.textContent)));
// exam drawer with results
click($$('#main .cc.exam').find(x=>/Métier et formation/.test(x.textContent)));await wait(50);
ok('exam results',/5 réussites/.test($('#drawer').textContent)&&/1 échec/.test($('#drawer').textContent));
click($('[data-act=x-res][data-el="el-119-07"][data-v="reussi"]'));await wait(30);
$('#x-form').requestSubmit();await wait(40);
if(/Conflit/.test($('#drawer').textContent)){$('#x-form').requestSubmit();await wait(150);}else await wait(150);
ok('result saved',window.__store.get('examens/x-eval-119').resultats['el-119-07']==='reussi',JSON.stringify(window.__store.get('examens/x-eval-119').resultats));
if(!$('#drawer').hidden){click($('#dr-close'));await wait(30);}
// course drawer of a dated course
click(am);await wait(50);
ok('dated section',/Séances de l’horaire annuel/.test($('#drawer').textContent)&&/h planifiées sur 75 h prévues/.test($('#drawer').textContent),($('#drawer').textContent.match(/\d+ séances datées[^.]*/)||[''])[0]);
const before=window.__store.get('cours/k119-m08').extras.length;
$('#c-form').requestSubmit();await wait(60);
if(/Conflits/.test($('#drawer').textContent)){$('#c-form').requestSubmit();}
await wait(150);
ok('save dated course',window.__store.get('cours/k119-m08').extras.length===before&&window.__store.get('cours/k119-m08').heures===75,String(window.__store.get('cours/k119-m08').heures));
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
ok('name list',!!$('#c-nom-sel')&&$$('#c-nom-sel option').length===27&&!$('#c-preset'),$('#c-nom-sel')&&$$('#c-nom-sel option').length);
const pre=$('#c-nom-sel');pre.value='7';pre.dispatchEvent(new Event('change',{bubbles:true}));await wait(40);
ok('name fills',!$('#c-titre')&&/Autopompe/.test($('#dr-title').textContent+$('#c-nom-sel').selectedOptions[0].textContent)&&$('#c-code').value==='M7'&&$('#c-heures').value==='45',$('#c-code').value+'|'+$('#c-heures').value);
ok('name stays selected',$('#c-nom-sel').value==='7');
ok('default period',$('#c-p-0').value==='jour'&&!$('#c-d-0')&&$('#c-a-0').value==='theorie',$('#c-p-0').value);
const ns=$('#c-nom-sel');ns.value='__autre';ns.dispatchEvent(new Event('change',{bubbles:true}));await wait(40);
ok('other name field',!!$('#c-titre')&&$('#c-titre').value==='');
click($('#dr-close'));await wait(40);
click($('#nav-params'));await wait(60);
ok('params comps table',$$('#main .tbl tbody tr').length===25);
$('#p-kcode').value='26';$('#p-knom').value='Compétence d’essai';$('#p-kh').value='12';$('#p-kcode').closest('form').requestSubmit();await wait(150);
ok('comp added',window.__store.get('config/ecole').competences.some(k=>k.code===26&&k.heures===12));
click($('[data-act=p-del-comp][data-code="26"]'));await wait(150);
ok('comp removed',window.__store.get('config/ecole').competences.length===25);
click($('#nav-calendar'));await wait(60);
/* PERIODE */
click($('[data-act=new-course]'));await wait(60);
const ps=$('#c-p-0');ps.value='pm';ps.dispatchEvent(new Event('change',{bubbles:true}));await wait(40);
ok('period pm',$('#c-p-0').value==='pm'&&!$('#c-d-0'));
const ps2=$('#c-p-0');ps2.value='autre';ps2.dispatchEvent(new Event('change',{bubbles:true}));await wait(40);
ok('precise hours',!!$('#c-d-0')&&$('#c-d-0').value==='12:00'&&$('#c-f-0').value==='15:00');
ok('activity list',$$('#c-a-0 option').length===9&&$('#c-a-0').value==='theorie',$$('#c-a-0 option').map(o=>o.textContent).join('|'));
click($('#dr-close'));await wait(40);
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
ok('class rows',$$('.cl-row').length===5&&$('#cl-c119 .cl-n').textContent.trim()==='12'&&!!$('#cl-c119 .cl-adv .meter')&&!!$('#m-pr-c119')&&/Aucun élève/.test($('#cl-c120 .cl-st').textContent));
click($('#cl-c119'));await wait(80);
ok('class fiche',/Classe 119/.test($('#fi-name').textContent)&&$$('.fiche-tabs button').length===4&&$$('.fh-stats>div').length===5&&$$('.fiche-list .fl-item').length===5);
ok('roles in class list',/Capitaine/.test($('#main').textContent)&&$$('.st-row').length===12);
ok('students by number',$$('.st-row .st-num').slice(0,3).map(x=>x.textContent).join(',')==='1,2,3',$$('.st-row .st-num').slice(0,3).map(x=>x.textContent).join(','));
ok('enrol form hidden',!$('[data-form=m-add-els]')&&!!$('#m-enrol-open'));
click($('#m-enrol-open'));await wait(60);
ok('enrol form opens',!!$('[data-form=m-add-els]')&&!$('#m-enrol-open'));
click($('[data-form=m-add-els] [data-act=pg-set]'));await wait(60);
ok('enrol form closes',!$('[data-form=m-add-els]'));
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
ok('12 students',$$('#main tbody tr').length===12);
ok('captain chip',$$('#main .role-chip').some(x=>x.textContent==='Capitaine'));
{const tr=$('#main tr.row-link[data-id="el-119-08"]');click(tr&&tr.children[4]);}await wait(80);
ok('row click opens fiche',/Juliette Lavoie/.test(($('#fi-name')||{}).textContent||''));
click($('#fi-back'));await wait(80);
window.scrollTo(0,300);await wait(30);const listY=window.scrollY;
click($$('#main tbody .link').find(x=>/Camille/.test(x.textContent)));await wait(80);
ok('student fiche',/Camille Bergeron/.test($('#fi-name').textContent)&&/Lieutenant 1/.test($('.fiche-head').textContent)&&/Cravate oubliée/.test($('#main').textContent)&&$$('.fiche-list .fl-item').length===12);
ok('fiche simple',$$('.fiche-tabs button').length===3&&$('#fi-tab-dossier').getAttribute('aria-pressed')==='true'&&$$('.fh-stats>div').length===4&&$$('.fiche-body .panel').length===1&&!/Semaine de la classe/.test($('#main').textContent));
click($('#fi-tab-presences'));await wait(80);
ok('tab presences',/Absences et retards/.test($('.fiche-body').textContent)&&/Par cours/.test($('.fiche-body').textContent)&&!/Parent ou tuteur/.test($('.fiche-body').textContent));
click($('#fi-tab-examens'));await wait(80);
ok('tab examens',/Résultats/.test($('.fiche-body').textContent)&&/À venir/.test($('.fiche-body').textContent));
click($('#fi-tab-dossier'));await wait(80);
ok('account in header',/Compte élève · compte d’exemple/.test($('#fi-acct-chip').textContent)&&/Modifier le compte/.test($('#fi-acct-btn').textContent));
click($('#fi-next'));await wait(80);
ok('fiche next',/Émilie Côté/.test($('#fi-name').textContent)&&$('#fl-el-119-04').getAttribute('aria-current')==='true');
click($('#fi-tab-presences'));await wait(60);click($('#fi-next'));await wait(80);
ok('tab kept when switching',$('#fi-tab-presences').getAttribute('aria-pressed')==='true'&&/Absences et retards/.test($('.fiche-body').textContent));
click($('#fi-prev'));await wait(60);click($('#fi-tab-dossier'));await wait(60);
document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true}));await wait(80);
ok('fiche arrow key',/Camille Bergeron/.test($('#fi-name').textContent));
click($('#fl-el-119-12'));await wait(80);
ok('fiche list switch',/Léa Tremblay/.test($('#fi-name').textContent)&&!$('#fi-next').disabled);
click($('#fl-el-119-05'));await wait(80);
ok('fiche last',/William Deschamps/.test($('#fi-name').textContent)&&$('#fi-next').disabled&&/12 sur 12/.test($('.fiche-nav').textContent));
click($('#fi-edit'));await wait(60);
ok('edit from fiche',!$('#drawer').hidden&&$('#st-nom').value==='William Deschamps');
click($('#dr-close'));await wait(40);
document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(80);
ok('fiche escape back',!$('.fiche')&&$$('#main tbody tr').length===12&&Math.abs(window.scrollY-listY)<5&&listY>0,Math.round(listY)+' -> '+Math.round(window.scrollY));
// personnel
click($('#nav-personnel'));await wait(80);
click($$('#main tbody .link').find(x=>/Marie Leduc/.test(x.textContent)));await wait(80);
ok('staff fiche',/Marie Leduc/.test($('#fi-name').textContent)&&/Qualifiée/.test($('.fiche-body').textContent)&&+(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Cours')>20&&(l=>{const d=[...document.querySelectorAll('.fh-stats>div')].find(x=>x.querySelector('dt').textContent===l);return d?d.querySelector('dd').textContent:'';})('Classes')==='2');
click($('#fi-tab-cours'));await wait(80);
ok('staff courses tab',$$('.cg-head').length===2);
click($('#cg-c119'));await wait(80);
ok('staff courses by class',$('#cg-c119').getAttribute('aria-expanded')==='true'&&$$('.cg-body li').length>5);
click($('#fi-next'));await wait(80);
ok('staff fiche next',/Philippe Roy/.test($('#fi-name').textContent));
click($$('.fiche-act button').find(x=>/Son horaire/.test(x.textContent)));await wait(150);
ok('staff to schedule',S_page()==='calendar'&&$('#fm-e').getAttribute('aria-pressed')==='true'&&$('#fc-e-proy').getAttribute('aria-pressed')==='true');
click($('#fc-all'));await wait(60);click($('#fm-g'));await wait(60);
click($('#nav-eleves'));await wait(80);
// examens
click($('#nav-examens'));await wait(60);
ok('exams list',$$('#main [data-act=sess-at]').length>0,($('#main .summary')||{}).textContent);
click($('#main [data-act=sess-at]'));await wait(50);
ok('session exam opens course',!!($('#c-nom-sel')||$('#c-titre')));
click($('#dr-close'));await wait(30);
// calendrier scolaire
click($('#nav-annee'));await wait(50);
ok('year noel',/Congé de Noël/.test($('#main').textContent)&&/15 juin 2027/.test($('#main').textContent));
// personnel
click($('#nav-personnel'));await wait(50);
ok('3 teachers',$$('#main tbody tr').length===3&&/Marie Leduc/.test($('#main').textContent));
// présences (dans les classes)
ok('no presences menu',!$('#nav-presences'));
click($('#nav-classes'));await wait(150);
ok('att cards',$$('.cl-row').length===5&&!$('.att-card')&&/%/.test($('#cl-c119 .cl-rate').textContent),$('#cl-c119 .cl-rate').textContent);
click($('#cl-c119'));await wait(100);
ok('att class fiche',/Classe 119/.test($('#fi-name').textContent)&&$$('.fiche-tabs button').length===4&&$$('.st-row').length===12&&$$('.fh-stats>div').length===5&&/Présence/.test($('.fh-stats').textContent));
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
{const _d=new Date(),_k='profs-absents/'+_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');ok('prof absent saved',(window.__store.get(_k)||{ids:[]}).ids.includes('e-mleduc'),_k+' '+JSON.stringify(window.__store.get(_k)));}
click($('#nav-calendar'));await wait(60);
ok('prof absent badge in week',$$('#main .week .cc.has-badge .cc-badge').some(x=>x.textContent==='Prof. absent'));
// enseignant
click($('[data-role=teacher]'));await wait(80);
ok('teacher board',$$('#main .week button.cc').length>0,$$('#main .week button.cc').length);
click($('[data-role=student]'));await wait(80);
ok('student board',$$('#main .week button.cc').length>0&&/Prochains examens/.test($('#main').textContent));
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
ok('principal on staff fiche',/Prof principal · Classe 119/.test($('.fiche-head').textContent)&&/Prof principal · Classe 122/.test($('.fiche-head').textContent));
click($('#fi-back'));await wait(80);
click($('#nav-eleves'));await wait(120);
click($('#main tr.row-link[data-id="el-119-01"]'));await wait(100);
ok('principal on student fiche',/Prof principal/.test($('.fiche-body').textContent)&&/Marie Leduc/.test($('.fiche-body').textContent));
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
ok('session summary',/Marie Leduc/.test($('.sb-facts').textContent)&&$('.sb-facts').textContent.includes('9 / 12')&&/8\.1/.test($('.sb-facts').textContent)&&/Théorie/.test($('.sb-chips').textContent)&&/Modifier cette séance/.test($('.sess-box').textContent));
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
