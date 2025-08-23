import { ItemManager } from "item-manager";
import { customElement, di } from "utils";
import { BuildMenu } from "./build-menu";
import { DayNightWidget } from "./day-night-widget";
import { PopupOverlay } from "./popup-overlay";
import { ProgressPanel } from "./progress-panel";
import { ResourcesPanel } from "./resources-panel";

@customElement()
export class UI extends HTMLElement {
  private readonly itemManager = di.inject(ItemManager);

  constructor() {
    super();

    // Child custom elements
    this.appendChild(new ResourcesPanel());
    this.appendChild(new BuildMenu());
    const popupOverlay = this.appendChild(new PopupOverlay());
    this.appendChild(new DayNightWidget());
    this.appendChild(new ProgressPanel());

    this.itemManager.goalReached.subscribe(() => popupOverlay.show("eggs"));
    this.itemManager.moneyDepleted.subscribe(() => popupOverlay.show("money"));
  }
}
