# entity-react-marquee

[![npm version](https://img.shields.io/npm/v/entity-react-marquee.svg)](https://www.npmjs.com/package/entity-react-marquee)
[![npm downloads](https://img.shields.io/npm/dm/entity-react-marquee.svg)](https://www.npmjs.com/package/entity-react-marquee)
[![license](https://img.shields.io/npm/l/entity-react-marquee.svg)](https://github.com/BazilSuhail/react-slider/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/entity-react-marquee)](https://bundlephobia.com/package/entity-react-marquee)
[![typescript](https://img.shields.io/badge/typescript-ready-blue.svg)](https://www.typescriptlang.org/)

Zero-dependency infinite scrolling marquee component for React, powered by the Web Animations API.

- **Infinite loop** — seamless CSS-free scrolling via WAAPI
- **Bidirectional** — scroll left or right
- **Scroll direction** — auto-reverses on wheel scroll with 150ms debounce
- **Edge mask** — gradient fade on both edges, configurable color/width/intensity
- **Pause on hover** — optional, default enabled
- **Resize-aware** — auto-restarts on content resize via `ResizeObserver`
- **Reduced motion** — respects `prefers-reduced-motion`
- Zero-config — styles auto-injected, no CSS import needed
- Accessible — duplicate content hidden with `aria-hidden`
- Tree-shakable

## Install

```bash
npm install entity-react-marquee
```

## Quick Start

```tsx
import { Marquee } from 'entity-react-marquee';

function App() {
  return (
    <Marquee>
      <span>Hello World</span>
      <span>Hello World</span>
      <span>Hello World</span>
    </Marquee>
  );
}
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to scroll. |
| `width` | `string \| number` | `'100%'` | Container width. Numbers are px. |
| `height` | `string \| number` | `'auto'` | Container height. Numbers are px. |
| `speed` | `number` | `30` | Scroll speed in px/second. |
| `direction` | `'left' \| 'right'` | `'left'` | Scroll direction. |
| `gap` | `number` | `0` | Gap in px between items. |
| `pauseOnHover` | `boolean` | `true` | Pause animation on hover. |
| `scrollDirection` | `boolean` | `false` | Reverse scroll direction on wheel scroll. |
| `mask` | `boolean` | `true` | Show gradient fade on left/right edges. |
| `maskColor` | `string` | `'white'` | Gradient start color. |
| `maskIntensity` | `number` | `1` | Mask opacity (0-1). |
| `maskWidth` | `number` | `80` | Mask width in px. |
| `className` | `string` | `''` | Additional CSS class on the container. |
| `style` | `CSSProperties` | — | Additional inline styles on the container. |

## Examples

### Basic Marquee

```tsx
<Marquee>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</Marquee>
```

### Custom Speed and Direction

```tsx
<Marquee speed={50} direction="right" gap={20}>
  <img src="/logo-1.png" alt="Logo" />
  <img src="/logo-2.png" alt="Logo" />
  <img src="/logo-3.png" alt="Logo" />
</Marquee>
```

### Fixed Size, No Pause

```tsx
<Marquee width={600} height={40} pauseOnHover={false}>
  <span>Breaking: News updates constantly scrolling across the screen</span>
</Marquee>
```

### With Gap

```tsx
<Marquee gap={16} speed={40}>
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</Marquee>
```

### With Custom Styles

```tsx
<Marquee
  className="my-marquee"
  style={{ background: '#f1f5f9', borderRadius: 8, padding: '12px 0' }}
  speed={40}
>
  <span>Custom styled marquee content</span>
</Marquee>
```

### Logo Carousel

```tsx
<Marquee speed={25} gap={40} pauseOnHover>
  <img src="/logo-1.svg" height={32} alt="Company 1" />
  <img src="/logo-2.svg" height={32} alt="Company 2" />
  <img src="/logo-3.svg" height={32} alt="Company 3" />
  <img src="/logo-4.svg" height={32} alt="Company 4" />
  <img src="/logo-5.svg" height={32} alt="Company 5" />
</Marquee>
```

### News Ticker

```tsx
<Marquee speed={35} direction="left" gap={60} style={{ background: '#1e293b', color: 'white', padding: '8px 0' }}>
  <span>BREAKING: Market up 2.5%</span>
  <span>Weather: Sunny skies expected</span>
  <span>Sports: Local team wins championship</span>
</Marquee>
```

### No Mask (Hard Edges)

```tsx
<Marquee mask={false}>
  <span>Content with no edge fade</span>
</Marquee>
```

### Custom Mask Color

```tsx
<Marquee maskColor="#1e293b" maskIntensity={0.8}>
  <span>Dark themed marquee</span>
</Marquee>
```

### Wide Mask, Low Intensity

```tsx
<Marquee maskWidth={120} maskIntensity={0.4}>
  <span>Subtle edge fade</span>
</Marquee>
```

### Scroll Direction (Wheel Reversal)

```tsx
<Marquee scrollDirection>
  <span>Scrolls with the page — reverses when you scroll up/down</span>
</Marquee>
```

## How It Works

1. Children are rendered **twice** — the second copy has `aria-hidden="true"`
2. WAAPI animates `translateX` on the track from `0` to `-halfWidth`
3. When it reaches the end, the loop seamlessly restarts (the duplicated content covers the gap)
4. `ResizeObserver` watches the track and restarts animation on size changes
5. When `scrollDirection` is enabled, wheel events reverse the animation direction with a 150ms debounce to prevent rapid restarts
6. Optional gradient masks fade content at the edges for a polished look

## CSS Classes

The component uses these CSS classes (auto-injected):

```css
.rim-container    /* overflow: hidden, position: relative */
.rim-mask         /* position: absolute, pointer-events: none */
.rim-mask--left   /* left: 0 */
.rim-mask--right  /* right: 0 */
.rim-track        /* display: flex, width: max-content, will-change: transform */
.rim-content      /* display: flex, align-items: center */
```

## Accessibility

- Duplicate content is hidden with `aria-hidden="true"`
- Respects `prefers-reduced-motion: reduce` — animation is not started
- No focus trapping — non-interactive by default

## TypeScript

All props are fully typed and exported:

```tsx
import type { MarqueeProps } from 'entity-react-marquee';
```

## Tree Shaking

The package uses the `exports` field with conditional ESM/CJS builds and `sideEffects: false`. Styles are auto-injected on first import.

```tsx
import { Marquee } from 'entity-react-marquee';
```

## License

MIT
