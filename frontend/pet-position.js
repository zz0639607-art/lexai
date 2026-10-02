/* Only normalized display coordinates are stored; no account or document data. */
(()=>{
 'use strict';
 const root=document.getElementById('lexPet'),panel=document.getElementById('petPanel');
 const launcher=document.getElementById('petLauncher'),wake=document.getElementById('petWake');
 const query=window.matchMedia('(max-width:700px), (max-width:1100px) and (max-height:500px)');
 const storageKey='lexai_pet_position';
 let position={desktop:null,mobile:0},gesture=null,suppressUntil=0;
 const valid=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1;
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){if(valid(saved.desktop?.x)&&valid(saved.desktop?.y))position.desktop={x:saved.desktop.x,y:saved.desktop.y};if(valid(saved.mobile))position.mobile=saved.mobile;}}catch{}
 const clamp=(n,min,max)=>Math.max(min,Math.min(Math.max(min,max),n));
 const anchor=()=>launcher.hidden?wake:launcher;
 function bounds(){
  const box=anchor().getBoundingClientRect(),header=document.querySelector('body>nav')?.getBoundingClientRect();
  const width=window.innerWidth,height=window.innerHeight,top=Math.max(12,(header?.bottom||0)+12);
  return {width,height,minX:12,maxX:Math.max(12,width-box.width-12),minY:12,maxY:Math.max(12,height-box.height-top)};
 }
 function mobileWidth(){const box=root.getBoundingClientRect(),style=getComputedStyle(root);return Math.max(0,box.width-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0)-anchor().getBoundingClientRect().width);}
 function store(){try{localStorage.setItem(storageKey,JSON.stringify(position));}catch{}}
 function placePanel(){
  if(query.matches){for(const key of ['left','right','top','bottom','maxHeight'])panel.style[key]='';return;}
  const {width,height}=bounds(),header=document.querySelector('body>nav')?.getBoundingClientRect();
  const minTop=Math.max(12,(header?.bottom||0)+12);panel.style.maxHeight=Math.max(80,height-minTop-12)+'px';
  if(panel.hidden)return;
  const target=anchor().getBoundingClientRect(),box=panel.getBoundingClientRect();
  let left=target.right-box.width;
  if(target.left-box.width-12>=12)left=target.left-box.width-12;
  else if(target.right+box.width+12<=width-12)left=target.right+12;
  const top=target.top-box.height-12>=minTop?target.top-box.height-12:clamp(target.top,minTop,height-box.height-12);
  panel.style.left=clamp(left,12,width-box.width-12)+'px';panel.style.right='auto';panel.style.top=top+'px';panel.style.bottom='auto';
 }
 function refresh(){
  if(query.matches){root.style.left='';root.style.right='';root.style.top='';root.style.bottom='';root.style.setProperty('--pet-mobile-x',(position.mobile*mobileWidth())+'px');root.classList.toggle('pet-edge-left',false);root.classList.toggle('pet-edge-top',false);}
  else{
   root.style.removeProperty('--pet-mobile-x');
   const b=bounds(),saved=position.desktop;
   const x=saved?b.minX+saved.x*(b.maxX-b.minX):b.width-anchor().getBoundingClientRect().width-22;
   const y=saved?b.minY+saved.y*(b.maxY-b.minY):18;
   root.style.left=clamp(x,b.minX,b.maxX)+'px';root.style.right='auto';root.style.top='auto';root.style.bottom=clamp(y,b.minY,b.maxY)+'px';
   root.classList.toggle('pet-edge-left',x<218);root.classList.toggle('pet-edge-top',b.height-y-anchor().getBoundingClientRect().height<100);
  }
  placePanel();
 }
 function move(x,y){
  if(query.matches){const available=mobileWidth();position.mobile=available?clamp(x,0,available)/available:0;}
  else{const b=bounds();position.desktop={x:b.maxX>b.minX?(clamp(x,b.minX,b.maxX)-b.minX)/(b.maxX-b.minX):0,y:b.maxY>b.minY?(clamp(y,b.minY,b.maxY)-b.minY)/(b.maxY-b.minY):0};}
  refresh();
 }
 function reset(){position={desktop:null,mobile:0};try{localStorage.removeItem(storageKey);}catch{}refresh();}
 function finish(event,cancel=false){
  if(!gesture||event.pointerId!==gesture.id)return;
  if(gesture.dragged){if(cancel){position=gesture.before;refresh();}else store();suppressUntil=Date.now()+500;event.preventDefault();}
  const target=gesture.target;gesture=null;root.classList.toggle('pet-dragging',false);try{target.releasePointerCapture(event.pointerId);}catch{}
 }
 for(const target of [launcher,wake]){
  target.addEventListener('pointerdown',event=>{
   if(event.button!==0||event.isPrimary===false||gesture)return;
   const box=anchor().getBoundingClientRect();gesture={id:event.pointerId,target,startX:event.clientX,startY:event.clientY,x:query.matches?position.mobile*mobileWidth():box.left,y:window.innerHeight-box.bottom,dragged:false,before:JSON.parse(JSON.stringify(position))};
   try{target.setPointerCapture(event.pointerId);}catch{}
  });
  target.addEventListener('pointermove',event=>{
   if(!gesture||event.pointerId!==gesture.id)return;const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
   if(!gesture.dragged&&Math.hypot(dx,dy)<6)return;
   if(!gesture.dragged){gesture.dragged=true;window.lexPet.close();window.lexPet.dismissBubble();root.classList.toggle('pet-dragging',true);}
   event.preventDefault();const logicalX=query.matches&&getComputedStyle(root).direction==='rtl'?-dx:dx;move(gesture.x+logicalX,gesture.y-dy);
  });
  target.addEventListener('pointerup',event=>finish(event));target.addEventListener('pointercancel',event=>finish(event,true));
  target.addEventListener('lostpointercapture',event=>finish(event,true));
  target.addEventListener('click',event=>{if(Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  target.addEventListener('keydown',event=>{
   const arrows={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};const delta=arrows[event.key];
   if(!delta||!panel.hidden||(query.matches&&delta[1]))return;
   event.preventDefault();window.lexPet.dismissBubble();const step=event.shiftKey?32:16,box=anchor().getBoundingClientRect();
   const sign=query.matches&&getComputedStyle(root).direction==='rtl'?-1:1;
   move((query.matches?position.mobile*mobileWidth():box.left)+delta[0]*step*sign,window.innerHeight-box.bottom+delta[1]*step);store();
  });
 }
 document.getElementById('petResetPosition').addEventListener('click',reset);
 new MutationObserver(refresh).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden']});
 new MutationObserver(placePanel).observe(panel,{attributes:true,attributeFilter:['hidden']});
 query.addEventListener('change',()=>{if(gesture)finish({pointerId:gesture.id,preventDefault(){}},true);refresh();});
 window.addEventListener('resize',refresh);
 window.lexPetPosition={refresh,reset};refresh();
})();
