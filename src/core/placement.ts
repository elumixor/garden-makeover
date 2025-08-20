import * as THREE from "three";

type FactoryFn = () => THREE.Object3D;

export class PlacementSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private domElement: HTMLElement;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private selectedFactory: FactoryFn | null = null;
  private placed: THREE.Object3D[] = [];

  constructor(scene: THREE.Scene, camera: THREE.Camera, dom: HTMLElement) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = dom;
    this.domElement.addEventListener("click", (e) => this.onClick(e));
  }

  setSelectedFactory(factory: FactoryFn | null) {
    this.selectedFactory = factory;
  }

  undo() {
    const obj = this.placed.pop();
    if (obj) this.scene.remove(obj);
  }

  clear() {
    this.placed.forEach((o) => this.scene.remove(o));
    this.placed = [];
  }

  private onClick(event: MouseEvent) {
    if (!this.selectedFactory) return;
    const rect = this.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    if (intersects.length > 0) {
      const groundHit = intersects[0].point;
      const obj = this.selectedFactory();
      obj.position.copy(groundHit);
      obj.position.y = 0;
      this.scene.add(obj);
      this.placed.push(obj);
    }
  }
}
