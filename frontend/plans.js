/* Public quotas come from the same limits used for request enforcement. */
(()=>{
 let loaded=null;
 const defaults={free:{analyze:3,generate:3,chat:30},pro:{analyze:null,generate:30,chat:500}};
 const text=key=>LANGS[currentLang]?.[key]||LANGS.en[key]||key;
 function refresh(){
  const quotas=loaded||defaults;
  document.querySelectorAll('[data-plan-count]').forEach(node=>{
   const [tier,endpoint]=node.dataset.planCount.split('.'),value=quotas[tier][endpoint];
   node.textContent=value===null?text('plan_no_cap'):Number(value).toLocaleString(currentLang.startsWith('zh')?'zh-CN':'en-US');
   const unit=document.querySelector(`[data-plan-unit="${tier}.${endpoint}"]`);if(unit)unit.hidden=value===null;
  });
  const status=document.getElementById('planQuotaStatus');if(status)status.textContent=text(loaded?'plan_quota_live':'plan_quota_default');
 }
 window.planQuotaUi={refresh};refresh();
 apiFetch('/api/plans').then(response=>response.json()).then(data=>{
  const valid=(tier,key)=>Number.isInteger(data.quotas?.[tier]?.[key])&&data.quotas[tier][key]>=0;
  if(!['free','pro'].every(tier=>['generate','chat'].every(key=>valid(tier,key)))||!valid('free','analyze')||data.quotas.pro.analyze!==null)return;
  loaded={free:{...data.quotas.free},pro:{...data.quotas.pro}};refresh();
 }).catch(()=>{});
})();
