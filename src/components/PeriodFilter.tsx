import { useTrades, type PeriodKey } from "@/context/TradesContext";

const OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1S" },
  { key: "1m", label: "1M" },
  { key: "all", label: "TOTAL" },
];

export default function PeriodFilter() {
  const { period, setPeriod } = useTrades();
  return (
    <div className="inline-flex border border-grid bg-panel/40">
      {OPTIONS.map((o) => {
        const active = period === o.key;
        return (
          <button
            key={o.key}
            onClick={() => setPeriod(o.key)}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors border-r border-grid last:border-r-0 ${
              active
                ? "bg-matrix/10 text-matrix"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
