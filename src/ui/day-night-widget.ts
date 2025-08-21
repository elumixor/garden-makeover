import { Time } from "core";
import { createSVG, di, EventEmitter } from "utils";

export class DayNightWidget {
  readonly speedUp = new EventEmitter();

  private readonly size = 56;
  private readonly center = this.size / 2;
  private readonly radius = 20;
  private readonly sunRadius = 10;
  private readonly bgRadius = this.center - 2;

  private readonly time = di.inject(Time);
  private readonly root = document.createElement("button");

  private readonly svg = createSVG();
  private readonly sun = createSVG("circle");
  private readonly fast = document.createElement("span");

  constructor() {
    this.root.className = "day-night-widget";
    this.root.title = "Speed up to next day";

    this.svg.setAttribute("width", this.size.toString());
    this.svg.setAttribute("height", this.size.toString());
    this.svg.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`);

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

    this.fast.className = "day-night-fast";
    this.fast.innerText = "⏩";

    this.root.appendChild(this.svg);
    this.root.appendChild(this.fast);

    document.body.appendChild(this.root);
    this.root.onclick = () => this.time.speedUp();

    this.render();
  }

  render() {
    const { phase } = this.time;
    const angle = phase * 2 * Math.PI - Math.PI / 2;
    const cx = this.center;
    const cy = this.center;
    const r = this.radius;

    // Sun position (full circle)
    const sunX = cx + r * Math.cos(angle);
    const sunY = cy + r * Math.sin(angle);

    // Sun color: yellow at day, pale at night
    // t: 0 at day (phase 0), 1 at night (phase 0.5)
    const t = Math.abs(Math.sin(phase * Math.PI));
    // Day: #fff700, Night: #ffeebb (pale moon-like)
    const sunColor = this.lerpColor("#fff700", "#ffeebb", t);

    this.sun.setAttribute("cx", sunX.toString());
    this.sun.setAttribute("cy", sunY.toString());
    this.sun.setAttribute("fill", sunColor);
    this.sun.setAttribute("stroke", t > 0.5 ? "#d9d9d9" : "#e9c900");
  }

  // Simple hex color lerp
  private lerpColor(a: string, b: string, t: number): string {
    const ah = a.startsWith("#") ? a.slice(1) : a;
    const bh = b.startsWith("#") ? b.slice(1) : b;
    const av = [parseInt(ah.substring(0, 2), 16), parseInt(ah.substring(2, 4), 16), parseInt(ah.substring(4, 6), 16)];
    const bv = [parseInt(bh.substring(0, 2), 16), parseInt(bh.substring(2, 4), 16), parseInt(bh.substring(4, 6), 16)];
    const rv = av.map((v, i) => Math.round(v + (bv[i] - v) * t));
    return `#${rv.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
  }
}
