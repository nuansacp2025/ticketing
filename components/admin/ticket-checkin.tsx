import { Seat } from '@/lib/db';
import React, { useMemo, useState } from 'react';

export const TicketCheckIn = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [relatedSeats, setRelatedSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [loadingCheckIn, setLoadingCheckIn] = useState(false);

  const selectedCount = selectedSeatIds.size;

  const counts = useMemo(() => {
    const total = relatedSeats.length;
    console.log(relatedSeats);
    const checked = relatedSeats.filter(s => s.checkedIn).length;
    const remaining = total - checked;
    return { total, checked, remaining };
  }, [relatedSeats]);

  const handleCheckSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setRelatedSeats([]);
    setSelectedSeatIds(new Set());
    if (!ticketCode.trim()) {
      setStatusMessage('⚠️ Enter a ticket code first');
      return;
    }

    try {
      setLoadingSeats(true);
      const res = await fetch(`/api/getSeatsByTicketCode?ticketCode=${encodeURIComponent(ticketCode)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload = await res.json();

      if (res.ok) {
        const seats: Seat[] = Object.values(payload.seats || {});
        setRelatedSeats(seats);
        if (seats.length === 0) {
          setStatusMessage(`ℹ️ No seats reserved for ticket ${ticketCode}`);
        } else {
          setStatusMessage(`✅ Found ${seats.length} seat(s) for ticket ${ticketCode}`);
        }
      } else {
        setStatusMessage(payload.error || '❌ Failed to fetch seats');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('🌐 Network error — please retry');
    } finally {
      setLoadingSeats(false);
    }
  };

  const toggleSeat = (seatId: string) => {
    // Do not allow toggling already-checked-in seats
    const s = relatedSeats.find(x => x.id === seatId);
    if (!s || s.checkedIn) return;

    setSelectedSeatIds(prev => {
      const next = new Set(prev);
      next.has(seatId) ? next.delete(seatId) : next.add(seatId);
      return next;
    });
  };

  const handleCheckIn = async () => {
    setStatusMessage(null);

    // Only send seats that are not yet checked in
    const seatIds = Array.from(selectedSeatIds).filter(id => {
      const s = relatedSeats.find(x => x.id === id);
      return s && !s.checkedIn;
    });

    if (!ticketCode.trim()) {
      setStatusMessage('⚠️ Enter a ticket code first');
      return;
    }
    if (seatIds.length === 0) {
      setStatusMessage('⚠️ Select at least one remaining seat');
      return;
    }

    try {
      setLoadingCheckIn(true);
      const res = await fetch('/api/updateCheckedIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode, seatIds }),
      });
      const payload = await res.json();

      if (res.ok) {
        setStatusMessage(`✅ Ticket ${ticketCode}: checked in ${seatIds.length} seat(s)`);
        setRelatedSeats(Object.values(payload.seats || {}));
        setSelectedSeatIds(new Set());
      } else {
        switch (res.status) {
          case 404:
            setStatusMessage(payload.error || '❌ Ticket not found');
            break;
          case 409:
            setStatusMessage(payload.error || '⚠️ Already checked in');
            break;
          case 403:
            setStatusMessage(payload.error || '🚫 Forbidden');
            break;
          default:
            setStatusMessage(payload.error || '❌ Check-in failed');
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('🌐 Network error — please retry');
    } finally {
      setLoadingCheckIn(false);
    }
  };

  const selectAllRemaining = () => {
    const remain = relatedSeats.filter(s => !s.checkedIn).map(s => s.id);
    setSelectedSeatIds(new Set(remain));
  };

  const categories = useMemo(() => ['catA', 'catB', 'catC'], []);

  const seatBoxStyle = (selected: boolean, locked: boolean): React.CSSProperties => ({
    padding: '0.5rem',
    backgroundColor: locked ? '#223d2f' : (selected ? '#1b5e20' : '#004b23'),
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 700,
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    border: locked ? '2px dashed #7aa07e' : (selected ? '2px solid #66bb6a' : '2px solid transparent'),
    cursor: locked ? 'not-allowed' : 'pointer',
    userSelect: 'none',
    opacity: locked ? 0.7 : 1,
    position: 'relative',
    transition: 'transform 0.06s ease, background 0.15s ease, border 0.15s ease',
    transform: selected ? 'translateY(-1px)' : 'none',
  });

  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '1.5rem', backgroundColor: '#002a10', borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', color: '#e6f2e6', fontFamily: 'Segoe UI, sans-serif' }}>
      {/* Header */}
      <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
        🎫 Ticket Check-In
      </h3>

      {/* Input Form */}
      <form
        onSubmit={handleCheckSeats}
        style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '1rem' }}
        className="ticket-checkin-form"
      >
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
          disabled={loadingSeats}
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: 6,
            backgroundColor: loadingSeats ? '#355e3b' : '#006400',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            cursor: loadingSeats ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => !loadingSeats && (e.currentTarget.style.backgroundColor = '#338a3e')}
          onMouseLeave={e => !loadingSeats && (e.currentTarget.style.backgroundColor = '#006400')}
        >
          {loadingSeats ? 'Checking…' : 'Check Seats'}
        </button>
        <style jsx>{`
          @media (max-width: 600px) {
            .ticket-checkin-form { grid-template-columns: 1fr !important; }
          }
        `}</style>
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
          <h4 style={{ marginBottom: 4, fontSize: '1.1rem', textAlign: 'center' }}>
            Seats for Ticket {ticketCode}
          </h4>
          <p style={{ textAlign: 'center', marginTop: 0, marginBottom: '0.75rem', opacity: 0.9 }}>
            Total: <b>{counts.total}</b> • Checked-in: <b>{counts.checked}</b> • Remaining: <b>{counts.remaining}</b>
          </p>

          {['catA', 'catB', 'catC'].map(cat => {
            const catSeats = relatedSeats.filter(({ category }) => category === cat);
            if (catSeats.length === 0) return null;
            return (
              <React.Fragment key={cat}>
                <h2 style={{ marginBottom: '0.25rem' }}>
                  Category {cat.charAt(3)}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {catSeats.map(seat => {
                    const locked = !!seat.checkedIn;
                    const selected = selectedSeatIds.has(seat.id);
                    return (
                      <div
                        key={seat.id}
                        role="button"
                        aria-pressed={selected}
                        aria-disabled={locked}
                        onClick={() => toggleSeat(seat.id)}
                        style={seatBoxStyle(selected, locked)}
                        title={locked ? 'Already checked in' : (selected ? 'Click to deselect' : 'Click to select')}
                      >
                        <div style={{ fontSize: 14 }}>{seat.label}</div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>(level {seat.level})</div>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })}

          {/* Check-in actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={selectedCount === 0 || loadingCheckIn}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: 6,
                backgroundColor: selectedCount === 0 || loadingCheckIn ? '#355e3b' : '#0a7f2e',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                cursor: selectedCount === 0 || loadingCheckIn ? 'not-allowed' : 'pointer'
              }}
            >
              {loadingCheckIn ? 'Checking In…' : `Check In (${selectedCount})`}
            </button>

            <button
              type="button"
              onClick={() => setSelectedSeatIds(new Set())}
              disabled={selectedCount === 0 || loadingCheckIn}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 6,
                backgroundColor: '#003818',
                color: '#e6f2e6',
                border: '1px solid #1f5f3a',
                fontWeight: 600,
                cursor: selectedCount === 0 || loadingCheckIn ? 'not-allowed' : 'pointer'
              }}
            >
              Clear Selection
            </button>

            <button
              type="button"
              onClick={selectAllRemaining}
              disabled={counts.remaining === 0 || loadingCheckIn}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 6,
                backgroundColor: '#004b23',
                color: '#e6f2e6',
                border: '1px solid #1f5f3a',
                fontWeight: 600,
                cursor: counts.remaining === 0 || loadingCheckIn ? 'not-allowed' : 'pointer'
              }}
            >
              Select All Remaining
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
