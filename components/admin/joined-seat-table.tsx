import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

export const JoinedSeatTable: React.FC<{
  customers: Customer[];
  tickets: Ticket[];
  seats: Seat[];
}> = ({ customers, tickets, seats }) => {
    const gridApi = useRef<GridApi | null>(null);
    const gridOnReady = (e: GridReadyEvent) => {
      gridApi.current = e.api;
      e.api.sizeColumnsToFit();
    }

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

  const exportCsv = () => {
    if (gridApi.current) {
      gridApi.current.exportDataAsCsv({
        fileName: 'joined_seat_data.csv',
        columnKeys: ['seatId', 'available', 'reservedBy', 'ticketId', 'code', 'category', 'seatConfirmed', 'checkedIn', 'customerId'],
      });
    }
  }

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
      <button
        onClick={exportCsv}
        className={`
          mt-4
          px-4 py-2
          bg-gradient-to-br from-green-500 to-green-600
          text-white text-sm font-semibold
          rounded-lg
          shadow-md
          hover:-translate-y-1 hover:shadow-lg
          active:translate-y-0
          focus:outline-none

          /* custom “click” cursor on hover */
          cursor-pointer
          hover:cursor-pointer
        `}
      >
        Export CSV
      </button>
    </div>
  );
};
