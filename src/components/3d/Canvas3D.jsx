import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { FloatingInventoryScene } from './FloatingInventoryScene.jsx';
import { ErrorBoundary } from '../common/ErrorBoundary.jsx';

function CameraController() {
  const activeSection = useScrollStore((state) => state.activeSection);
  const scrollProgress = useScrollStore((state) => state.scrollProgress || 0);
  const targets = useScrollStore((state) => state.sectionCameraTargets);

  useFrame(({ camera, pointer }) => {
    try {
      const fallbackTarget = { position: [0, 1.2, 5.5], rotation: [0, 0, 0], fov: 45 };
      const target = (targets && (targets[activeSection] || targets['dashboard'])) || fallbackTarget;
      
      const posX = Array.isArray(target?.position) ? target.position[0] : 0;
      const posY = Array.isArray(target?.position) ? target.position[1] : 1.2;
      const posZ = Array.isArray(target?.position) ? target.position[2] : 5.5;

      const rotX = Array.isArray(target?.rotation) ? target.rotation[0] : 0;
      const rotY = Array.isArray(target?.rotation) ? target.rotation[1] : 0;

      // Mouse parallax offset
      const px = (pointer?.x || 0) * 0.3;
      const py = (pointer?.y || 0) * 0.2;

      // Smooth lerp camera position
      const targetX = posX + px;
      const targetY = posY + py - (scrollProgress * 0.4);
      const targetZ = posZ;

      camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
      
      // Smooth camera rotation
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, rotX - (pointer?.y || 0) * 0.04, 0.04);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, rotY + (pointer?.x || 0) * 0.04, 0.04);
    } catch (err) {
      // Ignore frame error to prevent unmounting
    }
  });

  return null;
}

const AmbientCSSBackground = () => (
  <div className="canvas-bg-container overflow-hidden pointer-events-none">
    <div className="absolute -top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.08] blur-[120px] animate-pulse-slow pointer-events-none" />
    <div className="absolute top-[35%] right-[5%] w-[450px] h-[450px] rounded-full bg-cyan-500/[0.07] blur-[130px] animate-pulse pointer-events-none" />
    <div className="absolute bottom-[10%] left-[20%] w-[550px] h-[550px] rounded-full bg-emerald-600/[0.06] blur-[140px] pointer-events-none" />
  </div>
);

export const Canvas3D = () => {
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (fidelity3D === 'off' || !hasWebGL) {
    return <AmbientCSSBackground />;
  }

  return (
    <ErrorBoundary fallback={<AmbientCSSBackground />}>
      <div className="canvas-bg-container pointer-events-none">
        <Canvas
          camera={{ position: [0, 1.2, 5.5], fov: 45 }}
          gl={{ antialias: fidelity3D === 'high', alpha: true, powerPreference: 'high-performance' }}
          dpr={fidelity3D === 'high' ? [1, 1.5] : 1}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <CameraController />
          
          {/* Ambient & Directional Lights */}
          <ambientLight intensity={isDarkMode ? 0.8 : 1.1} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#22c55e" />
          <pointLight position={[-10, -10, -5]} intensity={1.2} color="#06b6d4" />
          <directionalLight position={[0, 5, 5]} intensity={0.9} color="#ffffff" />

          {/* Floating 3D Cyber Objects */}
          <FloatingInventoryScene />

          {/* Ambient background sparkles */}
          {fidelity3D === 'high' && (
            <Sparkles
              count={50}
              scale={12}
              size={2.5}
              speed={0.4}
              opacity={isDarkMode ? 0.35 : 0.2}
              color="#22c55e"
            />
          )}
        </Canvas>
      </div>
      {/* Background glow orbs behind canvas */}
      <AmbientCSSBackground />
    </ErrorBoundary>
  );
};
