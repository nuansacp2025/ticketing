import { verify } from "@/lib/auth";
import { getMyProfile } from "@/lib/protected";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function GET(request: NextRequest) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            throw new UnauthorizedError();
        }
        const { ticketId } = verify(token!);
        const profile = await getMyProfile(ticketId)!;
        return NextResponse.json(profile, { status: 200 });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
}