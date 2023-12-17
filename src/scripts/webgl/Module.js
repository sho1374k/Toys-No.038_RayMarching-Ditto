export class WebGLUtility {
  /**
   * ファイルをプレーンテキストとして読み込む。
   * @param {string} path - 読み込むファイルのパス
   * @return {Promise}
   */
  static loadFile(path) {
    return new Promise((resolve, reject) => {
      // fetch を使ってファイルにアクセスする
      fetch(path)
        .then((res) => {
          // テキストとして処理する
          return res.text();
        })
        .then((text) => {
          // テキストを引数に Promise を解決する
          resolve(text);
        })
        .catch((err) => {
          // なんらかのエラー
          reject(err);
        });
    });
  }

  /**
   * ファイルを画像として読み込む。
   * @param {string} path - 読み込むファイルのパス
   * @return {Promise}
   */
  static loadImage(path) {
    return new Promise((resolve) => {
      // Image オブジェクトの生成
      const img = new Image();
      // ロード完了を検出したいので、先にイベントを設定する
      img.addEventListener(
        "load",
        () => {
          // 画像を引数に Promise を解決する
          resolve(img);
        },
        false,
      );
      // 読み込む画像のパスを設定する
      img.src = path;
    });
  }

  /**
   * シェーダオブジェクトを生成して返す。
   * コンパイルに失敗した場合は理由をアラートし null を返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {string} source - シェーダのソースコード文字列
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @return {WebGLShader} シェーダオブジェクト
   */
  static createShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      // alert(gl.getShaderInfoLog(shader));
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
  }

  /**
   * プログラムオブジェクトを生成して返す。
   * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {WebGLShader} vs - 頂点シェーダオブジェクト
   * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
   * @return {WebGLProgram} プログラムオブジェクト
   */
  static createProgram(gl, vs, fs) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      // alert(gl.getProgramInfoLog(program));
      console.error(gl.getProgramInfoLog(program));
      return null;
    }
  }

  /**
   * プログラムオブジェクトを生成して返す。（transform feedback 対応）
   * シェーダのリンクに失敗した場合は理由をアラートし null を返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {WebGLShader} vs - 頂点シェーダオブジェクト
   * @param {WebGLShader} fs - フラグメントシェーダオブジェクト
   * @param {Array.<string>} varyings - 出力する変数名の配列
   * @return {WebGLProgram} プログラムオブジェクト
   */
  static createTransformFeedbackProgram(gl, vs, fs, varyings) {
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.transformFeedbackVaryings(program, varyings, gl.SEPARATE_ATTRIBS);
    gl.linkProgram(program);
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.useProgram(program);
      return program;
    } else {
      // alert(gl.getProgramInfoLog(program));
      console.error(gl.getProgramInfoLog(program));
      return null;
    }
  }

  /**
   * VBO を生成して返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {Array} data - 頂点属性データを格納した配列
   * @return {WebGLBuffer} VBO
   */
  static createVbo(gl, data) {
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
  }

  /**
   * IBO を生成して返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {Array} data - インデックスデータを格納した配列
   * @return {WebGLBuffer} IBO
   */
  static createIbo(gl, data) {
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  /**
   * IBO を生成して返す。(INT 拡張版)
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {object} ext - getWebGLExtensions の戻り値
   * @param {Array} data - インデックスデータを格納した配列
   * @return {WebGLBuffer} IBO
   */
  static createIboInt(gl, ext, data) {
    if (ext == null || ext.elementIndexUint == null) {
      throw new Error("element index Uint not supported");
    }
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  /**
   * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {string} source - ソースとなる画像のパス
   * @return {Promise}
   */
  static createTextureFromFile(gl, source) {
    return new Promise((resolve) => {
      const img = new Image();
      img.addEventListener(
        "load",
        () => {
          const tex = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.bindTexture(gl.TEXTURE_2D, null);
          resolve(tex);
        },
        false,
      );
      img.src = source;
    });
  }

  /**
   * フレームバッファを生成して返す。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {number} width - フレームバッファの幅
   * @param {number} height - フレームバッファの高さ
   * @return {object} 生成した各種オブジェクトはラップして返却する
   * @property {WebGLFramebuffer} framebuffer - フレームバッファ
   * @property {WebGLRenderbuffer} renderbuffer - 深度バッファとして設定したレンダーバッファ
   * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
   */
  static createFramebuffer(gl, width, height) {
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const depthRenderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture };
  }

  /**
   * フレームバッファを生成して返す。（フロートテクスチャ版）
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {object} ext - getWebGLExtensions の戻り値
   * @param {number} width - フレームバッファの幅
   * @param {number} height - フレームバッファの高さ
   * @return {object} 生成した各種オブジェクトはラップして返却する
   * @property {WebGLFramebuffer} framebuffer - フレームバッファ
   * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
   */
  static createFramebufferFloat(gl, ext, width, height) {
    if (ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)) {
      throw new Error("float texture not supported");
    }
    const flg = ext.textureFloat != null ? gl.FLOAT : ext.textureHalfFloat.HALF_FLOAT_OES;
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer: frameBuffer, texture: fTexture };
  }

  /**
   * フレームバッファを生成して返す。（フロートテクスチャ・WebGL 2.0 版）
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {number} width - フレームバッファの幅
   * @param {number} height - フレームバッファの高さ
   * @return {object} 生成した各種オブジェクトはラップして返却する
   * @property {WebGLFramebuffer} framebuffer - フレームバッファ
   * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
   */
  static createFramebufferFloat2(gl, width, height) {
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    const fTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    // RGBA32F かつ FLOAT
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer: frameBuffer, texture: fTexture };
  }

  /**
   * フレームバッファを削除する。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {object} obj - createFramebuffer が返すオブジェクト
   */
  static DeleteFrameBuffer(gl, obj) {
    if (obj == null) {
      return;
    }
    if (obj.hasOwnProperty("framebuffer") === true && gl.isFramebuffer(obj.framebuffer) === true) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.deleteFramebuffer(obj.framebuffer);
      obj.framebuffer = null;
    }
    if (obj.hasOwnProperty("renderbuffer") === true && gl.isRenderbuffer(obj.renderbuffer) === true) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      gl.deleteRenderbuffer(obj.renderbuffer);
      obj.renderbuffer = null;
    }
    if (obj.hasOwnProperty("texture") === true && gl.isTexture(obj.texture) === true) {
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.deleteTexture(obj.texture);
      obj.texture = null;
    }
    obj = null;
  }

  /**
   * 主要な WebGL の拡張機能を取得する。
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @return {object} 取得した拡張機能
   * @property {object} elementIndexUint - Uint32 フォーマットを利用できるようにする
   * @property {object} textureFloat - フロートテクスチャを利用できるようにする
   * @property {object} textureHalfFloat - ハーフフロートテクスチャを利用できるようにする
   */
  static getWebGLExtensions(gl) {
    return {
      elementIndexUint: gl.getExtension("OES_element_index_uint"),
      textureFloat: gl.getExtension("OES_texture_float"),
      textureHalfFloat: gl.getExtension("OES_texture_half_float"),
    };
  }
}

