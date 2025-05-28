import { NextResponse, NextRequest } from "next/server";
import { setSeatsReserved } from "@/lib/protected";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
      return new Response("Unauthorized", { status: 401 });
  }
  try {
    const body = await request.json();

    await setSeatsReserved(body.ids, body.ticketIds);
    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    return NextResponse.json(error);
  }
}
