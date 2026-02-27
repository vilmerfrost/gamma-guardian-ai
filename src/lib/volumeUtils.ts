/**
 * Volume data normalization and downsampling for performant 3D rendering.
 * Keeps memory and GPU usage bounded for large NIfTI/DICOM datasets.
 */

export const MAX_VOLUME_SIZE = 128;
const MAX_VOXELS = MAX_VOLUME_SIZE * MAX_VOLUME_SIZE * MAX_VOLUME_SIZE;

export interface VolumeData {
  data: Float32Array;
  dims: [number, number, number];
  spacing?: [number, number, number];
  minMax: [number, number];
}

/**
 * Normalize typed array to 0–1 float and optionally downsample to stay under MAX_VOXELS.
 */
export function normalizeAndDownsample(
  raw: ArrayBuffer | ArrayLike<number>,
  nx: number,
  ny: number,
  nz: number
): VolumeData {
  const total = nx * ny * nz;
  let src: ArrayLike<number>;
  if (raw instanceof ArrayBuffer) {
    const bytesPerVoxel = raw.byteLength / total;
    src = bytesPerVoxel === 2
      ? new Int16Array(raw)
      : bytesPerVoxel === 1
        ? new Uint8Array(raw)
        : new Float32Array(raw);
  } else {
    src = raw;
  }

  let sx = 1,
    sy = 1,
    sz = 1;
  if (total > MAX_VOXELS) {
    const scale = Math.pow(MAX_VOXELS / total, 1 / 3);
    sx = Math.max(1, Math.round(nx * scale));
    sy = Math.max(1, Math.round(ny * scale));
    sz = Math.max(1, Math.round(nz * scale));
  } else {
    sx = nx;
    sy = ny;
    sz = nz;
  }

  const outNx = sx;
  const outNy = sy;
  const outNz = sz;
  const outSize = outNx * outNy * outNz;
  const out = new Float32Array(outSize);

  let min = Infinity;
  let max = -Infinity;

  if (sx === nx && sy === ny && sz === nz) {
    for (let i = 0; i < total; i++) {
      const v = (src as { [i: number]: number })[i];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = max - min || 1;
    for (let i = 0; i < total; i++) {
      out[i] = ((src as { [i: number]: number })[i] - min) / range;
    }
  } else {
    for (let zi = 0; zi < outNz; zi++) {
      for (let yi = 0; yi < outNy; yi++) {
        for (let xi = 0; xi < outNx; xi++) {
          const srcX = Math.min(Math.floor((xi / outNx) * nx), nx - 1);
          const srcY = Math.min(Math.floor((yi / outNy) * ny), ny - 1);
          const srcZ = Math.min(Math.floor((zi / outNz) * nz), nz - 1);
          const idx = srcZ * (nx * ny) + srcY * nx + srcX;
          const v = (src as { [i: number]: number })[idx];
          if (v < min) min = v;
          if (v > max) max = v;
        }
      }
    }
    const range = max - min || 1;
    for (let zi = 0; zi < outNz; zi++) {
      for (let yi = 0; yi < outNy; yi++) {
        for (let xi = 0; xi < outNx; xi++) {
          const srcX = Math.min(Math.floor((xi / outNx) * nx), nx - 1);
          const srcY = Math.min(Math.floor((yi / outNy) * ny), ny - 1);
          const srcZ = Math.min(Math.floor((zi / outNz) * nz), nz - 1);
          const srcIdx = srcZ * (nx * ny) + srcY * nx + srcX;
          const outIdx = zi * (outNx * outNy) + yi * outNx + xi;
          out[outIdx] = ((src as { [i: number]: number })[srcIdx] - min) / range;
        }
      }
    }
  }

  return {
    data: out,
    dims: [outNx, outNy, outNz],
    minMax: [min, max],
  };
}
