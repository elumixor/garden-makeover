import { AmbientLight, Color, DirectionalLight, Fog, OrthographicCamera, Scene, WebGLRenderer } from "three";
import { di, Interactivity } from "utils";
import { Assets } from "./assets";
import { Time } from "./time";

@di.injectable
export class GameScene {
  readonly scene = new Scene();
  readonly camera = new OrthographicCamera();
  readonly renderer = new WebGLRenderer({ antialias: true });

  private readonly interactivity = new Interactivity(this.renderer, this.camera);
  private readonly resources = di.inject(Assets);
  private readonly time = di.inject(Time);

  private readonly directionalLight = new DirectionalLight(0xffffff, 3);
  private readonly ambientLight = new AmbientLight(0xffffff, 0.2);
  private readonly fog = new Fog(0xfff, 45, 65);

  constructor() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio); // Increase render quality
    document.body.appendChild(this.renderer.domElement);

    // Set up camera
    this.camera.position.set(-20, 20, 15);
    this.camera.lookAt(5, 0, -4);

    // Set up basic lighting
    this.directionalLight.position.set(5, 10, 7.5);
    this.scene.add(this.directionalLight);

    // Ambient light to soften shadows
    this.scene.add(this.ambientLight);

    // Add fog
    this.scene.fog = this.fog;

    // Add ground
    const field = this.resources.instantiate("field");
    this.scene.add(field);
    field.position.y = -4.25;

    // Update camera on window resize
    window.addEventListener("resize", () => {
      this.updateCamera();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    this.updateCamera();

    // Start the render loop
    this.time.subscribe(this.render.bind(this));

    // Start listening for pointer events
    this.interactivity.listen();
  }

  private render() {
    this.updateDayNightLighting(this.time.phase);
    this.renderer.render(this.scene, this.camera);
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

  private updateDayNightLighting(phase: number) {
    // phase: 0..1, 0=day, 0.5=night, 1=day
    const t = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2); // 0..1..0

    // Fog and background
    this.fog.color = new Color(0xffaf8f).lerp(new Color(0x222a3a), t);
    this.scene.background = new Color(0xaaaf8f).lerp(new Color(0x1a1e2a), t);

    // Directional light color/intensity
    this.directionalLight.intensity = 6 * (1 - t) + 3 * t;
    this.directionalLight.color = new Color(0xffafaf).lerp(new Color(0x6a7bff), t);

    // Ambient light
    this.ambientLight.intensity = 2;
    this.ambientLight.color = new Color(0xffffff).lerp(new Color(0x7a7aff), t);

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
