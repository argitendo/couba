import { NextResponse } from 'next/server';
import getRedisClient from '@/redisClient';
import { db } from '@/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import logger from '@/logger';

const redisClient = await getRedisClient();

// Handle process exit and close the Redis connection gracefully
process.on('exit', async () => {
  const redisClient = await getRedisClient();
  if (redisClient) redisClient.quit();
});

process.on('SIGINT', async () => {
  const redisClient = await getRedisClient();
  if (redisClient) {
    await redisClient.quit();
    logger.log('Redis client disconnected');
    process.exit(0);
  }
});

const API_KEY = process.env.API_KEY;
const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;
const PRODUCT_USAGE_CACHE_TRESHOLD = 3;

if (!API_KEY || !PRODUCTS_DB_PATH) throw new Error('API_KEY and PRODUCTS_DB_PATH is required');

export async function POST(req) {
  const body = await req.json();
  // if (body.apiKey !== API_KEY) {
  //   return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  // }
  const brandId = body.brandId;
  const productSlug = body.productSlug;
  const uniqueUser = body.uniqueUser;
  if (!brandId || !productSlug || uniqueUser === null) {
    return NextResponse.json({ "status": "Bad Request" }, { status: 400 });
  }

  // Logic to add usage and unique user
  // First check if there is local counter (redis)
  // if yes then add to local counter
  // if no then directly update to firestore
  const productId = `${brandId}-${productSlug}`;
  const counterKey = `counter:${productId}`;
  const result = await redisClient.hGetAll(counterKey);
  const productRef = db.collection(PRODUCTS_DB_PATH).doc(productId);

  if (!result || Object.keys(result).length === 0) {
    // console.log('The hash is empty or does not exist.');
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return NextResponse.json({ "status": "Bad Request" }, { status: 400 });
    }
    const product = productDoc.data();
    if (product.usage <= PRODUCT_USAGE_CACHE_TRESHOLD) {
      const uuIncrement = (uniqueUser) ? 1 : 0;
      productRef.update({
        usage: FieldValue.increment(1),
        uniqueUser: FieldValue.increment(uuIncrement)
      });
    } else {
      redisClient.hSet(counterKey, { productId, usage: 1, uniqueUser: 1 });
    }

  } else {
    // console.log('usage:', result.usage, ' | uniqueUser:', result.uniqueUser, ' | productId:', result.productId);
    if (uniqueUser) {
      redisClient.hSet(counterKey, {
        usage: parseInt(result.usage, 10) + 1,
        uniqueUser: parseInt(result.uniqueUser, 10) + 1
      });
    } else {
      redisClient.hSet(counterKey, {
        usage: parseInt(result.usage, 10) + 1,
        uniqueUser: parseInt(result.uniqueUser, 10)
      });
    }
  }

  return NextResponse.json({ 'status': 'ok' });
}