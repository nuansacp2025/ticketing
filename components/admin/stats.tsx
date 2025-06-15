import { Customer, Seat, Ticket } from '@/lib/db';
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface StatsProps {
  customers: Record<string, Customer>;
  tickets:   Record<string, Ticket>;
  seats:     Record<string, Seat>;
}

// Palette: main green & neutral gray
const COLORS = ['#66BB6A', '#EEEEEE', '#FFA500', '#42A5F5'];

export const Stats: React.FC<StatsProps> = ({ customers, tickets, seats }) => {
    const ticketMap = new Map<string, Ticket>(Object.entries(tickets).map(([id, ticket]) => [id, ticket]));
    const totalCustomers = Object.keys(customers).length;
    const confirmedCustomers = Object.values(customers).filter(c =>
        c.ticketIds.every(id => ticketMap.get(id)?.seatConfirmed)
    ).length;

    const totalTickets = Object.keys(tickets).length;
    const unconfirmedTickets = Object.values(tickets).filter(t => !t.seatConfirmed).length;
    const checkedInTickets = Object.values(tickets).filter(t => t.checkedIn).length;

    const totalSeats = Object.keys(seats).length;
    const notSelectableSeats = Object.values(seats).filter(s => s.notSelectable === true).length;
    const reservedSeats = Object.values(seats).filter(s => !s.isAvailable).length;

    const catASeats = Object.values(seats).filter(s => s.category === 'catA').length;
    const catBSeats = Object.values(seats).filter(s => s.category === 'catB').length;
    const catCSeats = Object.values(seats).filter(s => s.category === 'catC').length;

    const catAPurchasedSeats = Object.values(tickets).map(t => t.catA).reduce((sum, value) => sum + (value || 0), 0);
    const catANotSelectableSeats = Object.values(seats).filter(s => s.category === 'catA' && s.notSelectable === true).length;
    const catAReservedSeats = Object.values(seats).filter(s => s.category === 'catA' && !s.isAvailable).length;
    const catAAvailableSeats = Object.values(seats).filter(s => s.category === 'catA' && s.isAvailable).length;

    const catBPurchasedSeats = Object.values(tickets).map(t => t.catB).reduce((sum, value) => sum + (value || 0), 0);
    const catBNotSelectableSeats = Object.values(seats).filter(s => s.category === 'catB' && s.notSelectable === true).length;
    const catBReservedSeats = Object.values(seats).filter(s => s.category === 'catB' && !s.isAvailable).length;
    const catBAvailableSeats = Object.values(seats).filter(s => s.category === 'catB' && s.isAvailable).length;

    const catCPurchasedSeats = Object.values(tickets).map(t => t.catC).reduce((sum, value) => sum + (value || 0), 0);
    const catCNotSelectableSeats = Object.values(seats).filter(s => s.category === 'catC' && s.notSelectable === true).length;
    const catCReservedSeats = Object.values(seats).filter(s => s.category === 'catC' && !s.isAvailable).length;
    const catCAvailableSeats = Object.values(seats).filter(s => s.category === 'catC' && s.isAvailable).length;

    const makeData = (data: number[], titles: string[], colors: string[]) => data.map((value, index) => ({
        name: `${titles[index]} (${value})`,
        value: value,
        color: colors[index % colors.length],
    }));

    // Styles
    const grid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(300px, 1fr))',
        gap: 24,
    } as React.CSSProperties;
    const card = {
        background: '#004b23',
        color: '#e6f2e6',
        borderRadius: 8,
        padding: 16,
        textAlign: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    } as React.CSSProperties;
    const title = {
        margin: '0 0 8px',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    } as React.CSSProperties;
    const bigNumber = {
        margin: 0,
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1,
    } as React.CSSProperties;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {/* Totals */}
        <div style={grid}>
            {[
            { label: 'Customers', value: totalCustomers },
            { label: 'Tickets',   value: totalTickets },
            { label: 'Seats',     value: totalSeats },
            ].map(({ label, value }) => (
            <div key={label} style={card}>
                <h3 style={title}>{label}</h3>
                <p style={bigNumber}>{value}</p>
            </div>
            ))}
        </div>

        {/* Charts */}
        <div style={grid}>
            {[
            {
                key: 'customers',
                label: 'Customers Status',
                data: makeData([totalCustomers - confirmedCustomers, confirmedCustomers], ['Unconfirmed', 'Confirmed'], COLORS),
            },
            {
                key: 'tickets',
                label: 'Tickets Status',
                data: makeData([unconfirmedTickets, totalTickets - unconfirmedTickets - checkedInTickets, checkedInTickets], ['Unconfirmed', 'Not Checked In', 'Checked In'], COLORS),
            },
            {
                key: 'seats',
                label: 'Seats Status',
                data: makeData([totalSeats - reservedSeats - notSelectableSeats, reservedSeats, notSelectableSeats], ['Available', 'Reserved', 'Not Selectable'], COLORS),
            },
            {
                key: 'seatsCategories',
                label: 'Seats Categories',
                data: makeData([catASeats, catBSeats, catCSeats], ['Category A', 'Category B', 'Category C'], COLORS),
            },
            {
                key: 'seatsCategoryA',
                label: 'Category A Seats',
                data: makeData([catAAvailableSeats, catAReservedSeats, catANotSelectableSeats, catAPurchasedSeats - catAReservedSeats], ['Available', 'Reserved', 'Not Selectable', `Purchased not Reserved`], COLORS),
            },
            {
                key: 'seatsCategoryB',
                label: 'Category B Seats',
                data: makeData([catBAvailableSeats, catBReservedSeats, catBNotSelectableSeats, catBPurchasedSeats - catBReservedSeats], ['Available', 'Reserved', 'Not Selectable', 'Purchased not Reserved'], COLORS),
            },
            {
                key: 'seatsCategoryC',
                label: 'Category C Seats',
                data: makeData([catCAvailableSeats, catCReservedSeats, catCNotSelectableSeats, catCPurchasedSeats - catCReservedSeats], ['Available', 'Reserved', 'Not Selectable', `Purchased not Reserved`], COLORS),
            }
            ].map(({ key, label, data }) => {
                const totalValue = data.reduce((sum, d) => sum + d.value, 0);
                const percent = data[0].value && totalValue
                    ? Math.round((data[0].value / totalValue) * 100)
                    : 0;

                return (
                    <div key={key} style={card}>
                    <h3 style={title}>{label}</h3>
                    <div style={{ width: '100%', height: 180, position: 'relative' }}>
                        <ResponsiveContainer>
                        <PieChart>
                            <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            labelLine={false}
                            label={false}
                            isAnimationActive={true}
                            >
                            {data.map((_, i) => (
                                <Cell key={
                                `cell-${i}`
                                } fill={data[i].color} />
                            ))}
                            </Pie>
                            <Tooltip
                            formatter={(v: number) => v}
                            contentStyle={{ backgroundColor: '#003218', borderRadius: 4 }}
                            itemStyle={{ color: '#fff' }}
                            />
                            <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            wrapperStyle={{ fontSize: '0.75rem', color: '#ccc' }}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                        {/* Centered Label
                        <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#fff',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                        }}
                        >
                        {percent}%
                        </div> */}
                    </div>
                    </div>
                );
            })}
        </div>
        </div>
    );
};
