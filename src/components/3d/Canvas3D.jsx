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

/**
 * Ultra-Smooth Dynamic 2D Ambient Gradient Mesh Background
 * Features floating animated orbs with 0% CPU/GPU overhead!
 */
const AmbientCSSBackground = ({ isDarkMode }) => (
  <div className="canvas-bg-container overflow-hidden pointer-events-none">
    {isDarkMode ? (
      <>
        {/* Obsidian Dark Mode Animated Aurora Glows */}
        <div className="absolute -top-[15%] left-[8%] w-[550px] h-[550px] rounded-full bg-emerald-500/[0.12] blur-[130px] animate-float pointer-events-none" />
        <div className="absolute top-[30%] right-[3%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.10] blur-[140px] animate-float-reverse pointer-events-none" />
        <div className="absolute bottom-[8%] left-[18%] w-[600px] h-[600px] rounded-full bg-emerald-600/[0.08] blur-[150px] animate-pulse-subtle pointer-events-none" />
        <div className="absolute top-[60%] left-[45%] w-[400px] h-[400px] rounded-full bg-teal-500/[0.07] blur-[120px] animate-float pointer-events-none" />
      </>
    ) : (
      <>
        {/* Luxury Pearl, Champagne Gold & Emerald Glow for Light Mode */}
        <div className="absolute -top-[15%] left-[8%] w-[550px] h-[550px] rounded-full bg-emerald-500/[0.16] blur-[130px] animate-float pointer-events-none" />
        <div className="absolute top-[25%] right-[3%] w-[500px] h-[500px] rounded-full bg-amber-400/[0.14] blur-[140px] animate-float-reverse pointer-events-none" />
        <div className="absolute bottom-[8%] left-[18%] w-[600px] h-[600px] rounded-full bg-sky-400/[0.12] blur-[150px] animate-pulse-subtle pointer-events-none" />
        <div className="absolute top-[55%] left-[45%] w-[400px] h-[400px] rounded-full bg-emerald-400/[0.10] blur-[120px] animate-float pointer-events-none" />
      </>
    )}
  </div>
);

export const Canvas3D = () => {
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try {
      const mobile = window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);

      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  // On mobile phone screens, default to 2D CSS background unless explicitly forced by desktop
  if (fidelity3D === 'off' || !hasWebGL || isMobile) {
    return <AmbientCSSBackground isDarkMode={isDarkMode} />;
  }

  return (
    <ErrorBoundary fallback={<AmbientCSSBackground isDarkMode={isDarkMode} />}>
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
          <ambientLight intensity={isDarkMode ? 0.8 : 1.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color={isDarkMode ? '#22c55e' : '#10b981'} />
          <pointLight position={[-10, -10, -5]} intensity={1.2} color={isDarkMode ? '#06b6d4' : '#0284c7'} />
          <directionalLight position={[0, 5, 5]} intensity={1.0} color="#ffffff" />

          {/* Floating 3D Cyber Objects */}
          <FloatingInventoryScene />

          {/* Ambient background sparkles */}
          {fidelity3D === 'high' && (
            <Sparkles
              count={45}
              scale={12}
              size={2.5}
              speed={0.3}
              opacity={isDarkMode ? 0.35 : 0.25}
              color={isDarkMode ? '#22c55e' : '#10b981'}
            />
          )}
        </Canvas>
      </div>
      {/* Dynamic Animated Ambient Background */}
      <AmbientCSSBackground isDarkMode={isDarkMode} />
    </ErrorBoundary>
  );
};
