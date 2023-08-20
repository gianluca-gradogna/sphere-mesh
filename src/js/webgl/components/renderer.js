import { WebGLRenderer, Color } from 'three';
import store from '@/js/store/globalStore';
import tweak from '@/js/utils/debugger'

import { GlobalRaf } from "@/js/events";

class Renderer extends WebGLRenderer {
  constructor() {
    super({
      powerPreference: 'high-performance',
      antialiasing: false,
    })

    this.setClearColor(new Color("#191715"));
    this.addDebug()
  }

  addDebug() {
    const rendererDebug = tweak.addFolder({
      title: 'renderer'
    })
    rendererDebug.expanded = false
    rendererDebug.addMonitor(this.info.memory, 'geometries', { label: 'geometr.' })
    rendererDebug.addMonitor(this.info.memory, 'textures')
    rendererDebug.addInput(GlobalRaf, "isPaused", {label: 'Pause Raf'});
    window.addEventListener("keyup", (e) => {
      if (e.key !== "p") return;
      GlobalRaf.isPaused = !GlobalRaf.isPaused;
      tweak.refresh();
    });
  }

  onResize() {
    const {viewport} = store

    this.setSize(viewport.width, viewport.height);
    this.setPixelRatio(viewport.dpr);
  }
}

export default new Renderer();