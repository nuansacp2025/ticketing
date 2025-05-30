import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { updateCheckedInStatus } from "@/lib/protected";
import { getSeatsQuery } from "@/lib/db";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function POST(request: NextRequest) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            throw new UnauthorizedError();
        }
        const decoded = await verifyAdmin(token);

        const body = await request.json(); 
        await updateCheckedInStatus(body.ticketId);
        const seats = await getSeatsQuery({ reservedBy: body.ticketId });
        return NextResponse.json({ status: 200, error: "", seats: seats });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
}
