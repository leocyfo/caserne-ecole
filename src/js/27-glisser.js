/* ---------- Glisser-déposer (administration), à la souris ----------
   Géré avec les événements du pointeur plutôt qu’avec le glisser-déposer du navigateur : pas d’animation
   de retour qui bloque la page, et la carte est toujours remise en place, même en lâchant très vite. */
let DRAG=null, dropEl=null, pendingMain=false, swallowClick=false;
function clearDrop(){if(dropEl){dropEl.classList.remove('drop-ok','drop-swap');dropEl=null;}}
function dropAt(x,y){
  if(!DRAG) return null;
  const el=document.elementFromPoint(x,y);
  if(!el||!el.closest) return null;
  const cell=el.closest('.wk-cell[data-date]');
  if(!cell||cell.dataset.off||cell.dataset.grp!==DRAG.grp) return null;
  const card=el.closest('.cc[data-key]');
  if(card&&card.dataset.key===DRAG.key) return null;
  if(card&&card.dataset.drag==='1') return {type:'swap',el:card,key:card.dataset.key,date:card.dataset.date};
  return {type:'cell',el:cell,date:cell.dataset.date};
}
function endDrag(apply,x,y){
  const d=DRAG;if(!d)return;
  const t=apply&&d.active?dropAt(x,y):null;
  DRAG=null;
  if(d.ghost) d.ghost.remove();
  document.querySelectorAll('.cc.dragging').forEach(n=>n.classList.remove('dragging'));
  document.body.classList.remove('is-dragging');
  clearDrop();
  if(d.active){swallowClick=true;setTimeout(()=>{swallowClick=false;},0);}
  if(pendingMain){pendingMain=false;renderMain();}
  if(t) openMove(d.key,d.date,t.date,t.type==='swap'?t.key:null);
}
document.addEventListener('pointerdown',e=>{
  if(DRAG) endDrag(false);
  if(e.button!==0||e.pointerType==='touch'||S.dr) return;
  const card=e.target&&e.target.closest&&e.target.closest('.cc[data-drag="1"]');
  if(!card) return;
  DRAG={key:card.dataset.key,date:card.dataset.date,grp:card.dataset.grp,x0:e.clientX,y0:e.clientY,active:false,src:card};
});
window.addEventListener('pointermove',e=>{
  const d=DRAG;if(!d)return;
  if(!d.active){
    if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<6) return;
    if(!d.src.isConnected){DRAG=null;return;}
    d.active=true;
    const r=d.src.getBoundingClientRect();d.dx=d.x0-r.left;d.dy=d.y0-r.top;
    const g=d.src.cloneNode(true);g.removeAttribute('id');g.removeAttribute('data-act');g.classList.add('drag-ghost');g.setAttribute('aria-hidden','true');g.style.width=r.width+'px';
    document.body.appendChild(g);d.ghost=g;
    d.src.classList.add('dragging');document.body.classList.add('is-dragging');
  }
  e.preventDefault();
  d.ghost.style.transform=`translate(${e.clientX-d.dx}px,${e.clientY-d.dy}px) rotate(1.5deg)`;
  if(e.clientY>window.innerHeight-48) window.scrollBy(0,14); else if(e.clientY<48) window.scrollBy(0,-14);
  const t=dropAt(e.clientX,e.clientY);
  if(!t){clearDrop();return;}
  if(dropEl!==t.el){clearDrop();dropEl=t.el;dropEl.classList.add(t.type==='swap'?'drop-swap':'drop-ok');}
});
window.addEventListener('pointerup',e=>{if(DRAG)endDrag(true,e.clientX,e.clientY);});
window.addEventListener('pointercancel',()=>endDrag(false));
window.addEventListener('blur',()=>endDrag(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag(false);});
// le clic qui suit un glisser ne doit pas ouvrir le cours
document.addEventListener('click',e=>{if(swallowClick){swallowClick=false;e.preventDefault();e.stopPropagation();}},true);
setInterval(()=>{if(S.conn==='shared')renderMain();},60000);

