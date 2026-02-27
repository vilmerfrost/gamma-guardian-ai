import { Suspense, lazy, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap, ArrowRight, Brain, Target, FileText, Shield, Clock,
  ChevronRight, Activity, Building2, CheckCircle2, Users,
  BarChart3, Cpu, Lock, Globe, Play, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BrainScene = lazy(() => import("@/components/BrainScene"));

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const features = [
  {
    icon: Brain,
    title: "AI Tumor Segmentation",
    desc: "Automatic segmentation of GTV, CTV and critical brain structures (OAR) with sub-millimeter precision using deep learning.",
    color: "text-medical-cyan",
    bg: "bg-medical-cyan/10",
    border: "border-medical-cyan/20",
  },
  {
    icon: Target,
    title: "Radiation Planning Assistant",
    desc: "AI-generated dose distribution suggestions with real-time DVH curves, OAR dose constraints, and multi-scenario optimization.",
    color: "text-medical-green",
    bg: "bg-medical-green/10",
    border: "border-medical-green/20",
  },
  {
    icon: FileText,
    title: "Automated Report Generation",
    desc: "Streaming AI-generated clinical reports with EU AI Act compliance, audit trails, and one-click PDF export.",
    color: "text-medical-purple",
    bg: "bg-medical-purple/10",
    border: "border-medical-purple/20",
  },
];

const stats = [
  { value: "96.8%", label: "Segmentation accuracy", icon: Cpu },
  { value: "<30s", label: "Planning time", icon: Clock },
  { value: "100%", label: "Audit traceability", icon: Shield },
  { value: "EU AI Act", label: "Fully compliant", icon: CheckCircle2 },
];

const enterpriseFeatures = [
  { icon: Building2, text: "Elekta Gamma Knife integration ready" },
  { icon: Globe, text: "PACS/DICOM & HL7 FHIR compatible" },
  { icon: Lock, text: "MDR-compliant audit logging" },
  { icon: Users, text: "Multi-clinician workflow support" },
  { icon: Shield, text: "EU AI Act high-risk classification" },
  { icon: Activity, text: "Real-time AI performance monitoring" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoActive, setDemoActive] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center glow-cyan">
              <Zap className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground tracking-tight">GammaAI</span>
              <span className="text-[9px] text-muted-foreground ml-2 uppercase tracking-widest">Gamma Knife Suite</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground border-0 text-xs" onClick={() => navigate("/auth")}>
              Request Access <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 medical-grid opacity-30" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-medical-cyan/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

        <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 uppercase tracking-wider">
                  AI-Powered Radiosurgery
                </span>
                <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-medical-green/10 text-medical-green border border-medical-green/20 uppercase tracking-wider">
                  CE-Marked
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                AI-powered Gamma Knife planning assistant that{" "}
                <span className="text-gradient-accent">automatically segments tumors</span>{" "}
                and suggests optimal radiation plans in seconds.
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-xl">
                Gamma Guardian AI helps neurosurgeons and radiation specialists increase precision, reduce planning time, and improve patient safety.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mt-8">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 h-12 px-6" onClick={() => {
                  setDemoActive(true);
                  document.getElementById("demo-section")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  <Play className="w-4 h-4 mr-2" /> View Demo
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-6" onClick={() => navigate("/auth")}>
                  Login <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button size="lg" variant="ghost" className="h-12 px-6 text-medical-cyan" onClick={() => navigate("/auth")}>
                  Request Access <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <s.icon className="w-4 h-4 text-medical-cyan mx-auto mb-1.5" />
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* 3D Hero visualization */}
            <motion.div variants={fadeUp} className="relative h-[420px] lg:h-[500px]">
              <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 bg-foreground/[0.02]">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-muted-foreground">Loading 3D...</span>
                    </div>
                  </div>
                }>
                  <BrainScene showGTV showCTV showOAR autoRotate />
                </Suspense>
              </div>
              <div className="absolute top-4 left-4 text-[10px] font-semibold text-medical-cyan bg-medical-cyan/10 px-2.5 py-1 rounded-lg border border-medical-cyan/20 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Live 3D — WebGL
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] text-muted-foreground/60 font-mono bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
                Drag to rotate · Scroll to zoom
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border/50">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical-amber/10 border border-medical-amber/20 mb-6">
            <Clock className="w-3.5 h-3.5 text-medical-amber" />
            <span className="text-xs font-semibold text-medical-amber">The Problem</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Manual planning takes too long and introduces variability
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-muted-foreground mt-6 leading-relaxed max-w-3xl mx-auto">
            Gamma Knife treatment planning currently requires manual tumor segmentation and radiation planning, which can take{" "}
            <strong className="text-foreground">30–90 minutes per patient</strong> and introduces variability and human error.
          </motion.p>
          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { val: "30–90 min", label: "per patient planning time", icon: Clock },
              { val: "Variable", label: "inter-observer consistency", icon: Users },
              { val: "Manual", label: "contouring introduces error", icon: BarChart3 },
            ].map((item, i) => (
              <div key={i} className="card-medical p-6 text-center">
                <item.icon className="w-6 h-6 text-medical-amber mx-auto mb-3" />
                <p className="text-2xl font-bold text-foreground">{item.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Solution + Features */}
      <section className="py-20 px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical-cyan/10 border border-medical-cyan/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-medical-cyan" />
              <span className="text-xs font-semibold text-medical-cyan">The Solution</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              AI-assisted planning in seconds, not hours
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
              Gamma Guardian AI automatically analyzes MRI/CT scans, segments tumors and critical brain structures, and assists with optimal radiation planning in seconds.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className={`card-medical-elevated p-8 border ${f.border} hover:shadow-lg transition-shadow duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Demo */}
      <section id="demo-section" className="py-20 px-6 bg-muted/20 border-y border-border/50">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-medical-green/10 border border-medical-green/20 mb-6">
              <Play className="w-3.5 h-3.5 text-medical-green" />
              <span className="text-xs font-semibold text-medical-green">Interactive Demo</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              See it in action
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-3">
              Explore the AI segmentation and 3D brain visualization with demo patient data
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="grid lg:grid-cols-2 gap-6">
            {/* MRI Viewer */}
            <div className="card-medical-elevated overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-medical-cyan" />
                  <span className="text-sm font-semibold text-foreground">MRI Viewer — Axial Slice</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-medical-red/10 text-medical-red border border-medical-red/20 font-medium">GTV</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-medical-purple/10 text-medical-purple border border-medical-purple/20 font-medium">CTV</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-medical-amber/10 text-medical-amber border border-medical-amber/20 font-medium">OAR</span>
                </div>
              </div>
              <div className="relative h-[360px] bg-foreground/[0.02] medical-grid flex items-center justify-center">
                <svg width="300" height="300" viewBox="0 0 340 340" className="opacity-90">
                  <ellipse cx="170" cy="170" rx="145" ry="155" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="1.5" opacity="0.4" />
                  <ellipse cx="170" cy="165" rx="120" ry="125" fill="hsl(215 15% 45%)" opacity="0.15" />
                  <ellipse cx="170" cy="170" rx="90" ry="100" fill="hsl(215 15% 40%)" opacity="0.1" />
                  <motion.ellipse cx="120" cy="130" rx="18" ry="15" fill="hsl(0 72% 51%)" opacity="0.35" stroke="hsl(0 72% 51%)" strokeWidth="2"
                    animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                  <ellipse cx="120" cy="130" rx="26" ry="22" fill="none" stroke="hsl(260 55% 50%)" strokeWidth="1.5" strokeDasharray="4 3" />
                  <motion.ellipse cx="120" cy="130" rx="22" ry="19" fill="none" stroke="hsl(187 80% 42%)" strokeWidth="1.5" strokeDasharray="4 2"
                    animate={{ strokeDashoffset: [0, -12] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  <circle cx="100" cy="190" r="8" fill="hsl(38 92% 50%)" opacity="0.15" stroke="hsl(38 92% 50%)" strokeWidth="1.5" />
                  <ellipse cx="170" cy="220" rx="22" ry="14" fill="hsl(38 92% 50%)" opacity="0.08" stroke="hsl(38 92% 50%)" strokeWidth="1" strokeDasharray="3 2" />
                  {[0, 45, 90, 135, 180].map((a, i) => (
                    <line key={i} x1={120 + Math.cos((a * Math.PI) / 180) * 120} y1={130 + Math.sin((a * Math.PI) / 180) * 120}
                      x2="120" y2="130" stroke="hsl(187 80% 42%)" strokeWidth="0.5" opacity="0.3" />
                  ))}
                </svg>
                <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground">
                  Patient: Anna Lindström — Vestibularisschwannom
                </div>
              </div>
            </div>

            {/* 3D Brain */}
            <div className="card-medical-elevated overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-medical-cyan" />
                  <span className="text-sm font-semibold text-foreground">3D Brain Reconstruction</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-medical-cyan/10 text-medical-cyan border border-medical-cyan/20 font-medium">
                  WebGL
                </span>
              </div>
              <div className="relative h-[360px]">
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                  <BrainScene showGTV showCTV showOAR autoRotate />
                </Suspense>
                <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/60">
                  Drag to rotate · Scroll to zoom
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enterprise */}
      <section className="py-20 px-6">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-5xl mx-auto">
          <div className="card-medical-elevated overflow-hidden">
            <div className="gradient-hero p-12 md:p-16 text-primary-foreground">
              <motion.div variants={fadeUp} className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Enterprise</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  For hospitals, clinics, and Elekta Gamma Knife systems
                </h2>
                <p className="text-lg opacity-70 mt-4 max-w-2xl mx-auto">
                  Gamma Guardian AI integrates with your existing clinical workflow—PACS, EMR, and Gamma Knife hardware—to deliver AI-assisted planning at enterprise scale.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="grid md:grid-cols-3 gap-4 mt-12">
                {enterpriseFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
                    <f.icon className="w-5 h-5 opacity-70 shrink-0" />
                    <span className="text-sm">{f.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="text-center mt-12">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8" onClick={() => navigate("/auth")}>
                  Contact / Request Access <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-accent flex items-center justify-center">
              <Zap className="w-3 h-3 text-accent-foreground" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">GammaAI — Gamma Knife Radiosurgery Suite</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
            <Link to="/medical-disclaimer" className="hover:text-foreground">Medical Disclaimer</Link>
            <span>•</span>
            <span>EU AI Act Compliant</span>
            <span>•</span>
            <span>CE-Marked</span>
            <span>•</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


