export class TutorialOverlay {
  root = document.createElement("div");
  constructor() {
    this.root.className = "tutorial-overlay";
    document.body.appendChild(this.root);
  }
  showBubble({ x, y, text }: { x: number; y: number; text: string }) {
    this.root.innerHTML = `
      <div class="tutorial-bubble" style="left:${x}px;top:${y}px;">
        <div class="tutorial-bubble-content">${text}</div>
        <div class="tutorial-bubble-arrow"></div>
      </div>
    `;
  }
  hideBubble() {
    this.root.innerHTML = "";
  }
}
