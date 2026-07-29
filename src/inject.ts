const INJECTED = '__ERM_INJECTED__';

export function injectStyles(css: string) {
  if (typeof document === 'undefined') return;
  if ((window as Record<string, unknown>)[INJECTED]) return;
  (window as Record<string, unknown>)[INJECTED] = true;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
