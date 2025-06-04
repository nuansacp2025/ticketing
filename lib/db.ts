import { db } from "@/db/source";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    runTransaction
} from 'firebase/firestore';
  

export interface Customer {
    id: string,
    email: string,
    ticketIds: string[],
}

export interface Ticket {
    id: string,
    code: string,
    catA: number,
    catB: number,
    catC: number,
    seatConfirmed: boolean,
    checkedIn: boolean
}

export interface Seat {
    id: string,
    label: string,
    level: string,  // "level-1"/"level-2"
    isAvailable: boolean,
    reservedBy: string | null,
    category: string,  // "catA"/"catB"/"catC"

    // Below is metadata; only needed for UI
    location?: {
        x: number,
        y: number,
        rot: number,
    }
    notSelectable?: boolean,  // by default Seat is ignored with this is true; use getSeatsMetadata otherwise
    leftId?: string,
    rightId?: string,
}

export interface SeatMetadata {
    id: string,
    label: string,
    level: string,
    category: string,
    location: {
        x: number,
        y: number,
        rot: number,
    }
    notSelectable: boolean,  // by default Seat is ignored with this is true; use getSeatsMetadata otherwise
    leftId: string,
    rightId: string,
}

export async function getCustomer(id: string): Promise<Customer | null> {
    const docRef = doc(db, 'customers', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const customer: Customer = {
        id: docSnap.id,
        email: docSnap.data().email,
        ticketIds: docSnap.data().ticketIds
    };
    return customer;
}

export async function getCustomers(): Promise<Customer[]> {
    const snap = await getDocs(collection(db, "customers"));
    if (snap.empty) return [];
    const customers: Customer[] = [];
    snap.forEach(docSnap => {
        const data = docSnap.data();
        customers.push({
            id: docSnap.id,
            email: data.email,
            ticketIds: data.ticketIds
        });
    });

    return customers;
}

export async function getCustomerByEmail(email: string) : Promise<Customer | null> {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const customer: Customer = {
        id: doc.id,
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

export async function getTickets(): Promise<Ticket[]> {
    const snap = await getDocs(collection(db, "tickets"));
    if (snap.empty) return [];
    const tickets: Ticket[] = [];
    snap.forEach(docSnap => {
        const data = docSnap.data();
        tickets.push({
            id: docSnap.id,
            code: data.code,
            catA: data.catA,
            catB: data.catB,
            catC: data.catC,
            seatConfirmed: data.seatConfirmed,
            checkedIn: data.checkedIn
        });
    });

    return tickets;
}

export async function getTicketByCode(code: string) {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('code', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const ticket: Ticket = {
        id: doc.id,
        code: doc.data().code,
        catA: doc.data().catA,
        catB: doc.data().catB,
        catC: doc.data().catC,
        seatConfirmed: doc.data().seatConfirmed,
        checkedIn: doc.data().checkedIn
    };
    return ticket;
}

export async function getCustomerByTicketId(ticketId: string): Promise<Customer | null> {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef, where('ticketIds', 'array-contains', ticketId));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const customer: Customer = {
        id: doc.id,
        email: doc.data().email,
        ticketIds: doc.data().ticketIds
    };
    return customer;
}

export async function getSeatsQuery(filters: {
    id?: string,
    isAvailable?: boolean,
    reservedBy?: string | null,
    category?: string
}): Promise<Seat[]> {
    const seatsRef = collection(db, 'seats');
    let q = query(seatsRef);

    if (filters.id) {
        q = query(q, where('id', '==', filters.id));
    }
    if (filters.isAvailable !== undefined) {
        q = query(q, where('isAvailable', '==', filters.isAvailable));
    }
    if (filters.reservedBy !== undefined) {
        q = query(q, where('reservedBy', '==', filters.reservedBy));
    }
    if (filters.category) {
        q = query(q, where('category', '==', filters.category));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    
    const seats: Seat[] = [];
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.notSelectable) return;
        seats.push({
            id: docSnap.id,
            label: data.label,
            level: data.level,
            isAvailable: data.isAvailable,
            reservedBy: data.reservedBy ?? null,
            category: data.category
        });
    });
    return seats;
}

  
export async function getSeats(): Promise<Seat[]> {
    const snap = await getDocs(collection(db, "seats"));
    if (snap.empty) return [];
    const seats: Seat[] = [];

    snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.notSelectable) return;
        seats.push({
            id: docSnap.id,
            label: data.label,
            level: data.level,
            isAvailable: data.isAvailable,
            reservedBy: data.reservedBy ?? null,
            category: data.category
        });
    });

    return seats;
}

export async function getSeatsMetadata(): Promise<SeatMetadata[]> {
    const snap = await getDocs(collection(db, "seats"));
    if (snap.empty) return [];
    const seats: SeatMetadata[] = [];

    snap.forEach(docSnap => {
        const data = docSnap.data();
        seats.push({
            id: docSnap.id,
            label: data.label,
            level: data.level,
            category: data.category,
            location: data.location,
            notSelectable: data.notSelectable,
            leftId: data.leftId,
            rightId: data.rightId,
        });
    });

    return seats;
}

export async function getSeatsByTicketId(ticketId: string): Promise<Seat[]> {
    const seatsRef = collection(db, 'seats');
    const q = query(seatsRef, where('reservedBy', '==', ticketId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    const seats: Seat[] = [];
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.notSelectable) return; // ignore non-selectable seats
        seats.push({
            id: docSnap.id,
            label: data.label,
            level: data.level,
            isAvailable: data.isAvailable,
            reservedBy: data.reservedBy ?? null,
            category: data.category,
        });
    });

    return seats;
}
