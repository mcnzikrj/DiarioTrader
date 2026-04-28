import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Trade = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  numTrades: number;
  revenue: number;
  fees: number;
};

type TradesContextType = {
  trades: Trade[];
  addTrade: (t: Omit<Trade, "id">) => void;
  removeTrade: (id: string) => void;
  totals: { revenue: number; fees: number; profit: number; trades: number };
};

const TradesContext = createContext<TradesContextType | null>(null);

const STORAGE_KEY = "nexus-trades-v1";

const seed: Trade[] = [
  { id: "s1", date: "2026-04-21", numTrades: 12, revenue: 4820, fees: 84 },
  { id: "s2", date: "2026-04-22", numTrades: 8, revenue: 2150, fees: 52 },
  { id: "s3", date: "2026-04-23", numTrades: 15, revenue: -980, fees: 96 },
  { id: "s4", date: "2026-04-24", numTrades: 10, revenue: 3640, fees: 70 },
  { id: "s5", date: "2026-04-25", numTrades: 18, revenue: 6210, fees: 124 },
  { id: "s6", date: "2026-04-27", numTrades: 14, revenue: 5180, fees: 98 },
  { id: "s7", date: "2026-04-28", numTrades: 9, revenue: -1240, fees: 64 },
];

export function TradesProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Trade[];
    } catch {}
    return seed;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }, [trades]);

  const addTrade = (t: Omit<Trade, "id">) =>
    setTrades((prev) => [...prev, { ...t, id: crypto.randomUUID() }]);
  const removeTrade = (id: string) =>
    setTrades((prev) => prev.filter((t) => t.id !== id));

  const revenue = trades.reduce((s, t) => s + t.revenue, 0);
  const fees = trades.reduce((s, t) => s + t.fees, 0);
  const tradesCount = trades.reduce((s, t) => s + t.numTrades, 0);

  return (
    <TradesContext.Provider
      value={{
        trades,
        addTrade,
        removeTrade,
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
