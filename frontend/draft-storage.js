/* Optional, account-scoped local draft storage. No network requests. */
(()=>{
 'use strict';
 const fields={genType:100,genCountry:100,genPartyA:500,genPartyB:500,genDetails:6000,genLang:100};
 const ids=Object.keys(fields),maxAge=7*24*60*60*1000;
 const el=id=>document.getElementById(id),scopeFor=user=>user?.id!=null?'user:'+String(user.id):'guest';
 const owner=()=>scopeFor(typeof authUser!=='undefined'?authUser:null);
 const text=(key,values={})=>Object.entries(values).reduce((s,[k,v])=>s.replace('{'+k+'}',String(v)),LANGS[currentLang]?.[key]||LANGS.en[key]||key);
 let ready=false,changing=false,scope='',enabled=false,available=true,dirty=false,pending=false,candidate=null,rawSeen=null,lastSaved='',timer=null;
 let message='local_draft_wait',messageValues={},confirmation=null;
 function dismissConfirmation(){confirmation=null;el('localDraftConfirm').hidden=true;}
 function ask(key,action,returnTo){confirmation={key,action,returnTo};el('localDraftConfirmText').textContent=text(key);el('localDraftConfirm').hidden=false;el('localDraftConfirmCancel').focus({preventScroll:true});}
 const recordKey=()=> 'lexai_draft_v1:'+scope,preferenceKey=()=> 'lexai_draft_enabled_v1:'+scope;
 const time=value=>new Date(value).toLocaleString(currentLang.startsWith('zh')?'zh-CN':'en-US');
 function busy(){return generatePending||exportPending;}
 function capture(){return {fields:Object.fromEntries(ids.map(id=>[id,el(id).value])),draft:generatedDraft?{title:generatedDraft.title,document:generatedDraft.document}:null};}
 const fingerprint=content=>JSON.stringify(content);
 const meaningful=content=>!!(content.fields.genDetails.trim()||content.fields.genPartyA.trim()||content.fields.genPartyB.trim()||content.draft?.document.trim());
 function valid(content){
  if(!content||!content.fields||!ids.every(id=>typeof content.fields[id]==='string'&&content.fields[id].length<=fields[id]))return false;
  return content.draft===null||(content.draft&&typeof content.draft.title==='string'&&content.draft.title.length<=300&&typeof content.draft.document==='string'&&content.draft.document.length<=100000&&!!content.draft.document.trim());
 }
 function decode(raw){
  if(!raw)return null;if(raw.length>240000)throw Error('invalid');
  let record;try{record=JSON.parse(raw);}catch{throw Error('invalid');}
  if(!record||typeof record.updatedAt!=='string')throw Error('invalid');
  const date=Date.parse(record.updatedAt);
  if(record.version!==1||record.owner!==scope||!Number.isFinite(date)||date>Date.now()+60000||!valid(record.content))throw Error('invalid');
  if(Date.now()-date>maxAge){localStorage.removeItem(recordKey());message='local_draft_expired';return null;}
  return record;
 }
 function read(){rawSeen=localStorage.getItem(recordKey());candidate=decode(rawSeen);if(!candidate&&!localStorage.getItem(recordKey()))rawSeen=null;return candidate;}
 function show(key,values={}){message=key;messageValues=values;refresh();}
 function refresh(){
  if(confirmation)el('localDraftConfirmText').textContent=text(confirmation.key);
  el('localDraftEnabled').checked=enabled;el('localDraftEnabled').disabled=!ready||!available;
  el('localDraftSave').disabled=!ready||!available||!enabled||busy();
  el('localDraftRestore').disabled=!ready||!candidate||busy();el('localDraftClear').disabled=!ready||!available||!rawSeen;
  const values={...messageValues};if(values.time)values.time=time(values.time);
  el('localDraftStatus').textContent=text(message,values);
  el('localDraftStatus').dataset.state=['local_draft_failed','local_draft_invalid','local_draft_unavailable'].includes(message)?'error':'normal';
 }
 function loadScope(){
  dismissConfirmation();scope=owner();enabled=false;candidate=null;rawSeen=null;lastSaved='';pending=false;dirty=false;available=true;message='local_draft_off';messageValues={};
  try{enabled=localStorage.getItem(preferenceKey())==='1';const found=read();
   if(found){pending=true;show('local_draft_available',{time:found.updatedAt});}
   else if(message!=='local_draft_expired')show(enabled?'local_draft_on':'local_draft_off');
  }catch(error){if(error.message==='invalid'){pending=true;show('local_draft_invalid');}else{available=false;enabled=false;show('local_draft_unavailable');}}
  dirty=meaningful(capture());refresh();
 }
 function changed(){
  if(!ready||changing)return;dismissConfirmation();const content=capture();dirty=fingerprint(content)!==lastSaved;
  clearTimeout(timer);refresh();if(enabled&&dirty&&!pending&&meaningful(content))timer=setTimeout(()=>save(false),600);
 }
 function save(manual=false,confirmed=false){
  clearTimeout(timer);if(!ready||changing||!enabled||!available||(!manual&&!dirty))return false;
  const content=capture();if(!meaningful(content)){if(manual)show('local_draft_empty');return false;}
  if(!valid(content)){show('local_draft_failed');return false;}
  try{
   const raw=localStorage.getItem(recordKey());
   if(raw!==rawSeen){rawSeen=raw;try{candidate=decode(raw);}catch{candidate=null;}pending=!!raw;show('local_draft_conflict');}
   if(pending){if(!manual)return false;if(!confirmed){ask('local_draft_replace',()=>save(true,true),'localDraftSave');return false;}}
   const record={version:1,owner:scope,updatedAt:new Date().toISOString(),content},serialized=JSON.stringify(record);
   localStorage.setItem(recordKey(),serialized);rawSeen=serialized;candidate=record;lastSaved=fingerprint(content);pending=false;dirty=false;
   show('local_draft_saved',{time:record.updatedAt});return true;
  }catch{show('local_draft_failed');return false;}
 }
 function restore(confirmed=false){
  if(!ready||busy())return;
  try{const record=read();if(!record){candidate=null;refresh();return;}
   pending=true;const current=capture();if(meaningful(current)&&fingerprint(current)!==fingerprint(record.content)&&!confirmed){ask('local_draft_overwrite',()=>restore(true),'localDraftRestore');return;}
   changing=true;generateEpoch++;
   for(const id of ids){const node=el(id),value=record.content.fields[id];if(!node.options||Array.from(node.options).some(option=>option.value===value))node.value=value;}
   generatedDraft=record.content.draft?{...record.content.draft}:null;draftNeedsDownload=!!generatedDraft;
   el('generatedTitle').textContent=generatedDraft?.title||'';el('generatedDocument').value=generatedDraft?.document||'';el('generateResult').hidden=!generatedDraft;
   generateStatusKey=generatedDraft?'generate_restored':'';generateError='';updateGenerateUI();
   lastSaved=fingerprint(record.content);pending=false;dirty=fingerprint(capture())!==lastSaved;show('local_draft_restored');
  }catch(error){show(error.message==='invalid'?'local_draft_invalid':'local_draft_unavailable');}
  finally{changing=false;refresh();}
 }
 function clear(confirmed=false){
  if(!ready)return;if(!confirmed){ask('local_draft_delete',()=>clear(true),'localDraftClear');return;}
  try{localStorage.removeItem(recordKey());localStorage.removeItem(preferenceKey());clearTimeout(timer);enabled=false;candidate=null;rawSeen=null;lastSaved='';pending=false;dirty=meaningful(capture());show('local_draft_cleared');}
  catch{show('local_draft_failed');}
 }
 function isCurrentSaved(){
  if(!ready||!available)return false;
  try{const record=decode(localStorage.getItem(recordKey()));return !!record&&fingerprint(record.content)===fingerprint(capture());}catch{return false;}
 }
 function beforeAccountChange(nextUser){
  if(!ready||scope===scopeFor(nextUser))return;
  dismissConfirmation();save(false);clearTimeout(timer);
  // Preserve unsent visitor requirements on first sign-in. Clear an account's
  // private result before moving to a guest or a different account.
  if(scope!=='guest'||generatedDraft){
   changing=true;generateEpoch++;generatedDraft=null;draftNeedsDownload=false;generatePending=false;exportPending=false;
   el('generateForm').reset();el('generatedTitle').textContent='';el('generatedDocument').value='';el('generateResult').hidden=true;
   generateStatusKey='';generateError='';updateGenerateUI();changing=false;
  }
 }
 function authChanged(){if(ready&&owner()!==scope)loadScope();}
 function init(){if(ready)return;ready=true;loadScope();}
 el('localDraftEnabled').addEventListener('change',()=>{
  if(!ready)return;dismissConfirmation();try{enabled=el('localDraftEnabled').checked;localStorage.setItem(preferenceKey(),enabled?'1':'0');
   if(enabled){if(pending)show(candidate?'local_draft_available':'local_draft_invalid',candidate?{time:candidate.updatedAt}:{});else{show('local_draft_on');dirty=true;save(false);}}
   else{clearTimeout(timer);show(rawSeen?'local_draft_retained':'local_draft_off');}
  }catch{enabled=false;show('local_draft_failed');}refresh();
 });
 el('localDraftSave').addEventListener('click',()=>save(true));el('localDraftRestore').addEventListener('click',()=>restore());el('localDraftClear').addEventListener('click',()=>clear());
 el('localDraftConfirmCancel').addEventListener('click',()=>{const target=confirmation?.returnTo;dismissConfirmation();if(target)el(target).focus({preventScroll:true});});
 el('localDraftConfirmYes').addEventListener('click',()=>{const action=confirmation?.action,target=confirmation?.returnTo;dismissConfirmation();if(action)action();if(target)el(target).focus({preventScroll:true});});
 el('localDraftConfirm').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();el('localDraftConfirmCancel').click();}});
 for(const id of ids)for(const event of ['input','change'])el(id).addEventListener(event,changed);
 window.addEventListener('pagehide',()=>save(false));document.addEventListener('visibilitychange',()=>{if(document.hidden)save(false);});
 window.addEventListener('storage',event=>{
  if(!ready)return;dismissConfirmation();
  if(event.key===preferenceKey()||event.key===null){try{enabled=localStorage.getItem(preferenceKey())==='1';}catch{enabled=false;}if(!enabled)clearTimeout(timer);refresh();}
  if(event.key===recordKey()||event.key===null){clearTimeout(timer);try{const found=read();pending=!!rawSeen;dirty=meaningful(capture())&&!isCurrentSaved();show(found?'local_draft_conflict':rawSeen?'local_draft_invalid':enabled?'local_draft_on':'local_draft_off');}catch{show('local_draft_unavailable');}}
 });
 window.localDrafts={refresh,flush:()=>save(false),draftChanged:changed,isCurrentSaved,hasUnsavedInputs:()=>ready&&dirty&&meaningful(capture())&&!isCurrentSaved(),beforeAccountChange,authChanged};
 refresh();const restoring=typeof sessionPromise!=='undefined'?sessionPromise:null;if(restoring)Promise.resolve(restoring).then(init,init);else init();
})();
