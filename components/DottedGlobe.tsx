"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const BASE_ROTATION_MS = 42000;
const HOVER_SPEED = 1.8;

type GeoPoint = { lat: number; lon: number };
type ProjectedPoint = GeoPoint & { x: number; y: number; z: number };

const landShapes: GeoPoint[][] = [
  [
    { lat: 62, lon: -132 },
    { lat: 52, lon: -92 },
    { lat: 40, lon: -74 },
    { lat: 24, lon: -98 },
    { lat: 18, lon: -118 },
    { lat: 38, lon: -126 },
  ],
  [
    { lat: 12, lon: -79 },
    { lat: -8, lon: -48 },
    { lat: -34, lon: -56 },
    { lat: -54, lon: -70 },
    { lat: -18, lon: -78 },
  ],
  [
    { lat: 58, lon: -8 },
    { lat: 66, lon: 34 },
    { lat: 46, lon: 58 },
    { lat: 36, lon: 30 },
    { lat: 38, lon: -6 },
  ],
  [
    { lat: 34, lon: -14 },
    { lat: 31, lon: 28 },
    { lat: 8, lon: 44 },
    { lat: -34, lon: 20 },
    { lat: -22, lon: -10 },
    { lat: 8, lon: -18 },
  ],
  [
    { lat: 58, lon: 46 },
    { lat: 54, lon: 104 },
    { lat: 30, lon: 124 },
    { lat: 8, lon: 104 },
    { lat: 16, lon: 70 },
    { lat: 34, lon: 52 },
  ],
  [
    { lat: -12, lon: 112 },
    { lat: -22, lon: 152 },
    { lat: -42, lon: 144 },
    { lat: -34, lon: 116 },
  ],
];

const routes: [GeoPoint, GeoPoint][] = [
  [
    { lat: 6.5, lon: 3.4 },
    { lat: 25.2, lon: 55.3 },
  ],
  [
    { lat: 5.6, lon: -0.2 },
    { lat: 51.5, lon: -0.1 },
  ],
  [
    { lat: -1.3, lon: 36.8 },
    { lat: 40.7, lon: -74 },
  ],
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function project(point: GeoPoint, rotation: number, radius: number, cx: number, cy: number): ProjectedPoint {
  const lat = toRadians(point.lat);
  const lon = toRadians(point.lon) + rotation;
  const cosLat = Math.cos(lat);
  const x = cosLat * Math.sin(lon);
  const y = Math.sin(lat);
  const z = cosLat * Math.cos(lon);

  return {
    ...point,
    x: cx + x * radius,
    y: cy - y * radius,
    z,
  };
}

function midpoint(first: GeoPoint, second: GeoPoint): GeoPoint {
  return {
    lat: (first.lat + second.lat) / 2 + 18,
    lon: (first.lon + second.lon) / 2,
  };
}

/* Smooth canvas globe used in the "Regulated, not a workaround" feature card.
   It intentionally avoids the old dotted world-map texture. */
export function SmoothGlobe({ hovered }: { hovered: boolean }) {
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
    const hostElement = host;
    const canvasElement = canvas;
    const context = ctx;

    let raf = 0;
    let rotation = -0.45;
    let pulse = 0;
    let last: number | null = null;
    let visible = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      const rect = hostElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, width < 480 ? 1 : 1.75);
      canvasElement.width = Math.max(1, Math.round(width * dpr));
      canvasElement.height = Math.max(1, Math.round(height * dpr));
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      drawFrame();
    }

    function drawFrame() {
      if (width === 0 || height === 0) return;
      const ctx = context;

      const radius = Math.min(width, height) * 0.36;
      const cx = width / 2;
      const cy = height / 2;
      const hoverGlow = hoveredRef.current ? 1.18 : 1;

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.42);
      outerGlow.addColorStop(0, `rgba(83, 177, 253, ${0.16 * hoverGlow})`);
      outerGlow.addColorStop(1, "rgba(83, 177, 253, 0)");
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.42, 0, Math.PI * 2);
      ctx.fill();

      const sphere = ctx.createRadialGradient(
        cx - radius * 0.38,
        cy - radius * 0.42,
        radius * 0.08,
        cx,
        cy,
        radius,
      );
      sphere.addColorStop(0, "#20365c");
      sphere.addColorStop(0.48, "#111f38");
      sphere.addColorStop(1, "#090f1c");
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      for (const shape of landShapes) {
        const points = shape.map((point) => project(point, rotation, radius, cx, cy));
        const visibility = points.reduce((sum, point) => sum + point.z, 0) / points.length;
        if (visibility < -0.15) continue;

        ctx.fillStyle = `rgba(83, 177, 253, ${Math.min(0.34, 0.12 + visibility * 0.2)})`;
        ctx.strokeStyle = `rgba(169, 224, 251, ${Math.min(0.3, 0.08 + visibility * 0.12)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(169, 224, 251, 0.16)";
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy - Math.sin(toRadians(lat)) * radius;
        const rx = Math.cos(toRadians(lat)) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, y, rx, rx * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let lon = 0; lon < 180; lon += 30) {
        const phase = toRadians(lon) + rotation;
        const alpha = 0.09 + Math.abs(Math.cos(phase)) * 0.08;
        ctx.strokeStyle = `rgba(169, 224, 251, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.cos(phase)) * radius, radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      routes.forEach(([from, to], routeIndex) => {
        const start = project(from, rotation, radius, cx, cy);
        const end = project(to, rotation, radius, cx, cy);
        const control = project(midpoint(from, to), rotation, radius * 1.08, cx, cy);
        const visibility = Math.min(start.z, end.z, control.z);
        if (visibility < -0.08) return;

        ctx.strokeStyle = `rgba(169, 224, 251, ${0.22 + visibility * 0.28})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
        ctx.stroke();

        const t = (pulse + routeIndex * 0.28) % 1;
        const inv = 1 - t;
        const px = inv * inv * start.x + 2 * inv * t * control.x + t * t * end.x;
        const py = inv * inv * start.y + 2 * inv * t * control.y + t * t * end.y;
        const pointGlow = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.08);
        pointGlow.addColorStop(0, "rgba(239, 248, 255, 0.96)");
        pointGlow.addColorStop(0.32, "rgba(169, 224, 251, 0.56)");
        pointGlow.addColorStop(1, "rgba(169, 224, 251, 0)");
        ctx.fillStyle = pointGlow;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.08, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      const rim = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      rim.addColorStop(0, "rgba(239, 248, 255, 0.34)");
      rim.addColorStop(0.42, "rgba(169, 224, 251, 0.04)");
      rim.addColorStop(1, "rgba(238, 170, 253, 0.22)");
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
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
      pulse = (pulse + dt / (hoveredRef.current ? 1900 : 2800)) % 1;
      drawFrame();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(hostElement);
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        if (visible) drawFrame();
      },
      { rootMargin: "160px" },
    );
    io.observe(hostElement);
    resize();
    if (!reducedMotion) raf = requestAnimationFrame(tick);

    return () => {
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
