import { Assets, playClick, Time } from "core";
import { AnimationMixer, Group, LoopRepeat, Object3D } from "three";
import { di, EventEmitter, type ISubscription } from "utils";
import { ItemManager } from "../item-manager";
import type { IItemDef, Resource } from "./item-defs";
import { SmokeEffect } from "./smoke-effect";
import { YieldIcon } from "./yield-icon";

export class GridItem extends Group {
  readonly removed = new EventEmitter();
  readonly collected = new EventEmitter<{ type: Resource; amount: number }>();

  private readonly resources = di.inject(Assets);
  private readonly time = di.inject(Time);

  private model;
  private currentStage = 0;
  private yieldIcon?: YieldIcon;

  private yieldEvents: (() => void)[] = [];
  private needEvents: (() => void)[] = [];

  private animationSubscription?: ISubscription;
  private scaleSubscription?: ISubscription;

  constructor(private readonly def: IItemDef) {
    super();

    this.model = this.getModelForStage(0);
    this.add(this.model);

    // If the model has animation, start looping it
    this.loopAnimation();

    // Animate scale in effect
    this.animateScaleIn(this.model, 0.2, 0, this.def.overshoot ? 1.25 : 1);

    this.scheduleGrowth();
    this.scheduleYield();
    this.scheduleNeeds();
  }

  get canYieldMoney() {
    const { yields, growthStages } = this.def;
    // Check direct yields
    if (yields?.some(({ type, amount }) => type === "money" && amount > 0)) return true;

    // Check growth stage yields
    return growthStages?.some(({ yield: { type, amount = 0 } = {} }) => type === "money" && amount > 0) ?? false;
  }

  private getModelForStage(stage: number) {
    if (!this.def.growthStages) return this.resources.instantiate(this.def.model);

    const idx = Math.max(0, Math.min(stage, this.def.growthStages.length - 1));
    return this.resources.instantiate(this.def.growthStages[idx].model);
  }

  private loopAnimation() {
    const { animation } = this.def;
    if (!animation) return;

    const clip = this.resources.animations.get(animation);
    if (!clip) return;

    const mixer = new AnimationMixer(this.model);

    const currentAction = mixer.clipAction(clip);
    currentAction.setLoop(LoopRepeat, Infinity);
    currentAction.play();

    // Start updating animation in a loop
    this.animationSubscription = this.time.subscribe(({ deltaTime }) => mixer.update(deltaTime));
  }

  private animateScaleIn(model: Object3D, duration: number, startScale: number, overshoot = 1.25) {
    // Unsubscribe previous if any
    this.scaleSubscription?.unsubscribe();

    const targetScale = model.scale.clone();
    model.scale.set(targetScale.x * startScale, targetScale.y * startScale, targetScale.z * startScale);
    let elapsed = 0;

    // Overshoot: scale to 1.15x, then back to 1x
    const overshootScale = overshoot * targetScale.x;
    const upDuration = duration * 0.7;
    const downDuration = duration * 0.3;
    let phase: "up" | "down" = "up";
    let downStart = 0;

    this.scaleSubscription = this.time.subscribe(({ deltaTime }) => {
      elapsed += deltaTime;
      if (phase === "up") {
        const t = Math.min(elapsed / upDuration, 1);
        const scale = startScale + (overshootScale - startScale) * t;
        model.scale.set(scale, scale, scale);
        if (t >= 1) {
          phase = "down";
          downStart = elapsed;
        }
      } else {
        const t2 = Math.min((elapsed - downStart) / downDuration, 1);
        const scale2 = overshootScale + (targetScale.x - overshootScale) * t2;
        model.scale.set(scale2, scale2, scale2);
        if (t2 >= 1) {
          model.scale.copy(targetScale);
          this.scaleSubscription?.unsubscribe();
          this.scaleSubscription = undefined;
        }
      }
    });
  }

  private scheduleGrowth() {
    if (!this.def.growthStages) return;
    if (this.currentStage >= this.def.growthStages.length - 1) return;

    const stageDef = this.def.growthStages[this.currentStage];
    const durationSec = stageDef.duration * this.time.cycleDuration;

    this.time.schedule(() => {
      this.currentStage++;

      // Replace the model
      this.remove(this.model);
      this.model = this.getModelForStage(this.currentStage);
      this.add(this.model);

      // Animate scale-in
      this.animateScaleIn(this.model, 0.2, 0.5);

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

    // Cancel previous scheduled events
    for (const cancel of this.yieldEvents) cancel();
    this.yieldEvents = [];

    for (const yieldDef of this.def.yields) {
      const intervalSec = yieldDef.interval * this.time.cycleDuration;

      let cancelled = false;
      this.yieldEvents.push(() => (cancelled = true));

      this.time.schedule(() => {
        if (cancelled) return;
        this.addYield(yieldDef.type, yieldDef.amount);

        // Schedule next yield after collection, not immediately
        this.scheduleYield();
      }, intervalSec);
    }
  }

  private scheduleNeeds() {
    if (!this.def.needs) return;

    // Cancel previous scheduled events
    for (const cancel of this.needEvents) cancel();
    this.needEvents = [];

    const itemManager = di.inject(ItemManager);

    for (const needDef of this.def.needs) {
      const intervalSec = needDef.interval * this.time.cycleDuration;

      let cancelled = false;
      this.needEvents.push(() => (cancelled = true));

      const consume = () => {
        if (cancelled) return;

        // Use ItemManager's resources for inventory
        if ((itemManager.resources[needDef.type] ?? 0) < needDef.amount) {
          // Not enough resource: auto-collect yield if present, then disappear
          if (this.yieldIcon) this.collectYield();
          this.dispose();
          return;
        }
        // Consume the resource
        itemManager.resources[needDef.type] -= needDef.amount;
        itemManager.changed.emit();

        // Schedule next need
        this.time.schedule(consume, intervalSec);
      };
      this.time.schedule(consume, intervalSec);
    }
  }

  private addYield(yieldType: Resource, amount: number) {
    if (!this.yieldIcon) {
      const icon = new YieldIcon(yieldType);

      this.yieldIcon = icon;
      this.add(icon);
      icon.clicked.subscribe(() => {
        playClick();
        return this.collectYield();
      });
    }

    this.yieldIcon.amount += amount;

    const pos = this.model.position.clone();
    pos.y += 3;

    this.yieldIcon.position.copy(pos);
  }

  private collectYield() {
    const { amount, type } = this.yieldIcon!;
    this.collected.emit({ type, amount });
    this.yieldIcon?.dispose();
    this.yieldIcon = undefined;

    // Remove item if disappearOnCollect is set
    if (this.def.disappearOnCollect) this.dispose();
    // Reschedule yield if item is still present
    else this.scheduleYield();
  }

  private dispose() {
    const smoke = new SmokeEffect();
    this.parent?.add(smoke);
    smoke.position.copy(this.position);
    this.removeFromParent();

    // Cancel any scheduled yields
    for (const cancel of this.yieldEvents) cancel();
    this.yieldEvents = [];

    // Cancel any scheduled needs
    for (const cancel of this.needEvents) cancel();
    this.needEvents = [];

    // Stop animation
    this.animationSubscription?.unsubscribe();
    this.scaleSubscription?.unsubscribe();
    this.removed.emit();
  }
}
