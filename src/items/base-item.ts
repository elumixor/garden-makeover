import { Resources, Scene, Time } from "core";
import { Object3D, type Vector3, AnimationMixer, LoopRepeat, AnimationAction, Sprite, SpriteMaterial } from "three";
import { di, EventEmitter } from "utils";
import { ItemManager } from "./item-manager";
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

  private yieldEvents: (() => void)[] = [];
  private needEvents: (() => void)[] = [];

  private mixer?: AnimationMixer;
  private currentAction?: AnimationAction;
  private animationFrameId?: number;

  constructor(protected readonly def: IItemDef) {
    this.model = this.instantiateModelForStage(0);
    this.setupAnimation();

    if (def.growthStages) this.scheduleGrowth();
    if (def.yields) this.scheduleYield();
    if (def.needs) this.scheduleNeeds();
  }

  private setupAnimation() {
    if (!this.def.animation) return;
    this.mixer = new AnimationMixer(this.model);
    const clip = this.resources.animations.get(this.def.animation);
    if (!clip) return;
    this.currentAction = this.mixer.clipAction(clip);
    this.currentAction.setLoop(LoopRepeat, Infinity);
    this.currentAction.play();
    this.animateMixer();
  }

  private readonly animateMixer = () => {
    if (!this.mixer) return;
    this.mixer.update(1 / 60);
    this.animationFrameId = requestAnimationFrame(this.animateMixer);
  };

  place(position?: Vector3) {
    this.scene.add(this.model);
    if (position) this.model.position.set(position.x, position.y, position.z);
    this.animateScaleIn(this.model, 100, 0, this.def.overshoot ? 1.5 : 1); // 0.2s, start from 0
  }

  private animateScaleIn(model: Object3D, durationMs: number, startScale: number, overshoot = 1.25) {
    const targetScale = model.scale.clone();
    model.scale.set(targetScale.x * startScale, targetScale.y * startScale, targetScale.z * startScale);
    const start = performance.now();

    // Overshoot: scale to 1.15x, then back to 1x
    const overshootScale = overshoot * targetScale.x;
    const upDuration = durationMs * 0.7;
    const downDuration = durationMs * 0.3;

    const animateUp = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / upDuration, 1);
      const scale = startScale + (overshootScale - startScale) * t;
      model.scale.set(scale, scale, scale);
      if (t < 1) {
        requestAnimationFrame(animateUp);
      } else {
        const downStart = performance.now();
        const animateDown = (now2: number) => {
          const elapsedDown = now2 - downStart;
          const t2 = Math.min(elapsedDown / downDuration, 1);
          const scale2 = overshootScale + (targetScale.x - overshootScale) * t2;
          model.scale.set(scale2, scale2, scale2);
          if (t2 < 1) {
            requestAnimationFrame(animateDown);
          } else {
            model.scale.copy(targetScale);
          }
        };
        requestAnimationFrame(animateDown);
      }
    };
    requestAnimationFrame(animateUp);
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
      if (this.scene) {
        this.scene.add(this.model);
        // Animate scale-in for new stage (0.2s), start from 0.5, with overshoot
        this.animateScaleIn(this.model, 200, 0.5);
      }

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
    this.yieldEvents.forEach((cancel) => cancel());
    this.yieldEvents = [];

    for (const yieldDef of this.def.yields) {
      const intervalSec = yieldDef.interval * this.time.cycleDuration;
      // Schedule using Time.schedule and keep a cancel function
      let cancelled = false;
      const cancel = () => {
        cancelled = true;
      };
      this.yieldEvents.push(cancel);

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
    this.needEvents.forEach((cancel) => cancel());
    this.needEvents = [];

    const itemManager = di.inject(ItemManager);

    for (const needDef of this.def.needs) {
      const intervalSec = needDef.interval * this.time.cycleDuration;
      let cancelled = false;
      const cancel = () => {
        cancelled = true;
      };
      this.needEvents.push(cancel);

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
    this.yieldIcon = undefined;

    // Remove item if disappearOnCollect is set
    if (this.def.disappearOnCollect) {
      this.dispose();
    } else {
      // Reschedule yield if item is still present
      this.scheduleYield();
    }
  }

  dispose() {
    if (this.scene) this.scene.remove(this.model);
    this.spawnSmokeEffect(); // <-- add this line
    this.removed.emit();
    // Cancel any scheduled yields
    this.yieldEvents.forEach((cancel) => cancel());
    this.yieldEvents = [];
    // Cancel any scheduled needs
    this.needEvents.forEach((cancel) => cancel());
    this.needEvents = [];
    // Stop animation
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.mixer) this.mixer.stopAllAction();
    this.mixer = undefined;
    this.currentAction = undefined;
  }

  private spawnSmokeEffect() {
    const count = 6;
    const sprites: Sprite[] = [];
    const texture = this.resources.smokeTexture!;
    if (!texture) return;
    for (let i = 0; i < count; i++) {
      const material = new SpriteMaterial({ map: texture, transparent: true, opacity: 0.8 });
      const sprite = new Sprite(material);
      // Randomize position around the model
      sprite.position.copy(this.model.position);
      sprite.position.x += (Math.random() - 0.5) * 1.5;
      sprite.position.y += Math.random() * 1.5 + 0.5;
      sprite.position.z += (Math.random() - 0.5) * 1.5;
      sprite.scale.set(1.2, 1.2, 1.2);
      this.scene.add(sprite);
      sprites.push(sprite);

      // Animate: fade out and move up
      const start = performance.now();
      const duration = 600 + Math.random() * 300;
      const startY = sprite.position.y;
      const animate = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        sprite.material.opacity = 0.8 * (1 - t);
        sprite.position.y = startY + t * 1.5;
        sprite.scale.setScalar(1.2 + t * 0.8);
        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.scene.remove(sprite);
          sprite.material.dispose();
        }
      };
      requestAnimationFrame(animate);
    }
  }

  get canYieldMoney() {
    const yields = this.def.yields ?? [];
    return yields.some((y) => y.type === "money" && y.amount > 0);
  }
}
