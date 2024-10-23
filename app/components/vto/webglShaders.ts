/* eslint-disable no-console */
/** Checking if user open from mobile/tablet device */
export function isMobileOrTablet() {
  return /Mobi|Android|iPad|Tablet/i.test(navigator.userAgent);
}

export function isPowerOf2(value: number) {
  // eslint-disable-next-line no-bitwise
  return (value & (value - 1)) === 0;
}

/** Convert Color Hex to RGB value */
const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // return {r, g, b}
  return { r, g, b };
};

/** Get webgl context from canvas */
function getWebglContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl');
  // if (!gl) {
  //   console.error('WebGL not supported, falling back on experimental-webgl');
  //   gl = canvas.getContext('experimental-webgl');
  // }
  if (!gl) {
    console.log('Your browser does not support WebGL');
    return null;
  }
  return gl;
}

export const defaultVsShaderString: string = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

export const defaultFsShaderString: string = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_image;
  uniform vec2 u_textureSize;
  uniform float u_smoothingDistance;
  uniform float u_smoothingColor;
  uniform float u_brightness;
  uniform float u_contrast;
  uniform float u_exposure;
  uniform float u_saturation;
  uniform vec3 u_tint;

  vec3 adjustBrightnessContrast(vec3 color, float brightness, float contrast) {
    return (color - 0.5) * contrast + 0.5 + brightness;
  }

  vec3 adjustExposure(vec3 color, float exposure) {
    return color * exposure;
  }

  vec3 adjustSaturation(vec3 color, float saturation) {
    float gray = dot(color, vec3(0.3, 0.59, 0.11));
    return mix(vec3(gray), color, saturation);
  }

  vec3 applyTint(vec3 color, vec3 tint) {
    return clamp(color + tint, 0.0, 1.0);
  }

  float gaussian(float x, float sigma) {
    return exp(-0.5 * x * x / (sigma * sigma)) / (2.0 * 3.14159265359 * sigma * sigma);
  }

  void main() {
    vec2 tex_offset = 1.0 / u_textureSize;
    float sigma_space = u_smoothingDistance;
    float sigma_range = u_smoothingColor;
    const int radius = 5;
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

    vec4 smoothedColor = color_sum / weight_sum;
    vec3 adjustedColor = adjustBrightnessContrast(smoothedColor.rgb, u_brightness, u_contrast);
    adjustedColor = adjustExposure(adjustedColor, u_exposure);
    adjustedColor = adjustSaturation(adjustedColor, u_saturation);
    adjustedColor = applyTint(adjustedColor, u_tint);
    smoothedColor.rgb = adjustedColor;
    gl_FragColor = smoothedColor;
  }
