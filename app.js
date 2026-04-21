const api = window.MuCityApi;

let services = [];
let therapists = [];
let banners = [];
let notices = [];
let cities = [];
let campaigns = [];
let shortcutItems = [];
let coupons = [];
let faqs = [];
let profile = {};
let profileMenus = [];
let affiliate = {};
let defaultOrders = [];
let defaultAddresses = [];
let runtimeTimersStarted = false;
const storageKeys = { orders: "mucity-orders", addresses: "mucity-addresses", favorites: "mucity-favorites", coupon: "mucity-coupon", city: "mucity-city" };
const state = { selectedService: null, selectedTherapist: null, orderTab: "all", serviceFilter: "全部", serviceSearch: "", selectedCouponId: "new300", currentCityId: "taipei", favorites: new Set(), addresses: [], orders: [], currentBannerIndex: 0, editingAddressId: null };
const orderFlow = ["upcoming", "matched", "ongoing", "completed"];

const els = {
  appStatus: document.querySelector("#appStatus"),
  appStatusTitle: document.querySelector("#appStatusTitle"),
  appStatusText: document.querySelector("#appStatusText"),
  retryBootstrapButton: document.querySelector("#retryBootstrapButton"),
  bannerCarousel: document.querySelector("#bannerCarousel"),
  noticeStrip: document.querySelector("#noticeStrip"),
  cityButton: document.querySelector("#cityButton"),
  cityGrid: document.querySelector("#cityGrid"),
  serviceRangeText: document.querySelector("#serviceRangeText"),
  cityMeta: document.querySelector("#cityMeta"),
  serviceChips: document.querySelector("#serviceChips"),
  therapistList: document.querySelector("#therapistList"),
  serviceFilters: document.querySelector("#serviceFilters"),
  servicesPageGrid: document.querySelector("#servicesPageGrid"),
  detailContent: document.querySelector("#detailContent"),
  therapistDetailContent: document.querySelector("#therapistDetailContent"),
  bookingSummary: document.querySelector("#bookingSummary"),
  bookingForm: document.querySelector("#bookingForm"),
  bookingSteps: document.querySelector("#bookingSteps"),
  orderTabs: document.querySelector("#orderTabs"),
  ordersList: document.querySelector("#ordersList"),
  orderDetailContent: document.querySelector("#orderDetailContent"),
  profileMenu: document.querySelector("#profileMenu"),
  serviceSearchInput: document.querySelector("#serviceSearchInput"),
  addressList: document.querySelector("#addressList"),
  addressForm: document.querySelector("#addressForm"),
  campaignList: document.querySelector("#campaignList"),
  campaignSheetList: document.querySelector("#campaignSheetList"),
  couponList: document.querySelector("#couponList"),
  shortcutGrid: document.querySelector("#shortcutGrid"),
  profileSummary: document.querySelector("#profileSummary"),
  profileStats: document.querySelector("#profileStats"),
  affiliateContent: document.querySelector("#affiliateContent"),
  favoriteList: document.querySelector("#favoriteList"),
  paymentContent: document.querySelector("#paymentContent"),
  partnerForm: document.querySelector("#partnerForm"),
  supportContent: document.querySelector("#supportContent"),
  toast: document.querySelector("#toast")
};

function loadJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function setAppStatus(mode, message) {
  if (mode === "ready") {
    els.appStatus.classList.add("hidden");
    return;
  }

  els.appStatus.classList.remove("hidden");
  els.appStatus.dataset.mode = mode;
  els.appStatusTitle.textContent = mode === "error" ? "載入失敗" : "載入中";
  els.appStatusText.textContent = message;
  els.retryBootstrapButton.classList.toggle("hidden", mode !== "error");
}

function startRuntimeTimers() {
  if (runtimeTimersStarted) return;
  runtimeTimersStarted = true;
  window.setInterval(() => cycleBanner(), 5000);
  window.setInterval(maybeAdvanceOrders, 4000);
}

async function bootstrapApp() {
  setAppStatus("loading", "正在準備服務資料...");
  try {
    [
      services,
      therapists,
      banners,
      notices,
      cities,
      campaigns,
      shortcutItems,
      coupons,
      faqs,
      profile,
      profileMenus,
      affiliate,
      defaultOrders,
      defaultAddresses
    ] = await Promise.all([
      api.listServices(),
      api.listTherapists(),
      api.listBanners(),
      api.listNotices(),
      api.listCities(),
      api.listCampaigns(),
      api.listShortcuts(),
      api.listCoupons(),
      api.listFaqs(),
      api.getProfile(),
      api.getProfileMenus(),
      api.getAffiliate(),
      api.listOrders(),
      api.listAddresses()
    ]);

    state.selectedService = services[0];
    state.selectedTherapist = therapists[0];

    hydrateState();
    normalizeOrders();
    renderBannerCarousel();
    renderNoticeStrip();
    renderCities();
    renderShortcuts();
    renderCampaigns();
    renderCouponCenter();
    renderProfileSummary();
    renderServiceChips();
    renderTherapists();
    renderServiceFilters();
    renderServicesPage();
    renderBookingSteps();
    renderBookingSummary();
    renderOrderTabs();
    renderOrders();
    renderAddresses();
    renderProfileMenu();
    renderAffiliate();
    renderFavorites();
    renderPaymentCenter();
    renderSupport();
    startRuntimeTimers();
    setAppStatus("ready");
  } catch (error) {
    setAppStatus("error", `資料載入失敗：${error.message}`);
  }
}

function formatPrice(price) { return `NT$ ${price.toLocaleString("zh-TW")}`; }
function getService(id) { return services.find((item) => item.id === id); }
function getTherapist(id) { return therapists.find((item) => item.id === id); }
function getCoupon(id) { return coupons.find((item) => item.id === id); }
function getCity(id) { return cities.find((item) => item.id === id); }
function getStatusLabel(status) { return { all: "全部", upcoming: "待付款", matched: "技師出發", ongoing: "服務中", completed: "已完成" }[status]; }

