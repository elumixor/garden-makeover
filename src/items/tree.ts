import * as THREE from "three";

export function createTree(): THREE.Object3D {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2),
    new THREE.MeshLambertMaterial({ color: 0x8b5a2b })
  );
  trunk.position.y = 1;
  trunk.castShadow = true;
  group.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 16, 16),
    new THREE.MeshLambertMaterial({ color: 0x228b22 })
  );
  crown.position.y = 2.5;
  crown.castShadow = true;
  group.add(crown);

  return group;
}
