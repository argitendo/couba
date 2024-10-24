/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useState, useRef } from 'react';
import { config } from './config';
import { BeautyShader } from './webglShaders';
import {
  getDetectors,
  handLandmarks,
  handWorldLandmarks,
  faceLandmarks,
  sl,
  swl
} from './landmarker';
import { getThreeInit } from './solver';
import { rigBracelet } from './solver2dBracelet';
import { rigEarring } from './solver2dEarrings';
import { rigRing } from './solver2dRing';
import { rigNecklace } from './solver2dNecklace';
import { poseLandmarker } from './utils';
import './vto.css';

const defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;

function Slider({ id, labels, defaultValue, min, max, step, onChange }) {
  return (
    <>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        {labels[0]}
      </label>
      <input
        id={id}
        className="w-full h-0.5 bg-white rounded-lg appearance-none cursor-pointer"
        type="range"
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
      />
    </>
  )
}

function Settings({ optScale, setOptScale, optPosX, setOptPosX, optPosY, setOptPosY }) {
  return (
    <div className="setting-container">
      <Slider id="pos-x-range" labels={['Position X']} defaultValue={optPosX} min={-0.1} max={0.1} step={0.01} onChange={(e) => {setOptPosX(parseFloat(e.target.value));}} />
      <Slider id="pos-y-range" labels={['Position Y']} defaultValue={optPosY} min={-0.1} max={0.1} step={0.01} onChange={(e) => {setOptPosY(parseFloat(e.target.value));}} />
      <Slider id="scale-range" labels={['Scale']} defaultValue={optScale} min={0} max={2} step={0.1} onChange={(e) => {setOptScale(parseFloat(e.target.value));}} />
    </div>
  )
}

