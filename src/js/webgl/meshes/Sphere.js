import {
  Color,
  Mesh,
  Object3D,
  IcosahedronGeometry,
  MeshStandardMaterial,
} from "three"
import { gsap } from "gsap"
import { getAsset } from '../../utils/assetsLoader'
import tweak from '@/js/utils/debugger'

const PARAMS = {
  color1: '#000',
  color2: '#fff',
  timeScale: 1.2,
  noiseScale: .07,
  noiseAmplitude: 7.5,
  amplitudeStrength: 7,
  radius: .35,
  details: 150,
  wireframe: false
}

export default class extends Object3D {
  constructor() {
    super();

    this.mouse = {
      current: {x: 0, y: 0},
      target: {x: 0, y: 0},
      ease: .08
    }

    this.geometry = new IcosahedronGeometry(PARAMS.radius, PARAMS.details)
    this.createMaterial()
    this.createMesh()

    const tl = gsap.timeline({repeat: -1})
    tl.to(this.position, {
      keyframes: {y: [-.08, .08, -.08], ease: 'linear'},
      duration: 3,
      ease: 'sine.inOut'
    })

    this.addEventListeners();
    this.addDebug()
  }

  addDebug() {
    tweak.addInput(PARAMS, 'color1').on('change', (ev) => { this.material.uniforms.uColor1.value = new Color(ev.value) })
    tweak.addInput(PARAMS, 'color2').on('change', (ev) => { this.material.uniforms.uColor2.value = new Color(ev.value) })
    tweak.addInput(PARAMS, 'timeScale', {min: 0, max: 2}).on('change', (ev) => { this.material.uniforms.uTimeScale.value = ev.value })
    tweak.addInput(PARAMS, 'noiseScale', {min: -1, max: 2}).on('change', (ev) => { this.material.uniforms.uNoiseScale.value = ev.value })
    tweak.addInput(PARAMS, 'noiseAmplitude', {min: 0, max: 10}).on('change', (ev) => { this.material.uniforms.uNoiseAmplitude.value = ev.value })
    tweak.addInput(PARAMS, 'amplitudeStrength', {min: 0, max: 40}).on('change', (ev) => { this.material.uniforms.uAmplitudeStrength.value = ev.value })
    tweak.addInput(PARAMS, 'details', {min: 2, max: 200, step: 1}).on('change', (ev) => { this.mesh.geometry = new IcosahedronGeometry(.5, ev.value) })
    tweak.addInput(PARAMS, 'wireframe').on('change', (ev) => { this.material.wireframe = ev.value })
  }

  addEventListeners() {
    document.addEventListener('mousemove', this.onMouseMove)
  }

