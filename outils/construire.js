// Régénère index.html (site avec connexion), demo.html (démo) et demo/donnees.js à partir de src/.
const fs=require('fs'), path=require('path');
const racine=path.join(__dirname,'..');
const lire=rel=>fs.readFileSync(path.join(racine,rel),'utf8');
const page=require('./assembler.js').assembler();
const tete=(titre,desc)=>'<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>'+titre+'</title>\n<meta name="description" content="'+desc+'">\n<link rel="icon" type="image/svg+xml" href="site/embleme.svg">\n<link rel="apple-touch-icon" href="site/icone-180.png">\n</head>\n<body>\n';
fs.writeFileSync(path.join(racine,'demo/donnees.js'),'/* Données d’exemple (générées par outils/construire.js) */\nwindow.__SEED='+lire('tests/seed-academy.json').trim()+';\n');
fs.writeFileSync(path.join(racine,'demo.html'),tete('PompierNote · démo','Démo de PompierNote : horaire, classes, élèves, personnel, présences, examens, stock et comptes.')+'<script src="demo/donnees.js"></script>\n<script src="site/connexion.js"></script>\n<script src="demo/connexion-demo.js"></script>\n'+page+'\n</body>\n</html>\n');
fs.writeFileSync(path.join(racine,'index.html'),tete('PompierNote','Horaire, présences, examens et stock de l’Académie des pompiers.')+'<script src="config.js"></script>\n<script src="site/connexion.js"></script>\n<script type="module" src="site/firebase.js"></script>\n'+page+'\n</body>\n</html>\n');
console.log('index.html, demo.html et demo/donnees.js régénérés');
