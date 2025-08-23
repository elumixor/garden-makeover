import { ItemManager } from "item-manager";
import { customElement, di } from "utils";
import styles from "./resources-panel.module.scss";
@customElement()
export class ResourcesPanel extends HTMLElement {
  private readonly itemManager = di.inject(ItemManager);
  private readonly coinsValue = document.createElement("span");
  private readonly cornValue = document.createElement("span");
  private readonly eggsValue = document.createElement("span");

  constructor() {
    super();
    this.className = styles.resourcesPanel;

    const rows: { icon: string; alt: string; valueEl: HTMLSpanElement; compute: () => string }[] = [
      { icon: "money", alt: "Coins", valueEl: this.coinsValue, compute: () => `${this.itemManager.money}` },
      { icon: "corn", alt: "Corn", valueEl: this.cornValue, compute: () => `${this.itemManager.resources.corn ?? 0}` },
      { icon: "egg", alt: "Eggs", valueEl: this.eggsValue, compute: () => `${this.itemManager.eggs}` },
    ];

    for (const r of rows) {
      r.valueEl.textContent = r.compute();
      const el = this.addElement("div", { className: styles.resourceRow });

      el.addElement("img", {
        className: styles.resourceIcon,
        attrs: { src: `images/${r.icon}.png`, alt: r.alt },
      });

      el.appendChild(r.valueEl);
    }
    this.itemManager.changed.subscribe(() => this.update());
  }

  private animateValue(el: HTMLElement) {
    el.classList.remove(styles.animated); // reset if already animating
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
