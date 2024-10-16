import { isMobileOrTablet } from "./utils";

export function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

/**Get webgl context from canvas */
function getWebglContext(canvas) {
  let gl = canvas.getContext('webgl');
  if (!gl) {
    console.error('WebGL not supported, falling back on experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
  }
  if (!gl) {
    console.log('Your browser does not support WebGL');
    return null;
  }
  return gl;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

const loopRadius = isMobileOrTablet() ? 3 : 5;
const fragmentShaderSource = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec2 u_textureSize;
  uniform float sigma_range;

  float gaussian(float x, float sigma) {
    return exp(-0.5 * x * x / (sigma * sigma)) / (2.0 * 3.14159265359 * sigma * sigma);
  }

  void main() {
    vec2 tex_offset = 1.0 / u_textureSize;
    float sigma_space = 4.0;
    // float sigma_range = 0.1;
    const int radius = ${loopRadius};

    vec4 center_color = texture2D(u_image, v_texCoord);
    float weight_sum = 0.0;
    vec4 color_sum = vec4(0.0);

    for (int x = -radius; x <= radius; x++) {
      for (int y = -radius; y <= radius; y++) {
        vec2 offset = vec2(float(x), float(y)) * tex_offset;
        vec4 sample_color = texture2D(u_image, v_texCoord + offset);

        float weight = gaussian(length(offset), sigma_space) * gaussian(distance(sample_color.rgb, center_color.rgb), sigma_range);
        color_sum += sample_color * weight;
        weight_sum += weight;
      }
    }

    // add slightly pink color
    vec4 smoothedColor = color_sum / weight_sum;
    smoothedColor.r += 0.015;
    smoothedColor.b += 0.015;
    smoothedColor = clamp(smoothedColor, 0.0, 1.0);

    gl_FragColor = smoothedColor;
  }
`;

/**Compile webgl shader */
function compileShader(gl, shaderSource, shaderType) {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
  // -- Define shaders
  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  // -- Create link and shader program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Error linking program:', gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function initTexCoordBuffer(gl) {
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  const texCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  return texCoordBuffer;
}

function initPositionBuffer(gl) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function initBuffers(gl) {
  const positionBuffer = initPositionBuffer(gl);
  const texCoordBuffer = initTexCoordBuffer(gl);

  return {
    position: positionBuffer,
    textureCoord: texCoordBuffer
  }
}

function setAttribute(gl, buffer, targetProgram) {
  // Reference: https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample6/draw-scene.js#L102
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const numComponents = 2;
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.vertexAttribPointer(
    targetProgram,
    numComponents,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(targetProgram);
}

export function createTexture(gl) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

export function updateTexture(gl, texture, video) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const level = 0;
  const internalFormat = gl.RGBA;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    srcFormat,
    srcType,
    video
  );
  // Flip image pixels into the bottom-to-top order that WebGL expects.
  // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

export function drawScene(gl) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export function createShader(canvas, videoWidth, videoHeight) {
  // -- Initial WebGL Context
  const gl = getWebglContext(canvas);


  // -- Compile Shaders
  const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);
  const programInfo = {
    program: shaderProgram,
    attributes: {
      position: gl.getAttribLocation(shaderProgram, 'a_position'),
      texCoord: gl.getAttribLocation(shaderProgram, 'a_texCoord')
    },
    uniforms: {
      texture: gl.getUniformLocation(shaderProgram, 'u_image'),
      textureSize: gl.getUniformLocation(shaderProgram, 'u_textureSize'),
      sigmaRange: gl.getUniformLocation(shaderProgram, 'sigma_range')
    }
  };
  gl.useProgram(shaderProgram);

  // -- Define Geometry and Buffers
  const buffers = initBuffers(gl);

  // -- Set attributes and uniforms
  setAttribute(gl, buffers.position, programInfo.attributes.position);
  setAttribute(gl, buffers.textureCoord, programInfo.attributes.texCoord);
  gl.uniform1i(programInfo.uniforms.texture, 0);
  gl.uniform2fv(programInfo.uniforms.textureSize, [videoWidth, videoHeight]);
  const sigmaRangeConst = isMobileOrTablet() ? 0.1 : 0.06;
  gl.uniform1f(programInfo.uniforms.sigmaRange, sigmaRangeConst);

  return gl;
}