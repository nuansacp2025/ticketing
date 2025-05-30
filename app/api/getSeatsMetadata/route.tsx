import { NextResponse, NextRequest } from "next/server";
import { getSeatsMetadata } from "@/lib/db";
import { ApiError } from "@/lib/error";

export async function GET(request: NextRequest) {
    try {
        const seats = await getSeatsMetadata(); // Ensure it's awaited if async
        return NextResponse.json(seats, { status: 200 });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
}
