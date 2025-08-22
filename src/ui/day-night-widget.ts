import { playClick, Time } from "core";
import { createSVG, di, lerpColor } from "utils";
import styles from "./day-night-widget.module.scss";

export class DayNightWidget {
  // Add padding to SVG
  private readonly size = 54;
  private readonly padding = 6; // px of inner padding
  private readonly viewBoxSize = this.size + this.padding * 2;
  private readonly center = this.viewBoxSize / 2;
  private readonly radius = 20;
  private readonly sunRadius = 10;
  private readonly bgRadius = this.radius + 2;

  private readonly time = di.inject(Time);
  private readonly root = document.createElement("button");

  private readonly svg = createSVG();
  private readonly sun = createSVG("circle");
  private readonly skipImg = document.createElement("img");

  constructor() {
    this.root.className = styles.dayNightWidget;
    this.root.title = "Speed up to next day";

    // Set SVG size and viewBox with padding
    this.svg.setAttribute("width", this.size.toString());
    this.svg.setAttribute("height", this.size.toString());
    this.svg.setAttribute("viewBox", `0 0 ${this.viewBoxSize} ${this.viewBoxSize}`);
    this.svg.classList.add(styles.dayNightWidgetSvg);

    const bg = createSVG();
    bg.setAttribute("cx", this.center.toString());
    bg.setAttribute("cy", this.center.toString());
    bg.setAttribute("r", this.bgRadius.toString());
    bg.setAttribute("fill", "#e3eaf7");
    bg.setAttribute("stroke", "#bcd");
    bg.setAttribute("stroke-width", "2");
    this.svg.appendChild(bg);

    this.sun.setAttribute("r", this.sunRadius.toString());
    this.sun.setAttribute("stroke", "#e9c900");
    this.sun.setAttribute("stroke-width", "2");
    this.svg.appendChild(this.sun);

    this.skipImg.src = "images/skip_day.png";
    this.skipImg.alt = "Skip Day";
    this.skipImg.className = styles.dayNightSkip;

    this.root.appendChild(this.svg);
    this.root.appendChild(this.skipImg);

    document.body.appendChild(this.root);
    this.root.onclick = () => {
      playClick();
      this.time.speedUp();
    };

    this.render();
  }

  render() {
    const { phase } = this.time;
    const angle = phase * 2 * Math.PI - Math.PI / 2;
    const cx = this.center;
    const cy = this.center;
    const r = this.radius;

    // Sun position (full circle, centered in padded viewBox)
    const sunX = cx + r * Math.cos(angle);
    const sunY = cy + r * Math.sin(angle);

    // Sun color: yellow at day, pale at night
    // t: 0 at day (phase 0), 1 at night (phase 0.5)
    const t = Math.abs(Math.sin(phase * Math.PI));
    const sunColor = lerpColor("#fff700", "#bbddff", t);
    const strokeColor = lerpColor("#e9c900", "#758ba2", t);

    this.sun.setAttribute("cx", sunX.toString());
    this.sun.setAttribute("cy", sunY.toString());
    this.sun.setAttribute("fill", sunColor);
    this.sun.setAttribute("stroke", strokeColor);
  }
}
