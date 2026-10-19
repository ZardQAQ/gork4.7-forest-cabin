import * as THREE from 'three';

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uCloudColor;
  uniform float uDisc;
  uniform float uDiscPower;
  uniform float uCloud;
  uniform float uStars;
  uniform float uTime;
  uniform float uFlash;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float hash3(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vDir);
    float h = smoothstep(-0.05, 0.62, dir.y);
    vec3 col = mix(uHorizon, uTop, h);
    col = mix(col, uHorizon, pow(1.0 - max(dir.y, 0.0), 6.0) * 0.35);

    float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
    float disc = pow(sunDot, uDiscPower) * uDisc;
    float glow = pow(sunDot, 18.0) * uDisc * 0.42;
    col += uSunColor * (disc * 1.4 + glow);

    float clouds = 0.0;
    if (dir.y > 0.02 && uCloud > 0.01) {
      vec2 uv = dir.xz / max(dir.y, 0.08);
      float n = fbm(uv * 1.15 + vec2(uTime * 0.012, uTime * 0.004));
      clouds = smoothstep(0.42, 0.78, n) * uCloud * smoothstep(0.0, 0.18, dir.y);
      vec3 cloudCol = mix(uCloudColor, uCloudColor * vec3(0.62, 0.66, 0.72), 0.35);
      col = mix(col, cloudCol, clouds * 0.92);
      disc *= (1.0 - clouds);
      col += uSunColor * disc * 0.35;
    }

    if (uStars > 0.01 && dir.y > 0.08) {
      vec3 cell = floor(dir * 210.0);
      float s = step(0.992, hash3(cell));
      float tw = 0.65 + 0.35 * sin(uTime * 1.7 + hash3(cell) * 40.0);
      col += vec3(0.85, 0.9, 1.0) * s * tw * uStars * (1.0 - clouds) * smoothstep(0.08, 0.35, dir.y);
    }

    col += vec3(0.75, 0.84, 1.0) * uFlash * 0.85;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createSky(scene) {
  const uniforms = {
    uTop: { value: new THREE.Color('#7ec8ff') },
    uHorizon: { value: new THREE.Color('#d7ecff') },
    uSunDir: { value: new THREE.Vector3(0.2, 0.8, 0.4).normalize() },
    uSunColor: { value: new THREE.Color('#fff4d2') },
    uCloudColor: { value: new THREE.Color('#ffffff') },
    uDisc: { value: 1 },
    uDiscPower: { value: 900 },
    uCloud: { value: 0.35 },
    uStars: { value: 0 },
    uTime: { value: 0 },
    uFlash: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(420, 40, 24), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  mesh.raycast = () => {};
  scene.add(mesh);
  return { mesh, uniforms };
}
