'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { Suspense, useRef, useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls, Text3D, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitingTextProps {
  radius: number;
  speed: number;
  phase: number;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

function OrbitingText({ radius, speed, phase, text, isSelected, onClick }: OrbitingTextProps) {
  const textRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase;
    if (textRef.current) {
      textRef.current.position.x = Math.cos(t) * radius;
      textRef.current.position.z = Math.sin(t) * radius;
      textRef.current.rotation.y = Math.atan2(
        textRef.current.position.x,
        textRef.current.position.z
      );
    }
  });

  return (
    <group
      ref={textRef}
      position={[radius, 0, 0]}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Text3D
        font="/fonts/helvetiker_regular.json"
        size={0.5}
        height={0.1}
        curveSegments={12}
      >
        {text}
        <meshStandardMaterial
          color={isSelected ? "#800080" : (hovered ? "#888888" : "#ffffff")}
        />
      </Text3D>
    </group>
  );
}

function Model() {
  const groupRef = useRef<THREE.Group>(null);
  const materials = useLoader(MTLLoader, '/ironman.mtl');
  const obj = useLoader(OBJLoader, '/ironman.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (obj && groupRef.current) {
      const box = new THREE.Box3().setFromObject(obj);
      const center = new THREE.Vector3();
      box.getCenter(center);
      obj.position.sub(center);
    }
  }, [obj]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const targetRotationX = -mousePos.y * 0.5;
      const targetRotationY = mousePos.x * 0.5;

      const wobbleX = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
      const wobbleY = Math.sin(clock.getElapsedTime() * 0.7) * 0.05;

      groupRef.current.rotation.x = targetRotationX + wobbleX;
      groupRef.current.rotation.y = targetRotationY + wobbleY;

      groupRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={obj}
        scale={0.03}
      />
    </group>
  );
}

export default function Home() {
  const [selectedText, setSelectedText] = useState<string | null>(null);

  const handleTextClick = (text: string) => {
    setSelectedText(selectedText === text ? null : text);
  };

  return (
    <div style={{ height: '100vh', background: '#000000' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#000000']} />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model />
          <OrbitingText
            radius={3}
            speed={0.3}
            phase={0}
            text="Projects"
            isSelected={selectedText === "Projects"}
            onClick={() => handleTextClick("Projects")}
          />
          <OrbitingText
            radius={3}
            speed={0.3}
            phase={Math.PI / 2}
            text="Contact"
            isSelected={selectedText === "Contact"}
            onClick={() => handleTextClick("Contact")}
          />
          <OrbitingText
            radius={3}
            speed={0.3}
            phase={Math.PI}
            text="Experience"
            isSelected={selectedText === "Experience"}
            onClick={() => handleTextClick("Experience")}
          />
          <OrbitingText
            radius={3}
            speed={0.3}
            phase={3 * Math.PI / 2}
            text="About Me"
            isSelected={selectedText === "About Me"}
            onClick={() => handleTextClick("About Me")}
          />
        </Suspense>
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
