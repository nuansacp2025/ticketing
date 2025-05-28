import { verify } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { getSeatsAvailability } from "@/lib/protected";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
      return new Response("Unauthorized", { status: 401 });
  }
  try {
    const _ = verify(token!);
    const seatsAvailability = await getSeatsAvailability();
    return NextResponse.json(JSON.stringify(Array.from(seatsAvailability.entries())), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(error);
  }
}
