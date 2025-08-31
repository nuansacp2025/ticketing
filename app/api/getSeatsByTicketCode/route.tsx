import { NextResponse } from "next/server";
import { getSeatsByTicketCode } from "@/lib/db";
import { ApiError } from "@/lib/error";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const ticketCode = url.searchParams.get("ticketCode");
        if (!ticketCode) {
            throw new ApiError("Missing ticketCode parameter", 400);
        }
        const seats = await getSeatsByTicketCode(ticketCode);
        return NextResponse.json({ seats: seats }, { status: 200 });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: "An unknown error occured" }, { status: 500 });
    }
}