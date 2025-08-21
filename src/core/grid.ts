import { ItemManager, type ItemName } from "items";
import { Mesh, MeshBasicMaterial, PlaneGeometry, Scene, Vector2, Vector3 } from "three";
import { di } from "utils";

export class Grid {
  private readonly itemManager = di.inject(ItemManager);
  private readonly cellSize = 5;
  private readonly occupied = new Set<string>();
  private readonly highlightPlane;

  constructor(scene: Scene) {
    const geometry = new PlaneGeometry(this.cellSize, this.cellSize);
    const material = new MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthTest: false,
      depthWrite: false,
    });

    this.highlightPlane = new Mesh(geometry, material);
    this.highlightPlane.rotation.x = -Math.PI / 2;
    this.highlightPlane.visible = false;
    scene.add(this.highlightPlane);
  }

  set highlight(gridCoords: Vector2 | undefined) {
    if (!gridCoords) {
      this.highlightPlane.visible = false;
      return;
    }
    const { x, z } = this.toWorld(gridCoords);
    this.highlightPlane.position.set(x, 0, z);
    this.highlightPlane.visible = true;
  }

  isCellFree(gridCoords: Vector2) {
    return !this.occupied.has(`${gridCoords.x},${gridCoords.y}`);
  }

  addItem(itemName: ItemName, gridCoords: Vector2) {
    if (!this.isCellFree(gridCoords)) return;

    const item = this.itemManager.instantiate(itemName);
    if (!item) return;

    const position = this.toWorld(gridCoords);
    item.place(position);

    const coords = `${gridCoords.x},${gridCoords.y}`;
    this.occupied.add(coords);

    item.removed.subscribe(() => this.occupied.delete(coords));

    return item;
  }

  toGrid(worldPos: Vector3) {
    const { x, z } = worldPos.clone().divideScalar(this.cellSize).floor();
    return new Vector2(x, z);
  }

  toWorld(gridCoords: Vector2) {
    const { x, y } = gridCoords
      .clone()
      .multiplyScalar(this.cellSize)
      .addScalar(this.cellSize / 2);

    return new Vector3(x, 0, y);
  }
}
