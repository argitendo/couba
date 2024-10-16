import * as THREE from 'three';
import { angleOf2Points, isMobileOrTablet } from "./utils";
import { config } from "./config";

const uOffset = { value: new THREE.Vector2(0.0, 0.0) };

/**Three js Initialize */
export async function threeInit(canvas, braceletTexPath = null) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: canvas,
    antialias: true,
  });

  // Scene
  const scene = new THREE.Scene();

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF, 5);
  light.position.set(0.0, 1.0, 1.0).normalize();
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
  scene.add(light, ambientLight);

  // camera Three.js
  const targetAspectRatio = config.videoSize.width / config.videoSize.height;
  const camera = new THREE.PerspectiveCamera(config.fov.value, targetAspectRatio, 0.1, 1000);
  camera.position.set(0, 0.0, 1.0);

  // Texture loader
  const texLoader = new THREE.TextureLoader();
  const model = { bracelet: null };

  // Create Earring Plane
  if (braceletTexPath) {
    const braceletPlane = new THREE.PlaneGeometry(0.1, 0.1);
    const braceletTex = texLoader.load(braceletTexPath);
    const uniforms = {
      uTexture: { value: braceletTex },
      uOffset: uOffset
    };
    const vertexShader = `
      uniform vec2 uOffset;
      varying vec2 v_uv;

      void main() {
        v_uv = uv + (uOffset * 2.);
        vec3 newPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
    const fragmentShader = `
      uniform sampler2D uTexture;
      varying vec2 v_uv;

      vec2 scaleUV(vec2 uv, float scale) {
        float center = 0.5;
        return ((uv - center) * scale) + center;
      }

      void main() {
        // gl_FragColor = vec4(texture2D(uTexture, scaleUV(v_uv, 1.)).rgb, 1.);
        gl_FragColor = texture2D(uTexture, scaleUV(v_uv, 1.));
      }
    `;
    const braceletMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    model.bracelet = new THREE.Mesh(braceletPlane, braceletMat);
    model.bracelet.name = 'bracelet';
    scene.add(model.bracelet);
  }
  renderer.render(scene, camera);

  return {
    renderer: renderer,
    scene: scene,
    model: model,
    camera: camera,
  }
}

/**Change rotation (using quaternion) of object given the `bonesName` and `rotation`.*/
function rigRotation(model, bonesName, rotation, slerpAmount) {
  if (!model) return;
  const part = model.getObjectByName(bonesName);
  if (!part) return;
  const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z, 'ZYX');
  const quaternion = new THREE.Quaternion().setFromEuler(euler);
  part.quaternion.slerp(quaternion, slerpAmount);
}

/**Convert from 0 to 1 coordinate to -1 to 1 coordinate */
export function normalizeLandmark(landmark, multiplier = 1, withAspectRatio = true) {
  const x = (landmark.x * 2) - 1;
  const y = -((landmark.y * 2) - 1);
  const z = -landmark.z;
  const result = new THREE.Vector3(x * multiplier, y * multiplier, z);
  if (withAspectRatio) {
    const aspectRatio = config.videoSize.width / config.videoSize.height;
    if (aspectRatio > 1) { result.x *= aspectRatio }
    if (aspectRatio < 1) { result.y *= (1 / aspectRatio) }
  }
  return result
}

let prevDistance = 0;
export const fingerList = ['index', 'middle', 'ring', 'pinky'];

/**Convert landmark from normalize (0, 1) screen coordinate to (width x height) pixel coordinate */
function getPixel(landmark) {
  // The magnitude of z uses roughly the same scale as x.
  // https://developers.google.com/mediapipe/solutions/vision/hand_landmarker/web_js#handle_and_display_results
  return {
    x: landmark.x * config.videoSize.width,
    y: landmark.y * config.videoSize.height,
    z: landmark.z * config.videoSize.width
  }
}

export const degToRad = (degree) => { return degree / 180 * Math.PI };
export const radToDeg = (radian) => { return radian / Math.PI * 180 };

export function rigBracelet(model, handLandmarks, camera, setInstruction) {
  const bracelet = model.bracelet.getObjectByName('bracelet');
  const hl = handLandmarks;
  const wristPxl = getPixel(hl.wrist);
  const indexMcpPxl = getPixel(hl.index.mcp);
  const middleMcpPxl = getPixel(hl.middle.mcp);
  const pinkyMcpPxl = getPixel(hl.pinky.mcp);

  // -- Rig Scale
  let wristToMiddleMcpDistance = 1;
  wristToMiddleMcpDistance = Math.sqrt((wristPxl.x - middleMcpPxl.x)**2 + (wristPxl.y - middleMcpPxl.y)**2);
  const indexToPinkyDistance = Math.sqrt((indexMcpPxl.x - pinkyMcpPxl.x)**2 + (indexMcpPxl.y - pinkyMcpPxl.y)**2);
  // console.log(distance.toFixed(0));
  if (prevDistance === 0) prevDistance = wristToMiddleMcpDistance;
  let alpha = config.lerp.value; // exponential smoothing alpha
  wristToMiddleMcpDistance = alpha * wristToMiddleMcpDistance + (1 - alpha) * prevDistance;

  const divider = isMobileOrTablet() ? 95 : 75;
  const skala = wristToMiddleMcpDistance / divider;
  bracelet.scale.set(skala, skala, skala);

  // -- Rig Rotation
  const angleX = 0;
  const angleY = 0;
  const angleZ = -(Math.PI/2 - angleOf2Points(wristPxl, middleMcpPxl, 'z', 1));
  // console.log('angleZ:', (angleZ * 180 / Math.PI).toFixed(1));

  // const wrapCoef = 0.1;

  // if (hl.handedness === 'Left') {
  //   const paramAngleZ = angleOf2Points(indexMcpPxl, pinkyMcpPxl, 'z', 1);
  //   let targetAngleX = angleOf2Points(hl.index.mcp, hl.pinky.mcp, 'x', 1) + degToRad(180);
  //   let targetAngleY = angleOf2Points(hl.index.mcp, hl.pinky.mcp, 'y', 1);
  //   const weightX = -Math.sin(targetAngleX);
  //   const weightY = Math.sin(targetAngleY);

  //   if (Math.abs(paramAngleZ) < degToRad(45) || Math.abs(paramAngleZ) > degToRad(135)) {
  //     // angleY = -targetAngleY;
  //     uOffset.value = new THREE.Vector2(weightY * wrapCoef, 0.0);

  //   } else if (Math.abs(paramAngleZ) >= degToRad(45) && Math.abs(paramAngleZ) <= degToRad(135)) {
  //     // angleY = targetAngleX;
  //     uOffset.value = new THREE.Vector2(weightX * wrapCoef, 0.0);
  //   }
  // }
  // else if (hl.handedness === 'Right') {
  //   const paramAngleZ = angleOf2Points(pinkyMcpPxl, indexMcpPxl, 'z', 1);
  //   // console.log(radToDeg(paramAngleZ).toFixed(0));
  //   let targetAngleX = angleOf2Points(hl.pinky.mcp, hl.index.mcp, 'x', 1) + degToRad(180);
  //   let targetAngleY = angleOf2Points(hl.pinky.mcp, hl.index.mcp, 'y', 1);
  //   const weightX = -Math.sin(targetAngleX);
  //   const weightY = Math.sin(targetAngleY);

  //   if (Math.abs(paramAngleZ) < degToRad(45) || Math.abs(paramAngleZ) > degToRad(135)) {
  //     // angleY = -targetAngleY;
  //     uOffset.value = new THREE.Vector2(weightY * wrapCoef, 0.0);

  //   } else if (Math.abs(paramAngleZ) >= degToRad(45) && Math.abs(paramAngleZ) <= degToRad(135)) {
  //     // angleY = targetAngleX;
  //     uOffset.value = new THREE.Vector2(weightX * wrapCoef, 0.0);
  //   }
  // }

  const braceletRotation = { x: angleX, y: angleY, z: angleZ };
  rigRotation(model.bracelet, 'bracelet', braceletRotation, 1);

  // -- Rig Position
  const braceletProjection = bracelet.position.clone().project(camera);
  const multiplier = isMobileOrTablet() ? [-0.075, 0.05] : [-0.025, 0.05]
  let targetPos = hl.wrist;
  targetPos.x += Math.sin(angleZ) * skala * multiplier[0];
  targetPos.y += Math.cos(angleZ) * skala * multiplier[1];

  const rp = normalizeLandmark(targetPos, 1, false);
  rp.z = braceletProjection.z;
  rp.unproject(camera);

  const mirrored = -1; // 1 = not mirrored; -1 = mirrored
  const braceletTargetPos = new THREE.Vector3(mirrored * rp.x, rp.y, rp.z);
  model.bracelet.position.lerp(braceletTargetPos, config.lerp.value);

  // -- Showing Conditions
  const wristToMiddleMcpThreshold = 100;
  // console.log(
  //   'wrist to middle mcp distance:', wristToMiddleMcpDistance.toFixed(0),
  //   '| index to pinky distance:', indexToPinkyDistance.toFixed(0)
  // );

  if (
    wristToMiddleMcpDistance > wristToMiddleMcpThreshold
    && indexToPinkyDistance > wristToMiddleMcpDistance * 0.7
    && wristToMiddleMcpDistance > indexToPinkyDistance * 0.9
  ) {
    // Only allow show model when back of the hand showed
    if (hl.handedness === 'Left') {
      if (
        (pinkyMcpPxl.x < indexMcpPxl.x && middleMcpPxl.y < wristPxl.y)
        || (pinkyMcpPxl.x > indexMcpPxl.x && middleMcpPxl.y > wristPxl.y)
      ) {
        bracelet.visible = true;
        setInstruction(false);
      } else {
        bracelet.visible = false;
        setInstruction(true);
      }
    } else if (hl.handedness === 'Right') {
      if (
        (pinkyMcpPxl.x > indexMcpPxl.x && middleMcpPxl.y < wristPxl.y)
        || (pinkyMcpPxl.x < indexMcpPxl.x && middleMcpPxl.y > wristPxl.y)
      ) {
        bracelet.visible = true;
        setInstruction(false);
      } else {
        bracelet.visible = false;
        setInstruction(true);
      }
    }
  } else {
    bracelet.visible = false;
    setInstruction(true);
  }

}
