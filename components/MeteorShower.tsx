import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3, MathUtils, Color } from 'three';

export const MeteorShower: React.FC = () => {
  // Reduzido ainda mais para ser apenas um detalhe de fundo
  const count = 12; 
  const meshRef = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);

  // Inicializa o estado de cada meteoro
  const meteors = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const position = new Vector3();
      const velocity = new Vector3();
      // Muito mais finos (0.1 a 0.3)
      const size = MathUtils.randFloat(0.1, 0.3); 
      // Variação de brilho
      const brightness = MathUtils.randFloat(0.4, 1.0);
      
      const reset = () => {
        // Distância segura
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = MathUtils.randFloat(350, 500);
        
        position.setFromSphericalCoords(radius, phi, theta);
        
        // Direção
        const target = new Vector3(
          MathUtils.randFloatSpread(100),
          MathUtils.randFloatSpread(100),
          MathUtils.randFloatSpread(100)
        );
        
        // Alta velocidade para parecer um risco rápido
        velocity.copy(target).sub(position).normalize().multiplyScalar(MathUtils.randFloat(6, 12));
      };

      reset();

      return {
        position,
        velocity,
        size,
        brightness,
        reset
      };
    });
  }, []);

  useEffect(() => {
    if (meshRef.current) {
        // Cor mais azulada e fria para misturar com o fundo
        const baseColor = new Color("#88ccff");
        meteors.forEach((data, i) => {
            const instanceColor = baseColor.clone().multiplyScalar(data.brightness);
            meshRef.current?.setColorAt(i, instanceColor);
        });
        meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [meteors]);

  useFrame(() => {
    if (!meshRef.current) return;

    meteors.forEach((data, i) => {
      data.position.add(data.velocity);

      if (data.position.length() > 600) {
        data.reset();
      }

      dummy.position.copy(data.position);
      dummy.lookAt(data.position.clone().add(data.velocity));
      
      const speed = data.velocity.length();
      // Aumenta o comprimento (Z) e reduz espessura (X, Y)
      dummy.scale.set(data.size, data.size, speed * 20); 

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.15} // Opacidade bem baixa para sutileza
        depthWrite={false}
      />
    </instancedMesh>
  );
};