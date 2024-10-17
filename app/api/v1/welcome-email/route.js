import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/emails';

const API_KEY = process.env.API_KEY;

if (!API_KEY) throw new Error('API_KEY is required');

export async function POST(req) {
  const body = await req.json();
  if (body.apiKey !== API_KEY) {
    return NextResponse.json({ status: "Unauthorized" }, { status: 401 });
  }
  const user = body.user;
  if (!user || !user.fullName || !user.email) {
    return NextResponse.json({ "status": "Bad Request" }, { status: 400 });
  }

  sendWelcomeEmail(user);
  return NextResponse.json({ 'status': 'ok' });
}