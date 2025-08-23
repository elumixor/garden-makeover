import { Camera, type Intersection, Object3D, Raycaster, Vector2, WebGLRenderer } from "three";
import { di } from "./di";

export type ClickCallback = (event: PointerEvent, intersection: Intersection) => void;

@di.injectable
export class Interactivity {
  private readonly raycaster = new Raycaster();
  private listeners: { object: Object3D; callback: ClickCallback }[] = [];

  constructor(
    private readonly renderer: WebGLRenderer,
    private readonly camera: Camera,
  ) {}

  listen() {
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
  }

  on(object: Object3D, callback: ClickCallback) {
    this.listeners.push({ object, callback });
    return { unsubscribe: () => this.off(object, callback) };
  }

  off(object: Object3D, callback?: ClickCallback) {
    if (!callback) this.listeners = this.listeners.filter((l) => l.object !== object);
    else this.listeners = this.listeners.filter((l) => l.object !== object || l.callback !== callback);
  }

  private readonly onPointerDown = (event: PointerEvent) => {
    const { left, top, width, height } = this.renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 2 - 1;
    const y = -((event.clientY - top) / height) * 2 + 1;

    this.raycaster.setFromCamera(new Vector2(x, y), this.camera);

    // Check all registered objects for intersection
    const objects = this.listeners.map((l) => l.object);
    const { first } = this.raycaster.intersectObjects(objects, false);

    if (first) {
      // Find the first listener whose object matches
      const listener = this.listeners.find((l) => l.object === first.object);
      if (listener) listener.callback(event, first);
    }
  };
}
