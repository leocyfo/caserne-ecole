// Régénère index.html et demo/donnees.js à partir de src/ et des données d’exemple des tests.
const fs=require('fs'), path=require('path');
const racine=path.join(__dirname,'..');
const lire=rel=>fs.readFileSync(path.join(racine,rel),'utf8');
fs.writeFileSync(path.join(racine,'demo/donnees.js'),'/* Données d’exemple de la démo (générées par outils/construire-demo.js) */\nwindow.__SEED='+lire('tests/seed-academy.json').trim()+';\n');
fs.writeFileSync(path.join(racine,'index.html'),'<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<meta name="description" content="Démo du calendrier des cours : classes, élèves, personnel, présences, examens et comptes.">\n</head>\n<body>\n<script src="demo/donnees.js"></script>\n<script src="demo/runtime.js"></script>\n'+lire('src/calendrier-cours.html')+'\n</body>\n</html>\n');
console.log('index.html et demo/donnees.js régénérés');
