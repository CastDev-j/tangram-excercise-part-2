uniform vec3 uColor;
uniform float uTime;
uniform float uActive;

varying vec3 vPosition;
varying float vOffset;

void main() {
    vec3 positionColor = (vPosition + 0.5 - vOffset * 0.5);
    float pulse = 0.65 + 0.35 * sin(uTime * 8.0);
    vec3 activeTint = vec3(1.0, 1.0, 0.45);
    vec3 activeGlow = activeTint * 0.35 * pulse * uActive;
    vec3 baseColor = uColor + positionColor * 0.1;
    vec3 finalColor = mix(baseColor, baseColor * 1.35 + activeGlow, uActive);

    gl_FragColor = vec4(finalColor, 1.0);

}