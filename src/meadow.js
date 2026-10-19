import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32, paint, paintGradient, readyGeometry } from './utils.js';
import { addFieldShader } from './env.js';
import { getMaterials } from './textures.js';
import { registerTint } from './env.js';
import { LAYOUT, onPath } from './layout.js';

const rng = mulberry32(22);

function fieldMaterial(wind, color = '#ffffff') {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  return addFieldShader(mat, wind);
}

function buildSunflowerGeometry() {
  const parts = [];
  const stem = new THREE.CylinderGeometry(0.028, 0.046, 1.5, 6);
  stem.translate(0, 0.75, 0);
  paintGradient(stem, '#1f5a28', '#67a045');
  parts.push(readyGeometry(stem));

  for (const side of [-1, 1]) {
    const leaf = new THREE.Shape();
    leaf.moveTo(0, 0);
    leaf.bezierCurveTo(0.16, 0.08, 0.2, 0.28, 0.02, 0.48);
    leaf.bezierCurveTo(-0.16, 0.26, -0.12, 0.08, 0, 0);
    const geo = new THREE.ExtrudeGeometry(leaf, { depth: 0.012, bevelEnabled: false, curveSegments: 4, steps: 1 });
    paintGradient(geo, '#1d5a2c', '#8fbf4e');
    geo.applyMatrix4(new THREE.Matrix4().makeRotationZ(side * 1.15));
    geo.applyMatrix4(new THREE.Matrix4().makeRotationY(side * 0.5));
    geo.applyMatrix4(new THREE.Matrix4().makeTranslation(side * 0.04, side > 0 ? 0.55 : 0.9, 0));
    parts.push(readyGeometry(geo));
  }

  const tilt = new THREE.Matrix4()
    .makeTranslation(0, 1.58, 0)
    .multiply(new THREE.Matrix4().makeRotationX(-0.62));

  const petalBase = (() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.18);
    shape.bezierCurveTo(0.13, 0.24, 0.15, 0.46, 0, 0.6);
    shape.bezierCurveTo(-0.15, 0.46, -0.13, 0.24, 0, 0.18);
    const geo = new THREE.ShapeGeometry(shape, 8);
    paintGradient(geo, '#f08a14', '#ffe98a');
    return geo;
  })();

  for (let i = 0; i < 14; i++) {
    const petal = petalBase.clone();
    petal.applyMatrix4(new THREE.Matrix4().makeRotationZ((i / 14) * Math.PI * 2));
    petal.applyMatrix4(tilt);
    parts.push(readyGeometry(petal));
  }

  const center = new THREE.CylinderGeometry(0.155, 0.155, 0.08, 20);
  center.rotateX(Math.PI / 2);
  const pos = center.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const radial = Math.hypot(pos.getX(i), pos.getZ(i));
    const h = Math.abs(Math.sin(pos.getX(i) * 70 + pos.getZ(i) * 54 + radial * 30));
    const dark = h > 0.42;
    colors[i * 3] = dark ? 0.08 : 0.24;
    colors[i * 3 + 1] = dark ? 0.035 : 0.11;
    colors[i * 3 + 2] = dark ? 0.015 : 0.035;
  }
  center.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  center.translate(0, 0, 0.04);
  center.applyMatrix4(tilt);
  parts.push(readyGeometry(center));

  const sepal = new THREE.CircleGeometry(0.24, 16);
  sepal.rotateY(Math.PI);
  paint(sepal, '#2a682f');
  sepal.translate(0, 0, -0.02);
  sepal.applyMatrix4(tilt);
  parts.push(readyGeometry(sepal));

  const merged = mergeGeometries(parts, false);
  merged.computeBoundingSphere();
  return merged;
}

