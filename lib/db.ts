import { db } from "@/db/source";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from 'firebase/firestore';
  

export interface Customer {
    id: string,
    email: string,
    ticketIds: string[],
}

export interface Ticket {
    id: string,
    code: string,
    category: string,
    seatConfirmed: boolean,
}

export interface Seat {
    id: string,
    isAvailable: boolean,
    reservedBy: string,
}

export async function getCustomer(id: string): Promise<Customer | null> {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const customer: Customer = {
        id: docSnap.data().id,
        email: docSnap.data().email,
        ticketIds: docSnap.data().ticketIds
    };
    return customer;
}

export async function getCustomerByEmail(email: string) : Promise<Customer | null> {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const customer: Customer = {
        id: doc.data().id,
        email: doc.data().email,
        ticketIds: doc.data().ticketIds
    };
    return customer;
}

export async function getTicket(id: string): Promise<Ticket | null> {
    const ref = doc(db, "tickets", id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } as Ticket : null;
}
  
export async function getTicketByCode(code: string) {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const ticket: Ticket = {
        id: doc.data().id,
        code: doc.data().code,
        category: doc.data().category,
        seatConfirmed: doc.data().seatConfirmed,
    };
    return ticket;
}
  
export async function getSeats(): Promise<Seat[]> {
    const snap = await getDocs(collection(db, "seats"));
    if (snap.empty) return [];
    const seats: Seat[] = [];

    snap.forEach(docSnap => {
        const data = docSnap.data();
        seats.push({
            id: data.id,
            isAvailable: data.isAvailable,
            reservedBy: data.reservedBy ?? null
        });
    });

    return seats;
}
  
  