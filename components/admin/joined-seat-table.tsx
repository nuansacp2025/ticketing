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
import { Customer, Seat, Ticket } from '@/lib/db';
import { useGridCopy } from '@/components/admin/use-grid-copy';

ModuleRegistry.registerModules([AllCommunityModule]);

export const JoinedSeatTable: React.FC<{
  customers: Record<string, Customer>;
  tickets: Record<string, Ticket>;
  seats: Record<string, Seat>;
}> = ({ customers, tickets, seats }) => {
    const gridApi = useRef<GridApi | null>(null);
    const gridOnReady = (e: GridReadyEvent) => {
      gridApi.current = e.api;
      e.api.sizeColumnsToFit();
    }
    const handleKeyDown = useGridCopy(gridApi);

    const rowData = useMemo(() =>
        Object.values(seats).map(s => {
            const ticket = s.reservedBy ? tickets[s.reservedBy] : undefined;
            const owner  = ticket
                ? Object.values(customers).find(c => c.ticketIds.includes(ticket.id))
                : undefined;

            return {
                seatId:      s.id,
                category:    s.category,
                available:   s.isAvailable,
                reservedBy:  s.reservedBy ?? '',
                ticketCode:  ticket?.code     ?? '',
                customerId:  owner?.id        ?? '',
                customerEmail: owner?.email   ?? '',
            };
        }), 
    [seats, tickets, customers]
  );
  
  // Define column definitions
  const columnDefs: ColDef[] = [
    { field: 'seatId',      headerName: 'Seat ID' },
    { field: 'category',    headerName: 'Category' },
    { field: 'available',   headerName: 'Available' },
    { field: 'reservedBy',  headerName: 'Reserved By (Ticket ID)' },
    { field: 'ticketCode',  headerName: 'Ticket Code' },
    { field: 'customerId',  headerName: 'Customer ID' },
    { field: 'customerEmail',  headerName: 'Customer Email' },
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
        columnKeys: ['seatId', 'category', 'available', 'reservedBy', 'ticketCode', 'customerId', 'customerEmail'],
      });
    }
  }

  return (
    <div className="w-full select-text" tabIndex={0} onKeyDown={handleKeyDown}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        animateRows={true}
        onGridReady={gridOnReady}
        enableCellTextSelection
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
