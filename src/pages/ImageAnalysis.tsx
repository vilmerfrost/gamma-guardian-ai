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
  CheckCircle2,
  Clock,
  ChevronDown,
  Box,
  GitCompare,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const segmentationLayers = [
  { id: "gtv", label: "GTV (Tumör)", color: "bg-medical-red", enabled: true, volume: "1.23 cm³" },
  { id: "ctv", label: "CTV (Klinisk målvolym)", color: "bg-medical-purple", enabled: true, volume: "2.41 cm³" },
  { id: "cochlea", label: "OAR: Cochlea", color: "bg-medical-amber", enabled: true, volume: "0.18 cm³" },
  { id: "brainstem", label: "OAR: Hjärnstam", color: "bg-medical-amber", enabled: true, volume: "—" },
  { id: "facial", label: "OAR: N. facialis", color: "bg-medical-amber", enabled: true, volume: "—" },
  { id: "optic", label: "OAR: Optisk chiasm", color: "bg-medical-amber", enabled: false, volume: "—" },
];

const ImageAnalysis = () => {
  const [selectedPatient] = useState(patients[0]);
  const [activeView, setActiveView] = useState<"axial" | "sagittal" | "coronal">("axial");
  const [layers, setLayers] = useState(segmentationLayers);
  const [show3D, setShow3D] = useState(false);
  const [compareMode, setCompareMode] = useState(false);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patientbildanalys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            AI-segmentering av GTV/CTV och kritiska strukturer (OAR)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCompareMode(!compareMode)} className={compareMode ? "border-medical-purple text-medical-purple" : ""}>
            <GitCompare className="w-3.5 h-3.5 mr-1.5" />Jämför
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShow3D(!show3D)} className={show3D ? "border-medical-cyan text-medical-cyan" : ""}>
            <Box className="w-3.5 h-3.5 mr-1.5" />3D-vy
          </Button>
        </div>
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
              {compareMode && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r-2 border-dashed border-medical-purple/40" />
                  <div className="absolute top-2 left-2 text-[10px] font-semibold text-medical-purple bg-medical-purple/10 px-2 py-0.5 rounded">2024-12-15</div>
                  <div className="absolute top-2 right-2 text-[10px] font-semibold text-medical-cyan bg-medical-cyan/10 px-2 py-0.5 rounded">2024-09-20</div>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <svg width="340" height="340" viewBox="0 0 340 340" className="opacity-90">
                    <ellipse cx="170" cy="170" rx="145" ry="155" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="1.5" opacity="0.4" />
                    <ellipse cx="170" cy="170" rx="130" ry="140" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="0.5" opacity="0.2" />
                    <ellipse cx="170" cy="165" rx="120" ry="125" fill="hsl(215 15% 45%)" opacity="0.15" />
                    <ellipse cx="170" cy="170" rx="90" ry="100" fill="hsl(215 15% 40%)" opacity="0.1" />
                    <ellipse cx="155" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(-5 155 155)" />
                    <ellipse cx="185" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(5 185 155)" />
                    {/* GTV */}
                    {layers.find(l => l.id === "gtv")?.enabled && (
                      <motion.ellipse cx="120" cy="130" rx="18" ry="15" fill="hsl(0 72% 51%)" opacity="0.35" stroke="hsl(0 72% 51%)" strokeWidth="2"
                        animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                    )}
                    {/* CTV */}
                    {layers.find(l => l.id === "ctv")?.enabled && (
                      <motion.ellipse cx="120" cy="130" rx="26" ry="22" fill="none" stroke="hsl(260 55% 50%)" strokeWidth="1.5" strokeDasharray="4 3"
                        animate={{ strokeDashoffset: [0, -14] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                    )}
                    {/* AI contour */}
                    <motion.ellipse cx="120" cy="130" rx="22" ry="19" fill="none" stroke="hsl(187 80% 42%)" strokeWidth="1.5" strokeDasharray="4 2"
                      animate={{ strokeDashoffset: [0, -12] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    {/* OARs */}
                    {layers.find(l => l.id === "cochlea")?.enabled && (
                      <circle cx="100" cy="190" r="8" fill="hsl(38 92% 50%)" opacity="0.15" stroke="hsl(38 92% 50%)" strokeWidth="1.5" />
                    )}
                    {layers.find(l => l.id === "brainstem")?.enabled && (
                      <ellipse cx="170" cy="220" rx="22" ry="14" fill="hsl(38 92% 50%)" opacity="0.08" stroke="hsl(38 92% 50%)" strokeWidth="1" strokeDasharray="3 2" />
                    )}
                    {layers.find(l => l.id === "facial")?.enabled && (
                      <path d="M105 145 Q95 165 100 185" fill="none" stroke="hsl(38 92% 50%)" strokeWidth="1.5" opacity="0.6" />
                    )}
                    <line x1="170" y1="30" x2="170" y2="310" stroke="hsl(187 80% 42%)" strokeWidth="0.5" opacity="0.3" strokeDasharray="6 4" />
                    <line x1="0" y1="170" x2="340" y2="170" stroke="hsl(215 20% 60%)" strokeWidth="0.3" opacity="0.3" />
                    <line x1="170" y1="0" x2="170" y2="340" stroke="hsl(215 20% 60%)" strokeWidth="0.3" opacity="0.3" />
                  </svg>
                  <div className="absolute text-[10px] font-medium text-medical-red" style={{ top: "22%", left: "18%" }}>
                    GTV 14mm
                  </div>
                  <div className="absolute text-[10px] font-medium text-medical-purple" style={{ top: "18%", left: "30%" }}>
                    CTV +3mm
                  </div>
                  <div className="absolute text-[10px] font-medium text-medical-amber" style={{ top: "52%", left: "13%" }}>
                    <AlertCircle className="w-3 h-3 inline mr-0.5" />Cochlea
                  </div>
                  <div className="absolute text-[10px] font-medium text-medical-amber" style={{ top: "38%", left: "13%" }}>
                    N.VII
                  </div>
                </div>
              </div>
              <div className="scan-line absolute inset-0 pointer-events-none" />
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
              {/* Accuracy badge */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border text-[10px]">
                <Crosshair className="w-3 h-3 text-medical-green" />
                <span className="text-muted-foreground">Segmenteringsnoggrannhet:</span>
                <span className="font-bold text-medical-green">96.8%</span>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div className="card-medical border-dashed border-2 p-8 text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Dra och släpp MRI/CT-bilder här</p>
            <p className="text-xs text-muted-foreground/60 mt-1">DICOM, NIfTI format stöds — Automatisk AI-segmentering</p>
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

          {/* Segmentation layers */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segmenteringslager</h3>
            </div>
            <div className="space-y-2">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${layer.color}`} />
                    <span className="text-xs text-foreground">{layer.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {layer.volume !== "—" && (
                      <span className="text-[10px] text-muted-foreground">{layer.volume}</span>
                    )}
                    <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} className="scale-75" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Segmentation metrics */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI-analys</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">GTV-konfidens</span>
                  <span className="font-semibold text-medical-green">96.8%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-medical-green/60" initial={{ width: 0 }} animate={{ width: "96.8%" }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Dice-koefficient</span>
                  <span className="font-semibold text-medical-green">0.94</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div className="h-full rounded-full bg-medical-green/60" initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1, delay: 0.7 }} />
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p className="font-medium text-foreground text-[10px] uppercase tracking-wider mb-1">OAR-avstånd</p>
                <div className="flex justify-between"><span>Cochlea</span><span className="text-medical-green font-semibold">4.1mm</span></div>
                <div className="flex justify-between"><span>Hjärnstam</span><span className="text-medical-green font-semibold">8.2mm</span></div>
                <div className="flex justify-between"><span>N. facialis</span><span className="text-medical-amber font-semibold">2.8mm ⚠</span></div>
                <div className="flex justify-between"><span>Optisk chiasm</span><span className="text-medical-green font-semibold">18.5mm</span></div>
              </div>
            </div>
          </div>

          {/* Comparison scans */}
          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-medical-purple" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tidigare skanningar</h3>
            </div>
            <div className="space-y-2 text-xs">
              <button className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">2024-12-15 — MRI T1+Gd</p>
                  <span className="text-[10px] text-medical-green">Senaste</span>
                </div>
                <p className="text-muted-foreground mt-0.5">Vol: 1.23 cm³</p>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">2024-09-20 — MRI T1+Gd</p>
                  <span className="text-[10px] text-muted-foreground">Baseline</span>
                </div>
                <p className="text-muted-foreground mt-0.5">Vol: 1.31 cm³ <span className="text-medical-green">(−6.1%)</span></p>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ImageAnalysis;
