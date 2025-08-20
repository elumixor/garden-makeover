import * as THREE from "three";

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaadfff);
  scene.fog = new THREE.Fog(0xaadfff, 30, 120);

  // Simple ground
  const groundMat = new THREE.MeshLambertMaterial({ color: 0x55aa55 });
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  return { scene };
}
