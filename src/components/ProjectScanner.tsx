"use client";

import { useEffect, useRef, useState } from "react";
import { FolderGit2 } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  tags: string[];
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "01",
    title: "PulseFlow",
    tagline: "Real-time collaborative document & team sync platform.",
    category: "Real-Time Systems",
    tags: ["Next.js", "WebSockets", "TypeScript", "Prisma"],
  },
  {
    id: "02",
    title: "DevMetrics",
    tagline: "Cloud observability telemetry hub with latency aggregation.",
    category: "Telemetry & DevOps",
    tags: ["React", "TimescaleDB", "REST APIs", "Chart.js"],
  },
  {
    id: "03",
    title: "StoreCraft",
    tagline: "Headless high-performance digital storefront with edge cart.",
    category: "Headless E-Commerce",
    tags: ["Next.js", "Stripe API", "Redis", "Tailwind CSS"],
  },
  {
    id: "04",
    title: "NexusAI",
    tagline: "Streaming neural model evaluation and token benchmark studio.",
    category: "AI & Inference",
    tags: ["Next.js", "Python", "Streaming API", "PyTorch"],
  },
  {
    id: "05",
    title: "AuraEngine",
    tagline: "Hardware-accelerated WebGL raymarching shader canvas.",
    category: "Creative Dev",
    tags: ["WebGL", "GLSL Shaders", "TypeScript", "Canvas"],
  },
];

function generateDenseCode(cols: number, rows: number): string {
  const snippets = [
    "// compiled preview • scanner demo /* generated for visual effect – not executed */",
    "const SCAN_WIDTH = 8; const FADE_ZONE = 35; const MAX_PARTICLES = 2500;",
    "const TRANSITION = 0.05; function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }",
    "function lerp(a, b, t) { return a + (b - a) * t; } const now = () => performance.now();",
    "function rng(min, max) { return Math.random() * (max - min) + min; }",
    "class Particle0 { constructor(x, y, vx, vy, r, a) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a = a; } step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }",
    "class Particle1 { constructor(x, y, vx, vy, r, a) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a = a; } step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }",
    "class Particle2 { constructor(x, y, vx, vy, r, a) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a = a; } step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; } }",
    "const scanner = { x: Math.floor(window.innerWidth / 2), width: SCAN_WIDTH, glow: 3.5 };",
    "function drawParticle(ctx, p) { ctx.globalAlpha = clamp(p.a, 0, 1); ctx.drawImage(gradient, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); }",
    "function tick(t) { const dt = 0.016; }",
    "const state = { intensity: 1.2, particles: MAX_PARTICLES }; const bounds = { w: window.innerWidth, h: 300 };",
    "const gradient = document.createElement('canvas'); const ctx = gradient.getContext('2d'); ctx.globalCompositeOperation = 'lighter';",
    "const v0 = (3 + 12) * 0.4; const v1 = (7 + 45) * 0.8; const v2 = (9 + 88) * 0.2; const v3 = (1 + 99) * 0.5;",
    "const v4 = (4 + 67) * 0.3; const v5 = (8 + 32) * 0.6; const v6 = (2 + 15) * 0.9; const v7 = (5 + 54) * 0.1;",
    "if (state.intensity > 1) { scanner.glow += 0.01; } if (state.intensity > 2) { scanner.glow += 0.02; }",
  ];

  let raw = snippets.join(" ");
  let output = "";
  let offset = 0;

  for (let r = 0; r < rows; r++) {
    let line = raw.slice(offset, offset + cols);
    if (line.length < cols) {
      raw += " " + snippets[r % snippets.length];
      line = raw.slice(offset, offset + cols);
    }
    output += line.padEnd(cols, " ") + (r < rows - 1 ? "\n" : "");
    offset += cols;
  }

  return output;
}

