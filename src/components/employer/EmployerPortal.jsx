import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, TrendingDown, TrendingUp, DollarSign, BarChart3,
  Heart, Brain, Shield, ShieldCheck, ArrowRight, Download, Copy, Check,
  Activity, BookOpen, AlertTriangle, ChevronRight, Star, Eye,
  RefreshCw, Sparkles, UserCheck, Clock, CalendarCheck,
} from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Stat from "../ui/Stat";
import ProgressBar from "../ui/ProgressBar";
import TabNav from "../ui/TabNav";
import VitalsChart from "../ui/VitalsChart";
import Avatar from "../ui/Avatar";
import PageWrapper from "../layout/PageWrapper";
import { MONTHS } from "../../lib/constants";
import {
  employerProfile, employerStats, employerROI, caregiverBurdenIndex,
  employerClinicalOutcomes, employerDepartments, employerEmployees,
} from "../../lib/constants";

const tabs = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "roi", label: "ROI & Savings", icon: "💰" },
  { id: "burden", label: "Caregiver Burden", icon: "🧠" },
  { id: "outcomes", label: "Clinical Outcomes", icon: "❤️" },
  { id: "employees", label: "Employees", icon: "👥" },
];

export default function EmployerPortal() {
  const [tab, setTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("https://juni.com/enroll/meridian-health");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto px-6 py-10">
      {/* ── Company Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue to-blue/70 flex items-center justify-center text-white text-xl font-bold font-serif shadow-lg shadow-blue/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-semibold text-dark m-0">{employerProfile.company}</h1>
              <Badge variant="blue">{employerProfile.plan}</Badge>
            </div>
            <p className="text-xs text-muted mt-0.5 m-0">
              {employerProfile.adminTitle} · {employerProfile.admin} · Since {employerProfile.since}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Employee Enrollment Link</>}
          </Button>
          <Button variant="blue" size="sm">
            <Download size={12} /> Export Report
          </Button>
        </div>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, color: "text-blue", bg: "bg-blue-bg", label: "Enrolled Employees", value: employerStats.enrolled, sub: `of ${employerProfile.employees} total` },
          { icon: Heart, color: "text-sage", bg: "bg-sage-bg", label: "Active Parents", value: employerStats.activeParents, sub: "receiving visits" },
          { icon: Activity, color: "text-gold", bg: "bg-gold-bg", label: "Utilization Rate", value: `${employerStats.utilization}%`, sub: "enrolled employees using benefit" },
          { icon: Star, color: "text-purple", bg: "bg-purple-bg", label: "Satisfaction", value: employerStats.avgSatisfaction, sub: "out of 5.0" },
        ].map((s, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold m-0">{s.label}</p>
            </div>
            <p className="text-2xl font-bold text-dark m-0">{s.value}</p>
            <p className="text-[11px] text-light mt-0.5 m-0">{s.sub}</p>
          </Card>
        ))}
      </div>

      <TabNav tabs={tabs} active={tab} onChange={setTab} />

      {/* ════════════ OVERVIEW ════════════ */}
      {tab === "overview" && (
        <div>
          {/* Enrollment Growth */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-dark m-0">Enrollment Growth</h3>
                <p className="text-xs text-muted mt-0.5 m-0">Monthly employee enrollment since launch</p>
              </div>
              <Badge variant="sage">+{Math.round(((employerStats.enrolled - employerStats.monthlyEnrollment[0]) / employerStats.monthlyEnrollment[0]) * 100)}% growth</Badge>
            </div>
            <VitalsChart data={employerStats.monthlyEnrollment} labels={MONTHS} color="blue" label="Enrolled" />
          </Card>

          {/* Quick ROI Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="!bg-gradient-to-br !from-sage-bg !to-[#e8f5e8] !border-sage/15">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-sage" />
                <p className="text-xs text-sage font-semibold uppercase tracking-wider m-0">Turnover</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-sage m-0">{employerROI.turnoverAfter}%</p>
                <Badge variant="sage">-{employerROI.turnoverReduction}%</Badge>
              </div>
              <p className="text-[11px] text-mid mt-1 m-0">Down from {employerROI.turnoverBefore}% (caregiver employees)</p>
            </Card>

            <Card className="!bg-gradient-to-br !from-blue-bg !to-[#e3f2fd] !border-blue/15">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-blue" />
                <p className="text-xs text-blue font-semibold uppercase tracking-wider m-0">Absenteeism</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-blue m-0">{employerROI.absenteeismAfter}</p>
                <Badge variant="blue">-{employerROI.absenteeismReduction}%</Badge>
              </div>
              <p className="text-[11px] text-mid mt-1 m-0">Days/year (was {employerROI.absenteeismBefore})</p>
            </Card>

            <Card className="!bg-gradient-to-br !from-gold-bg !to-amber-bg/50 !border-gold/15">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-gold" />
                <p className="text-xs text-gold font-semibold uppercase tracking-wider m-0">Annual Savings</p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-gold m-0">${(employerROI.annualSavings / 1000000).toFixed(1)}M</p>
                <Badge variant="amber">{employerROI.roiMultiple}x ROI</Badge>
              </div>
              <p className="text-[11px] text-mid mt-1 m-0">Across turnover, absenteeism & productivity</p>
            </Card>
          </div>

          {/* Department Breakdown */}
          <Card>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-dark m-0">Department Breakdown</h3>
                <p className="text-xs text-muted mt-0.5 m-0">Enrollment and utilization by department</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {employerDepartments.map((dept, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-bg/50 hover:bg-bg transition-colors">
                  <div className="w-28 sm:w-36">
                    <p className="text-sm font-semibold text-dark m-0 truncate">{dept.name}</p>
                    <p className="text-[10px] text-muted m-0">{dept.employees} employees</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <ProgressBar value={(dept.enrolled / dept.employees) * 100 * 10} color={dept.utilization > 75 ? "sage" : dept.utilization > 65 ? "blue" : "amber"} />
                  </div>
                  <div className="flex gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-dark m-0">{dept.enrolled}</p>
                      <p className="text-[10px] text-muted m-0">enrolled</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold m-0 ${dept.utilization > 75 ? "text-sage" : dept.utilization > 65 ? "text-blue" : "text-gold"}`}>{dept.utilization}%</p>
                      <p className="text-[10px] text-muted m-0">utilization</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-dark m-0">{dept.satisfaction}</p>
                      <p className="text-[10px] text-muted m-0">rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ ROI & SAVINGS ════════════ */}
      {tab === "roi" && (
        <div>
          {/* Annual Savings Hero */}
          <Card className="!bg-gradient-to-br !from-dark !to-[#2d2d2d] text-white mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-2 m-0">Estimated Annual Impact</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-white m-0">${(employerROI.annualSavings / 1000000).toFixed(1)}M</p>
                  <div>
                    <Badge variant="sage">{employerROI.roiMultiple}x ROI</Badge>
                  </div>
                </div>
                <p className="text-sm text-white/50 mt-2 m-0">Combined savings from reduced turnover, lower absenteeism, and increased productivity</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-sage-soft m-0">{employerROI.turnoverReduction}%</p>
                  <p className="text-[10px] text-white/40 mt-0.5 m-0">Turnover Drop</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue m-0">{employerROI.absenteeismReduction}%</p>
                  <p className="text-[10px] text-white/40 mt-0.5 m-0">Less Absence</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold m-0">+{employerROI.productivityGain}h</p>
                  <p className="text-[10px] text-white/40 mt-0.5 m-0">Hrs/Qtr Gained</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <h4 className="font-serif text-base font-semibold text-dark mb-1">Turnover Rate</h4>
              <p className="text-xs text-muted mb-3 m-0">Caregiver employees (%)</p>
              <VitalsChart data={employerROI.monthlyTurnover} labels={MONTHS} color="sage" label="Turnover" />
              <div className="flex justify-between mt-3 pt-3 border-t border-border">
                <div><p className="text-[10px] text-muted m-0">Before</p><p className="text-sm font-bold text-danger m-0">{employerROI.turnoverBefore}%</p></div>
                <ChevronRight size={14} className="text-sage self-center" />
                <div className="text-right"><p className="text-[10px] text-muted m-0">Current</p><p className="text-sm font-bold text-sage m-0">{employerROI.turnoverAfter}%</p></div>
              </div>
            </Card>
            <Card>
              <h4 className="font-serif text-base font-semibold text-dark mb-1">Absenteeism</h4>
              <p className="text-xs text-muted mb-3 m-0">Days absent per year</p>
              <VitalsChart data={employerROI.monthlyAbsenteeism} labels={MONTHS} color="blue" label="Absent Days" />
              <div className="flex justify-between mt-3 pt-3 border-t border-border">
                <div><p className="text-[10px] text-muted m-0">Before</p><p className="text-sm font-bold text-danger m-0">{employerROI.absenteeismBefore}</p></div>
                <ChevronRight size={14} className="text-blue self-center" />
                <div className="text-right"><p className="text-[10px] text-muted m-0">Current</p><p className="text-sm font-bold text-blue m-0">{employerROI.absenteeismAfter}</p></div>
              </div>
            </Card>
            <Card>
              <h4 className="font-serif text-base font-semibold text-dark mb-1">Caregiver Burden</h4>
              <p className="text-xs text-muted mb-3 m-0">Burden Index (1-10 scale)</p>
              <VitalsChart data={employerROI.monthlyBurden} labels={MONTHS} color="gold" label="Burden" />
              <div className="flex justify-between mt-3 pt-3 border-t border-border">
                <div><p className="text-[10px] text-muted m-0">Before</p><p className="text-sm font-bold text-danger m-0">{employerROI.avgBurdenBefore}</p></div>
                <ChevronRight size={14} className="text-gold self-center" />
                <div className="text-right"><p className="text-[10px] text-muted m-0">Current</p><p className="text-sm font-bold text-gold m-0">{employerROI.avgBurdenAfter}</p></div>
              </div>
            </Card>
          </div>

          {/* Savings Breakdown */}
          <Card>
            <h3 className="font-serif text-lg font-semibold text-dark mb-5">Savings Methodology</h3>
            <div className="flex flex-col gap-4">
              {[
                { title: "Turnover Cost Reduction", formula: `${employerROI.turnoverReduction}% reduction × avg replacement cost ($92K) × ${Math.round(employerStats.enrolled * 0.34)} caregiver employees`, amount: "$540,000", color: "sage" },
                { title: "Absenteeism Savings", formula: `${employerROI.absenteeismReduction}% reduction × avg daily cost ($380) × ${employerROI.absenteeismBefore - employerROI.absenteeismAfter} fewer days × ${Math.round(employerStats.enrolled * 0.34)} employees`, amount: "$320,000", color: "blue" },
                { title: "Productivity Gains", formula: `${employerROI.productivityGain} extra hrs/qtr × $85/hr × ${Math.round(employerStats.enrolled * 0.34)} employees × 4 quarters`, amount: "$380,000", color: "gold" },
              ].map((s, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl bg-bg/50 border-l-4 border-l-${s.color}`}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-dark m-0">{s.title}</p>
                    <p className="text-[11px] text-muted mt-0.5 m-0">{s.formula}</p>
                  </div>
                  <p className={`text-lg font-bold text-${s.color} m-0 shrink-0`}>{s.amount}</p>
                </div>
              ))}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-dark text-white">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white m-0">Total Estimated Annual Savings</p>
                  <p className="text-[11px] text-white/50 mt-0.5 m-0">Based on {employerProfile.employees} total employees, {employerROI.caregiverPct}% caregiver rate</p>
                </div>
                <p className="text-2xl font-bold text-sage-soft m-0 shrink-0">${(employerROI.annualSavings / 1000000).toFixed(1)}M</p>
              </div>
            </div>
            <p className="text-[10px] text-light mt-4 m-0">
              Methodology validated against Harvard Business School employer caregiver research (Prof. Joseph Fuller) and AARP 2025 caregiver cost data.
            </p>
          </Card>
        </div>
      )}

      {/* ════════════ CAREGIVER BURDEN INDEX ════════════ */}
      {tab === "burden" && (
        <div>
          {/* CBI Overview */}
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={20} className="text-blue" />
                  <h3 className="font-serif text-xl font-semibold text-dark m-0">Caregiver Burden Index</h3>
                </div>
                <p className="text-sm text-mid font-light leading-relaxed m-0 max-w-lg">
                  Juni&apos;s proprietary workplace-adapted burden assessment measures the hidden cost of caregiving
                  across five dimensions. Based on the validated Zarit Burden Interview (ZBI-12), adapted for
                  the corporate context.
                </p>
              </div>
              <div className="text-center shrink-0">
                <p className="text-5xl font-bold text-blue m-0">{employerROI.avgBurdenAfter}</p>
                <p className="text-xs text-muted m-0">Current Avg</p>
                <Badge variant="sage" className="mt-1">-{employerROI.burdenReduction}% from {employerROI.avgBurdenBefore}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {caregiverBurdenIndex.dimensions.map((dim, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-dark m-0">{dim.name}</p>
                      <Badge variant="muted" className="!text-[9px]">{Math.round(dim.weight * 100)}% weight</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-danger line-through">{dim.before}</span>
                      <ChevronRight size={12} className="text-sage" />
                      <span className="text-xs text-sage font-bold">{dim.after}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-bg rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 bg-danger/15 rounded-full" style={{ width: `${dim.before * 10}%` }} />
                      <motion.div
                        initial={{ width: `${dim.before * 10}%` }}
                        animate={{ width: `${dim.after * 10}%` }}
                        transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-sage rounded-full"
                      />
                    </div>
                    <span className="text-[10px] text-muted w-10 text-right">
                      -{Math.round(((dim.before - dim.after) / dim.before) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-light mt-5 m-0">
              Scale: 1-10 (10 = highest burden) · Methodology: {caregiverBurdenIndex.methodology}
            </p>
          </Card>

          {/* Department Burden Comparison */}
          <Card className="mb-6">
            <h3 className="font-serif text-lg font-semibold text-dark mb-1">Burden by Department</h3>
            <p className="text-xs text-muted mb-5 m-0">Identify which teams need the most support</p>
            <div className="flex flex-col gap-3">
              {[...employerDepartments].sort((a, b) => b.burden - a.burden).map((dept, i) => {
                const level = dept.burden > 4.5 ? "High" : dept.burden > 3.5 ? "Medium" : "Low";
                const levelColor = dept.burden > 4.5 ? "danger" : dept.burden > 3.5 ? "amber" : "sage";
                return (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-bg/50">
                    <div className="w-32 sm:w-40">
                      <p className="text-sm font-semibold text-dark m-0 truncate">{dept.name}</p>
                    </div>
                    <div className="flex-1">
                      <ProgressBar value={dept.burden * 10} color={levelColor} height="h-2.5" />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-bold text-dark m-0">{dept.burden}</p>
                      <Badge variant={levelColor} className="!text-[9px] w-16 justify-center">{level}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Burden Trend */}
          <Card>
            <h3 className="font-serif text-lg font-semibold text-dark mb-1">Burden Index Trend</h3>
            <p className="text-xs text-muted mb-3 m-0">Company-wide average over 12 months</p>
            <VitalsChart data={employerROI.monthlyBurden} labels={MONTHS} color="blue" label="Burden Index" />
            <div className="mt-4 p-4 rounded-xl bg-sage-bg/50 border border-sage/15">
              <div className="flex items-start gap-2.5">
                <Sparkles size={14} className="text-sage shrink-0 mt-0.5" />
                <p className="text-[13px] text-mid leading-relaxed m-0">
                  <strong className="text-dark">Key Insight:</strong> Caregiver burden has decreased by {employerROI.burdenReduction}%
                  since program launch. The largest improvements are in <em>Work Productivity Impact</em> (-{Math.round(((caregiverBurdenIndex.dimensions[3].before - caregiverBurdenIndex.dimensions[3].after) / caregiverBurdenIndex.dimensions[3].before) * 100)}%) and <em>Financial Strain</em> (-{Math.round(((caregiverBurdenIndex.dimensions[2].before - caregiverBurdenIndex.dimensions[2].after) / caregiverBurdenIndex.dimensions[2].before) * 100)}%),
                  indicating Juni directly addresses the primary causes of workplace disruption.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ CLINICAL OUTCOMES ════════════ */}
      {tab === "outcomes" && (
        <div>
          <Card className="!bg-gradient-to-br !from-sage-bg !to-[#e8f5e8] !border-sage/15 mb-6">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-sage shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-dark mb-1 m-0">Clinical-Grade Health Outcomes</h3>
                <p className="text-sm text-mid font-light leading-relaxed m-0">
                  Unlike satisfaction-only metrics, Juni tracks real social health indicators for your employees&apos; parents.
                  These outcomes are measured per-visit using validated instruments and AI analysis.
                </p>
              </div>
            </div>
          </Card>

          {/* Outcome Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(employerClinicalOutcomes).map(([key, outcome]) => {
              const iconMap = { engagement: Activity, memory: Brain, mood: Heart, isolation: Users, hospitalization: Shield };
              const colorMap = { engagement: "sage", memory: "blue", mood: "gold", isolation: "purple", hospitalization: "sage" };
              const Icon = iconMap[key];
              const color = colorMap[key];
              const isDown = outcome.trend.startsWith("-");
              return (
                <Card key={key} className={`!border-l-4 !border-l-${color}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-${color}-bg flex items-center justify-center`}>
                        <Icon size={16} className={`text-${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-dark m-0 capitalize">{key === "hospitalization" ? "ER Visit Reduction" : key}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold text-${color} m-0`}>{outcome.current}%</p>
                      <Badge variant={isDown && key === "isolation" || key === "hospitalization" ? "sage" : "sage"} className="!text-[9px]">
                        {isDown ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {outcome.trend}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted leading-relaxed m-0">{outcome.desc}</p>
                </Card>
              );
            })}
          </div>

          {/* Legacy Vault Stats */}
          <Card className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-gold" />
              <h3 className="font-serif text-lg font-semibold text-dark m-0">Legacy Vault Impact</h3>
            </div>
            <p className="text-sm text-mid font-light leading-relaxed mb-5">
              Every visit creates a digital heirloom. Your employees&apos; parents are leaving behind
              stories, voice recordings, and life lessons that their families will treasure forever.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { v: "1,247", l: "Stories Captured", icon: BookOpen },
                { v: "342", l: "Audio Recordings", icon: Activity },
                { v: "89", l: "Life Lessons", icon: Star },
                { v: "98%", l: "Family Satisfaction", icon: Heart },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <s.icon size={18} className="text-gold mx-auto mb-2" />
                  <p className="text-xl font-bold text-dark m-0">{s.v}</p>
                  <p className="text-[10px] text-muted m-0">{s.l}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Comparison vs Industry */}
          <Card className="!bg-gradient-to-r !from-dark !to-[#2d2d2d] text-white">
            <h3 className="font-serif text-base font-semibold text-white mb-4 m-0">Juni vs. Industry Benchmarks</h3>
            <div className="flex flex-col gap-3">
              {[
                { metric: "Senior Engagement", juni: 87, industry: 62 },
                { metric: "Family Satisfaction", juni: 98, industry: 78 },
                { metric: "Memory Stability", juni: 68, industry: 41 },
                { metric: "Mood Improvement", juni: 82, industry: 55 },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-4">
                  <p className="text-xs text-white/60 w-32 sm:w-40 m-0">{b.metric}</p>
                  <div className="flex-1">
                    <div className="relative h-5 bg-white/5 rounded-full overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-white/10 rounded-full" style={{ width: `${b.industry}%` }} />
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.juni}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="absolute inset-y-0 left-0 bg-sage rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <p className="text-xs font-bold text-sage m-0">{b.juni}%</p>
                    <p className="text-xs text-white/30 m-0">{b.industry}%</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 mt-2 pt-3 border-t border-white/10">
                <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-sage" /><span className="text-[10px] text-white/40">Juni</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-2 rounded bg-white/10" /><span className="text-[10px] text-white/40">Industry Avg</span></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════ EMPLOYEES ════════════ */}
      {tab === "employees" && (
        <div>
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-dark m-0">Enrolled Employees</h3>
                <p className="text-xs text-muted mt-0.5 m-0">{employerEmployees.length} of {employerStats.enrolled} shown · Privacy-protected view</p>
              </div>
              <Button variant="secondary" size="sm"><Download size={12} /> Export CSV</Button>
            </div>

            <div className="flex flex-col gap-3">
              {employerEmployees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl border border-border hover:border-sage/30 hover:bg-sage-bg/20 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar initials={emp.name.split(" ").map(n => n[0]).join("")} size="md" color={emp.status === "Active" ? "sage" : "bg"} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-dark m-0">{emp.name}</p>
                          <Badge variant={emp.status === "Active" ? "sage" : "amber"} className="!text-[9px]">{emp.status}</Badge>
                        </div>
                        <p className="text-xs text-muted m-0">{emp.dept} · Enrolled {emp.enrolled}</p>
                      </div>
                    </div>
                    <div className="flex gap-5 flex-wrap shrink-0">
                      <div>
                        <p className="text-[10px] text-muted uppercase tracking-wider m-0">Parent</p>
                        <p className="text-sm font-semibold text-dark m-0">{emp.parent}, {emp.age}</p>
                      </div>
                      {emp.status === "Active" && (
                        <>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider m-0">Companion</p>
                            <p className="text-sm text-dark m-0">{emp.fellow}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider m-0">Kindred</p>
                            <p className={`text-sm font-bold m-0 ${emp.kindred > 90 ? "text-sage" : emp.kindred > 80 ? "text-blue" : "text-gold"}`}>{emp.kindred}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider m-0">Visits</p>
                            <p className="text-sm font-semibold text-dark m-0">{emp.visits}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider m-0">Mood</p>
                            <p className="text-sm text-dark m-0">{emp.mood}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted uppercase tracking-wider m-0">Legacy</p>
                            <p className="text-sm text-gold font-semibold m-0">{emp.legacy}</p>
                          </div>
                        </>
                      )}
                      {emp.status === "Onboarding" && (
                        <div className="flex items-center">
                          <Badge variant="amber" className="!text-[9px]">
                            <RefreshCw size={10} className="animate-spin" style={{ animationDuration: "3s" }} /> Matching in progress
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Safety Assurance */}
          <Card className="!bg-gradient-to-r !from-blue-bg !to-[#e3f2fd] !border-blue/15">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} className="text-blue shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-base font-semibold text-dark mb-1 m-0">Every Companion is Fully Vetted</h3>
                <p className="text-[13px] text-mid leading-relaxed m-0">
                  All {employerStats.activeParents} active parents are matched with Companions who have passed Juni&apos;s 9-layer
                  background screening across 1,300+ databases. Every Companion undergoes continuous monitoring,
                  annual re-screening, and monthly OIG exclusion checks. Your employees&apos; parents are in the safest hands in the industry.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
