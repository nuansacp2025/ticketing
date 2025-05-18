import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/constants";
import { loginAdmin } from "@/lib/auth";

export async function POST(request: Request) {
    const { email, password } = await request.json();
    if (email === undefined || password === undefined) {
        return NextResponse.json({ error: "Fields `email` and `ticketCode` required" }, { status: 400 });
    }
    const { status, token, message } = await loginAdmin(email, password);
    if (status) {
        const response = NextResponse.redirect(new URL("/profile", BASE_URL));
        response.cookies.set("token", token, { httpOnly: true, secure: true, sameSite: "strict" });
        return response;    
    } else {
        return NextResponse.json({ error: message }, { status: 400 });
    }
}