import { ItemManager } from "items";
import { Group, Vector2, Vector3 } from "three";
import { di } from "utils";
import { playPlaceSound } from "../audio";
import { GridIndicator } from "./grid-indicator";

export class Grid extends Group {
  private readonly itemManager = di.inject(ItemManager);
  private readonly cellSize = 3.1;
  private readonly occupied = new Set<string>();
  private readonly indicators: GridIndicator[] = [];

  constructor() {
    super();

    this.updateIndicators();
  }

  private addItem(gridCoords: Vector2) {
    if (!this.isCellFree(gridCoords)) return;

    const item = this.itemManager.instantiate(this.itemManager.selectedItem);
    if (!item) return;

    item.position.copy(this.toWorld(gridCoords));
    this.add(item);
    playPlaceSound();

    const coords = `${gridCoords.x},${gridCoords.y}`;
    this.occupied.add(coords);

    item.removed.subscribe(() => {
      this.occupied.delete(coords);
      this.updateIndicators();
    });

    this.updateIndicators();

    return item;
  }

  private toWorld(gridCoords: Vector2) {
    const { x, y } = gridCoords
      .clone()
      .multiplyScalar(this.cellSize)
      .addScalar(this.cellSize / 2);

    return new Vector3(x, 0, y);
  }

  private getAvailablePositions() {
    const positions = [];

    for (let x = -5; x <= 4; x++) {
      if (x === -1) continue; // Skip the center column, there is road in the model there
      for (let y = -4; y <= 3; y++) {
        const v = new Vector2(x, y);
        if (this.isCellFree(v)) positions.push(v);
      }
    }

    return positions;
  }

  private isCellFree(gridCoords: Vector2) {
    return !this.occupied.has(`${gridCoords.x},${gridCoords.y}`);
  }

  private updateIndicators() {
    // Remove old indicators
    for (const indicator of this.indicators) indicator.dispose();
    this.indicators.length = 0;

    // Add new indicators
    for (const pos of this.getAvailablePositions()) {
      const indicator = new GridIndicator(pos, this.cellSize);
      this.add(indicator);
      indicator.clicked.subscribe((coords) => this.addItem(coords));
      this.indicators.push(indicator);
    }
  }
}
