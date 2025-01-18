// src/services/DigitalTwinService.js
import { create } from 'zustand';

const useDigitalTwinStore = create((set, get) => ({
  // Simulation state
  simulationState: {
    materialRemoved: 0,
    toolPosition: { x: 0, y: 0, z: 0 },
    cutDepth: 0,
    surfaceQuality: 100,
    isSimulating: false,
  },

  // Quality inspection points
  inspectionPoints: [],

  // Current operations
  activeOperation: null,
  operationProgress: 0,

  // Tool path data
  toolPath: [],
  completedPaths: [],

  // Methods
  startSimulation: () => {
    set({ simulationState: { ...get().simulationState, isSimulating: true }});
  },

  updateToolPosition: (position) => {
    set({
      simulationState: {
        ...get().simulationState,
        toolPosition: position
      }
    });
  },

  updateMaterialRemoval: (amount) => {
    set({
      simulationState: {
        ...get().simulationState,
        materialRemoved: get().simulationState.materialRemoved + amount
      }
    });
  },

  addInspectionPoint: (point) => {
    set({
      inspectionPoints: [...get().inspectionPoints, point]
    });
  },

  updateSurfaceQuality: (quality) => {
    set({
      simulationState: {
        ...get().simulationState,
        surfaceQuality: quality
      }
    });
  },

  setOperation: (operation) => {
    set({
      activeOperation: operation,
      operationProgress: 0
    });
  },

  updateProgress: (progress) => {
    set({ operationProgress: progress });
  },

  addToolPath: (path) => {
    set({
      toolPath: [...get().toolPath, path]
    });
  },

  completeCurrentPath: () => {
    const currentPath = get().toolPath[get().toolPath.length - 1];
    set({
      completedPaths: [...get().completedPaths, currentPath],
      toolPath: get().toolPath.slice(0, -1)
    });
  },

  reset: () => {
    set({
      simulationState: {
        materialRemoved: 0,
        toolPosition: { x: 0, y: 0, z: 0 },
        cutDepth: 0,
        surfaceQuality: 100,
        isSimulating: false,
      },
      inspectionPoints: [],
      activeOperation: null,
      operationProgress: 0,
      toolPath: [],
      completedPaths: []
    });
  }
}));

export default useDigitalTwinStore;