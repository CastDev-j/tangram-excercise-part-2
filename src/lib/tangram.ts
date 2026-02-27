import * as THREE from "three";
import { Rhomboid } from "./rhomboid";
import { Square } from "./square";
import { Triangle } from "./triangle";

interface TangramProps {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  size?: number;
  wireframe?: boolean;
}

type TangramPiece = Triangle | Square | Rhomboid;
export type TangramPieceName =
  | "largeTriangleA"
  | "largeTriangleB"
  | "mediumTriangle"
  | "smallTriangleA"
  | "smallTriangleB"
  | "square"
  | "rhomboid";

export const TANGRAM_PIECE_ORDER: TangramPieceName[] = [
  "largeTriangleA",
  "largeTriangleB",
  "mediumTriangle",
  "smallTriangleA",
  "smallTriangleB",
  "square",
  "rhomboid",
];

type TangramPieceMap = Record<TangramPieceName, TangramPiece>;
type RelativeOffset = { x: number; z: number };

export class Tangram {
  group: THREE.Group;
  position: THREE.Vector3;
  size: number;
  wireframe: boolean;
  rotation: THREE.Euler;
  pieces: TangramPieceMap;
  activePiece: TangramPiece | null = null;
  activePieceName: TangramPieceName | null = null;

  private readonly colors: Record<TangramPieceName, THREE.Color> = {
    largeTriangleA: new THREE.Color("#ef4444"),
    largeTriangleB: new THREE.Color("#f97316"),
    mediumTriangle: new THREE.Color("#eab308"),
    smallTriangleA: new THREE.Color("#22c55e"),
    smallTriangleB: new THREE.Color("#36ffff"),
    square: new THREE.Color("#8b5cf6"),
    rhomboid: new THREE.Color("#ec4899"),
  };

  private readonly offsets: Record<TangramPieceName, RelativeOffset> = {
    largeTriangleA: { x: -1.985, z: -0.14 },
    largeTriangleB: { x: -0.535, z: -1.585 },
    mediumTriangle: { x: 0.197, z: 0.6 },
    smallTriangleA: { x: -0.53, z: 0.575 },
    smallTriangleB: { x: 0.91, z: -0.86 },
    square: { x: 0.19, z: -0.14 },
    rhomboid: { x: -0.9, z: 0.95 },
  };

  constructor({ position, size, wireframe, rotation }: TangramProps = {}) {
    this.position = position || new THREE.Vector3(0, 0, 0);
    this.size = size || 1;
    this.wireframe = wireframe || false;
    this.rotation = rotation || new THREE.Euler(0, 0, 0);

    this.pieces = {} as TangramPieceMap;

    this.group = new THREE.Group();
    this.rebuildPieces();
  }

  updateActivePiece(pieceName: TangramPieceName | null) {
    this.activePieceName = pieceName;
    this.activePiece = pieceName ? this.pieces[pieceName] : null;
    this.applyActiveStateToPieces();
  }

  moveActivePiece(delta: THREE.Vector3) {
    if (!this.activePiece) return;
    const xzDelta = new THREE.Vector3(delta.x, 0, delta.z);
    const newPosition = this.activePiece.mesh.position.clone().add(xzDelta);
    this.activePiece.updatePosition(newPosition);
  }

  rotateActivePiece(delta: THREE.Euler) {
    if (!this.activePiece) return;

    const current = this.activePiece.mesh.rotation;
    const newRotation = new THREE.Euler(
      current.x + delta.x,
      current.y + delta.y,
      current.z + delta.z,
    );

    this.activePiece.updateRotation(newRotation);
  }

  updateActivePieceByIndex(index: number) {
    const pieceName = TANGRAM_PIECE_ORDER[index - 1] ?? null;
    this.updateActivePiece(pieceName);
  }

  getPieceNameFromMesh(mesh: THREE.Object3D): TangramPieceName | null {
    for (const [pieceName, piece] of Object.entries(this.pieces) as [
      TangramPieceName,
      TangramPiece,
    ][]) {
      if (piece.mesh === mesh) {
        return pieceName;
      }
    }
    return null;
  }

  updateRotation(rotation: THREE.Euler) {
    this.rotation = rotation;
    this.group.rotation.copy(rotation);
  }

  updateSize(size: number) {
    this.size = size;
    this.rebuildPieces();
  }

