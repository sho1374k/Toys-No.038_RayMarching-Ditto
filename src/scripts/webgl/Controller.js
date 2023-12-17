import gsap from "gsap";
import { Params, UpdateParams, BREAK_POINT } from "../Variables";
import { Config } from "../Config";
import { Sketch } from "./Sketch";
import { Output } from "./Output";
import { Gui } from "../helper/Gui";
import { Statistics } from "../helper/Statistics";

export class Controller {
  constructor() {
    this.canvas = document.getElementById("sketch");
    this.gl = this.canvas.getContext("webgl");
    this.params = Params;
    UpdateParams();

    this.isInitialized = false;

    this.timer = { resize: null, move: null };
    this.pointer = {
      target: { x: 0, y: 0 },
      current: { x: 0, y: 0 },
      interpolation: 0.25,
    };

    this.sketch = new Sketch(this.gl);
    this.output = new Output(this.gl);
    this.stats = new Statistics();
    new Gui();

    this.resize = this.resize.bind(this);
    this.update = this.update.bind(this);
    this.setEvent();
  }

  lerp(_start, _end, _interpolation) {
    return _start * (1 - _interpolation) + _end * _interpolation;
  }

  setEvent() {
    if (this.params.isMatchMediaHover) {
      this.isAbleToMove = true;
      window.addEventListener("mousemove", this.onMove.bind(this), { passive: true });
      if (Config.isPointerDown) {
        this.isAbleToMove = false;
        window.addEventListener("mousedown", this.onDown.bind(this), { passive: true });
        window.addEventListener("mouseup", this.onUp.bind(this), { passive: true });
      }
    } else {
      this.isAbleToMove = false;
      window.addEventListener("touchstart", this.onDown.bind(this), { passive: true });
      window.addEventListener("touchmove", this.onMove.bind(this), { passive: true });
      window.addEventListener("touchend", this.onUp.bind(this), { passive: true });
    }
  }

  getNomalizeVector(_x, _y, _w, _h) {
    return {
      x: (_x / _w) * 2 - 1,
      y: -(_y / _h) * 2 + 1,
    };
  }

  onDown(e) {
    if (!this.isAbleToMove && this.isInitialized) {
      this.isAbleToMove = true;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const vector = this.getNomalizeVector(x, y, this.params.w, this.params.h);

      this.pointer.target.x = vector.x;
      this.pointer.target.y = vector.y;
    }
  }

  onMove(e) {
    if (this.isAbleToMove && this.isInitialized) {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const vector = this.getNomalizeVector(x, y, this.params.w, this.params.h);

      this.pointer.target.x = vector.x;
      this.pointer.target.y = vector.y;
      this.onMoveAfter(vector.x, vector.y);
    }
  }

  onMoveAfter(_x, _y) {
    clearTimeout(this.timer.move);
    this.timer.move = setTimeout(() => {
      this.pointer.target.x = _x;
      this.pointer.target.y = _y;
      clearTimeout(this.timer.move);
    }, 100);
  }

  onUp() {
    if (this.isAbleToMove && this.isInitialized) this.isAbleToMove = false;
  }

  update() {
    if (this.isInitialized) {
      this.pointer.current.x = this.lerp(this.pointer.current.x, this.pointer.target.x, this.pointer.interpolation);
      this.pointer.current.y = this.lerp(this.pointer.current.y, this.pointer.target.y, this.pointer.interpolation);

      const gl = this.gl;
      const time = performance.now() * 0.001;

      this.output.ableFrameBuffer();

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      this.sketch.uniforms.uPointer[0] = this.pointer.current.x;
      this.sketch.uniforms.uPointer[1] = this.pointer.current.y;

      this.sketch.render(time);
      this.output.render(time);

      this.stats.update();
    }
  }

  resize() {
    this.params = Params;
    UpdateParams();

    this.canvas.width = this.params.w;
    this.canvas.height = this.params.h;

    this.sketch.resize(this.params);
    this.output.resize(this.params);

    this.resizeAfter();
  }

  resizeAfter() {
    clearTimeout(this.timer.resize);
    this.timer.resize = setTimeout(() => {
      const threshold = () => {
        const w = window.innerWidth;
        if (w > BREAK_POINT) {
          if (this.params.beforeWidth < BREAK_POINT + 1) window.location.reload();
        }
        if (w < BREAK_POINT + 1) {
          if (this.params.beforeWidth > BREAK_POINT + 1) window.location.reload();
        }
        this.params.beforeWidth = w;
      };
      threshold();
    });
  }

  setBtnToggle() {
    const DURATION = 1,
      EASE = "power4.inOut";

    const btnToggle = document.getElementById("jsBtnToggle");
    btnToggle.addEventListener("click", (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        gsap.to(this.sketch.uniforms, {
          duration: DURATION,
          uProgress1: 1.0,
          ease: EASE,
        });
      } else {
        gsap.to(this.sketch.uniforms, {
          duration: DURATION,
          uProgress1: 0.0,
          ease: EASE,
        });
      }
    });
  }

  toEnterAnime() {
    const DURATION = 1,
      EASE = "power4.inOut";

    const tl = gsap.timeline({
      duration: DURATION,
      ease: EASE,
    });
    tl.to(this.sketch.uniforms, {
      uProgress2: 1.0,
    }).to(this.sketch.uniforms, {
      uProgress1: 0.0,
      delay: 0.4,
      onComplete: () => {
        document.body.setAttribute("data-loaded", 1);
      },
    });
  }

  init() {
    return new Promise(async (resolve) => {
      await this.sketch.init();
      await this.output.init();
      this.setBtnToggle();
      this.toEnterAnime();
      this.isInitialized = true;
      resolve();
    });
  }
}
