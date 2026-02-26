import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Target,
  Play,
  RotateCcw,
  Save,
  Zap,
  Shield,
  Activity,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const oarConstraints = [
  { name: "Cochlea", maxDose: 4.0, currentDose: 3.8, unit: "Gy", limit: "Max", status: "ok" as const },
  { name: "Hjärnstam", maxDose: 12.0, currentDose: 6.2, unit: "Gy", limit: "Max", status: "ok" as const },
  { name: "N. facialis", maxDose: 8.0, currentDose: 8.1, unit: "Gy", limit: "Max", status: "warning" as const },
  { name: "Optisk chiasm", maxDose: 8.0, currentDose: 1.2, unit: "Gy", limit: "Max", status: "ok" as const },
  { name: "Optisk nerv", maxDose: 8.0, currentDose: 2.4, unit: "Gy", limit: "Max", status: "ok" as const },
  { name: "Linsen", maxDose: 5.0, currentDose: 0.8, unit: "Gy", limit: "Max", status: "ok" as const },
];

const scenarios = [
  { name: "Konservativ", dose: 10, conformity: 1.38, selectivity: 0.89, healthy: 2.8, feasibility: 94, note: "Lägre risk, marginellt lägre tumörkontroll" },
  { name: "Standard (AI-rekommenderad)", dose: 12, conformity: 1.42, selectivity: 0.87, healthy: 3.2, feasibility: 97, note: "Optimal balans tumörkontroll/OAR-skydd" },
  { name: "Aggressiv", dose: 14, conformity: 1.48, selectivity: 0.84, healthy: 4.1, feasibility: 88, note: "Högre tumörkontroll men ökad OAR-risk" },
];

