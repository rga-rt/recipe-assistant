<template>
  <header class="border-b bg-white">
    <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
      <nav class="flex items-center gap-4 text-sm font-medium text-gray-700">
        <NuxtLinkLocale to="/">{{ t('nav.home') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/favorites">{{ t('nav.favorites') }}</NuxtLinkLocale>
      </nav>
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
