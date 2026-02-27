import { useMemo, useEffect } from "react";
import * as THREE from "three";
import type { VolumeData } from "@/lib/volumeUtils";

/** Builds a 256x1 grayscale colormap texture for volume shader u_cmdata. */
function createGrayscaleColormap(): THREE.DataTexture {
  const size = 256;
  const data = new Uint8Array(size * 4);
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1);
    data[i * 4] = Math.round(t * 255);
    data[i * 4 + 1] = Math.round(t * 255);
    data[i * 4 + 2] = Math.round(t * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const vertexShader = /* glsl */ `
varying vec4 v_nearpos;
varying vec4 v_farpos;
varying vec3 v_position;

void main() {
  mat4 viewtransformf = modelViewMatrix;
  mat4 viewtransformi = inverse(modelViewMatrix);
  vec4 position4 = vec4(position, 1.0);
  vec4 pos_in_cam = viewtransformf * position4;
  pos_in_cam.z = -pos_in_cam.w;
  v_nearpos = viewtransformi * pos_in_cam;
  pos_in_cam.z = pos_in_cam.w;
  v_farpos = viewtransformi * pos_in_cam;
  v_position = position;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;
}
`;

const fragmentShader = /* glsl */ `
precision highp float;
precision mediump sampler3D;

uniform vec3 u_size;
uniform int u_renderstyle;
uniform float u_renderthreshold;
uniform vec2 u_clim;
uniform sampler3D u_data;
uniform sampler2D u_cmdata;

varying vec3 v_position;
varying vec4 v_nearpos;
varying vec4 v_farpos;

const int MAX_STEPS = 256;
const float relative_step_size = 1.2;
const vec4 ambient_color = vec4(0.25, 0.3, 0.35, 1.0);
const vec4 diffuse_color = vec4(0.6, 0.65, 0.7, 1.0);
const vec4 specular_color = vec4(1.0, 1.0, 1.0, 0.4);
const float shininess = 32.0;

float sample1(vec3 texcoords) {
  return texture(u_data, texcoords).r;
}

vec4 apply_colormap(float val) {
  val = clamp((val - u_clim[0]) / (u_clim[1] - u_clim[0]), 0.0, 1.0);
  return texture2D(u_cmdata, vec2(val, 0.5));
}

void main() {
  vec3 farpos = v_farpos.xyz / v_farpos.w;
  vec3 nearpos = v_nearpos.xyz / v_nearpos.w;
  vec3 view_ray = normalize(nearpos.xyz - farpos.xyz);
  float distance = dot(nearpos - v_position, view_ray);
  distance = max(distance, min((-0.5 - v_position.x) / view_ray.x, (u_size.x - 0.5 - v_position.x) / view_ray.x));
  distance = max(distance, min((-0.5 - v_position.y) / view_ray.y, (u_size.y - 0.5 - v_position.y) / view_ray.y));
  distance = max(distance, min((-0.5 - v_position.z) / view_ray.z, (u_size.z - 0.5 - v_position.z) / view_ray.z));
  vec3 front = v_position + view_ray * distance;
  int nsteps = int(-distance / relative_step_size + 0.5);
  if (nsteps < 1) discard;
  vec3 step = ((v_position - front) / u_size) / float(nsteps);
  vec3 start_loc = front / u_size;

  float max_val = -1e6;
  int max_i = 0;
  vec3 loc = start_loc;
  for (int iter = 0; iter < 512; iter++) {
    if (iter >= nsteps) break;
    float val = sample1(loc);
    if (val > max_val) {
      max_val = val;
      max_i = iter;
    }
    loc += step;
  }
  vec3 iloc = start_loc + step * (float(max_i) - 0.5);
  vec3 N;
  float val = sample1(iloc);
  float d = 1.0 / min(u_size.x, min(u_size.y, u_size.z));
  N[0] = sample1(iloc + vec3(-d, 0.0, 0.0)) - sample1(iloc + vec3(d, 0.0, 0.0));
  N[1] = sample1(iloc + vec3(0.0, -d, 0.0)) - sample1(iloc + vec3(0.0, d, 0.0));
  N[2] = sample1(iloc + vec3(0.0, 0.0, -d)) - sample1(iloc + vec3(0.0, 0.0, d));
  float gm = length(N);
  N = normalize(N);
  float Nselect = float(dot(N, view_ray) > 0.0);
  N = (2.0 * Nselect - 1.0) * N;
  vec3 L = normalize(view_ray);
  float lambertTerm = clamp(dot(N, L), 0.0, 1.0);
  vec3 H = normalize(L + view_ray);
  float specularTerm = pow(max(dot(H, N), 0.0), shininess);
  vec4 color = apply_colormap(val);
  vec4 final_color = color * (ambient_color + diffuse_color * lambertTerm) + specular_color * specularTerm;
  final_color.a = color.a * 0.95;
  if (final_color.a < 0.05) discard;
  gl_FragColor = final_color;
}
`;

export interface VolumeMeshProps {
  volumeData: VolumeData;
  opacity?: number;
  climLow?: number;
  climHigh?: number;
}

export function VolumeMesh({ volumeData, opacity = 1, climLow = 0, climHigh = 1 }: VolumeMeshProps) {
  const [nx, ny, nz] = volumeData.dims;
  const { texture, colormap, size, clim } = useMemo(() => {
    const tex = new THREE.Data3DTexture(volumeData.data, nx, ny, nz);
    tex.format = THREE.RedFormat;
    tex.type = THREE.FloatType;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.wrapR = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;

    const cm = createGrayscaleColormap();
    const [minV, maxV] = volumeData.minMax;
    const range = maxV - minV || 1;
    const low = climLow !== undefined && climHigh !== undefined ? (climLow - minV) / range : 0;
    const high = climLow !== undefined && climHigh !== undefined ? (climHigh - minV) / range : 1;

    return {
      texture: tex,
      colormap: cm,
      size: new THREE.Vector3(nx, ny, nz),
      clim: new THREE.Vector2(low, high),
    };
  }, [volumeData, nx, ny, nz, climLow, climHigh]);

  useEffect(() => {
    return () => {
      texture.dispose();
      colormap.dispose();
    };
  }, [texture, colormap]);

  const uniforms = useMemo(
    () => ({
      u_size: { value: size },
      u_renderstyle: { value: 0 },
      u_renderthreshold: { value: 0.5 },
      u_clim: { value: clim },
      u_data: { value: texture },
      u_cmdata: { value: colormap },
    }),
    [size, clim, texture, colormap]
  );

  return (
    <mesh scale={[nx, ny, nz]} position={[-nx / 2, -ny / 2, -nz / 2]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        opacity={opacity}
        side={THREE.BackSide}
        depthWrite={true}
      />
    </mesh>
  );
}
