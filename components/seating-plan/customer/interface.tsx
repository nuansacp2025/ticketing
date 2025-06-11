"use client"

import React, { ReactNode } from "react";
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

interface CustomerSeatingPlanInterfaceProps {
  level: string,
  children: ReactNode,
}

export function CustomerSeatingPlanInterface(props: CustomerSeatingPlanInterfaceProps) {
  const contextValue = React.useContext(CustomerSeatingPlanContext);
  if (contextValue === null) {
    return <></>;  // parent should show loading
  }

  const INITIAL_SCALE = 1;

  const [minimapVisible, setMinimapVisible] = React.useState(false);
  const showMinimap = () => setMinimapVisible(true);
  const hideMinimap = () => setMinimapVisible(false);

  const levelEntries = Array.from(contextValue.levels.entries());

  return (
    <div className="absolute inset-0" >
      <TransformWrapper
        initialScale={INITIAL_SCALE} initialPositionY={0} minScale={0.5} maxScale={2.5}
        onInit={ref => {
          const frameWidth = ref.instance.wrapperComponent!.clientWidth;
          const initContentWidth = ref.instance.contentComponent!.clientWidth * INITIAL_SCALE;
          ref.state.positionX = (frameWidth - initContentWidth) / 2;
        }}
        onZoomStart={showMinimap} onZoomStop={hideMinimap}
        onPanningStart={showMinimap} onPanningStop={hideMinimap}
        onPinchingStart={showMinimap} onPinchingStop={hideMinimap}
      >
        <TransformComponent wrapperStyle={{ maxWidth: "100%", maxHeight: "100%" }}>
          <SeatingPlan context={CustomerSeatingPlanContext}>
            {levelEntries.map(([level, data]) => (
              <object
                key={level}
                data={data.levelSvgUrl}
                className= {`pointer-events-none relative -z-10 ${props.level !== level && "hidden"}`} 
              />
            ))}
          </SeatingPlan>
        </TransformComponent>
        <div className={`${!minimapVisible && "hidden"} absolute top-4 right-4 pointer-events-none`}>
          <MiniMap width={120} className="rounded-sm outline-[#3E3E3E] outline-2">
            {levelEntries.map(([level, data]) => (
              <Image key={level} fill src={data.levelMinimapImgUrl} alt={`Minimap (${data.label})`} className={`${props.level !== level && "hidden"}`} />
            ))}
          </MiniMap>
        </div>
      </TransformWrapper>
      <div className="relative inset-0 z-10">
        {props.children}
      </div>
    </div>
  );
}
