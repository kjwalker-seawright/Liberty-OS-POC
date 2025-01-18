// src/components/digital-twin/InspectionPoints.jsx
import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import useDigitalTwinStore from '../../services/DigitalTwinStore';

const InspectionPoint = ({ point, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  return (
    <group>
      <mesh
        position={[point.position.x, point.position.y, point.position.z]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color={point.passed ? '#10B981' : '#EF4444'}
          emissive={point.passed ? '#10B981' : '#EF4444'}
          emissiveIntensity={hovered ? 1 : 0.5}
        />
      </mesh>
      
      {hovered && (
        <Html position={[point.position.x, point.position.y + 0.2, point.position.z]}>
          <div className="px-2 py-1 bg-gray-900/90 rounded-lg text-xs text-white whitespace-nowrap">
            {point.name}: {point.value.toFixed(3)} {point.unit}
          </div>
        </Html>
      )}
    </group>
  );
};

const InspectionPoints = ({ points }) => {
  const { setSelectedPoint } = useDigitalTwinStore();
  
  return (
    <group>
      {points.map((point, index) => (
        <InspectionPoint
          key={index}
          point={point}
          onClick={() => setSelectedPoint(point)}
        />
      ))}
    </group>
  );
};

export default InspectionPoints;