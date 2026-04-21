const services = [
  {
    id: "aroma",
    name: "精油舒壓",
    duration: "90 分鐘",
    price: 1880,
    description: "適合下班後快速放鬆，主打肩頸釋壓、下背舒展與溫潤精油推撫。",
    points: ["瑞典式舒壓", "肩頸重點釋放", "居家香氛精油"]
  },
  {
    id: "deep",
    name: "深層筋膜",
    duration: "120 分鐘",
    price: 2380,
    description: "針對久坐、運動後緊繃與長期疲勞，結合筋膜放鬆與深層按壓。",
    points: ["深層肌群", "體態放鬆", "運動恢復"]
  },
  {
    id: "sleep",
    name: "睡眠修復",
    duration: "60 分鐘",
    price: 1480,
    description: "用較柔和的節奏與頭肩放鬆技巧，幫助身心降速，適合晚間預約。",
    points: ["頭肩放鬆", "輕壓節奏", "晚間推薦"]
  },
  {
    id: "foot",
    name: "足底循環",
    duration: "70 分鐘",
    price: 1580,
    description: "從足底反射區到小腿循環舒緩，特別適合久站與旅行後疲勞。",
    points: ["足底反射", "小腿舒緩", "循環釋放"]
  }
];

const therapists = [
  {
    id: "t1",
    name: "Lina",
    title: "芳療師 6 年",
    specialty: "精油舒壓、睡眠修復",
    eta: "45 分鐘可到",
    rating: 4.9,
    orders: 1248,
    serviceId: "aroma"
  },
  {
    id: "t2",
    name: "Mia",
    title: "推拿師 8 年",
    specialty: "深層筋膜、肩頸調理",
    eta: "35 分鐘可到",
    rating: 4.8,
    orders: 1810,
    serviceId: "deep"
  },
  {
    id: "t3",
    name: "Yuri",
    title: "運動按摩 5 年",
    specialty: "體態放鬆、腿部修復",
    eta: "55 分鐘可到",
    rating: 4.9,
    orders: 966,
    serviceId: "foot"
  }
];

let selectedService = services[0];
let selectedTherapist = therapists[0];

const serviceChips = document.querySelector("#serviceChips");
const therapistList = document.querySelector("#therapistList");
const servicesGrid = document.querySelector("#servicesGrid");
const detailContent = document.querySelector("#detailContent");
const bookingSummary = document.querySelector("#bookingSummary");
const bookingForm = document.querySelector("#bookingForm");
const toast = document.querySelector("#toast");

function formatPrice(price) {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}

function renderServiceChips() {
  serviceChips.innerHTML = services.map((service) => `
    <button class="service-chip" type="button" data-service-chip="${service.id}">
      <strong>${service.name}</strong>
      <span>${service.duration} · ${formatPrice(service.price)}</span>
    </button>
  `).join("");
}

function renderTherapists() {
  therapistList.innerHTML = therapists.map((therapist) => {
    const service = services.find((item) => item.id === therapist.serviceId);

    return `
      <article class="therapist-card">
        <div class="avatar">${therapist.name.slice(0, 1)}</div>
        <div>
          <h3>${therapist.name}</h3>
          <p class="therapist-meta">${therapist.title} · ${therapist.specialty}</p>
          <span class="badge">★ ${therapist.rating} · ${therapist.orders} 次服務</span>
        </div>
        <div class="price-stack">
          <span class="price">${formatPrice(service.price)}</span>
          <span class="price-note">${therapist.eta}</span>
          <button class="secondary-button" type="button" data-book-therapist="${therapist.id}">預約</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderServicesGrid() {
  servicesGrid.innerHTML = services.map((service) => `
    <article class="service-card">
      <strong>${service.name}</strong>
      <span>${service.duration} · ${formatPrice(service.price)}</span>
      <p>${service.description}</p>
      <div class="detail-points">
        ${service.points.map((point) => `<span>${point}</span>`).join("")}
      </div>
      <button class="primary-button full-width" type="button" data-detail="${service.id}">查看詳情</button>
    </article>
  `).join("");
}

function renderDetail(serviceId) {
  const service = services.find((item) => item.id === serviceId);
  const matchedTherapists = therapists.filter((item) => item.serviceId === service.id);
  selectedService = service;
  selectedTherapist = matchedTherapists[0] || therapists[0];

  detailContent.innerHTML = `
    <div class="detail-hero">
      <div class="detail-banner"></div>
      <div class="detail-copy">
        <p class="eyebrow">Premium Session</p>
        <h2>${service.name}</h2>
        <p>${service.description}</p>
        <div class="detail-points">
          ${service.points.map((point) => `<span>${point}</span>`).join("")}
        </div>
      </div>
      <div class="summary-card">
        <strong>${service.duration} · ${formatPrice(service.price)}</strong>
        <p>推薦技師：${matchedTherapists.map((item) => item.name).join("、") || "系統媒合"}，支援線上付款與到府追蹤。</p>
      </div>
      <button class="primary-button full-width" type="button" id="openBookingButton">選這個方案</button>
    </div>
  `;

  document.querySelector("#openBookingButton").addEventListener("click", () => {
    openSheet("bookingSheet");
    closeSheet("detailSheet");
    updateBookingSummary();
  });
}

function updateBookingSummary() {
  bookingSummary.innerHTML = `
    <strong>${selectedService.name}</strong>
    <p>${selectedService.duration} · ${formatPrice(selectedService.price)}</p>
    <p>預設安排：${selectedTherapist.name}，${selectedTherapist.eta}</p>
  `;
}

function openSheet(id) {
  const sheet = document.getElementById(id);
  sheet.classList.remove("hidden");
  sheet.setAttribute("aria-hidden", "false");
}

function closeSheet(id) {
  const sheet = document.getElementById(id);
  sheet.classList.add("hidden");
  sheet.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 2400);
}

renderServiceChips();
renderTherapists();
renderServicesGrid();
updateBookingSummary();

document.querySelector("#showServicesButton").addEventListener("click", () => openSheet("servicesSheet"));
document.querySelector("#quickBookButton").addEventListener("click", () => openSheet("servicesSheet"));
document.querySelector("#claimPromoButton").addEventListener("click", () => {
  openSheet("bookingSheet");
  updateBookingSummary();
});

serviceChips.addEventListener("click", (event) => {
  const button = event.target.closest("[data-service-chip]");
  if (!button) {
    return;
  }

  renderDetail(button.dataset.serviceChip);
  openSheet("detailSheet");
});

servicesGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-detail]");
  if (!button) {
    return;
  }

  renderDetail(button.dataset.detail);
  closeSheet("servicesSheet");
  openSheet("detailSheet");
});

therapistList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-book-therapist]");
  if (!button) {
    return;
  }

  selectedTherapist = therapists.find((item) => item.id === button.dataset.bookTherapist);
  selectedService = services.find((item) => item.id === selectedTherapist.serviceId);
  updateBookingSummary();
  openSheet("bookingSheet");
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeSheet(button.dataset.close));
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    showToast(`${button.textContent} 區塊正在規劃中，這版先聚焦下單流程。`);
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const address = data.get("address");
  const time = data.get("time");

  closeSheet("bookingSheet");
  bookingForm.reset();
  showToast(`已建立 ${selectedService.name} 預約，服務地址：${address}，時間：${time}`);
});
