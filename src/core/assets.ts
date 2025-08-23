import { AnimationClip, Mesh, Object3D, SpriteMaterial, TextureLoader } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { di } from "utils";

export type ModelName =
  | "field"
  | "ground"
  | "placeholder"
  | `${"grape" | "strawberry" | "tomato" | "corn"}_${1 | 2 | 3}`
  | "fence"
  | "barn" // we don't have a barn model yet, but it's here for future use
  | `${"chicken" | "cow" | "sheep"}_1`;

const images = ["strawberry", "egg", "corn", "grape", "tomato", "money"] as const;

@di.injectable
export class Assets {
  readonly images = new Map<(typeof images)[number], HTMLImageElement>();
  readonly animations = new Map<string, AnimationClip>();
  readonly models = new Map<ModelName, Object3D>();

  private _smokeMaterial?: SpriteMaterial; // cache for smoke material

  async load() {
    const loader = new GLTFLoader();
    const textureLoader = new TextureLoader();
    const [field, children, smokeTexture] = await Promise.all([
      loader.loadAsync("models/ground.glb"),
      loader.loadAsync("models/objects.glb"),
      textureLoader.loadAsync("images/smoke.png"),
      this.preloadImages(),
    ]);

    this._smokeMaterial = new SpriteMaterial({ map: smokeTexture, transparent: true, opacity: 0.8 });

    field.scene.traverse(this.setupMesh);
    field.scene.position.set(0, 0, 0);

    const {
      scene: { children: objects },
    } = children;

    for (const child of objects) {
      child.traverse(this.setupMesh);
      child.position.set(0, 0, 0);
    }

    this.models.set("field", field.scene);

    for (const object of objects) this.models.set(object.name as ModelName, object);
    for (const animation of children.animations) this.animations.set(animation.name, animation);
  }

  get smokeMaterial() {
    if (!this._smokeMaterial) throw new Error("Resources not loaded yet");
    return this._smokeMaterial;
  }

  instantiate(name: ModelName) {
    const model = this.models.get(name);
    if (!model) throw new Error(`Model "${name}" not found`);
    return SkeletonUtils.clone(model);
  }

  private async preloadImages() {
    await Promise.all(
      images.map(
        (name) =>
          new Promise<void>((resolve) => {
            const img = new window.Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = `images/${name}.png`;
            this.images.set(name, img);
          }),
      ),
    );
  }

  private readonly setupMesh = (model: Object3D) => {
    if ((model as Mesh).isMesh) {
      model.castShadow = true;
      model.receiveShadow = true;
    }
  };
}
