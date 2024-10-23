"use client"

import Image from 'next/image';
import Script from 'next/script';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, query, collection, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, /* updateMetadata, */ uploadBytes } from 'firebase/storage';
import { /* app, */ db, auth, storage } from '@/firebaseClient';

import FormAddProduct, { FormEditProduct } from './FormAddProduct';
import VtoPreviewer from '@/app/components/vto/VtoViewer';
// import './App.css';

// const DEBUG = process.env.NEXT_PUBLIC_DEBUG;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const USER_DB_PATH = process.env.NEXT_PUBLIC_USER_DB_PATH;
const PRODUCTS_DB_PATH = process.env.NEXT_PUBLIC_PRODUCTS_DB_PATH;
const PAYMENTS_DB_PATH = process.env.NEXT_PUBLIC_PAYMENTS_DB_PATH;
const PRICES_DB_PATH = process.env.NEXT_PUBLIC_PRICES_DB_PATH;

const referenceImages = {
  ring: '/assets/rings-reference.png',
  earring: '/assets/earring-reference.png',
  necklace: '/assets/necklace-reference.png',
  bracelet: '/assets/bracelet-reference.png'
};

function slugify(str) {
  str = str.toLowerCase(); // convert string to lowercase
  str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
  str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
  str = str.replace(/\s+/g, '-') // replace spaces with hyphens
           .replace(/-+/g, '-'); // remove consecutive hyphens
  return str;
}

async function generateBrandId(brandSlug) {
  const reqBody = { apiKey: API_KEY, brandSlug };
  const res = await fetch(`/api/v1/brandId`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqBody)
  });
  if (!res.ok) throw new Error('Failed to generate brand id');
  const resJson = await res.json();
  return resJson.brandId;
}

async function getTransactionToken(userProfile, paymentData) {
  const reqBody = {
    apiKey: "some-api-key",
    transactionDetails: {
      orderId: paymentData.id,
      grossAmount: paymentData.grossAmount,
    },
    itemDetails: [{
      id: paymentData.productId,
      price: paymentData.grossAmount,
      quantity: 1,
      name: paymentData.productName
    }],
    user: {
      fullName: userProfile.fullName,
      email: userProfile.email,
      phone: userProfile.phone
    }
  };
  try {
    const res = await fetch('/api/v1/transaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody)
    });
    if (res.status !== 200) {
      alert(`Error fetchting transaction token: ${res.status}`);
      throw new Error(`Error fetchting transaction token: ${res.status}`);
    }
    const resJson = await res.json();
    return resJson.transactionToken;
  } catch (error) {
    return null;
  }

}

