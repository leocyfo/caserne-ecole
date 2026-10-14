// Lance les pages de test dans Chrome sans fenêtre et affiche les résultats.
//   node tests/lancer.js             toute la suite
//   node tests/lancer.js ac lock     seulement les pages dont le nom contient « ac » ou « lock »
// Chrome : variable CHROME_PATH, sinon les emplacements habituels (Windows, macOS, Linux).
// Code de sortie : 0 si tout passe, 1 s’il y a un échec, une erreur ou une page sans résultat.
const fs=require('fs'), path=require('path'), os=require('os'), {spawnSync}=require('child_process'), {pathToFileURL}=require('url');
process.chdir(__dirname);

function trouverChrome(){
  const e=process.env, c=[e.CHROME_PATH,e.CHROME_BIN];
  if(process.platform==='win32') for(const b of [e.ProgramFiles,e['ProgramFiles(x86)'],e.LocalAppData]) if(b) c.push(path.join(b,'Google','Chrome','Application','chrome.exe'));
  if(process.platform==='darwin') c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  c.push('/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser');
  return c.find(p=>p&&fs.existsSync(p));
}
const chrome=trouverChrome();
if(!chrome){console.error('Google Chrome est introuvable (indiquez son chemin dans la variable CHROME_PATH).');process.exit(1);}

// Les pages de test sont construites à partir des sources (src/) à chaque lancement
for(const b of ['build-test.js','build-ac.js','build-lock.js','build-auth.js','build-phone.js']){
  const r=spawnSync(process.execPath,[b],{encoding:'utf8'});
  if(r.status!==0){console.error('construction impossible ('+b+') :\n'+(r.stderr||r.stdout));process.exit(1);}
}

const PAGES=['test.html','test-ac.html','test-lock-s.html','test-lock-t.html','test-phone.html']
  .concat(['setup','request','approve','refused','signin','demo-login','demo-request'].map(n=>'test-auth-'+n+'.html'));
const filtres=process.argv.slice(2), pages=PAGES.filter(p=>!filtres.length||filtres.some(f=>p.includes(f)));
if(!pages.length){console.error('aucune page de test ne correspond à : '+filtres.join(' '));process.exit(1);}
const texte=h=>h.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&');

// Sur GitHub, chaque problème devient aussi une annotation visible dans le résumé de l’exécution
const CI=!!process.env.GITHUB_ACTIONS, note=(p,l)=>{if(CI) console.log('::error title='+p+'::'+l.slice(0,400).replace(/%/g,'%25').replace(/\r/g,'%0D').replace(/\n/g,'%0A'));};
let total=0, rates=0;
for(const p of pages){
  const profil=fs.mkdtempSync(path.join(os.tmpdir(),'caserne-ecole-tests-'));
  const args=['--headless=new','--disable-gpu','--no-first-run','--user-data-dir='+profil,'--window-size=1440,1000','--virtual-time-budget='+(process.env.VT||120000),'--dump-dom',pathToFileURL(path.join(__dirname,p)).href];
  if(process.platform==='linux') args.unshift('--no-sandbox');
  const r=spawnSync(chrome,args,{encoding:'utf8',maxBuffer:512*1024*1024,timeout:600000});
  try{fs.rmSync(profil,{recursive:true,force:true,maxRetries:5,retryDelay:200});}catch(e){}
  const html=r.stdout||'';
  fs.writeFileSync(p.replace(/^test/,'out'),html);
  const m=/<pre id="results">([\s\S]*?)<\/pre>/.exec(html);
  if(!m){
    rates++;console.log(p+' : AUCUN RÉSULTAT (la page n’a pas terminé)'+(r.error?' · '+r.error.message:''));
    const err=(r.stderr||'').trim().split('\n').filter(l=>!/dbus|DevTools listening|gpu|GPU/.test(l)).slice(-3).join('\n  ');
    if(err) console.log('  '+err);
    note(p,'aucun résultat : la page n’a pas terminé'+(err?' — '+err:''));
    continue;
  }
  const lignes=texte(m[1]).split('\n'), ok=lignes.filter(l=>l.startsWith('PASS ')).length;
  const ko=lignes.filter(l=>/^(FAIL|ERROR) /.test(l)), errs=lignes.filter(l=>l.startsWith('ERRS ')&&l!=='ERRS []');
  if(!lignes.some(l=>l.startsWith('ERRS '))) ko.push('ERROR résultats incomplets');
  total+=ok;rates+=ko.length+errs.length;
  console.log(p+' : '+ok+' réussis, '+ko.length+' échoués'+(errs.length?' · erreurs de la page':''));
  for(const l of ko.concat(errs)){console.log('  '+l.slice(0,400));note(p,l);}
}
console.log(rates?'ÉCHEC : '+rates+' problème(s), '+total+' vérifications réussies':'TOUT PASSE : '+total+' vérifications sur '+pages.length+' pages');
process.exit(rates?1:0);
