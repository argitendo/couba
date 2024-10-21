/* eslint-disable @next/next/no-img-element */
"use client"

import {
  FilesetResolver,
  HandLandmarker,
  DrawingUtils
} from '@mediapipe/tasks-vision';
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { config } from './config';
import { /* isMobileOrTablet, */ showingGuides } from './utils';
import { rigBracelet, threeInit } from './solver2dBracelet';
import {
  createShader,
  createTexture,
  updateTexture,
  drawScene
} from './smoothing';
import './vto.css';

// import modelPath from './models/model.task?url';
// import instructionImg from './assets/ring-instruction.png';

// import bracelet00 from './assets/bracelet/bracelet00.png';
// import bracelet01 from './assets/bracelet/bracelet01.png';

// const bracelets = [bracelet00, bracelet01];

// const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const wasmPath = "/wasm";

let cameraAccess = true;
// let initialDeviceId;
// let defaultCameraAspectRatio = 16 / 9;
let defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;

// Get camera aspect ratio (width / height)
// if (navigator.mediaDevices) {
//   try {
//     const mediaStreamConstraints = {
//       audio: false,
//       video: {
//         // width: window.innerWidth,
//         height: window.innerHeight,
//         aspectRatio: (defaultCameraAspectRatio),
//         frameRate: { max: 30 },
//         facingMode: 'user',
//       },
//     };
//     const stream = await navigator.mediaDevices.getUserMedia(mediaStreamConstraints);
//     const streamSettings = stream.getVideoTracks()[0].getSettings();
//     // console.log('streamSettings:', streamSettings);
//     // initialDeviceId = streamSettings.deviceId;
//     // console.log('initialDeviceId:', initialDeviceId);
//     // console.log(
//     //   'config.width:', config.videoSize.width,
//     //   '| config.height:', config.videoSize.height,
//     //   '| config.aspectRatio:', config.videoSize.width / config.videoSize.height
//     // );
//     // console.log(
//     //   'width:', streamSettings.width,
//     //   '| height:', streamSettings.height,
//     //   '| aspectRatio:', streamSettings.width / streamSettings.height
//     // );
//     defaultCameraAspectRatio = streamSettings.width / streamSettings.height;
//     cameraAccess = true;
//   } catch (error) {
//     console.error(error);
//   } finally {
//     if (isMobileOrTablet()) {
//       config.videoSize.width = window.innerWidth;
//       config.videoSize.height = window.innerWidth / defaultCameraAspectRatio;
//       // config.videoSize.height = window.innerHeight;
//       // config.videoSize.width = window.innerHeight * defaultCameraAspectRatio;
//       defaultCameraAspectRatio = 1 / defaultCameraAspectRatio;
//     } else {
//       // config.videoSize.width = config.videoSize.height * defaultCameraAspectRatio;
//       console.log('innerWidth:', window.innerWidth, 'innerHeight:', window.innerHeight);
//       config.videoSize.height = window.innerHeight;
//       config.videoSize.width = config.videoSize.height * defaultCameraAspectRatio;
//     }
//   }
// }

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

const handLandmarks = {
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
}
const handWorldLandmarks = {
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
}

const tigaDef = {
  renderer: null,
  scene: null,
  model: {},
  camera: null,
  controls: null,
  ikSolver: null
}

