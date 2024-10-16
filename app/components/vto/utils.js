import {
    HandLandmarker,
    FaceLandmarker,
    PoseLandmarker,
    DrawingUtils
} from "@mediapipe/tasks-vision";
import { Matrix4, Vector3, Euler } from "three";
import { config } from "./config";

const { PI } = Math;

/** Checking if user open from mobile/tablet device */
export function isMobileOrTablet() {
  if (typeof window === 'undefined') {
    // If the window object is undefined, we're on the server
    return false;
  }
  return /Mobi|Android|iPad|Tablet/i.test(navigator.userAgent);
}

/**Find angle of two points using `Math.atan2` */
export function angleOf2Points(a, b, coord = 'x', weight = 1) {
  let theta = 0;
  if (coord === 'x') { theta = Math.atan2((a.z - b.z), (a.y - b.y)); }
  if (coord === 'y') { theta = Math.atan2((a.z - b.z), (a.x - b.x)); }
  if (coord === 'z') { theta = Math.atan2((a.y - b.y), (a.x - b.x)); }
  return theta * weight;
}

/**Calculate mid point between two objects */
export const midPoint = (obj1, obj2) => ({
  x: (obj1.x + obj2.x) / 2,
  y: (obj1.y + obj2.y) / 2,
  z: (obj1.z + obj2.z) / 2,
});

/** Normalize Landmark */
export function normalizeLandmark(landmark, multiplier = 1, withAspectRatio = true) {
  const x = (landmark.x * 2) - 1;
  const y = -((landmark.y * 2) - 1);
  const z = -landmark.z;
  const result = new Vector3(x * multiplier, y * multiplier, z);
  if (withAspectRatio) {
    const aspectRatio = config.videoSize.width / config.videoSize.height;
    if (aspectRatio > 1) { result.x *= aspectRatio }
    if (aspectRatio < 1) { result.y *= (1 / aspectRatio) }
  }
  return result
}

export class Landmarks {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  lerp({ x, y, z }, lerpAmount) {
    this.x = (this.x * (1 - lerpAmount)) + (x * lerpAmount);
    this.y = (this.y * (1 - lerpAmount)) + (y * lerpAmount);
    this.z = (this.z * (1 - lerpAmount)) + (z * lerpAmount);
  }

  toFixed(n) {
    return {
      x: this.x.toFixed(n),
      y: this.y.toFixed(n),
      z: this.z.toFixed(n),
    };
  }
}

/**
 * The pose landmarker model tracks 33 body landmark locations,
 * representing the approximate location of the following body
 * parts:
 *
 *     0 - nose
 *     1 - l eye (inner)
 *     2 - l eye
 *     3 - l eye (outer)
 *     4 - r eye (inner)
 *     5 - r eye
 *     6 - r eye (outer)
 *     7 - l ear
 *     8 - r ear
 *     9 - mouth (l)
 *     10 - mouth (r)
 *     11 - l shoulder
 *     12 - r shoulder
 *     13 - l elbow
 *     14 - r elbow
 *     15 - l wrist
 *     16 - r wrist
 *     17 - l pinky
 *     18 - r pinky
 *     19 - l index
 *     20 - r index
 *     21 - l thumb
 *     22 - r thumb
 *     23 - l hip
 *     24 - r hip
 *     25 - l knee
 *     26 - r knee
 *     27 - l ankle
 *     28 - r ankle
 *     29 - l heel
 *     30 - r heel
 *     31 - l foot index
 *     32 - r foot index
 */
export const poseLandmarker = [
    'nose',
    'lEyeInner',
    'lEye',
    'lEyeOuter',
    'rEyeInner',
    'rEye',
    'rEyeOuter',
    'lEar',
    'rEar',
    'lMouth',
    'rMouth',
    'lShoulder',
    'rShoulder',
    'lElbow',
    'rElbow',
    'lWrist',
    'rWrist',
    'lPinky',
    'rPinky',
    'lIndex',
    'rIndex',
    'lThumb',
    'rThumb',
    'lHip',
    'rHip',
    'lKnee',
    'rKnee',
    'lAnkle',
    'rAnkle',
    'lHeel',
    'rHeel',
    'lFootIndex',
    'rFootIndex',
];

/**
 * The hand landmark model bundle detects the keypoint localization
 * of 21 hand-knuckle coordinates within the detected hand regions.
 */
