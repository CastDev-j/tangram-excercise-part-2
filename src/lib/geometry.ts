import * as THREE from "three";
import fragmentShader from "../shaders/fragment.glsl";
import vertexShader from "../shaders/vertex.glsl";

interface GeometryProps {
  position?: THREE.Vector3;
  size?: number;
  height?: number;
  edgeCount?: number;
  color?: THREE.Color;
  wireframe?: boolean;
}

export class Geometry {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  size: number;
  height: number;
  edgeCount: number;
  color: THREE.Color;
  wireframe: boolean;

  constructor({
    color,
    edgeCount,
    position,
    height,
    size,
    wireframe,
  }: GeometryProps = {}) {
    this.color = color || new THREE.Color(0xffffff);
    this.edgeCount = edgeCount || 3;
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.size = size || 1;
    this.height = height || 1;
    this.wireframe = wireframe || false;

    const vertices = this.getVertices();
    const indices = this.getIndices();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", vertices);
    geometry.setIndex(indices);

    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      wireframe: this.wireframe,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.color },
      },
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }

  updateWireframe(wireframe: boolean) {
    this.wireframe = wireframe;
    (this.mesh.material as THREE.ShaderMaterial).wireframe = wireframe;
  }

  updateColor(color: THREE.Color) {
    this.color = color;
    (this.mesh.material as THREE.ShaderMaterial).uniforms.uColor.value = color;
  }

  updateTime(time: number) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
  }

  updateEdgeCount(edgeCount: number) {
    this.edgeCount = edgeCount;
    const vertices = this.getVertices();
    const indices = this.getIndices();

    this.mesh.geometry.dispose();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", vertices);
    geometry.setIndex(indices);

    this.mesh.geometry = geometry;

    this.mesh.geometry.computeVertexNormals();
  }

  updateSize(size: number) {
    this.size = size;
    const vertices = this.getVertices();
    this.mesh.geometry.setAttribute("position", vertices);
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }

  updateHeight(height: number) {
    this.height = height;
    const vertices = this.getVertices();
    this.mesh.geometry.setAttribute("position", vertices);
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }

  private getVertices(): THREE.BufferAttribute {
    const halfHeight = this.height / 2;

    const vertices = [0, halfHeight, 0];

    for (let i = 0; i < this.edgeCount; i++) {
      const angle = (i / this.edgeCount) * Math.PI * 2;
      const x = Math.cos(angle) * this.size;
      const z = Math.sin(angle) * this.size;
      const topFaceY = halfHeight;
      vertices.push(x, topFaceY, z);
    }

    vertices.push(0, -halfHeight, 0);

    for (let i = 0; i < this.edgeCount; i++) {
      const angle = (i / this.edgeCount) * Math.PI * 2;
      const x = Math.cos(angle) * this.size;
      const z = Math.sin(angle) * this.size;
      const bottomFaceY = -halfHeight;

      vertices.push(x, bottomFaceY, z);
    }

    return new THREE.BufferAttribute(Float32Array.from(vertices), 3);
  }

  private getIndices(): THREE.BufferAttribute {
    const indices: number[] = [];

    const topCenter = 0;
    for (let i = 1; i <= this.edgeCount; i++) {
      const next = (i % this.edgeCount) + 1;
      indices.push(topCenter, next, i);
    }

    const bottomCenter = this.edgeCount + 1;
    const bottomStart = bottomCenter + 1;

    for (let i = 0; i < this.edgeCount; i++) {
      const current = bottomStart + i;
      const next = bottomStart + ((i + 1) % this.edgeCount);
      indices.push(bottomCenter, current, next);
    }

    for (let i = 0; i < this.edgeCount; i++) {
      const next = (i + 1) % this.edgeCount;

      const topCurrent = i + 1;
      const topNext = next + 1;

      const bottomCurrent = bottomStart + i;
      const bottomNext = bottomStart + next;

      indices.push(topCurrent, topNext, bottomCurrent);
      indices.push(topNext, bottomNext, bottomCurrent);
    }

    return new THREE.BufferAttribute(Uint16Array.from(indices), 1);
  }
}
