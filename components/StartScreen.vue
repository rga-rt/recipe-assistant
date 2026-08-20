<template>
  <div class="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl">{{ t('start.title') }}</h1>
    <p class="mt-3 max-w-md text-lg text-gray-600">{{ t('start.subtitle') }}</p>
    <button
      data-test="start-cta"
      class="mt-8 rounded-xl bg-gray-900 px-8 py-3 text-lg font-semibold text-white hover:bg-gray-700"
      @click="$emit('start')"
    >
      {{ t('start.cta') }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
defineEmits<{ start: [] }>();
</script>
