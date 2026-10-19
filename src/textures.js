import * as THREE from 'three';
import { canvasTexture, heightToNormal } from './utils.js';

let cache = null;

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function logWall() {
  const c = canvas(256, 512);
  const g = c.getContext('2d');
  const rows = 8;
  const band = c.height / rows;
  for (let i = 0; i < rows; i++) {
    const y = i * band;
    const grad = g.createLinearGradient(0, y, 0, y + band);
    const shift = i % 2 === 0 ? 12 : -8;
    grad.addColorStop(0, `rgb(${156 + shift}, ${104 + shift * 0.4}, ${62})`);
    grad.addColorStop(0.45, `rgb(${118 + shift * 0.3}, ${74}, ${40})`);
    grad.addColorStop(1, `rgb(${78}, ${46}, ${24})`);
    g.fillStyle = grad;
    g.fillRect(0, y + 1, c.width, band - 3);
    g.fillStyle = 'rgba(48, 24, 10, 0.28)';
    g.beginPath();
    g.ellipse(40 + ((i * 47) % 180), y + band * 0.55, 7, 4.5, 0.2, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(40, 18, 8, 0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y + band - 1);
    g.lineTo(c.width, y + band - 1);
    g.stroke();
  }
  return {
    map: canvasTexture(c, { repeat: [1.6, 1] }),
    normal: heightToNormal(c, 3.2),
  };
}

function roofShingles() {
  const c = canvas(256, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#5c4638';
  g.fillRect(0, 0, 256, 256);
  const rows = 8;
  const rh = 256 / rows;
  for (let y = 0; y < rows; y++) {
    const offset = y % 2 ? 16 : 0;
    for (let x = -1; x < 9; x++) {
      const px = x * 32 + offset;
      g.fillStyle = y % 3 === 0 ? '#6a5344' : '#4a382e';
      g.fillRect(px + 1, y * rh + 1, 30, rh - 3);
      g.strokeStyle = 'rgba(20, 12, 8, 0.45)';
      g.strokeRect(px + 1.5, y * rh + 1.5, 29, rh - 4);
    }
  }
  return {
    map: canvasTexture(c, { repeat: [3, 2] }),
    normal: heightToNormal(c, 2.4),
  };
}

function stone() {
  const c = canvas(256, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#8d8680';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 42; i++) {
    const x = (i * 53) % 256;
    const y = (i * 97) % 256;
    const rad = 16 + (i % 5) * 6;
    g.fillStyle = i % 2 ? '#7b746e' : '#a39c94';
    g.beginPath();
    g.ellipse(x, y, rad, rad * 0.72, i, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(50, 44, 40, 0.35)';
    g.stroke();
  }
  return {
    map: canvasTexture(c, { repeat: [1.5, 1.2] }),
    normal: heightToNormal(c, 2.8),
  };
}

function planks() {
  const c = canvas(256, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#6b4128';
  g.fillRect(0, 0, 256, 256);
  const cols = 5;
  const w = 256 / cols;
  for (let i = 0; i < cols; i++) {
    g.fillStyle = i % 2 ? '#7a4d30' : '#5c3822';
    g.fillRect(i * w + 1, 0, w - 2, 256);
    g.strokeStyle = 'rgba(90, 50, 24, 0.4)';
    g.beginPath();
    g.moveTo(i * w + w * 0.5, 0);
    g.bezierCurveTo(i * w + 8, 80, i * w + w - 6, 150, i * w + w * 0.45, 256);
    g.stroke();
  }
  return {
    map: canvasTexture(c, { repeat: [1, 1] }),
    normal: heightToNormal(c, 1.8),
  };
}

function bark() {
  const c = canvas(128, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#6d503c';
  g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 18; i++) {
    g.strokeStyle = `rgba(40, 24, 14, ${0.25 + (i % 4) * 0.08})`;
    g.lineWidth = 2 + (i % 3);
    g.beginPath();
    const x = (i * 17) % 128;
    g.moveTo(x, 0);
    g.bezierCurveTo(x + 6, 60, x - 8, 140, x + 2, 256);
    g.stroke();
  }
  g.fillStyle = 'rgba(90, 60, 40, 0.35)';
  for (let i = 0; i < 10; i++) {
    g.fillRect((i * 29) % 120, (i * 41) % 240, 8, 18);
  }
  return {
    map: canvasTexture(c, { repeat: [1, 2] }),
    normal: heightToNormal(c, 3.4),
  };
}

function birch() {
  const c = canvas(128, 256);
  const g = c.getContext('2d');
  g.fillStyle = '#efe8dc';
  g.fillRect(0, 0, 128, 256);
  g.strokeStyle = 'rgba(40, 36, 32, 0.75)';
  g.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    const y = 18 + i * 26 + (i % 2) * 6;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(30, y - 4, 80, y + 5, 128, y - 2);
    g.stroke();
    g.strokeStyle = 'rgba(40, 36, 32, 0.35)';
    g.lineWidth = 1.5;
  }
  return {
    map: canvasTexture(c, { repeat: [1, 2] }),
    normal: heightToNormal(c, 2.2),
  };
}

function textured(map, normal, overrides = {}) {
  const mat = new THREE.MeshStandardMaterial({
    map,
    normalMap: normal,
    roughness: 0.86,
    metalness: 0,
    color: '#ffffff',
    ...overrides,
  });
  if (normal) {
    normal.repeat.copy(map.repeat);
    mat.normalScale = new THREE.Vector2(0.7, 0.7);
  }
  return mat;
}

export function getMaterials() {
  if (cache) return cache;
  const log = logWall();
  const roof = roofShingles();
  const rock = stone();
  const wood = planks();
  const barkTex = bark();
  const birchTex = birch();

  cache = {
    log: textured(log.map, log.normal, { roughness: 0.84 }),
    roof: textured(roof.map, roof.normal, { roughness: 0.92, color: '#d9d3cc' }),
    stone: textured(rock.map, rock.normal, { roughness: 0.98 }),
    plank: textured(wood.map, wood.normal, { roughness: 0.8 }),
    bark: textured(barkTex.map, barkTex.normal, { roughness: 0.96, color: '#e4d2c2' }),
    birch: textured(birchTex.map, birchTex.normal, { roughness: 0.72 }),
    trim: new THREE.MeshStandardMaterial({ color: '#3d2818', roughness: 0.72 }),
    dark: new THREE.MeshStandardMaterial({ color: '#24160f', roughness: 0.8 }),
  };
  return cache;
}
