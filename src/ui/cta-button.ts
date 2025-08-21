import { openStore } from "utils";

export class CTAButton {
  private readonly btn = document.createElement("button");

  constructor() {
    this.btn.className = "cta-btn";
    this.btn.textContent = "Download GardenMakeover";
    this.btn.onclick = () => openStore("https://your-download-link.com");
    document.body.appendChild(this.btn);
  }
}
