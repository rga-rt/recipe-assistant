<template>
  <div class="container relative mx-auto flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 -z-10 select-none">
      <span class="chip absolute left-[6%] top-[18%] rotate-[-6deg] border-stone-300 bg-chalk text-kale opacity-30 sm:left-[10%]">Tomato</span>
      <span class="chip absolute right-[8%] top-[12%] rotate-[4deg] border-stone-300 bg-chalk text-kale opacity-25 sm:right-[12%]">Garlic</span>
      <span class="chip absolute bottom-[22%] left-[10%] rotate-[3deg] border-stone-300 bg-chalk text-kale opacity-20 sm:left-[16%]">Basil</span>
      <span class="chip absolute bottom-[16%] right-[10%] rotate-[-3deg] border-stone-300 bg-chalk text-kale opacity-30 sm:right-[18%]">Lemon</span>
      <span class="chip absolute right-[26%] top-[30%] hidden rotate-[5deg] border-stone-300 bg-chalk text-kale opacity-20 sm:inline-flex">Onion</span>
    </div>

    <h1 class="max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-kale sm:text-6xl lg:text-7xl">
      {{ t('start.title') }}
    </h1>
    <p class="mt-5 max-w-md text-lg text-stone-600">{{ t('start.subtitle') }}</p>
    <button
      data-test="start-cta"
      class="group mt-10 inline-flex items-center gap-2 rounded-full bg-basil px-8 py-4 text-lg font-semibold text-chalk shadow-card transition hover:bg-basil-600 hover:shadow-lift"
      @click="$emit('start')"
    >
      {{ t('start.cta') }}
      <span aria-hidden="true" class="transition-transform group-hover:translate-x-1">→</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
defineEmits<{ start: [] }>();
</script>
