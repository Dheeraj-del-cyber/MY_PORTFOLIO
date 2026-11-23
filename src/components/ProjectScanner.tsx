"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FolderGit2, ExternalLink, Play, Pause, RotateCcw, ArrowLeftRight } from "lucide-react";

interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  category: string;
  tags: string[];
  code: string;
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "01",
    title: "PulseFlow",
    tagline: "Real-time collaborative document & team sync platform.",
    category: "Real-Time Systems",
    tags: ["Next.js", "WebSockets", "TypeScript", "Prisma"],
    code: `// PulseFlow • Operational Transform Sync
import { WebSocketServer } from "ws";
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
  socket.on("message", (deltaBuffer) => {
    const delta = decodeCRDT(deltaBuffer);
    stateTree.apply(delta);
    broadcastDelta(delta, { priority: 1 });
  });
});

export function computeConflict(docA, docB) {
  return docA.vectorClock > docB.vectorClock ? docA : docB;
}`,
  },
  {
    id: "02",
    title: "DevMetrics",
    tagline: "Cloud observability telemetry hub with latency aggregation.",
    category: "Telemetry & DevOps",
    tags: ["React", "TimescaleDB", "REST APIs", "Chart.js"],
    code: `// DevMetrics • Distributed Trace Ingest
interface TraceSpan { id: string; duration: number; }

export async function ingestMetrics(stream: ReadableStream) {
  const p99 = computePercentile(stream, 0.99);
  const p50 = computePercentile(stream, 0.50);
  
  await timescaledb.insert("telemetry_spans", {
    latency_p99: p99,
    latency_p50: p50,
    timestamp: Date.now(),
  });
  return { status: "INGESTED" };
}`,
  },
  {
    id: "03",
    title: "StoreCraft",
    tagline: "Headless high-performance digital storefront with edge cart.",
    category: "Headless E-Commerce",
    tags: ["Next.js", "Stripe API", "Redis", "Tailwind CSS"],
    code: `// StoreCraft • Edge Cart Session & Stripe
export async function createCheckout(cart: CartSession) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: cart.items.map((i) => ({
      price_data: { currency: "usd", unit_amount: i.price },
      quantity: i.quantity,
    })),
  });
  return session.url;
}`,
  },
  {
    id: "04",
    title: "NexusAI",
    tagline: "Streaming neural model evaluation and token benchmark studio.",
    category: "AI & Inference",
    tags: ["Next.js", "Python", "Streaming API", "PyTorch"],
    code: `// NexusAI • Token Stream Evaluation Pipeline
export async function* streamEvaluator(prompt: string) {
  const response = await fetch("/api/infer", {
    method: "POST",
    body: JSON.stringify({ prompt, temp: 0.7 }),
  });
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield parseTokenDistance(value);
  }
}`,
  },
  {
    id: "05",
    title: "AuraEngine",
    tagline: "Hardware-accelerated WebGL raymarching shader canvas.",
    category: "Creative Dev",
    tags: ["WebGL", "GLSL Shaders", "TypeScript", "Canvas"],
    code: `// AuraEngine • Raymarching Distance Field
uniform float uTime;
varying vec2 vUv;

float sdSphere(vec3 p, float s) { return length(p) - s; }

void main() {
  vec3 rayOrigin = vec3(0.0, 0.0, -3.0);
  vec3 rayDir = normalize(vec3(vUv * 2.0 - 1.0, 1.0));
  vec3 color = vec3(1.0, 0.69, 0.22) * abs(sin(uTime));
  gl_FragColor = vec4(color, 1.0);
}`,
  },
];

