import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

export async function loadAtlas(url: string) {
  const loader = new GLTFLoader();

  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        console.log(gltf.scene.children.map((c) => c.name).join(", "));
        resolve(gltf.scene);
      },
      undefined,
      reject
    );
  });
}
