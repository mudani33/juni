export default function SentimentArc({ value }) {
  const r = 44;
  const circ = Math.PI * r;
  const off = circ - (value * circ);

  return (
    <svg width="100" height="58" viewBox="0 0 100 58">
      <path d="M 6 54 A 44 44 0 0 1 94 54" fill="none" className="stroke-bg" strokeWidth="6" strokeLinecap="round" />
      <path d="M 6 54 A 44 44 0 0 1 94 54" fill="none" className="stroke-sage" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      <text x="50" y="48" textAnchor="middle" className="fill-dark font-sans" fontSize="18" fontWeight="700">
        {Math.round(value * 100)}
      </text>
    </svg>
  );
}
