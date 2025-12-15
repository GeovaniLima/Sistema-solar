import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3, Color, AdditiveBlending } from 'three';
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
  // Random start position ensures planets aren't aligned in a straight line at start
  const orbitRef = useRef<number>(Math.random() * Math.PI * 2); 
  const [hovered, setHovered] = useState(false);

  // Base constants to tune the visual speed of the simulation
  const BASE_ORBIT_SPEED = 0.05; 
  const BASE_SELF_ROTATION_SPEED = 0.5;

  useFrame((state, delta) => {
    // If paused, we skip all movement updates
    if (paused) return;

    // Calculate the time step based on simulation speed
    const timeStep = delta * timeScale;

    // Update Orbit Angle (Translation)
    // We use data.speed (relative velocity) scaled by our base constant and time scale
    orbitRef.current += data.speed * BASE_ORBIT_SPEED * timeStep;

    if (meshRef.current) {
      // Calculate precise position on the orbital plane
      const x = Math.cos(orbitRef.current) * data.distance;
      const z = Math.sin(orbitRef.current) * data.distance;
      meshRef.current.position.set(x, 0, z);
      
      // Update Planet Rotation (Day/Night Cycle)
      // Planets rotate on their axis while orbiting
      meshRef.current.rotation.y += BASE_SELF_ROTATION_SPEED * timeStep;
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

            {/* Atmosphere Glow (Fake Atmospheric scattering) */}
            {/* We render a slightly larger sphere with additive blending to create a soft halo */}
            <mesh scale={[1.2, 1.2, 1.2]}>
               <sphereGeometry args={[data.size, 32, 32]} />
               <meshBasicMaterial 
                 color={data.color} 
                 transparent 
                 opacity={0.15} 
                 blending={AdditiveBlending} 
                 side={2} // Render backface to add depth to the transparency
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