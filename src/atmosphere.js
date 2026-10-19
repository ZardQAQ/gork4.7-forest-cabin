import * as THREE from 'three';
import { createSky } from './sky.js';
import { envUniforms } from './env.js';

const COLOR_KEYS = [
  'skyTop',
  'skyHorizon',
  'sunColor',
  'ambientColor',
  'hemiSky',
  'hemiGround',
  'fogColor',
  'cloudColor',
  'discColor',
];

const NUM_KEYS = [
  'sunIntensity',
  'sunElevation',
  'sunAzimuth',
  'ambient',
  'hemiIntensity',
  'fogDensity',
  'cloud',
  'stars',
  'disc',
  'discPower',
  'rain',
  'snow',
  'lightning',
  'wind',
  'wet',
  'insects',
  'fireflies',
  'windowGlow',
  'exposure',
  'smoke',
  'leaves',
];

function weather(partial) {
  return {
    skyTop: '#3c92ea',
    skyHorizon: '#c6e6ff',
    sunColor: '#fff4d6',
    ambientColor: '#fff6ea',
    hemiSky: '#b7d4ff',
    hemiGround: '#6a8f45',
    fogColor: '#c6e6ff',
    cloudColor: '#ffffff',
    discColor: '#fff6d8',
    sunIntensity: 2.6,
    sunElevation: 0.75,
    sunAzimuth: 0.55,
    ambient: 0.28,
    hemiIntensity: 0.45,
    fogDensity: 0.012,
    cloud: 0.22,
    stars: 0,
    disc: 1,
    discPower: 1400,
    rain: 0,
    snow: 0,
    lightning: 0,
    wind: 0.3,
    wet: 0,
    insects: 1,
    fireflies: 0,
    windowGlow: 0.15,
    exposure: 1.05,
    smoke: 0.4,
    leaves: 0.1,
    ...partial,
  };
}

