import gsap from "gsap";
import Emitter from "./Emitter";

let RD = 0;
const FR = 1e3 / 60;
class Raf {
  constructor() {
    this.isPaused = false;

    this.init();
  }

  init() {
    gsap.ticker.add(this.onTick);
  }

  onTick = (time, deltaTime) => {
    if (!this.isPaused) {
      this.t || (this.t = time), (RD = (time - this.t) / FR), (this.t = time);
      Emitter.emit("site:tick", { delta: deltaTime, time: time, rafDamp: RD * 1000 });
    }
  };
}

export default new Raf();
