"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const MAP_SRC = "/assets/figma/how/world-dots.png";
const BASE_ROTATION_MS = 30000;
const HOVER_SPEED = 1.2;

type Dot = { cx: number; cy: number; cz: number };

/* Dependency-free dotted 3D globe: samples the equirectangular dotted world
   map into lat/lon points and renders an orthographic projection on a 2D
   canvas. No WebGL required, so there is no library cost and the fallback is
   the same code path (a static frame). */
export function DottedGlobe({ hovered }: { hovered: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredRef = useRef(hovered);
  const reducedMotion = useReducedMotion();

  hoveredRef.current = hovered;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!host || !canvas || !ctx) return;

    let disposed = false;
    let raf = 0;
    let rotation = 0;
    let last: number | null = null;
    let visible = false;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      if (!host || !canvas) return;
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, width < 480 ? 1 : 1.75);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      drawFrame();
    }

    function drawFrame() {
      if (!ctx || width === 0 || height === 0) return;
      const radius = Math.min(width, height) * 0.38;
      const cxp = width / 2;
      const cyp = height / 2;
      const glow = hoveredRef.current ? 1.18 : 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const sphere = ctx.createRadialGradient(
        cxp - radius * 0.35,
        cyp - radius * 0.4,
        radius * 0.2,
        cxp,
        cyp,
        radius,
      );
      sphere.addColorStop(0, "#1b2a4a");
      sphere.addColorStop(1, "#0d1526");
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cxp, cyp, radius, 0, Math.PI * 2);
      ctx.fill();

      const sinR = Math.sin(rotation);
      const cosR = Math.cos(rotation);
      for (const dot of dots) {
        const x = dot.cx * cosR + dot.cz * sinR;
        const z = -dot.cx * sinR + dot.cz * cosR;
        if (z <= 0.02) continue;
        const alpha = Math.min(1, (0.18 + 0.72 * z) * glow);
        ctx.fillStyle = `rgba(169, 224, 251, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(
          cxp + x * radius,
          cyp - dot.cy * radius,
          (0.9 + 0.9 * z) * (radius / 130),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (last === null) {
        last = now;
        return;
      }
      const dt = Math.min(now - last, 100);
      last = now;
      if (!visible) return;
      const speed = hoveredRef.current ? HOVER_SPEED : 1;
      rotation = (rotation + ((Math.PI * 2) / BASE_ROTATION_MS) * dt * speed) % (Math.PI * 2);
      drawFrame();
    }

    const img = new Image();
    img.src = MAP_SRC;
    img
      .decode()
      .then(() => {
        if (disposed) return;
        const sw = 300;
        const sh = 150;
        const oc = document.createElement("canvas");
        oc.width = sw;
        oc.height = sh;
        const octx = oc.getContext("2d");
        if (!octx) return;
        octx.drawImage(img, 0, 0, sw, sh);
        const data = octx.getImageData(0, 0, sw, sh).data;
        const step = 3;
        const sampled: Dot[] = [];
        for (let y = step; y < sh - 1; y += step) {
          for (let x = 0; x < sw; x += step) {
            if (data[(y * sw + x) * 4 + 3] > 60) {
              const lon = (x / sw) * Math.PI * 2 - Math.PI;
              const lat = Math.PI / 2 - (y / sh) * Math.PI;
              sampled.push({
                cx: Math.cos(lat) * Math.cos(lon),
                cy: Math.sin(lat),
                cz: Math.cos(lat) * Math.sin(lon),
              });
            }
          }
        }
        dots = sampled;
        resize();
        if (!reducedMotion) raf = requestAnimationFrame(tick);
      })
      .catch(() => {
        /* Map missing: the card keeps its plain panel as the fallback. */
      });

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
      },
      { rootMargin: "160px" },
    );
    io.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="absolute inset-0" ref={hostRef}>
      <canvas className="block" ref={canvasRef} />
    </div>
  );
}
