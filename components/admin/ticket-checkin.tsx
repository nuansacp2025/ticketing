import React, { useState } from 'react';

interface Seat {
  id: string;
  isAvailable: boolean;
  reservedBy: string | null;
}
interface Ticket {
  id: string;
  code: string;
  category: string;
  seatConfirmed: boolean;
  checkedIn: boolean;
}

export const TicketCheckIn = () => {
  const [ticketId, setTicketId] = useState('');
  const [checkedInTicketId, setCheckedInTicketId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [relatedSeats, setRelatedSeats] = useState<Seat[]>([]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setRelatedSeats([]);
  
    try {
      const res = await fetch('/api/updateCheckedIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId }),
      });
      const payload = await res.json();
  
      if (res.ok) {
        setCheckedInTicketId(ticketId);
        setStatusMessage(`✅ Ticket ${ticketId} checked in`);
        setRelatedSeats(payload.seats);
      } else {
        switch (res.status) {
          case 404:
            setStatusMessage( payload.error || '❌ Ticket not found');
            break;
          case 409:
            setStatusMessage( payload.error || '⚠️ Already checked in');
            break;
          case 403:
            setStatusMessage( payload.error || '🚫 Forbidden');
            break;
          default:
            setStatusMessage( payload.error || '❌ Check-in failed');
        }
      }
    } catch (err: any) {
      // network / unexpected
      console.error(err);
      setStatusMessage('🌐 Network error — please retry');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Enter Ticket ID"
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #004b23' }}
        />
        <button
          type="submit"
          style={{ padding: '8px 16px', background: '#006400', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          Check In
        </button>
      </form>

      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 6,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#e6f2e6',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 500
        }}>
          {statusMessage}
        </div>
      )}

      {relatedSeats.length > 0 && (
        <div>
          <h4 style={{ color: '#e6f2e6', marginBottom: '0.5rem' }}>Seats for Ticket {checkedInTicketId}:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {relatedSeats.map(seat => (
              <span
                key={seat.id}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#006400',
                  borderRadius: 4,
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              >
                {seat.id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
