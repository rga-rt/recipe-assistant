<template>
  <header class="sticky top-0 z-20 border-b border-stone-200 bg-chalk/90 backdrop-blur">
    <div
      class="container mx-auto flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 sm:py-3"
    >
      <span
        class="font-display text-lg font-extrabold tracking-tight text-kale"
        >mise.</span
      >
      <nav class="flex items-center gap-4 text-sm font-medium sm:gap-6">
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
      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <UnitToggle />
        <LocaleSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
