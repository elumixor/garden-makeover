import { Clock } from "three";
import { di } from "utils";

interface IUpdateParams {
  deltaTime: number;
  fixedDeltaTime: number;
}

@di.injectable
export class Time {
  readonly cycleDuration = 5; // seconds for full day/night cycle
  private readonly cycleDurationFast = 0.2; // seconds of fast-forward
  private readonly clock = new Clock();
  private readonly updateCallbacks: ((params: IUpdateParams) => void)[] = [];
  private scheduleCallbacks: { callback(): void; triggerAt: number }[] = [];
  private time = 0;
  private speedupTimer = 0;
  paused = false;

  /** Returns 0..1, 0=day, 0.5=night, 1=day */
  get phase() {
    return (this.time / this.cycleDuration) % 1;
  }

  private get speed() {
    return this.speedupTimer > 0 ? this.cycleDuration / this.cycleDurationFast : 1;
  }

  subscribe(callback: (params: IUpdateParams) => void) {
    this.updateCallbacks.push(callback);
    return { unsubscribe: () => this.updateCallbacks.remove(callback) };
  }

  schedule(callback: () => void, delay: number) {
    const event = { callback, triggerAt: this.time + delay };
    this.scheduleCallbacks.push(event);
    return { unsubscribe: () => this.scheduleCallbacks.remove(event) };
  }

  /** Starts the time, render loop */
  readonly start = () => {
    window.requestAnimationFrame(this.start); // schedule next frame
    const fixedDeltaTime = this.clock.getDelta(); // seconds since last frame

    if (this.paused) return;

    // Check for speedup
    const { speedupTimer, speed } = this;
    if (speedupTimer > 0) {
      this.speedupTimer -= fixedDeltaTime;
      if (this.speedupTimer <= 0) this.speedupTimer = 0;
    }

    // Update current time
    const deltaTime = fixedDeltaTime * speed;
    this.time += deltaTime;
    const updateParams = { deltaTime, fixedDeltaTime: fixedDeltaTime };

    // Trigger events

    // Collect due events
    const due = this.scheduleCallbacks.filter((e) => this.time >= e.triggerAt);

    // Keep only future events
    this.scheduleCallbacks = this.scheduleCallbacks.filter((e) => this.time < e.triggerAt);

    // Call all due events (new events scheduled inside callbacks will not be lost)
    for (const e of due) e.callback();

    // Call update callbacks
    for (const updateCallback of this.updateCallbacks) updateCallback(updateParams);
  };

  /** Fast-forwards the current day-night cycle */
  fastForward() {
    this.speedupTimer = this.cycleDurationFast;
  }
}
