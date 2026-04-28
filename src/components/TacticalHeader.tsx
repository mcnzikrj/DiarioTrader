import { Link, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

export default function TacticalHeader() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "DASHBOARD" },
    { to: "/trades", label: "ADD_TRADE" },
  ];

  return (
    <header className="flex items-end justify-between border-b-2 border-grid pb-3 mb-6">
      <div className="flex items-center gap-4">
        <div className="size-3 rounded-sm bg-alert animate-pulse" style={{ boxShadow: "var(--shadow-alert)" }} />
        <div className="flex flex-col">
          <h1 className="text-foreground font-bold text-xl md:text-2xl leading-none tracking-tight uppercase">
            NEXUS_CORE // TACTICAL
          </h1>
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
            NODE: BR-EQ-01 | LATENCY: 4MS | SESSION LIVE
          </span>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        {links.map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                active
                  ? "border-matrix text-matrix bg-matrix/5"
                  : "border-grid text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              <span className="flex items-center gap-2">
                <Activity className="size-3" />
                {l.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
