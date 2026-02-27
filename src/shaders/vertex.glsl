uniform float uTime;

varying vec3 vPosition;
varying float vOffset;

void main() {
    float offset = sin(position.y * 2.0 + uTime * 3.0) * 0.1;

    vec3 localPosition = position;
    localPosition.x += offset;
    localPosition.y += sin(position.x * 3.0 + uTime * 4.0) * 0.2;

    vPosition = localPosition;
    vOffset = offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}