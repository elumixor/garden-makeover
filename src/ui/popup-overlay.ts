import { playClick, playWinSound } from "core";
import { openStore } from "utils";
import styles from "./popup-overlay.module.scss";

export class PopupOverlay {
  readonly root = document.createElement("div");
  private readonly contentDiv = document.createElement("div");
  private readonly iconEl = document.createElement("img");
  private readonly titleEl = document.createElement("div");
  private readonly descEl = document.createElement("div");
  private readonly downloadBtn = document.createElement("button");
  private readonly btnIcon = document.createElement("img");
  private readonly btnTexts = document.createElement("div");
  private readonly btnTitle = document.createElement("div");
  private readonly btnSub = document.createElement("div");

  constructor() {
    this.root.className = styles["popup-overlay"];
    this.root.style.display = "none";

    this.contentDiv.className = styles["popup-content"];

    this.iconEl.className = styles["popup-egg-img"];
    this.iconEl.src = "images/egg.png";
    this.iconEl.alt = "Egg";

    this.titleEl.className = styles["popup-title"];
    this.titleEl.textContent = "Eggs are hatching in your garden!";

    this.descEl.className = styles["popup-desc"];
    this.descEl.textContent = "Unlock the full adventure and discover what’s inside. Don’t let the magic stop here!";

    this.downloadBtn.id = "popup-download-btn";
    this.downloadBtn.className = styles["popup-download-btn"];

    this.btnIcon.src = "icon.png";
    this.btnIcon.className = styles["popup-btn-icon"];
    this.btnIcon.alt = "Game Icon";

    this.btnTexts.className = styles["popup-btn-texts"];
    this.btnTitle.className = styles["popup-btn-title"];
    this.btnTitle.textContent = "Garden Makeover";
    this.btnSub.className = styles["popup-btn-sub"];
    this.btnSub.textContent = "Download Now";

    this.btnTexts.appendChild(this.btnTitle);
    this.btnTexts.appendChild(this.btnSub);
    this.downloadBtn.appendChild(this.btnIcon);
    this.downloadBtn.appendChild(this.btnTexts);

    this.contentDiv.appendChild(this.iconEl);
    this.contentDiv.appendChild(this.titleEl);
    this.contentDiv.appendChild(this.descEl);
    this.contentDiv.appendChild(this.downloadBtn);

    this.root.appendChild(this.contentDiv);
    document.body.appendChild(this.root);

    this.downloadBtn.addEventListener("click", () => {
      playClick();
      openStore("https://your-download-link.com");
    });
  }

  show(reason: "eggs" | "money" = "eggs") {
    playWinSound();

    if (reason === "eggs") {
      this.iconEl.src = "images/egg.png";
      this.iconEl.alt = "Egg";
      this.titleEl.textContent = "Eggs are hatching in your garden!";
      this.descEl.textContent = "Unlock the full adventure and discover what’s inside. Don’t let the magic stop here!";
    } else if (reason === "money") {
      this.iconEl.src = "images/money.png";
      this.iconEl.alt = "Money";
      this.titleEl.textContent = "You're out of money!";
      this.descEl.textContent =
        "You have no money left and nothing in your garden can earn more. Download the full game to continue your adventure!";
    }

    this.root.style.display = "flex";
    this.root.classList.add(styles["popup-visible"]);
  }

  hide() {
    this.root.classList.remove(styles["popup-visible"]);
    setTimeout(() => {
      this.root.style.display = "none";
    }, 320);
  }
}
