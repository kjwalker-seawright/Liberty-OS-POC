// src/components/digital-twin/utils/materialRemoval.js
import { Matrix4, Vector3 } from 'three';

export const calculateMaterialRemoval = (parameters, toolPosition, previousPosition) => {
    const {
        cutting_speed,
        feed_rate,
        depth_of_cut,
        tool_diameter
    } = parameters;

    // Calculate volume of material removed
    const calculateRemovedVolume = () => {
        if (!previousPosition) return 0;

        const distance = toolPosition.distanceTo(previousPosition);
        const toolArea = Math.PI * (tool_diameter / 2) ** 2;
        return distance * toolArea;
    };

    // Calculate surface quality based on parameters
    const calculateSurfaceQuality = () => {
        // Surface roughness model based on cutting parameters
        const speedFactor = Math.min(1, cutting_speed / 150);
        const feedFactor = Math.max(0, 1 - feed_rate / 0.5);
        const depthFactor = Math.max(0, 1 - depth_of_cut / 5);

        return (speedFactor * 0.5 + feedFactor * 0.3 + depthFactor * 0.2) * 100;
    };

    return {
        removedVolume: calculateRemovedVolume(),
        surfaceQuality: calculateSurfaceQuality()
    };
};