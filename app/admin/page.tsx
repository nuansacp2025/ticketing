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

// register AG Grid community modules once
ModuleRegistry.registerModules([AllCommunityModule]);

type Tab = 'Customers' | 'Tickets' | 'Seats' | 'Statistics';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const tabs: Tab[] = ['Customers', 'Tickets', 'Seats', 'Statistics'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Customers');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    fetch('/mock_data.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: {
        customers: Record<string, Omit<Customer, 'id'>>;
        tickets: Record<string, Omit<Ticket, 'id'>>;
        seats: Record<string, Omit<Seat, 'id'>>;
      }) => {
        const customersArray: Customer[] = Object.entries(data.customers).map(
          ([id, value]) => ({ id, ...value })
        );
        const ticketsArray: Ticket[] = Object.entries(data.tickets).map(
          ([id, value]) => ({ id, ...value })
        );
        const seatsArray: Seat[] = Object.entries(data.seats).map(
          ([id, value]) => ({ id, ...value })
        );

        setCustomers(customersArray);
        setTickets(ticketsArray);
        setSeats(seatsArray);
      })
      .catch(err => console.error('Error fetching data:', err));
  }, []);

  // styling objects
  const container = { background: '#010a04', padding: 24, minHeight: '100vh', color: '#e6f2e6' };
  const header = { fontSize: '2rem', marginBottom: 16, color: '#fff' };
  const tabsBar = { display: 'flex', gap: 12, marginBottom: 24 };
  const tabBtn = (active: boolean) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderRadius: 4,
    background: active ? '#006400' : 'transparent',
    border: active ? '1px solid #006400' : '1px solid transparent',
    color: active ? '#fff' : '#a0a0a0',
    fontWeight: active ? 600 : 400,
  });
  const section = { marginBottom: 32 };

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
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Customers' && (
        <div style={section}>
            <CustomerTable customers={customers} />
        </div>
      )}

      {activeTab === 'Tickets' && (
        <div style={section}>
          <JoinedTicketTable tickets={tickets} customers={customers} seats={seats} />
        </div>
      )}

      {activeTab === 'Seats' && (
        <div style={section}>
          <JoinedSeatTable tickets={tickets} customers={customers} seats={seats} />
        </div>
      )}

      {activeTab === 'Statistics' && (
        <Stats customers={customers} tickets={tickets} seats={seats} />
      )}
    </div>
  );
}
