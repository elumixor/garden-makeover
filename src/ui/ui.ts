import { playClick } from "core";
import { ItemManager } from "items";
import { di } from "utils";
import { BuildMenu } from "./build-menu";
import { DayNightWidget } from "./day-night-widget";
import { PopupOverlay } from "./popup-overlay";
import { ProgressPanel } from "./progress-panel";
import { ResourcesPanel } from "./resources-panel";
import { TutorialOverlay } from "./tutorial-overlay";

export class UI {
  private readonly itemManager = di.inject(ItemManager);

  private readonly resourcesPanel = new ResourcesPanel();
  private readonly buildMenu = new BuildMenu();
  private readonly popupOverlay = new PopupOverlay();
  private readonly tutorialOverlay = new TutorialOverlay();
  private readonly dayNightWidget = new DayNightWidget();
  private readonly progressPanel = new ProgressPanel();

  constructor() {
    this.itemManager.goalReached.subscribe(() => this.popupOverlay.show("eggs"));
    this.itemManager.moneyDepleted.subscribe(() => this.popupOverlay.show("money"));
  }

  hidePopupCTA() {
    playClick();
    this.popupOverlay.hide();
  }

  showTutorialBubble({ x, y, text }: { x: number; y: number; text: string }) {
    playClick();
    this.tutorialOverlay.showBubble({ x, y, text });
  }

  hideTutorialBubble() {
    playClick();
    this.tutorialOverlay.hideBubble();
  }

  render() {
    this.dayNightWidget.render();
  }
}