export default function ProjectScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const [asciiBlocks, setAsciiBlocks] = useState<string[]>([]);

  // Physics refs
  const posRef = useRef(0);
  const velRef = useRef(85);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const mouseVelRef = useRef(0);
  const lastTimeRef = useRef(0);

  const displayList = [
    ...PROJECTS_DATA,
    ...PROJECTS_DATA,
    ...PROJECTS_DATA,
    ...PROJECTS_DATA,
  ];

  useEffect(() => {
    const cardWidth = window.innerWidth < 640 ? 270 : 350;
    const cardHeight = window.innerWidth < 640 ? 190 : 215;
    const cols = Math.floor(cardWidth / 6.2);
    const rows = Math.floor(cardHeight / 13);

    const blocks = displayList.map(() => generateDenseCode(cols, rows));
    setAsciiBlocks(blocks);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;
    if (!container || !cardLine) return;

    let animId: number;
    let containerWidth = container.offsetWidth;
    const cardWidth = window.innerWidth < 640 ? 270 : 350;
    const cardGap = window.innerWidth < 640 ? 24 : 44;
    const cardLineWidth = (cardWidth + cardGap) * displayList.length;
    const halfWidth = cardLineWidth / 2;

    const handleResize = () => {
      containerWidth = container.offsetWidth;
    };
    window.addEventListener("resize", handleResize);

    // Mouse & Touch drag handlers
    const onMouseDown = (e: MouseEvent | Touch) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.clientX;
      mouseVelRef.current = 0;
    };

    const onMouseMove = (e: MouseEvent | Touch) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastMouseXRef.current;
      posRef.current += deltaX;
      mouseVelRef.current = deltaX * 60;
      lastMouseXRef.current = e.clientX;
    };

    const onMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (Math.abs(mouseVelRef.current) > 20) {
        velRef.current = Math.min(Math.abs(mouseVelRef.current), 350);
      } else {
        velRef.current = 85;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -30 : 30;
      posRef.current += delta;
    };

    const containerEl = container;
    containerEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    containerEl.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) onMouseDown(e.touches[0]);
      },
      { passive: true }
    );
    window.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length > 0) onMouseMove(e.touches[0]);
      },
      { passive: true }
    );
    window.addEventListener("touchend", onMouseUp);
    containerEl.addEventListener("wheel", onWheel, { passive: false });

    // Main animation loop: 3D Circular Orbit Path + Synchronized Laser Clip
    const animateLoop = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      // Calm drift deceleration
      if (!isDraggingRef.current) {
        if (velRef.current > 85) {
          velRef.current *= 0.985;
        } else {
          velRef.current = 85;
        }
        posRef.current -= velRef.current * dt;
      }

      // Smooth continuous infinite loop
      if (posRef.current < -halfWidth) {
        posRef.current += halfWidth;
      } else if (posRef.current > 0) {
        posRef.current -= halfWidth;
      }

      // 1. Move conveyor
      cardLine.style.transform = `translate3d(${posRef.current}px, 0, 0)`;

      // 2. Synchronized 3D Circular Orbit + Laser Line Split
      const scannerX = containerWidth / 2;
      const radius = Math.max(containerWidth * 0.75, 550);
      const wrappers = cardLine.querySelectorAll<HTMLDivElement>(".scanner-card-wrapper");

      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const cardCenterX = rect.left + rect.width / 2;
        const distFromCenter = cardCenterX - (containerRect.left + containerWidth / 2);
        const norm = distFromCenter / (containerWidth * 0.5);

        // 3D Circular Carousel Transformation
        const angleRad = Math.max(-1.4, Math.min(1.4, norm * 0.7));
        const rotY = -(norm * 26); // Angle inward towards viewer in 3D
        const translateZ = (Math.cos(angleRad) - 1) * radius * 0.45; // Curves back into space
        const arcY = Math.pow(Math.min(Math.abs(norm), 1.6), 2) * 20; // Gentle circular smile/arc drop
        const scale = Math.max(0.8, 1 - Math.min(Math.abs(norm), 1.4) * 0.14); // Scale smoothly along circle

        wrapper.style.transform = `translate3d(0, ${arcY.toFixed(1)}px, ${translateZ.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

        // Laser scan sub-pixel clipping:
        const normalCard = wrapper.querySelector<HTMLDivElement>(".card-normal-layer");
        const asciiCard = wrapper.querySelector<HTMLDivElement>(".card-ascii-layer");
        if (!normalCard || !asciiCard) return;

        const offsetFromLeft = (containerRect.left + scannerX) - rect.left;
        const splitPercent = Math.max(0, Math.min(100, (offsetFromLeft / rect.width) * 100));

        normalCard.style.clipPath = `inset(0 0 0 ${splitPercent}%)`;
        asciiCard.style.clipPath = `inset(0 ${100 - splitPercent}% 0 0)`;
      });

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      containerEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      containerEl.removeEventListener("wheel", onWheel);
    };
  }, [displayList.length]);

  return (
    <div className="relative w-full flex flex-col items-center py-1 select-none">
      {/* SCANNER STREAM CONTAINER - FULL SCREEN END TO END */}
      <div
        ref={containerRef}
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
          transformStyle: "preserve-3d",
        }}
        className="relative w-screen left-1/2 -translate-x-1/2 h-[260px] sm:h-[290px] flex items-center overflow-hidden cursor-grab active:cursor-grabbing border-y border-[#fffaf0]/15 select-none"
      >
        {/* CALM VERTICAL LASER LINE */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-30 flex items-center justify-center"
        >
          {/* Ambient soft glow */}
          <div className="absolute h-[94%] w-6 rounded-full bg-[#ffaf37]/20 blur-md" />
          {/* Main golden laser line */}
          <div className="absolute h-[90%] w-[2px] bg-gradient-to-b from-transparent via-[#ffaf37] to-transparent shadow-[0_0_12px_#ffaf37]" />
          {/* White hairline core */}
          <div className="absolute h-[72%] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>

        {/* Moving Card Line - 3D Circular Orbit Ring */}
        <div
          ref={cardLineRef}
          style={{ transformStyle: "preserve-3d" }}
          className="flex items-center gap-6 sm:gap-10 will-change-transform py-3"
        >
          {displayList.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "50% 50%",
              }}
              className="scanner-card-wrapper relative w-[265px] sm:w-[340px] h-[190px] sm:h-[215px] shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-[#fffaf0]/10 will-change-transform"
            >
              {/* LAYER A: NORMAL PROJECT CARD (Visible on Right of Laser) */}
              <div
                className="card-normal-layer absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-5 bg-[#fffaf0] text-[#563e3b] rounded-2xl will-change-[clip-path]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffaf37] bg-[#563e3b] px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <FolderGit2 className="h-4 w-4 text-[#563e3b]/40" />
                  </div>

                  <h3 className="mt-2 text-base sm:text-lg font-bold tracking-tight text-[#563e3b]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#563e3b]/75 line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#563e3b]/15 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#563e3b]/8 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-[#563e3b]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#563e3b]/50 font-mono">
                    #{item.id}
                  </span>
                </div>
              </div>

              {/* LAYER B: SCANNED DENSE ASCII/CODE WALL (Visible on Left of Laser) */}
              <div
                className="card-ascii-layer absolute inset-0 z-5 flex flex-col justify-center p-3 sm:p-4 bg-[#261816] text-[#ffaf37] rounded-2xl font-mono text-[9px] sm:text-[10px] leading-[12px] overflow-hidden will-change-[clip-path]"
                style={{
                  maskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.5) 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.5) 100%)",
                }}
              >
                <pre className="whitespace-pre font-mono text-[#ffaf37]/80 text-[9px] sm:text-[10px] leading-[12px] select-none pointer-events-none opacity-90 overflow-hidden">
                  {asciiBlocks[idx] || generateDenseCode(58, 18)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBTLE FOOTER INSTRUCTION */}
      <p className="mt-2 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-[#fffaf0]/40 font-mono text-center">
        ← Drag or scroll to inspect projects →
      </p>
    </div>
  );
}
