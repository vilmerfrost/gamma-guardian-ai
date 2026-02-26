import { motion } from "framer-motion";
import { useState } from "react";
import {
  patients,
  aiInsights,
  statusLabels,
  statusColors,
  riskColors,
  treatmentPlans,
} from "@/data/mockData";
import {
  Users,
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Activity,
  ArrowUpRight,
  Shield,
  Clock,
  BarChart3,
  Crosshair,
  HeartPulse,
  FileCheck,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const stats = [
  { label: "Aktiva patienter", value: "5", icon: Users, change: "+2 denna vecka", trend: "up" },
  { label: "Segmenteringsnoggrannhet", value: "96.8%", icon: Crosshair, change: "Mål: ≥95%", trend: "up" },
  { label: "Behandlingar idag", value: "3", icon: Target, change: "2 kvar", trend: "neutral" },
  { label: "Genomsnittlig AI-score", value: "93.2", icon: TrendingUp, change: "+1.4% denna månad", trend: "up" },
  { label: "Planverifiering", value: "100%", icon: Shield, change: "Alla godkända", trend: "up" },
  { label: "Rapporter genererade", value: "47", icon: FileCheck, change: "12 denna vecka", trend: "up" },
];

const insightIcons = {
  optimization: Zap,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const insightStyles = {
  optimization: "border-l-medical-cyan bg-medical-cyan/5",
  warning: "border-l-medical-amber bg-medical-amber/5",
  success: "border-l-medical-green bg-medical-green/5",
  info: "border-l-medical-purple bg-medical-purple/5",
};

const treatmentTimeline = [
  { time: "08:00", patient: "Anna Lindström", type: "Gamma Knife SRS", status: "completed" as const },
  { time: "10:30", patient: "Erik Johansson", type: "Dosplanering", status: "in-progress" as const },
  { time: "13:00", patient: "Sofia Nilsson", type: "MRI-analys", status: "scheduled" as const },
  { time: "14:30", patient: "Lars Bergman", type: "Uppföljning", status: "scheduled" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gamma Knife-behandlingscentrum — Klinisk översikt
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-medical-green/10 text-medical-green border border-medical-green/20 font-medium">
            <HeartPulse className="w-3 h-3" />
            CE-märkt system
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3.5 h-3.5 text-medical-green" />
            <span>Live — {new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className="card-medical p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              {stat.trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-medical-green" />}
            </div>
            <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
            <p className="text-[10px] text-medical-cyan font-medium mt-0.5">{stat.change}</p>
          </div>
        ))}
      </motion.div>

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient list + Timeline tabs */}
        <motion.div variants={item} className="lg:col-span-2 card-medical">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <TabsList className="h-8 bg-muted/40">
                <TabsTrigger value="overview" className="text-xs h-6 px-3">Patienter</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs h-6 px-3">Dagsplanering</TabsTrigger>
                <TabsTrigger value="accuracy" className="text-xs h-6 px-3">AI-prestanda</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="m-0">
              <div className="divide-y divide-border">
                {patients.map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[p.status]}`}>
                          {statusLabels[p.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.diagnosis} — {p.tumorSize}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right shrink-0">
                      <p className="text-xs text-muted-foreground">AI Score</p>
                      <p className={`text-sm font-bold ${p.aiScore >= 95 ? "text-medical-green" : p.aiScore >= 90 ? "text-medical-cyan" : "text-medical-amber"}`}>
                        {p.aiScore}%
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col gap-1 shrink-0 w-24">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Risk</span>
                        <span className={`font-semibold ${riskColors[p.riskLevel]}`}>{p.riskLevel}</span>
                      </div>
                      <Progress
                        value={p.riskLevel === "low" ? 25 : p.riskLevel === "medium" ? 55 : 85}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="m-0 p-4">
              <div className="space-y-1">
                {treatmentTimeline.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="w-14 text-center shrink-0">
                      <p className="text-sm font-bold text-foreground">{t.time}</p>
                    </div>
                    <div className="relative flex flex-col items-center shrink-0">
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        t.status === "completed" ? "bg-medical-green border-medical-green" :
                        t.status === "in-progress" ? "bg-medical-cyan border-medical-cyan animate-pulse-glow" :
                        "bg-muted border-muted-foreground/30"
                      }`} />
                      {i < treatmentTimeline.length - 1 && (
                        <div className="w-px h-8 bg-border absolute top-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{t.patient}</p>
                      <p className="text-xs text-muted-foreground">{t.type}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      t.status === "completed" ? "bg-medical-green/10 text-medical-green border-medical-green/20" :
                      t.status === "in-progress" ? "bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20" :
                      "bg-muted text-muted-foreground border-border"
                    }`}>
                      {t.status === "completed" ? "Klar" : t.status === "in-progress" ? "Pågår" : "Planerad"}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="accuracy" className="m-0 p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "GTV-segmentering", value: 96.8, target: 95, unit: "%" },
                    { label: "CTV-precision", value: 94.2, target: 95, unit: "%" },
                    { label: "OAR-identifiering", value: 98.1, target: 95, unit: "%" },
                    { label: "Dosplanförslag", value: 92.5, target: 90, unit: "% godkända" },
                  ].map((m, i) => (
                    <div key={i} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <span className={`text-[10px] font-semibold ${m.value >= m.target ? "text-medical-green" : "text-medical-amber"}`}>
                          {m.value >= m.target ? "✓ Mål uppnått" : "⚠ Under mål"}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{m.value}{m.unit}</p>
                      <div className="mt-1.5">
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${m.value >= m.target ? "bg-medical-green/60" : "bg-medical-amber/60"}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            transition={{ duration: 1, delay: i * 0.15 }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Mål: ≥{m.target}%</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-medical-cyan/5 border border-medical-cyan/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>Explainable AI:</strong> Alla segmenteringsbeslut loggas med konfidensvärden per voxel.
                    Kliniker kan granska AI:ns beslutsgränser i bildanalys-vyn innan de godkänner planer.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item} className="space-y-4">
          <div className="card-medical">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-medical-cyan" />
                <h2 className="text-sm font-semibold text-foreground">AI-insikter</h2>
              </div>
            </div>
            <div className="p-3 space-y-3">
              {aiInsights.map((insight) => {
                const Icon = insightIcons[insight.type];
                return (
                  <div
                    key={insight.id}
                    className={`rounded-lg border-l-[3px] p-3 ${insightStyles[insight.type]}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{insight.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinician-in-the-loop status */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-medical-green" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Klinisk kontroll</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { label: "AI-segmenteringar väntande granskning", value: "2", color: "text-medical-amber" },
                { label: "Dosplaner godkända idag", value: "3", color: "text-medical-green" },
                { label: "Rapporter signerade", value: "5", color: "text-medical-green" },
                { label: "Avvikelser flaggade", value: "1", color: "text-medical-red" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground italic">
                AI stödjer — klinikern beslutar. Alla AI-förslag kräver manuell verifiering.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MRI visualization */}
      <motion.div variants={item} className="card-medical overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">MRI-visualisering — Anna Lindström</h2>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 font-medium">GTV</span>
            <span className="px-2 py-0.5 rounded-full bg-medical-purple/10 text-medical-purple border border-medical-purple/20 font-medium">CTV</span>
            <span className="px-2 py-0.5 rounded-full bg-medical-amber/10 text-medical-amber border border-medical-amber/20 font-medium">OAR</span>
          </div>
        </div>
        <div className="relative h-64 md:h-80 medical-grid bg-foreground/[0.02]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-muted-foreground/20 relative">
                <div className="absolute inset-2 rounded-full border border-muted-foreground/10" />
                <div className="absolute inset-4 rounded-full border border-muted-foreground/5" />
                {/* Tumor GTV */}
                <motion.div
                  className="absolute w-6 h-6 rounded-full bg-medical-red/40 border-2 border-medical-red"
                  style={{ top: "30%", left: "25%" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* CTV margin */}
                <div
                  className="absolute w-10 h-10 rounded-full border-2 border-dashed border-medical-purple/50"
                  style={{ top: "26%", left: "21%" }}
                />
                {/* OAR markers */}
                <div className="absolute w-4 h-4 rounded-full border-2 border-medical-amber/60 bg-medical-amber/10" style={{ top: "50%", left: "18%" }} />
                <div className="absolute w-3 h-3 rounded-full border-2 border-medical-amber/60 bg-medical-amber/10" style={{ top: "60%", right: "35%" }} />
                {/* Safe zone */}
                <div className="absolute w-4 h-4 rounded-full border-2 border-medical-green/50 bg-medical-green/10" style={{ top: "50%", right: "30%" }} />
                {/* Beam lines */}
                {[0, 45, 90, 135, 180].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 h-px bg-medical-cyan/30 origin-left"
                    style={{ width: "120px", transform: `rotate(${angle}deg) translateX(-10px)` }}
                  />
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-medical-cyan rounded-full animate-pulse-glow" />
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-medical-red/60 border border-medical-red" />
              <span className="text-muted-foreground">GTV (Tumör)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-medical-purple/50" />
              <span className="text-muted-foreground">CTV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-medical-amber/20 border border-medical-amber/60" />
              <span className="text-muted-foreground">OAR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-medical-green/30 border border-medical-green/50" />
              <span className="text-muted-foreground">Säker zon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-8 h-px bg-medical-cyan/40" />
              <span className="text-muted-foreground">Strålbanor</span>
            </div>
          </div>
          <div className="scan-line absolute inset-0 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
