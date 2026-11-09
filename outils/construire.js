// Régénère index.html (site avec connexion), demo.html (démo), demo/donnees.js et les options/<nom>.js présents à partir de src/.
const fs=require('fs'), path=require('path');
const racine=path.join(__dirname,'..');
const lire=rel=>fs.readFileSync(path.join(racine,rel),'utf8');
const {assembler,option,nomsOptions}=require('./assembler.js'), page0=assembler();
/* Le haut de la coquille (polices, styles) va dans le <head>, et son <title> est remplacé par celui de chaque page :
   rien de cela dans le <body>, pour un HTML valide (validator.w3.org). Le <body> commence au lien « Aller au contenu ». */
const coupe=page0.indexOf('<a class="skip"');
if(coupe<0) throw new Error('page.html : le lien « Aller au contenu » (<a class="skip">) doit ouvrir le <body>');
const hautPage=page0.slice(0,coupe).replace(/<title>[^<]*<\/title>\n?/,'').trimEnd()+'\n', page=page0.slice(coupe);
const tete=(titre,desc)=>'<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<title>'+titre+'</title>\n<meta name="description" content="'+desc+'">\n<meta name="author" content="PompierNote">\n<link rel="icon" type="image/svg+xml" href="site/embleme.svg">\n<link rel="apple-touch-icon" href="site/icone-180.png">\n'+hautPage+'</head>\n<body>\n';
fs.writeFileSync(path.join(racine,'demo/donnees.js'),'/* Données d’exemple (générées par outils/construire.js) */\nwindow.__SEED='+lire('tests/seed-academy.json').trim()+';\n');
fs.writeFileSync(path.join(racine,'demo.html'),tete('PompierNote (démo) · Académie des pompiers','Démo de PompierNote : horaire, classes, élèves, personnel, présences, examens, stock et comptes.')+'<script src="demo/donnees.js"></script>\n<script src="site/connexion.js"></script>\n<script src="demo/connexion-demo.js"></script>\n'+page+'\n</body>\n</html>\n');
fs.writeFileSync(path.join(racine,'index.html'),tete('PompierNote · Académie des pompiers','Horaire, présences, examens et stock de l’Académie des pompiers.')+'<script src="config.js"></script>\n<script src="site/connexion.js"></script>\n<script type="module" src="site/firebase.js"></script>\n'+page+'\n</body>\n</html>\n');
/* une option n’est reconstruite que si son fichier est là : l’enlever la retire du site (voir options.js) */
const presentes=nomsOptions().filter(k=>fs.existsSync(path.join(racine,'options',k+'.js')));
for(const k of presentes) fs.writeFileSync(path.join(racine,'options',k+'.js'),option(k));
console.log('index.html, demo.html, demo/donnees.js et options/ ('+(presentes.join(', ')||'aucune')+') régénérés');
