window.MuCityData = {
  services: [
    { id: "aroma", category: "舒壓", name: "精油舒壓", duration: "90 分鐘", price: 1880, description: "適合下班後快速放鬆，主打肩頸釋壓、下背舒展與溫潤精油推撫。", points: ["瑞典式舒壓", "肩頸重點釋放", "居家香氛精油"] },
    { id: "deep", category: "修復", name: "深層筋膜", duration: "120 分鐘", price: 2380, description: "針對久坐、運動後緊繃與長期疲勞，結合筋膜放鬆與深層按壓。", points: ["深層肌群", "體態放鬆", "運動恢復"] },
    { id: "sleep", category: "舒眠", name: "睡眠修復", duration: "60 分鐘", price: 1480, description: "用較柔和的節奏與頭肩放鬆技巧，幫助身心降速，適合晚間預約。", points: ["頭肩放鬆", "輕壓節奏", "晚間推薦"] },
    { id: "foot", category: "循環", name: "足底循環", duration: "70 分鐘", price: 1580, description: "從足底反射區到小腿循環舒緩，特別適合久站與旅行後疲勞。", points: ["足底反射", "小腿舒緩", "循環釋放"] },
    { id: "prenatal", category: "舒壓", name: "孕感舒緩", duration: "75 分鐘", price: 2080, description: "以溫和節奏協助腿部循環與腰臀放鬆，適合孕期中後段預約。", points: ["溫和手法", "腿臀舒緩", "專屬姿勢輔具"] },
    { id: "office", category: "修復", name: "久坐肩頸救援", duration: "45 分鐘", price: 1280, description: "短時段高效率方案，集中釋放肩頸、上背與手臂緊繃。", points: ["肩頸加強", "上背放鬆", "辦公族推薦"] }
  ],
  therapists: [
    { id: "t1", name: "Lina", title: "芳療師 6 年", specialty: "精油舒壓、睡眠修復", eta: "45 分鐘可到", rating: 4.9, orders: 1248, serviceId: "aroma", tags: ["高回購", "輕柔手法", "晚間熱門"], bio: "擅長舒壓與睡眠調理，重視服務節奏與細膩溝通。", reviews: [{ user: "C小姐", score: 5, body: "肩頸放鬆很有感，力道穩定，整體體驗很舒服。" }, { user: "Allen", score: 5, body: "準時到達，流程清楚，服務結束後真的比較好睡。" }] },
    { id: "t2", name: "Mia", title: "推拿師 8 年", specialty: "深層筋膜、肩頸調理", eta: "35 分鐘可到", rating: 4.8, orders: 1810, serviceId: "deep", tags: ["重手法", "筋膜調理", "運動恢復"], bio: "長期服務運動與久坐族群，擅長深層放鬆與結構性緊繃處理。", reviews: [{ user: "Ray", score: 5, body: "肩背卡點有處理到，按完真的輕很多。" }, { user: "Joan", score: 4, body: "手法偏深層，適合真的很緊的人。" }] },
    { id: "t3", name: "Yuri", title: "運動按摩 5 年", specialty: "體態放鬆、腿部修復", eta: "55 分鐘可到", rating: 4.9, orders: 966, serviceId: "foot", tags: ["腿部循環", "站立疲勞", "外勤熱門"], bio: "以循環舒緩與下肢修復見長，適合久站與高活動量族群。", reviews: [{ user: "Momo", score: 5, body: "小腿跟足底真的有被救到，走路輕很多。" }] },
    { id: "t4", name: "Iris", title: "舒眠芳療 4 年", specialty: "睡眠修復、孕感舒緩", eta: "50 分鐘可到", rating: 4.7, orders: 701, serviceId: "sleep", tags: ["舒眠節奏", "溫和體感", "孕期友善"], bio: "專注舒眠與溫和型手法，服務節奏細緻，互動感受佳。", reviews: [{ user: "Lulu", score: 5, body: "很溫柔，整套節奏很舒服，適合睡前。" }] }
  ],
  banners: [
    { title: "今晚熱門時段", subtitle: "20:00 後到府單量上升，建議提前預約" },
    { title: "雙人同行 95 折", subtitle: "同地址雙人下單，系統自動套用活動價" },
    { title: "新客首單減 300", subtitle: "滿 1500 即可折抵，限首次完成訂單使用" }
  ],
  notices: [
    "平台已開通台北、新北、桃園、台中四城到府服務。",
    "夜間熱門時段 20:00 至 23:30，建議提早 30 分鐘預約。",
    "服務前 10 分鐘將顯示技師出發狀態與預計到達時間。"
  ],
  cities: [
    { id: "taipei", name: "台北市", range: "大安、信義、松山、中山、內湖、士林、北投等主要行政區可服務。" },
    { id: "newtaipei", name: "新北市", range: "板橋、中和、永和、新店、新莊、三重、蘆洲可服務，偏遠區域需人工確認。" },
    { id: "taoyuan", name: "桃園市", range: "桃園、中壢、龜山、八德可安排，部分時段需加收跨區費。" },
    { id: "taichung", name: "台中市", range: "西屯、南屯、西區、北區與七期商圈可安排當日服務。" }
  ],
  campaigns: [
    { id: "camp-1", title: "晚間舒壓專場", subtitle: "20:00 後下單立折 200", badge: "Night", serviceId: "aroma" },
    { id: "camp-2", title: "雙人到府方案", subtitle: "同地址雙人預約再享 95 折", badge: "Duo", serviceId: "deep" },
    { id: "camp-3", title: "新客首單禮", subtitle: "首單滿 1500 折 300", badge: "New", serviceId: "sleep" }
  ],
  shortcutItems: [
    { id: "nearby", label: "附近技師" },
    { id: "arrival", label: "最快到府" },
    { id: "sleep", label: "睡眠舒壓" },
    { id: "coupon", label: "領優惠券" }
  ],
  coupons: [
    { id: "new300", name: "新客折抵", amount: 300, minSpend: 1500 },
    { id: "night200", name: "夜間舒壓券", amount: 200, minSpend: 1200 },
    { id: "vip150", name: "會員回饋", amount: 150, minSpend: 1000 }
  ],
  faqs: [
    { q: "預約後多久會安排技師？", a: "一般在下單後 1 到 5 分鐘內完成派單，尖峰時段可能稍有延長。" },
    { q: "可以指定男技師或女技師嗎？", a: "可以，若該城市與時段有符合條件的技師，系統會優先媒合。" },
    { q: "臨時取消會收費嗎？", a: "若技師已出發，可能酌收空趟費；詳細規則可在訂單頁查看。" },
    { q: "支援哪些付款方式？", a: "目前展示版提供優惠券與金額模擬，正式版可接信用卡、LINE Pay 或第三方金流。" }
  ],
  profile: {
    initials: "MC",
    name: "陳小姐",
    membershipLabel: "Membership",
    tier: "白金會員",
    totalOrders: 12,
    availableCoupons: 3,
    walletBalance: 1200,
    averageRating: 4.9
  },
  profileMenus: ["常用地址", "優惠券中心", "我的收藏", "發票與付款", "客服與問題回報", "商家合作申請"],
  affiliate: { code: "MUCITY-8821", inviteUrl: "https://mucity.example/invite/MUCITY-8821", todayClicks: 23, newUsers: 6, estReward: 980 },
  defaultOrders: [
    { id: "MO20260313001", serviceId: "deep", therapistId: "t2", status: "matched", date: "2026-03-13 20:30", address: "台北市信義區松仁路 100 號", amount: 2380, timelineStep: 1 },
    { id: "MO20260312009", serviceId: "sleep", therapistId: "t4", status: "ongoing", date: "2026-03-13 18:00", address: "新北市板橋區文化路一段 188 號", amount: 1480, timelineStep: 2 },
    { id: "MO20260309017", serviceId: "aroma", therapistId: "t1", status: "completed", date: "2026-03-09 21:00", address: "台北市大安區忠孝東路四段 220 號", amount: 1880, timelineStep: 3 }
  ],
  defaultAddresses: [
    { id: "addr-1", label: "住家", value: "台北市信義區信義路五段 7 號" },
    { id: "addr-2", label: "公司", value: "台北市松山區敦化北路 168 號" }
  ]
};
