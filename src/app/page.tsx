"use client";

import { useState, useEffect, useRef } from "react";
import DynamicIsland from "@/components/DynamicIsland";

interface LetterTransform {
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<string>("");
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  // Mouse & physics tracking
  const targetPos = useRef({ x: -1000, y: -1000 });
  const currentPos = useRef({ x: -1000, y: -1000 });
  const prevPos = useRef({ x: -1000, y: -1000 });

  // DOM refs
  const fluidOrbRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const letterBoxes = useRef<{ cx: number; cy: number }[]>([]);

  const nameLetters = "DHEERAJ".split("");

  useEffect(() => {
    setMounted(true);

    const initX = window.innerWidth * 0.5;
    const initY = window.innerHeight * 0.45;
    targetPos.current = { x: initX, y: initY };
    currentPos.current = { x: initX, y: initY };
    prevPos.current = { x: initX, y: initY };

    // Update letter center positions
    const updateLetterBounds = () => {
      letterBoxes.current = letterRefs.current.map((el) => {
        if (!el) return { cx: 0, cy: 0 };
        const rect = el.getBoundingClientRect();
        return {
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
        };
      });
    };

    updateLetterBounds();
    window.addEventListener("resize", updateLetterBounds);

    // Mouse & touch handlers
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Live clock
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // 120fps Animation Loop with Viscous Liquid Physics
    let animationFrameId: number;

    const animate = () => {
      // 1. Lerp cursor for viscous fluid delay (inertia)
      const lerpFactor = 0.14;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpFactor;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpFactor;

      // 2. Calculate velocity for organic droplet stretch
      const vx = currentPos.current.x - prevPos.current.x;
      const vy = currentPos.current.y - prevPos.current.y;
      prevPos.current = { x: currentPos.current.x, y: currentPos.current.y };

      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx);
      const stretchX = Math.min(1 + speed * 0.012, 1.45);
      const stretchY = Math.max(1 - speed * 0.008, 0.72);

      // 3. Update Fluid Orb Position & Fluid Deformation
      if (fluidOrbRef.current) {
        fluidOrbRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${stretchX}, ${stretchY})`;
      }

      // 4. Magnetic Lift & Fluid Pull on each letter
      const magneticRadius = 260; // Influence distance in pixels

      letterRefs.current.forEach((el, index) => {
        if (!el || !letterBoxes.current[index]) return;

        const { cx, cy } = letterBoxes.current[index];
        const dx = currentPos.current.x - cx;
        const dy = currentPos.current.y - cy;
        const dist = Math.hypot(dx, dy);

        if (dist < magneticRadius) {
          // Non-linear cubic magnetic attraction curve
          const power = Math.pow(1 - dist / magneticRadius, 1.6);
          const pullX = dx * power * 0.38;
          // Upward magnetic levitation force + attraction
          const pullY = dy * power * 0.38 - power * 22;
          const scale = 1 + power * 0.16;
          const rotate = (dx / magneticRadius) * 16 * power;

          el.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
          el.style.textShadow = `0 ${power * 16}px ${power * 24}px rgba(86, 62, 59, 0.18), 0 0 ${power * 30}px rgba(255, 175, 55, 0.4)`;
          el.style.color = power > 0.45 ? "#ffaf37" : "#563e3b";
        } else {
          // Smooth return to resting state
          el.style.transform = `translate3d(0, 0, 0) scale(1) rotate(0deg)`;
          el.style.textShadow = `none`;
          el.style.color = "#563e3b";
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateLetterBounds);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      clearInterval(clockInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Click / Tap creates a fluid shockwave ripple
  const handleCanvasClick = (e: React.MouseEvent) => {
    const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
    setRipples((prev) => [...prev.slice(-3), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 900);
  };

  return (
    <main
      onClick={handleCanvasClick}
      className="relative flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#fffaf0] p-4 sm:p-8 text-[#563e3b] select-none cursor-default"
    >
      {/* 1. TACTILE PAPER GRAIN TEXTURE */}
      <svg
        className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.045] mix-blend-multiply z-30"
        aria-hidden="true"
      >
        <filter id="paper-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#paper-grain)" />
      </svg>

      {/* 2. LIQUID FLUID ORB (Magnetic Viscous Liquid Droplet) */}
      <div
        ref={fluidOrbRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 h-[480px] w-[480px] rounded-full will-change-transform z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 175, 55, 0.32) 0%, rgba(255, 175, 55, 0.16) 35%, rgba(243, 233, 216, 0.12) 60%, transparent 75%)",
          filter: "blur(36px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Viscous Magnetic Specular Core (follows closely like liquid mercury) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 h-40 w-40 rounded-full blur-2xl z-10 opacity-70"
        style={{
          transform: `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0) translate(-50%, -50%)`,
          background: "radial-gradient(circle, rgba(255, 175, 55, 0.4) 0%, transparent 70%)",
          transition: "transform 80ms ease-out",
        }}
      />

      {/* 3. FLUID LIQUID RIPPLES (Spawn on click) */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none fixed rounded-full border border-[#ffaf37]/60 animate-ping z-20"
          style={{
            left: r.x,
            top: r.y,
            width: "160px",
            height: "160px",
            transform: "translate(-50%, -50%)",
            animationDuration: "900ms",
          }}
        />
      ))}

      {/* 4. DYNAMIC ISLAND MENU */}
      <DynamicIsland />

      {/* 5. EDITORIAL CORNER ANCHORS */}
      <div className="fixed top-5 left-5 sm:top-8 sm:left-8 z-20 flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#563e3b]/45 font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ffaf37]" />
        <span>{time || "LOCAL TIME"}</span>
      </div>

      <div className="fixed top-5 right-5 sm:top-8 sm:right-8 z-20 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#563e3b]/45 font-medium">
        <span>ED. 2026 • SOLARE</span>
      </div>

      <div className="fixed bottom-5 left-5 sm:bottom-8 sm:left-8 z-20 flex items-center gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#563e3b]/45 font-medium">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ffaf37] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ffaf37]" />
        </span>
        <span className="hidden sm:inline">AVAILABLE FOR WORK</span>
        <span className="sm:hidden">AVAILABLE</span>
      </div>

      <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-20 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#563e3b]/45 font-medium">
        <span>DEV & DESIGN</span>
      </div>

      {/* 6. CENTERPIECE: MAGNETIC LIQUID LETTERFORMS */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        <h1 className="font-[family-name:var(--font-serif)] text-[clamp(3.8rem,16vw,16rem)] font-normal italic leading-none tracking-[-0.03em] text-[#563e3b] text-center select-none">
          {nameLetters.map((letter, index) => (
            <span
              key={index}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              className="inline-block transition-transform duration-100 ease-out will-change-transform cursor-pointer"
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>
    </main>
  );
}
