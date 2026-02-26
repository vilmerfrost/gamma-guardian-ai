import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Play,
  RotateCcw,
  Save,
  Zap,
  Shield,
  Activity,
  ChevronRight,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const PlanningAssistant = () => {
  const [selectedPatient] = useState(patients[0]);
  const plan = treatmentPlans[0];
  const [dose, setDose] = useState([plan.totalDose]);
  const [collimator, setCollimator] = useState([8]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
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
        {/* Dose visualization */}
        <motion.div variants={item} className="lg:col-span-2 card-medical overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Dosfördelning — 3D-vy</h2>
            <Button variant="outline" size="sm" onClick={handleSimulate} disabled={isSimulating}>
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isSimulating ? "Simulerar..." : "Simulera"}
            </Button>
          </div>
          <div className="relative h-[400px] bg-foreground/[0.03] medical-grid">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* 3D-ish dose distribution */}
                <svg width="360" height="360" viewBox="0 0 360 360">
                  {/* Dose contours */}
                  <motion.ellipse cx="160" cy="155" rx="70" ry="65" fill="hsl(0 72% 51%)" opacity="0.06" stroke="hsl(0 72% 51%)" strokeWidth="1" strokeDasharray="3 2"
                    animate={isSimulating ? { rx: [70, 68, 70], ry: [65, 63, 65] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.ellipse cx="160" cy="155" rx="50" ry="45" fill="hsl(38 92% 50%)" opacity="0.08" stroke="hsl(38 92% 50%)" strokeWidth="1" strokeDasharray="3 2"
                    animate={isSimulating ? { rx: [50, 48, 50], ry: [45, 43, 45] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.ellipse cx="160" cy="155" rx="30" ry="28" fill="hsl(152 60% 42%)" opacity="0.1" stroke="hsl(152 60% 42%)" strokeWidth="1" strokeDasharray="3 2"
                    animate={isSimulating ? { rx: [30, 28, 30], ry: [28, 26, 28] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  />
                  {/* Target tumor */}
                  <motion.ellipse cx="160" cy="155" rx="16" ry="14" fill="hsl(187 80% 42%)" opacity="0.3" stroke="hsl(187 80% 42%)" strokeWidth="2"
                    animate={isSimulating ? { opacity: [0.3, 0.6, 0.3] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  {/* Beam paths */}
                  {plan.beams.map((beam, i) => (
                    <motion.line
                      key={beam.id}
                      x1={160 + Math.cos((beam.angle * Math.PI) / 180) * 160}
                      y1={155 + Math.sin((beam.angle * Math.PI) / 180) * 160}
                      x2="160" y2="155"
                      stroke="hsl(187 80% 42%)"
                      strokeWidth={beam.weight * 1.5}
                      opacity={0.3}
                      animate={isSimulating ? { opacity: [0.1, 0.5, 0.1] } : {}}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                  {/* Isodose labels */}
                  <text x="235" y="120" fontSize="9" fill="hsl(0 72% 51%)" opacity="0.7">50% isodos</text>
                  <text x="215" y="140" fontSize="9" fill="hsl(38 92% 50%)" opacity="0.7">80% isodos</text>
                  <text x="195" y="160" fontSize="9" fill="hsl(152 60% 42%)" opacity="0.7">95% isodos</text>
                </svg>
              </div>
            </div>
            <div className="scan-line absolute inset-0 pointer-events-none" />
            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-red/40" /> 50%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-amber/50" /> 80%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-green/50" /> 95%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-cyan/50" /> Target</span>
            </div>
          </div>
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
              Optimal dosplan: {plan.beamCount} strålar, {plan.totalDose} Gy margindos.
              Conformity Index: {plan.conformityIndex}. Justera kollimatorstorlek till 8mm för bästa täckning.
            </p>
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
              {["Konservativ (10 Gy)", "Standard (12 Gy)", "Aggressiv (14 Gy)"].map((s, i) => (
                <button key={i} className={`w-full text-left text-xs p-2.5 rounded-lg flex items-center justify-between transition-colors ${i === 1 ? "bg-primary/5 border border-primary/20 text-foreground font-medium" : "hover:bg-muted/50 text-muted-foreground"}`}>
                  {s}
                  <ChevronRight className="w-3.5 h-3.5" />
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
