import { di } from "utils";

interface IScheduledEvent {
  callback(): void;
  triggerAt: number;
}

@di.injectable
export class Time {
  private time = 0;
  private speed = 1;
  private events: IScheduledEvent[] = [];
  readonly cycleDuration = 10; // seconds for full day/night cycle
  private speedupTimer = 0;

  update(dt: number) {
    if (this.speedupTimer > 0) {
      this.speedupTimer -= dt;
      this.time += dt * (this.cycleDuration / 1); // fast-forward: 1s per cycle
      if (this.speedupTimer <= 0) this.speedupTimer = 0;
    } else this.time += dt * this.speed;

    // Collect due events first, then filter out only after all callbacks
    const due: IScheduledEvent[] = [];
    for (const e of this.events) {
      if (this.time >= e.triggerAt) due.push(e);
    }

    // Remove only those that are due
    this.events = this.events.filter((e) => this.time < e.triggerAt);

    // Call all due events (new events scheduled inside callbacks will not be lost)
    for (const e of due) e.callback();
  }

  schedule(callback: () => void, delay: number) {
    this.events.push({ callback, triggerAt: this.time + delay });
  }

  setSpeed(multiplier: number) {
    this.speed = multiplier;
  }

  /** Returns 0..1, 0=day, 0.5=night, 1=day */
  get phase() {
    return (this.time / this.cycleDuration) % 1;
  }

  speedUp() {
    this.speedupTimer = 1; // 1 second of fast-forward
  }
}
