import { cn } from "../../lib/utils";

const sizeMap = {
  sm: "w-7 h-7 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-xl",
  xl: "w-20 h-20 text-3xl",
};

const colorMap = {
  sage: "bg-sage text-white",
  blue: "bg-blue text-white",
  brown: "bg-gradient-to-br from-tan to-[#e8ddd0] text-brown",
  bg: "bg-bg text-brown",
  dark: "bg-dark text-white",
};

export default function Avatar({ initials, size = "md", color = "brown", className, onClick }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-full flex items-center justify-center font-serif font-semibold shrink-0",
        sizeMap[size],
        colorMap[color],
        onClick && "cursor-pointer hover:ring-2 hover:ring-sage/20 transition-all",
        className,
      )}
    >
      {initials}
    </div>
  );
}
