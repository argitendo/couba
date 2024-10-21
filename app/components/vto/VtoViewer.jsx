"use client"

import Vto2dRing from './Vto2dRing';
import Vto2dEarrings from './Vto2dEarrings';
import Vto2dNecklace from './Vto2dNecklace';
import Vto2dBracelet from './Vto2dBracelet';
import { useEffect, useState } from 'react';
import { config } from './config';

function OptionSliders({ optScale, setOptScale, optPosX, setOptPosX, optPosY, setOptPosY }) {
  return (
    <div className="setting-container">
      <label
        htmlFor="scale-range"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Scale
      </label>
      <input
        id="scale-range"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        type="range"
        defaultValue={optScale}
        min={0}
        max={2}
        step={0.1}
        onChange={(e) => {setOptScale(parseFloat(e.target.value));}}
      />
      <label
        htmlFor="pos-x-range"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Position X
      </label>
      <input
        id="pos-x-range"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        type="range"
        defaultValue={optPosX}
        min={-0.1}
        max={0.1}
        step={0.01}
        onChange={(e) => {setOptPosX(parseFloat(e.target.value));}}
      />
      <label
        htmlFor="pos-y-range"
        className="block text-sm font-medium text-gray-900 dark:text-white"
      >
        Position Y
      </label>
      <input
        id="pos-y-range"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        type="range"
        defaultValue={optPosY}
        min={-0.1}
        max={0.1}
        step={0.01}
        onChange={(e) => {setOptPosY(parseFloat(e.target.value));}}
      />
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
    if (category === 'ring') return <Vto2dRing targetTexture={targetTexture} {...options} />;
    if (category === 'earring') return <Vto2dEarrings targetTexture={targetTexture} {...options} />;
    if (category === 'necklace') return <Vto2dNecklace targetTexture={targetTexture} {...options} />;
    if (category === 'bracelet') return <Vto2dBracelet targetTexture={targetTexture} {...options} />;
    return <div>Not Implemented</div>;
  }

  useEffect(() => {
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
  }, []);

  return (
    <div className="preview-container" style={{width: config.videoSize.width}}>
      <div className="vto-container" style={{width: config.videoSize.width, height: config.videoSize.height}}>
        { getVto() }
        <OptionSliders {...options} {...optionSets} />
      </div>
    </div>
  )
}

export default VtoViewer;