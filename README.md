# GardenMakeover – Playable Ad Prototype
[*Result deployed here*](https://elumixor.github.io/garden-makeover/)

##  Overview
A **short playable ad (<1 minute)** for the mobile game *GardenMakeover*.
Players can **place limited items and collect resources** in a charming garden environment.
A **persistent CTA** button encourages installation anytime, with a popup appearing upon key achievement.

##  Objective
**Collect the first egg** from a chicken to unlock the popup CTA.
Alternatively, tap the always-visible **Download** button to exit early.

##  Core Mechanics

### Available Elements

- **Flowers** (plant)
  - Cost: 1 coin.
  - Grow in **3 stages, each stage = 1 day/night cycle** (duration is relative to the day/night cycle, see below).
  - Yield: 3 flowers → converted automatically to 15 coins.

- **Corn** (plant)
  - Cost: 2 coins.
  - Grow in **3 stages, each stage = 1 day/night cycle**.
  - Yield: 5 corns → converted to coins.

- **Chicken** (animal)
  - Must be inside a fence.
  - Cost: 2 coins.
  - Consumes 1 corn per day (6 s); if unfed, disappears.
  - Lays 1 egg per day.
  - Eggs accumulate if not collected.

- **Fence** (building)
  - One present by default.
  - Additional cost: 5 coins.
  - Each fence supports up to 5 chickens.

> All other plants, animals, and buildings are **visible but greyed out**, acting as teasers.

### Time & Speed-Up

- **Fixed cycle**: 5s day → 5s night (**10s total per cycle by default**).
  - Growth, feeding, and egg-laying happen every cycle.
  - **All durations in item definitions are relative to the day/night cycle** (e.g. `duration: 1` means 1 full cycle, `duration: 0.5` means half a cycle).
  - Visuals change: lighting and subtle skybox color reflect time of day.

- **Speed-up**: Available button lets player spend 5 coins to skip to the next day instantly.
  - If the player runs out of coins, the **CTA popup** appears, encouraging download.

##  User Interface

- **HUD (top-left)**: Coin counter, Egg count, Progress meter toward first egg.
- **Build menu (bottom)**: Tabs—Plants, Animals, Buildings—with active options highlighted; others greyed out.
- **Overlay CTA button (top-right)**: Always visible “Download Now” button.
- **Tutorial cues**: Text bubbles and arrows highlight:
  - Where to plant.
  - Where to build a fence.
  - Where to place a chicken.
  - Where to collect.

##  Tutorial Flow

1. **Intro screen**: Lightly animated arrow points to “Flowers” in the Plants tab + bubble: *“Plant flowers to earn coins!”*
2. After planting a flower:
   - Arrow shifts to the yard grid.
   - Bubble: *“Tap here to plant.”*
3. Flower harvest triggers:
   - Bubble: *“Nice! You earned coins.”*
4. Then:
   - Arrow to Building tab → select Fence.
   - Bubble: *“Build a fence to raise chickens.”*
5. Next:
   - Arrow to Animals tab → Chicken (enabled inside fence).
   - Bubble: *“Place a chicken inside the fence.”*
6. On chicken egg production:
   - Floating egg icon appears → bubble: *“Tap to collect eggs!”*
   - Popup CTA appears with message: **“Your first egg! Download the full game to build your farm!”**
     + Large Download button covers center.

##  End Condition

- On collecting the *first egg*, trigger a **popup overlay**:
  > You’ve got eggs! Tap below to download the full version and keep building.
  >
  >        [ Download GardenMakeover Now ]

- The **persistent mini-CTA** remains tappable anytime during play for immediate exit.

##  Technical Notes

### Tech stack used
- Bun
- Vite
- Three.js
### Day/Night transition implemented via:
- **Directional light** intensity and color.
- **Ambient light** adjustments.
- Optional basic skybox swap (e.g., gradient textures).


