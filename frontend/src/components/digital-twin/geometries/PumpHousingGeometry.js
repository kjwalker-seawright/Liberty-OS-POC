// src/components/digital-twin/geometries/PumpHousingGeometry.js
import {
    BufferGeometry,
    CylinderGeometry,
    TorusGeometry,
    Mesh,
    MeshStandardMaterial,
    Matrix4 // <-- Important import for the matrix
  } from 'three';
  import { CSG } from 'three-csg-ts';
  
  export const createPumpHousingGeometry = () => {
    // Temporary material for CSG operations
    const material = new MeshStandardMaterial();
  
    // Main body geometry
    const mainBodyGeom = new CylinderGeometry(
      3, // top radius
      3, // bottom radius
      6, // height
      32, // radial segments
      1,  // height segments
      false // open ended
    );
    const mainBody = new Mesh(mainBodyGeom, material);
  
    // Inlet port
    const inletPortGeom = new CylinderGeometry(
      1.2, // top radius
      1.2, // bottom radius
      3,   // height
      32   // radial segments
    );
    const inletPort = new Mesh(inletPortGeom, material);
    inletPort.rotation.z = Math.PI / 2;
    inletPort.position.x = 4;
  
    // Outlet port
    const outletPortGeom = new CylinderGeometry(
      1,  // top radius
      1,  // bottom radius
      3,  // height
      32  // radial segments
    );
    const outletPort = new Mesh(outletPortGeom, material);
    outletPort.rotation.z = Math.PI / 2;
    outletPort.position.x = -4;
  
    // Flange rings
    const createFlange = (radius) => {
      const flangeGeom = new TorusGeometry(
        radius,  // radius
        0.3,     // tube radius
        16,      // radial segments
        32       // tubular segments
      );
      return new Mesh(flangeGeom, material);
    };
  
    const inletFlange = createFlange(1.5);
    inletFlange.rotation.y = Math.PI / 2;
    inletFlange.position.x = 5.5;
  
    const outletFlange = createFlange(1.3);
    outletFlange.rotation.y = Math.PI / 2;
    outletFlange.position.x = -5.5;
  
    // Perform CSG operations
    let result = CSG.fromMesh(mainBody);
  
    // Add inlet port and flange
    let inletCSG = CSG.fromMesh(inletPort);
    result = result.union(inletCSG);
  
    let inletFlangeCSG = CSG.fromMesh(inletFlange);
    result = result.union(inletFlangeCSG);
  
    // Add outlet port and flange
    let outletCSG = CSG.fromMesh(outletPort);
    result = result.union(outletCSG);
  
    let outletFlangeCSG = CSG.fromMesh(outletFlange);
    result = result.union(outletFlangeCSG);
  
    // Add mounting holes
    const mountingHoleGeom = new CylinderGeometry(0.2, 0.2, 1, 16);
    const mountingPositions = [
      { x: 0,  y: -3.5, z: -2 },
      { x: 0,  y: -3.5, z:  2 },
      { x: 0,  y:  3.5, z: -2 },
      { x: 0,  y:  3.5, z:  2 },
    ];
  
    mountingPositions.forEach(pos => {
      const holeMesh = new Mesh(mountingHoleGeom, material);
      holeMesh.position.set(pos.x, pos.y, pos.z);
      const holeCSG = CSG.fromMesh(holeMesh);
      result = result.subtract(holeCSG);
  
      // Optional cleanup of holeMesh geometry if not reused
      holeMesh.geometry.dispose();
    });
  
    // Convert the final CSG shape back to a mesh
    // NOTE: CSG.toMesh(csg, matrix, material)
    // Use the mainBody.matrix if you need mainBody transforms.
    // Or just use a new Matrix4() for an identity matrix.
    const finalMesh = CSG.toMesh(result, new Matrix4(), material);
  
    // Extract the geometry
    const finalGeometry = finalMesh.geometry;
  
    // Clean up temporary meshes' geometry
    mainBody.geometry.dispose();
    inletPort.geometry.dispose();
    outletPort.geometry.dispose();
    inletFlange.geometry.dispose();
    outletFlange.geometry.dispose();
  
    return finalGeometry;
  };
  
  // Optionally, export a pre-created geometry instance
  export const pumpHousingGeometry = createPumpHousingGeometry();
  