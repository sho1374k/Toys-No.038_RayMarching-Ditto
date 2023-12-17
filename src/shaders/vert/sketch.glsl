attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}