import { verify } from "@/lib/auth";
import { getMyProfile } from "@/lib/protected";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token");
        if (token === undefined) {
            throw new Error("Not logged in");
        }
        const { ticketId } = verify(token!.value);
        const profile = await getMyProfile(ticketId)!;
        console.log("PROFILE", profile);
        return NextResponse.json(profile, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}