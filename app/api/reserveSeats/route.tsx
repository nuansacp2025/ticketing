import { NextResponse, NextRequest } from "next/server";
import { getMyProfile, setSeatsReserved } from "@/lib/protected";
import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/error";
import { API_CREDS_INTERNAL_USE_ONLY, PYTHON_API_URL, VERCEL_PROTECTION_BYPASS } from "@/lib/constants";
import { verify } from "@/lib/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/db/source";
import { getSeatsQuery } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      throw new UnauthorizedError();
    }
    const { ticketId } = verify(token!);
    const body = await request.json();

    await setSeatsReserved(body.ids, ticketId);

    const emailResponse = await fetch(`${PYTHON_API_URL}/api/email/sendSeatConfirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-protection-bypass": VERCEL_PROTECTION_BYPASS,  // only needed in preview env
        "X-Internal-API-Credentials": API_CREDS_INTERNAL_USE_ONLY,
      },
      body: JSON.stringify({ ticketId }),
    });

    const ticketRef = doc(db, "tickets", ticketId);
    updateDoc(ticketRef, { "seatConfirmationSent": emailResponse.ok });
    // TODO: Send error log to DB if response is not OK

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "An unknown error occured" }, { status: 500 });
  }
}
