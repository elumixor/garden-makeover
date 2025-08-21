import { Resources, Scene, Time } from "core";
import { type Vector3 } from "three";
import { di, EventEmitter } from "utils";
import type { IItemDef, Resource } from "./item-defs";
import type { IYieldEvent } from "./yield-event";
import { YieldIcon3D } from "./yield-icon-3d";

export class BaseItem {
  readonly removed = new EventEmitter();
  readonly collected = new EventEmitter<IYieldEvent>();

  protected readonly resources = di.inject(Resources);
  protected readonly time = di.inject(Time);

  protected model;
  protected currentStage = 0;
  protected readonly scene = di.inject(Scene).scene;
  private yieldIcon?: YieldIcon3D;

  constructor(protected readonly def: IItemDef) {
    this.model = this.instantiateModelForStage(0);

    if (def.growthStages) this.scheduleGrowth();
    if (def.yields) this.scheduleYield();
  }

  private instantiateModelForStage(stage: number) {
    let prevPosition;
    if (stage > 0 && this.model) {
      prevPosition = this.model.position.clone();
    }

    let newModel;
    if (this.def.growthStages) {
      const idx = Math.max(0, Math.min(stage, this.def.growthStages.length - 1));
      newModel = this.resources.instantiate(this.def.growthStages[idx].model);
    } else newModel = this.resources.instantiate(this.def.model);

    if (prevPosition) {
      newModel.position.copy(prevPosition);
    }

    return newModel;
  }

  place(position?: Vector3) {
    this.scene.add(this.model);
    if (position) this.model.position.set(position.x, position.y, position.z);
  }

  private scheduleGrowth() {
    if (!this.def.growthStages) return;
    if (this.currentStage >= this.def.growthStages.length - 1) return;
    const stageDef = this.def.growthStages[this.currentStage];
    const durationSec = stageDef.duration * this.time.cycleDuration;

    this.time.schedule(() => {
      this.currentStage++;
      // Remove old model from scene
      if (this.scene) this.scene.remove(this.model);
      // Replace with new model
      this.model = this.instantiateModelForStage(this.currentStage);
      if (this.scene) this.scene.add(this.model);

      // If this stage has a yield, show the yield icon
      if (this.def.growthStages) {
        const stageDef = this.def.growthStages[this.currentStage];
        if (stageDef.yield) this.addYield(stageDef.yield.type, stageDef.yield.amount);
      }

      // Continue growth if more stages
      this.scheduleGrowth();
    }, durationSec);
  }

  private scheduleYield() {
    if (!this.def.yields) return;
    for (const yieldDef of this.def.yields) {
      const intervalSec = yieldDef.interval * this.time.cycleDuration;
      this.time.schedule(() => {
        this.addYield(yieldDef.type, yieldDef.amount);
        // After yielding, schedule again for continuous production.
        this.scheduleYield();
      }, intervalSec);
    }
  }

  private addYield(yieldType: Resource, amount: number) {
    if (!this.yieldIcon) {
      const icon = new YieldIcon3D(this.model.position, yieldType);

      this.yieldIcon = icon;
      this.scene.add(icon.sprite);
      icon.clicked.subscribe(() => this.collectYield());
    }

    this.yieldIcon.amount += amount;

    const pos = this.model.position.clone();
    pos.y += 3;

    this.yieldIcon.setPosition(pos);
  }

  collectYield() {
    const { amount, type } = this.yieldIcon!;
    this.collected.emit({ type, amount });
    this.yieldIcon?.dispose();

    // Remove item if disappearOnCollect is set
    if (this.def.disappearOnCollect) this.dispose();
  }

  dispose() {
    if (this.scene) this.scene.remove(this.model);
    this.removed.emit();
  }
}