export default function ProjectScanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardLineRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speedDisplay, setSpeedDisplay] = useState(120);

  // Physics state
  const posRef = useRef(0);
  const velRef = useRef(120);
  const dirRef = useRef(-1);
  const isPlayingRef = useRef(true);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const mouseVelRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Particle state
  const particlesRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      decay: number;
      life: number;
    }[]
  >([]);

  // Toggle play/pause
  const togglePlay = () => {
    isPlayingRef.current = !isPlayingRef.current;
    setIsPlaying(isPlayingRef.current);
  };

  // Reset position
  const resetPos = () => {
    if (!containerRef.current) return;
    posRef.current = containerRef.current.offsetWidth / 2;
    velRef.current = 120;
    dirRef.current = -1;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setSpeedDisplay(120);
  };

  // Change direction
  const changeDir = () => {
    dirRef.current *= -1;
  };

  // Setup loop and event listeners
  useEffect(() => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;
    const canvas = canvasRef.current;
    if (!container || !cardLine || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let containerWidth = container.offsetWidth;
    const cardWidth = window.innerWidth < 640 ? 300 : 380;
    const cardGap = window.innerWidth < 640 ? 30 : 50;
    // Repeat cards 3 times for continuous looping
    const totalCards = PROJECTS_DATA.length * 3;
    const cardLineWidth = (cardWidth + cardGap) * totalCards;

    // Setup canvas size
    const resizeCanvas = () => {
      containerWidth = container.offsetWidth;
      canvas.width = containerWidth;
      canvas.height = 340;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Particle cache
    const gradCanvas = document.createElement("canvas");
    gradCanvas.width = 16;
    gradCanvas.height = 16;
    const gCtx = gradCanvas.getContext("2d");
    if (gCtx) {
      const grad = gCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.35, "rgba(255, 175, 55, 0.85)");
      grad.addColorStop(0.75, "rgba(229, 154, 47, 0.4)");
      grad.addColorStop(1, "transparent");
      gCtx.fillStyle = grad;
      gCtx.beginPath();
      gCtx.arc(8, 8, 8, 0, Math.PI * 2);
      gCtx.fill();
    }

    // Drag handlers
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
      if (Math.abs(mouseVelRef.current) > 30) {
        velRef.current = Math.min(Math.abs(mouseVelRef.current), 600);
        dirRef.current = mouseVelRef.current > 0 ? 1 : -1;
      } else {
        velRef.current = 120;
      }
      setSpeedDisplay(Math.round(velRef.current));
    };

    // Wheel scrolling
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -35 : 35;
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

    // Main animation loop
    const scannerX = containerWidth / 2;
    const scannerWidth = 4;
    const scannerLeft = scannerX - scannerWidth / 2;
    const scannerRight = scannerX + scannerWidth / 2;

    const animateLoop = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      // Physics update
      if (isPlayingRef.current && !isDraggingRef.current) {
        if (velRef.current > 30) {
          velRef.current *= 0.985;
        } else {
          velRef.current = 120;
        }
        posRef.current += velRef.current * dirRef.current * dt;
        setSpeedDisplay(Math.round(velRef.current));
      }

      // Loop wrap-around
      if (posRef.current < -cardLineWidth) {
        posRef.current = containerWidth;
      } else if (posRef.current > containerWidth) {
        posRef.current = -cardLineWidth;
      }

      // Apply transform to card line
      cardLine.style.transform = `translate3d(${posRef.current}px, 0, 0)`;

      // Update clipping on each card wrapper
      let anyScanning = false;
      const wrappers = cardLine.querySelectorAll<HTMLDivElement>(".scanner-card-wrapper");

      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const cardLeft = rect.left - containerRect.left;
        const cardRight = cardLeft + rect.width;
        const width = rect.width;

        const normalCard = wrapper.querySelector<HTMLDivElement>(".card-normal-layer");
        const asciiCard = wrapper.querySelector<HTMLDivElement>(".card-ascii-layer");
        if (!normalCard || !asciiCard) return;

        if (cardLeft < scannerRight && cardRight > scannerLeft) {
          anyScanning = true;
          const intersectLeft = Math.max(scannerLeft - cardLeft, 0);
          const intersectRight = Math.min(scannerRight - cardLeft, width);

          const clipRight = (intersectLeft / width) * 100;
          const clipLeft = (intersectRight / width) * 100;

          normalCard.style.setProperty("--clip-right", `${clipRight}%`);
          asciiCard.style.setProperty("--clip-left", `${clipLeft}%`);
        } else {
          if (cardRight < scannerLeft) {
            normalCard.style.setProperty("--clip-right", "100%");
            asciiCard.style.setProperty("--clip-left", "100%");
          } else if (cardLeft > scannerRight) {
            normalCard.style.setProperty("--clip-right", "0%");
            asciiCard.style.setProperty("--clip-left", "0%");
          }
        }
      });

      // Canvas Laser & Particle sparks
      ctx.clearRect(0, 0, containerWidth, 340);

      // Draw Center Laser Line
      const laserH = 320;
      const laserY = 10;
      const laserGrad = ctx.createLinearGradient(0, laserY, 0, laserY + laserH);
      laserGrad.addColorStop(0, "rgba(255, 175, 55, 0)");
      laserGrad.addColorStop(0.2, "rgba(255, 175, 55, 0.9)");
      laserGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
      laserGrad.addColorStop(0.8, "rgba(255, 175, 55, 0.9)");
      laserGrad.addColorStop(1, "rgba(255, 175, 55, 0)");

      ctx.save();
      ctx.shadowColor = "#ffaf37";
      ctx.shadowBlur = anyScanning ? 24 : 12;
      ctx.fillStyle = laserGrad;
      ctx.fillRect(scannerX - (anyScanning ? 2 : 1), laserY, anyScanning ? 4 : 2, laserH);
      ctx.restore();

      // Emit particles from laser
      const emitRate = anyScanning ? 6 : 2;
      for (let i = 0; i < emitRate; i++) {
        if (particlesRef.current.length < 300) {
          particlesRef.current.push({
            x: scannerX + (Math.random() - 0.5) * 4,
            y: laserY + Math.random() * laserH,
            vx: (Math.random() - 0.5) * (anyScanning ? 2.5 : 1.2),
            vy: (Math.random() - 0.5) * 1.5,
            radius: Math.random() * 2.5 + 0.8,
            alpha: Math.random() * 0.7 + 0.3,
            decay: Math.random() * 0.02 + 0.015,
            life: 1.0,
          });
        }
      }

      // Update & draw particles
      ctx.globalCompositeOperation = "lighter";
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha * p.life;
        ctx.drawImage(
          gradCanvas,
          p.x - p.radius,
          p.y - p.radius,
          p.radius * 2,
          p.radius * 2
        );
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      containerEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      containerEl.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Triple dataset for infinite looping conveyor
  const displayList = [...PROJECTS_DATA, ...PROJECTS_DATA, ...PROJECTS_DATA];

  return (
    <div className="relative w-full flex flex-col items-center py-4 select-none">
      {/* 1. TOP CONTROLS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full px-4 mb-6 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-1.5 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-3.5 py-1.5 text-xs font-semibold text-[#fffaf0] transition hover:bg-[#ffaf37] hover:text-[#563e3b] active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{isPlaying ? "Pause" : "Play"}</span>
          </button>

          <button
            type="button"
            onClick={resetPos}
            className="flex items-center gap-1.5 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-3.5 py-1.5 text-xs font-semibold text-[#fffaf0] transition hover:bg-[#ffaf37] hover:text-[#563e3b] active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={changeDir}
            className="flex items-center gap-1.5 rounded-full border border-[#fffaf0]/20 bg-[#fffaf0]/10 px-3.5 py-1.5 text-xs font-semibold text-[#fffaf0] transition hover:bg-[#ffaf37] hover:text-[#563e3b] active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="h-3 w-3" />
            <span>Direction</span>
          </button>
        </div>

        <div className="text-[11px] font-mono tracking-wider text-[#ffaf37] border border-[#ffaf37]/30 bg-[#ffaf37]/10 px-3 py-1 rounded-full">
          Velocity: <span className="font-bold">{speedDisplay}</span> px/s
        </div>
      </div>

      {/* 2. SCANNER STREAM CONTAINER */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] flex items-center overflow-hidden cursor-grab active:cursor-grabbing border-y border-[#fffaf0]/10"
      >
        {/* Background Laser & Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full z-15"
        />

        {/* Moving Card Line */}
        <div
          ref={cardLineRef}
          className="flex items-center gap-8 sm:gap-12 will-change-transform py-4"
        >
          {displayList.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="scanner-card-wrapper relative w-[290px] sm:w-[380px] h-[230px] shrink-0 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* LAYER A: NORMAL PROJECT CARD (Clipped on scan) */}
              <div
                className="card-normal-layer absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6 bg-[#fffaf0] text-[#563e3b] rounded-2xl transition-[clip-path]"
                style={{
                  clipPath: "inset(0 0 0 var(--clip-right, 0%))",
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffaf37] bg-[#563e3b] px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <FolderGit2 className="h-5 w-5 text-[#563e3b]/50" />
                  </div>

                  <h3 className="mt-3 text-xl font-bold tracking-tight text-[#563e3b]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#563e3b]/75 line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#563e3b]/15 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-[#563e3b]/8 px-2 py-0.5 text-[10px] font-medium text-[#563e3b]"
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

              {/* LAYER B: SCANNED ASCII / MONOSPACE CODE (Revealed on scan) */}
              <div
                className="card-ascii-layer absolute inset-0 z-5 flex flex-col justify-between p-5 sm:p-6 bg-[#2d1c1a] text-[#ffaf37] rounded-2xl font-mono text-[11px] leading-[14px] overflow-hidden transition-[clip-path]"
                style={{
                  clipPath: "inset(0 calc(100% - var(--clip-left, 0%)) 0 0)",
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#ffaf37]/20 text-[10px] uppercase tracking-wider text-[#ffaf37]/60">
                  <span>SRC: {item.title.toLowerCase()}.ts</span>
                  <span className="animate-pulse text-[#ffaf37]">● SCANNED</span>
                </div>

                <pre className="my-auto whitespace-pre font-mono text-[10px] sm:text-[11px] text-[#ffaf37]/90 overflow-hidden leading-tight selection:bg-[#ffaf37] selection:text-[#2d1c1a]">
                  {item.code}
                </pre>

                <div className="pt-2 border-t border-[#ffaf37]/20 flex items-center justify-between text-[10px] text-[#ffaf37]/60">
                  <span>UTF-8 • READY</span>
                  <span>ID: 0x{item.id}A</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. INSTRUCTION NOTE */}
      <p className="mt-4 text-xs tracking-wider text-[#fffaf0]/50 font-mono text-center">
        ← DRAG OR SCROLL TO SCAN PROJECTS THROUGH LASER →
      </p>
    </div>
  );
}
