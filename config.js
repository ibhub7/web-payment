window.CONFIG = {
  siteName: "Quick Pay",
  upi: { 
    id: "paradox52693@okhdfcbank", 
    name: "BotPay" 
  },
  defaultAmount: 50,
  amountPresets: [10, 20, 50, 100, 200],
  
  supportBots: [
    { name: "@talk_mrs_bot", url: "https://t.me/talk_mrs_bot" },
    { name: "@mpsupport_bot", url: "https://t.me/mpsupport_bot" }
  ],

  bots: {
    blackpanther: {
      name: "Black Panther",
      icon: "🎫",
      plans: [
        { label: "1 Week", amount: 10 },
        { label: "1 Month", amount: 29 },
        { label: "3 Months", amount: 89 },
        { label: "6 Months", amount: 169 }
      ]
    },
    edith: {
      name: "EDITH",
      icon: "👑",
      plans: [
        { label: "1 Week (07 Days)", amount: 10 },
        { label: "1 Month (31 Days)", amount: 29 },
        { label: "2 Months (63 Days)", amount: 59 },
        { label: "3 Months (97 Days)", amount: 89 },
        { label: "6 Months (196 Days)", amount: 179 },
        { label: "1 Year (400 Days)", amount: 359 }
      ]
    },
    pmmovies: {
      name: "PM Movies Search",
      icon: "🎖️",
      plans: [
        { label: "07 Days", amount: 10 },
        { label: "15 Days", amount: 20 },
        { label: "30 Days", amount: 40 },
        { label: "45 Days", amount: 55 },
        { label: "60 Days", amount: 75 }
      ]
    },
    jacksparrow: {
      name: "Jack Sparrow",
      icon: "🏴‍☠️",
      plans: [
        { label: "01 Week", amount: 15 },
        { label: "01 Month", amount: 30 },
        { label: "02 Months", amount: 59 },
        { label: "03 Months", amount: 85 },
        { label: "06 Months", amount: 169 },
        { label: "12 Months", amount: 329 }
      ]
    }
  }
};
