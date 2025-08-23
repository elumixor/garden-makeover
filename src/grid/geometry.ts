import { BufferGeometry, Float32BufferAttribute, Shape, ShapeGeometry } from "three";

// Use single cached geometry instances (since size is always the same)
let cachedRoundedRectGeometry: BufferGeometry | null = null;
let cachedPlusGeometry: BufferGeometry | null = null;

export function getRoundedRectGeometry(size: number, radius: number) {
  if (cachedRoundedRectGeometry) return cachedRoundedRectGeometry;

  const shape = new Shape();
  const half = size / 2;
  const r = Math.min(radius, half);

  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);

  return (cachedRoundedRectGeometry = new ShapeGeometry(shape));
}

export function getPlusGeometry(size: number, thickness: number) {
  if (cachedPlusGeometry) return cachedPlusGeometry;

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

  cachedPlusGeometry = new BufferGeometry();
  cachedPlusGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  cachedPlusGeometry.setIndex(indices);

  return cachedPlusGeometry;
}
