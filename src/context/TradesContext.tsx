import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/sonner";

export type Trade = {
  id: string;
  date: string;
  numTrades: number;
  revenue: number;
  fees: number;
};

export type AccountTx = {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  date: string;
  note: string | null;
};

export type PeriodKey = "1d" | "1w" | "1m" | "all";

type Totals = { revenue: number; fees: number; profit: number; trades: number };

type TradesContextType = {
  trades: Trade[];
  transactions: AccountTx[];
  session: Session | null;
  loading: boolean;
  addTrade: (t: Omit<Trade, "id">) => Promise<void>;
  removeTrade: (id: string) => Promise<void>;
  addTransaction: (t: Omit<AccountTx, "id">) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  totals: Totals;
  totalsAll: Totals;
  filteredTrades: Trade[];
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
  // Account
  totalDeposits: number;
  totalWithdrawals: number;
  balance: number; // deposits - withdrawals + profit (all-time)
};

const TradesContext = createContext<TradesContextType | null>(null);

const periodStartDate = (p: PeriodKey): Date | null => {
  if (p === "all") return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === "1d") return d;
  if (p === "1w") {
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (p === "1m") {
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  return null;
};

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<AccountTx[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>("all");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setTrades([]);
      setTransactions([]);
      return;
    }
    (async () => {
      const [tradesRes, txRes] = await Promise.all([
        supabase.from("trades").select("*").order("date", { ascending: true }),
        supabase.from("account_transactions").select("*").order("date", { ascending: false }),
      ]);
      if (tradesRes.error) toast.error("Erro ao carregar trades");
      else
        setTrades(
          (tradesRes.data ?? []).map((r: any) => ({
            id: r.id,
            date: r.date,
            numTrades: r.num_trades,
            revenue: Number(r.revenue),
            fees: Number(r.fees),
          }))
        );
      if (txRes.error) toast.error("Erro ao carregar transações");
      else
        setTransactions(
          (txRes.data ?? []).map((r: any) => ({
            id: r.id,
            type: r.type,
            amount: Number(r.amount),
            date: r.date,
            note: r.note,
          }))
        );
    })();
  }, [session]);

  const addTrade = async (t: Omit<Trade, "id">) => {
    if (!session) return;
    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: session.user.id,
        date: t.date,
        num_trades: t.numTrades,
        revenue: t.revenue,
        fees: t.fees,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao adicionar trade");
      return;
    }
    setTrades((prev) => [
      ...prev,
      {
        id: data.id,
        date: data.date,
        numTrades: data.num_trades,
        revenue: Number(data.revenue),
        fees: Number(data.fees),
      },
    ]);
  };

  const removeTrade = async (id: string) => {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover");
      return;
    }
    setTrades((prev) => prev.filter((t) => t.id !== id));
  };

  const addTransaction = async (t: Omit<AccountTx, "id">) => {
    if (!session) return;
    const { data, error } = await supabase
      .from("account_transactions")
      .insert({
        user_id: session.user.id,
        type: t.type,
        amount: t.amount,
        date: t.date,
        note: t.note,
      })
      .select()
      .single();
    if (error) {
      toast.error("Erro ao registrar transação");
      return;
    }
    setTransactions((prev) => [
      {
        id: data.id,
        type: data.type,
        amount: Number(data.amount),
        date: data.date,
        note: data.note,
      },
      ...prev,
    ]);
  };

  const removeTransaction = async (id: string) => {
    const { error } = await supabase.from("account_transactions").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover transação");
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredTrades = useMemo(() => {
    const start = periodStartDate(period);
    if (!start) return trades;
    const startStr = start.toISOString().slice(0, 10);
    return trades.filter((t) => t.date >= startStr);
  }, [trades, period]);

  const computeTotals = (list: Trade[]): Totals => {
    const revenue = list.reduce((s, t) => s + t.revenue, 0);
    const fees = list.reduce((s, t) => s + t.fees, 0);
    const tradesCount = list.reduce((s, t) => s + t.numTrades, 0);
    return { revenue, fees, profit: revenue - fees, trades: tradesCount };
  };

  const totals = useMemo(() => computeTotals(filteredTrades), [filteredTrades]);
  const totalsAll = useMemo(() => computeTotals(trades), [trades]);

  const totalDeposits = useMemo(
    () => transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalWithdrawals = useMemo(
    () => transactions.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const balance = totalDeposits - totalWithdrawals + totalsAll.profit;

  return (
    <TradesContext.Provider
      value={{
        trades,
        transactions,
        session,
        loading,
        addTrade,
        removeTrade,
        addTransaction,
        removeTransaction,
        signOut,
        totals,
        totalsAll,
        filteredTrades,
        period,
        setPeriod,
        totalDeposits,
        totalWithdrawals,
        balance,
      }}
    >
      {children}
    </TradesContext.Provider>
  );
}

export function useTrades() {
  const ctx = useContext(TradesContext);
  if (!ctx) throw new Error("useTrades must be used inside TradesProvider");
  return ctx;
}
