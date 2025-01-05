import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import type { LatLng } from 'leaflet';

const STORE_NAME = 'auth';

interface Auth {
  signedIn: boolean;
  username: string | undefined;
  email: string | undefined;
  dark: boolean | 'auto';
  lastCenter: LatLng | undefined;
  lastZoom: number | undefined;
}

export const useAuthStore = defineStore(STORE_NAME, () => {
  const $q = useQuasar();

  const state = reactive<Auth>({
    signedIn: false,
    username: undefined,
    email: undefined,
    dark: $q.dark.mode,
    lastCenter: undefined,
    lastZoom: undefined,
  });

  const lsStateString = localStorage.getItem(STORE_NAME);

  if (typeof lsStateString === 'string') {
    const lsState = JSON.parse(lsStateString);
    Object.assign(state, lsState);

    $q.dark.set(state.dark);
  }

  watch(state, (newState) => {
    $q.dark.set(newState.dark);
    localStorage.setItem(STORE_NAME, JSON.stringify(newState));
  });

  const signOut = () => {
    state.signedIn = false;
    state.username = undefined;
    state.email = undefined;
  };

  const signIn = () => {
    state.signedIn = true;
    state.username = 'WardenDrew';
    state.email = '1215drew@gmail.com';
    state.dark = true;
  };

  const signUp = () => {
    state.signedIn = true;
    state.username = 'New User Bob';
    state.email = 'bob@example.com';
  };

  return {
    state,
    signOut,
    signIn,
    signUp,
  };
});
