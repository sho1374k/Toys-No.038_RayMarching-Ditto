precision mediump float;
varying vec2 vUv;
uniform float uProgress1;
uniform float uProgress2;
uniform float uProgress3;
uniform float uAspect1;
uniform float uAspect2;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uResolution;
uniform sampler2D uDiffuse;
#include "../_chunk/noise.glsl"

void main() {
  float n = noise(vUv);
  vec2 uv = vec2(
    // vUv.x + n * 0.00125,
    // vUv.y + n * 0.00125
    vUv.x + n * 0.003,
    vUv.y + n * 0.003
  );
  vec4 diff = texture2D(uDiffuse, uv);
  diff = texture2D(uDiffuse, vUv);
  gl_FragColor = diff;
}
