import { useRef, useEffect, useCallback, type ReactNode, type CSSProperties } from 'react';
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

function getCurrentX(track: HTMLElement): number {
  const transform = getComputedStyle(track).transform;
  if (!transform || transform === 'none') return 0;
  const match = transform.match(/matrix.*\((.+)\)/);
  if (!match) return 0;
  const values = match[1].split(', ');
  return parseFloat(values[4]) || 0;
}

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
  const animRef = useRef<Animation | null>(null);
  const currentDirRef = useRef<'left' | 'right'>(direction);
  const halfWidthRef = useRef(0);
  const lastRestartRef = useRef(0);

  const startAnimation = useCallback((dir: 'left' | 'right', fromX?: number) => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    animRef.current?.cancel();

    const halfWidth = track.scrollWidth / 2;
    halfWidthRef.current = halfWidth;
    const duration = (halfWidth / speed) * 1000;

    let from: number;
    let to: number;

    if (fromX !== undefined) {
      from = fromX;
      to = dir === 'right' ? from + halfWidth : from - halfWidth;
    } else {
      from = dir === 'right' ? -halfWidth : 0;
      to = dir === 'right' ? 0 : -halfWidth;
    }

    animRef.current = track.animate(
      [
        { transform: `translateX(${from}px)` },
        { transform: `translateX(${to}px)` },
      ],
      {
        duration,
        iterations: Infinity,
        easing: 'linear',
      }
    );
  }, [speed]);

  useEffect(() => {
    currentDirRef.current = direction;
    startAnimation(direction);
  }, [direction, startAnimation]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(() => {
      animRef.current?.cancel();
      startAnimation(currentDirRef.current);
    });

    observer.observe(track);
    startAnimation(currentDirRef.current);

    return () => {
      observer.disconnect();
      animRef.current?.cancel();
    };
  }, [startAnimation]);

  useEffect(() => {
    if (!scrollDirection) return;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastRestartRef.current < 150) return;

      const newDir: 'left' | 'right' = e.deltaY > 0 ? 'right' : 'left';
      if (newDir !== currentDirRef.current) {
        currentDirRef.current = newDir;
        lastRestartRef.current = now;
        const track = trackRef.current;
        if (track) {
          const currentX = getCurrentX(track);
          startAnimation(newDir, currentX);
        } else {
          startAnimation(newDir);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollDirection, startAnimation]);

  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover && animRef.current) {
      animRef.current.pause();
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover && animRef.current) {
      animRef.current.play();
    }
  }, [pauseOnHover]);

  const containerStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  const maskGradient = (side: 'left' | 'right') => {
    const dir = side === 'left' ? 'to right' : 'to left';
    return `linear-gradient(${dir}, ${maskColor} 0%, transparent 100%)`;
  };

  return (
    <div
      ref={containerRef}
      className={`rim-container ${className}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
      <div
        ref={trackRef}
        className="rim-track"
      >
        <div className="rim-content" style={{ gap: `${gap}px`, paddingLeft: `${gap / 2}px`, paddingRight: `${gap / 2}px` }}>{children}</div>
        <div className="rim-content" style={{ gap: `${gap}px`, paddingLeft: `${gap / 2}px`, paddingRight: `${gap / 2}px` }} aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
