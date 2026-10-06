"use client";

import { useEffect, useRef } from "react";

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
  life: number;
  size: number;
  angle: number;
  color: string;
};

/** Decorative, bounded, and idle when there are no sparks. Never intercepts input. */
export function SparkleTrail() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    let sparks: Spark[] = [],
      frame = 0,
      last = 0,
      width = 0,
      height = 0;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth;
      height = innerHeight;
      el.width = width * dpr;
      el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      sparks = [];
      ctx.clearRect(0, 0, width, height);
    };
    const draw = (now: number) => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      sparks = sparks.filter((s) => now - s.born < s.life);
      for (const s of sparks) {
        const t = (now - s.born) / s.life;
        const size = s.size * Math.sin(Math.PI * Math.min(1, t * 1.1));
        ctx.save();
        ctx.translate(s.x + s.vx * t, s.y + s.vy * t + 13 * t * t);
        ctx.rotate(s.angle + t * 0.65);
        ctx.globalAlpha = (1 - t) * 0.9;
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 9;
        ctx.beginPath();
        for (let j = 0; j < 8; j++) {
          const r = j % 2 ? size * 0.23 : size;
          const angle = (j * Math.PI) / 4;
          if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      if (sparks.length) frame = requestAnimationFrame(draw);
    };
    const move = (e: PointerEvent) => {
      const now = performance.now();
      if (
        e.pointerType !== "mouse" ||
        reduced.matches ||
        !pointer.matches ||
        document.hidden ||
        now - last < 24
      )
        return;
      last = now;
      for (let i = 0; i < 2; i++)
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 12,
          y: e.clientY + (Math.random() - 0.5) * 12,
          vx: (Math.random() - 0.5) * 24,
          vy: Math.random() * 18,
          born: now,
          life: 450 + Math.random() * 350,
          size: 3 + Math.random() * 5,
          angle: Math.random(),
          color: ["#fffef3", "#ffe9a7", "#fff0fb"][
            Math.floor(Math.random() * 3)
          ],
        });
      sparks = sparks.slice(-64);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    reduced.addEventListener("change", clear);
    pointer.addEventListener("change", clear);
    return () => {
      clear();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
      reduced.removeEventListener("change", clear);
      pointer.removeEventListener("change", clear);
    };
  }, []);
  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      data-sparkle-trail
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 80,
      }}
    />
  );
}
