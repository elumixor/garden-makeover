import { playClick, playWinSound } from "core";
import { customElement, openStore } from "utils";
import styles from "./popup-overlay.module.scss";

@customElement()
export class PopupOverlay extends HTMLElement {
  private readonly contentDiv = this.addElement("div", { className: styles["popup-content"] });

  private readonly iconEl = this.contentDiv.addElement("img", {
    className: styles["popup-egg-img"],
    attrs: { src: "images/egg.png", alt: "Egg" },
  });

  private readonly titleEl = this.contentDiv.addElement("div", { className: styles["popup-title"] });
  private readonly descEl = this.contentDiv.addElement("div", { className: styles["popup-desc"] });

  private readonly downloadBtn = this.contentDiv.addElement("button", {
    className: styles["popup-download-btn"],
    attrs: { id: "popup-download-btn" },
  });

  private readonly btnIcon = this.downloadBtn.addElement("img", {
    className: styles["popup-btn-icon"],
    attrs: { src: "icon.png", alt: "Game Icon" },
  });

  private readonly btnTexts = this.downloadBtn.addElement("div", { className: styles["popup-btn-texts"] });
  private readonly btnTitle = this.btnTexts.addElement("div", {
    className: styles["popup-btn-title"],
    text: "Garden Makeover",
  });

  private readonly btnSub = this.btnTexts.addElement("div", {
    className: styles["popup-btn-sub"],
    text: "Download Now",
  });

  constructor() {
    super();
    this.className = styles["popup-overlay"];
    this.style.display = "none";

    this.downloadBtn.addEventListener("pointerdown", () => {
      playClick();
      openStore("https://your-download-link.com");
    });
  }

  show(reason: "eggs" | "money" = "eggs") {
    playWinSound();
    const eggs = reason === "eggs";
    this.iconEl.src = eggs ? "images/egg.png" : "images/money.png";
    this.iconEl.alt = eggs ? "Egg" : "Money";
    this.titleEl.textContent = eggs ? "Eggs are hatching in your garden!" : "You're out of money!";
    this.descEl.textContent = eggs
      ? "Unlock the full adventure and discover what's inside. Don't let the magic stop here!"
      : "You have no money left and nothing in your garden can earn more. Download the full game to continue your adventure!";

    this.style.display = "flex";
    this.classList.add(styles["popup-visible"]);
  }
}
