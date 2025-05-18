import { getCustomerByTicketId, getSeats, getTicket, setTicketCheckedIn } from "./db";

export interface Profile {
    email: string,
    ticketCode: string,
    ticketCategory: string,
    seatConfirmed: boolean,
    seatIds: string[],
}

export async function getMyProfile(ticketId: string): Promise<Profile | null> {
    const customer = await getCustomerByTicketId(ticketId);
    const ticket = await getTicket(ticketId);
    if (customer === null || ticket === null) return null;
    console.log("test 1")
    const mySeats = Array.from((await getSeats()).entries())
        .filter(([id, seat], _) => seat.reservedBy === ticketId)
        .map(([id, seat], _) => seat.id);
    console.log("test 2")
    return {
        email: customer.email,
        ticketCode: ticket.code,
        ticketCategory: ticket.category,
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