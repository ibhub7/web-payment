(()=>{
const C=window.CONFIG,$=s=>document.querySelector(s),Q=new URLSearchParams(location.search);
const wa=window.Telegram&&Telegram.WebApp;if(wa){wa.ready();wa.expand()}
const tuser=wa&&wa.initDataUnsafe&&wa.initDataUnsafe.user;
const key=Q.get('bot'),bot=C.bots[key],mode=bot?'bot':'donate';
const st={amount:0,plan:''};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
document.title=(bot?bot.name:C.siteName)+' – Pay';
$('#title').textContent=bot?bot.name:C.donate.title;
$('#sub').textContent=bot?'Choose a plan and pay by UPI.':'Choose an amount. Your QR is made instantly.';
const un=Q.get('un')||(tuser&&tuser.username)||'',uid=Q.get('uid')||(tuser&&tuser.id)||'';
// picker
const pick=$('#pick');
if(bot){
  pick.innerHTML='<h2>Plan</h2><div class="chips">'+bot.plans.map((p,i)=>`<button type="button" class="chip" data-i="${i}" aria-pressed="false"><b>₹${p.amount}</b><span>${esc(p.label)}</span></button>`).join('')+'</div>';
  pick.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const p=bot.plans[b.dataset.i];
    pick.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));set(p.amount,p.label)};
  if(bot.plans.length===1)pick.querySelector('.chip').click();
}else{
  pick.innerHTML='<h2>Amount</h2><div class="chips">'+C.donate.presets.map(a=>`<button type="button" class="chip" data-a="${a}" aria-pressed="false"><b>₹${a}</b></button>`).join('')+'</div><label for="custom">Other amount</label><input id="custom" type="number" min="'+C.donate.min+'" inputmode="numeric" placeholder="Min ₹'+C.donate.min+'">';
  pick.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;pick.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed',x===b));$('#custom').value='';set(+b.dataset.a,'Donation')};
  $('#custom').oninput=e=>{pick.querySelectorAll('.chip').forEach(x=>x.setAttribute('aria-pressed','false'));const v=Math.floor(+e.target.value);set(v>=C.donate.min&&v<=100000?v:0,'Donation')};
  const bl=$('#botList');bl.hidden=false;
  bl.insertAdjacentHTML('beforeend',Object.entries(C.bots).map(([k,b])=>`<a href="?bot=${encodeURIComponent(k)}${un?'&un='+encodeURIComponent(un):''}${uid?'&uid='+encodeURIComponent(uid):''}">${esc(b.name)}<span>from ₹${Math.min(...b.plans.map(p=>p.amount))}</span></a>`).join(''));
}
// dynamic QR
function set(a,label){st.amount=a;st.plan=label;draw()}
function draw(){
  const box=$('#qrBox');
  if(!st.amount){box.hidden=true;return}
  const note=((bot?bot.name:'Donation')+' '+(un||uid||'')).trim().slice(0,40);
  const url='upi://pay?pa='+encodeURIComponent(C.upi.id)+'&pn='+encodeURIComponent(C.upi.name)+'&am='+st.amount.toFixed(2)+'&cu=INR&tn='+encodeURIComponent(note);
  $('#amtTxt').textContent='₹'+st.amount;$('#upiTxt').textContent=C.upi.id+' · '+C.upi.name;
  const q=$('#qr');q.innerHTML='';new QRCode(q,{text:url,width:208,height:208,correctLevel:QRCode.CorrectLevel.M});
  $('#upiBtn').href=url;box.hidden=false;
}
$('#copyBtn').onclick=async e=>{try{await navigator.clipboard.writeText(C.upi.id);e.target.textContent='Copied'}catch(_){e.target.textContent=C.upi.id}setTimeout(()=>e.target.textContent='Copy UPI ID',1800)};
})();
