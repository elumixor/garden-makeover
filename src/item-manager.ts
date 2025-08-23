import { di, EventEmitter } from "utils";
import { GridItem, itemDefs, type IItemDef, type ItemName, type Resource } from "./grid-items";

@di.injectable
export class ItemManager {
  selectedItem?: ItemName;

  readonly changed = new EventEmitter();
  readonly goalReached = new EventEmitter();
  readonly moneyDepleted = new EventEmitter();

  readonly resources: Record<Resource, number> = {
    money: 3,
    egg: 0,
    corn: 0,
    grape: 0,
    tomato: 0,
  };

  readonly goalEggs = 25;

  private readonly placedItems: GridItem[] = []; // Track placed items

  constructor() {
    this.changed.subscribe(() => {
      // Emit goalReached if eggs goal is reached
      if (this.eggs >= this.goalEggs) this.goalReached.emit();

      // Emit moneyDepleted if money is zero or less and no items can yield money
      if (this.money <= 0 && !this.canYieldMoney) this.moneyDepleted.emit();
    });
  }

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

    const item = new GridItem(def);
    this.placedItems.push(item); // Track placed item

    this.spendResources(def);

    item.collected.subscribe(({ type, amount }) => {
      // Update resources on collection
      this.resources[type] = (this.resources[type] ?? 0) + amount;
      this.changed.emit();
    });

    item.removed.subscribe(() => this.placedItems.remove(item));

    return item;
  }

  hasEnoughResources(def: IItemDef) {
    if (this.money < def.cost) return false;
    for (const need of def.needs ?? []) if ((this.resources[need.type] || 0) < need.amount) return false;

    return true;
  }

  private spendResources(def: IItemDef) {
    this.money -= def.cost;
    for (const need of def.needs ?? []) this.resources[need.type] = (this.resources[need.type] || 0) - need.amount;

    this.changed.emit();
  }
}
