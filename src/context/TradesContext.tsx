import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

type TradesContextType = {
  trades: Trade[];
  session: Session | null;
  loading: boolean;
  addTrade: (t: Omit<Trade, "id">) => Promise<void>;
  removeTrade: (id: string) => Promise<void>;
  signOut: () => Promise<void>;
  totals: { revenue: number; fees: number; profit: number; trades: number };
};

const TradesContext = createContext<TradesContextType | null>(null);

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("date", { ascending: true });
      if (error) {
        toast.error("Erro ao carregar trades");
        return;
      }
      setTrades(
        (data ?? []).map((r: any) => ({
          id: r.id,
          date: r.date,
          numTrades: r.num_trades,
          revenue: Number(r.revenue),
          fees: Number(r.fees),
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const revenue = trades.reduce((s, t) => s + t.revenue, 0);
  const fees = trades.reduce((s, t) => s + t.fees, 0);
  const tradesCount = trades.reduce((s, t) => s + t.numTrades, 0);

  return (
    <TradesContext.Provider
      value={{
        trades,
        session,
        loading,
        addTrade,
        removeTrade,
        signOut,
        totals: { revenue, fees, profit: revenue - fees, trades: tradesCount },
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
