import { cn } from "../../lib/utils";

const variants = {
  primary: "bg-sage text-white shadow-md shadow-sage/25 hover:shadow-lg hover:shadow-sage/30 hover:-translate-y-px",
  secondary: "border border-border bg-transparent text-mid hover:bg-bg hover:text-dark",
  blue: "bg-blue text-white shadow-md shadow-blue/25 hover:shadow-lg hover:shadow-blue/30 hover:-translate-y-px",
  amber: "bg-amber text-white shadow-md shadow-amber/25 hover:shadow-lg hover:shadow-amber/30 hover:-translate-y-px",
  ghost: "bg-transparent text-muted hover:text-dark hover:bg-bg",
  danger: "bg-danger text-white shadow-md shadow-danger/25 hover:shadow-lg hover:shadow-danger/30",
  dark: "bg-dark text-white hover:bg-dark/90",
};

const sizes = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-xl",
  xl: "px-10 py-4.5 text-base rounded-xl",
};

export default function Button({ children, variant = "primary", size = "md", className, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold font-sans transition-all duration-200 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
