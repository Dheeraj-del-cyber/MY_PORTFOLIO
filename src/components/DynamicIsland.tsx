"use client";

import { useState } from "react";

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsHovered((prev) => !prev)}
        className={`relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#563e3b]/10 bg-[#563e3b] text-[#fffaf0] shadow-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none transform-gpu will-change-[width,height,transform] ${
          isHovered
            ? "w-[280px] sm:w-[350px] h-[50px] px-6"
            : "w-[105px] h-[38px] px-4 hover:scale-[1.03] active:scale-95"
        }`}
      >
        {!isHovered ? (
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fffaf0] transition-opacity duration-300">
            MENU
          </span>
        ) : null}
      </div>
    </div>
  );
}
