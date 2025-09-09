import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';

interface BlochSphereProps {
  blochVector: { x: number; y: number; z: number };
  qubitIndex: number;
  className?: string;
  onClick?: () => void;
}

function SphereWireframe() {
  const sphereRef = useRef<THREE.LineSegments>(null);
  
  // Create wireframe geometry
  const wireframeGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 16, 12);
    return new THREE.WireframeGeometry(geometry);
  }, []);

  return (
    <lineSegments ref={sphereRef} geometry={wireframeGeometry}>
      <lineBasicMaterial color="#4a5568" transparent opacity={0.3} />
    </lineSegments>
  );
}

function AxisLines() {
  // X-axis (red)
  const xAxisPoints = useMemo(() => [
    new THREE.Vector3(-1.2, 0, 0),
    new THREE.Vector3(1.2, 0, 0)
  ], []);

  // Y-axis (green)
  const yAxisPoints = useMemo(() => [
    new THREE.Vector3(0, -1.2, 0),
    new THREE.Vector3(0, 1.2, 0)
  ], []);

  // Z-axis (blue)
  const zAxisPoints = useMemo(() => [
    new THREE.Vector3(0, 0, -1.2),
    new THREE.Vector3(0, 0, 1.2)
  ], []);

  return (
    <>
      <Line points={xAxisPoints} color="hsl(0 84% 60%)" lineWidth={2} />
      <Line points={yAxisPoints} color="hsl(120 60% 50%)" lineWidth={2} />
      <Line points={zAxisPoints} color="hsl(217 91% 60%)" lineWidth={2} />
      
      {/* Axis labels */}
      <Text position={[1.3, 0, 0]} fontSize={0.15} color="hsl(0 84% 60%)">
        X
      </Text>
      <Text position={[0, 1.3, 0]} fontSize={0.15} color="hsl(120 60% 50%)">
        Y
      </Text>
      <Text position={[0, 0, 1.3]} fontSize={0.15} color="hsl(217 91% 60%)">
        Z
      </Text>
    </>
  );
}

function BlochVector({ vector }: { vector: { x: number; y: number; z: number } }) {
  const vectorRef = useRef<THREE.Group>(null);
  
  const vectorPoints = useMemo(() => [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vector.x, vector.y, vector.z)
  ], [vector]);

  const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  
  useFrame(() => {
    if (vectorRef.current) {
      // Subtle pulsing animation
      const scale = 1 + 0.05 * Math.sin(Date.now() * 0.003);
      vectorRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={vectorRef}>
      <Line points={vectorPoints} color="hsl(184 81% 56%)" lineWidth={4} />
      
      {/* Vector endpoint sphere */}
      <mesh position={[vector.x, vector.y, vector.z]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="hsl(184 81% 56%)" />
      </mesh>
      
      {/* Glow effect */}
      <mesh position={[vector.x, vector.y, vector.z]}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial 
          color="hsl(184 81% 56%)" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Show magnitude if mixed state */}
      {magnitude < 0.95 && (
        <Text 
          position={[vector.x + 0.2, vector.y + 0.2, vector.z]} 
          fontSize={0.1} 
          color="hsl(184 81% 56%)"
        >
          |r| = {magnitude.toFixed(3)}
        </Text>
      )}
    </group>
  );
}

function Scene({ blochVector }: { blochVector: { x: number; y: number; z: number } }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <SphereWireframe />
      <AxisLines />
      <BlochVector vector={blochVector} />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        maxDistance={5}
        minDistance={2}
      />
    </>
  );
}

export function BlochSphere({ blochVector, qubitIndex, className, onClick }: BlochSphereProps) {
  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <div className="w-full h-64 rounded-lg overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
        <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
          <Scene blochVector={blochVector} />
        </Canvas>
      </div>
      
      {/* Qubit label */}
      <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-sm font-medium backdrop-blur-sm">
        Qubit {qubitIndex}
      </div>
      
      {/* Vector coordinates */}
      <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm border border-border rounded p-2 text-xs">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-quantum-axis-x font-medium">X</div>
            <div>{blochVector.x.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-quantum-axis-y font-medium">Y</div>
            <div>{blochVector.y.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-quantum-axis-z font-medium">Z</div>
            <div>{blochVector.z.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}