"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

const FADE = 140; // px of the right-edge fade while more cards are hidden

// Alpha ramps from 0 at the viewport edge to 1 FADE px further left: cards fade in as they slide in.
const fadeStyle: CSSProperties = {
  WebkitMaskImage: "linear-gradient(to right, #000 calc(100% - var(--fade, 140px)), transparent)",
  maskImage: "linear-gradient(to right, #000 calc(100% - var(--fade, 140px)), transparent)",
};

/**
 * Horizontal slider, same section layout as the grids (SectionHeader above, cards at
 * the same column width). Slides with the trackpad / touch, and by click-and-drag with a
 * mouse. The track bleeds to the right edge of the viewport and fades out there, so cards
 * reach full opacity as they slide in. The fade shrinks to nothing when the last card arrives.
 */
export function VideoSlider({ regionLabel, children }: { regionLabel: string; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });

  const syncFade = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const remaining = el.scrollWidth - el.clientWidth - el.scrollLeft;
    el.style.setProperty("--fade", `${Math.max(0, Math.min(FADE, remaining))}px`);
  }, []);

  useEffect(() => {
    syncFade();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(syncFade);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncFade]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = track.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startLeft: el.scrollLeft };

    const move = (ev: PointerEvent) => {
      const d = drag.current;
      const dx = ev.clientX - d.startX;
      if (!d.moved && Math.abs(dx) > 5) {
        d.moved = true;
        el.style.scrollSnapType = "none";
        el.style.cursor = "grabbing";
        el.style.userSelect = "none";
      }
      if (d.moved) el.scrollLeft = d.startLeft - dx;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.style.cursor = "";
      el.style.userSelect = "";
      el.style.scrollSnapType = ""; // re-enable snapping: settles on the nearest card
      drag.current.active = false;
      // `moved` stays true until the click event that follows, so links ignore the drag.
      setTimeout(() => (drag.current.moved = false), 0);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  return (
    <div
      ref={track}
      role="region"
      aria-label={regionLabel}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onScroll={syncFade}
      style={fadeStyle}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (drag.current.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="-mr-[calc(50vw-50%)] flex cursor-grab items-stretch gap-4 overflow-x-auto overscroll-x-contain pr-[calc(50vw-50%)] snap-x snap-proximity sm:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-offset-4"
    >
      {children}
    </div>
  );
}

/** Slide: same width as one column of the 3-column grids (78% on mobile), snaps to the left edge. */
export function VideoSlide({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-[78%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)]">
      {children}
    </div>
  );
}
