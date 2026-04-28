import { useState } from "react";
import TacticalHeader from "@/components/TacticalHeader";
import { useTrades } from "@/context/TradesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

export default function TradesPage() {
  const { trades, addTrade, removeTrade } = useTrades();
  const [date, setDate] = useState(today());
  const [numTrades, setNumTrades] = useState("");
  const [revenue, setRevenue] = useState("");
  const [fees, setFees] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !numTrades || revenue === "" || fees === "") {
      toast.error("Preencha todos os campos");
      return;
    }
    addTrade({
      date,
      numTrades: parseInt(numTrades, 10),
      revenue: parseFloat(revenue),
      fees: parseFloat(fees),
    });
    toast.success("Trade registrado", { description: `${date} • ${numTrades} ops` });
    setNumTrades("");
    setRevenue("");
    setFees("");
  };

  const sorted = [...trades].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="min-h-dvh p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto">
        <TacticalHeader />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <section className="lg:col-span-5 bg-chassis border border-grid">
            <div className="p-3 border-b border-grid bg-panel/50 flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">
                NEW_ENTRY // ADD_TRADE
              </h2>
              <span className="font-mono text-[10px] text-matrix bg-matrix/10 px-1.5 py-0.5 border border-matrix/20 uppercase">
                ARMED
              </span>
            </div>
            <form onSubmit={onSubmit} className="p-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="date" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Data
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-panel border-grid font-mono uppercase rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="num" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Nº de Trades no Dia
                </Label>
                <Input
                  id="num"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={numTrades}
                  onChange={(e) => setNumTrades(e.target.value)}
                  className="bg-panel border-grid font-mono rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rev" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Valor de Ganho ($)
                </Label>
                <Input
                  id="rev"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="bg-panel border-grid font-mono rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fee" className="text-[10px] uppercase tracking-widest font-bold text-alert font-mono">
                  Taxa de Operação ($)
                </Label>
                <Input
                  id="fee"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                  className="bg-panel border-grid font-mono rounded-none focus-visible:ring-alert focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                className="rounded-none bg-matrix text-background hover:bg-matrix/90 font-bold uppercase tracking-widest font-display"
              >
                Executar Registro
              </Button>
            </form>
          </section>

          <section className="lg:col-span-7 bg-chassis border border-grid flex flex-col">
            <div className="p-3 border-b border-grid bg-panel/50 flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">
                LEDGER // {trades.length} ENTRIES
              </h2>
              <span className="font-mono text-[10px] text-muted-foreground uppercase">SORT: DESC</span>
            </div>
            <div className="grid grid-cols-[110px_70px_1fr_1fr_36px] text-[10px] font-mono text-muted-foreground px-4 py-2 uppercase tracking-widest border-b border-grid bg-panel/30">
              <div>Data</div>
              <div className="text-right">Trades</div>
              <div className="text-right">Ganho</div>
              <div className="text-right">Taxa / Net</div>
              <div></div>
            </div>
            <div className="flex-1 overflow-auto max-h-[520px]">
              {sorted.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground uppercase tracking-widest font-mono">
                  // NO_DATA
                </div>
              )}
              {sorted.map((t) => {
                const net = t.revenue - t.fees;
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[110px_70px_1fr_1fr_36px] px-4 py-3 text-sm border-b border-grid/50 items-center hover:bg-panel/40 transition-colors font-mono"
                  >
                    <div className="text-muted-foreground text-xs">{t.date}</div>
                    <div className="text-right text-foreground">{t.numTrades}</div>
                    <div className={`text-right ${t.revenue >= 0 ? "text-matrix" : "text-alert"}`}>
                      {t.revenue >= 0 ? "+" : ""}${t.revenue.toFixed(2)}
                    </div>
                    <div className="text-right">
                      <div className="text-alert text-xs">-${t.fees.toFixed(2)}</div>
                      <div className={net >= 0 ? "text-matrix font-bold" : "text-alert font-bold"}>
                        {net >= 0 ? "+" : ""}${net.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeTrade(t.id)}
                      aria-label="Remover trade"
                      className="text-muted-foreground hover:text-alert transition-colors flex justify-end"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
