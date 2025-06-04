import { NextResponse, NextRequest } from "next/server";
import { getMyProfile, setSeatsReserved } from "@/lib/protected";
import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/error";
import { API_CREDS_INTERNAL_USE_ONLY, PYTHON_API_URL, VERCEL_PROTECTION_BYPASS } from "@/lib/constants";
import { verify } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
      const token = (await cookies()).get("token")?.value;

      if (!token) {
          throw new UnauthorizedError();
      }
    const { ticketId } = verify(token!);
    const body = await request.json();

    await setSeatsReserved(body.ids, ticketId);
    
    const profile = await getMyProfile(ticketId);
    const emailResponse = await fetch(`${PYTHON_API_URL}/api/email/sendSeatConfirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-protection-bypass": VERCEL_PROTECTION_BYPASS,
        "X-Internal-API-Credentials": API_CREDS_INTERNAL_USE_ONLY,
      },
      body: JSON.stringify({
        email: profile!.email,
        ticketCode: profile!.ticketCode,
        seats: body.ids,
      }),
    });

    // TODO: handle email response

    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "An unknown error occured" }, { status: 500 });
  }
}
