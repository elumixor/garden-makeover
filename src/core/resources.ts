import { Mesh, Object3D } from "three";
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

@di.injectable
export class Resources {
  private readonly models = new Map<ModelName, Object3D>();

  async load() {
    const loader = new GLTFLoader();

    const [field, children] = await Promise.all([
      loader.loadAsync("models/ground.glb"),
      loader.loadAsync("models/objects.glb"),
    ]);

    field.scene.traverse(setupMesh);
    field.scene.position.set(0, 0, 0);

    const {
      scene: { children: objects },
    } = children;

    for (const child of objects) {
      child.traverse(setupMesh);
      child.position.set(0, 0, 0);
    }

    this.models.set("field", field.scene);
    for (const object of objects) this.models.set(object.name as ModelName, object);
  }

  instantiate(name: ModelName): Object3D {
    const model = this.models.get(name);
    if (!model) throw new Error(`Model "${name}" not found`);
    return SkeletonUtils.clone(model);
  }
}

function setupMesh(model: Object3D) {
  if ((model as Mesh).isMesh) {
    model.castShadow = true;
    model.receiveShadow = true;
  }
}
