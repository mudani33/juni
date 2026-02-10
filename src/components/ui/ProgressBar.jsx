import { cn } from "../../lib/utils";

const colorMap = {
  sage: "bg-sage",
  blue: "bg-blue",
  amber: "bg-amber",
  gold: "bg-gold",
  purple: "bg-purple",
  danger: "bg-danger",
};

export default function ProgressBar({ value, color = "sage", height = "h-1.5", className }) {
  return (
    <div className={cn("w-full rounded-full bg-bg", height, className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-800 ease-out", colorMap[color] || "bg-sage")}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
