import { getCustomerByTicketId, getSeats, getTicket } from "./db";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    runTransaction
} from 'firebase/firestore';
import { db } from "@/db/source";
export interface Profile {
    email: string,
    ticketCode: string,
    catA: Number,
    catB: Number,
    catC: Number,
    seatConfirmed: boolean,
    seatIds: string[],
}

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = "HttpError";
    }

    static badRequest(message = "Bad Request") {
        return new HttpError(400, message);
    }

    static unauthorized(message = "Unauthorized") {
        return new HttpError(401, message);
    }

    static forbidden(message = "Forbidden") {
        return new HttpError(403, message);
    }

    static notFound(message = "Not Found") {
        return new HttpError(404, message);
    }

    static conflict(message = "Conflict") {
        return new HttpError(409, message);
    }

    static unprocessable(message = "Unprocessable Entity") {
        return new HttpError(422, message);
    }

    static internal(message = "Internal Server Error") {
        return new HttpError(500, message);
    }
}


export async function getMyProfile(ticketId: string): Promise<Profile | null> {
    const customer = await getCustomerByTicketId(ticketId);
    if (customer == null || customer == undefined) {
        throw HttpError.notFound("TicketId Not Found");
    }
    const ticket = await getTicket(ticketId);
    if (customer === null || ticket === null) return null;
    const mySeats = Array.from((await getSeats()).entries())
        .filter(([id, seat], _) => seat.reservedBy === ticketId)
        .map(([id, seat], _) => seat.id);
    return {
        email: customer.email,
        ticketCode: ticket.code,
        catA: ticket.catA,
        catB: ticket.catB,
        catC: ticket.catC,
        seatConfirmed: ticket.seatConfirmed,
        seatIds: mySeats,
    };
}

export async function updateCheckedInStatus(ticketId: string) {
    const ticket = await getTicket(ticketId);
    if (ticket == null) {
        throw HttpError.notFound("Ticket not found");
    }
    if (ticket?.checkedIn) {
        throw HttpError.conflict("Ticket already Checked In");
    }
    if (!ticket?.seatConfirmed) {
        throw HttpError.badRequest("Seat need to be confirmed first");
    }
    const ticketRef = doc(db, "tickets", ticketId);
    await updateDoc(ticketRef, { checkedIn: true });
}

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
        throw HttpError.notFound("Ticket(s) are not exist");
      }
      if (!seatDoc.exists() || (seatDoc.data().isAvailable == false && seatDoc.data().reservedBy != ticketId)) {
        throw HttpError.conflict("Seat(s) are not available");
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