import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/firebaseAdmin';
import logger from '@/logger';
import { Timestamp } from 'firebase-admin/firestore';
import { sendPaymentSuccessEmail } from '@/emails';

require('dotenv').config();

const VTO_BASE_URL = process.env.VTO_BASE_URL;
const PAYMENTS_DB_PATH = process.env.PAYMENTS_DB_PATH;
const USER_DB_PATH = process.env.USER_DB_PATH;
const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';
const MIDTRANS_SERVER_KEY = (IS_PRODUCTION)
  ? process.env.MIDTRANS_PRODUCTION_SERVER_KEY
  : process.env.MIDTRANS_SANDBOX_SERVER_KEY;

if (!PAYMENTS_DB_PATH || !MIDTRANS_SERVER_KEY) {
  throw new Error('PAYMENT_DB_PATH and MIDTRANS_SERVER_KEY are required')
}

export async function POST(req) {
  const notif = await req.json();
  logger.info(`Transaction ${notif.transaction_status} (${notif.status_code}): token ${notif.transaction_id}`);

  if (notif.status_code !== '200' || notif.fraud_status.toLowerCase() !== 'accept') {
    return NextResponse.json({ 'status': 'ok' });
  }

  const notifHash = createHash('sha512')
    .update(notif.order_id + notif.status_code + notif.gross_amount + MIDTRANS_SERVER_KEY)
    .digest('hex');

  if (notif.signature_key !== notifHash) {
    return NextResponse.json({ 'status': 'ok' });
  }

  logger.info(`Payment for orderId ${notif.order_id}: ${notif.transaction_status}`);
  // update payment data on firestore
  const paymentId = notif.order_id.split('-')[0];
  const paymentRef = db.collection(PAYMENTS_DB_PATH).doc(paymentId);

  try {
    await db.runTransaction(async (t) => {
      const paymentDoc = await t.get(paymentRef);
      if (!paymentDoc.exists) throw new Error('Payment Doc does not exists');
      const payment = paymentDoc.data();

      const userProfileRef = db.collection(USER_DB_PATH).doc(payment.userEmail);
      const userProfileDoc = await t.get(userProfileRef);
      if (!userProfileDoc) throw new Error('User Profile Doc does not exists');
      const userProfile = userProfileDoc.data();

      const productRef = db.collection(PRODUCTS_DB_PATH).doc(payment.productId);
      const productDoc = await t.get(productRef);
      if (!productDoc.exists) throw new Error('Product Doc does not exists');
      const product = productDoc.data();

      const paymentDate = Timestamp.fromDate(new Date(notif.transaction_time));
      if (payment.status !== 'paid') {
        const newPaymentStatus = {
          paymentDate,
          status: 'paid'
        };
        t.update(paymentRef, newPaymentStatus);

        // Add 1 full year to expired date
        let expiredDate;
        if (product.expiredDate) {
          const prevExpiredDate = product.expiredDate.toDate();
          const plusOneYear = new Date(prevExpiredDate);
          plusOneYear.setFullYear(plusOneYear.getFullYear() + 1);
          expiredDate = Timestamp.fromDate(plusOneYear);
        } else {
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          expiredDate = Timestamp.fromDate(oneYearFromNow);
        }
        const newProductData = {
          paymentDate,
          paymentStatus: 'paid',
          publishStatus: 'published',
          active: true,
          expiredDate,
          vtoUrl: `${VTO_BASE_URL}${userProfile.brandId}/${product.slug}`
        };
        t.update(productRef, newProductData);
        logger.info('Payment and product data has been successfully updated');
        logger.info(`Sending payment success email to ${payment.userEmail}`);
        sendPaymentSuccessEmail(payment);
      }
    });

  } catch (error) {
    logger.error(`Error while updating payment data: ${error}`);
  }

  return NextResponse.json({ 'status': 'ok' });
}