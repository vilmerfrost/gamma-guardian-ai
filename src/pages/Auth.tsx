import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Inloggad!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setConfirmationSent(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md card-medical-elevated p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-medical-green/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-medical-green" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Bekräfta din e-post</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Vi har skickat ett bekräftelsemail till <strong className="text-foreground">{email}</strong>.
            Klicka på länken i mailet för att aktivera ditt konto.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => { setConfirmationSent(false); setIsLogin(true); }}>
            Tillbaka till inloggning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mx-auto mb-4 glow-cyan">
            <Zap className="w-6 h-6 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GammaAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Gamma Knife Radiosurgery Suite</p>
        </div>

        <div className="card-medical-elevated p-6">
          <div className="flex mb-6 bg-muted/40 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Logga in
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Registrera
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">E-postadress</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="namn@sjukhus.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">Lösenord</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0" disabled={loading}>
              {loading ? "Laddar..." : isLogin ? "Logga in" : "Skapa konto"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 bg-muted/30 rounded-lg p-3">
            <AlertCircle className="w-3.5 h-3.5 text-medical-amber shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground">
              GammaAI hanterar patientdata. Använd dina sjukhusuppgifter. Sessionen sparas automatiskt.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
