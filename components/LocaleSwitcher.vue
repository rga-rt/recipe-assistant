<template>
  <div class="inline-flex rounded-lg border border-stone-300 bg-chalk p-0.5 text-sm">
    <NuxtLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :to="switchLocalePath(loc.code as 'en' | 'es')"
      class="rounded-md px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wide transition"
      :class="
        loc.code === activeCode
          ? 'bg-kale text-chalk'
          : 'text-stone-600 hover:bg-stone-100'
      "
    >
      {{ loc.code.toUpperCase() }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();
const route = useRoute();

const availableLocales = computed(
  () => locales.value as Array<{ code: string; name: string }>,
);
// Derive the active locale from the URL prefix so the toggle flips
// immediately on click, not after the page transition settles.
const activeCode = computed(() =>
  route.path.split('/')[1] === 'es' ? 'es' : 'en',
);
</script>
