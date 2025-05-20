import { verify } from "@/lib/auth";
import { getMyProfile } from "@/lib/protected";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }
    try {
        const { ticketId } = verify(token!);
        const profile = await getMyProfile(ticketId)!;
        return NextResponse.json(profile, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}