import { getCustomerByTicketId, getSeats, getTicket, setTicketCheckedIn } from "./db";

export interface Profile {
    email: string,
    ticketCode: string,
    catA: Number,
    catB: Number,
    catC: Number,
    seatConfirmed: boolean,
    seatIds: string[],
}

export async function getMyProfile(ticketId: string): Promise<Profile | null> {
    const customer = await getCustomerByTicketId(ticketId);
    if (customer == null || customer == undefined) {
        throw new Error("TicketId Not Found");
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
        throw new Error("Ticket not found");
    }
    if (ticket?.checkedIn) {
        throw new Error("Ticket already Checked In");
    }
    await setTicketCheckedIn(ticketId);
}