const PlanningAssistant = () => {
  const [selectedPatient] = useState(patients[0]);
  const plan = treatmentPlans[0];
  const [dose, setDose] = useState([plan.totalDose]);
  const [collimator, setCollimator] = useState([8]);
  const [fractions, setFractions] = useState([1]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState(1);
  const [planTab, setPlanTab] = useState("dose");

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2500);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Planeringsassistent</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-genererad dosplanering — {selectedPatient.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Återställ</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Save className="w-3.5 h-3.5 mr-1.5" />Spara plan</Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main visualization area */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="card-medical overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Tabs value={planTab} onValueChange={setPlanTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="dose" className="text-xs h-6 px-3">Dosfördelning</TabsTrigger>
                  <TabsTrigger value="dvh" className="text-xs h-6 px-3">DVH</TabsTrigger>
                  <TabsTrigger value="beams" className="text-xs h-6 px-3">Strålbanor</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={handleSimulate} disabled={isSimulating}>
                <Play className="w-3.5 h-3.5 mr-1.5" />
                {isSimulating ? "Simulerar..." : "Simulera"}
              </Button>
            </div>

            {planTab === "dose" && (
              <div className="relative h-[400px] bg-foreground/[0.03] medical-grid">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <svg width="360" height="360" viewBox="0 0 360 360">
                      <motion.ellipse cx="160" cy="155" rx="70" ry="65" fill="hsl(0 72% 51%)" opacity="0.06" stroke="hsl(0 72% 51%)" strokeWidth="1" strokeDasharray="3 2"
                        animate={isSimulating ? { rx: [70, 68, 70], ry: [65, 63, 65] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
                      <motion.ellipse cx="160" cy="155" rx="50" ry="45" fill="hsl(38 92% 50%)" opacity="0.08" stroke="hsl(38 92% 50%)" strokeWidth="1" strokeDasharray="3 2"
                        animate={isSimulating ? { rx: [50, 48, 50], ry: [45, 43, 45] } : {}} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }} />
                      <motion.ellipse cx="160" cy="155" rx="30" ry="28" fill="hsl(152 60% 42%)" opacity="0.1" stroke="hsl(152 60% 42%)" strokeWidth="1" strokeDasharray="3 2"
                        animate={isSimulating ? { rx: [30, 28, 30], ry: [28, 26, 28] } : {}} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                      <motion.ellipse cx="160" cy="155" rx="16" ry="14" fill="hsl(187 80% 42%)" opacity="0.3" stroke="hsl(187 80% 42%)" strokeWidth="2"
                        animate={isSimulating ? { opacity: [0.3, 0.6, 0.3] } : {}} transition={{ duration: 1, repeat: Infinity }} />
                      {plan.beams.map((beam, i) => (
                        <motion.line key={beam.id}
                          x1={160 + Math.cos((beam.angle * Math.PI) / 180) * 160}
                          y1={155 + Math.sin((beam.angle * Math.PI) / 180) * 160}
                          x2="160" y2="155"
                          stroke="hsl(187 80% 42%)" strokeWidth={beam.weight * 1.5} opacity={0.3}
                          animate={isSimulating ? { opacity: [0.1, 0.5, 0.1] } : {}}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                      <text x="235" y="120" fontSize="9" fill="hsl(0 72% 51%)" opacity="0.7">50% isodos</text>
                      <text x="215" y="140" fontSize="9" fill="hsl(38 92% 50%)" opacity="0.7">80% isodos</text>
                      <text x="195" y="160" fontSize="9" fill="hsl(152 60% 42%)" opacity="0.7">95% isodos</text>
                    </svg>
                  </div>
                </div>
                <div className="scan-line absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-red/40" /> 50%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-amber/50" /> 80%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-green/50" /> 95%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-cyan/50" /> Target</span>
                </div>
              </div>
            )}

            {planTab === "dvh" && (
              <div className="relative h-[400px] bg-foreground/[0.03] p-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-4">Dos-volym histogram (DVH)</p>
                <div className="relative h-[300px] border-l-2 border-b-2 border-muted-foreground/20">
                  {/* Y axis labels */}
                  {[100, 75, 50, 25, 0].map((v, i) => (
                    <div key={v} className="absolute left-0 text-[9px] text-muted-foreground -translate-x-8" style={{ bottom: `${v}%` }}>{v}%</div>
                  ))}
                  {/* X axis labels */}
                  {[0, 3, 6, 9, 12, 15].map((v) => (
                    <div key={v} className="absolute bottom-0 text-[9px] text-muted-foreground translate-y-4" style={{ left: `${(v / 15) * 100}%` }}>{v} Gy</div>
                  ))}
                  {/* GTV curve */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path d="M0,0 L5,0 Q60,0 70,20 Q80,60 85,100" fill="none" stroke="hsl(0 72% 51%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} />
                    <motion.path d="M0,0 L3,0 Q40,0 55,15 Q65,40 70,100" fill="none" stroke="hsl(187 80% 42%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} />
                    <motion.path d="M0,0 Q10,5 20,100" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} />
                  </svg>
                  {/* Legend */}
                  <div className="absolute top-2 right-2 space-y-1 text-[10px] bg-card/80 backdrop-blur-sm rounded p-2 border border-border">
                    <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-medical-red rounded" /> GTV</div>
                    <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-medical-cyan rounded" /> CTV</div>
                    <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-medical-amber rounded" /> OAR (Cochlea)</div>
                  </div>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-6">Dos (Gy)</p>
              </div>
            )}

            {planTab === "beams" && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.beams.map((beam) => (
                    <div key={beam.id} className="bg-muted/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground">Strålbana {beam.id}</span>
                        <span className="text-[10px] text-medical-cyan font-medium">{beam.angle}°</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div>
                          <p className="text-muted-foreground">Vikt</p>
                          <p className="font-semibold text-foreground">{beam.weight}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Kollimator</p>
                          <p className="font-semibold text-foreground">{beam.collimatorSize}mm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Isocenter</p>
                          <p className="font-semibold text-foreground">{beam.isocenterX}, {beam.isocenterY}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                  Totalt {plan.beamCount} strålar — visar 5 representativa banor
                </p>
              </div>
            )}
          </div>

          {/* OAR constraints table */}
          <motion.div variants={item} className="card-medical">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Shield className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-foreground">OAR-dosbegränsningar</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold pb-2 border-b border-border">
                <span>Struktur</span><span>Typ</span><span>Gräns</span><span>Aktuell dos</span><span>Status</span>
              </div>
              {oarConstraints.map((oar, i) => (
                <div key={i} className="grid grid-cols-5 text-xs py-2.5 border-b border-border/50 items-center">
                  <span className="font-medium text-foreground">{oar.name}</span>
                  <span className="text-muted-foreground">{oar.limit}</span>
                  <span className="text-muted-foreground">{oar.maxDose} {oar.unit}</span>
                  <span className={`font-semibold ${oar.status === "ok" ? "text-medical-green" : "text-medical-amber"}`}>{oar.currentDose} {oar.unit}</span>
                  <span className="flex items-center gap-1">
                    {oar.status === "ok" ? (
                      <><CheckCircle2 className="w-3 h-3 text-medical-green" /><span className="text-medical-green text-[10px]">OK</span></>
                    ) : (
                      <><AlertTriangle className="w-3 h-3 text-medical-amber" /><span className="text-medical-amber text-[10px]">Varning</span></>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div variants={item} className="space-y-4">
          {/* AI recommendation */}
          <div className="card-medical p-4 border-l-[3px] border-l-medical-cyan bg-medical-cyan/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-medical-cyan" />
              <span className="text-xs font-semibold text-medical-cyan uppercase tracking-wider">AI-rekommendation</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              Optimal plan: {plan.beamCount} strålar, {plan.totalDose} Gy margindos.
              CI: {plan.conformityIndex}. Alla OAR-gränser uppfyllda förutom N. facialis (gränsvärde).
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-medical-green">
              <FileCheck className="w-3 h-3" />
              <span className="font-medium">Plan genomförbar — kliniker-verifiering krävs</span>
            </div>
          </div>

          {/* Parameters */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Parametrar</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Margindos (Gy)</span>
                  <span className="font-semibold text-foreground">{dose[0]} Gy</span>
                </div>
                <Slider value={dose} onValueChange={setDose} min={8} max={25} step={0.5} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Kollimator (mm)</span>
                  <span className="font-semibold text-foreground">{collimator[0]} mm</span>
                </div>
                <Slider value={collimator} onValueChange={setCollimator} min={4} max={18} step={1} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Fraktioner</span>
                  <span className="font-semibold text-foreground">{fractions[0]}</span>
                </div>
                <Slider value={fractions} onValueChange={setFractions} min={1} max={5} step={1} />
              </div>
            </div>
          </div>

          {/* Plan metrics */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Planmått</h3>
            <div className="space-y-3">
              {[
                { label: "Conformity Index", value: plan.conformityIndex, target: "< 1.5", good: plan.conformityIndex < 1.5, icon: Target },
                { label: "Selectivity", value: plan.selectivityIndex, target: "> 0.8", good: plan.selectivityIndex > 0.8, icon: Shield },
                { label: "Frisk vävnad exp.", value: `${plan.healthyTissueExposure}%`, target: "< 5%", good: plan.healthyTissueExposure < 5, icon: Activity },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${m.good ? "bg-medical-green/10" : "bg-medical-amber/10"}`}>
                    <m.icon className={`w-3.5 h-3.5 ${m.good ? "text-medical-green" : "text-medical-amber"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                  <span className={`text-[10px] font-medium ${m.good ? "text-medical-green" : "text-medical-amber"}`}>
                    Mål: {m.target}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scenarion</h3>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveScenario(i); setDose([s.dose]); }}
                  className={`w-full text-left text-xs p-3 rounded-lg transition-colors ${
                    i === activeScenario
                      ? "bg-primary/5 border border-primary/20"
                      : "hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${i === activeScenario ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                    <span className="text-[10px] font-bold text-medical-cyan">{s.dose} Gy</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{s.note}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span>CI: {s.conformity}</span>
                    <span>SI: {s.selectivity}</span>
                    <span className={`font-semibold ${s.feasibility >= 95 ? "text-medical-green" : s.feasibility >= 90 ? "text-medical-cyan" : "text-medical-amber"}`}>
                      Genomförbarhet: {s.feasibility}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlanningAssistant;
