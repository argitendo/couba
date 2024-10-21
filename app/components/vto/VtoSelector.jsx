import { RingSelects } from './Vto2dRing';

// eslint-disable-next-line react/prop-types
function VtoSelectorViewer({ 
  category,
  selectAccessories,
  setSelectedAccessories,
}) {
  const getSelectVto = () => {
    if (category === 'ring') return <RingSelects selectedFinger={selectAccessories} setSelectedFinger={setSelectedAccessories} />;
    return <div>Not Implemented</div>;
  }

  return (
    <div className="">
      {/* <h3>Select Container</h3> */}
      { getSelectVto() }
    </div>
  )
}

export default VtoSelectorViewer;