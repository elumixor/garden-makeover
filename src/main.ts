import { Assets, GameScene, Time, playBackgroundMusic } from "core";
import { Grid } from "grid";
import { ItemManager } from "item-manager";
import { TutorialManager } from "tutorial";
import { UI } from "ui";
import "./styles/global.scss";

async function start() {
  // First, load all resources
  await new Assets().load();

  // Create services
  const time = new Time();
  new ItemManager();

  // Create the scene and UI
  const scene = new GameScene();
  scene.scene.add(new Grid());

  // Root UI element (custom element registered by import)
  document.body.appendChild(new UI());

  // Start time and render loops, start music
  time.start();
  playBackgroundMusic();

  // Begin tutorial
  void new TutorialManager().showNextStep();
}

void start();
