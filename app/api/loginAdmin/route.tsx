import { NextResponse, NextRequest } from "next/server";
import { loginAdmin } from "@/lib/auth";
import { adminApp, getAuth } from "@/db/admin";
import { verifyAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();
    if (email === undefined || password === undefined) {
        return NextResponse.json({ error: "Fields `email` and `password` required" }, { status: 400 });
    }
    const { status, token, uid, message } = await loginAdmin(email, password);
    if (status) {
      await getAuth(adminApp).setCustomUserClaims(uid ?? "", { admin: true });

      const response = NextResponse.json({ success: true }); // no redirect here
      response.cookies.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // use true in prod
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
      });  

      return response;
    } else {
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
        return NextResponse.json({ loggedIn: false }, { status: 401 });
    }
    try {
        const decoded = await verifyAdmin(token);
        if (!decoded.admin) throw new Error("Not an admin");
        return NextResponse.json({ loggedIn: true, uid: decoded.uid });
    } catch (e) {
      return NextResponse.json({ loggedIn: false }, { status: 401 });
    }
  }