import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { getSeats } from "@/lib/db";

export async function GET(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await verifyAdmin(token);

        if (!decoded.admin) throw new Error("Not an admin");

        const seats = await getSeats(); // Ensure it's awaited if async
        return NextResponse.json(seats, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
