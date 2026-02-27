import { useState } from "react";
import { motion } from "framer-motion";
import { patients, treatmentPlans } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import {
  FileText, Download, Printer, CheckCircle2, Clock, User, Target,
  Shield, AlertTriangle, Brain, HeartPulse, FileCheck, Scale, ShieldCheck,
  BookOpen, Stethoscope, Activity, BarChart3, ListChecks, ClipboardCheck,
} from "lucide-react";
import { logAuditEvent } from "@/lib/auditLog";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const ReportGenerator = () => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [aiReport, setAiReport] = useState<string>("");
  const { addNotification } = useNotifications();

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
            { name: "Brainstem", dose: 6.2, limit: 12.0 },
            { name: "N. facialis", dose: 8.1, limit: 8.0 },
            { name: "Optic chiasm", dose: 1.2, limit: 8.0 },
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
      addNotification({
        type: "success",
        title: "Rapport klar",
        description: `AI report for ${patient.name} is ready for review.`,
        link: "/dashboard/reports",
      });
      logAuditEvent({
        eventType: "report_generated",
        eventCategory: "report",
        patientId: patient.id,
        description: "AI-rapport genererad",
        aiModelVersion: "gemini-3-flash-preview",
      });
    } catch (e: any) {
      toast.error(e.message || "Could not generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Rapportgenerator</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-generated treatment reports — PDF & EMR compatible</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-medical-amber/10 border border-medical-amber/20">
            <Scale className="w-3.5 h-3.5 text-medical-amber" />
            <span className="text-[10px] font-semibold text-medical-amber">High-risk AI (EU AI Act)</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              {isGenerating ? "Genererar..." : "Generera rapport"}
            </Button>
            <Button variant="outline" size="sm" disabled={!reportReady}><Printer className="w-3.5 h-3.5 mr-1.5" />Print</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0" disabled={!reportReady}>
              <Download className="w-3.5 h-3.5 mr-1.5" />Exportera PDF
            </Button>
          </div>
        </div>
      </motion.div>

      {/* EU AI Act compliance notice */}
      <motion.div variants={item} className="bg-muted/30 border border-border rounded-xl p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-medical-cyan shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p className="font-semibold text-foreground text-xs">EU AI Act — High-risk AI (2024/1689)</p>
            <p>Reports are generated by AI and include step-by-step reasoning (Art. 13), confidence levels, limitations, 
            and requirements for human verification (Art. 14). All generations are logged automatically with timestamp and AI version (Art. 12).</p>
          </div>
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
            <span>Analyzing patient data, radiation plan, and dose distribution</span>
            <span>{Math.round(generationProgress)}%</span>
          </div>
        </motion.div>
      )}

      {/* Report preview */}
      {(aiReport || !isGenerating) && (
        <motion.div variants={item} className="card-medical-elevated">
          {/* Report header */}
          <div className="p-8 border-b border-border gradient-hero text-primary-foreground rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 opacity-60" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-60">Behandlingsrapport</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 font-medium">CE-marked</span>
                </div>
                <h2 className="text-xl font-bold mt-1">Gamma Knife Radiosurgery</h2>
                <p className="text-sm opacity-70 mt-1">GammaAI â€” Automatisk rapportgenerering v2.1</p>
              </div>
              <div className="text-right text-xs opacity-70 space-y-1">
                <p>Rapport-ID: GK-2025-{patient.id.slice(-3)}</p>
                <p>Datum: {new Date().toLocaleDateString("sv-SE")}</p>
                <p className="flex items-center gap-1 justify-end mt-1">
                  <CheckCircle2 className="w-3 h-3" /> {reportReady ? "AI-verified" : "Waiting for generation"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Static patient info section */}
            <section>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Patientinformation</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Namn", value: patient.name, icon: User },
                  { label: "Age", value: `${patient.age} years`, icon: Activity },
                  { label: "Diagnosis", value: patient.diagnosis, icon: Stethoscope },
                  { label: "Lokalisation", value: patient.location, icon: Target },
                ].map((f, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <f.icon className="w-3 h-3 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{f.label}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI-generated report content */}
            {aiReport ? (
              <section>
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-medical-cyan/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-medical-cyan" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">AI-generated clinical report</h3>
                  {reportReady && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-medical-green/10 text-medical-green border border-medical-green/20 font-medium">
                      Komplett
                    </span>
                  )}
                </div>
                <div className="report-markdown bg-muted/10 rounded-xl border border-border/50 p-8">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-foreground mt-8 mb-4 pb-3 border-b border-border flex items-center gap-2.5">
                          <ClipboardCheck className="w-5 h-5 text-medical-cyan shrink-0" />
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-foreground mt-8 mb-3 pb-2 border-b border-border/50 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold text-foreground mt-6 mb-2 flex items-center gap-2">
                          <ListChecks className="w-3.5 h-3.5 text-medical-cyan shrink-0" />
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-muted-foreground">{children}</em>
                      ),
                      ul: ({ children }) => (
                        <ul className="space-y-2 mb-5 ml-1">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="space-y-2 mb-5 ml-1 list-decimal list-inside">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-medical-cyan/60 shrink-0 mt-2" />
                          <span>{children}</span>
                        </li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-[3px] border-medical-cyan/40 pl-4 py-2 my-4 bg-medical-cyan/[0.03] rounded-r-lg">
                          <div className="text-sm text-muted-foreground italic">{children}</div>
                        </blockquote>
                      ),
                      hr: () => <hr className="my-6 border-border" />,
                      table: ({ children }) => (
                        <div className="my-5 rounded-xl border border-border overflow-hidden">
                          <table className="w-full text-sm">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-muted/40">{children}</thead>
                      ),
                      th: ({ children }) => (
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wider">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2.5 text-sm text-muted-foreground border-t border-border/50">{children}</td>
                      ),
                      code: ({ children, className }) => {
                        if (className) {
                          return (
                            <pre className="bg-muted/40 rounded-lg p-4 my-4 overflow-x-auto">
                              <code className="text-xs font-mono text-foreground">{children}</code>
                            </pre>
                          );
                        }
                        return (
                          <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground">{children}</code>
                        );
                      },
                    }}
                  >
                    {aiReport}
                  </ReactMarkdown>
                </div>
              </section>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Brain className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p className="text-base font-medium">Click "Generate report" to create an AI-driven treatment report</p>
                <p className="text-sm mt-2 opacity-60">The report is generated in real time with streaming and includes AI transparency</p>
              </div>
            )}

            {/* Compliance section */}
            <section className="border-t border-border pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-medical-green/10 flex items-center justify-center">
                      <HeartPulse className="w-4 h-4 text-medical-green" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">Regulatorisk information</h4>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-2 bg-muted/20 rounded-xl p-4">
                    <p><strong className="text-foreground">Classification:</strong> High-risk AI (EU AI Act 2024/1689, Annex I, 5(b))</p>
                    <p><strong className="text-foreground">System:</strong> GammaAI v2.1.0 — CE-marked medical software</p>
                    <p><strong className="text-foreground">AI-modell:</strong> Gemini 3 Flash Preview â€” AI Gateway</p>
                    <p><strong className="text-foreground">Transparency (Art. 13):</strong> AI explains reasoning step by step</p>
                    <p><strong className="text-foreground">Human oversight (Art. 14):</strong> Requires clinical verification</p>
                    <p><strong className="text-foreground">Logging (Art. 12):</strong> All decisions are tracked in the audit log</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-medical-amber/10 flex items-center justify-center">
                      <FileCheck className="w-4 h-4 text-medical-amber" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">Clinical verification</h4>
                  </div>
                  <div className="bg-medical-amber/5 border border-medical-amber/20 rounded-xl p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-medical-amber shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        This report is AI-generated and requires verification and signature by the responsible physician before clinical use.
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-medical-amber/10 space-y-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Signatur</p>
                        <div className="h-8 border-b border-dashed border-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Datum</p>
                        <div className="h-8 border-b border-dashed border-muted-foreground/30" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-4 flex justify-between text-[10px] text-muted-foreground">
              <div className="space-y-0.5">
                <p className="flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Generated by GammaAI v2.1 — AI-assisted treatment planning
                </p>
                <p>Clinician-in-the-loop: All AI suggestions require manual verification.</p>
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









