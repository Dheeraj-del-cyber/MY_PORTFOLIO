"use client";

import { useState } from "react";
import { X, ArrowUpRight, Sparkles } from "lucide-react";

type IslandStage = "idle" | "horizontal" | "fullscreen";

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [stage, setStage] = useState<IslandStage>("idle");

  const handleOpenAbout = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Step 1: Expand horizontally
    setStage("horizontal");

    // Step 2: Drop down vertically to fullscreen
    setTimeout(() => {
      setStage("fullscreen");
    }, 280);
  };

  const handleCloseAbout = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Step 1: Collapse vertically to horizontal bar
    setStage("horizontal");

    // Step 2: Collapse horizontally to compact pill
    setTimeout(() => {
      setStage("idle");
      setIsHovered(false);
    }, 280);
  };

  // Determine dynamic classes based on stage and hover
  const getContainerClasses = () => {
    if (stage === "fullscreen") {
      return "fixed inset-0 z-50 h-[100dvh] w-screen rounded-none bg-[#563e3b] text-[#fffaf0] p-6 sm:p-12 md:p-16 overflow-y-auto";
    }
    if (stage === "horizontal") {
      return "fixed top-3 sm:top-5 left-2 sm:left-4 right-2 sm:right-4 z-50 h-[48px] rounded-full bg-[#563e3b] text-[#fffaf0] px-6 flex items-center justify-between";
    }
    // Idle state
    return `fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center rounded-full border border-[#563e3b]/10 bg-[#563e3b] text-[#fffaf0] shadow-md transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] select-none transform-gpu will-change-[width,height,transform] ${
      isHovered
        ? "w-[150px] sm:w-[180px] h-[46px] px-4"
        : "w-[105px] h-[38px] px-4 hover:scale-[1.03] active:scale-95"
    }`;
  };

  return (
    <>
      <div
        onMouseEnter={() => {
          if (stage === "idle") setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (stage === "idle") setIsHovered(false);
        }}
        onClick={(e) => {
          if (stage === "idle") {
            setIsHovered((prev) => !prev);
          }
        }}
        className={`${getContainerClasses()} transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer`}
      >
        {/* IDLE STATE: Collapsed or Hovered with "About" */}
        {stage === "idle" && (
          <>
            {!isHovered ? (
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fffaf0] transition-opacity duration-300">
                MENU
              </span>
            ) : (
              <span
                onClick={handleOpenAbout}
                className="animate-fade-in text-xs font-medium tracking-[0.2em] uppercase text-[#fffaf0] transition-colors duration-200 hover:text-[#ffaf37]"
              >
                About
              </span>
            )}
          </>
        )}

        {/* TRANSITIONING HORIZONTALLY */}
        {stage === "horizontal" && (
          <div className="flex w-full items-center justify-between animate-fade-in">
            <span className="text-xs font-semibold tracking-widest uppercase text-[#fffaf0]/70">
              DHEERAJ
            </span>
            <span className="text-xs tracking-wider text-[#ffaf37]">
              Opening...
            </span>
          </div>
        )}

        {/* FULLSCREEN ABOUT PAGE */}
        {stage === "fullscreen" && (
          <div className="relative mx-auto flex min-h-full max-w-4xl flex-col justify-between animate-fade-in cursor-default">
            {/* Top Navigation inside Fullscreen About */}
            <header className="flex w-full items-center justify-between pb-8 border-b border-[#fffaf0]/15">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#ffaf37]" />
                <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#fffaf0]">
                  About Dheeraj
                </span>
              </div>

              <button
                type="button"
                onClick={handleCloseAbout}
                className="group flex items-center gap-2 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-4 py-1.5 text-xs font-medium text-[#fffaf0] transition-all hover:bg-[#ffaf37] hover:border-[#ffaf37] hover:text-[#563e3b] active:scale-95"
              >
                <span>Close</span>
                <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
              </button>
            </header>

            {/* Main Editorial About Content */}
            <main className="my-auto py-10 sm:py-16">
              <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#ffaf37] font-semibold">
                Editorial Biography
              </span>

              <h2 className="mt-3 font-[family-name:var(--font-serif)] text-3xl sm:text-5xl md:text-6xl italic leading-tight tracking-tight text-[#fffaf0]">
                Crafting thoughtful digital interfaces and engineering scalable web systems.
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 text-sm sm:text-base leading-relaxed text-[#fffaf0]/80">
                <p>
                  I'm Dheeraj, a software developer and designer passionate about creating minimal, elegant, and highly performant digital products. I combine editorial visual sensibilities with rigorous engineering principles.
                </p>
                <p>
                  Specializing in React, Next.js, TypeScript, and modern frontend architecture, I focus on intuitive user experiences, fluid motion, and resilient system design.
                </p>
              </div>

              {/* Core Disciplines */}
              <div className="mt-12 pt-8 border-t border-[#fffaf0]/15">
                <span className="text-xs uppercase tracking-widest text-[#fffaf0]/50 font-medium">
                  Core Disciplines
                </span>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  {[
                    "Next.js & React",
                    "TypeScript",
                    "Full-Stack Engineering",
                    "Creative Interaction",
                    "Tailwind CSS",
                    "Performance Optimization",
                    "Scalable Architecture",
                  ].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[#fffaf0]/15 bg-[#fffaf0]/5 px-3.5 py-1 text-xs font-medium text-[#fffaf0]/90"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </main>

            {/* Footer inside Fullscreen About */}
            <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#fffaf0]/15 text-xs text-[#fffaf0]/60">
              <span>Available for select freelance & full-time opportunities</span>
              <a
                href="mailto:contact@dheeraj.dev"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ffaf37] hover:underline"
              >
                <span>Get in touch via email</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}
