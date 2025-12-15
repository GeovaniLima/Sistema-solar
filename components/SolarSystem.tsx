import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { MeteorShower } from './MeteorShower';
import { PLANETS } from '../constants';
import * as THREE from 'three';
// Need access to OrbitControls types if strictly typed, but casting works for this scope.
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface SolarSystemProps {
  timeScale: number;
  selectedPlanetId: string | null;
  onSelectPlanet: (id: string | null) => void;
  paused: boolean;
}

// Component to handle star field rotation
const StarField = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      // Rotate the star field slowly to create a sense of movement through space
      ref.current.rotation.y -= delta * 0.02;
      ref.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <group ref={ref}>
       <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
};

// Helper to smoothly move camera
const CameraController: React.FC<{ selectedId: string | null }> = ({ selectedId }) => {
  const { camera, controls, scene } = useThree();
  const vec = new THREE.Vector3();
  const targetPos = new THREE.Vector3();

  useFrame((state, delta) => {
    const controlsRef = controls as unknown as OrbitControlsImpl;
    if (!controlsRef) return;

    // Smooth factor (lower is slower/smoother)
    const damp = 4 * delta;

    if (selectedId) {
        // Find the actual 3D object of the planet in the scene
        const planetObject = scene.getObjectByName(selectedId);
        
        if (planetObject) {
            // Get current planet position
            planetObject.getWorldPosition(targetPos);

            // 1. Move the OrbitControls target to look at the planet
            controlsRef.target.lerp(targetPos, damp);

            // 2. Move the Camera closer to the planet
            // We calculate a position relative to the planet based on planet size
            // This maintains the user's rotation angle but enforces distance
            const planetData = PLANETS.find(p => p.id === selectedId);
            const size = planetData ? planetData.size : 1;
            
            // "Ideal" distance is related to planet size (e.g., 5x radius + slight buffer)
            const idealDist = size * 5 + 8;

            // Calculate direction from planet to camera (user's viewing angle)
            const direction = camera.position.clone().sub(targetPos).normalize();
            
            // Calculate where the camera should be
            const desiredCamPos = targetPos.clone().add(direction.multiplyScalar(idealDist));

            // Lerp camera position
            camera.position.lerp(desiredCamPos, damp);
        }
    } else {
        // OVERVIEW MODE
        // 1. Reset target to Sun (0,0,0)
        controlsRef.target.lerp(new THREE.Vector3(0, 0, 0), damp);

        // 2. Reset Camera Position to bird's eye view
        camera.position.lerp(new THREE.Vector3(0, 60, 120), damp);
    }

    // Important: Update controls after manual changes to target/position
    controlsRef.update();
  });

  return null;
}

export const SolarSystem: React.FC<SolarSystemProps> = ({ timeScale, selectedPlanetId, onSelectPlanet, paused }) => {
  
  return (
    <Canvas className="bg-black" shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, 60, 120]} fov={45} />
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        maxDistance={300} 
        minDistance={5}
        enableDamping={true}
        dampingFactor={0.05}
      />
      
      {/* Animated Star Field */}
      <StarField />

      {/* Background Meteor Shower */}
      <MeteorShower />
      
      {/* Lighting - Reduced ambient light for high contrast/drama */}
      <ambientLight intensity={0.02} />
      
      {/* The Sun contains the main PointLight */}
      <Sun />

      {/* Planets */}
      {PLANETS.map((planet) => (
        <Planet 
          key={planet.id} 
          data={planet} 
          timeScale={timeScale}
          isSelected={selectedPlanetId === planet.id}
          onSelect={onSelectPlanet}
          paused={paused}
        />
      ))}
      
      {/* Click background to deselect */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -1, 0]} 
        visible={false}
        onClick={(e) => {
            // Only deselect if clicking strictly on the background plane
            onSelectPlanet(null);
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial />
      </mesh>
      
      <CameraController selectedId={selectedPlanetId} />
    </Canvas>
  );
};