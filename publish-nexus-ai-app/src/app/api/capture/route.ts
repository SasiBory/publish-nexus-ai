import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';
import * as dotenv from 'dotenv';
import { POST as analyzeAsinPOST } from '../analyze-asin/route'; // Import the AI analysis POST handler

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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // console.log('Received data from Chrome extension:', data); // Removed

    // Save data to Firestore
    // You might want to add validation and more specific collection/document handling
    const docRef = await db.collection('capturedData').add({
      ...data,
      timestamp: new Date(),
    });

    const docId = docRef.id;

    // Trigger AI analysis
    try {
      const analyzeRequest = new NextRequest(new Request('http://localhost/api/analyze-asin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId }),
      }));
      // Call the POST handler directly
      const analyzeResponse = await analyzeAsinPOST(analyzeRequest);
      const analyzeResult = await analyzeResponse.json();
      console.log(`AI analysis triggered for docId ${docId}. Result:`, analyzeResult);
    } catch (aiError) {
      console.error(`Error triggering AI analysis for docId ${docId}:`, aiError);
    }

    return NextResponse.json({ message: 'Data captured successfully', id: docId }, { status: 200 });
  } catch (error) {
    console.error('Error capturing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error capturing data', error: errorMessage }, { status: 500 });
  }
}