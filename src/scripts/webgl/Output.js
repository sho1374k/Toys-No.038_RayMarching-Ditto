import { WebGLUtility, ShaderProgram, GetPlaneGeometry } from "./Module.js";
import { Params, TYPE } from "../Variables.js";
import { Config } from "../Config.js";
import outputFragmentShader from "../../shaders/frag/output.glsl";
import outputVertexShader from "../../shaders/vert/output.glsl";

export class Output {
  constructor(_gl) {
    this.gl = _gl;
    this.canvas = this.gl.canvas;
    this.params = Params;

    this.frameBufferLength = 1;
    this.frameBufferList = null;

    this.geometry = {
      position: null,
      uv: null,
      normal: null,
      ibo: {
        buffer: null,
        length: null,
      },
    };

    this.uniforms = {
      uProgress1: 0,
      uProgress2: 0,
      uProgress3: 0,
      uTime: 0,
      uAspect1: this.params.w / this.params.h,
      uAspect2: this.params.h / this.params.w,
      uResolution: [this.params.w, this.params.h],
      uPointer: [this.params.w, this.params.h],
      uDiffuse: null,
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

  ableFrameBuffer() {
    if (this.frameBufferList != null) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferList[0].framebuffer);
    }
  }

  setFrameBuffer(_w, _h) {
    const gl = this.gl;
    if (this.frameBufferList != null) {
      this.frameBufferList.forEach((buffer) => {
        WebGLUtility.DeleteFrameBuffer(gl, buffer);
      });
    }

    this.frameBufferList = [];
    for (let i = 0; i < this.frameBufferLength; i++) {
      this.frameBufferList.push(WebGLUtility.createFramebuffer(gl, _w, _h));
    }
  }

  render(_time) {
    if (this.frameBufferList != null) {
      this.uniforms.uTime = _time;
      const gl = this.gl;

      // 1. clear bind framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // 2. clear stage
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // 3. bind framebuffer
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.frameBufferList[0].texture);

      // 3. update ibo
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometry.ibo.buffer);

      // 4. update vbo & uniform
      this.shaderProgram.use();
      this.shaderProgram.setAttribute(this.vbo);
      this.shaderProgram.setUniform([
        this.uniforms.uProgress1,
        this.uniforms.uProgress2,
        this.uniforms.uProgress3,
        this.uniforms.uTime,
        this.uniforms.uAspect1,
        this.uniforms.uAspect2,
        this.uniforms.uPointer,
        this.uniforms.uResolution,
        this.uniforms.uDiffuse,
      ]);

      // 5.draw
      gl.drawElements(gl.TRIANGLES, this.geometry.ibo.length, gl.UNSIGNED_SHORT, 0);

      // 6. bind current framebuffer texture
      this.uniforms.uDiffuse = this.frameBufferList[0].texture;
      gl.activeTexture(gl.TEXTURE0 + 1);
      gl.bindTexture(gl.TEXTURE_2D, this.uniforms.uTexture);
    }
  }

  resize(_params) {
    this.params = _params;
    this.setFrameBuffer(this.params.w, this.params.h);
    this.uniforms.uResolution[0] = this.params.w;
    this.uniforms.uResolution[1] = this.params.h;
  }

  debug() {
    if (Config.isGui) {
      const folder = GUI.addFolder("📸 Output");
      // folder.close();
      folder.add(this.uniforms, "uProgress1", 0.0, 1.0).name("progress1");
      folder.add(this.uniforms, "uProgress2", 0.0, 1.0).name("progress2");
      folder.add(this.uniforms, "uProgress3", 0.0, 1.0).name("progress3");
    }
  }

  init() {
    console.log("🚀 ~ PostProcess init");
    return new Promise((resolve) => {
      this.shaderProgram = new ShaderProgram(this.gl, {
        vertexShaderSource: outputVertexShader,
        fragmentShaderSource: outputFragmentShader,
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
          "uDiffuse",
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
          TYPE.t,
        ],
      });

      this.createPlaneGeometry();
      this.debug();
      resolve();
    });
  }
}