const fingerLandmarkStr = [
  'wrist', // 0
  'thumb_cmc', // 1
  'thumb_mcp', // 2
  'thumb_ip', // 3
  'thumb_tip', // 4
  'index_finger_mcp', // 5
  'index_finger_pip', // 6
  'index_finger_dip', // 7
  'index_finger_tip', // 8
  'middle_finger_mcp', // 9
  'middle_finger_pip', // 10
  'middle_finger_dip', // 11
  'middle_finger_tip', // 12
  'ring_finger_mcp', // 13
  'ring_finger_pip', // 14
  'ring_finger_dip', // 15
  'ring_finger_tip', // 16
  'pinky_mcp', // 17
  'pinky_pip', // 18
  'pinky_dip', // 19
  'pinky_tip', // 20
];

/**Show Guide for earrings detection result */
export function showingGuidesEarrings(ctx, canvas, video, drawingUtils, results, showMatrix = false) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(video, 0, 0, video.width, video.height);

  if (results.faceLandmarks.length > 0) {
    for (let landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
    // drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
  }

  // Grid
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'lightgrey';
  ctx.stroke();

  if (results.facialTransformationMatrixes.length > 0 && showMatrix) {
    const tmArray = results.facialTransformationMatrixes[0].data;
    const tm = new Matrix4().fromArray(tmArray);
    const position = new Vector3();
    let rotation = new Euler();
    const scale = new Vector3();
    tm.decompose(position, rotation, scale);
    rotation = { x: rotation.x * 180 / PI, y: rotation.y * 180 / PI, z: rotation.z * 180 / PI }
    ctx.fillStyle = 'orange';
    ctx.font = "18px serif";
    ctx.fillText(`Face Position: ${position.x.toFixed(1)} ${position.y.toFixed(1)} ${position.z.toFixed(1)}`, 10, 20);
    ctx.fillText(`Face Rotation: ${rotation.x.toFixed(1)} ${rotation.y.toFixed(1)} ${rotation.z.toFixed(1)}`, 10, 40);
    ctx.fillText(`Face Scale: ${scale.x.toFixed(1)} ${scale.y.toFixed(1)} ${scale.z.toFixed(1)}`, 10, 60);

    const faceLandmarks = {};
    faceLandmarks.r = results.faceLandmarks[0][234];
    faceLandmarks.l = results.faceLandmarks[0][454];
    faceLandmarks.t = results.faceLandmarks[0][10];
    faceLandmarks.b = results.faceLandmarks[0][152];
    const faceTvec = new Vector3(faceLandmarks.t.x, faceLandmarks.t.y, faceLandmarks.z);
    const faceBvec = new Vector3(faceLandmarks.b.x, faceLandmarks.b.y, faceLandmarks.b.z);
    const faceLvec = new Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
    const faceRvec = new Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
    const faceWidth = faceLvec.distanceTo(faceRvec);
    const faceHeight = faceTvec.distanceTo(faceBvec);
    ctx.fillText(`faceSize: ${faceWidth.toFixed(2)} ${faceHeight.toFixed(2)}`, 10, 80);
    const faceWidthPxl = faceWidth * config.videoSize.width;
    const faceHeightPxl = faceHeight * config.videoSize.height;
    ctx.fillText(`faceRatio: ${(faceWidthPxl/faceHeightPxl).toFixed(3)}`, 10, 100);
    ctx.fillText(`w x h: ${faceWidthPxl.toFixed(0)} ${faceHeightPxl.toFixed(0)}`, 10, 120);
    // ctx.fillText(`faceArea: ${(faceWidthPxl*faceHeightPxl).toFixed(0)}`, 10, 120);
  }

  ctx.restore();
}

