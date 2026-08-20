<template>
  <div class="flex items-center gap-2">
    <span class="hidden font-mono text-[10px] uppercase tracking-wider text-stone-500 sm:inline">{{ t('units.label') }}</span>
    <div class="inline-flex rounded-lg border border-stone-300 bg-chalk p-0.5 text-sm">
      <button
        v-for="opt in options"
        :key="opt"
        :data-test="`unit-${opt}`"
        class="rounded-md px-2.5 py-1 font-medium transition"
        :class="unitSystem === opt ? 'bg-kale text-chalk' : 'text-stone-600 hover:bg-stone-100'"
        @click="setSystem(opt)"
      >
        {{ t(`units.${opt}`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { unitSystem, setSystem } = useUnitSystem();
const options: Array<'metric' | 'imperial'> = ['metric', 'imperial'];
</script>
