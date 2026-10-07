(async()=>{
const R=[];const ok=(name,cond,info)=>R.push((cond?'PASS ':'FAIL ')+name+(info!==undefined?' :: '+info:''));
const wait=ms=>new Promise(r=>setTimeout(r,ms));const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const click=el=>{if(!el)throw new Error('missing element');el.click();};
try{
await wait(900);
const U=window.__USER;
if(U.id==='u9'){
  ok('locked student role',/élève/i.test($('#ws-label').textContent)&&$('.roles').hidden&&!$('#sel-group')&&$$('#main .week button.cc').length>0,$('#ws-label').textContent);
  ok('student name in menu',/Alexandre Beaulieu/.test($('#person').textContent)&&!/aperçu/.test($('#person').textContent),$('#person').textContent);
  ok('no admin nav',!$('#nav-comptes')&&!!$('#nav-profil'));
  click($('#nav-profil'));await wait(150);
  ok('student own profile',/Alexandre Beaulieu/.test($('#pf-name').textContent)&&/Capitaine/.test($('#main').textContent)&&!$('#pf-who')&&/Compte relié/.test($('#main').textContent)&&/Classe 119/.test($('#main').textContent));
  ok('student avatar photo',!!$('#main .prof-head .av img')&&!!$('#person .av img'));
}else{
  ok('locked teacher role',/enseignant/i.test($('#ws-label').textContent)&&!$('#sel-teacher')&&$('.roles').hidden,$('#ws-label').textContent);
  ok('teacher name in menu',/Philippe Roy/.test($('#person').textContent));
  click($('#nav-profil'));await wait(150);
  ok('teacher own profile',/Philippe Roy/.test($('#pf-name').textContent)&&/Classe 120/.test($('#main').textContent)&&!$('#pf-who'),$('#main').textContent.replace(/\s+/g,' ').slice(0,200));
}
}catch(e){R.push('ERROR '+e.message+' '+e.stack);}
R.push('ERRS '+JSON.stringify(window.__errs));
const pre=document.createElement('pre');pre.id='results';pre.textContent=R.join('\n');document.body.appendChild(pre);
})();