export const WEATHERS = [
  {
    id: 'sunny',
    name: '晴空',
    icon: '☀️',
    caption: '阳光落在向日葵田里，蜜蜂正忙着采蜜',
    ...weather({}),
  },
  {
    id: 'golden',
    name: '黄昏',
    icon: '🌅',
    caption: '天色转暖，小屋的窗户亮了起来',
    ...weather({
      skyTop: '#3d4f86',
      skyHorizon: '#ffb067',
      sunColor: '#ff9a3c',
      ambientColor: '#ffd0a0',
      hemiSky: '#ffb07a',
      hemiGround: '#6a4a32',
      fogColor: '#f0a36a',
      cloudColor: '#ffd0aa',
      discColor: '#ffb15a',
      sunIntensity: 2.35,
      sunElevation: 0.2,
      sunAzimuth: 1.15,
      ambient: 0.22,
      hemiIntensity: 0.38,
      fogDensity: 0.016,
      cloud: 0.28,
      disc: 1.2,
      discPower: 700,
      wind: 0.42,
      insects: 0.85,
      windowGlow: 0.8,
      exposure: 1.08,
      smoke: 0.65,
      leaves: 0.75,
    }),
  },
  {
    id: 'cloudy',
    name: '阴天',
    icon: '☁️',
    caption: '云层压得很低，林子安静下来',
    ...weather({
      skyTop: '#8e98a4',
      skyHorizon: '#c5ccd3',
      sunColor: '#e6ebef',
      ambientColor: '#d5dbe2',
      hemiSky: '#c5ccd3',
      hemiGround: '#66745a',
      fogColor: '#c5ccd3',
      cloudColor: '#e7ebef',
      discColor: '#f2f4f6',
      sunIntensity: 0.85,
      sunElevation: 0.7,
      sunAzimuth: 0.4,
      ambient: 0.38,
      hemiIntensity: 0.42,
      fogDensity: 0.02,
      cloud: 0.95,
      disc: 0.12,
      discPower: 220,
      wind: 0.55,
      insects: 0.55,
      windowGlow: 0.42,
      exposure: 0.96,
      smoke: 0.5,
      leaves: 0.25,
    }),
  },
  {
    id: 'rain',
    name: '细雨',
    icon: '🌧️',
    caption: '雨丝穿过树冠，花瓣上挂着水珠',
    ...weather({
      skyTop: '#4d5966',
      skyHorizon: '#7e8b96',
      sunColor: '#c5d0d8',
      ambientColor: '#b7c3cc',
      hemiSky: '#80909c',
      hemiGround: '#4d5a48',
      fogColor: '#73828c',
      cloudColor: '#9aa6b0',
      discColor: '#d5dee6',
      sunIntensity: 0.35,
      sunElevation: 0.62,
      sunAzimuth: 0.3,
      ambient: 0.28,
      hemiIntensity: 0.3,
      fogDensity: 0.028,
      cloud: 1,
      disc: 0.04,
      discPower: 80,
      rain: 1,
      wind: 0.9,
      wet: 0.78,
      insects: 0.06,
      windowGlow: 0.9,
      exposure: 0.86,
      smoke: 0.7,
      leaves: 0.35,
    }),
  },
  {
    id: 'storm',
    name: '雷暴',
    icon: '⛈️',
    caption: '狂风掠过林间，闪电照亮了屋顶',
    ...weather({
      skyTop: '#1b2430',
      skyHorizon: '#3c4856',
      sunColor: '#9aa8b8',
      ambientColor: '#6d7c8c',
      hemiSky: '#445060',
      hemiGround: '#2c332c',
      fogColor: '#3a4652',
      cloudColor: '#66717c',
      discColor: '#d0d8e0',
      sunIntensity: 0.12,
      sunElevation: 0.55,
      sunAzimuth: -0.4,
      ambient: 0.12,
      hemiIntensity: 0.16,
      fogDensity: 0.032,
      cloud: 1,
      disc: 0,
      discPower: 40,
      rain: 1,
      lightning: 1,
      wind: 1.75,
      wet: 0.9,
      insects: 0,
      windowGlow: 1.05,
      exposure: 0.74,
      smoke: 0.28,
      leaves: 1,
    }),
  },
  {
    id: 'fog',
    name: '晨雾',
    icon: '🌫️',
    caption: '雾气漫过空地，远处的树只剩轮廓',
    ...weather({
      skyTop: '#c9d0d4',
      skyHorizon: '#e6e9ea',
      sunColor: '#f4f1ea',
      ambientColor: '#e4e7e6',
      hemiSky: '#d5dbdc',
      hemiGround: '#8d9784',
      fogColor: '#dfe4e4',
      cloudColor: '#f7f8f8',
      discColor: '#fffaf2',
      sunIntensity: 0.55,
      sunElevation: 0.5,
      sunAzimuth: 0.2,
      ambient: 0.42,
      hemiIntensity: 0.36,
      fogDensity: 0.062,
      cloud: 0.25,
      disc: 0.25,
      discPower: 160,
      wind: 0.12,
      wet: 0.22,
      insects: 0.4,
      fireflies: 0.12,
      windowGlow: 0.55,
      exposure: 0.98,
      smoke: 0.35,
      leaves: 0.05,
    }),
  },
  {
    id: 'snow',
    name: '飞雪',
    icon: '❄️',
    caption: '雪花悄悄堆在屋顶、枝头和花田上',
    ...weather({
      skyTop: '#b7c6d6',
      skyHorizon: '#e7eef5',
      sunColor: '#e7f0ff',
      ambientColor: '#e7eef6',
      hemiSky: '#d5e2f0',
      hemiGround: '#b7c3b4',
      fogColor: '#e4ebf2',
      cloudColor: '#f5f8fb',
      discColor: '#ffffff',
      sunIntensity: 1.15,
      sunElevation: 0.48,
      sunAzimuth: 0.8,
      ambient: 0.4,
      hemiIntensity: 0.48,
      fogDensity: 0.026,
      cloud: 0.72,
      disc: 0.65,
      discPower: 640,
      snow: 0.92,
      wind: 0.48,
      wet: 0.12,
      insects: 0,
      windowGlow: 0.95,
      exposure: 1.02,
      smoke: 0.9,
      leaves: 0.12,
    }),
  },
  {
    id: 'night',
    name: '星夜',
    icon: '🌙',
    caption: '窗火未灭，萤火虫在草丛里亮起',
    ...weather({
      skyTop: '#070b18',
      skyHorizon: '#1a2340',
      sunColor: '#b9c8ef',
      ambientColor: '#1c2744',
      hemiSky: '#24345c',
      hemiGround: '#1a140e',
      fogColor: '#12182c',
      cloudColor: '#2a3550',
      discColor: '#f4f7ff',
      sunIntensity: 0.42,
      sunElevation: 0.85,
      sunAzimuth: -0.9,
      ambient: 0.06,
      hemiIntensity: 0.1,
      fogDensity: 0.02,
      cloud: 0.18,
      stars: 1,
      disc: 0.9,
      discPower: 280,
      wind: 0.2,
      insects: 0.02,
      fireflies: 1,
      windowGlow: 1.3,
      exposure: 0.82,
      smoke: 0.85,
      leaves: 0.05,
    }),
  },
];

