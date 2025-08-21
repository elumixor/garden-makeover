import { di, EventEmitter } from "utils";
import { BaseItem } from "./base-item";
import { itemDefs, type ItemName, type Resource } from "./item-defs";

@di.injectable
export class ItemManager {
  readonly changed = new EventEmitter();
  selectedItem: ItemName = "chicken";

  readonly resources: Record<Resource, number> = {
    coin: 3,
    egg: 0,
    corn: 0,
    grape: 0,
    tomato: 0,
  };

  readonly goalEggs = 100;

  get coins() {
    return this.resources.coin;
  }
  set coins(value: number) {
    this.resources.coin = value;
  }

  get eggs() {
    return this.resources.egg;
  }

  get progress() {
    return Math.min(1, this.eggs / this.goalEggs);
  }

  instantiate(itemName: ItemName) {
    const def = itemDefs[itemName];
    if (!this.hasEnoughResources(def)) return undefined;

    const item = new BaseItem(def);
    this.spendResources(def);

    item.collected.subscribe((data) => {
      // Update resources on collection
      this.resources[data.type] = (this.resources[data.type] ?? 0) + data.amount;
      this.changed.emit();
    });

    return item;
  }

  hasEnoughResources(def: (typeof itemDefs)[ItemName]) {
    if (this.coins < def.cost) return false;
    for (const need of def.needs ?? []) if ((this.resources[need.type] || 0) < need.amount) return false;

    return true;
  }

  spendResources(def: (typeof itemDefs)[ItemName]) {
    this.coins -= def.cost;
    for (const need of def.needs ?? []) this.resources[need.type] = (this.resources[need.type] || 0) - need.amount;

    this.changed.emit();
  }
}
