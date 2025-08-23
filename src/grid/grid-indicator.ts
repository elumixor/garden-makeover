import { Group, Mesh, MeshBasicMaterial, Vector2 } from "three";
import { di, EventEmitter, Interactivity } from "utils";
import { getPlusGeometry, getRoundedRectGeometry } from "./geometry";

export class GridIndicator extends Group {
  private static cachedBgMesh: Mesh | null = null;
  private static cachedPlusMesh: Mesh | null = null;

  readonly clicked = new EventEmitter();
  private readonly interactivity = di.inject(Interactivity);
  private readonly subscription;

  constructor(
    readonly coords: Vector2,
    cellSize: number,
  ) {
    super();

    // Create mesh instances reusing shared geometry & materials.
    const bgMesh = GridIndicator.getBgMesh(cellSize).clone();
    const plusMesh = GridIndicator.getPlusMesh(cellSize).clone();

    bgMesh.rotation.x = Math.PI; // Keep facing camera / consistent orientation

    this.add(bgMesh, plusMesh);

    this.position.set(coords.x * cellSize + cellSize / 2, 0, coords.y * cellSize + cellSize / 2);
    this.rotation.x = Math.PI / 2;

    this.userData.tutorial = "grid-indicator";

    this.subscription = this.interactivity.on(bgMesh, () => this.clicked.emit());
  }

  dispose() {
    this.removeFromParent();
    this.subscription.unsubscribe();
  }

  private static getBgMesh(cellSize: number) {
    if (this.cachedBgMesh) return this.cachedBgMesh;

    const geometry = getRoundedRectGeometry(cellSize * 0.9, cellSize * 0.18);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      depthTest: false,
      depthWrite: false,
    });
    return (this.cachedBgMesh = new Mesh(geometry, material));
  }

  private static getPlusMesh(cellSize: number) {
    if (this.cachedPlusMesh) return this.cachedPlusMesh;

    const geometry = getPlusGeometry(cellSize * 0.3, cellSize * 0.05);
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
      depthWrite: false,
    });

    return (this.cachedPlusMesh = new Mesh(geometry, material));
  }
}
