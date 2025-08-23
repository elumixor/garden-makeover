import { itemDefs, ItemManager } from "items";
import { di } from "utils";
import { playClick } from "core";
import styles from "./build-menu.module.scss";

// Category icon asset paths (relative to /public)
const CATEGORY_ICONS = {
  plants: "images/plant.png",
  animals: "images/chicken.png",
  buildings: "images/barn.png",
} as const;

export class BuildMenu {
  private readonly itemManager = di.inject(ItemManager);
  private readonly root = document.createElement("div");
  private readonly categoriesBar = document.createElement("div");
  private readonly menuItems = document.createElement("div");
  private readonly categories = [
    { key: "plants", icon: CATEGORY_ICONS.plants, category: "plant" },
    { key: "animals", icon: CATEGORY_ICONS.animals, category: "animal" },
    { key: "buildings", icon: CATEGORY_ICONS.buildings, category: "building" },
  ] as const;

  private activeTab = "plants" as (typeof this.categories)[number]["key"];

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
    this.root.className = styles.buildMenu;
    this.categoriesBar.className = styles.buildMenuCategories;
    this.menuItems.className = styles.buildMenuItems;

    // Category buttons (bottom row)
    for (const tab of this.categories) {
      const btn = document.createElement("button");
      btn.className =
        styles.buildMenuCategoryBtn + (tab.key === this.activeTab ? ` ${styles.buildMenuCategoryBtnActive}` : "");
      btn.onclick = () => {
        playClick();
        this.activeTab = tab.key;
        for (const key in this.tabButtons)
          this.tabButtons[key].classList.toggle(styles.buildMenuCategoryBtnActive, key === this.activeTab);

        // Select first enabled item in the new tab
        const defs = this.getDefsForActiveTab();
        const firstEnabled = defs.find((def) => def.enabled);
        if (firstEnabled) this.itemManager.selectedItem = firstEnabled.name;

        this.updateMenuItems();
      };

      const img = document.createElement("img");
      img.src = tab.icon;
      img.alt = tab.key;
      btn.appendChild(img);

      this.tabButtons[tab.key] = btn;
      this.categoriesBar.appendChild(btn);
    }

    this.root.appendChild(this.menuItems);
    this.root.appendChild(this.categoriesBar);
    document.body.appendChild(this.root);

    // Create the maximum number of buttons needed for any tab
    const maxItems = Math.max(...this.categories.map((tab) => this.getDefsForCategory(tab.category).length));

    for (let i = 0; i < maxItems; ++i) {
      const btn = document.createElement("button");
      btn.className = styles.buildMenuItem;
      btn.onclick = () => {
        const def = this.getDefsForActiveTab()[i];
        if (def && def.enabled && this.itemManager.hasEnoughResources(def)) {
          playClick();
          this.itemManager.selectedItem = def.name;
          this.updateMenuItems();
        }
      };
      this.menuButtons.push(btn);
      this.lastButtonStates.push({});
      this.menuItems.appendChild(btn);
    }

    // Select first enabled item in initial tab
    const defs = this.getDefsForActiveTab();
    const firstEnabled = defs.find((def) => def.enabled);
    if (firstEnabled) this.itemManager.selectedItem = firstEnabled.name;

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
    const tab = this.categories.find((t) => t.key === this.activeTab)!;
    return this.getDefsForCategory(tab.category);
  }

  private updateMenuItems() {
    const defs = this.getDefsForActiveTab();
    for (let i = 0; i < this.menuButtons.length; ++i) {
      const btn = this.menuButtons[i];
      const def = defs[i];
      if (def) {
        btn.style.display = "";

        // Compute current state
        const canAfford = this.itemManager.hasEnoughResources(def);
        const enabled = !!def.enabled && canAfford;
        const selected = def.name === this.itemManager.selectedItem;
        const lastState = this.lastButtonStates[i];

        // Only update DOM if state changed
        if (
          lastState.enabled !== def.enabled ||
          lastState.canAfford !== canAfford ||
          lastState.selected !== selected ||
          lastState.defName !== def.name
        ) {
          // Use asset image for item icon if available, fallback to nothing
          let iconHtml = "";
          if (def.asset) {
            iconHtml = `<img src="${def.asset}" alt="${def.label}">`;
          }

          // Compose cost/needs line with resource images, grouping icon and amount in a span
          let needsLine = `<span><img src="images/money.png" alt="coin" style="width:16px;height:16px;vertical-align:middle;"><span>${def.cost}</span></span>`;
          if (def.needs && def.needs.length > 0) {
            for (const need of def.needs) {
              const needIcon = `<img src="images/${need.type}.png" alt="${need.type}" style="width:16px;height:16px;vertical-align:middle;">`;
              needsLine += `  <span>${needIcon}<span>${need.amount}</span></span>`;
            }
          }

          btn.innerHTML = `${iconHtml}<div class="${styles.buildMenuItemNeeds}">${needsLine}</div>`;
          btn.title = def.label;

          btn.className =
            styles.buildMenuItem +
            (def.enabled && canAfford ? "" : ` ${styles.buildMenuItemDisabled}`) +
            (selected ? ` ${styles.buildMenuItemSelected}` : "");
          btn.disabled = !enabled;

          // Update cache
          lastState.enabled = def.enabled;
          lastState.canAfford = canAfford;
          lastState.selected = selected;
          lastState.defName = def.name;
        }
      } else {
        btn.style.display = "none";
        // Clear cache for unused buttons
        this.lastButtonStates[i] = {};
      }
    }
  }
}
