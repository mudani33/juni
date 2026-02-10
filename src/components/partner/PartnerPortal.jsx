import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, FileText, Link2, Copy, Download, Plus, ExternalLink } from "lucide-react";
import { Card, TabNav, Badge, Stat, ProgressBar } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";
import Footer from "../layout/Footer";
import { pStats, pClients } from "../../lib/constants";

const tabs = [
  { id: "overview", label: "Overview", icon: "\uD83D\uDCCA" },
  { id: "clients", label: "Clients", icon: "\uD83D\uDC65" },
  { id: "reports", label: "Reports", icon: "\uD83D\uDCC4" },
  { id: "resources", label: "Resources", icon: "\uD83D\uDD17" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function PartnerPortal() {
  const [tab, setTab] = useState("overview");

  return (
    <PageWrapper className="max-w-5xl mx-auto px-6 pt-6 pb-16">
      {/* Header Card */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-5">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-dark m-0">Meridian Wealth Advisors</h1>
              <p className="text-sm text-muted mt-1.5 m-0">Trust Partner since October 2025</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm"><Copy size={13} /> Copy Referral Link</Button>
              <Button variant="amber" size="sm"><FileText size={13} /> Generate Report</Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* Overview */}
      {tab === "overview" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Total Referrals", v: pStats.refs, c: "text-amber" },
              { l: "Active Clients", v: pStats.active, c: "text-sage" },
              { l: "Avg Engagement", v: `${pStats.eng}%`, c: "text-blue" },
              { l: "Conversion", v: pStats.conv, c: "text-purple" },
            ].map((s, i) => (
              <Card key={i} className="text-center !py-6">
                <p className="text-[11px] text-light uppercase tracking-widest mb-2 m-0">{s.l}</p>
                <p className={`text-2xl font-bold ${s.c} m-0`}>{s.v}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="font-serif text-lg font-semibold mb-6 m-0">Referral Funnel</h3>
            {[
              { l: "Link Clicks", v: pStats.funnel.clicks, p: 100 },
              { l: "Vibe Check Starts", v: pStats.funnel.starts, p: Math.round(pStats.funnel.starts / pStats.funnel.clicks * 100) },
              { l: "Completed Onboarding", v: pStats.funnel.done, p: Math.round(pStats.funnel.done / pStats.funnel.clicks * 100) },
              { l: "Active Memberships", v: pStats.funnel.live, p: Math.round(pStats.funnel.live / pStats.funnel.clicks * 100) },
            ].map((s, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-mid">{s.l}</span>
                  <span className="text-sm font-semibold">{s.v} <span className="text-muted font-normal">({s.p}%)</span></span>
                </div>
                <ProgressBar value={s.p} color="amber" height="h-2" />
              </div>
            ))}
          </Card>

          <Card>
            <h3 className="font-serif text-lg font-semibold mb-2 m-0">Client Outcomes</h3>
            <p className="text-sm text-mid font-light leading-relaxed mb-5 m-0">
              Aggregate social health outcomes across your referred clients.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { l: "Engagement Up", v: `${pStats.outcomes.engUp}%`, c: "sage" },
                { l: "Memory Stable+", v: `${pStats.outcomes.memOk}%`, c: "gold" },
                { l: "Mood Improved", v: `${pStats.outcomes.moodUp}%`, c: "purple" },
              ].map((o, i) => (
                <div key={i} className={`text-center py-5 bg-${o.c}/5 rounded-xl`}>
                  <p className={`text-3xl font-bold text-${o.c} m-0`}>{o.v}</p>
                  <p className="text-xs text-muted mt-2 m-0">{o.l}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Clients */}
      {tab === "clients" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-3">
          <Card className="!bg-bg" padding="px-6 py-3.5">
            <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr] gap-4">
              {["Family", "Status", "Plan", "Engagement", "Months"].map(h => (
                <span key={h} className="text-[11px] text-muted uppercase tracking-widest font-semibold">{h}</span>
              ))}
            </div>
          </Card>
          {pClients.map(c => (
            <Card key={c.id} hover padding="px-6 py-4">
              <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_0.8fr] gap-4 items-center">
                <div>
                  <p className="text-sm font-semibold m-0">{c.family}</p>
                  <p className="text-xs text-muted mt-0.5 m-0">Senior: {c.senior}</p>
                </div>
                <Badge variant={c.status === "Active" ? "sage" : "gold"}>{c.status}</Badge>
                <span className="text-[13px] text-mid">{c.plan}</span>
                <div>
                  {c.eng > 0 ? (
                    <div className="flex items-center gap-2">
                      <ProgressBar value={c.eng} color={c.eng > 85 ? "sage" : c.eng > 70 ? "gold" : "purple"} />
                      <span className="text-[13px] font-semibold min-w-[32px]">{c.eng}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-light">Pending</span>
                  )}
                </div>
                <span className="text-[13px] text-mid">{c.mo > 0 ? `${c.mo} mo` : "\u2014"}</span>
              </div>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Reports */}
      {tab === "reports" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col gap-5">
          <Card className="text-center !py-10 !bg-gradient-to-r !from-amber/5 !to-sage/3">
            <BarChart3 size={40} className="text-amber/60 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-3 m-0">Co-Branded Quarterly Reports</h3>
            <p className="text-sm text-mid font-light leading-relaxed mb-6 m-0 max-w-md mx-auto">
              White-labeled wellness summaries with your branding. Demonstrate holistic client care beyond financial services.
            </p>
            <Button variant="amber"><FileText size={14} /> Generate Q4 2025 Report</Button>
          </Card>
          <Card>
            <h3 className="font-serif text-lg font-semibold mb-5 m-0">Recent Reports</h3>
            {[
              { n: "Q4 2025 Wellness Summary", d: "Jan 15, 2026", c: 38, s: "Ready" },
              { n: "Q3 2025 Wellness Summary", d: "Oct 12, 2025", c: 32, s: "Downloaded" },
              { n: "Q2 2025 Wellness Summary", d: "Jul 8, 2025", c: 24, s: "Downloaded" },
            ].map((r, i) => (
              <div key={i} className={`flex justify-between items-center py-4 ${i < 2 ? "border-b border-bg" : ""}`}>
                <div>
                  <p className="text-sm font-semibold m-0">{r.n}</p>
                  <p className="text-xs text-muted mt-1 m-0">{r.d} · {r.c} clients</p>
                </div>
                <div className="flex gap-3 items-center">
                  <Badge variant={r.s === "Ready" ? "sage" : "muted"}>{r.s}</Badge>
                  <Button variant="secondary" size="sm"><Download size={12} /> PDF</Button>
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      {/* Resources */}
      {tab === "resources" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-serif text-xl font-semibold m-0">Resource Directory</h3>
              <Button variant="amber" size="sm"><Plus size={13} /> Add Resource</Button>
            </div>
            <p className="text-sm text-muted font-light leading-relaxed mb-6 m-0">
              Curate trusted providers accessible through your referred families&apos; dashboards.
            </p>
            {[
              { n: "SafeHome Modifications", t: "Home Safety", d: "ADA bathrooms, grab bars, ramps", f: 12 },
              { n: "Sterling Move Management", t: "Moving", d: "Full-service downsizing & relocation", f: 5 },
              { n: "TechConnect Senior Services", t: "Technology", d: "Device setup, video calling, smart home", f: 18 },
              { n: "Green Thumb Garden Care", t: "Maintenance", d: "Yard care, raised garden beds", f: 8 },
            ].map((r, i) => (
              <div key={i} className={`flex justify-between items-center py-4.5 ${i < 3 ? "border-b border-bg" : ""}`}>
                <div>
                  <p className="text-[15px] font-semibold m-0">{r.n}</p>
                  <p className="text-[13px] text-muted mt-1 m-0">{r.d}</p>
                </div>
                <div className="flex gap-3 items-center shrink-0">
                  <span className="text-xs text-muted">{r.f} families</span>
                  <Badge variant="amber">{r.t}</Badge>
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
      )}

      <Footer />
    </PageWrapper>
  );
}
