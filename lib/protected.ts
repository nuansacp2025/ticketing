import { getCustomerByTicketId, getSeats, getSeatsQuery, getTicket, getTicketByCode, Seat, SeatMetadata } from "./db";
import {
    doc,
    updateDoc,
    runTransaction,
    Timestamp,
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

export async function updateCheckedInStatus(ticketCode: string, seatIds: string[]): Promise<Record<string, Seat>> {
    const ticket = await getTicketByCode(ticketCode);
    if (ticket == null) {
        throw new NotFoundError("Ticket not found");
    }
    // if (ticket?.checkedIn) {
    //     throw new ConflictError("Ticket already checked In");
    // }
    if (!ticket?.seatConfirmed) {
        throw new BadRequestError("Seat need to be confirmed first");
    }

    await setSeatsCheckedIn(seatIds, ticket.id);

    const seats = await getSeatsQuery({ reservedBy: ticket.id });

    // const ticketRef = doc(db, "tickets", ticket.id);
    // await updateDoc(ticketRef, { checkedIn: true, lastUpdated: Timestamp.now() });

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
export async function setSeatsCheckedIn(ids: string[], ticketId: string) {
  await runTransaction(db, async (transaction) => {
    const seatRefs = ids.map(id => doc(db, "seats", id));
    for (let i = 0; i < ids.length; i++) {
      const seatRef = seatRefs[i];
      const seatDoc = await transaction.get(seatRef);
      if (!seatDoc.exists()) {
        throw new NotFoundError(`Seat ${ids[i]} does not exist`);
      }
      const seatData = seatDoc.data();
      if (seatData.reservedBy !== ticketId) {
        throw new ConflictError(`Seat ${ids[i]} is not reserved by this ticket`);
      }
    }
    const checkedinCache = doc(db, "caches", "seats.checkedIn");
    const checkedinSnap = await transaction.get(checkedinCache);
    const checkedinData = checkedinSnap.data() || {};  // assumes the doc exists, we just put {} for better type inference
    for (let i = 0; i < ids.length; i++) {
      if (checkedinData[ids[i]] === true) {
        throw new ConflictError(`Seat ${ids[i]} is already checked in`);
      }
    }
    await transaction.update(checkedinCache, Object.fromEntries(ids.map(id => [id, true])));
  });
}

export async function setSeatsReserved(ids: string[], ticketId: string) {
  await runTransaction(db, async (transaction) => {
    const ticketRef = doc(db, "tickets", ticketId);
    const ticketDoc = await transaction.get(ticketRef);
    if (!ticketDoc.exists()) {
      throw new NotFoundError("Ticket not found");
    }
    const ticketData = ticketDoc.data();
    if (ticketData.seatConfirmed) {
      throw new ConflictError("Seats are already confirmed");
    }

    const fetchedSeats: { [key: string]: SeatMetadata } = {};
    const seatRefs = ids.map(id => doc(db, "seats", id));
    const counts: { [key: string]: number } = {
      catA: 0,
      catB: 0,
      catC: 0,
    };
    for (let i = 0; i < ids.length; i++) {
      const seatRef = seatRefs[i];
      const seatDoc = await transaction.get(seatRef);
      if (!seatDoc.exists()) {
        throw new NotFoundError(`Seat ${ids[i]} does not exist`);
      }
      const seatData = seatDoc.data();
      fetchedSeats[ids[i]] = seatData as SeatMetadata;
      if (seatData.isAvailable == false && seatData.reservedBy != ticketId) {
        throw new ConflictError(`Seat ${ids[i]} is not available`);
      } else if (seatData.isAvailable) {
        counts[seatData.category]++;
      }
    }

    // Normally this should be empty as user has no way to reserve more than once.
    // But we check this in case a ticket is partially filled by an admin in the database.
    const existingReservedSeatsSnap = await getSeatsQuery({ reservedBy: ticketId });
    for (const seat of Object.values(existingReservedSeatsSnap)) {
      counts[seat.category]++;
    }

    const currentCatA = ticketData.catA ?? 0;
    const currentCatB = ticketData.catB ?? 0;
    const currentCatC = ticketData.catC ?? 0;

    if (currentCatA !== counts.catA || currentCatB !== counts.catB || currentCatC !== counts.catC) {
      throw new ConflictError(`Ticket category counts do not match actual reserved seats (expected: { catA: ${currentCatA}, catB: ${currentCatB}, catC: ${currentCatC} })`);
    }

    const isAvailableCache = doc(db, "caches", "seats.isAvailable");
    const isAvailableSnap = await transaction.get(isAvailableCache);
    const isAvailableData = isAvailableSnap.data() || {};  // assumes the doc exists, we just put {} for better type inference
    for (let i = 0; i < ids.length; i++) {
      isAvailableData[ids[i]] = false;
    }

    // Check if the nearby seats become isolated
    for (let i = 0; i < ids.length; i++) {
      const seat = fetchedSeats[ids[i]];
      if (seat.leftId) {
        if (!(seat.leftId in fetchedSeats)) {
          const seatDoc = await transaction.get(doc(db, "seats", seat.leftId));
          if (!seatDoc.exists()) {
            throw new NotFoundError(`Left seat ${seat.leftId} does not exist`);
          }
          const leftSeatData = seatDoc.data() as SeatMetadata;
          fetchedSeats[seat.leftId] = leftSeatData;
        }
        const leftSeat = fetchedSeats[seat.leftId];
        if (isAvailableData[seat.leftId] && (!leftSeat.leftId || !isAvailableData[leftSeat.leftId]) && (!leftSeat.rightId || !isAvailableData[leftSeat.rightId])) {
          throw new ConflictError(`Seat ${seat.leftId} will be isolated if the reservation is made`);
        }
      }
      if (seat.rightId) {
        if (!(seat.rightId in fetchedSeats)) {
          const seatDoc = await transaction.get(doc(db, "seats", seat.rightId));
          if (!seatDoc.exists()) {
            throw new NotFoundError(`Right seat ${seat.rightId} does not exist`);
          }
          const rightSeatData = seatDoc.data() as SeatMetadata;
          fetchedSeats[seat.rightId] = rightSeatData;
        }
        const rightSeat = fetchedSeats[seat.rightId];
        if (isAvailableData[seat.rightId] && (!rightSeat.leftId || !isAvailableData[rightSeat.leftId]) && (!rightSeat.rightId || !isAvailableData[rightSeat.rightId])) {
          throw new ConflictError(`Seat ${seat.rightId} will be isolated if the reservation is made`);
        }
      }
    }


    for (let i = 0; i < ids.length; i++) {
      await transaction.update(seatRefs[i], { isAvailable: false, reservedBy: ticketId, lastUpdated: Timestamp.now() });
    }
    await transaction.update(isAvailableCache, Object.fromEntries(ids.map(id => [id, false])));
    await transaction.update(ticketRef, { seatConfirmed: true, confirmedAt: Timestamp.now(), lastUpdated: Timestamp.now() });
  });
}
