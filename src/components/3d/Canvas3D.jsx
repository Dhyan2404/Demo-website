import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollStore } from '../../store/useScrollStore.js';
import { useThemeStore } from '../../store/useThemeStore.js';
import { FloatingInventoryScene } from './FloatingInventoryScene.jsx';

function CameraController() {
  const activeSection = useScrollStore((state) => state.activeSection);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const targets = useScrollStore((state) => state.sectionCameraTargets);

  useFrame(({ camera, pointer }) => {
    const target = targets[activeSection] || targets['dashboard'];
    
    // Mouse parallax offset
    const parallaxX = pointer.x * 0.4;
    const parallaxY = pointer.y * 0.3;

    // Smooth lerp camera position
    const targetX = target.position[0] + parallaxX;
    const targetY = target.position[1] + parallaxY - (scrollProgress * 0.5);
    const targetZ = target.position[2];

    camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.04);
    
    // Smooth camera rotation
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, target.rotation[0] - pointer.y * 0.05, 0.04);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, target.rotation[1] + pointer.x * 0.05, 0.04);
  });

  return null;
}

export const Canvas3D = () => {
  const fidelity3D = useThemeStore((state) => state.fidelity3D);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  if (fidelity3D === 'off') {
    return null;
  }

  return (
    <div className="canvas-bg-container">
      <Canvas
        camera={{ position: [0, 1.2, 5.5], fov: 45 }}
        gl={{ antialias: fidelity3D === 'high', alpha: true, powerPreference: 'high-performance' }}
        dpr={fidelity3D === 'high' ? [1, 1.5] : 1}
      >
        <CameraController />
        
        {/* Ambient & Directional Lights */}
        <ambientLight intensity={isDarkMode ? 0.6 : 0.9} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#22c55e" />
        <pointLight position={[-10, -10, -5]} intensity={1.2} color="#06b6d4" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} color="#ffffff" />

        {/* Floating 3D Cyber Objects */}
        <FloatingInventoryScene />

        {/* Ambient background sparkles */}
        {fidelity3D === 'high' && (
          <Sparkles
            count={60}
            scale={12}
            size={2.5}
            speed={0.4}
            opacity={isDarkMode ? 0.4 : 0.2}
            color="#22c55e"
          />
        )}
      </Canvas>
    </div>
  );
};