/** Send Welcome Email by sending POST request to email server */
function sendWelcomeEmail(user) {
  const bodyContent = {
    apiKey: API_KEY,
    user: {
      email: user.email,
      fullName: user.fullName
    }
  };
  fetch(`/api/v1/welcome-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyContent)
  }).catch((error) => console.error(`Error while sending welcome email: ${error}`));
}

/** Get the price given the price type */
async function getPrice(priceType) {
  const priceRef = doc(db, PRICES_DB_PATH, priceType);
  try {
    const priceDoc = await getDoc(priceRef);
    if (!priceDoc.exists) throw new Error('Price does not exists');
    return priceDoc.data().price;
  } catch (error) {
    throw new Error(`Error getting price: ${error}`);
  }
}

function GlobalLoading({ show }) {
  if (!show) show = false;
  return (show &&
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        zIndex: '10',
        backgroundColor: 'rgba(0,0,0,0.8)',
        position: 'fixed',
        left: '0',
        top: '0'
      }}
    >
      <h2>Loading ...</h2>
    </div>
  )
}

function UserInfo({ userProfile }) {
  return <>
    <h2>User Info</h2>

    <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
      <div>
        <Image src={userProfile.photoUrl} style={{borderRadius: '50%', height: 'auto'}} width={50} height={50} alt="user-photo" />
        {/* <img src={userProfile.photoUrl} style={{borderRadius: '50%'}} width={50} alt="user-photo" /> */}
      </div>
      <div style={{display:'flex', flexDirection:'column', alignItems:'start'}}>
        <div><b>{userProfile.fullName}</b></div>
        <div>{userProfile.uuid}</div>
      </div>
    </div>

    <h3>Brand</h3>

    <div style={{display:'flex', gap:'8px', justifyContent:'center', flexDirection:'column'}}>
      <div className="flex flex-wrap justify-center align-center">
        <Image src={userProfile.brandLogo} style={{borderRadius: '50%', height: 'auto'}} width={50} height={50} alt="brand-logo" />
      </div>
      {/* <div><img src={userProfile.brandLogo} width={50} alt="brand-logo" /></div> */}
      <div>[{userProfile.brandId}] {userProfile.brandName}</div>
    </div>
  </>
}

function FormSubmitBrand({ userProfile, setUserProfile }) {
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const brandName = formData.get('brandName');
    const brandLogo = formData.get('brandLogo');
    const ext = brandLogo.name.split('.').pop();
    const brandSlug = slugify(brandName);
    const brandId = await generateBrandId(brandSlug);

    if (!brandId || !brandName || !brandLogo) {
      alert('Brand Name and Brand Logo are required');
      return;
    }

    // Upload brandLogo to bucket
    const storageRef = ref(storage, `${userProfile.email}/brand-logo.${ext}`);
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, brandLogo);
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      // await updateMetadata(storageRef, { customMetadata: { 'brandName': brandName } });

      // Update the brand name and brand logo
      const userProfileRef = doc(db, USER_DB_PATH, userProfile.email);
      await setDoc(userProfileRef, { brandId, brandName, brandSlug, brandLogo: downloadURL }, { merge: true });
      setUserProfile((prevUserProfile) => ({
        ...prevUserProfile,
        brandId,
        brandName,
        brandSlug,
        brandLogo: downloadURL
      }));

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return <>
    <h3>Submit Brand</h3>
    <form onSubmit={handleBrandSubmit}>
      <div>
        <label htmlFor="input-brand-name">Brand Name:</label>
        <input type="text" id="input-brand-name" name="brandName" required />
      </div>
      <div>
        <label htmlFor="input-brand-logo">Brand Logo:</label>
        <input type="file" accept="image/*" id="input-brand-logo" name="brandLogo" required />
      </div>
      <button type="submit">Submit</button>
    </form>
  </>
}

function ProductList({ userProfile, products, handlePublish, handleAddProduct }) {
  const [imageSrc, setImageSrc] = useState();
  const [referenceSrc, setReferenceImg] = useState();
  const [productSlug, setProductSlug] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewCategory, setPreviewCategory] = useState('ring');
  const [previewFileUrl, setPreviewFileUrl] = useState(null);

  const handleEditImage = async (e) => {
    e.preventDefault();
    if (isEditing) { setIsEditing(false) }
    else {
      setIsEditing(true);
      const productId = e.target.getAttribute('data-productid');
      const productCategory = e.target.getAttribute('data-productcategory');
      const fileUrl = e.target.getAttribute('data-fileurl');
      setReferenceImg(referenceImages[productCategory]);

      const productSplit = productId.split('-');
      productSplit.shift();
      const product_slug = productSplit.join('-');
      setProductSlug(product_slug);
      setImageSrc(fileUrl);
    }
  };

  const handlePreviewVTO = async (e) => {
    e.preventDefault();
    if (isPreviewing) { setIsPreviewing(false) }
    else {
      setIsPreviewing(true);
      const category = e.target.getAttribute('data-category');
      const fileUrl = e.target.getAttribute('data-fileurl');
      setPreviewCategory(category);
      setPreviewFileUrl(fileUrl);
    }
  };

  const handleOnOff = async (e) => {
    const checked = e.target.checked;
    const productId = e.target.getAttribute('data-productid');
    const productRef = doc(db, PRODUCTS_DB_PATH, productId);
    try {
      await setDoc(productRef, { active: checked }, { merge: true });
    } catch (error) {
      alert('Error while activate/deactivate product');
      console.error(error);
    }
  };

  const renderPublishStatus = (publishStatus, expiredDate) => {
    if (expiredDate) {
      return <div title={`expired at: ${expiredDate.toDate().toString()}`}>{publishStatus}</div>
    }
    return <div>{publishStatus}</div>
  };

  return (
    <>
      <h2>Product List</h2>
      { products.length === 0 && <p>You have no product.</p> }
      { products.length > 0 &&
        <table style={{ width: '80vw', maxWidth: '1280px' }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Name</th>
              <th>Category</th>
              <th>Thumbnail</th>
              <th>Publish Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {products.map((product, idx) => (
            <tr key={product.slug}>
              <td>{idx+1}</td>
              <td><p>{product.name}<br/>({product.slug})</p></td>
              <td>{product.category}</td>
              <td><Image src={product.thumbnailUrl} width={50} height={50} alt={`${product.slug}-thumbnail`} /></td>
              {/* <td><img src={product.thumbnailUrl} width={50} alt={`${product.slug}-thumbnail`} /></td> */}
              <td>{renderPublishStatus(product.publishStatus, product.expiredDate)}</td>
              <td>{product.paymentStatus || '-'}</td>
              <td>
                <div style={{display:'flex', gap:'8px', justifyContent:'center'}}>
                  {product.paymentStatus !== 'paid' &&
                  <>
                    <button
                      data-category={product.category}
                      data-productslug={product.slug}
                      data-fileurl={product.fileUrl}
                      onClick={handlePreviewVTO}
                    >Preview</button>
                    <button
                      data-productid={product.id}
                      data-productcategory={product.category}
                      data-fileurl={product.fileUrl}
                      onClick={handleEditImage}
                    >Edit</button>
                    <button
                      style={{backgroundColor: 'teal'}}
                      data-productid={product.id}
                      data-productname={product.name}
                      data-productslug={product.slug}
                      onClick={handlePublish}
                    >Publish</button>
                  </>
                  }
                  {product.paymentStatus === 'paid' && product.publishStatus !== 'expired' &&
                    <>
                      <button
                        style={{backgroundColor: 'none'}}
                        onClick={() => { alert('URL: ' + product.vtoUrl) }}
                      >Share</button>
                      {/* <!-- Rounded switch --> */}
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={product.active}
                          onChange={handleOnOff}
                          data-productid={product.id}
                        />
                        <span className="slider round"></span>
                      </label>
                    </>
                  }
                  {product.paymentStatus === 'paid' &&
                    <button
                      title="extend active period"
                      style={{backgroundColor: 'teal'}}
                      data-productid={product.id}
                      data-productname={product.name}
                      data-productslug={product.slug}
                      onClick={handlePublish}
                    >Extend</button>
                  }
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      }
      { isEditing &&
        <FormEditProduct
          imageSrc={imageSrc}
          setImageSrc={setImageSrc}
          referenceSrc={referenceSrc}
          userEmail={userProfile.email}
          brandId={userProfile.brandId}
          productSlug={productSlug}
          setIsEditting={setIsEditing}
        />
      }
      { isPreviewing &&
        <VtoPreviewer category={previewCategory} targetTexture={previewFileUrl} />
      }
      <button onClick={handleAddProduct}>Add Product</button>
    </>
  );
}

function App() {
  const [user, userLoading , /* error */] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [addingProduct, setAddingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      // Get user-profile, if doesn't exists then create a new one
      const userProfileRef = doc(db, USER_DB_PATH, result.user.email);
      const userProfileDoc = await getDoc(userProfileRef);
      if (userProfileDoc.exists()) {
        setUserProfile(userProfileDoc.data());
      } else {
        const userData = {
          brandLogo: '',
          brandName: '',
          dateJoined: serverTimestamp(),
          email: result.user.email,
          fullName: result.user.displayName,
          phone: result.user.phoneNumber,
          photoUrl: result.user.photoURL,
          uuid: result.user.uid
        }
        await setDoc(userProfileRef, userData);
        setUserProfile(userData);
        if (getAdditionalUserInfo(result).isNewUser) {
          sendWelcomeEmail(userData); // Send welcome email to user email
        }
      }
    } catch (err) {
      console.error(`Error Code: ${err.code}\nError Message: ${err.message}`)
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => { setUserProfile(null) })
      .catch((err) => console.error(`Error Code: ${err.code}\nError Message: ${err.message}`));
  };

  const handleAddProduct = () => { setAddingProduct(!addingProduct) };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productName = formData.get('productName');
    const productCategory = formData.get('productCategory');
    const productImage = formData.get('productImage');
    const productEditedImage = formData.get('productEditedImage');

    if (!productName || !productImage || !productCategory || !productEditedImage) {
      alert('Product Name, Category, Image and Edited Image are required.');
      return;
    }

    const productSlug = slugify(productName);
    const productRef = doc(db, PRODUCTS_DB_PATH, `${userProfile.brandId}-${productSlug}`);
    const productDoc = await getDoc(productRef);

    // return error if the product with the same productSlug is already exists
    if (productDoc.exists()) {
      alert('Choose another name for product, that name has already taken.')
      return;
    }

    // Upload productImage to bucket
    const storageRef = ref(storage, `${userProfile.email}/products/${productSlug}`);
    const storageEditedRef = ref(storage, `${userProfile.email}/products/${productSlug}-edited`);
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, productImage);
      await uploadBytes(storageEditedRef, productEditedImage);
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      const editedDownloadURL = await getDownloadURL(storageEditedRef);

      // Update the product data
      const userProductRef = doc(db, PRODUCTS_DB_PATH, `${userProfile.brandId}-${productSlug}`);
      const newProductData = {
        name: productName,
        slug: productSlug,
        category: productCategory,
        thumbnailUrl: downloadURL,
        fileUrl: editedDownloadURL,
        usage: 0,
        uniqueUser: 0,
        paymentStatus: 'unpaid',
        paymentDate: null,
        publishStatus: 'draft',
        expiredDate: null,
        vtoUrl: null,
        active: false,
        uuid: user.uid
      }
      await setDoc(userProductRef, newProductData);
      setAddingProduct(false);

    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const productId = e.target.getAttribute('data-productid');
    const productName = e.target.getAttribute('data-productname');
    const productSlug = e.target.getAttribute('data-productslug');
    setIsLoading(true);

    try {
      let paymentData = {};
      const q = query(
        collection(db, PAYMENTS_DB_PATH),
        where('uuid', '==', user.uid),
        where('productSlug', '==', productSlug),
        where('status', '==', 'waiting')
      );
      const result = await getDocs(q);
      // Check if payment doc already exists
      if (result.docs.length > 0) {
        paymentData = result.docs[0].data();
        paymentData.id = result.docs[0].id;
      } else {
        // Create payment document
        const price = await getPrice('one-year-active-period');
        paymentData = {
          brandName: userProfile.brandName,
          createdAt: serverTimestamp(),
          grossAmount: price,
          productId,
          productName,
          productSlug,
          status: 'waiting',
          userEmail: userProfile.email,
          userFullName: userProfile.fullName,
          userPhone: userProfile.phone,
          uuid: userProfile.uuid
        };
        const paymentRef = await addDoc(collection(db, PAYMENTS_DB_PATH), paymentData);
        paymentData.id = paymentRef.id;
      }

      const transactionToken = await getTransactionToken(userProfile, paymentData);
      if (transactionToken) {
        window.snap.pay(transactionToken);
      } else {
        throw new Error('Cannot get transaction token');
      }

    } catch (error) {
      console.error(`Error while Publishing: ${error}`);
    } finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {
    let unsubscribe;
    // Fetch user profile and user products if logged in
    if (user) {
      // Get the user profile
      const userProfileRef = doc(db, USER_DB_PATH, user.email);
      getDoc(userProfileRef)
        .then((result) => { setUserProfile(result.data()); })
        .catch((err) => console.error(`Error while getting User Profile.\n${err}`));

      // Get the user products
      const q = query(
        collection(db, PRODUCTS_DB_PATH),
        where('uuid', '==', user.uid)
      );
      unsubscribe = onSnapshot(q,
        (result) => {
          if (result.docs.length > 0) {
            const fetchedProducts = [];
            result.docs.map((doc) => {
              const productData = doc.data();
              productData.id = doc.id;
              fetchedProducts.push(productData);
            });
            setProducts(fetchedProducts);
          }
        },
        (error) => console.error(`Error while getting User Products.\n${error}`)
      );
    }

    return () => {
      // Reset the userProfile and products when component unmounted
      if (userProfile) setUserProfile(null);
      if (products.length > 0) setProducts([]);
      if (unsubscribe) unsubscribe();
      setAddingProduct(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Script type="text/javascript"
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-bwUG-b2rqueNSohP" async
      ></Script>

      <GlobalLoading show={(userLoading || isLoading)} />
      <h1>Coba-Couba</h1>
      <div className="card">
        {!user && <button onClick={handleLogin}>Login with Google</button>}
        {user && <button onClick={handleLogout}>Logout</button>}
        {userProfile && userProfile.brandName === '' &&
          <FormSubmitBrand userProfile={userProfile} setUserProfile={setUserProfile} />
        }
        {userProfile && userProfile.brandName !== '' &&
          <div className="user-info">
            <UserInfo userProfile={userProfile} />
            <ProductList
              userProfile={userProfile}
              products={products}
              handleAddProduct={handleAddProduct}
              handlePublish={handlePublish}
            />
          </div>
        }
        {addingProduct && <FormAddProduct handleSubmitProduct={handleProductSubmit} />}
      </div>
      <p className="read-the-docs">
        This is just a prototype.
      </p>
    </>
  )
}

export default App