function getProgressSteps(status) {
  const current = orderFlow.indexOf(status);
  return [
    { label: "確認方案", active: true },
    { label: "平台派單", active: current >= 0 },
    { label: "技師出發", active: current >= 1 },
    { label: "服務完成", active: current >= 3 }
  ];
}

function getStatusHint(status) {
  return {
    upcoming: "系統已接單，等待平台完成派單",
    matched: "技師已接單，正在前往服務地點",
    ongoing: "服務進行中，完成後可回到訂單頁評價",
    completed: "本次服務已完成，可再次預約"
  }[status];
}

function normalizeOrders() {
  state.orders = state.orders.map((order) => ({
    ...order,
    timelineStep: typeof order.timelineStep === "number" ? order.timelineStep : Math.max(orderFlow.indexOf(order.status), 0),
    lastAutoUpdate: order.lastAutoUpdate || Date.now()
  }));
}

function maybeAdvanceOrders() {
  const now = Date.now();
  let changed = false;

  state.orders = state.orders.map((order) => {
    if (order.status === "completed") {
      return order;
    }

    const step = typeof order.timelineStep === "number" ? order.timelineStep : Math.max(orderFlow.indexOf(order.status), 0);
    const elapsed = now - (order.lastAutoUpdate || now);
    const shouldAdvance = elapsed >= 12000;

    if (!shouldAdvance) {
      return order;
    }

    const nextStep = Math.min(step + 1, orderFlow.length - 1);
    changed = true;

    return {
      ...order,
      timelineStep: nextStep,
      status: orderFlow[nextStep],
      lastAutoUpdate: now
    };
  });

  if (changed) {
    persistState();
    renderOrders();
  }
}

function cycleBanner(nextIndex) {
  state.currentBannerIndex = typeof nextIndex === "number" ? nextIndex : (state.currentBannerIndex + 1) % banners.length;
  renderBannerCarousel();
}

function updateOrder(orderId, updater) {
  state.orders = state.orders.map((order) => order.id === orderId ? { ...order, ...updater(order) } : order);
  persistState();
  renderOrders();
}

function handleShortcut(shortcutId) {
  if (shortcutId === "nearby") {
    return openSheet("citySheet");
  }

  if (shortcutId === "arrival") {
    const fastestTherapist = therapists.slice().sort((a, b) => Number.parseInt(a.eta, 10) - Number.parseInt(b.eta, 10))[0];
    renderTherapistDetail(fastestTherapist.id);
    showToast(`${fastestTherapist.name} 目前可最快到達。`);
    return openSheet("therapistSheet");
  }

  if (shortcutId === "sleep") {
    selectServiceForBooking("sleep");
    renderBookingSummary();
    return openSheet("bookingSheet");
  }

  if (shortcutId === "coupon") {
    return openSheet("campaignSheet");
  }
}

function calculateFinalPrice() {
  const coupon = getCoupon(state.selectedCouponId);
  const eligible = coupon && state.selectedService.price >= coupon.minSpend;
  return { basePrice: state.selectedService.price, discount: eligible ? coupon.amount : 0, finalPrice: state.selectedService.price - (eligible ? coupon.amount : 0), coupon: eligible ? coupon : null };
}

function openSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet) return;
  sheet.classList.remove("hidden");
  sheet.setAttribute("aria-hidden", "false");
}

function closeSheet(id) {
  const sheet = document.getElementById(id);
  if (!sheet) return;
  sheet.classList.add("hidden");
  sheet.setAttribute("aria-hidden", "true");
}

function bindClick(selector, handler) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.addEventListener("click", handler);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.add("hidden"), 2400);
}

async function withFormLoading(form, loadingText, action) {
  const submitButton = form.querySelector("button[type='submit']");
  const originalText = submitButton?.textContent;
  form.classList.add("is-submitting");
  form.querySelectorAll("button, input, textarea, select").forEach((control) => { control.disabled = true; });
  if (submitButton) submitButton.textContent = loadingText;

  try {
    return await action();
  } finally {
    form.classList.remove("is-submitting");
    form.querySelectorAll("button, input, textarea, select").forEach((control) => { control.disabled = false; });
    if (submitButton) submitButton.textContent = originalText;
  }
}

function persistState() {
  saveJson(storageKeys.orders, state.orders);
  saveJson(storageKeys.addresses, state.addresses);
  saveJson(storageKeys.favorites, Array.from(state.favorites));
  saveJson(storageKeys.coupon, state.selectedCouponId);
  saveJson(storageKeys.city, state.currentCityId);
}

function hydrateState() {
  state.orders = loadJson(storageKeys.orders, defaultOrders);
  state.addresses = loadJson(storageKeys.addresses, defaultAddresses);
  state.favorites = new Set(loadJson(storageKeys.favorites, []));
  state.selectedCouponId = loadJson(storageKeys.coupon, "new300");
  state.currentCityId = loadJson(storageKeys.city, "taipei");
}

function switchView(view) {
  document.querySelectorAll(".app-view").forEach((section) => section.classList.toggle("active", section.dataset.view === view));
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.nav === view));
}

function selectServiceForBooking(serviceId) {
  state.selectedService = getService(serviceId);
  state.selectedTherapist = therapists.find((item) => item.serviceId === serviceId) || therapists[0];
  renderBookingSummary();
}

function renderBannerCarousel() {
  els.bannerCarousel.innerHTML = banners.map((banner, index) => `
    <article class="banner-card${index === state.currentBannerIndex ? " active" : ""}" data-banner-index="${index}">
      <p class="eyebrow">Feature</p>
      <h3>${banner.title}</h3>
      <p>${banner.subtitle}</p>
    </article>
  `).join("");
}

