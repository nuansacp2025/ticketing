import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyAdmin } from "@/lib/auth";
import { getCustomers } from "@/lib/db";
import { ApiError, UnauthorizedError } from "@/lib/error";

export async function GET(request: NextRequest) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            throw new UnauthorizedError();
        }
        const decoded = await verifyAdmin(token);

        if (!decoded.admin) throw new Error("Not an admin");

        const customers = await getCustomers(); // Ensure it's awaited if async
        return NextResponse.json(customers, { status: 200 });
    } catch (error: any) {
        if(error instanceof ApiError) return NextResponse.json({ error: error.message }, { status: error.status });
        return NextResponse.json({ error: error.message }, { status: error.status });
    }
}
