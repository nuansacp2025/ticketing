import React, { useMemo } from 'react';
import { AgGridReact }      from 'ag-grid-react';
import { ModuleRegistry,
         AllCommunityModule,
         ColDef, 
         GridReadyEvent}           from 'ag-grid-community';
import { darkGreenTheme }    from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([ AllCommunityModule ]);

export const JoinedTicketTable: React.FC<{
  customers: Customer[];
  tickets:   Ticket[];
}> = ({ customers, tickets }) => {
    const gridOnReady = (e: GridReadyEvent) => e.api.sizeColumnsToFit();
    // Join tickets, customer, seat
    const rowData = useMemo(() => tickets.map(t => {
        const owner = customers.find(c => c.ticketIds.includes(t.id));
        
        return {
            ticketId:      t.id,
            code:          t.code,
            category:      t.category,
            seatConfirmed: t.seatConfirmed,
            checkedIn:     t.checkedIn,
            customerId:    owner?.id       ?? '',
        };
    }), [tickets, customers]);

    // Define the grid column
    const columnDefs: ColDef[] = [
        { field: 'ticketId',      headerName: 'Ticket ID' },
        { field: 'code',          headerName: 'Code' },
        { field: 'category',      headerName: 'Category' },
        { field: 'seatConfirmed', headerName: 'Seat Confirmed' },
        { field: 'checkedIn',     headerName: 'Checked In' },
        { field: 'customerId',    headerName: 'Customer ID' },
        { field: 'seatId',        headerName: 'Seat ID' },
    ];

    const defaultColDef: ColDef = {
        flex: 1,
        minWidth: 120,
        resizable: true,
        sortable: true,
        filter: true,
    };

    return (
        <div style={{ width: '100%' }}>
        <AgGridReact
            theme={darkGreenTheme}
            domLayout="autoHeight"
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={gridOnReady}
            pagination={true}
            animateRows={true}
        />
        </div>
    );
};
