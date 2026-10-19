import * as THREE from 'three';
import { getMaterials } from './textures.js';
import { registerTint } from './env.js';

function addBox(parent, size, pos, mat, opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (opts.rot) mesh.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  parent.add(mesh);
  return mesh;
}

function addCyl(parent, rTop, rBot, h, pos, mat, rot) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 8), mat);
  mesh.position.set(pos[0], pos[1], pos[2]);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addWindow(parent, x, y, z, w, h, mats, axis) {
  const t = 0.07;
  const d = 0.1;
  const frame = (size, pos) => {
    const mesh = addBox(parent, size, pos, mats.trim);
    if (axis === 'x') mesh.position.x = x;
    return mesh;
  };

  if (axis === 'x') {
    addBox(parent, [d, t, w], [x, y + h / 2 - t / 2, z], mats.trim);
    addBox(parent, [d, t, w], [x, y - h / 2 + t / 2, z], mats.trim);
    addBox(parent, [d, h, t], [x, y, z - w / 2 + t / 2], mats.trim);
    addBox(parent, [d, h, t], [x, y, z + w / 2 - t / 2], mats.trim);
    addBox(parent, [0.04, t * 0.7, w - t * 2], [x + Math.sign(x) * 0.06, y, z], mats.trim);
    addBox(parent, [0.04, h - t * 2, t * 0.7], [x + Math.sign(x) * 0.06, y, z], mats.trim);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - t * 2.2, h - t * 2.2), mats.glass);
    glass.rotation.y = x > 0 ? Math.PI / 2 : -Math.PI / 2;
    glass.position.set(x + Math.sign(x) * 0.04, y, z);
    parent.add(glass);
    addBox(parent, [0.16, 0.05, w + 0.08], [x + Math.sign(x) * 0.08, y - h / 2 - 0.01, z], mats.plank);
    return glass;
  }

  frame([w, t, d], [x, y + h / 2 - t / 2, z]);
  frame([w, t, d], [x, y - h / 2 + t / 2, z]);
  frame([t, h, d], [x - w / 2 + t / 2, y, z]);
  frame([t, h, d], [x + w / 2 - t / 2, y, z]);
  frame([0.035, h - t * 2, 0.03], [x, y, z + 0.06]);
  frame([w - t * 2, 0.035, 0.03], [x, y, z + 0.06]);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - t * 2.2, h - t * 2.2), mats.glass);
  glass.position.set(x, y, z + 0.045);
  parent.add(glass);
  addBox(parent, [w + 0.12, 0.06, 0.16], [x, y - h / 2 - 0.01, z + 0.08], mats.plank);
  return glass;
}

