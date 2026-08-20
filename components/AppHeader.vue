<template>
  <header
    class="sticky top-0 z-20 border-b border-stone-200 bg-chalk/90 backdrop-blur"
  >
    <div class="container mx-auto px-4">
      <div class="flex h-14 items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <span
            class="font-display text-lg font-extrabold tracking-tight text-kale"
            >mise.</span
          >
          <nav class="hidden items-center gap-6 text-sm font-medium sm:flex">
            <NuxtLinkLocale
              to="/"
              class="text-stone-600 transition hover:text-kale"
              active-class="text-basil hover:text-basil"
            >
              {{ t('nav.home') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/favorites"
              class="text-stone-600 transition hover:text-kale"
              active-class="text-basil hover:text-basil"
            >
              {{ t('nav.favorites') }}
            </NuxtLinkLocale>
          </nav>
        </div>

        <!-- Desktop controls -->
        <div class="hidden items-center gap-3 sm:flex">
          <UnitToggle />
          <LocaleSwitcher />
        </div>

        <!-- Mobile menu toggle -->
        <button
          type="button"
          class="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-kale transition hover:bg-stone-100 sm:hidden"
          :aria-label="t('nav.menu')"
          :aria-expanded="open"
          aria-controls="mobile-menu"
          @click="open = !open"
        >
          <svg
            v-if="!open"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg
            v-else
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Mobile collapsible menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="-translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="-translate-y-1 opacity-0"
      >
        <div v-if="open" id="mobile-menu" class="pb-4 sm:hidden">
          <nav
            class="flex flex-col border-t border-stone-200 pt-2 text-base font-medium"
          >
            <NuxtLinkLocale
              to="/"
              class="rounded-lg px-2 py-2.5 text-stone-700 transition hover:bg-stone-100"
              active-class="text-basil"
            >
              {{ t('nav.home') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              to="/favorites"
              class="rounded-lg px-2 py-2.5 text-stone-700 transition hover:bg-stone-100"
              active-class="text-basil"
            >
              {{ t('nav.favorites') }}
            </NuxtLinkLocale>
          </nav>
          <div
            class="mt-2 flex flex-col gap-3 border-t border-stone-200 px-2 pt-4"
          >
            <div class="flex items-center justify-between">
              <span
                class="font-mono text-xs uppercase tracking-wide text-stone-500"
                >{{ t('units.label') }}</span
              >
              <UnitToggle />
            </div>
            <div class="flex items-center justify-between">
              <span
                class="font-mono text-xs uppercase tracking-wide text-stone-500"
                >{{ t('nav.language') }}</span
              >
              <LocaleSwitcher />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const open = ref(false);

// Close the menu whenever the route changes (covers nav link taps).
watch(
  () => route.fullPath,
  () => {
    open.value = false;
  },
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false;
}
onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>
