import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdmin } from '@/lib/auth';
import { ApiError, UnauthorizedError } from '@/lib/error';
import { db } from '@/db/source';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(num: number, length: number = 4): string {
  let result = "";
  while (num > 0) {
    result = BASE62[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result.padStart(length, "0");
}

function datetimeToCode(datetimeStr: string): string {
  // Input format: "D/M/YYYY h:mm:ss AM/PM"
  const [datePart, timePart, ampm] = datetimeStr.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);

  let [hour, minute, second] = timePart.split(":").map(Number);
  if (ampm.toUpperCase() === "PM" && hour < 12) hour += 12;
  if (ampm.toUpperCase() === "AM" && hour === 12) hour = 0;

  // Build Date
  const dt = new Date(year, month - 1, day, hour, minute, second);

  const monthVal = dt.getMonth() + 1; // 1–12
  const dayVal = dt.getDate();        // 1–31
  const hourVal = dt.getHours();      // 0–23
  const minuteVal = dt.getMinutes();  // 0–59

  // Combine into 20-bit int
  const code = (monthVal << 16) | (dayVal << 11) | (hourVal << 6) | minuteVal;

  // Convert to base62, 4 characters
  return toBase62(code, 4);
}

export function generateTicketId(orderId: string, datetimeStr: string): string {
  const last4 = orderId.slice(-4);
  const code = datetimeToCode(datetimeStr);
  return code + last4;
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
    const code = generateTicketId('D_DAY', now.toDate().toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
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