function buildWildflower(petal, centerColor) {
  const parts = [];
  const stem = new THREE.CylinderGeometry(0.012, 0.018, 0.42, 4);
  stem.translate(0, 0.21, 0);
  paint(stem, '#3c7a34');
  parts.push(readyGeometry(stem));
  const headY = 0.46;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.SphereGeometry(0.055, 6, 5);
    p.scale(1, 0.42, 0.72);
    p.translate(Math.cos(a) * 0.07, headY, Math.sin(a) * 0.07);
    paint(p, petal);
    parts.push(readyGeometry(p));
  }
  const center = new THREE.SphereGeometry(0.034, 6, 5);
  center.translate(0, headY + 0.02, 0);
  paint(center, centerColor);
  parts.push(readyGeometry(center));
  const leaf = new THREE.SphereGeometry(0.05, 5, 4);
  leaf.scale(1.8, 0.28, 0.7);
  leaf.translate(0.07, 0.18, 0);
  paint(leaf, '#2f682c');
  parts.push(readyGeometry(leaf));
  return mergeGeometries(parts, false);
}

function buildBlade() {
  const w = 0.055;
  const positions = [];
  const push = (rot) => {
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    const pts = [
      [-w, 0, 0],
      [w, 0, 0],
      [w * 0.16, 1, 0.05],
      [-w, 0, 0],
      [w * 0.16, 1, 0.05],
      [-w * 0.1, 1, 0.02],
    ];
    for (const p of pts) positions.push(p[0] * c - p[2] * s, p[1], p[0] * s + p[2] * c);
  };
  push(0);
  push(Math.PI / 2);
  push(Math.PI / 5);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  paintGradient(geo, '#1a4a16', '#c6e26a');
  return geo;
}

function scatter(mesh, spots) {
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  spots.forEach((spot, i) => {
    dummy.position.set(spot.x, spot.y || 0, spot.z);
    dummy.rotation.set(spot.rx || 0, spot.ry || 0, spot.rz || 0);
    dummy.scale.set(spot.sx || spot.s || 1, spot.sy || spot.s || 1, spot.sz || spot.s || 1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    if (mesh.instanceColor && spot.color) {
      color.set(spot.color);
      mesh.setColorAt(i, color);
    }
  });
  mesh.count = spots.length;
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
}

function wingGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.08, 0.16, 0.28, 0.22, 0.42, 0.04);
  shape.bezierCurveTo(0.3, -0.02, 0.28, -0.16, 0.12, -0.12);
  shape.bezierCurveTo(0.05, -0.08, 0.02, -0.02, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 6);
  const pos = geo.attributes.position;
  const arr = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const edge = Math.min(1, Math.abs(pos.getX(i)) / 0.4);
    const v = 1 - edge * 0.78;
    arr[i * 3] = v;
    arr[i * 3 + 1] = v * (1 - edge * 0.15);
    arr[i * 3 + 2] = v * (1 - edge * 0.25);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createButterfly(color, moth) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    vertexColors: true,
    side: THREE.DoubleSide,
  });
  const geoL = wingGeometry();
  const geoR = geoL.clone();
  geoR.scale(-1, 1, 1);
  const wingL = new THREE.Mesh(geoL, mat);
  const wingR = new THREE.Mesh(geoR, mat);
  g.add(wingL, wingR);
  const bodyMat = new THREE.MeshStandardMaterial({ color: moth ? '#6d675e' : '#2a2118', roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.12, 3, 6), bodyMat);
  body.rotation.x = Math.PI / 2;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), bodyMat);
  head.position.z = -0.09;
  g.add(head);
  g.userData.wings = [wingL, wingR];
  g.userData.moth = moth;
  g.scale.setScalar(2.15);
  return g;
}

