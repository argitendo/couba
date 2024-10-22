"use client"

import Vto2dRing from './Vto2dRing';
import Vto2dEarrings from './Vto2dEarrings';
import Vto2dNecklace from './Vto2dNecklace';
import Vto2dBracelet from './Vto2dBracelet';
import { useEffect, useState } from 'react';
import { config } from './config';

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

function Bubbles({ options, optionSets }) {
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = () => { setShowSettings(!showSettings) };
  return (
    <>
      <div className="bubbles">
        <div className="bubble" onClick={toggleSettings}>S</div>
        <div className="bubble">I</div>
        <div className="bubble">O</div>
        <div className="bubble">C</div>
      </div>
      {showSettings && <Settings {...options} {...optionSets} />}
    </>
  )
}

// eslint-disable-next-line react/prop-types
function VtoViewer({ category, targetTexture }) {
  const [detecting, setDetecting] = useState(false);
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
        <Bubbles options={options} optionSets={optionSets} />
      </div>
    </div>
  )
}

export default VtoViewer;