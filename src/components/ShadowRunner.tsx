"use client";

import { useEffect, useRef } from "react";

export default function ShadowRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = 90;
    const logicalH = 75;

    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = `${logicalW}px`;
    canvas.style.height = `${logicalH}px`;
    ctx.scale(dpr, dpr);

    // Helper: Contoured muscular limb segment with rounded caps and tangential hull
    const drawMuscleCapsule = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      r1: number,
      r2: number,
      color: string
    ) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);
      if (len < 0.2) return;
      const nx = -dy / len;
      const ny = dx / len;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x1, y1, r1, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
      ctx.arc(x2, y2, r2, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
      ctx.closePath();
      ctx.fill();
    };

    // Helper: Sleek aerodynamic running shoe
    const drawRunningShoe = (
      ax: number,
      ay: number,
      toeAngle: number,
      color: string
    ) => {
      const forwardX = Math.cos(toeAngle);
      const forwardY = Math.sin(toeAngle);
      const upX = -forwardY;
      const upY = forwardX;

      // Ankle -> Toe -> Sole -> Heel
      const heelX = ax - forwardX * 2.5 + upX * 1;
      const heelY = ay - forwardY * 2.5 + upY * 1;
      const toeX = ax + forwardX * 7.5;
      const toeY = ay + forwardY * 7.5;
      const soleX = ax + forwardX * 3.5 - upX * 1.8;
      const soleY = ay + forwardY * 3.5 - upY * 1.8;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(heelX, heelY);
      ctx.lineTo(ax - upX * 1.5, ay - upY * 1.5);
      ctx.lineTo(toeX, toeY);
      ctx.lineTo(soleX, soleY);
      ctx.closePath();
      ctx.fill();
    };

    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const cycleTime = 0.65; // High-cadence athletic running pace (~185 steps/min)
      const theta = ((elapsed % cycleTime) / cycleTime) * Math.PI * 2;

      ctx.clearRect(0, 0, logicalW, logicalH);

      // Global reference coordinates (Runner facing LEFT)
      const cx = 46;
      const groundY = 68;

      // Pelvis vertical flight bob (2 bobs per full stride cycle)
      const flightBob = Math.sin(theta * 2);
      const hipY = groundY - 30.5 - Math.max(0, flightBob) * 2.2;
      const hipX = cx;

      // Colors: Foreground Obsidian Black & Background Depth Charcoal
      const nearColor = "#140d0c";
      const farColor = "#362420";

      // Kinematics solver for legs (facing left: forward is -X, backward is +X)
      const solveLeg = (phase: number) => {
        const thighLength = 15;
        const shinLength = 15;

        // Thigh swing: swings forward (-X) when phase > 0, back (+X) when phase < 0
        const thighAngle = -Math.sin(phase) * 0.58;
        const kneeX = hipX + Math.sin(thighAngle) * thighLength;
        const kneeY = hipY + Math.cos(thighAngle) * thighLength;

        // Knee flexion: bends backward (+X, heel up) during recovery swing
        const recoveryKick = Math.max(0, Math.cos(phase)) * 1.1;
        const pushStraight = Math.max(0, -Math.sin(phase)) * 0.22;
        const kneeFlexion = thighAngle + 0.15 + recoveryKick - pushStraight;

        const ankleX = kneeX + Math.sin(kneeFlexion) * shinLength;
        const ankleY = kneeY + Math.cos(kneeFlexion) * shinLength;

        // Ankle toe angle
        const toeAngle = Math.PI - 0.22 - (recoveryKick * 0.45);

        return { kneeX, kneeY, ankleX, ankleY, toeAngle };
      };

      // Kinematics solver for arms (opposite phase to legs)
      const solveArm = (phase: number, shoulderX: number, shoulderY: number) => {
        const upperLength = 10.5;
        const foreLength = 10;

        // Arm pumps opposite to leg: forward (-X) when leg is back
        const upperAngle = Math.sin(phase) * 0.55 - 0.15;
        const elbowX = shoulderX + Math.sin(upperAngle) * upperLength;
        const elbowY = shoulderY + Math.cos(upperAngle) * upperLength;

        // Forearm bent forward at roughly 80°
        const foreAngle = upperAngle - 1.35;
        const fistX = elbowX + Math.sin(foreAngle) * foreLength;
        const fistY = elbowY + Math.cos(foreAngle) * foreLength;

        return { elbowX, elbowY, fistX, fistY };
      };

      // Torso & Shoulder calculations (Athletic forward lean of 15° facing left)
      const torsoLength = 16.5;
      const spineAngle = -0.26 + flightBob * 0.03; // ~15 degrees forward lean
      const shoulderX = hipX + Math.sin(spineAngle) * torsoLength;
      const shoulderY = hipY - Math.cos(spineAngle) * torsoLength;

      // Leg 1 (Near leg, phase theta) & Leg 2 (Far leg, phase theta + PI)
      const nearLeg = solveLeg(theta);
      const farLeg = solveLeg(theta + Math.PI);

      // Arm 1 (Near arm, phase theta) & Arm 2 (Far arm, phase theta + PI)
      const nearArm = solveArm(theta, shoulderX, shoulderY);
      const farArm = solveArm(theta + Math.PI, shoulderX, shoulderY);

      // ==========================================
      // LAYER 1: FAR ARM (Background)
      // ==========================================
      drawMuscleCapsule(shoulderX, shoulderY, farArm.elbowX, farArm.elbowY, 3.2, 2.4, farColor);
      drawMuscleCapsule(farArm.elbowX, farArm.elbowY, farArm.fistX, farArm.fistY, 2.4, 2.0, farColor);
      ctx.fillStyle = farColor;
      ctx.beginPath();
      ctx.arc(farArm.fistX, farArm.fistY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // LAYER 2: FAR LEG (Background)
      // ==========================================
      // Far Thigh (tapered from hip to knee)
      drawMuscleCapsule(hipX, hipY, farLeg.kneeX, farLeg.kneeY, 4.4, 3.0, farColor);
      // Far Calf & Shin (muscular bulge at mid-calf)
      const farMidCalfX = farLeg.kneeX + (farLeg.ankleX - farLeg.kneeX) * 0.45;
      const farMidCalfY = farLeg.kneeY + (farLeg.ankleY - farLeg.kneeY) * 0.45;
      drawMuscleCapsule(farLeg.kneeX, farLeg.kneeY, farMidCalfX, farMidCalfY, 3.0, 3.7, farColor);
      drawMuscleCapsule(farMidCalfX, farMidCalfY, farLeg.ankleX, farLeg.ankleY, 3.7, 2.2, farColor);
      // Far Running Shoe
      drawRunningShoe(farLeg.ankleX, farLeg.ankleY, farLeg.toeAngle, farColor);

      // ==========================================
      // LAYER 3: TORSO & CHEST
      // ==========================================
      // Contoured athletic torso
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.moveTo(shoulderX - 4.2, shoulderY);
      ctx.lineTo(shoulderX + 3.8, shoulderY);
      ctx.lineTo(hipX + 3.2, hipY);
      ctx.lineTo(hipX - 3.8, hipY);
      ctx.closePath();
      ctx.fill();
      // Rounded chest contour
      ctx.beginPath();
      ctx.arc(shoulderX, shoulderY, 4.2, 0, Math.PI * 2);
      ctx.arc(hipX, hipY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // LAYER 4: HEAD, NECK & STREAMING HAIR
      // ==========================================
      const headCenterX = shoulderX - 4.6;
      const headCenterY = shoulderY - 8.8;

      // Neck
      drawMuscleCapsule(shoulderX - 1.5, shoulderY - 2, headCenterX + 1.2, headCenterY + 2.5, 2.8, 2.4, nearColor);

      // Head silhouette (oval with forward-facing athletic profile)
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.ellipse(headCenterX, headCenterY, 4.6, 5.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sleek visor / nose profile facing left (-X)
      ctx.beginPath();
      ctx.moveTo(headCenterX - 3.5, headCenterY - 1.8);
      ctx.lineTo(headCenterX - 7.5, headCenterY - 0.5);
      ctx.lineTo(headCenterX - 4.2, headCenterY + 2.2);
      ctx.closePath();
      ctx.fill();

      // Aerodynamic wind-blown hair ribbon fluttering behind to the right (+X)
      const hairFlutter = Math.sin(elapsed * 16) * 2.2;
      ctx.beginPath();
      ctx.moveTo(headCenterX + 3.0, headCenterY - 2.5);
      ctx.quadraticCurveTo(
        headCenterX + 8.0,
        headCenterY - 4.5 + hairFlutter * 0.5,
        headCenterX + 14.5,
        headCenterY - 2.0 + hairFlutter
      );
      ctx.quadraticCurveTo(
        headCenterX + 7.5,
        headCenterY + 0.5 + hairFlutter * 0.5,
        headCenterX + 2.5,
        headCenterY + 1.5
      );
      ctx.closePath();
      ctx.fill();

      // ==========================================
      // LAYER 5: NEAR LEG (Foreground Obsidian)
      // ==========================================
      // Near Thigh
      drawMuscleCapsule(hipX, hipY, nearLeg.kneeX, nearLeg.kneeY, 4.8, 3.2, nearColor);
      // Near Calf & Shin (muscular athletic contour)
      const nearMidCalfX = nearLeg.kneeX + (nearLeg.ankleX - nearLeg.kneeX) * 0.45;
      const nearMidCalfY = nearLeg.kneeY + (nearLeg.ankleY - nearLeg.kneeY) * 0.45;
      drawMuscleCapsule(nearLeg.kneeX, nearLeg.kneeY, nearMidCalfX, nearMidCalfY, 3.2, 4.0, nearColor);
      drawMuscleCapsule(nearMidCalfX, nearMidCalfY, nearLeg.ankleX, nearLeg.ankleY, 4.0, 2.4, nearColor);
      // Near Running Shoe
      drawRunningShoe(nearLeg.ankleX, nearLeg.ankleY, nearLeg.toeAngle, nearColor);

      // ==========================================
      // LAYER 6: NEAR ARM (Foreground Obsidian)
      // ==========================================
      drawMuscleCapsule(shoulderX, shoulderY, nearArm.elbowX, nearArm.elbowY, 3.5, 2.6, nearColor);
      drawMuscleCapsule(nearArm.elbowX, nearArm.elbowY, nearArm.fistX, nearArm.fistY, 2.6, 2.1, nearColor);
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.arc(nearArm.fistX, nearArm.fistY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center pointer-events-none select-none">
      <canvas
        ref={canvasRef}
        className="w-[90px] h-[75px] block pointer-events-none select-none"
      />
    </div>
  );
}
