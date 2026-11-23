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

interface WindParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  wobbleSpeed: number;
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
    let particles: WindParticle[] = [];
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

    const initScene = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerWidth < 640 ? 190 : 250;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // 1. Density of grass blades
      const bladeSpacing = width < 640 ? 5 : 3.8;
      const totalBlades = Math.floor(width / bladeSpacing) + 2;

      blades = [];
      for (let i = 0; i < totalBlades; i++) {
        const x = i * bladeSpacing + (Math.random() - 0.5) * 2;
        const heightVariation = Math.random();
        const bladeHeight = height * (0.58 + heightVariation * 0.38);
        const naturalAngle = (Math.random() - 0.5) * 0.12;

        blades.push({
          x,
          height: bladeHeight,
          baseWidth: 1.8 + Math.random() * 2.2,
          naturalAngle,
          angle: naturalAngle,
          velocity: 0,
          stiffness: 0.045 + Math.random() * 0.03,
          damping: 0.91 + Math.random() * 0.03,
          colorBase: "rgba(86, 62, 59, 0.95)",
          colorTip: tipColors[Math.floor(Math.random() * tipColors.length)],
        });
      }

      // 2. Wind Pollen / Sunlit Floating Wisps
      particles = [];
      const particleCount = width < 640 ? 18 : 32;
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.85,
          size: 1 + Math.random() * 2,
          speedX: 0.8 + Math.random() * 1.6,
          speedY: (Math.random() - 0.5) * 0.4,
          alpha: 0.25 + Math.random() * 0.5,
          wobbleSpeed: 1 + Math.random() * 2,
        });
      }
    };

    initScene();

    const handleResize = () => {
      initScene();
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
      time += 0.024;
      ctx.clearRect(0, 0, width, height);

      // Dynamic traveling wind waves & rhythmic gusts
      const wavePrimary = Math.sin(time * 1.5 - 0.005) * 0.16;
      const waveSecondary = Math.sin(time * 0.85 + 1.2) * 0.12;

      // Periodic wind gust surge (rolls across screen every few seconds)
      const gustCycle = Math.sin(time * 0.45);
      const gustStrength = Math.max(0, gustCycle) ** 1.6 * 0.28;

      const mouse = mouseRef.current;
      const interactionRadius = 95;

      // Render Grass Blades
      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];

        // Traveling wind wave moving across space (notice: time - x * frequency)
        const travelingWave = Math.sin(time * 2.2 - blade.x * 0.007) * 0.18;
        const localGust = Math.sin(time * 3.0 - blade.x * 0.009) * gustStrength;
        const totalWindForce = wavePrimary + waveSecondary + travelingWave + localGust;

        const targetAngle = blade.naturalAngle + totalWindForce;

        // Interactive cursor brush physics
        const tipY = height - blade.height;
        const dx = mouse.x - blade.x;
        const dy = mouse.y - tipY;
        const dist = Math.hypot(dx, dy);

        if (dist < interactionRadius && mouse.x > 0) {
          const pushIntensity = (1 - dist / interactionRadius) * 0.55;
          const pushDirection = dx < 0 ? 1 : -1;
          const velocityPush = Math.max(Math.min(mouse.vx * 0.025, 0.4), -0.4);

          blade.velocity += pushDirection * pushIntensity * 0.25 + velocityPush * 0.15;
        }

        // Spring-damper physics
        const displacement = targetAngle - blade.angle;
        blade.velocity += displacement * blade.stiffness;
        blade.velocity *= blade.damping;
        blade.angle += blade.velocity;

        // Draw blade
        const baseX = blade.x;
        const baseY = height;
        const tipX = baseX + Math.sin(blade.angle) * blade.height;
        const currentTipY = baseY - Math.cos(blade.angle) * blade.height;

        // Control point curved with the wind
        const ctrlX = baseX + (Math.sin(blade.angle * 0.55) * blade.height) / 1.8;
        const ctrlY = baseY - (Math.cos(blade.angle * 0.55) * blade.height) / 1.8;

        const gradient = ctx.createLinearGradient(baseX, baseY, tipX, currentTipY);
        gradient.addColorStop(0, blade.colorBase);
        gradient.addColorStop(0.6, "#6b4d49");
        gradient.addColorStop(1, blade.colorTip);

        ctx.beginPath();
        ctx.moveTo(baseX - blade.baseWidth / 2, baseY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, currentTipY);
        ctx.quadraticCurveTo(ctrlX + blade.baseWidth / 2.5, ctrlY, baseX + blade.baseWidth / 2, baseY);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Render Floating Wind Pollen / Sunlit Wisps
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX + gustStrength * 2.5;
        p.y += p.speedY + Math.sin(time * p.wobbleSpeed + p.x * 0.02) * 0.4;

        // Wrap around horizontally
        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height * 0.85;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 175, 55, ${p.alpha * (0.8 + gustStrength)})`;
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
        maskImage: "linear-gradient(to top, black 75%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to top, black 75%, transparent 100%)",
      }}
    >
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
