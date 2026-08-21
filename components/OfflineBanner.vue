<template>
  <div v-if="offline" class="border-b border-saffron/40 bg-saffron-soft px-4 py-2 text-center">
    <span class="font-mono text-xs font-semibold uppercase tracking-wider text-kale">{{ t('errors.offline') }}</span>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const offline = ref(false);
onMounted(() => {
  const update = () => { offline.value = !navigator.onLine; };
  update();
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  onBeforeUnmount(() => {
    window.removeEventListener('online', update);
    window.removeEventListener('offline', update);
  });
});
</script>
