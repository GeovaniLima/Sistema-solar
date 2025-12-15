import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color, AdditiveBlending, CanvasTexture } from 'three';
import { Html } from '@react-three/drei';
import { PlanetData } from '../types';

interface PlanetProps {
  data: PlanetData;
  timeScale: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  paused: boolean;
}

export const Planet: React.FC<PlanetProps> = ({ data, timeScale, isSelected, onSelect, paused }) => {
  const meshRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  
  // Random start position ensures planets aren't aligned in a straight line at start
  const orbitRef = useRef<number>(Math.random() * Math.PI * 2); 
  const [hovered, setHovered] = useState(false);

  // Base constants to tune the visual speed of the simulation
  const BASE_ORBIT_SPEED = 0.05; 
  const BASE_SELF_ROTATION_SPEED = 0.5;

  // Gerar textura de nuvens proceduralmente apenas para a Terra
  const cloudTexture = useMemo(() => {
    if (data.id !== 'earth') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256; // 2:1 aspect ratio para projeção esférica
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fundo transparente
      context.fillStyle = 'rgba(0,0,0,0)';
      context.fillRect(0, 0, 512, 256);

      // Desenhar "manchas" brancas aleatórias para simular nuvens
      context.fillStyle = 'rgba(255, 255, 255, 0.6)';
      context.filter = 'blur(4px)'; // Suavizar as bordas

      for (let i = 0; i < 150; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        // Tamanhos variados de nuvens
        const radius = Math.random() * 30 + 10;
        
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    return new CanvasTexture(canvas);
  }, [data.id]);

  useFrame((state, delta) => {
    // If paused, we skip all movement updates
    if (paused) return;

    // Calculate the time step based on simulation speed
    const timeStep = delta * timeScale;

    // Update Orbit Angle (Translation)
    orbitRef.current += data.speed * BASE_ORBIT_SPEED * timeStep;

    if (meshRef.current) {
      // Calculate precise position on the orbital plane
      const x = Math.cos(orbitRef.current) * data.distance;
      const z = Math.sin(orbitRef.current) * data.distance;
      meshRef.current.position.set(x, 0, z);
      
      // Update Planet Rotation (Day/Night Cycle)
      meshRef.current.rotation.y += BASE_SELF_ROTATION_SPEED * timeStep;

      // Animação das nuvens (Terra)
      if (cloudsRef.current) {
        // Nuvens giram um pouco mais rápido que a superfície para criar paralaxe
        cloudsRef.current.rotation.y += (BASE_SELF_ROTATION_SPEED * 1.1) * timeStep;
      }
    }
  });

  return (
    <group>
      {/* Orbit Path (Visual Ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.1, data.distance + 0.1, 128]} />
        <meshBasicMaterial color="#ffffff" opacity={0.05} transparent side={2} />
      </mesh>

      {/* The Planet Group */}
      <group>
          <mesh
            ref={meshRef}
            name={data.id} // Essential for the CameraController to find this object in the scene
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            onPointerOver={() => {
                document.body.style.cursor = 'pointer';
                setHovered(true);
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'auto';
                setHovered(false);
            }}
          >
            {/* Main Surface */}
            <sphereGeometry args={[data.size, 64, 64]} />
            <meshStandardMaterial 
              color={data.color} 
              roughness={0.7}
              metalness={0.2}
              emissive={isSelected || hovered ? data.color : '#000000'}
              emissiveIntensity={isSelected || hovered ? 0.3 : 0}
            />

            {/* Earth Clouds Layer */}
            {data.id === 'earth' && cloudTexture && (
              <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]}>
                <sphereGeometry args={[data.size, 64, 64]} />
                <meshStandardMaterial 
                  map={cloudTexture} 
                  transparent 
                  opacity={0.8} 
                  side={2}
                  depthWrite={false} // Evita bugs visuais de z-fighting
                />
              </mesh>
            )}

            {/* Atmosphere Glow (Fake Atmospheric scattering) */}
            <mesh scale={[1.2, 1.2, 1.2]}>
               <sphereGeometry args={[data.size, 32, 32]} />
               <meshBasicMaterial 
                 color={data.color} 
                 transparent 
                 opacity={0.15} 
                 blending={AdditiveBlending} 
                 side={2} 
               />
            </mesh>
            
            {/* Saturn-like Rings */}
            {data.ring && (
              <mesh rotation={[-Math.PI / 2.5, 0, 0]}>
                <ringGeometry args={[data.ring.innerRadius, data.ring.outerRadius, 64]} />
                <meshStandardMaterial 
                  color={data.ring.color} 
                  side={2} 
                  transparent 
                  opacity={0.8} 
                  emissive={data.ring.color}
                  emissiveIntensity={0.2}
                />
              </mesh>
            )}

            {/* Planet Label (Only visible on hover or select) */}
            {(hovered || isSelected) && (
                <Html distanceFactor={15}>
                    <div className="bg-black/80 text-white px-2 py-1 rounded text-xs border border-white/20 whitespace-nowrap backdrop-blur-sm pointer-events-none select-none">
                        {data.name}
                    </div>
                </Html>
            )}
          </mesh>
      </group>
    </group>
  );
};