// eslint-disable-next-line react/prop-types
function VtoViewer({ category, targetTexture }) {
  const [optScale, setOptScale] = useState(1);
  const [optPosX, setOptPosX] = useState(0);
  const [optPosY, setOptPosY] = useState(0);

  const options = {
    optScale: optScale,
    optPosX: optPosX,
    optPosY: optPosY
  };

  const optionSets = {
    setOptScale: setOptScale,
    setOptPosX: setOptPosX,
    setOptPosY: setOptPosY
  };

  const getVto = () => {
    if (category === 'Cincin') return <Vto2dRing targetTexture={targetTexture} {...options} />;
    if (category === 'Gelang') return <Vto2dBracelet targetTexture={targetTexture} {...options} />;
    if (category === 'Anting') return <Vto2dEarrings targetTexture={targetTexture} {...options} />;
    if (category === 'Kalung') return <Vto2dNecklace targetTexture={targetTexture} {...options} />;
    return <div>Not Implemented</div>;
  }

  useEffect(() => {
    const pathnameList = location.pathname.split('/');
    const brandId = pathnameList[2];
    const productSlug = pathnameList[3];
    // If accessed from dashboard (no brandId and productSlug) return;
    if (!brandId || !productSlug) return;
function Bubbles({ options, optionSets, zoomLevel, setZoomLevel }) {
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => { setShowSettings(!showSettings) };
  const increaseZoom = () => {
    if (zoomLevel < 2) setZoomLevel(zoomLevel + 0.1);
  };
  const decreaseZoom = () => {
    if (zoomLevel > 1) setZoomLevel(zoomLevel - 0.1);
  };

  return (
    <>
      <div className="bubbles">
        <div className="bubble" onClick={toggleSettings}>🎚️</div>
        <div className="bubble" onClick={increaseZoom}>+</div>
        <div className="bubble" onClick={decreaseZoom}>-</div>
        <div className="bubble">C</div>
      </div>
      { showSettings && <Settings show={showSettings} {...options} {...optionSets} />}
    </>
  )
}

/** Update unique visitor and views statistics */
function updateStat() {
  const pathnameList = location.pathname.split('/');
  const brandId = pathnameList[2];
  const productSlug = pathnameList[3];
  // If accessed from dashboard (no brandId and productSlug) return;
  if (!brandId || !productSlug) return;

  const productId = `${brandId}-${productSlug}`;
  let statBody = { brandId, productSlug, uniqueUser: true };
  const coubaAnalytics = localStorage.getItem('couba-analytics');
  if (coubaAnalytics) {
    const stat = JSON.parse(coubaAnalytics);
    if (stat.productVisited.includes(productId)) {
      statBody.uniqueUser = false;
    } else {
      stat.productVisited.push(productId);
      localStorage.setItem('couba-analytics', JSON.stringify(stat))
    }
  } else {
    localStorage.setItem('couba-analytics', JSON.stringify({ productVisited: [productId] }))
  }
  fetch('/api/v1/stat', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(statBody)
  })
    .then(res => res.json())
    .then(data => console.log(data));
}

const tigaDef = {
  renderer: null,
  scene: null,
  model: {},
  camera: null,
  controls: null,
  ikSolver: null
}

function getInstructionText(category) {
  switch (category) {
    case 'bracelet':
      return 'Show your right / left back of the hand closer to the camera';

    case 'earring':
      return 'Face forward straight to the camera';

    case 'ring':
      return 'Show your right / left back of the hand closer to the camera';

    case 'necklace':
      return 'Face forward straight to the camera and ensure your neck is exposed';

    default:
      return 'No category.';
  }
}

function getInstructionImage(category) {
  switch (category) {
    case 'bracelet':
      return '/instructions/Instruction_camera_hand.png';

    case 'earring':
      return '/instructions/Instruction_camera_medium_body.png';

    case 'ring':
      return '/instructions/Instruction_camera_hand.png';

    case 'necklace':
      return '/instructions/Instruction_camera_medium_body.png';

    default:
      return 'No category.';
  }
}

// eslint-disable-next-line react/prop-types
function VtoViewer({ category, targetTexture }) {
  const videoRef = useRef(null);
  const threeCanvasRef = useRef(null);
  const smoothingCanvasRef = useRef(null);
  const tiga = useRef(tigaDef);
  const rafId = useRef(null);
  const threeInitRef = useRef(null);
  const [detecting, setDetecting] = useState(false);
  const [optScale, setOptScale] = useState(1);
  const [optPosX, setOptPosX] = useState(0);
  const [optPosY, setOptPosY] = useState(0);
  const [detectors, setDetectors] = useState(null);
  const [showInstruction, setShowInstruction] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  const options = {
    optScale: optScale,
    optPosX: optPosX,
    optPosY: optPosY
  };

  const optionSets = {
    setOptScale: setOptScale,
    setOptPosX: setOptPosX,
    setOptPosY: setOptPosY
  };

  useEffect(() => {
    updateStat();
  }, []);

  useEffect(() => {
    threeInitRef.current = getThreeInit(category);
    getDetectors(category).then((result) => setDetectors(result));
  }, [category]);

  useEffect(() => {
    // Check if browser support media device
    if (!navigator.mediaDevices) {
      alert('There is no media device available or not allowed.');
      return;
    }
    const mediaConstraints = {
      audio: false,
      video: {
        aspectRatio: (defaultCameraAspectRatio),
        frameRate: { max: 30 },
        facingMode: 'user',
      },
    };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then((stream) => {
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        setMediaStream(stream);
        video.onloadeddata = video.play;
      }
    });
    // Initialize three js
    const threeInit = threeInitRef.current;
    if (threeCanvasRef.current && threeInit) {
      threeInit(threeCanvasRef.current, targetTexture)
        .then((result) => tiga.current = result)
        .catch(err => console.error(`${err.name}: ${err.message}`));
    }
  }, [detectors, targetTexture]);

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
    if (videoRef.current && smoothingCanvasRef.current && threeCanvasRef.current) {
      videoRef.current.style.transform = `rotateY(180deg) scale(${zoomLevel})`;
      smoothingCanvasRef.current.style.transform = `rotateY(180deg) scale(${zoomLevel})`;
      threeCanvasRef.current.style.transform = `scale(${zoomLevel})`;
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (rafId.current) window.cancelAnimationFrame(rafId.current);
    if (detecting) {
      const video = videoRef.current;
      const bs = new BeautyShader(smoothingCanvasRef.current, video.videoWidth, video.videoHeight);
      bs.initShader();
      threeCanvasRef.current.style.display = 'inline';

      let lastVideoTime = -1;
      // const renderPrediction = async () => {
      //   // Applying skin smoothing
      //   if (video.readyState >= video.HAVE_CURRENT_DATA) {
      //     bs.updateTexture(video);
      //     bs.drawScene();
      //   }

      //   const startTimeMs = performance.now();
      //   if (lastVideoTime !== video.currentTime) {
      //     lastVideoTime = video.currentTime;
      //     const results = detector.detectForVideo(video, startTimeMs);
      //     // do something with the handLandmarks data
      //     const tc = tiga.current;
      //     const sceneVisibility = tc.scene.visible;
      //     if (results.landmarks.length > 0) {
      //       // handLandmarks.update(results);
      //       // handWorldLandmarks.update(results);
      //       if (!sceneVisibility) tc.scene.visible = true;
      //       // rigBracelet(tc.model, handLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
      //       // rigEarring(tc.model, faceLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
      //       // rigRing(tc.model, handLandmarks, tc.camera, selectedFinger, setShowInstruction, optScale, optPosX, optPosY);
      //       // rigNecklace(tc.model, faceLandmarks, sl, swl, tc.camera, guideCtx, setShowInstruction, optScale, optPosX, optPosY);
      //     } else {
      //       tc.scene.visible = false;
      //       setShowInstruction(true);
      //     }
      //     tc.renderer.render(tc.scene, tc.camera);
      //   }
      //   rafId.current = window.requestAnimationFrame(renderPrediction);
      // }
      let renderPrediction;
      switch (category) {
        case 'bracelet':
          renderPrediction = async () => {
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
              bs.updateTexture(video);
              bs.drawScene();
            }
            const startTimeMs = performance.now();
            if (lastVideoTime !== video.currentTime) {
              lastVideoTime = video.currentTime;
              const results = detectors.hand.detectForVideo(video, startTimeMs);
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
          break;

        case 'earring':
          renderPrediction = async () => {
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
              bs.updateTexture(video);
              bs.drawScene();
            }
            const startTimeMs = performance.now();
            if (lastVideoTime !== video.currentTime) {
              lastVideoTime = video.currentTime;
              const results = detectors.face.detectForVideo(video, startTimeMs);
              const tc = tiga.current;
              const sceneVisibility = tc.scene.visible;
              if (results.faceLandmarks.length > 0) {
                faceLandmarks.update(results);
                if (!sceneVisibility) tc.scene.visible = true;
                rigEarring(tc.model, faceLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
              } else {
                tc.scene.visible = false;
              }
              tc.renderer.render(tc.scene, tc.camera);
            }
            rafId.current = window.requestAnimationFrame(renderPrediction);
          };
          break;

        case 'ring':
          renderPrediction = async () => {
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
              bs.updateTexture(video);
              bs.drawScene();
            }
            const startTimeMs = performance.now();
            if (lastVideoTime !== video.currentTime) {
              lastVideoTime = video.currentTime;
              const results = detectors.hand.detectForVideo(video, startTimeMs);
              const tc = tiga.current;
              const sceneVisibility = tc.scene.visible;
              if (results.landmarks.length > 0) {
                handLandmarks.update(results);
                handWorldLandmarks.update(results);
                if (!sceneVisibility) tc.scene.visible = true;
                rigRing(tc.model, handLandmarks, tc.camera, 'ring', setShowInstruction, optScale, optPosX, optPosY);
              } else {
                tc.scene.visible = false;
                setShowInstruction(true);
              }
              tc.renderer.render(tc.scene, tc.camera);
            }
            rafId.current = window.requestAnimationFrame(renderPrediction);
          };
          break;

        case 'necklace':
          renderPrediction = async () => {
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
              bs.updateTexture(video);
              bs.drawScene();
            }
            const startTimeMs = performance.now();
            if (lastVideoTime !== video.currentTime) {
              lastVideoTime = video.currentTime;
              const poseResults = detectors.pose.detectForVideo(video, startTimeMs);
              if (poseResults.landmarks[0] && poseResults.landmarks[0].length == 33) {
                poseLandmarker.forEach((landmarkName, idx) => {
                  sl[landmarkName].lerp(poseResults.landmarks[0][idx], config.lerp.value);
                  swl[landmarkName].lerp(poseResults.worldLandmarks[0][idx], config.lerp.value);
                });
              }
              const faceResults = detectors.face.detectForVideo(video, startTimeMs);
              const tc = tiga.current;
              const sceneVisibility = tc.scene.visible;
              if (faceResults.faceLandmarks.length > 0) {
                faceLandmarks.update(faceResults);
                if (!sceneVisibility) tc.scene.visible = true;
                rigNecklace(tc.model, faceLandmarks, sl, swl, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
              } else {
                tc.scene.visible = false;
              }
              tc.renderer.render(tc.scene, tc.camera);
            }
            rafId.current = window.requestAnimationFrame(renderPrediction);
          }

        default:
          break;
      }
      renderPrediction();

    }  else {
      const video = videoRef.current;
      const canvas = threeCanvasRef.current;
      if (video && canvas) canvas.style.display = 'none';
    }

    // return clean up function for animation frame
    return () => { window.cancelAnimationFrame(rafId.current) };
  }, [detecting, optScale, optPosX, optPosY]);

  return (
    <div className="preview-container" style={{width: config.videoSize.width}}>
      <div className="vto-container" style={{width: config.videoSize.width, height: config.videoSize.height}}>
        <>
          {!detectors && <p className="loading">Loading...</p>}
          {detectors &&
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
                      { getInstructionText(category) }
                    </p>
                    <img className="instruction-image" src={getInstructionImage(category)} alt="Instruction" />
                  </div>
                </div>
                { !detecting &&
                  <>
                    <div className="overlay" />
                    <div className="init-instruction">
                      { getInstructionText(category) }
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
        <Bubbles
          options={options}
          optionSets={optionSets}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
        />
      </div>
    </div>
  )
}

export default VtoViewer;