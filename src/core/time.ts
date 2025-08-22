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
  readonly cycleDuration = 5; // seconds for full day/night cycle
  private readonly speedupDuration = 0.2; // seconds of fast-forward
  private speedupTimer = 0;

  update(dt: number) {
    if (this.speedupTimer > 0) {
      this.speedupTimer -= dt;
      this.time += dt * (this.cycleDuration / this.speedupDuration);
      if (this.speedupTimer <= 0) this.speedupTimer = 0;
    } else this.time += dt * this.speed;

    // Collect due events
    const due = this.events.filter((e) => this.time >= e.triggerAt);

    // Keep only future events
    this.events = this.events.filter((e) => this.time < e.triggerAt);

    // Call all due events (new events scheduled inside callbacks will not be lost)
    for (const e of due) e.callback();
  }

  schedule(callback: () => void, delay: number) {
    const event: IScheduledEvent = { callback, triggerAt: this.time + delay };
    this.events.push(event);
    // Return a cancel function
    return () => {
      const idx = this.events.indexOf(event);
      if (idx !== -1) this.events.splice(idx, 1);
    };
  }

  setSpeed(multiplier: number) {
    this.speed = multiplier;
  }

  /** Returns 0..1, 0=day, 0.5=night, 1=day */
  get phase() {
    return (this.time / this.cycleDuration) % 1;
  }

  speedUp() {
    this.speedupTimer = this.speedupDuration;
  }
}
