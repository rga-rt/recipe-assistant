<template>
  <header class="sticky top-0 z-20 border-b border-stone-200 bg-chalk/90 backdrop-blur">
    <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
      <div class="flex items-center gap-6">
        <span class="font-display text-lg font-extrabold tracking-tight text-kale">mise.</span>
        <nav class="flex items-center gap-4 text-sm font-medium">
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
      <div class="flex items-center gap-3">
        <UnitToggle />
        <LocaleSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
