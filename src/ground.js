import * as THREE from 'three';
import { envUniforms, registerTint } from './env.js';
import { LAYOUT } from './layout.js';

export function createGround(scene) {
  const geo = new THREE.PlaneGeometry(1800, 1800, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    metalness: 0,
  });

  const pathHalf = LAYOUT.pathHalf.toFixed(2);
  const pathZ0 = LAYOUT.pathZ0.toFixed(2);
  const pathZ1 = LAYOUT.pathZ1.toFixed(2);

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSnow = envUniforms.uSnow;
    shader.uniforms.uWet = envUniforms.uWet;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWorldPos;')
      .replace(
        '#include <worldpos_vertex>',
        `vec4 fcWorld = modelMatrix * vec4(transformed, 1.0);
        vWorldPos = fcWorld.xyz;
        #include <worldpos_vertex>`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPos;
        uniform float uSnow;
        uniform float uWet;
        float hash(vec2 p){return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);}
        float noise(vec2 p){
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p){
          float v = 0.0; float a = 0.5;
          for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.05; a *= 0.5; }
          return v;
        }`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        vec2 xz = vWorldPos.xz;
        float n = fbm(xz * 0.075);
        float n2 = fbm(xz * 0.32 + 4.0);
        vec3 grassA = vec3(0.30, 0.50, 0.16);
        vec3 grassB = vec3(0.15, 0.34, 0.09);
        vec3 grassC = vec3(0.45, 0.62, 0.18);
        vec3 col = mix(grassA, grassB, n);
        col = mix(col, grassC, smoothstep(0.55, 0.9, n2) * 0.55);
        float meadow = smoothstep(20.0, 6.0, length((xz - vec2(0.0, 12.0)) * vec2(0.9, 1.05)));
        col = mix(col, col * vec3(1.08, 1.1, 0.9), meadow * 0.4);
        float cabinDirt = smoothstep(8.0, 2.4, length(xz - vec2(0.0, 0.4)));
        col = mix(col, vec3(0.34, 0.25, 0.15), cabinDirt * 0.42);
        float path = smoothstep(${pathHalf}, ${pathHalf} * 0.42, abs(xz.x));
        path *= smoothstep(${(LAYOUT.pathZ0 - 1.2).toFixed(2)}, ${pathZ0}, xz.y);
        path *= smoothstep(${(LAYOUT.pathZ1 + 1.4).toFixed(2)}, ${pathZ1}, xz.y);
        vec3 dirt = vec3(0.45, 0.32, 0.18);
        dirt = mix(dirt, dirt * 0.72, smoothstep(0.78, 0.97, hash(floor(xz * 5.5))));
        col = mix(col, dirt, path * 0.88);
        float shade = smoothstep(16.0, 34.0, length(xz - vec2(0.0, -6.0)));
        col *= mix(1.0, 0.7, shade);
        col = mix(col, vec3(0.90, 0.93, 0.96), uSnow * (0.62 + 0.38 * n));
        col *= mix(1.0, 0.58, uWet);
        diffuseColor.rgb = col;`
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        float pathMask = smoothstep(${pathHalf}, 0.3, abs(vWorldPos.x));
        roughnessFactor = mix(roughnessFactor, 0.22, uWet * (1.0 - pathMask * 0.25));`
      );
  };
  mat.customProgramCacheKey = () => 'ground-v1';

  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.name = 'ground';
  scene.add(mesh);

  const hillMat = registerTint(
    new THREE.MeshStandardMaterial({ color: '#6d8b5c', roughness: 1, flatShading: true }),
    { snow: 0.95, wet: 0.22 }
  );
  const hillGeo = new THREE.SphereGeometry(1, 7, 5);
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2 + 0.4;
    const dist = 68 + (i % 3) * 10;
    const x = Math.cos(a) * dist;
    const z = Math.sin(a) * dist * 0.92;
    if (z > 18 && Math.abs(x) < 42) continue;
    const radius = 16 + (i % 4) * 6;
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.scale.set(radius, radius * 0.38, radius * 0.86);
    hill.position.set(x, -radius * 0.22, z);
    scene.add(hill);
  }

  return mesh;
}
