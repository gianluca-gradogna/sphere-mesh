import store from '../store/globalStore'
import { gsap } from 'gsap';
import Emitter from "./Emitter";

class Resize {
  constructor() {
    this.init();
  }

  init() {
    this.onResize()
    window.addEventListener('resize', this.onResize)
  }

  onResize = () => {
    const {viewport} = store;

    viewport.width = window.innerWidth
    viewport.height = window.innerHeight
    viewport.aspect = window.innerWidth / window.innerHeight
    viewport.dpr = gsap.utils.clamp(1, 2, window.devicePixelRatio)

    Emitter.emit('site:resize', {})
  };
}

export default new Resize();
