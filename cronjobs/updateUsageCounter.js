import { FieldValue } from 'firebase-admin/firestore';
import getRedisClient from '../redisClient.js';
import { db } from '../firebaseAdmin.js';
import logger from '../logger.js';

// require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const PRODUCTS_DB_PATH = process.env.PRODUCTS_DB_PATH;

async function updateUsageCounter() {
  logger.info('Running update usage counter for products');
  try {
    const redisClient = await getRedisClient();

    const pattern = 'counter:*';
    const keys = [];
    let cursor = 0;

    do {
      const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 10 });
      cursor = reply.cursor;
      keys.push(...reply.keys);
    } while (cursor !== 0);  // Continue until the cursor is 0

    keys.forEach(async (key) => {
      const stat = await redisClient.hGetAll(key);
      if (parseInt(stat.usage, 10) > 0) {
        const productRef = db.collection(PRODUCTS_DB_PATH).doc(stat.productId);
        const productDoc = await productRef.get();
        if (productDoc.exists) {
          await productRef.update({
            usage: FieldValue.increment(parseInt(stat.usage, 10)),
            uniqueUser: FieldValue.increment(parseInt(stat.uniqueUser, 10))
          });
          redisClient.hSet(key, { usage: 0, uniqueUser: 0 });
        }
      }
    });

  } catch (err) {
    logger.error(`Error while updating usage counter: ${err}`);
  }

  return;
}

updateUsageCounter();