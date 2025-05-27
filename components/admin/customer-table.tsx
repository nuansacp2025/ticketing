import React, { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  GridOptions,
  ColDef,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

export const CustomerTable: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const gridApi = useRef<GridApi | null>(null);
  const gridOnReady = (e: GridReadyEvent) => {
    gridApi.current = e.api;
    e.api.sizeColumnsToFit();
  }

  const defaultColDef: GridOptions['defaultColDef'] = {
    flex: 1,
    minWidth: 120,
    resizable: true,
    sortable: true,
    filter: true,
  };
  
  const columnDefs: ColDef[] = [
    { field: 'id', headerName: 'Customer ID' },
    { field: 'email', headerName: 'Email' },
    {
      headerName: 'Ticket Count',
      valueGetter: params => params.data.ticketIds.length,
    }
  ];

  const exportCsv = () => {
    if (gridApi.current) {
      gridApi.current.exportDataAsCsv({
        fileName: 'customer.csv',
        columnKeys: ['id', 'email', 'ticketIds'],
      });
    }
  }

  return (
    <div style={{ width: '100%' }}>
      <AgGridReact
        theme={darkGreenTheme}
        domLayout="autoHeight"
        rowData={customers}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onGridReady={gridOnReady}
        pagination={true}
        animateRows={true}
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

          cursor-pointer
          hover:cursor-pointer
        `}
      >
        Export CSV
      </button>
    </div>
  );
};
