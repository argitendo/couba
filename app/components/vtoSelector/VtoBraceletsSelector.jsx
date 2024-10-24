import Image from "next/image";

function VtoBraceletsSelector({ imageList }) {

  const handleImageChange = (imgPath) => {
    setSelectedEarring(imgPath);
  }

  return (
    <form className="image-selector grid grid-cols-4 gap-4">
      {imageList.map((imgPath, idx) => (
        <div key={idx} className="cursor-pointer">
          <input
            type="radio"
            name="bracelet"
            value={imgPath}
            id={`bracelet-0${idx}`}
            onChange={handleImageChange}
          />
          <label htmlFor={`bracelet-0${idx}`}>
            <div className={'bracelet-image-container ' + (idx === 0 ? 'active' : '')}>
              <Image className="bracelet-image" src={imgPath} width="100%" alt={imgPath} />
            </div>
          </label>
        </div>
      ))}
    </form>
  )
}

export default VtoBraceletsSelector