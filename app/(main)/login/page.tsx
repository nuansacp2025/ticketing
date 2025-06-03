"use client"

import { InlineButton, RegularButton } from "@/components/common/button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form"

interface LoginInputs {
  email: string,
  ticketCode: string,
}

export default function Page() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInputs>()

  const [submitLoading, setSubmitLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState("");

  const handleLogin: SubmitHandler<LoginInputs> = (data) => {
    setSubmitLoading(true);
    setLoginError("");
    fetch("/api/loginUser", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
    }).then(res => {
      if (res.ok) {
        router.push("/ticket");
      }
      else if (res.status === 401) throw new Error("Incorrect email or ticket code.");
      else if (res.status === 500) throw new Error("An internal error occurred, please try again.");
      else throw new Error("An unknown error occurred, please try again.");
    }).catch(err => {
      setLoginError(err.message);
    }).finally(() => {
      setSubmitLoading(false);
    })
  };

  return (
    <div className="w-full max-w-[720px] min-h-2/3 m-8 p-8 sm:p-16 flex flex-col items-center justify-center rounded-2xl bg-[#EEEEEE] text-background">
      <form onSubmit={handleSubmit(handleLogin)}>
        <div className="w-full h-full flex flex-col items-center justify-between space-y-8 text-center">
          <h2 className="px-4 text-2xl sm:text-3xl font-medium">Thank you for your purchase!</h2>
          <p className="px-4 text-xs sm:text-sm font-light">To continue, please enter your details below.</p>        
          <div className="mx-0.5 w-full space-y-4">
            <div className="space-y-1">
              <input
                {...register("email", { required: "Email address is required" })}
                name="email" type="email" placeholder="Email address"
                aria-invalid={errors.email ? "true" : "false"}
                className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] placeholder-[#3E3E3E] text-background transition-all duration-300 focus:bg-[#DDDDDD] ring-[#3E3E3E] focus:ring-2 outline-0"
              />
              {errors.email &&
                <p role="alert" className="text-red-500 text-xs sm:text-sm text-left">{errors.email.message as string}</p>
              }
            </div>
            <div className="space-y-1">
              <input
                {...register("ticketCode", { required: "Ticket code is required" })}
                name="ticketCode" type="string" placeholder="Ticket code"
                aria-invalid={errors.ticketCode ? "true" : "false"}
                className="w-full p-3 rounded-lg text-sm sm:text-base bg-[#CCCCCC] placeholder-[#3E3E3E] text-background transition-all duration-300 focus:bg-[#DDDDDD] ring-[#3E3E3E] focus:ring-2 outline-0"
              />
              {errors.ticketCode &&
                <p role="alert" className="text-red-500 text-xs sm:text-sm text-left">{errors.ticketCode.message as string}</p>
              }
            </div>
            
          </div>
          <Link href="/help#find-ticket-code" rel="noopener noreferrer" target="_blank">
            <p className="text-xs sm:text-sm font-light">
              <InlineButton>
                How do I find my ticket code?
              </InlineButton>
            </p>
          </Link>
          <div className="w-full flex flex-col space-y-1">
            <RegularButton
              variant="black"
              buttonClass="w-full max-w-[480px] h-[48px] rounded-3xl"
              buttonProps={{ disabled: submitLoading }}
            >
              Submit
            </RegularButton>
            {loginError &&
              <p role="alert" className="text-red-500 text-xs sm:text-sm text-left">{loginError}</p>
            }
          </div>
        </div>
      </form>
    </div>
  );
}
