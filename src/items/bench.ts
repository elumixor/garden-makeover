import * as THREE from "three";

export function createBench(): THREE.Object3D {
  const group = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.2, 0.6),
    new THREE.MeshLambertMaterial({ color: 0x654321 })
  );
  seat.position.y = 0.4;
  group.add(seat);

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x654321 })
  );
  back.position.y = 1;
  back.position.z = -0.2;
  group.add(back);

  return group;
}
