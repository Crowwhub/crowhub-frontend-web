"use client";

import { useEffect, useRef, useState } from "react";
import CrowSvg from "./CrowSvg";

const BIRD_W = 52;
const BIRD_H = 45;

export default function CursorCrow() {
  const ref = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = matchMedia("(pointer: coarse)").matches;
    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (isTouch || reducedMotion) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let prevX = currentX;
    let facingRight = true;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      hoveringRef.current = !!target?.closest(
        'a, button, [role="button"], input, textarea, select, label'
      );
    };

    const animate = () => {
      const ease = 0.18;
      currentX += (mouseX - currentX) * ease;
      currentY += (mouseY - currentY) * ease;

      const vx = currentX - prevX;
      if (Math.abs(vx) > 0.6) facingRight = vx > 0;
      prevX = currentX;

      const scale = hoveringRef.current ? 1.18 : 1;
      const sx = (facingRight ? 1 : -1) * scale;

      if (ref.current) {
        ref.current.style.transform = `translate(${
          currentX - BIRD_W / 2
        }px, ${currentY - BIRD_H / 2}px) scale(${sx}, ${scale})`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.documentElement.style.cursor = "none";
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-[200]"
      style={{ willChange: "transform" }}
      aria-hidden="true"
    >
      <CrowSvg
        width={BIRD_W}
        height={BIRD_H}
        showPerch={false}
        accent="#6aab7a"
        bodyFill="#f5f5f0"
        wingFill="#bbbbbb"
        detailFill="#888888"
      />
    </div>
  );
}
