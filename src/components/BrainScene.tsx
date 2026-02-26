import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BrainSceneProps {
  showGTV?: boolean;
  showCTV?: boolean;
  showOAR?: boolean;
  autoRotate?: boolean;
  gtvPosition?: [number, number, number];
  gtvSize?: [number, number, number];
}

/* ───────── Realistic procedural brain ───────── */

function BrainHemisphere({ side }: { side: "left" | "right" }) {
  const ref = useRef<THREE.Mesh>(null);
  const x = side === "left" ? -0.48 : 0.48;

  return (
    <mesh ref={ref} position={[x, 0.15, 0]} rotation={[0, 0, side === "left" ? 0.08 : -0.08]}>
      <sphereGeometry args={[1.15, 64, 64]} />
      <MeshDistortMaterial
        color="#c4a6a0"
        roughness={0.85}
        metalness={0.05}
        distort={0.28}
        speed={0.4}
        transparent
        opacity={0.92}
        depthWrite
      />
    </mesh>
  );
}

function BrainSurface() {
  // Outer cortex layer with sulci-like distortion
  return (
    <group>
      <BrainHemisphere side="left" />
      <BrainHemisphere side="right" />

      {/* Fissure between hemispheres */}
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
        <meshStandardMaterial color="#8a6860" roughness={1} />
      </mesh>

      {/* Cerebellum */}
      <mesh position={[0, -0.9, -0.35]}>
        <sphereGeometry args={[0.6, 48, 48]} />
        <MeshDistortMaterial
          color="#b8948e"
          roughness={0.9}
          metalness={0.02}
          distort={0.22}
          speed={0.3}
          depthWrite
        />
      </mesh>

      {/* Brain stem */}
      <mesh position={[0, -1.25, -0.15]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.14, 0.7, 24]} />
        <meshStandardMaterial color="#a07e78" roughness={0.9} metalness={0.02} />
      </mesh>
    </group>
  );
}

/* ───────── Tumor (GTV) ───────── */

function Tumor({
  position = [-0.6, 0.4, 0.5] as [number, number, number],
  size = [0.22, 0.18, 0.2] as [number, number, number],
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.8) * 0.04;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh ref={ref} position={position} renderOrder={2}>
      <sphereGeometry args={[size[0], 48, 48]} />
      <meshPhysicalMaterial
        color="#e03030"
        transparent
        opacity={0.55}
        roughness={0.4}
        metalness={0.1}
        emissive="#cc2020"
        emissiveIntensity={0.35}
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

/* ───────── CTV margin overlay ───────── */

function CTVMargin({
  position = [-0.6, 0.4, 0.5] as [number, number, number],
  size = 0.32,
}) {
  return (
    <mesh position={position} renderOrder={1}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshPhysicalMaterial
        color="#7c3aed"
        transparent
        opacity={0.1}
        roughness={0.6}
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe
      />
    </mesh>
  );
}

/* ───────── OAR markers ───────── */

function OARMarkers() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
        if (mat?.opacity !== undefined) {
          mat.opacity = 0.25 + Math.sin(clock.elapsedTime * 1.2) * 0.1;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left optic nerve */}
      <mesh position={[-0.35, -0.1, 0.95]} rotation={[0.2, 0.3, 0]} renderOrder={3}>
        <cylinderGeometry args={[0.035, 0.03, 0.55, 12]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
          emissive="#f59e0b"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Right optic nerve */}
      <mesh position={[0.35, -0.1, 0.95]} rotation={[0.2, -0.3, 0]} renderOrder={3}>
        <cylinderGeometry args={[0.035, 0.03, 0.55, 12]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
          emissive="#f59e0b"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Optic chiasm */}
      <mesh position={[0, -0.2, 0.85]} renderOrder={3}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
          emissive="#f59e0b"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Cochlea left */}
      <mesh position={[-0.65, -0.45, 0.3]} renderOrder={3}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
          emissive="#f59e0b"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Cochlea right */}
      <mesh position={[0.65, -0.45, 0.3]} renderOrder={3}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshPhysicalMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
          emissive="#f59e0b"
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}

/* ───────── Radiation beam lines ───────── */

function BeamLines({ position = [-0.6, 0.4, 0.5] as [number, number, number] }) {
  const beamsRef = useRef<THREE.Group>(null);
  const angles = useMemo(() => [0, 45, 90, 135, 180, 225, 270, 315], []);

  useFrame(({ clock }) => {
    if (beamsRef.current) {
      beamsRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 0.06 + Math.sin(clock.elapsedTime * 2.5 + i * 0.5) * 0.04;
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const len = 3.5;
        const start = new THREE.Vector3(
          position[0] + Math.cos(rad) * len,
          position[1] + Math.sin(rad * 0.4) * len * 0.25,
          position[2] + Math.sin(rad) * len
        );
        const end = new THREE.Vector3(...position);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(end, start);

        return (
          <mesh
            key={i}
            position={mid}
            quaternion={new THREE.Quaternion().setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              dir.clone().normalize()
            )}
            renderOrder={0}
          >
            <cylinderGeometry args={[0.006, 0.006, dir.length(), 4]} />
            <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ───────── Isocenter crosshair ───────── */

function Crosshair({ position = [-0.6, 0.4, 0.5] as [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.2;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={ref} position={position} renderOrder={4}>
      <mesh>
        <ringGeometry args={[0.04, 0.055, 48]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.04, 0.055, 48]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ───────── GL config helper ───────── */

function GLConfig() {
  const { gl } = useThree();

  useEffect(() => {
    gl.sortObjects = true;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
  }, [gl]);

  return null;
}

/* ───────── Main scene ───────── */

export default function BrainScene({
  showGTV = true,
  showCTV = true,
  showOAR = true,
  autoRotate = true,
  gtvPosition = [-0.6, 0.4, 0.5],
  gtvSize = [0.22, 0.18, 0.2],
}: BrainSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.2], fov: 40 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        logarithmicDepthBuffer: true,
      }}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <GLConfig />

      {/* Lighting for realistic depth */}
      <ambientLight intensity={0.5} color="#f0ebe6" />
      <directionalLight position={[5, 8, 5]} intensity={0.8} color="#ffffff" castShadow />
      <directionalLight position={[-3, 2, -4]} intensity={0.25} color="#a0c4ff" />
      <pointLight position={gtvPosition} intensity={0.6} color="#ff4444" distance={3} decay={2} />
      <hemisphereLight args={["#b0d4f1", "#8b6f66", 0.3]} />

      {/* Brain geometry */}
      <BrainSurface />

      {/* Clinical overlays */}
      {showGTV && <Tumor position={gtvPosition} size={gtvSize} />}
      {showCTV && <CTVMargin position={gtvPosition} size={gtvSize[0] * 1.5} />}
      {showOAR && <OARMarkers />}
      <BeamLines position={gtvPosition} />
      <Crosshair position={gtvPosition} />

      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
        enablePan
        panSpeed={0.6}
        minDistance={2}
        maxDistance={9}
        rotateSpeed={0.7}
        zoomSpeed={0.7}
      />
    </Canvas>
  );
}
