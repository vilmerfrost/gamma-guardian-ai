import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target,
  Play,
  RotateCcw,
  Save,
  Zap,
  Shield,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  Brain,
} from "lucide-react";
import {
  baseOARData,
  calculateOARDose,
  calculateConformityIndex,
  calculateSelectivityIndex,
  calculateHealthyTissue,
  generateDVHCurve,
  dvhToSvgPath,
} from "@/lib/doseCalculations";
import { logAuditEvent } from "@/lib/auditLog";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const scenarios = [
  { name: "Conservative", dose: 10, collimator: 6, note: "Lower risk, marginally lower tumor control" },
  { name: "Standard (AI-recommended)", dose: 12, collimator: 8, note: "Optimal balance of tumor control/OAR protection" },
  { name: "Aggressivee", dose: 14, collimator: 10, note: "Higher tumor control but increased OAR risk" },
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
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiRisk, setAiRisk] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const currentDose = dose[0];
  const currentCollimator = collimator[0];

  // Dynamic OAR calculations
  const oarResults = useMemo(() => {
    return baseOARData.map(oar => {
      const calculated = calculateOARDose(oar, currentDose, currentCollimator);
      return {
        ...oar,
        currentDose: calculated,
        status: calculated > oar.maxDose ? ("warning" as const) : ("ok" as const),
      };
    });
  }, [currentDose, currentCollimator]);

  // Dynamic plan metrics
  const conformity = useMemo(() => calculateConformityIndex(currentDose, currentCollimator), [currentDose, currentCollimator]);
  const selectivity = useMemo(() => calculateSelectivityIndex(currentDose, currentCollimator), [currentDose, currentCollimator]);
  const healthyTissue = useMemo(() => calculateHealthyTissue(currentDose, currentCollimator), [currentDose, currentCollimator]);

  // Dynamic DVH curves
  const dvhGTV = useMemo(() => dvhToSvgPath(generateDVHCurve("gtv", currentDose)), [currentDose]);
  const dvhCTV = useMemo(() => dvhToSvgPath(generateDVHCurve("ctv", currentDose)), [currentDose]);
  const dvhOAR = useMemo(() => dvhToSvgPath(generateDVHCurve("oar", currentDose)), [currentDose]);

  // Isodose radii scale with dose
  const isoScale = currentDose / 12;

  const handleSimulate = useCallback(() => {
    setIsSimulating(true);
    logAuditEvent({
      eventType: "dose_plan_change",
      eventCategory: "planning",
      patientId: selectedPatient.id,
      description: `Simulation run: ${currentDose} Gy, collimator ${currentCollimator}mm, ${fractions[0]} fractions`,
      metadata: { dose: currentDose, collimator: currentCollimator, fractions: fractions[0] },
    });
    setTimeout(() => setIsSimulating(false), 2500);
  }, [currentDose, currentCollimator, fractions, selectedPatient.id]);

  const handleScenario = (i: number) => {
    setActiveScenario(i);
    setDose([scenarios[i].dose]);
    setCollimator([scenarios[i].collimator]);
    logAuditEvent({
      eventType: "scenario_selected",
      eventCategory: "planning",
      patientId: selectedPatient.id,
      description: `Scenario valt: ${scenarios[i].name}`,
    });
  };

  const requestAIRisk = async () => {
    setIsAILoading(true);
    setAiRisk("");
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamma-ai-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          requestType: "risk_assessment",
          patientData: selectedPatient,
          planData: { dose: currentDose, collimator: currentCollimator, fractions: fractions[0], conformity, selectivity, beamCount: plan.beamCount },
          oarData: oarResults.map(o => ({ name: o.name, dose: o.currentDose, limit: o.maxDose, status: o.status })),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "AI error");
      }
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { text += c; setAiRisk(text); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }
      logAuditEvent({
        eventType: "ai_recommendation",
        eventCategory: "ai",
        patientId: selectedPatient.id,
        description: "AI risk assessment generated",
        aiModelVersion: "gemini-3-flash-preview",
      });
      addNotification({
        type: "success",
        title: "AI risk assessment ready",
        description: `Risk analysis for ${selectedPatient.name} is generated and ready for clinical review.`,
        link: "/dashboard/planning",
      });
    } catch (e: any) {
      toast.error(e.message || "Could not generate risk assessment");
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Planningsassistent</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-genererad dosplanering â€” {selectedPatient.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setDose([12]); setCollimator([8]); setFractions([1]); setActiveScenario(1); }}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />Reset
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0"><Save className="w-3.5 h-3.5 mr-1.5" />Save plan</Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="card-medical overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Tabs value={planTab} onValueChange={setPlanTab}>
                <TabsList className="h-8">
                  <TabsTrigger value="dose" className="text-xs h-6 px-3">Dose distribution</TabsTrigger>
                  <TabsTrigger value="dvh" className="text-xs h-6 px-3">DVH</TabsTrigger>
                  <TabsTrigger value="beams" className="text-xs h-6 px-3">Beam paths</TabsTrigger>
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
                  <svg width="360" height="360" viewBox="0 0 360 360">
                    {/* Isodose curves scale with dose */}
                    <motion.ellipse cx="160" cy="155" rx={70 * isoScale} ry={65 * isoScale} fill="hsl(0 72% 51%)" opacity="0.06" stroke="hsl(0 72% 51%)" strokeWidth="1" strokeDasharray="3 2"
                      animate={isSimulating ? { rx: [70 * isoScale, 68 * isoScale, 70 * isoScale], ry: [65 * isoScale, 63 * isoScale, 65 * isoScale] } : {}} transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.ellipse cx="160" cy="155" rx={50 * isoScale} ry={45 * isoScale} fill="hsl(38 92% 50%)" opacity="0.08" stroke="hsl(38 92% 50%)" strokeWidth="1" strokeDasharray="3 2"
                      animate={isSimulating ? { rx: [50 * isoScale, 48 * isoScale, 50 * isoScale] } : {}} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }} />
                    <motion.ellipse cx="160" cy="155" rx={30 * isoScale} ry={28 * isoScale} fill="hsl(152 60% 42%)" opacity="0.1" stroke="hsl(152 60% 42%)" strokeWidth="1" strokeDasharray="3 2"
                      animate={isSimulating ? { rx: [30 * isoScale, 28 * isoScale, 30 * isoScale] } : {}} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
                    <motion.ellipse cx="160" cy="155" rx={16 * isoScale} ry={14 * isoScale} fill="hsl(187 80% 42%)" opacity="0.3" stroke="hsl(187 80% 42%)" strokeWidth="2"
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
                <div className="scan-line absolute inset-0 pointer-events-none" />
                <div className="absolute bottom-3 left-3 flex gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-red/40" /> 50%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-amber/50" /> 80%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-green/50" /> 95%</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-1 rounded bg-medical-cyan/50" /> Target</span>
                </div>
                <div className="absolute top-3 right-3 text-[10px] text-muted-foreground/60 font-mono text-right">
                  <p>Margindos: {currentDose} Gy</p>
                  <p>Kollimator: {currentCollimator}mm</p>
                </div>
              </div>
            )}

            {planTab === "dvh" && (
              <div className="relative h-[400px] bg-foreground/[0.03] p-6">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-4">Dose-volume histogram (DVH) — Calculated for {currentDose} Gy</p>
                <div className="relative h-[300px] border-l-2 border-b-2 border-muted-foreground/20">
                  {[100, 75, 50, 25, 0].map((v) => (
                    <div key={v} className="absolute left-0 text-[9px] text-muted-foreground -translate-x-8" style={{ bottom: `${v}%` }}>{v}%</div>
                  ))}
                  {Array.from({ length: 6 }, (_, i) => {
                    const maxAxis = Math.max(15, currentDose * 1.3);
                    const val = Math.round((i / 5) * maxAxis);
                    return (
                      <div key={i} className="absolute bottom-0 text-[9px] text-muted-foreground translate-y-4" style={{ left: `${(i / 5) * 100}%` }}>{val} Gy</div>
                    );
                  })}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path d={dvhGTV} fill="none" stroke="hsl(0 72% 51%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} key={`gtv-${currentDose}`} />
                    <motion.path d={dvhCTV} fill="none" stroke="hsl(187 80% 42%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }} key={`ctv-${currentDose}`} />
                    <motion.path d={dvhOAR} fill="none" stroke="hsl(38 92% 50%)" strokeWidth="0.8" opacity="0.8"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.4 }} key={`oar-${currentDose}`} />
                  </svg>
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
                        <span className="text-xs font-semibold text-foreground">Beam path {beam.id}</span>
                        <span className="text-[10px] text-medical-cyan font-medium">{beam.angle}Â°</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div><p className="text-muted-foreground">Vikt</p><p className="font-semibold text-foreground">{beam.weight}</p></div>
                        <div><p className="text-muted-foreground">Kollimator</p><p className="font-semibold text-foreground">{currentCollimator}mm</p></div>
                        <div><p className="text-muted-foreground">Isocenter</p><p className="font-semibold text-foreground">{beam.isocenterX}, {beam.isocenterY}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OAR constraints â€” now dynamic */}
          <motion.div variants={item} className="card-medical">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Shield className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-sm font-semibold text-foreground">OAR dose constraints</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">Calculated in real time</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold pb-2 border-b border-border">
                <span>Structure</span><span>Type</span><span>Limit</span><span>Current dose</span><span>Status</span>
              </div>
              {oarResults.map((oar, i) => (
                <div key={i} className="grid grid-cols-5 text-xs py-2.5 border-b border-border/50 items-center">
                  <span className="font-medium text-foreground">{oar.name}</span>
                  <span className="text-muted-foreground">{oar.limit}</span>
                  <span className="text-muted-foreground">{oar.maxDose} {oar.unit}</span>
                  <span className={`font-semibold ${oar.status === "ok" ? "text-medical-green" : "text-medical-amber"}`}>
                    {oar.currentDose} {oar.unit}
                  </span>
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

          {/* AI Risk Assessment */}
          {aiRisk !== null && (
            <motion.div variants={item} className="card-medical p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">AI risk assessment</h3>
                {isAILoading && <span className="text-[10px] text-muted-foreground animate-pulse">Generating...</span>}
              </div>
              <div className="prose prose-sm max-w-none text-xs text-foreground [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs">
                {/* Simple markdown-like rendering */}
                {aiRisk.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h3 key={i} className="font-semibold mt-3 mb-1 text-foreground">{line.slice(3)}</h3>;
                  if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-foreground">{line.slice(2, -2)}</p>;
                  if (line.startsWith("- ")) return <p key={i} className="ml-3 text-muted-foreground">• {line.slice(2)}</p>;
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} className="text-muted-foreground">{line}</p>;
                })}
              </div>
            </motion.div>
          )}
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
              {currentDose} Gy margin dose, {plan.beamCount} beams.
              CI: {conformity}. {oarResults.filter(o => o.status === "warning").length === 0
                ? "All OAR limits met."
                : `${oarResults.filter(o => o.status === "warning").map(o => o.name).join(", ")} exceed the limit.`}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-medical-green">
              <FileCheck className="w-3 h-3" />
              <span className="font-medium">Plan feasible — clinician verification required</span>
            </div>
            <Button size="sm" variant="outline" className="mt-3 text-[10px] w-full" onClick={requestAIRisk} disabled={isAILoading}>
              <Brain className="w-3 h-3 mr-1" />
              {isAILoading ? "Analyzing..." : "AI risk assessment"}
            </Button>
          </div>

          {/* Parameters */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Parametrar</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Margindos (Gy)</span>
                  <span className="font-semibold text-foreground">{currentDose} Gy</span>
                </div>
                <Slider value={dose} onValueChange={setDose} min={8} max={25} step={0.5} />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Kollimator (mm)</span>
                  <span className="font-semibold text-foreground">{currentCollimator} mm</span>
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

          {/* Plan metrics â€” dynamic */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Plan metrics</h3>
            <div className="space-y-3">
              {[
                { label: "Conformity Index", value: conformity, target: "< 1.5", good: conformity < 1.5, icon: Target },
                { label: "Selectivity", value: selectivity, target: "> 0.8", good: selectivity > 0.8, icon: Shield },
                { label: "Healthy tissue exp.", value: `${healthyTissue}%`, target: "< 5%", good: healthyTissue < 5, icon: Activity },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${m.good ? "bg-medical-green/10" : "bg-medical-amber/10"}`}>
                    <m.icon className={`w-3.5 h-3.5 ${m.good ? "text-medical-green" : "text-medical-amber"}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                  <span className={`text-[10px] font-medium ${m.good ? "text-medical-green" : "text-medical-amber"}`}>Target: {m.target}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Scenarion</h3>
            <div className="space-y-2">
              {scenarios.map((s, i) => {
                const ci = calculateConformityIndex(s.dose, s.collimator);
                const si = calculateSelectivityIndex(s.dose, s.collimator);
                const ht = calculateHealthyTissue(s.dose, s.collimator);
                const feasibility = ht < 4 ? 97 : ht < 5 ? 94 : 88;
                return (
                  <button
                    key={i}
                    onClick={() => handleScenario(i)}
                    className={`w-full text-left text-xs p-3 rounded-lg transition-colors ${
                      i === activeScenario ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${i === activeScenario ? "text-foreground" : "text-muted-foreground"}`}>{s.name}</span>
                      <span className="text-[10px] font-bold text-medical-cyan">{s.dose} Gy</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{s.note}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px]">
                      <span>CI: {ci}</span>
                      <span>SI: {si}</span>
                      <span className={`font-semibold ${feasibility >= 95 ? "text-medical-green" : feasibility >= 90 ? "text-medical-cyan" : "text-medical-amber"}`}>
                        Feasibility: {feasibility}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PlanningAssistant;








