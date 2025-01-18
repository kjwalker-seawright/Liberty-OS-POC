// src/components/digital-twin/QualityVisualization.jsx
import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Color, ShaderMaterial, Vector3 } from 'three';
import useDigitalTwinStore from '../../services/DigitalTwinStore';

const fragmentShader = `
  uniform vec3 color;
  uniform float quality;
  uniform float glowIntensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    float fresnel = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0);
    vec3 glow = color * glowIntensity * fresnel;
    vec3 finalColor = mix(color, glow, quality);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const QualityVisualization = ({ quality }) => {
  const materialRef = useRef();
  const { scene } = useThree();

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.quality.value = quality / 100;
      materialRef.current.uniforms.glowIntensity.value = quality > 85 ? 0.5 : 0;
    }
  }, [quality]);

  return (
    <shaderMaterial
      ref={materialRef}
      fragmentShader={fragmentShader}
      vertexShader={vertexShader}
      uniforms={{
        color: { value: new Color('#22C5F4') },
        quality: { value: quality / 100 },
        glowIntensity: { value: 0 }
      }}
    />
  );
};

export default QualityVisualization;