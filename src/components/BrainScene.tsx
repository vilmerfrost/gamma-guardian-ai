import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface BrainSceneProps {
  showGTV?: boolean;
  showCTV?: boolean;
  showOAR?: boolean;
  showCochlea?: boolean;
  showFacial?: boolean;
  showBrainstem?: boolean;
  showOptic?: boolean;
  autoRotate?: boolean;
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
    () =>
      new THREE.CatmullRomCurve3([
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
}: {
  showGTV: boolean;
  showCTV: boolean;
  showCochlea: boolean;
  showFacial: boolean;
  showBrainstem: boolean;
  showOptic: boolean;
}) {
  const brainGeometry = useMemo(() => createBrainGeometry(), []);

  return (
    <group>
      <mesh geometry={brainGeometry}>
        <meshPhysicalMaterial
          color="#d0b7b2"
          roughness={0.78}
          metalness={0.04}
          clearcoat={0.22}
          clearcoatRoughness={0.55}
          transmission={0.06}
          thickness={0.8}
        />
      </mesh>

      {showGTV && (
        <mesh position={[-0.58, 0.35, 0.42]} scale={[1.05, 0.9, 0.85]}>
          <sphereGeometry args={[0.23, 48, 48]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.35} transparent opacity={0.72} />
        </mesh>
      )}

      {showCTV && (
        <mesh position={[-0.58, 0.35, 0.42]} scale={[1.18, 1.05, 1.08]}>
          <sphereGeometry args={[0.29, 48, 48]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.2} transparent opacity={0.28} wireframe />
        </mesh>
      )}

      {showCochlea && (
        <group>
          <mesh position={[-0.83, -0.48, 0.26]} rotation={[1.2, 0.4, 0.1]}>
            <torusGeometry args={[0.09, 0.022, 16, 80]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.83, -0.48, 0.26]} rotation={[1.2, -0.4, -0.1]}>
            <torusGeometry args={[0.09, 0.022, 16, 80]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.25} />
          </mesh>
        </group>
      )}

      {showFacial && <FacialNerveMesh />}

      {showBrainstem && (
        <mesh position={[0, -1.05, -0.08]} rotation={[0.25, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.15, 0.82, 32]} />
          <meshStandardMaterial color="#c8a9a0" roughness={0.75} />
        </mesh>
      )}

      {showOptic && (
        <mesh position={[0, -0.18, 0.92]}>
          <sphereGeometry args={[0.075, 24, 24]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
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
}: BrainSceneProps) {
  const cochleaVisible = showCochlea ?? showOAR;
  const facialVisible = showFacial ?? showOAR;
  const brainstemVisible = showBrainstem ?? showOAR;
  const opticVisible = showOptic ?? showOAR;

  return (
    <Canvas
      camera={{ position: [0, 0.45, 4], fov: 40 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.8 }}
    >
      <ambientLight intensity={0.58} />
      <hemisphereLight intensity={0.38} color="#c9def8" groundColor="#8f726c" />
      <directionalLight position={[4, 6, 3]} intensity={1.05} />
      <directionalLight position={[-4, 1, -3]} intensity={0.28} color="#93c5fd" />

      <SampleBrainModel
        showGTV={showGTV}
        showCTV={showCTV}
        showCochlea={cochleaVisible}
        showFacial={facialVisible}
        showBrainstem={brainstemVisible}
        showOptic={opticVisible}
      />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enablePan
        enableDamping
        dampingFactor={0.05}
        minDistance={2.1}
        maxDistance={8}
        rotateSpeed={0.65}
        zoomSpeed={0.75}
      />
    </Canvas>
  );
}
