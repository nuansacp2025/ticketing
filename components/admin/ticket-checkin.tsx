import { Seat } from '@/lib/db';
import React, { useState } from 'react';

export const TicketCheckIn = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [checkedInTicketCode, setCheckedInTicketCode] = useState<string | null>(null);
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
        body: JSON.stringify({ ticketCode }),
      });
      const payload = await res.json();
  
      if (res.ok) {
        setCheckedInTicketCode(ticketCode);
        setStatusMessage(`✅ Ticket ${ticketCode} checked in`);
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
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '1.5rem', backgroundColor: '#002a10', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', color: '#e6f2e6', fontFamily: 'Segoe UI, sans-serif' }}>

      {/* Header */}
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
        🎫 Ticket Check-In
      </h3>

      {/* Input Form */}
      <form onSubmit={handleCheckIn} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Ticket Code"
          value={ticketCode}
          onChange={e => setTicketCode(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 6,
            border: '2px solid #006400',
            backgroundColor: '#013220',
            color: '#e6f2e6',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 6,
            backgroundColor: '#006400',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#338a3e')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#006400')}
        >
          Check In
        </button>
      </form>

      {/* Status Message */}
      {statusMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: 6,
          backgroundColor: 'rgba(102, 187, 106, 0.2)',
          color: '#66bb6a',
          textAlign: 'center',
          marginBottom: '1rem',
          fontWeight: 500
        }}>
          {statusMessage}
        </div>
      )}

      {/* Seats Display */}
      {relatedSeats.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1.1rem', textAlign: 'center' }}>
            Seats for Ticket {checkedInTicketCode}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
            {relatedSeats.map(seat => (
              <div
                key={seat.id}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#004b23',
                  borderRadius: 4,
                  textAlign: 'center',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}
              >
                {seat.label} ({seat.level})
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
