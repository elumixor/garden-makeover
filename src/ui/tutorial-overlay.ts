import { Scene } from "core";
import { Object3D, Vector3 } from "three";
import { di, EventEmitter } from "utils";
import styles from "./tutorial-overlay.module.scss";

export class TutorialOverlay {
  private readonly scene = di.inject(Scene);
  private readonly overlay = document.createElement("div");
  private readonly holeCircle = document.createElement("div");
  private readonly text = document.createElement("div");
  private readonly holeCenter = { x: 0, y: 0 };
  private readonly radius = 35;
  private readonly clicked = new EventEmitter();
  private readonly centerText = document.createElement("div");
  private readonly centerImage = document.createElement("img");

  private lastObj?: HTMLElement | Object3D;
  private lastText?: string;
  private readonly resizeListener = () => this.reposition();
  private hideTimeout?: number;

  constructor() {
    this.overlay.className = styles.tutorialOverlay;
    this.holeCircle.className = styles.tutorialOverlayHoleCircle;
    this.text.className = styles.tutorialOverlayText;

    // Add transition for fade in/out
    this.overlay.style.transition = "opacity 0.1s";
    this.holeCircle.style.transition = "opacity 0.1s";
    this.text.style.transition = "opacity 0.1s";

    this.holeCircle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.clicked.emit();
    });

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.holeCircle);
    document.body.appendChild(this.text);

    // Centered text and image for showText
    this.centerText.className = styles.tutorialOverlayText;
    this.centerText.style.position = "fixed";
    this.centerText.style.left = "50%";
    this.centerText.style.top = "50%";
    this.centerText.style.transform = "translate(-50%, -60%)";
    this.centerText.style.display = "none";
    this.centerText.style.textAlign = "center";
    this.centerText.style.zIndex = "10001";
    this.centerText.style.pointerEvents = "auto";

    this.centerImage.src = "images/skip_day.png";
    this.centerImage.style.display = "block";
    this.centerImage.style.margin = "24px auto 0 auto";
    this.centerImage.style.cursor = "pointer";
    this.centerImage.style.width = "64px";
    this.centerImage.style.height = "64px";
    this.centerImage.tabIndex = 0;
    this.centerImage.style.pointerEvents = "auto";
    this.centerImage.style.zIndex = "10002";

    this.centerText.appendChild(this.centerImage);
    document.body.appendChild(this.centerText);

    this.overlay.addEventListener(
      "pointerdown",
      (e) => {
        if (!this.isInHole(e.clientX, e.clientY)) {
          e.stopPropagation();
          e.preventDefault();
        }
      },
      true,
    );

    window.addEventListener("resize", this.resizeListener);

    this.hide(true);
  }

  async show(obj: HTMLElement | Object3D, text?: string) {
    // Cancel any pending hide timeout before showing
    if (this.hideTimeout !== undefined) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    this.lastObj = obj;
    this.lastText = text;

    this.text.textContent = text ?? null;
    this.text.style.display = text ? "block" : "none";

    this.reposition();

    // Fade in
    this.overlay.style.display = "block";
    this.holeCircle.style.display = "block";
    if (text) this.text.style.display = "block";
    window.setTimeout(() => {
      this.overlay.style.opacity = "1";
      this.holeCircle.style.opacity = "1";
      this.text.style.opacity = text ? "1" : "0";
    }, 0);

    // Trigger pointerdown event on the highlighted element
    await this.clicked.nextEvent;

    if (obj instanceof HTMLElement) obj.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  }

  hide(immediate = false) {
    // Cancel any pending hide timeout before hiding
    if (this.hideTimeout !== undefined) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    // Fade out
    this.overlay.style.opacity = "0";
    this.holeCircle.style.opacity = "0";
    this.text.style.opacity = "0";

    if (immediate) {
      this.overlay.style.display = "none";
      this.holeCircle.style.display = "none";
      this.text.style.display = "none";
      this.lastObj = undefined;
      this.lastText = undefined;
      return;
    }

    this.hideTimeout = window.setTimeout(() => {
      this.overlay.style.display = "none";
      this.holeCircle.style.display = "none";
      this.text.style.display = "none";
      this.lastObj = undefined;
      this.lastText = undefined;
      this.hideTimeout = undefined;
    }, 100);
  }

  async showText(text: string) {
    // Cancel any pending hide timeout before showing
    if (this.hideTimeout !== undefined) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }

    // Show black overlay, hide hole and normal text
    this.overlay.style.display = "block";
    this.overlay.style.opacity = "1";
    this.holeCircle.style.display = "none";
    this.text.style.display = "none";

    // Remove any hole effect from the overlay
    this.overlay.style.clipPath = "none";

    // Show centered text and image
    this.centerText.innerHTML = "";
    const span = document.createElement("span");
    span.textContent = text;
    this.centerText.appendChild(span);
    this.centerText.appendChild(this.centerImage);
    this.centerText.style.display = "block";
    this.centerImage.style.display = "block";

    // Wait for pointerdown on the image
    await new Promise<void>((resolve) => {
      const handler = () => {
        this.centerImage.removeEventListener("pointerdown", handler);
        resolve();
      };
      this.centerImage.addEventListener("pointerdown", handler);
    });

    this.centerText.style.display = "none";
    this.overlay.style.display = "none";
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

      // Convert to viewport coordinates
      const { left, top } = domElement.getBoundingClientRect();
      x += left;
      y += top;
    }

    this.holeCenter.x = x;
    this.holeCenter.y = y;
  }

  private updateClipPath() {
    const { x, y } = this.holeCenter;
    const radius = this.radius;
    const precision = 64;

    // Calculate the circle points in viewport px
    const c = Array.from({ length: precision }).map((_, i) => {
      const a = (-i / (precision - 1)) * Math.PI * 2;
      const px = Math.cos(a) * radius + x;
      const py = Math.sin(a) * radius + y;
      return `${px}px ${py}px`;
    });

    // Rectangle points (clockwise)
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rect = [
      `${w}px 0px`,
      `${w}px ${h}px`,
      `0px ${h}px`,
      "0px 0px",
      `${w}px 0px`,
      `${w}px 0px`, // repeat to ensure polygon is closed before circle
    ];

    // Compose the polygon: rectangle, then circle (hole)
    this.overlay.style.clipPath = `polygon(${rect.join(",")}, ${c.join(",")})`;
  }

  private updateHoleCircle() {
    const {
      holeCenter: { x, y },
      radius: r,
    } = this;

    Object.assign(this.holeCircle.style, {
      left: `${x - r}px`,
      top: `${y - r}px`,
      width: `${r * 2}px`,
      height: `${r * 2}px`,
      display: "block",
    });
  }

  private updateTextPosition() {
    if (!this.lastText) {
      this.text.style.display = "none";
      return;
    }

    const { x, y } = this.holeCenter;
    const r = this.radius;
    const maxWidth = 300;
    const margin = 16;

    // Temporarily set width to maxWidth for measurement
    this.text.style.width = `${maxWidth}px`;
    this.text.style.display = "block";

    // Measure height
    const instrRect = this.text.getBoundingClientRect();
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Try to position above the circle
    let top = y - r - instrRect.height - margin;

    if (top < margin) {
      // Not enough space above, place below
      top = y + r + margin;
      // If still not enough space, clamp to bottom
      if (top + instrRect.height > h - margin) top = h - margin - instrRect.height;
    }

    // Center horizontally on the circle
    let left = x - instrRect.width / 2;
    // Clamp to screen
    if (left < margin) left = margin;
    if (left + instrRect.width > w - margin) left = w - margin - instrRect.width;

    this.text.style.left = `${left}px`;
    this.text.style.top = `${top}px`;
  }

  private isInHole(x: number, y: number) {
    const dx = x - this.holeCenter.x;
    const dy = y - this.holeCenter.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
