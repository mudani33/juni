import { ArrowLeft, CreditCard } from "lucide-react";
import { Card, Badge } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";

const invoices = [
  { d: "Feb 1, 2026", amt: "$1,280.00", s: "Paid" },
  { d: "Jan 1, 2026", amt: "$1,280.00", s: "Paid" },
  { d: "Dec 1, 2025", amt: "$1,280.00", s: "Paid" },
];

export default function FamilyBilling({ onBack }) {
  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <CreditCard size={22} className="text-sage" /> Billing & Plan
      </h2>

      <Card className="mb-5 !bg-gradient-to-r !from-sage/5 !to-tan/8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <Badge variant="sage">Premium Plan</Badge>
            <p className="text-sm text-mid mt-3 m-0">16 hours/month · Per-visit Daily Bloom · Text + Audio Legacy · Predictive Alerts</p>
          </div>
          <Button variant="secondary" size="sm">Change Plan</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-serif text-lg font-semibold mb-4 m-0">Recent Invoices</h3>
        {invoices.map((inv, i) => (
          <div key={i} className={`flex justify-between items-center py-3.5 ${i < invoices.length - 1 ? "border-b border-bg" : ""}`}>
            <span className="text-sm text-dark">{inv.d}</span>
            <span className="text-sm font-semibold text-dark">{inv.amt}</span>
            <Badge variant="sage">{inv.s}</Badge>
          </div>
        ))}
      </Card>
    </PageWrapper>
  );
}
