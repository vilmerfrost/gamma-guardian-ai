import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  User,
  Target,
  Shield,
  AlertTriangle,
  Brain,
  HeartPulse,
  FileCheck,
  BarChart3,
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const ReportGenerator = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(true);
  const [generationProgress, setGenerationProgress] = useState(0);

  const patient = patients.find((p) => p.id === selectedPatientId)!;
  const plan = treatmentPlans[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setReportReady(false);
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 4;
      });
    }, 100);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
      clearInterval(interval);
      setGenerationProgress(100);
    }, 2500);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Rapportgenerator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-genererade behandlingsrapporter — PDF & EMR-kompatibel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            {isGenerating ? "Genererar..." : "Generera rapport"}
          </Button>
          <Button variant="outline" size="sm" disabled={!reportReady}><Printer className="w-3.5 h-3.5 mr-1.5" />Skriv ut</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground border-0" disabled={!reportReady}>
            <Download className="w-3.5 h-3.5 mr-1.5" />Exportera PDF
          </Button>
        </div>
      </motion.div>

      {/* Patient selector */}
      <motion.div variants={item} className="card-medical p-3">
        <div className="flex gap-2 overflow-x-auto">
          {patients.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                p.id === selectedPatientId ? "bg-primary text-primary-foreground" : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Generation progress */}
      {isGenerating && (
        <motion.div variants={item} className="card-medical p-4">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-4 h-4 text-medical-cyan animate-pulse-glow" />
            <span className="text-sm font-semibold text-foreground">AI genererar rapport...</span>
          </div>
          <Progress value={generationProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>Analyserar patientdata, strålplan och dosfördelning</span>
            <span>{generationProgress}%</span>
          </div>
        </motion.div>
      )}

      {/* Report preview */}
      {reportReady && (
        <motion.div variants={item} className="card-medical-elevated">
          {/* Report header */}
          <div className="p-6 border-b border-border gradient-hero text-primary-foreground rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Behandlingsrapport</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-medium">CE-märkt</span>
                </div>
                <h2 className="text-lg font-bold mt-1">Gamma Knife Radiosurgery</h2>
                <p className="text-xs opacity-70 mt-0.5">GammaAI — Automatisk rapportgenerering v2.1</p>
              </div>
              <div className="text-right text-xs opacity-70">
                <p>Rapport-ID: GK-2025-{patient.id.slice(-3)}</p>
                <p>Datum: {new Date().toLocaleDateString("sv-SE")}</p>
                <p className="flex items-center gap-1 justify-end mt-1">
                  <CheckCircle2 className="w-3 h-3" /> AI-verifierad
                </p>
                <p className="flex items-center gap-1 justify-end mt-0.5 text-medical-amber">
                  <AlertTriangle className="w-3 h-3" /> Kräver kliniker-signatur
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient info */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">Patientinformation</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Namn", value: patient.name },
                  { label: "Ålder", value: `${patient.age} år` },
                  { label: "Kön", value: patient.gender },
                  { label: "Patient-ID", value: patient.id },
                  { label: "Diagnos", value: patient.diagnosis },
                  { label: "Tumörtyp", value: patient.tumorType },
                  { label: "Storlek", value: patient.tumorSize },
                  { label: "Lokalisation", value: patient.location },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI segmentation summary */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">AI-segmentering</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "GTV-volym", value: "1.23 cm³" },
                  { label: "CTV-volym", value: "2.41 cm³" },
                  { label: "Segmenteringskonfidens", value: "96.8%" },
                  { label: "Dice-koefficient", value: "0.94" },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Treatment plan */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">Strålplan</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Antal strålar", value: `${plan.beamCount}` },
                  { label: "Total dos", value: `${plan.totalDose} Gy` },
                  { label: "Fraktioner", value: `${plan.fractions}` },
                  { label: "Conformity Index", value: `${plan.conformityIndex}` },
                  { label: "Selectivity Index", value: `${plan.selectivityIndex}` },
                  { label: "Kollimatorer", value: "4mm, 8mm, 14mm" },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Dose distribution */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">Dosfördelning & OAR-doser</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold pb-2 border-b border-border">
                  <span>Struktur</span><span>Dos</span><span>Typ</span><span>Gräns</span><span>Status</span>
                </div>
                {[
                  { struct: "Tumör (GTV)", dose: "12.0 Gy", type: "Margindos", limit: "Rx", status: "ok" },
                  { struct: "GTV-täckning", dose: "99.2%", type: "Volym", limit: ">95%", status: "ok" },
                  { struct: "Cochlea", dose: "3.8 Gy", type: "Max", limit: "<4 Gy", status: "ok" },
                  { struct: "Hjärnstam", dose: "6.2 Gy", type: "Max", limit: "<12 Gy", status: "ok" },
                  { struct: "N. facialis", dose: "8.1 Gy", type: "Max", limit: "<8 Gy", status: "warning" },
                  { struct: "Optisk chiasm", dose: "1.2 Gy", type: "Max", limit: "<8 Gy", status: "ok" },
                  { struct: "Optisk nerv", dose: "2.4 Gy", type: "Max", limit: "<8 Gy", status: "ok" },
                ].map((d, i) => (
                  <div key={i} className="grid grid-cols-5 items-center text-xs py-2 border-b border-border/50">
                    <span className="text-foreground font-medium">{d.struct}</span>
                    <span className="font-semibold text-foreground">{d.dose}</span>
                    <span className="text-muted-foreground">{d.type}</span>
                    <span className="text-muted-foreground">{d.limit}</span>
                    <span className={`font-medium flex items-center gap-1 ${d.status === "ok" ? "text-medical-green" : "text-medical-amber"}`}>
                      {d.status === "ok" ? <><CheckCircle2 className="w-3 h-3" /> Inom gräns</> : <><AlertTriangle className="w-3 h-3" /> Gränsvärde</>}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* AI comments */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-medical-amber" />
                <h3 className="text-sm font-semibold text-foreground">AI-analys: Risker och avvikelser</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-medical-amber/5 border border-medical-amber/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>Nervus facialis-exponering:</strong> Dosen till N. facialis (8.1 Gy) överstiger gränsvärdet (8 Gy) marginellt.
                    Rekommendation: Justera isocentrum 1.2mm lateralt för att reducera exponeringen till &lt;7.5 Gy.
                    Risk för permanent facialispares bedöms till &lt;1% vid aktuell dos.
                  </p>
                </div>
                <div className="bg-medical-green/5 border border-medical-green/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>Hörselbevarande:</strong> Cochlea-dos (3.8 Gy) väl inom gränsvärde (&lt;4 Gy).
                    Sannolikhet för bevarad serviceable hörsel: 73% baserat på Gardner-Robertson-skalan.
                  </p>
                </div>
                <div className="bg-medical-cyan/5 border border-medical-cyan/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>AI-konfidensnivå:</strong> Segmenteringsnoggrannhet 96.8% (mål ≥95%). Alla AI-beslut
                    är spårbara och kan granskas i bildanalys-modulen. Explainable AI-loggar finns tillgängliga.
                  </p>
                </div>
              </div>
            </section>

            {/* Compliance & signature */}
            <section className="border-t border-border pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="w-4 h-4 text-medical-green" />
                    <h4 className="text-xs font-semibold text-foreground">Regulatorisk information</h4>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p>System: GammaAI v2.1.0 — CE-märkt medicinteknisk programvara</p>
                    <p>AI-modell: GammaNet v3.2 — Validerad mot 2,400 kliniska fall</p>
                    <p>Kompatibilitet: Elekta Leksell GammaPlan</p>
                    <p>Format: PDF/A-1b, HL7 FHIR (EMR-kompatibel)</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-4 h-4 text-medical-amber" />
                    <h4 className="text-xs font-semibold text-foreground">Klinisk verifiering</h4>
                  </div>
                  <div className="bg-medical-amber/5 border border-medical-amber/20 rounded-lg p-3">
                    <p className="text-[10px] text-muted-foreground">
                      Denna rapport är AI-genererad och kräver verifiering och signatur av ansvarig läkare innan kliniskt bruk.
                      AI stödjer — klinikern beslutar.
                    </p>
                    <div className="mt-2 pt-2 border-t border-medical-amber/10">
                      <p className="text-[10px] text-muted-foreground">Signatur: _________________________</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Datum: _________________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-4 flex justify-between text-[10px] text-muted-foreground">
              <div>
                <p>Genererad av GammaAI v2.1 — AI-assisterad behandlingsplanering</p>
                <p>Kliniker-in-the-loop: Alla AI-förslag kräver manuell verifiering.</p>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date().toLocaleString("sv-SE")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReportGenerator;
