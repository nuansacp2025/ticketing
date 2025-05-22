"use client"

import { CustomerSeatingPlanInterface } from "@/components/seating-plan/customer/interface";
import { mockSeatingPlanContextValue } from "@/components/seating-plan/customer/mock-types";
import { SeatingPlan, SeatingPlanContext } from "@/components/seating-plan/seating-plan";

export default function Page() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <CustomerSeatingPlanInterface />
    </div>
  );
}