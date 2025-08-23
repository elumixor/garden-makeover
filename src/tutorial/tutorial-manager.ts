import { GameScene, Time } from "core";
import type { GridIndicator } from "grid";
import { type YieldIcon } from "grid-items";
import { ItemManager } from "item-manager.ts";
import type { Object3D } from "three";
import { delay, di } from "utils";
import { TutorialOverlay } from "./tutorial-overlay.ts";

// Centralized mapping of tutorial target identifiers
export const TTargets = {
  plants: "plants",
  strawberry: "strawberry",
  skipDay: "skip-day",
  yield: "yield-icon",
  corn: "corn",
  animals: "animals",
  chicken: "chicken",
  grid: "grid-indicator",
} as const;

export class TutorialManager {
  private readonly scene = di.inject(GameScene);
  private readonly time = di.inject(Time);
  private readonly itemManager = di.inject(ItemManager);
  private readonly overlay = new TutorialOverlay();
  private step = -1;

  constructor() {
    // Listen for skip tutorial
    this.overlay.skipClicked.subscribe(() => this.endTutorial());
  }

  async showNextStep() {
    this.step++;
    switch (this.step) {
      case 0: {
        await this.overlay.show(this.getTarget(TTargets.plants), "Tap to select plants");
        this.overlay.hide();
        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 1: {
        await this.overlay.show(this.getTarget(TTargets.strawberry), "Select strawberries to plant them");
        this.overlay.hide();
        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 2: {
        const toPlant = 3;
        let planted = 0;
        for (const indicator of this.getClosestGridIndicators(toPlant)) {
          const text = planted === 0 ? "Plant your first seed!" : `Plant ${toPlant - planted} more!`;
          await this.overlay.show(indicator, text);
          indicator.clicked.emit();
          this.overlay.hide();
          planted++;
        }
        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 3: {
        const skipDayButton = this.getTarget(TTargets.skipDay);
        await this.skipDaySequence(skipDayButton, 2);
        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 4: {
        for (const yieldIcon of this.getTargets(TTargets.yield)) {
          await this.overlay.show(yieldIcon, "Collect money!");
          (yieldIcon as YieldIcon).clicked.emit();
        }
        void this.showNextStep();
        break;
      }
      case 5: {
        await this.overlay.show(this.getTarget(TTargets.corn), "Plant corn to feed your chicken");
        this.overlay.hide();
        await delay(0.2);
        for (const indicator of this.getClosestGridIndicators(3)) {
          await this.overlay.show(indicator, "Plant corn to feed your chicken");
          indicator.clicked.emit();
          this.overlay.hide();
        }
        await delay(0.2);
        const skipDayButton = this.getTarget(TTargets.skipDay);
        await this.skipDaySequence(skipDayButton, 2);
        await delay(0.2);
        for (const yieldIcon of this.getTargets(TTargets.yield)) {
          await this.overlay.show(yieldIcon, "Collect corn!");
          (yieldIcon as YieldIcon).clicked.emit();
        }
        void this.showNextStep();
        break;
      }
      case 6: {
        await this.overlay.show(this.getTarget(TTargets.animals), "Add a chicken to your farm");
        await this.overlay.show(this.getTarget(TTargets.chicken), "Add a chicken to your farm");
        const indicator = this.getClosestGridIndicators(1).first!;
        await this.overlay.show(indicator, "Add a chicken to your farm");
        indicator.clicked.emit();
        this.overlay.hide();
        await delay(0.2);
        this.time.paused = true;
        await this.overlay.showText("Chicken consume corn, make sure you have enough!");
        await this.overlay.show(this.getTarget(TTargets.skipDay), "Skip to the next day");
        this.time.paused = false;
        this.overlay.hide();
        await delay(0.5);
        const yieldIcon = this.getTarget(TTargets.yield) as YieldIcon;
        this.time.paused = true;
        await this.overlay.show(yieldIcon, "Collect the eggs!");
        this.time.paused = false;
        yieldIcon.clicked.emit();
        this.overlay.hide();
        await delay(0.2);
        this.time.paused = true;
        await this.overlay.showText(`Grow your farm to collect ${this.itemManager.goalEggs} eggs!`);
        this.time.paused = false;
        void this.showNextStep();
        break;
      }
      default:
        this.endTutorial();
        break;
    }
  }

  private async skipDaySequence(button: HTMLElement | Object3D, times: number) {
    for (let i = 0; i < times; i++) {
      this.time.paused = true;
      await this.overlay.show(button, i === 0 ? "Tap to skip to the next day" : "Skip one more day");
      this.overlay.hide();
      this.time.paused = false;
      if (i === 0) await delay(0.5);
    }
  }

  private getTargets(id: string) {
    const el = document.querySelectorAll(`[data-tutorial="${id}"]`);
    if (el.length > 0) return [...el.values()] as HTMLElement[];
    const results: Object3D[] = [];
    this.scene.scene.traverse((obj) => {
      if (obj.userData && obj.userData["tutorial"] === id) results.push(obj);
    });
    return results;
  }

  private getTarget(id: string) {
    const target = this.getTargets(id).first;
    if (!target) throw new Error(`Tutorial target not found: ${id}`);
    return target;
  }

  private getClosestGridIndicators(count: number): GridIndicator[] {
    const indicators = this.getTargets("grid-indicator") as GridIndicator[];
    return indicators.sort((a, b) => a.coords.lengthSq() - b.coords.lengthSq()).take(count);
  }

  private endTutorial() {
    this.overlay.hide();

    this.time.paused = false;
    this.step = Number.MAX_SAFE_INTEGER;

    this.itemManager.resources.corn += 10;
    this.itemManager.resources.money += 20;
    this.itemManager.changed.emit();
  }
}
