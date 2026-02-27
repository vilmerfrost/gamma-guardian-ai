import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { VolumeData } from "@/lib/volumeUtils";
import { VolumeMesh } from "@/components/VolumeViewer";

type ClipAxis = "x" | "y" | "z" | "none";

interface BrainSceneProps {
  showGTV?: boolean;
  showCTV?: boolean;
  showOAR?: boolean;
  showCochlea?: boolean;
  showFacial?: boolean;
  showBrainstem?: boolean;
  showOptic?: boolean;
  autoRotate?: boolean;
  brainOpacity?: number;
  clipAxis?: ClipAxis;
  clipPosition?: number;
  /** When set, the 3D view shows this volume instead of the placeholder brain; overlays (GTV/CTV/OAR) are still shown. */
  volumeData?: VolumeData | null;
}

function createBrainGeometry() {
  const geometry = new THREE.SphereGeometry(1.35, 96, 96);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const sulci = Math.sin(v.x * 8) * Math.cos(v.y * 7) * Math.sin(v.z * 6) * 0.035;
    const hemispheres = Math.abs(v.x) * 0.025;
    const baseScale = 1 + sulci + hemispheres;
    v.multiplyScalar(baseScale);
    pos.setXYZ(i, v.x * 1.05, v.y * 0.9 + 0.08, v.z * 1.08);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function FacialNerveMesh() {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.72, -0.2, 0.4),
      new THREE.Vector3(-0.84, -0.35, 0.18),
      new THREE.Vector3(-0.86, -0.5, -0.08),
    ]),
    []
  );

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.032, 12, false), [curve]);

  return (
    <mesh geometry={tube}>
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
    </mesh>
  );
}

function SampleBrainModel({
  showGTV,
  showCTV,
  showCochlea,
  showFacial,
  showBrainstem,
  showOptic,
  brainOpacity,
  clippingPlanes,
  showPlaceholderBrain = true,
  overlayScale = 1,
}: {
  showGTV: boolean;
  showCTV: boolean;
  showCochlea: boolean;
  showFacial: boolean;
  showBrainstem: boolean;
  showOptic: boolean;
  brainOpacity: number;
  clippingPlanes?: THREE.Plane[];
  showPlaceholderBrain?: boolean;
  overlayScale?: number;
}) {
  const brainGeometry = useMemo(() => createBrainGeometry(), []);

  return (
    <group scale={[overlayScale, overlayScale, overlayScale]}>
      {showPlaceholderBrain && (
        <mesh geometry={brainGeometry}>
          <meshPhysicalMaterial
            color="#e7d2cb"
            roughness={0.6}
            metalness={0.05}
            clearcoat={0.4}
            clearcoatRoughness={0.7}
            transmission={0.12}
            thickness={1.2}
            ior={1.35}
            envMapIntensity={1.1}
            transparent
            opacity={brainOpacity}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {showGTV && (
        <mesh position={[-0.58, 0.35, 0.42]} scale={[1.05, 0.9, 0.85]}>
          <sphereGeometry args={[0.23, 48, 48]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.45}
            transparent
            opacity={0.78}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {showCTV && (
        <mesh position={[-0.58, 0.35, 0.42]} scale={[1.18, 1.05, 1.08]}>
          <sphereGeometry args={[0.29, 48, 48]} />
          <meshStandardMaterial
            color="#7c3aed"
            emissive="#7c3aed"
            emissiveIntensity={0.25}
            transparent
            opacity={0.32}
            wireframe
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {showCochlea && (
        <group>
          <mesh position={[-0.83, -0.48, 0.26]} rotation={[1.2, 0.4, 0.1]}>
            <torusGeometry args={[0.09, 0.022, 16, 80]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.55}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
          <mesh position={[0.83, -0.48, 0.26]} rotation={[1.2, -0.4, -0.1]}>
            <torusGeometry args={[0.09, 0.022, 16, 80]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.55}
              clippingPlanes={clippingPlanes}
            />
          </mesh>
        </group>
      )}

      {showFacial && <FacialNerveMesh />}

      {showBrainstem && (
        <mesh position={[0, -1.05, -0.08]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.82, 32]} />
          <meshStandardMaterial
            color="#0ea5e9"
            roughness={0.7}
            emissive="#0ea5e9"
            emissiveIntensity={0.35}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}

      {showOptic && (
        <mesh position={[0, -0.18, 0.92]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.35}
            clippingPlanes={clippingPlanes}
          />
        </mesh>
      )}
    </group>
  );
}

export default function BrainScene({
  showGTV = true,
  showCTV = true,
  showOAR = true,
  showCochlea,
  showFacial,
  showBrainstem,
  showOptic,
  autoRotate = true,
  brainOpacity = 0.9,
  clipAxis = "none",
  clipPosition = 0,
  volumeData = null,
}: BrainSceneProps) {
  const cochleaVisible = showCochlea ?? showOAR;
  const facialVisible = showFacial ?? showOAR;
  const brainstemVisible = showBrainstem ?? showOAR;
  const opticVisible = showOptic ?? showOAR;

  const hasVolume = volumeData != null && volumeData.data.length > 0;
  const [nx, ny, nz] = volumeData?.dims ?? [1, 1, 1];
  const maxDim = Math.max(nx, ny, nz);
  const cameraZ = hasVolume ? maxDim * 1.4 : 4;
  const minDist = hasVolume ? maxDim * 0.6 : 2.1;
  const maxDist = hasVolume ? maxDim * 3 : 8;
  const overlayScale = hasVolume ? maxDim * 0.35 : 1;

  const clippingPlanes = useMemo<THREE.Plane[] | undefined>(() => {
    if (clipAxis === "none") return undefined;

    const normal =
      clipAxis === "x"
        ? new THREE.Vector3(-1, 0, 0)
        : clipAxis === "y"
          ? new THREE.Vector3(0, -1, 0)
          : new THREE.Vector3(0, 0, -1);

    return [new THREE.Plane(normal, clipPosition)];
  }, [clipAxis, clipPosition]);

  return (
    <Canvas
      camera={{ position: [0, 0, cameraZ], fov: 40 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", localClippingEnabled: true }}
      performance={{ min: 0.8 }}
    >
      <ambientLight intensity={0.58} />
      <hemisphereLight intensity={0.38} color="#c9def8" groundColor="#8f726c" />
      <directionalLight position={[4, 6, 3]} intensity={1.1} />
      <directionalLight position={[-4, 1, -3]} intensity={0.45} color="#93c5fd" />
      <directionalLight position={[0, 3.5, -4]} intensity={0.85} color="#38bdf8" />

      {hasVolume && (
        <VolumeMesh volumeData={volumeData} opacity={brainOpacity} />
      )}

      <SampleBrainModel
        showGTV={showGTV}
        showCTV={showCTV}
        showCochlea={cochleaVisible}
        showFacial={facialVisible}
        showBrainstem={brainstemVisible}
        showOptic={opticVisible}
        brainOpacity={brainOpacity}
        clippingPlanes={clippingPlanes}
        showPlaceholderBrain={!hasVolume}
        overlayScale={overlayScale}
      />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={minDist}
        maxDistance={maxDist}
        rotateSpeed={0.65}
        zoomSpeed={0.75}
      />
    </Canvas>
  );
}
