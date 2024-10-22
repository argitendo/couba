import { RingSelectors } from './Vto2dRing';
import { useState } from 'react';

import ringsImage from './../data/RingImageData'
import earringImage from '../data/EarringImageData';
import NecklaceImage from '../data/NecklaceImageData';

import { EarringSelectors } from './Vto2dEarrings';
import { NecklaceSelectors } from './Vto2dNecklace';

// eslint-disable-next-line react/prop-types
function VtoSelectorViewer({ category }) {
  const [selectedFinger, setSelectedFinger] = useState('');

  const getSelectVto = () => {
    if (category === 'ring') return <RingSelectors images={ringsImage} selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger} />;
    if (category === 'earring') return <EarringSelectors images={earringImage} />;
    if (category === 'necklace') return <NecklaceSelectors images={NecklaceImage} />;
    if (category === 'bracelet') return <>Bracelet Not Implemented</>;
    return <div>Not Implemented</div>;
  }

  return (
    <>
      { getSelectVto() }
    </>
  )
}

export default VtoSelectorViewer;