import { RegularButton } from "@/components/common/button";
import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full max-w-[720px] min-h-2/3 m-8 p-8 sm:p-16 flex flex-col items-center justify-center rounded-2xl bg-[#EEEEEE] text-background">
      <div className="w-full h-full flex flex-col items-center justify-between space-y-8 text-center overflow-x-hidden overflow-y-auto">
        <h2 className="px-4 text-2xl sm:text-3xl font-medium">You're all set!</h2>
        <div className="sm:px-4 flex flex-col items-center space-y-4 text-sm sm:text-base font-light">
          <p>You will receive an email confirming your seat allocation. Show this email to our staff when you arrive at the venue.</p>
          <p>Please check your spam folder as it may accidentally be flagged as spam.</p>
          <p>We look forward to seeing you in the show!</p>
        </div>
        <Link href="/ticket" className="w-full">
          <RegularButton variant="black" buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl">
            <span className="text-base sm:text-lg font-medium">Back to Home</span>
          </RegularButton>
        </Link>
      </div>
    </div>
  );
}
