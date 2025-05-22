import React, { ReactNode } from "react";
import { BaseSeatingPlanManager, SeatSelectionResult } from "./types";

export interface SeatingPlanContextType {
  width: number,
  height: number,
  stageLocation: {
    x: { start: number, end: number },
    y: { start: number, end: number },
  }

  manager: BaseSeatingPlanManager<any>,
  seatSelectionResultsHandler: (results: SeatSelectionResult[]) => Promise<void> | void,
  seatContentBuilder: (id: string) => ReactNode,
}

export const SeatingPlanContext = React.createContext<SeatingPlanContextType | null>(null);

interface SeatComponentProps {
  id: string,
  children?: ReactNode,
}

export function SeatComponent({ id, children }: SeatComponentProps) {
  const context = React.useContext(SeatingPlanContext);
  if (context === null) {
    return (
      <div>Loading...</div>
    );
  }

  const manager = context.manager;
  const resultHandler = (result: SeatSelectionResult) => context.seatSelectionResultsHandler([result]);

  const seatMetadata = manager.seatMap.get(id)!;
  const seatState = manager.seatStateMap.get(id)!;

  const { width, height } = seatMetadata.type.style;
  
  const themes = seatMetadata.type.themes;
  const CurrentTheme = seatMetadata.notSelectable ? themes.notSelectable
    : seatState.taken ? themes.taken
    : seatState.selected ? themes.selected
    : themes.default;
  
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

export function SeatingPlan() {
  const context = React.useContext(SeatingPlanContext);
  if (context === null) {
    return (
      <div>Loading...</div>
    );
  }
  
  return (
    <div style={{ width: "800px", height: "600px" }}>
      {Array.from(context.manager.seatMap.keys()).map(id => context.seatContentBuilder(id))}
    </div>
  );
}
