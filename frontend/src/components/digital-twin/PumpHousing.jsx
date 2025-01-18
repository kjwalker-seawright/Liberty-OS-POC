// src/components/digital-twin/PumpHousing.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { calculateToolPath } from './utils/toolPathCalculations';
import { calculateMaterialRemoval } from './utils/materialRemoval';
import QualityVisualization from './QualityVisualization';
import InspectionPoints from './InspectionPoints';
import useDigitalTwinStore from '../../services/DigitalTwinStore';
import { createPumpHousingGeometry } from './geometries/PumpHousingGeometry';

const pumpHousingGeometry = createPumpHousingGeometry();

const PumpHousing = ({ parameters, processData }) => {
  const meshRef = useRef();

  // Pull data and methods from your store
  const {
    toolPath,            // This is the array in your store (singular name)
    simulationState,     // Holds { materialRemoved, toolPosition, ... }
    updateToolPosition,
    updateMaterialRemoval,
  } = useDigitalTwinStore();

  // Alias or default to empty array if toolPath is undefined
  const toolPaths = toolPath || [];

  // Extract the toolPosition from simulationState
  const { toolPosition } = simulationState;

  // Build a local toolPath calculator (if your code requires it)
  const toolPathCalculator = calculateToolPath(parameters);

  // Animate or update each frame
  useFrame((state) => {
    if (meshRef.current && parameters && toolPaths.length > 0) {
      // 1. Calculate a new position based on time and parameters
      const newPosition = toolPathCalculator.calculateToolPosition(
        parameters,
        state.clock.elapsedTime
      );

      // 2. Update the store's tool position
      updateToolPosition(newPosition);

      // 3. Calculate material removal using the last known position in toolPaths
      const lastToolPosition = toolPaths[toolPaths.length - 1];
      const removalData = calculateMaterialRemoval(
        parameters,
        newPosition,
        lastToolPosition
      );
      updateMaterialRemoval(removalData);
    }
  });

  return (
    <group>
      {/* Main pump housing mesh */}
      <mesh ref={meshRef} geometry={pumpHousingGeometry}>
        <QualityVisualization
          quality={processData?.quality_metrics?.overall_quality || 0}
        />
      </mesh>

      {/* Inspection points */}
      <InspectionPoints
        points={processData?.quality_metrics?.inspection_points || []}
      />

      {/* Tool Path Visualization */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="position"
            // Using toolPaths.length (safe, since we defaulted to [])
            count={toolPaths.length}
            array={new Float32Array(
              toolPaths.flatMap((p) => [p.x, p.y, p.z])
            )}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#22C5F4" linewidth={2} />
      </line>

      {/* Active Tool Visualization */}
      {toolPosition && (
        <mesh position={toolPosition}>
          <cylinderGeometry
            args={[
              parameters.tool_diameter / 2,
              parameters.tool_diameter / 2,
              parameters.depth_of_cut
            ]}
          />
          <meshStandardMaterial color="#666666" metalness={0.9} />
        </mesh>
      )}
    </group>
  );
};

export default PumpHousing;

