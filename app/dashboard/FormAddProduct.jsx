/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useRef } from 'react';
import { db, storage } from '@/firebaseClient';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

const referenceImages = {
  ring: '/assets/rings-reference.png',
  earring: '/assets/earring-reference.png',
  necklace: '/assets/necklace-reference.png',
  bracelet: '/assets/bracelet-reference.png'
};

const getTransform = (ref) => {
  return ref.current.style.transform.match(/translate\((-?\d+(?:\.\d+)?)px, (-?\d+(?:\.\d+)?)px\)/);
}

// eslint-disable-next-line react/prop-types
export function ImageEditor({ imageSrc, setImageSrc, referenceSource, inputEditedId }) {
  // const [imageSrc, setImageSrc] = useState(imageSource);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  const editorRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
    const transform = getTransform(imageRef);
    // console.log(transform);
    setInitialPosition({
      x: parseFloat(transform[1]),
      y: parseFloat(transform[2]),
    });
    imageRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = e.clientX - startPosition.x;
      const dy = e.clientY - startPosition.y;
      imageRef.current.style.transform = `
        translate(${initialPosition.x + dx}px, ${initialPosition.y + dy}px) scale(${scale}) rotate(${rotation}deg)`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    imageRef.current.style.cursor = 'grab';
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setStartPosition({ x: touch.clientX, y: touch.clientY });
    const transform = getTransform(imageRef);
    setInitialPosition({
      x: parseFloat(transform[1]),
      y: parseFloat(transform[2]),
    });
    imageRef.current.style.cursor = 'grabbing';
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - startPosition.x;
      const dy = touch.clientY - startPosition.y;
      imageRef.current.style.transform = `
        translate(${initialPosition.x + dx}px, ${initialPosition.y + dy}px) scale(${scale}) rotate(${rotation}deg)`;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    imageRef.current.style.cursor = 'grab';
  };

  const handleScaleChange = (e) => {
    if (imageRef.current) {
      setScale(e.target.value);
      const transform = getTransform(imageRef);
      const x = parseFloat(transform[1]);
      const y = parseFloat(transform[2]);
      imageRef.current.style.transform = `translate(${x}px, ${y}px) scale(${e.target.value}) rotate(${rotation}deg)`;
    }
  };

  const handleRotationChange = (e) => {
    if (imageRef.current) {
      setRotation(e.target.value);
      const transform = getTransform(imageRef);
      const x = parseFloat(transform[1]);
      const y = parseFloat(transform[2]);
      imageRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale}) rotate(${e.target.value}deg)`;
    }
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const transform = getTransform(imageRef);
    const x = parseFloat(transform[1]);
    const y = parseFloat(transform[2]);

    const editorWidth = editorRef.current.offsetWidth;
    const editorHeight = editorRef.current.offsetHeight;
    const imgNaturalWidth = imageRef.current.naturalWidth;
    const imgNaturalHeight = imageRef.current.naturalHeight;
    const imgInitialWidth = imageRef.current.width;
    const imgInitialHeight = imageRef.current.height;
    const imgScaledWidth = imageRef.current.width * scale;
    const imgScaledHeight = imageRef.current.height * scale;

    const imgScaleWidth = imgInitialWidth / imgNaturalWidth * scale;
    const imgScaleHeight = imgInitialHeight / imgNaturalHeight * scale;

    canvas.width = editorWidth;
    canvas.height = editorHeight;

    const offsetX = (editorWidth - imgScaledWidth) / 2 / imgScaleWidth;
    const offsetY = (editorHeight - imgScaledHeight) / 2 / imgScaleHeight;
    const rotationRad = rotation * Math.PI / 180;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply scaling
    ctx.scale(imgScaleWidth, imgScaleHeight);

    // Translate back by the initial offset (center point of the image)
    const ox = (x / imgScaleWidth) + offsetX;
    const oy = (y / imgScaleWidth) + offsetY;
    ctx.translate(ox, oy);

    // Apply rotation
    ctx.translate((imgNaturalWidth / 2), (imgNaturalHeight / 2));
    ctx.rotate(rotationRad);
    ctx.translate(-(imgNaturalWidth / 2), -(imgNaturalHeight / 2));

    // Draw image on canvas
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.restore();

    // Create a link to download the image
    const dataUrl = canvas.toDataURL('image/png');
    // const link = document.createElement('a');
    // link.href = dataUrl;
    // link.download = 'edited-image.png';
    // link.click();
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const editedImage = new File([blob], 'editedImage.png', { type: 'image/png' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(editedImage);
        // const inputEditedImage = document.getElementById('input-edited-image');
        const inputEditedImage = document.getElementById(inputEditedId);
        inputEditedImage.files = dataTransfer.files;
        // For demonstration purposes, show the file name
        // console.log(inputEditedImage.files[0].name);
        setImageSrc(null);
      });
  };

  return (
    <>
      <div
        className="editor"
        ref={editorRef}
        style={{
          backgroundImage: `url(${referenceSource})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Upload an image to edit"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
            cursor: 'grab',
            left: '0',
            top: '0',
          }}
          draggable={false}
        />
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: "2px 0" }}>
        <label htmlFor="sliderScale" style={{ paddingTop: '4px' }}>Scale</label>
        <input name="sliderScale" type="range" min="0.01" max="2" step="0.01" value={scale} onChange={handleScaleChange} />
        <input name="inputScale" type="number" min="0.01" max="2" step="0.01" style={{ width: '54px'}} value={scale} onChange={handleScaleChange} />
      </div>

      <div style={{ display: 'flex', gap: '4px', padding: "2px 0" }}>
        <label htmlFor="sliderRotation" style={{ paddingTop: '4px' }}>Rotation</label>
        <input name="sliderRotation" type="range" min="-180" max="180" step="1" value={rotation} onChange={handleRotationChange} />
        <input name="inputRotation" type="number" min="-180" max="180" step="1" style={{ width: '54px'}} value={rotation} onChange={handleRotationChange} />
      </div>

      <div className="editor" style={{ display: 'none' }}>
        <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
      </div>
      <button onClick={handleSave}>Save Image</button>
    </>
  )
}

