'use client';
import React, { useEffect, useState } from 'react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Stats } from '@/components/admin/stats';
import { CustomerTable } from '@/components/admin/customer-table';
import { JoinedTicketTable } from '@/components/admin/joined-ticket-table';
import { JoinedSeatTable } from '@/components/admin/joined-seat-table';
import { TicketCheckIn } from '@/components/admin/ticket-checkin';
import { Customer, Seat, Ticket } from '@/lib/db';

// register AG Grid community modules once
ModuleRegistry.registerModules([AllCommunityModule]);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Tab = 'CheckIn' | 'Customers' | 'Tickets' | 'Seats' | 'Statistics';
const tabs: Tab[] = ['CheckIn', 'Customers', 'Tickets', 'Seats', 'Statistics'];

export default function AdminPage() {
  // Authentication state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Data state
  const [activeTab, setActiveTab] = useState<Tab>('CheckIn');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  // Check if user is logged in
  useEffect(() => {
    fetch('/api/loginAdmin')
      .then(res => res.json())
      .then(data => setIsLoggedIn(data.loggedIn))
      .catch(err => console.error('Error checking login:', err));
  }, []);

  // Fetch data only when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/getAllCustomers')
      .then(res => res.json())
      .then((data: Record<string, Omit<Customer, 'id'>>) => setCustomers(Object.entries(data).map(([id, v]) => ({ id, ...v }))))
      .catch(console.error);
    fetch('/api/getAllTickets')
      .then(res => res.json())
      .then((data: Record<string, Omit<Ticket, 'id'>>) => setTickets(Object.entries(data).map(([id, v]) => ({ id, ...v }))))
      .catch(console.error);
    fetch('/api/getAllSeats')
      .then(res => res.json())
      .then((data: Record<string, Omit<Seat, 'id'>>) => setSeats(Object.entries(data).map(([id, v]) => ({ id, ...v }))))
      .catch(console.error);
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/loginAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        setError(null);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Login failed');
    }
  };

  // Not logged in: centered login card
  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#010a04',
      }}>
        <div style={{
          backgroundColor: '#013220',
          padding: '2rem',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          width: '100%',
          maxWidth: 360,
        }}>
          <h2 style={{ color: '#e6f2e6', textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 6, border: '2px solid #006400', backgroundColor: '#004b23', color: '#e6f2e6' }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 6, border: '2px solid #006400', backgroundColor: '#004b23', color: '#e6f2e6' }}
            />
            {error && <div style={{ color: '#f44336', textAlign: 'center' }}>{error}</div>}
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
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in: dashboard layout
  return (
    <div style={{ backgroundColor: '#010a04', minHeight: '100vh', padding: '2rem', color: '#e6f2e6' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🎛️ Admin Dashboard</h1>
      </header>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 6,
              backgroundColor: activeTab === tab ? '#006400' : 'transparent',
              border: activeTab === tab ? '2px solid #006400' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : '#a0a0a0',
              cursor: 'pointer',
            }}
          >
            {tab === 'CheckIn' ? 'Ticket Check-In' : tab}
          </button>
        ))}
      </nav>
      <main style={{ backgroundColor: '#013220', padding: '1.5rem', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        {activeTab === 'CheckIn' && <TicketCheckIn />}
        {activeTab === 'Customers' && <CustomerTable customers={customers} />}
        {activeTab === 'Tickets' && <JoinedTicketTable tickets={tickets} customers={customers} />}
        {activeTab === 'Seats' && <JoinedSeatTable tickets={tickets} customers={customers} seats={seats} />}
        {activeTab === 'Statistics' && <Stats customers={customers} tickets={tickets} seats={seats} />}
      </main>
    </div>
  );
}
