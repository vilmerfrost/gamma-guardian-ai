import { useState, useRef, useCallback, Suspense, lazy, useEffect } from "react";
import { motion } from "framer-motion";
import { patients } from "@/data/mockData";
import {
  Upload, Layers, Eye, RotateCcw, ZoomIn, ZoomOut, Maximize2, Grid3X3,
  Brain, AlertCircle, CheckCircle2, Clock, ChevronDown, Box, GitCompare,
  Crosshair, Pause, Play, Hand, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ellipseVolume } from "@/lib/doseCalculations";
import { logAuditEvent } from "@/lib/auditLog";
import { parseMedicalFile, type ParsedMedicalFile } from "@/lib/medicalFile";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";

const BrainScene = lazy(() => import("@/components/BrainScene"));

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

type ClipAxisState = "none" | "x" | "y" | "z";

interface ContourState {
  cx: number; cy: number; rx: number; ry: number;
}

const PREVIEWABLE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"];

function canRenderImagePreview(file: File) {
  if (file.type.startsWith("image/")) return true;
  const lower = file.name.toLowerCase();
  return PREVIEWABLE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function createVolumePreviewDataUrl(volume: ParsedMedicalFile["volume"]) {
  if (!volume || typeof document === "undefined") return null;

  const [nx, ny, nz] = volume.dims;
  if (nx < 1 || ny < 1 || nz < 1) return null;

  const midZ = Math.floor(nz / 2);
  const sliceOffset = midZ * nx * ny;
  const canvas = document.createElement("canvas");
  canvas.width = nx;
  canvas.height = ny;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const image = ctx.createImageData(nx, ny);
  const out = image.data;
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      const srcIdx = sliceOffset + y * nx + x;
      const intensity = Math.max(0, Math.min(255, Math.round((volume.data[srcIdx] ?? 0) * 255)));
      const outIdx = (y * nx + x) * 4;
      out[outIdx] = intensity;
      out[outIdx + 1] = intensity;
      out[outIdx + 2] = intensity;
      out[outIdx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL("image/png");
}

const ImageAnalysis = () => {
  const [selectedPatient] = useState(patients[0]);
  const [activeView, setActiveView] = useState<"axial" | "sagittal" | "coronal">("axial");
  const [layers, setLayers] = useState([
    { id: "gtv", label: "GTV (Tumör)", color: "bg-medical-red", enabled: true },
    { id: "ctv", label: "CTV (Klinisk målvolym)", color: "bg-medical-purple", enabled: true },
    { id: "cochlea", label: "OAR: Cochlea", color: "bg-medical-amber", enabled: true },
    { id: "brainstem", label: "OAR: Hjärnstam", color: "bg-medical-amber", enabled: true },
    { id: "facial", label: "OAR: N. facialis", color: "bg-medical-amber", enabled: true },
    { id: "optic", label: "OAR: Optisk chiasm", color: "bg-medical-amber", enabled: false },
  ]);
  const [show3D, setShow3D] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [brainOpacity, setBrainOpacity] = useState(0.9);
  const [clipAxis, setClipAxis] = useState<ClipAxisState>("none");
  const [clipPosition, setClipPosition] = useState(0);
  const [uploadedScan, setUploadedScan] = useState<ParsedMedicalFile | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const [lastUploadTime, setLastUploadTime] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  // Interactive contour state
  const [gtv, setGtv] = useState<ContourState>({ cx: 120, cy: 130, rx: 18, ry: 15 });
  const [ctv, setCtv] = useState<ContourState>({ cx: 120, cy: 130, rx: 26, ry: 22 });
  const [editingContour, setEditingContour] = useState<string | null>(null);
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Dynamic volumes
  const gtvVolume = ellipseVolume(gtv.rx * 0.5, gtv.ry * 0.5, (gtv.rx + gtv.ry) * 0.25);
  const ctvVolume = ellipseVolume(ctv.rx * 0.5, ctv.ry * 0.5, (ctv.rx + ctv.ry) * 0.25);

  const toggleLayer = (id: string) => setLayers(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));

  const isLayerEnabled = useCallback((id: string) => layers.find((l) => l.id === id)?.enabled ?? false, [layers]);

  const handleMedicalFile = useCallback(async (file: File) => {
    setIsParsingFile(true);
    try {
      const parsed = await parseMedicalFile(file);
      setUploadedScan(parsed);
      setLastUploadTime(new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      const previewUrl = canRenderImagePreview(file)
        ? URL.createObjectURL(file)
        : createVolumePreviewDataUrl(parsed.volume);
      setLivePreviewUrl(previewUrl);

      if (parsed.volume) {
        toast.success(`Fil mottagen: ${parsed.fileName}`);
        setTimeout(() => {
          addNotification({
            type: "success",
            title: "Segmentering slutförd",
            description: `${parsed.fileName} har preprocessats och är redo för 3D-analys.`,
            link: "/dashboard/image-analysis",
          });
        }, 650);
      } else {
        toast.warning("Filen laddades upp, men volymdata kunde inte parsas i browsern.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Kunde inte läsa filen");
    } finally {
      setIsParsingFile(false);
    }
  }, [addNotification]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    void handleMedicalFile(file);
  }, [handleMedicalFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    void handleMedicalFile(file);
  }, [handleMedicalFile]);

  useEffect(() => () => {
    if (livePreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(livePreviewUrl);
  }, [livePreviewUrl]);

  // --- Contour drag handlers ---
  const getSVGPoint = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handleContourPointerDown = useCallback((e: React.PointerEvent, contourId: string, handle: string) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingContour(contourId);
    setDragHandle(handle);
    lastMouse.current = getSVGPoint(e);
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [getSVGPoint]);

  const handleContourPointerMove = useCallback((e: React.PointerEvent) => {
    if (!editingContour || !dragHandle) return;
    const pt = getSVGPoint(e);
    const dx = pt.x - lastMouse.current.x;
    const dy = pt.y - lastMouse.current.y;
    lastMouse.current = pt;

    const setter = editingContour === "gtv" ? setGtv : setCtv;
    setter(prev => {
      if (dragHandle === "center") return { ...prev, cx: prev.cx + dx, cy: prev.cy + dy };
      if (dragHandle === "right") return { ...prev, rx: Math.max(8, prev.rx + dx) };
      if (dragHandle === "bottom") return { ...prev, ry: Math.max(8, prev.ry + dy) };
      if (dragHandle === "left") return { ...prev, rx: Math.max(8, prev.rx - dx) };
      if (dragHandle === "top") return { ...prev, ry: Math.max(8, prev.ry - dy) };
      return prev;
    });
  }, [editingContour, dragHandle, getSVGPoint]);

  const handleContourPointerUp = useCallback(() => {
    if (editingContour) {
      const contour = editingContour === "gtv" ? gtv : ctv;
      logAuditEvent({
        eventType: "segmentation_edit",
        eventCategory: "segmentation",
        patientId: selectedPatient.id,
        description: `${editingContour.toUpperCase()}-kontur redigerad manuellt`,
        metadata: { cx: contour.cx, cy: contour.cy, rx: contour.rx, ry: contour.ry },
      });
    }
    setEditingContour(null);
    setDragHandle(null);
  }, [editingContour, gtv, ctv, selectedPatient.id]);

  const handleBrainOpacityChange = useCallback((value: number[]) => {
    if (value[0] === undefined) return;
    setBrainOpacity(value[0]);
  }, []);

  const handleClipPositionChange = useCallback((value: number[]) => {
    if (value[0] === undefined) return;
    setClipPosition(value[0]);
  }, []);

  const renderControlPoints = (contourId: string, c: ContourState, color: string) => {
    const handles = [
      { id: "center", x: c.cx, y: c.cy },
      { id: "right", x: c.cx + c.rx, y: c.cy },
      { id: "left", x: c.cx - c.rx, y: c.cy },
      { id: "top", x: c.cx, y: c.cy - c.ry },
      { id: "bottom", x: c.cx, y: c.cy + c.ry },
    ];
    return handles.map(h => (
      <circle
        key={`${contourId}-${h.id}`}
        cx={h.x} cy={h.y} r={h.id === "center" ? 4 : 3.5}
        fill={h.id === "center" ? color : "white"}
        stroke={color}
        strokeWidth={1.5}
        className="cursor-grab active:cursor-grabbing"
        style={{ pointerEvents: "all" }}
        onPointerDown={(e) => handleContourPointerDown(e, contourId, h.id)}
      />
    ));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <motion.div variants={item} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patientbildanalys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-segmentering av GTV/CTV och kritiska strukturer (OAR)</p>
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
            <div className="flex items-center gap-2">
              {!show3D && (
                <span className="text-[10px] text-medical-cyan flex items-center gap-1">
                  <GripVertical className="w-3 h-3" /> Dra kontrollpunkter för att redigera
                </span>
              )}
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="axial" className="text-xs h-6 px-3">Axial</TabsTrigger>
                  <TabsTrigger value="sagittal" className="text-xs h-6 px-3">Sagittal</TabsTrigger>
                  <TabsTrigger value="coronal" className="text-xs h-6 px-3">Koronal</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Main view */}
          <div className="card-medical overflow-hidden">
            <div className="relative h-[400px] md:h-[500px] bg-foreground/[0.03] medical-grid">
              {show3D ? (
                <div className="absolute inset-0">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-medical-cyan border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-muted-foreground">Laddar 3D...</span>
                      </div>
                    </div>
                  }>
                    <BrainScene
                      showGTV={isLayerEnabled("gtv")}
                      showCTV={isLayerEnabled("ctv")}
                      showCochlea={isLayerEnabled("cochlea")}
                      showFacial={isLayerEnabled("facial")}
                      showBrainstem={isLayerEnabled("brainstem")}
                      showOptic={isLayerEnabled("optic")}
                      autoRotate={isAutoRotating}
                      brainOpacity={brainOpacity}
                      clipAxis={clipAxis === "none" ? undefined : clipAxis}
                      clipPosition={clipPosition}
                      volumeData={uploadedScan?.volume ?? null}
                    />
                  </Suspense>
                  {/* 3D controls overlay */}
                  <div className="absolute top-4 left-4 space-y-2 pointer-events-auto z-10">
                    <div className="text-[10px] font-semibold text-medical-cyan bg-medical-cyan/10 px-2 py-0.5 rounded border border-medical-cyan/20">3D-rekonstruktion (WebGL)</div>
                    <div className="text-[10px] text-muted-foreground">{selectedPatient.name} — {selectedPatient.diagnosis}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {uploadedScan ? `Laddad fil: ${uploadedScan.fileName}` : "Sample model: Brain Atlas v1"}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button variant="outline" size="sm" className={`h-7 text-[10px] gap-1 ${isAutoRotating ? "border-medical-cyan text-medical-cyan" : ""}`}
                        onClick={() => setIsAutoRotating(!isAutoRotating)}>
                        {isAutoRotating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {isAutoRotating ? "Pausa" : "Rotera"}
                      </Button>
                    </div>
                    <div className="space-y-1.5 mt-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/70">Snittplan</span>
                        <div className="inline-flex rounded-full bg-background/70 border border-border/60 overflow-hidden">
                          {["none", "x", "y", "z"].map((axis) => (
                            <button
                              key={axis}
                              type="button"
                              className={`px-1.5 py-0.5 text-[9px] font-medium transition-colors ${
                                clipAxis === axis
                                  ? "bg-medical-purple text-white"
                                  : "text-muted-foreground/70 hover:bg-muted/50"
                              }`}
                              onClick={() => setClipAxis(axis as ClipAxisState)}
                            >
                              {axis === "none" ? "OFF" : axis.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      {clipAxis !== "none" && (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted-foreground/60">Djup</span>
                          <div className="flex-1">
                            <Slider
                              min={-0.8}
                              max={0.8}
                              step={0.02}
                              value={[clipPosition]}
                              onValueChange={handleClipPositionChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/60 font-mono text-right space-y-0.5 z-10">
                    <p>Volym: {gtvVolume} cm³</p>
                    <p>9 strålbanor</p>
                    <p>{isAutoRotating ? "Auto-rotation" : "Manuell"}</p>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/50 pointer-events-none z-10">
                    <Hand className="w-3.5 h-3.5" /> Dra för att rotera — Scrolla för att zooma
                  </div>
                </div>
              ) : (
                /* 2D Scan with interactive contours */
                <>
                  {livePreviewUrl && (
                    <img
                      src={livePreviewUrl}
                      alt={uploadedScan ? `Forhandsvisning: ${uploadedScan.fileName}` : "Forhandsvisning"}
                      className="absolute inset-0 h-full w-full object-contain opacity-60 pointer-events-none"
                    />
                  )}
                  {compareMode && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r-2 border-dashed border-medical-purple/40" />
                      <div className="absolute top-2 left-2 text-[10px] font-semibold text-medical-purple bg-medical-purple/10 px-2 py-0.5 rounded">2024-12-15</div>
                      <div className="absolute top-2 right-2 text-[10px] font-semibold text-medical-cyan bg-medical-cyan/10 px-2 py-0.5 rounded">2024-09-20</div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <svg ref={svgRef} width="340" height="340" viewBox="0 0 340 340" className="opacity-90"
                        onPointerMove={handleContourPointerMove} onPointerUp={handleContourPointerUp} onPointerLeave={handleContourPointerUp}>
                        {/* Brain anatomy */}
                        <ellipse cx="170" cy="170" rx="145" ry="155" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="1.5" opacity="0.4" />
                        <ellipse cx="170" cy="170" rx="130" ry="140" fill="none" stroke="hsl(215 20% 60%)" strokeWidth="0.5" opacity="0.2" />
                        <ellipse cx="170" cy="165" rx="120" ry="125" fill="hsl(215 15% 45%)" opacity="0.15" />
                        <ellipse cx="170" cy="170" rx="90" ry="100" fill="hsl(215 15% 40%)" opacity="0.1" />
                        <ellipse cx="155" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(-5 155 155)" />
                        <ellipse cx="185" cy="155" rx="15" ry="30" fill="hsl(215 20% 30%)" opacity="0.15" transform="rotate(5 185 155)" />

                        {/* Interactive GTV */}
                        {layers.find(l => l.id === "gtv")?.enabled && (
                          <>
                            <motion.ellipse cx={gtv.cx} cy={gtv.cy} rx={gtv.rx} ry={gtv.ry}
                              fill="hsl(0 72% 51%)" opacity="0.35" stroke="hsl(0 72% 51%)" strokeWidth="2"
                              animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                              className="cursor-move" style={{ pointerEvents: "all" }}
                              onPointerDown={(e) => handleContourPointerDown(e, "gtv", "center")} />
                            {renderControlPoints("gtv", gtv, "hsl(0, 72%, 51%)")}
                          </>
                        )}

                        {/* Interactive CTV */}
                        {layers.find(l => l.id === "ctv")?.enabled && (
                          <>
                            <motion.ellipse cx={ctv.cx} cy={ctv.cy} rx={ctv.rx} ry={ctv.ry}
                              fill="none" stroke="hsl(260 55% 50%)" strokeWidth="1.5" strokeDasharray="4 3"
                              animate={{ strokeDashoffset: [0, -14] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="cursor-move" style={{ pointerEvents: "all" }}
                              onPointerDown={(e) => handleContourPointerDown(e, "ctv", "center")} />
                            {renderControlPoints("ctv", ctv, "hsl(260, 55%, 50%)")}
                          </>
                        )}

                        {/* AI contour reference */}
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
                      {/* Labels */}
                      <div className="absolute text-[10px] font-medium text-medical-red pointer-events-none"
                        style={{ top: `${((gtv.cy - gtv.ry - 15) / 340) * 100}%`, left: `${((gtv.cx - 10) / 340) * 100}%` }}>
                        GTV {Math.round(gtv.rx * 2 * 0.5)}mm
                      </div>
                      <div className="absolute text-[10px] font-medium text-medical-purple pointer-events-none"
                        style={{ top: `${((ctv.cy - ctv.ry - 15) / 340) * 100}%`, left: `${((ctv.cx + 10) / 340) * 100}%` }}>
                        CTV +{Math.round((ctv.rx - gtv.rx) * 0.5)}mm
                      </div>
                      <div className="absolute text-[10px] font-medium text-medical-amber" style={{ top: "52%", left: "13%" }}>
                        <AlertCircle className="w-3 h-3 inline mr-0.5" />Cochlea
                      </div>
                      <div className="absolute text-[10px] font-medium text-medical-amber" style={{ top: "38%", left: "13%" }}>N.VII</div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 text-[10px] text-muted-foreground/60 font-mono space-y-0.5">
                    <p>SE: 4 / IM: 128</p><p>TR: 450ms TE: 15ms</p><p>Slice: 2.0mm</p><p>{activeView.toUpperCase()}</p>
                    {uploadedScan && <p className="text-medical-cyan">Aktiv fil: {uploadedScan.fileName}</p>}
                    {uploadedScan && !livePreviewUrl && <p>DICOM/NIfTI laddad (pixelpreview ej tillganglig i browser)</p>}
                    {lastUploadTime && <p>Senaste uppladdning: {lastUploadTime}</p>}
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] text-muted-foreground/60 font-mono text-right space-y-0.5">
                    <p>{selectedPatient.name}</p><p>{selectedPatient.id}</p><p>MRI T1 + Gd</p>
                  </div>
                </>
              )}
              <div className="scan-line absolute inset-0 pointer-events-none" />
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-border text-[10px]">
                <Crosshair className="w-3 h-3 text-medical-green" />
                <span className="text-muted-foreground">Segmenteringsnoggrannhet:</span>
                <span className="font-bold text-medical-green">96.8%</span>
              </div>
            </div>
          </div>

          {/* Upload */}
          <div
            className="card-medical border-dashed border-2 p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".dcm,.dicom,.nii,.nii.gz,application/dicom"
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Dra och släpp MRI/CT-bilder här</p>
            <p className="text-xs text-muted-foreground/60 mt-1">DICOM (.dcm/.dicom) och NIfTI (.nii/.nii.gz) stöds</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-medical-cyan/10 px-3 py-1 border border-medical-cyan/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-medical-cyan" />
              <span className="text-[10px] font-medium text-medical-cyan">
                DICOM / NIfTI-pipeline redo — släpp för att parsas
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => fileInputRef.current?.click()} disabled={isParsingFile}>
              {isParsingFile ? "Analyserar fil..." : "Välj fil"}
            </Button>
            {uploadedScan && (
              <p className="text-[11px] text-medical-cyan mt-2">
                {uploadedScan.fileName} · {(uploadedScan.sizeBytes / (1024 * 1024)).toFixed(2)} MB · {uploadedScan.format.toUpperCase()}
              </p>
            )}
          </div>
        </motion.div>

        {/* Side panel */}
        <motion.div variants={item} className="space-y-4">
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

          <div className="card-medical p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-medical-cyan" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segmenteringslager</h3>
            </div>
            <div className="space-y-2">
              {layers.map((layer) => {
                const vol = layer.id === "gtv" ? gtvVolume : layer.id === "ctv" ? ctvVolume : null;
                return (
                  <div key={layer.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${layer.color}`} />
                      <span className="text-xs text-foreground">{layer.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {vol !== null && <span className="text-[10px] text-muted-foreground font-mono">{vol} cm³</span>}
                      <Switch checked={layer.enabled} onCheckedChange={() => toggleLayer(layer.id)} className="scale-75" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Hjärnans opacitet</span>
                <span className="text-[10px] text-muted-foreground font-mono">{Math.round(brainOpacity * 100)}%</span>
              </div>
              <Slider
                min={0.2}
                max={1}
                step={0.05}
                value={[brainOpacity]}
                onValueChange={handleBrainOpacityChange}
              />
              <p className="text-[10px] text-muted-foreground/70">
                Justera opaciteten för att frilägga GTV/CTV och OAR inuti hjärnvolymen.
              </p>
            </div>
          </div>

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
                <p className="text-muted-foreground mt-0.5">Vol: {gtvVolume} cm³</p>
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

