import { cn } from "../../lib/utils";

const variants = {
  sage: "bg-sage-bg text-sage",
  blue: "bg-blue-bg text-blue",
  amber: "bg-amber-bg text-amber",
  purple: "bg-purple-bg text-purple",
  gold: "bg-gold-bg text-gold",
  danger: "bg-danger-bg text-danger",
  brown: "bg-bg text-brown",
  muted: "bg-bg text-muted",
  dark: "bg-dark text-white",
};

export default function Badge({ children, variant = "sage", className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap tracking-wide",
      variants[variant] || variants.sage,
      className,
    )}>
      {children}
    </span>
  );
}
