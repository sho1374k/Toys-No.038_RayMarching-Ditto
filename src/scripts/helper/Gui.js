import GUI from "lil-gui";
import { Config } from "../Config";

export class Gui {
  constructor() {
    this.gui = null;
    window.GUI = null;

    if (Config.isGui) {
      this.gui = new GUI();
      window.GUI = this.gui;
      this.toOpen();
    }
  }

  toOpen() {
    if (this.gui != null) this.gui.open();
  }

  toClose() {
    if (this.gui != null) this.gui.close();
  }
}
