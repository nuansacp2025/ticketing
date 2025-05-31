interface Customer {
    id: string;
    email: string;
    ticketIds: string[];
}

interface Ticket {
    id: string;
    code: string;
    seatConfirmed: boolean;
    checkedIn: boolean;
    catA: number;
    catB: number;
    catC: number;
}

interface Seat {
    id: string;
    isAvailable: boolean;
    reservedBy: string | null;
}

