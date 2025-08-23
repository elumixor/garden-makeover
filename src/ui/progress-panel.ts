import { ItemManager } from "items";
import { di } from "utils";
import styles from "./progress-panel.module.scss";

export class ProgressPanel {
  private readonly itemManager = di.inject(ItemManager);

  private readonly root = document.createElement("div");
  private readonly progressText = document.createElement("div");
  private readonly progressBar = document.createElement("div");
  private readonly progressBarInner = document.createElement("div");

  constructor() {
    this.root.className = styles.progressPanel;

    this.progressText.className = styles.progressText;
    this.progressText.innerHTML = `Collect ${this.itemManager.goalEggs} <img src="images/egg.png" alt="egg" class="${styles.progressTextEgg}">`;

    this.progressBar.className = styles.progressBar;
    this.progressBarInner.className = styles.progressBarInner;
    this.progressBar.appendChild(this.progressBarInner);

    this.root.appendChild(this.progressText);
    this.root.appendChild(this.progressBar);

    document.body.appendChild(this.root);

    this.itemManager.changed.subscribe(() => this.update());
    this.update();
  }

  update() {
    const eggs = this.itemManager.eggs;
    const percent = Math.min(eggs / this.itemManager.goalEggs, 1) * 100;
    this.progressBarInner.style.width = `${percent}%`;
  }
}
