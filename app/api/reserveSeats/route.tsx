import { NextResponse, NextRequest } from "next/server";
import { setSeatsReserved } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await setSeatsReserved(body.ids, body.ticketIds);
    return NextResponse.json({ status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
