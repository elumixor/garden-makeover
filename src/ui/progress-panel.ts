import { ItemManager } from "item-manager";
import { di, customElement } from "utils";
import styles from "./progress-panel.module.scss";

@customElement()
export class ProgressPanel extends HTMLElement {
  private readonly itemManager = di.inject(ItemManager);
  private readonly progressText = this.addElement("div", { className: styles.progressText });
  private readonly progressBar = this.addElement("div", { className: styles.progressBar });
  private readonly progressBarInner = this.progressBar.addElement("div", { className: styles.progressBarInner });

  constructor() {
    super();

    this.progressText.addElement("span", { text: `Collect ${this.itemManager.goalEggs}` });
    this.progressText.addElement("img", {
      attrs: { src: "images/egg.png", alt: "egg" },
      className: styles.progressTextEgg,
    });

    this.className = styles.progressPanel;
    this.itemManager.changed.subscribe(() => this.update());
    this.update();
  }

  private update() {
    this.progressBarInner.style.width = `${Math.min(this.itemManager.progress, 1) * 100}%`;
  }
}
