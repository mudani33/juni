import { ArrowLeft, Clock } from "lucide-react";
import { Card, Badge } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";
import { seniorData } from "../../lib/constants";

const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15", "Sun 16"];
const sched = [
  { d: 0, t: "10:00 AM", dur: "2h", type: "Regular visit" },
  { d: 2, t: "2:00 PM", dur: "2h", type: "Legacy recording" },
  { d: 4, t: "10:00 AM", dur: "2h", type: "Regular visit" },
];

export default function FamilySchedule({ onBack }) {
  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <Clock size={22} className="text-sage" /> Schedule & Visits
      </h2>

      <Card className="mb-5">
        <h3 className="font-serif text-lg font-semibold mb-5 m-0">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const v = sched.find(s => s.d === i);
            return (
              <div key={i} className={`py-3 px-2 rounded-xl text-center border transition-all ${
                v ? "bg-sage-bg border-sage/30" : "bg-warm-white border-border"
              }`}>
                <p className="text-[11px] text-muted m-0">{d.split(" ")[0]}</p>
                <p className="text-lg font-semibold text-dark my-1 m-0">{d.split(" ")[1]}</p>
                {v && <div className="w-1.5 h-1.5 rounded-full bg-sage mx-auto" />}
              </div>
            );
          })}
        </div>
      </Card>

      {sched.map((v, i) => (
        <Card key={i} className="mb-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-serif text-base font-semibold m-0">
                {days[v.d].split(" ")[0]} Feb {days[v.d].split(" ")[1]} · {v.t}
              </p>
              <p className="text-[13px] text-muted mt-1 m-0">{v.type} · {v.dur} with {seniorData.fellow}</p>
            </div>
            <Badge variant="sage">Scheduled</Badge>
          </div>
        </Card>
      ))}

      <Card className="mt-5 !bg-gradient-to-r !from-sage/5 !to-tan/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-serif text-base font-semibold m-0">Need additional hours?</p>
            <p className="text-[13px] text-muted mt-1 m-0">Premium plan: 16 hrs/mo. 10 used this month.</p>
          </div>
          <Button size="sm">Request Hours</Button>
        </div>
      </Card>
    </PageWrapper>
  );
}
