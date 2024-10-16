import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls';
import {
  angleOf2Points,
  isMobileOrTablet,
  midPoint,
} from "./utils";
import { config } from "./config";
import { clamp } from 'three/src/math/MathUtils.js';

const necklacePlaneSize = 0.5;
const uOffset = { value: new THREE.Vector2(0.0, 0.0) }

/**Three js Initialize */
export async function threeInit(canvas, necklaceTexPath = null) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: canvas,
    antialias: true,
  });

  // Scene
  const scene = new THREE.Scene();

  // light
  const light = new THREE.DirectionalLight(0xFFFFFF, 2);
  light.position.set(0.0, 1.0, 1.0).normalize();
  const ambientLight = new THREE.AmbientLight(0xFFFFFF, 2);
  scene.add(light, ambientLight);

  // camera Three.js
  const targetAspectRatio = config.videoSize.width / config.videoSize.height;
  const camera = new THREE.PerspectiveCamera(config.fov.value, targetAspectRatio, 0.1, 1000);
  camera.position.set(0, 0.0, 1.0);
  // camera.position.set(0, 1.7, 1.2);
  // camera.lookAt(new THREE.Vector3(0, 1.7, 0));

  // orbital controls
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.screenSpacePanning = true;
  // // controls.target.set(0.0, 1.7, 0.0);
  // controls.target.set(0.0, 0.0, 0.0);
  // controls.update();

  // Texture loader
  const texLoader = new THREE.TextureLoader();
  const model = { l: null, r: null, neck: null };

  // Create Necklace Plane
  if (necklaceTexPath) {
    const necklacePlane = new THREE.PlaneGeometry(necklacePlaneSize, necklacePlaneSize, 32, 32);
    const necklaceTex = texLoader.load(necklaceTexPath);
    // const necklaceMat = new THREE.MeshBasicMaterial({
    //   map: necklaceTex,
    //   transparent: true,
    // });
    const uniforms = {
      uTexture: { value: necklaceTex },
      uOffset: uOffset,
    };
    const vertexShader = `
      uniform vec2 uOffset;
      varying vec2 vUv;

      vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        float M_PI = 3.1415926535897932384626433832795;
        position.x = position.x + (sin(uv.y * M_PI) * offset.x);
        position.y = position.y + (sin(uv.x * M_PI) * offset.y);
        return position;
      }

      void main() {
        vUv =  uv + (uOffset * 2.);
        vec3 newPosition = position;
        newPosition = deformationCurve(position, uv, uOffset);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;
    const fragmentShader = `
      uniform sampler2D uTexture;
      varying vec2 vUv;

      vec2 scaleUV(vec2 uv, float scale) {
        float center = 0.5;
        return ((uv - center) * scale) + center;
      }

      void main() {
        // gl_FragColor = vec4(texture2D(uTexture, scaleUV(vUv,1.)).rgb, 1.);
        gl_FragColor = texture2D(uTexture, scaleUV(vUv,1.));
      }
    `;
    const necklaceMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    model.neck = new THREE.Mesh(necklacePlane, necklaceMat);
    model.neck.name = 'necklace';
    scene.add(model.neck);
    // model.neck.position.setZ = -0.2;
  }
  // console.log(model);
  renderer.render(scene, camera);

  return {
    renderer: renderer,
    scene: scene,
    model: model,
    camera: camera,
    // controls: controls,
  }
}

function rigRotation(model, bonesName, rotation, slerpAmount) {
  if (!model) return;
  const part = model.getObjectByName(bonesName);
  if (!part) return;
  const euler = new THREE.Euler(rotation.x, rotation.y, rotation.z);
  const quaternion = new THREE.Quaternion().setFromEuler(euler);
  part.quaternion.slerp(quaternion, slerpAmount);
}

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

export function rigNecklacePosition(model, faceLandmarks, poseLandmarks, camera, ctx) {
  // const head = model.getObjectByName('head');
  const necklace = model.neck.getObjectByName('necklace');
  const prevRotation = necklace.rotation.clone();

  const transMat4 = new THREE.Matrix4().fromArray(faceLandmarks.tm).transpose();
  // const rotation = new THREE.Euler().setFromRotationMatrix(transMat4);
  const translation = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const scale = new THREE.Vector3();
  transMat4.decompose(translation, rotation, scale);

  const faceLvec = new THREE.Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
  const faceRvec = new THREE.Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
  const faceWidth = faceLvec.distanceTo(faceRvec);
  const faceWidthPxl = faceWidth * config.videoSize.width;
  const faceTvec = new THREE.Vector3(faceLandmarks.t.x, faceLandmarks.t.y, faceLandmarks.z);
  const faceBvec = new THREE.Vector3(faceLandmarks.b.x, faceLandmarks.b.y, faceLandmarks.b.z);
  const faceHeight = faceTvec.distanceTo(faceBvec);
  // const faceHeightPxl = faceHeight * config.videoSize.height;

  // Scale
  const scaleBaseLine = 0.4;
  const skala = scaleBaseLine + faceHeight * 2.3; // affeted by face size
  necklace.scale.set(skala, skala, skala);

  let xm = (faceLandmarks.r.x + faceLandmarks.l.x) / 2;
  let ym = (faceLandmarks.t.y + faceLandmarks.b.y) / 2 + faceHeight * 1.3; // affected by face size

  const shoulderRotationOffset = Math.sin(prevRotation.y) * 0.1;
  const xmOffset = Math.sin(rotation.y) * 0.025 - Math.sin(rotation.z) * 0.07 - shoulderRotationOffset;
  const ymOffset = Math.sin(rotation.x) * 0.215 - Math.sin(rotation.z) * 0.05;

  xm += xmOffset * (faceWidthPxl / 175); // affected by face size
  ym += ymOffset * 1;

  const necklaceProjection = necklace.position.clone().project(camera);
  let midFace = { x: xm, y: ym, z: 0 };
  midFace = normalizeLandmark(midFace, 1, false);
  midFace.z = necklaceProjection.z;
  midFace.unproject(camera);
  const mirrored = -1; // 1 = not mirrored; -1 = mirrored
  const newPos = new THREE.Vector3(mirrored * midFace.x, midFace.y, necklace.position.z);
  necklace.position.lerp(newPos, config.lerp.value);

  // draw rotated nose
  const drawTarget = { x: xm, y: ym, z: 0 };
  ctx.save();
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(
    drawTarget.x * config.videoSize.width,
    drawTarget.y * config.videoSize.height,
    5, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

function degToRad(degree) {
  return degree * Math.PI / 180;
}

export function checkFaceSize(model, faceLandmarks, sl, swl, setShowInstruction) {
  const transMat4 = new THREE.Matrix4().fromArray(faceLandmarks.tm).transpose();
  const translation = new THREE.Vector3();
  const faceRotation = new THREE.Euler();
  const scale = new THREE.Vector3();
  transMat4.decompose(translation, faceRotation, scale);

  const midSlShoulder = midPoint(sl.lShoulder, sl.rShoulder);
  const faceBottom = faceLandmarks.b;

  const lShoulder = swl.lShoulder; // normalizeLandmark(sl.lShoulder);
  const rShoulder = swl.rShoulder; // normalizeLandmark(sl.rShoulder);
  const shoulderAngleY = angleOf2Points(lShoulder, rShoulder, 'y', 1) - degToRad(7);
  // const shoulderAngleZ = angleOf2Points(lShoulder, rShoulder, 'z', 1);

  const faceLvec = new THREE.Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
  const faceRvec = new THREE.Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
  const faceWidth = faceLvec.distanceTo(faceRvec);
  const faceWidthPxl = faceWidth * config.videoSize.width;
  const faceTvec = new THREE.Vector3(faceLandmarks.t.x, faceLandmarks.t.y, faceLandmarks.z);
  const faceBvec = new THREE.Vector3(faceLandmarks.b.x, faceLandmarks.b.y, faceLandmarks.b.z);
  const faceHeight = faceTvec.distanceTo(faceBvec);
  const faceHeightPxl = faceHeight * config.videoSize.height;

  const farSizeThreshold = 175;
  const nearSizeThreshold = 400;
  const shoulderAngleThreshold = isMobileOrTablet() ? Math.PI / 20 : Math.PI / 16;
  const crouchingThreshold = 0.05;

  if (
    faceWidthPxl < farSizeThreshold
    || faceHeightPxl > nearSizeThreshold
    || Math.abs(faceRotation.x) > Math.PI / 8 // 22.5 degree
    || Math.abs(faceRotation.y) > Math.PI / 4 // 45 degree
    || Math.abs(faceRotation.z) > Math.PI / 8 // 22.5 degree
    || Math.abs(shoulderAngleY) > shoulderAngleThreshold
    || midSlShoulder.y - faceBottom.y <= crouchingThreshold
    // || Math.abs(shoulderAngleZ) > Math.PI / 60
  ) {
    setShowInstruction(true);
    model.neck.visible = false;
  } else {
    if (!model.neck.visible) {
      setShowInstruction(false);
      model.neck.visible = true;
    }
  }

}

const prevOffset = { x: 0, y: 0 };
const alphaOffset = 0.25; // isMobileOrTablet() ? 0.1 : 0.25;

export function rigNecklacePosition2(model, faceLandmarks, sl, swl, camera, ctx) {
  // const head = model.getObjectByName('head');
  const necklace = model.neck.getObjectByName('necklace');

  const transMat4 = new THREE.Matrix4().fromArray(faceLandmarks.tm).transpose();
  // const rotation = new THREE.Euler().setFromRotationMatrix(transMat4);
  const translation = new THREE.Vector3();
  const rotation = new THREE.Euler();
  const scale = new THREE.Vector3();
  transMat4.decompose(translation, rotation, scale);
  const shoulderAngleY = angleOf2Points(swl.lShoulder, swl.rShoulder, 'y', 1) - degToRad(7);

  const faceLvec = new THREE.Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
  const faceRvec = new THREE.Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
  const faceWidth = faceLvec.distanceTo(faceRvec);
  const faceWidthPxl = faceWidth * config.videoSize.width;
  const faceTvec = new THREE.Vector3(faceLandmarks.t.x, faceLandmarks.t.y, faceLandmarks.z);
  const faceBvec = new THREE.Vector3(faceLandmarks.b.x, faceLandmarks.b.y, faceLandmarks.b.z);
  const faceHeight = faceTvec.distanceTo(faceBvec);
  // const faceHeightPxl = faceHeight * config.videoSize.height;

  // Scale
  const scaleBaseLine = 0.4;
  const skala = scaleBaseLine + faceHeight * 2.3; // affeted by face size
  necklace.scale.set(skala, skala, skala);

  // let xm = (faceLandmarks.r.x + faceLandmarks.l.x) / 2;
  // let ym = (faceLandmarks.t.y + faceLandmarks.b.y) / 2 + faceHeight * 1.2; // affected by face size
  let midShoulder = midPoint(sl.lShoulder, sl.rShoulder);

  // const xmOffset = Math.sin(rotation.y) * 0.025 - Math.sin(rotation.z) * 0.07;
  // const ymOffset = Math.sin(rotation.x) * 0.215 - Math.sin(rotation.z) * 0.05;
  const counterOffset = isMobileOrTablet() ? 1.2 : 0.3;
  const baseOffsetY = isMobileOrTablet() ? 0.13 : 0.11;
  const offset = {
    x: alphaOffset * (Math.sin(shoulderAngleY) * counterOffset) + (1 - alphaOffset) * prevOffset.x - 0.002,
    y: baseOffsetY * (faceWidthPxl / 220)
  }
  prevOffset.x = offset.x;

  // xm += xmOffset * (faceWidthPxl / 175); // affected by face size
  // ym += ymOffset * 1;

  const necklaceProjection = necklace.position.clone().project(camera);
  // let midFace = { x: xm, y: ym, z: 0 };
  let midFace = {
    x: midShoulder.x + offset.x,
    y: midShoulder.y + offset.y,
    z: 0
  };
  midFace = normalizeLandmark(midFace, 1, false);
  midFace.z = necklaceProjection.z;
  midFace.unproject(camera);
  const mirrored = -1; // 1 = not mirrored; -1 = mirrored
  const newPos = new THREE.Vector3(mirrored * midFace.x, midFace.y, necklace.position.z);
  necklace.position.lerp(newPos, config.lerp.value);

  // draw rotated nose
  const drawTarget = {
    x: midShoulder.x + offset.x,
    y: midShoulder.y + offset.y,
    z: 0
  };
  ctx.save();
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(
    drawTarget.x * config.videoSize.width,
    drawTarget.y * config.videoSize.height,
    5, 0, Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

export function rigNecklaceRotation(model, poseLandmarks) {
  // const lShoulder = normalizeLandmark(poseLandmarks.lShoulder);
  // const rShoulder = normalizeLandmark(poseLandmarks.rShoulder);
  const lShoulder = poseLandmarks.lShoulder;
  const rShoulder = poseLandmarks.rShoulder;
  const angleY = angleOf2Points(lShoulder, rShoulder, 'y', 1) - degToRad(7);
  const clampedAngleY = clamp(angleY, -Math.PI / 4, Math.PI / 4);
  const multiplier = 2 // isMobileOrTablet() ? 1 : 2;
  const rotation = {
    x: 0,
    y: -clampedAngleY * multiplier,
    z: 0, //angleZ
  };
  rigRotation(model.neck, 'necklace', rotation, config.slerp.value);

  // Access the position attribute of the geometry
  const necklace = model.neck.getObjectByName('necklace');
  const weight = Math.sin(necklace.rotation.y);
  uOffset.value = new THREE.Vector2(weight * 0.25, 0.0);
}
