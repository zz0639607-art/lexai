// Fresh, single-use work proofs. All checks are independently enforced by the server.
async function browserWorkHeaders(path,csrf,signal){
  if(!['/api/auth/register','/api/auth/email-code/request','/api/email/forgot-password'].includes(path))return {};
  if(!crypto.subtle)throw new Error(accountText('Browser security check requires HTTPS or localhost.'));
  const response=await fetch(getBaseUrl()+'/api/protection/challenge',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({path}),credentials:'include',cache:'no-store',signal});
  if(!response.ok)throw new Error(friendlyApiError((await response.json()).detail,response.status,path));
  const data=await response.json(),encoder=new TextEncoder();
  if(typeof data.challenge!=='string'||data.challenge.length>2048||!Number.isInteger(data.difficulty)||data.difficulty<12||data.difficulty>20)throw new Error(accountText('Invalid security challenge.'));
  const full=Math.floor(data.difficulty/8),remaining=data.difficulty%8,started=Date.now();
  for(let nonce=0;nonce<10000000;nonce++){
    if(signal?.aborted||Date.now()-started>90000)throw new Error(accountText('The request timed out. Please try again.'));
    const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(data.challenge+':'+nonce)));
    if(hash.slice(0,full).every(byte=>byte===0)&&(!remaining||(hash[full]>>(8-remaining))===0))return {'X-Bot-Challenge':data.challenge,'X-Bot-Solution':String(nonce)};
    if(nonce%128===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  throw new Error(accountText('Complete the browser security check and retry.'));
}
function openEmailVerification(){
  openModal('code');document.getElementById('codeEmail').value=authUser?.email||'';
  loginChallenge='';loginChallengeEmail='';document.getElementById('loginCode').value='';
}
function updateProtectionUI(){
  const notice=document.getElementById('emailVerifyNotice');if(!notice)return;
  notice.hidden=!authToken||authUser?.email_verified===true;
  notice.textContent=currentLang.startsWith('zh')?'使用 AI 前，请点击此处通过邮箱验证码验证账户。一个邮箱只能激活一个账户。':'Verify your email with a sign-in code before using AI. One mailbox can activate one account.';
}
updateProtectionUI();
