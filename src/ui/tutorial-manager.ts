import { Scene, Time, type GridIndicator } from "core";
import { ItemManager, type YieldIcon } from "items";
import type { Object3D } from "three";
import { delay, di } from "utils";
import { TutorialOverlay } from "./tutorial-overlay";

export class TutorialManager {
  private readonly scene = di.inject(Scene);
  private readonly time = di.inject(Time);
  private readonly itemManager = di.inject(ItemManager);
  private readonly overlay = new TutorialOverlay();
  private step = -1;

  async showNextStep() {
    this.step++;

    // Example: highlight a UI element or 3D object for the first step
    switch (this.step) {
      case 0: {
        // Replace with actual element or Object3D reference
        await this.overlay.show(this.getTarget("plants"), "Tap to select plants");
        this.overlay.hide();

        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 1: {
        await this.overlay.show(this.getTarget("strawberry"), "Select strawberries to plant them");
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
        // Teach to speed up
        const skipDayButton = this.getTarget("skip-day");

        this.time.paused = true;
        await this.overlay.show(skipDayButton, "Tap to skip to the next day");
        this.overlay.hide();
        this.time.paused = false;
        await delay(0.5);
        this.time.paused = true;
        await this.overlay.show(skipDayButton, "Skip one more day");
        this.time.paused = false;
        this.overlay.hide();

        await delay(0.2);
        void this.showNextStep();
        break;
      }
      case 4: {
        // Collect money from strawberries
        for (const yieldIcon of this.getTargets("yield-icon")) {
          await this.overlay.show(yieldIcon, "Collect money!");
          (yieldIcon as YieldIcon).clicked.emit();
        }

        void this.showNextStep();
        break;
      }
      case 5: {
        // Now select corn and plant it
        await this.overlay.show(this.getTarget("corn"), "Plant corn to feed your chicken");
        this.overlay.hide();

        await delay(0.2);

        // Select 3 grid indicators
        for (const indicator of this.getClosestGridIndicators(3)) {
          await this.overlay.show(indicator, "Plant corn to feed your chicken");
          indicator.clicked.emit();
          this.overlay.hide();
        }

        await delay(0.2);

        // Skip 2 more days
        const skipDayButton = this.getTarget("skip-day");
        this.time.paused = true;
        await this.overlay.show(skipDayButton, "Tap to skip to the next day");
        this.overlay.hide();
        this.time.paused = false;
        await delay(0.5);
        this.time.paused = true;
        await this.overlay.show(skipDayButton, "Skip one more day");
        this.time.paused = false;
        this.overlay.hide();

        await delay(0.2);

        // Collect corn
        for (const yieldIcon of this.getTargets("yield-icon")) {
          await this.overlay.show(yieldIcon, "Collect corn!");
          (yieldIcon as YieldIcon).clicked.emit();
        }

        void this.showNextStep();

        break;
      }
      case 6: {
        // Select animals panel to add chicken
        await this.overlay.show(this.getTarget("animals"), "Add a chicken to your farm");
        await this.overlay.show(this.getTarget("chicken"), "Add a chicken to your farm");

        const indicator = this.getClosestGridIndicators(1).first!;
        await this.overlay.show(indicator, "Add a chicken to your farm");
        indicator.clicked.emit();
        this.overlay.hide();
        await delay(0.2);

        this.time.paused = true;
        await this.overlay.showText("Chicken consume corn, make sure you have enough!");
        await this.overlay.show(this.getTarget("skip-day"), "Skip to the next day");
        this.time.paused = false;
        this.overlay.hide();
        await delay(0.5);

        const yieldIcon = this.getTarget("yield-icon") as YieldIcon;
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
        this.overlay.hide();
        break;
    }
  }

  private getTargets(id: string) {
    const el = document.querySelectorAll(`[data-tutorial="${id}"]`);
    if (el.length > 0) return [...el.values()] as HTMLElement[];

    // Inline findObjectsByUserData
    const results: Object3D[] = [];
    this.scene.scene.traverse((obj) => {
      if (obj.userData && obj.userData["tutorial"] === id) {
        results.push(obj);
      }
    });
    return results;
  }

  private getTarget(id: string) {
    const target = this.getTargets(id).first;
    if (!target) throw new Error(`Tutorial target not found: ${id}`);
    return target;
  }

  /**
   * Returns the N closest GridIndicator objects to (0,0).
   */
  private getClosestGridIndicators(count: number): GridIndicator[] {
    const indicators = this.getTargets("grid-indicator") as GridIndicator[];
    return indicators.sort((a, b) => a.coords.lengthSq() - b.coords.lengthSq()).take(count);
  }
}