function renderNoticeStrip() {
  els.noticeStrip.innerHTML = notices.map((notice, index) => `<button class="notice-item" type="button" data-notice-index="${index}">${notice}</button>`).join("");
}

function renderCities() {
  els.cityGrid.innerHTML = cities.map((city) => `<button class="city-chip${city.id === state.currentCityId ? " active" : ""}" type="button" data-city="${city.id}">${city.name}</button>`).join("");
  const currentCity = getCity(state.currentCityId);
  const therapistsInCity = therapists.length;
  const fastestEta = therapists.map((item) => Number.parseInt(item.eta, 10)).sort((a, b) => a - b)[0];
  const popularService = services.slice().sort((a, b) => b.price - a.price)[0];
  els.cityButton.textContent = currentCity.name;
  els.serviceRangeText.textContent = currentCity.range;
  if (els.cityMeta) {
    els.cityMeta.innerHTML = `
      <div>
        <span class="hint-text">可預約技師</span>
        <strong>${therapistsInCity} 位</strong>
      </div>
      <div>
        <span class="hint-text">最快到達</span>
        <strong>${fastestEta} 分鐘</strong>
      </div>
      <div>
        <span class="hint-text">熱門方案</span>
        <strong>${popularService.name}</strong>
      </div>
    `;
  }
}

function renderShortcuts() {
  els.shortcutGrid.innerHTML = shortcutItems.map((item) => `
    <button class="shortcut-card" type="button" data-shortcut="${item.id}">
      <strong>${item.label}</strong>
      <span>立即查看</span>
    </button>
  `).join("");
}

function renderCampaigns() {
  const cards = campaigns.map((campaign) => `
    <article class="campaign-card" data-campaign-id="${campaign.id}">
      <p class="eyebrow">${campaign.badge}</p>
      <h3>${campaign.title}</h3>
      <p>${campaign.subtitle}</p>
      <button class="link-button" type="button" data-open-campaign="${campaign.id}">立即查看</button>
    </article>
  `).join("");
  els.campaignList.innerHTML = cards;
  els.campaignSheetList.innerHTML = cards;
}

function renderCouponCenter() {
  els.couponList.innerHTML = coupons.map((coupon) => `
    <article class="order-card compact">
      <div class="order-head">
        <div>
          <strong>${coupon.name}</strong>
          <span class="hint-text">滿 ${formatPrice(coupon.minSpend)} 可用</span>
        </div>
        <span class="status-pill matched">折抵 ${formatPrice(coupon.amount)}</span>
      </div>
      <p class="order-meta">下單時會自動判斷是否符合門檻，可於預約頁直接套用。</p>
      <button class="primary-button" type="button" data-use-coupon="${coupon.id}">立即使用</button>
    </article>
  `).join("") || `<div class="empty-card">目前沒有可用優惠券。</div>`;
}

