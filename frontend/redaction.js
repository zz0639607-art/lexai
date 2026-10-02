// Local-only pattern redaction. No request is sent and no text is persisted.
const redactionWords={
 zh:{intro:'在本地自动识别姓名标签、证件号、手机号、邮箱和银行卡号。先核对脱敏结果，再用于分析；未标注姓名、地址和特殊格式可能漏识别，可在补充词中填写。原文不会因预览而改变。',input:'原文（最多 100,000 字符）',extra:'补充脱敏词（每行一个，如姓名、公司名、地址；最多 100 个）',output:'脱敏预览',scan:'重新识别',use:'使用分析区正文',apply:'将预览用于所选功能',copy:'复制脱敏文本',download:'下载脱敏 TXT',target:'用于',analysis:'合同分析',qa:'合同专属问答',rewrite:'条款改写',library:'保存到历史的编辑区',empty:'请先填写原文。',limit:'正文最多 100,000 字符；补充词须为 2–200 字符，每行一个，最多 100 个。',done:'已替换 {n} 处。请核对结果；未匹配到不代表没有敏感信息。',replace:'将脱敏结果替换目标输入框中的文字？',applied:'已带入脱敏文字；尚未发送 AI 或存入数据库。',tooLong:'该输入区最多 4,000 字符，请缩短后再使用。',copied:'已复制脱敏文字。',copyFail:'无法自动复制，请手动选择预览内容。',downloaded:'已发起下载，请检查下载文件夹。'},
 en:{intro:'Automatically mask labelled names, identity numbers, phone numbers, email addresses and card numbers locally. Review the preview before use. Unlabelled names, addresses and unusual formats may be missed; add them below. Your original is preserved.',input:'Original text (up to 100,000 characters)',extra:'Additional terms (one per line; names, organisations or addresses; up to 100)',output:'Redacted preview',scan:'Scan again',use:'Use analysis text',apply:'Use preview in selected tool',copy:'Copy redacted text',download:'Download redacted TXT',target:'Use in',analysis:'Contract analysis',qa:'Contract questions',rewrite:'Clause rewrite',library:'History save editor',empty:'Enter original text first.',limit:'Maximum 100,000 characters. Additional terms must be 2–200 characters each, up to 100 terms.',done:'Replaced {n} occurrences. Review the result; no matches does not mean no sensitive information.',replace:'Replace the target input with the redacted preview?',applied:'Redacted text loaded. It has not been sent to AI or saved in the database.',tooLong:'This field accepts up to 4,000 characters. Shorten the text first.',copied:'Redacted text copied.',copyFail:'Copy unavailable; select the preview manually.',downloaded:'Download requested. Check your downloads folder.'}
};
function redactionText(key){return redactionWords[typeof currentLang!=='undefined'&&currentLang.startsWith('zh')?'zh':'en'][key]||key;}
function redactSensitiveText(text,custom=[]){
  if(text.length>100000||custom.length>100||custom.some(x=>x.length<2||x.length>200))throw Error('limit');
  const hits=[],nameValues=new Set();
  function pattern(regex,type,group=0){for(const match of text.matchAll(regex)){
    const value=match[group];if(!value)continue;
    const start=match.index+(group?match[0].lastIndexOf(value):0);
    hits.push({start,end:start+value.length,type,value});if(type==='NAME')nameValues.add(value);
  }}
  pattern(/(?<![\dA-Za-z])\d{17}[\dXx](?![\dA-Za-z])/g,'ID');
  pattern(/(?:身份证(?:号|号码)?|证件(?:号|号码)?)[：:\s]*([0-9]{15})(?!\d)/g,'ID',1);
  pattern(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'EMAIL');
  pattern(/(?<!\d)(?:\+?86[- ]?)?1[3-9]\d{9}(?!\d)/g,'PHONE');
  pattern(/(?:电话|联系电话|手机号|手机号码|Phone|Tel)[：:\s]*([+\d][\d ()-]{6,24}\d)/gi,'PHONE',1);
  pattern(/(?:银行卡号|银行账号|收款账号|账户号码|Account(?:\s+number)?)[：:\s]*([\d][\d -]{6,28}\d)/gi,'ACCOUNT',1);
  pattern(/(?<!\d)\d{16,19}(?!\d)/g,'ACCOUNT');
  pattern(/(?:护照(?:号|号码)?|Passport(?:\s+(?:No\.?|Number))?)[：:\s]*([A-Z0-9]{5,20})\b/gi,'ID',1);
  pattern(/(?:姓名|联系人|法定代表人|签字人|签署人|甲方[（(]个人[）)]|乙方[（(]个人[）)])[：: \t]*([\u3400-\u9fff·]{2,6})(?=[\s，,；;。]|$)/g,'NAME',1);
  pattern(/(?:^|\n)(?:Name|Contact person|Signatory)[：: \t]+([A-Za-z][A-Za-z .'-]{1,70}?)(?=[\n,;]|$)/gi,'NAME',1);
  // Mask repeat mentions of a labelled name as well as its labelled occurrence.
  for(const [type,values] of [['NAME',[...nameValues]],['CUSTOM',custom]])for(const value of values){
    let start=0;while((start=text.indexOf(value,start))!==-1){hits.push({start,end:start+value.length,type,value});start+=value.length;}
  }
  const priority={CUSTOM:0,ID:1,EMAIL:2,PHONE:3,NAME:4,ACCOUNT:5};
  hits.sort((a,b)=>a.start-b.start||priority[a.type]-priority[b.type]||b.end-a.end);
  const counts={},mapping=new Map();let end=0,result='',total=0;
  for(const hit of hits){if(hit.start<end)continue;
    const key=hit.type+'\0'+hit.value;
    if(!mapping.has(key)){counts[hit.type]=(counts[hit.type]||0)+1;mapping.set(key,`[${hit.type}_${counts[hit.type]}]`);}
    result+=text.slice(end,hit.start)+mapping.get(key);end=hit.end;total++;
  }
  return {text:result+text.slice(end),total};
}
let redactionTimer,redactionStatusKey='',redactionCount=0;
function renderRedactionLanguage(){
  document.querySelectorAll('[data-redaction-text]').forEach(node=>node.textContent=redactionText(node.dataset.redactionText));
  const status=document.getElementById('redactionStatus');if(status)status.textContent=redactionText(redactionStatusKey).replace('{n}',String(redactionCount));
}
function redactionStatus(key){redactionStatusKey=key;renderRedactionLanguage();}
function previewRedaction(){
  const source=document.getElementById('redactionOriginal').value;
  const custom=document.getElementById('redactionCustom').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  document.getElementById('redactionOutput').value='';
  if(!source.trim()){redactionStatus('empty');return;}
  try{const result=redactSensitiveText(source,custom);document.getElementById('redactionOutput').value=result.text;redactionCount=result.total;redactionStatus('done');}
  catch{redactionStatus('limit');}
}
function redactionFromAnalysis(){document.getElementById('redactionOriginal').value=document.getElementById('contractTxt').value;openWorkspace('redact');previewRedaction();}
function useRedactionPreview(){
  previewRedaction();const text=document.getElementById('redactionOutput').value;if(!text)return;
  const key=document.getElementById('redactionTarget').value;
  const targets={analysis:['contractTxt','analyze'],qa:['qaContract','contractqa'],rewrite:['rewriteOriginal','rewrite'],library:['orgSaveContent','library']};
  const pair=targets[key];if(!pair)return;
  if(key==='rewrite'&&text.length>4000){redactionStatus('tooLong');return;}
  const input=document.getElementById(pair[0]);if(input.value&&input.value!==text&&!window.confirm(redactionText('replace')))return;
  input.value=text;
  if(key==='qa')invalidateContractQA();if(key==='rewrite')invalidateRewrite();if(key==='analysis')updateLengthNotice(text);
  if(key==='library'){document.getElementById('orgSaveReport').value='';document.getElementById('orgSaveSource').value='redacted';}
  openWorkspace(pair[1]);redactionStatus('applied');
}
async function copyRedaction(){previewRedaction();const text=document.getElementById('redactionOutput').value;if(!text)return;try{await navigator.clipboard.writeText(text);redactionStatus('copied');}catch{redactionStatus('copyFail');}}
function downloadRedaction(){previewRedaction();const text=document.getElementById('redactionOutput').value;if(!text)return;saveDraftBlob(new Blob(['\ufeff'+text],{type:'text/plain;charset=utf-8'}),'LexAI-redacted.txt',false);redactionStatus('downloaded');}
function initRedaction(){
  const root=document.getElementById('panel-redact');if(!root)return;
  root.innerHTML=`<p class="draft-notice" data-redaction-text="intro"></p><div class="review-grid"><div class="fg"><label for="redactionOriginal" data-redaction-text="input"></label><textarea id="redactionOriginal" rows="12"></textarea><label for="redactionCustom" data-redaction-text="extra"></label><textarea id="redactionCustom" rows="3"></textarea></div><div class="fg"><label for="redactionOutput" data-redaction-text="output"></label><textarea id="redactionOutput" rows="18" readonly></textarea></div></div><div class="draft-actions"><button class="btn-primary" onclick="previewRedaction()" data-redaction-text="scan"></button><button class="btn-ghost" onclick="redactionFromAnalysis()" data-redaction-text="use"></button><button class="btn-ghost" onclick="copyRedaction()" data-redaction-text="copy"></button><button class="btn-ghost" onclick="downloadRedaction()" data-redaction-text="download"></button></div><label for="redactionTarget" data-redaction-text="target"></label><select id="redactionTarget"><option value="analysis" data-redaction-text="analysis"></option><option value="qa" data-redaction-text="qa"></option><option value="rewrite" data-redaction-text="rewrite"></option><option value="library" data-redaction-text="library"></option></select><button class="btn-ghost" onclick="useRedactionPreview()" data-redaction-text="apply"></button><p id="redactionStatus" role="status" class="review-status"></p>`;
  for(const id of ['redactionOriginal','redactionCustom'])document.getElementById(id).addEventListener('input',()=>{document.getElementById('redactionOutput').value='';clearTimeout(redactionTimer);redactionTimer=setTimeout(previewRedaction,180);});
  renderRedactionLanguage();
}
initRedaction();
