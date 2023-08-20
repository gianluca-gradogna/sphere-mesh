import { Scene } from 'three';
import camera from './camera';

import Sphere from "../meshes/Sphere";

class Stage extends Scene {
  init() {
    this.add(camera)
    
    this.sphere = new Sphere();
    this.add(this.sphere)
  }

  onTick({time}) {
    this.sphere?.onTick(time)
  }

  onResize() {
    // this.sphere?.onResize()
  }
}

export default new Stage();