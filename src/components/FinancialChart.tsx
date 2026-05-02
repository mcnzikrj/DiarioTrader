import { useTrades } from "@/context/TradesContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FinancialChart() {
  const { filteredTrades } = useTrades();

  const sorted = [...filteredTrades].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  const data = sorted.map((t) => {
    cum += t.revenue - t.fees;
    return {
      date: t.date.slice(5),
      revenue: t.revenue,
      fees: t.fees,
      cum: +cum.toFixed(2),
    };
  });

  return (
    <div className="bg-chassis border border-grid flex flex-col">
      <div className="p-3 border-b border-grid flex justify-between items-center bg-panel/50">
        <h2 className="text-xs font-bold tracking-widest text-foreground uppercase">
          EQUITY_TRAJECTORY // CUMULATIVE
        </h2>
        <span className="font-mono text-[10px] text-cyan bg-cyan/10 px-1.5 py-0.5 border border-cyan/20 uppercase">
          AUTO_SCALE
        </span>
      </div>
      <div className="p-4 flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--matrix))" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(var(--matrix))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--grid))" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--panel))",
                border: "1px solid hsl(var(--grid))",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
                textTransform: "uppercase",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(v: number, n: string) => [`$${v.toFixed(2)}`, n]}
            />
            <Area
              type="monotone"
              dataKey="cum"
              stroke="hsl(var(--matrix))"
              strokeWidth={2}
              fill="url(#cumFill)"
              name="Equity"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
