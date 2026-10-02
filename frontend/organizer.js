// Account-owned archives and reminders. Content is saved only by an explicit action.
const orgWords={
 zh:{history:'合同历史与文件夹',intro:'点击保存后，正文及你选择附带的报告会存入账户数据库，刷新后可继续查看。每个账户最多 100 份记录、50 个文件夹。只保存你有权保存的文本；可先脱敏。',title:'合同名称',folder:'文件夹',unfiled:'未分类',all:'所有文件夹',content:'合同正文（最多 100,000 字符）',report:'附带报告（选填；最多 100,000 字符）',consent:'我确认将这些内容保存到账户数据库，并了解其会进入数据库备份。',save:'保存一份历史记录',refresh:'刷新',search:'按合同名称搜索',newFolder:'文件夹名称',create:'新建文件夹',rename:'重命名所选文件夹',deleteFolder:'删除所选文件夹',folderDelete:'删除文件夹后，合同会移入“未分类”。继续吗？',open:'查看',remove:'删除',removeConfirm:'删除这份合同及其关联提醒？备份中的旧副本仍受备份保留周期约束。',empty:'暂无记录。',login:'请先登录，再查看或保存账户记录。',saved:'已保存。',required:'请填写名称和正文，并勾选保存确认。',loading:'正在加载…',error:'操作未成功，请检查网络或重新登录。',detail:'已保存的合同',move:'更新名称 / 移动文件夹',load:'放入分析区',loadConfirm:'分析区已有内容，要用这份历史合同替换吗？',download:'下载正文 TXT',addReminder:'为此合同添加提醒',saveAnalysis:'保存分析区合同',saveGenerated:'保存生成草稿',saveTemplate:'保存当前模板',missing:'该功能区还没有可保存的正文。',stage:'已带入文本，请填写名称、核对内容并确认保存。',reminders:'到期、续约和付款提醒',reminderIntro:'按你填写的时间提醒，可提前若干天通知。站内提醒在登录后显示；关掉网页后收邮件，需要运营方启用邮件工作进程。每个账户最多 200 条；目前为单次提醒。',kind:'事项类型',expiry:'到期',renewal:'续约',payment:'付款',due:'事项时间（本机时区）',lead:'提前天数（0–365）',linked:'关联历史合同（选填）',none:'不关联合同',email:'同时发送提醒邮件到已验证的账户邮箱',emailOff:'邮件通道尚未启用；仍可保存站内提醒。',emailVerify:'启用邮件提醒前，请用“邮箱验证码登录”验证账户邮箱。',emailReady:'邮件通道已配置；投递状态不保证进入收件箱。',reminderSave:'保存提醒',cancelEdit:'取消编辑',edit:'编辑',complete:'标记已处理',reopen:'重新打开',done:'已处理',dueNow:'需要处理',upcoming:'待提醒',sent:'邮件已交给 SMTP',failed:'邮件多次失败，请核对配置后编辑保存重试',reminderDelete:'删除这条提醒？',dates:'请输入名称、有效日期和 0–365 的整数提前天数。',dueCount:'你有 {n} 条合同事项需要处理，点击查看 →',exported:'已发起 TXT 下载。',storeLimit:'记录数量已达上限，请先删除不再需要的记录。',notFound:'记录不存在或已删除。',emptyFolder:'请先选择一个文件夹。',folderName:'请填写文件夹名称。',verifyError:'请先使用邮箱验证码登录，验证账户邮箱。',emailError:'邮件提醒尚未配置，请取消邮件选项后保存站内提醒。',working:'正在保存，请稍候…',privacy:'历史内容由当前部署的数据库和备份保存；本功能不提供应用层字段加密。生产环境请为数据库和备份配置访问控制及存储加密。'},
 en:{history:'Contract history and folders',intro:'Saving stores the text and optional report in your account database for later use. Up to 100 records and 50 folders per account. Save only authorised content; redact it first if needed.',title:'Contract title',folder:'Folder',unfiled:'Unfiled',all:'All folders',content:'Contract text (up to 100,000 characters)',report:'Optional report (up to 100,000 characters)',consent:'I agree to save this content in my account database and understand it will be included in database backups.',save:'Save a history record',refresh:'Refresh',search:'Search contract titles',newFolder:'Folder name',create:'Create folder',rename:'Rename selected folder',deleteFolder:'Delete selected folder',folderDelete:'Contracts will move to Unfiled. Delete this folder?',open:'View',remove:'Delete',removeConfirm:'Delete this contract and its reminders? Older backup copies remain subject to backup retention.',empty:'No records yet.',login:'Log in to view or save account records.',saved:'Saved.',required:'Enter a title and text, and confirm database storage.',loading:'Loading…',error:'Action failed. Check your connection or sign in again.',detail:'Saved contract',move:'Rename / move folder',load:'Open in analysis',loadConfirm:'Replace the text currently in analysis with this saved contract?',download:'Download text TXT',addReminder:'Add a reminder for this contract',saveAnalysis:'Save analysis text',saveGenerated:'Save generated draft',saveTemplate:'Save current template',missing:'This workspace has no text to save yet.',stage:'Text loaded. Set a title, review the content and confirm storage.',reminders:'Expiry, renewal and payment reminders',reminderIntro:'Use your chosen date and an optional advance notice. In-app reminders appear after sign-in. Email while the page is closed requires the reminder worker. Up to 200 one-time reminders per account.',kind:'Event type',expiry:'Expiry',renewal:'Renewal',payment:'Payment',due:'Event date and time (local timezone)',lead:'Days in advance (0–365)',linked:'Linked saved contract (optional)',none:'No linked contract',email:'Also email my verified account address',emailOff:'Email reminders are not enabled; in-app reminders still work.',emailVerify:'Verify your account email by signing in with an email code first.',emailReady:'Email channel configured; SMTP acceptance does not confirm inbox delivery.',reminderSave:'Save reminder',cancelEdit:'Cancel editing',edit:'Edit',complete:'Mark handled',reopen:'Reopen',done:'Handled',dueNow:'Needs attention',upcoming:'Upcoming',sent:'Email accepted by SMTP',failed:'Email failed repeatedly; check configuration and edit/save to retry',reminderDelete:'Delete this reminder?',dates:'Enter a title, valid date and an integer advance notice from 0 to 365.',dueCount:'{n} contract reminders need attention. Open →',exported:'TXT download requested.',storeLimit:'Storage limit reached. Delete unused records first.',notFound:'Record not found or already deleted.',emptyFolder:'Select a folder first.',folderName:'Enter a folder name.',verifyError:'Verify your account email using email-code sign-in first.',emailError:'Email reminders are not configured. Disable email to save an in-app reminder.',working:'Saving…',privacy:'Saved content is held in the deployment database and backups. This feature does not encrypt individual fields; configure storage encryption and access controls in production.'}
};
Object.assign(orgWords.zh,{loaded:'列表已更新。',noMatches:'没有匹配的合同，请更换关键词或文件夹。',emptyHistory:'尚未保存合同。分析或生成合同后，点击“保存到历史”即可在这里管理。',emptyReminders:'尚无提醒。填写上方事项和时间后，点击“保存提醒”。',resetSearch:'清除筛选',startAnalysis:'去分析合同'});
Object.assign(orgWords.en,{loaded:'Lists updated.',noMatches:'No matching contracts. Try another keyword or folder.',emptyHistory:'No saved contracts. Choose Save to history after analyzing or generating a contract.',emptyReminders:'No reminders yet. Enter an event and date above, then save.',resetSearch:'Clear filters',startAnalysis:'Analyze a contract'});
let orgFolders=[],orgContracts=[],orgReminders=[],orgSelected=null,orgLastAnalysis=null;
let orgAccount='',orgEpoch=0,orgRefreshing=false,orgMutating=false,orgReminderEdit='';
let orgEmailStatus={email_configured:false,email_verified:false},orgStatusKey='';
let orgLoadRequest=0,orgDetailRequest=0;
function orgText(key){return orgWords[currentLang.startsWith('zh')?'zh':'en'][key]||key;}
function orgEl(id){return document.getElementById(id);}
function orgStatus(key){orgStatusKey=key;for(const id of ['orgStatus','orgReminderStatus'])orgEl(id).textContent=orgText(key);}
function orgError(error){
  const m=String(error?.message||'');
  const map={'Storage limit reached. Delete unused records first.':'storeLimit','Record not found.':'notFound','Reminder email is not configured.':'emailError','Verify your email with email-code sign-in first.':'verifyError'};
  orgStatus(map[m]||'error');
  if(typeof workspaceFeedback!=='undefined')for(const id of ['library','reminders'])workspaceFeedback.set(id,'error',orgText(map[m]||'error'),()=>orgRefresh(true));
}
function orgButton(label,click){const b=document.createElement('button');b.type='button';b.className='btn-ghost';b.textContent=orgText(label);b.addEventListener('click',click);return b;}
function orgSelect(id,items,placeholder){
  const field=orgEl(id),value=field.value;field.replaceChildren();
  const first=document.createElement('option');first.value='';first.textContent=orgText(placeholder);field.appendChild(first);
  for(const item of items){const option=document.createElement('option');option.value=item.id;option.textContent=item.name||item.title;field.appendChild(option);}
  if([...field.options].some(option=>option.value===value))field.value=value;
}
function renderOrganizerLanguage(){
  document.querySelectorAll('[data-org-text]').forEach(node=>node.textContent=orgText(node.dataset.orgText));
  for(const id of ['orgFolderFilter','orgManageFolder','orgSaveFolder','orgDetailFolder'])orgSelect(id,orgFolders,id==='orgFolderFilter'?'all':'unfiled');
  orgSelect('orgReminderContract',orgContracts,'none');
  orgRenderContracts();orgRenderReminders();
  orgEl('orgEmailState').textContent=orgText(!orgEmailStatus.email_configured?'emailOff':!orgEmailStatus.email_verified?'emailVerify':'emailReady');
  for(const id of ['orgStatus','orgReminderStatus'])orgEl(id).textContent=orgText(orgStatusKey);
}
function orgAuthChanged(){
  const id=typeof authUser!=='undefined'&&authToken?authUser.id:'';
  if(id===orgAccount)return;
  const previous=orgAccount;orgAccount=id;orgEpoch++;orgLoadRequest++;orgDetailRequest++;orgRefreshing=false;
  orgFolders=[];orgContracts=[];orgReminders=[];orgSelected=null;orgLastAnalysis=null;
  orgEmailStatus={email_configured:false,email_verified:false};orgEl('orgDetail').hidden=true;
  orgEl('orgDueBanner').hidden=true;orgResetReminder();
  if(previous){for(const input of ['orgSaveTitle','orgSaveContent','orgSaveReport','orgDetailText','orgDetailReport','orgDetailTitle'])orgEl(input).value='';orgEl('orgStoreConsent').checked=false;}
  orgStatus(id?'':'login');renderOrganizerLanguage();
  if(id)setTimeout(()=>orgRefresh(),0);
}
async function orgRefresh(force=false){
  if(!authToken){orgStatus('login');return;}if(orgRefreshing&&!force)return;
  const epoch=orgEpoch,request=++orgLoadRequest;orgRefreshing=true;
  if(typeof workspaceFeedback!=='undefined')for(const id of ['library','reminders'])workspaceFeedback.set(id,'pending',orgText('loading'));
  try{
    const results=await Promise.all(['folders','contracts','reminders','status'].map(async name=>(await apiFetch('/api/organizer/'+name)).json()));
    if(epoch!==orgEpoch||request!==orgLoadRequest||!authToken)return;
    [orgFolders,orgContracts,orgReminders,orgEmailStatus]=results;
    if(orgSelected){const summary=orgContracts.find(item=>item.id===orgSelected.id);if(summary)orgSelected={...orgSelected,...summary};else{orgSelected=null;orgEl('orgDetail').hidden=true;orgEl('orgDetailText').value='';orgEl('orgDetailReport').value='';}}
    renderOrganizerLanguage();
    if(typeof workspaceFeedback!=='undefined')for(const id of ['library','reminders'])workspaceFeedback.set(id,'success',orgText(orgStatusKey==='saved'?'saved':'loaded'));
  }catch(error){if(epoch===orgEpoch&&request===orgLoadRequest)orgError(error);}
  finally{if(epoch===orgEpoch&&request===orgLoadRequest)orgRefreshing=false;}
}
async function orgMutate(path,method,body,after=()=>{}){
  if(!authToken){openModal('login');orgStatus('login');return;}
  if(orgMutating)return;
  const epoch=orgEpoch;orgMutating=true;orgStatus('working');
  if(typeof workspaceFeedback!=='undefined')for(const id of ['library','reminders'])workspaceFeedback.set(id,'pending',orgText('working'));
  try{
    const result=await (await apiFetch('/api/organizer/'+path,{method,...(body?{body:JSON.stringify(body)}:{})})).json();
    if(epoch!==orgEpoch||!authToken)return;
    after(result);orgStatus('saved');await orgRefresh(true);
  }catch(error){if(epoch===orgEpoch)orgError(error);}
  finally{orgMutating=false;}
}
function orgRememberAnalysis(content,report){orgLastAnalysis={content,report};}
function orgStage(source){
  let content='',report='',title='';
  if(source==='analysis'){content=orgEl('contractTxt').value;if(orgLastAnalysis?.content===content)report=orgLastAnalysis.report;}
  if(source==='generated'&&typeof generatedDraft!=='undefined'&&generatedDraft){content=generatedDraft.document;title=generatedDraft.title;}
  if(source==='template'){content=orgEl('templateEditor').value;title=orgEl('templateTitle').textContent;}
  openWorkspace('library');
  if(!content.trim()){orgStatus('missing');return;}
  orgEl('orgSaveContent').value=content;orgEl('orgSaveReport').value=report;orgEl('orgSaveTitle').value=title;
  orgEl('orgSaveSource').value=source;orgEl('orgStoreConsent').checked=false;orgStatus('stage');
}
function orgSaveContract(){
  const title=orgEl('orgSaveTitle').value.trim(),content=orgEl('orgSaveContent').value,report=orgEl('orgSaveReport').value;
  if(!title||!content.trim()||!orgEl('orgStoreConsent').checked||content.length>100000||report.length>100000){orgStatus('required');return;}
  orgMutate('contracts','POST',{title,content,report,folder_id:orgEl('orgSaveFolder').value||null,source:orgEl('orgSaveSource').value||'manual'},()=>{orgEl('orgStoreConsent').checked=false;});
}
function orgCreateFolder(){const name=orgEl('orgFolderName').value.trim();if(!name){orgStatus('folderName');return;}orgMutate('folders','POST',{name},()=>{orgEl('orgFolderName').value='';});}
function orgRenameFolder(){const id=orgEl('orgManageFolder').value,name=orgEl('orgFolderName').value.trim();if(!id||!name){orgStatus(!id?'emptyFolder':'folderName');return;}orgMutate('folders/'+encodeURIComponent(id),'PATCH',{name});}
function orgDeleteFolder(){const id=orgEl('orgManageFolder').value;if(!id){orgStatus('emptyFolder');return;}if(window.confirm(orgText('folderDelete')))orgMutate('folders/'+encodeURIComponent(id),'DELETE',null,()=>{if(orgSelected?.folder_id===id)orgSelected.folder_id=null;});}
function orgRenderContracts(){
  const list=orgEl('orgContractList'),filter=orgEl('orgFolderFilter').value,query=orgEl('orgSearch').value.trim().toLowerCase();list.replaceChildren();
  const records=orgContracts.filter(r=>(!filter||r.folder_id===filter)&&r.title.toLowerCase().includes(query));
  if(!records.length){
    const empty=document.createElement('div');empty.className='org-empty';
    const message=document.createElement('p');message.textContent=orgText(query||filter?'noMatches':'emptyHistory');empty.appendChild(message);
    const actions=document.createElement('div');actions.className='draft-actions';
    if(query||filter)actions.appendChild(orgButton('resetSearch',()=>{orgEl('orgSearch').value='';orgEl('orgFolderFilter').value='';orgRenderContracts();}));
    else actions.appendChild(orgButton('startAnalysis',()=>openWorkspace('analyze')));
    empty.appendChild(actions);list.appendChild(empty);return;
  }
  for(const row of records){
    const card=document.createElement('article');card.className='qa-answer';
    const title=document.createElement('h4');title.textContent=row.title;
    const meta=document.createElement('p');meta.textContent=(orgFolders.find(f=>f.id===row.folder_id)?.name||orgText('unfiled'))+' · '+new Date(row.created_at).toLocaleString();
    const actions=document.createElement('div');actions.className='draft-actions';actions.append(orgButton('open',()=>orgOpen(row.id)),orgButton('remove',()=>orgDeleteContract(row.id)));
    card.append(title,meta,actions);list.appendChild(card);
  }
}
async function orgOpen(id){
  const epoch=orgEpoch,request=++orgDetailRequest;
  try{const row=await (await apiFetch('/api/organizer/contracts/'+encodeURIComponent(id))).json();
    if(epoch!==orgEpoch||request!==orgDetailRequest||!authToken)return;
    orgSelected=row;orgEl('orgDetail').hidden=false;orgEl('orgDetailTitle').value=row.title;orgEl('orgDetailText').value=row.content;orgEl('orgDetailReport').value=row.report;orgEl('orgDetailFolder').value=row.folder_id||'';
  }catch(error){if(epoch===orgEpoch&&request===orgDetailRequest)orgError(error);}
}
function orgUpdateContract(){if(!orgSelected)return;const id=orgSelected.id;orgMutate('contracts/'+encodeURIComponent(id),'PATCH',{title:orgEl('orgDetailTitle').value,folder_id:orgEl('orgDetailFolder').value||null},row=>{if(orgSelected?.id===id){orgSelected={...orgSelected,...row};orgEl('orgDetailTitle').value=row.title;orgEl('orgDetailFolder').value=row.folder_id||'';}});}
function orgDeleteContract(id){if(!window.confirm(orgText('removeConfirm')))return;orgMutate('contracts/'+encodeURIComponent(id),'DELETE',null,()=>{orgDetailRequest++;if(orgSelected?.id===id){orgSelected=null;orgEl('orgDetail').hidden=true;orgEl('orgDetailText').value='';orgEl('orgDetailReport').value='';}});}
function orgLoadContract(){if(!orgSelected)return;const input=orgEl('contractTxt');if(input.value&&input.value!==orgSelected.content&&!window.confirm(orgText('loadConfirm')))return;input.value=orgSelected.content;updateLengthNotice(input.value);openWorkspace('analyze');}
function orgDownloadContract(){if(!orgSelected)return;saveDraftBlob(new Blob(['\ufeff'+orgSelected.content],{type:'text/plain;charset=utf-8'}),'LexAI-history.txt',false);orgStatus('exported');}
function orgNewReminder(){if(!orgSelected)return;orgResetReminder();orgEl('orgReminderContract').value=orgSelected.id;orgEl('orgReminderTitle').value=orgSelected.title;openWorkspace('reminders');}
function orgLocalDate(iso){const d=new Date(iso);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
function orgResetReminder(){orgReminderEdit='';for(const id of ['orgReminderTitle','orgReminderDate'])orgEl(id).value='';orgEl('orgReminderDays').value='7';orgEl('orgReminderContract').value='';orgEl('orgReminderEmail').checked=false;orgEl('orgReminderKind').value='expiry';}
function orgEditReminder(row){orgReminderEdit=row.id;orgEl('orgReminderTitle').value=row.title;orgEl('orgReminderKind').value=row.kind;orgEl('orgReminderDate').value=orgLocalDate(row.due_at);orgEl('orgReminderDays').value=String(Math.round((new Date(row.due_at)-new Date(row.remind_at))/86400000));orgEl('orgReminderContract').value=row.contract_id||'';orgEl('orgReminderEmail').checked=row.email_enabled;}
function orgSaveReminder(){
  const title=orgEl('orgReminderTitle').value.trim(),date=new Date(orgEl('orgReminderDate').value),days=Number(orgEl('orgReminderDays').value);
  if(!title||!Number.isFinite(date.getTime())||!Number.isInteger(days)||days<0||days>365){orgStatus('dates');return;}
  const body={title,kind:orgEl('orgReminderKind').value,due_at:date.toISOString(),remind_at:new Date(date.getTime()-days*86400000).toISOString(),contract_id:orgEl('orgReminderContract').value||null,email_enabled:orgEl('orgReminderEmail').checked};
  orgMutate('reminders'+(orgReminderEdit?'/'+encodeURIComponent(orgReminderEdit):''),orgReminderEdit?'PUT':'POST',body,orgResetReminder);
}
function orgRenderReminders(){
  const list=orgEl('orgReminderList');list.replaceChildren();const now=Date.now();
  const due=orgReminders.filter(r=>!r.done&&new Date(r.remind_at).getTime()<=now);
  orgEl('orgDueBanner').hidden=!authToken||!due.length;orgEl('orgDueBanner').textContent=orgText('dueCount').replace('{n}',String(due.length));
  if(!orgReminders.length){const empty=document.createElement('div');empty.className='org-empty';empty.textContent=orgText('emptyReminders');list.appendChild(empty);return;}
  for(const row of orgReminders){
    const card=document.createElement('article');card.className='qa-answer';
    const title=document.createElement('h4');title.textContent=orgText(row.kind)+' · '+row.title;
    const info=document.createElement('p');info.textContent=new Date(row.due_at).toLocaleString()+' · '+orgText(row.done?'done':new Date(row.remind_at).getTime()<=now?'dueNow':'upcoming');
    if(row.emailed_at)info.textContent+=' · '+orgText('sent');else if(row.email_failed)info.textContent+=' · '+orgText('failed');
    const actions=document.createElement('div');actions.className='draft-actions';
    actions.append(orgButton('edit',()=>orgEditReminder(row)),orgButton(row.done?'reopen':'complete',()=>orgMutate('reminders/'+row.id,'PATCH',{done:!row.done})),orgButton('remove',()=>{if(window.confirm(orgText('reminderDelete')))orgMutate('reminders/'+row.id,'DELETE');}));
    card.append(title,info,actions);list.appendChild(card);
  }
}
function initOrganizer(){
  if(!orgEl('panel-library'))return;
  orgEl('panel-library').innerHTML=`<p class="draft-notice" data-org-text="intro"></p><div class="draft-actions"><button class="btn-ghost" onclick="orgStage('analysis')" data-org-text="saveAnalysis"></button><button class="btn-ghost" onclick="orgStage('generated')" data-org-text="saveGenerated"></button><button class="btn-ghost" onclick="orgStage('template')" data-org-text="saveTemplate"></button></div><form onsubmit="event.preventDefault();orgSaveContract()"><div class="form-grid draft-grid"><div class="fg"><label for="orgSaveTitle" data-org-text="title"></label><input id="orgSaveTitle" maxlength="200" required></div><div class="fg"><label for="orgSaveFolder" data-org-text="folder"></label><select id="orgSaveFolder"></select></div></div><div class="fg"><label for="orgSaveContent" data-org-text="content"></label><textarea id="orgSaveContent" rows="7" required maxlength="100000"></textarea><label for="orgSaveReport" data-org-text="report"></label><textarea id="orgSaveReport" rows="3" maxlength="100000"></textarea><input id="orgSaveSource" type="hidden" value="manual"></div><label class="checklist-item"><input id="orgStoreConsent" type="checkbox" required><span data-org-text="consent"></span></label><button class="btn-primary" data-org-text="save"></button></form><p id="orgStatus" class="review-status" role="status"></p><div class="form-grid draft-grid"><div class="fg"><label for="orgManageFolder" data-org-text="folder"></label><select id="orgManageFolder"></select><label for="orgFolderName" data-org-text="newFolder"></label><input id="orgFolderName" maxlength="100"><div class="draft-actions"><button class="btn-ghost" onclick="orgCreateFolder()" data-org-text="create"></button><button class="btn-ghost" onclick="orgRenameFolder()" data-org-text="rename"></button><button class="btn-ghost" onclick="orgDeleteFolder()" data-org-text="deleteFolder"></button></div></div><div class="fg"><label for="orgFolderFilter" data-org-text="folder"></label><select id="orgFolderFilter" onchange="orgRenderContracts()"></select><label for="orgSearch" data-org-text="search"></label><input id="orgSearch" oninput="orgRenderContracts()"><button class="btn-ghost" onclick="orgRefresh()" data-org-text="refresh"></button></div></div><div id="orgContractList"></div><section id="orgDetail" hidden><h3 data-org-text="detail"></h3><label for="orgDetailTitle" data-org-text="title"></label><input id="orgDetailTitle" maxlength="200"><label for="orgDetailFolder" data-org-text="folder"></label><select id="orgDetailFolder"></select><button class="btn-ghost" onclick="orgUpdateContract()" data-org-text="move"></button><label for="orgDetailText" data-org-text="content"></label><textarea id="orgDetailText" rows="10" readonly></textarea><label for="orgDetailReport" data-org-text="report"></label><textarea id="orgDetailReport" rows="5" readonly></textarea><div class="draft-actions"><button class="btn-ghost" onclick="orgLoadContract()" data-org-text="load"></button><button class="btn-ghost" onclick="orgDownloadContract()" data-org-text="download"></button><button class="btn-ghost" onclick="orgNewReminder()" data-org-text="addReminder"></button></div></section>`;
  orgEl('panel-reminders').innerHTML=`<p class="draft-notice" data-org-text="reminderIntro"></p><form onsubmit="event.preventDefault();orgSaveReminder()"><div class="form-grid draft-grid"><div class="fg"><label for="orgReminderTitle" data-org-text="title"></label><input id="orgReminderTitle" maxlength="200" required><label for="orgReminderKind" data-org-text="kind"></label><select id="orgReminderKind"><option value="expiry" data-org-text="expiry"></option><option value="renewal" data-org-text="renewal"></option><option value="payment" data-org-text="payment"></option></select></div><div class="fg"><label for="orgReminderDate" data-org-text="due"></label><input id="orgReminderDate" type="datetime-local" required><label for="orgReminderDays" data-org-text="lead"></label><input id="orgReminderDays" type="number" min="0" max="365" step="1" value="7" required><label for="orgReminderContract" data-org-text="linked"></label><select id="orgReminderContract"></select></div></div><label class="checklist-item"><input id="orgReminderEmail" type="checkbox"><span data-org-text="email"></span></label><p id="orgEmailState" class="review-status"></p><div class="draft-actions"><button class="btn-primary" data-org-text="reminderSave"></button><button type="button" class="btn-ghost" onclick="orgResetReminder()" data-org-text="cancelEdit"></button><button type="button" class="btn-ghost" onclick="orgRefresh()" data-org-text="refresh"></button></div></form><p id="orgReminderStatus" role="status" class="review-status"></p><div id="orgReminderList"></div>`;
  renderOrganizerLanguage();orgAuthChanged();
  setInterval(()=>{if(authToken&&!document.hidden)orgRefresh();},60000);
}
initOrganizer();
