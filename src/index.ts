import GUI from "lil-gui";
import * as THREE from "three";
import { Renderer } from "./lib/renderer";
import { Tangram } from "./lib/tangram";

const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
if (!canvas) {
  throw new Error("Canvas element not found");
}

const gui = new GUI();
const renderer = new Renderer(canvas);

const config = {
  wireframe: false,
  rotationSpeed: 0.5,
  size: 1,
};

const ROTATION_UNIT = Math.PI / 4;

const tangram = new Tangram({
  wireframe: config.wireframe,
  position: new THREE.Vector3(0, 0, 0),
  rotation: new THREE.Euler(0, 0, 0),
  size: config.size,
});

renderer.scene.add(tangram.group);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const moveStep = 0.1;

gui.add(config, "wireframe").onChange((value: boolean) => {
  tangram.updateWireframe(value);
});

gui.add(config, "size", 1, 10, 0.1).onChange((value: number) => {
  tangram.updateSize(value);
});

gui.add(config, "rotationSpeed", 0, 2).onChange((value: number) => {
  config.rotationSpeed = value;
});

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (/^[1-7]$/.test(event.key)) {
    tangram.updateActivePieceByIndex(Number(event.key));
    return;
  }

  if (event.key.toLowerCase() === "q") {
    event.preventDefault();
    tangram.rotateActivePiece(new THREE.Euler(0, -ROTATION_UNIT, 0));
    return;
  }

  if (event.key.toLowerCase() === "e") {
    event.preventDefault();
    tangram.rotateActivePiece(new THREE.Euler(0, ROTATION_UNIT, 0));
    return;
  }

  let delta: THREE.Vector3 | null = null;

  switch (event.key.toLowerCase()) {
    case "arrowleft":
    case "a":
      delta = new THREE.Vector3(-moveStep, 0, 0);
      break;
    case "arrowright":
    case "d":
      delta = new THREE.Vector3(moveStep, 0, 0);
      break;
    case "arrowup":
    case "w":
      delta = new THREE.Vector3(0, 0, -moveStep);
      break;
    case "arrowdown":
    case "s":
      delta = new THREE.Vector3(0, 0, moveStep);
      break;
    default:
      return;
  }

  event.preventDefault();
  tangram.moveActivePiece(delta);
});

renderer.getDomElement().addEventListener("click", (event: MouseEvent) => {
  const rect = renderer.getDomElement().getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, renderer.getCamera());

  const intersections = raycaster.intersectObjects(
    tangram.group.children,
    true,
  );
  if (intersections.length === 0) return;

  let selectedObject: THREE.Object3D | null = intersections[0].object;
  while (
    selectedObject &&
    selectedObject.parent &&
    selectedObject.parent !== tangram.group
  ) {
    selectedObject = selectedObject.parent;
  }

  if (!selectedObject) return;

  const pieceName = tangram.getPieceNameFromMesh(selectedObject);
  if (pieceName) {
    tangram.updateActivePiece(pieceName);
  }
});

let startTime = Date.now() * 0.001;

renderer.animate(() => {
  const base = Date.now() * 0.001;
  const elapsedTime = base - startTime;

  tangram.updateTime(elapsedTime);
});
