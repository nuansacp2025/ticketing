"use client"

import React from "react";
import {
  TransformWrapper,
  TransformComponent,
  MiniMap,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { SeatingPlan, SeatingPlanContext, SeatingPlanContextType } from "../seating-plan";
import SelectionChip from "./selection-chip";
import { mockSeatingPlanContextValue } from "./mock-types";

export function CustomerSeatingPlanInterface() {
  const [contextValue, setContextValue] = React.useState<SeatingPlanContextType | null>(null);

  const [mapPopupVisibility, setMapPopupVisibility] = React.useState(false);

  React.useEffect(() => {
    // Retrieve data from API
    // Check cookies to retrieve selection from last session
    setContextValue(mockSeatingPlanContextValue);
  }, []);

  if (contextValue === null) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div className="w-[1100px] h-[600px] flex">
      <SeatingPlanContext.Provider value={contextValue}>
        <TransformWrapper initialScale={0.8} initialPositionX={-200 /* idk why this is 200 not 250*/} initialPositionY={0} minScale={0.5} maxScale={1.5}>
          <TransformComponent wrapperStyle={{ maxWidth: "800px", maxHeight: "600px" }}>
            <SeatingPlan />
          </TransformComponent>
          <div className="flex-1 flex flex-col">
            <MiniMap width={300}>
              <Image fill  src="/captain_america.png" alt="Click to enlarge map" onClick={() => setMapPopupVisibility(true)} />
            </MiniMap>
            <div className="flex-1 flex flex-col">
              {contextValue.manager.selection.map(id => (
                <SelectionChip key={id} id={id} />
              ))}
            </div>
          </div>
        </TransformWrapper>
      </SeatingPlanContext.Provider>
    </div>
  );
}
