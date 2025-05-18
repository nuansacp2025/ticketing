import { getCustomerByEmail, getTicketByCode } from './db';
import jwt from 'jsonwebtoken';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/db/source";
import { adminAuth } from "@/db/admin";

const SECRET_KEY = "your-secret-key"; // Replace with a secure key

function makeJWT(ticketId: string): string {
    return jwt.sign({ ticketId }, SECRET_KEY, { expiresIn: '1h' });
}

export async function login(email: string, ticketCode: string): Promise<{ status: boolean, token: string }> {
    const customer = await getCustomerByEmail(email);
    const ticket = await getTicketByCode(ticketCode);
    if (customer !== null && ticket !== null && customer.ticketIds.includes(ticket.id)) {
        const token = makeJWT(ticket.id);
        return { status: true, token };
    }
    return { status: false, token: "" };
}

export async function loginAdmin(email: string, password: string) {
    try {  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken(true);
      return { status: true, token: token, message: "Login Success" };
    } catch (error: any) {
        return { status: false, token: "", message: error.message};
    }
}
export function verify(token: string): { ticketId: string } {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { ticketId: string };
        return { ticketId: decoded.ticketId };
    } catch (error) {
        throw new Error("Invalid token");
    }
}


export async function verifyAdmin(token: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
}

