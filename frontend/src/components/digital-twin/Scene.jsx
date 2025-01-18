// src/components/digital-twin/Scene.jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import PumpHousing from './PumpHousing';

const Scene = ({ parameters, processData }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
        />
        <Suspense fallback={null}>
          <PumpHousing 
            parameters={parameters}
            processData={processData}
          />
          <Environment preset="warehouse" />
        </Suspense>
        <gridHelper args={[20, 20]} />
      </Canvas>
    </div>
  );
};

export default Scene;