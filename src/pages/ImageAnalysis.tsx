import { useState } from "react";
import { motion } from "framer-motion";
import { patients } from "@/data/mockData";
import {
  Upload,
  Layers,
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3X3,
  Brain,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const ImageAnalysis = () => {
  const [selectedPatient] = useState(patients[0]);
  const [activeView, setActiveView] = useState<"axial" | "sagittal" | "coronal">("axial");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Patientbildanalys</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-segmentering och 3D-visualisering</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Image viewer */}
        <motion.div variants={item} className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="card-medical p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ZoomIn className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><RotateCcw className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Maximize2 className="w-4 h-4" /></Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Grid3X3 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Layers className="w-4 h-4" /></Button>
            </div>
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="axial" className="text-xs h-6 px-3">Axial</TabsTrigger>
                <TabsTrigger value="sagittal" className="text-xs h-6 px-3">Sagittal</TabsTrigger>
                <TabsTrigger value="coronal" className="text-xs h-6 px-3">Koronal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main scan view */}
          <div className="card-medical overflow-hidden">
            <div className="relative h-[400px] md:h-[500px] bg-foreground/[0.03] medical-grid">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Brain cross-section mock */}
                  <svg width="340" height="340" viewBox="0 0 340 340" className="opacity-90">
                    {/* Skull outline */}
                    <ellipse cx="170" cy="170" rx="145" ry="155" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="1.5" opacity="0.4" />
                    <ellipse cx="170" cy="170" rx="130" ry="140" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="0.5" opacity="0.2" />
                    {/* Brain tissue regions */}
                    <ellipse cx="170" cy="165" rx="120" ry="125" fill="hsl(215 15% 45%)" opacity="0.15" />
                    <ellipse cx="170" cy="170" rx="90" ry="100" fill="hsl(215 15% 40%)" opacity="0.1" />
                    {/* Ventricles */}
                    <ellipse cx="155" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(-5 155 155)" />
                    <ellipse cx="185" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(5 185 155)" />
                    {/* Tumor - highlighted */}
                    <motion.ellipse
                      cx="120" cy="130" rx="18" ry="15"
                      fill="hsl(0 72% 51%)" opacity="0.35"
                      stroke="hsl(0 72% 51%)" strokeWidth="2"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* AI segmentation contour */}
                    <motion.ellipse
                      cx="120" cy="130" rx="22" ry="19"
                      fill="none"
                      stroke="hsl(187 80% 42%)" strokeWidth="1.5" strokeDasharray="4 2"
                      animate={{ strokeDashoffset: [0, -12] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Critical structure warning */}
                    <circle cx="100" cy="190" r="8" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="1.5" opacity="0.7" />
                    {/* Midline */}
                    <line x1="170" y1="30" x2="170" y2="310" stroke="hsl(187 80% 42%)" strokeWidth="0.5" opacity="0.3" strokeDasharray="6 4" />
                    {/* Grid crosshair */}
                    <line x1="0" y1="170" x2="340" y2="170" stroke="hsl(215 20% 60%)" strokeWidth="0.3" opacity="0.3" />
                    <line x1="170" y1="0" x2="170" y2="340" stroke="hsl(215 20% 60%)" strokeWidth="0.3" opacity="0.3" />
                  </svg>
                  {/* Labels */}
                  <div className="absolute text-[10px] font-medium text-medical-red" style={{ top: "25%", left: "20%" }}>
                    Tumör 14mm
                  </div>
                  <div className="absolute text-[10px] font-medium text-medical-amber" style={{ top: "52%", left: "15%" }}>
                    <AlertCircle className="w-3 h-3 inline mr-0.5" />Nervus VII
                  </div>
                </div>
              </div>
              {/* Scan line */}
              <div className="scan-line absolute inset-0 pointer-events-none" />
              {/* DICOM info */}
              <div className="absolute top-3 left-3 text-[10px] text-muted-foreground/60 font-mono space-y-0.5">
                <p>SE: 4 / IM: 128</p>
                <p>TR: 450ms TE: 15ms</p>
                <p>Slice: 2.0mm</p>
                <p>{activeView.toUpperCase()}</p>
              </div>
              <div className="absolute top-3 right-3 text-[10px] text-muted-foreground/60 font-mono text-right space-y-0.5">
                <p>{selectedPatient.name}</p>
                <p>{selectedPatient.id}</p>
                <p>MRI T1 + Gd</p>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="card-medical border-dashed border-2 p-8 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Dra och släpp MRI/CT-bilder här</p>
            <p className="text-xs text-muted-foreground/60 mt-1">DICOM, NIfTI format stöds</p>
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={item} className="space-y-4">
          {/* Patient info */}
          <div className="card-medical p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Patient</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-sm font-semibold text-foreground">{selectedPatient.name}</p>
                <p className="text-xs text-muted-foreground">{selectedPatient.age} år, {selectedPatient.gender}</p>
              </div>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-muted-foreground">Diagnos</span><span className="font-medium text-foreground">{selectedPatient.diagnosis}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Storlek</span><span className="font-medium text-foreground">{selectedPatient.tumorSize}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Plats</span></div>
                <p className="text-xs font-medium text-foreground">{selectedPatient.location}</p>
              </div>
            </div>
          </div>

          {/* AI Segmentation */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI-segmentering</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tumörvolym</span>
                  <span className="font-semibold text-foreground">1.23 cm³</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-medical-red/60" initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Konfidens</span>
                  <span className="font-semibold text-medical-green">96.8%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-medical-green/60" initial={{ width: 0 }} animate={{ width: "96.8%" }} transition={{ duration: 1, delay: 0.7 }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border">
                <p>Kritiska strukturer: 3 identifierade</p>
                <p>Cochlea: 4.1mm avstånd</p>
                <p>Hjärnstam: 8.2mm avstånd</p>
                <p>Nervus facialis: 2.8mm avstånd</p>
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-medical-purple" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jämför</h3>
            </div>
            <div className="space-y-2 text-xs">
              <button className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="font-medium text-foreground">2024-12-15 — MRI T1+Gd</p>
                <p className="text-muted-foreground">Senaste scan</p>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <p className="font-medium text-foreground">2024-09-20 — MRI T1+Gd</p>
                <p className="text-muted-foreground">Baseline</p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ImageAnalysis;
