"use client"

import { CustomerContextValue, CustomerSeatingPlanContext, CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { DefaultSeat, getMockSeatingPlanContextValue, NotSelectableSeat, SelectedSeat, TakenSeat } from "@/components/seating-plan/customer/mock-types";
import { db } from "@/db/source";
import { collection, onSnapshot, query } from "firebase/firestore";
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

  React.useEffect(() => {
    if (contextValue === null) return;
    const q = query(collection(db, "seats"));
    const unsub = onSnapshot(q, async (querySnapshot) => {
      const updates = new Map();
      querySnapshot.forEach((doc) => {
        // For the purposes of this demo, we only consider seats with id "level-1_D[11-30]"
        if (!(doc.id.startsWith("level-1_D"))) return;
        updates.set(doc.id, !doc.data().isAvailable);
      });
      const warnings = await contextValue.manager.updateTakenStatus(updates);
      contextValue.seatSelectionWarningsHandler(warnings);
    });
  }, [contextValue])

  if (contextValue === null) {
    return (
      <div className="w-dvw h-dvh flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  const levelEntries = Array.from(contextValue.levels.entries());
  const categoryEntries = Array.from(contextValue.categories.entries());

  const selectionData = contextValue.manager.selection
    .map(id => contextValue.manager.seatMap.get(id)!)
    .map(data => ({ category: data.category, level: data.level, label: data.label }));

  return (
    <CustomerSeatingPlanContext.Provider value={contextValue}>
      <div className="w-dvw h-dvh flex justify-center items-center bg-[#0a0a0a] text-[#ededed]">
        <div className="flex w-[1200px] h-[600px]">
          <div className="w-[800px] h-full">
            <CustomerSeatingPlanInterface />
          </div>
          <div className="m-4 w-full flex flex-col space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Legend</h3>
              <div className="flex space-x-6 text-sm font-light">
                <div className="space-y-2">
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
                </div>
                <div className="space-y-2">
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
              </div>
              <h3 className="text-xl font-semibold">Seat Category</h3>
              <div className="space-x-2 text-sm font-light">
                <p>Cat. A: Level 1, Lines G-X</p>
                <p>Cat. B: Level 1, Lines AA-GG and LL</p>
                <p>Cat. C: Level 2</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col space-y-4">
              <h3 className="text-xl font-semibold">Your Selection</h3>
              <div className="relative flex-1 outline-1 outline-[#ededed] rounded-sm flex flex-col">
                <div className="absolute inset-2 space-y-2 text-sm text-[#0a0a0a] overflow-auto">
                  <p className="text-[#ededed]">{selectionData.length ? `${selectionData.length} of ? selected.` : "None selected."}</p>
                  {categoryEntries.map(([cat, data]) => {
                    const catSelection = selectionData.filter(data => data.category === cat);
                    if (catSelection.length === 0) return;
                    return (
                      <div className="w-full p-2 rounded-xl bg-[#ededed]">
                        <p className="mb-1 font-semibold">{data.label}:</p>
                        <div className="ml-2">
                          {levelEntries.map(([level, data]) => {
                            const catAndLevelSelection = catSelection.filter(data => data.level === level);
                            if (catAndLevelSelection.length === 0) return;
                            return (
                              <p>
                                <span className="font-semibold">{data.label}: </span>
                                {catAndLevelSelection
                                  .map(data => data.label)
                                  .sort()
                                  .join(", ")}
                              </p>
                            )
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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