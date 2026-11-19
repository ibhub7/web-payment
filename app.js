(()=>{
const C = window.CONFIG, $ = s => document.querySelector(s), Q = new URLSearchParams(location.search);
const wa = window.Telegram && Telegram.WebApp;

if (wa) {
  try {
    wa.ready();
    wa.expand();
  } catch (_) {}
}

// Bot key normalization (e.g. 'black_panther' or 'blackpanther' -> 'blackpanther')
const rawKey = (Q.get('bot') || '').toLowerCase().replace(/[-_ ]/g, '');
const botMap = {
  blackpanther: 'blackpanther',
  panther: 'blackpanther',
  mpxpanther: 'blackpanther',
  edith: 'edith',
  pmmovies: 'pmmovies',
  pmmovie: 'pmmovies',
  pmmoviessearch: 'pmmovies',
  jacksparrow: 'jacksparrow',
  sparrow: 'jacksparrow'
};

const resolvedKey = botMap[rawKey] || (C.bots[rawKey] ? rawKey : null);
const bot = resolvedKey ? C.bots[resolvedKey] : null;

const un = Q.get('un') || (wa && wa.initDataUnsafe && wa.initDataUnsafe.user && wa.initDataUnsafe.user.username) || '';
const uid = Q.get('uid') || (wa && wa.initDataUnsafe && wa.initDataUnsafe.user && wa.initDataUnsafe.user.id) || '';

const st = { amount: 0, plan: '' };
let timerInterval = null;

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

document.title = (bot ? bot.name : C.siteName) + ' – Pay';
$('#title').textContent = bot ? bot.name : C.donate.title;
$('#sub').textContent = bot 
  ? (bot.tagline || 'Choose a plan and pay with any UPI app.') 
  : 'Choose an amount to support or select a movie bot below.';

// Render plan picker or donation picker
const pick = $('#pick');
if (bot) {
  pick.innerHTML = '<h2>Choose Plan</h2><div class="chips">' + 
    bot.plans.map((p, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="false"><b>₹${p.amount}</b><span>${esc(p.label)}</span></button>`).join('') + 
    '</div>';

  pick.onclick = e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const p = bot.plans[b.dataset.i];
    pick.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (wa && wa.HapticFeedback) wa.HapticFeedback.selectionChanged();
    set(p.amount, p.label);
  };

  if (bot.plans.length === 1) {
    pick.querySelector('.chip').click();
  }
} else {
  // Bare/Normal link: Donation & list of movie bots
  pick.innerHTML = '<h2>Support Amount</h2><div class="chips">' + 
    C.donate.presets.map(a => `<button type="button" class="chip" data-a="${a}" aria-pressed="false"><b>₹${a}</b></button>`).join('') + 
    '</div><input id="custom" type="number" min="' + C.donate.min + '" inputmode="numeric" placeholder="Other amount (Min ₹' + C.donate.min + ')" style="margin-top:10px">';

  pick.onclick = e => {
    const b = e.target.closest('.chip');
    if (!b) return;
    pick.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#custom').value = '';
    if (wa && wa.HapticFeedback) wa.HapticFeedback.selectionChanged();
    set(+b.dataset.a, 'Donation');
  };

  $('#custom').oninput = e => {
    pick.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', 'false'));
    const v = Math.floor(+e.target.value);
    set(v >= C.donate.min && v <= 100000 ? v : 0, 'Donation');
  };

  // Render Bot List
  const bl = $('#botList');
  bl.hidden = false;
  bl.insertAdjacentHTML('beforeend', Object.entries(C.bots).map(([k, b]) => {
    const minAmt = Math.min(...b.plans.map(p => p.amount));
    return `<a href="?bot=${encodeURIComponent(k)}${un ? '&un=' + encodeURIComponent(un) : ''}${uid ? '&uid=' + encodeURIComponent(uid) : ''}">
      <span>${esc(b.name)}</span>
      <span>from ₹${minAmt} ➔</span>
    </a>`;
  }).join(''));
}

function set(amount, label) {
  st.amount = amount;
  st.plan = label;
  draw();
}

function startTimer(durationSeconds) {
  clearInterval(timerInterval);
  let timeLeft = durationSeconds;
  const el = $('#countdown');
  timerInterval = setInterval(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    if (--timeLeft < 0) {
      clearInterval(timerInterval);
      el.textContent = "Expired. Please re-select plan.";
    }
  }, 1000);
}

function draw() {
  const box = $('#qrBox');
  if (!st.amount) {
    box.hidden = true;
    return;
  }

  const note = ((bot ? bot.name.replace(/[^a-zA-Z0-9 ]/g, '') : 'Donation') + ' ' + (un || uid || '')).trim().slice(0, 30);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(C.upi.id)}&pn=${encodeURIComponent(C.upi.name)}&am=${st.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

  $('#amtTxt').textContent = '₹' + st.amount;
  $('#upiTxt').textContent = C.upi.id + ' · ' + C.upi.name;

  const q = $('#qr');
  q.innerHTML = '';
  new QRCode(q, {
    text: upiUrl,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.M
  });

  $('#upiBtn').href = upiUrl;
  box.hidden = false;
  startTimer(300); // 5 minutes timer
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Copy UPI ID button
$('#copyBtn').onclick = async e => {
  try {
    await navigator.clipboard.writeText(C.upi.id);
    e.target.textContent = 'Copied!';
    if (wa && wa.HapticFeedback) wa.HapticFeedback.notificationOccurred('success');
  } catch (_) {
    e.target.textContent = C.upi.id;
  }
  setTimeout(() => e.target.textContent = 'Copy UPI ID', 1800);
};

// UTR Input Validation & Submission
const utrInput = $('#utrInput');
const submitBtn = $('#submitBtn');

utrInput.oninput = e => {
  e.target.value = e.target.value.replace(/\D/g, ''); // Digits only
  submitBtn.disabled = e.target.value.length < 10;
};

submitBtn.onclick = () => {
  const utr = utrInput.value.trim();
  if (!utr) return;

  const payload = {
    event: 'PAYMENT_SUBMITTED',
    botKey: resolvedKey || 'donation',
    botName: bot ? bot.name : 'Donation',
    plan: st.plan,
    amount: st.amount,
    utr: utr,
    username: un,
    userId: uid
  };

  // If inside Telegram WebApp, send data back to bot
  if (wa && wa.sendData) {
    if (wa.HapticFeedback) wa.HapticFeedback.notificationOccurred('success');
    wa.sendData(JSON.stringify(payload));
  }

  // Update Proof button URL
  const proofUrl = (bot && bot.supportUrl) ? bot.supportUrl : 'https://t.me/mpxpanther_bot';
  $('#proofBtn').href = proofUrl;

  // Show Success Box
  $('#pick').hidden = true;
  $('#qrBox').hidden = true;
  $('#successBox').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

$('#closeBtn').onclick = () => {
  if (wa && wa.close) {
    wa.close();
  } else {
    location.reload();
  }
};
})();
