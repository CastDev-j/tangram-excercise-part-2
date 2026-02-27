import * as THREE from "three";
import fragmentShader from "../shaders/fragment.glsl";
import vertexShader from "../shaders/vertex.glsl";

interface SquareProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  size?: number;
  color?: THREE.Color;
  wireframe?: boolean;
}

export class Square {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  size: number;
  color: THREE.Color;
  wireframe: boolean;
  rotation: THREE.Euler;

  constructor({
    color,
    position,
    size,
    wireframe,
    rotation,
  }: SquareProps = {}) {
    this.color = color || new THREE.Color(0xffffff);
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.size = size || 1;
    this.wireframe = wireframe || false;
    this.rotation = rotation || new THREE.Euler(0, 0, 0);

    const vertices = this.getVertices();
    const indices = this.getIndices();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", vertices);
    geometry.setIndex(indices);

    geometry.computeVertexNormals();

    const material = new THREE.ShaderMaterial({
      wireframe: this.wireframe,
      side: THREE.DoubleSide,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.color },
        uActive: { value: 0 },
      },
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.rotation.copy(this.rotation);
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

  updateActive(isActive: boolean) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms.uActive.value =
      isActive ? 1 : 0;
  }

  updatePosition(position: THREE.Vector3) {
    this.position = position;
    this.mesh.position.copy(position);
  }

  updateRotation(rotation: THREE.Euler) {
    this.rotation = rotation;
    this.mesh.rotation.copy(rotation);
  }

  updateSize(size: number) {
    this.size = size;
    const vertices = this.getVertices();
    this.mesh.geometry.setAttribute("position", vertices);
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }

  private getVertices(): THREE.BufferAttribute {
    const halfSize = this.size / 2;

    const vertices = [
      -halfSize,
      0,
      -halfSize,
      halfSize,
      0,
      -halfSize,
      halfSize,
      0,
      halfSize,
      -halfSize,
      0,
      halfSize,
    ];

    return new THREE.BufferAttribute(Float32Array.from(vertices), 3);
  }

  private getIndices(): THREE.BufferAttribute {
    const indices: number[] = [0, 1, 2, 0, 2, 3];

    return new THREE.BufferAttribute(Uint16Array.from(indices), 1);
  }
}
