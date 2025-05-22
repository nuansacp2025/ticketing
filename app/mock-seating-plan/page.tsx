"use client"

import { CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";

export default function Page() {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-zinc-800">
      <CustomerSeatingPlanInterface />
    </div>
  );
}