function renderProfileSummary() {
  els.profileSummary.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${profile.initials}</div>
      <div>
        <p class="eyebrow">${profile.membershipLabel}</p>
        <h2>${profile.name}</h2>
        <p class="hero-text compact">${profile.tier} · 累積 ${profile.totalOrders} 筆訂單 · 可用優惠券 ${profile.availableCoupons} 張</p>
      </div>
    </div>
  `;

  els.profileStats.innerHTML = `
    <article class="stat-card">
      <strong>${formatPrice(profile.walletBalance)}</strong>
      <span>錢包餘額</span>
    </article>
    <article class="stat-card">
      <strong>${profile.availableCoupons} 張</strong>
      <span>可用優惠券</span>
    </article>
    <article class="stat-card">
      <strong>${profile.averageRating}</strong>
      <span>平均評價</span>
    </article>
  `;
}

function renderServiceChips() {
  els.serviceChips.innerHTML = services.slice(0, 4).map((service) => `
    <button class="service-chip" type="button" data-service-chip="${service.id}">
      <strong>${service.name}</strong>
      <span>${service.duration} · ${formatPrice(service.price)}</span>
    </button>
  `).join("");
}

function renderTherapists() {
  els.therapistList.innerHTML = therapists.map((therapist) => {
    const favorite = state.favorites.has(therapist.id);
    const service = getService(therapist.serviceId);
    return `
      <article class="therapist-card">
        <div class="avatar">${therapist.name.slice(0, 1)}</div>
        <div>
          <div class="card-title-row">
            <h3>${therapist.name}</h3>
            <button class="favorite-button${favorite ? " active" : ""}" type="button" data-favorite="${therapist.id}">${favorite ? "已收藏" : "收藏"}</button>
          </div>
          <p class="therapist-meta">${therapist.title} · ${therapist.specialty}</p>
          <span class="badge">★ ${therapist.rating} · ${therapist.orders} 次服務</span>
        </div>
        <div class="price-stack">
          <span class="price">${formatPrice(service.price)}</span>
          <span class="price-note">${therapist.eta}</span>
          <div class="inline-actions">
            <button class="link-button" type="button" data-therapist-detail="${therapist.id}">詳情</button>
            <button class="secondary-button" type="button" data-book-therapist="${therapist.id}">預約</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderServiceFilters() {
  const filters = ["全部", ...new Set(services.map((service) => service.category))];
  els.serviceFilters.innerHTML = filters.map((filter) => `<button class="filter-chip${filter === state.serviceFilter ? " active" : ""}" type="button" data-filter="${filter}">${filter}</button>`).join("");
}

function renderServicesPage() {
  const filtered = services.filter((service) => {
    const categoryMatch = state.serviceFilter === "全部" || service.category === state.serviceFilter;
    const searchMatch = !state.serviceSearch || `${service.name}${service.description}${service.points.join("")}`.includes(state.serviceSearch);
    return categoryMatch && searchMatch;
  });
  els.servicesPageGrid.innerHTML = filtered.map((service) => `
    <article class="service-card large">
      <div class="service-card-top">
        <div>
          <strong>${service.name}</strong>
          <span>${service.category} · ${service.duration}</span>
        </div>
        <span class="price-tag">${formatPrice(service.price)}</span>
      </div>
      <p>${service.description}</p>
      <div class="detail-points">${service.points.map((point) => `<span>${point}</span>`).join("")}</div>
      <div class="action-row">
        <button class="secondary-button" type="button" data-service-cta="${service.id}" data-action="detail">查看詳情</button>
        <button class="primary-button" type="button" data-service-cta="${service.id}" data-action="book">立即預約</button>
      </div>
    </article>
  `).join("") || `<div class="empty-card">目前找不到符合條件的服務。</div>`;
}

function renderBookingSteps() {
  els.bookingSteps.innerHTML = `
    <div class="step-pill active">1. 選方案</div>
    <div class="step-pill active">2. 選地址</div>
    <div class="step-pill active">3. 套優惠</div>
    <div class="step-pill active">4. 確認下單</div>
  `;
}

function renderBookingSummary() {
  const price = calculateFinalPrice();
  const addressOptions = state.addresses.map((address) => `<option value="${address.value}">${address.label}｜${address.value}</option>`).join("");
  els.bookingSummary.innerHTML = `
    <strong>${state.selectedService.name}</strong>
    <p>${state.selectedService.duration} · 原價 ${formatPrice(price.basePrice)}</p>
    <p>預設安排：${state.selectedTherapist.name}，${state.selectedTherapist.eta}</p>
    <p>優惠券：${price.coupon ? `${price.coupon.name} - ${formatPrice(price.discount)}` : "目前不適用"}</p>
    <p>應付金額：${formatPrice(price.finalPrice)}</p>
    <label>
      常用地址
      <select id="addressPresetSelect">
        <option value="">請選擇常用地址</option>
        ${addressOptions}
      </select>
    </label>
    <label>
      套用優惠券
      <select id="couponSelect">
        ${coupons.map((coupon) => `<option value="${coupon.id}">${coupon.name}｜滿 ${formatPrice(coupon.minSpend)} 折 ${formatPrice(coupon.amount)}</option>`).join("")}
      </select>
    </label>
  `;

  const couponSelect = document.querySelector("#couponSelect");
  const addressPresetSelect = document.querySelector("#addressPresetSelect");
  if (couponSelect) {
    couponSelect.value = state.selectedCouponId;
    couponSelect.addEventListener("change", (event) => {
      state.selectedCouponId = event.target.value;
      persistState();
      renderBookingSummary();
    });
  }
  if (addressPresetSelect) {
    addressPresetSelect.addEventListener("change", (event) => {
      const addressInput = els.bookingForm.querySelector("[name='address']");
      if (addressInput && event.target.value) addressInput.value = event.target.value;
    });
  }
}

function renderServiceDetail(serviceId) {
  const service = getService(serviceId);
  const matched = therapists.filter((item) => item.serviceId === serviceId);
  state.selectedService = service;
  state.selectedTherapist = matched[0] || therapists[0];
  els.detailContent.innerHTML = `
    <div class="detail-hero">
      <div class="detail-banner"></div>
      <div class="detail-copy">
        <p class="eyebrow">Premium Session</p>
        <h2>${service.name}</h2>
        <p>${service.description}</p>
        <div class="detail-points">${service.points.map((point) => `<span>${point}</span>`).join("")}</div>
      </div>
      <div class="summary-card">
        <strong>${service.duration} · ${formatPrice(service.price)}</strong>
        <p>推薦技師：${matched.map((item) => item.name).join("、")}，平台將依位置、時段與技師狀態進行派單。</p>
        <div class="timeline-mini">
          <span>線上下單</span>
          <span>平台派單</span>
          <span>到府服務</span>
          <span>完成評價</span>
        </div>
      </div>
      <button class="primary-button full-width" type="button" id="openBookingButton">選這個方案</button>
    </div>
  `;
  document.querySelector("#openBookingButton").addEventListener("click", () => {
    renderBookingSummary();
    closeSheet("detailSheet");
    openSheet("bookingSheet");
  });
}

function renderTherapistDetail(therapistId) {
  const therapist = getTherapist(therapistId);
  const service = getService(therapist.serviceId);
  const reviewAverage = (therapist.reviews.reduce((sum, review) => sum + review.score, 0) / therapist.reviews.length).toFixed(1);
  const favorite = state.favorites.has(therapist.id);

  els.therapistDetailContent.innerHTML = `
    <div class="sheet-header">
      <h3>${therapist.name} 技師檔案</h3>
      <button class="close-button" data-close-therapist type="button">關閉</button>
    </div>
    <div class="profile-card">
      <div class="profile-avatar">${therapist.name.slice(0, 1)}</div>
      <div>
        <strong>${therapist.title}</strong>
        <p class="hero-text compact">${therapist.bio}</p>
      </div>
    </div>
    <div class="summary-card section">
      <div class="card-title-row">
        <strong>${service.name}</strong>
        <button class="favorite-button${favorite ? " active" : ""}" type="button" id="toggleTherapistFavorite">${favorite ? "已收藏" : "收藏技師"}</button>
      </div>
      <div class="therapist-summary-grid">
        <div>
          <span class="hint-text">評分</span>
          <strong>${reviewAverage}</strong>
        </div>
        <div>
          <span class="hint-text">累積訂單</span>
          <strong>${therapist.orders}</strong>
        </div>
        <div>
          <span class="hint-text">最快到達</span>
          <strong>${therapist.eta}</strong>
        </div>
      </div>
    </div>
    <div class="detail-points section">${therapist.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
    <div class="summary-card section">
      <strong>服務項目：${service.name}</strong>
      <p>評分 ${therapist.rating} 繚 累積 ${therapist.orders} 單繚 ${therapist.eta}</p>
    </div>
    <div class="section">
      <div class="section-header">
        <h3>評價回饋</h3>
        <span class="hint-text">${therapist.reviews.length} 則評論</span>
      </div>
      <div class="filter-row section" id="reviewFilters">
        <button class="filter-chip active" type="button" data-review-filter="all">全部</button>
        <button class="filter-chip" type="button" data-review-filter="5">5 星</button>
        <button class="filter-chip" type="button" data-review-filter="4">4 星以上</button>
      </div>
      <div class="card-list" id="therapistReviews"></div>
      <div class="section">
        <button class="secondary-button full-width" type="button" id="toggleMoreReviewsButton">查看更多評價</button>
      </div>
    </div>
    <div class="action-row section">
      <button class="secondary-button" type="button" id="messageTherapistButton">諮詢服務</button>
      <button class="primary-button" type="button" id="bookTherapistFromDetail">預約這位技師</button>
    </div>
  `;

  const reviewState = { filter: "all", expanded: false };
  const reviewContainer = document.querySelector("#therapistReviews");
  const renderReviews = () => {
    const filteredReviews = therapist.reviews.filter((review) => {
      if (reviewState.filter === "5") return review.score === 5;
      if (reviewState.filter === "4") return review.score >= 4;
      return true;
    });
    const visibleReviews = reviewState.expanded ? filteredReviews : filteredReviews.slice(0, 2);
    reviewContainer.innerHTML = visibleReviews.map((review) => `
      <article class="review-card">
        <div class="review-meta">
          <strong>${review.user}</strong>
          <span>★ ${review.score}</span>
        </div>
        <p>${review.body}</p>
      </article>
    `).join("") || `<div class="empty-card">目前沒有符合條件的評價。</div>`;

    const toggleButton = document.querySelector("#toggleMoreReviewsButton");
    toggleButton.textContent = reviewState.expanded ? "收起評價" : "查看更多評價";
    toggleButton.disabled = filteredReviews.length <= 2;
  };

  document.querySelector("[data-close-therapist]").addEventListener("click", () => closeSheet("therapistSheet"));
  document.querySelector("#toggleTherapistFavorite").addEventListener("click", () => {
    state.favorites.has(therapist.id) ? state.favorites.delete(therapist.id) : state.favorites.add(therapist.id);
    persistState();
    renderTherapists();
    renderFavorites();
    renderTherapistDetail(therapist.id);
  });
  document.querySelector("#messageTherapistButton").addEventListener("click", () => openSheet("supportSheet"));
  document.querySelector("#toggleMoreReviewsButton").addEventListener("click", () => {
    reviewState.expanded = !reviewState.expanded;
    renderReviews();
  });
  document.querySelector("#reviewFilters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-review-filter]");
    if (!button) return;
    reviewState.filter = button.dataset.reviewFilter;
    reviewState.expanded = false;
    document.querySelectorAll("#reviewFilters .filter-chip").forEach((chip) => chip.classList.toggle("active", chip.dataset.reviewFilter === reviewState.filter));
    renderReviews();
  });
  document.querySelector("#bookTherapistFromDetail").addEventListener("click", () => {
    state.selectedTherapist = therapist;
    state.selectedService = service;
    renderBookingSummary();
    closeSheet("therapistSheet");
    openSheet("bookingSheet");
  });
  renderReviews();
}
function renderOrderTabs() {
  const tabs = ["all", "upcoming", "matched", "ongoing", "completed"];
  els.orderTabs.innerHTML = tabs.map((tab) => `<button class="filter-chip${tab === state.orderTab ? " active" : ""}" type="button" data-order-tab="${tab}">${getStatusLabel(tab)}</button>`).join("");
}

