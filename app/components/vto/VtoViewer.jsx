/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, useRef } from 'react';
import { TextureLoader, RepeatWrapping } from 'three';
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
import {
  getThreeInit,
  rigBracelet,
  rigEarring,
  rigNecklace,
  rigRing
} from './solver';
import { poseLandmarker } from './utils';
import './vto.css';
import * as VtoIcons from './VtoIcons';

import { Nunito_Sans } from 'next/font/google';
const nunitoSans = Nunito_Sans({preload: true, subsets: ['latin']});

const categories = ['bracelet', 'earring', 'necklace', 'ring'];
const fingerList = ['index', 'middle', 'ring', 'pinky'];
const defaultCameraAspectRatio = config.videoSize.width / config.videoSize.height;

function Slider({ id, labels, value, min, max, step, onChange }) {
  return (
    <div className="grid grid-cols-6 gap-2 text-sm mb-1">
      <div className="cols-2">{labels[0]}</div>
      <div className="col-span-4">
        <input
          id={id}
          className="w-full h-0.5 bg-white rounded-lg appearance-none cursor-pointer"
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
        />
      </div>
      <div className="cols-2">{labels[1]}</div>
    </div>
  );
}

function Settings({ optScale, setOptScale, optPosX, setOptPosX, optPosY, setOptPosY, setShowSetting }) {
  const [valuePosX, setValuePosX] = useState(optPosX);
  const [valuePosY, setValuePosY] = useState(optPosY);
  const [valueScale, setValueScale] = useState(optScale);
  const [activeTab, setActiveTab] = useState('position');

  const handleReset = () => {
    setValuePosX(0);
    setValuePosY(0);
    setValueScale(1);
  };
  const handleClose = () => { setShowSetting(false); };
  const activatePosition = () => setActiveTab('position');
  const activateScale = () => setActiveTab('scale');

  useEffect(() => {
    setOptPosX(valuePosX);
    setOptPosY(valuePosY);
    setOptScale(valueScale);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuePosX, valuePosY, valueScale]);

  return (
    <div className="setting-container">
      <div className="control-menu my-1 mx-3 gap-2 flex justify-end">
        <button className="setting-control-btn reset-btn ms-auto" onClick={handleReset}>
          <VtoIcons.Reset />
        </button>
        <button className="setting-control-btn close-btn" onClick={handleClose}>
          <VtoIcons.Close />
        </button>
      </div>
      <div className="sliders-tab">
        <div className="slider-tab-head flex justify-start gap-3 border-b border-white/20 pt-1 pb-3 mb-2">
          <div className={"slider-tab-btn " + ((activeTab === 'position') ? "active" : "")} onClick={activatePosition}>
            <VtoIcons.Position color={(activeTab === 'position') ? "#1B1F3A" : "#FFFFFF"}/> <p>Position</p>
          </div>
          <div className={"slider-tab-btn " + ((activeTab === 'scale') ? "active" : "")} onClick={activateScale}>
            <VtoIcons.Scale color={(activeTab === 'scale') ? "#1B1F3A" : "#FFFFFF"}/> <p>Scale</p>
          </div>
        </div>
        { activeTab === 'position' &&
        <>
          <Slider id="pos-x-range" labels={['Left', 'Right']} value={valuePosX} min={-0.1} max={0.1} step={0.01} onChange={(e) => {setValuePosX(parseFloat(e.target.value));}} />
          <Slider id="pos-y-range" labels={['Down', 'Up']} value={valuePosY} min={-0.1} max={0.1} step={0.01} onChange={(e) => {setValuePosY(parseFloat(e.target.value));}} />
        </>
        }
        { activeTab === 'scale' &&
          <Slider id="scale-range" labels={['Down', 'Up']} value={valueScale} min={0} max={2} step={0.1} onChange={(e) => {setValueScale(parseFloat(e.target.value));}} />
        }
      </div>
    </div>
  );
}

function Bubbles({ options, optionSets, zoomLevel, setZoomLevel, category, selectedFinger, setSelectedFinger, handleCaptureImage }) {
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => { setShowSettings(!showSettings); };
  const increaseZoom = () => { if (zoomLevel < 2) setZoomLevel(zoomLevel + 0.1); };
  const decreaseZoom = () => { if (zoomLevel > 1) setZoomLevel(zoomLevel - 0.1); };
  const changeFinger = () => {
    const idx = (fingerList.indexOf(selectedFinger) + 1) % 4;
    setSelectedFinger(fingerList[idx]);
  };
  return (
    <>
      <div className="bubbles">
        <div className="bubble" title="Show Settings" onClick={toggleSettings}>
          <VtoIcons.Menu />
        </div>
        <div className="bubble" title="Zoom In" onClick={increaseZoom}>
          <VtoIcons.ZoomIn />
        </div>
        <div className="bubble" title="Zoom Out" onClick={decreaseZoom}>
          <VtoIcons.ZoomOut />
        </div>
        <div className="bubble" title="Capture Image" onClick={handleCaptureImage}>
          <VtoIcons.CameraShutter />
        </div>
        { (category === 'ring') &&
        <div className="bubble" onClick={changeFinger} title="Finger Switch">
          <VtoIcons.FingerSwitch />
        </div>}
      </div>
      { showSettings && <Settings {...options} {...optionSets} setShowSetting={setShowSettings} />}
    </>
  );
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
      localStorage.setItem('couba-analytics', JSON.stringify(stat));
    }
  } else {
    localStorage.setItem('couba-analytics', JSON.stringify({ productVisited: [productId] }));
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
};

