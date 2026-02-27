/**
 * Simplified dose calculation utilities for demo purposes.
 * Uses inverse-square law approximations; NOT clinical-grade.
 */

export interface OARConstraint {
  name: string;
  maxDose: number;
  baseDose: number; // dose at reference (12 Gy margin)
  unit: string;
  limit: string;
  distanceMm: number; // distance from tumor center
}

export const baseOARData: OARConstraint[] = [
  { name: "Cochlea", maxDose: 4.0, baseDose: 3.8, unit: "Gy", limit: "Max", distanceMm: 4.1 },
  { name: "Brainstem", maxDose: 12.0, baseDose: 6.2, unit: "Gy", limit: "Max", distanceMm: 8.2 },
  { name: "N. facialis", maxDose: 8.0, baseDose: 8.1, unit: "Gy", limit: "Max", distanceMm: 2.8 },
  { name: "Optic chiasm", maxDose: 8.0, baseDose: 1.2, unit: "Gy", limit: "Max", distanceMm: 18.5 },
  { name: "Optic nerve", maxDose: 8.0, baseDose: 2.4, unit: "Gy", limit: "Max", distanceMm: 12.0 },
  { name: "Lens", maxDose: 5.0, baseDose: 0.8, unit: "Gy", limit: "Max", distanceMm: 25.0 },
];

const REF_DOSE = 12;
const REF_COLLIMATOR = 8;

export function calculateOARDose(oar: OARConstraint, marginalDose: number, collimatorMm: number): number {
  const doseRatio = marginalDose / REF_DOSE;
  const collimatorFactor = 1 + (collimatorMm - REF_COLLIMATOR) * 0.02;
  const calculated = oar.baseDose * doseRatio * collimatorFactor;
  return Math.round(calculated * 10) / 10;
}

export function calculateConformityIndex(dose: number, collimator: number): number {
  const base = 1.42;
  const doseEffect = (dose - 12) * 0.01;
  const collEffect = (collimator - 8) * 0.005;
  return Math.round((base + doseEffect + collEffect) * 100) / 100;
}

export function calculateSelectivityIndex(dose: number, collimator: number): number {
  const base = 0.87;
  const doseEffect = -(dose - 12) * 0.005;
  const collEffect = -(collimator - 8) * 0.003;
  return Math.round(Math.max(0.5, Math.min(1, base + doseEffect + collEffect)) * 100) / 100;
}

export function calculateHealthyTissue(dose: number, collimator: number): number {
  const base = 3.2;
  const doseEffect = (dose - 12) * 0.15;
  const collEffect = (collimator - 8) * 0.08;
  return Math.round((base + doseEffect + collEffect) * 10) / 10;
}

export function generateDVHCurve(
  type: "gtv" | "ctv" | "oar",
  marginalDose: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const maxDoseAxis = Math.max(15, marginalDose * 1.3);

  for (let d = 0; d <= maxDoseAxis; d += 0.5) {
    let volumePct: number;
    if (type === "gtv") {
      if (d < marginalDose * 0.8) volumePct = 100;
      else if (d < marginalDose) volumePct = 100 - ((d - marginalDose * 0.8) / (marginalDose * 0.2)) * 15;
      else if (d < marginalDose * 1.1) volumePct = 85 - ((d - marginalDose) / (marginalDose * 0.1)) * 75;
      else volumePct = Math.max(0, 10 - (d - marginalDose * 1.1) * 5);
    } else if (type === "ctv") {
      if (d < marginalDose * 0.6) volumePct = 100;
      else if (d < marginalDose * 0.9) volumePct = 100 - ((d - marginalDose * 0.6) / (marginalDose * 0.3)) * 30;
      else volumePct = Math.max(0, 70 - (d - marginalDose * 0.9) * 15);
    } else {
      const oarMax = marginalDose * 0.35;
      if (d < oarMax * 0.5) volumePct = 100;
      else if (d < oarMax) volumePct = Math.max(0, 100 - ((d - oarMax * 0.5) / (oarMax * 0.5)) * 90);
      else volumePct = Math.max(0, 10 - (d - oarMax) * 8);
    }

    points.push({ x: (d / maxDoseAxis) * 100, y: Math.max(0, Math.min(100, volumePct)) });
  }

  return points;
}

export function dvhToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${100 - p.y}`).join(" ");
}

export function ellipseVolume(rx: number, ry: number, rz: number): number {
  return Math.round(((4 / 3) * Math.PI * rx * ry * rz) / 1000 * 100) / 100;
}
