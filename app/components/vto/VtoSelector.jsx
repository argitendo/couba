import { RingSelectors, RingSelects } from './Vto2dRing';

// eslint-disable-next-line react/prop-types
function VtoSelectorViewer({ 
  category,
  listImages
}) {
  const getSelectVto = () => {
    if (category === 'ring') return <RingSelectors />;
    if (category === 'earring') return <>Earring Not Implemented</>;
    if (category === 'necklace') return <>Necklace Not Implemented</>;
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