import {
  FilesetResolver,
  HandLandmarker,
  FaceLandmarker,
  PoseLandmarker
} from "@mediapipe/tasks-vision";
import { poseLandmarker, Landmarks } from "./utils";

const wasmPath = "/wasm";

/** Create Hand Landmarker using Mediapipe Vision Tasks */
const createHandLandmarker = async () => {
  let handLandmarker;
  const vision = await FilesetResolver.forVisionTasks(wasmPath);
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/hand_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });
  return handLandmarker;
}

/** Create Face Landmarker using Mediapipe Vision Tasks */
const createFaceLandmarker = async () => {
  let faceLandmarker;
  const vision = await FilesetResolver.forVisionTasks(wasmPath);
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: true,
  });
  return faceLandmarker;
};

/** Create Pose Landmarker using Medipipe Vision Tasks */
const createPoseLandmarker = async () => {
  let poseLandmarker;
  const vision = await FilesetResolver.forVisionTasks(wasmPath);
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: '/models/pose_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
  });
  return poseLandmarker;
};

/** Get the appropriate detector(s) for the given category */
export const getDetectors = async (category) => {
  switch (category) {
    case 'bracelet':
      return {
        hand: await createHandLandmarker(),
        face: null,
        pose: null
      }

    case 'ring':
      return {
        hand: await createHandLandmarker(),
        face: null,
        pose: null
      }

    case 'earring':
      return {
        hand: null,
        face: await createFaceLandmarker(),
        pose: null
      }

    case 'necklace':
      return {
        hand: null,
        face: await createFaceLandmarker(),
        pose: await createPoseLandmarker()
      }

    default:
      return {
        hand: null,
        face: null,
        pose: null
      }
  }
};

export const handLandmarks = {
  handedness: '',
  wrist: {},
  index: {},
  middle: {},
  ring: {},
  pinky: {}
};
handLandmarks.update = (results) => {
  handLandmarks.handedness = results.handedness[0][0].categoryName;
  handLandmarks.wrist = results.landmarks[0][0];
  handLandmarks.index.mcp = results.landmarks[0][5];
  handLandmarks.index.pip = results.landmarks[0][6];
  handLandmarks.middle.mcp = results.landmarks[0][9];
  handLandmarks.middle.pip = results.landmarks[0][10];
  handLandmarks.ring.mcp = results.landmarks[0][13];
  handLandmarks.ring.pip = results.landmarks[0][14];
  handLandmarks.pinky.mcp = results.landmarks[0][17];
  handLandmarks.pinky.pip = results.landmarks[0][18];
};

export const handWorldLandmarks = {
  handedness: '',
  wrist: {},
  index: {},
  middle: {},
  ring: {},
  pinky: {}
};
handWorldLandmarks.update = (results) => {
  handWorldLandmarks.handedness = results.handedness[0][0].categoryName;
  handWorldLandmarks.wrist = results.worldLandmarks[0][0];
  handWorldLandmarks.index.mcp = results.worldLandmarks[0][5];
  handWorldLandmarks.index.pip = results.worldLandmarks[0][6];
  handWorldLandmarks.middle.mcp = results.worldLandmarks[0][9];
  handWorldLandmarks.middle.pip = results.worldLandmarks[0][10];
  handWorldLandmarks.ring.mcp = results.worldLandmarks[0][13];
  handWorldLandmarks.ring.pip = results.worldLandmarks[0][14];
  handWorldLandmarks.pinky.mcp = results.worldLandmarks[0][17];
  handWorldLandmarks.pinky.pip = results.worldLandmarks[0][18];
};

export const faceLandmarks = {};
faceLandmarks.update = (results) => {
  faceLandmarks.r = results.faceLandmarks[0][234];
  faceLandmarks.l = results.faceLandmarks[0][454];
  faceLandmarks.t = results.faceLandmarks[0][10];
  faceLandmarks.b = results.faceLandmarks[0][152];
  faceLandmarks.noseCenter = results.faceLandmarks[0][4];
  faceLandmarks.lEarAnchor = results.faceLandmarks[0][361];
  faceLandmarks.rEarAnchor = results.faceLandmarks[0][132];
  faceLandmarks.tm = results.facialTransformationMatrixes[0].data;
};

export const sl = {};
export const swl = {};
poseLandmarker.forEach((landmark) => {
  sl[landmark] = new Landmarks(0, 0, 0);
  swl[landmark] = new Landmarks(0, 0, 0);
});