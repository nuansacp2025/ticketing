import { verify } from "@/lib/auth";
import { BASE_URL } from "@/lib/constants";
import { getMyProfile } from "@/lib/protected";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token");
        if (token === undefined) {
            throw new Error("Not logged in");
        }
        const { ticketId } = verify(token!.value);
        const profile = getMyProfile(ticketId)!;
        return NextResponse.json(profile, { status: 200 });
    } catch (error) {
        return NextResponse.redirect(new URL("/", BASE_URL));
    }
}