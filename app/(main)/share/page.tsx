import { RegularButton } from "@/components/common/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full max-w-[720px] min-h-2/3 m-8 p-8 sm:p-16 flex flex-col items-center justify-center rounded-2xl bg-[#EEEEEE] text-background">
      <div className="w-full h-full flex flex-col items-center justify-between space-y-8 text-center overflow-x-hidden overflow-y-auto">
        <h2 className="px-4 text-2xl sm:text-3xl font-medium">Share your NUANSA 2025 ticket!</h2>
        <div className="sm:px-4 flex flex-col items-center space-y-4 text-sm sm:text-base font-light">
          <p>If you have selected your seats, you will receive an email confirming your selection. Inside this email, you should receive a shareable link to your ticket and event details.</p>
          <p>Alternatively, you can log in and click on the link provided on the home page.</p>
        </div>
        <Link href="/login" className="w-full">
          <RegularButton variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl">
            <span className="text-base sm:text-lg font-medium">Log in</span>
          </RegularButton>
        </Link>
      </div>
    </div>
  );
}
