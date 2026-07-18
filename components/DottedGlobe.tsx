"use client";

import createGlobe from "cobe";
import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

const BLUE_DOT = [0.294, 0.545, 1] as [number, number, number];
const GLOBE_BLUE = [0.063, 0.165, 0.337] as [number, number, number];

type GlobeLocation = [number, number];
type GlobeMarker = { id: string; location: GlobeLocation; size: number };

const LOCATIONS: GlobeMarker[] = [
  { id: "lagos", location: [6.45, 3.39], size: 0.07 },
  { id: "new-york", location: [40.71, -74.01], size: 0.052 },
  { id: "london", location: [51.51, -0.13], size: 0.05 },
  { id: "dubai", location: [25.2, 55.27], size: 0.058 },
  { id: "kenya", location: [-1.29, 36.82], size: 0.05 },
  { id: "australia", location: [-33.87, 151.21], size: 0.048 },
  { id: "japan", location: [35.68, 139.65], size: 0.046 },
];

function getPulsingMarkers(now: number, hovered: boolean) {
  const speed = hovered ? 420 : 680;

  return LOCATIONS.map((marker, index) => {
    const pulse = (Math.sin(now / speed + index * 1.18) + 1) / 2;
    return {
      ...marker,
      size: marker.size * (0.82 + pulse * (hovered ? 0.52 : 0.38)),
    };
  });
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
      markers: LOCATIONS,
      arcs: [],
      arcColor: BLUE_DOT,
      arcWidth: 0,
      arcHeight: 0,
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

      globe.update({
        phi,
        width: width * 2,
        height: width * 2,
        arcs: [],
        markers: getPulsingMarkers(now, hoveredRef.current),
        arcHeight: 0,
        arcWidth: 0,
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
      {LOCATIONS.map((marker, index) => (
        <span
          className="globe-location-ripple"
          key={marker.id}
          style={
            {
              "--globe-ripple-delay": `${index * 170}ms`,
              "--globe-ripple-visible": `var(--cobe-visible-${marker.id}, 0)`,
              left: "anchor(center)",
              positionAnchor: `--cobe-${marker.id}`,
              top: "anchor(center)",
            } as CSSProperties
          }
        >
          <span />
        </span>
      ))}
    </div>
  );
}
