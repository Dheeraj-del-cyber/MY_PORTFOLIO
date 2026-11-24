"use client";

import { useEffect, useRef, useState } from "react";
import DynamicIsland from "@/components/DynamicIsland";
import ShadowRunner from "@/components/ShadowRunner";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  // Mouse & physics tracking (runs entirely outside React state to avoid re-renders)
  const targetPos = useRef({ x: -2000, y: -2000 });
  const currentPos = useRef({ x: -2000, y: -2000 });
  const prevPos = useRef({ x: -2000, y: -2000 });

  // DOM element refs
  const fluidOrbRef = useRef<HTMLDivElement>(null);
  const specularOrbRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const letterBoxes = useRef<{ cx: number; cy: number }[]>([]);
  const letterActive = useRef<boolean[]>([]);

  const nameLetters = "DHEERAJ".split("");

  useEffect(() => {
    setMounted(true);

    const initX = window.innerWidth * 0.5;
    const initY = window.innerHeight * 0.45;
    targetPos.current = { x: initX, y: initY };
    currentPos.current = { x: initX, y: initY };
    prevPos.current = { x: initX, y: initY };
    letterActive.current = new Array(nameLetters.length).fill(false);

    // Cache letter centers
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
    window.addEventListener("resize", updateLetterBounds, { passive: true });

    // Passive touch & mouse listeners for maximum frame rate
    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetPos.current.x = e.touches[0].clientX;
        targetPos.current.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      // Gently return to center when finger lifts
      targetPos.current.x = window.innerWidth * 0.5;
      targetPos.current.y = window.innerHeight * 0.45;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    // 120fps Hardware-Accelerated Animation Loop
    let animationFrameId: number;

    const animate = () => {
      // 1. Viscous inertia lerp (linear interpolation)
      const lerp = 0.16;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerp;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerp;

      // 2. Velocity computation for organic droplet stretch
      const vx = currentPos.current.x - prevPos.current.x;
      const vy = currentPos.current.y - prevPos.current.y;
      prevPos.current.x = currentPos.current.x;
      prevPos.current.y = currentPos.current.y;

      const speed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx);
      const stretchX = Math.min(1 + speed * 0.01, 1.35);
      const stretchY = Math.max(1 - speed * 0.007, 0.75);

      // 3. Update Ambient Fluid Orb (Zero React re-render)
      if (fluidOrbRef.current) {
        fluidOrbRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%) rotate(${angle}rad) scale(${stretchX}, ${stretchY})`;
      }

      // 4. Update Specular Core (Zero React re-render)
      if (specularOrbRef.current) {
        specularOrbRef.current.style.transform = `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // 5. Magnetic Levitation Physics for Letters
      const magneticRadius = 240;

      for (let i = 0; i < letterRefs.current.length; i++) {
        const el = letterRefs.current[i];
        const box = letterBoxes.current[i];
        if (!el || !box) continue;

        const dx = currentPos.current.x - box.cx;
        const dy = currentPos.current.y - box.cy;
        const dist = Math.hypot(dx, dy);

        if (dist < magneticRadius) {
          letterActive.current[i] = true;
          // Smooth power falloff
          const power = Math.pow(1 - dist / magneticRadius, 1.5);
          const pullX = dx * power * 0.35;
          const pullY = dy * power * 0.35 - power * 20;
          const scale = 1 + power * 0.14;
          const rotate = (dx / magneticRadius) * 14 * power;

          // Pure GPU compositing properties
          el.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
          el.style.color = power > 0.4 ? "#ffaf37" : "#563e3b";
        } else if (letterActive.current[i]) {
          // Reset to rest state only once when exiting radius
          letterActive.current[i] = false;
          el.style.transform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
          el.style.color = "#563e3b";
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", updateLetterBounds);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Click / Tap creates a fluid shockwave ripple
  const handleCanvasClick = (e: React.MouseEvent) => {
    const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
    setRipples((prev) => [...prev.slice(-2), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 800);
  };

  return (
    <main
      onClick={handleCanvasClick}
      className="relative flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#fffaf0] p-4 sm:p-8 text-[#563e3b] select-none touch-manipulation cursor-default"
    >
      {/* 1. TACTILE PAPER GRAIN (Hardware-Accelerated Rasterized Pattern) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full opacity-[0.035] mix-blend-multiply z-30 transform-gpu"
        style={{
          backgroundImage: `radial-gradient(#563e3b 0.75px, transparent 0.75px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* 2. LIQUID FLUID ORB (GPU Composited) */}
      <div
        ref={fluidOrbRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 h-[440px] w-[440px] rounded-full will-change-transform z-10 transform-gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 175, 55, 0.28) 0%, rgba(255, 175, 55, 0.14) 35%, rgba(243, 233, 216, 0.1) 60%, transparent 75%)",
          filter: "blur(40px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Viscous Magnetic Specular Core (GPU Composited) */}
      <div
        ref={specularOrbRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 h-32 w-32 rounded-full blur-xl z-10 opacity-70 transform-gpu will-change-transform"
        style={{
          background: "radial-gradient(circle, rgba(255, 175, 55, 0.45) 0%, transparent 70%)",
        }}
      />

      {/* 3. FLUID LIQUID RIPPLES */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none fixed rounded-full border border-[#ffaf37]/60 animate-ping z-20"
          style={{
            left: r.x,
            top: r.y,
            width: "140px",
            height: "140px",
            transform: "translate(-50%, -50%)",
            animationDuration: "800ms",
          }}
        />
      ))}

      {/* 4. DYNAMIC ISLAND MENU */}
      <DynamicIsland />

      {/* 5. CENTERPIECE: MAGNETIC LIQUID LETTERFORMS */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        <h1 className="font-[family-name:var(--font-serif)] text-[clamp(3.8rem,16vw,16rem)] font-normal italic leading-none tracking-[-0.03em] text-[#563e3b] text-center select-none">
          {nameLetters.map((letter, index) => (
            <span
              key={index}
              ref={(el) => {
                letterRefs.current[index] = el;
              }}
              className="inline-block will-change-transform transform-gpu select-none"
              style={{
                transition: "color 150ms ease-out",
              }}
            >
              {letter}
            </span>
          ))}
        </h1>
      </div>

      {/* 6. ROTATING GLOBE & SHADOW RUNNER (Mobile Only - Running Upon the Globe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 translate-y-[58%] w-[138vw] max-w-none aspect-square z-15 block sm:hidden select-none overflow-visible"
      >
        {/* The Rotating Globe Image */}
        <img
          src="/homepage/globe.png"
          alt="Rotating Globe"
          className="w-full h-full max-w-none object-contain animate-globe-rotate drop-shadow-[0_-8px_30px_rgba(86,62,59,0.2)]"
          loading="eager"
        />

        {/* The Black Shadow Runner (Running atop the crest of the globe facing left against the rotation) */}
        <div className="absolute left-1/2 top-0 -translate-x-[40px] -translate-y-[89%] z-20 flex flex-col items-center">
          <ShadowRunner />
        </div>
      </div>
    </main>
  );
}
