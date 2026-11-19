// ===== EDIT ONLY THIS FILE =====
window.CONFIG = {
  siteName: "BotPay",
  upi: { id: "paradox52693@okhdfcbank", name: "BotPay" },     // tomar UPI ID + naam
  donate: { title: "Support us",  presets: [20, 50, 100, 200], min: 10 },
  // Prottek bot er alada plan/amount. URL: ?bot=<key>
  bots: {
    movies: { name: "Movies Bot", plans: [
      { label: "Premium 1 Month", amount: 30 },
      { label: "Premium 3 Months", amount: 80 },
      { label: "Lifetime", amount: 199 } ] },
    anime: { name: "Anime Bot", plans: [
      { label: "Premium 1 Month", amount: 20 },
      { label: "Premium 6 Months", amount: 99 } ] }
  }
};