function renderOrders() {
  const filtered = state.orderTab === "all" ? state.orders : state.orders.filter((order) => order.status === state.orderTab);
  els.ordersList.innerHTML = filtered.map((order) => {
    const service = getService(order.serviceId);
    const therapist = getTherapist(order.therapistId);
    return `
      <article class="order-card">
        <div class="order-head">
          <div>
            <strong>${service.name}</strong>
            <span class="hint-text">${order.id}</span>
          </div>
          <span class="status-pill ${order.status}">${getStatusLabel(order.status)}</span>
        </div>
        <p class="order-meta">技師 ${therapist.name} · ${order.date}</p>
        <p class="order-meta">${order.address}</p>
        <p class="order-meta status-hint">${getStatusHint(order.status)}</p>
        <div class="timeline-bar">${getProgressSteps(order.status).map((step) => `<span class="${step.active ? "active" : ""}">${step.label}</span>`).join("")}</div>
        <div class="action-row spread">
          <strong>${formatPrice(order.amount)}</strong>
          <div class="inline-actions">
            <button class="link-button" type="button" data-order-detail="${order.id}">查看詳情</button>
            <button class="secondary-button" type="button" data-rebook="${service.id}">再次預約</button>
          </div>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-card">目前沒有 ${getStatusLabel(state.orderTab)} 訂單。</div>`;
}

function renderOrderDetail(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  const service = getService(order.serviceId);
  const therapist = getTherapist(order.therapistId);
  const actions = [];

  if (order.status === "upcoming") {
    actions.push(`<button class="secondary-button" type="button" data-order-action="cancel" data-order-id="${order.id}">取消訂單</button>`);
    actions.push(`<button class="primary-button" type="button" data-order-action="pay" data-order-id="${order.id}">立即付款</button>`);
  } else if (order.status === "matched" || order.status === "ongoing") {
    actions.push(`<button class="secondary-button" type="button" data-order-action="support" data-order-id="${order.id}">聯絡客服</button>`);
    actions.push(`<button class="primary-button" type="button" data-rebook="${service.id}">再次預約</button>`);
  } else {
    actions.push(`<button class="secondary-button" type="button" data-order-action="support" data-order-id="${order.id}">聯絡客服</button>`);
    actions.push(`<button class="primary-button" type="button" data-rebook="${service.id}">再次預約</button>`);
  }

  els.orderDetailContent.innerHTML = `
    <div class="sheet-header">
      <h3>訂單詳情</h3>
      <button class="close-button" data-close-order type="button">關閉</button>
    </div>
    <div class="summary-card">
      <strong>${service.name}</strong>
      <p>訂單編號：${order.id}</p>
      <p>服務時間：${order.date}</p>
      <p>服務地址：${order.address}</p>
      <p>服務技師：${therapist.name} · ${therapist.title}</p>
      <p>付款金額：${formatPrice(order.amount)}</p>
      <p>目前狀態：${getStatusLabel(order.status)}</p>
      <p>${getStatusHint(order.status)}</p>
      <div class="timeline-bar detail">${getProgressSteps(order.status).map((step) => `<span class="${step.active ? "active" : ""}">${step.label}</span>`).join("")}</div>
    </div>
    <div class="action-row section">
      ${actions.join("")}
    </div>
  `;
  document.querySelector("[data-close-order]").addEventListener("click", () => closeSheet("orderDetailSheet"));
}

function renderAddresses() {
  els.addressList.innerHTML = state.addresses.map((address) => `
    <article class="order-card compact">
      <div class="order-head">
        <strong>${address.label}</strong>
        <div class="inline-actions">
          <button class="link-button" type="button" data-edit-address="${address.id}">編輯</button>
          <button class="link-button" type="button" data-remove-address="${address.id}">刪除</button>
        </div>
      </div>
      <p class="order-meta">${address.value}</p>
      <button class="secondary-button" type="button" data-use-address="${address.value}">帶入下單</button>
    </article>
  `).join("");

  const submitButton = els.addressForm.querySelector("button[type='submit']");
  if (submitButton) {
    submitButton.textContent = state.editingAddressId ? "更新地址" : "新增地址";
  }
}

function renderProfileMenu() {
  els.profileMenu.innerHTML = profileMenus.map((item, index) => `<button class="menu-item" type="button" data-profile-item="${item}" data-profile-index="${index}"><span>${item}</span><span>›</span></button>`).join("");
}

function renderAffiliate() {
  els.affiliateContent.innerHTML = `
    <div class="affiliate-card">
      <p class="eyebrow">Referral</p>
      <h3>分享專屬連結賺獎勵</h3>
      <p>邀請碼：${affiliate.code}</p>
      <p>今日點擊：${affiliate.todayClicks} · 新增用戶：${affiliate.newUsers}</p>
      <p>預估獎勵：${formatPrice(affiliate.estReward)}</p>
      <div class="summary-card section">
        <strong>推廣連結</strong>
        <p>${affiliate.inviteUrl}</p>
      </div>
      <button class="primary-button full-width section" id="copyAffiliateButton" type="button">複製推廣連結</button>
    </div>
  `;
  document.querySelector("#copyAffiliateButton").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(affiliate.inviteUrl);
      showToast("推廣連結已複製。");
    } catch {
      showToast("目前無法自動複製，請稍後再試。");
    }
  });
}

