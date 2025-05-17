import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  GridOptions,
  ColDef,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

export const TicketTable: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const gridOnReady = (e: any) => e.api.sizeColumnsToFit();

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
    { field: 'category', headerName: 'Category' },
    { field: 'seatConfirmed', headerName: 'Seat Confirmed' },
    { field: 'checkedIn', headerName: 'Checked In' },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={tickets}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={gridOnReady}
        pagination={true}
        animateRows={true}
      />
    </div>
  );
};
