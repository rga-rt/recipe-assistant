<template>
  <div v-if="offline" class="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
    {{ t('errors.offline') }}
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
