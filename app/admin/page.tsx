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
import { clearLocalStorage, updateData, useLocalStorage } from '@/app/local-storage';

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
  const [lastUpdated, setLastUpdated] = useLocalStorage('admin-lastCacheUpdate', '');
  const [activeTab, setActiveTab] = useLocalStorage<Tab>('admin-active-tab', 'CheckIn');
  const [customers, setCustomers] = useLocalStorage<Record<string, Customer>>('customers', {});
  const [tickets, setTickets] = useLocalStorage<Record<string, Ticket>>('tickets', {});
  const [seats, setSeats] = useLocalStorage<Record<string, Seat>>('seats', {});

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
    const getUpdatedCustomersUrl = new URL('/api/getUpdatedCustomers', window.location.origin);
    const getUpdatedTicketsUrl = new URL('/api/getUpdatedTickets', window.location.origin);
    const getUpdatedSeatsUrl = new URL('/api/getUpdatedSeats', window.location.origin);
    if (lastUpdated) {
      getUpdatedCustomersUrl.searchParams.set('since', lastUpdated);
      getUpdatedTicketsUrl.searchParams.set('since', lastUpdated);
      getUpdatedSeatsUrl.searchParams.set('since', lastUpdated);
    }

    let lastUpdatedCustomers = 0;
    let lastUpdatedTickets = 0;
    let lastUpdatedSeats = 0;

    Promise.all([
      fetch(getUpdatedCustomersUrl.toString())
        .then(res => res.json())
        .then((payload: { lastUpdated: string, customers: Record<string, Customer> }) => {
          setCustomers(updateData<Customer>(customers, payload.customers));
          lastUpdatedCustomers = new Date(payload.lastUpdated).getTime();
        })
        .catch(console.error),
      fetch(getUpdatedTicketsUrl.toString())
        .then(res => res.json())
        .then((payload: { lastUpdated: string, tickets: Record<string, Ticket> }) => {
          setTickets(updateData<Ticket>(tickets, payload.tickets));
          lastUpdatedTickets = new Date(payload.lastUpdated).getTime();
        })
        .catch(console.error),
      fetch(getUpdatedSeatsUrl.toString())
        .then(res => res.json())
        .then((payload: { lastUpdated: string, seats: Record<string, Seat> }) => {
          setSeats(updateData<Seat>(seats, payload.seats));
          lastUpdatedSeats = new Date(payload.lastUpdated).getTime();
        })
        .catch(console.error),
    ]).then(() => {
      // only keep the finite timestamps
      const allTimes = [
        lastUpdatedCustomers,
        lastUpdatedTickets,
        lastUpdatedSeats
      ].filter(ts => Number.isFinite(ts));

      // fall back to now if none are valid
      const maxTime = allTimes.length
        ? Math.max(...allTimes)
        : Date.now();

      setLastUpdated(new Date(maxTime).toISOString());
      setError(null);
    }).catch(err => {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    });
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

      <button
        onClick={clearLocalStorage}
        style={{
          padding: '0.5rem 1rem',
          background: 'transparent',
          border: '1px solid #e6f2e6',
          borderRadius: 4,
          color: '#e6f2e6',
          cursor: 'pointer',
          fontSize: '0.9rem',
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        ⚙️ Clear Storage
      </button>
    </div>
  );
}
