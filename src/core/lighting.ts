import * as THREE from "three";

export function setupLighting(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemi.position.set(0, 200, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(50, 50, -50);
  dir.castShadow = true;
  scene.add(dir);

  let isDay = true;
  const setDayMode = (day: boolean) => {
    isDay = day;
    scene.background = new THREE.Color(day ? 0xaadfff : 0x000022);
    scene.fog = new THREE.Fog(day ? 0xaadfff : 0x000022, 30, 120);
    hemi.intensity = day ? 1 : 0.2;
    dir.intensity = day ? 1 : 0.3;
  };

  return { lights: { hemi, dir }, setDayMode };
}

export function toggleDayNight(
  lights: { hemi: THREE.HemisphereLight; dir: THREE.DirectionalLight },
  setDayMode: (day: boolean) => void
) {
  const isNight = lights.hemi.intensity < 0.5;
  setDayMode(!isNight);
}
