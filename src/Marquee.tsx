import { useRef, useState, useEffect, useCallback, useLayoutEffect, useMemo, type ReactNode, type CSSProperties } from 'react';
import './styles.css';

export interface MarqueeProps {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  speed?: number;
  direction?: 'left' | 'right';
  gap?: number;
  pauseOnHover?: boolean;
  scrollDirection?: boolean;
  mask?: boolean;
  maskColor?: string;
  maskIntensity?: number;
  maskWidth?: number;
  className?: string;
  style?: CSSProperties;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const CONTENT_STYLE = (gap: number): CSSProperties => ({
  gap: `${gap}px`,
  paddingLeft: `${gap / 2}px`,
  paddingRight: `${gap / 2}px`,
});

export default function Marquee({
  children,
  width = '100%',
  height = 'auto',
  speed = 30,
  direction = 'left',
  gap = 0,
  pauseOnHover = true,
  scrollDirection = false,
  mask = true,
  maskColor = 'white',
  maskIntensity = 1,
  maskWidth = 80,
  className = '',
  style,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const dirRef = useRef<'left' | 'right'>(direction);
  const unitRef = useRef(0);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const speedRef = useRef(speed);
  const mountedRef = useRef(false);
  const [copyCount, setCopyCount] = useState(3);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const measureAndSetCopies = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return false;

    const containerWidth = container.clientWidth;
    const oneSetWidth = measure.scrollWidth;
    if (containerWidth <= 0 || oneSetWidth <= 0) return false;

    const needed = Math.ceil(containerWidth / oneSetWidth) + 1;
    const newCount = Math.max(needed, 3);

    setCopyCount((prev) => {
      if (prev !== newCount) return newCount;
      return prev;
    });

    unitRef.current = oneSetWidth;
    return true;
  }, []);

  const applyTransform = useCallback((p: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${p}px, 0, 0)`;
  }, []);

  const wrapPosition = useCallback((p: number): number => {
    const unit = unitRef.current;
    if (unit <= 0) return p;
    const r = ((p % unit) + unit) % unit;
    return r - unit;
  }, []);

  const animate = useCallback((time: number) => {
    rafRef.current = requestAnimationFrame(animate);

    if (reducedMotionRef.current) return;

    if (!mountedRef.current) {
      const measured = measureAndSetCopies();
      if (!measured) return;
      mountedRef.current = true;
      if (dirRef.current === 'right') {
        posRef.current = -unitRef.current;
        applyTransform(posRef.current);
      }
      lastTimeRef.current = time;
      return;
    }

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      return;
    }

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = time;

    if (!pausedRef.current && unitRef.current > 0) {
      const dir = dirRef.current === 'right' ? 1 : -1;
      posRef.current += speedRef.current * dt * dir;
      applyTransform(wrapPosition(posRef.current));
    }
  }, [measureAndSetCopies, applyTransform, wrapPosition]);

  useLayoutEffect(() => {
    const measured = measureAndSetCopies();
    if (measured && dirRef.current === 'right') {
      posRef.current = -unitRef.current;
      applyTransform(posRef.current);
    }
  }, [measureAndSetCopies, applyTransform]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [animate]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let timeoutId: number | null = null;

    const observer = new ResizeObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const oldUnit = unitRef.current;
        const measured = measureAndSetCopies();
        if (measured && oldUnit > 0 && unitRef.current > 0 && Math.abs(oldUnit - unitRef.current) > 0.5) {
          const ratio = oldUnit > 0 ? ((-posRef.current % oldUnit) + oldUnit) % oldUnit / oldUnit : 0;
          posRef.current = -ratio * unitRef.current;
          applyTransform(posRef.current);
        }
      }, 100);
    });

    observer.observe(track);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [measureAndSetCopies, applyTransform]);

  useEffect(() => {
    dirRef.current = direction;
  }, [direction]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!scrollDirection) return;
    let lastRestart = 0;
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastRestart < 150) return;
      const newDir: 'left' | 'right' = e.deltaY > 0 ? 'right' : 'left';
      if (newDir !== dirRef.current) {
        dirRef.current = newDir;
        lastRestart = now;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollDirection]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) pausedRef.current = true;
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    pausedRef.current = false;
    lastTimeRef.current = 0;
  }, []);

  const containerStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  const maskGradient = (side: 'left' | 'right') => {
    const dir = side === 'left' ? 'to right' : 'to left';
    return `linear-gradient(${dir}, ${maskColor} 0%, transparent 100%)`;
  };

  const copies = useMemo(() => {
    const result: ReactNode[] = [];
    for (let i = 0; i < copyCount; i++) {
      result.push(
        <div
          key={i}
          className="rim-content"
          style={CONTENT_STYLE(gap)}
          aria-hidden={i > 0 ? 'true' : undefined}
        >
          {children}
        </div>
      );
    }
    return result;
  }, [copyCount, children, gap]);

  return (
    <div
      ref={containerRef}
      className={`rim-container ${className}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Hidden measurement copy — never displayed */}
      <div ref={measureRef} className="rim-content" style={{ ...CONTENT_STYLE(gap), position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 'max-content' }}>{children}</div>

      {mask && (
        <>
          <div
            className="rim-mask rim-mask--left"
            style={{
              width: `${maskWidth}px`,
              background: maskGradient('left'),
              opacity: maskIntensity,
            }}
          />
          <div
            className="rim-mask rim-mask--right"
            style={{
              width: `${maskWidth}px`,
              background: maskGradient('right'),
              opacity: maskIntensity,
            }}
          />
        </>
      )}
      <div ref={trackRef} className="rim-track">
        {copies}
      </div>
    </div>
  );
}
