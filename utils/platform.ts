// Small client-only platform probes used by the install prompt.
// iOS browsers (Safari *and* Chrome/`CriOS`, all WebKit) never fire
// `beforeinstallprompt`, so they need a manual Add-to-Home-Screen hint.

/** True on iPhone/iPad/iPod, including iPadOS which masquerades as desktop Safari. */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const iOsUa = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports a Mac UA but exposes touch points.
  const iPadOs = navigator.platform === 'MacIntel' && (navigator.maxTouchPoints ?? 0) > 1;
  return iOsUa || iPadOs;
}

/** True when the app is already running as an installed / home-screen PWA. */
export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  const displayMode = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  // iOS Safari exposes the legacy `navigator.standalone` flag instead.
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return displayMode || iosStandalone;
}
