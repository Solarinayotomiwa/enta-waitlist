"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const BLUE_DOT = [0.294, 0.545, 1] as [number, number, number];
const GLOBE_BLUE = [0.063, 0.165, 0.337] as [number, number, number];

type GlobeLocation = [number, number];
type GlobeMarker = { location: GlobeLocation; size: number };
type GlobeArc = { from: GlobeLocation; to: GlobeLocation };

const HUBS: GlobeMarker[] = [
  { location: [6.45, 3.39], size: 0.07 },
  { location: [25.2, 55.27], size: 0.055 },
  { location: [51.51, -0.13], size: 0.045 },
  { location: [40.71, -74.01], size: 0.04 },
  { location: [5.56, -0.2], size: 0.04 },
  { location: [-1.29, 36.82], size: 0.04 },
  { location: [-26.2, 28.04], size: 0.035 },
  { location: [19.08, 72.88], size: 0.035 },
  { location: [1.35, 103.82], size: 0.034 },
  { location: [-23.55, -46.63], size: 0.032 },
  { location: [43.65, -79.38], size: 0.032 },
  { location: [24.71, 46.68], size: 0.034 },
];

const ROUTES: GlobeArc[] = [
  { from: [6.45, 3.39], to: [25.2, 55.27] },
  { from: [6.45, 3.39], to: [51.51, -0.13] },
  { from: [6.45, 3.39], to: [5.56, -0.2] },
  { from: [5.56, -0.2], to: [40.71, -74.01] },
  { from: [25.2, 55.27], to: [40.71, -74.01] },
  { from: [25.2, 55.27], to: [24.71, 46.68] },
  { from: [25.2, 55.27], to: [19.08, 72.88] },
  { from: [19.08, 72.88], to: [1.35, 103.82] },
  { from: [51.51, -0.13], to: [43.65, -79.38] },
  { from: [-1.29, 36.82], to: [25.2, 55.27] },
  { from: [-26.2, 28.04], to: [6.45, 3.39] },
  { from: [-23.55, -46.63], to: [40.71, -74.01] },
  { from: [1.35, 103.82], to: [40.71, -74.01] },
  { from: [24.71, 46.68], to: [51.51, -0.13] },
];

function getActiveRoutes(now: number, hovered: boolean) {
  const stepMs = hovered ? 760 : 1180;
  const phase = Math.floor(now / stepMs) % ROUTES.length;

  return Array.from({ length: 7 }, (_, index) => ROUTES[(phase + index * 2) % ROUTES.length]);
}

function interpolateLocation(from: GlobeLocation, to: GlobeLocation, progress: number): GlobeLocation {
  let lonDelta = to[1] - from[1];
  if (lonDelta > 180) lonDelta -= 360;
  if (lonDelta < -180) lonDelta += 360;

  const lon = from[1] + lonDelta * progress;
  return [from[0] + (to[0] - from[0]) * progress, ((((lon + 180) % 360) + 360) % 360) - 180];
}

function getAnimatedMarkers(now: number, routes: GlobeArc[], pulse: number) {
  const baseMarkers = HUBS.map((marker, index) => ({
    ...marker,
    size: marker.size * (0.9 + ((Math.sin(now / 620 + index) + 1) / 2) * 0.22),
  }));

  const packets = routes.slice(0, 6).map((route, index) => {
    const progress = (now / (hoveredRouteDuration(index)) + index * 0.17) % 1;
    return {
      location: interpolateLocation(route.from, route.to, progress),
      size: 0.022 + pulse * 0.015,
    };
  });

  return [...baseMarkers, ...packets];
}

function hoveredRouteDuration(index: number) {
  return 1700 + index * 180;
}

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
      diffuse: 1.45,
      mapSamples: 16000,
      mapBrightness: 6.2,
      mapBaseBrightness: 0.08,
      baseColor: GLOBE_BLUE,
      markerColor: BLUE_DOT,
      glowColor: BLUE_DOT,
      markers: HUBS,
      arcs: getActiveRoutes(0, false),
      arcColor: BLUE_DOT,
      arcWidth: 0.55,
      arcHeight: 0.32,
      scale: 1.04,
    });

    const ro = new ResizeObserver(resize);
    ro.observe(hostElement);

    function animate() {
      if (!globe) return;

      const now = performance.now();
      const pulse = (Math.sin(now / 720) + 1) / 2;
      if (!reducedMotion) {
        phi += hoveredRef.current ? 0.009 : 0.0045;
      }

      const activeRoutes = getActiveRoutes(now, hoveredRef.current);

      globe.update({
        phi,
        width: width * 2,
        height: width * 2,
        arcs: activeRoutes,
        markers: getAnimatedMarkers(now, activeRoutes, pulse),
        arcHeight: 0.26 + pulse * 0.14,
        arcWidth: hoveredRef.current ? 0.72 : 0.5 + pulse * 0.16,
        mapBrightness: 5.4 + pulse * 2.2,
        markerColor: BLUE_DOT,
        glowColor: BLUE_DOT,
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
      className="absolute left-1/2 top-1/2 aspect-square w-[88%] -translate-x-1/2 -translate-y-1/2"
      ref={hostRef}
    >
      <canvas className="block size-full opacity-100" ref={canvasRef} />
    </div>
  );
}