/**Show Guide for necklace detection result */
export function showingGuidesNecklace(ctx, canvas, video, drawingUtils, results, showMatrix = false, poseLandmarks) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, video.width, video.height);

  if (results.faceLandmarks.length > 0) {
    for (const landmarks of results.faceLandmarks) {
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_TESSELATION,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(landmarks,
        FaceLandmarker.FACE_LANDMARKS_LIPS,
        { color: "#E0E0E0" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
      );
      drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
      );
    }
    // drawBlendShapes(imageBlendShapes, faceLandmarkerResult.faceBlendshapes);
  }

  // Grid
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'lightgrey';
  ctx.stroke();

  if (results.facialTransformationMatrixes.length > 0 && showMatrix) {
    const tmArray = results.facialTransformationMatrixes[0].data;
    const tm = new Matrix4().fromArray(tmArray);
    const position = new Vector3();
    let rotation = new Euler();
    const scale = new Vector3();
    tm.decompose(position, rotation, scale);
    rotation = { x: rotation.x * 180 / PI, y: rotation.y * 180 / PI, z: rotation.z * 180 / PI }
    ctx.fillStyle = 'orange';
    ctx.font = "18px serif";
    ctx.fillText(`Face Position: ${position.x.toFixed(1)} ${position.y.toFixed(1)} ${position.z.toFixed(1)}`, 10, 20);
    ctx.fillText(`Face Rotation: ${rotation.x.toFixed(1)} ${rotation.y.toFixed(1)} ${rotation.z.toFixed(1)}`, 10, 40);
    ctx.fillText(`Face Scale: ${scale.x.toFixed(1)} ${scale.y.toFixed(1)} ${scale.z.toFixed(1)}`, 10, 60);

    const faceLandmarks = {};
    faceLandmarks.r = results.faceLandmarks[0][234];
    faceLandmarks.l = results.faceLandmarks[0][454];
    faceLandmarks.t = results.faceLandmarks[0][10];
    faceLandmarks.b = results.faceLandmarks[0][152];
    const faceTvec = new Vector3(faceLandmarks.t.x, faceLandmarks.t.y, faceLandmarks.z);
    const faceBvec = new Vector3(faceLandmarks.b.x, faceLandmarks.b.y, faceLandmarks.b.z);
    const faceLvec = new Vector3(faceLandmarks.l.x, faceLandmarks.l.y, faceLandmarks.l.z);
    const faceRvec = new Vector3(faceLandmarks.r.x, faceLandmarks.r.y, faceLandmarks.r.z);
    const faceWidth = faceLvec.distanceTo(faceRvec);
    const faceHeight = faceTvec.distanceTo(faceBvec);
    ctx.fillText(`faceSize: ${faceWidth.toFixed(2)} ${faceHeight.toFixed(2)}`, 10, 80);
    const faceWidthPxl = faceWidth * config.videoSize.width;
    const faceHeightPxl = faceHeight * config.videoSize.height;
    ctx.fillText(`faceRatio: ${(faceWidthPxl/faceHeightPxl).toFixed(3)}`, 10, 100);
    ctx.fillText(`w x h: ${faceWidthPxl.toFixed(0)} ${faceHeightPxl.toFixed(0)}`, 10, 120);
    // ctx.fillText(`faceArea: ${(faceWidthPxl*faceHeightPxl).toFixed(0)}`, 10, 120);
  }

  // Pose Landmarks guides
  poseLandmarks.landmarks.forEach((landmark) => {
    drawingUtils.drawLandmarks(landmark, {
      radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 3, 1),
    });
    drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
  });

  if (poseLandmarks.landmarks[0]) {
    // Shoulder Angle Text
    const lShoulder = normalizeLandmark(poseLandmarks.landmarks[0][11]);
    const rShoulder = normalizeLandmark(poseLandmarks.landmarks[0][12]);
    const shoulderAngleY = angleOf2Points(lShoulder, rShoulder, 'y', 1) * 180 / Math.PI;
    ctx.fillText(`lShoulder: ${lShoulder.x.toFixed(3)} ${lShoulder.y.toFixed(3)} ${lShoulder.z.toFixed(3)}`, 10, 140);
    ctx.fillText(`rShoulder: ${rShoulder.x.toFixed(3)} ${rShoulder.y.toFixed(3)} ${rShoulder.z.toFixed(3)}`, 10, 160);
    ctx.fillText(`Shoulder Angle: ${shoulderAngleY.toFixed(1)}`, 10, 180);

    const wlShoulder = poseLandmarks.worldLandmarks[0][11];
    const wrShoulder = poseLandmarks.worldLandmarks[0][12];
    const wshoulderAngleX = angleOf2Points(wlShoulder, wrShoulder, 'x', 1) * 180 / Math.PI;
    const wshoulderAngleY = (angleOf2Points(wlShoulder, wrShoulder, 'y', 1) * 180 / Math.PI) - 7;
    const wshoulderAngleZ = angleOf2Points(wlShoulder, wrShoulder, 'z', 1) * 180 / Math.PI;
    ctx.fillText(`wlShoulder: ${wlShoulder.x.toFixed(3)} ${wlShoulder.y.toFixed(3)} ${wlShoulder.z.toFixed(3)}`, 10, 200);
    ctx.fillText(`wrShoulder: ${wrShoulder.x.toFixed(3)} ${wrShoulder.y.toFixed(3)} ${wrShoulder.z.toFixed(3)}`, 10, 220);
    ctx.fillText(`wShoulder Angle X: ${wshoulderAngleX.toFixed(1)}`, 10, 240);
    ctx.fillText(`wShoulder Angle Y: ${wshoulderAngleY.toFixed(1)}`, 10, 260);
    ctx.fillText(`wShoulder Angle Z: ${wshoulderAngleZ.toFixed(1)}`, 10, 280);
  }

  ctx.restore();
}



