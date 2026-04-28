import { Navigate } from "react-router-dom";
import { useTrades } from "@/context/TradesContext";
import { ReactNode } from "react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { session, loading } = useTrades();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
        SYNC...
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}
