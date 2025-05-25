interface Customer {
    id: string;
    email: string;
    ticketIds: string[];
}

interface Ticket {
    id: string;
    code: string;
    category: string;
    seatConfirmed: boolean;
    checkedIn: boolean;
}

interface Seat {
    id: string;
    isAvailable: boolean;
    reservedBy: string | null;
}

