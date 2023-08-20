import { manifest } from '../manifest/preloadManifest'
import { loadManifest } from '../utils/assetsLoader'
import gsap from 'gsap'

export class Preloader {
    constructor() {
        this.state = {
            progress: 0,
            waitTime: 0
        }

        this.dom = {
            wrapper: document.getElementById('preloader'),
            number: document.getElementById('preloader-number')
        }
    }

    async load() {
        this.dom.wrapper.style.display = 'flex'
        await loadManifest(manifest, (p) => {
            this.state.progress = p;
            this.dom.number.innerHTML = p * 100;
        })
        gsap.delayedCall(this.state.waitTime, () => {
            this.dom.wrapper.style.display = 'none'
        })
    }
}