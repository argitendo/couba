import { db } from "@/firebaseAdmin";
import logger from "@/logger";
import VtoViewer from "@/app/components/vto/VtoViewer";

const PAYMENTS_DB_PATH = process.env.PAYMENTS_DB_PATH;
const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;

if (!PAYMENTS_DB_PATH || !PRODUCTS_DB_PATH) {
  throw new Error('PAYMENTS_DB_PATH and PRODUCTS_DB_PATH are required')
}

async function getVto(brandId, productSlug) {
  try {
    const productId = `${brandId}-${productSlug}`;
    const paymentRef = db.collection(PAYMENTS_DB_PATH)
      .where('productId', '==', productId)
      .where('status', '==', 'paid')
      .orderBy('paymentDate', 'desc')
      .limit(1);
    const paymentDoc = await paymentRef.get();
    if (paymentDoc.empty) throw new Error('VTO does not exists');

    const productRef = db.collection(PRODUCTS_DB_PATH).doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) throw new Error('VTO Product does not exists');
    const product = productDoc.data();

    if (product.paymentStatus !== 'paid') throw new Error('Unpaid');

    if (product.publishStatus === 'expired') throw new Error('Expired');

    const currentDate = new Date();
    const expiredDate = product.expiredDate.toDate();
    if (expiredDate < currentDate) throw new Error('Expired');

    if (!product.active) throw new Error('Inactive');

    logger.info(`Accessing VTO for ${productDoc.id}`);
    return <VtoViewer category={product.category} targetTexture={product.fileUrl} />

  } catch (error) {
    logger.error(`Error while creating VTO: ${error}`);
    return (
      <>
        <div>404</div>
        <pre>{error.toString()}</pre>
      </>
    )
  }
}

export default function Vto({ params }) {
  const previewer = getVto(params.brandId, params.productSlug);

  return (
    <div className="flex-row content-center h-screen">
      {previewer}
    </div>
  )
}