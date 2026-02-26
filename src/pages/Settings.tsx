import { useState } from "react";
import { motion } from "framer-motion";
import { patients } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon,
  Users,
  Database,
  Palette,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [aiAutoAnalysis, setAiAutoAnalysis] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Inställningar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Hantera system, användare och data</p>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="users">
          <TabsList className="w-full justify-start bg-muted/30 p-1">
            <TabsTrigger value="users" className="text-xs gap-1.5"><Users className="w-3.5 h-3.5" />Användare</TabsTrigger>
            <TabsTrigger value="data" className="text-xs gap-1.5"><Database className="w-3.5 h-3.5" />Patientdata</TabsTrigger>
            <TabsTrigger value="ui" className="text-xs gap-1.5"><Palette className="w-3.5 h-3.5" />Gränssnitt</TabsTrigger>
            <TabsTrigger value="system" className="text-xs gap-1.5"><SettingsIcon className="w-3.5 h-3.5" />System</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 space-y-4">
            <div className="card-medical p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Systemanvändare</h3>
                <Button size="sm" variant="outline"><Plus className="w-3.5 h-3.5 mr-1.5" />Lägg till</Button>
              </div>
              <div className="divide-y divide-border">
                {[
                  { name: "Dr. Helena Svensson", role: "Neurokirurg", email: "helena.s@klinik.se", active: true },
                  { name: "Dr. Karl Eriksson", role: "Medicinsk fysiker", email: "karl.e@klinik.se", active: true },
                  { name: "Anna Petersson", role: "Dosimetrist", email: "anna.p@klinik.se", active: true },
                  { name: "Erik Lundberg", role: "Tekniker", email: "erik.l@klinik.se", active: false },
                ].map((user, i) => (
                  <div key={i} className="py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">{user.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role} — {user.email}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.active ? "bg-medical-green/10 text-medical-green" : "bg-muted text-muted-foreground"}`}>
                      {user.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="mt-4 space-y-4">
            <div className="card-medical p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Mock-patientdata</h3>
                <span className="text-xs text-muted-foreground">{patients.length} patienter</span>
              </div>
              <div className="divide-y divide-border">
                {patients.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.id} — {p.diagnosis}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8 w-8 p-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ui" className="mt-4 space-y-4">
            <div className="card-medical p-4 space-y-5">
              <h3 className="text-sm font-semibold text-foreground">Visningsinställningar</h3>
              {[
                { label: "Hög kontrast", desc: "Ökar kontrasten för medicinska bilder", checked: highContrast, onChange: setHighContrast },
                { label: "AI-insikter i sidopanel", desc: "Visa AI-rekommendationer automatiskt", checked: aiAutoAnalysis, onChange: setAiAutoAnalysis },
                { label: "Notifieringar", desc: "Få aviseringar om patientuppdateringar", checked: notifications, onChange: setNotifications },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Switch checked={s.checked} onCheckedChange={s.onChange} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="system" className="mt-4 space-y-4">
            <div className="card-medical p-4 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">API-konfiguration</h3>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">OpenAI API-nyckel</label>
                <div className="flex gap-2">
                  <Input placeholder="sk-..." type="password" className="font-mono text-xs" />
                  <Button size="sm" variant="outline"><Save className="w-3.5 h-3.5 mr-1.5" />Spara</Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Krävs för AI Advisor-funktionalitet</p>
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-medical-cyan" />
                  <h4 className="text-xs font-semibold text-foreground">Systeminfo</h4>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Version: GammaAI v2.1.0-beta</p>
                  <p>AI Engine: Redo för integration</p>
                  <p>Databas: Mock-data (lokal)</p>
                  <p>Senaste uppdatering: 2025-01-05</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
