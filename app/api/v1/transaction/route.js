import { NextResponse } from 'next/server';
import midtransClient from 'midtrans-client';
import { db } from '@/firebaseAdmin';
import logger from '@/logger';

require('dotenv').config();

const API_KEY = process.env.API_KEY;
const PRICES_DB_PATH = process.env.PRICES_DB_PATH;
const IS_PRODUCTION = process.env.IS_PRODUCTION === 'true';
const MIDTRANS_SERVER_KEY = (IS_PRODUCTION)
  ? process.env.MIDTRANS_PRODUCTION_SERVER_KEY
  : process.env.MIDTRANS_SANDBOX_SERVER_KEY;

if (!API_KEY || !PRICES_DB_PATH || !MIDTRANS_SERVER_KEY) {
  throw new Error('API_KEY, PRICES_DB_PATH, and MIDTRANS_SERVER_KEY are required')
}

let snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY
});

export async function POST(req) {
  const body = await req.json();
  if (body.apiKey !== API_KEY) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }

  const user = body.user;
  const transactionDetails = body.transactionDetails;
  const itemDetails = body.itemDetails;

  if (!user || !transactionDetails || !itemDetails) {
    return NextResponse.json({ "status": "Bad Request" }, { status: 400 });
  }

  // TODO: Validation for gross amount, so it can't be tampered
  const priceRef = db.collection(PRICES_DB_PATH).doc('one-year-active-period');
  try {
    const priceDoc = await priceRef.get();
    if (!priceDoc.exists) throw new Error('Price does not exists');
    if (priceDoc.data().price !== itemDetails[0].price) throw new Error('Prices are not matched');
  } catch (error) {
    logger.error(`Error getting price: ${error}`);
    return NextResponse.json({ "status": "Bad Request" }, { status: 400 });
  }

  // const orderId = 'order-' + performance.now();
  const orderId = transactionDetails.orderId + '-' + Date.now();
  let parameter = {
    "transaction_details": {
      "order_id": orderId,
      "gross_amount": transactionDetails.grossAmount
    },
    "credit_card":{
      "secure" : true
    },
    "item_details": [
      {
        "id": itemDetails[0].id,
        "price": itemDetails[0].price,
        "quantity": itemDetails[0].quantity,
        "name": itemDetails[0].name
      }
    ],
    "customer_details": {
      "first_name": user.fullName,
      "last_name": "",
      "email": user.email,
      "phone": user.phone || ""
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    logger.info(`Transaction token request for ${orderId} success: ${transaction.token}`);
    return NextResponse.json({ status: 'ok', transactionToken: transaction.token });
  } catch (error) {
    logger.error(`Error getting transaction token for ${orderId}\n${error}`);
    NextResponse.json({ "status": "Bad Request" }, { status: 400 });
  }
}