import React, { ReactNode } from "react";
import { BaseSeatingPlanManager as MType, SeatingPlanContextType, SeatingPlanTransformContext, SeatingPlanTransformContextType } from "./types";
import { useTransformEffect } from "react-zoom-pan-pinch";

interface SeatWrapperProps<T extends MType> {
  id: string,
  context: React.Context<SeatingPlanContextType<T> | null>,
  children?: ReactNode,
}

export function SeatWrapper<T extends MType>(props: SeatWrapperProps<T>) {
  const contextValue = React.useContext(props.context);
  if (contextValue === null) {
    return <></>;  // parent should show loading
  }

  const manager = contextValue.manager;

  const seatMetadata = manager.seatMap.get(props.id)!;
  const seatState = manager.seatStateMap.get(props.id)!;
  const categoryMetadata = contextValue.categories.get(seatMetadata.category)!

  const { width, height } = categoryMetadata.style;
  
  async function handleSeatClick() {
    if (contextValue === null) return;
    if (seatMetadata.notSelectable || seatState.taken) return;
    if (seatState.selected) {
      await manager.unselectSeat(props.id);
    } else {
      const warnings = await manager.selectSeat(props.id);
      console.log(warnings)
      await contextValue.seatSelectionWarningsHandler(warnings);
    }
  }
  
  return (
    <>
      <div
        style={{
          width, height, rotate: `${seatMetadata.location.rot}deg`,
          position: "absolute", zIndex: 10,
          display: (seatMetadata.level === manager.currentLevel ? "block" : "none"),
          top: (seatMetadata.location.y - height/2),
          left: (seatMetadata.location.x - width/2),
        }}
        onClick={handleSeatClick}
      >
        {props.children}
      </div>
      {/* TODO: refactor for reusability, not a very nice place to put this I think, but needed to prevent the shadow from blocking other seats */}
      <div
        className={categoryMetadata.style.shadowClass}
        style={{
          width, height, rotate: `${seatMetadata.location.rot}deg`,
          position: "absolute", zIndex: 0,
          display: (seatMetadata.level === manager.currentLevel ? "block" : "none"),
          top: (seatMetadata.location.y - height/2),
          left: (seatMetadata.location.x - width/2),
        }}
      />
    </>
  );
}

interface SeatingPlanProps<T extends MType> {
  context: React.Context<SeatingPlanContextType<T> | null>,
  children: ReactNode,
}

export function SeatingPlan<T extends MType>({ context, children }: SeatingPlanProps<T>) {
  const contextValue = React.useContext(context);
  if (contextValue === null) {
    return (
      <div>Loading...</div>
    );
  }

  const [transformContextValue, setTransformContextValue] = React.useState<SeatingPlanTransformContextType>({
    showSeatLabel: false,
  });

  useTransformEffect(({ state }) => {
    if (state.scale >= 1 && !transformContextValue.showSeatLabel) {
      setTransformContextValue(value => {
        value.showSeatLabel = true;
        return value;
      });
    } else if (state.scale < 1 && transformContextValue.showSeatLabel) {
      setTransformContextValue(value => {
        value.showSeatLabel = false;
        return value;
      });
    }
  })
  
  return (
    <SeatingPlanTransformContext.Provider value={transformContextValue}>
      <div style={{ width: contextValue.width, height: contextValue.height }}>
        {Array.from(contextValue.manager.seatMap.keys())
          .map(id => <contextValue.SeatComponent key={id} id={id} />)}
        {children}
      </div>
    </SeatingPlanTransformContext.Provider>
  );
}
