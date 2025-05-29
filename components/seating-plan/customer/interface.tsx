"use client"

import React from "react";
import {
  TransformWrapper,
  TransformComponent,
  MiniMap,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { SeatingPlan, SeatingPlanContextType } from "../seating-plan";
import { getMockSeatingPlanContextValue } from "./mock-types";
import { CustomerSeatingPlanManager } from "./types";

type ContextValue = SeatingPlanContextType<CustomerSeatingPlanManager> | null;

export const CustomerSeatingPlanContext = React.createContext<ContextValue>(null);

export default function SelectionChip({ id }: { id: string }) {
  const contextValue = React.useContext(CustomerSeatingPlanContext);
  if (contextValue === null) {
    return <></>;
  }

  const manager = contextValue.manager;

  function handleZoomIntoSeat() {
    // TODO
  }

  async function handleUnselectSeat() {
    // TODO
  }

  return (
    <div className="flex justify-between items-center">
      <p className="text-white">{id}</p>
      <div className="flex items-center">
        <div onClick={handleZoomIntoSeat}></div>
        <div onClick={handleUnselectSeat}></div>
      </div>
    </div>
  );
}

export function CustomerSeatingPlanInterface() {
  const [contextValue, setContextValue] = React.useState<ContextValue>(null);

  const [mapPopupVisibility, setMapPopupVisibility] = React.useState(false);

  const [rerender, setRerender] = React.useState(0);  // force to re-render by changing this value whenever manager.selection changes

  const context = React.useRef<ContextValue>(null);
  if (context.current === null) {
    context.current = getMockSeatingPlanContextValue(setRerender);
  }

  React.useEffect(() => {
    // Retrieve data from API
    // Check cookies to retrieve selection from last session
    setContextValue(context.current);  // updates context value so everything re-renders
  }, [rerender]);

  if (contextValue === null) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className="w-[1100px] h-[600px] flex">
      <CustomerSeatingPlanContext.Provider value={contextValue}>
        <TransformWrapper initialScale={0.8} initialPositionX={-200 /* idk why this is 200 not 250*/} initialPositionY={0} minScale={0.5} maxScale={1.5}>
          <TransformComponent wrapperStyle={{ maxWidth: "800px", maxHeight: "600px" }}>
            <SeatingPlan context={CustomerSeatingPlanContext} />
          </TransformComponent>
          <div className="flex-1 flex flex-col">
            <MiniMap width={300}>
              <Image fill src="/seating-plan-cropped.jpg" alt="Click to enlarge map" onClick={() => setMapPopupVisibility(true)} />
            </MiniMap>
            <div className="flex-1 flex flex-col">
              {contextValue.manager.selection.map(id => (
                <SelectionChip key={id} id={id} />
              ))}
            </div>
          </div>
        </TransformWrapper>
      </CustomerSeatingPlanContext.Provider>
    </div>
  );
}