const PRESETS = Object.fromEntries(WEATHERS.map((item) => [item.id, item]));

function blankState() {
  const state = {};
  for (const key of COLOR_KEYS) state[key] = new THREE.Color();
  for (const key of NUM_KEYS) state[key] = 0;
  return state;
}

function copyPreset(dst, preset) {
  for (const key of COLOR_KEYS) dst[key].set(preset[key]);
  for (const key of NUM_KEYS) dst[key] = preset[key];
}

function lerpAngle(a, b, t) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

function makeSoftCircle() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.75)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createAtmosphere(scene, renderer, camera) {
  const sky = createSky(scene);
  const ambient = new THREE.AmbientLight('#fff6ea', 0.3);
  const hemi = new THREE.HemisphereLight('#b7d4ff', '#6a8f45', 0.45);
  const sun = new THREE.DirectionalLight('#fff4d6', 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 28;
  sun.shadow.camera.bottom = -28;
  sun.shadow.bias = -0.00035;
  sun.shadow.normalBias = 0.035;
  sun.target.position.set(0, 1.5, 2);
  scene.add(ambient, hemi, sun, sun.target);
  scene.fog = new THREE.FogExp2('#d7ecff', 0.012);

  const flashLight = new THREE.PointLight('#d7e6ff', 0, 70, 2);
  flashLight.position.set(0, 16, -4);
  scene.add(flashLight);

  const rainCount = 1400;
  const rainPos = new Float32Array(rainCount * 6);
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: '#d5e2ee', transparent: true, opacity: 0.35 });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  rain.visible = false;
  scene.add(rain);
  const drops = Array.from({ length: rainCount }, () => ({
    x: (Math.random() - 0.5) * 46,
    y: Math.random() * 22,
    z: (Math.random() - 0.5) * 46,
    v: 16 + Math.random() * 12,
  }));

  const snowCount = 1100;
  const snowPos = new Float32Array(snowCount * 3);
  const snowGeo = new THREE.BufferGeometry();
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  const snowMat = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 0.16,
    map: makeSoftCircle(),
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const snow = new THREE.Points(snowGeo, snowMat);
  snow.frustumCulled = false;
  snow.visible = false;
  scene.add(snow);
  const flakes = Array.from({ length: snowCount }, () => ({
    x: (Math.random() - 0.5) * 48,
    y: Math.random() * 20,
    z: (Math.random() - 0.5) * 48,
    v: 0.6 + Math.random() * 0.9,
    phase: Math.random() * Math.PI * 2,
    spin: 0.4 + Math.random(),
  }));

  const flyCount = 70;
  const flyPos = new Float32Array(flyCount * 3);
  const flyCol = new Float32Array(flyCount * 3);
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.BufferAttribute(flyPos, 3));
  flyGeo.setAttribute('color', new THREE.BufferAttribute(flyCol, 3));
  const flyMat = new THREE.PointsMaterial({
    size: 0.12,
    map: makeSoftCircle(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const fireflies = new THREE.Points(flyGeo, flyMat);
  fireflies.frustumCulled = false;
  scene.add(fireflies);
  const flies = Array.from({ length: flyCount }, () => ({
    x: (Math.random() - 0.5) * 22,
    y: 0.35 + Math.random() * 1.5,
    z: 4 + Math.random() * 15,
    phase: Math.random() * Math.PI * 2,
    speed: 1.2 + Math.random() * 2.2,
  }));

  const leafCount = 40;
  const leafGeo = new THREE.ShapeGeometry(
    new THREE.Shape([
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.08, 0.12),
      new THREE.Vector2(0, 0.26),
      new THREE.Vector2(-0.08, 0.12),
    ])
  );
  const leafMat = new THREE.MeshStandardMaterial({
    color: '#c47b3a',
    roughness: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0,
  });
  const leavesMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leavesMesh.frustumCulled = false;
  scene.add(leavesMesh);
  const leaves = Array.from({ length: leafCount }, () => ({
    x: (Math.random() - 0.5) * 24,
    y: 1 + Math.random() * 6,
    z: 2 + Math.random() * 16,
    phase: Math.random() * 6,
    s: 0.6 + Math.random() * 0.8,
  }));
  const leafDummy = new THREE.Object3D();

  const smokeCount = 48;
  const smokePos = new Float32Array(smokeCount * 3);
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
  const smokeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uOpacity: { value: 0.2 } },
    vertexShader: `
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(680.0 / max(1.0, -mv.z), 3.0, 42.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        float alpha = smoothstep(0.5, 0.08, d) * uOpacity;
        if (alpha < 0.03) discard;
        gl_FragColor = vec4(vec3(0.94, 0.94, 0.92), alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const smoke = new THREE.Points(smokeGeo, smokeMat);
  smoke.frustumCulled = false;
  scene.add(smoke);
  const puffs = Array.from({ length: smokeCount }, () => ({ life: Math.random(), seed: Math.random() * 10 }));
  let smokeOrigin = new THREE.Vector3(2.05, 6.4, -1.05);

  const boltGeo = new THREE.BufferGeometry();
  const bolt = new THREE.Line(boltGeo, new THREE.LineBasicMaterial({ color: '#e7f1ff', transparent: true, opacity: 0 }));
  bolt.frustumCulled = false;
  scene.add(bolt);

  const live = blankState();
  const target = blankState();
  const state = {
    id: 'sunny',
    live,
    target,
    flash: 0,
    flickerAt: 0,
  };
  copyPreset(live, PRESETS.sunny);
  copyPreset(target, PRESETS.sunny);

  function strike(now) {
    state.flash = 1;
    state.flickerAt = now + 0.11 + Math.random() * 0.08;
    const pts = [];
    let x = (Math.random() - 0.5) * 24;
    let y = 28;
    let z = -8 - Math.random() * 12;
    pts.push(new THREE.Vector3(x, y, z));
    for (let i = 0; i < 7; i++) {
      x += (Math.random() - 0.5) * 3.2;
      y -= 3.2 + Math.random() * 1.4;
      z += (Math.random() - 0.4) * 1.6;
      pts.push(new THREE.Vector3(x, y, z));
    }
    bolt.geometry.setFromPoints(pts);
    flashLight.position.set(x, 12, z);
  }

  function apply(now) {
    const L = live;
    ambient.color.copy(L.ambientColor);
    ambient.intensity = L.ambient + state.flash * 0.85;
    hemi.color.copy(L.hemiSky);
    hemi.groundColor.copy(L.hemiGround);
    hemi.intensity = L.hemiIntensity;
    sun.color.copy(L.sunColor);
    sun.intensity = L.sunIntensity + state.flash * 14;
    const radius = 46;
    sun.position.set(
      Math.cos(L.sunElevation) * Math.sin(L.sunAzimuth) * radius,
      Math.sin(L.sunElevation) * radius + 2,
      Math.cos(L.sunElevation) * Math.cos(L.sunAzimuth) * radius
    );
    scene.fog.color.copy(L.fogColor);
    scene.fog.density = L.fogDensity;
    renderer.toneMappingExposure = L.exposure + state.flash * 1.35;

    const uniforms = sky.uniforms;
    uniforms.uTop.value.copy(L.skyTop);
    uniforms.uHorizon.value.copy(L.fogColor);
    uniforms.uSunColor.value.copy(L.discColor);
    uniforms.uCloudColor.value.copy(L.cloudColor);
    uniforms.uSunDir.value.copy(sun.position).normalize();
    uniforms.uDisc.value = L.disc;
    uniforms.uDiscPower.value = Math.max(8, L.discPower);
    uniforms.uCloud.value = L.cloud;
    uniforms.uStars.value = L.stars;
    uniforms.uTime.value = now;
    uniforms.uFlash.value = state.flash;

    envUniforms.uTime.value = now;
    envUniforms.uWind.value = L.wind;
    envUniforms.uSnow.value = L.snow;
    envUniforms.uWet.value = L.wet;

    flashLight.intensity = state.flash * 48;
    bolt.material.opacity = state.flash > 0.2 ? 1 : 0;
    sky.mesh.position.copy(camera.position);
  }

  return {
    state,
    snap(id) {
      const preset = PRESETS[id] || PRESETS.sunny;
      state.id = preset.id;
      copyPreset(live, preset);
      copyPreset(target, preset);
      apply(0);
    },
    setWeather(id) {
      const preset = PRESETS[id];
      if (!preset) return;
      state.id = id;
      copyPreset(target, preset);
    },
    setSmokeOrigin(origin) {
      smokeOrigin = origin;
    },
    update(dt, now) {
      const k = 1 - Math.exp(-dt * 2.1);
      for (const key of COLOR_KEYS) live[key].lerp(target[key], k);
      for (const key of NUM_KEYS) {
        if (key === 'sunAzimuth') live[key] = lerpAngle(live[key], target[key], k);
        else live[key] += (target[key] - live[key]) * k;
      }
      if (live.lightning > 0.5 && state.flash < 0.08 && Math.random() < dt * 0.45) strike(now);
      if (state.flickerAt && now > state.flickerAt) {
        state.flash = Math.max(state.flash, 0.75);
        state.flickerAt = 0;
      }
      state.flash *= Math.exp(-dt * 7.5);
      apply(now);

      rain.visible = live.rain > 0.04;
      rainMat.opacity = live.rain * 0.4;
      if (rain.visible) {
        rain.position.set(camera.position.x, 0, camera.position.z);
        const blow = live.wind * 2.4;
        for (let i = 0; i < rainCount; i++) {
          const drop = drops[i];
          drop.y -= drop.v * dt * (0.55 + live.rain);
          drop.x += blow * dt;
          if (drop.y < -1) {
            drop.y = 18 + Math.random() * 8;
            drop.x = (Math.random() - 0.5) * 46;
            drop.z = (Math.random() - 0.5) * 46;
          }
          const o = i * 6;
          rainPos[o] = drop.x;
          rainPos[o + 1] = drop.y;
          rainPos[o + 2] = drop.z;
          rainPos[o + 3] = drop.x - blow * 0.08;
          rainPos[o + 4] = drop.y + 0.85;
          rainPos[o + 5] = drop.z;
        }
        rainGeo.attributes.position.needsUpdate = true;
      }

      snow.visible = live.snow > 0.04;
      snowMat.opacity = Math.min(1, live.snow);
      if (snow.visible) {
        snow.position.set(camera.position.x, 0, camera.position.z);
        for (let i = 0; i < snowCount; i++) {
          const flake = flakes[i];
          flake.y -= flake.v * dt * (0.35 + live.snow);
          flake.x += Math.sin(now * flake.spin + flake.phase) * dt * (0.4 + live.wind);
          if (flake.y < 0) {
            flake.y = 16 + Math.random() * 6;
            flake.x = (Math.random() - 0.5) * 48;
            flake.z = (Math.random() - 0.5) * 48;
          }
          snowPos[i * 3] = flake.x;
          snowPos[i * 3 + 1] = flake.y;
          snowPos[i * 3 + 2] = flake.z;
        }
        snowGeo.attributes.position.needsUpdate = true;
      }

      const glow = live.fireflies;
      fireflies.visible = glow > 0.02;
      if (fireflies.visible) {
        for (let i = 0; i < flyCount; i++) {
          const fly = flies[i];
          const blink = Math.pow(Math.max(0, Math.sin(now * fly.speed + fly.phase)), 10);
          flyPos[i * 3] = fly.x + Math.sin(now * 0.35 + fly.phase) * 0.35;
          flyPos[i * 3 + 1] = fly.y + Math.sin(now * 0.8 + fly.phase) * 0.12;
          flyPos[i * 3 + 2] = fly.z + Math.cos(now * 0.28 + fly.phase) * 0.35;
          const b = blink * glow;
          flyCol[i * 3] = 0.75 * b;
          flyCol[i * 3 + 1] = 1 * b;
          flyCol[i * 3 + 2] = 0.45 * b;
        }
        flyGeo.attributes.position.needsUpdate = true;
        flyGeo.attributes.color.needsUpdate = true;
      }

      leafMat.opacity = live.leaves * 0.95;
      leavesMesh.visible = live.leaves > 0.03;
      if (leavesMesh.visible) {
        for (let i = 0; i < leafCount; i++) {
          const leaf = leaves[i];
          leaf.x += live.wind * dt * (1.2 + (i % 3) * 0.3);
          leaf.y += Math.sin(now + leaf.phase) * dt * 0.35 - dt * 0.22;
          leaf.z += Math.cos(now * 0.7 + leaf.phase) * dt * 0.55;
          if (leaf.y < 0.15 || Math.abs(leaf.x) > 20) {
            leaf.x = -12 + Math.random() * 8;
            leaf.y = 3 + Math.random() * 5;
            leaf.z = 3 + Math.random() * 14;
          }
          leafDummy.position.set(leaf.x, leaf.y, leaf.z);
          leafDummy.rotation.set(now + leaf.phase, now * 0.6, leaf.phase);
          leafDummy.scale.setScalar(leaf.s);
          leafDummy.updateMatrix();
          leavesMesh.setMatrixAt(i, leafDummy.matrix);
        }
        leavesMesh.instanceMatrix.needsUpdate = true;
      }

      smokeMat.uniforms.uOpacity.value = 0.08 + live.smoke * 0.35;
      smoke.visible = live.smoke > 0.05;
      if (smoke.visible) {
        for (let i = 0; i < smokeCount; i++) {
          const puff = puffs[i];
          puff.life += dt * (0.18 + live.wind * 0.05);
          if (puff.life > 1) puff.life -= 1;
          const life = puff.life;
          smokePos[i * 3] = smokeOrigin.x + Math.sin(now * 0.6 + puff.seed) * life * 0.45;
          smokePos[i * 3 + 1] = smokeOrigin.y + life * 2.4;
          smokePos[i * 3 + 2] = smokeOrigin.z + Math.cos(now * 0.4 + puff.seed) * life * 0.35;
        }
        smokeGeo.attributes.position.needsUpdate = true;
      }

      return live;
    },
  };
}
