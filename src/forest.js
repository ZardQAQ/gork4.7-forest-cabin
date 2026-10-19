import * as THREE from 'three';
import { mulberry32 } from './utils.js';
import { getMaterials } from './textures.js';
import { registerTint } from './env.js';
import { inClearing } from './layout.js';

const rng = mulberry32(11);

function foliageMaterial(color) {
  return registerTint(
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      flatShading: true,
    }),
    { snow: 0.86, wet: 0.32 }
  );
}

function makeAnimalMaterials() {
  const m = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.78, ...extra });
  return {
    fur: m('#a86438'),
    furDark: m('#6a3c22'),
    belly: m('#f0ddc4'),
    beak: m('#e39a2b'),
    wing: m('#8d5a32'),
    wingBlue: m('#3d6fbf'),
    breast: m('#d4653a'),
    sparrow: m('#8a7048'),
    cardinal: m('#c5362f'),
    owl: m('#8d6a45'),
    owlDark: m('#4d3424'),
    eye: m('#f7f4ee', { emissive: new THREE.Color('#fff4d2'), emissiveIntensity: 0.15 }),
    pupil: m('#1a120e'),
    wood: m('#c4492a'),
  };
}

function createSquirrel(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.fur);
  body.scale.set(1.05, 0.82, 1.45);
  body.position.set(0, 0.2, 0);
  g.add(body);
  const tum = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mats.belly);
  tum.scale.set(0.8, 0.7, 1.1);
  tum.position.set(0, 0.16, 0.04);
  g.add(tum);
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mats.fur);
  skull.scale.set(1, 0.95, 1.05);
  head.add(skull);
  const earGeo = new THREE.SphereGeometry(0.035, 6, 5);
  for (const x of [-0.06, 0.06]) {
    const ear = new THREE.Mesh(earGeo, mats.furDark);
    ear.position.set(x, 0.08, 0);
    ear.scale.set(0.7, 1.3, 0.5);
    head.add(ear);
  }
  const eyeGeo = new THREE.SphereGeometry(0.018, 6, 5);
  for (const x of [-0.045, 0.045]) {
    const eye = new THREE.Mesh(eyeGeo, mats.pupil);
    eye.position.set(x, 0.02, -0.08);
    head.add(eye);
  }
  head.position.set(0, 0.28, -0.16);
  g.add(head);
  const tail = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.055 + i * 0.012, 7, 6), i > 2 ? mats.furDark : mats.fur);
    const a = i / 4;
    s.position.set(0, 0.08 + Math.sin(a * 1.3) * 0.16, 0.08 + i * 0.055);
    tail.add(s);
  }
  tail.position.set(0, 0.18, 0.16);
  g.add(tail);
  g.userData.parts = { head, tail };
  g.userData.kind = 'squirrel';
  g.scale.setScalar(1.65);
  return g;
}

function createBird(mats, kind) {
  const g = new THREE.Group();
  const bodyColor = kind === 'cardinal' ? mats.cardinal : kind === 'blue' ? mats.wingBlue : mats.sparrow;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 7), bodyColor);
  body.scale.set(0.85, 0.75, 1.25);
  body.position.y = 0.1;
  g.add(body);
  if (kind !== 'cardinal' && kind !== 'blue') {
    const breast = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mats.breast);
    breast.position.set(0, 0.08, -0.04);
    g.add(breast);
  }
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), bodyColor);
  head.add(skull);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 5), mats.beak);
  beak.rotation.x = Math.PI / 2;
  beak.position.z = -0.07;
  head.add(beak);
  const eyeGeo = new THREE.SphereGeometry(0.012, 5, 4);
  for (const x of [-0.028, 0.028]) {
    const eye = new THREE.Mesh(eyeGeo, mats.pupil);
    eye.position.set(x, 0.012, -0.04);
    head.add(eye);
  }
  head.position.set(0, 0.15, -0.08);
  g.add(head);

  const wingGeo = new THREE.SphereGeometry(0.07, 6, 4);
  wingGeo.scale(1.3, 0.28, 0.85);
  const wingL = new THREE.Mesh(wingGeo, kind === 'blue' ? mats.wingBlue : mats.wing);
  wingL.position.set(-0.1, 0.1, 0.01);
  const wingR = new THREE.Mesh(wingGeo, kind === 'blue' ? mats.wingBlue : mats.wing);
  wingR.position.set(0.1, 0.1, 0.01);
  g.add(wingL, wingR);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 4), bodyColor);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 0.1, 0.12);
  g.add(tail);
  g.userData.parts = { head, wingL, wingR };
  g.userData.kind = 'bird';
  g.userData.flap = kind === 'flying' ? 9 : 2.2;
  g.scale.setScalar(kind === 'flying' ? 2.1 : 1.85);
  return g;
}

