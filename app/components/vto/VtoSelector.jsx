import ringsImage from './../data/RingImageData'
import earringImage from './../data/EarringImageData';
import necklaceImage from './../data/NecklaceImageData';
import braceletsImage from './../data/BraceletImageData';

import VtoRingSelector from '../vtoSelector/vtoRingSelector';
import VtoEarringSelector from '../vtoSelector/VtoEarringSelector';
import VtoNecklaceSelector from '../vtoSelector/VtoNecklaceSelector';
import VtoBraceletsSelector from '../vtoSelector/VtoBraceletsSelector';

function VtoSelectorViewer({ category, setSelectedImage }) {

  const getSelectVto = () => {
    switch (category) {
      case 'Cincin':
        return <VtoRingSelector setSelectedRing={setSelectedImage} imageList={ringsImage} />;
      case 'Anting':
        return <VtoEarringSelector setSelectedEarring={setSelectedImage} imagesList={earringImage} />;
      case 'Kalung':
        return <VtoNecklaceSelector setSelectedNecklace={setSelectedImage} imageList={necklaceImage} />;
      case 'Gelang':
        return <VtoBraceletsSelector imageList={braceletsImage} />;
      default:
        return <div>Selector not founds</div>;
    }
  }

  return (
    <>
      { getSelectVto() }
    </>
  )
}

export default VtoSelectorViewer;