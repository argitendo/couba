/* eslint-disable @next/next/no-img-element */
"use client"

import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
  DrawingUtils
} from '@mediapipe/tasks-vision';
import { useState, useRef, useEffect } from 'react';
import { config } from './config';
import {
  showingGuidesNecklace,
  Landmarks,
  poseLandmarker,
} from './utils';
import {
  threeInit,
  rigNecklace
} from './solver2dNecklace';
import {
  createShader,
  createTexture,
  updateTexture,
  drawScene
} from './smoothing';
import './vto.css'
import NecklaceImageData from '../data/NecklaceImageData';
import Image from 'next/image';
import { Button } from '../buttons';

const necklaces = NecklaceImageData;

const wasmPath = "/wasm";
const defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;


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

// Smoothed Landmarks (sl)
const sl = {};
const swl = {};
poseLandmarker.forEach((landmark) => {
  sl[landmark] = new Landmarks(0, 0, 0);
  swl[landmark] = new Landmarks(0, 0, 0);
});

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
  const [poseDetector, setPoseDetector] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  useEffect(() => {
    createFaceLandmarker()
      .then(result => setFaceDetector(result))
      .catch(err => console.error(`${err}`));
    createPoseLandmarker()
      .then(result => setPoseDetector(result))
      .catch(err => console.error(`${err}`));
  }, []);

  useEffect(() => {
    if (navigator.mediaDevices && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
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
  }, [poseDetector]); // eslint-disable-line

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
      const guideCanvas = guideCanvasRef.current;

      // Preparing for skin smoothing
      const smoothingCanvas = smoothingCanvasRef.current;
      const gl = createShader(smoothingCanvas, config.videoSize.width, config.videoSize.height);
      const texture = createTexture(gl);

      const threeCanvas = threeCanvasRef.current;
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

          const poseResults = poseDetector.detectForVideo(video, startTimeMs);
          // Update sl and swl
          if (poseResults.landmarks[0] && poseResults.landmarks[0].length == 33) {
            poseLandmarker.forEach((landmarkName, idx) => {
              sl[landmarkName].lerp(poseResults.landmarks[0][idx], config.lerp.value);
              swl[landmarkName].lerp(poseResults.worldLandmarks[0][idx], config.lerp.value);
            });
            // showingNecklaceGuides(guideCtx, guideCanvas, video, drawingUtils, poseResults);
          }

          const faceResults = faceDetector.detectForVideo(video, startTimeMs);
          const showMatrix = true;
          showingGuidesNecklace(guideCtx, guideCanvas, video, drawingUtils, faceResults, showMatrix, poseResults);
          // do something with the faceLandmarks data
          const tc = tiga.current;
          const sceneVisibility = tc.scene.visible;
          if (faceResults.faceLandmarks.length > 0) {
            faceLandmarks.update(faceResults);
            if (!sceneVisibility) tc.scene.visible = true;
            rigNecklace(tc.model, faceLandmarks, sl, swl, tc.camera, guideCtx, setShowInstruction, optScale, optPosX, optPosY);
          } else {
            tc.scene.visible = false;
          }
          tc.renderer.render(tc.scene, tc.camera);
        }
        rafId.current = window.requestAnimationFrame(renderPrediction);
      }
      renderPrediction();
    } else {
      const video = videoRef.current;
      const canvas = threeCanvasRef.current;
      if (video && canvas) {
        canvas.style.display = 'none';
      }
    }
  }, [detecting, optScale, optPosX, optPosY]); // eslint-disable-line

  return (
    <>
      {!poseDetector && <p className="loading">Loading...</p>}
      {poseDetector &&
        <>
        <div className="canvas-wrapper">
          <div
            className="video-container"
            style={{width: config.videoSize.width, height: config.videoSize.height}}
          >
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
                Face forward straight to the camera and ensure your neck is exposed
                </p>
                <img className="instruction-image" src='/desktop-face.png' alt="Instruction" />
              </div>
            </div>
            { !detecting &&
              <>
                <div className="overlay" />
                <div className="init-instruction">Face forward straight to the camera and ensure your neck is exposed</div>
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
            <canvas
              ref={guideCanvasRef}
              width={`${config.videoSize.width}`}
              height={`${config.videoSize.height}`}
            />
          </div>
          <div className="three-canvas-container">
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
function Vto2dNecklace({ targetTexture, optScale, optPosX, optPosY }) {
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

export default Vto2dNecklace
export const NecklaceSelectors = ({images}) => <NecklaceSelector images={images} />;
