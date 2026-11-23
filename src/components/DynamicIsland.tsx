"use client";

import { useState, useRef } from "react";
import { X, ArrowUpRight, Sparkles } from "lucide-react";

type Stage = "idle" | "horizontal" | "fullscreen";

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [contentVisible, setContentVisible] = useState(false);
  const isTransitioningRef = useRef(false);

  // Smooth opening sequence: Width -> Height -> Content Fade In
  const handleOpenAbout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioningRef.current || stage !== "idle") return;
    isTransitioningRef.current = true;

    // Phase 1: Expand horizontally
    setStage("horizontal");

    // Phase 2: Drop down vertically to fullscreen
    setTimeout(() => {
      setStage("fullscreen");

      // Phase 3: Fade in content only after vertical expansion completes
      setTimeout(() => {
        setContentVisible(true);
        isTransitioningRef.current = false;
      }, 400);
    }, 320);
  };

  // Smooth closing sequence: Content Fade Out -> Height Collapse -> Width Collapse
  const handleCloseAbout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioningRef.current || stage !== "fullscreen") return;
    isTransitioningRef.current = true;

    // Phase 1: Instantly fade out content to eliminate text reflow
    setContentVisible(false);

    // Phase 2: Roll height back up into the horizontal top bar
    setTimeout(() => {
      setStage("horizontal");

      // Phase 3: Shrink width back into the compact pill
      setTimeout(() => {
        setStage("idle");
        setIsHovered(false);
        isTransitioningRef.current = false;
      }, 380);
    }, 150);
  };

  // Deterministic GPU-friendly styles
  const getStyles = (): React.CSSProperties => {
    if (stage === "fullscreen") {
      return {
        width: "100vw",
        height: "100dvh",
        top: "0px",
        borderRadius: "0px",
        transition:
          "height 420ms cubic-bezier(0.16, 1, 0.3, 1), top 420ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 360ms cubic-bezier(0.16, 1, 0.3, 1), width 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      };
    }

    if (stage === "horizontal") {
      return {
        width: "min(calc(100vw - 2rem), 96vw)",
        height: "48px",
        top: "1rem",
        borderRadius: "9999px",
        transition:
          "width 320ms cubic-bezier(0.16, 1, 0.3, 1), height 380ms cubic-bezier(0.16, 1, 0.3, 1), top 380ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 340ms cubic-bezier(0.16, 1, 0.3, 1)",
      };
    }

    // Idle State
    return {
      width: isHovered ? "160px" : "105px",
      height: isHovered ? "44px" : "38px",
      top: "1.25rem",
      borderRadius: "9999px",
      transition:
        "width 300ms cubic-bezier(0.16, 1, 0.3, 1), height 280ms cubic-bezier(0.16, 1, 0.3, 1), top 300ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 280ms cubic-bezier(0.16, 1, 0.3, 1)",
    };
  };

  return (
    <div
      style={getStyles()}
      onMouseEnter={() => {
        if (stage === "idle" && !isTransitioningRef.current) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (stage === "idle" && !isTransitioningRef.current) setIsHovered(false);
      }}
      onClick={() => {
        if (stage === "idle" && !isTransitioningRef.current) {
          setIsHovered((prev) => !prev);
        }
      }}
      className={`fixed left-1/2 -translate-x-1/2 z-50 bg-[#563e3b] text-[#fffaf0] shadow-xl select-none transform-gpu will-change-[width,height,top,border-radius] ${
        stage === "fullscreen" && contentVisible
          ? "overflow-y-auto p-6 sm:p-12 md:p-16 cursor-default"
          : "overflow-hidden flex items-center justify-center cursor-pointer"
      }`}
    >
      {/* 1. IDLE STATE: MENU or ABOUT */}
      {stage === "idle" && (
        <div className="flex h-full w-full items-center justify-center px-4">
          {!isHovered ? (
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fffaf0] transition-opacity duration-200">
              MENU
            </span>
          ) : (
            <button
              type="button"
              onClick={handleOpenAbout}
              className="animate-fade-in text-xs font-medium tracking-[0.2em] uppercase text-[#fffaf0] transition-colors duration-200 hover:text-[#ffaf37]"
            >
              About
            </button>
          )}
        </div>
      )}

      {/* 2. HORIZONTAL INTERMEDIATE STATE */}
      {stage === "horizontal" && (
        <div className="flex h-full w-full items-center justify-between px-6 animate-fade-in">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#fffaf0]/80">
            DHEERAJ
          </span>
          <span className="text-xs tracking-wider text-[#ffaf37]">
            About
          </span>
        </div>
      )}

      {/* 3. FULLSCREEN ABOUT PAGE CONTENT */}
      {stage === "fullscreen" && (
        <div
          className={`relative mx-auto flex min-h-full max-w-4xl flex-col justify-between transition-all duration-300 ease-out ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          {/* Top Bar inside About */}
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
              className="group flex items-center gap-2 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-4 py-2 text-xs font-medium text-[#fffaf0] transition-all hover:bg-[#ffaf37] hover:border-[#ffaf37] hover:text-[#563e3b] active:scale-95 cursor-pointer"
            >
              <span>Close</span>
              <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
            </button>
          </header>

          {/* Editorial Content */}
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

          {/* Footer */}
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
  );
}
