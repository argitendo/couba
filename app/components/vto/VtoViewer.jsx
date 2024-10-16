"use client"

import Vto2dRing from './Vto2dRing';
import Vto2dEarrings from './Vto2dEarrings';
import Vto2dNecklace from './Vto2dNecklace';
import Vto2dBracelet from './Vto2dBracelet';
import { useEffect } from 'react';

// eslint-disable-next-line react/prop-types
function VtoViewer({ category, targetTexture }) {
  const getVto = () => {
    if (category === 'ring') return <Vto2dRing targetTexture={targetTexture} />;
    if (category === 'earring') return <Vto2dEarrings targetTexture={targetTexture} />;
    if (category === 'necklace') return <Vto2dNecklace targetTexture={targetTexture} />;
    if (category === 'bracelet') return <Vto2dBracelet targetTexture={targetTexture} />;
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
    <div className="preview-container">
      <h3>Preview Container</h3>
      { getVto() }
    </div>
  )
}

export default VtoViewer;