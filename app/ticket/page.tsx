"use client"

import { InlineButton, RegularButton } from "@/components/common/button";
import Link from "next/link";

export default function Page() {
  function handleView() {

  }

  function handleSelect() {

  }

  return (
    <div className="w-full max-w-[720px] min-h-2/3 m-8 p-8 sm:p-16 flex flex-col items-center justify-center rounded-2xl bg-[#EEEEEE] text-background">
      <div className="w-full h-full flex flex-col items-center justify-between space-y-8 overflow-x-hidden overflow-y-auto">
        <div className="w-full space-y-4">
          <div className="mx-0.5 space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
            <div className="basis-2/3 space-y-2">
              <label htmlFor="email" className="block text-xs sm:text-sm font-semibold">
                Email
              </label>
              <input
                name="email" type="email" disabled
                value="your.example.email@example.domain.com"
                className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] ring-2 ring-[#3E3E3E] text-[#3E3E3E]"
              />
            </div>
            <div className="basis-1/3 space-y-2">
              <label htmlFor="ticket-code" className="block text-xs sm:text-sm font-semibold">
                Ticket Code
              </label>
              <input
                name="ticket-code" type="text" disabled
                value="012345678"
                className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] ring-2 ring-[#3E3E3E] text-[#3E3E3E]"
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-light">
            Have another ticket?{" "}
            <Link href="/logout"><InlineButton>
              Log out
            </InlineButton></Link>
            {" "}first.
          </p>
        </div>
        <div className="w-full">
          <label htmlFor="seats" className="block text-xs sm:text-sm font-semibold">
            Confirmed Seats
          </label>
          {/* chips of seat links */}
          <p className="text-xs sm:text-sm font-light">
            <InlineButton onClick={handleView}>
              View seating layout...
            </InlineButton>
          </p>
        </div>
        <div className="w-full flex flex-col items-center space-y-4 text-center">
          <div className="sm:px-4 flex flex-col items-center space-y-1 text-sm sm:text-base font-light">
            <p>You have not completed the seat selection process.</p>
            <p>Missing: 5 seats of Cat. A, 3 seats of Cat. B</p>
          </div>
          <RegularButton variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl" onClick={handleSelect}>
            <span className="text-base sm:text-lg font-medium">Reserve seats</span>
          </RegularButton>
        </div>
      </div>
    </div>
  );
}
