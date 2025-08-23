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

1. **Intro screen**: Animated arrow points to **Plants tab** (bottom menu), then to “Strawberry” in the Plants tab + bubble: *“Plant strawberries to earn coins!”*
2. After selecting strawberry:
   - Arrow shifts to the yard grid.
   - Bubble: *“Tap here to plant.”*
3. Strawberry harvest triggers:
   - Bubble: *“Nice! You earned coins.”*
4. Then:
   - Arrow to **Plants tab** → select Corn.
   - Bubble: *“Plant corn for your chickens!”*
5. Next:
   - Arrow to yard grid → plant corn.
6. On corn harvest:
   - Bubble: *“Collect your corn!”*
7. Then:
   - Arrow to **Buildings tab** → select Fence.
   - Bubble: *“Build a fence to raise chickens.”*
8. Next:
   - Arrow to **Animals tab** → select Chicken.
   - Bubble: *“Place a chicken inside the fence.”*
9. On chicken placement:
   - Arrow to fence area → place chickens.
10. On egg production:
    - Arrow to skip button → skip days.
11. On egg icon:
    - Bubble: *“Tap to collect eggs!”*
12. Resource management tip:
    - Bubble: *“Chickens eat corn daily. Keep planting to sustain them!”*
13. End of tutorial:
    - Bubble: *“Good luck! You're ready to play.”*


##  End Condition

- On collecting 100 eggs, trigger a **popup overlay**:
  > You’ve got 100 eggs! Tap below to download the full version and keep building.
  >
  >        [ Download GardenMakeover Now ]

- The **persistent mini-CTA** remains tappable anytime during play for immediate exit.


##  Technical Notes

## Tutorial System

The tutorial guides the player through the core gameplay loop step by step, ensuring they understand planting, harvesting, and resource management. The flow is as follows:

1. **Plant Strawberries**:
  - The player is prompted to plant 5 strawberries.
  - UI highlights the strawberry option and planting area.
  - Progress is tracked; the player cannot proceed until all 5 are planted.

2. **Skip Days for Growth**:
  - The player is prompted to use the "Skip Day" button a set number of times to grow the strawberries.
  - UI highlights the skip button.
  - Progresses only after enough days have passed for strawberries to mature.

3. **Harvest Strawberries**:
  - The player is prompted to collect all ripe strawberries.
  - UI highlights the harvestable plants.
  - Progresses after all 5 are collected.

4. **Plant Corn**:
  - The player is prompted to plant 5 corn plants.
  - UI highlights the corn option and planting area.
  - Progresses after all 5 are planted.

5. **Skip Days for Corn Growth**:
  - The player is prompted to skip days again for corn to mature.
  - UI highlights the skip button.

6. **Harvest Corn**:
  - The player is prompted to collect all ripe corn.
  - UI highlights the harvestable plants.

7. **Place Chickens**:
  - The player is prompted to place 5 chickens inside a fence.
  - UI highlights the chicken option and valid placement areas.

8. **Skip Days for Egg Production**:
  - The player is prompted to skip days for chickens to lay eggs.

9. **Collect Eggs**:
  - The player is prompted to collect eggs from chickens.

10. **Resource Management Tips**:
   - The tutorial explains that chickens consume corn daily and will disappear if unfed.
   - Reminds the player to keep planting strawberries and corn to sustain chickens.

11. **End of Tutorial**:
   - A "Good luck!" message is shown, and the player is free to play.


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


