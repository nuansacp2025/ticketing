import React, { ReactNode } from "react";
import { BaseSeatingPlanManager as MType, SeatSelectionResult } from "./types";

interface LevelMetadata {
  levelSvgUrl: string,
  levelMinimapImgUrl: string,
}

export interface SeatingPlanContextType<T extends MType> {
  width: number,
  height: number,
  levels: Map<string, LevelMetadata>

  manager: T,
  seatSelectionResultsHandler: (results: SeatSelectionResult[]) => Promise<void> | void,
  SeatComponent: React.FC<{ id: string }>,
}

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
