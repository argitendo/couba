/* eslint-disable @next/next/no-img-element */
"use client"

import { FilesetResolver, HandLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { useState, useRef, useEffect } from 'react';
import { config } from './config';
import { showingGuides } from './utils';
import { rigRing, threeInit, fingerList } from './solver2dRing';
import {
  createShader,
  createTexture,
  updateTexture,
  drawScene
} from './smoothing';
import './vto.css';
import { Button } from '../buttons';

const wasmPath = "/wasm";
const defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;

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
  index: {},
  middle: {},
  ring: {},
  pinky: {}
};
handLandmarks.update = (results) => {
  handLandmarks.handedness = results.handedness[0][0].categoryName;
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
  index: {},
  middle: {},
  ring: {},
  pinky: {}
};
handWorldLandmarks.update = (results) => {
  handWorldLandmarks.handedness = results.handedness[0][0].categoryName;
  handWorldLandmarks.index.mcp = results.worldLandmarks[0][5];
  handWorldLandmarks.index.pip = results.worldLandmarks[0][6];
  handWorldLandmarks.middle.mcp = results.worldLandmarks[0][9];
  handWorldLandmarks.middle.pip = results.worldLandmarks[0][10];
  handWorldLandmarks.ring.mcp = results.worldLandmarks[0][13];
  handWorldLandmarks.ring.pip = results.worldLandmarks[0][14];
  handWorldLandmarks.pinky.mcp = results.worldLandmarks[0][17];
  handWorldLandmarks.pinky.pip = results.worldLandmarks[0][18];
}

/**React Component for Finger Selector */
function FingerSelector({ selectedFinger, setSelectedFinger }) { // eslint-disable-line react/prop-types
  const handleClick = (event) => {
    event.preventDefault();
    const target = (selectedFinger === '') ? 'ring' : selectedFinger;
    const idx = (fingerList.indexOf(target) + 1) % 4;
    setSelectedFinger(fingerList[idx]);
  }

  return (
    <button
      className="finger-switch-button flex justify-center p-4 rounded-3xl border-2 border-gray-300 bg-white hover:border-gray-500 aspect-square"
      onClick={handleClick}
    >
      <img
        src='/finger-switch.svg'
        alt="Finger Switch Icon"
        title="Switch Finger"
        className="w-full h-full p-4"
      />
    </button>
  );

}

/**React Component for Earring Selector */
/* function RingSelector({ selectedFinger, setSelectedFinger }) { // eslint-disable-line react/prop-types
  return (
    <div className='ring-selector'>
      <form>
        <div className="image-selector">
          <FingerSelector selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger} />
        </div>
      </form>
    </div>
  )
} */

/**React Component for Earring Selector Mobile */
function RingSelectorMobile({ selectedFinger, setSelectedFinger }) { // eslint-disable-line react/prop-types
  return (
    <div className="image-selector-mobile">
      <FingerSelector selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger} />
    </div>
  )
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
  const [detector, setDetector] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [selectedFinger, setSelectedFinger] = useState('');
  const [showInstruction, setShowInstruction] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  useEffect(() => {
    createHandLandmarker()
      .then(result => setDetector(result))
      .catch(err => console.error(`${err}`));
  }, []);

  useEffect(() => {
    // List all available cameras and add it to dropdown list
    if (navigator.mediaDevices && videoRef.current) {
      navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          aspectRatio: (defaultCameraAspectRatio),
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
  }, [detector]); // eslint-disable-line

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
          const results = detector.detectForVideo(video, startTimeMs);
          showingGuides(guideCtx, video, drawingUtils, results);
          // do something with the handLandmarks data
          const tc = tiga.current;
          const sceneVisibility = tc.scene.visible;
          if (results.landmarks.length > 0) {
            handLandmarks.update(results);
            handWorldLandmarks.update(results);
            if (!sceneVisibility) tc.scene.visible = true;
            rigRing(tc.model, handLandmarks, tc.camera, selectedFinger, setShowInstruction, optScale, optPosX, optPosY);
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
      if (video && canvas) {
        canvas.style.display = 'none';
      }
    }
  }, [detecting, selectedFinger, optScale, optPosX, optPosY]); // eslint-disable-line

  return (
    <>
      {!detector && <p className="loading">Loading...</p>}
      {detector &&
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
                  Show your right / left back of the hand closer to the camera
                </p>
                <img className="instruction-image" src="/ring-instruction.png" alt="Instruction" />
              </div>
            </div>
            { detecting && <RingSelectorMobile selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger} />}
            { !detecting &&
              <>
                <div className="overlay" />
                <div className="init-instruction">Show your right / left back of the hand closer to the camera</div>
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
        <div className="metric">
          <RingSelector selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger}/>
        </div>
        </>
      }
    </>
  )
}

// eslint-disable-next-line react/prop-types
function Vto2dRing({ targetTexture, optScale, optPosX, optPosY }) {
  return (
    <div className="container">
      <Mapper
        targetTexture={targetTexture}
        optScale={optScale}
        optPosX={optPosX}
        optPosY={optPosY}
      />
    </div>
  )
}

export default Vto2dRing