import * as THREE from 'three';

export const envUniforms = {
  uTime: { value: 0 },
  uWind: { value: 0.3 },
  uSnow: { value: 0 },
  uWet: { value: 0 },
};

const tintables = [];
const snowCol = new THREE.Color('#e7eef3');

export function registerTint(mat, { snow = 0.75, wet = 0.35 } = {}) {
  tintables.push({
    mat,
    base: mat.color.clone(),
    rough: mat.roughness,
    snow,
    wet,
  });
  return mat;
}

export function updateTints(live) {
  for (const t of tintables) {
    t.mat.color.copy(t.base).lerp(snowCol, live.snow * t.snow);
    t.mat.color.multiplyScalar(1 - live.wet * t.wet);
    t.mat.roughness = THREE.MathUtils.lerp(t.rough, Math.min(0.28, t.rough), live.wet);
  }
}

export function addFieldShader(material, windAmp = 0.1) {
  const amp = Number(windAmp).toFixed(4);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = envUniforms.uTime;
    shader.uniforms.uWind = envUniforms.uWind;
    shader.uniforms.uSnow = envUniforms.uSnow;
    shader.uniforms.uWet = envUniforms.uWet;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uTime;\nuniform float uWind;\nvarying float vLocalY;'
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLocalY = position.y;
        float seed = 0.0;
        #ifdef USE_INSTANCING
          seed = instanceMatrix[3][0] * 0.37 + instanceMatrix[3][2] * 0.21;
        #endif
        float bend = sin(uTime * 1.45 + seed * 6.0) * transformed.y * ${amp} * uWind;
        transformed.x += bend;
        transformed.z += bend * 0.32;`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uSnow;\nuniform float uWet;\nvarying float vLocalY;'
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float tip = smoothstep(0.08, 1.05, vLocalY);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.91, 0.94, 0.97), uSnow * mix(0.28, 0.96, tip));
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.55, 0.62, 0.66), uWet);`
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.18, uWet);`
      );
  };
  material.customProgramCacheKey = () => `field-${amp}`;
  return material;
}
