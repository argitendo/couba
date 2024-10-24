import Image from 'next/image';

function VtoNecklaceSelector({imageList, setSelectedNecklace}) {

  const handleImageChange = (imgPath) => {
    setSelectedNecklace(imgPath);
    console.log(imgPath);
    
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {imageList.map((imgPath, idx) => (
        <div key={idx} className='cursor-pointer'>
          <button 
            type="button"
            id={`necklace-0${idx}`}
            className='image-button-container rounded-3xl p-4 border-2 border-gray-300 bg-white hover:border-gray-500 bg-opacity-30'
            onClick={() => handleImageChange(imgPath, idx)}
          >
            <Image
              className="necklace-image"
              src={imgPath}
              width="100%" 
              alt={`Necklace ${idx + 1}`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}

export default VtoNecklaceSelector