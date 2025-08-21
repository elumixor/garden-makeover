import type { ModelName } from "core";

// Durations are in day/night cycles (see Time.cycleDuration), can be fractional (e.g. 0.5 = half cycle)
export type Resource = "egg" | "corn" | "coin" | "grape" | "tomato";

// Item lifecycle/yield/behavior definition
export interface IItemDef {
  name: ItemName;
  label: string;
  emoji: string;
  model: ModelName;
  cost: number;
  category: "plant" | "animal" | "building";
  animated?: boolean;
  yields?: { type: Resource; amount: number; interval: number }[]; // e.g. [{type: "egg", amount: 1, interval: 6}]
  growthStages?: { model: ModelName; duration: number; yield?: { type: Resource; amount: number } }[]; // for plants
  needs?: { type: Resource; amount: number; interval: number }[]; // e.g. [{type: "corn", amount: 1, interval: 6}]
  maxCountPer?: number; // e.g. chickens per fence
  fenceRequired?: boolean;
  enabled?: boolean; // add enabled flag here
  disappearOnCollect?: boolean; // add this flag
}
export type ItemName = "chicken" | "cow" | "sheep" | "grape" | "strawberry" | "tomato" | "corn" | "fence" | "barn";

export const itemDefs: Record<ItemName, IItemDef> = {
  strawberry: {
    name: "strawberry",
    label: "Strawberry",
    emoji: "🍓",
    model: "strawberry_1",
    cost: 1,
    category: "plant",
    animated: false,
    growthStages: [
      { model: "strawberry_1", duration: 1 },
      { model: "strawberry_2", duration: 1 },
      { model: "strawberry_3", duration: 1, yield: { type: "coin", amount: 3 } },
    ],
    enabled: true,
    disappearOnCollect: true,
  },
  corn: {
    name: "corn",
    label: "Corn",
    emoji: "🌽",
    model: "corn_1",
    cost: 2,
    category: "plant",
    animated: false,
    growthStages: [
      { model: "corn_1", duration: 1 },
      { model: "corn_2", duration: 1 },
      { model: "corn_3", duration: 1, yield: { type: "corn", amount: 5 } },
    ],
    enabled: true,
    disappearOnCollect: true,
  },
  grape: {
    name: "grape",
    label: "Grape",
    emoji: "🍇",
    model: "grape_1",
    cost: 2,
    category: "plant",
    animated: false,
    growthStages: [
      { model: "grape_1", duration: 1 },
      { model: "grape_2", duration: 1 },
      { model: "grape_3", duration: 1, yield: { type: "grape", amount: 5 } },
    ],
    enabled: false,
    disappearOnCollect: false,
  },
  tomato: {
    name: "tomato",
    label: "Tomato",
    emoji: "🍅",
    model: "tomato_1",
    cost: 2,
    category: "plant",
    animated: false,
    growthStages: [
      { model: "tomato_1", duration: 1 },
      { model: "tomato_2", duration: 1 },
      { model: "tomato_3", duration: 1, yield: { type: "tomato", amount: 5 } },
    ],
    enabled: false,
    disappearOnCollect: false,
  },
  chicken: {
    name: "chicken",
    label: "Chicken",
    emoji: "🐔",
    model: "chicken_1",
    cost: 2,
    category: "animal",
    animated: true,
    yields: [{ type: "egg", amount: 1, interval: 0.5 }],
    needs: [{ type: "corn", amount: 1, interval: 1 }],
    fenceRequired: true,
    enabled: true,
    disappearOnCollect: false,
  },
  cow: {
    name: "cow",
    label: "Cow",
    emoji: "🐄",
    model: "cow_1",
    cost: 5,
    category: "animal",
    animated: true,
    enabled: false,
    disappearOnCollect: false,
  },
  sheep: {
    name: "sheep",
    label: "Sheep",
    emoji: "🐑",
    model: "sheep_1",
    cost: 5,
    category: "animal",
    animated: true,
    enabled: false,
    disappearOnCollect: false,
  },
  fence: {
    name: "fence",
    label: "Fence",
    emoji: "🪵",
    model: "fence",
    cost: 5,
    category: "building",
    animated: false,
    maxCountPer: 5, // supports up to 5 chickens
    enabled: true,
    disappearOnCollect: false,
  },
  barn: {
    name: "barn",
    label: "Barn",
    emoji: "🏚️",
    model: "barn",
    cost: 10,
    category: "building",
    animated: false,
    enabled: false,
    disappearOnCollect: false,
  },
};
