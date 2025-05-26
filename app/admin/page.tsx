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
      .then(data => {
        setIsLoggedIn(data.loggedIn);
      })
      .catch(err => console.error('Error checking login status:', err));
  }, []);

  // Fetch data only when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/getAllCustomers')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Record<string, Omit<Customer, 'id'>>) => {
        const customersArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setCustomers(customersArray);
      })
      .catch(err => console.error('Error fetching customers:', err));
    fetch('/api/getAllTickets')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Record<string, Omit<Ticket, 'id'>>) => {
        const ticketsArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setTickets(ticketsArray);
      })
      .catch(err => console.error('Error fetching tickets:', err));
    fetch('/api/getAllSeats')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: Record<string, Omit<Seat, 'id'>>) => {
        const seatsArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setSeats(seatsArray);
      })
      .catch(err => console.error('Error fetching seats:', err));
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/loginAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setError(null);
        } else {
          setError(data.error || 'Login failed');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed');
    }
  };

  // Styles
  const container = { background: '#010a04', padding: 24, minHeight: '100vh', color: '#e6f2e6' };
  const header = { fontSize: '2rem', marginBottom: 16, color: '#fff' };
  const tabsBar = { display: 'flex', gap: 12, marginBottom: 24 };
  const tabBtn = (active: boolean) => ({
    padding: '8px 16px', cursor: 'pointer', borderRadius: 4,
    background: active ? '#006400' : 'transparent',
    border: active ? '1px solid #006400' : '1px solid transparent',
    color: active ? '#fff' : '#a0a0a0', fontWeight: active ? 600 : 400,
  });
  const section = { marginBottom: 32 };

  // If not logged in, render login form
  if (!isLoggedIn) {
    return (
      <div style={{ ...container, maxWidth: 400, margin: '100px auto', border: '1px solid #006400', borderRadius: 8 }}>
        <h2 style={{ ...header, textAlign: 'center' }}>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #004b23' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #004b23' }}
          />
          {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
          <button type="submit" style={{ padding: '8px', borderRadius: 4, background: '#006400', color: '#fff', border: 'none' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={container}>
      <h1 style={header}>Admin Dashboard</h1>
      <div style={tabsBar}>
        {tabs.map(t => (
          <button
            key={t}
            style={tabBtn(t === activeTab)}
            onClick={() => setActiveTab(t)}
          >
            {t === 'CheckIn' ? 'Ticket Check-In' : t}
          </button>
        ))}
      </div>

      {activeTab === 'CheckIn' && (
        <div style={section}>
          <h2>Ticket Check-In</h2>
          <TicketCheckIn/>
        </div>
      )}

      {activeTab === 'Customers' && (
        <div style={section}>
          <CustomerTable customers={customers} />
        </div>
      )}

      {activeTab === 'Tickets' && (
        <div style={section}>
          <JoinedTicketTable tickets={tickets} customers={customers} />
        </div>
      )}

      {activeTab === 'Seats' && (
        <div style={section}>
          <JoinedSeatTable tickets={tickets} customers={customers} seats={seats} />
        </div>
      )}

      {activeTab === 'Statistics' && <Stats customers={customers} tickets={tickets} seats={seats} />}
    </div>
  );
}