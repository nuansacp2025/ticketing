import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdmin } from '@/lib/auth';
import { ApiError, UnauthorizedError } from '@/lib/error';
import { db } from '@/db/source';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      throw new UnauthorizedError();
    }
    await verifyAdmin(token);

    const { email, catA = 0, catB = 0, catC = 0 } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Field `email` required' }, { status: 400 });
    }

    const now = Timestamp.now();
    const code = generateCode();
    const ticketRef = await addDoc(collection(db, 'tickets'), {
      code,
      catA: Number(catA) || 0,
      catB: Number(catB) || 0,
      catC: Number(catC) || 0,
      seatConfirmed: false,
      checkedIn: false,
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
