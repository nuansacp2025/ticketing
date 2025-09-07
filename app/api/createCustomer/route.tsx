import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdmin } from '@/lib/auth';
import { ApiError, UnauthorizedError } from '@/lib/error';
import { db } from '@/db/source';
import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';

async function generateUniqueCode(prefix, length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let attempt = 0; attempt < 5; attempt++) {
    let random = '';
    for (let i = 0; i < length; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `${prefix}${random}`;
    const existing = await getDocs(
      query(collection(db, 'tickets'), where('code', '==', code))
    );
    if (existing.empty) {
      return code;
    }
  }
  throw new Error('Could not generate unique code');
}

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      throw new UnauthorizedError();
    }
    await verifyAdmin(token);

    const { email, prefix, catA = 0, catB = 0, catC = 0 } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Field `email` required' }, { status: 400 });
    }
    if (!prefix) {
      return NextResponse.json({ error: 'Field `prefix` required' }, { status: 400 });
    }

    const now = Timestamp.now();
    const code = await generateUniqueCode(prefix);
    const ticketRef = await addDoc(collection(db, 'tickets'), {
      code,
      catA: Number(catA) || 0,
      catB: Number(catB) || 0,
      catC: Number(catC) || 0,
      customerEmail: email,
      seatConfirmed: false,
      checkedIn: false,
      createdAt: now,
      purchaseConfirmationSent: false,
      lastUpdated: now,
    });
    const ticketId = ticketRef.id;

    await addDoc(collection(db, 'customers'), {
      email,
      ticketIds: [ticketId],
      lastUpdated: now,
    });

    return NextResponse.json({ success: true, ticket: { id: ticketId, code } }, { status: 200 });
  } catch (error: any) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
