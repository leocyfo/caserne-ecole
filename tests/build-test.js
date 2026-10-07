const fs=require('fs');
const page=fs.readFileSync('../src/calendrier-cours.html','utf8');
const seed=fs.readFileSync('seed-full.json','utf8');
const html='<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'
  +'<script>window.__SEED='+seed+';</script><script>'+fs.readFileSync('mock.js','utf8')+'</script>'
  +page+'<script>'+fs.readFileSync('steps.js','utf8')+'</script></body></html>';
fs.writeFileSync('test.html',html);
if(process.argv[2]){
  const h=fs.readFileSync(process.argv[2],'utf8');
  const m=h.match(/<pre id="results">([\s\S]*?)<\/pre>/);
  console.log(m?m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"'):'NO RESULTS, len='+h.length);
}
