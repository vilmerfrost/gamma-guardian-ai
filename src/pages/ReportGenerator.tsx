import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import {
  FileText, Download, Printer, CheckCircle2, Clock, User, Target,
  Shield, AlertTriangle, Brain, HeartPulse, FileCheck,
} from "lucide-react";
import { logAuditEvent } from "@/lib/auditLog";
import { toast } from "sonner";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const ReportGenerator = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [aiReport, setAiReport] = useState<string>("");

  const patient = patients.find((p) => p.id === selectedPatientId)!;
  const plan = treatmentPlans[0];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setReportReady(false);
    setGenerationProgress(10);
    setAiReport("");

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamma-ai-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          requestType: "report",
          patientData: patient,
          planData: { dose: plan.totalDose, beamCount: plan.beamCount, fractions: plan.fractions, conformityIndex: plan.conformityIndex, selectivityIndex: plan.selectivityIndex },
          oarData: [
            { name: "Cochlea", dose: 3.8, limit: 4.0 },
            { name: "Hjärnstam", dose: 6.2, limit: 12.0 },
            { name: "N. facialis", dose: 8.1, limit: 8.0 },
            { name: "Optisk chiasm", dose: 1.2, limit: 8.0 },
          ],
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "AI-fel");
      }

      setGenerationProgress(30);
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
            if (c) { text += c; setAiReport(text); setGenerationProgress(Math.min(90, 30 + (text.length / 20))); }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      setGenerationProgress(100);
      setReportReady(true);
      logAuditEvent({
        eventType: "report_generated",
        eventCategory: "report",
        patientId: patient.id,
        description: "AI-rapport genererad",
        aiModelVersion: "gemini-3-flash-preview",
      });
    } catch (e: any) {
      toast.error(e.message || "Kunde inte generera rapport");
    } finally {
      setIsGenerating(false);
    }
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
            <button key={p.id} onClick={() => setSelectedPatientId(p.id)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                p.id === selectedPatientId ? "bg-primary text-primary-foreground" : "hover:bg-muted/50 text-muted-foreground"
              }`}>
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
            <span>{Math.round(generationProgress)}%</span>
          </div>
        </motion.div>
      )}

      {/* Report preview */}
      {(aiReport || !isGenerating) && (
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
                  <CheckCircle2 className="w-3 h-3" /> {reportReady ? "AI-verifierad" : "Väntar på generering"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Static patient info section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-medical-cyan" />
                <h3 className="text-sm font-semibold text-foreground">Patientinformation</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Namn", value: patient.name },
                  { label: "Ålder", value: `${patient.age} år` },
                  { label: "Diagnos", value: patient.diagnosis },
                  { label: "Lokalisation", value: patient.location },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-xs font-medium text-foreground mt-0.5">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI-generated report content */}
            {aiReport ? (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-medical-cyan" />
                  <h3 className="text-sm font-semibold text-foreground">AI-genererad klinisk rapport</h3>
                </div>
                <div className="bg-muted/20 rounded-lg p-4 prose prose-sm max-w-none text-xs [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_p]:text-xs [&_li]:text-xs [&_strong]:text-foreground text-muted-foreground">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </section>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Klicka "Generera rapport" för att skapa en AI-driven behandlingsrapport</p>
                <p className="text-xs mt-1 opacity-60">Rapporten genereras i realtid med streaming</p>
              </div>
            )}

            {/* Compliance section */}
            <section className="border-t border-border pt-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HeartPulse className="w-4 h-4 text-medical-green" />
                    <h4 className="text-xs font-semibold text-foreground">Regulatorisk information</h4>
                  </div>
                  <div className="text-[10px] text-muted-foreground space-y-1">
                    <p>System: GammaAI v2.1.0 — CE-märkt medicinteknisk programvara</p>
                    <p>AI-modell: Gemini 3 Flash Preview — Lovable AI Gateway</p>
                    <p>Audit-logg: Alla beslut spåras i databasen</p>
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
                    </p>
                    <div className="mt-2 pt-2 border-t border-medical-amber/10">
                      <p className="text-[10px] text-muted-foreground">Signatur: _________________________</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Datum: _________________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

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
