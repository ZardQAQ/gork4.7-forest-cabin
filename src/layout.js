export const LAYOUT = {
  pathHalf: 1.28,
  pathZ0: 3.4,
  pathZ1: 16.8,
  fieldX: 11.2,
  fieldZ0: 5.4,
  fieldZ1: 19.4,
};

export function inClearing(x, z) {
  const dx = x / 15.2;
  const dz = (z - 12.2) / 11.2;
  if (dx * dx + dz * dz < 1 && z > 1.5) return true;
  if (Math.abs(x) < 5.8 && Math.abs(z) < 5.2) return true;
  return false;
}

export function onPath(x, z) {
  return Math.abs(x) < LAYOUT.pathHalf && z > LAYOUT.pathZ0 - 0.4 && z < LAYOUT.pathZ1;
}
