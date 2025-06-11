"use client"

import { InlineButton, RegularButton } from "@/components/common/button";
import { Loading } from "@/components/common/loading";
import { CustomerContextValue, CustomerSeatingPlanContext, CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { DefaultSeat, getCustomerSeatingPlanContextValue, levels, NotSelectableSeat, SelectedSeat, TakenSeat } from "@/components/seating-plan/customer/elements";
import { db } from "@/db/source";
import { doc, onSnapshot } from "firebase/firestore";
import React from "react";
import { SeatMetadata } from "@/lib/db";
import { UICategoryMetadata, UISeatMetadata, UISeatSelectionWarning, UISeatState } from "@/components/seating-plan/types";
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

function LegendSection({ categories }: { categories: Map<string, UICategoryMetadata> }) {
  return (
    <div className="grid grid-rows-4 sm:grid-rows-2 lg:grid-rows-4 grid-flow-col gap-2 text-xs sm:text-sm font-light">
      <div className="flex space-x-2 items-center">
        <div className="size-4 sm:size-5 bg-gray-500 outline-black outline-2"><NotSelectableSeat /></div>
        <p>Not for selection</p>
      </div>
      <div className="flex space-x-2 items-center">
        <div className="size-4 sm:size-5 bg-red-900 outline-black outline-2"><TakenSeat /></div>
        <p>Already taken</p>
      </div>
      <div className="flex space-x-2 items-center">
        <div className="size-4 sm:size-5 bg-white outline-black outline-2"><DefaultSeat /></div>
        <p>Available</p>
      </div>
      <div className="flex space-x-2 items-center">
        <div className="size-4 sm:size-5 bg-blue-500 outline-black outline-2"><SelectedSeat /></div>
        <p>Selected</p>
      </div>
      {Array.from(categories.entries()).map(([cat, data]) => (
        <div key={cat} className="flex space-x-2 items-center">
          <svg className="block w-5 h-5" width="20" height="20">
            <circle cx="10" cy="10" r="10" fill={data.style.color} />
          </svg>
          <p>{data.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  const [contextValue, setContextValue] = React.useState<CustomerContextValue>(null);

  // Force to re-render by changing this value whenever manager.selection changes
  const [rerender, setRerender] = React.useState(0);

  const [profile, setProfile] = React.useState<Profile | null>(null);

  // We need this to "lock in" our selection when awaiting the confirmation response, as
  // `manager.selection` may change at any time (since the dialog will not close in this
  // period, we don't want the user to see this change and get confused)
  const [finalSelection, setFinalSelection] = React.useState<string[]>([]);

  const [confirmDialogIsOpen, setConfirmDialogIsOpen] = React.useState(false);
  const openConfirmDialog = () => { setConfirmDialogIsOpen(true) };
  const closeConfirmDialog = () => { setConfirmDialogIsOpen(false) };

  const [sidebarIsOpen, setSidebarIsOpen] = React.useState(true);
  const openSidebar = () => { setSidebarIsOpen(true) };
  const closeSidebar = () => { setSidebarIsOpen(false) };

  // Set to true when request to reserve seats is sent and is awaiting for response
  const [awaitingConfirmation, setAwaitingConfirmation] = React.useState(false);

  // Warnings that were blocked while awaiting confirmation
  const [pendingWarnings, setPendingWarnings] = React.useState<UISeatSelectionWarning[]>([]);

  // This value is only updated every time `rerender` is updated
  const warningContext = assertFinalSelectionValid();

  const [showWarningContext, setShowWarningContext] = React.useState(true);

  const confirmDialogIsOpenRef = React.useRef(false);
  confirmDialogIsOpenRef.current = confirmDialogIsOpen;
  const awaitingConfirmationRef = React.useRef(false);
  awaitingConfirmationRef.current = awaitingConfirmation;

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

  async function handleRequestToConfirmSelection() {
    if (contextValue === null) return;
    if (warningContext !== null) {
      toast.warn(warningContext.message);
      setShowWarningContext(true);
    } else {
      setFinalSelection(await contextValue.manager.getSelection());
      openConfirmDialog();
    }
  }

  function confirmSelection() {
    if (contextValue === null) return;
    setAwaitingConfirmation(true);
    fetch("/api/reserveSeats", {
      method: "POST",
      body: JSON.stringify({
        "ids": finalSelection,
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
      // Tell others that the wait has ended, then process the pending warnings
      setAwaitingConfirmation(false);
      if (pendingWarnings.length > 0) {
        contextValue.seatSelectionWarningsHandler(pendingWarnings);
      }
      setPendingWarnings([]);

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
        // When awaiting confirmation, don't interrupt the dialog; wait for it to finish
        if (awaitingConfirmationRef.current) {
          setPendingWarnings(arr => arr.concat(warnings));
          return;
        }

        if (warnings.length > 0 && confirmDialogIsOpenRef.current) {
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

  const currentLevel = contextValue.manager.currentLevel;
  const selectionData = contextValue.manager.selection
    .map(id => contextValue.manager.seatMap.get(id)!)
    .map(data => ({ category: data.category, level: data.level, label: data.label }));

  return (
    <CustomerSeatingPlanContext.Provider value={contextValue}>
      <div className="relative flex lg:space-x-4 w-full h-full lg:max-w-[1320px] lg:max-h-[720px] md:p-8 lg:p-16">
        <div className="relative not-lg:basis-full lg:basis-3/4 outline-4 outline-[#3E3E3E] bg-[#EEEEEE] md:rounded-md">
          <CustomerSeatingPlanInterface level={currentLevel}>
            <div className={`${sidebarIsOpen && "not-lg:hidden"} absolute bottom-4 left-4 right-4 grid grid-cols-[1fr] md:grid-cols-[auto_1fr] grid-flow-row justify-end gap-4 pointer-events-none`}>
              <div className="flex h-10 sm:h-12 p-1 sm:p-2 bg-[#3E3E3E]/80 rounded-2xl sm:rounded-3xl place-self-end pointer-events-auto">
                {levelEntries.map(([level, data]) => (
                  <div
                    key={level}
                    className={`
                      cursor-pointer h-full px-2 flex flex-col justify-center rounded-xl sm:rounded-2xl
                      ${currentLevel === level && "bg-[#222222] font-semibold"}
                    `}
                    onClick={() => contextValue.manager.setCurrentLevel(level)}
                  >
                    <p className="text-sm sm:text-base">{data.label}</p>
                  </div>
                ))}
              </div>
              <div className="lg:hidden p-2 bg-[#3E3E3E]/80 rounded-2xl">
                <div className="w-full p-2">
                  <LegendSection categories={contextValue.categories} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-2 text-xs sm:text-sm">
                    <p>{selectionData.length ? `${selectionData.length} of ${profile!.catA + profile!.catB + profile!.catC} selected.` : "None selected."}</p>
                    {warningContext && (selectionData.length > 0) &&
                      <p className="text-amber-300">
                        {warningContext.error === "UNEXPECTED_NUM_OF_SEATS" ? (
                          `${warningContext.context.length} seats remaining.`
                        ) : (
                          "There are issues with your selection."
                        )}
                      </p>
                    }
                  </div>
                  <div className="pointer-events-auto">
                    <RegularButton variant="white" buttonClass="w-[120px] p-2 rounded-2xl" onClick={openSidebar}>
                      <span className="px-1 text-sm sm:text-base font-medium">Show all</span>
                    </RegularButton>
                  </div>
                </div>
                <div className="w-full p-2 flex space-x-2 items-center">
                  <span className="inline-block">
                    {/* https://reactsvgicons.com/ */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="1.5em"
                      height="1.5em"
                    >
                      <path
                        fill="currentColor"
                        d="M11 18h2v-2h-2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5c0-2.21-1.79-4-4-4"
                      ></path>
                    </svg>
                  </span>{" "}
                  <p className="text-sm sm:text-base">
                    Need assistance? Contact us via WhatsApp:{" "}
                    <span className="underline font-semibold">
                      Kacey (+62 811 3114 001)
                    </span>{" "}
                    or{" "}
                    <span className="underline font-semibold">
                      Michelle (+65 8264 0091)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CustomerSeatingPlanInterface>
        </div>
        {/* "Sidebar", visible on large screens, otherwise need to open */}
        <div className={`${!sidebarIsOpen && "not-lg:hidden"} not-lg:absolute z-10 not-lg:inset-0 not-lg:bg-background/80 p-8 md:p-16 lg:p-0 lg:basis-1/4 flex flex-col space-y-6`}>
          <div className="not-lg:hidden space-y-4">
            <h3 className="text-xl font-semibold">Legend</h3>
            <LegendSection categories={contextValue.categories} />
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
                          {(warningContext.context as Array<[string, number]>)
                            .filter(([_, count]) => count > 0)
                            .map(([cat, count]) => `${count} seats of ${contextValue.categories.get(cat)!.label}`)
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
            <div className="w-full lg:hidden">
              <RegularButton
                variant="white" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl"
                onClick={closeSidebar}
              >
                <span className="text-sm sm:text-base font-medium">Back to map</span>
              </RegularButton>
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
      <div className="not-lg:hidden absolute bottom-4 right-4 flex space-x-2 items-center">
        <span className="inline-block">
          {/* https://reactsvgicons.com/ */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1.5em"
            height="1.5em"
          >
            <path
              fill="currentColor"
              d="M11 18h2v-2h-2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5c0-2.21-1.79-4-4-4"
            ></path>
          </svg>
        </span>{" "}
        <p className="text-sm sm:text-base">
          Need assistance? Contact us via WhatsApp:{" "}
          <span className="underline font-semibold">
            Kacey (+62 811 3114 001)
          </span>{" "}
          or{" "}
          <span className="underline font-semibold">
            Michelle (+65 8264 0091)
          </span>
        </p>
      </div>
      <Dialog open={confirmDialogIsOpen} onClose={awaitingConfirmation ? (() => {}) : closeConfirmDialog} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center text-background text-center">
          <DialogPanel className="w-full max-w-[720px] min-h-2/3 m-8 flex flex-col items-center justify-center bg-[#EEEEEE] rounded-2xl">
            <div className="h-full max-h-[540px] m-8 sm:m-24 flex flex-col items-center justify-between space-y-8">
              <DialogTitle className="sm:px-4 text-2xl sm:text-3xl font-medium">Confirm selection?</DialogTitle>
              <div className="sm:px-4 text-xs sm:text-sm font-light space-y-4">
                <p>You are about to make a reservation for the following seats:</p>
                <p className="text-base sm:text-lg font-semibold">{
                  finalSelection.map(id => contextValue.manager.seatMap.get(id)!)
                    .map(seat => `${seat.label} (${levels.get(seat.level)!.label})`).join(", ")
                }</p>
                <p>Please check that your selection is correct. <span className="font-bold">You may not change your selection after confirming it.</span></p>
                <p>Are you sure you want to proceed?</p>
              </div>
              <div className="w-full space-y-2">
                <RegularButton
                  variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl"
                  onClick={confirmSelection}
                  buttonProps={{ disabled: awaitingConfirmation }}
                >
                  <span className="text-base sm:text-lg font-medium">Confirm seats</span>
                </RegularButton>
                {awaitingConfirmation ? (
                  <p className="sm:px-4 text-sm sm:text-base">Please wait, this may take a while...</p>
                ) : (
                  <p className="sm:px-4 text-sm sm:text-base">
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
