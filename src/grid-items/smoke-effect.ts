import { Assets, Time } from "core";
import { Group, Sprite } from "three";
import { di } from "utils";

export class SmokeEffect extends Group {
  private readonly time = di.inject(Time);
  private readonly resources = di.inject(Assets);

  constructor() {
    super();

    const count = 3;
    const { smokeMaterial } = this.resources;
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite(smokeMaterial);

      // Randomize position around the model
      sprite.position.x += (Math.random() - 0.5) * 1.5;
      sprite.position.y += Math.random() * 1.5 + 0.5;
      sprite.position.z += (Math.random() - 0.5) * 1.5;
      sprite.scale.set(1.2, 1.2, 1.2);
      this.add(sprite);

      // Animate: fade out and move up
      let elapsed = 0;
      const duration = 0.6 + Math.random() * 0.3;
      const startY = sprite.position.y;

      const subscription = this.time.subscribe(({ fixedDeltaTime }) => {
        elapsed += fixedDeltaTime;
        const t = Math.min(1, elapsed / duration);
        sprite.material.opacity = 0.8 * (1 - t);
        sprite.position.y = startY + t * 1.5;
        sprite.scale.setScalar(1.2 + t * 0.8);
        if (t >= 1) {
          this.removeFromParent();
          subscription.unsubscribe();
        }
      });
    }
  }
}
