import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BrainSceneProps {
  showGTV?: boolean;
  showCTV?: boolean;
  showOAR?: boolean;
  autoRotate?: boolean;
  gtvPosition?: [number, number, number];
  gtvSize?: [number, number, number];
}

function BrainMesh() {
  return (
    <Sphere args={[1.8, 48, 48]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="hsl(215, 25%, 55%)"
        transparent
        opacity={0.12}
        roughness={0.8}
        metalness={0.1}
        distort={0.1}
        speed={0.5}
        wireframe={false}
      />
    </Sphere>
  );
}

function BrainWireframe() {
  return (
    <Sphere args={[1.82, 24, 24]} position={[0, 0, 0]}>
      <meshBasicMaterial color="hsl(215, 30%, 60%)" transparent opacity={0.06} wireframe />
    </Sphere>
  );
}

function InnerStructure() {
  return (
    <>
      <Sphere args={[1.4, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial color="hsl(215, 20%, 50%)" transparent opacity={0.05} />
      </Sphere>
      {/* Ventricles - simplified */}
      <mesh position={[-0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshBasicMaterial color="hsl(215, 30%, 35%)" transparent opacity={0.12} />
      </mesh>
      <mesh position={[0.15, 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <meshBasicMaterial color="hsl(215, 30%, 35%)" transparent opacity={0.12} />
      </mesh>
    </>
  );
}

function Tumor({ position = [-0.6, 0.4, 0.5] as [number, number, number], size = [0.22, 0.18, 0.2] as [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2) * 0.05;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size[0], 32, 32]} />
      <meshStandardMaterial color="hsl(0, 72%, 51%)" transparent opacity={0.6} emissive="hsl(0, 72%, 40%)" emissiveIntensity={0.4} />
    </mesh>
  );
}

function CTVMargin({ position = [-0.6, 0.4, 0.5] as [number, number, number], size = 0.32 }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshBasicMaterial color="hsl(260, 55%, 50%)" transparent opacity={0.08} wireframe />
    </mesh>
  );
}

function OARMarkers() {
  const cochleaRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (cochleaRef.current) {
      const mat = cochleaRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.3 + Math.sin(clock.elapsedTime * 1.5) * 0.15;
    }
  });
  return (
    <>
      {/* Cochlea */}
      <mesh ref={cochleaRef} position={[-0.5, -0.3, 0.4]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="hsl(38, 92%, 50%)" transparent opacity={0.3} />
      </mesh>
      {/* Brainstem */}
      <mesh position={[0, -0.8, -0.1]}>
        <cylinderGeometry args={[0.18, 0.14, 0.5, 16]} />
        <meshStandardMaterial color="hsl(38, 92%, 50%)" transparent opacity={0.12} />
      </mesh>
      {/* Optic nerve */}
      <mesh position={[0.3, 0.2, 0.8]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="hsl(38, 92%, 50%)" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

function BeamLines({ position = [-0.6, 0.4, 0.5] as [number, number, number] }) {
  const beamsRef = useRef<THREE.Group>(null);
  const angles = useMemo(() => [0, 40, 80, 120, 160, 200, 240, 280, 320], []);

  useFrame(({ clock }) => {
    if (beamsRef.current) {
      beamsRef.current.children.forEach((child, i) => {
        const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.opacity = 0.08 + Math.sin(clock.elapsedTime * 2 + i * 0.4) * 0.06;
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const length = 3;
        const start = new THREE.Vector3(
          position[0] + Math.cos(rad) * length,
          position[1] + Math.sin(rad * 0.5) * length * 0.3,
          position[2] + Math.sin(rad) * length
        );
        const end = new THREE.Vector3(...position);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(end, start);
        
        return (
          <mesh key={i} position={mid} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())}>
            <cylinderGeometry args={[0.008, 0.008, dir.length(), 4]} />
            <meshBasicMaterial color="hsl(187, 80%, 42%)" transparent opacity={0.12} />
          </mesh>
        );
      })}
    </group>
  );
}

function Crosshair({ position = [-0.6, 0.4, 0.5] as [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.3;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.05, 0.06, 32]} />
      <meshBasicMaterial color="hsl(187, 80%, 52%)" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

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
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.4} />
      <pointLight position={gtvPosition} intensity={0.5} color="hsl(0, 72%, 51%)" distance={3} />
      
      <BrainMesh />
      <BrainWireframe />
      <InnerStructure />
      
      {showGTV && <Tumor position={gtvPosition} size={gtvSize} />}
      {showCTV && <CTVMargin position={gtvPosition} size={gtvSize[0] * 1.5} />}
      {showOAR && <OARMarkers />}
      <BeamLines position={gtvPosition} />
      <Crosshair position={gtvPosition} />
      
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        enableDamping
        dampingFactor={0.12}
        enablePan={false}
        minDistance={2.5}
        maxDistance={8}
        rotateSpeed={0.8}
        zoomSpeed={0.8}
      />
    </Canvas>
  );
}
