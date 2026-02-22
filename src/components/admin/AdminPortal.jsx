import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Heart, Calendar, MessageCircle,
  DollarSign, ChevronRight, RefreshCw, Send, X, CheckCircle2,
  Clock, AlertTriangle, ShieldCheck, Ban, UserCheck, Loader2,
} from "lucide-react";
import api from "../../lib/api";
import { userStore } from "../../lib/api";
import { Card, Badge, Avatar, TabNav } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";

// ── Status helpers ────────────────────────────────────────────────────────────

const COMPANION_STATUS_VARIANTS = {
  APPLIED: "amber",
  SCREENING: "blue",
  TRAINING: "purple",
  ACTIVE: "sage",
  SUSPENDED: "danger",
  DEACTIVATED: "muted",
};

const VISIT_STATUS_VARIANTS = {
  SCHEDULED: "blue",
  IN_PROGRESS: "gold",
  COMPLETED: "sage",
  CANCELLED: "muted",
};

const COMPANION_STATUS_NEXT = {
  APPLIED: ["SCREENING", "DEACTIVATED"],
  SCREENING: ["TRAINING", "DEACTIVATED"],
  TRAINING: ["ACTIVE", "DEACTIVATED"],
  ACTIVE: ["SUSPENDED", "DEACTIVATED"],
  SUSPENDED: ["ACTIVE", "DEACTIVATED"],
  DEACTIVATED: ["APPLIED"],
};

function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtMoney(cents) {
  if (cents == null) return "—";
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = "text-sage", sub }) {
  return (
    <Card className="flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-bg flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-xs text-muted uppercase tracking-widest font-semibold m-0 mb-1">{label}</p>
        <p className="font-serif text-2xl font-semibold text-dark m-0">{value ?? "—"}</p>
        {sub && <p className="text-xs text-muted m-0 mt-1">{sub}</p>}
      </div>
    </Card>
  );
}

// ── Loading / Error states ────────────────────────────────────────────────────

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={24} className="text-sage animate-spin" />
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="text-center py-16 text-muted text-sm">{message}</div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ stats, loading }) {
  if (loading) return <Loading />;
  if (!stats) return <Empty message="Could not load stats." />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard icon={Heart} label="Families" value={stats.totalFamilies} color="text-gold" />
      <StatCard icon={Users} label="Companions" value={stats.totalCompanions}
        sub={`${stats.activeCompanions} active`} />
      <StatCard icon={AlertTriangle} label="Pending Review" value={stats.pendingCompanions} color="text-amber" />
      <StatCard icon={Calendar} label="Total Visits" value={stats.totalVisits}
        sub={`${stats.visitsThisWeek} this week`} color="text-blue" />
      <StatCard icon={CheckCircle2} label="Completed Visits" value={stats.completedVisits} color="text-sage" />
      <StatCard icon={DollarSign} label="Active Subscriptions" value={stats.activeSubscriptions} color="text-purple" />
      <StatCard icon={MessageCircle} label="Unread Messages" value={stats.unreadMessages} color="text-danger" />
    </div>
  );
}

// ── Families tab ──────────────────────────────────────────────────────────────

