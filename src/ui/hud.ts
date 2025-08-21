import { ItemManager } from "items";
import { di } from "utils";

export class HUD {
  private readonly itemManager = di.inject(ItemManager);

  private readonly root = document.createElement("div");
  private readonly coinsSpan = document.createElement("span");
  private readonly eggsSpan = document.createElement("span");
  private readonly cornSpan = document.createElement("span");
  private readonly progressBar = document.createElement("span");

  constructor() {
    this.root.className = "hud-panel";

    this.coinsSpan.className = "hud-coins";
    this.coinsSpan.textContent = `💵 ${this.itemManager.coins}`;

    this.eggsSpan.className = "hud-eggs";
    this.eggsSpan.textContent = `🥚 ${this.itemManager.eggs}`;

    this.cornSpan.className = "hud-corn";
    this.cornSpan.textContent = `🌽 ${this.itemManager.resources.corn ?? 0}`;

    const progressSpan = document.createElement("span");
    progressSpan.className = "hud-progress";

    this.progressBar = document.createElement("span");
    this.progressBar.className = "hud-progress-bar";
    progressSpan.appendChild(this.progressBar);

    this.root.appendChild(this.coinsSpan);
    this.root.appendChild(this.eggsSpan);
    this.root.appendChild(this.cornSpan);
    this.root.appendChild(progressSpan);

    document.body.appendChild(this.root);

    this.itemManager.changed.subscribe(() => this.update());
  }

  update() {
    this.coinsSpan.textContent = `💵 ${this.itemManager.coins}`;
    this.eggsSpan.textContent = `🥚 ${this.itemManager.eggs}`;
    this.cornSpan.textContent = `🌽 ${this.itemManager.resources.corn ?? 0}`;
    this.progressBar.style.width = `${Math.round(this.itemManager.progress * 100)}%`;
  }
}
