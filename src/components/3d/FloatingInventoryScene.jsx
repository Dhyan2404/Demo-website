import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '../../store/useThemeStore.js';
import { useScrollStore } from '../../store/useScrollStore.js';

function GlowingInventoryCube({ position, color, scale = 1, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.sin(t * 0.5) * 0.3 + t * 0.2;
    meshRef.current.rotation.y = Math.cos(t * 0.3) * 0.3 + t * 0.3;
  });

  return (
    <Float speed={speed * 1.5} rotationIntensity={1} floatIntensity={1.5} position={position}>
      <mesh ref={meshRef} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.8}
          transmission={0.4}
          ior={1.5}
          thickness={0.5}
          transparent
          opacity={0.75}
        />
      </mesh>
    </Float>
  );
}

function FloatingGoldCoin({ position, scale = 0.6 }) {
  const coinRef = useRef();

  useFrame((state) => {
    if (!coinRef.current) return;
    const t = state.clock.getElapsedTime();
    coinRef.current.rotation.y = t * 1.2;
    coinRef.current.rotation.z = Math.sin(t * 0.8) * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2} position={position}>
      <group ref={coinRef} scale={scale}>
        <cylinderGeometry args={[0.8, 0.8, 0.12, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.9}
          roughness={0.2}
          emissive="#f59e0b"
          emissiveIntensity={0.25}
        />
      </group>
    </Float>
  );
}

function CyberRing({ position, radius = 2, color = '#22c55e' }) {
  const ringRef = useRef();

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = state.clock.getElapsedTime();
    ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.3) * 0.2;
    ringRef.current.rotation.z = t * 0.2;
  });

  return (
    <group ref={ringRef} position={position}>
      <mesh>
        <torusGeometry args={[radius, 0.02, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export const FloatingInventoryScene = () => {
  const activeSection = useScrollStore((state) => state.activeSection);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <group>
      {/* Central / Left Floating Cyber Emerald Box */}
      <GlowingInventoryCube
        position={[-2.4, 0.8, -0.5]}
        color="#22c55e"
        scale={0.9}
        speed={0.8}
      />

      {/* Right Floating Cyan Analytics Crystal */}
      <GlowingInventoryCube
        position={[2.6, 0.5, -0.8]}
        color="#06b6d4"
        scale={0.75}
        speed={1.1}
      />

      {/* Floating Gold Profit Coins */}
      <FloatingGoldCoin position={[2.2, 1.8, -0.3]} scale={0.55} />
      <FloatingGoldCoin position={[-2.0, -1.2, 0.2]} scale={0.45} />
      <FloatingGoldCoin position={[0.8, -1.6, -1]} scale={0.65} />

      {/* Background Amber Balance Node */}
      <GlowingInventoryCube
        position={[0.2, 2.2, -2.5]}
        color="#f59e0b"
        scale={1.2}
        speed={0.6}
      />

      {/* Cyber Orbits */}
      <CyberRing position={[-2.4, 0.8, -0.5]} radius={1.4} color="#22c55e" />
      <CyberRing position={[2.6, 0.5, -0.8]} radius={1.2} color="#06b6d4" />
      <CyberRing position={[0, -0.5, -2]} radius={3.2} color={isDarkMode ? '#3b82f6' : '#10b981'} />
    </group>
  );
};
