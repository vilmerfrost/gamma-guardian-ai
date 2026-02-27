import type { VolumeData } from "@/lib/volumeUtils";
import { normalizeAndDownsample } from "@/lib/volumeUtils";

export interface ParsedMedicalFile {
  fileName: string;
  extension: string;
  sizeBytes: number;
  format: "dicom" | "nifti";
  source: "uploaded";
  /** Present when pixel/volume data was successfully parsed and prepared for 3D rendering. */
  volume?: VolumeData;
}

const ALLOWED_EXTENSIONS = [".dcm", ".dicom", ".nii", ".nii.gz"];

export function isSupportedMedicalFile(fileName: string) {
  const lower = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function detectFormat(fileName: string): "dicom" | "nifti" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".nii") || lower.endsWith(".nii.gz")) return "nifti";
  return "dicom";
}

function getExtension(fileName: string): string {
  if (fileName.toLowerCase().endsWith(".nii.gz")) return ".nii.gz";
  const idx = fileName.lastIndexOf(".");
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : "";
}

async function parseNiftiVolume(file: File): Promise<VolumeData | undefined> {
  const arrayBuffer = await file.arrayBuffer();
  let data: ArrayBuffer = arrayBuffer;

  const nifti = await import("nifti-reader-js");
  if (nifti.isCompressed(data)) {
    try {
      data = nifti.decompress(data);
    } catch {
      return undefined;
    }
  }
  if (!nifti.isNIFTI(data)) return undefined;

  const header = nifti.readHeader(data);
  const imageBuffer = nifti.readImage(header, data);
  if (!imageBuffer || !header) return undefined;

  const h = header as { dim?: number[]; dims?: number[] };
  const dim = h.dim ?? h.dims;
  if (!dim || (dim[0] !== undefined && dim[0] < 1)) return undefined;

  const nx = Math.max(1, dim[1] ?? dim[0] ?? 1);
  const ny = Math.max(1, dim[2] ?? 1);
  const nz = Math.max(1, dim[3] ?? 1);

  return normalizeAndDownsample(imageBuffer, nx, ny, nz);
}

async function parseDicomVolume(file: File): Promise<VolumeData | undefined> {
  const arrayBuffer = await file.arrayBuffer();
  const byteArray = new Uint8Array(arrayBuffer);

  const dicomParser = await import("dicom-parser");
  let dataSet: {
    elements: Record<string, { dataOffset?: number; length?: number }>;
    byteArray: Uint8Array;
    uint16: (tag: string) => number;
    string: (tag: string) => string;
  };
  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch {
    return undefined;
  }

  const pixelDataElement = dataSet.elements.x7fe00010;
  if (!pixelDataElement || pixelDataElement.dataOffset == null || pixelDataElement.length == null)
    return undefined;

  const rows = dataSet.uint16("x00280010") || 256;
  const columns = dataSet.uint16("x00280011") || 256;
  const numFramesStr = dataSet.string("x00280008");
  const numberOfFrames = numFramesStr ? Math.max(1, parseInt(numFramesStr.trim(), 10) || 1) : 1;

  const nx = columns;
  const ny = rows;
  const nz = Math.max(1, numberOfFrames);

  const bitsAllocated = dataSet.uint16("x00280100") || 16;
  const bytesPerPixel = bitsAllocated / 8;

  let pixelBuffer: ArrayBuffer;
  try {
    if (bytesPerPixel === 2) {
      const view = new Uint16Array(
        dataSet.byteArray.buffer,
        dataSet.byteArray.byteOffset + pixelDataElement.dataOffset,
        pixelDataElement.length / 2
      );
      pixelBuffer = view.buffer;
    } else {
      const view = new Uint8Array(
        dataSet.byteArray.buffer,
        dataSet.byteArray.byteOffset + pixelDataElement.dataOffset,
        pixelDataElement.length
      );
      pixelBuffer = view.buffer;
    }
  } catch {
    return undefined;
  }

  return normalizeAndDownsample(pixelBuffer, nx, ny, nz);
}

export async function parseMedicalFile(file: File): Promise<ParsedMedicalFile> {
  if (!isSupportedMedicalFile(file.name)) {
    throw new Error("Filformat stöds inte. Använd .dicom, .dcm, .nii eller .nii.gz");
  }

  const format = detectFormat(file.name);
  const extension = getExtension(file.name);

  let volume: VolumeData | undefined;
  try {
    if (format === "nifti") {
      volume = await parseNiftiVolume(file);
    } else {
      volume = await parseDicomVolume(file);
    }
  } catch {
    volume = undefined;
  }

  return {
    fileName: file.name,
    extension,
    sizeBytes: file.size,
    format,
    source: "uploaded",
    volume,
  };
}
