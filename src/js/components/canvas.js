import renderer from "@/js/webgl/components/renderer"
import camera from '@/js/webgl/components/camera'
import scene from '@/js/webgl/components/scene'
import settings from '@/js/store/settings'
import postfx from '@/js/webgl/components/postfx'

import { Emitter } from "../events"

export class Canvas {
  init() {
    document.querySelector('.webgl').appendChild(renderer.domElement)
    camera.init()
    scene.init()
    // postfx.init()
    
    this.setupEventListeners()
    this.onResize()
  }

  setupEventListeners() {
    Emitter.on('site:resize', this.onResize)
    Emitter.on("site:tick", this.onTick)
  }

  onTick = ({ delta, time, rafDamp }) => {
    scene?.onTick({time})
    renderer?.render(scene, camera)
    // postfx?.render(scene, camera)
  }

  onResize = () => {
    scene?.onResize()
    camera?.onResize()
    renderer?.onResize()
    // postfx?.onResize()
  }
}