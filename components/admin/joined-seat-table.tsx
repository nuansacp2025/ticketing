import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

export const JoinedSeatTable: React.FC<{
  customers: Customer[];
  tickets: Ticket[];
  seats: Seat[];
}> = ({ customers, tickets, seats }) => {
    const gridOnReady = (e: GridReadyEvent) => e.api.sizeColumnsToFit();
    const rowData = useMemo(() =>
        seats.map(s => {
            const ticket = tickets.find(t => t.id === s.reservedBy);
            const owner  = ticket
                ? customers.find(c => c.ticketIds.includes(ticket.id))
                : undefined;

            return {
                seatId:      s.id,
                available:   s.isAvailable,
                reservedBy:  s.reservedBy ?? '',
                ticketId:    ticket?.id       ?? '',
                code:        ticket?.code     ?? '',
                category:    ticket?.category ?? '',
                seatConfirmed: ticket?.seatConfirmed ?? false,
                checkedIn:     ticket?.checkedIn   ?? false,
                customerId:  owner?.id        ?? '',
            };
        }), 
    [seats, tickets, customers]
  );
  
  // Define column definitions
  const columnDefs: ColDef[] = [
    { field: 'seatId',      headerName: 'Seat ID' },
    { field: 'available',   headerName: 'Available' },
    { field: 'reservedBy',  headerName: 'Reserved By' },
    { field: 'ticketId',    headerName: 'Ticket ID' },
    { field: 'code',        headerName: 'Code' },
    { field: 'category',    headerName: 'Category' },
    { field: 'seatConfirmed', headerName: 'Seat Confirmed' },
    { field: 'checkedIn',     headerName: 'Checked In' },
    { field: 'customerId',  headerName: 'Customer ID' },
  ];

  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
    resizable: true,
  };

  return (
    <div style={{ width: '100%' }}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        animateRows={true}
        onGridReady={gridOnReady}
      />
    </div>
  );
};
