import { sendProductExpiredEmail } from '../emails.js';
import { db, auth } from '../firebaseAdmin.js';
import logger from '../logger.js';

// require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;

async function checkExpiredProducts() {
  logger.info('Running expiration check for products');
  const today = new Date();
  const productsRef = db.collection(PRODUCTS_DB_PATH)
    .where('paymentStatus', '==', 'paid')
    .where('publishStatus', '==', 'published')
    .where('expiredDate', '<', today);

  try {
    await db.runTransaction(async (t) => {
      const productsDoc = await t.get(productsRef);
      if (productsDoc.empty) { logger.info('There is no expired product') }
      else {
        productsDoc.docs.forEach(async (product) => {
          const productData = product.data();
          const expiredProductRef = db.collection(PRODUCTS_DB_PATH).doc(product.id);
          t.update(expiredProductRef, {
            publishStatus: 'expired',
            active: false
          });
          const userAuth = await auth.getUser(productData.uuid);
          if (userAuth.email) {
            const user = {
              fullName: userAuth.displayName || 'User Couba',
              email: userAuth.email
            };
            logger.info(`${product.id} expired at ${productData.expiredDate.toDate()}`);
            logger.info(`Sending product expired email to ${user.email}`);
            sendProductExpiredEmail(user, productData);
          }
        })
      }
    });
  } catch (error) {
    logger.error(`Error while checking expired products: ${error}`);
  }
}

checkExpiredProducts();
