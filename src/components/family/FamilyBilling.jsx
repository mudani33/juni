import { useState } from "react";
import { ArrowLeft, CreditCard, Download, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, Badge } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";

const invoices = [
  { d: "Feb 1, 2026", amt: "$1,280.00", s: "Paid" },
  { d: "Jan 1, 2026", amt: "$1,280.00", s: "Paid" },
  { d: "Dec 1, 2025", amt: "$1,280.00", s: "Paid" },
  { d: "Nov 1, 2025", amt: "$1,280.00", s: "Paid" },
];

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$640",
    per: "/mo",
    features: ["8 hours/month", "Per-visit Daily Bloom", "Text Legacy only", "Standard matching"],
    current: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$1,280",
    per: "/mo",
    features: ["16 hours/month", "Per-visit Daily Bloom", "Text + Audio Legacy", "Predictive Alerts", "Priority support"],
    current: true,
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$2,400",
    per: "/mo",
    features: ["Unlimited hours", "Real-time Daily Bloom", "Full Legacy Vault", "Predictive Alerts", "Dedicated care manager", "Partner integrations"],
    current: false,
  },
];

export default function FamilyBilling({ onBack }) {
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("premium");
  const [planChanged, setPlanChanged] = useState(false);

  const handleChangePlan = () => {
    if (selectedPlan !== "premium") {
      setPlanChanged(true);
      setShowPlans(false);
    }
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <CreditCard size={22} className="text-sage" /> Billing &amp; Plan
      </h2>

      {/* Current plan */}
      <Card className="mb-5 !bg-gradient-to-r !from-sage/5 !to-tan/8">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <Badge variant="sage">Premium Plan</Badge>
            <p className="text-sm text-mid mt-3 m-0">16 hours/month · Per-visit Daily Bloom · Text + Audio Legacy · Predictive Alerts</p>
            <p className="text-xs text-muted mt-2 m-0">Next billing: <strong className="text-dark">Mar 1, 2026 · $1,280.00</strong></p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setShowPlans(v => !v); setPlanChanged(false); }}
          >
            {showPlans ? "Hide Plans" : "Change Plan"}
          </Button>
        </div>

        {planChanged && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-sage-bg rounded-xl border border-sage/20">
            <CheckCircle2 size={15} className="text-sage" />
            <p className="text-sm text-sage font-medium m-0">Plan change requested — our team will confirm within 24 hours.</p>
          </div>
        )}
      </Card>

      {/* Plan selector */}
      {showPlans && (
        <div className="mb-5">
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4 m-0">Choose a plan</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {plans.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan === p.id
                    ? "border-sage bg-sage-bg/60"
                    : "border-border bg-warm-white hover:bg-bg"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-serif text-base font-semibold text-dark m-0">{p.name}</p>
                  {p.current && <Badge variant="sage" className="!text-[10px]">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-dark m-0">
                  {p.price}<span className="text-sm font-normal text-muted">{p.per}</span>
                </p>
                <ul className="mt-4 flex flex-col gap-2 list-none p-0 m-0">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-mid">
                      <CheckCircle2 size={11} className="text-sage shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Button
            variant="primary"
            size="sm"
            disabled={selectedPlan === "premium"}
            onClick={handleChangePlan}
          >
            {selectedPlan === "premium" ? "Current Plan" : `Switch to ${plans.find(p => p.id === selectedPlan)?.name}`}
          </Button>
        </div>
      )}

      {/* Payment method */}
      <Card className="mb-5">
        <h3 className="font-serif text-lg font-semibold mb-4 m-0">Payment Method</h3>
        <div className="flex justify-between items-center py-3 border-b border-bg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-gradient-to-r from-blue to-purple flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-dark m-0">Visa ending in 4892</p>
              <p className="text-xs text-muted mt-0.5 m-0">Expires 08/2028</p>
            </div>
          </div>
          <Badge variant="sage">Default</Badge>
        </div>
        <div className="mt-4">
          <Button variant="secondary" size="sm">
            <CreditCard size={13} /> Update Payment Method
          </Button>
        </div>
      </Card>

      {/* Invoices */}
      <Card>
        <h3 className="font-serif text-lg font-semibold mb-4 m-0">Recent Invoices</h3>
        {invoices.map((inv, i) => (
          <div key={i} className={`flex items-center py-3.5 gap-4 ${i < invoices.length - 1 ? "border-b border-bg" : ""}`}>
            <span className="text-sm text-dark flex-1">{inv.d}</span>
            <span className="text-sm font-semibold text-dark">{inv.amt}</span>
            <Badge variant="sage">{inv.s}</Badge>
            <button className="p-1.5 rounded-lg border border-border bg-transparent hover:bg-bg cursor-pointer transition-all">
              <Download size={13} className="text-muted" />
            </button>
          </div>
        ))}
      </Card>
    </PageWrapper>
  );
}
