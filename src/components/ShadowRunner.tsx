"use client";

import { useEffect, useRef } from "react";

export default function ShadowRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Only run the mobile canvas animation loop on mobile screens (<640px)
    if (window.innerWidth >= 640) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const logicalW = 110;
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
      const cycleTime = 0.65; // Athletic cadence (~185 steps/min)
      const theta = ((elapsed % cycleTime) / cycleTime) * Math.PI * 2;

      ctx.clearRect(0, 0, logicalW, logicalH);

      // Global reference coordinates (Runner facing LEFT at cx=40)
      const cx = 40;
      const groundY = 68;

      // Pelvis vertical flight bob (2 bobs per full stride cycle)
      const flightBob = Math.sin(theta * 2);
      const hipY = groundY - 30.5 - Math.max(0, flightBob) * 2.2;
      const hipX = cx;

      // Colors: Foreground Obsidian Black & Background Depth Charcoal
      const nearColor = "#140d0c";
      const farColor = "#362420";

      // Kinematics solver for legs
      const solveLeg = (phase: number) => {
        const thighLength = 15;
        const shinLength = 15;

        const thighAngle = -Math.sin(phase) * 0.58;
        const kneeX = hipX + Math.sin(thighAngle) * thighLength;
        const kneeY = hipY + Math.cos(thighAngle) * thighLength;

        const recoveryKick = Math.max(0, Math.cos(phase)) * 1.1;
        const pushStraight = Math.max(0, -Math.sin(phase)) * 0.22;
        const kneeFlexion = thighAngle + 0.15 + recoveryKick - pushStraight;

        const ankleX = kneeX + Math.sin(kneeFlexion) * shinLength;
        const ankleY = kneeY + Math.cos(kneeFlexion) * shinLength;
        const toeAngle = Math.PI - 0.22 - recoveryKick * 0.45;

        return { kneeX, kneeY, ankleX, ankleY, toeAngle };
      };

      // Kinematics solver for arms
      const solveArm = (phase: number, shoulderX: number, shoulderY: number) => {
        const upperLength = 10.5;
        const foreLength = 10;

        const upperAngle = Math.sin(phase) * 0.55 - 0.15;
        const elbowX = shoulderX + Math.sin(upperAngle) * upperLength;
        const elbowY = shoulderY + Math.cos(upperAngle) * upperLength;

        const foreAngle = upperAngle - 1.35;
        const fistX = elbowX + Math.sin(foreAngle) * foreLength;
        const fistY = elbowY + Math.cos(foreAngle) * foreLength;

        return { elbowX, elbowY, fistX, fistY };
      };

      // Torso & Shoulder calculations (Athletic forward lean of 16° facing left into the storm)
      const torsoLength = 16.5;
      const spineAngle = -0.28 + flightBob * 0.03;
      const shoulderX = hipX + Math.sin(spineAngle) * torsoLength;
      const shoulderY = hipY - Math.cos(spineAngle) * torsoLength;

      const nearLeg = solveLeg(theta);
      const farLeg = solveLeg(theta + Math.PI);
      const nearArm = solveArm(theta, shoulderX, shoulderY);
      const farArm = solveArm(theta + Math.PI, shoulderX, shoulderY);

      // ==============================================================
      // LAYER 0: CAST SHADOW ON GLOBE BEHIND HIS BACK
      // ==============================================================
      ctx.save();
      const shadowGrad = ctx.createLinearGradient(cx, groundY, cx + 38, groundY + 4);
      shadowGrad.addColorStop(0, "rgba(35, 20, 16, 0.45)");
      shadowGrad.addColorStop(0.5, "rgba(35, 20, 16, 0.28)");
      shadowGrad.addColorStop(0.85, "rgba(35, 20, 16, 0.12)");
      shadowGrad.addColorStop(1, "rgba(35, 20, 16, 0)");

      const projectShadow = (x: number, y: number) => {
        const height = Math.max(0, groundY - y);
        const px = x + height * 0.76;
        const py = groundY + Math.pow(Math.max(0, px - cx) * 0.11, 1.6);
        return { px, py };
      };

      const sNearKnee = projectShadow(nearLeg.kneeX, nearLeg.kneeY);
      const sNearAnkle = projectShadow(nearLeg.ankleX, nearLeg.ankleY);
      const sFarKnee = projectShadow(farLeg.kneeX, farLeg.kneeY);
      const sFarAnkle = projectShadow(farLeg.ankleX, farLeg.ankleY);
      const sShoulder = projectShadow(shoulderX, shoulderY);
      const sHead = projectShadow(shoulderX - 4.6, shoulderY - 8.8);

      drawMuscleCapsule(cx, groundY, sNearKnee.px, sNearKnee.py, 3.0, 2.0, shadowGrad as unknown as string);
      drawMuscleCapsule(sNearKnee.px, sNearKnee.py, sNearAnkle.px, sNearAnkle.py, 2.0, 1.3, shadowGrad as unknown as string);
      drawMuscleCapsule(cx, groundY, sFarKnee.px, sFarKnee.py, 2.8, 1.8, shadowGrad as unknown as string);
      drawMuscleCapsule(sFarKnee.px, sFarKnee.py, sFarAnkle.px, sFarAnkle.py, 1.8, 1.2, shadowGrad as unknown as string);

      drawMuscleCapsule(cx, groundY, sShoulder.px, sShoulder.py, 3.8, 2.6, shadowGrad as unknown as string);
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(sHead.px, sHead.py, 5.0, 2.2, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==============================================================
      // AMBIENT BACK SHADOW ON RUNNER'S BODY
      // ==============================================================
      ctx.save();
      ctx.shadowColor = "rgba(18, 11, 10, 0.5)";
      ctx.shadowBlur = 3.5;
      ctx.shadowOffsetX = 1.8;
      ctx.shadowOffsetY = 0;

      // FAR ARM
      drawMuscleCapsule(shoulderX, shoulderY, farArm.elbowX, farArm.elbowY, 3.2, 2.4, farColor);
      drawMuscleCapsule(farArm.elbowX, farArm.elbowY, farArm.fistX, farArm.fistY, 2.4, 2.0, farColor);
      ctx.fillStyle = farColor;
      ctx.beginPath();
      ctx.arc(farArm.fistX, farArm.fistY, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // FAR LEG
      drawMuscleCapsule(hipX, hipY, farLeg.kneeX, farLeg.kneeY, 4.4, 3.0, farColor);
      const farMidCalfX = farLeg.kneeX + (farLeg.ankleX - farLeg.kneeX) * 0.45;
      const farMidCalfY = farLeg.kneeY + (farLeg.ankleY - farLeg.kneeY) * 0.45;
      drawMuscleCapsule(farLeg.kneeX, farLeg.kneeY, farMidCalfX, farMidCalfY, 3.0, 3.7, farColor);
      drawMuscleCapsule(farMidCalfX, farMidCalfY, farLeg.ankleX, farLeg.ankleY, 3.7, 2.2, farColor);
      drawRunningShoe(farLeg.ankleX, farLeg.ankleY, farLeg.toeAngle, farColor);

      // TORSO & CHEST
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.moveTo(shoulderX - 4.2, shoulderY);
      ctx.lineTo(shoulderX + 3.8, shoulderY);
      ctx.lineTo(hipX + 3.2, hipY);
      ctx.lineTo(hipX - 3.8, hipY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(shoulderX, shoulderY, 4.2, 0, Math.PI * 2);
      ctx.arc(hipX, hipY, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // HEAD & NECK
      const headCenterX = shoulderX - 4.6;
      const headCenterY = shoulderY - 8.8;
      drawMuscleCapsule(shoulderX - 1.5, shoulderY - 2, headCenterX + 1.2, headCenterY + 2.5, 2.8, 2.4, nearColor);

      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.ellipse(headCenterX, headCenterY, 4.6, 5.2, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sleek visor facing into the wind (-X)
      ctx.beginPath();
      ctx.moveTo(headCenterX - 3.5, headCenterY - 1.8);
      ctx.lineTo(headCenterX - 7.5, headCenterY - 0.5);
      ctx.lineTo(headCenterX - 4.2, headCenterY + 2.2);
      ctx.closePath();
      ctx.fill();

      // Wind-blown hair trailing behind in the storm (+X)
      const windTurbulence = Math.sin(elapsed * 22) * 3.0;
      ctx.beginPath();
      ctx.moveTo(headCenterX + 3.0, headCenterY - 2.5);
      ctx.quadraticCurveTo(
        headCenterX + 9.0,
        headCenterY - 5.5 + windTurbulence * 0.6,
        headCenterX + 16.5,
        headCenterY - 2.2 + windTurbulence
      );
      ctx.quadraticCurveTo(
        headCenterX + 8.5,
        headCenterY + 0.8 + windTurbulence * 0.5,
        headCenterX + 2.5,
        headCenterY + 1.5
      );
      ctx.closePath();
      ctx.fill();

      // NEAR LEG
      drawMuscleCapsule(hipX, hipY, nearLeg.kneeX, nearLeg.kneeY, 4.8, 3.2, nearColor);
      const nearMidCalfX = nearLeg.kneeX + (nearLeg.ankleX - nearLeg.kneeX) * 0.45;
      const nearMidCalfY = nearLeg.kneeY + (nearLeg.ankleY - nearLeg.kneeY) * 0.45;
      drawMuscleCapsule(nearLeg.kneeX, nearLeg.kneeY, nearMidCalfX, nearMidCalfY, 3.2, 4.0, nearColor);
      drawMuscleCapsule(nearMidCalfX, nearMidCalfY, nearLeg.ankleX, nearLeg.ankleY, 4.0, 2.4, nearColor);
      drawRunningShoe(nearLeg.ankleX, nearLeg.ankleY, nearLeg.toeAngle, nearColor);

      // NEAR ARM
      drawMuscleCapsule(shoulderX, shoulderY, nearArm.elbowX, nearArm.elbowY, 3.5, 2.6, nearColor);
      drawMuscleCapsule(nearArm.elbowX, nearArm.elbowY, nearArm.fistX, nearArm.fistY, 2.6, 2.1, nearColor);
      ctx.fillStyle = nearColor;
      ctx.beginPath();
      ctx.arc(nearArm.fistX, nearArm.fistY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore from ambient back shadow

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
        className="w-[110px] h-[75px] block pointer-events-none select-none"
      />
    </div>
  );
}
