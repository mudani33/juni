import { useState } from "react";
import { ArrowLeft, Calendar, Clock, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, Badge, Avatar } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";
import { fellowSeniors } from "../../lib/constants";

const days = ["Mon 10", "Tue 11", "Wed 12", "Thu 13", "Fri 14", "Sat 15", "Sun 16"];

const upcomingVisits = [
  { seniorId: 1, seniorName: "Maggie", seniorAge: 78, day: 0, dayLabel: "Mon, Feb 10", time: "10:00 AM", dur: "2h", type: "Regular visit", status: "confirmed" },
  { seniorId: 2, seniorName: "Bob", seniorAge: 83, day: 2, dayLabel: "Wed, Feb 12", time: "2:00 PM", dur: "2h", type: "Legacy recording", status: "confirmed" },
  { seniorId: 1, seniorName: "Maggie", seniorAge: 78, day: 4, dayLabel: "Fri, Feb 14", time: "10:00 AM", dur: "2h", type: "Regular visit", status: "confirmed" },
  { seniorId: 3, seniorName: "Ellie", seniorAge: 71, day: 6, dayLabel: "Sun, Feb 16", time: "3:00 PM", dur: "1.5h", type: "Regular visit", status: "pending" },
];

const visitDays = new Set(upcomingVisits.map(v => v.day));

const seniorColors = { 1: "brown", 2: "blue", 3: "sage" };

export default function CompanionSchedule({ onBack }) {
  const [requestingOff, setRequestingOff] = useState(false);
  const [offReason, setOffReason] = useState("");
  const [offSubmitted, setOffSubmitted] = useState(false);

  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-blue">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <Calendar size={22} className="text-blue" /> My Schedule
      </h2>

      {/* This week calendar */}
      <Card className="mb-5">
        <h3 className="font-serif text-lg font-semibold mb-5 m-0">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const hasVisit = visitDays.has(i);
            const count = upcomingVisits.filter(v => v.day === i).length;
            return (
              <div key={i} className={`py-3 px-1 rounded-xl text-center border transition-all ${
                hasVisit ? "bg-blue-bg border-blue/20" : "bg-warm-white border-border"
              }`}>
                <p className="text-[11px] text-muted m-0">{d.split(" ")[0]}</p>
                <p className="text-lg font-semibold text-dark my-1 m-0">{d.split(" ")[1]}</p>
                {hasVisit && (
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: count }).map((_, ci) => (
                      <div key={ci} className="w-1.5 h-1.5 rounded-full bg-blue" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Upcoming visits */}
      <h3 className="font-serif text-lg font-semibold mb-4 m-0">Upcoming Visits</h3>
      <div className="flex flex-col gap-3 mb-6">
        {upcomingVisits.map((v, i) => (
          <Card key={i} hover>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar initials={v.seniorName[0]} size="md" color={seniorColors[v.seniorId]} />
                <div>
                  <p className="font-serif text-base font-semibold text-dark m-0">{v.seniorName}</p>
                  <p className="text-[13px] text-muted mt-0.5 m-0">
                    {v.dayLabel} · {v.time} · {v.dur}
                  </p>
                  <p className="text-xs text-light mt-0.5 m-0">{v.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={v.status === "confirmed" ? "sage" : "gold"}>
                  {v.status === "confirmed" ? (
                    <><CheckCircle2 size={11} /> Confirmed</>
                  ) : "Pending"}
                </Badge>
                <button className="p-2 rounded-lg border border-border bg-transparent hover:bg-bg cursor-pointer transition-all">
                  <ChevronRight size={14} className="text-muted" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Hours summary */}
      <Card className="mb-5 !bg-gradient-to-r !from-blue/5 !to-sage/3">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="font-serif text-base font-semibold m-0">This Month</p>
            <p className="text-[13px] text-muted mt-1 m-0">12 of est. 18 hours · 6 visits completed</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-xl font-bold text-blue m-0">12</p>
              <p className="text-[10px] text-muted m-0">hrs done</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-sage m-0">6</p>
              <p className="text-[10px] text-muted m-0">remaining</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Request time off */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-serif text-base font-semibold m-0">Need Time Off?</p>
            <p className="text-xs text-muted mt-1 m-0">Let your coordinator know in advance so families can plan.</p>
          </div>
          {!requestingOff && !offSubmitted && (
            <Button variant="secondary" size="sm" onClick={() => setRequestingOff(true)}>
              <Clock size={13} /> Request Time Off
            </Button>
          )}
        </div>

        {offSubmitted ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-sage-bg rounded-xl border border-sage/20 mt-2">
            <CheckCircle2 size={15} className="text-sage" />
            <p className="text-sm text-sage font-medium m-0">Request submitted — your coordinator will follow up shortly.</p>
          </div>
        ) : requestingOff ? (
          <div className="mt-3 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark mb-1.5">Dates &amp; reason</label>
              <textarea
                value={offReason}
                onChange={e => setOffReason(e.target.value)}
                placeholder="e.g. Feb 20–22, family commitment…"
                className="w-full min-h-[80px] p-3 border border-border rounded-xl bg-warm-white font-sans text-sm text-dark resize-none outline-none placeholder:text-muted/50 focus:border-blue/40 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="blue" size="sm" onClick={() => { setOffSubmitted(true); setRequestingOff(false); }}>
                Submit Request
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRequestingOff(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </PageWrapper>
  );
}
