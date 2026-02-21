import { useState } from "react";
import { ArrowLeft, MessageCircle, Send, CheckCircle2, Star, Calendar, AlertTriangle, Heart, ChevronDown, ChevronUp } from "lucide-react";
import { Card, Badge, Avatar } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";
import { seniorData } from "../../lib/constants";

const quickTypes = [
  { id: "schedule", icon: Calendar, label: "Schedule Request", color: "text-blue", bg: "bg-blue-bg", border: "border-blue/20", placeholder: "e.g. Could we move Tuesday's visit to Thursday at 2pm? We have a doctor's appointment…" },
  { id: "feedback", icon: Star, label: "Share Feedback", color: "text-gold", bg: "bg-gold-bg", border: "border-gold/20", placeholder: "e.g. Sarah has been wonderful — Maggie lights up every time she arrives. We especially loved the photo album session…" },
  { id: "concern", icon: AlertTriangle, label: "Share a Concern", color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", placeholder: "e.g. Maggie seemed more tired than usual this week. Could Sarah check in on her sleep routine?…" },
  { id: "request", icon: Heart, label: "Special Request", color: "text-sage", bg: "bg-sage-bg", border: "border-sage/20", placeholder: "e.g. Maggie's birthday is Feb 24 — would Sarah be able to bring a small treat or do something special?…" },
];

const pastMessages = [
  {
    id: 1,
    type: "feedback",
    label: "Feedback",
    badgeVariant: "gold",
    from: "You",
    date: "Feb 10, 2026",
    msg: "The visit notes this week were so detailed — it means everything to us. Sarah mentioned Maggie sang along to Dean Martin and we cried reading that. Thank you.",
    reply: { from: "Juni Team", date: "Feb 10, 2026", msg: "Thank you so much for sharing this. We've passed your kind words along to Sarah — she was thrilled to hear it." },
  },
  {
    id: 2,
    type: "schedule",
    label: "Schedule",
    badgeVariant: "blue",
    from: "You",
    date: "Jan 28, 2026",
    msg: "Could we add an extra hour to the Friday session? Maggie has been asking for longer visits.",
    reply: { from: "Juni Team", date: "Jan 29, 2026", msg: "Absolutely — the Friday Feb 14 visit has been extended to 3 hours. Sarah is looking forward to it!" },
  },
];

export default function FamilyFeedback({ onBack }) {
  const [selectedType, setSelectedType] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);

  const activeType = quickTypes.find(t => t.id === selectedType);

  const handleSend = () => {
    if (!message.trim() || !selectedType) return;
    setSubmitted(true);
    // persist to localStorage so companion can read (prototype simulation)
    const existing = JSON.parse(localStorage.getItem("juni_family_messages") || "[]");
    existing.unshift({
      type: selectedType,
      msg: message,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      from: "Family",
    });
    localStorage.setItem("juni_family_messages", JSON.stringify(existing));
  };

  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <h2 className="font-serif text-2xl font-semibold mb-2 m-0 flex items-center gap-2">
        <MessageCircle size={22} className="text-sage" /> Message &amp; Requests
      </h2>
      <p className="text-sm text-muted mb-7 m-0">
        Send a note to the Juni team or to {seniorData.fellow}. We relay your message within a few hours.
      </p>

      {submitted ? (
        <Card className="text-center !py-14">
          <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={28} className="text-sage" />
          </div>
          <h3 className="font-serif text-xl font-semibold text-dark mb-2 m-0">Message Sent</h3>
          <p className="text-sm text-muted font-light mb-6 m-0 max-w-xs mx-auto">
            {activeType?.label === "Share Feedback"
              ? "Thank you — your kind words have been forwarded to Sarah."
              : "We've received your message and will follow up within a few hours."}
          </p>
          <Button variant="primary" onClick={() => { setSubmitted(false); setMessage(""); setSelectedType(null); }}>
            Send Another
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Quick type selector */}
          <Card>
            <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4 m-0">What would you like to do?</p>
            <div className="grid grid-cols-2 gap-3">
              {quickTypes.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setSelectedType(t.id); setMessage(""); }}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all text-left font-sans ${
                    selectedType === t.id
                      ? `${t.bg} ${t.border} shadow-sm`
                      : "bg-warm-white border-border hover:bg-bg"
                  }`}
                >
                  <t.icon size={16} className={selectedType === t.id ? t.color : "text-muted"} />
                  <span className={`text-sm font-medium ${selectedType === t.id ? "text-dark" : "text-mid"}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          {/* Message composer */}
          {selectedType && (
            <Card className={`!border-l-[3px] ${activeType.border}`}>
              <div className="flex items-center gap-2 mb-4">
                <activeType.icon size={15} className={activeType.color} />
                <p className="text-sm font-semibold text-dark m-0">{activeType.label}</p>
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={activeType.placeholder}
                className="w-full min-h-[120px] p-0 border-none bg-transparent font-sans text-sm leading-relaxed text-dark resize-none outline-none placeholder:text-muted/50"
              />
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-bg">
                <div className="flex items-center gap-2">
                  <Avatar initials="SC" size="sm" color="sage" />
                  <p className="text-xs text-muted m-0">Will be forwarded to <span className="font-medium text-dark">{seniorData.fellow}</span></p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!message.trim()}
                  onClick={handleSend}
                >
                  <Send size={13} /> Send
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Past messages */}
      {pastMessages.length > 0 && (
        <div className="mt-8">
          <h3 className="font-serif text-lg font-semibold mb-4 m-0">Message History</h3>
          <div className="flex flex-col gap-3">
            {pastMessages.map(m => (
              <Card key={m.id} hover onClick={() => setExpandedMsg(expandedMsg === m.id ? null : m.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-start flex-1">
                    <Avatar initials="Y" size="sm" color="brown" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={m.badgeVariant} className="!text-[10px]">{m.label}</Badge>
                        <span className="text-xs text-muted">{m.date}</span>
                      </div>
                      <p className="text-sm text-mid font-light leading-relaxed m-0 line-clamp-2">{m.msg}</p>
                    </div>
                  </div>
                  {expandedMsg === m.id ? <ChevronUp size={14} className="text-muted shrink-0 mt-1" /> : <ChevronDown size={14} className="text-muted shrink-0 mt-1" />}
                </div>

                {expandedMsg === m.id && m.reply && (
                  <div className="mt-4 pt-4 border-t border-bg">
                    <div className="flex gap-3 items-start">
                      <Avatar initials="J" size="sm" color="sage" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-dark">{m.reply.from}</span>
                          <span className="text-xs text-muted">{m.reply.date}</span>
                        </div>
                        <p className="text-sm text-mid font-light leading-relaxed m-0">{m.reply.msg}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
