<template>
  <div class="container relative mx-auto flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 select-none">
      <span class="chip absolute left-[6%] top-[16%] rotate-[-6deg] border-saffron bg-saffron-soft text-kale shadow-sm sm:left-[11%]">✓ Tomato</span>
      <span class="chip absolute right-[7%] top-[11%] rotate-[4deg] border-stone-300 bg-chalk text-stone-600 shadow-sm sm:right-[13%]">Garlic</span>
      <span class="chip absolute bottom-[20%] left-[9%] rotate-[3deg] border-saffron bg-saffron-soft text-kale shadow-sm sm:left-[17%]">✓ Basil</span>
      <span class="chip absolute bottom-[14%] right-[9%] rotate-[-3deg] border-stone-300 bg-chalk text-stone-600 shadow-sm sm:right-[19%]">Lemon</span>
      <span class="chip absolute right-[24%] top-[28%] hidden rotate-[5deg] border-stone-300 bg-chalk text-stone-600 shadow-sm sm:inline-flex">Onion</span>
      <span class="chip absolute bottom-[30%] left-[24%] hidden rotate-[-4deg] border-saffron bg-saffron-soft text-kale shadow-sm lg:inline-flex">✓ Chile</span>
    </div>

    <div class="relative z-10 flex flex-col items-center">
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
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
defineEmits<{ start: [] }>();
</script>
