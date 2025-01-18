// src/components/digital-twin/utils/toolPathCalculations.js
import { Vector3 } from 'three';

export const calculateToolPath = (parameters) => {
    const {
        cutting_speed,
        feed_rate,
        depth_of_cut,
        tool_diameter
    } = parameters;

    // Calculate helix points for roughing operation
    const calculateHelixPoints = (radius, height, turns) => {
        const points = [];
        const pointsPerTurn = 32;
        const totalPoints = pointsPerTurn * turns;

        for (let i = 0; i <= totalPoints; i++) {
            const angle = (i / pointsPerTurn) * Math.PI * 2;
            const z = (i / totalPoints) * height;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            points.push(new Vector3(x, y, z));
        }

        return points;
    };

    // Calculate finishing pass points
    const calculateFinishingPoints = (radius, height) => {
        const points = [];
        const layers = Math.ceil(height / feed_rate);
        const pointsPerLayer = 64;

        for (let layer = 0; layer <= layers; layer++) {
            const z = layer * feed_rate;
            for (let i = 0; i <= pointsPerLayer; i++) {
                const angle = (i / pointsPerLayer) * Math.PI * 2;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                points.push(new Vector3(x, y, z));
            }
        }

        return points;
    };

    // Generate tool paths based on operation
    const generateToolPaths = () => {
        const paths = {
            roughing: [],
            finishing: []
        };

        // Roughing paths
        const roughingRadius = 3 - tool_diameter / 2;
        const roughingHeight = 6;
        const roughingTurns = Math.ceil(roughingHeight / feed_rate);
        paths.roughing = calculateHelixPoints(roughingRadius, roughingHeight, roughingTurns);

        // Finishing paths
        const finishingRadius = 3;
        paths.finishing = calculateFinishingPoints(finishingRadius, roughingHeight);

        return paths;
    };

    const calculateToolPosition = (time) => {
        const paths = generateToolPaths();
        const totalTime = (paths.roughing.length + paths.finishing.length) / cutting_speed;
        const progress = (time % totalTime) / totalTime;
        
        let position;
        if (progress < 0.7) { // Roughing phase
            const roughingIndex = Math.floor(progress * paths.roughing.length / 0.7);
            position = paths.roughing[roughingIndex];
        } else { // Finishing phase
            const finishingProgress = (progress - 0.7) / 0.3;
            const finishingIndex = Math.floor(finishingProgress * paths.finishing.length);
            position = paths.finishing[finishingIndex];
        }

        return position;
    };

    return {
        generateToolPaths,
        calculateToolPosition
    };
};