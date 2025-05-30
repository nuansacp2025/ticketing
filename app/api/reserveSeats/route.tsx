import { NextResponse, NextRequest } from "next/server";
import { setSeatsReserved } from "@/lib/protected";
import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function POST(request: NextRequest) {
  try {
      const token = (await cookies()).get("token")?.value;

      if (!token) {
          throw new UnauthorizedError();
      }
    const body = await request.json();

    await setSeatsReserved(body.ids, body.ticketIds);
    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "An unknown error occured" }, { status: 500 });
  }
}
