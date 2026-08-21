<template>
  <Transition name="install">
    <div
      v-if="visible"
      data-test="install-prompt"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-saffron/40 bg-saffron-soft px-4 py-3"
      role="region"
      :aria-label="t('install.title')"
    >
      <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-between">
        <p class="font-mono text-xs font-semibold uppercase tracking-wider text-kale">
          <span aria-hidden="true">📥</span> {{ t('install.title') }}
        </p>

        <!-- iOS: no install API — show the manual Add-to-Home-Screen hint. -->
        <p v-if="iosHint" data-test="ios-hint" class="text-xs text-kale/80">
          {{ t('install.iosHint') }}
        </p>

        <!-- Everywhere else: the native install prompt is available. -->
        <div v-else class="flex items-center gap-2">
          <button
            type="button"
            data-test="install-action"
            class="rounded-md bg-kale px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-ceramic transition hover:opacity-90"
            @click="install"
          >
            {{ t('install.install') }}
          </button>
          <button
            type="button"
            data-test="dismiss-action"
            class="rounded-md px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-kale/70 transition hover:text-kale"
            @click="dismiss"
          >
            {{ t('install.notNow') }}
          </button>
        </div>

        <!-- iOS still gets a way to dismiss the hint. -->
        <button
          v-if="iosHint"
          type="button"
          data-test="dismiss-action"
          class="font-mono text-xs font-semibold uppercase tracking-wider text-kale/70 transition hover:text-kale"
          :aria-label="t('install.notNow')"
          @click="dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { isIosDevice, isStandaloneDisplay } from '~/utils/platform';
import { getPwa } from '~/utils/pwa';

const DISMISS_KEY = 'install-prompt-dismissed';

const { t } = useI18n();

const mounted = ref(false);
const dismissed = ref(false);

// The native prompt only exists once `beforeinstallprompt` has fired
// (Chromium/Android). `$pwa` is reactive, so reading it in the computed tracks it.
const nativePrompt = computed(() => mounted.value && Boolean(getPwa()?.showInstallPrompt));
const iosHint = computed(
  () => mounted.value && !nativePrompt.value && isIosDevice() && !isStandaloneDisplay(),
);
const visible = computed(() => !dismissed.value && (nativePrompt.value || iosHint.value));

onMounted(() => {
  dismissed.value = Boolean(localStorage.getItem(DISMISS_KEY));
  mounted.value = true;
});

function install() {
  void getPwa()?.install?.();
}

function dismiss() {
  dismissed.value = true;
  localStorage.setItem(DISMISS_KEY, '1');
  getPwa()?.cancelInstall?.();
}
</script>

<style scoped>
.install-enter-active,
.install-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}
.install-enter-from,
.install-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
