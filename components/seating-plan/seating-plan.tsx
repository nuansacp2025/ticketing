import React, { ReactNode } from "react";
import { BaseSeatingPlanManager as MType, SeatingPlanContextType, SeatSelectionResult } from "./types";

interface SeatComponentProps<T extends MType> {
  id: string,
  context: React.Context<SeatingPlanContextType<T> | null>,
  children?: ReactNode,
}

export function SeatWrapper<T extends MType>({ id, context, children }: SeatComponentProps<T>) {
  const contextValue = React.useContext(context);
  if (contextValue === null) {
    return <></>;  // parent should show loading
  }

  const manager = contextValue.manager;
  const resultHandler = (result: SeatSelectionResult) => contextValue.seatSelectionResultsHandler([result]);

  const seatMetadata = manager.seatMap.get(id)!;
  const seatState = manager.seatStateMap.get(id)!;
  const seatType = contextValue.seatTypes.get(seatMetadata.type)!

  const { width, height } = seatType.style;
  const CurrentTheme = seatMetadata.notSelectable ? seatType.themes.notSelectable
    : seatState.taken ? seatType.themes.taken
    : seatState.selected ? seatType.themes.selected
    : seatType.themes.default;
  
  async function handleSeatClick() {
    if (seatMetadata.notSelectable || seatState.taken) return;
    if (seatState.selected) {
      await manager.unselectSeat(id);
    } else {
      const result = await manager.selectSeat(id);
      await resultHandler(result);
    }
  }
  
  return (
    <div
      style={{
        width, height, rotate: `${seatMetadata.location.rot}deg`,
        position: "absolute",
        display: (seatMetadata.level === manager.currentLevel ? "block" : "none"),
        top: (seatMetadata.location.y - height/2),
        left: (seatMetadata.location.x - width/2),
      }}
      onClick={handleSeatClick}
    >
      <CurrentTheme>
        {children}
      </CurrentTheme>
    </div>
  );
}

export function SeatingPlan<T extends MType>({ context, children }: { context: React.Context<SeatingPlanContextType<T> | null>, children: ReactNode }) {
  const contextValue = React.useContext(context);
  if (contextValue === null) {
    return (
      <div>Loading...</div>
    );
  }
  
  return (
    <div style={{ width: contextValue.width, height: contextValue.height }}>
      {Array.from(contextValue.manager.seatMap.keys())
        .map(id => <contextValue.SeatComponent key={id} id={id} />)}
      {children}
    </div>
  );
}
