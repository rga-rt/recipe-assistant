<template>
  <div class="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm">
    <button
      v-for="opt in options"
      :key="opt"
      :data-test="`unit-${opt}`"
      class="rounded-md px-2.5 py-1 font-medium transition"
      :class="unitSystem === opt ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'"
      @click="setSystem(opt)"
    >
      {{ t(`units.${opt}`) }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { unitSystem, setSystem } = useUnitSystem();
const options: Array<'metric' | 'imperial'> = ['metric', 'imperial'];
</script>
