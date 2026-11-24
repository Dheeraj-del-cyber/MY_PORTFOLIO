"use client";

import { useEffect, useRef } from "react";

interface WindStream {
  x: number;
  yOffset: number; // Vertical offset relative to the runner crest
  speed: number;
  length: number;
  curve: number;
  lineWidth: number;
  baseAlpha: number;
  color: string;
}

export default function WindAttack() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only run mobile wind animation loop on mobile screens (<640px)
    if (window.innerWidth >= 640) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Ethereal, low-opacity wind palette (Casa di Solare gold & ivory)
    const windPalette = [
      "rgba(255, 175, 55, ",  // Soft citrus gold
      "rgba(255, 195, 85, ",  // Warm amber
      "rgba(255, 250, 240, ", // Delicate ivory
      "rgba(243, 233, 216, ", // Sand cream
    ];

    // EXACTLY 7 SLEEK, MINIMAL WIND STREAMS (Coming from screen start)
    const streams: WindStream[] = [
      { x: -50, yOffset: -38, speed: 280, length: 75, curve: -2.0, lineWidth: 1.2, baseAlpha: 0.32, color: windPalette[0] },
      { x: -140, yOffset: -22, speed: 330, length: 90, curve: 1.5, lineWidth: 1.4, baseAlpha: 0.38, color: windPalette[2] },
      { x: -220, yOffset: -12, speed: 250, length: 65, curve: -1.2, lineWidth: 1.0, baseAlpha: 0.26, color: windPalette[1] },
      { x: -90, yOffset: -48, speed: 310, length: 80, curve: -3.0, lineWidth: 1.1, baseAlpha: 0.28, color: windPalette[3] },
      { x: -180, yOffset: -30, speed: 290, length: 70, curve: 2.2, lineWidth: 1.3, baseAlpha: 0.35, color: windPalette[0] },
      { x: -30, yOffset: -5, speed: 240, length: 60, curve: 1.8, lineWidth: 0.9, baseAlpha: 0.22, color: windPalette[2] },
      { x: -120, yOffset: -42, speed: 340, length: 85, curve: -1.5, lineWidth: 1.2, baseAlpha: 0.30, color: windPalette[1] },
    ];

    // Distribute initial positions across screen
    streams.forEach((s, idx) => {
      s.x = (idx / streams.length) * (width + 100) - 50;
    });

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Runner anchor coordinates on mobile
      const runnerX = width * 0.5;
      // Globe crest height calculation:
      // In page.tsx: globe is w-[138vw], center at bottom-0 translate-y-[58%]
      // Top crest is at: height - (1 - 0.58) * (1.38 * width) = height - 0.5796 * width
      const globeCrestY = height - (0.42 * 1.38 * width);
      const runnerCenterY = globeCrestY - 24;

      streams.forEach((s) => {
        // Move from left to right (from screen start at X <= 0 across to the runner and beyond)
        s.x += s.speed * dt;

        if (s.x - s.length > width + 40) {
          s.x = -s.length - Math.random() * 60; // Recycle off the far left edge of the screen
        }

        const baseY = globeCrestY + s.yOffset;

        // Subtle deflection when wind passes the runner
        const distToRunner = Math.hypot(s.x - runnerX, baseY - runnerCenterY);
        let deflectY = 0;
        let dynamicAlpha = s.baseAlpha;

        if (distToRunner < 30) {
          // Wind curves smoothly around runner's chest and head
          deflectY = (baseY < runnerCenterY ? -1 : 1) * (30 - distToRunner) * 0.35;
          dynamicAlpha = Math.min(0.55, s.baseAlpha * 1.3);
        }

        ctx.save();
        ctx.strokeStyle = `${s.color}${dynamicAlpha})`;
        ctx.lineWidth = s.lineWidth;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(s.x - s.length, baseY + s.curve);
        ctx.quadraticCurveTo(
          s.x - s.length * 0.45,
          baseY + deflectY * 0.6,
          s.x,
          baseY + deflectY
        );
        ctx.stroke();

        // Delicate luminous tip
        ctx.fillStyle = `${s.color}${dynamicAlpha * 1.2})`;
        ctx.beginPath();
        ctx.arc(s.x, baseY + deflectY, s.lineWidth * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 w-screen h-[100dvh] z-18 block sm:hidden select-none overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block pointer-events-none select-none"
      />
    </div>
  );
}
