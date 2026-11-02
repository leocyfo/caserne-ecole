(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>{if(!el)throw new Error('missing element');el.click();};
try{
await wait(900);
const U=window.__USER;
if(U.id==='u9'){
  ok('locked student role',/élève/i.test($('#ws-label').textContent)&&$('.roles').hidden&&!$('#sel-group')&&$('#nav-accueil').getAttribute('aria-current')==='page'&&$$('#main .tl-card').length>0,$('#ws-label').textContent);
  ok('student name in menu',/Alexandre Beaulieu/.test($('#person').textContent)&&!/aperçu/.test($('#person').textContent),$('#person').textContent);
  ok('no admin nav',!$('#nav-comptes')&&!!$('#nav-profil'));
  click($('#nav-profil'));await wait(150);
  ok('student own profile',/Alexandre Beaulieu/.test($('#pf-name').textContent)&&/Capitaine/.test($('#main').textContent)&&!$('#pf-who')&&/Compte relié/.test($('#main').textContent)&&/Classe 119/.test($('#main').textContent));
  ok('student avatar photo',!!$('#main .prof-head .av img')&&!!$('#person .av img'));
  ok('student sees only own equipment and account',!!$('#pf-equip')&&/Casque de pompier/.test($('#pf-equip').textContent)&&/Habit de combat/.test($('#pf-equip').textContent)&&!!$('#pf-compte')&&/Solde/.test($('#pf-compte').textContent)&&/\$/.test($('#pf-compte').textContent),($('#pf-equip')||{}).textContent);
  click($('#nav-examens'));await wait(300);
  ok('student sees own results without the class list',/Mes résultats/.test($('#main').textContent)&&$$('#main .xm-me .chip.ok').length>=5&&/Journée de reprise/.test($('#main').textContent),$$('#main .xm-me .chip').length);
  click($('#nav-formation'));await wait(400);
  ok('student formation: own carnet',!!$('#fo-mycarnet')&&$$('#fo-mycarnet li').length===11&&/Réussie/.test($('#fo-mycarnet').textContent)&&!!$('#fo-tosign'),($('#main')||{}).textContent.slice(0,200));
  ok('student reads only own formation documents',(window.__subs||[]).includes('evaluations?eleve==el-119-01')&&(window.__subs||[]).includes('ex-tentatives?eleve==el-119-01')&&!(window.__subs||[]).includes('evaluations'),(window.__subs||[]).filter(s=>/eval|tentat/.test(s)).join(' '));
  click($('#fo-certs'));await wait(200);ok('student own certificates',$$('#fo-mycerts li').length===5&&/Valide/.test($('#fo-mycerts').textContent));
  click($('#fo-enpq'));await wait(200);ok('student own ENPQ file',!!$('#fo-myenpq')&&/Examens de l’école/.test($('#fo-myenpq').textContent)&&/Frais à jour/.test($('#fo-myenpq').textContent));
  ok('student has no class data',!$('[data-act=x-rep]')&&!$('.xm-tile')&&!$('#nav-eleves'));
}else{
  ok('locked teacher role',/enseignant/i.test($('#ws-label').textContent)&&!$('#sel-teacher')&&$('.roles').hidden,$('#ws-label').textContent);
  ok('teacher name in menu',/Philippe Roy/.test($('#person').textContent));
  click($('#nav-profil'));await wait(150);
  ok('teacher own profile',/Philippe Roy/.test($('#pf-name').textContent)&&/Classe 120/.test($('#main').textContent)&&!$('#pf-who'),$('#main').textContent.replace(/\s+/g,' ').slice(0,200));
  ok('teacher pay panel',!!$('#pf-paie')&&/Ce mois-ci/.test($('#pf-paie').textContent)&&/Aucun relevé/.test($('#pf-paie').textContent));
}
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
