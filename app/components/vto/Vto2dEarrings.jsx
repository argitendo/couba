/* eslint-disable @next/next/no-img-element */
"use client"

import {
  FilesetResolver,
  FaceLandmarker,
  DrawingUtils
} from '@mediapipe/tasks-vision';
import { useState, useRef, useEffect } from 'react';
import { config } from './config';
import {
  isMobileOrTablet,
  showingGuidesEarrings,
} from './utils';
import {
  threeInit,
  rigEarringRotation,
  rigEarringPosition,
  checkFaceSize,
  rigEarring,
} from './solver2dEarrings';
import {
  createShader,
  createTexture,
  updateTexture,
  drawScene
} from './smoothing';
import './vto.css';
import { Button } from '../buttons';

// const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const wasmPath = "/wasm";

// const defaultCameraAspectRatio = 16 / 9;
const defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;

// if (isMobileOrTablet()) {
//   config.videoSize.width = window.innerWidth;
//   // config.videoSize.height = window.innerHeight;
//   config.videoSize.height = window.innerWidth * defaultCameraAspectRatio;
// }

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

const faceLandmarks = {};
faceLandmarks.update = (results) => {
  faceLandmarks.r = results.faceLandmarks[0][234];
  faceLandmarks.l = results.faceLandmarks[0][454];
  faceLandmarks.t = results.faceLandmarks[0][10];
  faceLandmarks.b = results.faceLandmarks[0][152];
  faceLandmarks.noseCenter = results.faceLandmarks[0][4];
  faceLandmarks.lEarAnchor = results.faceLandmarks[0][361];
  faceLandmarks.rEarAnchor = results.faceLandmarks[0][132];
  faceLandmarks.tm = results.facialTransformationMatrixes[0].data;
}

const tigaDef = {
  renderer: null,
  scene: null,
  model: { r: null, l: null },
  camera: null,
  controls: null,
  ikSolver: null
}

// eslint-disable-next-line react/prop-types
function Mapper({ targetTexture, optScale, optPosX, optPosY }) {
  const videoRef = useRef(null);
  const guideCanvasRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const smoothingCanvasRef = useRef(null);
  const tiga = useRef(tigaDef);
  const rafId = useRef(null);
  const [faceDetector, setFaceDetector] = useState(null);
  // const [poseDetector, setPoseDetector] = useState(null);
  const [/* devices */, setDevices] = useState([]);
  const [detecting, setDetecting] = useState(false);
  // const [selectedEarring, /* setSelectedEarring */] = useState(targetTexture);
  // const [selectedNecklace, setSelectedNecklace] = useState(necklaces[0]);
  const [showInstruction, setShowInstruction] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  useEffect(() => {
    createFaceLandmarker()
      .then(result => setFaceDetector(result))
      .catch(err => console.error(`${err}`));
  }, []);

  useEffect(() => {
    // List all available cameras and add it to dropdown list
    if (navigator.mediaDevices && videoRef.current) {
      navigator.mediaDevices.enumerateDevices()
        .then(dev => setDevices(dev.filter(dev => dev.kind === 'videoinput')))
        .catch(err => console.error(`${err.name}: ${err.message}`));

      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          // width: window.innerWidth,
          // height: window.innerHeight,
          aspectRatio: defaultCameraAspectRatio,
          frameRate: { max: 30 },
          facingMode: 'user',
        },
      }).then((stream) => {
        videoRef.current.srcObject = stream;
        setMediaStream(stream);
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        }
      });
    }
    // Initialize three js
    if (threeCanvasRef.current) {
      threeInit(threeCanvasRef.current, targetTexture)
        .then((result) => tiga.current = result)
        .catch(err => console.error(`${err.name}: ${err.message}`));
    }
  }, [faceDetector]); // eslint-disable-line

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
      // console.log(video);
      const guideCanvas = guideCanvasRef.current;

      // Preparing for skin smoothing
      const smoothingCanvas = smoothingCanvasRef.current;
      // console.log(`videoSize: (${video.videoWidth} x ${video.videoHeight})`);
      // console.log(`canvasSize: (${smoothingCanvas.width} x ${smoothingCanvas.height})`);
      // smoothingCanvas.style.left = `${(smoothingCanvas.width - video.width) / 2}px`;

      const gl = createShader(smoothingCanvas, video.videoWidth, video.videoHeight);
      const texture = createTexture(gl);

      const threeCanvas = threeCanvasRef.current;
      // video.style.display = 'none';
      // guideCanvas.style.display = 'inline';
      threeCanvas.style.display = 'inline';
      // https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
      const guideCtx = guideCanvas.getContext('2d', { willReadFrequently: true });
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
          const faceResults = faceDetector.detectForVideo(video, startTimeMs);
          const showMatrix = true;
          showingGuidesEarrings(guideCtx, guideCanvas, video, drawingUtils, faceResults, showMatrix);
          // do something with the faceLandmarks data
          const tc = tiga.current;
          const sceneVisibility = tc.scene.visible;
          if (faceResults.faceLandmarks.length > 0) {
            // console.log(results);
            faceLandmarks.update(faceResults);
            if (!sceneVisibility) tc.scene.visible = true;
            rigEarring(tc.model, faceLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
            // rigEarringRotation(tc.model, faceLandmarks);
            // rigEarringPosition(tc.model, faceLandmarks, tc.camera);
            // checkFaceSize(tc.model, faceLandmarks, setShowInstruction);
          } else {
            tc.scene.visible = false;
          }
          // tc.controls.update();
          tc.renderer.render(tc.scene, tc.camera);
        }
        rafId.current = window.requestAnimationFrame(renderPrediction);
      }
      renderPrediction();
    } else {
      const video = videoRef.current;
      // const canvas = guideCanvasRef.current;
      const canvas = threeCanvasRef.current;
      if (video && canvas) {
        // video.style.display = 'inline';
        canvas.style.display = 'none';
      }
    }
  }, [detecting, optScale, optPosX, optPosY]); // eslint-disable-line

  return (
    <>
      {!faceDetector && <p className="loading">Loading...</p>}
      {faceDetector &&
        <>
          <div className="canvas-wrapper">
            <div
              className="video-container"
              style={{ width: config.videoSize.width, height: config.videoSize.height }}
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
                    Face forward straight to the camera
                  </p>
                  <img className="instruction-image" src="/desktop-face.png" alt="Instruction" />
                </div>
              </div>
              {!detecting &&
                <>
                  <div className="overlay" />
                  <div className="init-instruction">Face forward straight to the camera</div>
                  <div className="detection-button-container">
                    <Button.MainVariantsGreen onClicks={handleDetect} >
                      {!detecting && 'Start Try-On'}
                    </Button.MainVariantsGreen>
                  </div>
                </>
              }
              <div className="watermark">
                Powered by <a href="http://tenstud.tv" target="_blank" rel="noopener noreferrer"><img src="/logo_couba.png" alt="logo-couba" /></a>
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

// eslint-disable-next-line react/prop-types
function Vto2dEarrings({ targetTexture, optScale, optPosX, optPosY }) {
  return (
    <>
      <div className="container">
        <Mapper
          targetTexture={targetTexture}
          optScale={optScale}
          optPosX={optPosX}
          optPosY={optPosY}
        />
      </div>
    </>
  )
}

export default Vto2dEarrings