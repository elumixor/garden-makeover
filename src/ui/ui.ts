import { BuildMenu } from "./build-menu";
import { CTAButton } from "./cta-button";
import { DayNightWidget } from "./day-night-widget";
import { HUD } from "./hud";
import { PopupOverlay } from "./popup-overlay";
import { TutorialOverlay } from "./tutorial-overlay";

export class UI {
  private readonly hud = new HUD();
  private readonly buildMenu = new BuildMenu();
  private readonly ctaBtn = new CTAButton();
  private readonly popupOverlay = new PopupOverlay();
  private readonly tutorialOverlay = new TutorialOverlay();
  private readonly dayNightWidget = new DayNightWidget();

  constructor() {}

  showPopupCTA() {
    this.popupOverlay.show();
  }

  hidePopupCTA() {
    this.popupOverlay.hide();
  }

  showTutorialBubble({ x, y, text }: { x: number; y: number; text: string }) {
    this.tutorialOverlay.showBubble({ x, y, text });
  }

  hideTutorialBubble() {
    this.tutorialOverlay.hideBubble();
  }

  render() {
    this.dayNightWidget.render();
  }
}
