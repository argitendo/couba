import Image from "next/image";

function VtoEarringSelector({ setSelectedEarring, imagesList }) {

  const handleImageChange = (imgPath) => {
    setSelectedEarring(imgPath);
    // const allChoices = document.getElementsByClassName('earring-image-container');
    // Array.from(allChoices).forEach(elm => elm.classList.remove('active'));
    // const currentChoice = document.getElementById(`image-btn-${idx}`).querySelector('.earring-image');
    // currentChoice.classList.add('active');
  }

  return (
    <section className="grid grid-cols-4 gap-4">
      {imagesList.map((imgPath, idx) => (
        <div key={idx} className='cursor-pointer'>
          <button
            type="button"
            id={`image-btn-${idx}`}
            className="image-button-container rounded-3xl p-4 border-2 border-gray-300 bg-white hover:border-gray-500 bg-opacity-30"
            onClick={() => handleImageChange(imgPath, idx)}
          >
            <Image
              className="earring-image"
              src={imgPath}
              width="100%" 
              height="100%"
              alt={`Earring ${idx + 1}`}
            />
          </button>
        </div>
      ))}
    </section>
  );
}

export default VtoEarringSelector