import { cn } from "../../lib/utils";

const colorMap = {
  sage: "text-sage",
  blue: "text-blue",
  amber: "text-amber",
  gold: "text-gold",
  purple: "text-purple",
  danger: "text-danger",
  dark: "text-dark",
};

export default function Stat({ label, value, sub, color = "dark" }) {
  return (
    <div>
      <p className="text-[11px] text-light uppercase tracking-widest m-0">{label}</p>
      <p className={cn("text-xl font-bold mt-1 mb-0 font-sans", colorMap[color] || "text-dark")}>{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5 mb-0">{sub}</p>}
    </div>
  );
}
