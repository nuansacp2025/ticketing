import { ReactNode } from "react";
import { BaseSeatingPlanManager, SeatSelectionResult } from "./types";

interface SeatComponentProps {
  id: string,
  manager: BaseSeatingPlanManager<any>,
  resultHandler: (result: SeatSelectionResult) => Promise<void> | void,
  children: ReactNode,
}

export default function Seat({ id, manager, resultHandler, children }: SeatComponentProps) {
  if (!manager._seatIds.has(id)) {
    throw new Error("Seat not found");
  }
  
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

interface SeatingPlanProps {
  width: number,
  height: number,
  manager: BaseSeatingPlanManager<any>,
  seatSelectionResultsHandler: (results: SeatSelectionResult[]) => Promise<void> | void,
  seatContentBuilder: (id: string, manager: BaseSeatingPlanManager<any>) => ReactNode,
}

export function SeatingPlan({ width, height, manager, seatSelectionResultsHandler, seatContentBuilder }: SeatingPlanProps) {
  return (
    <div style={{ width, height }}>
      {Array.from(manager.seatMap.keys()).map(id => (
        <Seat
          id={id}
          manager={manager}
          resultHandler={res => seatSelectionResultsHandler([res])}
        >
          {seatContentBuilder(id, manager)}
        </Seat>
      ))}
    </div>
  );
}