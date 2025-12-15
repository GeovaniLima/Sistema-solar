import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, MathUtils } from 'three';

export const MeteorShower: React.FC = () => {
  const count = 60; // Número de meteoros ativos simultaneamente
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  // Inicializa o estado de cada meteoro (posição, velocidade, tempo de vida)
  const meteors = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const position = new Vector3();
      const velocity = new Vector3();
      
      const reset = () => {
        // Nasce em uma posição aleatória distante (esfera entre 250 e 400 unidades)
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = MathUtils.randFloat(250, 400);
        
        position.setFromSphericalCoords(radius, phi, theta);
        
        // Define uma direção aleatória "cortando" o espaço
        const target = new Vector3(
          MathUtils.randFloatSpread(200),
          MathUtils.randFloatSpread(200),
          MathUtils.randFloatSpread(200)
        );
        
        // Velocidade baseada na direção, normalizada e multiplicada por um fator de velocidade
        velocity.copy(target).sub(position).normalize().multiplyScalar(MathUtils.randFloat(1.5, 4));
      };

      reset(); // Configuração inicial

      return {
        position,
        velocity,
        reset
      };
    });
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;

    meteors.forEach((data, i) => {
      // Atualiza posição
      data.position.add(data.velocity);

      // Se foi muito longe (saiu da esfera visível), reseta
      if (data.position.length() > 450) {
        data.reset();
      }

      // Atualiza a matriz da instância
      dummy.position.copy(data.position);
      
      // Orienta o meteoro na direção do movimento (lookAt)
      // O meteoro "olha" para onde está indo
      dummy.lookAt(data.position.clone().add(data.velocity));
      
      // Estica o meteoro baseado na sua velocidade para criar o efeito de "traço"
      // X e Y são finos, Z é o comprimento (alinhado com a direção do movimento)
      const speed = data.velocity.length();
      dummy.scale.set(1, 1, speed * 8); 

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Geometria base: um traço fino */}
      <boxGeometry args={[0.4, 0.4, 1]} />
      <meshBasicMaterial 
        color="#aaddff" 
        transparent 
        opacity={0.3} 
        depthWrite={false} // Não bloqueia outros objetos transparentes
      />
    </instancedMesh>
  );
};