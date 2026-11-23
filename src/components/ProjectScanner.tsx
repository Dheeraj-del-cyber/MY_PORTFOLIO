"use client";

import { useEffect, useRef } from "react";
import { FolderGit2 } from "lucide-react";

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

  // Physics state
  const posRef = useRef(0);
  const velRef = useRef(80); // Calm constant drift speed
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const mouseVelRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    const cardLine = cardLineRef.current;
    if (!container || !cardLine) return;

    let animId: number;
    let containerWidth = container.offsetWidth;
    const cardWidth = window.innerWidth < 640 ? 300 : 380;
    const cardGap = window.innerWidth < 640 ? 30 : 50;
    const totalCards = PROJECTS_DATA.length * 3;
    const cardLineWidth = (cardWidth + cardGap) * totalCards;

    const onResize = () => {
      containerWidth = container.offsetWidth;
    };
    window.addEventListener("resize", onResize);

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
        velRef.current = 80;
      }
    };

    // Wheel scrolling
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

    // Main animation loop: exactly synchronized with the scanner line
    const animateLoop = (time: number) => {
      const dt = lastTimeRef.current ? (time - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = time;

      // Calm deceleration toward base speed
      if (!isDraggingRef.current) {
        if (velRef.current > 80) {
          velRef.current *= 0.985;
        } else {
          velRef.current = 80;
        }
        posRef.current -= velRef.current * dt;
      }

      // Loop wrap-around
      if (posRef.current < -cardLineWidth) {
        posRef.current = containerWidth;
      } else if (posRef.current > containerWidth) {
        posRef.current = -cardLineWidth;
      }

      // 1. Move card line immediately
      cardLine.style.transform = `translate3d(${posRef.current}px, 0, 0)`;

      // 2. Compute exact instantaneous clip-path for every card
      const scannerX = containerWidth / 2;
      const wrappers = cardLine.querySelectorAll<HTMLDivElement>(".scanner-card-wrapper");

      wrappers.forEach((wrapper) => {
        const rect = wrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Exact position of the card's left and right edge relative to the container
        const cardLeft = rect.left - containerRect.left;
        const currentCardWidth = rect.width;

        const normalCard = wrapper.querySelector<HTMLDivElement>(".card-normal-layer");
        const asciiCard = wrapper.querySelector<HTMLDivElement>(".card-ascii-layer");
        if (!normalCard || !asciiCard) return;

        // Where is the scanner relative to the card's width?
        const offsetFromLeft = scannerX - cardLeft;
        const splitPercent = Math.max(0, Math.min(100, (offsetFromLeft / currentCardWidth) * 100));

        // Exact zero-delay mathematical split directly at the laser line:
        // Left of laser = Scanned Code (0% to splitPercent%)
        // Right of laser = Normal Card (splitPercent% to 100%)
        normalCard.style.clipPath = `inset(0 0 0 ${splitPercent}%)`;
        asciiCard.style.clipPath = `inset(0 ${100 - splitPercent}% 0 0)`;
      });

      animId = requestAnimationFrame(animateLoop);
    };

    animId = requestAnimationFrame(animateLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      containerEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      containerEl.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Triple dataset for infinite looping conveyor
  const displayList = [...PROJECTS_DATA, ...PROJECTS_DATA, ...PROJECTS_DATA];

  return (
    <div className="relative w-full flex flex-col items-center py-2 select-none">
      {/* SCANNER STREAM CONTAINER */}
      <div
        ref={containerRef}
        className="relative w-full h-[300px] sm:h-[320px] flex items-center overflow-hidden cursor-grab active:cursor-grabbing border-y border-[#fffaf0]/15"
      >
        {/* CALM, ELEGANT VERTICAL LASER LINE (Centered at exactly 50%) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-25 flex items-center justify-center"
        >
          {/* Outer soft ambient glow */}
          <div className="absolute h-[92%] w-8 rounded-full bg-[#ffaf37]/15 blur-md" />
          {/* Inner golden beam */}
          <div className="absolute h-[88%] w-[2px] bg-gradient-to-b from-transparent via-[#ffaf37] to-transparent shadow-[0_0_12px_#ffaf37]" />
          {/* White-hot center hairline */}
          <div className="absolute h-[75%] w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>

        {/* Moving Card Line */}
        <div
          ref={cardLineRef}
          className="flex items-center gap-8 sm:gap-12 will-change-transform py-4"
        >
          {displayList.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="scanner-card-wrapper relative w-[290px] sm:w-[380px] h-[220px] sm:h-[240px] shrink-0 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* LAYER A: NORMAL PROJECT CARD (Right of line) */}
              <div
                className="card-normal-layer absolute inset-0 z-10 flex flex-col justify-between p-5 sm:p-6 bg-[#fffaf0] text-[#563e3b] rounded-2xl will-change-[clip-path]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#ffaf37] bg-[#563e3b] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <FolderGit2 className="h-5 w-5 text-[#563e3b]/40" />
                  </div>

                  <h3 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-[#563e3b]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#563e3b]/75 line-clamp-2">
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

              {/* LAYER B: SCANNED SOURCE CODE (Left of line) */}
              <div
                className="card-ascii-layer absolute inset-0 z-5 flex flex-col justify-between p-5 sm:p-6 bg-[#2d1c1a] text-[#ffaf37] rounded-2xl font-mono text-[11px] leading-[14px] overflow-hidden will-change-[clip-path]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#ffaf37]/20 text-[10px] uppercase tracking-wider text-[#ffaf37]/60">
                  <span>SRC: {item.title.toLowerCase()}.ts</span>
                  <span className="text-[#ffaf37]">● SCANNED</span>
                </div>

                <pre className="my-auto whitespace-pre font-mono text-[10px] sm:text-[11px] text-[#ffaf37]/90 overflow-hidden leading-tight selection:bg-[#ffaf37] selection:text-[#2d1c1a]">
                  {item.code}
                </pre>

                <div className="pt-2 border-t border-[#ffaf37]/20 flex items-center justify-between text-[10px] text-[#ffaf37]/60">
                  <span>UTF-8 • REPO READY</span>
                  <span>0x{item.id}A</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBTLE FOOTER INSTRUCTION */}
      <p className="mt-4 text-[11px] tracking-[0.2em] uppercase text-[#fffaf0]/40 font-mono text-center">
        ← Drag or scroll to inspect projects →
      </p>
    </div>
  );
}
