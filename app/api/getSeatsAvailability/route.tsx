import { verify } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { getSeatsAvailability } from "@/lib/protected";
import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function GET(request: NextRequest) {
  try {
      const token = (await cookies()).get("token")?.value;

      if (!token) {
          throw new UnauthorizedError();
      }
    const _ = verify(token!);
    const seatsAvailability = await getSeatsAvailability();
    return NextResponse.json(JSON.stringify(Array.from(seatsAvailability.entries())), { status: 200 });
  } catch (error: any) {
    if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
}
