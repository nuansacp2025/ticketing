import React, { useMemo } from 'react';
import { AgGridReact }      from 'ag-grid-react';
import { ModuleRegistry,
         AllCommunityModule,
         ColDef }           from 'ag-grid-community';
import { darkGreenTheme }    from '@/app/ag-grid-theme';

ModuleRegistry.registerModules([ AllCommunityModule ]);

export const JoinedTicketTable: React.FC<{
  customers: Customer[];
  tickets:   Ticket[];
  seats:     Seat[];
}> = ({ customers, tickets, seats }) => {
    const gridOnReady = (e: any) => e.api.sizeColumnsToFit();
    // Join tickets, customer, seat
    const rowData = useMemo(() => tickets.map(t => {
        const owner = customers.find(c => c.ticketIds.includes(t.id));
        const seat  = seats.find(s => s.reservedBy === t.id);
        
        return {
            ticketId:      t.id,
            code:          t.code,
            category:      t.category,
            seatConfirmed: t.seatConfirmed,
            checkedIn:     t.checkedIn,
            customerId:    owner?.id       ?? '',
            seatId:        seat?.id        ?? '',
            seatAvailable: seat?.isAvailable ?? null,
        };
    }), [tickets, customers, seats]);

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
