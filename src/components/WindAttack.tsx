"use client";

import { useEffect, useRef } from "react";

interface WindStream {
  x: number;
  yOffset: number;
  speed: number;
  length: number;
  curve: number;
  lineWidth: number;
  baseAlpha: number;
  color: string;
  spawnX: number;
}

interface FallingLeaf {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetVx: number;
  drag: number;
  gravity: number;
  liftCoeff: number;
  size: number;
  angle: number;
  angularVel: number;
  flipPhase: number;
  flipSpeed: number;
  color: string;
  alpha: number;
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

    // Warm Mediterranean leaf palette (Casa di Solare terracotta, amber & golden ochre)
    const leafPalette = [
      "rgba(214, 142, 54, 0.90)", // Warm golden ochre
      "rgba(196, 118, 48, 0.88)", // Terracotta copper
      "rgba(172, 94, 42, 0.86)",  // Burnt sienna
      "rgba(228, 168, 72, 0.92)", // Amber harvest
      "rgba(152, 88, 38, 0.84)",  // Rich rust
      "rgba(202, 130, 60, 0.88)", // Sun-baked clay
    ];

    // Ethereal wind palette (Casa di Solare gold & ivory)
    const windPalette = [
      "rgba(255, 175, 55, ",  // Soft citrus gold
      "rgba(255, 195, 85, ",  // Warm amber
      "rgba(255, 250, 240, ", // Delicate ivory
      "rgba(243, 233, 216, ", // Sand cream
    ];

    // Tree canopy anchor:
    // With tree at left-0 -translate-x-[55%] w-[88vw], the visible center of the tree is at ~16% to ~24% of screen width
    const getTreeSpawnX = () => width * 0.16 + Math.random() * (width * 0.08);
    const getGlobeCrestY = () => height - (0.42 * 1.38 * width);

    // 7 SLEEK, MINIMAL WIND STREAMS (Originating strictly from the center of the tree with gradient fade)
    const streams: WindStream[] = [
      { x: 0, spawnX: 0, yOffset: -38, speed: 280, length: 75, curve: -2.0, lineWidth: 1.2, baseAlpha: 0.32, color: windPalette[0] },
      { x: 0, spawnX: 0, yOffset: -22, speed: 330, length: 90, curve: 1.5, lineWidth: 1.4, baseAlpha: 0.38, color: windPalette[2] },
      { x: 0, spawnX: 0, yOffset: -12, speed: 250, length: 65, curve: -1.2, lineWidth: 1.0, baseAlpha: 0.26, color: windPalette[1] },
      { x: 0, spawnX: 0, yOffset: -48, speed: 310, length: 80, curve: -3.0, lineWidth: 1.1, baseAlpha: 0.28, color: windPalette[3] },
      { x: 0, spawnX: 0, yOffset: -30, speed: 290, length: 70, curve: 2.2, lineWidth: 1.3, baseAlpha: 0.35, color: windPalette[0] },
      { x: 0, spawnX: 0, yOffset: -5, speed: 240, length: 60, curve: 1.8, lineWidth: 0.9, baseAlpha: 0.22, color: windPalette[2] },
      { x: 0, spawnX: 0, yOffset: -42, speed: 340, length: 85, curve: -1.5, lineWidth: 1.2, baseAlpha: 0.30, color: windPalette[1] },
    ];

    // Initialize wind streams starting strictly from the center of the tree
    streams.forEach((s, idx) => {
      s.spawnX = getTreeSpawnX();
      // Distribute from the center of the tree eastward across the screen on load
      s.x = s.spawnX + (idx / streams.length) * (width - s.spawnX + 30);
    });

    // Helper to initialize an active leaf from the tree canopy
    const resetLeaf = (leaf: FallingLeaf) => {
      const globeCrestY = getGlobeCrestY();
      const originX = width * 0.14 + Math.random() * (width * 0.10);
      const originY = globeCrestY - 70 + Math.random() * 55;

      leaf.x = originX;
      leaf.y = originY;
      leaf.vx = 20 + Math.random() * 25; // Initial detachment speed
      leaf.vy = 10 + Math.random() * 20; // Initial gentle drop
      leaf.targetVx = 175 + Math.random() * 95; // Terminal wind carrying speed
      leaf.drag = 2.0 + Math.random() * 0.8;
      leaf.gravity = 30 + Math.random() * 14;
      leaf.liftCoeff = 18 + Math.random() * 12;
      leaf.size = 5.5 + Math.random() * 2.5;
      leaf.angle = Math.random() * Math.PI * 2;
      leaf.angularVel = (Math.random() - 0.5) * 3.0;
      leaf.flipPhase = Math.random() * Math.PI * 2;
      leaf.flipSpeed = 2.4 + Math.random() * 2.8;
      leaf.color = leafPalette[Math.floor(Math.random() * leafPalette.length)];
      leaf.alpha = 0.78 + Math.random() * 0.18;
    };

