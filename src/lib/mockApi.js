/**
 * Mock API responses for cloud/demo preview mode.
 * Used automatically when the real backend is unreachable.
 */

// ── Demo credentials ──────────────────────────────────────────────────────────

const DEMO_USERS = {
  "family@demo.juni.care": {
    password: "Demo1234!",
    user: { id: "mock-family-1", email: "family@demo.juni.care", role: "FAMILY" },
    accessToken: "mock-family-token",
  },
  "companion@demo.juni.care": {
    password: "Demo1234!",
    user: { id: "mock-companion-1", email: "companion@demo.juni.care", role: "COMPANION" },
    accessToken: "mock-companion-token",
  },
  "admin@juni.care": {
    password: "Admin1234!",
    user: { id: "mock-admin-1", email: "admin@juni.care", role: "ADMIN" },
    accessToken: "mock-admin-token",
  },
};

export function mockLogin(email, password) {
  const entry = DEMO_USERS[email.toLowerCase().trim()];
  if (!entry || entry.password !== password) {
    const err = new Error("Invalid email or password.");
    err.status = 401;
    err.code = "INVALID_CREDENTIALS";
    throw err;
  }
  return { accessToken: entry.accessToken, user: entry.user };
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK = {
  stats: {
    totalFamilies: 1,
    totalCompanions: 1,
    activeCompanions: 1,
    pendingCompanions: 0,
    totalVisits: 2,
    visitsThisWeek: 1,
    completedVisits: 1,
    activeSubscriptions: 1,
    unreadMessages: 1,
  },

  families: [
    {
      id: "mock-family-1",
      firstName: "Rebecca",
      lastName: "Robertson",
      user: {
        email: "family@demo.juni.care",
        emailVerified: true,
        createdAt: "2026-01-15T10:00:00Z",
      },
      seniors: [{ id: "mock-senior-1", firstName: "Margaret", age: 78 }],
      subscriptions: [{ plan: "PREMIUM", status: "active" }],
    },
  ],

  companions: [
    {
      id: "mock-companion-1",
      firstName: "Sarah",
      lastName: "Chen",
      status: "ACTIVE",
      checkrStatus: "PASSED",
      user: {
        email: "companion@demo.juni.care",
        emailVerified: true,
        createdAt: "2025-12-01T10:00:00Z",
      },
    },
  ],

  visits: [
    {
      id: "mock-visit-1",
      status: "COMPLETED",
      scheduledAt: "2026-02-18T09:00:00Z",
      actualMinutes: 120,
      mood: "Joyful",
      senior: { firstName: "Margaret", lastName: "Robertson" },
      companion: { firstName: "Sarah", lastName: "Chen" },
    },
    {
      id: "mock-visit-2",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      actualMinutes: null,
      mood: null,
      senior: { firstName: "Margaret", lastName: "Robertson" },
      companion: { firstName: "Sarah", lastName: "Chen" },
    },
  ],

  inbox: [
    {
      id: "mock-msg-1",
      type: "inquiry",
      body: "Hi Juni team — wanted to ask about adding a second senior to our family account. My father-in-law recently moved in and we'd love a companion for him too.",
      createdAt: "2026-02-20T14:22:00Z",
      readAt: null,
      reply: null,
      repliedAt: null,
      family: { firstName: "Rebecca", lastName: "Robertson" },
    },
  ],

  payouts: [
    {
      id: "mock-payout-1",
      period: "Feb 1–15, 2026",
      periodStart: "2026-02-01T00:00:00Z",
      periodEnd: "2026-02-15T23:59:59Z",
      amountCents: 28080,
      status: "PAID",
      paidAt: "2026-02-17T09:00:00Z",
      companion: { firstName: "Sarah", lastName: "Chen" },
    },
  ],
};

// ── Route dispatcher ──────────────────────────────────────────────────────────

export function mockResponse(method, path, body) {
  // Auth
  if (path === "/auth/login" && method === "POST") {
    return mockLogin(body.email, body.password);
  }
  if (path === "/auth/logout" && method === "POST") return null;
  if (path === "/auth/refresh" && method === "POST") return { accessToken: "mock-token" };

  // Admin
  if (path === "/admin/stats") return MOCK.stats;
  if (path === "/admin/families") return MOCK.families;
  if (path.startsWith("/admin/companions") && method === "GET") return MOCK.companions;
  if (path.startsWith("/admin/companions") && method === "PATCH") {
    const id = path.split("/")[3];
    const comp = MOCK.companions.find((c) => c.id === id);
    if (comp) comp.status = body.status;
    return comp ?? {};
  }
  if (path.startsWith("/admin/visits")) return MOCK.visits;
  if (path === "/admin/inbox") return MOCK.inbox;
  if (path.startsWith("/admin/inbox") && method === "POST") {
    const id = path.split("/")[3];
    const msg = MOCK.inbox.find((m) => m.id === id);
    if (msg) { msg.reply = body.reply; msg.readAt = new Date().toISOString(); }
    return msg ?? {};
  }
  if (path === "/admin/payouts") return MOCK.payouts;
  if (path === "/billing/payouts/run") {
    return { processed: 1, succeeded: 1, failed: 0 };
  }

  // Fallback — return empty/null so callers don't crash
  return null;
}
