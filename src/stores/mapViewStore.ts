import { defineStore } from 'pinia';
import { reactive, watch } from 'vue';
import type { LatLng } from 'leaflet';

const STORE_NAME = 'mapView';

interface MapView {
  lastMap: string | undefined;
  lastCenter: LatLng | undefined;
  lastZoom: number | undefined;
}

export const useMapViewStore = defineStore(STORE_NAME, () => {
  const state = reactive<MapView>({
    lastMap: undefined,
    lastCenter: undefined,
    lastZoom: undefined,
  });

  const lsStateString = localStorage.getItem(STORE_NAME);

  if (typeof lsStateString === 'string') {
    const lsState = JSON.parse(lsStateString);
    Object.assign(state, lsState);
  }

  watch(state, (newState) => {
    localStorage.setItem(STORE_NAME, JSON.stringify(newState));
  });

  return {
    state,
  };
});
