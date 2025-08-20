import "./styles.css";
import { setupScene } from "./core/scene";
import { setupRenderer } from "./core/renderer";
import { setupCamera } from "./core/camera";
import { setupLighting, toggleDayNight } from "./core/lighting";
import { setupHUD } from "./ui/hud";
import { PlacementSystem } from "./systems/placement";
import { createItemsCatalog } from "./catalog";
import { loadGround } from "./systems/ground-loader";
import { loadAtlas } from "./systems/objects-loader";
import { playBackgroundMusic } from "./systems/audio";

// Basic game bootstrap
const canvasContainer = document.getElementById("app")!;

const { scene } = setupScene();
const { renderer } = setupRenderer(canvasContainer);
const { camera, controls } = setupCamera(canvasContainer);
const { lights, setDayMode } = setupLighting(scene);
const placement = new PlacementSystem(scene, camera, renderer.domElement);
const catalog = createItemsCatalog(scene);

await Promise.all([
  loadGround(scene, "gltf/ground.glb"),
  loadAtlas("gltf/objects.glb"),
]);

// HUD setup
setupHUD({
  onSelect: (factory) => placement.setSelectedFactory(factory),
  onClear: () => placement.clear(),
  onUndo: () => placement.undo(),
  onToggleDayNight: () => toggleDayNight(lights, setDayMode),
  catalog,
});

// Example: start music after first click/tap
window.addEventListener(
  "pointerdown",
  () => {
    if (!import.meta.env.DEV) playBackgroundMusic();
  },
  { once: true }
);

// Animate loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
