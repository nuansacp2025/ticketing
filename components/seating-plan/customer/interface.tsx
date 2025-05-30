"use client"

import React from "react";
import {
  TransformWrapper,
  TransformComponent,
  MiniMap,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { SeatingPlan, SeatingPlanContextType } from "../seating-plan";
import { CustomerSeatingPlanManager } from "./types";

export type CustomerContextValue = SeatingPlanContextType<CustomerSeatingPlanManager> | null;

export const CustomerSeatingPlanContext = React.createContext<CustomerContextValue>(null);

export default function SelectionChip({ id }: { id: string }) {
  const contextValue = React.useContext(CustomerSeatingPlanContext);
  if (contextValue === null) {
    return <></>;  // parent should show loading
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
      <p className="text-foreground">{id}</p>
      <div className="flex items-center">
        <div onClick={handleZoomIntoSeat}></div>
        <div onClick={handleUnselectSeat}></div>
      </div>
    </div>
  );
}

export function CustomerSeatingPlanInterface() {
  const contextValue = React.useContext(CustomerSeatingPlanContext);
  if (contextValue === null) {
    return <></>;  // parent should show loading
  }

  const level = contextValue.manager.currentLevel;

  return (
    <div className="relative w-full h-full flex outline-4 outline-[#3E3E3E] rounded-md bg-[#EEEEEE]">
      <TransformWrapper initialScale={0.8} initialPositionX={-200} initialPositionY={0} minScale={8/15} maxScale={1.5}>
        <TransformComponent wrapperStyle={{ maxWidth: "100%", maxHeight: "100%" }}>
          <SeatingPlan context={CustomerSeatingPlanContext}>
            <object
              data="/mock-seating-plan/level-1.svg"
              className= {`pointer-events-none relative -z-10 ${level !== "Level 1" && "hidden"}`} 
            />
            <object
              data="/mock-seating-plan/level-2.svg"
              className= {`pointer-events-none relative -z-10 ${level !== "Level 2" && "hidden"}`} 
            />
          </SeatingPlan>
        </TransformComponent>
        <div className="absolute top-6 right-6">
          <MiniMap width={240} className="rounded-sm outline-[#3E3E3E] outline-2">
            {level === "Level 1" && <Image fill src="/mock-seating-plan/minimap-level-1.jpg" alt="Minimap (Level 1)" />}
            {level === "Level 2" && <Image fill src="/mock-seating-plan/minimap-level-2.jpg" alt="Minimap (Level 2)" />}
          </MiniMap>
        </div>
      </TransformWrapper>
    </div>
  );
}
