"use client"

import Image from "next/image";
import React from "react";

export default function Page() {
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
        const elementId = hash.substring(1); // Remove the '#' from the hash
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
  }, []);

  return (
    <div className="w-dvw min-h-dvh bg-[#EEEEEE] text-background">
      <div className="relative z-10 w-full flex items-center justify-center p-8 sm:p-24">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/background.jpg" alt="Background" fill
            className="blur-xs object-cover"
          />
          <div className="absolute inset-0 z-10 bg-black/60" />
        </div>
        <div className="w-full max-w-[720px] sm:mx-16 p-8 sm:p-16 rounded-2xl bg-white/80 shadow-2xl shadow-white/80 text-background space-y-4 sm:space-y-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold mx-4">Help Center</h1>
          <div className="text-center text-sm sm:text-base font-light sm:mx-4">
            <h4 className="mb-2">Need live assistance? Contact us via WhatsApp:</h4>
            <h4 className="font-semibold underline">Kacey (+65 9249 8978)</h4>
            <h4 className="font-semibold underline">Michelle (+65 8264 0091)</h4>
            <h4 className="my-2">Before reaching out to us, please read the FAQs below.</h4>
            <h4>Want to report a bug? Email us at <span className="font-semibold underline">nuansacp.tech@gmail.com</span></h4>
          </div>
        </div>
      </div>
      <div className="relative left-0 right-0 px-8 sm:px-32 py-16 sm:py-24 space-y-16 text-sm sm:text-base">
        <section id="login" className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Where can I find my email and ticket code?
          </h2>
          <div className="space-y-4">
            <p>
              Within 72 hours after purchasing your tickets from our store page,{" "}
              you should receive a confirmation email with subject "NUANSA 2025 Ticket Purchase Confirmation".
            </p>
            <p>
              This email will be sent to the email address you entered previously in our purchase form.
            </p>
            <p>
              To log into our system, you must use this email address and the ticket code provided inside the confirmation email.{" "}
              This ticket code should be a 8-character string.
            </p>
            <p>
              If you can't find this email, please check your Spam folder as it might accidentally got flagged as spam.
            </p>
            <p>
              If you still can't find it, please contact us via WhatsApp:{" "}
              <span className="font-semibold">Kacey (+65 9249 8978)</span> or{" "}
              <span className="font-semibold">Michelle (+65 8264 0091)</span>.
            </p>
          </div>
        </section>
        <section id="selection-issues" className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Why can't I reserve my seat selection?
          </h2>
          <div className="space-y-4">
            <p>
              Your selection must satisfy a few requirements before you can confirm it:
            </p>
            <ul className="pl-4 sm:pl-8 list-disc space-y-2">
              <li>For each seat category, the amount of seats selected must match exactly the amount you have specified when you bought your ticket.</li>
              <li>Partial reservation is not allowed; you can only make the reservation once for the entire amount of seats you have bought.</li>
              <li>
                To avoid having "isolated" seats (where the left and right side of the seat are occupied), we might reject a selection that makes another seat get isolated.{" "}
                This is so that our seats are being occupied more efficiently.
              </li>
            </ul>
            <p>
              After fulfilling these requirements, only then can the selection be confirmed.
            </p>
            <p>
              Do note that clicking the confirm button does NOT guarantee your reservation to be final.{" "}
              Your selection may be cancelled due to the following reasons:
            </p>
            <ul className="pl-4 sm:pl-8 list-disc space-y-2">
              <li>Someone else has taken one or more seats from your selection (first-come-first-serve).</li>
              <li>Your browser is out-of-sync with our server and needs to be reloaded.</li>
              <li>A network or server issue occurred during the confirmation.</li>
            </ul>
            <p>
              In such cases, you can still retry confirming your selection.
            </p>
            <p>
              If your reservation is successful, you will be redirected to a confirmation/thank-you page.{" "}
              You will also receive a seat confirmation email within 72 hours.
            </p>
          </div>
        </section>
        <section id="find-confirmation-email" className="space-y-8">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            I can't find the confirmation email for my reservation.
          </h2>
          <div className="space-y-4">
            <p>
              After completing the seat selection process on this website,{" "}
              the confirmation email for your seat reservation will be sent to you within 72 hours.
            </p>
            <p>
              If you can't find this email, please check your Spam folder as it might accidentally got flagged as spam.
            </p>
            <p>
              If you still can't find it, please contact us via WhatsApp:{" "}
              <span className="font-semibold">Kacey (+65 9249 8978)</span> or{" "}
              <span className="font-semibold">Michelle (+65 8264 0091)</span>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
