"use client"

import React from "react";
import {
  TransformWrapper,
  TransformComponent,
  MiniMap,
} from "react-zoom-pan-pinch";
import Image from "next/image";
import { SeatingPlan } from "../seating-plan";
import { CustomerSeatingPlanManager } from "./types";
import { SeatingPlanContextType } from "../types";

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

  const levelEntries = Array.from(contextValue.levels.entries());
  const currentLevel = contextValue.manager.currentLevel;

  return (
    <div className="relative w-full h-full flex outline-4 outline-[#3E3E3E] rounded-md bg-[#EEEEEE]">
      <TransformWrapper initialScale={0.8} initialPositionX={-200} initialPositionY={0} minScale={8/15} maxScale={1.5}>
        <TransformComponent wrapperStyle={{ maxWidth: "100%", maxHeight: "100%" }}>
          <SeatingPlan context={CustomerSeatingPlanContext}>
            {levelEntries.map(([level, data]) => (
              <object
                key={level}
                data={data.levelSvgUrl}
                className= {`pointer-events-none relative -z-10 ${currentLevel !== level && "hidden"}`} 
              />
            ))}
          </SeatingPlan>
        </TransformComponent>
        <div className="absolute top-6 right-6">
          <MiniMap width={240} className="rounded-sm outline-[#3E3E3E] outline-2">
            {levelEntries.map(([level, data]) => (
              <Image key={level} fill src={data.levelMinimapImgUrl} alt={`Minimap (${data.label})`} className={`${currentLevel !== level && "hidden"}`} />
            ))}
          </MiniMap>
        </div>
        <div className="absolute bottom-6 right-6">
          <div className="flex h-12 p-2 bg-[#3E3E3E] rounded-3xl text-[#ededed]">
            {levelEntries.map(([level, data]) => (
              <div
                key={level}
                className={`
                  cursor-pointer h-full px-2 flex flex-col justify-center rounded-2xl
                  ${currentLevel === level && "bg-[#222222] font-semibold"}
                `}
                onClick={() => contextValue.manager.setCurrentLevel(level)}
              >
                <p>{data.label}</p>
              </div>
            ))}
          </div>
        </div>
      </TransformWrapper>
    </div>
  );
}
