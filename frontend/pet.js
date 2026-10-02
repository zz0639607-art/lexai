/* Lex keeps document text in memory only. Advanced actions always recheck the server. */
(()=>{
 'use strict';
 const copy={
 zh:{name:'Lex · 合同小助手',free:'基础陪伴',advanced:'高级助手',welcome:'你好，我是 Lex。一起把合同看清楚。',idle:'准备好了，今天先看哪份合同？',thinking:'让我梳理一下这个问题…',working:'正在认真阅读，请给我一点时间。',happy:'这一步完成了，记得核对重要内容。',alert:'有需要留意的地方，我们一起核对。',sleep:'我安静待命，点一下就醒来。',preview:'表情预览 · ',open:'打开 Lex 小宠物',close:'关闭面板',mood_idle:'待命',mood_thinking:'思考',mood_working:'专注',mood_happy:'开心',mood_alert:'提醒',mood_sleep:'休息',about:'我是 AI 合同阅读助手，不是律师。表情随操作变化，不代表法律结论。',analyze:'分析合同',generate:'生成草稿',history:'合同历史',reminders:'事项提醒',premium:'高级协作',auto:'完成后自动下载',format:'下载格式',speech:'开启本地朗读',read:'朗读结果',pause:'暂停 / 继续',stop:'停止',speed:'朗读速度',locked:'自动下载和朗读随有效专业版解锁。付费开通尚未开放，基础陪伴可直接使用。',advanced_ready:'高级权限已启用。自动下载与朗读默认关闭，可分别开启。',download_note:'开启后，新完成的分析报告、草稿及改写会请求下载。保存位置由浏览器决定；若被拦截，可手动重试。',speech_note:'只使用设备可用的本地声音。开启后仍需点击“朗读结果”；离开页面或退出账户会停止。',hide:'收起宠物',motion:'暂停宠物动画',wake:'唤醒 Lex',plans:'查看版本区别',no_result:'先完成一次分析、生成或问答，我就能陪你读结果。',no_voice:'当前浏览器没有适合这段内容的本地声音，可安装系统语音包后重试。',speaking:'正在朗读，可随时暂停或停止。',paused:'朗读已暂停。',stopped:'朗读已停止。',read_done:'朗读完成。',read_error:'朗读未能继续，请检查本地语音设置。',failed:'这次操作没有完成，请查看页面提示后重试。',downloaded:'已请求下载，请查看浏览器下载记录；如果被拦截，请点“重试下载”。',download_failed:'自动下载未完成，可点“重试下载”重新保存。',retry:'重试下载',off:'本次会话已关闭高级自动操作。',enabled:'已开启，仅对本次登录期间的新结果生效。',too_long:'结果过长，请使用页面的手动下载功能。',tier_check:'正在确认账户权限…',unavailable:'暂时无法确认高级权限，请稍后重试。',plan_free:'Lex 基础宠物：六种情绪、任务提醒与快捷入口',plan_pro:'Lex 高级宠物：自动下载与可开启朗读',plan_business:'包含 Lex 高级宠物的全部功能'},
 en:{name:'Lex · Your contract companion',free:'Free companion',advanced:'Advanced assistant',welcome:'Hi, I’m Lex. Let’s make sense of your contract.',idle:'Ready when you are. Which contract is next?',thinking:'Let me think through that question…',working:'Reading carefully. This may take a moment.',happy:'This step is done. Review the important details.',alert:'There is something to check. Let’s look together.',sleep:'Resting quietly. Tap to wake me.',preview:'Expression preview · ',open:'Open Lex companion',close:'Close panel',mood_idle:'Ready',mood_thinking:'Thinking',mood_working:'Focused',mood_happy:'Happy',mood_alert:'Alert',mood_sleep:'Resting',about:'I am an AI contract-reading assistant, not a lawyer. Expressions reflect task state, not legal conclusions.',analyze:'Analyze',generate:'Draft',history:'History',reminders:'Reminders',premium:'Advanced collaboration',auto:'Download on completion',format:'Download format',speech:'Enable local read-aloud',read:'Read result',pause:'Pause / resume',stop:'Stop',speed:'Reading speed',locked:'An active Pro plan unlocks downloads and speech. Paid sign-up is not available yet; the free companion is ready to use.',advanced_ready:'Advanced access is active. Downloads and speech start off; enable each separately.',download_note:'New analysis reports, drafts and rewrites request a download when enabled. Your browser controls the save location and may block automatic downloads.',speech_note:'Uses available local device voices only. Click “Read result” to begin. Leaving the page or signing out stops speech.',hide:'Minimize pet',motion:'Pause pet animation',wake:'Wake Lex',plans:'Compare versions',no_result:'Complete an analysis, draft or question first, then I can read the result.',no_voice:'No suitable local voice is available. Install a system voice and try again.',speaking:'Reading aloud. Pause or stop at any time.',paused:'Reading paused.',stopped:'Reading stopped.',read_done:'Reading complete.',read_error:'Speech could not continue. Check your local voice settings.',failed:'That task did not finish. Check the page message and try again.',downloaded:'Download requested. Check your browser downloads; use “Retry download” if it was blocked.',download_failed:'The download did not finish. Use “Retry download” to save again.',retry:'Retry download',off:'Advanced automatic actions are off for this session.',enabled:'Enabled for new results during this sign-in only.',too_long:'This result is too long. Use the page’s manual download tools.',tier_check:'Checking account access…',unavailable:'Could not confirm advanced access. Try again later.',plan_free:'Lex basic pet: six expressions, task alerts and shortcuts',plan_pro:'Lex advanced pet: automatic downloads and optional read-aloud',plan_business:'Includes all Lex advanced pet features'}
 };
 Object.assign(copy.zh,{drag_note:'拖动宠物可调整位置，方向键可微调。手机上可在工作台内左右移动，避免遮挡内容。',reset_position:'重置宠物位置'});
 Object.assign(copy.en,{drag_note:'Drag Lex to move it; use arrow keys for small adjustments. On mobile, move it within the workbench without covering content.',reset_position:'Reset position'});
 const state={owner:null,epoch:0,seq:0,check:0,tier:'free',expires:null,auto:false,speech:false,mood:'idle',jobs:new Map(),last:null,reading:false,speechId:0,exporting:false,hidden:false,still:false,bubbleVisible:false};
 const watched={'/api/analyze':'analysis','/api/analyze/upload':'analysis','/api/generate':'draft','/api/chat':'chat','/api/contract-qa':'qa','/api/rewrite-clause':'rewrite'};
 const t=key=>(copy[typeof currentLang==='string'&&currentLang.startsWith('zh')?'zh':'en'][key]||copy.en[key]||key);
 const owner=()=>typeof authUser!=='undefined'&&authUser?.id||null;
 let idleTimer,previewTimer,bubbleTimer,downloadQueue=Promise.resolve();
 const root=document.createElement('aside');root.id='lexPet';root.setAttribute('aria-label','Lex companion');
 root.innerHTML=`<div id="petPanel" class="pet-panel" role="dialog" aria-modal="false" aria-labelledby="petTitle" hidden>
 <header class="pet-panel-header"><div><div class="pet-kicker">LEX COMPANION</div><h3 id="petTitle" data-pet-copy="name"></h3><small id="petTier"></small></div><button id="petClose" class="pet-close" data-pet-aria="close">×</button></header>
 <p class="pet-note" data-pet-copy="about"></p><div class="pet-moods" id="petMoods">${['idle','thinking','working','happy','alert','sleep'].map(m=>`<button type="button" data-pet-mood="${m}" data-pet-copy="mood_${m}" aria-pressed="false"></button>`).join('')}</div>
 <div class="pet-links"><button data-pet-panel="analyze" data-pet-copy="analyze"></button><button data-pet-panel="generate" data-pet-copy="generate"></button><button data-pet-panel="library" data-pet-copy="history"></button><button data-pet-panel="reminders" data-pet-copy="reminders"></button></div>
 <section class="pet-premium"><h4 data-pet-copy="premium"></h4><p id="petLock" class="pet-lock"></p>
 <label class="pet-toggle"><span data-pet-copy="auto"></span><input type="checkbox" id="petAuto"></label>
 <label for="petFormat" class="pet-note" data-pet-copy="format"></label><select id="petFormat"><option value="txt">TXT</option><option value="docx">Word</option><option value="pdf">PDF</option></select>
 <p class="pet-note" data-pet-copy="download_note"></p><button id="petRetry" class="pet-pricing-link" data-pet-copy="retry" hidden></button>
 <label class="pet-toggle"><span data-pet-copy="speech"></span><input type="checkbox" id="petSpeech"></label><p class="pet-note" data-pet-copy="speech_note"></p>
 <label for="petRate" class="pet-note" data-pet-copy="speed"></label><select id="petRate"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option></select>
 <div class="pet-read-actions"><button id="petRead" data-pet-copy="read"></button><button id="petPause" data-pet-copy="pause"></button><button id="petStop" data-pet-copy="stop"></button></div>
 <div id="petStatus" class="pet-status" role="status" aria-live="polite"></div></section>
 <p class="pet-note" data-pet-copy="drag_note"></p><label class="pet-toggle"><span data-pet-copy="motion"></span><input id="petStill" type="checkbox"></label><div class="pet-foot"><button id="petResetPosition" data-pet-copy="reset_position"></button><button id="petPlans" data-pet-copy="plans"></button><button id="petHide" data-pet-copy="hide"></button></div></div>
 <div class="pet-bubble" id="petBubble" aria-live="polite" hidden></div><button class="pet-launcher" id="petLauncher" type="button" aria-controls="petPanel" aria-expanded="false" data-pet-aria="open"><span id="petSprite" class="lex-sprite" data-mood="idle" aria-hidden="true"></span><span class="pet-name-tag">LEX</span></button><button id="petWake" class="pet-wake" data-pet-copy="wake" hidden></button>`;
 document.body.appendChild(root);
 const el=id=>document.getElementById(id);
 function status(key){el('petStatus').textContent=t(key);}
 function persist(){try{localStorage.setItem('lexai_pet_preferences',JSON.stringify({hidden:state.hidden,still:state.still}));}catch{}}
 function dismissBubble(){clearTimeout(bubbleTimer);state.bubbleVisible=false;el('petBubble').hidden=true;}
 function showBubble(message){
  if(!el('petPanel').hidden){dismissBubble();return;}
  clearTimeout(bubbleTimer);el('petBubble').textContent=message;state.bubbleVisible=true;el('petBubble').hidden=state.hidden;
  bubbleTimer=setTimeout(dismissBubble,6000);
 }
 function setMood(mood,bubble){
  const changed=state.mood!==mood;state.mood=mood;el('petSprite').dataset.mood=mood;el('petLauncher').dataset.mood=mood;
  if(bubble||(changed&&!['idle','sleep'].includes(mood)))showBubble(bubble||t(mood));
  else if(state.bubbleVisible)el('petBubble').textContent=t(mood);
  el('petPanel').querySelectorAll('[data-pet-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.petMood===mood)));
 }
 function activeMood(){return state.jobs.size?[...state.jobs.values()].at(-1).kind==='chat'||[...state.jobs.values()].at(-1).kind==='qa'?'thinking':'working':'idle';}
 function idle(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(!state.jobs.size&&!state.reading&&el('petPanel').hidden)setMood('sleep');},90000);}
 function refresh(){
  document.querySelectorAll('[data-pet-copy]').forEach(n=>{n.textContent=t(n.dataset.petCopy);});
  document.querySelectorAll('[data-pet-aria]').forEach(n=>n.setAttribute('aria-label',t(n.dataset.petAria)));
  el('petTier').textContent=t(state.tier==='advanced'?'advanced':'free');el('petLock').textContent=t(state.tier==='advanced'?'advanced_ready':'locked');
  for(const id of ['petAuto','petFormat','petSpeech','petRate'])el(id).disabled=state.tier!=='advanced';
  el('petAuto').checked=state.auto;el('petSpeech').checked=state.speech;el('petStill').checked=state.still;
  el('petRead').disabled=state.tier!=='advanced'||!state.speech;el('petPause').disabled=!state.reading;el('petStop').disabled=!state.reading;
  el('petLauncher').hidden=state.hidden;el('petBubble').hidden=state.hidden||!state.bubbleVisible;el('petWake').hidden=!state.hidden;
  root.classList.toggle('pet-still',state.still||!!el('motionToggle')?.checked);setMood(state.mood);
 }
 function stopReading(announce=true){state.speechId++;state.reading=false;window.speechSynthesis?.cancel();if(announce)status('stopped');refresh();}
 async function checkAccess(){
  const uid=owner(),epoch=state.epoch,check=++state.check;if(!uid)return;
  try{const data=await(await apiFetch('/api/pet/features')).json();if(epoch!==state.epoch||uid!==owner()||check!==state.check)return;
   state.tier=data.tier==='advanced'&&data.auto_download===true&&data.read_aloud===true?'advanced':'free';state.expires=data.expires_at;
   if(state.tier!=='advanced'){state.auto=false;state.speech=false;stopReading(false);}refresh();
  }catch{if(epoch===state.epoch&&check===state.check){state.tier='free';state.auto=false;state.speech=false;stopReading(false);status('unavailable');}}
 }
 function authChanged(){if(state.owner!==owner()){state.owner=owner();state.epoch++;state.jobs.clear();state.last=null;state.auto=false;state.speech=false;state.exporting=false;state.tier='free';state.expires=null;el('petRetry').hidden=true;stopReading(false);setMood('idle');status('off');}void checkAccess();refresh();}
 async function authorize(feature){const epoch=state.epoch,uid=owner();if(!uid||state.tier!=='advanced')return false;
  try{const data=await(await apiFetch('/api/pet/authorize',{method:'POST',body:JSON.stringify({feature})})).json();return data.allowed===true&&epoch===state.epoch&&uid===owner();}
  catch{if(epoch===state.epoch){state.auto=false;state.speech=false;stopReading(false);void checkAccess();status('unavailable');}return false;}
 }
 function open(){state.hidden=false;persist();refresh();el('petPanel').hidden=false;el('petLauncher').setAttribute('aria-expanded','true');if(!state.jobs.size)setMood('happy');dismissBubble();el('petClose').focus();void checkAccess();idle();}
 function close(){const wasOpen=!el('petPanel').hidden;el('petPanel').hidden=true;el('petLauncher').setAttribute('aria-expanded','false');if(wasOpen)el('petLauncher').focus({preventScroll:true});idle();}
 function resultText(kind,data){
  if(kind==='draft')return {title:String(data.title||'Contract draft'),text:String(data.document||'')};
  if(kind==='analysis')return {title:'LexAI · '+(typeof currentLang==='string'&&currentLang.startsWith('zh')?'合同分析报告':'Contract report'),text:[data.executive_summary,data.contract_match,...(data.module2_rows||[]).map(r=>[r.clause,r.risk,r.implication].filter(Boolean).join(' · ')),...(data.module3_items||[]).map(r=>[r.clause_name,r.original,r.revised,r.talk_track].filter(Boolean).join('\n')),data.module4_date_flag,data.module4_crossborder].filter(Boolean).join('\n\n')};
  return {title:'LexAI · '+kind,text:String(data.reply||data.answer||data.revised_clause||'')+(data.explanation?'\n\n'+String(data.explanation):'')};
 }
 function beginRequest(path){const kind=watched[path];if(!kind)return null;const job={id:++state.seq,epoch:state.epoch,owner:owner(),kind};state.jobs.set(job.id,job);clearTimeout(previewTimer);setMood(activeMood());idle();return job;}
 function valid(job){return job&&job.epoch===state.epoch&&job.owner===owner()&&state.jobs.has(job.id);}
 function completeRequest(job,data){if(!valid(job))return;state.jobs.delete(job.id);const result=resultText(job.kind,data);
  if(result.text.trim()){state.last={...result,epoch:job.epoch,owner:job.owner,kind:job.kind};el('petRetry').hidden=!['analysis','draft','rewrite'].includes(job.kind);}
  setMood(state.jobs.size?activeMood():['Red','Yellow'].includes(data.risk_level)?'alert':'happy');idle();
  if(state.auto&&state.tier==='advanced'&&['analysis','draft','rewrite'].includes(job.kind)&&result.text.trim()){
   const completed=state.last;
   downloadQueue=downloadQueue.catch(()=>{}).then(()=>state.auto?download(completed,true):null);
  }
 }
 function failRequest(job){if(!valid(job))return;state.jobs.delete(job.id);setMood(state.jobs.size?activeMood():'alert',t('failed'));idle();}
 async function download(result=state.last,automatic=false){
  if(!result||!['analysis','draft','rewrite'].includes(result.kind)){status('no_result');return;}
  if(state.exporting)return;if(result.text.length>100000){status('too_long');return;}
  const epoch=state.epoch,uid=owner(),format=el('petFormat').value;if(!['txt','docx','pdf'].includes(format)||state.tier!=='advanced'||!uid||result.epoch!==epoch||result.owner!==uid)return;
  state.exporting=true;
  try{const response=await apiFetch('/api/pet/export/'+format,{method:'POST',body:JSON.stringify({title:result.title.slice(0,300),document:result.text}),binary:true});
   const blob=await response.blob();if(epoch!==state.epoch||uid!==owner()||(automatic&&!state.auto))return;
   const name='LexAI-'+result.title.replace(/[<>:"/\\|?*\x00-\x1f]/g,'').slice(0,50)+'.'+format;
   saveDraftBlob(blob,name,false);status('downloaded');
  }catch{if(epoch===state.epoch)status('download_failed');}finally{if(epoch===state.epoch)state.exporting=false;}
 }
 async function read(){
  if(!state.speech||!state.last){status('no_result');return;}
  const result=state.last,epoch=state.epoch;
  if(!await authorize('read_aloud')||epoch!==state.epoch||result!==state.last||!state.speech)return;
  const engine=window.speechSynthesis;if(!engine||!window.SpeechSynthesisUtterance){status('no_voice');return;}
  const language=/[\u3400-\u9fff]/.test(result.text)?'zh':typeof currentLang==='string'&&currentLang.startsWith('zh')?'en':currentLang;
  const voice=engine.getVoices().find(v=>v.localService===true&&v.lang.toLowerCase().startsWith(language.replace('_','-').split('-')[0]));
  if(!voice){status('no_voice');return;}
  stopReading(false);state.reading=true;const speechId=state.speechId;
  const chunks=result.text.match(/[^。！？.!?\n]{1,180}[。！？.!?\n]?|[。！？.!?\n]/gu)||[];let index=0;
  const next=()=>{if(speechId!==state.speechId||epoch!==state.epoch||!state.speech)return;
   if(state.expires&&Date.parse(state.expires)<=Date.now()){stopReading(false);void checkAccess();return;}
   if(index>=chunks.length){state.reading=false;refresh();status('read_done');return;}
   const utterance=new window.SpeechSynthesisUtterance(chunks[index++]);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=Number(el('petRate').value)||1;
   utterance.onend=next;utterance.onerror=()=>{if(speechId===state.speechId){state.reading=false;refresh();status('read_error');}};engine.speak(utterance);
  };refresh();status('speaking');next();
 }
 el('petLauncher').addEventListener('click',()=>el('petPanel').hidden?open():close());el('petWake').addEventListener('click',open);el('petClose').addEventListener('click',close);
 el('petHide').addEventListener('click',()=>{stopReading(false);state.hidden=true;dismissBubble();close();persist();refresh();el('petWake').focus();});
 el('petStill').addEventListener('change',e=>{state.still=e.target.checked;persist();refresh();});el('motionToggle')?.addEventListener('change',refresh);
 root.querySelectorAll('[data-pet-panel]').forEach(b=>b.addEventListener('click',()=>{close();openWorkspace(b.dataset.petPanel);}));
 root.querySelectorAll('[data-pet-mood]').forEach(b=>b.addEventListener('click',()=>{clearTimeout(previewTimer);setMood(b.dataset.petMood,t('preview')+t('mood_'+b.dataset.petMood));previewTimer=setTimeout(()=>setMood(activeMood()),5000);idle();}));
 el('petPlans').addEventListener('click',()=>{close();document.getElementById('pricing').scrollIntoView({behavior:'smooth',block:'start'});});
 for(const [id,feature,key] of [['petAuto','auto_download','auto'],['petSpeech','read_aloud','speech']])el(id).addEventListener('change',async e=>{
  const checked=e.target.checked,epoch=state.epoch;e.target.disabled=true;
  if(!checked){state[key]=false;if(key==='speech')stopReading(false);refresh();status('off');return;}
  const allowed=await authorize(feature);if(epoch!==state.epoch)return;state[key]=allowed;refresh();if(allowed)status('enabled');
 });
 el('petRead').addEventListener('click',()=>void read());el('petStop').addEventListener('click',()=>stopReading());
 el('petPause').addEventListener('click',()=>{const engine=window.speechSynthesis;if(!state.reading||!engine)return;if(engine.paused){engine.resume();status('speaking');}else{engine.pause();status('paused');}});
 el('petRetry').addEventListener('click',()=>void download());
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!el('petPanel').hidden){close();event.stopPropagation();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopReading(false);if(!state.jobs.size)setMood('sleep');}else{if(!state.jobs.size)setMood('idle');void checkAccess();idle();}});
 window.addEventListener('pagehide',()=>stopReading(false));
 setInterval(()=>{if(state.auto||state.speech||state.reading)void checkAccess();},60000);
 try{const prefs=JSON.parse(localStorage.getItem('lexai_pet_preferences')||'{}');state.hidden=prefs.hidden===true;state.still=prefs.still===true;}catch{}
 window.lexPet={open,close,dismissBubble,refresh,authChanged,beginRequest,completeRequest,failRequest};
 document.querySelectorAll('[data-pet-open]').forEach(button=>button.addEventListener('click',open));
 authChanged();setMood('idle',t('welcome'));idle();
})();
