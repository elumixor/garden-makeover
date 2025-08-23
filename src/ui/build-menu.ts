import { playClick } from "core";
import { itemDefs } from "grid-items";
import { customElement, di } from "utils";
import styles from "./build-menu.module.scss";
import { ItemManager } from "item-manager";

const CATEGORY_ICONS = {
  plants: "images/plant.png",
  animals: "images/chicken.png",
  buildings: "images/barn.png",
} as const;

@customElement()
export class BuildMenu extends HTMLElement {
  private readonly itemManager = di.inject(ItemManager);
  private readonly menuItems = this.addElement("div", { className: styles.buildMenuItems });
  private readonly categoriesBar = this.addElement("div", { className: styles.buildMenuCategories });
  private readonly categories = [
    { key: "plants", icon: CATEGORY_ICONS.plants, category: "plant" },
    { key: "animals", icon: CATEGORY_ICONS.animals, category: "animal" },
    { key: "buildings", icon: CATEGORY_ICONS.buildings, category: "building" },
  ] as const;

  // Set to undefined so no tab is selected initially
  private activeTab: (typeof this.categories)[number]["key"] | undefined = undefined;

  private readonly tabButtons: Record<string, HTMLButtonElement> = {};
  private readonly menuButtons: HTMLButtonElement[] = [];

  // Cache last state for each menu button to avoid unnecessary redraws
  private readonly lastButtonStates: {
    enabled?: boolean;
    selected?: boolean;
    canAfford?: boolean;
    defName?: string;
  }[] = [];

  constructor() {
    super();
    this.className = styles.buildMenu;

    // Category buttons (bottom row)
    for (const tab of this.categories) {
      const btn = this.categoriesBar.addElement("button", {
        className:
          styles.buildMenuCategoryBtn + (tab.key === this.activeTab ? ` ${styles.buildMenuCategoryBtnActive}` : ""),
      });
      btn.setAttribute("data-tutorial", tab.key);
      btn.onpointerdown = () => {
        playClick();
        this.activeTab = tab.key;
        for (const key in this.tabButtons)
          this.tabButtons[key].classList.toggle(styles.buildMenuCategoryBtnActive, key === this.activeTab);

        this.updateMenuItems();
      };
      btn.addElement("img", { attrs: { src: tab.icon, alt: tab.key } });

      this.tabButtons[tab.key] = btn;
      this.categoriesBar.appendChild(btn);
    }

    // Create the maximum number of buttons needed for any tab
    const maxItems = Math.max(...this.categories.map((tab) => this.getDefsForCategory(tab.category).length));

    for (let i = 0; i < maxItems; ++i) {
      const btn = this.menuItems.addElement("button", { className: styles.buildMenuItem });
      btn.setAttribute("data-tutorial", "");
      btn.onpointerdown = () => {
        const def = this.getDefsForActiveTab()[i];
        if (def && def.enabled && this.itemManager.hasEnoughResources(def)) {
          playClick();
          this.itemManager.selectedItem = def.name;
          this.updateMenuItems();
        }
      };
      this.menuButtons.push(btn);
      this.lastButtonStates.push({});
    }

    // Do NOT select any item or tab initially

    this.updateMenuItems();

    this.itemManager.changed.subscribe(() => this.updateMenuItems());
  }

  private getDefsForCategory(category: "plant" | "animal" | "building") {
    return Object.values(itemDefs)
      .filter((def) => def.category === category)
      .map((def) => ({
        ...def,
        enabled: def.enabled,
      }));
  }

  private getDefsForActiveTab() {
    if (!this.activeTab) return [];
    const tab = this.categories.find((t) => t.key === this.activeTab)!;
    return this.getDefsForCategory(tab.category);
  }

  private updateMenuItems() {
    this.menuItems.style.display = this.activeTab ? "" : "none";
    const defs = this.getDefsForActiveTab();

    for (let i = 0; i < this.menuButtons.length; i++) {
      const btn = this.menuButtons[i];
      const def = defs[i];
      if (!def) {
        btn.style.display = "none";
        this.lastButtonStates[i] = {};
        continue;
      }
      btn.style.display = "";
      btn.setAttribute("data-tutorial", def.name);

      const canAfford = this.itemManager.hasEnoughResources(def);
      const enabled = !!def.enabled && canAfford;
      const selected = def.name === this.itemManager.selectedItem;
      const cache = this.lastButtonStates[i];

      if (
        cache.enabled === def.enabled &&
        cache.canAfford === canAfford &&
        cache.selected === selected &&
        cache.defName === def.name
      )
        continue; // no change

      const needs: string[] = [
        `<span><img src="images/money.png" alt="coin" style="width:16px;height:16px;vertical-align:middle;"><span>${def.cost}</span></span>`,
      ];
      for (const need of def.needs ?? [])
        needs.push(
          `<span><img src="images/${need.type}.png" alt="${need.type}" style="width:16px;height:16px;vertical-align:middle;"><span>${need.amount}</span></span>`,
        );

      btn.innerHTML = `${def.asset ? `<img src="${def.asset}" alt="${def.label}">` : ""}<div class="${styles.buildMenuItemNeeds}">${needs.join(
        " ",
      )}</div>`;
      btn.title = def.label;
      btn.className =
        styles.buildMenuItem +
        (enabled ? "" : ` ${styles.buildMenuItemDisabled}`) +
        (selected ? ` ${styles.buildMenuItemSelected}` : "");
      btn.disabled = !enabled;

      cache.enabled = def.enabled;
      cache.canAfford = canAfford;
      cache.selected = selected;
      cache.defName = def.name;
    }
  }
}
