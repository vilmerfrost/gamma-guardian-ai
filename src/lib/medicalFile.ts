export interface ParsedMedicalFile {
  fileName: string;
  extension: string;
  sizeBytes: number;
  format: "dicom" | "nifti";
  source: "uploaded";
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

export async function parseMedicalFile(file: File): Promise<ParsedMedicalFile> {
  if (!isSupportedMedicalFile(file.name)) {
    throw new Error("Filformat stöds inte. Använd .dicom, .dcm, .nii eller .nii.gz");
  }

  // Lightweight validation placeholder for future parser integration.
  // Reads a small slice so the file is touched and ready for future pipelines.
  await file.slice(0, 512).arrayBuffer();

  return {
    fileName: file.name,
    extension: file.name.toLowerCase().endsWith(".nii.gz")
      ? ".nii.gz"
      : file.name.slice(file.name.lastIndexOf(".")).toLowerCase(),
    sizeBytes: file.size,
    format: detectFormat(file.name),
    source: "uploaded",
  };
}