function renderFavorites() {
  const favoriteTherapists = therapists.filter((therapist) => state.favorites.has(therapist.id));
  els.favoriteList.innerHTML = favoriteTherapists.map((therapist) => {
    const service = getService(therapist.serviceId);
    return `
      <article class="order-card compact">
        <div class="order-head">
          <div>
            <strong>${therapist.name}</strong>
            <span class="hint-text">${therapist.title}</span>
          </div>
          <span class="status-pill matched">★ ${therapist.rating}</span>
        </div>
        <p class="order-meta">${therapist.specialty}</p>
        <p class="order-meta">最快 ${therapist.eta} · ${service.name}</p>
        <div class="action-row section">
          <button class="secondary-button" type="button" data-favorite-detail="${therapist.id}">查看詳情</button>
          <button class="primary-button" type="button" data-favorite-book="${therapist.id}">立即預約</button>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-card">目前還沒有收藏技師，先去首頁或服務頁收藏幾位再回來。</div>`;
}

function renderPaymentCenter() {
  const upcomingOrders = state.orders.filter((order) => order.status === "upcoming");
  const totalPendingAmount = upcomingOrders.reduce((sum, order) => sum + order.amount, 0);
  els.paymentContent.innerHTML = `
    <div class="summary-card">
      <strong>待付款訂單</strong>
      <p>目前共有 ${upcomingOrders.length} 筆待付款訂單</p>
      <p>待支付總額：${formatPrice(totalPendingAmount)}</p>
    </div>
    <div class="summary-card section">
      <strong>付款方式</strong>
      <p>展示版目前提供：錢包餘額、信用卡、LINE Pay 入口佔位。</p>
      <div class="detail-points section">
        <span>錢包餘額 NT$ 1,200</span>
        <span>信用卡尾號 1024</span>
        <span>電子發票已開啟</span>
      </div>
    </div>
    <div class="action-row section">
      <button class="secondary-button" type="button" id="openInvoiceButton">查看發票設定</button>
      <button class="primary-button" type="button" id="openPendingOrdersButton">前往待付款</button>
    </div>
  `;

  document.querySelector("#openInvoiceButton").addEventListener("click", () => {
    showToast("展示版已預留電子發票與付款方式設定入口。");
  });

  document.querySelector("#openPendingOrdersButton").addEventListener("click", () => {
    state.orderTab = "upcoming";
    renderOrderTabs();
    renderOrders();
    closeSheet("paymentSheet");
    switchView("orders");
  });
}

function renderSupport() {
  els.supportContent.innerHTML = `
    <div class="support-card">
      <p class="eyebrow">Support</p>
      <h3>聯絡客服</h3>
      <p>服務時間 10:00 - 02:00，可透過線上客服、LINE 官方帳號或電話協助處理訂單問題。</p>
      <div class="action-row section">
        <button class="primary-button" type="button" id="openLiveSupportButton">線上客服</button>
        <button class="secondary-button" type="button" id="openLineSupportButton">LINE 客服</button>
      </div>
    </div>
    <div class="section">
      <h3>常見問題</h3>
      <div class="card-list">
        ${faqs.map((faq, index) => `
          <article class="faq-card">
            <button class="faq-question" type="button" data-faq="${index}">
              <strong>${faq.q}</strong>
              <span>+</span>
            </button>
            <div class="faq-answer hidden" id="faq-answer-${index}">
              <p>${faq.a}</p>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  `;

  document.querySelector("#openLiveSupportButton").addEventListener("click", () => {
    showToast("展示版客服入口已開啟，正式版可接真人客服系統。");
  });

  document.querySelector("#openLineSupportButton").addEventListener("click", () => {
    showToast("展示版可再接 LINE 官方帳號或第三方客服工具。");
  });

  document.querySelectorAll("[data-faq]").forEach((button) => {
    button.addEventListener("click", () => {
      const answer = document.querySelector(`#faq-answer-${button.dataset.faq}`);
      const isHidden = answer.classList.contains("hidden");
      document.querySelectorAll(".faq-answer").forEach((item) => item.classList.add("hidden"));
      document.querySelectorAll(".faq-question span").forEach((icon) => { icon.textContent = "+"; });
      if (isHidden) {
        answer.classList.remove("hidden");
        button.querySelector("span").textContent = "-";
      }
    });
  });
}

