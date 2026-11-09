// Assemble la page du site à partir de ses morceaux :
//   src/page.html          la coquille (titre, structure de la page, emplacements des styles et du code)
//   src/styles/NN-nom.css  les styles, dans l’ordre des numéros
//   src/js/NN-nom.js       le code, dans l’ordre des numéros (les morceaux partagent la même portée)
//   src/options/<nom>/     une option, un fichier à part chargé par la page si elle est ajoutée : ses NN-*.css et NN-*.js
// Usage : const {assembler,option}=require('./assembler.js'); const page=assembler(), stock=option('stock');
//         avecOptions() : la page et ses options dans un seul fichier (pages de test)
//         node outils/assembler.js [fichier de sortie]   (sans fichier : affiche la taille)
const fs=require('fs'), path=require('path'), crypto=require('crypto');
const lire=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n');
const SRC=fs.existsSync(path.join(__dirname,'src','page.html'))?path.join(__dirname,'src'):path.join(__dirname,'..','src');
function morceaux(src,dir,ext){
  return fs.readdirSync(path.join(src,dir)).filter(f=>new RegExp('^\\d\\d-.+\\.'+ext+'$').test(f)).sort();
}
function nomsOptions(src){
  const d=path.join(src||SRC,'options');
  return fs.existsSync(d)?fs.readdirSync(d).filter(k=>fs.statSync(path.join(d,k)).isDirectory()).sort():[];
}
/* Le contenu du fichier options/<nom>.js : les styles arrivent avec le code */
function option(k,src){
  const d=path.join(src||SRC,'options',k), texte=ext=>morceaux(path.join(src||SRC,'options'),k,ext).map(f=>{const t=lire(path.join(d,f));return t.endsWith('\n')?t:t+'\n';}).join('');
  return `/* PompierNote · option « ${k} » : généré par outils/construire.js à partir de src/options/${k}/ */\n'use strict';\noptStyles(${JSON.stringify(texte('css'))});\n${texte('js')}`;
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
  /* la page et ses options vont ensemble : le navigateur ne garde pas une option d’une version précédente */
  const ver=crypto.createHash('sha1').update(nomsOptions(src).map(k=>option(k,src)).join('')).digest('hex').slice(0,10);
  return page.replace('@@OPT_VER@@',()=>ver);
}
/* Les options sont déjà là quand le site démarre : il ne va pas chercher leurs fichiers */
function avecOptions(src){
  const page=assembler(src), cut=page.lastIndexOf('init();');
  return page.slice(0,cut)+nomsOptions(src).map(k=>option(k,src)).join('')+page.slice(cut);
}
module.exports={assembler,avecOptions,option,nomsOptions,morceaux,SRC};
if(require.main===module){
  const page=assembler(), sortie=process.argv[2];
  if(sortie){fs.writeFileSync(sortie,page);console.log(sortie+' écrit ('+page.length+' caractères)');}
  else console.log('page assemblée : '+page.length+' caractères, '+morceaux(SRC,'styles','css').length+' fichiers de styles, '+morceaux(SRC,'js','js').length+' fichiers de code, options : '+nomsOptions().join(', '));
}
