import React, { useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { 
    ModuleRegistry,
    AllCommunityModule,
    ColDef,
    GridApi,
    GridReadyEvent
} from 'ag-grid-community';
import { darkGreenTheme } from '@/app/ag-grid-theme';
import { Customer, Ticket } from '@/lib/db';

ModuleRegistry.registerModules([ AllCommunityModule ]);

export const JoinedTicketTable: React.FC<{
  customers: Record<string, Customer>;
  tickets:   Record<string, Ticket>;
}> = ({ customers, tickets }) => {
    const gridApi = useRef<GridApi | null>(null);
    const gridOnReady = (e: GridReadyEvent) => {
        gridApi.current = e.api;
        e.api.sizeColumnsToFit();
    }
    // Join tickets, customer, seat
    const rowData = useMemo(() => Object.values(tickets).map(t => {
        const owner = Object.entries(customers).find(([_, c]) => c.ticketIds.includes(t.id))?.[1];
        
        return {
            ticketId:      t.id,
            code:          t.code,
            seatConfirmed: t.seatConfirmed,
            checkedIn:     t.checkedIn,
            customerId:    owner?.id       ?? '',
            customerEmail: owner?.email    ?? '',
            catA:          t.catA,
            catB:          t.catB,
            catC:          t.catC,
        };
    }), [tickets, customers]);

    // Define the grid column
    const columnDefs: ColDef[] = [
        { field: 'ticketId',      headerName: 'Ticket ID' },
        { field: 'code',          headerName: 'Code' },
        { field: 'seatConfirmed', headerName: 'Seat Confirmed' },
        { field: 'checkedIn',     headerName: 'Checked In' },
        { field: 'customerId',    headerName: 'Customer ID' },
        { field: 'customerEmail', headerName: 'Customer Email' },
        { field: 'catA',          headerName: 'Cat. A' },
        { field: 'catB',          headerName: 'Cat. B' },
        { field: 'catC',          headerName: 'Cat. C' },
    ];

    const defaultColDef: ColDef = {
        flex: 1,
        minWidth: 120,
        resizable: true,
        sortable: true,
        filter: true,
    };

    const exportCsv = () => {
        if (gridApi.current) {
            gridApi.current.exportDataAsCsv({
                fileName: 'joined_ticket_data.csv',
                columnKeys: ['ticketId', 'code', 'seatConfirmed', 'checkedIn', 'customerId', 'customerEmail', 'catA', 'catB', 'catC'],
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
