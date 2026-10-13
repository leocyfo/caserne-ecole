// Assemble la page du site à partir de ses morceaux :
//   src/page.html          la coquille (titre, structure de la page, emplacements des styles et du code)
//   src/styles/NN-nom.css  les styles, dans l’ordre des numéros
//   src/js/NN-nom.js       le code, dans l’ordre des numéros (les morceaux partagent la même portée)
// Usage : const {assembler}=require('./assembler.js'); const page=assembler();
//         node outils/assembler.js [fichier de sortie]   (sans fichier : affiche la taille)
const fs=require('fs'), path=require('path');
const lire=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const SRC=fs.existsSync(path.join(__dirname,'src','page.html'))?path.join(__dirname,'src'):path.join(__dirname,'..','src');
function morceaux(src,dir,ext){
  return fs.readdirSync(path.join(src,dir)).filter(f=>new RegExp('^\\d\\d-.+\\.'+ext+'$').test(f)).sort();
}
function assembler(src){
  src=src||SRC;
  let page=lire(path.join(src,'page.html'));
  for(const [repere,dir,ext] of [['/*@@STYLES@@*/\n','styles','css'],['/*@@SCRIPTS@@*/\n','js','js']]){
    if(page.split(repere).length!==2) throw new Error('page.html : le repère '+repere.trim()+' doit apparaître une seule fois');
    const noms=morceaux(src,dir,ext);
    if(!noms.length) throw new Error('aucun morceau dans '+path.join(src,dir));
    const texte=noms.map(f=>{const t=lire(path.join(src,dir,f));return t.endsWith('\n')?t:t+'\n';}).join('');
    page=page.replace(repere,()=>texte);
  }
  return page;
}
module.exports={assembler,morceaux,SRC};
if(require.main===module){
  const page=assembler(), sortie=process.argv[2];
  if(sortie){fs.writeFileSync(sortie,page);console.log(sortie+' écrit ('+page.length+' caractères)');}
  else console.log('page assemblée : '+page.length+' caractères, '+morceaux(SRC,'styles','css').length+' fichiers de styles, '+morceaux(SRC,'js','js').length+' fichiers de code');
}
