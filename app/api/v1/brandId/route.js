import { NextResponse } from 'next/server';
import { db } from '@/firebaseAdmin';
import logger from '@/logger';

require('dotenv').config();

const API_KEY = process.env.API_KEY;
const USER_DB_PATH = process.env.USER_DB_PATH;

if (!API_KEY || !USER_DB_PATH) {
  throw new Error('API_KEY and USER_DB_PATH are required')
}

export async function POST(req) {
  const body = await req.json();
  if (body.apiKey !== API_KEY) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }
  const brandSlug = body.brandSlug;
  if (!brandSlug) return NextResponse.json({ status: "Bad Request" }, { status: 400 });

  const userProfileRef = db.collection(USER_DB_PATH);
  try {
    const userProfileDocs = await userProfileRef.where('brandSlug', '==', brandSlug).get();
    if (userProfileDocs.empty) {
      logger.info(`Brand id for ${brandSlug} => ${brandSlug}`);
      return NextResponse.json({ brandId: brandSlug });
    }
    const existedBrandIds = userProfileDocs.docs.map((profile) => profile.data().brandId);
    let counter = userProfileDocs.size;
    let brandId = `${brandSlug}-${counter}`;

    while (existedBrandIds.includes(brandId)) {
      counter += 1;
      brandId = `${brandSlug}-${counter}`;
    }

    logger.info(`Brand id for ${brandSlug} => ${brandId}`);
    return NextResponse.json({ brandId });

  } catch (error) {
    logger.error(`Error while generating brand id: ${error}`);
    return NextResponse.json({ error: 'Error while generating brand id' }, { status: 500 });
  }
}