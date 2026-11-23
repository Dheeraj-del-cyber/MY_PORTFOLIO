"use client";

import { useEffect, useRef } from "react";

interface Blade {
  x: number;
  height: number;
  baseWidth: number;
  naturalAngle: number;
  angle: number;
  velocity: number;
  stiffness: number;
  damping: number;
  colorBase: string;
  colorTip: string;
}

export default function InteractiveGrass() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; vx: number; lastX: number }>({
    x: -1000,
    y: -1000,
    vx: 0,
    lastX: -1000,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let blades: Blade[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Palette: Casa di Solare tones
    const tipColors = [
      "#ffaf37", // Luminous citrus gold
      "#e59a2f", // Warm amber
      "#8c6158", // Terracotta
      "#6d4f4b", // Medium cocoa
      "#ffbe53", // Sunlit gold
    ];

    const initBlades = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      // Grass height container (approx 180px - 240px depending on screen)
      height = window.innerWidth < 640 ? 170 : 220;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Density of grass blades
      const bladeSpacing = width < 640 ? 5 : 4;
      const totalBlades = Math.floor(width / bladeSpacing) + 2;

      blades = [];
      for (let i = 0; i < totalBlades; i++) {
        const x = i * bladeSpacing + (Math.random() - 0.5) * 3;
        const heightVariation = Math.random();
        // Varying depths: background blades are shorter and lighter, foreground blades are taller
        const bladeHeight = height * (0.55 + heightVariation * 0.42);
        const naturalAngle = (Math.random() - 0.5) * 0.15;

        blades.push({
          x,
          height: bladeHeight,
          baseWidth: 1.8 + Math.random() * 2,
          naturalAngle,
          angle: naturalAngle,
          velocity: 0,
          stiffness: 0.04 + Math.random() * 0.03,
          damping: 0.9 + Math.random() * 0.04,
          colorBase: "rgba(86, 62, 59, 0.95)", // Deep cocoa
          colorTip: tipColors[Math.floor(Math.random() * tipColors.length)],
        });
      }
    };

    initBlades();

    const handleResize = () => {
      initBlades();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = e.clientX;
      const currentY = e.clientY - rect.top;

      mouseRef.current.vx = (currentX - mouseRef.current.lastX) * 0.6;
      mouseRef.current.x = currentX;
      mouseRef.current.y = currentY;
      mouseRef.current.lastX = currentX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY - rect.top;

        mouseRef.current.vx = (currentX - mouseRef.current.lastX) * 0.6;
        mouseRef.current.x = currentX;
        mouseRef.current.y = currentY;
        mouseRef.current.lastX = currentX;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.vx = 0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Layered ambient wind forces
      const windA = Math.sin(time * 1.2) * 0.08;
      const windB = Math.sin(time * 2.1 + 1.5) * 0.04;
      const gust = Math.sin(time * 0.5) > 0.4 ? 0.06 : 0;
      const globalWind = windA + windB + gust;

      const mouse = mouseRef.current;
      const interactionRadius = 90; // Proximity push radius

      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];

        // 1. Natural wind force depending on position
        const localWind = globalWind + Math.sin(time + blade.x * 0.015) * 0.03;
        const targetAngle = blade.naturalAngle + localWind;

        // 2. Cursor collision & bend physics
        const tipY = height - blade.height;
        const dx = mouse.x - blade.x;
        const dy = mouse.y - tipY;
        const dist = Math.hypot(dx, dy);

        if (dist < interactionRadius && mouse.x > 0) {
          const pushIntensity = (1 - dist / interactionRadius) * 0.45;
          // Bend away from cursor direction + add velocity push
          const pushDirection = dx < 0 ? 1 : -1;
          const velocityPush = Math.max(Math.min(mouse.vx * 0.02, 0.3), -0.3);

          blade.velocity += pushDirection * pushIntensity * 0.2 + velocityPush * 0.1;
        }

        // 3. Spring-damper physics
        const displacement = targetAngle - blade.angle;
        blade.velocity += displacement * blade.stiffness;
        blade.velocity *= blade.damping;
        blade.angle += blade.velocity;

        // 4. Draw blade of grass with smooth cubic curve
        const baseX = blade.x;
        const baseY = height;
        const tipX = baseX + Math.sin(blade.angle) * blade.height;
        const currentTipY = baseY - Math.cos(blade.angle) * blade.height;

        // Midpoint control for organic bend
        const ctrlX = baseX + (Math.sin(blade.angle * 0.5) * blade.height) / 2;
        const ctrlY = baseY - (Math.cos(blade.angle * 0.5) * blade.height) / 2;

        const gradient = ctx.createLinearGradient(baseX, baseY, tipX, currentTipY);
        gradient.addColorStop(0, blade.colorBase);
        gradient.addColorStop(0.65, "#6b4d49");
        gradient.addColorStop(1, blade.colorTip);

        ctx.beginPath();
        ctx.moveTo(baseX - blade.baseWidth / 2, baseY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, currentTipY);
        ctx.quadraticCurveTo(ctrlX + blade.baseWidth / 3, ctrlY, baseX + blade.baseWidth / 2, baseY);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-0 left-0 right-0 w-full overflow-hidden z-20"
      style={{
        maskImage: "linear-gradient(to top, black 70%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, black 70%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
