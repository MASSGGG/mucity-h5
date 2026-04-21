const clone = (value) => JSON.parse(JSON.stringify(value));
const data = window.MuCityData;
const config = window.MuCityConfig || { mode: "mock", apiBaseUrl: "/api" };

async function request(path, options = {}) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

async function resolveMockOrReal(path, fallback) {
  if (config.mode === "real") {
    return request(path);
  }
  return clone(fallback);
}

window.MuCityApi = {
  config,
  async bootstrap() {
    if (config.mode === "real") {
      return request("/bootstrap");
    }

    return clone(data);
  },
  async listServices() {
    return resolveMockOrReal("/services", data.services);
  },
  async listTherapists() {
    return resolveMockOrReal("/therapists", data.therapists);
  },
  async listBanners() {
    return resolveMockOrReal("/banners", data.banners);
  },
  async listNotices() {
    return resolveMockOrReal("/notices", data.notices);
  },
  async listCities() {
    return resolveMockOrReal("/cities", data.cities);
  },
  async listCampaigns() {
    return resolveMockOrReal("/campaigns", data.campaigns);
  },
  async listShortcuts() {
    return resolveMockOrReal("/shortcuts", data.shortcutItems);
  },
  async listCoupons() {
    return resolveMockOrReal("/coupons", data.coupons);
  },
  async listFaqs() {
    return resolveMockOrReal("/faqs", data.faqs);
  },
  async getProfile() {
    return resolveMockOrReal("/profile", data.profile);
  },
  async getProfileMenus() {
    return resolveMockOrReal("/profile-menus", data.profileMenus);
  },
  async getAffiliate() {
    return resolveMockOrReal("/affiliate", data.affiliate);
  },
  async listOrders() {
    return resolveMockOrReal("/orders/defaults", data.defaultOrders);
  },
  async listAddresses() {
    return resolveMockOrReal("/addresses", data.defaultAddresses);
  },
  async createOrder(payload) {
    if (config.mode === "real") {
      return request("/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    return {
      data: {
        id: `MO${Date.now()}`,
        serviceId: payload.serviceId,
        therapistId: payload.therapistId,
        status: "upcoming",
        date: payload.date,
        address: payload.address,
        amount: payload.amount || 0,
        timelineStep: 0,
        lastAutoUpdate: Date.now()
      }
    };
  },
  async payOrder(orderId) {
    if (config.mode === "real") {
      return request(`/orders/${orderId}/pay`, {
        method: "POST"
      });
    }

    return {
      data: {
        id: orderId,
        status: "matched",
        timelineStep: 1,
        lastAutoUpdate: Date.now()
      }
    };
  },
  async cancelOrder(orderId) {
    if (config.mode === "real") {
      return request(`/orders/${orderId}/cancel`, {
        method: "POST"
      });
    }

    return {
      data: {
        id: orderId,
        cancelled: true
      }
    };
  },
  async createAddress(payload) {
    if (config.mode === "real") {
      return request("/addresses", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    return {
      data: {
        id: `addr-${Date.now()}`,
        label: payload.label,
        value: payload.value
      }
    };
  },
  async updateAddress(addressId, payload) {
    if (config.mode === "real") {
      return request(`/addresses/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
    }

    return {
      data: {
        id: addressId,
        label: payload.label,
        value: payload.value
      }
    };
  },
  async deleteAddress(addressId) {
    if (config.mode === "real") {
      return request(`/addresses/${addressId}`, {
        method: "DELETE"
      });
    }

    return {
      data: {
        id: addressId,
        deleted: true
      }
    };
  }
};