/**Show Guide for ring detection result */
export function showingGuides(ctx, video, drawingUtils, results) {
  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(video, 0, 0, video.width, video.height);
  ctx.font = "18px serif";

  // let landmarksArray = [];
  let drawingOffsetY = 20;
  if (results.landmarks.length > 0) {
    for (const landmarks of results.landmarks) {
      drawingUtils.drawConnectors(landmarks, HandLandmarker.HAND_CONNECTIONS, {
        color: "#FFFFFF",
        lineWidth: 2
      });
      drawingUtils.drawLandmarks(landmarks, {
        color: "#FFFF00", lineWidth: 2
      });

      // landmarks.forEach((lm, idx) => {
      //   ctx.fillText(
      //     `${fingerLandmarkStr[idx]} : ${lm.x.toFixed(2)}, ${lm.y.toFixed(2)}, ${lm.z.toFixed(2)}`,
      //     10,
      //     drawingOffsetY
      //   );
      //   drawingOffsetY += 20;
      //   // if ([5, 17].includes(idx)) {
      //   //   ctx.fillText(`${lm.x.toFixed(2)}, ${lm.y.toFixed(2)}, ${lm.z.toFixed(2)}`, 10, yOffset);
      //   //   yOffset += 20;
      //   // }
      // });
    }
    for (const wls of results.worldLandmarks) {
      wls.forEach((wl, idx) => {
        ctx.fillText(
          `${fingerLandmarkStr[idx]} : ${wl.x.toFixed(2)}, ${wl.y.toFixed(2)}, ${wl.z.toFixed(2)}`,
          10,
          drawingOffsetY
        );
        drawingOffsetY += 20;
        // if ([5,17].includes(idx)) {
        //   ctx.fillText(`${wl.x.toFixed(3)}, ${wl.y.toFixed(3)}, ${wl.z.toFixed(3)}`, 10, yOffset);
        //   yOffset += 20;
        // }
      });
    }

    const lm = results.landmarks[0];
    const lmAngleX = angleOf2Points(lm[5], lm[17], 'x', 1) * 180 / Math.PI;
    const lmAngleY = angleOf2Points(lm[5], lm[17], 'y', 1) * 180 / Math.PI;
    const lmAngleZ = angleOf2Points(lm[5], lm[17], 'z', 1) * 180 / Math.PI;
    ctx.fillText(`lmAngleX: ${lmAngleX.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;
    ctx.fillText(`lmAngleY: ${lmAngleY.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;
    ctx.fillText(`lmAngleZ: ${lmAngleZ.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;

    const wlm = results.worldLandmarks[0];
    const wlmAngleX = angleOf2Points(wlm[5], wlm[17], 'x', 1) * 180 / Math.PI;
    const wlmAngleY = angleOf2Points(wlm[5], wlm[17], 'y', 1) * 180 / Math.PI;
    const wlmAngleZ = angleOf2Points(wlm[5], wlm[17], 'z', 1) * 180 / Math.PI;
    ctx.fillText(`wlmAngleX: ${wlmAngleX.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;
    ctx.fillText(`wlmAngleY: ${wlmAngleY.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;
    ctx.fillText(`wlmAngleZ: ${wlmAngleZ.toFixed(2)}`, 10, drawingOffsetY);
    drawingOffsetY += 20;
  }
  ctx.restore();
}