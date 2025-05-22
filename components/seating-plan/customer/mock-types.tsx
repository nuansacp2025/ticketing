import { ReactNode } from "react";
import { BaseSeatState, SeatMetadata, SeatType } from "../types";
import { SeatComponent, SeatingPlanContextType } from "../seating-plan";
import { CustomerSeatingPlanManager } from "./types";

const NotSelectableSeat = (props: { children: ReactNode }) => {
  return (
    <div className="w-full h-full bg-gray-200 outline-black relative">
      {props.children}
      <span
        className="pointer-events-none absolute left-0 top-0 w-full h-full"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="black" strokeWidth="2" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="black" strokeWidth="2" />
        </svg>
      </span>
    </div>
  );
};

const TakenSeat = (props: { children: ReactNode }) => {
  return (
    <div className="w-full h-full bg-red-900 outline-black">
      {props.children}
    </div>
  );
};

const SelectedSeat = (props: { children: ReactNode }) => {
  return (
    <div className="w-full h-full bg-blue-500 outline-black">
      {props.children}
    </div>
  );
};

const DefaultSeat = (props: { children: ReactNode }) => {
  return (
    <div className="w-full h-full bg-gray-200 outline-black">
      {props.children}
    </div>
  );
};

const mockSeatType: SeatType = {
  label: "Regular Seat",
  style: {
    width: 50,
    height: 50,
  },
  themes: {
    notSelectable: NotSelectableSeat,
    taken: TakenSeat,
    selected: SelectedSeat,
    default: DefaultSeat,
  },
}

console.log();

const mockSeatMap = new Map<string, SeatMetadata>(Array.of(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15).map(row => {
  return [
    ...Array.of(0,1,2,3).map(i => {
      const id = `${String.fromCharCode(65+row)}${i}`;
      return [id, {
        location: {
          x: 100*i+100,
          y: 100*row+300,
          rot: 45,
        },
        notSelectable: (row < 5),
        type: mockSeatType,
      }] as [string, SeatMetadata];
    }),
    ...Array.of(0,1,2,3,4,5).map(i => {
      const id = `${String.fromCharCode(65+row)}${i+4}`;
      return [id, {
        location: {
          x: 100*i+500,
          y: 100*row+300,
          rot: 0,
        },
        notSelectable: (row < 3),
        type: mockSeatType,
      }] as [string, SeatMetadata];
    }),
    ...Array.of(0,1,2,3).map(i => {
      const id = `${String.fromCharCode(65+row)}${i+10}`;
      return [id, {
        location: {
          x: 100*i+1100,
          y: 100*row+300,
          rot: 315,
        },
        notSelectable: (row < 5),
        type: mockSeatType,
      }] as [string, SeatMetadata];
    }),
  ];
}).flatMap(x => x));

const mockSeatStateMap = new Map<string, BaseSeatState>(Array.from(mockSeatMap.keys()).map(id => {
  return [id, {
    selected: false, taken: (id[0] == 'H'),
  }] as [string, BaseSeatState];
}));

console.log(Array.from(mockSeatStateMap));

export const mockSeatingPlanContextValue: SeatingPlanContextType = {
  width: 1500,
  height: 2000,
  stageLocation: {
    x: { start: 350, end: 1150 },
    y: { start: 50, end: 300 },
  },

  manager: new CustomerSeatingPlanManager(mockSeatMap, mockSeatStateMap),
  seatSelectionResultsHandler: results => {},
  seatContentBuilder: id => (<SeatComponent key={id} id={id} />),
};