export function createCabin(scene) {
  const mats = getMaterials();
  registerTint(mats.log, { snow: 0.14, wet: 0.42 });
  registerTint(mats.roof, { snow: 0.05, wet: 0.3 });
  registerTint(mats.stone, { snow: 0.55, wet: 0.25 });
  registerTint(mats.plank, { snow: 0.2, wet: 0.38 });
  registerTint(mats.trim, { snow: 0.18, wet: 0.3 });
  registerTint(mats.dark, { snow: 0.08, wet: 0.2 });

  const group = new THREE.Group();
  group.name = 'cabin';

  const W = 6.6;
  const D = 5.0;
  const H = 3.25;
  const BASE = 0.26;

  addBox(group, [W + 0.45, BASE, D + 0.55], [0, BASE / 2, 0.05], mats.stone);
  addBox(group, [W, H, D], [0, BASE + H / 2, 0], mats.log);

  const ridgeY = BASE + H + 1.48;
  const eaveY = BASE + H - 0.05;
  const eaveZ = D / 2 + 0.95;
  const midY = (ridgeY + eaveY) / 2;
  const midZ = eaveZ / 2;
  const dy = ridgeY - eaveY;
  const dz = eaveZ;
  const len = Math.hypot(dy, dz);
  const ang = Math.atan2(dy, dz);
  const roofW = W + 1.55;

  const roofFront = addBox(group, [roofW, 0.14, len], [0, midY, midZ], mats.roof, { rot: [ang, 0, 0] });
  const roofBack = addBox(group, [roofW, 0.14, len], [0, midY, -midZ], mats.roof, { rot: [-ang, 0, 0] });
  addBox(group, [roofW + 0.08, 0.1, 0.28], [0, ridgeY + 0.02, 0], mats.trim);

  const gableShape = new THREE.Shape();
  gableShape.moveTo(-W / 2, BASE + H);
  gableShape.lineTo(W / 2, BASE + H);
  gableShape.lineTo(0, ridgeY - 0.05);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  const gableFront = new THREE.Mesh(gableGeo, mats.log);
  gableFront.position.z = D / 2 + 0.01;
  gableFront.castShadow = true;
  gableFront.receiveShadow = true;
  group.add(gableFront);
  const gableBack = new THREE.Mesh(gableGeo, mats.log);
  gableBack.position.z = -D / 2 - 0.01;
  gableBack.rotation.y = Math.PI;
  gableBack.castShadow = true;
  group.add(gableBack);

  const cornerR = 0.16;
  const corners = [
    [W / 2 - 0.02, D / 2 - 0.02],
    [-W / 2 + 0.02, D / 2 - 0.02],
    [W / 2 - 0.02, -D / 2 + 0.02],
    [-W / 2 + 0.02, -D / 2 + 0.02],
  ];
  for (const [x, z] of corners) {
    addCyl(group, cornerR, cornerR * 1.08, H + 0.15, [x, BASE + (H + 0.15) / 2, z], mats.trim);
  }

  const glassMat = new THREE.MeshStandardMaterial({
    color: '#ffe3b8',
    emissive: new THREE.Color('#ff9a3c'),
    emissiveIntensity: 0.2,
    roughness: 0.22,
    metalness: 0,
  });
  const winMats = { ...mats, glass: glassMat };
  addWindow(group, -1.75, BASE + 1.72, D / 2 + 0.02, 1.05, 1.2, winMats, 'z');
  addWindow(group, 1.75, BASE + 1.72, D / 2 + 0.02, 1.05, 1.2, winMats, 'z');
  addWindow(group, W / 2 + 0.02, BASE + 1.78, -0.35, 0.9, 1.05, winMats, 'x');
  addWindow(group, -W / 2 - 0.02, BASE + 1.78, 0.45, 0.9, 1.05, winMats, 'x');

  const doorW = 1.12;
  const doorH = 2.12;
  const doorY = BASE + doorH / 2 + 0.02;
  const doorZ = D / 2 + 0.04;
  addBox(group, [doorW + 0.18, 0.08, 0.12], [0, doorY + doorH / 2, doorZ], mats.trim);
  addBox(group, [0.08, doorH, 0.12], [-doorW / 2 - 0.02, doorY, doorZ], mats.trim);
  addBox(group, [0.08, doorH, 0.12], [doorW / 2 + 0.02, doorY, doorZ], mats.trim);
  addBox(group, [doorW, doorH, 0.08], [0, doorY, doorZ], mats.plank);
  addBox(group, [doorW * 0.72, doorH * 0.38, 0.03], [0, doorY + 0.28, doorZ + 0.05], mats.trim);
  addBox(group, [doorW * 0.72, doorH * 0.32, 0.03], [0, doorY - 0.48, doorZ + 0.05], mats.trim);
  addCyl(group, 0.035, 0.035, 0.08, [doorW * 0.32, doorY - 0.05, doorZ + 0.08], mats.trim, [Math.PI / 2, 0, 0]);

  const porchZ = D / 2 + 1.15;
  const porchTop = BASE + 0.08;
  addBox(group, [W - 0.3, 0.12, 2.35], [0, porchTop, porchZ], mats.plank);
  const postH = 2.55;
  const postY = porchTop + postH / 2;
  for (const x of [-2.55, 2.55]) {
    addCyl(group, 0.09, 0.1, postH, [x, postY, D / 2 + 2.15], mats.trim);
  }
  addBox(group, [W - 0.15, 0.08, 0.1], [0, porchTop + postH, D / 2 + 1.35], mats.trim);
  addBox(group, [0.08, 0.08, 2.2], [-2.55, porchTop + 0.7, porchZ], mats.trim);
  addBox(group, [0.08, 0.08, 2.2], [2.55, porchTop + 0.7, porchZ], mats.trim);
  addBox(group, [0.08, 0.08, 2.2], [-2.55, porchTop + 1.15, porchZ], mats.trim);
  addBox(group, [0.08, 0.08, 2.2], [2.55, porchTop + 1.15, porchZ], mats.trim);

  const shedLen = 2.35;
  const shedDrop = 0.62;
  const shedAng = Math.atan2(shedDrop, shedLen);
  addBox(
    group,
    [W - 0.05, 0.1, Math.hypot(shedDrop, shedLen)],
    [0, eaveY - shedDrop / 2 + 0.02, D / 2 + shedLen / 2 - 0.15],
    mats.roof,
    { rot: [shedAng, 0, 0] }
  );

  addBox(group, [1.35, 0.12, 0.42], [0, porchTop - 0.12, D / 2 + 2.45], mats.plank);
  addBox(group, [1.55, 0.12, 0.42], [0, 0.08, D / 2 + 2.9], mats.stone);
  addBox(group, [0.7, 0.02, 0.4], [0, porchTop + 0.08, D / 2 + 1.15], mats.dark);

  addBox(group, [1.35, 0.08, 0.42], [-1.7, porchTop + 0.28, porchZ + 0.15], mats.plank);
  addBox(group, [1.25, 0.08, 0.36], [-1.7, porchTop + 0.62, porchZ + 0.15], mats.plank);
  addBox(group, [0.08, 0.46, 0.36], [-2.28, porchTop + 0.32, porchZ + 0.15], mats.trim);
  addBox(group, [0.08, 0.46, 0.36], [-1.12, porchTop + 0.32, porchZ + 0.15], mats.trim);

  const chimney = new THREE.Group();
  addBox(chimney, [0.78, 2.5, 0.78], [0, 1.25, 0], mats.stone);
  addBox(chimney, [0.95, 0.16, 0.95], [0, 2.55, 0], mats.stone);
  addCyl(chimney, 0.22, 0.22, 0.08, [0, 2.62, 0], mats.dark);
  chimney.position.set(2.05, 3.55, -1.05);
  group.add(chimney);

  const snowMat = new THREE.MeshStandardMaterial({
    color: '#f4f7fb',
    roughness: 0.96,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const snowFront = addBox(group, [roofW * 0.98, 0.1, len * 0.96], [0, midY + 0.1, midZ], snowMat, {
    rot: [ang, 0, 0],
    cast: false,
  });
  const snowPorch = addBox(
    group,
    [(W - 0.2), 0.08, Math.hypot(shedDrop, shedLen) * 0.96],
    [0, eaveY - shedDrop / 2 + 0.12, D / 2 + shedLen / 2 - 0.15],
    snowMat,
    { rot: [shedAng, 0, 0], cast: false }
  );
  const snowBack = addBox(group, [roofW * 0.98, 0.1, len * 0.96], [0, midY + 0.1, -midZ], snowMat, {
    rot: [-ang, 0, 0],
    cast: false,
  });
  const snowCap = addBox(chimney, [0.7, 0.08, 0.7], [0, 2.7, 0], snowMat, { cast: false });

  for (const x of [-2.15, 2.15]) {
    const pile = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const log = addCyl(pile, 0.09, 0.1, 0.85, [0, 0.1 + i * 0.16, 0], mats.bark, [0, 0, Math.PI / 2]);
      log.rotation.y = i * 0.4;
    }
    pile.position.set(x, 0, D / 2 + 0.15);
    if (x > 0) pile.position.set(W / 2 + 0.7, 0, 0.2);
    group.add(pile);
  }

  const lanternPost = addCyl(group, 0.045, 0.055, 1.7, [2.15, porchTop + 0.85, D / 2 + 2.05], mats.dark);
  const lanternMat = new THREE.MeshStandardMaterial({
    color: '#ffd7a1',
    emissive: new THREE.Color('#ffaa4a'),
    emissiveIntensity: 0.4,
    roughness: 0.35,
  });
  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.32, 0.22), lanternMat);
  lantern.position.set(2.15, porchTop + 1.78, D / 2 + 2.05);
  group.add(lantern);
  addBox(group, [0.28, 0.06, 0.28], [2.15, porchTop + 1.98, D / 2 + 2.05], mats.dark, { cast: false });
  void lanternPost;
  void roofFront;
  void roofBack;

  const windowLight = new THREE.PointLight('#ffb15a', 0, 10, 2);
  windowLight.position.set(0, BASE + 1.8, D / 2 - 0.4);
  group.add(windowLight);
  const lanternLight = new THREE.PointLight('#ffc27a', 0, 7, 2);
  lanternLight.position.copy(lantern.position);
  group.add(lanternLight);

  scene.add(group);
  group.updateWorldMatrix(true, true);
  const smokeOrigin = new THREE.Vector3();
  chimney.getWorldPosition(smokeOrigin);
  smokeOrigin.y += 2.72;

  const flowerColors = ['#e25b4a', '#f2c14e', '#f7f3ea', '#d4557a'];
  for (const side of [-1.75, 1.75]) {
    const box = addBox(group, [0.9, 0.16, 0.28], [side, BASE + 1.02, D / 2 + 0.2], mats.trim);
    void box;
    for (let i = 0; i < 5; i++) {
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 6, 5),
        new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length], roughness: 0.6 })
      );
      bloom.position.set(side - 0.28 + i * 0.14, BASE + 1.2, D / 2 + 0.2);
      group.add(bloom);
    }
  }

  return {
    group,
    smokeOrigin,
    update(t, live) {
      const flicker = 0.94 + Math.sin(t * 6.5) * 0.03 + Math.sin(t * 17.0) * 0.02;
      const glow = live.windowGlow * flicker;
      glassMat.emissiveIntensity = 0.15 + glow * 0.85;
      lanternMat.emissiveIntensity = 0.2 + glow * 1.15;
      windowLight.intensity = glow * 7.5;
      lanternLight.intensity = glow * 4.5;
      const snow = live.snow;
      snowMat.opacity = Math.min(0.96, snow * 0.95);
      snowFront.visible = snow > 0.03;
      snowPorch.visible = snow > 0.03;
      snowBack.visible = snow > 0.03;
      snowCap.visible = snow > 0.03;
    },
  };
}
