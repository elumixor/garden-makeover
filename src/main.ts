import "./styles.scss";
import { Scene, Resources, Time, playBackgroundMusic } from "core";
import { ItemManager } from "items";
import { UI } from "ui";

export class Game {
  private readonly resources = new Resources();
  private readonly time = new Time();
  private readonly itemManager = new ItemManager();

  private scene?: Scene;
  private readonly ui = new UI();

  async start() {
    await this.resources.load();

    this.scene = new Scene();
    this.loop();
    playBackgroundMusic();
  }

  private readonly loop = () => {
    requestAnimationFrame(this.loop);
    const dt = 1 / 60; // fixed timestep
    this.time.update(dt);
    this.scene?.render();
    this.ui.render();
  };
}

void new Game().start();