export class ShaderProgram {
  /**
   * @constructor
   * @param {WebGLRenderingContext} gl - WebGL コンテキスト
   * @param {object} option - 各種オプション（下記参照）
   * @property {string} vertexShaderSource - 頂点シェーダのソースコード
   * @property {string} fragmentShaderSource - フラグメントシェーダのソースコード
   * @property {Array.<string>} attribute - attribute 変数名
   * @property {Array.<number>} stride - attribute 変数のストライド
   * @property {Array.<string>} uniform - uniform 変数名
   * @property {Array.<string>} type - uniform 変数のタイプ（例: uniform3fv など）
   */
  constructor(gl, option) {
    this.gl = gl;
    this.vertexShaderSource = option.vertexShaderSource;
    this.fragmentShaderSource = option.fragmentShaderSource;
    this.attribute = option.attribute;
    this.stride = option.stride;
    this.uniform = option.uniform;
    this.type = option.type;
    this.transformFeedbackVaryings = option.transformFeedbackVaryings;

    if (
      Array.isArray(this.attribute) !== true ||
      Array.isArray(this.stride) !== true ||
      this.attribute.length !== this.stride.length
    ) {
      throw new Error("attribute or stride does not match");
    }
    if (Array.isArray(this.uniform) === true || Array.isArray(this.type) === true) {
      if (
        Array.isArray(this.uniform) !== true ||
        Array.isArray(this.type) !== true ||
        this.uniform.length !== this.type.length
      ) {
        throw new Error("uniform or type does not match");
      }
    } else {
      this.uniform = null;
      this.type = null;
    }
    this.vertexShader = WebGLUtility.createShader(gl, this.vertexShaderSource, gl.VERTEX_SHADER);
    this.fragmentShader = WebGLUtility.createShader(gl, this.fragmentShaderSource, gl.FRAGMENT_SHADER);
    if (this.vertexShader == null || this.fragmentShader == null) {
      throw new Error("shader compilation failed");
    }
    if (Array.isArray(this.transformFeedbackVaryings) === true && this.transformFeedbackVaryings.length > 0) {
      this.program = WebGLUtility.createTransformFeedbackProgram(
        gl,
        this.vertexShader,
        this.fragmentShader,
        this.transformFeedbackVaryings,
      );
    } else {
      this.program = WebGLUtility.createProgram(gl, this.vertexShader, this.fragmentShader);
    }
    if (this.program == null) {
      throw new Error("shader program creation failed");
    }
    this.attributeLocation = this.attribute.map((attributeName) => {
      const attributeLocation = gl.getAttribLocation(this.program, attributeName);
      if (attributeLocation < 0) {
        console.warn(`"${attributeName}" is an invalid attribute variable`);
      }
      return attributeLocation;
    });
    if (this.uniform != null) {
      this.uniformLocation = this.uniform.map((uniformName) => {
        const uniformLocation = gl.getUniformLocation(this.program, uniformName);
        if (uniformLocation == null) {
          console.warn(`"${uniformName}" is an invalid uniform variable`);
        }
        return uniformLocation;
      });
    }
  }

