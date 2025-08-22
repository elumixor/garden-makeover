import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  OrthographicCamera,
  Plane,
  Raycaster,
  Scene as TScene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { di } from "utils";
import { Grid } from "./grid";
import { Resources } from "./resources";
import { ItemManager } from "items";
import { Time } from "./time";

@di.injectable
export class Scene {
  public readonly scene = new TScene();
  public readonly camera = new OrthographicCamera();
  public readonly renderer = new WebGLRenderer({ antialias: true });
  public readonly raycaster = new Raycaster();
  private readonly resources = di.inject(Resources);

  private readonly grid = new Grid(this.scene);

  private readonly itemManager = di.inject(ItemManager);

  private lastGridCoordinates?: Vector2;

  private readonly time = di.inject(Time);
  private readonly directionalLight = new DirectionalLight(0xffffff, 3);
  private readonly ambientLight = new AmbientLight(0xffffff, 0.2);

  private readonly fogDay = new Color(0xffaf8f);
  private readonly fogNight = new Color(0x222a3a);
  private readonly bgDay = new Color(0xaaaf8f);
  private readonly bgNight = new Color(0x1a1e2a);

  constructor() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // Increase render quality
    document.body.appendChild(this.renderer.domElement);

    // Set up camera
    this.camera.position.set(-20, 20, 15);
    this.camera.lookAt(5, 0, -5);

    // Set up basic lighting
    this.directionalLight.position.set(5, 10, 7.5);
    this.scene.add(this.directionalLight);

    // Ambient light to soften shadows
    this.scene.add(this.ambientLight);

    // Add fog
    this.scene.background = this.bgDay.clone();
    this.scene.fog = new Fog(this.fogDay.clone(), 45, 65);

    // Add ground
    const field = this.resources.instantiate("field");
    this.scene.add(field);
    field.position.y = -4.25;

    // Mouse move projection setup
    const plane = new Plane(new Vector3(0, 1, 0), 0);

    this.renderer.domElement.addEventListener("mousemove", (event) => {
      const gridCoords = this.mouseToGrid(event, this.raycaster, plane);
      this.grid.highlight = gridCoords;
      this.lastGridCoordinates = gridCoords;
    });

    // Place item on click
    this.renderer.domElement.addEventListener("click", () => {
      if (!this.lastGridCoordinates) return;
      const selectedItem = this.itemManager.selectedItem;
      this.grid.addItem(selectedItem, this.lastGridCoordinates);
    });

    // Update camera on window resize
    window.addEventListener("resize", () => {
      this.updateCamera();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    this.updateCamera();
  }

  // Update camera bounds and projection
  private updateCamera() {
    const requiredWidth = 20;
    const requiredHeight = 32;

    const { innerHeight, innerWidth } = window;

    const scale = Math.max(requiredHeight / innerHeight, requiredWidth / innerWidth);

    const viewWidth = innerWidth * scale;
    const viewHeight = innerHeight * scale;

    this.camera.left = -viewWidth / 2;
    this.camera.right = viewWidth / 2;
    this.camera.top = viewHeight / 2;
    this.camera.bottom = -viewHeight / 2;
    this.camera.near = -100;
    this.camera.far = 100;

    this.camera.updateProjectionMatrix();
  }

  private mouseToGrid({ clientX, clientY }: MouseEvent, raycaster: Raycaster, plane: Plane) {
    const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
    const ndcX = ((clientX - left) / width) * 2 - 1;
    const ndcY = -((clientY - top) / height) * 2 + 1;

    raycaster.setFromCamera(new Vector2(ndcX, ndcY), this.camera);

    const intersection = new Vector3();
    if (raycaster.ray.intersectPlane(plane, intersection)) return this.grid.toGrid(intersection);

    return undefined;
  }

  render() {
    this.setDayNightPhase(this.time.phase);
    this.renderer.render(this.scene, this.camera);
  }

  private setDayNightPhase(phase: number) {
    // phase: 0..1, 0=day, 0.5=night, 1=day
    const t = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2); // 0..1..0

    // Fog and background
    (this.scene.fog as Fog).color.lerpColors(this.fogDay, this.fogNight, t);
    (this.scene.background as Color).lerpColors(this.bgDay, this.bgNight, t);

    // Directional light color/intensity
    this.directionalLight.intensity = 6 * (1 - t) + 3 * t;
    this.directionalLight.color.lerpColors(new Color(0xffafaf), new Color(0x6a7bff), t);

    // Ambient light
    this.ambientLight.intensity = 2;
    this.ambientLight.color.lerpColors(new Color(0xffffff), new Color(0x7a7aff), t);

    // Sun/moon moves in a circle overhead
    // Angle: 0 = sunrise, PI = sunset, 2PI = next sunrise
    const sunAngle = phase * 2 * Math.PI - Math.PI / 2;
    const sunRadius = 30;
    // Sun rises in east (x>0), sets in west (x<0), high at noon (y>0), low at night (y<0)
    const sunX = Math.cos(sunAngle) * sunRadius;
    const sunY = Math.sin(sunAngle) * sunRadius;
    const sunZ = 7.5; // keep some z for nice shadow

    this.directionalLight.position.set(sunX, sunY, sunZ);
    this.directionalLight.target.position.set(0, 0, 0);
    this.directionalLight.target.updateMatrixWorld();
  }
}
