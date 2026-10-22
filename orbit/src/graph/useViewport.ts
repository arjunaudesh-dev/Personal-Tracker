import { useCallback, useEffect, useRef, useState } from 'react';
import type { Rect } from '../types';
import { clamp } from '../lib/utils';

export interface Transform {
  x: number;
  y: number;
  k: number;
}

const MIN_K = 0.1;
const MAX_K = 2.6;

export const useViewport = (bounds: Rect, width: number, height: number) => {
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 0.8 });
  const [animating, setAnimating] = useState(false);
  const animTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interacted = useRef(false);
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  const animateTo = useCallback((t: Transform) => {
    setAnimating(true);
    setTransform(t);
    if (animTimer.current) clearTimeout(animTimer.current);
    animTimer.current = setTimeout(() => setAnimating(false), 420);
  }, []);

  const fit = useCallback(
    (padding = 72, maxK = 1.05) => {
      if (!width || !height) return;
      const b = boundsRef.current;
      const k = clamp(
        Math.min((width - padding * 2) / Math.max(b.w, 1), (height - padding * 2) / Math.max(b.h, 1)),
        MIN_K,
        maxK,
      );
      animateTo({
        k,
        x: width / 2 - (b.x + b.w / 2) * k,
        y: height / 2 - (b.y + b.h / 2) * k,
      });
    },
    [animateTo, width, height],
  );

  const focusOn = useCallback(
    (rect: Rect, k = 1) => {
      if (!width || !height) return;
      animateTo({
        k,
        x: width / 2 - (rect.x + rect.w / 2) * k,
        y: height / 2 - (rect.y + rect.h / 2) * k,
      });
    },
    [animateTo, width, height],
  );


  const zoomBy = useCallback(
    (factor: number, origin?: { x: number; y: number }) => {
      setTransform((t) => {
        const k = clamp(t.k * factor, MIN_K, MAX_K);
        const ox = origin?.x ?? width / 2;
        const oy = origin?.y ?? height / 2;
        // keep the world point under the cursor fixed
        const wx = (ox - t.x) / t.k;
        const wy = (oy - t.y) / t.k;
        return { k, x: ox - wx * k, y: oy - wy * k };
      });
      interacted.current = true;
    },
    [width, height],
  );

  const resetZoom = useCallback(() => {
    fit(72, 1.02);
  }, [fit]);

  /** centre the viewport on a world coordinate, honouring the current zoom */
  const centerOn = useCallback(
    (wx: number, wy: number) => {
      setTransform((t) => ({ ...t, x: width / 2 - wx * t.k, y: height / 2 - wy * t.k }));
    },
    [width, height],
  );

  const panBy = useCallback((dx: number, dy: number) => {
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  return {
    transform,
    setTransform,
    animateTo,
    fit,
    focusOn,
    zoomBy,
    resetZoom,
    centerOn,
    panBy,
    animating,
    interacted,
  };
};

export const screenToWorld = (
  clientX: number,
  clientY: number,
  rect: DOMRect,
  t: Transform,
) => ({
  x: (clientX - rect.left - t.x) / t.k,
  y: (clientY - rect.top - t.y) / t.k,
});
