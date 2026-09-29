"use client";
// Whether a wide table is scrolled off its left or right edge, for the fades at its sides
import { useCallback, useEffect, useRef, useState } from "react";

type ScrollState = { fromLeft: boolean; fromRight: boolean };

export function useTableScrollState() {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ScrollState>({ fromLeft: false, fromRight: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // 1px slack for sub-pixel widths
    const next = { fromLeft: el.scrollLeft > 0, fromRight: max - el.scrollLeft > 1 };
    setState((now) => (now.fromLeft === next.fromLeft && now.fromRight === next.fromRight ? now : next));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [update]);

  return { ref, onScroll: update, ...state };
}
