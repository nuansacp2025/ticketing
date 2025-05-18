import { signInWithEmailAndPassword } from "firebase/auth";
import { NextResponse } from "next/server";
import { auth } from "../../config";

export async function POST(req: Request) {
    try {
      const { email, password } = await req.json();
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      return NextResponse.json({ token });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
}