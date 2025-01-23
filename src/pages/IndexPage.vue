<template>
  <q-page class="fit">
    <app-map />

    <q-dialog
      v-model="showDevDialog"
      backdrop-filter="blur(5px)"
    >
      <q-card>
        <q-card-section>
          This site is still in development. Currently this only functions as a satellite map of the
          game. The ability save markers will be arriving soon!
        </q-card-section>
        <q-card-section>
          Missing High Res Grid map images and tradewinds for the following: A1, D2, F3, F4, G4, G6,
          H4, H7, I1, I7, I8
        </q-card-section>
        <q-card-actions>
          <q-space />
          <q-btn
            label="Ok"
            color="primary"
            @click="showDevDialog = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import AppMap from 'src/components/AppMap.vue';
import { ref } from 'vue';

const showDevDialog = ref(true);
</script>