function createOwl(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), mats.owl);
  body.scale.set(1, 1.15, 0.9);
  body.position.y = 0.18;
  g.add(body);
  const head = new THREE.Group();
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), mats.owl);
  head.add(skull);
  for (const x of [-0.07, 0.07]) {
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), mats.owlDark);
    tuft.position.set(x, 0.1, 0);
    head.add(tuft);
  }
  for (const x of [-0.045, 0.045]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mats.eye);
    eye.position.set(x, 0.01, -0.08);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 5), mats.pupil);
    pupil.position.set(x, 0.01, -0.11);
    head.add(eye, pupil);
  }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 4), mats.beak);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.03, -0.1);
  head.add(beak);
  head.position.set(0, 0.36, -0.02);
  g.add(head);
  g.userData.parts = { head };
  g.userData.kind = 'owl';
  g.scale.setScalar(1.7);
  return g;
}

function createWoodpecker(mats) {
  const bird = createBird(mats, 'cardinal');
  bird.userData.kind = 'woodpecker';
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.07, 4), mats.wood);
  crest.position.set(0, 0.06, 0);
  bird.userData.parts.head.add(crest);
  return bird;
}

function createBirdhouse(mats) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.3), mats.trim);
  body.position.y = 0.2;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.4), mats.roof);
  roof.position.y = 0.44;
  roof.rotation.z = 0.08;
  g.add(roof);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), mats.dark);
  hole.position.set(0, 0.24, -0.16);
  g.add(hole);
  const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.12, 5), mats.trim);
  peg.rotation.x = Math.PI / 2;
  peg.position.set(0, 0.12, -0.18);
  g.add(peg);
  g.scale.setScalar(1.2);
  return g;
}

function coneProto() {
  const geo = new THREE.ConeGeometry(1, 1, 7);
  geo.translate(0, 0.5, 0);
  return geo;
}

function trunkProto() {
  return new THREE.CylinderGeometry(0.55, 0.78, 1, 7);
}

