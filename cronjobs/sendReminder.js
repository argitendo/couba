import { sendReminderEmail } from '../emails.js';
import { db, auth } from '../firebaseAdmin.js';
import logger from '../logger.js';

// require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;

async function sendExpiredProductEmailReminder() {
  logger.info('Running expiration check to send reminder');
  // 1 Month (30 days) before the expired date
  const today = new Date();
  const ThirtyDaysFromNow = new Date(today);
  ThirtyDaysFromNow.setDate(today.getDate() + 30);
  const TwentyNineDaysFromNow = new Date(today);
  TwentyNineDaysFromNow.setDate(today.getDate() + 29);

  const productsRef = db.collection(PRODUCTS_DB_PATH)
    .where('paymentStatus', '==', 'paid')
    .where('publishStatus', '==', 'published')
    .where('expiredDate', '<', ThirtyDaysFromNow)
    .where('expiredDate', '>', TwentyNineDaysFromNow);

  const products = await productsRef.get();
  if (products.empty) { logger.info('There is no expiring product') }
  else {
    products.docs.forEach(async (product) => {
      const productData = product.data();
      const userAuth = await auth.getUser(productData.uuid);
      if (userAuth.email) {
        const user = {
          fullName: userAuth.displayName || 'User Couba',
          email: userAuth.email
        };
        logger.info(`Sending reminder email to ${user.email} for ${productData.name}`);
        sendReminderEmail(user, productData);
      }
    });
  }
}

sendExpiredProductEmailReminder();
