import * as bracelet2d from './solver2dBracelet';
import * as ring2d from './solver2dRing';
import * as earring2d from './solver2dEarrings';
import * as necklace2d from './solver2dNecklace';

export const getThreeInit = (category) => {
  switch (category) {
    case 'bracelet':
      return bracelet2d.threeInit;

    case 'earring':
      return earring2d.threeInit;

    case 'ring':
      return ring2d.threeInit;

    case 'necklace':
      return necklace2d.threeInit;

    default:
      break;
  }
}

// const renderPredictionBracelet = async (lastVideoTime) => {
//   // Applying skin smoothing
//   if (video.readyState >= video.HAVE_CURRENT_DATA) {
//     updateTexture(gl, texture, video);
//     drawScene(gl);
//   }

//   const startTimeMs = performance.now();
//   if (lastVideoTime !== video.currentTime) {
//     lastVideoTime = video.currentTime;
//     const results = handDetector.detectForVideo(video, startTimeMs);
//     // do something with the handLandmarks data
//     const tc = tiga.current;
//     const sceneVisibility = tc.scene.visible;
//     if (results.landmarks.length > 0) {
//       handLandmarks.update(results);
//       handWorldLandmarks.update(results);
//       if (!sceneVisibility) tc.scene.visible = true;
//       rigBracelet(tc.model, handLandmarks, tc.camera, setShowInstruction, optScale, optPosX, optPosY);
//     } else {
//       tc.scene.visible = false;
//       setShowInstruction(true);
//     }
//     tc.renderer.render(tc.scene, tc.camera);
//   }
//   rafId.current = window.requestAnimationFrame(renderPrediction);
// }