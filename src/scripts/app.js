import gsap from "gsap";
import { Controller } from "./webgl/Controller";
import { Config } from "./Config";

window.addEventListener("DOMContentLoaded", async (e) => {
  const controller = new Controller();
  await controller.init();
  window.addEventListener("resize", controller.resize);
  controller.resize();
  gsap.ticker.add(controller.update);
  gsap.ticker.fps(Config.fps);
});
