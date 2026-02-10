import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Card, Badge, Avatar, ProgressBar } from "../ui";
import Button from "../ui/Button";
import PageWrapper from "../layout/PageWrapper";
import { seniorData } from "../../lib/constants";

export default function FamilyProfile({ onBack }) {
  return (
    <PageWrapper className="max-w-3xl mx-auto px-6 pt-6 pb-16">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-6 !text-sage">
        <ArrowLeft size={14} /> Back to Dashboard
      </Button>

      <Card className="mb-5">
        <div className="flex items-center gap-5 mb-7">
          <Avatar initials="M" size="xl" color="brown" />
          <div>
            <h2 className="font-serif text-3xl font-semibold text-dark m-0">{seniorData.nick}&apos;s Profile</h2>
            <p className="text-sm text-muted mt-1 m-0">{seniorData.name}, age {seniorData.age} · Since {seniorData.since}</p>
          </div>
        </div>

        <h3 className="font-serif text-lg font-semibold mb-4 m-0">Personality Insights</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
          {Object.entries(seniorData.personality).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between mb-1.5">
                <span className="text-[13px] font-medium text-mid">{k}</span>
                <span className="text-[13px] font-semibold text-sage">{v}%</span>
              </div>
              <ProgressBar value={v} />
            </div>
          ))}
        </div>

        <h3 className="font-serif text-lg font-semibold mb-3 m-0">Interests</h3>
        <div className="flex flex-wrap gap-2 mb-7">
          {seniorData.interests.map((x, i) => (
            <span key={i} className="px-4 py-1.5 bg-bg rounded-full text-[13px] text-brown font-medium">{x}</span>
          ))}
        </div>

        <h3 className="font-serif text-lg font-semibold mb-2 m-0">Daily Routines</h3>
        <p className="text-sm text-mid leading-relaxed font-light mb-7 m-0">{seniorData.routines}</p>

        <h3 className="font-serif text-lg font-semibold mb-2 m-0">Communication Style</h3>
        <p className="text-sm text-mid leading-relaxed font-light m-0">{seniorData.commStyle}</p>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-lg font-semibold m-0">Kindred Match</h3>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted">Score</span>
            <span className="text-2xl font-bold text-sage">{seniorData.kindred}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Avatar initials="SC" size="md" color="sage" />
          <div>
            <p className="text-base font-semibold text-dark m-0">{seniorData.fellow}</p>
            <p className="text-[13px] text-muted mt-1 m-0">
              Matched on personality, shared love of Italian culture, and storytelling orientation
            </p>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
}
