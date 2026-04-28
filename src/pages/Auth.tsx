import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) toast.error(error.message);
      else {
        toast.success("Conta criada");
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else navigate("/");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm border-2 border-grid p-6 space-y-4 bg-card">
        <div className="border-b-2 border-grid pb-3">
          <h1 className="text-xl font-bold uppercase tracking-widest text-matrix">
            NEXUS_CORE // ACCESS
          </h1>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
            {mode === "signin" ? "AUTHENTICATE NODE" : "REGISTER NEW OPERATOR"}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-widest">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs uppercase tracking-widest">Senha</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={busy} className="w-full uppercase tracking-widest font-bold">
          {busy ? "..." : mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
        </Button>
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-matrix"
        >
          {mode === "signin" ? "» Criar nova conta" : "» Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
