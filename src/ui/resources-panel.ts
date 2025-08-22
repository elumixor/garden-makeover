import { ItemManager } from "items";
import { di } from "utils";
import styles from "./resources-panel.module.scss";

export class ResourcesPanel {
  private readonly itemManager = di.inject(ItemManager);

  private readonly root = document.createElement("div");
  private readonly coinsRow = document.createElement("div");
  private readonly cornRow = document.createElement("div");
  private readonly eggsRow = document.createElement("div");

  private readonly coinsValue = document.createElement("span");
  private readonly cornValue = document.createElement("span");
  private readonly eggsValue = document.createElement("span");

  constructor() {
    this.root.className = styles.resourcesPanel;

    // Coins row
    this.coinsRow.className = styles.resourceRow;
    const coinsIcon = document.createElement("img");
    coinsIcon.src = "images/money.png";
    coinsIcon.alt = "Coins";
    coinsIcon.className = styles.resourceIcon;
    this.coinsValue.textContent = `${this.itemManager.money}`;
    this.coinsRow.appendChild(coinsIcon);
    this.coinsRow.appendChild(this.coinsValue);

    // Corn row
    this.cornRow.className = styles.resourceRow;
    const cornIcon = document.createElement("img");
    cornIcon.src = "images/corn.png";
    cornIcon.alt = "Corn";
    cornIcon.className = styles.resourceIcon;
    this.cornValue.textContent = `${this.itemManager.resources.corn ?? 0}`;
    this.cornRow.appendChild(cornIcon);
    this.cornRow.appendChild(this.cornValue);

    // Eggs row
    this.eggsRow.className = styles.resourceRow;
    const eggsIcon = document.createElement("img");
    eggsIcon.src = "images/egg.png";
    eggsIcon.alt = "Eggs";
    eggsIcon.className = styles.resourceIcon;
    this.eggsValue.textContent = `${this.itemManager.eggs}`;
    this.eggsRow.appendChild(eggsIcon);
    this.eggsRow.appendChild(this.eggsValue);

    this.root.appendChild(this.coinsRow);
    this.root.appendChild(this.cornRow);
    this.root.appendChild(this.eggsRow);

    document.body.appendChild(this.root);

    this.itemManager.changed.subscribe(() => this.update());
  }

  private animateValue(el: HTMLElement) {
    el.classList.remove(styles.animated); // reset if already animating
    // Force reflow to restart animation
    void el.offsetWidth;
    el.classList.add(styles.animated);
    const remove = () => {
      el.classList.remove(styles.animated);
      el.removeEventListener("animationend", remove);
    };
    el.addEventListener("animationend", remove);
  }

  update() {
    if (this.coinsValue.textContent !== `${this.itemManager.money}`) {
      this.coinsValue.textContent = `${this.itemManager.money}`;
      this.animateValue(this.coinsValue);
    }
    if (this.eggsValue.textContent !== `${this.itemManager.eggs}`) {
      this.eggsValue.textContent = `${this.itemManager.eggs}`;
      this.animateValue(this.eggsValue);
    }
    const newCorn = `${this.itemManager.resources.corn ?? 0}`;
    if (this.cornValue.textContent !== newCorn) {
      this.cornValue.textContent = newCorn;
      this.animateValue(this.cornValue);
    }
  }
}
