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
  children: ReactNode,
}

function Seat({ id, children }: SeatComponentProps) {
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
  const CurrentTheme = !seatMetadata.selectable ? themes.notSelectable : seatState.selected ? themes.selected : themes.default;
  
  async function handleSeatClick() {
    if (!seatMetadata.selectable) return;
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
        width, height,
        position: "relative",
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
    <div style={{ width: context.width, height: context.height }}>
      {Array.from(context.manager.seatMap.keys()).map(id => (
        <Seat id={id}>
          {context.seatContentBuilder(id)}
        </Seat>
      ))}
    </div>
  );
}
