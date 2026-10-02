/* Billing display is never proof of membership. The server owns all entitlements. */
(()=>{
 let config=null,rows=[],busy=false,epoch=0,lastAccount=null,returnHandled=false,dialog=null;
 const zh=()=>typeof currentLang==='string'&&currentLang.startsWith('zh');
 const copy=(cn,en)=>zh()?cn:en;
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
 const date=value=>value?new Date(value).toLocaleString(zh()?'zh-CN':'en-US'):copy('尚未确认','Not confirmed');
 const status=value=>({APPROVAL_PENDING:copy('等待 PayPal 授权','Awaiting PayPal approval'),APPROVED:copy('已授权，等待付款确认','Approved; awaiting payment'),ACTIVE:copy('已激活','Active'),SUSPENDED:copy('已暂停','Suspended'),CANCELLED:copy('已取消自动续费','Auto-renewal cancelled'),EXPIRED:copy('已过期','Expired')})[value]||copy('待核实','Awaiting verification');
 function message(text){const n=document.getElementById('billingMessage');if(n)n.textContent=text;}
 function errorText(error){
  const detail=String(error?.message||'');
  if(!zh())return detail||'Subscription request failed. Please try again.';
  if(detail.includes('not configured'))return 'PayPal 沙盒订阅尚未配置完成，请稍后再试。';
  if(detail.includes('existing subscription'))return '已有订阅，请先取消自动续费后再选择新的付款周期。';
  if(detail.includes('pending'))return '结账仍在处理中，请重试原来的付款周期以恢复。';
  if(detail.includes('does not match'))return 'PayPal 订阅配置或付款信息不匹配，请联系管理员核查。';
  if(detail.includes('review'))return '这笔订阅需要核查，请联系管理员，避免重复订阅。';
  if(detail.includes('not found'))return '未找到属于当前账户的订阅。';
  return '订阅请求未完成，请稍后重试或点击刷新状态；请勿重复付款。';
 }
 function refresh(){
  const enabled=!!config?.enabled;
  const button=document.getElementById('proSubscribeButton');
  if(button){button.disabled=!enabled;button.setAttribute('aria-disabled',String(!enabled));if(enabled)button.textContent=copy('订阅专业版 · 沙盒测试','Subscribe to Pro · Sandbox');}
  const account=document.getElementById('billingAccountButton');if(account)account.textContent=copy('管理订阅','Manage subscription');
  if(enabled){
   const texts={price_sub:copy('PayPal 沙盒测试：月付 6 美元，年付 60 美元；不使用真实资金。','PayPal Sandbox testing: automatic monthly or yearly renewal; no real funds.'),plan_pro_status:copy('专业版权益 · 沙盒订阅测试','Pro benefits · Sandbox subscription testing'),plan2_per:copy('每月 · 沙盒测试','per month · Sandbox testing'),plan_paid_notice:copy('当前仅开放 PayPal 沙盒测试。授权后自动续费，可随时取消未来扣款；规划功能仍不可用。','PayPal Sandbox only. Approval starts automatic renewal; you may cancel future billing. Planned features remain unavailable.')};
   texts.price_sub=copy(`PayPal 沙盒测试：月付 ${config.prices.monthly} 美元，年付 ${config.prices.yearly} 美元；不使用真实资金。`,`PayPal Sandbox: $${config.prices.monthly}/month or $${config.prices.yearly}/year; no real funds.`);
   for(const [key,value] of Object.entries(texts))document.querySelectorAll(`[data-i18n="${key}"]`).forEach(n=>n.textContent=value);
   const price=document.querySelector('.price-card.featured .price-amt');if(price)price.textContent='$'+config.prices.monthly;
  }
  if(dialog?.open)render();
 }
 function build(){
  if(dialog)return;
  const style=el('style');style.textContent='.billing-dialog{width:min(560px,calc(100vw - 24px));max-height:calc(100dvh - 32px);overflow:auto;border:1px solid var(--border);border-radius:20px;padding:24px;background:var(--cream,#f7fbff);color:var(--navy,#142b45);font:inherit}.billing-dialog::backdrop{background:rgba(12,28,48,.48)}.billing-dialog h2{font:inherit;font-size:1.4rem;font-weight:600;margin:0}.billing-dialog p{line-height:1.6;margin:14px 0}.billing-dialog select{width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;font:inherit}.billing-actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}.billing-row{border-top:1px solid var(--border);padding:14px 0}.billing-dialog button{min-height:44px}.billing-consent{display:flex;gap:10px;align-items:flex-start;line-height:1.6}.billing-consent input{margin-top:6px}.billing-dialog [hidden]{display:none!important}';document.head.append(style);
  dialog=el('dialog',null,'billing-dialog');dialog.id='billingDialog';dialog.setAttribute('aria-labelledby','billingTitle');
  const head=el('div',null,'billing-actions'),title=el('h2');title.id='billingTitle';head.append(title);
  const close=el('button','×','btn-ghost');close.type='button';close.setAttribute('aria-label',copy('关闭','Close'));close.onclick=()=>dialog.close();head.append(close);dialog.append(head);
  const intro=el('p');intro.id='billingIntro';dialog.append(intro);
  const label=el('label');label.htmlFor='billingInterval';label.id='billingIntervalLabel';dialog.append(label);
  const select=el('select');select.id='billingInterval';for(const cadence of ['monthly','yearly']){const option=el('option');option.value=cadence;select.append(option);}select.onchange=()=>{document.getElementById('billingConsent').checked=false;};dialog.append(select);
  const consentLabel=el('label',null,'billing-consent'),check=el('input');check.type='checkbox';check.id='billingConsent';const consent=el('span');consent.id='billingConsentText';consentLabel.append(check,consent);dialog.append(consentLabel);
  const actions=el('div',null,'billing-actions'),start=el('button',null,'btn-primary');start.id='billingStart';start.type='button';start.onclick=checkout;actions.append(start);
  const reload=el('button',null,'btn-ghost');reload.id='billingReload';reload.type='button';reload.onclick=()=>load();actions.append(reload);dialog.append(actions);
  const msg=el('p');msg.id='billingMessage';msg.setAttribute('role','status');msg.setAttribute('aria-live','polite');dialog.append(msg);
  const list=el('div');list.id='billingSubscriptions';dialog.append(list);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  document.body.append(dialog);
 }
 function render(){
  if(!dialog)return;
  document.getElementById('billingTitle').textContent=copy('专业版订阅','Pro subscription');
  document.getElementById('billingIntro').textContent=config?.enabled?copy('当前为 PayPal Sandbox，仅使用沙盒买家账户和测试余额。网站会在后端确认付款后开通专业版。','PayPal Sandbox only. Use a sandbox buyer and test balance. Pro starts after server verification.'):copy('沙盒订阅尚未启用。配置完成后可选择月付或年付。','Sandbox subscriptions are not enabled yet. Monthly and yearly billing will appear after setup.');
  document.getElementById('billingIntervalLabel').textContent=copy('付款周期','Billing interval');
  const select=document.getElementById('billingInterval');
  for(const option of select.options){const amount=config?.prices?.[option.value];option.textContent=option.value==='monthly'?copy(`月付 · ${amount||'—'} 美元/月`,`Monthly · $${amount||'—'}/month`):copy(`年付 · ${amount||'—'} 美元/年`,`Yearly · $${amount||'—'}/year`);}
  document.getElementById('billingConsentText').textContent=copy('我同意按所选周期自动续费，直至我取消订阅。取消后不再续费，已付款权益保留至到期；退款或撤销可能暂停权益。年付额度仍按月重置。','I agree to automatic renewal at the selected interval until I cancel. Cancellation retains paid access until expiry; refunds or reversals may suspend access. Yearly quotas still reset monthly.');
  const current=rows.find(row=>!['CANCELLED','EXPIRED'].includes(row.status)),pending=current&&['APPROVAL_PENDING','APPROVED'].includes(current.status);
  if(pending)select.value=current.interval;
  select.disabled=busy||!!current;
  const start=document.getElementById('billingStart');start.textContent=busy?copy('处理中…','Processing…'):pending?copy('继续当前结账','Resume current checkout'):current?copy('当前订阅已存在','Current subscription exists'):copy('前往 PayPal 授权','Continue to PayPal');start.disabled=busy||!config?.enabled||!!(current&&!pending);
  const reload=document.getElementById('billingReload');reload.textContent=copy('刷新订阅状态','Refresh subscription');reload.disabled=busy;
  const list=document.getElementById('billingSubscriptions');list.replaceChildren();
  if(!rows.length){list.append(el('p',copy('当前账户暂无 PayPal 订阅。','No PayPal subscription for this account.')));return;}
  for(const row of rows){
   const card=el('div',null,'billing-row');card.append(el('strong',copy(row.interval==='yearly'?'年付专业版':'月付专业版',row.interval==='yearly'?'Pro Yearly':'Pro Monthly')+' · '+status(row.status)));
   card.append(el('p',copy('订阅编号：','Subscription: ')+(row.paypal_subscription_id||'—')));
   card.append(el('p',copy('权益到期：','Paid access ends: ')+date(row.paid_until)));
   card.append(el('p',copy('下次扣款：','Next billing: ')+(row.status==='CANCELLED'?copy('已停止自动续费','No further automatic billing'):date(row.next_billing_at))));
   card.append(el('p',row.review_required?copy('退款／撤销后已暂停权益，请联系客服核查。','Access held after refund/reversal. Contact support for review.'):row.payment_failed?copy('扣款未成功，权益已暂停。','Payment failed; access is paused.'):row.pro_access?copy('后端已确认专业版权益。','Server-confirmed Pro access.'):copy('尚无已确认的有效专业版权益。','No confirmed active Pro entitlement.')));
   if(row.can_cancel){const cancel=el('button',copy('取消自动续费','Cancel auto-renewal'),'btn-ghost');cancel.type='button';cancel.disabled=busy;cancel.onclick=()=>cancelSubscription(row);card.append(cancel);}list.append(card);
  }
 }
 async function load(sync=true){
  if(busy||!authToken)return;
  const version=epoch;busy=true;render();message(copy('正在读取订阅状态…','Loading subscription…'));
  try{
   const response=await apiFetch('/api/billing/subscriptions'),data=await response.json();
   if(version!==epoch)return;
   rows=data.subscriptions;
   const latest=rows[0];
   if(sync&&config?.enabled&&latest?.paypal_subscription_id){await apiFetch(`/api/billing/subscriptions/${encodeURIComponent(latest.id)}/sync`,{method:'POST'});if(version!==epoch)return;const fresh=await apiFetch('/api/billing/subscriptions');rows=(await fresh.json()).subscriptions;await restoreSession();await loadUsage();}
   message(copy('订阅状态已更新。','Subscription status updated.'));
  }catch(error){if(version===epoch)message(errorText(error));}
  finally{if(version===epoch){busy=false;render();}}
 }
 async function open(){
  if(!authToken){openModal('login');return;}
  closeMobile();window.lexPet?.close?.();build();if(!dialog.open)dialog.showModal();render();await load();
 }
 async function checkout(){
  if(busy||!authToken||!config?.enabled)return;
  if(!document.getElementById('billingConsent').checked){message(copy('请先确认自动续费规则。','Please accept the automatic renewal terms first.'));return;}
  const version=epoch;busy=true;render();message(copy('正在创建安全结账…','Creating checkout…'));
  try{
   const response=await apiFetch('/api/billing/subscriptions',{method:'POST',body:JSON.stringify({interval:document.getElementById('billingInterval').value})}),data=await response.json();
   if(version!==epoch)return;
   if(data.approval_url){const target=new URL(data.approval_url);if(target.protocol!=='https:'||target.hostname!=='www.sandbox.paypal.com'||target.username||target.password||(target.port&&target.port!=='443'))throw Error('Invalid approval URL');window.location.assign(target.href);}
   else{message(copy('授权已提交，请刷新状态确认付款结果。','Approval submitted. Refresh to verify payment.'));}
  }catch(error){if(version===epoch)message(errorText(error));}
  finally{if(version===epoch){busy=false;render();}}
 }
 async function cancelSubscription(row){
  if(busy||!confirm(copy('确定取消自动续费？已付款权益保留至到期。','Cancel auto-renewal? Paid access remains until expiry.')))return;
  const version=epoch;busy=true;render();
  try{await apiFetch(`/api/billing/subscriptions/${encodeURIComponent(row.id)}/cancel`,{method:'POST'});if(version!==epoch)return;const response=await apiFetch('/api/billing/subscriptions');rows=(await response.json()).subscriptions;await restoreSession();await loadUsage();message(copy('已取消自动续费。','Auto-renewal cancelled.'));}
  catch(error){if(version===epoch)message(errorText(error));}
  finally{if(version===epoch){busy=false;render();}}
 }
 async function handleReturn(){
  if(returnHandled||!authToken||!config?.enabled)return;
  const params=new URLSearchParams(location.search),id=params.get('paypal_return')||params.get('paypal_cancel');
  if(!id)return;returnHandled=true;
  const approved=params.has('paypal_return');
  // The query string is only a lookup hint. The server checks session ownership and PayPal.
  await open();
  if(approved){try{await apiFetch(`/api/billing/subscriptions/${encodeURIComponent(id)}/sync`,{method:'POST'});await load(false);await restoreSession();await loadUsage();}catch(error){message(errorText(error));}}
  else message(copy('本次授权已退出，未开通新权益；已有订阅仍以当前状态为准。','Checkout approval was abandoned; existing subscriptions retain their current state.'));
  const url=new URL(location.href);for(const key of ['paypal_return','paypal_cancel','subscription_id','ba_token','token'])url.searchParams.delete(key);history.replaceState(null,'',url.pathname+url.search+url.hash);
 }
 function authChanged(){
  const account=authUser?.id||null;
  if(account!==lastAccount){epoch++;busy=false;rows=[];lastAccount=account;if(dialog){render();dialog.close();}}
  if(account)handleReturn();
 }
 window.billingUi={open,refresh,authChanged};refresh();
 apiFetch('/api/billing/config').then(r=>r.json()).then(data=>{if(typeof data.enabled!=='boolean'||data.environment!=='sandbox'||!data.prices)return;config=data;refresh();authChanged();}).catch(()=>{});
})();
