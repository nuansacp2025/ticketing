import { NextResponse, NextRequest } from "next/server";
import { getSeatsAvailability } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const seatsAvailability = await getSeatsAvailability();
    return NextResponse.json(JSON.stringify(Array.from(seatsAvailability.entries())), { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, }, {status: 400});
  }
