"use client";

import { useState, useRef, useEffect } from "react";
import { X, ArrowUpRight, Sparkles, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/Icons";
import ProjectScanner from "@/components/ProjectScanner";

type Stage = "idle" | "horizontal" | "fullscreen";
type ActiveView = "about" | "projects" | "contact" | null;

export default function DynamicIsland() {
  const [isHovered, setIsHovered] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [activeView, setActiveView] = useState<ActiveView>(null);
  const [contentVisible, setContentVisible] = useState(false);
  const isTransitioningRef = useRef(false);

  // Keyboard accessibility: Escape closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stage === "fullscreen") {
        handleClose(e as unknown as React.MouseEvent);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage]);

  // Smooth opening sequence: Width -> Height -> Content Fade In
  const handleOpenView = (e: React.MouseEvent, view: ActiveView) => {
    e.stopPropagation();
    if (isTransitioningRef.current || stage !== "idle") return;
    isTransitioningRef.current = true;
    setActiveView(view);

    // Phase 1: Expand horizontally
    setStage("horizontal");

    // Phase 2: Drop down vertically to fullscreen
    setTimeout(() => {
      setStage("fullscreen");

      // Phase 3: Fade in content only after vertical expansion completes
      setTimeout(() => {
        setContentVisible(true);
        isTransitioningRef.current = false;
      }, 380);
    }, 300);
  };

  // Smooth closing sequence: Content Fade Out -> Height Collapse -> Width Collapse
  const handleClose = (e: React.MouseEvent) => {
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
        setActiveView(null);
        setIsHovered(false);
        isTransitioningRef.current = false;
      }, 350);
    }, 120);
  };

  // Deterministic GPU-friendly styles
  const getStyles = (): React.CSSProperties => {
    if (stage === "fullscreen") {
      return {
        width: "100vw",
        height: "100dvh",
        top: "0px",
        borderRadius: "0px",
        transform: "translate3d(-50%, 0, 0)",
        transition:
          "height 400ms cubic-bezier(0.16, 1, 0.3, 1), top 400ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 340ms cubic-bezier(0.16, 1, 0.3, 1), width 300ms cubic-bezier(0.16, 1, 0.3, 1)",
      };
    }

    if (stage === "horizontal") {
      return {
        width: "min(calc(100vw - 2rem), 96vw)",
        height: "48px",
        top: "1rem",
        borderRadius: "9999px",
        transform: "translate3d(-50%, 0, 0)",
        transition:
          "width 300ms cubic-bezier(0.16, 1, 0.3, 1), height 360ms cubic-bezier(0.16, 1, 0.3, 1), top 360ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 320ms cubic-bezier(0.16, 1, 0.3, 1)",
      };
    }

    // Idle State (Mobile responsive width: min(280px, calc(100vw - 2rem)))
    return {
      width: isHovered ? "min(280px, calc(100vw - 2rem))" : "105px",
      height: isHovered ? "46px" : "38px",
      top: "1.25rem",
      borderRadius: "9999px",
      transform: "translate3d(-50%, 0, 0)",
      transition:
        "width 280ms cubic-bezier(0.16, 1, 0.3, 1), height 260ms cubic-bezier(0.16, 1, 0.3, 1), top 280ms cubic-bezier(0.16, 1, 0.3, 1), border-radius 260ms cubic-bezier(0.16, 1, 0.3, 1)",
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
      className={`fixed left-1/2 z-50 bg-[#563e3b] text-[#fffaf0] shadow-xl select-none transform-gpu will-change-[width,height,top,border-radius,transform] touch-manipulation overflow-hidden ${
        stage === "fullscreen" && contentVisible
          ? activeView === "projects"
            ? "p-0 py-3 sm:py-5 cursor-default"
            : "p-4 sm:p-6 md:p-8 cursor-default"
          : "flex items-center justify-center cursor-pointer"
      }`}
    >
      {/* 1. IDLE STATE: MENU OR [ABOUT • PROJECTS • CONTACT] */}
      {stage === "idle" && (
        <div className="flex h-full w-full items-center justify-center px-3">
          {!isHovered ? (
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#fffaf0] transition-opacity duration-200">
              MENU
            </span>
          ) : (
            <nav className="animate-fade-in flex items-center gap-3 sm:gap-4.5 text-xs font-medium tracking-[0.16em] uppercase text-[#fffaf0]">
              <button
                type="button"
                onClick={(e) => handleOpenView(e, "about")}
                className="transition-colors duration-150 hover:text-[#ffaf37] active:scale-95 cursor-pointer py-1.5"
              >
                About
              </button>
              <span className="text-[#fffaf0]/25 select-none text-[10px]">•</span>
              <button
                type="button"
                onClick={(e) => handleOpenView(e, "projects")}
                className="transition-colors duration-150 hover:text-[#ffaf37] active:scale-95 cursor-pointer py-1.5"
              >
                Projects
              </button>
              <span className="text-[#fffaf0]/25 select-none text-[10px]">•</span>
              <button
                type="button"
                onClick={(e) => handleOpenView(e, "contact")}
                className="transition-colors duration-150 hover:text-[#ffaf37] active:scale-95 cursor-pointer py-1.5"
              >
                Contact
              </button>
            </nav>
          )}
        </div>
      )}

      {/* 2. HORIZONTAL INTERMEDIATE STATE */}
      {stage === "horizontal" && (
        <div className="flex h-full w-full items-center justify-between px-6 animate-fade-in">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#fffaf0]/80">
            DHEERAJ
          </span>
          <span className="text-xs tracking-wider text-[#ffaf37] capitalize">
            {activeView}
          </span>
        </div>
      )}

      {/* 3. FULLSCREEN VIEWS */}
      {stage === "fullscreen" && (
        <div
          className={`relative mx-auto flex h-full max-h-full w-full flex-col justify-between overflow-hidden transition-all duration-300 ease-out ${
            contentVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3 pointer-events-none"
          }`}
        >
          {/* Top Bar inside Fullscreen */}
          <header className={`flex w-full items-center justify-between pb-3 sm:pb-4 border-b border-[#fffaf0]/15 shrink-0 ${
            activeView === "projects" ? "max-w-6xl mx-auto px-4 sm:px-6 md:px-8" : "max-w-4xl mx-auto px-4 sm:px-6 w-full"
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#ffaf37]" />
              <span className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#fffaf0]">
                {activeView === "about" && "About Dheeraj"}
                {activeView === "projects" && "Selected Projects"}
                {activeView === "contact" && "Get in Touch"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="group flex min-h-[40px] items-center gap-2 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-4 sm:px-5 py-1.5 text-xs font-medium text-[#fffaf0] transition-all hover:bg-[#ffaf37] hover:border-[#ffaf37] hover:text-[#563e3b] active:scale-95 cursor-pointer"
            >
              <span>Close</span>
              <X className="h-3.5 w-3.5 transition-transform group-hover:rotate-90 duration-200" />
            </button>
          </header>

          {/* VIEW 1: ABOUT */}
          {activeView === "about" && (
            <main className="my-auto py-2 sm:py-6 overflow-hidden flex-1 flex flex-col justify-center min-h-0 max-w-4xl mx-auto px-4 sm:px-6 w-full">
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ffaf37] font-semibold">
                Editorial Biography
              </span>

              <h2 className="mt-2 font-[family-name:var(--font-serif)] text-2xl sm:text-4xl md:text-5xl italic leading-tight tracking-tight text-[#fffaf0]">
                Crafting thoughtful digital interfaces and engineering scalable web systems.
              </h2>

              <div className="mt-4 sm:mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 text-xs sm:text-sm md:text-base leading-relaxed text-[#fffaf0]/80">
                <p>
                  I'm Dheeraj, a software developer and designer passionate about creating minimal, elegant, and highly performant digital products. I combine editorial visual sensibilities with rigorous engineering principles.
                </p>
                <p>
                  Specializing in React, Next.js, TypeScript, and modern frontend architecture, I focus on intuitive user experiences, fluid motion, and resilient system design.
                </p>
              </div>

              {/* Core Disciplines */}
              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#fffaf0]/15">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#fffaf0]/50 font-medium">
                  Core Disciplines
                </span>
                <div className="mt-3 flex flex-wrap gap-2">
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
                      className="rounded-full border border-[#fffaf0]/15 bg-[#fffaf0]/5 px-3 py-1 text-[11px] sm:text-xs font-medium text-[#fffaf0]/90"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </main>
          )}

          {/* VIEW 2: PROJECTS */}
          {activeView === "projects" && (
            <main className="w-full flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-1">
              <div className="text-center mb-1 shrink-0 px-4">
                <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ffaf37] font-semibold">
                  Interactive Projects Stream
                </span>
                <h2 className="mt-0.5 font-[family-name:var(--font-serif)] text-xl sm:text-3xl md:text-4xl italic leading-tight tracking-tight text-[#fffaf0]">
                  Scan to reveal source code.
                </h2>
              </div>

              {/* The Evervault Card Scanner - Full Screen End to End with 3D Circular Orbit */}
              <ProjectScanner />
            </main>
          )}

          {/* VIEW 3: CONTACT */}
          {activeView === "contact" && (
            <main className="my-auto py-2 sm:py-6 overflow-hidden flex-1 flex flex-col justify-center min-h-0 max-w-4xl mx-auto px-4 sm:px-6 w-full">
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#ffaf37] font-semibold">
                Direct Communication
              </span>

              <h2 className="mt-2 font-[family-name:var(--font-serif)] text-2xl sm:text-4xl md:text-5xl italic leading-tight tracking-tight text-[#fffaf0]">
                Let's start a conversation.
              </h2>

              <p className="mt-3 sm:mt-4 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed text-[#fffaf0]/80">
                Whether you have an inquiry about a prospective project, an engineering role, or simply want to say hello, feel free to connect anytime.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <a
                  href="mailto:contact@dheeraj.dev"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[#ffaf37] px-6 py-2.5 sm:py-3 text-xs font-semibold uppercase tracking-wider text-[#563e3b] transition hover:bg-[#ffbe53] active:scale-95"
                >
                  <Mail className="h-4 w-4" />
                  <span>contact@dheeraj.dev</span>
                </a>

                <div className="flex items-center gap-3">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/5 text-[#fffaf0] transition hover:bg-[#fffaf0]/15 hover:text-[#ffaf37]"
                    aria-label="GitHub profile"
                  >
                    <GithubIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/5 text-[#fffaf0] transition hover:bg-[#fffaf0]/15 hover:text-[#ffaf37]"
                    aria-label="LinkedIn profile"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </main>
          )}

          {/* Footer inside Fullscreen */}
          <footer className={`flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-[#fffaf0]/15 text-xs text-[#fffaf0]/60 shrink-0 ${
            activeView === "projects" ? "max-w-6xl mx-auto px-4 sm:px-6 md:px-8" : "max-w-4xl mx-auto px-4 sm:px-6 w-full"
          }`}>
            <span>Available for select freelance & full-time opportunities</span>
            <a
              href="mailto:contact@dheeraj.dev"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#ffaf37] hover:underline"
            >
              <span>contact@dheeraj.dev</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </footer>
        </div>
      )}
    </div>
  );
}
