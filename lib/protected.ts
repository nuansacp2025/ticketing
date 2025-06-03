import { getCustomerByTicketId, getSeats, getSeatsQuery, getTicket, getTicketByCode, SeatMetadata } from "./db";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    runTransaction
} from 'firebase/firestore';
import { db } from "@/db/source";
import { BadRequestError, ConflictError, NotFoundError } from "./error";
export interface Profile {
    email: string,
    ticketCode: string,
    catA: number,
    catB: number,
    catC: number,
    seatConfirmed: boolean,
    seats: SeatMetadata[],
}


export async function getMyProfile(ticketId: string): Promise<Profile | null> {
    const customer = await getCustomerByTicketId(ticketId);
    if (customer == null) {
        throw new NotFoundError("TicketId Not Found");
    }
    const ticket = await getTicket(ticketId);
    if (customer === null || ticket === null) return null;
    const mySeats = Array.from((await getSeats()).entries())
        .filter(([id, seat], _) => seat.reservedBy === ticketId)
        .map(([id, seat], _) => seat as SeatMetadata);
    return {
        email: customer.email,
        ticketCode: ticket.code,
        catA: ticket.catA,
        catB: ticket.catB,
        catC: ticket.catC,
        seatConfirmed: ticket.seatConfirmed,
        seats: mySeats,
    };
}

export async function updateCheckedInStatus(ticketCode: string) {
    const ticket = await getTicketByCode(ticketCode);
    if (ticket == null) {
        throw new NotFoundError("Ticket not found");
    }
    if (ticket?.checkedIn) {
        throw new ConflictError("Ticket already checked In");
    }
    if (!ticket?.seatConfirmed) {
        throw new BadRequestError("Seat need to be confirmed first");
    }
    const seats = await getSeatsQuery({ reservedBy: ticket.id });

    const ticketRef = doc(db, "tickets", ticket.id);
    await updateDoc(ticketRef, { checkedIn: true });
    return seats;
}

/* Deprecated -- client should use the Firestore SDK for real-time updates

export async function getSeatsAvailability(): Promise<Map<String, boolean>> {
  const snap = await getDocs(collection(db, "seats"));
  let seatsAvailability = new Map<String, boolean>();
  if (snap.empty) return seatsAvailability;

  snap.forEach(docSnap => {
    const data = docSnap.data();
    seatsAvailability.set(docSnap.id, data.isAvailable);
  });
  console.log(seatsAvailability);
  return seatsAvailability;
}
*/

export async function setSeatsReserved(ids: string[], ticketId: string) {
  await runTransaction(db, async (transaction) => {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await getDoc(ticketRef);
    const counts: { [key: string]: number } = {
        A: 0,
        B: 0,
        C: 0,
    };
 
    for (let i = 0; i < ids.length; i++) {
      const seatRef = doc(db, "seats", ids[i]);
      const seatDoc = await getDoc(seatRef);
      if (!ticketDoc.exists()) {
        throw new NotFoundError("Ticket not found");
      }
      if (!seatDoc.exists() || (seatDoc.data().isAvailable == false && seatDoc.data().reservedBy != ticketId)) {
        throw new ConflictError("Seat(s) are not available");
      } else if (seatDoc.data().isAvailable) {
        counts[seatDoc.data().category]++;
      }
    }

    const currentCatA = ticketDoc.data()?.catA ?? 0;
    const currentCatB = ticketDoc.data()?.catB ?? 0;
    const currentCatC = ticketDoc.data()?.catC ?? 0;

    await updateDoc(ticketRef, {
        catA: currentCatA + counts["A"],
        catB: currentCatB + counts["B"],
        catC: currentCatC + counts["C"]
    });
    for (let i = 0; i < ids.length; i++) {
      const seatRef = doc(db, "seats", ids[i]);
      await updateDoc(seatRef, { isAvailable: false, reservedBy: ticketId});
    }
  });
}
