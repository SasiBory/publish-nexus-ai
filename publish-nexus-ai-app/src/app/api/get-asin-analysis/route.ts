import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import * as dotenv from 'dotenv';

// Explicitly load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asin = searchParams.get('asin');

    if (!asin) {
      return NextResponse.json({ message: 'ASIN is required' }, { status: 400 });
    }

    // Query Firestore for documents with the given ASIN and an existing aiAnalysis field
    const snapshot = await db.collection('capturedData')
      .where('asin', '==', asin)
      .where('aiAnalysis', '!=', null) // Ensure aiAnalysis field exists
      .limit(1) // We only need one document
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: 'No analysis found for this ASIN' }, { status: 404 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({ aiAnalysis: data.aiAnalysis }, { status: 200 });

  } catch (error) {
    console.error('Error fetching ASIN analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error fetching ASIN analysis', error: errorMessage }, { status: 500 });
  }
}