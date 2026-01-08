import React, { useEffect, useLayoutEffect, useState } from "react";

export type FlipAxis = "horizontal" | "vertical";

interface FlipperProps {
  showBack: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  axis?: FlipAxis;
  durationMs?: number;
}

const DEFAULT_DURATION = 600;

export default function Flipper({
  showBack,
  front,
  back,
  axis = "horizontal",
  durationMs = DEFAULT_DURATION,
}: FlipperProps) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [isFlipping, setIsFlipping] = useState(false);
  const frontRef = React.useRef<HTMLDivElement>(null);
  const backRef = React.useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setIsFlipping(true);
    const t = setTimeout(() => setIsFlipping(false), durationMs);
    return () => clearTimeout(t);
  }, [showBack, durationMs]);

  useEffect(() => {
    const target = showBack ? backRef.current : frontRef.current;
    if (!target) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    ro.observe(target);
    return () => ro.disconnect();
  }, [showBack]);

  // Ensure focus never remains on the hidden side
  useEffect(() => {
    const frontEl = frontRef.current;
    const backEl = backRef.current;
    if (!frontEl || !backEl) return;

    const hiddenEl = showBack ? frontEl : backEl;
    const visibleEl = showBack ? backEl : frontEl;

    const active = document.activeElement as HTMLElement | null;
    if (active && hiddenEl.contains(active)) {
      // Try to move focus to first focusable in visible panel, fallback to panel itself
      const focusable = visibleEl.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? visibleEl).focus();
    }
  }, [showBack]);

  const rotateFront = axis === "horizontal" ? "rotateY(0deg)" : "rotateX(0deg)";
  const rotateBack = axis === "horizontal" ? "rotateY(180deg)" : "rotateX(180deg)";
  const rotateContainer = showBack
    ? axis === "horizontal" ? "rotateY(180deg)" : "rotateX(180deg)"
    : axis === "horizontal" ? "rotateY(0deg)" : "rotateX(0deg)";

  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <div
        className="relative ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: rotateContainer,
          height: height ? `${height}px` : "auto",
          transition: `transform ${durationMs}ms ease-in-out, height ${
            isFlipping ? durationMs : 0
          }ms ease-in-out`,
        }}
      >
        {/* Front */}
        <div
          ref={frontRef}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: rotateFront,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            pointerEvents: showBack ? "none" : "auto",
          }}
          aria-hidden={showBack}
          inert={showBack ? "" : undefined}
          tabIndex={-1}
        >
          {front}
        </div>

        {/* Back */}
        <div
          ref={backRef}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: rotateBack,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            MozBackfaceVisibility: "hidden",
            pointerEvents: showBack ? "auto" : "none",
          }}
          aria-hidden={!showBack}
          inert={!showBack ? "" : undefined}
          tabIndex={-1}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
