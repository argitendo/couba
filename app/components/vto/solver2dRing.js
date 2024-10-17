import * as THREE from 'three';
import { angleOf2Points, isMobileOrTablet, midPoint } from "./utils";
import { config } from "./config";

const uOffset = { value: new THREE.Vector2(0.0, 0.0) };

/**Three js Initialize */
export async function threeInit(canvas, ringTexPath = null) {
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
  const model = { ring: null };

  // Create Earring Plane
  if (ringTexPath) {
    // const ringPlane = new THREE.PlaneGeometry(0.1, 0.1);
    const ringPlane = new THREE.PlaneGeometry(0.4, 0.4);
    const ringTex = texLoader.load(ringTexPath);
    // const ringMat = new THREE.MeshBasicMaterial({
    //   map: ringTex,
    //   transparent: true,
    // });
    const uniforms = {
      uTexture: { value: ringTex },
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
    const ringMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    model.ring = new THREE.Mesh(ringPlane, ringMat);
    model.ring.name = 'ring';
    scene.add(model.ring);
  }
  // // console.log(model);
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

export function rigRing(model, handLandmarks, handWorldLandmarks, camera, fingerName, setInstruction, optScale, optPosX, optPosY) {
  if (!fingerList.includes(fingerName)) fingerName = 'ring';

  const ring = model.ring.getObjectByName('ring');
  const hl = handLandmarks;
  // const hwl = handWorldLandmarks;
  const mcpPxl = getPixel(hl[fingerName].mcp);
  const pipPxl = getPixel(hl[fingerName].pip);
  const indexMcpPxl = getPixel(hl.index.mcp);
  const pinkyMcpPxl = getPixel(hl.pinky.mcp);

  // -- Rig Scale
  let mcpToPipDistance = 1;
  let alpha = 0.9; // exponential smoothing alpha
  mcpToPipDistance = Math.sqrt((mcpPxl.x - pipPxl.x)**2 + (mcpPxl.y - pipPxl.y)**2);
  const indexToPinkyDistance = Math.sqrt((indexMcpPxl.x - pinkyMcpPxl.x)**2 + (indexMcpPxl.y - pinkyMcpPxl.y)**2);
  // console.log(distance.toFixed(0));
  if (prevDistance === 0) prevDistance = mcpToPipDistance;
  mcpToPipDistance = alpha * mcpToPipDistance + (1 - alpha) * prevDistance;

  const divider = isMobileOrTablet() ? 190 : 150;
  const skala = mcpToPipDistance / divider * optScale;
  ring.scale.set(skala, skala, skala);

  // -- Rig Rotation
  const angleZ = -(Math.PI/2 - angleOf2Points(mcpPxl, pipPxl, 'z', 1));

  let angleY = 0;
  const wrapCoef = 0.1;

  if (hl.handedness === 'Left') {
    const paramAngleZ = angleOf2Points(indexMcpPxl, pinkyMcpPxl, 'z', 1);
    let targetAngleX = angleOf2Points(hl.index.mcp, hl.pinky.mcp, 'x', 1) + degToRad(180);
    let targetAngleY = angleOf2Points(hl.index.mcp, hl.pinky.mcp, 'y', 1);
    const weightX = -Math.sin(targetAngleX);
    const weightY = Math.sin(targetAngleY);

    if (Math.abs(paramAngleZ) < degToRad(45) || Math.abs(paramAngleZ) > degToRad(135)) {
      // angleY = -targetAngleY;
      uOffset.value = new THREE.Vector2(weightY * wrapCoef, 0.0);

    } else if (Math.abs(paramAngleZ) >= degToRad(45) && Math.abs(paramAngleZ) <= degToRad(135)) {
      // angleY = targetAngleX;
      uOffset.value = new THREE.Vector2(weightX * wrapCoef, 0.0);
    }
  }
  else if (hl.handedness === 'Right') {
    const paramAngleZ = angleOf2Points(pinkyMcpPxl, indexMcpPxl, 'z', 1);
    // console.log(radToDeg(paramAngleZ).toFixed(0));
    let targetAngleX = angleOf2Points(hl.pinky.mcp, hl.index.mcp, 'x', 1) + degToRad(180);
    let targetAngleY = angleOf2Points(hl.pinky.mcp, hl.index.mcp, 'y', 1);
    const weightX = -Math.sin(targetAngleX);
    const weightY = Math.sin(targetAngleY);

    if (Math.abs(paramAngleZ) < degToRad(45) || Math.abs(paramAngleZ) > degToRad(135)) {
      // angleY = -targetAngleY;
      uOffset.value = new THREE.Vector2(weightY * wrapCoef, 0.0);

    } else if (Math.abs(paramAngleZ) >= degToRad(45) && Math.abs(paramAngleZ) <= degToRad(135)) {
      // angleY = targetAngleX;
      uOffset.value = new THREE.Vector2(weightX * wrapCoef, 0.0);
    }
  }

  const angleX = 0;
  const ringRotation = { x: angleX, y: angleY, z: angleZ };
  rigRotation(model.ring, 'ring', ringRotation, 1);

  // -- Rig Position
  const ringProjection = ring.position.clone().project(camera);
  const midPos = midPoint(hl[fingerName].mcp, hl[fingerName].pip);
  const midMidPos = midPoint(hl[fingerName].mcp, midPos);
  const targetPos = midPoint(midMidPos, hl[fingerName].pip);

  const rp = normalizeLandmark(targetPos, 1, false);
  rp.z = ringProjection.z;
  rp.unproject(camera);

  const offset = { x: 0, y: 0, z: 0 };
  const mirrored = -1; // 1 = not mirrored; -1 = mirrored
  const ringTargetPos = new THREE.Vector3(
    mirrored * (rp.x + offset.x) + optPosX,
    rp.y + offset.y + optPosY,
    rp.z + offset.z
  );
  model.ring.position.lerp(ringTargetPos, config.lerp.value);

  // -- Showing Conditions
  // console.log(
  //   'mcpToPipDistance > ringAreaThreshold', mcpToPipDistance > 75,
  //   'itp > mcpToPip', indexToPinkyDistance * 1.1 > mcpToPipDistance
  // );
  const mcpToPipThreshold = 75;
  let itpFactor = 1;
  if (fingerName === 'pinky') { itpFactor *= 0.7 }
  else if (fingerName === 'index') { itpFactor *= 0.85 }
  else { itpFactor = 1 }

  if (
    mcpToPipDistance > mcpToPipThreshold
    && indexToPinkyDistance * itpFactor > mcpToPipDistance
    && mcpToPipDistance > indexToPinkyDistance * itpFactor * 0.6
  ) {
    // Only allow show model when back of the hand showed
    if (hl.handedness === 'Left') {
      if (
        (pinkyMcpPxl.x < indexMcpPxl.x && pipPxl.y < mcpPxl.y)
        || (pinkyMcpPxl.x > indexMcpPxl.x && pipPxl.y > mcpPxl.y)
      ) {
        ring.visible = true;
        setInstruction(false);
      } else {
        ring.visible = false;
        setInstruction(true);
      }
    } else if (hl.handedness === 'Right') {
      if (
        (pinkyMcpPxl.x > indexMcpPxl.x && pipPxl.y < mcpPxl.y)
        || (pinkyMcpPxl.x < indexMcpPxl.x && pipPxl.y > mcpPxl.y)
      ) {
        ring.visible = true;
        setInstruction(false);
      } else {
        ring.visible = false;
        setInstruction(true);
      }
    }
  } else {
    ring.visible = false;
    setInstruction(true);
  }

}
