<template>
  <nuxt-container>
    <header class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">
        {{ pageName }}
      </h1>

      <slot name="pageActions" />
    </header>

    <slot />
  </nuxt-container>
</template>

<script setup lang="ts">
defineProps<{
  pageName: string
}>()
</script>