export function createForest(scene) {
  const tex = getMaterials();
  registerTint(tex.bark, { snow: 0.28, wet: 0.33 });
  registerTint(tex.birch, { snow: 0.42, wet: 0.22 });

  const pineMat = foliageMaterial('#2f6d3e');
  const pineDark = foliageMaterial('#245736');
  const oakMat = foliageMaterial('#3f7d3c');
  const oakDark = foliageMaterial('#2d5e30');
  const autumn = foliageMaterial('#c47a32');
  const birchLeaf = foliageMaterial('#8eae55');

  const cone = coneProto();
  const trunkGeo = trunkProto();
  const crownGeo = new THREE.IcosahedronGeometry(1, 1);
  const branchGeo = new THREE.CylinderGeometry(0.045, 0.07, 1, 5);
  branchGeo.translate(0, 0.5, 0);

  const sway = [];
  const animals = [];
  const placed = [];

  function spawnTree(x, z, type, scale = 1) {
    const g = new THREE.Group();
    const trunkH = (type === 'birch' ? 2.4 : type === 'pine' ? 2.1 : 1.85) * (0.85 + rng() * 0.45) * scale;
    const trunkMat = type === 'birch' ? tex.birch : tex.bark;
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.scale.set(type === 'birch' ? 0.28 : 0.38, trunkH, type === 'birch' ? 0.28 : 0.38);
    trunk.position.y = trunkH / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    g.add(trunk);

    const perches = [];
    if (type === 'pine') {
      const mat = rng() > 0.5 ? pineMat : pineDark;
      const layers = [
        [1.7 * scale, 2.15 * scale, 0.15],
        [1.25 * scale, 1.75 * scale, 1.55 * scale],
        [0.75 * scale, 1.35 * scale, 2.85 * scale],
      ];
      layers.forEach(([rad, h, lift], idx) => {
        const mesh = new THREE.Mesh(cone, mat);
        mesh.scale.set(rad, h, rad);
        mesh.position.y = trunkH * 0.72 + lift;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        g.add(mesh);
        if (idx < 2) perches.push({ y: mesh.position.y + 0.15, r: rad * 0.45, kind: 'branch' });
      });
      perches.push({ y: trunkH * 0.45, r: 0.34, kind: 'trunk' });
    } else {
      const mat = type === 'birch' ? birchLeaf : rng() > 0.82 ? autumn : rng() > 0.5 ? oakMat : oakDark;
      const rad = (type === 'birch' ? 1.15 : 1.55) * scale * (0.85 + rng() * 0.3);
      const puff = (ox, oy, oz, s) => {
        const mesh = new THREE.Mesh(crownGeo, mat);
        mesh.scale.set(rad * s, rad * s * 0.85, rad * s);
        mesh.position.set(ox, trunkH + oy, oz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        g.add(mesh);
      };
      puff(0, rad * 0.72, 0, 1);
      puff(rad * 0.45, rad * 0.35, rad * 0.2, 0.72);
      puff(-rad * 0.4, rad * 0.4, -rad * 0.25, 0.68);
      perches.push({ y: trunkH + rad * 0.15, r: rad * 0.55, kind: 'branch' });
      perches.push({ y: trunkH * 0.5, r: type === 'birch' ? 0.26 : 0.36, kind: 'trunk' });
    }

    g.position.set(x, 0, z);
    g.userData.yaw = rng() * Math.PI * 2;
    g.rotation.y = g.userData.yaw;
    scene.add(g);
    const item = { group: g, x, z, perches, phase: rng() * Math.PI * 2, amp: 0.012 + rng() * 0.01, type };
    sway.push(item);
    placed.push(item);
    return item;
  }

  const frames = [
    [14.6, 7.4, 'oak', 1.05],
    [-14.4, 7.1, 'pine', 1.12],
    [13.8, 15.6, 'birch', 1],
    [-13.5, 16.2, 'oak', 1.08],
  ];
  for (const [x, z, type, scale] of frames) spawnTree(x, z, type, scale);

  let guard = 0;
  while (placed.length < 88 && guard < 700) {
    guard += 1;
    let x;
    let z;
    if (rng() < 0.5) {
      x = (rng() - 0.5) * 78;
      z = -8 - rng() * 36;
    } else {
      const a = rng() * Math.PI * 2;
      const r = 18 + rng() * 28;
      x = Math.cos(a) * r;
      z = Math.sin(a) * r;
    }
    if (inClearing(x, z)) continue;
    if (placed.some((t) => (t.x - x) ** 2 + (t.z - z) ** 2 < 7.2)) continue;
    const roll = rng();
    const type = roll < 0.48 ? 'pine' : roll < 0.8 ? 'oak' : 'birch';
    spawnTree(x, z, type, 0.9 + rng() * 0.35);
  }

  const animalMats = makeAnimalMaterials();
  animalMats.eye.userData.baseEmissive = 0.15;

function attach(tree, animal, perch, mode, fixedAngle = null) {
  const a = fixedAngle == null ? rng() * Math.PI * 2 : fixedAngle;
    const length = mode === 'cling' ? perch.r : fixedAngle == null ? 0.85 + rng() * 0.35 : 2.05;
    if (mode !== 'cling') {
      const branch = new THREE.Mesh(branchGeo, tex.bark);
      const dir = new THREE.Vector3(Math.cos(a), 0.18, Math.sin(a)).normalize();
      branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      branch.scale.set(1, length, 1);
      branch.position.set(Math.cos(a) * 0.12, perch.y, Math.sin(a) * 0.12);
      branch.castShadow = true;
      tree.group.add(branch);
    }
    tree.group.add(animal);
    const r = mode === 'cling' ? perch.r + 0.16 : length;
    animal.position.set(Math.cos(a) * r, perch.y + (mode === 'cling' ? 0 : 0.08), Math.sin(a) * r);
    const target = new THREE.Vector3();
    if (mode === 'cling') target.set(0, perch.y, 0);
    else target.set(Math.cos(a) * (r + 1.4), perch.y + 0.2, Math.sin(a) * (r + 1.4));
    tree.group.localToWorld(target);
    animal.lookAt(target);
    animal.userData.phase = rng() * Math.PI * 2;
    animals.push(animal);
    perch.used = true;
  }

  function takePerch(kind) {
    const pool = [];
    for (const tree of placed) {
      for (const perch of tree.perches) {
        if (!perch.used && perch.kind === kind) pool.push({ tree, perch });
      }
    }
    if (!pool.length) return null;
    return pool[Math.floor(rng() * pool.length)];
  }

  const plan = [
    ['squirrel', 'branch', 8],
    ['bird', 'branch', 10],
    ['blue', 'branch', 4],
    ['cardinal', 'branch', 3],
    ['owl', 'branch', 2],
    ['woodpecker', 'trunk', 3],
  ];
  for (const [kind, perchKind, count] of plan) {
    for (let i = 0; i < count; i++) {
      const slot = takePerch(perchKind);
      if (!slot) break;
      let animal;
      if (kind === 'squirrel') animal = createSquirrel(animalMats);
      else if (kind === 'owl') animal = createOwl(animalMats);
      else if (kind === 'woodpecker') animal = createWoodpecker(animalMats);
      else if (kind === 'blue') animal = createBird(animalMats, 'blue');
      else if (kind === 'cardinal') animal = createBird(animalMats, 'cardinal');
      else animal = createBird(animalMats, 'sparrow');
      attach(slot.tree, animal, slot.perch, kind === 'woodpecker' ? 'cling' : 'sit');
    }
  }

  const showcase = [
    [0, 'cardinal'],
    [1, 'squirrel'],
    [2, 'blue'],
    [3, 'owl'],
  ];
  for (const [index, kind] of showcase) {
    const tree = placed[index];
    const perch = { y: 2.35, r: 0.42, kind: 'branch' };
    if (!tree || !perch) continue;
    let animal;
    if (kind === 'squirrel') animal = createSquirrel(animalMats);
    else if (kind === 'owl') animal = createOwl(animalMats);
    else animal = createBird(animalMats, kind);
    attach(tree, animal, perch, 'sit', Math.PI / 2);
  }

  for (let i = 0; i < 2; i++) {
    const tree = placed[10 + i * 8];
    if (!tree) break;
    const house = createBirdhouse(tex);
    house.position.set(0.15, tree.type === 'pine' ? 2.1 : 1.7, 0.45);
    tree.group.add(house);
  }

  const flying = [];
  for (let i = 0; i < 6; i++) {
    const bird = createBird(animalMats, i % 2 ? 'flying' : 'blue');
    bird.userData.kind = 'flying';
    bird.userData.flap = 8 + rng() * 3;
    bird.userData.radius = 16 + i * 3.2;
    bird.userData.speed = 0.18 + rng() * 0.12;
    bird.userData.phase = rng() * Math.PI * 2;
    bird.userData.height = 8.5 + (i % 3) * 1.4;
    scene.add(bird);
    flying.push(bird);
    animals.push(bird);
  }

  const bushMat = foliageMaterial('#3b7340');
  const bushGeo = new THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 20; i++) {
    const a = rng() * Math.PI * 2;
    const r = 15 + rng() * 8;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * (r * 0.75) + 2;
    if (Math.abs(x) < 12 && z > 4 && z < 18) continue;
    const bush = new THREE.Mesh(bushGeo, bushMat);
    const s = 0.55 + rng() * 0.7;
    bush.scale.set(s, s * 0.75, s);
    bush.position.set(x, s * 0.45, z);
    bush.castShadow = true;
    bush.receiveShadow = true;
    scene.add(bush);
    sway.push({ group: bush, phase: rng() * 6, amp: 0.02, x, z });
  }

  const rockMat = registerTint(
    new THREE.MeshStandardMaterial({ color: '#8a8178', roughness: 1, flatShading: true }),
    { snow: 0.7, wet: 0.28 }
  );
  const rockGeo = new THREE.DodecahedronGeometry(0.45, 0);
  for (let i = 0; i < 16; i++) {
    const x = (rng() - 0.5) * 36;
    const z = -6 + rng() * 30;
    if (Math.abs(x) < 1.6 && z > 3 && z < 17) continue;
    if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const s = 0.45 + rng() * 1.1;
    rock.scale.set(s, s * (0.55 + rng() * 0.4), s * (0.8 + rng() * 0.4));
    rock.position.set(x, s * 0.15, z);
    rock.rotation.y = rng() * 3;
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  }

  const capMat = new THREE.MeshStandardMaterial({ color: '#c44536', roughness: 0.55 });
  const spotMat = new THREE.MeshStandardMaterial({ color: '#f6f1e8', roughness: 0.6 });
  const stemMat = new THREE.MeshStandardMaterial({ color: '#f3e4cf', roughness: 0.7 });
  registerTint(capMat, { snow: 0.45, wet: 0.2 });
  for (let i = 0; i < 10; i++) {
    const tree = placed[Math.floor(rng() * placed.length)];
    const cluster = new THREE.Group();
    const n = 1 + Math.floor(rng() * 3);
    for (let k = 0; k < n; k++) {
      const h = 0.16 + rng() * 0.18;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, h, 5), stemMat);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09 + rng() * 0.04, 8, 6), capMat);
      cap.scale.y = 0.55;
      const px = (rng() - 0.5) * 0.4;
      const pz = (rng() - 0.5) * 0.4;
      stem.position.set(px, h / 2, pz);
      cap.position.set(px, h + 0.02, pz);
      cluster.add(stem, cap);
      for (let s = 0; s < 4; s++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 4, 3), spotMat);
        const ang = (s / 4) * Math.PI * 2;
        spot.position.set(px + Math.cos(ang) * 0.05, h + 0.05, pz + Math.sin(ang) * 0.05);
        cluster.add(spot);
      }
    }
    const ang = rng() * Math.PI * 2;
    cluster.position.set(tree.x + Math.cos(ang) * 1.3, 0, tree.z + Math.sin(ang) * 1.3);
    scene.add(cluster);
  }

  const stumpGeo = new THREE.CylinderGeometry(0.28, 0.34, 0.42, 7);
  const topGeo = new THREE.CircleGeometry(0.26, 7);
  for (let i = 0; i < 3; i++) {
    const stump = new THREE.Mesh(stumpGeo, tex.bark);
    stump.position.set(-8 + i * 7.5, 0.2, 3.2 + i);
    stump.castShadow = true;
    stump.receiveShadow = true;
    const top = new THREE.Mesh(topGeo, tex.plank);
    top.rotation.x = -Math.PI / 2;
    top.position.y = 0.22;
    stump.add(top);
    scene.add(stump);
  }

  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 2.4, 6), tex.bark);
  log.rotation.z = Math.PI / 2;
  log.position.set(8.5, 0.18, 4.4);
  log.castShadow = true;
  scene.add(log);

  return {
    update(t, live) {
      const wind = live.wind;
      for (const item of sway) {
        item.group.rotation.z = Math.sin(t * 1.15 + item.phase) * item.amp * wind;
        item.group.rotation.x = Math.cos(t * 0.85 + item.phase) * item.amp * 0.65 * wind;
        if (item.group.userData.yaw != null) item.group.rotation.y = item.group.userData.yaw;
      }
      for (const animal of animals) {
        const parts = animal.userData.parts;
        const phase = animal.userData.phase || 0;
        const kind = animal.userData.kind;
        if (!parts) continue;
        if (kind === 'squirrel') {
          parts.tail.rotation.x = Math.sin(t * 2.4 + phase) * 0.28;
          parts.head.rotation.y = Math.sin(t * 0.7 + phase) * 0.45;
        } else if (kind === 'owl') {
          parts.head.rotation.y = Math.sin(t * 0.35 + phase) * 0.7;
          animalMats.eye.emissiveIntensity = 0.15 + live.stars * 0.9;
        } else if (kind === 'woodpecker') {
          parts.head.rotation.x = Math.max(0, Math.sin(t * 7 + phase)) * 0.35;
        } else if (parts.wingL) {
          const amp = kind === 'flying' ? 0.7 : 0.18;
          const flap = Math.sin(t * (animal.userData.flap || 2) + phase) * amp;
          parts.wingL.rotation.z = 0.3 + flap;
          parts.wingR.rotation.z = -0.3 - flap;
          if (parts.head) parts.head.rotation.y = Math.sin(t * 0.8 + phase) * 0.3;
        }
      }
      const hideFly = live.rain > 0.55 || live.lightning > 0.5;
      for (const bird of flying) {
        bird.visible = !hideFly && live.stars < 0.7;
        if (!bird.visible) continue;
        const a = t * bird.userData.speed + bird.userData.phase;
        const r = bird.userData.radius;
        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r * 0.72 - 4;
        const y = bird.userData.height + Math.sin(a * 2.0) * 0.4;
        bird.position.set(x, y, z);
        bird.lookAt(Math.cos(a + 0.2) * r, y, Math.sin(a + 0.2) * r * 0.72 - 4);
      }
    },
  };
}
