"use client"

import { FancyButton, InlineButton, RegularButton } from "@/components/common/button";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const openDialog = () => { setDialogIsOpen(true) };
  const closeDialog = () => { setDialogIsOpen(false) };

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/landing/background.jpg" alt="Background" fill
          className="blur-xs object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/60" />
      </div>
      <div className="w-full max-w-[720px] h-2/3 m-8 flex flex-col items-center text-center">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold mx-4">NUANSA Cultural Production</h1>
          <h3 className="text-xl sm:text-2xl font-medium">presents</h3>
        </div>
        <div className="relative flex-1 w-full">
          <Image
            src="/images/landing/the-crying-stone.png" alt="The Crying Stone" fill
            className="object-contain"
          />
        </div>
        <div className="space-y-4">
          <p className="text-md sm:text-lg font-extralight mx-4">Early bird sale ends on 1 July. Limited seats available.</p>
          <FancyButton variant="white" sizeClass="w-full max-w-[480px] h-[48px] rounded-3xl" onClick={openDialog}>
            <span className="text-lg sm:text-xl font-medium">Reserve my seats now!</span>
          </FancyButton>
        </div>
      </div>
      <Dialog open={dialogIsOpen} onClose={closeDialog} className="relative z-10">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center text-background text-center">
          <DialogPanel className="w-full max-w-[720px] min-h-2/3 m-8 flex flex-col items-center justify-center bg-[#EEEEEE] rounded-2xl">
            <div className="h-full max-h-[540px] m-12 sm:m-24 flex flex-col items-center justify-between space-y-8">
              <DialogTitle className="px-4 text-3xl sm:text-4xl font-medium">Looking to buy tickets?</DialogTitle>
              <div className="px-4 text-sm sm:text-md font-light space-y-2">
                <p>By clicking below, you will be redirected to our store front page.</p>
                <p>You will be able to choose your seat allocation on this website after we have sent you a confirmation email for your purchase. This may take up to 72 hours after transaction.</p>
              </div>
              <div className="w-full space-y-2">
                <RegularButton variant="black" sizeClass="w-full max-w-[480px] h-[48px] rounded-3xl">
                  <span className="text-md sm:text-lg font-medium">Take me to the store!</span>
                </RegularButton>
                <Link href="/login">
                  <p className="px-4 text-sm sm:text-md">
                    <InlineButton>
                      I have purchased my tickets and have received a confirmation email!
                    </InlineButton>
                  </p>
                </Link>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
