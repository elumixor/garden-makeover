import type { ModelName } from "core";

// Durations are in day/night cycles (see Time.cycleDuration), can be fractional (e.g. 0.5 = half cycle)
export type Resource = "egg" | "corn" | "money" | "grape" | "tomato";

// Item lifecycle/yield/behavior definition
export interface IItemDef {
  name: ItemName;
  label: string;
  model: ModelName;
  cost: number;
  category: "plant" | "animal" | "building";
  yields?: { type: Resource; amount: number; interval: number }[]; // e.g. [{type: "egg", amount: 1, interval: 6}]
  growthStages?: { model: ModelName; duration: number; yield?: { type: Resource; amount: number } }[]; // for plants
  needs?: { type: Resource; amount: number; interval: number }[]; // e.g. [{type: "corn", amount: 1, interval: 6}]
  maxCountPer?: number; // e.g. chickens per fence
  fenceRequired?: boolean;
  enabled?: boolean; // add enabled flag here
  disappearOnCollect?: boolean; // add this flag
  asset?: string; // add asset property for UI icons
  overshoot?: boolean; // add overshoot property for placement animation
  animation?: string; // single animation name if present
}
export type ItemName = "chicken" | "cow" | "sheep" | "grape" | "strawberry" | "tomato" | "corn" | "fence" | "barn";

export const itemDefs: Record<ItemName, IItemDef> = {
  strawberry: {
    name: "strawberry",
    label: "Strawberry",
    model: "strawberry_1",
    cost: 1,
    category: "plant",
    growthStages: [
      { model: "strawberry_1", duration: 1 },
      { model: "strawberry_2", duration: 1 },
      { model: "strawberry_3", duration: 1, yield: { type: "money", amount: 3 } },
    ],
    enabled: true,
    disappearOnCollect: true,
    overshoot: true,
    asset: "images/strawberry.png",
  },
  corn: {
    name: "corn",
    label: "Corn",
    model: "corn_1",
    cost: 2,
    category: "plant",
    growthStages: [
      { model: "corn_1", duration: 1 },
      { model: "corn_2", duration: 1 },
      { model: "corn_3", duration: 1, yield: { type: "corn", amount: 5 } },
    ],
    enabled: true,
    disappearOnCollect: true,
    overshoot: true,
    asset: "images/corn.png",
  },
  grape: {
    name: "grape",
    label: "Grape",
    model: "grape_1",
    cost: 2,
    category: "plant",
    growthStages: [
      { model: "grape_1", duration: 1 },
      { model: "grape_2", duration: 1 },
      { model: "grape_3", duration: 1, yield: { type: "grape", amount: 5 } },
    ],
    enabled: false,
    disappearOnCollect: false,
    overshoot: true,
    asset: "images/grape.png",
  },
  tomato: {
    name: "tomato",
    label: "Tomato",
    model: "tomato_1",
    cost: 2,
    category: "plant",
    growthStages: [
      { model: "tomato_1", duration: 1 },
      { model: "tomato_2", duration: 1 },
      { model: "tomato_3", duration: 1, yield: { type: "tomato", amount: 5 } },
    ],
    enabled: false,
    disappearOnCollect: false,
    overshoot: true,
    asset: "images/tomato.png",
  },
  chicken: {
    name: "chicken",
    label: "Chicken",
    model: "chicken_1",
    cost: 2,
    category: "animal",
    yields: [{ type: "egg", amount: 1, interval: 0.5 }],
    needs: [{ type: "corn", amount: 1, interval: 1 }],
    fenceRequired: true,
    enabled: true,
    disappearOnCollect: false,
    asset: "images/chicken.png",
    animation: "action_chicken",
  },
  cow: {
    name: "cow",
    label: "Cow",
    model: "cow_1",
    cost: 5,
    category: "animal",
    enabled: false,
    disappearOnCollect: false,
    asset: "images/cow.png",
    animation: "action_cow",
  },
  sheep: {
    name: "sheep",
    label: "Sheep",
    model: "sheep_1",
    cost: 5,
    category: "animal",
    enabled: false,
    disappearOnCollect: false,
    asset: "images/sheep.png",
    animation: "action_sheep",
  },
  fence: {
    name: "fence",
    label: "Fence",
    model: "fence",
    cost: 5,
    category: "building",
    maxCountPer: 5, // supports up to 5 chickens
    enabled: true,
    disappearOnCollect: false,
    asset: "images/fence.png",
  },
  barn: {
    name: "barn",
    label: "Barn",
    model: "barn",
    cost: 10,
    category: "building",
    enabled: false,
    disappearOnCollect: false,
    asset: "images/barn.png",
  },
};
