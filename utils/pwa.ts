// Thin accessor for the reactive `$pwa` helper that @vite-pwa/nuxt injects
// onto the Nuxt app (enabled via `pwa.client.installPrompt` in nuxt.config).
// Wrapping it in a function gives tests a single, mockable seam — `$pwa`
// itself is a read-only getter and cannot be reassigned.

export interface PwaInjection {
  showInstallPrompt?: boolean;
  install?: () => void | Promise<void>;
  cancelInstall?: () => void;
}

export function getPwa(): PwaInjection | undefined {
  return (useNuxtApp() as unknown as { $pwa?: PwaInjection }).$pwa;
}
