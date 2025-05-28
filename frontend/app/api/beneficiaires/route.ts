// app/api/beneficiaires/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * Beneficiaries API Route Handler
 * 
 * This API route handles the retrieval of all beneficiaries from the database.
 * It provides a GET endpoint that returns the complete list of beneficiaries.
 * 
 * @returns NextResponse containing the list of beneficiaries or an error message
 */
export async function GET() {
  try {
    // Query the database to fetch all beneficiaries
    const [rows] = await db.query('SELECT * FROM beneficiaires');
    
    // Return the results as JSON
    return NextResponse.json(rows);
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Beneficiaries API Error:', error);
    
    // Return a 500 status code with an error message
    return new NextResponse('Server Error', { status: 500 });
  }
}