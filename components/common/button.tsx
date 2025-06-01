// Animations credited to https://buttons.ibelick.com/

import React, { ReactNode } from "react";

export const FancyButton: React.FC<{
  variant: "white",
  sizeClass: string,
  children: ReactNode,
  onClick?: () => void,
}> = ({ variant, sizeClass, children, onClick }) => {
  // Only white variant for now
  return (
    <button
      className={`cursor-pointer group relative overflow-hidden bg-transparent border-2 border-foreground transition-colors duration-500 ${sizeClass}`}
      onClick={onClick}
    >
      <span className="relative z-10 transition-colors duration-500 text-foreground group-hover:text-background">
        {children}
      </span>
      <span className="absolute inset-0 overflow-hidden pointer-events-none">
        <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-foreground transition-all duration-500 group-hover:-translate-x-0 group-hover:scale-150"></span>
      </span>
    </button>
  );
};

export const RegularButton: React.FC<{
  variant: "black",
  buttonClass: string,
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>,
  children: ReactNode,
  onClick?: () => void,
}> = ({ variant, buttonClass, children, onClick, buttonProps }) => {
  // Only black variant for now
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <button
        className={`
          relative bg-[#222222] ring-[#222222]/50 group transition-all duration-150
          ${buttonProps?.disabled ? "cursor-progress" : "cursor-pointer active:ring-8"}
          ${buttonClass}
        `}
        onClick={onClick}
        {...buttonProps}
      >
        <span className="relative z-10 text-foreground">
          {children}
        </span>
        <span className="absolute inset-0 overflow-hidden pointer-events-none bg-transparent group-hover:bg-white/10 duration-300" />
      </button>
    </div>
  );
};

export const InlineButton: React.FC<{
  children: string,
  onClick?: () => void,
}> = ({ children, onClick }) => {
  return (
    <span
      className="cursor-pointer underline underline-offset-2 decoration-1 hover:decoration-2 hover:animate-pulse"
      onClick={onClick}
    >
      {children}
    </span>
  );
};
