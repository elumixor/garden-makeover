import { ItemManager } from "items";
import { di } from "utils";
import { BuildMenu } from "./build-menu";
import { DayNightWidget } from "./day-night-widget";
import { PopupOverlay } from "./popup-overlay";
import { ProgressPanel } from "./progress-panel";
import { ResourcesPanel } from "./resources-panel";

export class UI {
  private readonly itemManager = di.inject(ItemManager);

  constructor() {
    new ResourcesPanel();
    new BuildMenu();
    const popupOverlay = new PopupOverlay();
    new DayNightWidget();
    new ProgressPanel();

    this.itemManager.goalReached.subscribe(() => popupOverlay.show("eggs"));
    this.itemManager.moneyDepleted.subscribe(() => popupOverlay.show("money"));
  }
}
