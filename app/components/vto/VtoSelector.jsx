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
    if (category === 'Cincin') return <RingSelectors images={ringsImage} selectedFinger={selectedFinger} setSelectedFinger={setSelectedFinger} />;
    if (category === 'Gelang') return <>Bracelet Not Implemented</>;
    if (category === 'Anting') return <EarringSelectors images={earringImage} />;
    if (category === 'Kalung') return <NecklaceSelectors images={NecklaceImage} />;
    return <div>Not Implemented</div>;
  }

  return (
    <>
      { getSelectVto() }
    </>
  )
}

export default VtoSelectorViewer;