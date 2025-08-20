import * as THREE from "three";
import { createTree, createBench } from "./items";

export type Catalog = {
  [category: string]: { [name: string]: () => THREE.Object3D };
};

export function createItemsCatalog(scene: THREE.Scene): Catalog {
  return {
    Plants: { Tree: createTree },
    Furniture: { Bench: createBench },
  };
}
