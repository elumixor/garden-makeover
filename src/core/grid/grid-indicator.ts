import { BufferGeometry, Group, Mesh, MeshBasicMaterial, Vector2 } from "three";
import { di, EventEmitter, Interactivity } from "utils";
import { createPlusGeometry, createRoundedRectGeometry } from "./geometry";

// Use single cached geometry instances (since size is always the same)
let cachedRoundedRectGeometry: BufferGeometry | null = null;
let cachedPlusGeometry: BufferGeometry | null = null;

function getRoundedRectGeometry(size: number, radius: number) {
  if (!cachedRoundedRectGeometry) {
    cachedRoundedRectGeometry = createRoundedRectGeometry(size, size, radius);
  }
  return cachedRoundedRectGeometry;
}

function getPlusGeometry(size: number, thickness: number) {
  if (!cachedPlusGeometry) {
    cachedPlusGeometry = createPlusGeometry(size, thickness);
  }
  return cachedPlusGeometry;
}

export class GridIndicator extends Group {
  readonly clicked = new EventEmitter();
  private readonly interactivity = di.inject(Interactivity);
  private readonly subscription;

  constructor(
    readonly coords: Vector2,
    cellSize: number,
  ) {
    super();

    // Create rounded rectangle shape for background
    const size = cellSize * 0.9;
    const radius = size * 0.18;
    const bgGeometry = getRoundedRectGeometry(size, radius);
    const bgMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      depthTest: false,
      depthWrite: false,
    });
    const bgMesh = new Mesh(bgGeometry, bgMaterial);

    // Create plus mesh
    const plusGeometry = getPlusGeometry(cellSize * 0.3, cellSize * 0.05);
    const plusMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
      depthWrite: false,
    });
    const plusMesh = new Mesh(plusGeometry, plusMaterial);
    bgMesh.rotation.x = Math.PI;

    // Group them
    this.add(bgMesh);
    this.add(plusMesh);

    this.position.set(coords.x * cellSize + cellSize / 2, 0, coords.y * cellSize + cellSize / 2);
    this.rotation.x = Math.PI / 2;

    // Add tutorial userData for tutorial manager lookup
    this.userData.tutorial = "grid-indicator";

    // Register click handler for this mesh group using scene's interactivity system
    this.subscription = this.interactivity.on(bgMesh, () => this.clicked.emit());
  }

  dispose() {
    this.removeFromParent();
    this.subscription.unsubscribe();

    for (const child of this.children)
      if (child instanceof Mesh && child.material instanceof MeshBasicMaterial) child.material.dispose();
  }
}
