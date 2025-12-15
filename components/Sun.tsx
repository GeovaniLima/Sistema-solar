import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, CanvasTexture } from 'three';

export const Sun: React.FC = () => {
  const meshRef = useRef<Mesh>(null);

  // Create a procedural glow texture for the sun halo
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 240, 200, 1)'); // Center white-ish yellow
      gradient.addColorStop(0.2, 'rgba(255, 200, 50, 0.8)'); // Inner orange
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)'); // Outer orange/red
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent edge
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    return new CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Core Sun Mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          emissive="#FDB813" 
          emissiveIntensity={10} // Higher intensity for "bloom" look
          color="#FDB813" 
          toneMapped={false}
        />
      </mesh>
      
      {/* Sun Glow/Halo Sprite (Always faces camera) */}
      <sprite scale={[45, 45, 1]}>
        <spriteMaterial map={glowTexture} transparent opacity={0.6} blending={2} /> 
        {/* blending={2} is AdditiveBlending */}
      </sprite>

      {/* Main Light Source */}
      {/* Increased intensity to compensate for lower ambient light in scene */}
      <pointLight intensity={800} distance={500} decay={1.5} color="#fff0d0" />
    </group>
  );
};