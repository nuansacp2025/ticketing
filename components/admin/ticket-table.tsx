import React, { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  GridOptions,
  ColDef,
  GridReadyEvent,
  GridApi,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';
import { Ticket } from '@/lib/db';
import { useGridCopy } from '@/components/admin/use-grid-copy';

ModuleRegistry.registerModules([AllCommunityModule]);

export const TicketTable: React.FC<{ tickets: Record<string, Ticket> }> = ({ tickets }) => {
  const gridApi = useRef<GridApi | null>(null);
  const gridOnReady = (e: GridReadyEvent) => {
    gridApi.current = e.api;
    e.api.sizeColumnsToFit();
  };
  const handleKeyDown = useGridCopy(gridApi);

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
    <div className="w-full select-text" tabIndex={0} onKeyDown={handleKeyDown}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={Object.values(tickets)}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={gridOnReady}
        pagination={true}
        animateRows={true}
        enableCellTextSelection
      />
    </div>
  );
};
