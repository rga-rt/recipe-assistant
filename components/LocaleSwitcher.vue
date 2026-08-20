<template>
  <div class="inline-flex rounded-lg border border-stone-300 bg-chalk p-0.5 text-sm">
    <NuxtLink
      v-for="loc in availableLocales"
      :key="loc.code"
      :to="switchLocalePath(loc.code as 'en' | 'es')"
      class="rounded-md px-2.5 py-1 font-medium transition"
      :class="
        loc.code === locale
          ? 'bg-kale text-chalk'
          : 'text-stone-600 hover:bg-stone-100'
      "
    >
      {{ loc.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { locale, locales } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const availableLocales = computed(
  () => locales.value as Array<{ code: string; name: string }>,
);
</script>
