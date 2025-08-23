import { BufferGeometry, Float32BufferAttribute, Shape, ShapeGeometry } from "three";

export function createRoundedRectGeometry(width: number, height: number, radius: number) {
  const shape = new Shape();
  const w = width,
    h = height,
    r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(-w / 2 + r, -h / 2);
  shape.lineTo(w / 2 - r, -h / 2);
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  shape.lineTo(w / 2, h / 2 - r);
  shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  shape.lineTo(-w / 2 + r, h / 2);
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  shape.lineTo(-w / 2, -h / 2 + r);
  shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

  return new ShapeGeometry(shape);
}

export function createPlusGeometry(size: number, thickness: number) {
  // One vertical bar, two horizontal bars (left and right), no overlap
  const half = size / 2;
  const halfT = thickness / 2;

  const positions = [
    // Vertical bar (center)
    -halfT,
    half,
    0,
    halfT,
    half,
    0,
    halfT,
    -half,
    0,
    -halfT,
    -half,
    0,

    // Left horizontal bar
    -half,
    halfT,
    0,
    -halfT,
    halfT,
    0,
    -halfT,
    -halfT,
    0,
    -half,
    -halfT,
    0,

    // Right horizontal bar
    halfT,
    halfT,
    0,
    half,
    halfT,
    0,
    half,
    -halfT,
    0,
    halfT,
    -halfT,
    0,
  ];
  const indices = [
    // Vertical bar
    0, 1, 2, 0, 2, 3,
    // Left horizontal bar
    4, 5, 6, 4, 6, 7,
    // Right horizontal bar
    8, 9, 10, 8, 10, 11,
  ];
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  return geometry;
}
