import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { getTickets } from "@/lib/db";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function GET(request: NextRequest) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            throw new UnauthorizedError();
        }
        const decoded = await verifyAdmin(token);

        const tickets = await getTickets(); // Ensure it's awaited if async
        return NextResponse.json(tickets, { status: 200 });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: "An unknown error occured" }, { status: 500 });
    }
}
