import { useState } from "react";
import { ArrowLeft, Clock, CheckCircle2, X, CalendarPlus } from "lucide-react";
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

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
const durations = ["1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"];
const visitTypes = ["Regular visit", "Legacy recording", "Outdoor activity", "Medical accompaniment"];

export default function FamilySchedule({ onBack }) {
  const [requestingHours, setRequestingHours] = useState(false);
  const [hoursSubmitted, setHoursSubmitted] = useState(false);
  const [requestingVisit, setRequestingVisit] = useState(false);
  const [visitSubmitted, setVisitSubmitted] = useState(false);

  // Request hours form
  const [hoursForm, setHoursForm] = useState({ hours: "2", reason: "" });

  // New visit form
  const [visitForm, setVisitForm] = useState({ day: "", time: "10:00 AM", dur: "2 hours", type: "Regular visit" });

  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-6 m-0 flex items-center gap-2">
        <Clock size={22} className="text-sage" /> Schedule &amp; Visits
      </h2>

      {/* Weekly calendar */}
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

      {/* Scheduled visits */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold m-0">Upcoming Visits</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => { setRequestingVisit(v => !v); setVisitSubmitted(false); }}
        >
          <CalendarPlus size={13} /> Request Visit
        </Button>
      </div>

      {/* Request new visit form */}
      {requestingVisit && (
        <Card className="mb-4 !border-sage/20 !bg-sage-bg/30">
          {visitSubmitted ? (
            <div className="flex items-center gap-2 py-2">
              <CheckCircle2 size={15} className="text-sage" />
              <p className="text-sm text-sage font-medium m-0">Visit request sent — {seniorData.fellow} will confirm shortly.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-dark mb-4 m-0">Request a New Visit</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Day</label>
                  <select
                    value={visitForm.day}
                    onChange={e => setVisitForm({ ...visitForm, day: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage/50"
                  >
                    <option value="">Pick a day…</option>
                    {days.map(d => <option key={d} value={d}>{d.split(" ")[0]} Feb {d.split(" ")[1]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Time</label>
                  <select
                    value={visitForm.time}
                    onChange={e => setVisitForm({ ...visitForm, time: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage/50"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Duration</label>
                  <select
                    value={visitForm.dur}
                    onChange={e => setVisitForm({ ...visitForm, dur: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage/50"
                  >
                    {durations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark mb-1.5">Visit type</label>
                  <select
                    value={visitForm.type}
                    onChange={e => setVisitForm({ ...visitForm, type: e.target.value })}
                    className="w-full p-2.5 border border-border rounded-lg text-sm font-sans bg-warm-white text-dark outline-none focus:border-sage/50"
                  >
                    {visitTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!visitForm.day}
                  onClick={() => setVisitSubmitted(true)}
                >
                  Submit Request
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setRequestingVisit(false)}>
                  Cancel
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {sched.map((v, i) => (
        <Card key={i} className="mb-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-serif text-base font-semibold m-0">
                {days[v.d].split(" ")[0]} Feb {days[v.d].split(" ")[1]} · {v.t}
              </p>
              <p className="text-[13px] text-muted mt-1 m-0">{v.type} · {v.dur} with {seniorData.fellow}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="sage">Scheduled</Badge>
              <button
                className="p-1.5 rounded-lg border border-border bg-transparent hover:bg-gold-bg hover:border-gold/30 cursor-pointer transition-all group"
                title="Cancel visit"
              >
                <X size={12} className="text-muted group-hover:text-gold" />
              </button>
            </div>
          </div>
        </Card>
      ))}

      {/* Request additional hours */}
      <Card className="mt-5 !bg-gradient-to-r !from-sage/5 !to-tan/10">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <p className="font-serif text-base font-semibold m-0">Need additional hours?</p>
            <p className="text-[13px] text-muted mt-1 m-0">Premium plan: 16 hrs/mo. 10 used this month.</p>
          </div>
          {!requestingHours && !hoursSubmitted && (
            <Button size="sm" onClick={() => setRequestingHours(true)}>
              Request Hours
            </Button>
          )}
        </div>

        {hoursSubmitted ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-sage-bg rounded-xl border border-sage/20 mt-4">
            <CheckCircle2 size={15} className="text-sage" />
            <p className="text-sm text-sage font-medium m-0">
              Request for {hoursForm.hours} extra hours sent — we'll confirm within a few hours.
            </p>
          </div>
        ) : requestingHours ? (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-dark whitespace-nowrap">Extra hours:</label>
              {["1", "2", "4", "8"].map(h => (
                <button
                  key={h}
                  onClick={() => setHoursForm({ ...hoursForm, hours: h })}
                  className={`px-4 py-1.5 rounded-lg border text-sm font-semibold font-sans cursor-pointer transition-all ${
                    hoursForm.hours === h
                      ? "bg-sage text-white border-sage"
                      : "bg-warm-white text-mid border-border hover:bg-bg"
                  }`}
                >
                  +{h}h
                </button>
              ))}
            </div>
            <textarea
              value={hoursForm.reason}
              onChange={e => setHoursForm({ ...hoursForm, reason: e.target.value })}
              placeholder="Any context? (optional)"
              className="w-full min-h-[60px] p-3 border border-border rounded-xl bg-warm-white font-sans text-sm text-dark resize-none outline-none placeholder:text-muted/50 focus:border-sage/40"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => { setHoursSubmitted(true); setRequestingHours(false); }}
              >
                Submit Request
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setRequestingHours(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </PageWrapper>
  );
}
