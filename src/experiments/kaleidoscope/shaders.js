export const vertexShader = `
  precision mediump float;
  attribute vec3 aPosition;
  attribute vec2 aTexCoord;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  varying vec2 vTexCoord;

  void main() {
    vTexCoord = aTexCoord;
    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
  }
`;

export const fragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif
  uniform sampler2D uCamera;
  // uViewport is reserved by p5 and is overwritten every draw.
  uniform vec2 uScreenSize;
  uniform vec2 uTurn;
  uniform vec2 uSourceScale;
  uniform vec2 uCellCenter;
  uniform float uCellScale;
  uniform float uPattern;
  uniform float uFrontCamera;
  varying vec2 vTexCoord;

  // Reflect a point across a mirror only when it is outside that mirror.
  vec2 reflectIntoCell(vec2 point, vec2 normal, float distance) {
    return point - 2.0 * max(dot(point, normal) - distance, 0.0) * normal;
  }

  vec2 foldMirrors(vec2 point) {
    // Coordinates are bounded by uCellScale, independent of screen shape.
    // Twelve folds cover that range for all three triangle arrangements.
    for (int i = 0; i < 12; i++) {
      if (uPattern < 0.5) {
        // Equilateral triangle: 60 / 60 / 60 degrees.
        point.y = abs(point.y);
        point = reflectIntoCell(point, vec2(-0.8660254, 0.5), 0.0);
        point = reflectIntoCell(point, vec2(0.8660254, 0.5), 0.8660254);
      } else if (uPattern < 1.5) {
        // Right isosceles triangle: 45 / 45 / 90 degrees.
        point = abs(point);
        point = reflectIntoCell(point, vec2(0.7071068), 0.7071068);
      } else {
        // Right triangle: 30 / 60 / 90 degrees.
        point = abs(point);
        point = reflectIntoCell(point, vec2(0.8660254, 0.5), 0.8660254);
      }
    }
    return point;
  }

  void main() {
    vec2 point = (vTexCoord - 0.5) * uScreenSize;
    point *= uCellScale / max(uScreenSize.x, uScreenSize.y);
    vec2 source = foldMirrors(point + uCellCenter) - uCellCenter;

    // Turn the source inside fixed mirrors, like turning an object chamber.
    // There is deliberately no time uniform or automatic rotation.
    source = vec2(
      uTurn.x * source.x - uTurn.y * source.y,
      uTurn.y * source.x + uTurn.x * source.y
    );
    vec2 uv = 0.5 + source * uSourceScale;
    uv.x = mix(uv.x, 1.0 - uv.x, uFrontCamera);
    gl_FragColor = vec4(texture2D(uCamera, uv).rgb, 1.0);
  }
`;
