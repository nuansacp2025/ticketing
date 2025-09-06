'use client';
import React, { useState } from 'react';

export const CustomerCreate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [catA, setCatA] = useState(0);
  const [catB, setCatB] = useState(0);
  const [catC, setCatC] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch('/api/createCustomer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, catA, catB, catC }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Created ticket code: ${data.ticket.code}`);
        setEmail('');
        setCatA(0); setCatB(0); setCatC(0);
      } else {
        setStatus(data.error || 'Failed to create customer');
      }
    } catch {
      setStatus('Failed to create customer');
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '0.75rem',
    borderRadius: 6,
    border: '2px solid #006400',
    backgroundColor: '#004b23',
    color: '#e6f2e6'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 360 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        type="number"
        min="0"
        placeholder="CatA Tickets"
        value={catA}
        onChange={e => setCatA(parseInt(e.target.value) || 0)}
        style={inputStyle}
      />
      <input
        type="number"
        min="0"
        placeholder="CatB Tickets"
        value={catB}
        onChange={e => setCatB(parseInt(e.target.value) || 0)}
        style={inputStyle}
      />
      <input
        type="number"
        min="0"
        placeholder="CatC Tickets"
        value={catC}
        onChange={e => setCatC(parseInt(e.target.value) || 0)}
        style={inputStyle}
      />
      {status && <div>{status}</div>}
      <button
        type="submit"
        style={{
          padding: '0.75rem',
          backgroundColor: '#006400',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Create Customer
      </button>
    </form>
  );
};

export default CustomerCreate;