`;

type GLenum = number;
type GLuint = number;
type GLint = number;
type Float32List = Float32Array | number[];

/** Compile webgl shader */
function compileShader(
  gl: WebGLRenderingContext,
  shaderSource: string,
  shaderType: GLenum
) {
  const shader = gl.createShader(shaderType);
  if (!shader) return null;

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaderProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
) {
  // -- Define shaders
  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER
  );

  // -- Create link and shader program
  const program = gl.createProgram();

  if (vertexShader && fragmentShader && program) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program));
      return null;
    }
  }

  return program;
}

function initTexCoordBuffer(gl: WebGLRenderingContext) {
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  // texture uv coordinate from 0 to 1
  const texCoords = [
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
  return texCoordBuffer;
}

function initPositionBuffer(gl: WebGLRenderingContext) {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // position cordinate from -1 to 1
  const positions = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positionBuffer;
}

function initBuffers(gl: WebGLRenderingContext) {
  const positionBuffer = initPositionBuffer(gl);
  const texCoordBuffer = initTexCoordBuffer(gl);

  if (!positionBuffer || !texCoordBuffer) return null;

  return {
    position: positionBuffer,
    textureCoord: texCoordBuffer,
  };
}

function setAttribute(
  gl: WebGLRenderingContext,
  buffer: WebGLBuffer,
  targetProgram: GLuint
) {
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

export function createTexture(gl: WebGLRenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return texture;
}

export function updateTexture(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement
) {
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
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}

export function drawScene(gl: WebGLRenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

type ShaderParams = {
  smoothingDistance: number;
  smoothingColor: number;
  brightness: number;
  contrast: number;
  exposure: number;
  saturation: number;
  tint: string;
};

export function createShader(
  canvas: HTMLCanvasElement,
  videoWidth: number,
  videoHeight: number,
  vertexShaderString: string = defaultVsShaderString,
  fragmentShaderString: string = defaultFsShaderString,
  params: ShaderParams = {
    smoothingDistance: 3.0,
    smoothingColor: 0.06,
    brightness: 0,
    contrast: 1,
    exposure: 1,
    saturation: 1,
    tint: '#000000',
  }
) {
  // -- Initial WebGL Context
  const gl = getWebglContext(canvas);
  if (!gl) return null;

  // -- Compile Shaders
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderString,
    fragmentShaderString
  );
  if (!shaderProgram) return null;

  const programInfo = {
    program: shaderProgram,
    attributes: {
      position: gl.getAttribLocation(shaderProgram, 'a_position'),
      texCoord: gl.getAttribLocation(shaderProgram, 'a_texCoord'),
    },
    uniforms: {
      texture: gl.getUniformLocation(shaderProgram, 'u_image'),
      textureSize: gl.getUniformLocation(shaderProgram, 'u_textureSize'),
      // sigmaRange: gl.getUniformLocation(shaderProgram, 'sigma_range'),
      smoothingDistance: gl.getUniformLocation(
        shaderProgram,
        'u_smoothingDistance'
      ),
      smoothingColor: gl.getUniformLocation(shaderProgram, 'u_smoothingColor'),
      brightness: gl.getUniformLocation(shaderProgram, 'u_brightness'),
      contrast: gl.getUniformLocation(shaderProgram, 'u_contrast'),
      exposure: gl.getUniformLocation(shaderProgram, 'u_exposure'),
      saturation: gl.getUniformLocation(shaderProgram, 'u_saturation'),
      tint: gl.getUniformLocation(shaderProgram, 'u_tint'),
    },
  };
  gl.useProgram(shaderProgram);

  // -- Define Geometry and Buffers
  const buffers = initBuffers(gl);
  if (!buffers) return null;

  // -- Set attributes and uniforms
  setAttribute(gl, buffers.position, programInfo.attributes.position);
  setAttribute(gl, buffers.textureCoord, programInfo.attributes.texCoord);
  gl.uniform1i(programInfo.uniforms.texture, 0);
  gl.uniform2fv(programInfo.uniforms.textureSize, [videoWidth, videoHeight]);
  // const sigmaRangeConst = isMobileOrTablet() ? 0.1 : 0.06;
  // gl.uniform1f(programInfo.uniforms.sigmaRange, sigmaRangeConst);
  gl.uniform1f(
    programInfo.uniforms.smoothingDistance,
    params.smoothingDistance
  );
  gl.uniform1f(programInfo.uniforms.smoothingColor, params.smoothingColor);
  gl.uniform1f(programInfo.uniforms.brightness, params.brightness);
  gl.uniform1f(programInfo.uniforms.contrast, params.contrast);
  gl.uniform1f(programInfo.uniforms.exposure, params.exposure);
  gl.uniform1f(programInfo.uniforms.saturation, params.saturation);
  const tint = hex2rgb(params.tint);
  gl.uniform3fv(programInfo.uniforms.tint, [tint.r, tint.g, tint.b]);

  return gl;
}

export class BeautyShader {
  canvas: HTMLCanvasElement;
  videoWidth: number;
  videoHeight: number;
  vertexShaderString: string;
  fragmentShaderString: string;
  params: ShaderParams;

  gl: WebGLRenderingContext;
  shaderProgram: WebGLProgram;
  programInfo: {
    program: WebGLProgram,
    attributes: {
      position: GLint,
      texCoord: GLint
    },
    uniforms: {
      texture: WebGLUniformLocation | null,
      textureSize: WebGLUniformLocation | null,
      smoothingDistance: WebGLUniformLocation | null,
      smoothingColor: WebGLUniformLocation | null,
      brightness: WebGLUniformLocation | null,
      contrast: WebGLUniformLocation | null,
      exposure: WebGLUniformLocation | null,
      saturation: WebGLUniformLocation | null,
      tint: WebGLUniformLocation | null,
    }
  };
  texture: WebGLTexture | null;

  constructor(
    canvas: HTMLCanvasElement,
    videoWidth: number,
    videoHeight: number,
    vertexShaderString: string = defaultVsShaderString,
    fragmentShaderString: string = defaultFsShaderString,
    params: ShaderParams = {
      smoothingDistance: 3.0,
      smoothingColor: 0.06,
      brightness: 0,
      contrast: 1,
      exposure: 1,
      saturation: 1,
      tint: '#000000',
    }
  ) {
    this.canvas = canvas;
    this.videoWidth = videoWidth;
    this.videoHeight = videoHeight;
    this.vertexShaderString = vertexShaderString;
    this.fragmentShaderString = fragmentShaderString;
    this.params = params;
  }

  initShader() {
    const gl = getWebglContext(this.canvas);
    if (!gl) throw new Error('Cannot get WebGL Context');

    const shaderProgram = initShaderProgram(
      gl,
      this.vertexShaderString,
      this.fragmentShaderString
    );
    if (!shaderProgram) throw new Error('Cannot init shader program');
    this.shaderProgram = shaderProgram;

    this.programInfo = {
      program: shaderProgram,
      attributes: {
        position: gl.getAttribLocation(shaderProgram, 'a_position'),
        texCoord: gl.getAttribLocation(shaderProgram, 'a_texCoord'),
      },
      uniforms: {
        texture: gl.getUniformLocation(shaderProgram, 'u_image'),
        textureSize: gl.getUniformLocation(shaderProgram, 'u_textureSize'),
        smoothingDistance: gl.getUniformLocation(
          shaderProgram,
          'u_smoothingDistance'
        ),
        smoothingColor: gl.getUniformLocation(shaderProgram, 'u_smoothingColor'),
        brightness: gl.getUniformLocation(shaderProgram, 'u_brightness'),
        contrast: gl.getUniformLocation(shaderProgram, 'u_contrast'),
        exposure: gl.getUniformLocation(shaderProgram, 'u_exposure'),
        saturation: gl.getUniformLocation(shaderProgram, 'u_saturation'),
        tint: gl.getUniformLocation(shaderProgram, 'u_tint'),
      },
    };
    gl.useProgram(shaderProgram);

    // -- Define Geometry and Buffers
    const buffers = initBuffers(gl);
    if (!buffers) throw new Error('Cannot init buffers');

    // -- Set attributes and uniforms
    const programInfo = this.programInfo;
    const params = this.params;
    setAttribute(gl, buffers.position, programInfo.attributes.position);
    setAttribute(gl, buffers.textureCoord, programInfo.attributes.texCoord);
    gl.uniform1i(programInfo.uniforms.texture, 0);
    gl.uniform2fv(
      programInfo.uniforms.textureSize,
      [this.videoWidth, this.videoHeight]
    );
    gl.uniform1f(
      programInfo.uniforms.smoothingDistance,
      params.smoothingDistance
    );
    gl.uniform1f(programInfo.uniforms.smoothingColor, params.smoothingColor);
    gl.uniform1f(programInfo.uniforms.brightness, params.brightness);
    gl.uniform1f(programInfo.uniforms.contrast, params.contrast);
    gl.uniform1f(programInfo.uniforms.exposure, params.exposure);
    gl.uniform1f(programInfo.uniforms.saturation, params.saturation);
    const tint = hex2rgb(params.tint);
    gl.uniform3fv(programInfo.uniforms.tint, [tint.r, tint.g, tint.b]);

    this.gl = gl;
    this.createTexture();
  }

  createTexture() {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.texture = texture;
  };

  updateTexture(video: HTMLVideoElement) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
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
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  updatePositionBuffer(positions: Float32List) {
    const gl = this.gl;
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) throw new Error('Failed to create positions buffer')
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    setAttribute(gl, positionBuffer, this.programInfo.attributes.position);
  }

  updateTexCoordBuffer(texCoords: Float32List) {
    const gl = this.gl;
    const texCoordBuffer = gl.createBuffer();
    if (!texCoordBuffer) throw new Error('Failed to create texCoord buffer')
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    setAttribute(gl, texCoordBuffer, this.programInfo.attributes.texCoord);
  }

  drawScene() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}

export const bboxToPositions = (
  originX: number,
  originY: number,
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  let x0 = 2 * (originX / maxWidth) - 1;
  let y0 = 2 * (originY / maxHeight) - 1;
  let x1 = 2 * ((originX + width) / maxWidth) - 1;
  let y1 = 2 * ((originY + height) / maxHeight) - 1;
  y0 = y0 * -1;
  y1 = y1 * -1;
  return [
    x0, y0,
    x1, y0,
    x0, y1,
    x1, y1
  ];
}

export const bboxToTexcoord = (
  originX: number,
  originY: number,
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) => {
  let x0 = originX / maxWidth;
  let y0 = originY / maxHeight;
  let x1 = (originX + width) / maxWidth;
  let y1 = (originY + height) / maxHeight;
  y0 = 1 - y0;
  y1 = 1 - y1;
  return [
    x0, y0,
    x1, y0,
    x0, y1,
    x1, y1
  ];
}
