precision highp float;
uniform sampler2D texture;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uAspect;
uniform float uSize;
uniform float uOpacity;

float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
    uv -= disc_center;
    float dist = sqrt(dot(uv, uv));
    return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}

void main() {
    vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;

    vec4 tex = texture2D(texture, uv);

    vec3 cursor = vec3(circle(uv, uPointer, 0.0, .1 - uSize)) * uOpacity;
    cursor *= vec3(1., uVelocity);
    cursor = mix(cursor, vec3(0.0), .009);
    cursor = clamp(cursor, vec3(0.0), vec3(1.0));

    vec4 finalColor = vec4(cursor + tex.rgb * .9875, 1.);

    gl_FragColor = finalColor;
}