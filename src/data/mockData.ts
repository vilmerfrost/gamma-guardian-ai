export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  tumorType: string;
  tumorSize: string;
  location: string;
  status: "scheduled" | "in-progress" | "completed" | "review";
  lastScan: string;
  nextAppointment: string;
  riskLevel: "low" | "medium" | "high";
  doseGy: number;
  fractions: number;
  aiScore: number;
}

export interface AIInsight {
  id: string;
  type: "optimization" | "warning" | "info" | "success";
  title: string;
  description: string;
  patientId: string;
  timestamp: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  beamCount: number;
  totalDose: number;
  fractions: number;
  conformityIndex: number;
  selectivityIndex: number;
  healthyTissueExposure: number;
  beams: BeamPath[];
}

export interface BeamPath {
  id: string;
  angle: number;
  weight: number;
  collimatorSize: number;
  isocenterX: number;
  isocenterY: number;
  isocenterZ: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const patients: Patient[] = [
  {
    id: "P-2024-001",
    name: "Anna Lindström",
    age: 58,
    gender: "Female",
    diagnosis: "Vestibular schwannoma",
    tumorType: "Acoustic neuroma",
    tumorSize: "14mm × 12mm × 11mm",
    location: "Cerebellopontine angle, left",
    status: "in-progress",
    lastScan: "2024-12-15",
    nextAppointment: "2025-01-10",
    riskLevel: "medium",
    doseGy: 12,
    fractions: 1,
    aiScore: 94,
  },
  {
    id: "P-2024-002",
    name: "Erik Johansson",
    age: 45,
    gender: "Male",
    diagnosis: "Meningiom",
    tumorType: "Convexity meningioma",
    tumorSize: "22mm × 18mm × 16mm",
    location: "Frontal lobe, right",
    status: "scheduled",
    lastScan: "2024-12-20",
    nextAppointment: "2025-01-15",
    riskLevel: "low",
    doseGy: 14,
    fractions: 1,
    aiScore: 97,
  },
  {
    id: "P-2024-003",
    name: "Maria Karlsson",
    age: 67,
    gender: "Female",
    diagnosis: "Brain metastasis",
    tumorType: "Metastasis (lung)",
    tumorSize: "8mm × 7mm × 9mm",
    location: "Occipital lobe, left",
    status: "completed",
    lastScan: "2024-12-10",
    nextAppointment: "2025-02-01",
    riskLevel: "high",
    doseGy: 20,
    fractions: 1,
    aiScore: 88,
  },
  {
    id: "P-2024-004",
    name: "Lars Bergman",
    age: 52,
    gender: "Male",
    diagnosis: "Trigeminal neuralgia",
    tumorType: "Functional treatment",
    tumorSize: "N/A",
    location: "Trigeminal nucleus",
    status: "review",
    lastScan: "2024-12-18",
    nextAppointment: "2025-01-08",
    riskLevel: "low",
    doseGy: 85,
    fractions: 1,
    aiScore: 96,
  },
  {
    id: "P-2024-005",
    name: "Sofia Nilsson",
    age: 39,
    gender: "Female",
    diagnosis: "AVM",
    tumorType: "Arteriovenous malformation",
    tumorSize: "18mm × 15mm × 14mm",
    location: "Parietal lobe, right",
    status: "scheduled",
    lastScan: "2024-12-22",
    nextAppointment: "2025-01-20",
    riskLevel: "medium",
    doseGy: 22,
    fractions: 1,
    aiScore: 91,
  },
];

export const aiInsights: AIInsight[] = [
  {
    id: "AI-001",
    type: "optimization",
    title: "Optimize beam path for P-2024-001",
    description: "AI analysis shows that a 1.2mm lateral isocenter adjustment can reduce cochlea exposure by 15% without compromising tumor coverage.",
    patientId: "P-2024-001",
    timestamp: "2025-01-05T09:30:00",
  },
  {
    id: "AI-002",
    type: "warning",
    title: "Elevated optic nerve risk � P-2024-002",
    description: "The tumor proximity to the optic nerve (3.2mm) requires careful dose planning. Recommending max 8 Gy to the optic nerve.",
    patientId: "P-2024-002",
    timestamp: "2025-01-05T10:15:00",
  },
  {
    id: "AI-003",
    type: "success",
    title: "Treatment outcome confirmed � P-2024-003",
    description: "Post-treatment MRI shows 94% tumor volume reduction. Results align with AI predictions. No significant edema detected.",
    patientId: "P-2024-003",
    timestamp: "2025-01-04T14:00:00",
  },
  {
    id: "AI-004",
    type: "info",
    title: "New research � AVM dose optimization",
    description: "New study (Nature Medicine 2024) shows improved obliteration rates with margin dose 23-25 Gy for AVM <20mm. Consider for P-2024-005.",
    patientId: "P-2024-005",
    timestamp: "2025-01-05T08:45:00",
  },
];

export const treatmentPlans: TreatmentPlan[] = [
  {
    id: "TP-001",
    patientId: "P-2024-001",
    beamCount: 201,
    totalDose: 12,
    fractions: 1,
    conformityIndex: 1.42,
    selectivityIndex: 0.87,
    healthyTissueExposure: 3.2,
    beams: [
      { id: "B1", angle: 0, weight: 0.85, collimatorSize: 8, isocenterX: 45.2, isocenterY: 32.1, isocenterZ: 18.5 },
      { id: "B2", angle: 45, weight: 0.92, collimatorSize: 8, isocenterX: 45.2, isocenterY: 32.1, isocenterZ: 18.5 },
      { id: "B3", angle: 90, weight: 0.78, collimatorSize: 4, isocenterX: 46.0, isocenterY: 33.0, isocenterZ: 18.5 },
      { id: "B4", angle: 135, weight: 0.88, collimatorSize: 8, isocenterX: 45.2, isocenterY: 32.1, isocenterZ: 18.5 },
      { id: "B5", angle: 180, weight: 0.65, collimatorSize: 14, isocenterX: 45.2, isocenterY: 32.1, isocenterZ: 18.5 },
    ],
  },
];

export const mockChatHistory: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Welcome to GammaAI Advisor. I can help with patient data, dose planning, and treatment optimization. What would you like to know?",
    timestamp: "2025-01-05T09:00:00",
  },
];

export const statusLabels: Record<Patient["status"], string> = {
  scheduled: "Scheduled",
  "in-progress": "In progress",
  completed: "Completed",
  review: "Under review",
};

export const statusColors: Record<Patient["status"], string> = {
  scheduled: "bg-medical-cyan/10 text-medical-cyan border-medical-cyan/20",
  "in-progress": "bg-medical-amber/10 text-medical-amber border-medical-amber/20",
  completed: "bg-medical-green/10 text-medical-green border-medical-green/20",
  review: "bg-medical-purple/10 text-medical-purple border-medical-purple/20",
};

export const riskColors: Record<Patient["riskLevel"], string> = {
  low: "text-medical-green",
  medium: "text-medical-amber",
  high: "text-medical-red",
};