  /**
   * プログラムオブジェクトを選択状態にする。
   */
  use() {
    this.gl.useProgram(this.program);
  }

  /**
   * VBO を IBO をバインドし有効化する。
   * @param {Array.<WebGLBuffer>} vbo - VBO を格納した配列
   * @param {WebGLBuffer} [ibo=null] - IBO
   */
  setAttribute(vbo, ibo = null) {
    const gl = this.gl;
    if (Array.isArray(vbo) !== true || vbo.length !== this.attribute.length) {
      throw new Error("vbo or attribute does not match");
    }
    vbo.forEach((v, index) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, v);
      gl.enableVertexAttribArray(this.attributeLocation[index]);
      gl.vertexAttribPointer(this.attributeLocation[index], this.stride[index], gl.FLOAT, false, 0, 0);
    });
    if (ibo != null) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    }
  }

  /**
   * uniform 変数をまとめてシェーダに送る。
   * @param {Array} value - 各変数の値
   */
  setUniform(value) {
    const gl = this.gl;
    if (this.uniform == null) {
      return;
    }
    if (Array.isArray(value) !== true || value.length !== this.uniform.length) {
      throw new Error("value is an invalid");
    }
    value.forEach((v, index) => {
      const type = this.type[index];
      if (type.includes("Matrix") === true) {
        gl[type](this.uniformLocation[index], false, v);
      } else {
        gl[type](this.uniformLocation[index], v);
      }
    });
  }
}

export function GetPlaneGeometry(_width = 1, _height = 1, _widthSegments = 1, _heightSegments = 1) {
  const w = _width / 2;
  const h = _height / 2;

  const gridX = Math.floor(_widthSegments);
  const gridY = Math.floor(_heightSegments);

  const limitGridX = gridX + 1;
  const limitGridY = gridY + 1;

  const segmentWidth = _width / gridX;
  const segmentHeight = _height / gridY;

  const indexList = [];
  const positionList = [];
  const normalList = [];
  const uvList = [];

  for (let iy = 0; iy < limitGridY; iy++) {
    const y = iy * segmentHeight - h;

    for (let ix = 0; ix < limitGridX; ix++) {
      const x = ix * segmentWidth - w;

      positionList.push(x, -y, 0);

      normalList.push(0, 0, 1);

      uvList.push(ix / gridX);
      uvList.push(1 - iy / gridY);
    }
  }

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = ix + limitGridX * iy;
      const b = ix + limitGridX * (iy + 1);
      const c = ix + 1 + limitGridX * (iy + 1);
      const d = ix + 1 + limitGridX * iy;

      indexList.push(a, b, d);
      indexList.push(b, c, d);
    }
  }

  // prettier-ignore
  return { 
    position: positionList, 
    normal: normalList, 
    uv: uvList, 
    index: indexList 
  };
}
