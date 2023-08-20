import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import renderer from './renderer';
import store from '@/js/store/globalStore';

class Camera extends PerspectiveCamera {
  constructor() {
    super(75, 0, 0.1, 1000);
  }

  init() {
    this.position.set(0, 0, 1);
    this.lookAt(new Vector3(0, 0, 0));
    this.initOrbitControl()
  }

  initOrbitControl() {
    this.controls = new OrbitControls(this, renderer.domElement);

    this.controls.enabled = false;
    this.controls.maxDistance = 1000;
  }

  calculateUnitSize(distance = this.position.z) {
    const vFov = this.fov * Math.PI / 180;
    const height = 2 * Math.tan(vFov / 2) * distance;
    const width = height * this.aspect;

    return {
      width,
      height 
    };
  }

  onResize() {
    const {viewport} = store

    this.aspect = viewport.aspect;
    this.unit = this.calculateUnitSize()
    this.updateProjectionMatrix();
  }
}

export default new Camera();