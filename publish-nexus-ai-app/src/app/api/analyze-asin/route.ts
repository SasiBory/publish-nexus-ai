import { NextRequest, NextResponse } from 'next/server';
import { reverseAsinAnalysis } from '@/ai/flows/reverse-asin-analysis';
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

export async function POST(req: NextRequest) {
  try {
    const { asin, docId } = await req.json();

    if (!asin && !docId) {
      return NextResponse.json({ message: 'ASIN or docId is required' }, { status: 400 });
    }

    let productData;

    if (docId) {
      // Fetch data from Firestore using docId
      const docRef = db.collection('capturedData').doc(docId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json({ message: 'Document not found' }, { status: 404 });
      }
      productData = docSnap.data();
    } else if (asin) {
      // For now, if only ASIN is provided, we'll use it directly for the AI flow.
      // In a real scenario, you might want to fetch the full product data from 'capturedData'
      // based on the ASIN, or even trigger a new capture if not found.
      // For this test, we'll just pass the ASIN to the AI flow.
      productData = { asin }; // Minimal data for AI flow input
    }

    if (!productData || !productData.asin) {
        return NextResponse.json({ message: 'Could not retrieve valid product data with ASIN' }, { status: 400 });
    }

    console.log(`Triggering reverse ASIN analysis for ASIN: ${productData.asin}`);

    // Invoke the AI flow
    const aiResult = await reverseAsinAnalysis({ asin: productData.asin });

    console.log('AI Analysis Result:', JSON.stringify(aiResult, null, 2));

    // Save aiResult back to Firestore
    if (docId) {
      await db.collection('capturedData').doc(docId).update({
        aiAnalysis: aiResult,
        aiAnalysisTimestamp: new Date(),
      });
      console.log(`AI analysis result saved to Firestore for docId: ${docId}`);
    } else {
      console.warn('docId not provided, AI analysis result not saved to Firestore.');
    }

    return NextResponse.json({
      message: 'AI analysis triggered successfully',
      asin: productData.asin,
      aiResult: aiResult // Include AI result for immediate testing
    }, { status: 200 });

  } catch (error) {
    console.error('Error triggering AI analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error triggering AI analysis', error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed. Use POST.' }, { status: 405 });
}