bootstrapApp();

bindClick("#retryBootstrapButton", () => bootstrapApp());
document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.nav)));
document.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => closeSheet(button.dataset.close)));
bindClick("#cityButton", () => openSheet("citySheet"));
bindClick("#quickBookButton", () => switchView("services"));
bindClick("#showServicesButton", () => switchView("services"));
bindClick("#showCampaignsButton", () => openSheet("campaignSheet"));
bindClick("#openCampaignSheetButton", () => openSheet("campaignSheet"));
bindClick("#openAffiliateSheetButton", () => openSheet("affiliateSheet"));

els.cityGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-city]");
  if (!button) return;
  state.currentCityId = button.dataset.city;
  persistState();
  renderCities();
  showToast(`已切換至 ${getCity(state.currentCityId).name}，可依目前服務範圍預約。`);
});

els.bannerCarousel.addEventListener("click", (event) => {
  const card = event.target.closest("[data-banner-index]");
  if (!card) return;
  state.currentBannerIndex = Number(card.dataset.bannerIndex);
  renderBannerCarousel();
  openSheet("campaignSheet");
});

els.noticeStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-notice-index]");
  if (!button) return;
  const index = Number(button.dataset.noticeIndex);
  if (index === 0) {
    return openSheet("bookingSheet");
  }
  if (index === 1) {
    return openSheet("campaignSheet");
  }
  openSheet("supportSheet");
});

els.campaignList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-campaign]");
  if (!button) return;
  openSheet("campaignSheet");
});

els.campaignSheetList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-campaign]");
  if (!button) return;
  const campaign = campaigns.find((item) => item.id === button.dataset.openCampaign);
  if (campaign?.serviceId) {
    selectServiceForBooking(campaign.serviceId);
    renderBookingSummary();
  }
  closeSheet("campaignSheet");
  openSheet("bookingSheet");
});

els.shortcutGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-shortcut]");
  if (!button) return;
  handleShortcut(button.dataset.shortcut);
});

els.serviceChips.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service-chip]");
  if (!button) return;
  renderServiceDetail(button.dataset.serviceChip);
  openSheet("detailSheet");
});

els.therapistList.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  const detailButton = event.target.closest("[data-therapist-detail]");
  const bookButton = event.target.closest("[data-book-therapist]");
  if (favoriteButton) {
    const therapistId = favoriteButton.dataset.favorite;
    state.favorites.has(therapistId) ? state.favorites.delete(therapistId) : state.favorites.add(therapistId);
    persistState();
    renderTherapists();
    renderFavorites();
    return showToast("收藏狀態已更新。");
  }
  if (detailButton) {
    renderTherapistDetail(detailButton.dataset.therapistDetail);
    return openSheet("therapistSheet");
  }
  if (!bookButton) return;
  state.selectedTherapist = getTherapist(bookButton.dataset.bookTherapist);
  state.selectedService = getService(state.selectedTherapist.serviceId);
  renderBookingSummary();
  openSheet("bookingSheet");
});

els.serviceFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.serviceFilter = button.dataset.filter;
  renderServiceFilters();
  renderServicesPage();
});

els.serviceSearchInput.addEventListener("input", (event) => {
  state.serviceSearch = event.target.value.trim();
  renderServicesPage();
});

els.servicesPageGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service-cta]");
  if (!button) return;
  if (button.dataset.action === "detail") {
    renderServiceDetail(button.dataset.serviceCta);
    return openSheet("detailSheet");
  }
  selectServiceForBooking(button.dataset.serviceCta);
  openSheet("bookingSheet");
});

els.orderTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order-tab]");
  if (!button) return;
  state.orderTab = button.dataset.orderTab;
  renderOrderTabs();
  renderOrders();
});

els.ordersList.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-order-detail]");
  const rebookButton = event.target.closest("[data-rebook]");
  if (detailButton) {
    renderOrderDetail(detailButton.dataset.orderDetail);
    return openSheet("orderDetailSheet");
  }
  if (rebookButton) {
    selectServiceForBooking(rebookButton.dataset.rebook);
    openSheet("bookingSheet");
  }
});

