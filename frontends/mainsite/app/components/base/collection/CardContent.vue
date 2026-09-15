<template>
  <nuxt-link-locale :id="createElementId('link', 'content', 'collection-card', collectionName)" :to="`/shop/collection/${urlId || category}`" class="block">
    <nuxt-img :alt="collectionName" :src="image" format="webp" quality="80" class="aspect-square object-cover w-full xl:hover:scale-110 xl:hover:rotate-2 transition-all ease-in-out duration-200" />
    
    <!-- h2, not h1: the page's own h1 is the hero heading, and every card
    using h1 gave each page a fistful of them. Shows the collection's
    name rather than its category, so two collections sharing a category
    no longer render as two identically-labelled cards. -->
    <h2 class="text-white text-3xl absolute bottom-4 left-3 uppercase font-bold">
      {{ collectionName || category }}
    </h2>
  </nuxt-link-locale>
</template>

<script setup lang="ts">
import type { Undefineable } from '~/types'

defineProps<{ 
  collectionName: Undefineable<string>,
  category: Undefineable<string>,
  image: string,
  urlId?: string
}>()
</script>
