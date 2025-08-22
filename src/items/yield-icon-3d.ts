import { Scene, Resources, playClick } from "core";
import { CanvasTexture, Sprite, SpriteMaterial, Vector2, Vector3 } from "three";
import { di, EventEmitter } from "utils";
import type { Resource } from "./item-defs";

export class YieldIcon3D {
  public readonly sprite: Sprite;
  public readonly clicked = new EventEmitter<void>();
  private readonly scene = di.inject(Scene);
  private readonly resources = di.inject(Resources);
  private _amount = 0;
  private _blinkTimeout?: number;

  constructor(
    position: Vector3,
    readonly type: Resource,
  ) {
    const size = 2; // was 1.5
    const texture = this.createTexture(type, 0);
    const material = new SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.sprite = new Sprite(material);
    this.sprite.scale.set(size, size, 1);
    this.setPosition(position);

    window.addEventListener("pointerdown", this.handlePointerDown);

    this.blink();
  }

  get amount() {
    return this._amount;
  }
  set amount(amount: number) {
    this._amount = amount;
    this.sprite.material.map = this.createTexture(this.type, amount);
    this.sprite.material.needsUpdate = true;
    this.sprite.visible = amount > 0;
    this.blink();
  }

  setPosition(pos: Vector3) {
    this.sprite.position.copy(pos);
  }

  private readonly handlePointerDown = (e: PointerEvent) => {
    if (!this.sprite.visible) return;
    // Use the injected scene's camera and raycaster
    const { camera, raycaster, renderer } = this.scene;
    // Convert mouse to NDC
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(new Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(this.sprite, false);
    if (intersects.length > 0) {
      playClick();
      this.clicked.emit();
    }
  };

  dispose() {
    this.sprite.parent?.remove(this.sprite);
    window.removeEventListener("pointerdown", this.handlePointerDown);
  }

  private createTexture(type: Resource, amount: number) {
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
    const img = this.resources.imageCache[type];
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

  private blink() {
    // Cancel any ongoing blink
    if (this._blinkTimeout) {
      clearTimeout(this._blinkTimeout);
      this._blinkTimeout = undefined;
    }
    const sprite = this.sprite;
    const base = 2; // was 1.5
    let t = 0;
    const duration = 180; // ms
    const animate = () => {
      t += 16;
      // Ease out scale: from 2.3 -> 2
      const progress = Math.min(t / duration, 1);
      const scale = base + (2.3 - base) * (1 - progress) * 0.7;
      sprite.scale.set(scale, scale, 1);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        sprite.scale.set(base, base, 1);
      }
    };
    // Start at larger scale
    sprite.scale.set(2.3, 2.3, 1); // was 1.8
    this._blinkTimeout = window.setTimeout(() => {
      animate();
    }, 0);
  }
}
