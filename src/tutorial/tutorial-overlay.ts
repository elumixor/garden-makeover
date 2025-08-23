import { GameScene } from "core";
import { Object3D, Vector3 } from "three";
import { di, EventEmitter } from "utils";
import { OverlayElements } from "./overlay-elements";
import overlayStyles from "./tutorial-overlay.module.scss";

/** Public overlay API for the tutorial flow. */
export class TutorialOverlay {
  private readonly scene = di.inject(GameScene);
  private readonly els = new OverlayElements();
  private readonly holeCenter = { x: 0, y: 0 };
  private readonly radius = 35;
  private readonly clicked = new EventEmitter();
  private lastObj?: HTMLElement | Object3D;
  private lastText?: string;
  private hideTimeout?: number;
  private readonly resizeListener = () => this.reposition();
  private readonly skipButton: HTMLButtonElement;
  readonly skipClicked = new EventEmitter();

  constructor() {
    this.els.holeCircle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.clicked.emit();
    });

    this.els.overlay.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.isInHole(e.clientX, e.clientY)) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true,
    );

    // Create skip tutorial button
    this.skipButton = this.els.overlay.addElement("button", {
      text: "Skip Tutorial",
      className: overlayStyles.tutorialOverlaySkipButton,
    });

    this.skipButton.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.skipClicked.emit();
    });

    document.body.appendChild(this.skipButton);
    this.skipButton.style.display = "none";

    window.addEventListener("resize", this.resizeListener);
    this.hide();
  }

  async show(obj: HTMLElement | Object3D, text?: string) {
    this.cancelHide();
    this.lastObj = obj;
    this.lastText = text;
    this.els.text.textContent = text ?? "";
    this.els.text.style.display = text ? "block" : "none";
    this.skipButton.style.display = "block";
    this.reposition();
    this.fadeIn(text);
    this.showSkipButton();
    await this.clicked.nextEvent;
    if (obj instanceof HTMLElement) obj.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  }

  hide() {
    this.cancelHide();
    this.els.overlay.style.opacity = this.els.holeCircle.style.opacity = this.els.text.style.opacity = "0";
    this.skipButton.style.display = "none";

    this.hideTimeout = window.setTimeout(() => {
      this.setDisplay("none");
      this.resetState();
      this.hideTimeout = undefined;
    }, 100);

    this.hideSkipButton();
  }

  async showText(text: string) {
    this.cancelHide();

    // Prepare base overlay
    this.els.overlay.style.display = "block";
    this.els.overlay.style.opacity = "1";
    this.els.holeCircle.style.display = "none";
    this.els.text.style.display = "none";
    this.els.overlay.style.clipPath = "none";

    // Center text
    this.els.centerText.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = text;
    this.els.centerText.appendChild(span);
    this.els.centerText.appendChild(this.els.centerImage);
    this.els.centerText.style.display = "block";
    this.els.centerImage.style.display = "block";

    await new Promise<void>((resolve) => {
      const handler = () => {
        this.els.centerImage.removeEventListener("pointerdown", handler);
        resolve();
      };

      this.els.centerImage.addEventListener("pointerdown", handler);
    });

    this.els.centerText.style.display = "none";
    this.els.overlay.style.display = "none";
    this.hideSkipButton();
  }

  private fadeIn(withText?: string) {
    this.setDisplay("block");
    window.setTimeout(() => {
      this.els.overlay.style.opacity = "1";
      this.els.holeCircle.style.opacity = "1";
      this.els.text.style.opacity = withText ? "1" : "0";
    }, 0);
  }

  private fadeOut() {}

  private setDisplay(v: "none" | "block") {
    this.els.overlay.style.display = v;
    this.els.holeCircle.style.display = v;
    if (this.lastText) this.els.text.style.display = v;
    else this.els.text.style.display = "none";
  }

  private resetState() {
    this.lastObj = undefined;
    this.lastText = undefined;
  }

  private cancelHide() {
    if (this.hideTimeout !== undefined) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }

  private reposition() {
    if (!this.lastObj) return;
    this.updateHolePosition(this.lastObj);
    this.updateClipPath();
    this.updateHoleCircle();
    this.updateTextPosition();
  }

  private updateHolePosition(obj: HTMLElement | Object3D) {
    const {
      camera,
      renderer: { domElement },
    } = this.scene;
    let x = 0;
    let y = 0;
    if (obj instanceof HTMLElement) {
      const rect = obj.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else {
      const pos = new Vector3();
      obj.getWorldPosition(pos);
      pos.project(camera);
      const { clientWidth, clientHeight } = domElement;
      x = (pos.x * 0.5 + 0.5) * clientWidth;
      y = (1 - (pos.y * 0.5 + 0.5)) * clientHeight;
      const { left, top } = domElement.getBoundingClientRect();
      x += left;
      y += top;
    }
    this.holeCenter.x = x;
    this.holeCenter.y = y;
  }

  private updateClipPath() {
    const { x, y } = this.holeCenter;
    const r = this.radius;
    const precision = 64;
    const circle = Array.from({ length: precision }).map((_, i) => {
      const a = (-i / (precision - 1)) * Math.PI * 2;
      return `${Math.cos(a) * r + x}px ${Math.sin(a) * r + y}px`;
    });
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rect = [`${w}px 0px`, `${w}px ${h}px`, `0px ${h}px`, "0px 0px", `${w}px 0px`, `${w}px 0px`];
    this.els.overlay.style.clipPath = `polygon(${rect.join(",")}, ${circle.join(",")})`;
  }

  private updateHoleCircle() {
    const { x, y } = this.holeCenter;
    const r = this.radius;
    Object.assign(this.els.holeCircle.style, {
      left: `${x - r}px`,
      top: `${y - r}px`,
      width: `${r * 2}px`,
      height: `${r * 2}px`,
      display: "block",
    });
  }

  private updateTextPosition() {
    if (!this.lastText) {
      this.els.text.style.display = "none";
      return;
    }
    const { x, y } = this.holeCenter;
    const r = this.radius;
    const maxWidth = 300;
    const margin = 16;
    this.els.text.style.width = `${maxWidth}px`;
    this.els.text.style.display = "block";
    const instrRect = this.els.text.getBoundingClientRect();
    const w = window.innerWidth;
    const h = window.innerHeight;
    let top = y - r - instrRect.height - margin;
    if (top < margin) {
      top = y + r + margin;
      if (top + instrRect.height > h - margin) top = h - margin - instrRect.height;
    }
    let left = x - instrRect.width / 2;
    if (left < margin) left = margin;
    if (left + instrRect.width > w - margin) left = w - margin - instrRect.width;
    this.els.text.style.left = `${left}px`;
    this.els.text.style.top = `${top}px`;
  }

  private isInHole(x: number, y: number) {
    const dx = x - this.holeCenter.x;
    const dy = y - this.holeCenter.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  private showSkipButton() {
    this.skipButton.style.display = "block";
  }

  private hideSkipButton() {
    this.skipButton.style.display = "none";
  }
}
