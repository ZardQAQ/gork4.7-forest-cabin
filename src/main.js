import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createAtmosphere, WEATHERS } from './atmosphere.js';
import { createGround } from './ground.js';
import { createCabin } from './cabin.js';
import { createForest } from './forest.js';
import { createMeadow } from './meadow.js';
import { updateTints } from './env.js';

const params = new URLSearchParams(location.search);
const initialWeather = WEATHERS.some((item) => item.id === params.get('weather'))
  ? params.get('weather')
  : 'sunny';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.12, 700);
const cameras = {
  hero: { pos: [8.4, 5.15, 17.2], target: [0.1, 2.15, 1.4] },
  close: { pos: [2.2, 1.45, 8.6], target: [0.4, 1.15, 5.8] },
  cabin: { pos: [4.6, 2.55, 9.2], target: [0, 2.05, 1.2] },
};
const camPreset = cameras[params.get('cam')] || cameras.hero;
camera.position.set(...camPreset.pos);

const controls = new OrbitControls(camera, canvas);
controls.target.set(...camPreset.target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI / 2 - 0.04;
controls.minDistance = 3.2;
controls.maxDistance = 48;
controls.autoRotate = !reduceMotion && params.get('shot') !== '1';
controls.autoRotateSpeed = 0.28;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
});

const atmosphere = createAtmosphere(scene, renderer, camera);
createGround(scene);
const cabin = createCabin(scene);
const forest = createForest(scene);
const meadow = createMeadow(scene);
atmosphere.setSmokeOrigin(cabin.smokeOrigin);
atmosphere.snap(initialWeather);

const titleCard = document.querySelector('#title-card');
const dock = document.querySelector('#dock');
const caption = document.createElement('p');
caption.id = 'caption';

const eyebrow = document.createElement('p');
eyebrow.className = 'eyebrow';
eyebrow.textContent = '林间日记';
const heading = document.createElement('h1');
heading.textContent = '森林小屋';
titleCard.append(eyebrow, heading, caption);

const buttons = new Map();
for (const weather of WEATHERS) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'weather-btn';
  button.dataset.id = weather.id;
  button.setAttribute('aria-pressed', weather.id === initialWeather ? 'true' : 'false');
  const icon = document.createElement('span');
  icon.className = 'emoji';
  icon.textContent = weather.icon;
  const label = document.createElement('span');
  label.textContent = weather.name;
  button.append(icon, label);
  button.addEventListener('click', () => selectWeather(weather.id));
  dock.append(button);
  buttons.set(weather.id, button);
}

function selectWeather(id) {
  const weather = WEATHERS.find((item) => item.id === id);
  if (!weather) return;
  atmosphere.setWeather(id);
  document.body.dataset.weather = id;
  for (const [key, button] of buttons) button.setAttribute('aria-pressed', key === id ? 'true' : 'false');
  caption.classList.add('fade');
  window.setTimeout(() => {
    caption.textContent = weather.caption;
    caption.classList.remove('fade');
  }, 160);
}

selectWeather(initialWeather);
caption.classList.remove('fade');
caption.textContent = WEATHERS.find((item) => item.id === initialWeather).caption;

window.addEventListener('keydown', (event) => {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
  const index = Number(event.key) - 1;
  if (index >= 0 && index < WEATHERS.length) selectWeather(WEATHERS[index].id);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const live = atmosphere.update(dt, t);
  updateTints(live);
  cabin.update(t, live);
  forest.update(t, live);
  meadow.update(t, live);
  controls.update();
  renderer.render(scene, camera);
}

frame();
canvas.classList.add('ready');
renderer.setAnimationLoop(() => frame());
