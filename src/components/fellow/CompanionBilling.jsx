import { useState } from "react";
import { ArrowLeft, DollarSign, Download, CreditCard, Landmark, CheckCircle2, Clock } from "lucide-react";
import { Card, Badge } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";

const payouts = [
  { id: 1, period: "Feb 1–15, 2026", visits: 6, hours: 12, gross: "$312.00", net: "$280.80", status: "Paid", paidOn: "Feb 17, 2026" },
  { id: 2, period: "Jan 16–31, 2026", visits: 5, hours: 10, gross: "$260.00", net: "$234.00", status: "Paid", paidOn: "Feb 2, 2026" },
  { id: 3, period: "Jan 1–15, 2026", visits: 6, hours: 12, gross: "$312.00", net: "$280.80", status: "Paid", paidOn: "Jan 17, 2026" },
  { id: 4, period: "Dec 16–31, 2025", visits: 4, hours: 8, gross: "$208.00", net: "$187.20", status: "Paid", paidOn: "Jan 2, 2026" },
  { id: 5, period: "Dec 1–15, 2025", visits: 5, hours: 10, gross: "$260.00", net: "$234.00", status: "Paid", paidOn: "Dec 17, 2025" },
];

const upcomingPayout = { period: "Feb 16–28, 2026", visits: 4, hours: 8, estimated: "$208.00", date: "Mar 4, 2026" };

const earningsTabs = ["Payout History", "Payout Settings"];

export default function CompanionBilling({ onBack }) {
  const [activeTab, setActiveTab] = useState("Payout History");
  const [showRoutingFull, setShowRoutingFull] = useState(false);

  const thisMonth = 312 + 234;
  const totalEarned = payouts.reduce((sum, p) => sum + parseFloat(p.net.replace(/[$,]/g, "")), 0).toFixed(2);

  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-blue">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <DollarSign size={22} className="text-blue" /> Earnings & Payouts
      </h2>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "This Month", value: `$${thisMonth}.00`, sub: "Feb 2026 (so far)", color: "text-blue" },
          { label: "Next Payout", value: upcomingPayout.estimated, sub: `Est. ${upcomingPayout.date}`, color: "text-sage" },
          { label: "Total Earned", value: `$${totalEarned}`, sub: "All time", color: "text-gold" },
        ].map((s, i) => (
          <Card key={i} className="text-center !py-6">
            <p className="text-[11px] text-light uppercase tracking-widest mb-2 m-0">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color} m-0`}>{s.value}</p>
            <p className="text-xs text-muted mt-1 m-0">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Upcoming payout banner */}
      <Card className="mb-6 !bg-gradient-to-r !from-blue/5 !to-sage/3 !border-blue/15">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue" />
            <div>
              <p className="text-sm font-semibold text-dark m-0">Upcoming Payout</p>
              <p className="text-xs text-muted mt-0.5 m-0">
                {upcomingPayout.period} · {upcomingPayout.visits} visits · {upcomingPayout.hours} hours
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue m-0">{upcomingPayout.estimated}</p>
            <p className="text-[11px] text-muted m-0">Arrives {upcomingPayout.date}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bg rounded-xl mb-5 w-fit">
        {earningsTabs.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium font-sans transition-all cursor-pointer border-none ${
              activeTab === t ? "bg-white text-dark shadow-sm" : "bg-transparent text-muted hover:text-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Payout History tab ── */}
      {activeTab === "Payout History" && (
        <Card>
          <h3 className="font-serif text-lg font-semibold mb-4 m-0">Payout History</h3>
          <div className="flex flex-col gap-0">
            {payouts.map((p, i) => (
              <div key={p.id} className={`py-4 ${i < payouts.length - 1 ? "border-b border-bg" : ""}`}>
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div>
                    <p className="text-sm font-semibold text-dark m-0">{p.period}</p>
                    <p className="text-xs text-muted mt-0.5 m-0">
                      {p.visits} visits · {p.hours} hours · Gross {p.gross}
                    </p>
                    {p.status === "Paid" && (
                      <p className="text-[11px] text-sage mt-1 m-0 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Deposited {p.paidOn}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-base font-bold text-dark m-0">{p.net}</p>
                      <p className="text-[11px] text-muted m-0">after 10% fee</p>
                    </div>
                    <Badge variant="sage">{p.status}</Badge>
                    <button className="p-1.5 rounded-lg border border-border bg-transparent hover:bg-bg cursor-pointer transition-all">
                      <Download size={13} className="text-muted" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Payout Settings tab ── */}
      {activeTab === "Payout Settings" && (
        <div className="flex flex-col gap-4">
          {/* Bank account */}
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <Landmark size={18} className="text-blue" />
              <h3 className="font-serif text-lg font-semibold m-0">Bank Account</h3>
              <Badge variant="sage" className="ml-auto">Verified</Badge>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg">
              <div>
                <p className="text-sm font-medium text-dark m-0">Chase Bank · Checking</p>
                <p className="text-xs text-muted mt-0.5 m-0">
                  Routing: {showRoutingFull ? "021000021" : "•••••0021"} ·
                  Account: ••••••4821
                </p>
              </div>
              <button
                onClick={() => setShowRoutingFull(v => !v)}
                className="text-xs text-blue underline bg-transparent border-none cursor-pointer font-sans"
              >
                {showRoutingFull ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm">
                <CreditCard size={13} /> Update Bank Account
              </Button>
            </div>
          </Card>

          {/* Payout schedule */}
          <Card>
            <h3 className="font-serif text-lg font-semibold mb-4 m-0">Payout Schedule</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: "Bi-weekly (current)", desc: "Payouts on the 2nd and 17th of each month", active: true },
                { label: "Weekly", desc: "Payouts every Monday for the prior week", active: false },
                { label: "Monthly", desc: "Single payout on the 1st of each month", active: false },
              ].map((opt, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    opt.active ? "border-blue/30 bg-blue-bg/40" : "border-border bg-warm-white hover:bg-bg"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    opt.active ? "border-blue" : "border-border"
                  }`}>
                    {opt.active && <div className="w-2 h-2 rounded-full bg-blue" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark m-0">{opt.label}</p>
                    <p className="text-xs text-muted mt-0.5 m-0">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Tax info */}
          <Card className="!bg-gradient-to-r !from-gold/5 !to-transparent !border-gold/15">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm font-semibold text-dark m-0">Tax Documents</p>
                <p className="text-xs text-muted mt-1 m-0">Your 1099-NEC for 2025 is ready to download.</p>
              </div>
              <Button variant="secondary" size="sm">
                <Download size={13} /> Download 1099
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
