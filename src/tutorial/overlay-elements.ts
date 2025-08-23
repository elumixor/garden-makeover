import styles from "./tutorial-overlay.module.scss";

/** Handles creation of DOM elements for the tutorial overlay. */
export class OverlayElements {
  readonly overlay = document.createElement("div");
  readonly holeCircle = document.createElement("div");
  readonly text = document.createElement("div");
  readonly centerText = document.createElement("div");
  readonly centerImage = document.createElement("img");

  constructor() {
    this.overlay.className = styles.tutorialOverlay;
    this.holeCircle.className = styles.tutorialOverlayHoleCircle;
    this.text.className = styles.tutorialOverlayText;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.holeCircle);
    document.body.appendChild(this.text);

    // Center text elements
    this.centerText.className = `${styles.tutorialOverlayText} ${styles.tutorialOverlayCenterText}`;
    this.centerImage.src = "images/skip_day.png";
    this.centerImage.className = styles.tutorialOverlayCenterImage;

    this.centerImage.tabIndex = 0;
    this.centerText.appendChild(this.centerImage);
    document.body.appendChild(this.centerText);
  }
}
