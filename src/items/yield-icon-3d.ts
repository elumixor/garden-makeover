import { Scene } from "core";
import { CanvasTexture, Sprite, SpriteMaterial, Vector2, Vector3 } from "three";
import { di, EventEmitter } from "utils";
import type { Resource } from "./item-defs";

export class YieldIcon3D {
  public readonly sprite: Sprite;
  public readonly clicked = new EventEmitter<void>();
  private readonly scene = di.inject(Scene);
  private _amount = 0;

  constructor(
    position: Vector3,
    readonly type: Resource,
  ) {
    const size = 1.5;
    const texture = this.createTexture(type, 0);
    const material = new SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    this.sprite = new Sprite(material);
    this.sprite.scale.set(size, size, 1);
    this.setPosition(position);

    window.addEventListener("pointerdown", this.handlePointerDown);
  }

  get amount() {
    return this._amount;
  }
  set amount(amount: number) {
    this._amount = amount;
    this.sprite.material.map = this.createTexture(this.type, amount);
    this.sprite.material.needsUpdate = true;
    this.sprite.visible = amount > 0;
  }

  setAmount(amount: number) {
    this.amount = amount;
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
    if (intersects.length > 0) this.clicked.emit();
  };

  dispose() {
    this.sprite.parent?.remove(this.sprite);
    window.removeEventListener("pointerdown", this.handlePointerDown);
  }

  private createTexture(type: string, amount: number) {
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

    // Emoji
    ctx.font = "64px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#222";
    ctx.fillText(YieldIcon3D.getYieldEmoji(type), size / 2, size / 2 - 8);

    // Counter
    if (amount > 1) {
      ctx.font = "32px sans-serif";
      ctx.fillStyle = "#111";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(amount), size / 2, size - 10);
    }
    return new CanvasTexture(canvas);
  }

  private static getYieldEmoji(type: string) {
    if (type === "strawberry") return "🍓";
    if (type === "egg") return "🥚";
    if (type === "corn") return "🌽";
    if (type === "grape") return "🍇";
    if (type === "tomato") return "🍅";
    if (type === "money" || type === "coin") return "💵";
    return type;
  }
}
