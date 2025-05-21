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
    <SeatingPlanContext.Provider value={contextValue}>
      <TransformWrapper>
        <TransformComponent>
          <SeatingPlan />
        </TransformComponent>
        <div>
          <MiniMap>
            <Image src="" alt="" onClick={() => setMapPopupVisibility(true)} />
          </MiniMap>
          <div>
            {contextValue.manager.selection.map(id => (
              <SelectionChip id={id} />
            ))}
          </div>
        </div>
      </TransformWrapper>
    </SeatingPlanContext.Provider>
  );
}
