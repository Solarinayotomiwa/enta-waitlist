"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const MARKERS = [
  { location: [6.45, 3.39] as [number, number], size: 0.07 },
  { location: [25.2, 55.27] as [number, number], size: 0.055 },
  { location: [51.51, -0.13] as [number, number], size: 0.045 },
  { location: [40.71, -74.01] as [number, number], size: 0.04 },
  { location: [5.56, -0.2] as [number, number], size: 0.04 },
];

const ARCS = [
  { from: [6.45, 3.39] as [number, number], to: [25.2, 55.27] as [number, number] },
  { from: [6.45, 3.39] as [number, number], to: [51.51, -0.13] as [number, number] },
  { from: [25.2, 55.27] as [number, number], to: [40.71, -74.01] as [number, number] },
];

export function SmoothGlobe({ hovered }: { hovered: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoveredRef = useRef(hovered);
  const reducedMotion = useReducedMotion();

  hoveredRef.current = hovered;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const hostElement = host;
    const canvasElement = canvas;

    let frame = 0;
    let phi = -0.35;
    let width = 0;
    let globe: ReturnType<typeof createGlobe> | null = null;

    function resize() {
      const nextWidth = Math.max(1, hostElement.getBoundingClientRect().width);
      if (Math.abs(nextWidth - width) < 1) return;
      width = nextWidth;
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${width}px`;
    }

    resize();

    globe = createGlobe(canvasElement, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2,
      height: width * 2,
      phi,
      theta: 0.22,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 16000,
      mapBrightness: 3.8,
      baseColor: [0.04, 0.08, 0.17],
      markerColor: [0.65, 0.88, 1],
      glowColor: [0.16, 0.36, 0.72],
      markers: MARKERS,
      arcs: ARCS,
      arcColor: [0.63, 0.86, 1],
      arcWidth: 0.55,
      arcHeight: 0.32,
      scale: 1.04,
    });

    const ro = new ResizeObserver(resize);
    ro.observe(hostElement);

    function animate() {
      if (!globe) return;

      const pulse = (Math.sin(performance.now() / 720) + 1) / 2;
      if (!reducedMotion) {
        phi += hoveredRef.current ? 0.009 : 0.0045;
      }

      globe.update({
        phi,
        width: width * 2,
        height: width * 2,
        mapBrightness: 3.3 + pulse * 1.4,
        markerColor: [0.5 + pulse * 0.35, 0.78 + pulse * 0.18, 1],
        glowColor: [0.12 + pulse * 0.18, 0.28 + pulse * 0.28, 0.64 + pulse * 0.28],
        scale: hoveredRef.current ? 1.075 : 1.04 + pulse * 0.012,
      });

      frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      globe?.destroy();
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2"
      ref={hostRef}
    >
      <canvas className="block size-full opacity-95" ref={canvasRef} />
    </div>
  );
}
