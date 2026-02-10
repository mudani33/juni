import { cn } from "../../lib/utils";

export default function Card({ children, className, onClick, hover, padding = "p-6" }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-warm-white rounded-2xl border border-border transition-all duration-250",
        padding,
        onClick && "cursor-pointer",
        hover && "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5",
        className,
      )}
    >
      {children}
    </div>
  );
}
