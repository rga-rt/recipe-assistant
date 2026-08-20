<template>
  <div>
    <StartScreen v-if="step === 'start'" @start="goSelect" />
    <IngredientSelector v-else-if="step === 'select'" />
    <RecipeResults v-else />
  </div>
</template>

<script setup lang="ts">
const { step, goSelect } = useRecipeFinder();
</script>
