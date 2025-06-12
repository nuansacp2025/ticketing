import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  GridOptions,
  ColDef,
  GridReadyEvent,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';
import { Ticket } from '@/lib/db';

ModuleRegistry.registerModules([AllCommunityModule]);

export const TicketTable: React.FC<{ tickets: Record<string, Ticket> }> = ({ tickets }) => {
  const gridOnReady = (e: GridReadyEvent) => e.api.sizeColumnsToFit();

  const defaultColDef: GridOptions['defaultColDef'] = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  };

  
  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'Ticket ID' },
    { field: 'code', headerName: 'Code' },
    { field: 'seatConfirmed', headerName: 'Seat Confirmed' },
    { field: 'checkedIn', headerName: 'Checked In' },
    { field: 'catA', headerName: 'Category A' },
    { field: 'catB', headerName: 'Category B' },
    { field: 'catC', headerName: 'Category C' },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={Object.values(tickets)}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={gridOnReady}
        pagination={true}
        animateRows={true}
      />
    </div>
  );
};
