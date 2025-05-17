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

export const SeatTable: React.FC<{ seats: Seat[] }> = ({ seats }) => {
  const gridOnReady = (e: any) => e.api.sizeColumnsToFit();

  const defaultColDef: GridOptions['defaultColDef'] = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  };

  
  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'Seat ID' },
    { field: 'isAvailable', headerName: 'Available' },
    { field: 'reservedBy', headerName: 'Reserved By' },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={seats}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={gridOnReady}
        pagination={true}
        animateRows={true}
      />
    </div>
  );
};
