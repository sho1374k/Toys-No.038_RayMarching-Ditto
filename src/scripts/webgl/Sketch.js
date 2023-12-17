import gsap from "gsap";
import { WebGLUtility, ShaderProgram, GetPlaneGeometry } from "./Module.js";
import { Params, TYPE } from "../Variables.js";
import { Config } from "../Config.js";
import fragmentShader from "../../shaders/frag/sketch.glsl";
import vertexShader from "../../shaders/vert/sketch.glsl";

export class Sketch {
  constructor(_gl) {
    this.gl = _gl;
    this.canvas = this.gl.canvas;
    this.params = Params;
    this.isInitialized = false;

    this.geometry = {
      position: null,
      uv: null,
      normal: null,
      index: null,
      length: null,
      ibo: {
        buffer: null,
        length: null,
      },
    };

    this.uniforms = {
      uProgress1: 1,
      uProgress2: 0,
      uProgress3: 0,
      uTime: 0,
      uAspect1: this.params.w / this.params.h,
      uAspect2: this.params.h / this.params.w,
      uResolution: [this.params.w, this.params.h],
      uPointer: [this.params.w, this.params.h],
    };
  }

  createPlaneGeometry(_widthSegments = 1, _heightSegments = 1) {
    const g = GetPlaneGeometry(2, 2, _widthSegments, _heightSegments);

    this.geometry.position = g.position;
    this.geometry.uv = g.uv;
    this.geometry.normal = g.normal;
    this.geometry.ibo.buffer = WebGLUtility.createIbo(this.gl, g.index);
    this.geometry.ibo.length = g.index.length;

    this.vbo = [
      WebGLUtility.createVbo(this.gl, this.geometry.position),
      WebGLUtility.createVbo(this.gl, this.geometry.uv),
      WebGLUtility.createVbo(this.gl, this.geometry.normal),
    ];
  }

  resize(_params) {
    this.params = _params;
    this.uniforms.uResolution[0] = this.params.w;
    this.uniforms.uResolution[1] = this.params.h;
    this.uniforms.uAspect1 = this.params.w / this.params.h;
    this.uniforms.uAspect2 = this.params.h / this.params.w;
  }

  render(_time) {
    if (this.isInitialized) {
      const gl = this.gl;
      this.uniforms.uTime = _time;

      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.shaderProgram.use();
      this.shaderProgram.setAttribute(this.vbo);

      // prettier-ignore
      this.shaderProgram.setUniform([
        this.uniforms.uProgress1,
        this.uniforms.uProgress2,
        this.uniforms.uProgress3,
        this.uniforms.uTime,
        this.uniforms.uAspect1,
        this.uniforms.uAspect2,
        this.uniforms.uPointer,
        this.uniforms.uResolution,
      ]);

      gl.drawElements(gl.TRIANGLES, this.geometry.ibo.length, gl.UNSIGNED_SHORT, 0);
    }
  }

  debug() {
    if (Config.isGui) {
      const folder = GUI.addFolder("🎨 Sketch");
      // folder.close();
      folder.add(this.uniforms, "uProgress1", 0.0, 1.0).name("progress1");
      folder.add(this.uniforms, "uProgress2", 0.0, 1.0).name("progress2");
      folder.add(this.uniforms, "uProgress3", 0.0, 1.0).name("progress3");
    }
  }

  init() {
    console.log("🚀 ~ Background init");
    return new Promise((resolve) => {
      this.shaderProgram = new ShaderProgram(this.gl, {
        vertexShaderSource: vertexShader,
        fragmentShaderSource: fragmentShader,
        // prettier-ignore
        attribute: [
          "position",
          "uv",
          "normal",
        ],
        // prettier-ignore
        stride: [
          3,
          2,
          3,
        ],
        // prettier-ignore
        uniform: [
          "uProgress1",
          "uProgress2",
          "uProgress3",
          "uTime",
          "uAspect1",
          "uAspect2",
          "uPointer",
          "uResolution",
        ],
        // prettier-ignore
        type: [
          TYPE.f,
          TYPE.f,
          TYPE.f,
          TYPE.f,
          TYPE.f,
          TYPE.f,
          TYPE.v2,
          TYPE.v2,
        ],
      });

      this.createPlaneGeometry();
      this.debug();
      this.isInitialized = true;
      resolve();
    });
  }
}
