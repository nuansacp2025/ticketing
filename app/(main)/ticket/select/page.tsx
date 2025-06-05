"use client"

import { RegularButton } from "@/components/common/button";
import { Loading } from "@/components/common/loading";
import { CustomerContextValue, CustomerSeatingPlanContext, CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { DefaultSeat, getCustomerSeatingPlanContextValue, NotSelectableSeat, SelectedSeat, TakenSeat } from "@/components/seating-plan/customer/elements";
import { db } from "@/db/source";
import { doc, onSnapshot } from "firebase/firestore";
import React from "react";
import { SeatMetadata } from "@/lib/db";
import { UISeatMetadata, UISeatSelectionWarning, UISeatState } from "@/components/seating-plan/types";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/protected";

export default function Page() {
  const router = useRouter();

  const [contextValue, setContextValue] = React.useState<CustomerContextValue>(null);

  // Force to re-render by changing this value whenever manager.selection changes
  const [rerender, setRerender] = React.useState(0);

  const [confirmDialogIsOpen, setConfirmDialogIsOpen] = React.useState(false);

  const openConfirmDialog = () => { setConfirmDialogIsOpen(true) };
  const closeConfirmDialog = () => { setConfirmDialogIsOpen(false) };

  const seatSelectionWarningsHandler = (warnings: UISeatSelectionWarning[]) => {
    warnings.forEach(({ id, type }) => {
      if (type === "SEAT_TAKEN") {
        console.log(`Seat ${id} has just been taken; removing from selection`);
      }
      if (type === "MAX_CAT_LIMIT_EXCEEDED") {
        console.log(`Maximum category limit exceeded; removing newest selected seat ${id}`)
      }
    });
  }

  function handleRequestToConfirmSelection() {
    const isolatedIds = contextValue!.manager.isolatedSeatIds;
    if (isolatedIds.length > 0) {
      // TODO: notify user
      console.log("Selection is invalid as there are isolated seats");
    } else {
      openConfirmDialog();
    }
  }

  function confirmSelection() {
    if (contextValue === null) return;
    fetch("/api/reserveSeats", {
      method: "POST",
      body: JSON.stringify({
        "ids": contextValue.manager.selection,
      })
    }).then(res => {
      if (res.ok) {
        router.push("/thank-you");
      }
      // TODO: Handle incoming errors
      else throw new Error("An unknown error occurred, please try again.");
    }).catch((err: any) => {
      console.log(err);
    })
  }

  // Check that user has not confirmed seats, then load seats metadata
  React.useEffect(() => {
    fetch("/api/getMyProfile", {
      method: "GET",
    }).then(res => {
      if (res.ok) {
        return res.json();
      } else if (res.status === 401) {
        router.push("/login");
        return null;
      }
      // TODO: error handling
      else throw new Error("Error getting profile");
    }).then((data: Profile) => {
      if (data.seatConfirmed) {
        router.push("/ticket");
        return;
      }
      fetch("/api/getSeatsMetadata", {
        method: "GET",
      }).then(res => {
        return res.json();
      }).then((metadatas: SeatMetadata[]) => {
        const seatMap = new Map(metadatas.map(({ id, ...metadata }) => [id, metadata] as [string, UISeatMetadata]));

        // TODO: (enhancement) Check cookies to retrieve selection from last session.
        const seatStateMap = new Map<string, UISeatState>(Array.from(seatMap.keys()).map(id => {
          return [id, { selected: false, taken: false }] as [string, UISeatState];
        }));

        const maxSeatsPerCategory = new Map([
          ["catA", data.catA],
          ["catB", data.catB],
          ["catC", data.catC],
        ]);

        // TODO: For maintainability, these values are perhaps better stored somewhere else.
        setContextValue(getCustomerSeatingPlanContextValue(
          seatMap,
          seatStateMap,
          maxSeatsPerCategory,
          seatSelectionWarningsHandler,
          setRerender,
        ));
      }).catch((err: any) => {
        console.log(err);
      });
    }).catch((err: any) => {
      console.log(err);
    });
  }, []);

  // Listen to change in availability (taken status) in real-time
  React.useEffect(() => {
    if (contextValue === null) return;
    const unsub = onSnapshot(doc(db, "caches", "seats.isAvailable"), async (doc) => {
      const updates = new Map();
      const cacheData = doc.data();
      Array.from(contextValue.manager.seatMap.keys()).forEach(id => {
        updates.set(id, !(cacheData![id] ?? true))
      });
      const warnings = await contextValue.manager.updateTakenStatus(updates);
      contextValue.seatSelectionWarningsHandler(warnings);
    });

    // Clean-up
    return unsub;
  }, [contextValue])

  if (contextValue === null) {
    return <Loading />;
  }

  const levelEntries = Array.from(contextValue.levels.entries());
  const categoryEntries = Array.from(contextValue.categories.entries());

  const selectionData = contextValue.manager.selection
    .map(id => contextValue.manager.seatMap.get(id)!)
    .map(data => ({ category: data.category, level: data.level, label: data.label }));

  return (
    <CustomerSeatingPlanContext.Provider value={contextValue}>
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
            <div className="relative flex-1 outline-1 outline-[#EEEEEE] rounded-sm flex flex-col">
              <div className="absolute inset-2 space-y-2 text-sm text-background overflow-auto">
                <p className="text-foreground">{selectionData.length ? `${selectionData.length} of ? selected.` : "None selected."}</p>
                {categoryEntries.map(([cat, data]) => {
                  const catSelection = selectionData.filter(data => data.category === cat);
                  if (catSelection.length === 0) return;
                  return (
                    <div className="w-full p-2 rounded-xl bg-[#EEEEEE]">
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
            <div className="w-full">
              <RegularButton
                variant="white" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl"
                onClick={handleRequestToConfirmSelection}
              >
                <span className="text-sm sm:text-base font-medium">Confirm selection</span>
              </RegularButton>
            </div>
          </div>
        </div>
      </div>
      {/* TODO: Add confirm dialog */}
    </CustomerSeatingPlanContext.Provider>
  );
}
