import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const ReportGenerator = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(true);

  const patient = patients.find((p) => p.id === selectedPatientId)!;
  const plan = treatmentPlans[0];

  const handleGenerate = () => {
    setIsGenerating(true);
    setReportReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
    }, 2500);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Rapportgenerator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-genererade behandlingsrapporter</p>
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
                p.id === selectedPatientId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Report preview */}
      {reportReady && (
        <motion.div variants={item} className="card-medical-elevated">
          {/* Report header */}
          <div className="p-6 border-b border-border gradient-hero text-primary-foreground rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest opacity-60">Behandlingsrapport</p>
                <h2 className="text-lg font-bold mt-1">Gamma Knife Radiosurgery</h2>
                <p className="text-xs opacity-70 mt-0.5">GammaAI — Automatisk rapportgenerering</p>
              </div>
              <div className="text-right text-xs opacity-70">
                <p>Rapport-ID: GK-2025-{patient.id.slice(-3)}</p>
                <p>Datum: {new Date().toLocaleDateString("sv-SE")}</p>
                <p className="flex items-center gap-1 justify-end mt-1">
                  <CheckCircle2 className="w-3 h-3" /> AI-verifierad
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient info section */}
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
                <h3 className="text-sm font-semibold text-foreground">Dosfördelning</h3>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="space-y-2.5">
                  {[
                    { struct: "Tumör (GTV)", dose: "12.0 Gy", coverage: "99.2%", status: "ok" },
                    { struct: "Cochlea", dose: "3.8 Gy", coverage: "Max", status: "ok" },
                    { struct: "Hjärnstam", dose: "6.2 Gy", coverage: "Max", status: "ok" },
                    { struct: "N. facialis", dose: "8.1 Gy", coverage: "Max", status: "warning" },
                    { struct: "Optisk chiasm", dose: "1.2 Gy", coverage: "Max", status: "ok" },
                  ].map((d, i) => (
                    <div key={i} className="flex items-center text-xs">
                      <span className="w-32 text-muted-foreground">{d.struct}</span>
                      <span className="w-20 font-medium text-foreground">{d.dose}</span>
                      <span className="w-16 text-muted-foreground">{d.coverage}</span>
                      <span className={`ml-auto font-medium ${d.status === "ok" ? "text-medical-green" : "text-medical-amber"}`}>
                        {d.status === "ok" ? "✓ Inom gräns" : "⚠ Gränsvärde"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI comments */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-medical-amber" />
                <h3 className="text-sm font-semibold text-foreground">Risker och avvikelser</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-medical-amber/5 border border-medical-amber/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>Nervus facialis-exponering:</strong> Dosen till N. facialis (8.1 Gy) ligger nära gränsvärdet (8 Gy).
                    Rekommendation: Överväg justering av isocentrum 1.2mm lateralt för att reducera exponeringen.
                    Risk för permanent facialispares bedöms till {"<1%"} vid aktuell dos.
                  </p>
                </div>
                <div className="bg-medical-green/5 border border-medical-green/20 rounded-lg p-3">
                  <p className="text-xs text-foreground leading-relaxed">
                    <strong>Hörselbevarande:</strong> Cochlea-dos (3.8 Gy) väl inom gränsvärde ({"<4 Gy"}).
                    Sannolikhet för bevarad serviceable hörsel: 73% baserat på Gardner-Robertson-skalan.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-4 flex justify-between text-[10px] text-muted-foreground">
              <div>
                <p>Genererad av GammaAI v2.1 — AI-assisterad behandlingsplanering</p>
                <p>Denna rapport kräver verifiering av ansvarig läkare innan kliniskt bruk.</p>
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