    // ----------------------------------------------------
    // INTERACTIVE AIR DRAFT & VORTEX SYSTEM
    // ----------------------------------------------------
    const pointer = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      isActive: false,
      lastActiveTime: 0,
    };

    interface Vortex {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      strength: number;
      rotation: number;
      age: number;
      maxAge: number;
      active: boolean;
    }

    const vortices: Vortex[] = [
      { x: 0, y: 0, radius: 0, maxRadius: 135, strength: 380, rotation: 1, age: 0, maxAge: 0.75, active: false },
      { x: 0, y: 0, radius: 0, maxRadius: 135, strength: 380, rotation: -1, age: 0, maxAge: 0.75, active: false },
      { x: 0, y: 0, radius: 0, maxRadius: 135, strength: 380, rotation: 1, age: 0, maxAge: 0.75, active: false },
    ];

    const triggerVortex = (cx: number, cy: number) => {
      const v = vortices.find((item) => !item.active) || vortices[0];
      v.x = cx;
      v.y = cy;
      v.radius = 8;
      v.strength = 420;
      v.rotation = Math.random() > 0.5 ? 1 : -1;
      v.age = 0;
      v.maxAge = 0.75;
      v.active = true;
    };

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.vx = (pointer.x - pointer.prevX) * 20;
      pointer.vy = (pointer.y - pointer.prevY) * 20;
      pointer.isActive = true;
      pointer.lastActiveTime = performance.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
        pointer.x = t.clientX;
        pointer.y = t.clientY;
        pointer.vx = (pointer.x - pointer.prevX) * 25;
        pointer.vy = (pointer.y - pointer.prevY) * 25;
        pointer.isActive = true;
        pointer.lastActiveTime = performance.now();
      }
    };

    const handleTap = (e: MouseEvent | TouchEvent) => {
      let tx = 0;
      let ty = 0;
      if ("touches" in e && e.touches.length > 0) {
        tx = e.touches[0].clientX;
        ty = e.touches[0].clientY;
      } else if ("clientX" in e) {
        tx = e.clientX;
        ty = e.clientY;
      } else {
        return;
      }
      triggerVortex(tx, ty);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("pointerdown", handleTap, { passive: true });
    window.addEventListener("touchstart", handleTap, { passive: true });

    // Scheduled burst-and-break cycle:
    // Wave 1: First gust (3 leaves detach)
    // Break 1: Calm lull (~3.6s pause, leaves drift off)
    // Wave 2: Lesser gust (only 2 leaves detach, "lesser than first")
    // Break 2: Calm lull (~4.5s pause before next cycle)
    const SPAWN_SCHEDULE = [
      { time: 0.15, spawned: false },
      { time: 0.65, spawned: false },
      { time: 1.15, spawned: false },
      // Break 1: ~3.6s pause
      { time: 4.80, spawned: false },
      { time: 5.35, spawned: false },
      // Break 2: ~4.5s pause
    ];
    const CYCLE_DURATION = 9.8; // seconds

    // Compact pool of 5 leaves (only active leaves are simulated & rendered)
    const leaves: FallingLeaf[] = Array.from({ length: 5 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetVx: 0,
      drag: 0,
      gravity: 0,
      liftCoeff: 0,
      size: 0,
      angle: 0,
      angularVel: 0,
      flipPhase: 0,
      flipSpeed: 0,
      color: leafPalette[0],
      alpha: 0.85,
    }));

    let cycleTime = 0.05;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Runner coordinates atop the crest (left-1/2 top-0 -translate-x-[40px])
      const runnerX = width * 0.5 - 40;
      const globeCrestY = getGlobeCrestY();
      const runnerCenterY = globeCrestY - 24;

      // Update burst cycle timer
      cycleTime += dt;
      if (cycleTime >= CYCLE_DURATION) {
        cycleTime -= CYCLE_DURATION;
        SPAWN_SCHEDULE.forEach((s) => (s.spawned = false));
      }

      // Trigger scheduled leaf detachments
      SPAWN_SCHEDULE.forEach((s) => {
        if (!s.spawned && cycleTime >= s.time) {
          s.spawned = true;
          const available = leaves.find((l) => !l.active);
          if (available) {
            resetLeaf(available);
            available.active = true;
          }
        }
      });

      // ----------------------------------------------------
      // 1. WIND STREAMS (Originating strictly from the center of the tree with gradient fade)
      // ----------------------------------------------------
      streams.forEach((s) => {
        s.x += s.speed * dt;

        // When stream passes screen right, recycle back to the center of the tree
        if (s.x - s.length > width + 40) {
          s.spawnX = getTreeSpawnX();
          s.x = s.spawnX; // Start strictly at the center of the tree (never off the left screen)
        }

        // Never draw anything before or to the left of the tree center
        if (s.x <= s.spawnX + 3) return;

        const tailX = Math.max(s.spawnX, s.x - s.length);
        const currentLen = s.x - tailX;
        if (currentLen < 4) return;

        const baseY = globeCrestY + s.yOffset;

        // Subtle deflection when wind passes runner
        const distToRunner = Math.hypot(s.x - runnerX, baseY - runnerCenterY);
        let deflectY = 0;
        let dynamicAlpha = s.baseAlpha;

        if (distToRunner < 32) {
          deflectY = (baseY < runnerCenterY ? -1 : 1) * (32 - distToRunner) * 0.35;
          dynamicAlpha = Math.min(0.55, s.baseAlpha * 1.3);
        }

        // Smooth distance fade as the stream emerges from the center of the tree
        const emergeDist = s.x - s.spawnX;
        if (emergeDist < 60) {
          dynamicAlpha *= Math.max(0, emergeDist / 60);
        }

        if (dynamicAlpha > 0.01) {
          ctx.save();

          // Realistic gradient fade: 0 opacity at the tail, ramping smoothly to the head
          const grad = ctx.createLinearGradient(tailX, baseY, s.x, baseY);
          grad.addColorStop(0, `${s.color}0)`); // 0 opacity at tail - seamless fade!
          grad.addColorStop(0.55, `${s.color}${dynamicAlpha * 0.75})`);
          grad.addColorStop(1, `${s.color}${dynamicAlpha})`);

          ctx.strokeStyle = grad;
          ctx.lineWidth = s.lineWidth;
          ctx.lineCap = "round";

          ctx.beginPath();
          ctx.moveTo(tailX, baseY + s.curve * (currentLen / s.length));
          ctx.quadraticCurveTo(
            tailX + currentLen * 0.55,
            baseY + deflectY * 0.6,
            s.x,
            baseY + deflectY
          );
          ctx.stroke();

          // Delicate luminous tip
          ctx.fillStyle = `${s.color}${dynamicAlpha * 1.15})`;
          ctx.beginPath();
          ctx.arc(s.x, baseY + deflectY, s.lineWidth * 0.85, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // ----------------------------------------------------
      // 2. ACTIVE AIR VORTICES (Swirling Wind Current from Taps)
      // ----------------------------------------------------
      vortices.forEach((v) => {
        if (!v.active) return;
        v.age += dt;
        if (v.age >= v.maxAge) {
          v.active = false;
          return;
        }

        const progress = v.age / v.maxAge;
        v.radius = 12 + (v.maxRadius - 12) * Math.sin(progress * Math.PI * 0.5);

        // Delicate, ethereal swirling gold arc on canvas
        ctx.save();
        const vAlpha = (1 - progress) * 0.28;
        ctx.strokeStyle = `rgba(255, 175, 55, ${vAlpha})`;
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";
        ctx.beginPath();
        const startAngle = progress * Math.PI * 3.5 * v.rotation;
        ctx.arc(v.x, v.y, v.radius, startAngle, startAngle + Math.PI * 1.35 * v.rotation, v.rotation < 0);
        ctx.stroke();
        ctx.restore();
      });

      // Pointer velocity inertia decay
      if (now - pointer.lastActiveTime > 110) {
        pointer.isActive = false;
        pointer.vx *= 0.8;
        pointer.vy *= 0.8;
      }

      // ----------------------------------------------------
      // 3. FALLING LEAVES (Aerodynamic Flutter & Touch Interactions)
      // ----------------------------------------------------
      leaves.forEach((leaf) => {
        if (!leaf.active) return;

        // A. Interactive Air Turbulence (Brushing finger/cursor past leaf)
        if (pointer.isActive) {
          const pdx = leaf.x - pointer.x;
          const pdy = leaf.y - pointer.y;
          const pdist = Math.hypot(pdx, pdy);
          const reach = 85;

          if (pdist < reach && pdist > 1) {
            const factor = Math.pow(1 - pdist / reach, 1.4);
            const nx = pdx / pdist;
            const ny = pdy / pdist;

            // Direct aerodynamic push away from finger + hand draft wake
            const pushForce = 360 * factor;
            leaf.vx += (nx * pushForce + pointer.vx * 0.45 * factor) * dt;
            leaf.vy += (ny * pushForce + pointer.vy * 0.45 * factor) * dt;

            // Rapid spin on its axis and high-speed 3D tumble when brushed!
            const spinDir = pointer.vx >= 0 ? 1 : -1;
            leaf.angularVel += spinDir * (18 + Math.abs(pointer.vx) * 0.05) * factor * dt * 60;
            leaf.flipSpeed = Math.min(22, leaf.flipSpeed + 12 * factor);
          }
        }

        // B. Wind Vortex Attraction & Swirl (Triggered by Tapping)
        vortices.forEach((v) => {
          if (!v.active) return;
          const vdx = leaf.x - v.x;
          const vdy = leaf.y - v.y;
          const vdist = Math.hypot(vdx, vdy);
          const vReach = v.radius + 60;

          if (vdist < vReach && vdist > 2) {
            const vFactor = Math.max(0, 1 - vdist / vReach);
            const currentStrength = v.strength * (1 - v.age / v.maxAge) * vFactor;

            // Tangential vector (perpendicular to radial vector) -> produces the circular swirl!
            const tx = (-vdy / vdist) * v.rotation;
            const ty = (vdx / vdist) * v.rotation;

            // Gentle inward suction near core, slight outward fling near perimeter
            const radialPull = vdist < v.radius * 0.55 ? -0.4 : 0.45;
            const rx = (vdx / vdist) * radialPull;
            const ry = (vdy / vdist) * radialPull;

            leaf.vx += (tx * 1.2 + rx) * currentStrength * dt;
            leaf.vy += (ty * 1.2 + ry) * currentStrength * dt;

            // Spin the leaf along with the vortex
            leaf.angularVel += v.rotation * 16 * vFactor * dt * 60;
            leaf.flipSpeed = Math.min(20, leaf.flipSpeed + 9 * vFactor);
          }
        });

        // Horizontal wind drag: smoothly recovers eastward speed toward the wind
        leaf.vx += (leaf.targetVx - leaf.vx) * leaf.drag * dt;
        leaf.x += leaf.vx * dt;

        // Gravity pulls downward, while aerodynamic flutter creates periodic lift
        leaf.flipPhase += leaf.flipSpeed * dt;
        const lift = Math.sin(leaf.flipPhase) * leaf.liftCoeff;
        leaf.vy += (leaf.gravity - lift) * dt;
        // Clamp downward terminal velocity for realistic drifting
        leaf.vy = Math.max(-14, Math.min(leaf.vy, 46));
        leaf.y += leaf.vy * dt;

        // Damping angular velocity and flip speed back to natural calm cruising rates
        leaf.angularVel *= Math.pow(0.91, dt * 60);
        leaf.flipSpeed = leaf.flipSpeed * 0.94 + 2.5 * 0.06;

        // 3D rotation and angular tumble
        leaf.angle += leaf.angularVel * dt + Math.cos(leaf.flipPhase) * 0.015;

        // Subtle slipstream deflection when flying past the runner
        const distToRunner = Math.hypot(leaf.x - runnerX, leaf.y - runnerCenterY);
        if (distToRunner < 36) {
          leaf.vy -= (36 - distToRunner) * 0.7 * dt;
        }

        // Deactivate leaf once it blows past the right screen edge or bottom
        if (leaf.x > width + 35 || leaf.y > height + 30) {
          leaf.active = false;
          return;
        }

        // 3D Perspective tumbling projection: leaf flips face-up and edge-on
        const flipScale = Math.abs(Math.sin(leaf.flipPhase)) * 0.75 + 0.25;

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.scale(1, flipScale);

        const halfL = leaf.size * 1.35;
        const halfW = leaf.size * 0.68;

        // Organic pointed leaf body
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = leaf.alpha;
        ctx.beginPath();
        ctx.moveTo(-halfL, 0);
        ctx.bezierCurveTo(-halfL * 0.35, -halfW, halfL * 0.35, -halfW, halfL, 0);
        ctx.bezierCurveTo(halfL * 0.35, halfW, -halfL * 0.35, halfW, -halfL, 0);
        ctx.fill();

        // Subtle central midrib vein for realistic depth
        ctx.strokeStyle = "rgba(60, 35, 15, 0.3)";
        ctx.lineWidth = 0.55;
        ctx.beginPath();
        ctx.moveTo(-halfL * 0.75, 0);
        ctx.lineTo(halfL * 0.75, 0);
        ctx.stroke();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerdown", handleTap);
      window.removeEventListener("touchstart", handleTap);
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
