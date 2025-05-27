import React, { ReactNode } from "react";

export const FancyButton: React.FC<{
  variant: "white",
  sizeClass: string,
  children: ReactNode,
  onClick: () => void,
}> = ({ variant, sizeClass, children, onClick }) => {
  // Only white variant for now
  // Animation: https://buttons.ibelick.com/
  return (
    <button
      className={`group relative overflow-hidden rounded-3xl bg-transparent outline-2 outline-foreground transition-colors duration-500 ${sizeClass}`}
      onClick={onClick}
    >
      <span className="relative z-10 transition-colors duration-500 group-hover:text-background">
        {children}
      </span>
      <span className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-foreground transition-all duration-500 group-hover:-translate-x-0 group-hover:scale-150"></span>
      </span>
    </button>
  );
};
