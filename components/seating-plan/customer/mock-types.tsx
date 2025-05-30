import React, { ReactNode } from "react";
import { SeatState, SeatMetadata, SeatType } from "../types";
import { SeatWrapper, SeatingPlanContextType } from "../seating-plan";
import { CustomerSeatingPlanManager } from "./types";
import { CustomerSeatingPlanContext } from "./interface";

export const NotSelectableSeat = (props: { children?: ReactNode }) => {
  return (
    <div className="relative w-full h-full bg-gray-500 outline-black outline-2">
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

export const TakenSeat = (props: { children?: ReactNode }) => {
  return (
    <div className="w-full h-full bg-red-900 outline-black outline-2">
      {props.children}
    </div>
  );
};

export const SelectedSeat = (props: { children?: ReactNode }) => {
  return (
    <div className="w-full h-full bg-blue-500 outline-black outline-2 transition-all duration-200 hover:shadow-[0px_0px_30px_10px] shadow-blue-500/80">
      {props.children}
    </div>
  );
};

export const DefaultSeat = (props: { children?: ReactNode }) => {
  return (
    <div className="w-full h-full bg-white outline-black outline-2 transition-all duration-200 hover:shadow-[0px_0px_30px_10px] shadow-white/80">
      {props.children}
    </div>
  );
};

const mockSeatType: SeatType = {
  label: "Regular Seat",
  style: {
    width: 20,
    height: 20,
  },
  themes: {
    notSelectable: NotSelectableSeat,
    taken: TakenSeat,
    selected: SelectedSeat,
    default: DefaultSeat,
  },
}

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
        level: (i > 1 ? "Level 1" : "Level 2"),
        leftId: (i == 0 || i == 2 ? null : `${String.fromCharCode(65+row)}${i-1}`),
        rightId: (i == 1 || i == 3 ? null : `${String.fromCharCode(65+row)}${i+1}`),
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
        level: "Level 1",
        leftId: (i == 0 ? null : `${String.fromCharCode(65+row)}${i+5}`),
        rightId: (i == 5 ? null : `${String.fromCharCode(65+row)}${i+3}`),
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
        level: (i < 2 ? "Level 1" : "Level 2"),
        leftId: (i == 0 || i == 2 ? null : `${String.fromCharCode(65+row)}${i+9}`),
        rightId: (i == 1 || i == 3 ? null : `${String.fromCharCode(65+row)}${i+11}`),
        type: mockSeatType,
      }] as [string, SeatMetadata];
    }),
  ];
}).flatMap(x => x));

const mockSeatStateMap = new Map<string, SeatState>(Array.from(mockSeatMap.keys()).map(id => {
  return [id, {
    selected: false, taken: (id[0] == 'H'),
  }] as [string, SeatState];
}));

const MockSeatComponent = ({ id }: { id: string }) => {
  const contextValue = React.useContext(CustomerSeatingPlanContext);
  if (contextValue === null) {
    return <></>;  // parent should show loading
  }

  const manager = contextValue.manager;
  const seatMetadata = manager.seatMap.get(id)!;
  const seatState = manager.seatStateMap.get(id)!;

  return (
    <SeatWrapper key={id} id={id} context={CustomerSeatingPlanContext}>
      <div className="relative w-full h-full flex items-center justify-center group">
        {!seatMetadata.notSelectable && 
          <span
            className={`
              text-xs text-background font-semibold
              ${!seatState.taken && "group-hover:scale-120 duration-200"}
            `}
          >{id}</span>
        }
        {true &&
          <span className="absolute -top-1.5 -right-1.5">
            <svg width="14" height="14" viewBox="0 0 14 14">
              <circle cx="7" cy="7" r="6" fill="orange" stroke="black" strokeWidth="2" />
              <text x="7" y="8" textAnchor="middle" fontSize="10" fontWeight="bold" fill="black" dominantBaseline="middle">!</text>
            </svg>
          </span>
        }
      </div>
    </SeatWrapper>
  );
}

const mockLevels = new Map([
  ["Level 1", {
    levelSvgUrl: "/mock-seating-plan/level-1.svg",
    levelMinimapImgUrl: "/mock-seating-plan/minimap-level-1.jpg",
  }],
  ["Level 2", {
    levelSvgUrl: "/mock-seating-plan/level-2.svg",
    levelMinimapImgUrl: "/mock-seating-plan/minimap-level-2.jpg",
  }],
]);

export function getMockSeatingPlanContextValue(setRerender: React.Dispatch<React.SetStateAction<number>>) {
  return {
    width: 1500,
    height: 2000,
    levels: mockLevels,

    manager: new CustomerSeatingPlanManager(mockSeatMap, mockSeatStateMap, "Level 1", () => {setRerender(r => r+1)}),
    seatSelectionResultsHandler: results => {},
    SeatComponent: MockSeatComponent,
  } as SeatingPlanContextType<CustomerSeatingPlanManager>;
}
