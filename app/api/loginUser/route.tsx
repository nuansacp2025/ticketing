import { login } from "@/lib/auth";
import { BASE_URL } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { email, ticketCode } = await request.json();
    if (email === undefined || ticketCode === undefined) {
        return NextResponse.json({ error: "Fields `email` and `ticketCode` required" }, { status: 400 });
    }
    const { status, token } = await login(email, ticketCode);
    if (status) {
        const response = NextResponse.json({ success: true });
        response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 });
        return response;
    } else {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
}