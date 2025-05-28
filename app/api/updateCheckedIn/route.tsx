import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { updateCheckedInStatus } from "@/lib/protected";

export async function POST(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await verifyAdmin(token);

        const body = await request.json(); 
        await updateCheckedInStatus(body.ticketId);
        return NextResponse.json({ status: 200, error: "" });
    } catch (error: any) {
        return NextResponse.json(error);
    }
}
