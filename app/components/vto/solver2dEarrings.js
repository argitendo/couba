import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls';
// import { angleOf2Points } from "./utils";
import { config } from "./config";
import { isMobileOrTablet } from './utils';

/**Three js Initialize */
export async function threeInit(canvas, earringTexPath = null) {
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

  // Create Earring Plane
  if (earringTexPath) {
    // const earringPlane = new THREE.PlaneGeometry(0.125, 0.125);
    const earringPlane = new THREE.PlaneGeometry(0.3, 0.3);
    const earringTex = texLoader.load(earringTexPath);
    earringTex.colorSpace = 'srgb';
    const earringTexFlipped = earringTex.clone();
    earringTexFlipped.wrapS = THREE.RepeatWrapping;
    earringTexFlipped.repeat.x = -1;
    const uniformsR = { uTexture: { value: earringTex } };
    const uniformsL = { uTexture: { value: earringTexFlipped } };
    const vertexShader = `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      uniform sampler2D uTexture;
      varying vec2 v_uv;
      void main() {
        gl_FragColor = texture2D(uTexture, v_uv);
      }
    `;
    // const earringMat = new THREE.MeshBasicMaterial({
    //   map: earringTex,
    //   transparent: true,
    // });
    // const earringMatFlipped = new THREE.MeshBasicMaterial({
    //   map: earringTexFlipped,
    //   transparent: true,
    // });
    const earringMat = new THREE.ShaderMaterial({
      uniforms: uniformsR,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    const earringMatFlipped = new THREE.ShaderMaterial({
      uniforms: uniformsL,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true
    });
    model.r = new THREE.Mesh(earringPlane, earringMat);
    model.r.name = 'rEarring';
    model.l = new THREE.Mesh(earringPlane, earringMatFlipped);
    model.l.name = 'lEarring';
    scene.add(model.l);
    scene.add(model.r);
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

export function rigEarringRotation(model, faceLandmarks) {
  const tm = new THREE.Matrix4().fromArray(faceLandmarks.tm);
  const headRotation = new THREE.Euler().setFromRotationMatrix(tm);
  // const leaningCoef = 0.8;
  const rotation = {
    x: 0,
    y: -headRotation.y * 1.5,
    z: 0, // -angleOf2Points(faceLandmarks.l, faceLandmarks.r, 'y', 1) * leaningCoef,
  };
  rigRotation(model.r, 'rEarring', rotation, 0.9);
  rigRotation(model.l, 'lEarring', rotation, 0.9);
}

export function rigEarringPosition(model, faceLandmarks, camera, optScale, optPosX, optPosY) {
  const tm = new THREE.Matrix4().fromArray(faceLandmarks.tm);
  const headRotation = new THREE.Euler().setFromRotationMatrix(tm);

  // Show hide earring based on angle threshold
  const angleThreshold = 0.05;
  if (headRotation.y <= -angleThreshold) {
    model.r.visible = false;
    model.l.visible = true;
  } else if (headRotation.y >= angleThreshold) {
    model.r.visible = true;
    model.l.visible = false;
  } else {
    model.r.visible = true;
    model.l.visible = true;
  }

  const faceLvec = new THREE.Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
  const faceRvec = new THREE.Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
  const faceWidth = faceLvec.distanceTo(faceRvec);
  const faceWidthPxl = faceWidth * config.videoSize.width;

  // Adjust occluder position to follow face landmarks position
  const rEarring = model.r.getObjectByName('rEarring');
  const lEarring = model.l.getObjectByName('lEarring');

  // const scaleBaseLine = 0.2;
  // const skala = scaleBaseLine + (faceWidth * (faceWidthPxl / 175));
  const skala = faceWidthPxl / 400 * optScale;
  // console.log(skala.toFixed(1));
  rEarring.scale.set(skala, skala, skala);
  lEarring.scale.set(skala, skala, skala);

  const rEarringProjection = rEarring.position.clone().project(camera);
  const lEarringProjection = lEarring.position.clone().project(camera);

  const rnl = normalizeLandmark(faceLandmarks.rEarAnchor, 1, false);
  rnl.z = rEarringProjection.z;
  rnl.unproject(camera);

  const lnl = normalizeLandmark(faceLandmarks.lEarAnchor, 1, false);
  lnl.z = lEarringProjection.z;
  lnl.unproject(camera);

  const baseOffset = {
    x: 0.02,
    y: isMobileOrTablet() ? 0.0 : -0.01
  };

  const rEarOffset = {
    x: skala * (-baseOffset.x + Math.sin(headRotation.y) * -0.05 - Math.sin(headRotation.z) * 0.01),
    y: skala * 0.2 * (baseOffset.y + Math.sin(headRotation.x) * 0.10 - Math.sin(headRotation.z) * 0.01),
    z: 0
  };

  const lEarOffset = {
    x: skala * (baseOffset.x + Math.sin(headRotation.y) * -0.05 - Math.sin(headRotation.z) * 0.01),
    y: skala * 0.2 * (baseOffset.y + Math.sin(headRotation.x) * 0.10 - Math.sin(headRotation.z) * 0.01),
    z: 0
  };

  const mirrored = -1; // 1 = not mirrored; -1 = mirrored

  const rTargetPos = new THREE.Vector3(
    mirrored * (rnl.x + rEarOffset.x) + optPosX,
    rnl.y + rEarOffset.y + optPosY,
    rnl.z + rEarOffset.z
  );

  const lTargetPos = new THREE.Vector3(
    mirrored * (lnl.x + lEarOffset.x) + -optPosX,
    lnl.y + lEarOffset.y + optPosY,
    lnl.z + lEarOffset.z
  );

  model.r.position.lerp(rTargetPos, config.lerp.value);
  model.l.position.lerp(lTargetPos, config.lerp.value);
}

export function checkFaceSize(model, faceLandmarks, setShowInstruction) {
  const transMat4 = new THREE.Matrix4().fromArray(faceLandmarks.tm).transpose();
  const translation = new THREE.Vector3();
  const faceRotation = new THREE.Euler();
  const scale = new THREE.Vector3();
  transMat4.decompose(translation, faceRotation, scale);

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

  if (
    faceWidthPxl < farSizeThreshold
    || faceHeightPxl > nearSizeThreshold
    || Math.abs(faceRotation.x) > Math.PI / 8 // 30 degree
    || Math.abs(faceRotation.y) > Math.PI / 4 // 45 degree
    || Math.abs(faceRotation.z) > Math.PI / 8 // 22.5 degree
  ) {
    setShowInstruction(true);
    model.l.visible = false;
    model.r.visible = false;
  } else {
    setShowInstruction(false);
  }

}

export function rigEarring(model, faceLandmarks, camera, setShowInstruction, optScale, optPosX, optPosY) {
  rigEarringRotation(model, faceLandmarks);
  rigEarringPosition(model, faceLandmarks, camera, optScale, optPosX, optPosY);
  checkFaceSize(model, faceLandmarks, setShowInstruction);
}
