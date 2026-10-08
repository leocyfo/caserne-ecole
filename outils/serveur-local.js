// Petit serveur web pour essayer le site sur cet ordinateur : node outils/serveur-local.js [port]
// Puis ouvrir http://localhost:8080/ dans le navigateur. Ctrl+C pour arrêter.
const http=require('http'), fs=require('fs'), path=require('path');
const racine=path.join(__dirname,'..');
const port=+(process.argv[2]||8080);
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p.endsWith('/')) p+='index.html';
  const fichier=path.normalize(path.join(racine,p));
  if(!fichier.startsWith(racine)){res.writeHead(403);res.end('Interdit');return;}
  fs.readFile(fichier,(err,data)=>{
    if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page introuvable');return;}
    res.writeHead(200,{'Content-Type':TYPES[path.extname(fichier)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Caserne-École : http://localhost:${port}/  (Ctrl+C pour arrêter)`));
