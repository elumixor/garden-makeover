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

- **Strawberry**
  - Cost: 1 coin.
  - Grows in 3 stages, each stage = 1 day/night cycle.
  - Yield: 3 strawberries → automatically converted to 15 coins.

- **Corn**
  - Cost: 2 coins.
  - Grows in 3 stages, each stage = 1 day/night cycle.
  - Yield: 5 corns → converted to coins.

- **Chicken**
  - Must be inside a fence.
  - Cost: 2 coins.
  - Consumes 1 corn per day; if unfed, disappears.
  - Lays 1 egg per day. Eggs accumulate if not collected.

- **Fence**
  - One present by default.
  - Additional cost: 5 coins.
  - Each fence supports up to 5 chickens.

> All other plants, animals, and buildings are **visible but greyed out**, acting as teasers.


### Time & Speed-Up

- **Fixed cycle**: 5s day → 5s night (**10s total per cycle by default**).
  - Growth, feeding, and egg-laying happen every cycle.
  - Visuals change: lighting and subtle skybox color reflect time of day.

- **Speed-up**: Button lets player spend 5 coins to skip to the next day instantly.
  - If the player runs out of coins, the **CTA popup** should appear.


##  User Interface

- **HUD (top-left)**: Coin counter, Egg count, Progress meter toward 100 eggs.
- **Build menu (bottom)**: Tabs—Plants, Animals, Buildings—with active options highlighted; others greyed out.
- **Overlay CTA button (top-right)**: Always visible “Download Now” button.
- **Tutorial cues**: Text bubbles and arrows highlight:
  - Where to plant.
  - Where to build a fence.
  - Where to place a chicken.
  - Where to collect.


##  Tutorial Flow

1. **Intro screen**: Animated arrow points to “Strawberry” in the Plants tab + bubble: *“Plant strawberries to earn coins!”*
2. After planting a strawberry:
  - Arrow shifts to the yard grid.
  - Bubble: *“Tap here to plant.”*
3. Strawberry harvest triggers:
  - Bubble: *“Nice! You earned coins.”*
4. Then:
  - Arrow to Building tab → select Fence.
  - Bubble: *“Build a fence to raise chickens.”*
5. Next:
  - Arrow to Animals tab → Chicken (enabled inside fence).
  - Bubble: *“Place a chicken inside the fence.”*
6. On chicken egg production:
  - Floating egg icon appears → bubble: *“Tap to collect eggs!”*


##  End Condition

- On collecting 100 eggs, trigger a **popup overlay**:
  > You’ve got 100 eggs! Tap below to download the full version and keep building.
  >
  >        [ Download GardenMakeover Now ]

- The **persistent mini-CTA** remains tappable anytime during play for immediate exit.


##  Technical Notes

###  Responsivity & Scaling

- Playable area should scale responsively to fit the window.
- Use orthographic camera for consistent scaling.

### Tech stack used
- Bun
- Vite
- Three.js

### Day/Night transition implemented via:
- **Directional light** intensity and color.
- **Ambient light** adjustments.


