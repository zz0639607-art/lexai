/* Dock the companion in document flow on narrow screens; sheets stay outside
   glass surfaces so their fixed positioning follows the visual viewport. */
(()=>{
 'use strict';
 const pet=document.getElementById('lexPet'),panel=document.getElementById('petPanel');
 const menu=document.getElementById('mobileMenu'),modal=document.getElementById('authModal');
 const tools=document.querySelector('#tool .workspace-nav'),motion=document.getElementById('motionToggle');
 const footer=document.querySelector('footer'),query=window.matchMedia('(max-width:700px), (max-width:1100px) and (max-height:500px)');
 const petHome=document.createComment('Lex desktop position'),panelHome=document.createComment('Lex panel position');
 pet.before(petHome);panel.before(panelHome);
 const motionHome=document.createComment('Animation control position');if(motion)motion.before(motionHome);
 const backdrop=document.createElement('div');backdrop.className='pet-sheet-backdrop';backdrop.setAttribute('aria-hidden','true');document.body.appendChild(backdrop);
 backdrop.addEventListener('click',()=>window.lexPet.close());
 function sheetState(){
  const active=query.matches&&!panel.hidden;
  document.body.classList.toggle('pet-sheet-open',active);
  panel.setAttribute('aria-modal',String(active));
 }
 function layout(){
  if(!panel.hidden)window.lexPet.close();
  document.body.classList.toggle('mobile-layout',query.matches);
  if(query.matches){tools.before(pet);document.body.appendChild(panel);if(motion&&footer)footer.appendChild(motion);}
  else{petHome.after(pet);panelHome.after(panel);if(motion)motionHome.after(motion);}
  sheetState();
 }
 function visibleViewport(){
  const viewport=window.visualViewport;
  document.documentElement.style.setProperty('--visible-height',(viewport?.height||window.innerHeight)+'px');
  document.documentElement.style.setProperty('--visible-top',(viewport?.offsetTop||0)+'px');
 }
 function overlays(){
  if(menu.classList.contains('open')||modal.classList.contains('open')){
   if(!panel.hidden)window.lexPet.close();
   const more=document.getElementById('workspaceMore');if(more)more.open=false;
  }
 }
 new MutationObserver(sheetState).observe(panel,{attributes:true,attributeFilter:['hidden']});
 const overlayObserver=new MutationObserver(overlays);for(const node of [menu,modal])overlayObserver.observe(node,{attributes:true,attributeFilter:['class']});
 document.addEventListener('keydown',event=>{
  if(event.key!=='Tab'||modal.classList.contains('open'))return;
  const active=menu.classList.contains('open')?menu:query.matches&&!panel.hidden?panel:null;if(!active)return;
  const items=[...active.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(node=>node.getClientRects().length&&!node.hidden);
  if(!items.length)return;const first=items[0],last=items[items.length-1];
  if(!active.contains(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus();}
  else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 query.addEventListener('change',layout);window.addEventListener('resize',visibleViewport);
 window.visualViewport?.addEventListener('resize',visibleViewport);window.visualViewport?.addEventListener('scroll',visibleViewport);
 visibleViewport();layout();
})();