els.orderDetailContent.addEventListener("click", async (event) => {
  const rebookButton = event.target.closest("[data-rebook]");
  const actionButton = event.target.closest("[data-order-action]");

  if (actionButton) {
    const orderId = actionButton.dataset.orderId;
    const order = state.orders.find((item) => item.id === orderId);
    if (!order) return;

    try {
      if (actionButton.dataset.orderAction === "pay") {
        const response = await api.payOrder(orderId);
        updateOrder(orderId, () => ({
          status: response.data.status,
          timelineStep: response.data.timelineStep,
          lastAutoUpdate: response.data.lastAutoUpdate
        }));
        renderOrderDetail(orderId);
        return showToast("付款完成，技師已開始前往服務地點。");
      }

      if (actionButton.dataset.orderAction === "cancel") {
        await api.cancelOrder(orderId);
        state.orders = state.orders.filter((item) => item.id !== orderId);
        persistState();
        renderOrders();
        closeSheet("orderDetailSheet");
        return showToast("訂單已取消。");
      }

      if (actionButton.dataset.orderAction === "support") {
        return openSheet("supportSheet");
      }
    } catch (error) {
      return showToast(`訂單操作失敗：${error.message}`);
    }
  }

  if (!rebookButton) return;
  selectServiceForBooking(rebookButton.dataset.rebook);
  closeSheet("orderDetailSheet");
  openSheet("bookingSheet");
});

els.profileMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-profile-item]");
  if (!button) return;
  if (button.dataset.profileIndex === "0") return openSheet("addressSheet");
  if (button.dataset.profileIndex === "1") return openSheet("couponSheet");
  if (button.dataset.profileIndex === "2") {
    renderFavorites();
    return openSheet("favoriteSheet");
  }
  if (button.dataset.profileIndex === "3") {
    renderPaymentCenter();
    return openSheet("paymentSheet");
  }
  if (button.dataset.profileIndex === "4") return openSheet("supportSheet");
  if (button.dataset.profileIndex === "5") return openSheet("partnerSheet");
  showToast(`${button.dataset.profileItem} 功能下一版可接 API 與真實會員資料。`);
});

els.bookingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(els.bookingForm);
  const price = calculateFinalPrice();

  await withFormLoading(els.bookingForm, "建立訂單中...", async () => {
    try {
      const response = await api.createOrder({
        serviceId: state.selectedService.id,
        therapistId: state.selectedTherapist.id,
        address: data.get("address"),
        date: data.get("time"),
        phone: data.get("phone"),
        note: data.get("note"),
        couponId: state.selectedCouponId,
        amount: price.finalPrice
      });
      state.orders.unshift(response.data);
      persistState();
      renderOrders();
      closeSheet("bookingSheet");
      els.bookingForm.reset();
      switchView("orders");
      showToast(`已建立 ${state.selectedService.name} 預約，請前往訂單頁查看。`);
    } catch (error) {
      showToast(`建立訂單失敗：${error.message}`);
    }
  });
});

els.addressForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(els.addressForm);
  const isEditing = Boolean(state.editingAddressId);

  await withFormLoading(els.addressForm, isEditing ? "更新地址中..." : "新增地址中...", async () => {
    try {
      if (state.editingAddressId) {
        const response = await api.updateAddress(state.editingAddressId, {
          label: data.get("label"),
          value: data.get("value")
        });
        state.addresses = state.addresses.map((address) => address.id === state.editingAddressId ? response.data : address);
        state.editingAddressId = null;
        showToast("常用地址已更新。");
      } else {
        const response = await api.createAddress({
          label: data.get("label"),
          value: data.get("value")
        });
        state.addresses.unshift(response.data);
        showToast("常用地址已新增。");
      }
      persistState();
      renderAddresses();
      renderBookingSummary();
      els.addressForm.reset();
    } catch (error) {
      showToast(`${isEditing ? "更新" : "新增"}地址失敗：${error.message}`);
    }
  });
});

els.addressList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-address]");
  const removeButton = event.target.closest("[data-remove-address]");
  const useButton = event.target.closest("[data-use-address]");
  if (editButton) {
    const address = state.addresses.find((item) => item.id === editButton.dataset.editAddress);
    if (!address) return;
    state.editingAddressId = address.id;
    els.addressForm.querySelector("[name='label']").value = address.label;
    els.addressForm.querySelector("[name='value']").value = address.value;
    renderAddresses();
    return;
  }
  if (removeButton) {
    try {
      await api.deleteAddress(removeButton.dataset.removeAddress);
      state.addresses = state.addresses.filter((address) => address.id !== removeButton.dataset.removeAddress);
      if (state.editingAddressId === removeButton.dataset.removeAddress) {
        state.editingAddressId = null;
        els.addressForm.reset();
      }
      persistState();
      renderAddresses();
      renderBookingSummary();
      return showToast("地址已刪除。");
    } catch (error) {
      return showToast(`刪除地址失敗：${error.message}`);
    }
  }
  if (useButton) {
    const addressInput = els.bookingForm.querySelector("[name='address']");
    if (addressInput) addressInput.value = useButton.dataset.useAddress;
    closeSheet("addressSheet");
    openSheet("bookingSheet");
  }
});

els.couponList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-use-coupon]");
  if (!button) return;
  state.selectedCouponId = button.dataset.useCoupon;
  persistState();
  renderBookingSummary();
  closeSheet("couponSheet");
  openSheet("bookingSheet");
});

els.favoriteList.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-favorite-detail]");
  const bookButton = event.target.closest("[data-favorite-book]");
  if (detailButton) {
    renderTherapistDetail(detailButton.dataset.favoriteDetail);
    closeSheet("favoriteSheet");
    return openSheet("therapistSheet");
  }
  if (!bookButton) return;
  state.selectedTherapist = getTherapist(bookButton.dataset.favoriteBook);
  state.selectedService = getService(state.selectedTherapist.serviceId);
  renderBookingSummary();
  closeSheet("favoriteSheet");
  openSheet("bookingSheet");
});

els.partnerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(els.partnerForm);
  const brand = data.get("brand");
  await withFormLoading(els.partnerForm, "送出申請中...", async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    els.partnerForm.reset();
    closeSheet("partnerSheet");
    showToast(`已收到 ${brand} 的合作申請，我們會盡快聯繫。`);
  });
});



