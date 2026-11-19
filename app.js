(()=>{
  const C = window.CONFIG;
  const $ = s => document.querySelector(s);
  const Q = new URLSearchParams(window.location.search);
  const wa = window.Telegram && Telegram.WebApp;

  if (wa) {
    try {
      wa.ready();
      wa.expand();
    } catch (_) {}
  }

  // State
  let currentAmount = C.defaultAmount || 50;
  let currentNote = "Payment";
  let qrcodeInstance = null;

  // Normalization for bot route
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

  const resolvedKey = botMap[rawKey] || (C.bots && C.bots[rawKey] ? rawKey : null);
  const bot = resolvedKey ? C.bots[resolvedKey] : null;

  const un = Q.get('un') || (wa && wa.initDataUnsafe && wa.initDataUnsafe.user && wa.initDataUnsafe.user.username) || '';
  const uid = Q.get('uid') || (wa && wa.initDataUnsafe && wa.initDataUnsafe.user && wa.initDataUnsafe.user.id) || '';

  // DOM Elements
  const pageTitle = $('#pageTitle');
  const pageIcon = $('#pageIcon');
  const botSection = $('#botSection');
  const homeSection = $('#homeSection');
  const planList = $('#planList');
  const presetList = $('#presetList');
  const customAmountInput = $('#customAmount');
  const displayAmount = $('#displayAmount');
  const upiID = $('#upiID');
  const qrBox = $('#qr');
  const toast = $('#toast');
  const toastMsg = $('#toastMsg');
  const supportContainer = $('#supportContainer');

  // Set UPI ID text
  if (upiID) upiID.textContent = C.upi.id;

  // Render Support Telegram Buttons
  if (supportContainer && C.supportBots) {
    supportContainer.innerHTML = C.supportBots.map(b => `
      <a href="${b.url}" target="_blank" 
        class="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm">
        <i class="fa-brands fa-telegram text-blue-500 text-sm"></i> ${b.name}
      </a>
    `).join('');
  }

  // Toast Function
  window.showToast = function(msg) {
    if (!toast) return;
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('flex');
    setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('flex');
    }, 2500);
  };

  // Generate / Update QR
  function updateQR(amount, noteText) {
    currentAmount = Number(amount) || 1;
    currentNote = noteText || (bot ? bot.name : 'QuickPay');

    const userInfo = (un || uid ? ` ${un || uid}` : '').trim();
    const fullNote = `${currentNote} ${userInfo}`.trim().slice(0, 30);
    const upiUrl = `upi://pay?pa=${encodeURIComponent(C.upi.id)}&pn=${encodeURIComponent(C.upi.name)}&am=${currentAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(fullNote)}`;

    displayAmount.textContent = `₹${currentAmount}`;
    qrBox.innerHTML = '';

    qrcodeInstance = new QRCode(qrBox, {
      text: upiUrl,
      width: 180,
      height: 180,
      correctLevel: QRCode.CorrectLevel.M
    });

    window.currentUpiUrl = upiUrl;
  }

  // Handle Pay with App
  window.handlePay = function() {
    if (!window.currentUpiUrl) return;
    showToast("Opening UPI app...");
    if (wa && wa.HapticFeedback) wa.HapticFeedback.impactOccurred('medium');
    setTimeout(() => {
      window.location.href = window.currentUpiUrl;
    }, 400);
  };

  // Handle Copy UPI
  window.handleCopy = async function() {
    try {
      await navigator.clipboard.writeText(C.upi.id);
      showToast("UPI ID copied!");
      if (wa && wa.HapticFeedback) wa.HapticFeedback.notificationOccurred('success');
    } catch (_) {
      showToast(C.upi.id);
    }
  };

  // Handle Download QR
  window.handleDownload = function() {
    const canvas = qrBox.querySelector('canvas');
    const img = qrBox.querySelector('img');
    let dataUrl = '';

    if (canvas) {
      dataUrl = canvas.toDataURL('image/png');
    } else if (img && img.src) {
      dataUrl = img.src;
    }

    if (!dataUrl) {
      showToast("Could not download QR");
      return;
    }

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `UPI-QR-₹${currentAmount}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("QR downloaded!");
    if (wa && wa.HapticFeedback) wa.HapticFeedback.notificationOccurred('success');
  };

  // ROUTE 1: BOT ROUTE
  if (bot) {
    document.title = `${bot.name} – Pay`;
    pageTitle.textContent = bot.name;
    if (bot.icon) pageIcon.textContent = bot.icon;
    botSection.classList.remove('hidden');

    planList.innerHTML = bot.plans.map((p, i) => `
      <button type="button" class="plan-chip text-left p-3 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 transition active:scale-[0.98] select-none" data-index="${i}">
        <span class="block text-xs font-semibold text-slate-500 leading-tight mb-1 truncate">${p.label}</span>
        <span class="block text-base font-bold text-indigo-600">₹${p.amount}</span>
      </button>
    `).join('');

    planList.onclick = e => {
      const btn = e.target.closest('.plan-chip');
      if (!btn) return;
      const index = Number(btn.dataset.index);
      const selectedPlan = bot.plans[index];
      if (!selectedPlan) return;

      planList.querySelectorAll('.plan-chip').forEach(c => c.dataset.active = (c === btn ? 'true' : 'false'));
      if (wa && wa.HapticFeedback) wa.HapticFeedback.selectionChanged();
      updateQR(selectedPlan.amount, `${bot.name} ${selectedPlan.label}`);
    };

    // Pre-select 1st plan
    const firstPlanBtn = planList.querySelector('.plan-chip');
    if (firstPlanBtn) firstPlanBtn.click();

  } else {
    // ROUTE 2: HOME ROUTE (Amount selector, no bot list)
    document.title = `${C.siteName} – Pay`;
    pageTitle.textContent = C.siteName;
    homeSection.classList.remove('hidden');

    const presets = C.amountPresets || [10, 20, 50, 100, 200];
    presetList.innerHTML = presets.map(amt => `
      <button type="button" class="preset-chip py-1.5 px-1 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition active:scale-95" data-amount="${amt}">
        ₹${amt}
      </button>
    `).join('');

    presetList.onclick = e => {
      const btn = e.target.closest('.preset-chip');
      if (!btn) return;
      const amt = Number(btn.dataset.amount);
      presetList.querySelectorAll('.preset-chip').forEach(c => c.dataset.active = (c === btn ? 'true' : 'false'));
      customAmountInput.value = '';
      if (wa && wa.HapticFeedback) wa.HapticFeedback.selectionChanged();
      updateQR(amt, 'Donation');
    };

    customAmountInput.oninput = e => {
      presetList.querySelectorAll('.preset-chip').forEach(c => c.dataset.active = 'false');
      const val = Math.floor(Number(e.target.value));
      if (val > 0) {
        updateQR(val, 'Donation');
      }
    };

    // Pre-select default amount
    const defaultBtn = presetList.querySelector(`[data-amount="${currentAmount}"]`) || presetList.querySelector('.preset-chip');
    if (defaultBtn) {
      defaultBtn.click();
    } else {
      updateQR(currentAmount, 'Donation');
    }
  }
})();
