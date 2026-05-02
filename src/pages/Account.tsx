import { useMemo, useState } from "react";
import TacticalHeader from "@/components/TacticalHeader";
import { useTrades, type PeriodKey } from "@/context/TradesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

const fmt = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1S" },
  { key: "1m", label: "1M" },
  { key: "all", label: "TOTAL" },
];

const periodStart = (p: PeriodKey): string | null => {
  if (p === "all") return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === "1w") d.setDate(d.getDate() - 6);
  if (p === "1m") d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
};

export default function AccountPage() {
  const {
    transactions,
    addTransaction,
    removeTransaction,
    balance,
    totalDeposits,
    totalWithdrawals,
  } = useTrades();

  const [type, setType] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<PeriodKey>("all");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    if (type === "withdraw" && value > balance) {
      toast.error("Saldo insuficiente", {
        description: `Saldo atual: ${fmt(balance)}`,
      });
      return;
    }
    await addTransaction({ type, amount: value, date, note: note || null });
    toast.success(type === "deposit" ? "Depósito registrado" : "Saque registrado", {
      description: `${fmt(value)} • ${date}`,
    });
    setAmount("");
    setNote("");
  };

  const filtered = useMemo(() => {
    const start = periodStart(filter);
    if (!start) return transactions;
    return transactions.filter((t) => t.date >= start);
  }, [transactions, filter]);

  const filteredWithdrawals = useMemo(
    () => filtered.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const filteredDeposits = useMemo(
    () => filtered.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  return (
    <main className="min-h-dvh p-4 md:p-8">
      <div className="max-w-[1440px] mx-auto">
        <TacticalHeader />

        {/* KPIs da conta */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-chassis border border-grid p-5 border-l-4 border-l-cyan/60">
            <div className="text-xs font-bold tracking-widest uppercase text-cyan mb-4">
              Saldo Disponível
            </div>
            <div className="font-mono text-3xl font-bold tracking-tighter text-foreground">
              {balance >= 0 ? fmt(balance) : `-${fmt(Math.abs(balance))}`}
            </div>
          </div>
          <div className="bg-chassis border border-grid p-5 border-l-4 border-l-matrix/60">
            <div className="text-xs font-bold tracking-widest uppercase text-matrix mb-4">
              Total Depositado
            </div>
            <div className="font-mono text-3xl font-bold tracking-tighter text-foreground">
              {fmt(totalDeposits)}
            </div>
          </div>
          <div className="bg-chassis border border-grid p-5 border-l-4 border-l-alert/60">
            <div className="text-xs font-bold tracking-widest uppercase text-alert mb-4">
              Total Sacado
            </div>
            <div className="font-mono text-3xl font-bold tracking-tighter text-foreground">
              {fmt(totalWithdrawals)}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Form */}
          <section className="lg:col-span-5 bg-chassis border border-grid">
            <div className="p-3 border-b border-grid bg-panel/50 flex justify-between items-center">
              <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">
                NOVA_TRANSAÇÃO
              </h2>
              <span className="font-mono text-[10px] text-matrix bg-matrix/10 px-1.5 py-0.5 border border-matrix/20 uppercase">
                ARMED
              </span>
            </div>

            <form onSubmit={onSubmit} className="p-5 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("deposit")}
                  className={`flex items-center justify-center gap-2 py-3 border font-bold uppercase tracking-widest text-xs font-mono transition-colors ${
                    type === "deposit"
                      ? "bg-matrix/10 text-matrix border-matrix"
                      : "bg-panel border-grid text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowDownCircle className="size-4" />
                  Depósito
                </button>
                <button
                  type="button"
                  onClick={() => setType("withdraw")}
                  className={`flex items-center justify-center gap-2 py-3 border font-bold uppercase tracking-widest text-xs font-mono transition-colors ${
                    type === "withdraw"
                      ? "bg-alert/10 text-alert border-alert"
                      : "bg-panel border-grid text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ArrowUpCircle className="size-4" />
                  Saque
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="adate" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Data
                </Label>
                <Input
                  id="adate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-panel border-grid font-mono uppercase rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="amount" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Valor ($)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-panel border-grid font-mono rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="note" className="text-[10px] uppercase tracking-widest font-bold text-cyan font-mono">
                  Nota (opcional)
                </Label>
                <Input
                  id="note"
                  type="text"
                  placeholder="Ex: PIX corretora"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-panel border-grid font-mono rounded-none focus-visible:ring-matrix focus-visible:ring-1 focus-visible:ring-offset-0"
                />
              </div>

              <Button
                type="submit"
                className="rounded-none bg-matrix text-background hover:bg-matrix/90 font-bold uppercase tracking-widest"
              >
                Confirmar
              </Button>
            </form>
          </section>

          {/* Histórico */}
          <section className="lg:col-span-7 bg-chassis border border-grid flex flex-col">
            <div className="p-3 border-b border-grid bg-panel/50 flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-xs font-bold tracking-widest uppercase text-foreground">
                HISTÓRICO // {filtered.length}
              </h2>
              <div className="inline-flex border border-grid">
                {PERIODS.map((p) => {
                  const active = filter === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setFilter(p.key)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest font-mono border-r border-grid last:border-r-0 ${
                        active ? "bg-matrix/10 text-matrix" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-grid border-b border-grid">
              <div className="bg-chassis p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Depósitos no período</div>
                <div className="font-mono text-lg text-matrix">{fmt(filteredDeposits)}</div>
              </div>
              <div className="bg-chassis p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Saques no período</div>
                <div className="font-mono text-lg text-alert">{fmt(filteredWithdrawals)}</div>
              </div>
            </div>

            <div className="flex-1 overflow-auto max-h-[520px]">
              {filtered.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground uppercase tracking-widest font-mono">
                  // SEM_TRANSAÇÕES
                </div>
              )}
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[110px_90px_1fr_36px] px-4 py-3 text-sm border-b border-grid/50 items-center hover:bg-panel/40 transition-colors font-mono gap-2"
                >
                  <div className="text-muted-foreground text-xs">{t.date}</div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 border w-fit ${
                      t.type === "deposit"
                        ? "text-matrix border-matrix/30 bg-matrix/10"
                        : "text-alert border-alert/30 bg-alert/10"
                    }`}
                  >
                    {t.type === "deposit" ? "Depósito" : "Saque"}
                  </div>
                  <div className="flex flex-col text-right">
                    <span className={t.type === "deposit" ? "text-matrix font-bold" : "text-alert font-bold"}>
                      {t.type === "deposit" ? "+" : "-"}
                      {fmt(t.amount)}
                    </span>
                    {t.note && <span className="text-[10px] text-muted-foreground">{t.note}</span>}
                  </div>
                  <button
                    onClick={() => removeTransaction(t.id)}
                    aria-label="Remover"
                    className="text-muted-foreground hover:text-alert transition-colors flex justify-end"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
