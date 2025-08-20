import { type Catalog } from "../catalog";
import type * as THREE from "three";

interface HUDOptions {
  onSelect: (factory: (() => THREE.Object3D) | null) => void;
  onClear: () => void;
  onUndo: () => void;
  onToggleDayNight: () => void;
  catalog: Catalog;
}

export function setupHUD(opts: HUDOptions) {
  const hud = document.createElement("div");
  hud.className = "hud";
  document.body.appendChild(hud);

  // Categories & items
  for (const [category, items] of Object.entries(opts.catalog)) {
    const catDiv = document.createElement("div");
    catDiv.innerText = category;
    hud.appendChild(catDiv);
    for (const [name, factory] of Object.entries(items)) {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.onclick = () => opts.onSelect(factory);
      hud.appendChild(btn);
    }
  }

  // Controls
  const undo = document.createElement("button");
  undo.textContent = "Undo";
  undo.onclick = opts.onUndo;
  hud.appendChild(undo);

  const clear = document.createElement("button");
  clear.textContent = "Clear";
  clear.onclick = opts.onClear;
  hud.appendChild(clear);

  const toggle = document.createElement("button");
  toggle.textContent = "Day/Night";
  toggle.onclick = opts.onToggleDayNight;
  hud.appendChild(toggle);
}
