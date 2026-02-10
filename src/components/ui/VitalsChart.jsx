import { cn } from "../../lib/utils";

const colorMap = {
  sage: { bar: "bg-sage", barFaded: "bg-sage/25", text: "text-sage" },
  gold: { bar: "bg-gold", barFaded: "bg-gold/25", text: "text-gold" },
  purple: { bar: "bg-purple", barFaded: "bg-purple/25", text: "text-purple" },
  blue: { bar: "bg-blue", barFaded: "bg-blue/25", text: "text-blue" },
  amber: { bar: "bg-amber", barFaded: "bg-amber/25", text: "text-amber" },
};

export default function VitalsChart({ data, labels, color = "sage", label }) {
  const mx = Math.max(...data);
  const colors = colorMap[color] || colorMap.sage;

  return (
    <div className="w-full">
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-serif text-[15px] font-semibold text-dark">{label}</span>
        <span className={cn("font-sans text-2xl font-bold", colors.text)}>{data[data.length - 1]}%</span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn("w-full rounded-sm transition-all duration-600",
                i === data.length - 1 ? colors.bar : colors.barFaded
              )}
              style={{ height: `${(v / mx) * 56}px` }}
            />
            <span className="text-[9px] text-muted font-sans">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
