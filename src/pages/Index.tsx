import TacticalHeader from "@/components/TacticalHeader";
import KpiCard from "@/components/KpiCard";
import WinLossChart from "@/components/WinLossChart";
import FinancialChart from "@/components/FinancialChart";
import PeriodFilter from "@/components/PeriodFilter";
import { useTrades } from "@/context/TradesContext";

const fmt = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Index() {
  const { totals, balance } = useTrades();
  const feesPct = totals.revenue !== 0 ? ((totals.fees / Math.abs(totals.revenue)) * 100).toFixed(2) : "0.00";

  return (
    <main className="min-h-dvh p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto">
        <TacticalHeader />

        <h2 className="sr-only">Dashboard Day Trader</h2>

        {/* Saldo - sempre total, não filtrado */}
        <section className="mb-4">
          <KpiCard
            label="Saldo da Conta"
            value={`${balance >= 0 ? "" : "-"}$${Math.abs(balance).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            variant="cyan"
            hintLabel="Depósitos + Lucro − Saques"
            hint="TOTAL"
            badge={
              <span className="font-mono text-[10px] bg-cyan/10 text-cyan px-1.5 py-0.5 border border-cyan/20 uppercase">
                BALANCE
              </span>
            }
          />
        </section>

        {/* Filtro de período para os 3 KPIs abaixo */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            // PERÍODO
          </span>
          <PeriodFilter />
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <KpiCard
            label="Faturamento"
            value={fmt(totals.revenue)}
            variant="cyan"
            hintLabel="Sessões"
            hint={`${totals.trades} TRADES`}
            badge={
              <span className="font-mono text-[10px] bg-cyan/10 text-cyan px-1.5 py-0.5 border border-cyan/20 uppercase">
                GROSS
              </span>
            }
          />
          <KpiCard
            label="Pago em Taxas"
            value={`-${fmt(totals.fees).replace("-", "")}`}
            variant="alert"
            hintLabel="% sobre faturamento"
            hint={`${feesPct}%`}
            badge={
              <span className="font-mono text-[10px] bg-alert/10 text-alert px-1.5 py-0.5 border border-alert/20 uppercase">
                COST
              </span>
            }
          />
          <KpiCard
            label="Lucro"
            value={`${totals.profit >= 0 ? "+" : ""}${fmt(totals.profit)}`}
            variant="matrix"
            hintLabel="Net Realizado"
            hint="LIVE"
            badge={
              <div className="flex gap-1">
                <div className="w-1 h-3 bg-matrix/20" />
                <div className="w-1 h-3 bg-matrix/60" />
                <div className="w-1 h-3 bg-matrix" style={{ boxShadow: "0 0 8px hsl(var(--matrix))" }} />
              </div>
            }
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <WinLossChart />
          <FinancialChart />
        </section>
      </div>
    </main>
  );
}