function Mapper({ targetTexture, optScale, optPosX, optPosY }) {
  const videoRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const smoothingCanvasRef = useRef(null);
  const tiga = useRef(tigaDef);
  const rafId = useRef(null);
  const [handDetector, setHandDetector] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [selectedBracelet/* , setSelectedBracelet */] = useState(targetTexture);
  const [showInstruction, setShowInstruction] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  useEffect(() => {
    // Create hand tracker instance
    createHandLandmarker()
      .then(result => setHandDetector(result))
      .catch(err => console.error(`${err}`));
  }, []);

  useEffect(() => {
    // Check if browser support media device
    if (!navigator.mediaDevices) {
      alert('There is no media device available or not allowed.');
      return;
    }
    // console.log('innerHeight:', window.innerHeight, 'aspectRatio:', defaultCameraAspectRatio);
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // width: window.innerWidth,
        // height: window.innerHeight,
        aspectRatio: (defaultCameraAspectRatio),
        frameRate: { max: 30 },
        facingMode: 'user',
      },
    }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setMediaStream(stream);
        videoRef.current.onloadedmetadata = videoRef.current.play;
      }
    });
    // Initialize three js
    if (threeCanvasRef.current) {
      threeInit(threeCanvasRef.current, selectedBracelet)
        .then((result) => tiga.current = result)
        .catch(err => console.error(`${err.name}: ${err.message}`));
    }
  }, [handDetector]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
      }
    };
  }, [mediaStream]);

  useEffect(() => {
    if (rafId.current) window.cancelAnimationFrame(rafId.current);
    if (detecting) {
      const video = videoRef.current;
      const gl = createShader(smoothingCanvasRef.current, video.videoWidth, video.videoHeight);
      const texture = createTexture(gl);
      threeCanvasRef.current.style.display = 'inline';
      // https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
      const guideCtx = guideCanvasRef.current.getContext('2d', { willReadFrequently: true });
      const drawingUtils = new DrawingUtils(guideCtx);
      let lastVideoTime = -1;

      const renderPrediction = async () => {
        // Applying skin smoothing
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          updateTexture(gl, texture, video);
          drawScene(gl);
        }

        const startTimeMs = performance.now();
        if (lastVideoTime !== video.currentTime) {
          lastVideoTime = video.currentTime;
          const results = handDetector.detectForVideo(video, startTimeMs);
          showingGuides(guideCtx, video, drawingUtils, results);
          // do something with the handLandmarks data
          const tc = tiga.current;
          const sceneVisibility = tc.scene.visible;
          if (results.landmarks.length > 0) {
            handLandmarks.update(results);
            handWorldLandmarks.update(results);
            if (!sceneVisibility) tc.scene.visible = true;
            rigBracelet(tc.model, handLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
          } else {
            tc.scene.visible = false;
            setShowInstruction(true);
          }
          tc.renderer.render(tc.scene, tc.camera);
        }
        rafId.current = window.requestAnimationFrame(renderPrediction);
      }
      renderPrediction();

    } else {
      const video = videoRef.current;
      const canvas = threeCanvasRef.current;
      if (video && canvas) canvas.style.display = 'none';
    }

    // return clean up function for animation frame
    return () => { window.cancelAnimationFrame(rafId.current) };
  }, [detecting, optScale, optPosX, optPosY]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (detecting) {
      const tc = tiga.current;
      const texLoader = new THREE.TextureLoader();
      const newTexture = texLoader.load(selectedBracelet);
      tc.model.bracelet.material.uniforms.uTexture.value = newTexture;
    }
  }, [selectedBracelet]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {!handDetector && <p className="loading">Loading...</p>}
      {handDetector &&
        <>
        <div className="canvas-wrapper">
          <div
            className="video-container"
            style={{width: config.videoSize.width, height: config.videoSize.height}}
          >
            {/* <h3>Input Media</h3> */}
            <video
              ref={videoRef}
              width={`${config.videoSize.width}`}
              height={`${config.videoSize.height}`}
            />
            <canvas
              className='smoothing-canvas'
              ref={smoothingCanvasRef}
              width={`${config.videoSize.width}`}
              height={`${config.videoSize.height}`}
            />
            <div className={"instruction " + (showInstruction ? "show" : "")}>
              <div className="instruction-item">
                <p className="instruction-text">
                  Show your right / left back of the hand closer to the camera
                </p>
                <img className="instruction-image" src="/ring-instruction.png" alt="Instruction" />
              </div>
            </div>
            { !detecting &&
              <>
                <div className="overlay" />
                <div className="init-instruction">
                  Show your right / left back of the hand closer to the camera
                </div>
                <div className="detection-button-container">
                  <button className='detection-button' type="button" onClick={handleDetect}>
                    { !detecting && 'Start Try-On' }
                  </button>
                </div>
              </>
            }
            <div className="watermark">
              Powered by <a href="http://tenstud.tv" target="_blank" rel="noopener noreferrer"><img src="/logo_couba.png" alt="logo-couba"/></a>
            </div>
          </div>
          <div className="canvas-container">
            {/* <h3>Guide Canvas</h3> */}
            <canvas
              ref={guideCanvasRef}
              width={`${config.videoSize.width}`}
              height={`${config.videoSize.height}`}
            />
          </div>
          <div className="three-canvas-container">
            {/* <h3>3D Canvas</h3> */}
            <canvas
              ref={threeCanvasRef}
              width={`${config.videoSize.width}`}
              height={`${config.videoSize.height}`}
            />
          </div>
        </div>
        </>
      }
    </>
  )
}

function Vto2dBracelet({ targetTexture, optScale, optPosX, optPosY }) {
  return (
    <>
      {!cameraAccess && <div className="container no-camera-container">
        <p>
          This app needs camera access to work,
          please refresh the page and allow the permission request.
        </p>
      </div>}
      {cameraAccess &&
      <div className="container">
        <Mapper
          targetTexture={targetTexture}
          optScale={optScale}
          optPosX={optPosX}
          optPosY={optPosY}
        />
      </div>}
    </>
  )
}

export default Vto2dBracelet