  private buildPieces(): TangramPieceMap {
    const base = this.size;
    const largeTriangleSize = base * 2.03;
    const mediumTriangleSize = base * Math.sqrt(2);
    const smallTriangleSize = base;
    const rel = (offset: RelativeOffset) =>
      new THREE.Vector3(offset.x * base, 0, offset.z * base);

    const triangleAt = (
      size: number,
      color: THREE.Color,
      offset: RelativeOffset,
      rotation: THREE.Euler,
    ) =>
      new Triangle({
        size,
        color,
        wireframe: this.wireframe,
        position: rel(offset),
        rotation,
      });

    return {
      largeTriangleA: triangleAt(
        largeTriangleSize,
        this.colors.largeTriangleA,
        this.offsets.largeTriangleA,
        new THREE.Euler(0, -Math.PI * 2.75, 0),
      ),
      largeTriangleB: triangleAt(
        largeTriangleSize,
        this.colors.largeTriangleB,
        this.offsets.largeTriangleB,
        new THREE.Euler(0, (-Math.PI * 2.5) / 2, 0),
      ),
      mediumTriangle: triangleAt(
        mediumTriangleSize,
        this.colors.mediumTriangle,
        this.offsets.mediumTriangle,
        new THREE.Euler(0, Math.PI, 0),
      ),
      smallTriangleA: triangleAt(
        smallTriangleSize,
        this.colors.smallTriangleA,
        this.offsets.smallTriangleA,
        new THREE.Euler(0, -Math.PI * 2.25, 0),
      ),
      smallTriangleB: triangleAt(
        smallTriangleSize,
        this.colors.smallTriangleB,
        this.offsets.smallTriangleB,
        new THREE.Euler(0, -Math.PI * 1.75, 0),
      ),
      square: new Square({
        size: base,
        color: this.colors.square,
        wireframe: this.wireframe,
        position: rel(this.offsets.square),
        rotation: new THREE.Euler(0, Math.PI / 4, 0),
      }),
      rhomboid: new Rhomboid({
        size: base,
        color: this.colors.rhomboid,
        wireframe: this.wireframe,
        mirrored: true,
        position: rel(this.offsets.rhomboid),
        rotation: new THREE.Euler(0, 0, 0),
      }),
    };
  }

  private rebuildPieces() {
    this.pieces = this.buildPieces();
    this.group.clear();

    for (const piece of Object.values(this.pieces)) {
      this.group.add(piece.mesh);
    }

    this.centerPiecesAroundOrigin();
    this.group.position.copy(this.position);
    this.group.rotation.copy(this.rotation);

    this.updateActivePiece(this.activePieceName);
  }

  private centerPiecesAroundOrigin() {
    const min = new THREE.Vector3(Infinity, 0, Infinity);
    const max = new THREE.Vector3(-Infinity, 0, -Infinity);
    const vertex = new THREE.Vector3();

    for (const piece of Object.values(this.pieces)) {
      const mesh = piece.mesh;
      mesh.updateMatrix();

      const geometry = mesh.geometry as THREE.BufferGeometry;
      const positionAttribute = geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;

      for (let index = 0; index < positionAttribute.count; index++) {
        vertex.fromBufferAttribute(positionAttribute, index);
        vertex.applyMatrix4(mesh.matrix);

        if (vertex.x < min.x) min.x = vertex.x;
        if (vertex.x > max.x) max.x = vertex.x;
        if (vertex.z < min.z) min.z = vertex.z;
        if (vertex.z > max.z) max.z = vertex.z;
      }
    }

    const centerXZ = new THREE.Vector3(
      (min.x + max.x) / 2,
      0,
      (min.z + max.z) / 2,
    );

    for (const piece of Object.values(this.pieces)) {
      piece.updatePosition(piece.mesh.position.clone().sub(centerXZ));
    }
  }

  getPiece(name: TangramPieceName) {
    return this.pieces[name];
  }

  updateWireframe(wireframe: boolean) {
    this.wireframe = wireframe;
    for (const piece of Object.values(this.pieces)) {
      piece.updateWireframe(wireframe);
    }
  }

  updateColor(color: THREE.Color) {
    for (const piece of Object.values(this.pieces)) {
      piece.updateColor(color);
    }
  }

  updateTime(time: number) {
    for (const piece of Object.values(this.pieces)) {
      piece.updateTime(time);
    }
  }

  updatePosition(position: THREE.Vector3) {
    this.position = position;
    this.group.position.copy(position);
  }

  private applyActiveStateToPieces() {
    for (const [pieceName, piece] of Object.entries(this.pieces) as [
      TangramPieceName,
      TangramPiece,
    ][]) {
      piece.updateActive(pieceName === this.activePieceName);
    }
  }
}