function createBee() {
  const g = new THREE.Group();
  const yellow = new THREE.MeshStandardMaterial({ color: '#f2c21a', roughness: 0.45 });
  const black = new THREE.MeshStandardMaterial({ color: '#1c1a17', roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), yellow);
  body.scale.set(0.8, 0.8, 1.35);
  g.add(body);
  for (let i = 0; i < 3; i++) {
    const band = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 4), i % 2 ? black : yellow);
    band.scale.set(0.82, 0.82, 0.28);
    band.position.z = -0.03 + i * 0.028;
    g.add(band);
  }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 5), black);
  head.position.z = -0.07;
  g.add(head);
  const wingMat = new THREE.MeshStandardMaterial({
    color: '#f7fbff',
    transparent: true,
    opacity: 0.45,
    roughness: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const wingGeo = new THREE.PlaneGeometry(0.09, 0.045);
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  wingL.position.set(-0.06, 0.03, 0);
  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingR.position.set(0.06, 0.03, 0);
  g.add(wingL, wingR);
  wingL.rotation.x = Math.PI / 2;
  wingR.rotation.x = Math.PI / 2;
  g.userData.wings = [wingL, wingR];
  g.scale.setScalar(3.2);
  return g;
}

export function createMeadow(scene) {
  const sunflowerGeo = buildSunflowerGeometry();
  const sunflowerMat = fieldMaterial(0.045);
  const bladeGeo = buildBlade();
  const grassMat = fieldMaterial(0.18);
  grassMat.roughness = 1;
  const weedMat = fieldMaterial(0.16);
  const whites = buildWildflower('#f7f4ee', '#f0c84a');
  const yellows = buildWildflower('#f2d34a', '#d97820');
  const pinks = buildWildflower('#f3b0c0', '#ffe08a');
  const whiteMat = fieldMaterial(0.07);
  const yellowMat = fieldMaterial(0.07);
  const pinkMat = fieldMaterial(0.07);

  const flowers = [];
  const step = 1.34;
  for (let x = -LAYOUT.fieldX; x <= LAYOUT.fieldX; x += step) {
    for (let z = LAYOUT.fieldZ0; z <= LAYOUT.fieldZ1; z += step) {
      const jx = x + (rng() - 0.5) * 0.45;
      const jz = z + (rng() - 0.5) * 0.45;
      if (onPath(jx, jz)) continue;
      if (jz < 6.6 && Math.abs(jx) < 3.8) continue;
      if (rng() < 0.12) continue;
      flowers.push({
        x: jx,
        z: jz,
        ry: (rng() - 0.5) * 0.7,
        rx: (rng() - 0.5) * 0.12,
        s: 0.82 + rng() * 0.38,
        color: new THREE.Color(0.94 + rng() * 0.06, 0.94 + rng() * 0.06, 0.9 + rng() * 0.08).getStyle(),
      });
    }
  }

  const sunMesh = new THREE.InstancedMesh(sunflowerGeo, sunflowerMat, flowers.length);
  sunMesh.castShadow = true;
  sunMesh.receiveShadow = true;
  scatter(sunMesh, flowers);
  scene.add(sunMesh);

  const grasses = [];
  for (let x = -16; x <= 16; x += 0.46) {
    for (let z = 2.2; z <= 22; z += 0.46) {
      if (rng() > 0.55) continue;
      if (Math.abs(x) < 4.2 && Math.abs(z) < 3.2) continue;
      const edge = Math.abs(x) > 12 || z < 4 || z > 19;
      if (edge && rng() > 0.35) continue;
      grasses.push({
        x: x + (rng() - 0.5) * 0.3,
        z: z + (rng() - 0.5) * 0.3,
        ry: rng() * Math.PI,
        s: 0.32 + rng() * 0.28,
        sy: 0.18 + rng() * 0.28,
        sx: 0.8 + rng() * 0.6,
        sz: 0.8,
        color: rng() > 0.82 ? '#c2b15a' : rng() > 0.5 ? '#d5e7a4' : '#9dbf62',
      });
    }
  }
  const grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, grasses.length);
  grassMesh.receiveShadow = true;
  scatter(grassMesh, grasses);
  scene.add(grassMesh);

  const weeds = [];
  for (let i = 0; i < 420; i++) {
    const x = (rng() - 0.5) * LAYOUT.fieldX * 2.1;
    const z = LAYOUT.fieldZ0 - 1 + rng() * (LAYOUT.fieldZ1 - LAYOUT.fieldZ0 + 3);
    if (Math.abs(x) < 3.5 && z < 6) continue;
    weeds.push({
      x,
      z,
      ry: rng() * Math.PI,
      s: 0.45 + rng() * 0.35,
      sy: 0.32 + rng() * 0.38,
      sx: 1.1,
      sz: 1.1,
      color: rng() > 0.75 ? '#b9a15a' : rng() > 0.4 ? '#dfe8b0' : '#8ea24a',
    });
  }
  const weedMesh = new THREE.InstancedMesh(bladeGeo, weedMat, weeds.length);
  scatter(weedMesh, weeds);
  scene.add(weedMesh);

  const placeWild = (geo, mat, count, palette) => {
    const spots = [];
    for (let i = 0; i < count; i++) {
      const x = (rng() - 0.5) * 22;
      const z = 5 + rng() * 14.5;
      if (onPath(x, z)) continue;
      spots.push({
        x,
        z,
        ry: rng() * Math.PI * 2,
        s: 1.05 + rng() * 0.85,
        color: palette[i % palette.length],
      });
    }
    const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, spots.length));
    mesh.castShadow = true;
    scatter(mesh, spots);
    scene.add(mesh);
  };
  placeWild(whites, whiteMat, 46, ['#ffffff', '#f4f1e4']);
  placeWild(yellows, yellowMat, 40, ['#fff2c4', '#ffe28a']);
  placeWild(pinks, pinkMat, 28, ['#ffe4ea', '#ffd0dc']);

  const tex = getMaterials();
  const stone = tex.stone;
  for (let i = 0; i < 7; i++) {
    const stoneMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.08, 7), stone);
    stoneMesh.position.set((rng() - 0.5) * 0.45, 0.03, 4.6 + i * 1.7);
    stoneMesh.scale.set(1 + rng() * 0.3, 1, 0.75 + rng() * 0.2);
    stoneMesh.receiveShadow = true;
    stoneMesh.castShadow = true;
    scene.add(stoneMesh);
  }

  const fenceMat = registerTint(
    new THREE.MeshStandardMaterial({ color: '#8b5a34', roughness: 0.84 }),
    { snow: 0.35, wet: 0.4 }
  );
  const addFence = (x, z0, z1) => {
    const span = z1 - z0;
    const posts = 6;
    for (let i = 0; i < posts; i++) {
      const z = z0 + (span * i) / (posts - 1);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.95, 6), fenceMat);
      post.position.set(x, 0.48, z);
      post.castShadow = true;
      scene.add(post);
    }
    for (const y of [0.45, 0.78]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, span), fenceMat);
      rail.position.set(x, y, (z0 + z1) / 2);
      rail.castShadow = true;
      scene.add(rail);
    }
  };
  addFence(-12.4, 6.2, 18.4);
  addFence(12.4, 6.2, 18.4);

  const insects = [];
  const beeSpots = flowers.filter((_, i) => i % 2 === 0);
  const species = [
    ['#e36b12', false],
    ['#e36b12', false],
    ['#e36b12', false],
    ['#2f6dff', false],
    ['#2f6dff', false],
    ['#f7f3ea', false],
    ['#f7f3ea', false],
    ['#f0c93a', false],
    ['#f0c93a', false],
    ['#efcf6a', false],
    ['#d9d3c3', true],
    ['#d9d3c3', true],
    ['#c8c2b4', true],
  ];
  const viewFlowers = flowers.filter((flower) => Math.abs(flower.x) < 7 && flower.z > 7 && flower.z < 15);
  species.forEach((spec, i) => {
    const pool = viewFlowers.length ? viewFlowers : flowers;
    const home = pool[i % pool.length] || { x: 0, z: 10 };
    const butterfly = createButterfly(spec[0], spec[1]);
    butterfly.userData.motion = {
      cx: home.x + (rng() - 0.5) * 2,
      cz: home.z + (rng() - 0.5) * 2,
      rx: 1.4 + rng() * 2.2,
      rz: 1.1 + rng() * 1.8,
      ry: 0.35 + rng() * 0.45,
      cy: 1.9 + rng() * 0.85,
      speed: 0.55 + rng() * 0.45,
      phase: rng() * Math.PI * 2,
      drift: rng() * 1.5,
    };
    scene.add(butterfly);
    insects.push({ mesh: butterfly, type: 'butterfly' });
  });

  for (let i = 0; i < 10; i++) {
    const home = beeSpots[i % beeSpots.length] || { x: 1, z: 8 };
    const bee = createBee();
    bee.userData.motion = {
      cx: home.x,
      cz: home.z,
      phase: rng() * 10,
      speed: 2.1 + rng(),
      anchor: i % beeSpots.length,
    };
    scene.add(bee);
    insects.push({ mesh: bee, type: 'bee' });
  }

  const dummy = new THREE.Vector3();
  const ahead = new THREE.Vector3();

  return {
    flowers,
    update(t, live) {
      const showDay = live.insects > 0.18 && live.stars < 0.45;
      const dayQuota = Math.ceil(live.insects * 10);
      let dayIndex = 0;
      let beeIndex = 0;
      const beeQuota = Math.ceil(Math.max(0, live.insects - 0.25) * 10);

      for (const insect of insects) {
        const mesh = insect.mesh;
        const m = mesh.userData.motion;
        if (insect.type === 'butterfly') {
          const moth = mesh.userData.moth;
          if (moth) mesh.visible = live.stars > 0.45;
          else {
            mesh.visible = showDay && dayIndex < dayQuota;
            dayIndex += 1;
          }
          if (!mesh.visible) continue;
          const a = t * m.speed + m.phase;
          dummy.set(
            m.cx + Math.sin(a) * m.rx + Math.sin(a * 0.21) * m.drift,
            m.cy + Math.sin(a * 1.6) * m.ry,
            m.cz + Math.cos(a * 0.82) * m.rz
          );
          ahead.set(
            m.cx + Math.sin(a + 0.12) * m.rx + Math.sin((a + 0.12) * 0.21) * m.drift,
            m.cy + Math.sin((a + 0.12) * 1.6) * m.ry,
            m.cz + Math.cos((a + 0.12) * 0.82) * m.rz
          );
          mesh.position.copy(dummy);
          mesh.lookAt(ahead);
          const flap = Math.sin(t * (moth ? 10 : 16) + m.phase);
          mesh.userData.wings[0].rotation.z = 0.45 + flap * 0.7;
          mesh.userData.wings[1].rotation.z = -0.45 - flap * 0.7;
        } else {
          mesh.visible = beeIndex < beeQuota;
          beeIndex += 1;
          if (!mesh.visible) continue;
          const anchor = beeSpots[m.anchor % beeSpots.length];
          m.cx += (anchor.x - m.cx) * 0.004;
          m.cz += (anchor.z - m.cz) * 0.004;
          if (Math.random() < 0.002) m.anchor = (m.anchor + 1 + Math.floor(Math.random() * 4)) % beeSpots.length;
          const a = t * m.speed + m.phase;
          dummy.set(m.cx + Math.sin(a) * 1.25, 0.95 + Math.sin(a * 2.4) * 0.18, m.cz + Math.sin(a * 2) * 0.7);
          ahead.set(
            m.cx + Math.sin(a + 0.15) * 1.25,
            0.95 + Math.sin((a + 0.15) * 2.4) * 0.18,
            m.cz + Math.sin((a + 0.15) * 2) * 0.7
          );
          mesh.position.copy(dummy);
          mesh.lookAt(ahead);
          const flap = Math.sin(t * 45 + m.phase);
          mesh.userData.wings[0].rotation.z = flap * 0.8;
          mesh.userData.wings[1].rotation.z = -flap * 0.8;
        }
      }
    },
  };
}
