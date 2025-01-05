<template>
  <q-page class="fit">
    <app-map />

    <div
      class="full-width absolute-bottom"
      style="z-index: 2000"
    >
      <div class="row justify-center">
        <div
          class="text-subtitle1 q-py-xs q-px-sm q-mb-xs text-white"
          style="
            background-color: rgba(0, 0, 0, 0.5);
            pointer-events: none;
            user-select: none;
            backdrop-filter: blur(1px);
          "
        >
          Furtive Sage Gaming - Pirate's Parley
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import AppMap from 'src/components/AppMap.vue';
</script>
