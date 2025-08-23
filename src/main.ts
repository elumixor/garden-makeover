import { Resources, Scene, Time, playBackgroundMusic } from "core";
import { ItemManager } from "items";
import { UI } from "ui";
import "./styles.scss";

export class Game {
  private readonly resources = new Resources();
  private readonly time = new Time();
  private readonly itemManager = new ItemManager();
  private readonly ui = new UI();
  private scene?: Scene;

  async start() {
    await this.resources.load();
    this.scene = new Scene();
    this.time.start();
    playBackgroundMusic();
  }
}

void new Game().start();
