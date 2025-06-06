"use client"

import { InlineButton, RegularButton } from "@/components/common/button";
import { Loading } from "@/components/common/loading";
import { CustomerContextValue, CustomerSeatingPlanContext, CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { DefaultSeat, getCustomerSeatingPlanContextValue, levels, NotSelectableSeat, SelectedSeat, TakenSeat } from "@/components/seating-plan/customer/elements";
import { db } from "@/db/source";
import { doc, onSnapshot } from "firebase/firestore";
import React from "react";
import { SeatMetadata } from "@/lib/db";
import { UISeatMetadata, UISeatSelectionWarning, UISeatState } from "@/components/seating-plan/types";
import { useRouter } from "next/navigation";
import { Profile } from "@/lib/protected";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ToastContainer, toast } from "react-toastify";
import { CustomerSeatingPlanManager } from "@/components/seating-plan/customer/types";

interface SeatSelectionWarningContext {
  error: string,
  message: string,
  context?: any,
}

export default function Page() {
  const router = useRouter();

  const [contextValue, setContextValue] = React.useState<CustomerContextValue>(null);

  // Force to re-render by changing this value whenever manager.selection changes
  const [rerender, setRerender] = React.useState(0);

  const [profile, setProfile] = React.useState<Profile | null>(null);

  const [confirmDialogIsOpen, setConfirmDialogIsOpen] = React.useState(false);

  const openConfirmDialog = () => { setConfirmDialogIsOpen(true) };
  const closeConfirmDialog = () => { setConfirmDialogIsOpen(false) };

  const [submitLoading, setSubmitLoading] = React.useState(false);

  // This value is only updated every time `rerender` is updated
  const warningContext = assertFinalSelectionValid();

  const [showWarningContext, setShowWarningContext] = React.useState(true);

  const userPossiblyAfkRef = React.useRef(false);
  userPossiblyAfkRef.current = confirmDialogIsOpen && !submitLoading;

  function assertFinalSelectionValid(): SeatSelectionWarningContext | null {
    // Checks seat count and presence of isolated seats but does not check conflicts with
    // taken seats (this is supposed to be handled by the manager and/or when communicating
    // to the server via HTTP)
    if (contextValue === null) return null;

    const manager = contextValue.manager;

    const categoryList = manager.selection.map(id => manager.seatMap.get(id)!.category);
    const categoryCounts = new Map(Array.from(manager.maxSeatsPerCategory.keys()).map(category => {
      return [category, categoryList.filter(cat => cat === category).length];
    }));
    const remaining = Array.from(manager.maxSeatsPerCategory.entries())
      .map(([cat, count]) => [cat, count - categoryCounts.get(cat)!]);
    if (!(remaining.every(([_, count]) => (count === 0)))) {
      console.log(remaining)
      return {
        error: "UNEXPECTED_NUM_OF_SEATS",
        message: "Your selection does not match the amount of seats that you are allowed to reserve.",
        context: remaining,
      }
    }

    if (manager.isolatedSeatIds.length > 0) {
      return {
        error: "ISOLATED_SEATS_DETECTED",
        message: "There are other seats which get isolated by your choice of seats.",
        context: contextValue.manager.isolatedSeatIds
          .map(id => contextValue.manager.seatMap.get(id)!)
          .map(seat => `${seat.label} (${levels.get(seat.level)!.label})`)
          .join(", ")
      }
    }

    return null;
  }

  function handleRequestToConfirmSelection() {
    if (warningContext !== null) {
      toast.warn(warningContext.message);
      setShowWarningContext(true);
    } else {
      openConfirmDialog();
    }
  }

  function confirmSelection() {
    if (contextValue === null) return;
    setSubmitLoading(true);
    fetch("/api/reserveSeats", {
      method: "POST",
      body: JSON.stringify({
        "ids": contextValue.manager.selection,
      })
    }).then(res => {
      if (res.ok) {
        router.push("/thank-you");
      } else if (res.status === 409) {
        throw new Error(`
          We were unable to confirm your seats because of a change in seat availability that affected your selection,${" "}
          and your browser was out-of-sync. Please check your selection and try again. If the issue persists, please reload the page.
        `);
      }
      else throw new Error("An unknown error occurred, please reload the page.");
    }).catch((err: any) => {
      toast.warn(err.message);
    }).finally(() => {
      setSubmitLoading(false);
      closeConfirmDialog();
    })
  }

  // Check that user has not confirmed seats
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
      setProfile(data);
    }).catch((err: any) => {
      console.log(err);
    });
  }, []);

  // Load seats metadata
  React.useEffect(() => {
    if (profile === null) return;
    fetch("/api/getSeatsMetadata", {
      method: "GET",
    }).then(res => {
      if (res.ok) {
        return res.json();
      }
      // TODO: error handling
      else throw new Error("Error getting seats metadata");
    }).then((metadatas: SeatMetadata[]) => {
      const seatMap = new Map(metadatas.map(({ id, ...metadata }) => [id, metadata] as [string, UISeatMetadata]));

      // TODO: (enhancement) Check cookies to retrieve selection from last session.
      const seatStateMap = new Map<string, UISeatState>(Array.from(seatMap.keys()).map(id => {
        return [id, { selected: false, taken: false }] as [string, UISeatState];
      }));

      const maxSeatsPerCategory = new Map([
        ["catA", profile.catA],
        ["catB", profile.catB],
        ["catC", profile.catC],
      ]);

      const manager = new CustomerSeatingPlanManager(
          seatMap,
          seatStateMap,
          "level-1",
          maxSeatsPerCategory,
          () => setRerender(r => r+1)
      );

      const seatSelectionWarningsHandler = (warnings: UISeatSelectionWarning[]) => {
        if (warnings.length > 0 && userPossiblyAfkRef.current) {
          toast.info("Your selection has been updated.");
          setShowWarningContext(true);
          closeConfirmDialog();
        }

        const limitExceeded = warnings.filter(({ type }) => type === "MAX_CAT_LIMIT_EXCEEDED").length > 0;
        const seatTaken = warnings.filter(({ type }) => type === "SEAT_TAKEN")
          .map(({ id }) => manager.seatMap.get(id)!).map(seat => `${seat.label} (${levels.get(seat.level)!.label})`);

        if (limitExceeded) {
          toast.warn("You have reached the maximum amount you can reserve for that seat category!");
        }
        if (seatTaken.length > 0) {
          toast.info(`The following seat(s) have just been reserved by someone else: ${seatTaken.join(", ")}.`);
        }
      }

      // TODO: For maintainability, these values are perhaps better stored somewhere else.
      setContextValue(getCustomerSeatingPlanContextValue(
        manager,
        seatSelectionWarningsHandler,
        setRerender,
      ));
    }).catch((err: any) => {
      console.log(err);
    });
  }, [profile]);

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
              <div className="absolute inset-2 space-y-2 text-xs sm:text-sm text-background overflow-auto scrollbar-hidden">
                <p className="text-foreground">{selectionData.length ? `${selectionData.length} of ${profile!.catA + profile!.catB + profile!.catC} selected.` : "None selected."}</p>
                {showWarningContext && warningContext && (selectionData.length > 0) &&
                  <div className="w-full p-2 flex space-x-2 rounded-xl bg-amber-300">
                    <div className="flex-1 space-y-1">
                      <p>{warningContext.message}</p>
                      {warningContext.error === "UNEXPECTED_NUM_OF_SEATS" ? (
                        <p>Missing:{" "}
                          {(Array.from(warningContext.context.entries()) as Array<[string, number]>)
                            .filter(([cat, count]) => count > 0)
                            .map(([cat, count]) => `${count} seats of ${contextValue.categories.get(cat)!}`)
                            .join(", ")}
                        </p>
                      )
                      :
                      warningContext.error === "ISOLATED_SEATS_DETECTED" ? (
                        <p>Isolated seats: {warningContext.context}</p>
                      )
                      : null
                      }
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <span>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="11" fill="orange" stroke="black" strokeWidth="2" />
                          <text x="12" y="14" textAnchor="middle" fontSize="17" fontWeight="bold" fill="black" dominantBaseline="middle">!</text>
                        </svg>
                      </span>
                    </div>
                  </div>
                }
                {categoryEntries.map(([cat, catData]) => {
                  const catSelection = selectionData.filter(data => data.category === cat);
                  if (catSelection.length === 0) return;
                  return (
                    <div className="w-full p-2 rounded-xl bg-[#EEEEEE]">
                      {levelEntries.map(([level, levelData]) => {
                        const catAndLevelSelection = catSelection.filter(data => data.level === level);
                        if (catAndLevelSelection.length === 0) return;
                        return (
                          <>
                            <p className="mb-1 font-semibold">{catData.label} ({levelData.label}):</p>
                            <p>{catAndLevelSelection.map(data => data.label).sort().join(", ")}</p>
                          </>
                        );
                      })}
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
      <Dialog open={confirmDialogIsOpen} onClose={submitLoading ? (() => {}) : closeConfirmDialog} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center text-background text-center">
          <DialogPanel className="w-full max-w-[720px] min-h-2/3 m-8 flex flex-col items-center justify-center bg-[#EEEEEE] rounded-2xl">
            <div className="h-full max-h-[540px] m-12 sm:m-24 flex flex-col items-center justify-between space-y-8">
              <DialogTitle className="px-4 text-2xl sm:text-3xl font-medium">Confirm selection?</DialogTitle>
              <div className="px-4 text-xs sm:text-sm font-light space-y-4">
                <p>You are about to make a reservation for the following seats:</p>
                <p className="text-base sm:text-lg font-semibold">{
                  contextValue.manager.selection
                    .map(id => contextValue.manager.seatMap.get(id)!)
                    .map(seat => `${seat.label} (${levels.get(seat.level)!.label})`)
                    .join(", ")
                }</p>
                <p>Please check that your selection is correct. <span className="font-bold">You may not change your selection after confirming it.</span></p>
                <p>Are you sure you want to proceed?</p>
              </div>
              <div className="w-full space-y-2">
                <RegularButton
                  variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl"
                  onClick={confirmSelection}
                  buttonProps={{ disabled: submitLoading }}
                >
                  <span className="text-base sm:text-lg font-medium">Confirm seats</span>
                </RegularButton>
                {submitLoading ? (
                  <p className="px-4 text-sm sm:text-base">Please wait, this may take a while...</p>
                ) : (
                  <p className="px-4 text-sm sm:text-base">
                    <InlineButton onClick={closeConfirmDialog}>
                      No, I want to change my selection.
                    </InlineButton>
                  </p>
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
      <ToastContainer limit={3} position="top-center" className="text-xs/4 sm:text-sm/5 text-background" />
    </CustomerSeatingPlanContext.Provider>
  );
}
