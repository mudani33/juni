import { cn } from "../../lib/utils";

export default function TabNav({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 mb-6 bg-bg rounded-xl p-1">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-[13px] font-sans transition-all duration-200 cursor-pointer border-none",
            active === t.id
              ? "bg-warm-white text-dark font-semibold shadow-sm"
              : "bg-transparent text-muted font-normal hover:text-mid",
          )}
        >
          {t.icon && <span className="text-sm">{t.icon}</span>}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