function getInstructionText(category) {
  switch (category) {
    case 'bracelet':
      return 'Show your right / left back of the hand closer to the camera';

    case 'earring':
      return 'Face forward straight to the camera and ensure your ear is exposed';

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
  const captureCanvasRef = useRef(null);
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
  const [selectedFinger, setSelectedFinger] = useState('ring');
  const [captureFrame, setCaptureFrame] = useState(false);
  const dataUrl = useRef('');

  const handleDetect = () => {
    (!videoRef.current.srcObject) ? alert('Need to select camera first!') : setDetecting(!detecting);
  };

  const handleCaptureImage = () => {
    setCaptureFrame(true);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectors]);

  useEffect(() => {
    if (detecting) {
      const tc = tiga.current;
      const newTexture = new TextureLoader().load(targetTexture);
      switch (category) {
        case 'bracelet':
          tc.model.bracelet.material.uniforms.uTexture.value = newTexture;
          break;
        case 'earring':
          const newTextureFlipped = newTexture.clone();
          newTextureFlipped.wrapS = RepeatWrapping;
          newTextureFlipped.repeat.x = -1;
          tc.model.r.material.uniforms.uTexture.value = newTexture;
          tc.model.l.material.uniforms.uTexture.value = newTextureFlipped;
          break;
        case 'ring':
          tc.model.ring.material.uniforms.uTexture.value = newTexture;
          break;
        case 'necklace':
          tc.model.neck.material.uniforms.uTexture.value = newTexture;
          break;
        default:
          break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetTexture]);

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

      const captureImage = () => {
        if (captureFrame) {
          const captureCanvas = captureCanvasRef.current;
          const captureCtx = captureCanvas.getContext('2d');
          captureCtx.drawImage(smoothingCanvasRef.current, 0, 0);
          captureCtx.save();
          captureCtx.scale(-1,1);
          captureCtx.drawImage(threeCanvasRef.current, -threeCanvasRef.current.width, 0);
          captureCtx.restore();
          dataUrl.current = captureCanvas.toDataURL('image/png');
          setCaptureFrame(false);
        }
      };

      let lastVideoTime = -1;
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
            captureImage();
            rafId.current = window.requestAnimationFrame(renderPrediction);
          };
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
            captureImage();
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
                rigRing(tc.model, handLandmarks, tc.camera, selectedFinger, setShowInstruction, optScale, optPosX, optPosY);
              } else {
                tc.scene.visible = false;
                setShowInstruction(true);
              }
              tc.renderer.render(tc.scene, tc.camera);
            }
            captureImage();
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
            captureImage();
            rafId.current = window.requestAnimationFrame(renderPrediction);
          };

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
    return () => { window.cancelAnimationFrame(rafId.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detecting, optScale, optPosX, optPosY, selectedFinger, captureFrame]);

  useEffect(() => {
    if (!captureFrame && dataUrl.current !== '') {
      const today = new Date();
      const link = document.createElement('a');
      link.href = dataUrl.current;
      link.download = `couba-${today}.png`;
      link.click();
      dataUrl.current = '';
    }
  }, [captureFrame]);

  return (
    <div className={"preview-container " + nunitoSans.className} style={{width: config.videoSize.width}}>
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
                  <canvas
                    className='capture-canvas'
                    ref={captureCanvasRef}
                    width={`${config.videoSize.width}`}
                    height={`${config.videoSize.height}`}
                  />
                  <canvas />
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
                    <div className="instruction show">
                      <div className="instruction-item">
                        <p className="instruction-text">
                          { getInstructionText(category) }
                        </p>
                        <div className="detection-button-container">
                          <button className='detection-button' type="button" onClick={handleDetect}>
                            { !detecting && 'Start Try-On' }
                          </button>
                        </div>
                      </div>
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
        {detecting && <Bubbles
          options={options}
          optionSets={optionSets}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          category={category}
          selectedFinger={selectedFinger}
          setSelectedFinger={setSelectedFinger}
          handleCaptureImage={handleCaptureImage}
        />}
      </div>
    </div>
  );
}

export default VtoViewer;