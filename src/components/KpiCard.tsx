import { ReactNode } from "react";

type Variant = "cyan" | "alert" | "matrix";

const variants: Record<Variant, { border: string; text: string; barTop?: string; glow?: string }> = {
  cyan: { border: "border-t-cyan/60", text: "text-cyan", barTop: "bg-cyan/30" },
  alert: { border: "border-t-alert/60", text: "text-alert", barTop: "bg-alert/40" },
  matrix: { border: "border-l-4 border-l-matrix", text: "text-matrix", glow: "text-glow-matrix" },
};

export default function KpiCard({
  label,
  value,
  variant,
  hint,
  hintLabel,
  badge,
}: {
  label: string;
  value: string;
  variant: Variant;
  hint?: string;
  hintLabel?: string;
  badge?: ReactNode;
}) {
  const v = variants[variant];
  const isMatrix = variant === "matrix";

  return (
    <div
      className={`bg-chassis border border-grid p-5 relative overflow-hidden ${
        isMatrix ? v.border : ""
      } ${isMatrix ? "shadow-[inset_0_0_40px_hsl(var(--matrix)/0.05)]" : ""}`}
    >
      {!isMatrix && (
        <div className={`absolute top-0 left-0 w-full h-[2px] ${v.barTop}`} />
      )}
      <div className="flex justify-between items-start mb-6">
        <span className={`text-xs font-bold tracking-widest uppercase ${v.text}`}>
          {label}
        </span>
        {badge}
      </div>
      <div
        className={`font-mono text-3xl md:text-4xl font-bold tracking-tighter ${
          isMatrix ? `${v.text} ${v.glow}` : "text-foreground"
        }`}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-3 font-mono text-[11px] flex justify-between items-center border-t border-grid pt-2 uppercase">
          <span className="text-muted-foreground">{hintLabel}</span>
          <span className={v.text}>{hint}</span>
        </div>
      )}
    </div>
  );
}
