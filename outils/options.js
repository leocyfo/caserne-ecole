// Met ou enlève le fichier d’une option du site : c’est ce fichier qui décide si l’option s’affiche.
//   node outils/options.js               l’état de chaque option
//   node outils/options.js stock on      met options/stock.js, construit à partir de src/options/stock/
//   node outils/options.js stock off     enlève options/stock.js
// Le hub s’en sert aussi (Projet › PompierNote). Le changement part sur GitHub avec le prochain envoi.
const fs=require('fs'), path=require('path'), {option,nomsOptions}=require('./assembler.js');
const DOSSIER=path.join(__dirname,'..','options'), fichier=k=>path.join(DOSSIER,k+'.js');
function etat(){
  return nomsOptions().map(k=>{const on=fs.existsSync(fichier(k));return {id:k,actif:on,taille:on?fs.statSync(fichier(k)).size:0};});
}
function regler(k,actif){
  if(!nomsOptions().includes(k)) throw new Error('option inconnue : '+k);
  if(actif){fs.mkdirSync(DOSSIER,{recursive:true});fs.writeFileSync(fichier(k),option(k));}
  else fs.rmSync(fichier(k),{force:true});
}
module.exports={etat,regler};
if(require.main===module){
  const [,,k,v]=process.argv;
  if(k){if(v!=='on'&&v!=='off'){console.error('Usage : node outils/options.js <option> on|off');process.exit(1);}regler(k,v==='on');}
  for(const o of etat()) console.log(o.id+' : '+(o.actif?'fichier en place ('+Math.round(o.taille/1024)+' Ko)':'pas de fichier'));
}
