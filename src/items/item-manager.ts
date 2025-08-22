import { di, EventEmitter } from "utils";
import { BaseItem } from "./base-item";
import { itemDefs, type ItemName, type Resource } from "./item-defs";

@di.injectable
export class ItemManager {
  readonly changed = new EventEmitter();
  readonly goalReached = new EventEmitter();
  readonly moneyDepleted = new EventEmitter(); // Add this line
  selectedItem: ItemName = "chicken";

  readonly resources: Record<Resource, number> = {
    money: 50,
    egg: 25,
    corn: 10,
    grape: 0,
    tomato: 0,
  };

  readonly goalEggs = 100;

  private readonly placedItems: BaseItem[] = []; // Track placed items

  get money() {
    return this.resources.money;
  }
  set money(value: number) {
    this.resources.money = value;
  }

  get eggs() {
    return this.resources.egg;
  }

  get progress() {
    return Math.min(1, this.eggs / this.goalEggs);
  }

  // Returns true if any placed item can yield money
  get canYieldMoney() {
    return this.placedItems.some((item) => item.canYieldMoney);
  }

  instantiate(itemName: ItemName) {
    const def = itemDefs[itemName];
    if (!this.hasEnoughResources(def)) return undefined;

    const item = new BaseItem(def);
    this.spendResources(def);

    this.placedItems.push(item); // Track placed item

    item.collected.subscribe((data) => {
      // Update resources on collection
      this.resources[data.type] = (this.resources[data.type] ?? 0) + data.amount;
      this.changed.emit();

      // Emit goalReached if eggs goal is reached
      if (data.type === "egg" && this.resources.egg >= this.goalEggs) this.goalReached.emit();
    });

    item.removed.subscribe(() => {
      const idx = this.placedItems.indexOf(item);
      if (idx !== -1) this.placedItems.splice(idx, 1);
    });

    return item;
  }

  hasEnoughResources(def: (typeof itemDefs)[ItemName]) {
    if (this.money < def.cost) return false;
    for (const need of def.needs ?? []) if ((this.resources[need.type] || 0) < need.amount) return false;

    return true;
  }

  spendResources(def: (typeof itemDefs)[ItemName]) {
    this.money -= def.cost;
    for (const need of def.needs ?? []) this.resources[need.type] = (this.resources[need.type] || 0) - need.amount;

    this.changed.emit();

    // Emit moneyDepleted if money is zero or less and no items can yield money
    if (this.money <= 0 && !this.canYieldMoney) {
      this.moneyDepleted.emit();
    }
  }
}
