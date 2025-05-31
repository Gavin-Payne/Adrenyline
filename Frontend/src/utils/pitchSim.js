export function simulatePitchPath(pitch, steps = 40) {
  if (!pitch) return [];
  const x0 = pitch.releasePosX ?? 0;
  const y0 = pitch.releasePosY ?? 0;
  const z0 = pitch.releasePosZ ?? 6;
  const vx0 = pitch.vx0 ?? 0;
  const vy0 = pitch.vy0 ?? 0;
  const vz0 = pitch.vz0 ?? 0;
  const ax = pitch.ax ?? 0;
  const ay = pitch.ay ?? 0;
  const az = pitch.az ?? 0;
  const totalTime = pitch.plateTime ?? 0.4;

  const hasAdvanced = [x0, y0, z0, vx0, vy0, vz0, ax, ay, az].some(v => v && Math.abs(v) > 0.01);
  if (!hasAdvanced) {
    if (pitch.coordinates && pitch.coordinates.pX != null && pitch.coordinates.pZ != null) {
      const px = ((pitch.coordinates.pX + 2.0) / 4) * 160;
      const pz = (1 - (pitch.coordinates.pZ - 1.0) / 3) * 140;
      let path = [];
      const dx = 20;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const startX = 80, startZ = 20;
        const ctrlX = (startX + px) / 2 + dx;
        const ctrlZ = (startZ + pz) / 2 - 30;
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * px;
        const z = (1 - t) * (1 - t) * startZ + 2 * (1 - t) * t * ctrlZ + t * t * pz;
        path.push({ px: x, pz: z });
      }
      return path;
    }
    const speed = pitch.pitchSpeed || 85;
    const endSpeed = pitch.endSpeed || speed * 0.92;
    const plateTime = pitch.plateTime || 0.4;
    let breakAngle = (pitch.breakAngle || 0) * Math.PI / 180;
    let breakLength = pitch.breakLength || (pitch.spinRate ? Math.min(18, pitch.spinRate / 150) : 8);
    const extension = pitch.extension || 6.5;
    if (Math.abs(breakAngle) < 0.01 && Math.abs(breakLength) < 0.01) {
      breakAngle = 10 * Math.PI / 180;
      breakLength = 8;
    }
    const startZ = 20 + (1 - Math.min(Math.max(extension, 4.5), 8) / 8) * 40;
    const startX = 80;
    const endX = 80, endZ = 160;
    const breakPx = (breakLength / 17) * 80;
    const breakX = endX + breakPx * Math.sin(breakAngle);
    let path = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const midX = endX + breakPx * 0.5 * Math.sin(breakAngle);
      const midZ = (startZ + endZ) / 2;
      const px = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * breakX;
      const pz = (1 - t) * (1 - t) * startZ + 2 * (1 - t) * t * midZ + t * t * endZ;
      path.push({ px, pz });
    }
    const allSame = path.every(pt => pt.px === path[0].px && pt.pz === path[0].pz);
    if (allSame) {
      for (let i = 0; i <= steps; i++) path[i] = { px: 80 + i, pz: 20 + i * 3 };
    }
    return path;
  }

  let path = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalTime;
    const x = x0 + vx0 * t + 0.5 * ax * t * t;
    const y = y0 + vy0 * t + 0.5 * ay * t * t;
    const z = z0 + vz0 * t + 0.5 * az * t * t;
    const px = ((x / 1.5) + 2.0) / 4 * 160;
    const pz = (1 - ((z - 1.0) / 3)) * 140;
    path.push({ px, pz });
  }
  const allSame = path.every(pt => pt.px === path[0].px && pt.pz === path[0].pz);
  if (allSame) return [path[0], { px: path[0].px, pz: path[0].pz + 20 }];
  return path;
}
