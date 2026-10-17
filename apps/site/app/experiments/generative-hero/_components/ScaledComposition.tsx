"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

export const bankingCanvasSize = { width: 1280, height: 700 } as const;

export function getCompositionScale(availableWidth: number) {
  return Math.min(availableWidth / bankingCanvasSize.width, 1);
}

export function ScaledComposition({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => setScale(getCompositionScale(frame.clientWidth));
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="scaled-composition"
      style={{ "--composition-scale": scale } as CSSProperties}
    >
      <div className="scaled-composition__canvas">{children}</div>
    </div>
  );
}
