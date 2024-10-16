import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
// require('dotenv').config();
import * as dotenv from 'dotenv';
dotenv.config();

const DB_URL = process.env.DB_URL;
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;

// import serviceAccount from './service-account.json';

const firebaseConfig = {
  credential: cert('./service-account.json'),
  databaseURL: DB_URL,
  storageBucket: STORAGE_BUCKET
};

// Check if Firebase is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app)
