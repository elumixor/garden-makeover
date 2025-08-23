import { Resources, Scene, Time, playBackgroundMusic } from "core";
import { ItemManager } from "items";
import { TutorialManager, UI } from "ui";
import "./styles.scss";

async function start() {
  // First, load all resources
  await new Resources().load();

  // Create services
  const time = new Time();
  new ItemManager();

  // Create the scene and UI
  new Scene();
  new UI();

  // Start time and render loops, start music
  time.start();
  playBackgroundMusic();

  // Begin tutorial
  void new TutorialManager().showNextStep();
}

void start();
