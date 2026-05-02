import { useTrades } from "@/context/TradesContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function WinLossChart() {
  const { filteredTrades } = useTrades();

  const data = [...filteredTrades]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => ({
      date: t.date.slice(5),
      pnl: +(t.revenue - t.fees).toFixed(2),
    }));

  const wins = data.filter((d) => d.pnl >= 0).length;
  const losses = data.length - wins;
  const winRate = data.length ? ((wins / data.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-chassis border border-grid flex flex-col">
      <div className="p-3 border-b border-grid flex justify-between items-center bg-panel/50">
        <h2 className="text-xs font-bold tracking-widest text-foreground uppercase">
          EXECUTION_MATRIX // WIN/LOSS
        </h2>
        <span className="font-mono text-[10px] text-muted-foreground uppercase">
          W:{wins} | L:{losses}
        </span>
      </div>
      <div className="p-4 flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke="hsl(var(--grid))" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
            <Tooltip
              cursor={{ fill: "hsl(var(--grid) / 0.5)" }}
              contentStyle={{
                background: "hsl(var(--panel))",
                border: "1px solid hsl(var(--grid))",
                fontFamily: "JetBrains Mono",
                fontSize: 11,
                textTransform: "uppercase",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(v: number) => [`$${v.toFixed(2)}`, "PNL"]}
            />
            <Bar dataKey="pnl">
              {data.map((d, i) => (
                <Cell key={i} fill={d.pnl >= 0 ? "hsl(var(--matrix))" : "hsl(var(--alert))"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-px bg-grid border-t border-grid">
        <div className="bg-chassis p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Win Rate</div>
          <div className="font-mono text-2xl text-matrix text-glow-matrix">{winRate}%</div>
        </div>
        <div className="bg-chassis p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Loss Rate</div>
          <div className="font-mono text-2xl text-alert">{(100 - +winRate).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
}
