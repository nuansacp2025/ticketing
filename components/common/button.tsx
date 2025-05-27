import React, { ReactNode } from "react";

export const FancyButton: React.FC<{
  variant: "white",
  sizeClass: string,
  children: ReactNode,
  onClick: () => void,
}> = ({ variant, sizeClass, children, onClick }) => {
  // Only white variant for now
  return (
    <button
      className={`${sizeClass} rounded-3xl bg-transparent outline-2 outline-foreground`}
      onClick={onClick}
    >
      <div className="w-full text-center">
        {children}
      </div>
    </button>
  );
};
