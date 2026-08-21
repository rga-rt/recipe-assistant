<template>
  <div>
    <StartScreen v-if="step === 'start'" @start="goSelect" />
    <IngredientSelector v-else-if="step === 'select'" />
    <RecipeResults v-else />
  </div>
</template>

<script setup lang="ts">
const { step, goSelect } = useRecipeFinder();

// Home / Ingredients / Suggestions are steps within this page (not routes), so
// swapping them doesn't reset scroll on its own. Jump back to the top on change.
watch(step, () => {
  if (import.meta.client) window.scrollTo({ top: 0 });
});
</script>
