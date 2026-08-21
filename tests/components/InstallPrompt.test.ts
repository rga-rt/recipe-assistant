// @vitest-environment nuxt
/* eslint-disable @typescript-eslint/no-explicit-any -- test doubles for $pwa + platform */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive } from 'vue';
import { mountSuspended } from '@nuxt/test-utils/runtime';

// Control platform detection so tests don't depend on happy-dom's UA/matchMedia.
const platform = vi.hoisted(() => ({ ios: false, standalone: false }));
vi.mock('~/utils/platform', () => ({
  isIosDevice: () => platform.ios,
  isStandaloneDisplay: () => platform.standalone,
}));

// `$pwa` is a read-only getter on the Nuxt app, so we mock the `getPwa()` seam
// the component reads through instead of reassigning it.
const pwaState = vi.hoisted(() => ({ value: undefined as any }));
vi.mock('~/utils/pwa', () => ({
  getPwa: () => pwaState.value,
}));

import InstallPrompt from '~/components/InstallPrompt.vue';

const DISMISS_KEY = 'install-prompt-dismissed';

describe('InstallPrompt', () => {
  beforeEach(() => {
    platform.ios = false;
    platform.standalone = false;
    pwaState.value = undefined;
    localStorage.clear();
  });

  it('renders nothing by default (no native prompt, not iOS)', async () => {
    const wrapper = await mountSuspended(InstallPrompt);
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(false);
  });

  it('shows the banner with an Install button when the native prompt is available', async () => {
    pwaState.value = reactive({ showInstallPrompt: true, install: vi.fn(), cancelInstall: vi.fn() });
    const wrapper = await mountSuspended(InstallPrompt);
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="install-action"]').exists()).toBe(true);
    // No iOS hint when the native path is available.
    expect(wrapper.find('[data-test="ios-hint"]').exists()).toBe(false);
  });

  it('calls $pwa.install() when Install is clicked', async () => {
    const install = vi.fn();
    pwaState.value = reactive({ showInstallPrompt: true, install, cancelInstall: vi.fn() });
    const wrapper = await mountSuspended(InstallPrompt);
    await wrapper.find('[data-test="install-action"]').trigger('click');
    expect(install).toHaveBeenCalledOnce();
  });

  it('hides the banner and persists dismissal when Not now is clicked', async () => {
    const cancelInstall = vi.fn();
    pwaState.value = reactive({ showInstallPrompt: true, install: vi.fn(), cancelInstall });
    const wrapper = await mountSuspended(InstallPrompt);
    await wrapper.find('[data-test="dismiss-action"]').trigger('click');
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(false);
    expect(localStorage.getItem(DISMISS_KEY)).toBeTruthy();
    expect(cancelInstall).toHaveBeenCalledOnce();
  });

  it('stays hidden if already dismissed earlier', async () => {
    localStorage.setItem(DISMISS_KEY, '1');
    pwaState.value = reactive({ showInstallPrompt: true, install: vi.fn(), cancelInstall: vi.fn() });
    const wrapper = await mountSuspended(InstallPrompt);
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(false);
  });

  it('on iOS (not standalone) shows the Add-to-Home-Screen hint and no Install button', async () => {
    platform.ios = true;
    platform.standalone = false;
    const wrapper = await mountSuspended(InstallPrompt);
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="ios-hint"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="install-action"]').exists()).toBe(false);
  });

  it('renders nothing on iOS when already installed (standalone)', async () => {
    platform.ios = true;
    platform.standalone = true;
    const wrapper = await mountSuspended(InstallPrompt);
    expect(wrapper.find('[data-test="install-prompt"]').exists()).toBe(false);
  });
});
