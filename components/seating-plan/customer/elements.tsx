import React, { ReactNode } from "react";
import { UISeatState, UISeatMetadata, SeatingPlanContextType, UICategoryMetadata, UISeatSelectionWarning } from "../types";
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

// TODO: apply slightly different styles to each category? (e.g. color)

const categoryMetadata = {
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

const catA: UICategoryMetadata = {
  label: "Cat. A",
  description: "Level 1, Lines G-X",
  style: categoryMetadata.style,
  themes: categoryMetadata.themes,
};

const catB: UICategoryMetadata = {
  label: "Cat. B",
  description: "Level 1, Lines AA-GG and LL",
  style: categoryMetadata.style,
  themes: categoryMetadata.themes,
};

const catC: UICategoryMetadata = {
  label: "Cat. C",
  description: "Level 2",
  style: categoryMetadata.style,
  themes: categoryMetadata.themes,
};

export const categories = new Map([
  ["catA", catA],
  ["catB", catB],
  ["catC", catC],
]);

const SeatComponent = ({ id }: { id: string }) => {
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

export const levels = new Map([
  ["level-1", {
    label: "Level 1",
    levelSvgUrl: "/seating-plan/level-1.svg",
    levelMinimapImgUrl: "/seating-plan/minimap-level-1.jpg",
  }],
  ["level-2", {
    label: "Level 2",
    levelSvgUrl: "/seating-plan/level-2.svg",
    levelMinimapImgUrl: "/seating-plan/minimap-level-2.jpg",
  }],
]);

export function getCustomerSeatingPlanContextValue(
    manager: CustomerSeatingPlanManager,
    seatSelectionWarningsHandler: (warnings: UISeatSelectionWarning[]) => Promise<void> | void,
    setRerender: React.Dispatch<React.SetStateAction<number>>,
) {
  return {
    width: 1500,
    height: 2000,
    levels,
    categories,

    manager,
    seatSelectionWarningsHandler,
    SeatComponent,
  } as SeatingPlanContextType<CustomerSeatingPlanManager>;
}

