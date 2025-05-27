"use client"

import { FancyButton } from "@/components/common/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  const [dialogIsOpen, setDialogIsOpen] = React.useState(false);

  const openDialog = () => {setDialogIsOpen(true)};
  const closeDialog = () => {setDialogIsOpen(false)};

  return (
    <>
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/landing/background.jpg" alt="Background" fill
          className="blur-xs object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/60" />
      </div>
      <div className="w-[720px] max-w-[calc(100% - 60px)] h-2/3 flex flex-col items-center text-center">
        <div className="flex flex-col items-center space-y-1">
          <h1 className="text-4xl font-semibold tracking-wide mx-4">NUANSA Cultural Production</h1>
          <h3 className="text-2xl font-medium tracking-wide">presents</h3>
        </div>
        <div className="relative flex-1 w-full">
          <Image
            src="/images/landing/the-crying-stone.png" alt="The Crying Stone" fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <p className="text-lg font-extralight mx-4">Early bird sale ends on 1 July. Limited seats available.</p>
          <FancyButton variant="white" sizeClass="w-[320px] h-[48px] max-w-full" onClick={openDialog}>
            <span className="text-xl font-medium tracking-wide">Reserve my seats now!</span>
          </FancyButton>
        </div>
      </div>
      <div className="hidden text-center">
        <h2>Looking to buy tickets?</h2>
        <div>
          <p>By clicking below, you will be redirected to our store front page.</p>
          <p>You will be able to choose your seat allocation on this website after we have sent you a confirmation email for your purchase. This may take up to 72 hours after transaction.</p>
        </div>
        <button>Take me to the store!</button>
        <Link href="/login">
          <p>I have purchased my tickets and have received a confirmation email!</p>
        </Link>
      </div>
    </>
  );
}