function FamiliesTab({ families, loading }) {
  if (loading) return <Loading />;
  if (!families?.length) return <Empty message="No families found." />;

  return (
    <div className="flex flex-col gap-3">
      {families.map((f) => {
        const sub = f.subscriptions?.[0];
        return (
          <Card key={f.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={`${f.firstName?.[0] ?? "?"}${f.lastName?.[0] ?? ""}`} size="md" color="gold" />
              <div className="min-w-0">
                <p className="font-medium text-dark text-sm m-0 truncate">
                  {f.firstName} {f.lastName}
                </p>
                <p className="text-xs text-muted m-0 truncate">{f.user?.email}</p>
                <p className="text-xs text-light m-0">Joined {fmt(f.user?.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted m-0">{f.seniors?.length ?? 0} senior{f.seniors?.length !== 1 ? "s" : ""}</p>
                {!f.user?.emailVerified && (
                  <p className="text-[10px] text-amber m-0">Unverified</p>
                )}
              </div>
              {sub ? (
                <Badge variant={sub.status === "active" ? "sage" : sub.status === "past_due" ? "danger" : "amber"}>
                  {sub.plan}
                </Badge>
              ) : (
                <Badge variant="muted">No plan</Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Companions tab ────────────────────────────────────────────────────────────

function CompanionsTab({ companions, loading, onStatusChange }) {
  const [updating, setUpdating] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    setOpenMenu(null);
    try {
      await onStatusChange(id, status);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Loading />;
  if (!companions?.length) return <Empty message="No companions found." />;

  return (
    <div className="flex flex-col gap-3">
      {companions.map((c) => {
        const nextStatuses = COMPANION_STATUS_NEXT[c.status] ?? [];
        const isUpdating = updating === c.id;
        return (
          <Card key={c.id} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initials={`${c.firstName?.[0] ?? "?"}${c.lastName?.[0] ?? ""}`} size="md" color="sage" />
              <div className="min-w-0">
                <p className="font-medium text-dark text-sm m-0 truncate">
                  {c.firstName} {c.lastName}
                </p>
                <p className="text-xs text-muted m-0 truncate">{c.user?.email}</p>
                <p className="text-xs text-light m-0">
                  {c._count?.seniors ?? 0} senior{c._count?.seniors !== 1 ? "s" : ""} &middot; Joined {fmt(c.user?.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 relative">
              <Badge variant={COMPANION_STATUS_VARIANTS[c.status] ?? "muted"}>
                {c.status}
              </Badge>
              {nextStatuses.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                    disabled={isUpdating}
                    className="text-xs text-muted hover:text-dark border border-border rounded-lg px-2 py-1 bg-transparent cursor-pointer transition-colors font-sans disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : "Change"}
                  </button>
                  {openMenu === c.id && (
                    <div className="absolute right-0 top-8 z-10 bg-warm-white border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                      {nextStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatus(c.id, s)}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-dark hover:bg-bg transition-colors font-sans cursor-pointer border-none bg-transparent"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── Visits tab ────────────────────────────────────────────────────────────────

function VisitsTab({ visits, loading }) {
  const [filter, setFilter] = useState("all");

  if (loading) return <Loading />;

  const filtered = filter === "all" ? visits : visits?.filter((v) => v.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all cursor-pointer font-sans ${
              filter === s
                ? "bg-dark text-white border-dark"
                : "bg-transparent text-muted border-border hover:border-mid hover:text-mid"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ")}
          </button>
        ))}
      </div>
      {!filtered?.length ? (
        <Empty message="No visits found." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((v) => (
            <Card key={v.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-bg flex items-center justify-center flex-shrink-0">
                  <Calendar size={14} className="text-blue" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-dark text-sm m-0 truncate">
                    {v.senior?.firstName ?? "?"} &middot; {v.companion?.firstName} {v.companion?.lastName}
                  </p>
                  <p className="text-xs text-muted m-0">
                    {v.senior?.family?.firstName} {v.senior?.family?.lastName} family
                  </p>
                  <p className="text-xs text-light m-0">
                    {fmt(v.scheduledAt)} &middot; {v.visitType ?? "Visit"}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Badge variant={VISIT_STATUS_VARIANTS[v.status] ?? "muted"}>
                  {v.status?.replace("_", " ")}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Inbox tab ─────────────────────────────────────────────────────────────────

function InboxTab({ messages, loading, onReply }) {
  const [expanded, setExpanded] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [sending, setSending] = useState(null);

  const handleReply = async (id) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    setSending(id);
    try {
      await onReply(id, text);
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      setExpanded(null);
    } finally {
      setSending(null);
    }
  };

  if (loading) return <Loading />;
  if (!messages?.length) return <Empty message="Inbox is empty." />;

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => {
        const isOpen = expanded === m.id;
        const isRead = !!m.readAt;
        return (
          <Card
            key={m.id}
            className={`transition-all ${!isRead ? "border-l-[3px] border-l-sage" : ""}`}
          >
            <div
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => setExpanded(isOpen ? null : m.id)}
            >
              <div className="flex gap-3 items-start flex-1 min-w-0">
                <Avatar
                  initials={m.family ? `${m.family.firstName?.[0] ?? "?"}` : "?"}
                  size="sm"
                  color="brown"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={isRead ? "muted" : "sage"} className="!text-[10px]">
                      {m.type ?? "message"}
                    </Badge>
                    <span className="text-xs text-muted">
                      {m.family ? `${m.family.firstName} ${m.family.lastName}` : m.from?.email}
                    </span>
                    <span className="text-xs text-light">{fmt(m.createdAt)}</span>
                    {isRead && <span className="text-[10px] text-sage flex items-center gap-1"><CheckCircle2 size={10} /> Replied</span>}
                  </div>
                  <p className={`text-sm text-mid font-light leading-relaxed m-0 ${isOpen ? "" : "line-clamp-2"}`}>
                    {m.body}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={14}
                className={`text-muted flex-shrink-0 mt-1 transition-transform ${isOpen ? "rotate-90" : ""}`}
              />
            </div>

            {isOpen && (
              <div className="mt-4 pt-4 border-t border-bg">
                {m.reply && (
                  <div className="flex gap-3 items-start mb-4 p-3 bg-sage-bg rounded-xl">
                    <Avatar initials="J" size="sm" color="sage" />
                    <div>
                      <p className="text-xs font-semibold text-dark m-0 mb-1">
                        Juni Team &middot; {fmt(m.repliedAt)}
                      </p>
                      <p className="text-sm text-mid font-light m-0">{m.reply}</p>
                    </div>
                  </div>
                )}
                {!m.reply && (
                  <div>
                    <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-2 m-0">
                      Reply
                    </p>
                    <textarea
                      value={replyText[m.id] ?? ""}
                      onChange={(e) => setReplyText((prev) => ({ ...prev, [m.id]: e.target.value }))}
                      placeholder="Type your reply…"
                      className="w-full min-h-[80px] p-3 border border-border rounded-xl bg-warm-white font-sans text-sm leading-relaxed text-dark resize-none outline-none placeholder:text-muted/50 focus:border-sage transition-colors"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!replyText[m.id]?.trim() || sending === m.id}
                        onClick={() => handleReply(m.id)}
                      >
                        {sending === m.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Send size={12} />}
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Payouts tab ───────────────────────────────────────────────────────────────

function PayoutsTab({ payouts, loading, onRunPayouts }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      const res = await onRunPayouts(
        new Date(periodStart).toISOString(),
        new Date(periodEnd + "T23:59:59").toISOString(),
      );
      setResult(res);
    } catch (err) {
      setResult({ error: err.message ?? "Payout run failed" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Run payouts */}
      <Card>
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4 m-0">Run Companion Payouts</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-muted block mb-1">Period start</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage"
            />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Period end</label>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage"
            />
          </div>
          <Button variant="primary" size="sm" disabled={running} onClick={handleRun}>
            {running ? <Loader2 size={13} className="animate-spin" /> : <DollarSign size={13} />}
            Run Payouts
          </Button>
        </div>
        {result && (
          <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${result.error ? "bg-danger-bg text-danger" : "bg-sage-bg text-sage"}`}>
            {result.error
              ? `Error: ${result.error}`
              : `Done — ${result.succeeded} succeeded, ${result.failed} failed out of ${result.processed} companions`}
          </div>
        )}
      </Card>

      {/* Payout history */}
      <div>
        <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-3 m-0">Payout History</p>
        {loading ? (
          <Loading />
        ) : !payouts?.length ? (
          <Empty message="No payouts yet." />
        ) : (
          <div className="flex flex-col gap-3">
            {payouts.map((p) => (
              <Card key={p.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={`${p.companion?.firstName?.[0] ?? "?"}${p.companion?.lastName?.[0] ?? ""}`}
                    size="sm"
                    color="sage"
                  />
                  <div>
                    <p className="font-medium text-dark text-sm m-0">
                      {p.companion?.firstName} {p.companion?.lastName}
                    </p>
                    <p className="text-xs text-muted m-0">
                      {fmt(p.periodStart)} – {fmt(p.periodEnd)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-dark text-sm m-0">{fmtMoney(p.amountCents)}</p>
                  <Badge variant={p.status === "PAID" ? "sage" : p.status === "FAILED" ? "danger" : "amber"}>
                    {p.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main AdminPortal ──────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
  { id: "families", label: "Families", icon: <Heart size={14} /> },
  { id: "companions", label: "Companions", icon: <Users size={14} /> },
  { id: "visits", label: "Visits", icon: <Calendar size={14} /> },
  { id: "inbox", label: "Inbox", icon: <MessageCircle size={14} /> },
  { id: "payouts", label: "Payouts", icon: <DollarSign size={14} /> },
];

export default function AdminPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");

  // Data state
  const [stats, setStats] = useState(null);
  const [families, setFamilies] = useState(null);
  const [companions, setCompanions] = useState(null);
  const [visits, setVisits] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [payouts, setPayouts] = useState(null);

  // Loading state per tab
  const [loading, setLoading] = useState({});

  // Auth guard
  useEffect(() => {
    const user = userStore.get();
    if (!user || user.role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const load = useCallback(async (key, fetcher) => {
    setLoading((l) => ({ ...l, [key]: true }));
    try {
      const data = await fetcher();
      switch (key) {
        case "stats": setStats(data); break;
        case "families": setFamilies(data); break;
        case "companions": setCompanions(data); break;
        case "visits": setVisits(data); break;
        case "inbox": setInbox(data); break;
        case "payouts": setPayouts(data); break;
      }
    } catch (err) {
      console.error(`Failed to load ${key}:`, err);
    } finally {
      setLoading((l) => ({ ...l, [key]: false }));
    }
  }, []);

  // Load data for a tab the first time it's visited
  useEffect(() => {
    if (tab === "overview" && stats === null) load("stats", api.admin.getStats);
    if (tab === "families" && families === null) load("families", api.admin.getFamilies);
    if (tab === "companions" && companions === null) load("companions", api.admin.getCompanions);
    if (tab === "visits" && visits === null) load("visits", () => api.admin.getVisits(null, 100));
    if (tab === "inbox" && inbox === null) load("inbox", api.admin.getInbox);
    if (tab === "payouts" && payouts === null) load("payouts", api.admin.getPayouts);
  }, [tab, stats, families, companions, visits, inbox, payouts, load]);

  const refresh = () => {
    switch (tab) {
      case "overview": load("stats", api.admin.getStats); break;
      case "families": load("families", api.admin.getFamilies); break;
      case "companions": load("companions", api.admin.getCompanions); break;
      case "visits": load("visits", () => api.admin.getVisits(null, 100)); break;
      case "inbox": load("inbox", api.admin.getInbox); break;
      case "payouts": load("payouts", api.admin.getPayouts); break;
    }
  };

  const handleCompanionStatus = async (id, status) => {
    await api.admin.updateCompanionStatus(id, status);
    setCompanions((prev) =>
      prev?.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const handleReply = async (id, reply) => {
    await api.admin.replyToMessage(id, reply);
    setInbox((prev) =>
      prev?.map((m) => (m.id === id ? { ...m, reply, repliedAt: new Date().toISOString(), readAt: new Date().toISOString() } : m))
    );
  };

  const handleRunPayouts = async (start, end) => {
    const res = await api.admin.runPayouts(start, end);
    // Refresh payouts list after run
    load("payouts", api.admin.getPayouts);
    return res;
  };

  const unreadCount = inbox?.filter((m) => !m.readAt).length ?? 0;

  return (
    <PageWrapper className="max-w-4xl mx-auto px-6 pt-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-dark m-0">Admin Portal</h1>
          <p className="text-sm text-muted m-0 mt-1">Manage all platform data</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="text-xs bg-danger text-white rounded-full px-2 py-0.5 font-semibold">
              {unreadCount} unread
            </span>
          )}
          <button
            onClick={refresh}
            className="w-8 h-8 rounded-lg border border-border bg-warm-white flex items-center justify-center hover:bg-bg transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={14} className="text-muted" />
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <TabNav
        tabs={TABS.map((t) => ({
          ...t,
          label: t.id === "inbox" && unreadCount > 0 ? `${t.label} (${unreadCount})` : t.label,
        }))}
        active={tab}
        onChange={setTab}
      />

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab stats={stats} loading={loading.stats} />
      )}
      {tab === "families" && (
        <FamiliesTab families={families} loading={loading.families} />
      )}
      {tab === "companions" && (
        <CompanionsTab
          companions={companions}
          loading={loading.companions}
          onStatusChange={handleCompanionStatus}
        />
      )}
      {tab === "visits" && (
        <VisitsTab visits={visits} loading={loading.visits} />
      )}
      {tab === "inbox" && (
        <InboxTab messages={inbox} loading={loading.inbox} onReply={handleReply} />
      )}
      {tab === "payouts" && (
        <PayoutsTab
          payouts={payouts}
          loading={loading.payouts}
          onRunPayouts={handleRunPayouts}
        />
      )}
    </PageWrapper>
  );
}
