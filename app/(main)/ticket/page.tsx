"use client"

import { InlineButton, RegularButton } from "@/components/common/button";
import { Profile } from "@/lib/protected";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Loading } from "@/components/common/loading";

export default function Page() {
  const router = useRouter();

  const [seatView, setSeatView] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile | null>(null)

  const openSeatView = () => { setSeatView(true) };
  const closeSeatView = () => { setSeatView(false) };

  function handleLogout() {
    // TODO
  }

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
      else throw new Error(`Error status ${res.status}`);
    }).then((data: Profile) => {
      setProfile(data);
    }).catch(err => {
      
    })
  }, []);

  if (profile === null) {
    // TODO
    return <Loading />;
  }

  const categories = new Map<string, [string, number]>([
    ["catA", ["Cat. A (Level 1)", profile.catA]],
    ["catB", ["Cat. B (Level 1)", profile.catB]],
    ["catC", ["Cat. C (Level 2)", profile.catC]],
  ]);
  const seats = new Map<string, string[]>(Array.from(categories.keys()).map(cat =>
    [cat, profile.seats.filter(({ category }) => category === cat).map(seat => seat.label)]));

  return (
    <>
      <div className={`w-full max-w-[720px] min-h-2/3 m-8 p-8 sm:p-16 flex flex-col items-center justify-center rounded-2xl bg-[#EEEEEE] text-background ${seatView && "hidden"}`}>
        <div className="w-full h-full flex flex-col items-center justify-between space-y-8 overflow-x-hidden overflow-y-auto">
          <div className="px-0.5 w-full space-y-4">
            <div className="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
              <div className="basis-2/3 space-y-2">
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold">
                  Email
                </label>
                <input
                  name="email" type="email" disabled
                  value={profile.email}
                  className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] ring-2 ring-[#3E3E3E] text-[#3E3E3E]"
                />
              </div>
              <div className="basis-1/3 space-y-2">
                <label htmlFor="ticket-code" className="block text-xs sm:text-sm font-semibold">
                  Ticket Code
                </label>
                <input
                  name="ticket-code" type="text" disabled
                  value={profile.ticketCode}
                  className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] ring-2 ring-[#3E3E3E] text-[#3E3E3E]"
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm font-light">
              Have another ticket?{" "}
              <InlineButton onClick={handleLogout}>
                Log out
              </InlineButton>
              {" "}first.
            </p>
          </div>
          {profile.seatConfirmed ?  // mock value for seatConfirmed
            <>
              <div className="px-0.5 w-full space-y-2">
                <p className="text-xs sm:text-sm font-semibold">
                  Confirmed Seats
                </p>
                <div className="w-full p-2 space-y-2 text-background outline-2 outline-background rounded-sm">
                  {Array.from(categories.entries()).map(([key, [label, _]]) => {
                    const seatList = seats.get(key) || [];
                    if (seatList.length === 0) return null;
                    return (
                      <p key={key} className="text-sm sm:text-base">
                        <span className="font-semibold">{label}: </span>
                        {seatList.join(", ")}
                      </p>
                    );
                  })}
                </div>
                <p className="text-xs sm:text-sm font-light">
                  <InlineButton onClick={openSeatView}>
                    View seating layout...
                  </InlineButton>
                </p>
              </div>
              <div className="w-full flex flex-col items-center space-y-4 text-center">
                <div className="sm:px-4 flex flex-col items-center space-y-1 text-sm sm:text-base font-light">
                  <p>Please check that you have received an email from us.</p>
                  <Link href="/help#find-confirmation-email">
                    <p><InlineButton>
                      Haven't received your email?
                    </InlineButton></p>
                  </Link>
                </div>
                <Link href="/share/example" className="w-full">
                  <RegularButton variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl">
                    <span className="text-base sm:text-lg font-medium">Share event details</span>
                  </RegularButton>
                </Link>
              </div>
            </>
            :
            <>
              <div className="w-full flex flex-col items-center space-y-4 text-center">
                <div className="sm:px-4 flex flex-col items-center space-y-1 text-sm sm:text-base font-light">
                  <p>You have not completed the seat selection process.</p>
                  <p>
                    Missing:{" "}
                    {Array.from(categories.entries())
                      .filter(([key, [Label, count]]) => count > 0)
                      .map(([key, [label, count]]) => `${count} seats of ${label}`)}
                  </p>
                </div>
                <Link href="/ticket/select" className="w-full">
                  <RegularButton variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl">
                    <span className="text-base sm:text-lg font-medium">Reserve seats</span>
                  </RegularButton>
                </Link>
              </div>
            </>
          }
        </div>
      </div>
      <div className={`absolute inset-8 sm:inset-16 flex flex-col text-foreground ${!seatView && "hidden"}`}>
        <p className="text-lg sm:text-xl font-medium align-middle">
          <InlineButton onClick={closeSeatView}>
            <span className="mr-2">
              {/* https://flowbite.com/icons/ */}
              <svg className="w-6 h-6 sm:w-8 sm:h-8 inline" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12l4-4m-4 4 4 4"/>
              </svg>
            </span>
            Back to Home
          </InlineButton>
        </p>
        <div className="flex-1 flex items-center justify-center">
          <p>Seating Plan (WIP)</p>
        </div>
      </div>
    </>
  );
}