// eslint-disable-next-line react/prop-types
export function FormEditProduct({ imageSrc, setImageSrc, referenceSrc, userEmail, brandId, productSlug, setIsEditting }) {
  const handleEditProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productEditedImage = formData.get('productEditedImage');

    if (!productEditedImage) {
      console.error('Product Name, Category, Image and Edited Image are required.');
      return;
    }

    const storageEditedRef = ref(storage, `${userEmail}/products/${productSlug}-edited`);
    const productRef = doc(db, 'user-products', `${brandId}-${productSlug}`);

    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageEditedRef, productEditedImage);
      // Get the download URL
      const editedDownloadURL = await getDownloadURL(storageEditedRef);
      await setDoc(productRef, { fileUrl: editedDownloadURL }, { merge: true });
      setIsEditting(false);
    } catch (error) {
      console.error('Error uploading edited file:', error);
    }

  }

  return (
    <>
      <h3>Edit Product Form</h3>
      <form onSubmit={handleEditProduct} >

        <div>
          {imageSrc && (
            <ImageEditor
              imageSrc={imageSrc}
              setImageSrc={setImageSrc}
              referenceSource={referenceSrc}
              inputEditedId={'input-edited-image-edit'}
            />
          )}

          <label style={{ display: 'none' }} htmlFor="input-edited-image-edit">Edited Image:</label>
          <input style={{ display: 'none' }} type="file" accept="image/*" id="input-edited-image-edit" name="productEditedImage" required />

        </div>

        <button type="submit">Submit</button>

      </form>
    </>
  )
}

// eslint-disable-next-line react/prop-types
function FormAddProduct({ handleSubmitProduct }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [referenceSrc, setReferenceSrc] = useState(referenceImages.ring);

  const handleCategoryChanges = (e) => {
    e.preventDefault();
    setReferenceSrc(referenceImages[e.target.value]);
  }

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <h3>Add Product Form</h3>
      <form onSubmit={handleSubmitProduct}>
        <div>
          <label htmlFor="input-product-name">Product Name:</label>
          <input type="text" id="input-product-name" name="productName" required />
        </div>

        <div>
          <label htmlFor="input-product-category">Product Category:</label>
            <select id="input-product-category" name="productCategory" onChange={handleCategoryChanges} required>
              <option value="ring">Ring</option>
              <option value="earring">Earring</option>
              <option value="necklace">Necklace</option>
              <option value="bracelet">Bracelet</option>
            </select>
        </div>

        <div>
          <label htmlFor="input-product-image">Product Image:</label>
          <input type="file" accept="image/*" id="input-product-image" name="productImage" required onChange={handleUpload} />

          {imageSrc && (
            <ImageEditor
              imageSrc={imageSrc}
              setImageSrc={setImageSrc}
              referenceSource={referenceSrc}
              inputEditedId={'input-edited-image'}
            />
          )}

          <label style={{ display: 'none' }} htmlFor="input-edited-image">Edited Image:</label>
          <input style={{ display: 'none' }} type="file" accept="image/*" id="input-edited-image" name="productEditedImage" required />

        </div>

        <button type="submit">Submit</button>

      </form>
    </>
  )
}

export default FormAddProduct;