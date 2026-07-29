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
  className?: string;
  style?: CSSProperties;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Marquee({
  children,
  width = '100%',
  height = 'auto',
  speed = 30,
  direction = 'left',
  gap = 0,
  pauseOnHover = true,
  className = '',
  style,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const startAnimation = useCallback(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    animRef.current?.cancel();

    const halfWidth = track.scrollWidth / 2;
    const duration = (halfWidth / speed) * 1000;

    const from = direction === 'right' ? -halfWidth : 0;
    const to = direction === 'right' ? 0 : -halfWidth;

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
  }, [speed, direction]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(() => {
      animRef.current?.cancel();
      startAnimation();
    });

    observer.observe(track);
    startAnimation();

    return () => {
      observer.disconnect();
      animRef.current?.cancel();
    };
  }, [startAnimation]);

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

  return (
    <div
      ref={containerRef}
      className={`rim-container ${className}`}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={trackRef}
        className="rim-track"
        style={{ gap: `${gap}px` }}
      >
        <div className="rim-content">{children}</div>
        <div className="rim-content" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
