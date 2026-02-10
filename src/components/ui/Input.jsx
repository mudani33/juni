import { cn } from "../../lib/utils";

export function Input({ label, className, ...props }) {
  return (
    <div>
      {label && <label className="block text-[13px] font-medium text-mid mb-1.5">{label}</label>}
      <input
        className={cn(
          "w-full py-3.5 px-4.5 rounded-xl border border-border font-sans text-sm text-dark bg-warm-white",
          "outline-none transition-all duration-200",
          "focus:border-sage focus:ring-2 focus:ring-sage/10",
          "placeholder:text-light",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function TextArea({ label, className, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-dark mb-2">{label}</label>}
      <textarea
        className={cn(
          "w-full py-4 px-5 rounded-xl border border-border font-sans text-sm text-txt bg-warm-white",
          "outline-none transition-all duration-200 resize-vertical leading-relaxed",
          "focus:border-sage focus:ring-2 focus:ring-sage/10",
          "placeholder:text-light",
          "min-h-[100px]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, className, ...props }) {
  return (
    <div>
      {label && <label className="block text-[13px] font-medium text-mid mb-1.5">{label}</label>}
      <select
        className={cn(
          "w-full py-3.5 px-4.5 rounded-xl border border-border font-sans text-sm text-dark bg-warm-white",
          "outline-none transition-all duration-200 cursor-pointer",
          "focus:border-sage focus:ring-2 focus:ring-sage/10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
