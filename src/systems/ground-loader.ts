import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

export async function loadGround(scene: THREE.Scene, url: string) {
  const loader = new GLTFLoader();

  return new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const ground = gltf.scene;
        ground.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(ground);
        resolve(ground);
      },
      undefined,
      reject
    );
  });
}
