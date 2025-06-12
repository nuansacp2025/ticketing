import { db } from "@/db/source";
import { Timestamp } from "firebase-admin/firestore";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
} from 'firebase/firestore';
  
type QueryOperator = '==' | '>' | '<' | '>=' | '<=' | 'array-contains' | 'in' | 'array-contains-any';

export interface Customer {
    id: string,
    email: string,
    ticketIds: string[],
    lastUpdated?: Timestamp,  // last time this customer was updated
}

export interface Ticket {
    id: string,
    code: string,
    catA: number,
    catB: number,
    catC: number,
    seatConfirmed: boolean,
    checkedIn: boolean
    lastUpdated?: Timestamp,  // last time this ticket was updated
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
    leftId?: string | null,
    rightId?: string | null,
    lastUpdated?: Timestamp,  // last time this seat was updated
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
    leftId: string | null,
    rightId: string | null,
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

export async function getCustomersQuery(filters: {
    id?: string,
    idOperator?: QueryOperator,
    email?: string,
    emailOperator?: QueryOperator,
    ticketIds?: string[],
    ticketIdsOperator?: QueryOperator,
    lastUpdated?: Timestamp,
    lastUpdatedOperator?: QueryOperator
}): Promise<Record<string, Customer>> {
    const customersRef = collection(db, 'customers');
    let q = query(customersRef);

    if (filters.id) {
        const filtersIdOperator = filters.idOperator || '==';
        q = query(q, where('id', filtersIdOperator, filters.id));
    }
    if (filters.email) {
        const filtersEmailOperator = filters.emailOperator || '==';
        q = query(q, where('email', filtersEmailOperator, filters.email));
    }
    if (filters.ticketIds) {
        const filtersTicketIdsOperator = filters.ticketIdsOperator || 'array-contains-any';
        q = query(q, where('ticketIds', filtersTicketIdsOperator, filters.ticketIds));
    }
    if (filters.lastUpdated) {
        const filtersLastUpdatedOperator = filters.lastUpdatedOperator || '==';
        q = query(q, where('lastUpdated', filtersLastUpdatedOperator, filters.lastUpdated));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return {};

    const customers: Record<string, Customer> = {};
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        customers[docSnap.id] = {
            id: docSnap.id,
            email: data.email,
            ticketIds: data.ticketIds,
            lastUpdated: data.lastUpdated ?? null
        };
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

export async function getTicketsQuery(filters: {
    id?: string,
    idOperator?: QueryOperator,
    code?: string,
    codeOperator?: QueryOperator,
    catA?: number,
    catAOperator?: QueryOperator,
    catB?: number,
    catBOperator?: QueryOperator,
    catC?: number,
    catCOperator?: QueryOperator,
    seatConfirmed?: boolean,
    seatConfirmedOperator?: QueryOperator,
    checkedIn?: boolean,
    checkedInOperator?: QueryOperator
    lastUpdated?: Timestamp,
    lastUpdatedOperator?: QueryOperator
}): Promise<Record<string, Ticket>> {
    const ticketsRef = collection(db, 'tickets');
    let q = query(ticketsRef);

    if (filters.id) {
        const filtersIdOperator = filters.idOperator || '==';
        q = query(q, where('id', filtersIdOperator, filters.id));
    }
    if (filters.code) {
        const filtersCodeOperator = filters.codeOperator || '==';
        q = query(q, where('code', filtersCodeOperator, filters.code));
    }
    if (filters.catA !== undefined) {
        const filtersCatAOperator = filters.catAOperator || '==';
        q = query(q, where('catA', filtersCatAOperator, filters.catA));
    }
    if (filters.catB !== undefined) {
        const filtersCatBOperator = filters.catBOperator || '==';
        q = query(q, where('catB', filtersCatBOperator, filters.catB));
    }
    if (filters.catC !== undefined) {
        const filtersCatCOperator = filters.catCOperator || '==';
        q = query(q, where('catC', filtersCatCOperator, filters.catC));
    }
    if (filters.seatConfirmed !== undefined) {
        const filtersSeatConfirmedOperator = filters.seatConfirmedOperator || '==';
        q = query(q, where('seatConfirmed', filtersSeatConfirmedOperator, filters.seatConfirmed));
    }
    if (filters.checkedIn !== undefined) {
        const filtersCheckedInOperator = filters.checkedInOperator || '==';
        q = query(q, where('checkedIn', filtersCheckedInOperator, filters.checkedIn));
    }
    if (filters.lastUpdated) {
        const filtersLastUpdatedOperator = filters.lastUpdatedOperator || '==';
        q = query(q, where('lastUpdated', filtersLastUpdatedOperator, filters.lastUpdated));
    }

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return {};

    const tickets: Record<string, Ticket> = {};
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        tickets[docSnap.id] = {
            id: docSnap.id,
            code: data.code,
            catA: data.catA,
            catB: data.catB,
            catC: data.catC,
            seatConfirmed: data.seatConfirmed,
            checkedIn: data.checkedIn,
            lastUpdated: data.lastUpdated ?? null
        };
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
    idOperator?: QueryOperator,
    isAvailable?: boolean,
    isAvailableOperator?: QueryOperator,
    reservedBy?: string | null,
    reservedByOperator?: QueryOperator,
    category?: string
    categoryOperator?: QueryOperator
    lastUpdated?: Timestamp,
    lastUpdatedOperator?: QueryOperator
}): Promise<Record<string, Seat>> {
    const seatsRef = collection(db, 'seats');
    let q = query(seatsRef);

    if (filters.id) {
        const filtersIdOperator = filters.idOperator || '==';
        q = query(q, where('id', filtersIdOperator, filters.id));
    }
    if (filters.isAvailable !== undefined) {
        const filtersIsAvailableOperator = filters.isAvailableOperator || '==';
        q = query(q, where('isAvailable', filtersIsAvailableOperator, filters.isAvailable));
    }
    if (filters.reservedBy !== undefined) {
        const filtersReservedByOperator = filters.reservedByOperator || '==';
        q = query(q, where('reservedBy', filtersReservedByOperator, filters.reservedBy));
    }
    if (filters.category) {
        const filtersCategoryOperator = filters.categoryOperator || '==';
        q = query(q, where('category', filtersCategoryOperator, filters.category));
    }
    if (filters.lastUpdated) {
        const filtersLastUpdatedOperator = filters.lastUpdatedOperator || '==';
        q = query(q, where('lastUpdated', filtersLastUpdatedOperator, filters.lastUpdated));
    }

    const snapshot = await getDocs(q);
    if (snapshot.empty) return {};
    
    const seats: Record<string, Seat> = {};
    snapshot.forEach(docSnap => {
        const data = docSnap.data();
        seats[docSnap.id] = {
            id: docSnap.id,
            label: data.label,
            level: data.level,
            isAvailable: data.isAvailable,
            reservedBy: data.reservedBy ?? null,
            category: data.category,
            location: data.location,
            notSelectable: data.notSelectable ?? false,
            leftId: data.leftId ?? null,
            rightId: data.rightId ?? null,
            lastUpdated: data.lastUpdated ?? null
        };
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
            leftId: data.leftId ?? null,
            rightId: data.rightId ?? null,
        });
    });

    return seats;
}
