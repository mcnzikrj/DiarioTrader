import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTrades } from "@/context/TradesContext";

const WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

type Tab = "pnl" | "events";

export default function TradingCalendar() {
  const { trades } = useTrades();
  const [tab, setTab] = useState<Tab>("pnl");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const map = new Map<string, { profit: number; revenue: number; fees: number; count: number }>();
    for (const t of trades) {
      const cur = map.get(t.date) ?? { profit: 0, revenue: 0, fees: 0, count: 0 };
      cur.profit += t.revenue - t.fees;
      cur.revenue += t.revenue;
      cur.fees += t.fees;
      cur.count += t.numTrades;
      map.set(t.date, cur);
    }
    return map;
  }, [trades]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const fmtMoney = (n: number) =>
    `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const dateKey = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));

  return (
    <section className="panel-tactical p-4 md:p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-lg uppercase tracking-wider">Trading Calendar</h3>
          <div className="flex items-center gap-1 bg-panel border border-grid p-1">
            <button
              onClick={() => setTab("pnl")}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === "pnl"
                  ? "bg-matrix text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PNL
            </button>
            <button
              onClick={() => setTab("events")}
              className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                tab === "events"
                  ? "bg-matrix text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Events
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 border border-grid hover:border-matrix hover:text-matrix transition-colors"
            aria-label="Mês anterior"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-mono-data text-sm min-w-[130px] text-center">
            {MONTHS_PT[month]} de {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 border border-grid hover:border-matrix hover:text-matrix transition-colors"
            aria-label="Próximo mês"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK.map((d) => (
          <div
            key={d}
            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center py-2 bg-panel"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) {
            return <div key={i} className="aspect-[16/10] bg-panel/40 border border-grid/40" />;
          }
          const key = dateKey(d);
          const data = tab === "pnl" ? byDate.get(key) : undefined;
          const has = !!data && data.count > 0;
          const positive = has && data!.profit >= 0;
          const winRate = has && data!.revenue > 0
            ? Math.max(0, Math.min(100, Math.round((data!.profit / data!.revenue) * 100)))
            : 0;

          return (
            <div
              key={i}
              className={`aspect-[16/10] border p-2 flex flex-col ${
                has
                  ? positive
                    ? "bg-matrix/10 border-matrix/40"
                    : "bg-alert/10 border-alert/40"
                  : "bg-panel border-grid"
              }`}
            >
              <div
                className={`text-xs font-mono ${
                  has ? (positive ? "text-matrix" : "text-alert") : "text-muted-foreground"
                } ${has ? "text-center font-bold" : ""}`}
              >
                {d}
              </div>
              {has && (
                <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                  <div
                    className={`font-mono-data text-sm font-bold ${
                      positive ? "text-matrix" : "text-alert"
                    }`}
                  >
                    {positive ? "" : "-"}${Math.abs(data!.profit).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div
                    className={`text-[10px] font-mono ${
                      positive ? "text-matrix/70" : "text-alert/70"
                    }`}
                  >
                    {winRate}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
