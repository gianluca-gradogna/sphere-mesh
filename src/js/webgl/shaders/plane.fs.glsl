// #pragma glslify: coverTexture = require('./utils/coverTexture')
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uTrail;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uRatio;
uniform float uTime;

varying vec2 vUv;

void main() {
    vec2 st = gl_FragCoord.xy / uResolution;

    vec3 col = uColor;
    // vec4 tex = coverTexture(uTex, vec2(100., 100.), vUv, uResolution);
    // vec4 tex = texture2D(uTrail, vUv);

    gl_FragColor = vec4(col, 1.);
    // gl_FragColor = tex;
}