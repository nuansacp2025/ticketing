import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { updateCheckedInStatus } from "@/lib/protected";
import { getSeatsQuery } from "@/lib/db";
import { ApiError } from "@/lib/error";

export async function POST(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await verifyAdmin(token);

        const body = await request.json(); 

        if (!decoded.admin) throw new Error("Not an admin");
        await updateCheckedInStatus(body.ticketId);
        const seats = await getSeatsQuery({ reservedBy: body.ticketId });
        return NextResponse.json({ status: 200, error: "", seats: seats });
    } catch (error: any) {
        if (error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
