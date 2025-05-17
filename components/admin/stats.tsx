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
  customers: Customer[];
  tickets:   Ticket[];
  seats:     Seat[];
}

// Palette: main green & neutral gray
const COLORS = ['#66BB6A', '#EEEEEE'];

export const Stats: React.FC<StatsProps> = ({ customers, tickets, seats }) => {
    const totalCustomers = customers.length;
    const confirmedCustomers = customers.filter(c =>
        c.ticketIds.every(id => tickets.find(t => t.id === id)?.seatConfirmed)
    ).length;

    const totalTickets = tickets.length;
    const confirmedTickets = tickets.filter(t => t.seatConfirmed).length;

    const totalSeats = seats.length;
    const reservedSeats = seats.filter(s => !s.isAvailable).length;

    const makeData = (yes: number, total: number) => [
        { name: 'Confirmed', value: yes },
        { name: 'Unconfirmed', value: total - yes },
    ];

    // Styles
    const grid = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                label: 'Customers Confirmed',
                data: makeData(confirmedCustomers, totalCustomers),
            },
            {
                key: 'tickets',
                label: 'Tickets Confirmed',
                data: makeData(confirmedTickets, totalTickets),
            },
            {
                key: 'seats',
                label: 'Seats Reserved',
                data: makeData(reservedSeats, totalSeats),
            },
            ].map(({ key, label, data }) => {
            const percent = data[0].value && data.reduce((sum, d) => sum + d.value, 0)
                ? Math.round((data[0].value / data.reduce((sum, d) => sum + d.value, 0)) * 100)
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
                        isAnimationActive={false}
                        >
                        {data.map((_, i) => (
                            <Cell key={
                            `cell-${i}`
                            } fill={COLORS[i % COLORS.length]} />
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
                    {/* Centered Label */}
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
                    </div>
                </div>
                </div>
            );
            })}
        </div>
        </div>
    );
};
