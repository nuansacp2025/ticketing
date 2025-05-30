"use client"

import SelectionChip, { CustomerContextValue, CustomerSeatingPlanContext, CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { DefaultSeat, getMockSeatingPlanContextValue, NotSelectableSeat, SelectedSeat, TakenSeat } from "@/components/seating-plan/customer/mock-types";
import React from "react";

export default function Page() {
  const [contextValue, setContextValue] = React.useState<CustomerContextValue>(null);

  // Force to re-render by changing this value whenever manager.selection changes
  const [rerender, setRerender] = React.useState(0);

  React.useEffect(() => {
    // Retrieve data from API
    // Check cookies to retrieve selection from last session
    setContextValue(getMockSeatingPlanContextValue(() => setRerender(t => t+1)))
  }, []);

  if (contextValue === null) {
    return (
      <div className="w-dvw h-dvh flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <CustomerSeatingPlanContext.Provider value={contextValue}>
      <div className="w-dvw h-dvh flex justify-center items-center bg-[#0a0a0a] text-[#ededed]">
        <div className="flex w-[1100px] h-[600px]">
          <div className="w-[800px] h-full">
            <CustomerSeatingPlanInterface />
            {/* controls here */}
          </div>
          <div className="m-4 w-full flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Legend</h2>
              <div className="space-y-2 text-sm font-light">
                <div className="flex space-x-2 items-center">
                  <div className="w-5 h-5">
                    <NotSelectableSeat />
                  </div>
                  <p>Not for selection</p>
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="w-5 h-5">
                    <TakenSeat />
                  </div>
                  <p>Already taken</p>
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="w-5 h-5">
                    <DefaultSeat />
                  </div>
                  <p>Available</p>
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="w-5 h-5">
                    <SelectedSeat />
                  </div>
                  <p>Selected</p>
                </div>
              </div>
              <h3 className="text-xl font-semibold">Seat Category</h3>
              <div className="space-x-2 text-sm font-light">
                <p>Cat. A: Level 1, Lines G-X</p>
                <p>Cat. B: Level 2, Lines AA - GG and LL</p>
                <p>Cat. C: Level 2</p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Your Selection</h2>
              <div className="outline-1 outline-[#ededed] rounded-sm p-2 flex flex-col">
                {contextValue.manager.selection.length ? contextValue.manager.selection.map(id => (
                  <SelectionChip key={id} id={id} />
                )) : <p>None selected.</p>}
              </div>
              <div className="w-full flex items-center justify-center p-2">
                <button className="cursor-pointer relative bg-[#ededed] ring-[#ededed]/50 group transition-all duration-150 active:ring-8 w-full h-12 rounded-3xl">
                  <span className="relative z-10 text-[#0a0a0a] font-medium">
                    Reserve selection
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerSeatingPlanContext.Provider>
  );
}