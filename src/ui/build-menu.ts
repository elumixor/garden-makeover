import { itemDefs, ItemManager } from "items";
import { di } from "utils";

export class BuildMenu {
  private readonly itemManager = di.inject(ItemManager);
  private readonly root = document.createElement("div");
  private readonly tabBar = document.createElement("div");
  private readonly menuItems = document.createElement("div");
  private readonly categories = [
    { key: "plants", label: "🌱 Plants", category: "plant" },
    { key: "animals", label: "🐾 Animals", category: "animal" },
    { key: "buildings", label: "🏠 Buildings", category: "building" },
  ] as const;
  private activeTab = "plants" as (typeof this.categories)[number]["key"];

  private readonly tabButtons: Record<string, HTMLButtonElement> = {};
  private readonly menuButtons: HTMLButtonElement[] = [];

  constructor() {
    this.root.className = "build-menu";
    this.tabBar.className = "build-menu-tabs";
    this.menuItems.className = "build-menu-items";

    for (const tab of this.categories) {
      const btn = document.createElement("button");
      btn.textContent = tab.label;
      btn.className = "build-menu-tab" + (tab.key === this.activeTab ? " active" : "");
      btn.onclick = () => {
        this.activeTab = tab.key;
        for (const key in this.tabButtons) this.tabButtons[key].classList.toggle("active", key === this.activeTab);

        // Select first enabled item in the new tab
        const defs = this.getDefsForActiveTab();
        const firstEnabled = defs.find((def) => def.enabled);
        if (firstEnabled) this.itemManager.selectedItem = firstEnabled.name;

        this.updateMenuItems();
      };

      this.tabButtons[tab.key] = btn;
      this.tabBar.appendChild(btn);
    }

    this.root.appendChild(this.tabBar);
    this.root.appendChild(this.menuItems);
    document.body.appendChild(this.root);

    // Create the maximum number of buttons needed for any tab
    const maxItems = Math.max(...this.categories.map((tab) => this.getDefsForCategory(tab.category).length));

    for (let i = 0; i < maxItems; ++i) {
      const btn = document.createElement("button");
      btn.className = "build-menu-item";
      btn.onclick = () => {
        const def = this.getDefsForActiveTab()[i];
        if (def && def.enabled && this.itemManager.hasEnoughResources(def)) {
          this.itemManager.selectedItem = def.name;
          this.updateMenuItems();
        }
      };
      this.menuButtons.push(btn);
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
    // Get all items of a category, preserving order from itemManager.defs
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

        // Compose label: emoji (main icon)
        const label = def.emoji;

        // Compose cost/needs line
        let needsLine = `💵${def.cost}`;
        if (def.needs && def.needs.length > 0) {
          for (const need of def.needs) {
            const needDef = Object.values(itemDefs).find((d) => d.name === need.type);
            const needEmoji = needDef?.emoji || need.type;
            needsLine += `  ${needEmoji}${need.amount}`;
          }
        }

        // Use two lines: icon, then needs/cost
        btn.innerHTML = `<div>${label}</div><div class="build-menu-item-needs">${needsLine}</div>`;
        btn.title = def.label;

        // Disable if not enabled or not enough resources
        const canAfford = this.itemManager.hasEnoughResources(def);
        btn.className = "build-menu-item" + (def.enabled && canAfford ? "" : " disabled");
        btn.disabled = !(def.enabled && canAfford);
        btn.classList.toggle("selected", def.name === this.itemManager.selectedItem);
      } else {
        btn.style.display = "none";
      }
    }
  }
}
