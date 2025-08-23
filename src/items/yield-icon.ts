import { playClick, Resources } from "core";
import { CanvasTexture, Sprite, SpriteMaterial } from "three";
import { di, EventEmitter, Interactivity, type ISubscription } from "utils";
import type { Resource } from "./item-defs";
import { Time } from "core/time";

export class YieldIcon extends Sprite {
  readonly clicked = new EventEmitter<void>();
  private readonly interactivity = di.inject(Interactivity);
  private readonly time = di.inject(Time);
  private _amount = 0;
  private subscription?: ISubscription;

  constructor(readonly type: Resource) {
    const texture = YieldIcon.createTexture(type, 0);
    const material = new SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    super(material);

    this.scale.set(2, 2, 1);

    // Register click handler for this sprite
    this.interactivity.on(this, () => {
      if (!this.visible) return;
      playClick();
      this.clicked.emit();
    });

    this.blink();
  }

  get amount() {
    return this._amount;
  }

  set amount(amount: number) {
    this._amount = amount;
    this.material.map = YieldIcon.createTexture(this.type, amount);
    this.material.needsUpdate = true;
    this.visible = amount > 0;
    this.blink();
  }

  private static createTexture(type: Resource, amount: number) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Circle background
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Use preloaded image from instance cache
    const img = di.inject(Resources).imageCache[type];
    ctx.drawImage(img, size / 2 - 48, size / 2 - 48, 96, 96);

    // Counter
    if (amount > 1) {
      // Make text larger, bolder, white, and with black drop shadow
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 4;

      // Move text a bit lower and to the right
      const textX = (size * 2) / 4;
      const textY = size;

      // Draw black border
      ctx.strokeStyle = "#000";
      ctx.strokeText(String(amount), textX, textY);

      // Draw white fill
      ctx.fillStyle = "#fff";
      ctx.fillText(String(amount), textX, textY);

      ctx.shadowBlur = 0;
    }

    return new CanvasTexture(canvas);
  }

  dispose() {
    this.parent?.remove(this);
    this.interactivity.off(this);
    // Unsubscribe from blink animation if active
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  private blink() {
    // Cancel any ongoing blink
    this.subscription?.unsubscribe();

    const base = 2;
    const duration = 0.18;
    let elapsed = 0;

    // Start at larger scale
    this.scale.set(2.3, 2.3, 1);

    this.subscription = this.time.subscribe(({ fixedDeltaTime }) => {
      elapsed += fixedDeltaTime;
      // Ease out scale: from 2.3 -> 2
      const progress = Math.min(elapsed / duration, 1);
      const scale = base + (2.3 - base) * (1 - progress) * 0.7;
      this.scale.set(scale, scale, 1);

      if (progress < 1) return;

      this.scale.set(base, base, 1);
      this.subscription?.unsubscribe();
      this.subscription = undefined;
    });
  }
}
