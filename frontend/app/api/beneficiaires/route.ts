// app/api/beneficiaires/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await db.query('SELECT * FROM beneficiaires');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Erreur API bénéficiaires:', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}