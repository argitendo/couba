import Image from 'next/image';

function VtoRingSelector({ setSelectedRing, imageList }) {
  
  const handleImageChange = (imgPath) => {
    setSelectedRing(imgPath);
    console.log("Ring selected: ", imgPath);
    
  };

  return (
    <section className="grid grid-cols-4 gap-4">
      {imageList.map((imgPath, idx) => (
        <div key={idx} className='cursor-pointer'>
          <button
            type="button"
            id={`image-btn-${idx}`}
            className="image-button-container rounded-3xl p-4 border-2 border-gray-300 bg-white hover:border-gray-500 bg-opacity-30"
            onClick={() => handleImageChange(imgPath)}
          >
            <Image
              className="ring-image"
              src={imgPath.url || imgPath} // If imgPath is an object, use its url property
              width="100%"
              alt={`Ring ${idx + 1}`}
            />
          </button>
        </div>
      ))}
    </section>
  );
}

export default VtoRingSelector