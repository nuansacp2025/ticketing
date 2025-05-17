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

export const CustomerTable: React.FC<{ customers: Customer[] }> = ({ customers }) => {
  const gridOnReady = (e: any) => e.api.sizeColumnsToFit();

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
    </div>
  );
};
