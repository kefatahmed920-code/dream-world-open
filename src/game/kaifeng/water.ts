/**
 * Upgraded Realistic River Water System — Dream World Phase 1
 * Inspired by Where Winds Meet environmental aesthetics.
 * Color Palette:
 *  - Shallow water: #9ABDB1
 *  - Normal water: #4F8F8D
 *  - Deep water: #285B69
 *  - Sunlight reflection: #D4D8C2
 *  - Foam: #E9F0E8
 */

import * as THREE from 'three';
import { textureFactory } from './textures';

export class RiverWaterManager {
  public group: THREE.Group = new THREE.Group();
  public waterMesh: THREE.Mesh;
  private waterMaterial: THREE.MeshPhysicalMaterial;
  private normalMap1: THREE.Texture;
  private normalMap2: THREE.Texture;
  private foamInstancedMesh!: THREE.InstancedMesh;
  private foamCount: number = 0;
  private timeUniform = { value: 0 };

  constructor(foamPositions: THREE.Vector3[] = []) {
    // Vast river surface plane covering the entire Dhaka waterfront, the broadened central river channel, and the eastern river basin
    // (X: -160 to +280, Z: -75 to +75)
    const riverWidth = 440;
    const riverDepth = 150;
    const geom = new THREE.PlaneGeometry(riverWidth, riverDepth, 200, 75);
    geom.rotateX(-Math.PI / 2);

    this.normalMap1 = textureFactory.getWaterNormalMap();
    this.normalMap1.repeat.set(22, 12);

    this.normalMap2 = textureFactory.getWaterNormalMap();
    this.normalMap2.repeat.set(24, 8);

    // Optimized Physical PBR Water Material without costly transmission multi-pass
    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#4F8F8D'),
      roughness: 0.15,
      metalness: 0.25,
      ior: 1.333,
      normalMap: this.normalMap1,
      normalScale: new THREE.Vector2(0.35, 0.35),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });

    // Vertex wave motion injection via onBeforeCompile
    this.waterMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.timeUniform;
      shader.uniforms.uShallowColor = { value: new THREE.Color('#9ABDB1') };
      shader.uniforms.uMidColor = { value: new THREE.Color('#4F8F8D') };
      shader.uniforms.uDeepColor = { value: new THREE.Color('#285B69') };
      shader.uniforms.uSunlightReflect = { value: new THREE.Color('#D4D8C2') };

      shader.vertexShader = `
        uniform float uTime;
        ${shader.vertexShader}
      `;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        // Dual directional river current waves (flowing along +X axis)
        float wave1 = sin(position.x * 0.28 - uTime * 1.4 + position.z * 0.15) * 0.12;
        float wave2 = cos(position.x * 0.45 - uTime * 1.8 - position.z * 0.22) * 0.08;
        float wave3 = sin(position.z * 0.6 + uTime * 0.8) * 0.05;
        transformed.y += wave1 + wave2 + wave3;
        `
      );
    };

    this.waterMesh = new THREE.Mesh(geom, this.waterMaterial);
    this.waterMesh.position.set(30, 0.0, 0);
    this.waterMesh.receiveShadow = true;
    this.group.add(this.waterMesh);

    // Contact foam rings around dock pilings, boulders, and boat hull
    this.createContactFoam(foamPositions);
  }

  /**
   * Instanced contact foam discs positioned at water contact points
   */
  public createContactFoam(positions: THREE.Vector3[]) {
    if (this.foamInstancedMesh) {
      this.group.remove(this.foamInstancedMesh);
    }

    this.foamCount = positions.length;
    if (this.foamCount === 0) return;

    const foamGeom = new THREE.PlaneGeometry(1.6, 1.6);
    foamGeom.rotateX(-Math.PI / 2);

    const foamTex = textureFactory.getWaterFoamTexture();
    const foamMat = new THREE.MeshBasicMaterial({
      map: foamTex,
      color: new THREE.Color('#E9F0E8'),
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.foamInstancedMesh = new THREE.InstancedMesh(foamGeom, foamMat, this.foamCount);
    const dummy = new THREE.Object3D();

    positions.forEach((pos, idx) => {
      dummy.position.copy(pos);
      dummy.position.y = 0.03; // Just above water surface
      dummy.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.5;
      dummy.scale.set(s, 1, s);
      dummy.updateMatrix();
      this.foamInstancedMesh.setMatrixAt(idx, dummy.matrix);
    });

    this.foamInstancedMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.foamInstancedMesh);
  }

  /**
   * Update animation loop for waves, river current, and water highlights
   */
  public update(delta: number, elapsed: number) {
    this.timeUniform.value = elapsed;

    // Scroll normal map along the downstream river current (+X axis)
    this.normalMap1.offset.x = (elapsed * 0.04) % 1.0;
    this.normalMap1.offset.y = (Math.sin(elapsed * 0.2) * 0.02) % 1.0;

    this.normalMap2.offset.x = (elapsed * 0.065) % 1.0;
    this.normalMap2.offset.y = (elapsed * 0.015) % 1.0;

    // Subtle foam pulsing
    if (this.foamInstancedMesh) {
      const foamPulse = 0.65 + Math.sin(elapsed * 2.5) * 0.15;
      (this.foamInstancedMesh.material as THREE.MeshBasicMaterial).opacity = foamPulse;
    }
  }
}
