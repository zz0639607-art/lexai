/* Shared, accessible operation feedback. No contract data is persisted here. */
(()=>{
 const words={
  zh:{empty:'等待开始',pending:'正在处理…',success:'操作完成',error:'操作未完成',retry:'重试',elapsed:'已用时 {s} 秒',wait:'请求仍在处理中，请勿重复提交。',long:'处理时间较长，请保持页面打开；完成或失败后会在这里更新。',done:'结果已更新，请查看下方内容。',failed:'输入与已有结果已保留。请核对错误信息后重试。',analyze:'上传或粘贴合同后开始分析，报告会显示在下方。',generate:'填写合同需求后生成草稿，完成后可审阅和下载。',lawyer:'输入问题开始对话，回复会显示在对话区。',contractqa:'提供合同正文并提问，回答会附上可定位的原文依据。',rewrite:'输入原条款和修改目标，建议文本会显示在下方。',compare:'放入原版和新版合同，比较后显示修改内容。',templates:'选择一个合同模板，补全占位内容后再使用。',checklist:'逐项核对签约信息，完成后可下载检查清单。',library:'尚未保存合同。可以从分析、草稿或模板区保存记录。',reminders:'尚无提醒。填写事项和时间，保存后在此管理。',redact:'输入原文后识别敏感信息，先核对预览再使用。',changed:'输入已改变，请点击发送按钮提交当前内容。',download:'已发起下载，请查看浏览器下载记录。',read:'文件已读取，请核对正文后开始分析。'},
  en:{empty:'Ready to start',pending:'Processing…',success:'Completed',error:'Could not complete',retry:'Retry',elapsed:'Elapsed {s}s',wait:'The request is running. Please do not submit again.',long:'This is taking longer. Keep the page open; the outcome will appear here.',done:'The result is ready below.',failed:'Your input and previous results are preserved. Review the error and retry.',analyze:'Upload or paste a contract to see the report below.',generate:'Describe your requirements to prepare a draft for review and download.',lawyer:'Enter a question to start the conversation.',contractqa:'Add your contract and a question to receive source-linked answers.',rewrite:'Add a clause and your goals to prepare alternative wording.',compare:'Add the original and revised contracts to see the changes.',templates:'Choose a template, then replace its placeholders before use.',checklist:'Review each signing item, then download your checklist.',library:'No saved contracts yet. Save one from analysis, drafts or templates.',reminders:'No reminders yet. Add an event and date to start.',redact:'Add the original text, then review the redacted preview.',changed:'The input changed. Use Send to submit the current text.',download:'Download requested. Check your browser downloads.',read:'File loaded. Review the text before starting analysis.'}
 };
 const entries=new Map();let timer=null,epoch=0;
 const t=k=>(words[typeof currentLang==='string'&&currentLang.startsWith('zh')?'zh':'en'][k]||k);
 const selectors={analyze:'textarea,select,input,.sample-link,[data-i18n="analyze_btn"]',generate:'#generateForm input,#generateForm textarea,#generateForm select,#generateBtn',lawyer:'.chat-send,.qq',contractqa:'#qaContract,#qaQuestion,#qaAskBtn,input[type="file"]',rewrite:'#rewriteOriginal,#rewriteGoal,#rewriteContext,#rewriteJurisdiction,#rewriteLanguage,#rewriteBtn'};
 function entry(id){
  if(entries.has(id))return entries.get(id);
  const panel=document.getElementById('panel-'+id);if(!panel)return null;
  const box=document.createElement('section');box.className='operation-feedback';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.setAttribute('aria-atomic','true');
  const icon=document.createElement('span');icon.className='operation-icon';icon.setAttribute('aria-hidden','true');
  const content=document.createElement('div');content.className='operation-content';
  const heading=document.createElement('strong'),body=document.createElement('p'),time=document.createElement('small');content.append(heading,body,time);
  const retry=document.createElement('button');retry.type='button';retry.className='btn-ghost';retry.hidden=true;
  const item={id,panel,box,icon,heading,body,time,retry,state:'empty',detail:'',retryAction:null,locks:[],started:0};
  retry.addEventListener('click',()=>{if(item.state!=='error'||!item.retryAction)return;const action=item.retryAction;item.retry.hidden=true;void action();});
  box.append(icon,content,retry);
  const anchors={analyze:'#aLoader',generate:'#generateStatus',lawyer:'.chat-input-row',contractqa:'#qaStatus',rewrite:'#rewriteStatus',compare:'#compareStatus',library:'#orgStatus',reminders:'#orgReminderStatus',templates:'#templateStatus',checklist:'#checkStatus'};
  const anchor=panel.querySelector?.(anchors[id]||':not(*)');
  if(anchor)anchor.insertAdjacentElement('afterend',box);else panel.prepend(box);
  panel.dataset.feedbackActive='true';entries.set(id,item);render(item);return item;
 }
 function release(item){for(const [node,disabled] of item.locks){node.disabled=disabled;node.classList?.remove('operation-busy');node.removeAttribute?.('aria-busy');}item.locks=[];item.panel.setAttribute('aria-busy','false');}
 function render(item){
  item.box.dataset.state=item.state;item.heading.textContent=t(item.state);item.body.textContent=(item.sourceId?document.getElementById(item.sourceId)?.textContent:item.detail)||t(item.state==='empty'?item.id:item.state==='success'?'done':item.state==='error'?'failed':'wait');
  if(item.state==='error'&&item.detail)item.body.textContent+='\n'+t('failed');
  item.icon.textContent=({empty:'○',pending:'',success:'✓',error:'!'})[item.state];item.retry.textContent=t('retry');item.retry.hidden=item.state!=='error'||!item.retryAction;
  const seconds=Math.max(0,Math.floor((Date.now()-item.started)/1000));item.time.hidden=item.state!=='pending';item.time.textContent=item.state==='pending'?t('elapsed').replace('{s}',seconds)+(seconds>=30?' · '+t('long'):''):'';
 }
 function clock(){if(timer!==null)return;timer=setInterval(()=>{let pending=false;for(const item of entries.values())if(item.state==='pending'){pending=true;render(item);}if(!pending){clearInterval(timer);timer=null;}},1000);}
 function set(id,state,detail='',retryAction=null){
  const item=entry(id);if(!item)return;
  if(state!=='pending')release(item);
  else if(item.state!=='pending'){
   item.started=Date.now();item.locks=Array.from(item.panel.querySelectorAll(selectors[id]||':not(*)')).map(node=>[node,node.disabled]);for(const [node] of item.locks){node.disabled=true;if(node.tagName==='BUTTON'){node.classList.add('operation-busy');node.setAttribute('aria-busy','true');}}item.panel.setAttribute('aria-busy','true');clock();
  }
  item.state=state;item.detail=detail;item.sourceId=null;item.retryAction=retryAction;if(state==='pending'&&retryAction)item.lastRetry=retryAction;render(item);
 }
 function action(id){return ({analyze:()=>analyze(),generate:()=>generateContract(),lawyer:()=>chat(),contractqa:()=>askContract(),rewrite:()=>rewriteClause(),library:()=>orgRefresh(true),reminders:()=>orgRefresh(true)})[id]||null;}
 const reviewPanels={qaStatus:'contractqa',rewriteStatus:'rewrite',compareStatus:'compare',templateStatus:'templates',checkStatus:'checklist'};
 function review(node,key){const id=reviewPanels[node?.id];if(!id)return;
  const state=/_pending$|review_loading/.test(key)?'pending':/_required$|_limit$|_error$|_unverified$|_empty$/.test(key)?'error':/_changed$|_stale$/.test(key)?'empty':'success';
  set(id,state,node.textContent,state==='error'&&/_unverified$/.test(key)?action(id):null);const item=entries.get(id);if(item)item.sourceId=node.id;
 }
 function generated(key,error){
  if(!key)return;
  const status=document.getElementById('generateStatus');
  const state=/pending|exporting/.test(key)?'pending':/failed|invalid|copy_failed/.test(key)?'error':'success';
  const current=entries.get('generate');set('generate',state,status?.textContent||error||'',state==='error'?(key==='generate_failed'?action('generate'):key==='generate_export_failed'?current?.lastRetry:key==='generate_copy_failed'?()=>copyGeneratedContract():null):null);
 }
 const feedback={set,review,generated,busy:id=>entries.get(id)?.state==='pending',refresh:()=>entries.forEach(render),reset:()=>{epoch++;for(const item of entries.values()){release(item);item.state='empty';item.detail='';item.sourceId=null;item.retryAction=null;item.lastRetry=null;render(item);}}};
 window.workspaceFeedback=feedback;
 const baseFetch=window.apiFetch;
 window.apiFetch=async function(path,options={}){
  const route={'/api/analyze':'analyze','/api/generate':'generate','/api/chat':'lawyer','/api/contract-qa':'contractqa','/api/rewrite-clause':'rewrite'};
  const exporting=/^\/api\/generate\/export\/(docx|pdf)$/.exec(path);const id=route[path]||(exporting?'generate':null);
  if(!id)return baseFetch(path,options);
  const currentEpoch=epoch;let retry=exporting?()=>exportGeneratedContract(exporting[1]):action(id);
  if(id==='lawyer'){
   let failedMessage='';try{failedMessage=JSON.parse(options.body).message||'';}catch{}
   retry=()=>{const input=document.getElementById('chatIn');if(input.value.trim()&&input.value.trim()!==failedMessage){set('lawyer','error',t('changed'));return;}input.value=failedMessage;return chat();};
  }
  set(id,'pending','',retry);
  try{const response=await baseFetch(path,options);if(currentEpoch===epoch)set(id,'success');return response;}
  catch(error){if(currentEpoch===epoch)set(id,'error',typeof friendlyApiError==='function'?friendlyApiError(error.message):error.message,retry);throw error;}
 };
 for(const id of ['analyze','generate','lawyer','contractqa','rewrite','compare'])entry(id);
 document.body.classList.add('feedback-enabled');
})();
