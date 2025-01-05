<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-transparent">
      <q-toolbar class="bg-blue-grey-7">
        <q-toolbar-title>Atlas Web Map</q-toolbar-title>

        <div class="gt-xs">
          <div
            v-if="authStore.state.signedIn"
            class="overflow-hidden ellipsis"
            style="max-width: 300px"
          >
            Welcome back
            <b>{{ authStore.state.username }}</b>
          </div>
          <div v-else>
            <q-btn
              color="primary"
              rounded
              icon-right="mdi-account-plus"
              label="Sign Up"
              @click="authStore.signUp()"
            />
            <q-btn
              flat
              rounded
              class="q-ml-sm"
              label="Sign In"
              icon-right="mdi-login"
              @click="authStore.signIn()"
            />
          </div>
        </div>

        <q-toggle
          v-model="authStore.state.dark"
          toggle-indeterminate
          indeterminate-value="auto"
          checked-icon="mdi-weather-night"
          unchecked-icon="mdi-weather-sunny"
          indeterminate-icon="mdi-lightbulb-auto-outline"
          color="black"
          keep-color
          size="lg"
        >
          <q-tooltip>
            <span v-if="authStore.state.dark === false">
              In <i>Light Mode</i>, toggle to <i>Match Device Mode</i>
            </span>
            <span v-else-if="authStore.state.dark === 'auto'">
              In <i>Match Device Mode</i>, toggle to <i>Dark Mode</i>
            </span>
            <span v-else> In <i>Dark Mode</i>, toggle to <i>Light Mode</i> </span>
          </q-tooltip>
        </q-toggle>

        <q-btn
          flat
          round
          icon="mdi-menu"
          @click="showMenu = !showMenu"
        >
          <q-tooltip> Toggle the Menu </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <main-menu v-model="showMenu" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss"></style>

<script setup lang="ts">
import { useAuthStore } from 'src/stores/authStore';
import MainMenu from 'src/components/MainMenu.vue';
import { ref } from 'vue';
const authStore = useAuthStore();

const showMenu = ref(false);
</script>
