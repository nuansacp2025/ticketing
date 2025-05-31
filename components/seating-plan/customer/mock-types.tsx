import React, { ReactNode } from "react";
import { SeatState, SeatMetadata, SeatingPlanContextType, CategoryMetadata, SeatSelectionWarning } from "../types";
import { SeatWrapper } from "../seating-plan";
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

const mockCategoryMetadata = {
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
};

const catA: CategoryMetadata = {
  label: "Cat. A",
  description: "Level 1, Lines G-X",
  style: mockCategoryMetadata.style,
  themes: mockCategoryMetadata.themes,
};

const catB: CategoryMetadata = {
  label: "Cat. B",
  description: "Level 1, Lines AA-GG and LL",
  style: mockCategoryMetadata.style,
  themes: mockCategoryMetadata.themes,
};

const catC: CategoryMetadata = {
  label: "Cat. C",
  description: "Level 2",
  style: mockCategoryMetadata.style,
  themes: mockCategoryMetadata.themes,
};

const mockCategories = new Map([
  ["catA", catA],
  ["catB", catB],
  ["catC", catC],
]);

const mockSeatMap = new Map<string, SeatMetadata>([
  ...[
    ["level-1_D11", {
      label: "D11",
      location: {
        x: 482.05,
        y: 381.95,
        rot: 7.06,
      },
      notSelectable: false,
      level: "level-1",
      leftId: null,
      rightId: "level-1_D12",
      category: "catA",
    }] as [string, SeatMetadata],
    ["level-1_D12", {
      label: "D12",
      location: {
        x: 509.95,
        y: 385.25,
        rot: 6.58,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D11",
      rightId: "level-1_D13",
      category: "catA",
    }] as [string, SeatMetadata],
    ["level-1_D13", {
      label: "D13",
      location: {
        x: 538.00,
        y: 388.30,
        rot: 5.86,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D12",
      rightId: "level-1_D14",
      category: "catA",
    }] as [string, SeatMetadata],
    ["level-1_D14", {
      label: "D14",
      location: {
        x: 566.10,
        y: 390.90,
        rot: 5.11,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D13",
      rightId: "level-1_D15",
      category: "catA",
    }] as [string, SeatMetadata],
    ["level-1_D15", {
      label: "D15",
      location: {
        x: 594.10,
        y: 393.20,
        rot: 4.14,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D14",
      rightId: "level-1_D16",
      category: "catA",
    }] as [string, SeatMetadata],
    ["level-1_D16", {
      label: "D16",
      location: {
        x: 622.35,
        y: 395.15,
        rot: 3.41,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D15",
      rightId: "level-1_D17",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D17", {
      label: "D17",
      location: {
        x: 650.50,
        y: 396.70,
        rot: 2.68,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D16",
      rightId: "level-1_D18",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D18", {
      label: "D18",
      location: {
        x: 678.75,
        y: 397.85,
        rot: 1.95,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D17",
      rightId: "level-1_D19",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D19", {
      label: "D19",
      location: {
        x: 706.95,
        y: 398.65,
        rot: 1.21,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D18",
      rightId: "level-1_D20",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D20", {
      label: "D20",
      location: {
        x: 735.10,
        y: 399.00,
        rot: 0.49,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D19",
      rightId: "level-1_D21",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D21", {
      label: "D21",
      location: {
        x: 763.35,
        y: 398.95,
        rot: -0.24,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D20",
      rightId: "level-1_D22",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D22", {
      label: "D22",
      location: {
        x: 791.45,
        y: 398.55,
        rot: -1.21,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D21",
      rightId: "level-1_D23",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D23", {
      label: "D23",
      location: {
        x: 819.65,
        y: 397.95,
        rot: -1.95,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D22",
      rightId: "level-1_D24",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D24", {
      label: "D24",
      location: {
        x: 847.90,
        y: 396.80,
        rot: -2.68,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D23",
      rightId: "level-1_D25",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D25", {
      label: "D25",
      location: {
        x: 875.95,
        y: 395.25,
        rot: -3.41,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D24",
      rightId: "level-1_D26",
      category: "catB",
    }] as [string, SeatMetadata],
    ["level-1_D26", {
      label: "D26",
      location: {
        x: 904.20,
        y: 393.50,
        rot: -4.14,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D25",
      rightId: "level-1_D27",
      category: "catC",
    }] as [string, SeatMetadata],
    ["level-1_D27", {
      label: "D27",
      location: {
        x: 932.25,
        y: 391.25,
        rot: -4.86,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D26",
      rightId: "level-1_D28",
      category: "catC",
    }] as [string, SeatMetadata],
    ["level-1_D28", {
      label: "D28",
      location: {
        x: 960.35,
        y: 388.65,
        rot: -5.61,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D27",
      rightId: "level-1_D29",
      category: "catC",
    }] as [string, SeatMetadata],
    ["level-1_D29", {
      label: "D29",
      location: {
        x: 988.40,
        y: 385.70,
        rot: -6.34,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D28",
      rightId: "level-1_D30",
      category: "catC",
    }] as [string, SeatMetadata],
    ["level-1_D30", {
      label: "D30",
      location: {
        x: 1016.45,
        y: 382.25,
        rot: -7.06,
      },
      notSelectable: false,
      level: "level-1",
      leftId: "level-1_D29",
      rightId: null,
      category: "catC",
    }] as [string, SeatMetadata],
  ],
]);

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
              text-xs text-background tracking-tighter
              ${!seatState.taken && "group-hover:scale-120 duration-200"}
            `}
          >{seatMetadata.label}</span>
        }
        {manager.isolatedSeatIds.includes(id) &&
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
  ["level-1", {
    label: "Level 1",
    levelSvgUrl: "/mock-seating-plan/level-1.svg",
    levelMinimapImgUrl: "/mock-seating-plan/minimap-level-1.jpg",
  }],
  ["level-2", {
    label: "Level 2",
    levelSvgUrl: "/mock-seating-plan/level-2.svg",
    levelMinimapImgUrl: "/mock-seating-plan/minimap-level-2.jpg",
  }],
]);

const seatSelectionWarningsHandler = (warnings: SeatSelectionWarning[]) => {
  warnings.forEach(({ id, type }) => {
    if (type === "SEAT_TAKEN") {
      console.log(`Seat ${id} has just been taken; removing from selection`);
    }
    if (type === "MAX_CAT_LIMIT_EXCEEDED") {
      // TODO
    }
  });
}

export function getMockSeatingPlanContextValue(setRerender: React.Dispatch<React.SetStateAction<number>>) {
  return {
    width: 1500,
    height: 2000,
    levels: mockLevels,
    categories: mockCategories,

    manager: new CustomerSeatingPlanManager(mockSeatMap, mockSeatStateMap, "level-1", () => {setRerender(r => r+1)}),
    seatSelectionWarningsHandler,
    SeatComponent: MockSeatComponent,
  } as SeatingPlanContextType<CustomerSeatingPlanManager>;
}
