/**
 * Juni API Client
 *
 * Thin wrapper around fetch() that:
 *  - Attaches the Bearer token from localStorage
 *  - Handles 401s by attempting a token refresh, then retrying
 *  - Throws structured ApiError on non-2xx responses
 *
 * Usage:
 *   import api from '../lib/api';
 *   const data = await api.get('/families/me');
 *   await api.post('/auth/login', { email, password });
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// ── Token management ──────────────────────────────────────────────────────────

export const tokenStore = {
  get() {
    return localStorage.getItem("juni_access_token");
  },
  set(token) {
    localStorage.setItem("juni_access_token", token);
  },
  clear() {
    localStorage.removeItem("juni_access_token");
    localStorage.removeItem("juni_user");
  },
};

export const userStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem("juni_user") || "null");
    } catch {
      return null;
    }
  },
  set(user) {
    localStorage.setItem("juni_user", JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem("juni_user");
  },
};

// ── Core fetch ────────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

async function request(method, path, body, options = {}) {
  const token = tokenStore.get();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include", // send httpOnly refresh token cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token expired — attempt refresh then retry once
  if (res.status === 401 && !options._retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // Drain queued requests
          refreshQueue.forEach((resolve) => resolve());
          refreshQueue = [];
          return request(method, path, body, { ...options, _retry: true });
        }
      } catch {
        // Refresh failed — clear auth and redirect to login
        tokenStore.clear();
        userStore.clear();
        window.location.href = "/";
      } finally {
        isRefreshing = false;
      }
    } else {
      // Queue this request until refresh completes
      await new Promise((resolve) => refreshQueue.push(resolve));
      return request(method, path, body, { ...options, _retry: true });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new ApiError(
      error.error ?? `Request failed: ${res.status}`,
      res.status,
      error.code ?? "UNKNOWN",
    );
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

async function refreshAccessToken() {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;
  const data = await res.json();
  tokenStore.set(data.accessToken);
  return true;
}

// ── Public API ────────────────────────────────────────────────────────────────

const api = {
  get: (path, options) => request("GET", path, undefined, options),
  post: (path, body, options) => request("POST", path, body, options),
  patch: (path, body, options) => request("PATCH", path, body, options),
  delete: (path, options) => request("DELETE", path, undefined, options),

  // ── Auth ───────────────────────────────────────────────────────────────

  auth: {
    async registerFamily(data) {
      return api.post("/auth/register/family", data);
    },
    async registerCompanion(data) {
      return api.post("/auth/register/companion", data);
    },
    async login(email, password) {
      const result = await api.post("/auth/login", { email, password });
      tokenStore.set(result.accessToken);
      userStore.set(result.user);
      return result;
    },
    async logout() {
      try {
        await api.post("/auth/logout");
      } finally {
        tokenStore.clear();
        userStore.clear();
      }
    },
    async verifyEmail(token) {
      return api.post("/auth/verify-email", { token });
    },
    async forgotPassword(email) {
      return api.post("/auth/forgot-password", { email });
    },
    async resetPassword(token, password) {
      return api.post("/auth/reset-password", { token, password });
    },
    async me() {
      return api.get("/auth/me");
    },
  },

  // ── Families ────────────────────────────────────────────────────────────

  families: {
    async me() {
      return api.get("/families/me");
    },
    async updateProfile(data) {
      return api.patch("/families/me", data);
    },
    async getSeniors() {
      return api.get("/families/seniors");
    },
    async getSenior(seniorId) {
      return api.get(`/families/seniors/${seniorId}`);
    },
    async updateSenior(seniorId, data) {
      return api.patch(`/families/seniors/${seniorId}`, data);
    },
    async requestMatches(seniorId) {
      return api.post(`/families/seniors/${seniorId}/request-matches`);
    },
    async acceptMatch(matchId) {
      return api.post(`/families/matches/${matchId}/accept`);
    },
    async rejectMatch(matchId) {
      return api.post(`/families/matches/${matchId}/reject`);
    },
    async getVisits(seniorId) {
      return api.get(`/families/seniors/${seniorId}/visits`);
    },
    async requestVisit(seniorId, data) {
      return api.post(`/families/seniors/${seniorId}/visits`, data);
    },
  },

  // ── Companions ──────────────────────────────────────────────────────────

  companions: {
    async me() {
      return api.get("/companions/me");
    },
    async updateProfile(data) {
      return api.patch("/companions/me", data);
    },
    async initiateBackgroundCheck() {
      return api.post("/companions/me/background-check/initiate");
    },
    async getBackgroundCheckStatus() {
      return api.get("/companions/me/background-check/status");
    },
    async updateTraining(module, pct) {
      return api.patch("/companions/me/training", { module, pct });
    },
    async getVisitPrep(seniorId) {
      return api.get(`/companions/me/seniors/${seniorId}/visit-prep`);
    },
    async getVisits() {
      return api.get("/companions/me/visits");
    },
    async getPayouts() {
      return api.get("/companions/me/payouts");
    },
    async startStripeOnboarding() {
      return api.post("/companions/me/stripe-connect/onboard");
    },
  },

  // ── Visits ──────────────────────────────────────────────────────────────

  visits: {
    async get(visitId) {
      return api.get(`/visits/${visitId}`);
    },
    async checkIn(visitId, coords) {
      return api.post(`/visits/${visitId}/check-in`, coords ?? {});
    },
    async checkOut(visitId, data) {
      return api.post(`/visits/${visitId}/check-out`, data);
    },
    async cancel(visitId, reason) {
      return api.post(`/visits/${visitId}/cancel`, { reason });
    },
    async getTrends(seniorId) {
      return api.get(`/visits/seniors/${seniorId}/trends`);
    },
  },

  // ── Billing ─────────────────────────────────────────────────────────────

  billing: {
    async createCheckout(plan) {
      return api.post("/billing/checkout", { plan });
    },
    async openPortal() {
      return api.post("/billing/portal");
    },
    async getSubscription() {
      return api.get("/billing/subscription");
    },
    async getInvoices() {
      return api.get("/billing/invoices");
    },
  },

  // ── Messages ────────────────────────────────────────────────────────────

  messages: {
    async send(data) {
      return api.post("/messages", data);
    },
    async list() {
      return api.get("/messages");
    },
  },

  // ── Storage ─────────────────────────────────────────────────────────────

  storage: {
    async getUploadUrl(category, mimeType, fileSizeBytes, seniorId) {
      return api.post("/storage/presign", { category, mimeType, fileSizeBytes, seniorId });
    },
    async getDownloadUrl(objectKey) {
      return api.post("/storage/download", { objectKey });
    },
    /**
     * Full upload helper: gets presigned URL then PUTs the file directly to S3.
     * Returns the objectKey for storing in the DB.
     */
    async upload(file, category, seniorId) {
      const { uploadUrl, objectKey } = await api.storage.getUploadUrl(
        category,
        file.type,
        file.size,
        seniorId,
      );
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("S3 upload failed");
      return objectKey;
    },
  },
};

export default api;