  createMaterial() {
    this.material = new MeshStandardMaterial({
      envMap: getAsset('hdr-studio-2'),
      envMapIntensity: 1,
      reflectivity: 1,
      roughness: 0,
      metalness: 0,
      wireframe: PARAMS.wireframe
    })

    this.uniforms = {
      uMap: { value: getAsset('tex-matcap') },
      uColor1: { value: new Color(PARAMS.color1) },
      uColor2: { value: new Color(PARAMS.color2) },
      uTime: { value: 0 },
      uTimeScale: { value: PARAMS.timeScale },
      uNoiseAmplitude: { value: PARAMS.noiseAmplitude },
      uNoiseScale: { value: PARAMS.noiseScale },
      uAmplitudeStrength: { value: PARAMS.amplitudeStrength }
    }

    this.material.onBeforeCompile = (e) => {
      e.uniforms = Object.assign(e.uniforms, this.uniforms)
      e.vertexShader = e.vertexShader.replace('#include <common>', `
        #include <common>

        uniform float uTime;
        uniform float uTimeScale;
        uniform float uNoiseAmplitude;
        uniform float uNoiseScale;

        varying vec2 vUv;
        varying float vAmplitude;

        //	Classic Perlin 3D Noise 
        //	by Stefan Gustavson
        //
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

        float cnoise(vec3 P){
          vec3 Pi0 = floor(P); // Integer part for indexing
          vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
          Pi0 = mod(Pi0, 289.0);
          Pi1 = mod(Pi1, 289.0);
          vec3 Pf0 = fract(P); // Fractional part for interpolation
          vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
          vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
          vec4 iy = vec4(Pi0.yy, Pi1.yy);
          vec4 iz0 = Pi0.zzzz;
          vec4 iz1 = Pi1.zzzz;

          vec4 ixy = permute(permute(ix) + iy);
          vec4 ixy0 = permute(ixy + iz0);
          vec4 ixy1 = permute(ixy + iz1);

          vec4 gx0 = ixy0 / 7.0;
          vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
          gx0 = fract(gx0);
          vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
          vec4 sz0 = step(gz0, vec4(0.0));
          gx0 -= sz0 * (step(0.0, gx0) - 0.5);
          gy0 -= sz0 * (step(0.0, gy0) - 0.5);

          vec4 gx1 = ixy1 / 7.0;
          vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
          gx1 = fract(gx1);
          vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
          vec4 sz1 = step(gz1, vec4(0.0));
          gx1 -= sz1 * (step(0.0, gx1) - 0.5);
          gy1 -= sz1 * (step(0.0, gy1) - 0.5);

          vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
          vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
          vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
          vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
          vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
          vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
          vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
          vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

          vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
          g000 *= norm0.x;
          g010 *= norm0.y;
          g100 *= norm0.z;
          g110 *= norm0.w;
          vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
          g001 *= norm1.x;
          g011 *= norm1.y;
          g101 *= norm1.z;
          g111 *= norm1.w;

          float n000 = dot(g000, Pf0);
          float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
          float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
          float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
          float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
          float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
          float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
          float n111 = dot(g111, Pf1);

          vec3 fade_xyz = fade(Pf0);
          vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
          vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
          float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
          return 2.2 * n_xyz;
        }
      `)
      e.vertexShader = e.vertexShader.replace('#include <project_vertex>', `
        #include <project_vertex>

        vec3 newPos = position;
        float noise = cnoise(position * uNoiseAmplitude + uTime * uTimeScale) * uNoiseScale;
        newPos += newPos * noise;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
        vAmplitude = noise;
      `)
      e.fragmentShader = e.fragmentShader.replace('#include <common>', `
        #include <common>

        uniform sampler2D uMap;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform float uAmplitudeStrength;

        varying vec2 vUv;
        varying float vAmplitude;
      `)
      e.fragmentShader = e.fragmentShader.replace('#include <output_fragment>', `
        #include <output_fragment>

        // Matcap UVs
        vec3 viewDir = normalize( vViewPosition );
        vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
        vec3 y = cross( viewDir, x );
        vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;

        vec3 tex = texture2D(uMap, matcapUv).rgb;
        vec3 color = tex * outgoingLight;
        float elevation = vAmplitude * uAmplitudeStrength + .5;
        color *= mix(uColor1, uColor2, elevation);

        gl_FragColor = vec4(color, diffuseColor.a);
    `)
    }

    this.material.uniforms = this.uniforms
  }

  createMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.add(this.mesh);
  }

  onMouseMove = (e) => {
    const {target} = this.mouse
    const width = window.innerWidth
    const height = window.innerHeight

    target.x = (e.clientX / width - .5) * 2
    target.y = (e.clientY / height - .5) * 2
  }

  onTick = (time) => {
    const {current, target, ease} = this.mouse
    const {uTime, uNoiseScale, uAmplitudeStrength} = this.material.uniforms
    uTime.value = time
    current.x = gsap.utils.interpolate(current.x, target.x, ease * gsap.ticker.deltaRatio(60))
    current.y = gsap.utils.interpolate(current.y, target.y, ease * gsap.ticker.deltaRatio(60))

    this.mesh.rotation.x = -current.y * .2
    this.mesh.rotation.y = Math.PI * -current.x * .2

    // this.mesh.position.y = current.y * .1
    // uNoiseScale.value = (PARAMS.noiseScale * Math.abs(current.x) * 10) + PARAMS.noiseScale
    // uAmplitudeStrength.value = (PARAMS.amplitudeStrength * Math.abs(current.x) * -.9) + PARAMS.amplitudeStrength
  }
}
