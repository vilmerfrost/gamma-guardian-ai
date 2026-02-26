import { motion } from "framer-motion";
import {
  patients,
  aiInsights,
  statusLabels,
  statusColors,
  riskColors,
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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const stats = [
  { label: "Aktiva patienter", value: "5", icon: Users, change: "+2 denna vecka" },
  { label: "AI-analyserade", value: "12", icon: Brain, change: "98% accuracy" },
  { label: "Behandlingar idag", value: "3", icon: Target, change: "2 kvar" },
  { label: "Genomsnittlig AI-score", value: "93.2", icon: TrendingUp, change: "+1.4%" },
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Dashboard = () => {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Översikt — Gamma Knife-behandlingscentrum
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5 text-medical-green" />
          <span>Senast uppdaterad: 5 jan 2025, 10:30</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card-medical p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center">
                <stat.icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-medical-green" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-medical-cyan font-medium mt-1">{stat.change}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <motion.div variants={item} className="lg:col-span-2 card-medical">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Patientöversikt</h2>
          </div>
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
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={item} className="card-medical">
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
        </motion.div>
      </div>

      {/* Tumor visualization mock */}
      <motion.div variants={item} className="card-medical overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">MRI-visualisering — Anna Lindström</h2>
        </div>
        <div className="relative h-64 md:h-80 medical-grid bg-foreground/[0.02]">
          {/* Mock brain scan visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Brain outline */}
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-muted-foreground/20 relative">
                <div className="absolute inset-2 rounded-full border border-muted-foreground/10" />
                <div className="absolute inset-4 rounded-full border border-muted-foreground/5" />
                {/* Tumor marker */}
                <motion.div
                  className="absolute w-6 h-6 rounded-full bg-medical-red/40 border-2 border-medical-red glow-cyan"
                  style={{ top: "30%", left: "25%" }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                {/* Safe zone */}
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-medical-green/50 bg-medical-green/10"
                  style={{ top: "50%", right: "30%" }}
                />
                {/* Beam lines */}
                {[0, 45, 90, 135, 180].map((angle, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 h-px bg-medical-cyan/30 origin-left"
                    style={{
                      width: "120px",
                      transform: `rotate(${angle}deg) translateX(-10px)`,
                    }}
                  />
                ))}
                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 border border-medical-cyan rounded-full animate-pulse-glow" />
                </div>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex gap-4 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-medical-red/60 border border-medical-red" />
              <span className="text-muted-foreground">Tumör</span>
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
          {/* Scan line effect */}
          <div className="scan-line absolute inset-0 pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
