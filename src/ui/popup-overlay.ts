import { openStore } from "utils";

export class PopupOverlay {
  root = document.createElement("div");
  constructor() {
    this.root.className = "popup-overlay";
    this.root.innerHTML = `
      <div class="popup-content">
        <div class="popup-emoji">🥚</div>
        <div class="popup-title">You’ve got eggs!</div>
        <div class="popup-desc">Tap below to download the full version and keep building.</div>
        <button id="popup-download-btn" class="popup-download-btn">Download GardenMakeover Now</button>
      </div>
    `;
    this.root.style.display = "none";
    document.body.appendChild(this.root);

    this.root
      .querySelector("#popup-download-btn")!
      .addEventListener("click", () => openStore("https://your-download-link.com"));
  }
  show() {
    this.root.style.display = "flex";
  }
  hide() {
    this.root.style.display = "none";
  }
}
